# Installing the account emails

For the person maintaining PCEC Connect. No messages were sent while preparing this pack.

1. Confirm the PCEC sender address and configure the email service (Supabase custom SMTP). Use a PCEC-controlled sender; keep credentials in the service settings.
2. In **Authentication → Emails → Templates**, choose the matching template named in `email-templates/subjects.json`. Paste its subject and the complete HTML file. Leave the `{{ ... }}` fields intact: Supabase fills them with the member’s address, link or verification code.
3. Set the application Site URL to `https://app.pcec.org.ph` and allow the exact callback URL used by the app. The header image uses `{{ .SiteURL }}/img/pcec-logo-white.png`, so that image must be available on the deployed app.
4. Test password recovery and email confirmation in a separate test environment, then in real desktop and phone inboxes. Disable click tracking in the email provider so single-use account links are not altered. Do not paste real member links or codes into a public issue or screenshot.
5. Enable the password-changed and verification-method-added/removed notifications if those features are in use. Saving a template alone does not enable a notification or add a sign-in method.
6. Enable **Confirm email** only once delivery works. The live public settings returned auto-confirm enabled on 5 October 2026. Decide how existing automatically confirmed accounts will be reverified.

The reauthentication code template is for confirming an account change. Supabase MFA uses a separate factor such as an authenticator app or phone; this pack supplies the MFA change notices, not a new MFA sign-in implementation. Magic links and email-address changes are included for future use and do not change the app’s current email/password login.

References: [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa).
