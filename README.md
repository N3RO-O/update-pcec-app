# PCEC Connect project update

This is the project report and account-email review pack for PCEC. It is separate from the member app itself.

Open **index.html** for the supervisor’s progress report. Open **email-preview.html** to review eight account messages on a phone or desktop. The review page uses example information and does not send emails.

The messages cover password recovery, email confirmation, verification codes, password changes, email-address changes, and notices about adding or removing 2-step verification. Each has the same PCEC letterhead, a clear action and a short explanation of what to do if the change was not requested.

## What needs approval

- The email wording and official sender address.
- Who will handle member account enquiries.
- A small pilot with real members and phones.

## What still needs setup

The templates are prepared; they have not been installed in the live email service. Email delivery and confirmation must be configured and tested. Administrator 2-step login is also a separate setup task. An email verification code is not the same as an authenticator-app code.

The latest security improvements were checked locally. They still need a coordinated live rollout. Publishing this report does not install those changes in the member app.

The **email-templates** folder contains the HTML files and **subjects.json** lists their subject lines and matching Supabase email settings. The project maintainer can install them using **SETUP.md**.

## For the maintainer

Run `npm ci`, then `npm run build` to regenerate the email files and preview. `npm run preview` opens a local review server. After installing Chromium with `npx playwright install chromium`, `npm run check` checks the report and all eight emails at phone and desktop widths. The templates use inline styles and table layouts for email compatibility; final delivery still needs testing in actual inboxes.

The build also prepares `dist/` for Vercel. `vercel.json` selects that folder;
only the report, preview, logo and downloadable templates are published.
