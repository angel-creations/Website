# Email deliverability — angelcreations.in

This is the operating document for the two emails the contact wizard sends: the
internal enquiry notification to `business@angelcreations.in` and the customer
confirmation to the visitor. It records what was verified, what is still
unknown, and the exact, reversible steps that fix it.

Read this before changing DNS, EmailJS or the templates.

---

## 1. Verified facts (DNS audited 30 October 2026)

Everything below was measured with DNS queries, not inferred from a dashboard
label. Re-run `npm run test:deliverability` to refresh the live checks.

| Record | Value | Meaning |
| --- | --- | --- |
| Nameservers | `ns1/ns2.dns-parking.com` | DNS is managed by **Hostinger** |
| MX | `5 mx1.hostinger.com`, `10 mx2.hostinger.com` | Mail is **received by Hostinger** |
| TXT `@` | `v=spf1 include:_spf.mail.hostinger.com ~all` | One SPF record, 3 DNS lookups, softfail |
| SPF chain | `_spf.mail.hostinger.com` → `relay.mail.hostinger.com` + `relay.mailchannels.net` | Outbound relay is **Hostinger → MailChannels** |
| DKIM used | `hostingermail-a._domainkey` (CNAME + duplicate TXT, 2048-bit RSA) | Only **Hostinger** signs this domain |
| DKIM legacy | `hostingermail1._domainkey` (TXT, 2048-bit) | Second key; which one a message uses is only visible in its `s=` tag |
| DKIM unused | `hostingermail-b/-c` (empty `p=`) | Revoked placeholders, normal |
| DMARC | `v=DMARC1; p=none` | **No `rua`, no `ruf`** — no reports, no enforcement |
| `autodiscover` | `autodiscover.mail.hostinger.com` | Consistent with Hostinger mail |

**There is no Microsoft 365 anywhere on this domain.** No `selector1`/`selector2`
DKIM records, no `MS=ms…` verification TXT, no `msoid`/`lyncdiscover`, no
`include:spf.protection.outlook.com`. An earlier version of
[`EMAILJS_SETUP.md`](./EMAILJS_SETUP.md) told the operator to use "the verified
sender associated with the connected Microsoft 365 service". That instruction was
wrong for this domain and has been corrected. Do not reintroduce it.

**Consequence:** the only infrastructure authorised to send as
`angelcreations.in` is Hostinger's relay (plus whatever DKIM/SPF you add in step
5). A message sent through anything else — a personal Gmail or Outlook account,
another provider, a borrowed SMTP server — is unauthenticated for this domain,
and unauthenticated mail carrying your own domain in `From:` is the most common
reason it is filed as spam.

---

## 2. The rule that decides inbox vs spam

Receivers ask three questions about every message. All three must pass, and the
last one is the one almost everyone misses:

1. **SPF** — was this IP allowed to send for the envelope (`Return-Path`) domain?
2. **DKIM** — is the message signed, and does the signature verify against a
   published key?
3. **DMARC alignment** — does the **`From:` domain you can see** match the domain
   that passed SPF or DKIM?

"SPF pass, DKIM pass, still spam" is almost always an alignment failure: the
signature verifies, but it is signed by somebody else's domain. Our checker
prints exactly that verdict, and it is the signature of a personal-mailbox
service being used as the sender.

Authentication is necessary, not sufficient. Reputation and content decide the
margin: a young domain, a shared relay, a BCC fan-out to several recipients, and
an HTML-only body with a `mailto:` link all count against you even when the
records are perfect.

---

## 3. Start here: capture headers (5 minutes, no changes)

Do this **before** changing anything. It decides which path below applies, and
it is the only evidence that can prove the problem is fixed.

1. Submit one enquiry on the live site.
2. Open the internal notification in the `business@` mailbox and the
   confirmation in the visitor mailbox.
3. In each, use *Show original* / *View source* and save the message as `.eml`.
4. Run:

```bash
node scripts/checkEmailDeliverability.mjs all internal.eml confirmation.eml
```

The report names the `From:` domain, the envelope (`Return-Path`) domain, the
DKIM signing domain (`d=`) and selector (`s=`), the receiver's
`Authentication-Results`, and the alignment verdict for each message.

**How to read it**

| What the report shows | What it means | Go to |
| --- | --- | --- |
| `From:` is not `@angelcreations.in` (e.g. a Gmail/Outlook address) | The EmailJS service is a **personal mailbox service**. Fix by moving the sending service to a provider authenticated to this domain. | Path B |
| `From:` is `@angelcreations.in` but `d=` is `hostinger.com` / `gmail.com` / `outlook.com` | Signed by somebody else — **alignment fails**, DMARC fails, spam is expected. | Path B |
| `From:` is `@angelcreations.in`, `d=angelcreations.in`, `spf=pass`, `dmarc=pass` | Authentication is **actually fine**. The problem is reputation, content or the BCC fan-out. | Path A |
| No `Authentication-Results` at all | You captured a provider copy, not a delivered copy. Re-capture from the recipient mailbox. | — |

Never report a message as delivered-inbox because EmailJS returned HTTP 200, or
because a provider dashboard says "delivered". Only the recipient mailbox shows
placement; the report above shows only authentication.

---

## 4. Path A — make Hostinger-sending mail land (no new vendor)

Use this when the headers show the message is already aligned
(`d=angelcreations.in`, `spf=pass`). Nothing here needs a new account.

### A1. Turn on DMARC reporting (DNS change, reversible)

Right now failures are invisible because `p=none` publishes no `rua`. Add
reporting **without touching the policy**:

| Type | Name | Current | Proposed |
| --- | --- | --- | --- |
| TXT | `_dmarc` | `v=DMARC1; p=none` | `v=DMARC1; p=none; rua=mailto:dmarc@angelcreations.in; fo=1; adkim=r; aspf=r; pct=100` |

Before publishing, create the destination: hPanel → Emails → Aliases → add
`dmarc@angelcreations.in` as an alias on the `business@` mailbox (aliases are
free and do not consume a mailbox). If the alias does not exist, the reports
bounce and you learn nothing.

Rollback: restore the original 24-character value. Daily XML reports arrive from
Gmail and Microsoft within 24–48 hours and list every sending IP and domain using
your domain — including any you did not know about.

### A2. Remove the BCC fan-out (EmailJS template change)

The internal notification currently BCCs three private Gmail inboxes. BCC-only
delivery from a low-volume domain is one of Gmail's strongest bulk/spam
signals, and it also means one message is fought over by three different
reputation systems.

Replace it with a Hostinger **forwarder** (hPanel → Emails → Forwarders):
`leads@angelcreations.in` → the same three addresses. The template then has a
single `To:` and **no BCC**. The studio still receives the enquiry everywhere.

### A3. Make the two messages look like the same sender

Both templates should use the same `From Name` (`Angel Creations`) and the same
`From Email`. Two different identities from one domain, sent seconds apart, is a
needless inconsistency.

### A4. Warm up, then strengthen

Keep volume low and real for 2–3 weeks; do not send bursts, do not send to
purchased lists, and ask the studio's own contacts to reply to a notification
(a reply is the strongest positive signal available). After that, when the DMARC
reports show only Hostinger IPs sending:

1. Change `~all` to `-all` in the **existing** SPF record (never add a second).
2. Only then consider `p=quarantine` with `pct=25`, and raise it slowly.

**Never jump to `p=reject`.** It can silently destroy legitimate mail the moment
an unknown sender exists.

---

## 5. Path B — send through a provider authenticated to your domain

Use this when the headers show any of: `From:` off-domain, `d=` off-domain for
`angelcreations.in`, `dmarc=fail`, or a personal mailbox service in the EmailJS
dashboard.

### The one design rule

Choose a provider that lets you publish **DKIM on `angelcreations.in`** and uses
a **dedicated Return-Path subdomain** (e.g. `send.angelcreations.in`) with its
own SPF record. Then:

- `From:` stays `business@angelcreations.in` — nothing user-visible changes;
- DKIM aligns (`d=angelcreations.in`);
- **the existing root SPF record is never edited**, so Hostinger mail is
  untouched;
- **MX is never edited**, so existing mailboxes keep working.

Providers that fit: **Resend** (free 3,000/month, `send.` Return-Path by
default), **Postmark** (best transactional reputation, paid from the first tier),
**Amazon SES** (cheapest at volume, `ap-south-1` Mumbai), **SendGrid**. Brevo is
workable but normally expects an SPF include on the root record — avoid it if
"do not touch the working SPF" is a hard rule.

### B1. Provider side (no DNS yet)

Create the account, add the sending domain, and copy **exactly** the records the
provider's own dashboard issues. Do not hand-write DKIM keys, do not reuse
Hostinger's selector, do not invent a target.

Typical shape (illustrative — use the provider's real values):

| Type | Name | Purpose |
| --- | --- | --- |
| TXT/CNAME | `<selector>._domainkey` | DKIM signing key for `angelcreations.in` |
| TXT | `send` | SPF for the Return-Path subdomain |
| MX | `send` (if the provider requires bounce capture) | Bounce handling |

All of these are **additions**. None replaces an existing record.

### B2. EmailJS side (dashboard)

1. Add a new service using the provider's SMTP/API credentials. **Keep the old
   service connected** as a fallback until the new one is proven.
2. Record the new `service_id`.
3. Update both templates (see §6). The template IDs do not change.

### B3. Website side (one string, no design change)

If the new service has a new ID, change only `serviceId` in
[`src/config/emailjs.ts`](../src/config/emailjs.ts). The wizard, the eight
fields, the internal-first ordering, the confirmation-only retry and the
duplicate protection are untouched. No secret ever goes into client code.

### B4. Rollback

Point `serviceId` back at the old service (the old connection is still there).
The added DNS records can stay; they are inert if nothing sends through them.
Nothing in this path modifies MX or the existing root SPF.

---

## 6. EmailJS template fields — what actually controls the message

EmailJS substitutes variables into every template field **except `Settings`**.
The consequences matter:

- A **literal** value in the dashboard field always wins. The wizard's
  `to_email`, `subject` and `reply_to` parameters are only used where the field
  contains the matching variable.
- A variable the code never sends renders as an **empty string** — it does not
  error. A typo therefore silently produces a blank subject or recipient.
- `{{x}}` is HTML-escaped; `{{{x}}}` is raw and unsafe for user input.
- Total variable payload is capped at 50 kb; larger requests are rejected.

Both templates must end up like this:

| Field | Internal notification | Customer confirmation |
| --- | --- | --- |
| To | `business@angelcreations.in` (literal) | `{{email}}` |
| From Name | `Angel Creations` | `Angel Creations` |
| From Email | `business@angelcreations.in` — only valid if the connected service is authenticated for this domain | same |
| Reply-To | `{{email}}` | `business@angelcreations.in` |
| BCC | none (use the forwarder from A2) | none |
| Subject | `{{subject}}` or a literal | `{{subject}}` |

The confirmation may contain **only** the visitor's eight answers. Attribution,
click IDs, the composed internal `message` and any Gmail address must never
reach it. This is enforced in code by which parameters each send receives; do
not weaken it.

---

## 7. Known DNS defects (fix only when the evidence allows)

| Defect | Risk | Fix | Gate |
| --- | --- | --- | --- |
| `hostingermail-a._domainkey` publishes **both** a CNAME and a TXT | A CNAME must be the only record at a name; resolution can differ between resolvers | Keep the CNAME, delete the duplicate TXT | Only after a live message's `s=` tag confirms `hostingermail-a` is the selector in use |
| `hostingermail1._domainkey` is a second, unused key | If Hostinger rotates selectors, a stale key silently breaks verification | Delete it | Same gate — save the exact value first, it is the rollback |
| DMARC has no `rua` | Total blindness to authentication failures | §A1 | None — safe to do first |
| SPF ends `~all` | Unauthorised senders are tolerated | `-all` | Only after 2–4 weeks of clean reports |

Deleting a DKIM record is the highest-risk action in this document. Both
deletions above are gated on a real message header and both are reversible by
pasting the saved value back.

---

## 8. Verification

```bash
npm run test:deliverability                       # live DNS audit
node scripts/checkEmailDeliverability.mjs all a.eml b.eml   # DNS + two messages
node scripts/checkEmailDeliverability.mjs headers x.eml --strict
```

The script is read-only and offline apart from DNS. Exit code 1 means at least
one failure; `--strict` also fails on warnings, which is the right mode for a
release gate.

A message is only considered fixed when **all** of the following are true, in
the recipient's mailbox:

- `spf=pass` and the envelope domain aligns with `From:`;
- `dkim=pass` with `d=angelcreations.in`;
- `dmarc=pass`;
- the message is in **Inbox**, not Spam/Junk, at both a Gmail and an Outlook
  recipient;
- the internal notification's Reply-To is the visitor, the confirmation's
  Reply-To is `business@`, and no Gmail address or BCC appears in the
  confirmation.

---

## 9. Do not

- Do not edit or add a **second SPF record** — combine into the single existing
  one, and keep the lookup count at or below 10.
- Do not change **MX** records; receiving mail works and is unrelated to this
  problem.
- Do not jump to `p=reject`, and do not enable enforcement before reports are
  clean.
- Do not delete a DKIM record without saving its value and confirming the active
  selector from a real message.
- Do not put SMTP credentials, OAuth tokens or API keys in client code — the
  EmailJS public key is browser-visible by design, but it is not a secret and
  protects nothing.
- Do not send repeated test messages to improve reputation, and do not ask
  recipients to mark mail "not spam" as a substitute for authentication.
- Do not claim success from an API response, a dashboard status, or this tool's
  DNS section. Placement is only visible in a mailbox.

---

## 10. EmailJS plan limit (not a deliverability issue, but it will bite)

Each enquiry consumes **two** sends. EmailJS's free plan allows 200 sends per
month, so the form caps out at roughly **100 enquiries per month** regardless of
which provider sits behind it. The provider's own free tier does not raise that
ceiling — the EmailJS plan does. Watch the dashboard's usage counter before a
busy season.
