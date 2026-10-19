# PCEC Connect project update

This is the project report and account-email review pack for PCEC. It is separate from the member app itself.

**19 October 2026:** the summary and `system-guide.html#social-features` document
friends and accepted requests, post/group privacy, group ownership/admins,
invitations, suggestions and ranking, notification modals, typing and emoji
controls. Public means approved members only. Existing audit evidence dates
are retained, and the one-time launch cleanup remains unfinished and on hold.

**13 October 2026 redesign:** `index.html` is now a short, plain summary for
leadership: status at a glance, what's new, a 15-item launch checklist, the
growth plan and budget from the *PCEC Connect Strategic Infrastructure Plan*
(Phase 1 $0, Phase 2 ~$45/month, Phase 3 ~$80–150/month), the next three
weeks, decisions for PCEC, an install QR code and links to the longer reports.
The other pages (5–6 October) are kept as detailed background. To update the
summary, edit `index.html` directly (no scripts); `assets/app-screens.webp`
holds the app screenshots. `npm run check` verifies the sections, checklist
counts, links and that the screenshot loads.

Open **system-guide.html**, linked from the Scorecard's documentation section,
for the plain-language documentation and system architecture. It includes the
member/backend diagram, sign-in and record/upload flows, member/admin instructions,
intended data-access map, launch operations and a directory of public reviews
and private maintainer notes. Source references are filenames, not public copies
of private documents. The guide describes the prepared source, labels pending
live work and preserves the audit's 5 October evidence date. Update this page
when the architecture or accepted deployment state changes; the older source
handover notes should not override the latest audit.

Open **production-readiness.html** for the launch audit: 21 issues, 83 checklist requirements, an 11-category assessment, ten blockers, twenty fixes and a proposed 14-day plan. Labels distinguish live observations, unverified requirements and local fixes. The current verdict is **not production ready**. Technical file/line evidence stays in the member workspace's `PRODUCTION-AUDIT.md`; no member records or credentials are published.

The 6 October priority guide highlights six plain-language launch priorities.
The checklist defaults to **Before launch** (64 checks), with filters for
**Can follow later** (9), **Only if enabled** (3) and **Not used now** (7).
Each later/conditional/unused item explains why and what still must work first.
These are scheduling labels, not new PASS results or approval to release.
All 83 original results, the 70% quality score and the 42% launch score are retained.
Edit `scripts/readiness-priorities.mjs` for this guidance; the generator rejects
references to missing checks and unexplained N/A items. The evidence remains
dated 5 October; adding the guide is not a new production audit.

Open **income-plan.html** for the proposed funding plan: membership renewal collection, paid training, voluntary app support and sponsorship. Its peso calculator compares illustrative monthly support with an entered operating cost; an unknown cost is never treated as profit. No fees are approved or payments collected by this page. It also covers a small pilot, payment-handling work and a separate developer maintenance agreement.

Open **api-cost-review.html** for the API audit, growth estimates and a local cost calculator. It distinguishes live settings from locally tested safeguards. No paid upgrade was enabled; email usage alerts still need a recipient. The calculator changes no settings and sends no requests.

Its **#service-budget** section adds the 6 October service recommendations:
Supabase Pro plus monthly UptimeRobot Solo total $35 (₱2,205 at a stated
planning rate of ₱63/USD); a ₱2,500–₱2,800 budget is proposed, not approved.
All cost figures are estimates only, not final costs, provider quotations or
approved spending. Final plans, usage, exchange rate, taxes and card fees must
be confirmed. This label appears prominently on the Scorecard and cost guide.
Resend, Cloudflare Pages and R2 start within free allowances. Optional VPS,
test-project and paid-email costs, annual monitoring payment, nonprofit
sponsorship, backup scope and billing limitations are explained with official
sources. Staffing, actual taxes, card fees, domain renewals and excess usage
are excluded. The hosting alternative needs a separately tested deployment.
Updating this guidance does not buy, configure or deploy any service. The
existing growth calculator still estimates photo-related Supabase cost only.

Open **index.html** for the supervisor’s progress report. Open **email-preview.html** to review eight account messages on a phone or desktop. The review page uses example information and does not send emails.

The messages cover password recovery, email confirmation, verification codes, password changes, email-address changes, and notices about adding or removing 2-step verification. Each has the same PCEC letterhead, a clear action and a short explanation of what to do if the change was not requested.

## 18 October 2026 status update

The summary now records the deployed PCEC branding, visible Menu and reaction-name list, with local validation evidence. It explicitly retains the open private-path release check and marks the one-time launch cleanup as unfinished, on hold and not executed. No private account email, member data or credentials are included. Earlier screenshots and audit pages retain their evidence dates.

## What needs approval

- The email wording and official sender address.
- Who will handle member account enquiries.
- A small pilot with real members and phones.

## What still needs setup

The templates are prepared; they have not been installed in the live email service. Email delivery and confirmation must be configured and tested. Administrator 2-step login is also a separate setup task. An email verification code is not the same as an authenticator-app code.

The latest security improvements were checked locally. They still need a coordinated live rollout. Publishing this report does not install those changes in the member app.

The **email-templates** folder contains the HTML files and **subjects.json** lists their subject lines and matching Supabase email settings. The project maintainer can install them using **SETUP.md**.

## For the maintainer

Run `npm ci`, then `npm run build` to regenerate the emails, audit and public output. Edit `scripts/readiness-data.mjs` for audit content; `scripts/build-readiness.mjs` produces its page. `npm run preview` serves the built public folder with the same CSP and security headers as Vercel. After installing Chromium with `npx playwright install chromium`, `npm run check` checks every page, calculators, audit filters/checklists, CSP enforcement, private-file exclusion and eight emails at phone and desktop widths. The templates use inline styles and table layouts for email compatibility; final delivery still needs testing in actual inboxes.

The build also prepares `dist/` for Vercel. `vercel.json` selects that folder;
only the report, documentation/architecture guide, income plan, API cost review, readiness review, email preview, generated JavaScript, logo and downloadable templates are published. Build scripts, README files and private developer evidence are excluded.

The report uses same-origin executable scripts, CSP `default-src 'self'`, `nosniff`, frame restrictions and a referrer policy. Inline CSS remains allowed for report/email layouts; inline scripts and handlers are blocked. These protections do not configure the member app host. Vercel supplies HSTS, verified during the live review.
