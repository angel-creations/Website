// Validates the EmailJS configuration that now lives in source.
//
// The contact wizard reads its identifiers from src/config/emailjs.ts, so the
// static site needs no build-time environment variables or host settings. That
// removes a silent failure mode ("forgot to set the Actions variable") but adds
// a different one: a typo or an accidental deletion in that module. This check
// fails the build in both cases.
//
//   node scripts/checkEmailjsConfig.mjs                 # validate the source module
//   node scripts/checkEmailjsConfig.mjs --bundle dist   # also validate the built output
//
// The EmailJS public key is browser-visible by design, but it is never printed
// here: only its presence and shape are reported.
//
// No network access, no email is sent.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_PATH = 'src/config/emailjs.ts';
const IN_ACTIONS = process.env.GITHUB_ACTIONS === 'true';
const bundleIndex = process.argv.indexOf('--bundle');
const bundleDir = bundleIndex === -1 ? null : (process.argv[bundleIndex + 1] ?? 'dist');

const failures = [];
let passes = 0;

function check(label, condition, detail = '') {
  if (condition) {
    passes += 1;
    console.log(`  ✓ ${label}`);
  } else {
    const message = detail ? `${label} — ${detail}` : label;
    failures.push(message);
    console.log(`  ✗ ${message}`);
    if (IN_ACTIONS) {
      console.log(`::error title=EmailJS configuration::${message.replace(/[\r\n]+/g, ' ')}`);
    }
  }
}

function readConfigField(source, field) {
  const match = source.match(new RegExp(`${field}\\s*:\\s*'([^']*)'`));
  return match ? match[1] : null;
}

console.log(`[1] Source module ${CONFIG_PATH}`);

if (!existsSync(CONFIG_PATH)) {
  check('configuration module exists', false, `${CONFIG_PATH} is missing`);
  finish();
}

const source = readFileSync(CONFIG_PATH, 'utf8');
const config = {
  serviceId: readConfigField(source, 'serviceId'),
  notificationTemplateId: readConfigField(source, 'notificationTemplateId'),
  confirmationTemplateId: readConfigField(source, 'confirmationTemplateId'),
  publicKey: readConfigField(source, 'publicKey'),
};

check('exports EMAILJS_CONFIG', /export\s+const\s+EMAILJS_CONFIG/.test(source));
check('exports getEmailJsConfig()', /export\s+function\s+getEmailJsConfig/.test(source));
check('declares the EmailJsConfig type', /export\s+type\s+EmailJsConfig/.test(source));

check('service ID is present', Boolean(config.serviceId && config.serviceId.trim()));
check('service ID has the expected shape', /^service_[A-Za-z0-9_-]{4,}$/.test(config.serviceId ?? ''),
  'must look like service_xxxx');
check('notification template ID is present', Boolean(config.notificationTemplateId));
check('notification template ID has the expected shape',
  /^template_[A-Za-z0-9_-]{4,}$/.test(config.notificationTemplateId ?? ''), 'must look like template_xxxx');
check('confirmation template ID is present', Boolean(config.confirmationTemplateId));
check('confirmation template ID has the expected shape',
  /^template_[A-Za-z0-9_-]{4,}$/.test(config.confirmationTemplateId ?? ''), 'must look like template_xxxx');
check('templates are distinct',
  config.notificationTemplateId !== config.confirmationTemplateId,
  'the internal notification and the customer confirmation must not share a template');
check('public key is present', Boolean(config.publicKey && config.publicKey.trim()));
check('public key has the expected shape', /^[A-Za-z0-9_-]{12,}$/.test(config.publicKey ?? ''),
  'must be a single opaque token');

// Client code must never carry server credentials or private recipients.
// Comments are stripped first: this module documents what must stay out, and
// prose about "OAuth tokens" is not a token.
const codeOnly = source
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/^\s*\/\/.*$/gm, ' ')
  .replace(/\s\/\/.*$/gm, ' ');

check('code contains no email addresses', !/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(codeOnly),
  'recipients (including the private BCC inboxes) belong in the EmailJS dashboard, never in client code');
check('code contains no credential material',
  !/\b(password|passwd|secret|client[_-]?secret|smtp|oauth|refresh[_-]?token|api[_-]?key)\b/i.test(codeOnly),
  'server credentials must never reach browser code');

// The sending route is part of the contract, not an implementation detail: a
// service that sends through a personal mailbox produces mail that cannot be
// DKIM-aligned to this domain, which is how the enquiry notifications ended up
// in spam with DMARC failing. Nothing in shipped code may reintroduce one.
const LEGACY_ROUTES = [
  ['the retired EmailJS service ID', /service_85q82kl/],
  ['an Outlook.com SMTP endpoint', /smtp-mail\.outlook\.com|smtp\.office365\.com|smtp\.office\.com/i],
  ['a Microsoft Graph mail call', /graph\.microsoft\.com/i],
  ['a Microsoft 365 DKIM selector', /selector[12]\._domainkey/i],
  ['an Outlook sender domain', /@(?:outlook|hotmail|live)\.(?:com|in|co\.uk)\b/i],
];

console.log('\n[1b] No legacy sending route in shipped code');

for (const [label, pattern] of LEGACY_ROUTES) {
  const hit = codeOnly.match(pattern);
  check(`source carries no ${label}`, !hit, hit ? `found: ${hit[0]}` : '');
}

console.log('\n[2] No build-time variables are required');

const wizard = readFileSync('src/components/ContactWizard.tsx', 'utf8');
check('ContactWizard imports the central configuration', /from '..\/config\/emailjs'/.test(wizard));
check('ContactWizard reads no VITE_EMAILJS_* variables', !/VITE_EMAILJS_(SERVICE|NOTIFICATION|CONFIRMATION|PUBLIC)/.test(wizard));
check('ContactWizard no longer touches import.meta.env', !/import\.meta/.test(wizard));

const workflow = readFileSync('.github/workflows/verify-production-build.yml', 'utf8');
const variableRefs = workflow.match(/vars\.VITE_EMAILJS_[A-Z_]+/g) ?? [];
check('workflow references no EmailJS repository variables', variableRefs.length === 0,
  `found: ${[...new Set(variableRefs)].join(', ')}`);

if (bundleDir) {
  console.log(`\n[3] Built output (${bundleDir})`);

  if (!existsSync(bundleDir)) {
    check('build directory exists', false, `${bundleDir} not found — run npm run build first`);
  } else {
    const bundleText = collectBundleText(bundleDir);
    check('bundle contains the service ID', bundleText.includes(config.serviceId ?? '\u0000'));
    check('bundle contains the notification template ID', bundleText.includes(config.notificationTemplateId ?? '\u0000'));
    check('bundle contains the confirmation template ID', bundleText.includes(config.confirmationTemplateId ?? '\u0000'));
    // Presence only — the key itself is never printed.
    check('bundle contains the public key (value not printed)', bundleText.includes(config.publicKey ?? '\u0000'));
    check('bundle carries no VITE_EMAILJS_* variable lookups', !/VITE_EMAILJS_(SERVICE|NOTIFICATION|CONFIRMATION|PUBLIC)_/.test(bundleText));
    for (const [label, pattern] of LEGACY_ROUTES) {
      const hit = bundleText.match(pattern);
      check(`bundle carries no ${label}`, !hit, hit ? `found: ${hit[0]}` : '');
    }
    check('bundle has no public-key-forced fallback build',
      !bundleText.includes('VITE_EMAILJS_FORCE_UNCONFIGURED') || bundleText.includes(config.serviceId ?? '\u0000'));
  }
}

finish();

function collectBundleText(directory) {
  const chunks = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) walk(full);
      else if (/\.(js|html|json|css|txt|xml)$/.test(entry)) chunks.push(readFileSync(full, 'utf8'));
    }
  };
  walk(directory);
  return chunks.join('\n');
}

function finish() {
  if (failures.length) {
    console.error(`\n${passes} checks passed, ${failures.length} failed.`);
    for (const failure of failures) console.error(` - ${failure}`);
    process.exit(1);
  }
  console.log(`\n${passes} checks passed, 0 failed.`);
  console.log('EmailJS configuration is present in source and compiled into the build (values not printed).');
  process.exit(0);
}
