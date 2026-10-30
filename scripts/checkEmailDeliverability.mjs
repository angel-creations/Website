// Deliverability checker for angelcreations.in.
//
// Two jobs, both read-only:
//
//   1. dns     — audit the live DNS records that decide whether mail is
//                authenticated: exactly one SPF record, its lookup count and
//                terminal qualifier, the DKIM key at the selector actually used,
//                DMARC tags (including whether reporting is switched on), and
//                whether the MX records are still the untouched Hostinger pair.
//
//   2. headers — analyse a saved message (.eml or a pasted header block) and
//                answer one question: for THIS message, did SPF, DKIM and DMARC
//                pass, and were they aligned with the visible From domain?
//                This is the only evidence that counts. An HTTP 200 from
//                EmailJS, or a "delivered" badge in any dashboard, says nothing
//                about inbox placement.
//
//   node scripts/checkEmailDeliverability.mjs                 # DNS audit
//   node scripts/checkEmailDeliverability.mjs dns
//   node scripts/checkEmailDeliverability.mjs headers mail.eml
//   node scripts/checkEmailDeliverability.mjs all internal.eml confirmation.eml
//
// Options:
//   --domain   <name>   domain to audit (default angelcreations.in)
//   --expect-from <d>   tolerated From domain (default: the audited domain)
//   --strict            treat warnings as failures (use as a release gate)
//   --json              machine-readable output
//
// No credentials, no API calls, no email is sent. DNS only.
//
// Why the checks are shaped this way: this domain has exactly one legitimate
// sending estate (Hostinger, relayed through MailChannels). Any message that
// leaves through anything else is unauthenticated for the domain by definition,
// which is the single most common reason transactional mail from a small
// business domain is filed as spam. The header mode exists to prove which
// estate a message actually used.

import { readFileSync } from 'node:fs';
import dns from 'node:dns/promises';

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : (argv[i + 1] ?? fallback);
};
const has = (name) => argv.includes(name);

const MODE = ['dns', 'headers', 'all'].includes(argv[0]) ? argv[0] : 'dns';
const STRICT = has('--strict');
const JSON_OUT = has('--json');
const DOMAIN = (flag('--domain', 'angelcreations.in') || '').toLowerCase();
const EXPECT_FROM = (flag('--expect-from', DOMAIN) || '').toLowerCase();

const results = [];
function record(level, area, label, detail = '') {
  results.push({ level, area, label, detail });
  if (JSON_OUT) return;
  const mark = level === 'pass' ? '  ✓' : level === 'warn' ? '  !' : '  ✗';
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ''}`);
}
const pass = (area, label, detail) => record('pass', area, label, detail);
const warn = (area, label, detail) => record('warn', area, label, detail);
const fail = (area, label, detail) => record('fail', area, label, detail);
const info = (message) => { if (!JSON_OUT) console.log(message); };
const section = (title) => { if (!JSON_OUT) console.log(`\n${title}`); };

// ---------------------------------------------------------------- helpers

const MULTI_PART_TLDS = new Set([
  'co.in', 'net.in', 'org.in', 'gen.in', 'firm.in', 'ind.in', 'co.uk', 'org.uk',
  'me.uk', 'co.jp', 'co.nz', 'com.au', 'net.au', 'org.au', 'com.br', 'com.mx',
  'co.za', 'com.sg', 'com.my', 'co.id', 'com.tr', 'com.ar', 'com.co', 'co.il',
]);

/** Registrable domain: "mail.angelcreations.in" -> "angelcreations.in". */
export function orgDomain(host) {
  const clean = String(host || '').trim().toLowerCase().replace(/\.$/, '');
  if (!clean || clean.includes(' ') || !clean.includes('.')) return clean;
  const parts = clean.split('.');
  const lastTwo = parts.slice(-2).join('.');
  if (MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3) return parts.slice(-3).join('.');
  return lastTwo;
}

function parseHeaders(raw) {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const block = text.split('\n\n')[0] ?? '';
  const headers = [];
  for (const line of block.split('\n')) {
    if (/^[ \t]/.test(line) && headers.length) {
      headers[headers.length - 1].value += ` ${line.trim()}`;
    } else {
      const idx = line.indexOf(':');
      if (idx > 0) headers.push({ name: line.slice(0, idx).trim().toLowerCase(), value: line.slice(idx + 1).trim() });
    }
  }
  return headers;
}

const headerValues = (headers, name) => headers.filter((h) => h.name === name).map((h) => h.value);

function addressOf(value) {
  if (!value) return '';
  const angled = value.match(/<([^>]+)>/);
  return (angled ? angled[1] : value).trim().replace(/^mailto:/i, '');
}

function domainOf(value) {
  const address = addressOf(value);
  const at = address.lastIndexOf('@');
  return at === -1 ? '' : address.slice(at + 1).toLowerCase();
}

function parseTagList(value) {
  const tags = {};
  for (const part of String(value || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim().toLowerCase();
    const val = part.slice(idx + 1).trim();
    if (key && !(key in tags)) tags[key] = val;
  }
  return tags;
}

/** Split an Authentication-Results value into { spf, dkim, dmarc, ... } verdicts. */
function parseAuthResults(values) {
  const verdicts = { spf: null, dkim: [], dmarc: null };
  for (const value of values) {
    for (const method of ['spf', 'dmarc']) {
      const match = value.match(new RegExp(`\\b${method}=([a-z]+)`, 'i'));
      if (match && !verdicts[method]) verdicts[method] = match[1].toLowerCase();
    }
    for (const match of value.matchAll(/\bdkim=([a-z]+)/gi)) {
      const tail = value.slice(match.index);
      const sel = tail.match(/\bheader\.d=([^\s;]+)/i);
      const s = tail.match(/\bheader\.s=([^\s;]+)/i);
      verdicts.dkim.push({
        result: match[1].toLowerCase(),
        d: sel ? sel[1].toLowerCase().replace(/\.$/, '') : '',
        s: s ? s[1].replace(/\.$/, '') : '',
      });
    }
  }
  return verdicts;
}

function hasAlignment(dkimDomain, spfDomain, fromDomain, mode = 'relaxed') {
  if (!fromDomain || !(dkimDomain || spfDomain)) return false;
  const subject = mode === 'strict' ? String(spfDomain || dkimDomain) : orgDomain(spfDomain || dkimDomain);
  const target = mode === 'strict' ? fromDomain : orgDomain(fromDomain);
  return subject === target;
}

// ---------------------------------------------------------------- DNS audit

async function spfAudit(domain) {
  const txt = await dns.resolveTxt(domain).catch(() => []);
  const spf = txt.map((chunks) => chunks.join('')).filter((r) => /^v=spf1\b/i.test(r.trim()));
  if (spf.length === 0) { fail('spf', `SPF record is published on ${domain}`, 'none found'); return; }
  if (spf.length > 1) { fail('spf', 'exactly one SPF record', `${spf.length} found — receivers will treat the domain as having no usable SPF`); return; }
  pass('spf', 'exactly one SPF record', 'no duplicate-SPF condition');

  let lookups = 0;
  const seen = new Set();
  async function walk(zone, depth) {
    const records = (await dns.resolveTxt(zone).catch(() => [])).map((c) => c.join('')).filter((r) => /^v=spf1\b/i.test(r.trim()));
    for (const rec of records) {
      const includes = [...rec.matchAll(/include:([^\s]+)/gi)].map((m) => m[1]);
      const redirects = [...rec.matchAll(/redirect=([^\s]+)/gi)].map((m) => m[1]);
      const others = [...rec.matchAll(/(?:^|\s)(a|mx|ptr|exists)(?::|\s|$)/gi)];
      lookups += includes.length + redirects.length + others.length;
      if (depth > 8) continue;
      for (const target of [...includes, ...redirects]) {
        if (seen.has(target)) continue;
        seen.add(target);
        await walk(target, depth + 1);
      }
    }
  }
  await walk(domain, 0);

  if (lookups > 10) fail('spf', 'SPF lookup count is within the RFC 7208 limit of 10', `${lookups} DNS-querying mechanisms`);
  else pass('spf', 'SPF lookup count is within the RFC 7208 limit of 10', `${lookups} DNS-querying mechanisms`);

  const terminal = /([~+-])all\b/i.exec(spf[0]);
  const qualifier = terminal ? `${terminal[1]}all` : 'no all mechanism';
  if (!terminal) warn('spf', 'SPF ends with an all mechanism', 'no all mechanism — unauthorised senders are not declared');
  else if (terminal[1] === '~') warn('spf', 'SPF terminal qualifier', '~all (softfail): unauthorised senders are tolerated, not rejected — acceptable while warming up, strengthen to -all after clean DMARC reports');
  else if (terminal[1] === '-') pass('spf', 'SPF terminal qualifier', '-all (hardfail)');
  else warn('spf', 'SPF terminal qualifier', qualifier);
  info(`      ${spf[0]}`);
}

async function dmarcAudit(domain) {
  const txt = (await dns.resolveTxt(`_dmarc.${domain}`).catch(() => [])).map((c) => c.join(''));
  const record = txt.find((r) => /^v=DMARC1\b/i.test(r.trim()));
  if (!record) { fail('dmarc', `DMARC record is published at _dmarc.${domain}`, 'none found'); return; }
  const tags = parseTagList(record);
  pass('dmarc', 'DMARC record is published', `p=${tags.p ?? '(missing)'}`);

  if (!tags.p) fail('dmarc', 'DMARC declares a policy', 'no p= tag');
  else if (String(tags.p).toLowerCase() === 'none') warn('dmarc', 'DMARC policy', 'p=none: monitoring only, no enforcement (correct while diagnosing, not a permanent state)');
  else pass('dmarc', 'DMARC policy', `p=${tags.p}`);

  if (tags.rua) pass('dmarc', 'aggregate reporting is switched on', `rua=${tags.rua}`);
  else warn('dmarc', 'aggregate reporting is switched on', 'no rua= tag — no daily reports, so authentication failures are invisible');

  info(`      ${record}`);
  return tags;
}

async function dkimAudit(domain, selectors) {
  if (!selectors.length) { warn('dkim', 'DKIM selectors to check', 'none supplied — pass the s= value from a real message'); return; }
  for (const selector of selectors) {
    const name = `${selector}._domainkey.${domain}`;
    const [txt, cname] = await Promise.all([
      dns.resolveTxt(name).catch(() => []),
      dns.resolveCname(name).catch(() => []),
    ]);
    const local = txt.map((c) => c.join('')).filter((r) => /v=DKIM1/i.test(r));
    if (!local.length && !cname.length) { fail('dkim', `key exists for selector "${selector}"`, `${name} has neither a TXT nor a CNAME record`); continue; }
    if (local.length && cname.length) {
      warn('dkim', `selector "${selector}" resolves unambiguously`, 'both a CNAME and a TXT exist at the same name — a CNAME must be the only record; this can fail intermittently depending on resolver behaviour');
    } else {
      pass('dkim', `selector "${selector}" resolves unambiguously`, cname.length ? `CNAME → ${cname[0]}` : 'TXT');
    }
    let material = local[0] ?? '';
    if (!material && cname.length) {
      material = (await dns.resolveTxt(cname[0]).catch(() => [])).map((c) => c.join('')).find((r) => /v=DKIM1/i.test(r)) ?? '';
    }
    const key = material.match(/\bp=([A-Za-z0-9+/=]*)/);
    if (!key) { fail('dkim', `selector "${selector}" has a key`, 'no p= tag'); continue; }
    if (key[1] === '') { warn('dkim', `selector "${selector}" has a key`, 'p= is empty — the key is revoked, so this selector cannot verify anything'); continue; }
    const der = Buffer.from(key[1], 'base64');
    let i = 0;
    const readLen = () => { let l = der[i++]; if (l & 0x80) { const n = l & 0x7f; l = 0; for (let k = 0; k < n; k += 1) l = (l << 8) | der[i++]; } return l; };
    let bits = 0;
    try {
      // Walk into the containers rather than leaping over them: the modulus
      // lives inside the BIT STRING and the RSAPublicKey SEQUENCE. Only the
      // AlgorithmIdentifier is skipped whole. A length is read into a local
      // before `i` moves, because `i += readLen()` would add the length to the
      // pre-call offset and discard the bytes readLen itself advanced.
      if (der[i++] === 0x30) readLen();
      if (der[i] === 0x30) { i += 1; const algorithmLength = readLen(); i += algorithmLength; }
      if (der[i] === 0x03) { i += 1; readLen(); i += 1; }
      if (der[i] === 0x30) { i += 1; readLen(); }
      if (der[i] === 0x02) { i += 1; const modulusLength = readLen(); i += 1; bits = (modulusLength - 1) * 8; }
    } catch { bits = 0; }
    if (bits >= 1024) pass('dkim', `selector "${selector}" key strength`, `${bits}-bit RSA (Google requires ≥1024; 2048 recommended)`);
    else warn('dkim', `selector "${selector}" key strength`, bits ? `${bits}-bit RSA — below the 1024-bit floor` : 'could not determine key size');
  }
}

async function mxAudit(domain, expected) {
  const mx = await dns.resolveMx(domain).catch(() => []);
  const hosts = mx.sort((a, b) => a.priority - b.priority).map((r) => r.exchange.toLowerCase().replace(/\.$/, ''));
  if (!hosts.length) { fail('mx', 'MX records exist', 'none found — inbound mail would fail'); return; }
  const unexpected = hosts.filter((h) => !expected.some((e) => h === e || h.endsWith(`.${e}`)));
  if (unexpected.length) warn('mx', 'MX records match the expected receiving host', `unexpected: ${unexpected.join(', ')} — confirm this change was intentional`);
  else pass('mx', 'MX records match the expected receiving host', hosts.join(', '));
}

async function runDnsAudit(selectors) {
  section(`DNS audit — ${DOMAIN}`);
  const ns = await dns.resolveNs(DOMAIN).catch(() => []);
  if (ns.length) info(`  nameservers: ${ns.join(', ')}`);
  await spfAudit(DOMAIN).catch((error) => fail('spf', 'SPF audit completed', error.code ?? error.message));
  await dmarcAudit(DOMAIN).catch((error) => fail('dmarc', 'DMARC audit completed', error.code ?? error.message));
  await dkimAudit(DOMAIN, selectors).catch((error) => fail('dkim', 'DKIM audit completed', error.code ?? error.message));
  await mxAudit(DOMAIN, ['mx1.hostinger.com', 'mx2.hostinger.com']).catch((error) => fail('mx', 'MX audit completed', error.code ?? error.message));
}

// ------------------------------------------------------------- header audit

function auditMessage(label, raw) {
  const headers = parseHeaders(raw);
  section(`Message — ${label}`);

  const from = headerValues(headers, 'from')[0] ?? '';
  const fromDomain = domainOf(from);
  const replyTo = headerValues(headers, 'reply-to')[0] ?? '';
  const returnPath = headerValues(headers, 'return-path')[0] ?? '';
  const envelopeDomain = domainOf(returnPath);
  const received = headerValues(headers, 'received');
  const authResults = parseAuthResults(headerValues(headers, 'authentication-results'));
  const receivedSpf = headerValues(headers, 'received-spf')[0] ?? '';
  const spam = headers.filter((h) => /^x-(spam|microsoft|ms-exchange-organization)/i.test(h.name)).map((h) => `${h.name}: ${h.value.slice(0, 120)}`);
  const dkimSigs = headerValues(headers, 'dkim-signature').map(parseTagList);
  const selectors = dkimSigs.map((t) => t.s).filter(Boolean);

  info(`  From:        ${from || '(missing)'}`);
  info(`  Reply-To:    ${replyTo || '(none)'}`);
  info(`  Return-Path: ${returnPath || '(none)'}`);
  info(`  Message-ID:  ${headerValues(headers, 'message-id')[0] ?? '(none)'}`);
  info(`  DKIM:        ${dkimSigs.length ? dkimSigs.map((t) => `d=${t.d ?? '?'} s=${t.s ?? '?'}`).join(', ') : '(no DKIM-Signature header)'}`);

  if (!fromDomain) fail('identity', 'From header carries an address', 'no parsable From');
  else if (fromDomain === EXPECT_FROM || orgDomain(fromDomain) === orgDomain(EXPECT_FROM)) pass('identity', 'From domain matches the authenticated domain', fromDomain);
  else fail('identity', 'From domain matches the authenticated domain', `${fromDomain} — mail from this domain cannot be DKIM-aligned to ${EXPECT_FROM}`);

  if (!returnPath) warn('identity', 'Return-Path is present', 'not present — the message is probably a draft or a provider copy, not a delivered copy');
  else if (orgDomain(envelopeDomain) === orgDomain(EXPECT_FROM)) pass('identity', 'envelope sender is on the same domain', envelopeDomain);
  else warn('identity', 'envelope sender is on the same domain', `${envelopeDomain} — SPF is then evaluated against that domain; it must carry its own SPF record`);

  if (received.length) {
    const firstHop = received[received.length - 1].replace(/\s+/g, ' ').slice(0, 160);
    info(`  first hop:   ${firstHop}`);
    const infra = /hostinger|mailchannels|outlook|google|amazonses|sendgrid|brevo|mailgun|postmark|resend/i.exec(received.join(' '));
    if (infra) info(`  relay:       ${infra[0]}`);
  }

  if (!authResults.spf && !receivedSpf) warn('auth', 'SPF verdict reported by the receiving server', 'no Authentication-Results/Received-SPF — capture the copy from the recipient mailbox');
  else if (authResults.spf === 'pass' || /^pass\b/i.test(receivedSpf)) pass('auth', 'SPF verdict', 'pass');
  else fail('auth', 'SPF verdict', `${authResults.spf ?? receivedSpf.split(/\s/)[0]}`);

  if (!authResults.dkim.length && !dkimSigs.length) fail('auth', 'DKIM signature present', 'no DKIM-Signature header — the message was not signed by any domain');
  else if (authResults.dkim.some((d) => d.result === 'pass')) pass('auth', 'DKIM verdict', `pass (${authResults.dkim.map((d) => `${d.d === '' ? '?' : d.d}:${d.s}`).join(', ')})`);
  else if (authResults.dkim.length) fail('auth', 'DKIM verdict', authResults.dkim.map((d) => d.result).join(', '));
  else warn('auth', 'DKIM verdict reported by the receiving server', 'signature present but no Authentication-Results to confirm it verified');

  const spfAligned = authResults.spf === 'pass' && hasAlignment(envelopeDomain, envelopeDomain, fromDomain);
  const dkimAligned = authResults.dkim.some((d) => d.result === 'pass' && hasAlignment(d.d, d.d, fromDomain));
  if (spfAligned) pass('alignment', 'SPF is aligned with From (relaxed)', orgDomain(envelopeDomain));
  if (dkimAligned) pass('alignment', 'DKIM is aligned with From (relaxed)', dkimSigs.map((t) => t.d).filter(Boolean).join(', ') || authResults.dkim.map((d) => d.d).join(', '));
  if (!spfAligned && !dkimAligned) fail('alignment', 'at least one signal is aligned with From', 'neither SPF nor DKIM aligns — DMARC cannot pass');

  if (authResults.dmarc) {
    if (authResults.dmarc === 'pass') pass('dmarc', 'DMARC verdict at the receiver', 'pass');
    else fail('dmarc', 'DMARC verdict at the receiver', authResults.dmarc);
  } else if (spfAligned || dkimAligned) warn('dmarc', 'DMARC verdict at the receiver', 'no Authentication-Results — alignment is satisfied, but the receiver verdict must be confirmed in the mailbox copy');
  else fail('dmarc', 'DMARC verdict at the receiver', 'cannot pass: no aligned signal');

  if (spam.length) for (const line of spam.slice(0, 6)) info(`  filter:      ${line}`);

  return { fromDomain, envelopeDomain, selectors, dkimSigs, from };
}

// ---------------------------------------------------------------- main

function summarise() {
  const counts = results.reduce((acc, r) => ({ ...acc, [r.level]: (acc[r.level] ?? 0) + 1 }), {});
  const failed = counts.fail ?? 0;
  const warned = counts.warn ?? 0;
  const passed = counts.pass ?? 0;
  if (JSON_OUT) {
    console.log(JSON.stringify({ domain: DOMAIN, mode: MODE, passed, warned, failed, results }, null, 2));
  } else {
    console.log(`\n${passed} passed, ${warned} warnings, ${failed} failed.`);
    if (failed) console.log('VERDICT: NOT READY — fix the failures above before claiming delivery.');
    else if (warned) console.log('VERDICT: AUTHENTICATED BUT INCOMPLETE — no failures; review the warnings.');
    else console.log('VERDICT: AUTHENTICATION CHECKS PASSED — this is not proof of inbox placement; only the recipient mailbox can show that.');
  }
  return STRICT ? (failed || warned ? 1 : 0) : (failed ? 1 : 0);
}

async function main() {
  // Every positional argument after the mode is a message file. Values that
  // belong to flags are skipped explicitly rather than guessed at.
  const flagValues = new Set([-1, argv.indexOf('--domain') + 1, argv.indexOf('--expect-from') + 1]);
  const files = argv
    .map((value, index) => ({ value, index }))
    .slice(MODE === 'dns' ? 0 : 1)
    .filter(({ value, index }) => !value.startsWith('--') && !flagValues.has(index))
    .map(({ value }) => value);

  let selectors = [];
  const messages = [];
  for (const file of files) {
    try {
      const raw = readFileSync(file, 'utf8');
      messages.push({ file, raw });
      const found = headerValues(parseHeaders(raw), 'dkim-signature').map(parseTagList).map((t) => t.s).filter(Boolean);
      selectors.push(...found);
    } catch (error) {
      fail('input', `message file "${file}" is readable`, error.code ?? error.message);
    }
  }

  let auditedSelectors = [];
  if (MODE === 'dns' || MODE === 'all') {
    auditedSelectors = [...new Set(selectors)];
    await runDnsAudit(auditedSelectors);
  }
  if (MODE === 'headers' || MODE === 'all') {
    if (!messages.length) {
      fail('input', 'a message file was supplied', 'usage: node scripts/checkEmailDeliverability.mjs headers <file.eml>');
    } else {
      for (const message of messages) auditMessage(message.file, message.raw);
      const fresh = [...new Set(selectors)].filter((s) => !auditedSelectors.includes(s));
      if (MODE === 'all' && fresh.length) await dkimAudit(DOMAIN, fresh).catch(() => {});
    }
  }

  process.exit(summarise());
}

main().catch((error) => {
  console.error(`deliverability check failed: ${error?.stack ?? error}`);
  process.exit(1);
});
