# 01 — Product requirements: PCEC Connect

Prepared 31 October 2026 from the inspected PCEC source, reconstructed empty schema, existing tests and portfolio. Released baseline: 1.1.10. Items marked planned or awaiting acceptance are not shipped integrations. The QA report is the authority for completed test evidence.

## Product overview

PCEC Connect is the member community progressive web app for the Philippine Council of Evangelical Churches. It connects official news and events with member profiles, community conversation, prayer, church information and giving. Its vision is a clear, accessible member experience supported by accountable administration and protected data.

The problem is fragmented updates and conversations, difficult discovery of church information, and payment evidence that lives in a separate provider system. The solution retains the existing PWA/Supabase application, gives users predictable navigation, records only what it can verify, and supplies maintainers with a traceable documentation and acceptance pack.

Primary users are visitors/newcomers, approved members, content/moderation administrators and authorized Finance operators. Infrastructure maintainers have a separate service responsibility. Expected outcomes are successful membership onboarding, accessible content discovery, correctly scoped conversations, accurate self-reported versus confirmed giving, and a repeatable release/handover process. Production launch is not accepted merely by publishing these documents.

## Roles, responsibilities and dashboard requirements

| Role/state | Accessible areas | Responsibilities/actions | Restrictions |
| --- | --- | --- | --- |
| Visitor | Welcome, login/signup/recovery, legal notices, install and public guides | Read public help; request own registration/recovery | No member data, private files or admin access |
| Unconfirmed/pending account | Confirmation/resend and account-status flows | Complete email ownership requirements | Cannot use approved-member APIs |
| Approved member | Home/content, profile, community, people, permitted chats, prayer, media, giving and help | Manage own allowed records; follow/invite/report; submit own donation report | No admin writes, role changes, other-user private details or Finance confirmation |
| Suspended/rejected account | Blocked/account resolution/logout | Read the relevant account explanation | Existing token must not restore protected member access |
| Application admin | Admin dashboard, member/content/church management, inbox/moderation, giving review/analytics | Perform explicitly permitted administration | Does not automatically join private groups or gain Supabase/Vercel/DNS ownership |
| Group owner | Own accepted group and settings | Change group privacy/roles; transfer ownership; manage members | Cannot leave without ownership transfer; no access to unrelated private groups |
| Group admin | Accepted managed group | Invite/rename/moderate/remove ordinary members within server rules | Cannot remove another admin using ordinary member-management rights |
| Finance operator | Current implementation uses an authorized application admin | Reconcile evidence; confirm/reject reports; view/export permitted ledger | Not a separate implemented finance role; no automatic TN/provider verification |
| Service/maintainer | Privileged infrastructure and guarded internal jobs | Approved deployment, secrets, minimal audit delivery, backup/restore | Never a browser role; no public service key or implicit permission to erase records |


The member dashboard is Home with current highlights and relevant content. The admin dashboard exposes the scoped management queues and summaries. Group settings are a membership-specific role view, not another global account role. Current database roles are member/admin; Finance is an assigned operational duty within admin. Proposed narrower Finance permissions need a separately accepted change.

| Capability | Visitor | Unconfirmed | Approved member | Application admin |
| --- | --- | --- | --- | --- |
| Public guides/legal/install | Read | Read | Read | Read |
| Member news/events/church/NDC | No | No | Read/register where supported | Manage |
| Own profile/preferences | Registration/status only | Limited status flow | Read/edit permitted fields | Permitted administration; birthday remains locked |
| Community posts/comments/reactions | No | No | According to audience, blocks and ownership | Permitted moderation; access remains scoped |
| Private chat history | No | No | Accepted membership only | Accepted membership only; bounded report review is separate |
| Group membership/roles | No | No | Accept/decline/leave; managers according to group role | No automatic group ownership |
| Donation report/receipt | No | No | Own report and own private evidence | Authorized review projection |
| Confirmed ledger/analytics | No | No | Own activity projection only | Authorized Finance/admin view |
| Member management/content writes | No | No | No | Allowed admin actions only |
| Backend keys/DNS/backup | No | No | No | Separate infrastructure authority required |


## Feature-by-feature requirements

This catalog has 60 individually identified current, planned and externally gated features. Implementation classification is distinct from acceptance: source code alone does not prove live delivery, third-party confirmation or launch readiness. Each acceptance criterion has a matching QA checklist entry.

### AUTH-001 — Welcome and first visit

**Classification/status:** Implemented. **Module:** Access.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show the three existing welcome slides on the first device visit. |
| 2. Purpose | understand the app and reach login |
| 3. Target user/role | A visitor |
| 4. User story | As a visitor, I want to understand the app and reach login. |
| 5. Functional requirements | Show the three existing welcome slides on the first device visit. Get Started or Skip leads to login; subsequent visits retain the welcome preference. |
| 6. User interactions | Open/use welcomePage, welcome slides, Skip/Get Started; supply first-visit local preference and navigation action; receive welcome slides or login form. |
| 7. Inputs | First-visit local preference and navigation action |
| 8. Outputs | Welcome slides or login form |
| 9. Business rules | The welcome flag is a device preference, not authorization. Signed-in users follow the session guard. |
| 10. Validation requirements | Storage failure must not trap the visitor in repeated onboarding. |
| 11. Permission requirements | A visitor. The welcome flag is a device preference, not authorization. Signed-in users follow the session guard. |
| 12. Dependencies |  ; versioned static/frontend assets |
| 13. Error and empty states | If local storage is unavailable, permit login. Public guides remain readable without a member account. |
| 14. Acceptance criteria | AUTH-001-AC1: First visit can finish the welcome flow. AUTH-001-AC2: A later visit reaches login without repeating the slides. |
| 15. Priority | High |
| 16. Related database tables | No new application table |
| 17. API endpoints |  |
| 18. Required UI components | welcomePage; welcome slides; Skip/Get Started |
| 19. Verification references | e2e.mjs — see the QA report for outcome and scope. |


### AUTH-002 — Email registration and consent

**Classification/status:** Implemented. **Module:** Access.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Collect first/last names, email, country/phone, optional church, password and confirmation. |
| 2. Purpose | create an account using accurate details and consent |
| 3. Target user/role | A visitor |
| 4. User story | As a visitor, I want to create an account using accurate details and consent. |
| 5. Functional requirements | Collect first/last names, email, country/phone, optional church, password and confirmation. Validate agreement to the Terms, Community Rules and Privacy Notice before signup. |
| 6. User interactions | Open/use signupPage, field, phoneInput, passwordField, consentLabel; supply registration fields and consent checkbox; receive auth user/profile plus confirmation or newcomer destination. |
| 7. Inputs | Registration fields and consent checkbox |
| 8. Outputs | Auth user/profile plus confirmation or newcomer destination |
| 9. Business rules | New accounts are bound to the Auth user; caller-supplied metadata cannot grant an admin role or bypass setup. |
| 10. Validation requirements | Required names/email/E.164-compatible phone; password minimum eight characters; matching confirmation; explicit consent. |
| 11. Permission requirements | A visitor. New accounts are bound to the Auth user; caller-supplied metadata cannot grant an admin role or bypass setup. |
| 12. Dependencies | POST /auth/v1/signup; schema entities below |
| 13. Error and empty states | Show field errors, duplicate-email guidance, rate-limit errors and a retry path; never show successful creation after a failed request. |
| 14. Acceptance criteria | AUTH-002-AC1: Invalid/unticked registration makes no successful account. AUTH-002-AC2: Valid fixture registration preserves country, normalized phone and church. |
| 15. Priority | Critical |
| 16. Related database tables | auth.users; public.user_profile |
| 17. API endpoints | POST /auth/v1/signup |
| 18. Required UI components | signupPage; field; phoneInput; passwordField; consentLabel |
| 19. Verification references | e2e.mjs; registration-search.mjs; profile-onboarding.mjs; security-db.mjs — see the QA report for outcome and scope. |


### AUTH-003 — Email confirmation and resend

**Classification/status:** Implemented. **Module:** Access.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Explain the confirmation step and resend an email link when requested. |
| 2. Purpose | confirm ownership of the email before entering member content |
| 3. Target user/role | An unconfirmed account holder |
| 4. User story | As an unconfirmed account holder, I want to confirm ownership of the email before entering member content. |
| 5. Functional requirements | Explain the confirmation step and resend an email link when requested. Consume valid callback tokens and reject expired/invalid links with useful recovery actions. |
| 6. User interactions | Open/use checkEmailPage, pendingPage, authCallbackPage, resend controls; supply email/link and resend request; receive confirmed session or safe explanation. |
| 7. Inputs | Email/link and resend request |
| 8. Outputs | Confirmed session or safe explanation |
| 9. Business rules | The production public settings report email auto-confirmation off. Administrators must not use the UI to bypass email ownership. |
| 10. Validation requirements | Validate email syntax, callback origin and token result; respect sending limits. |
| 11. Permission requirements | An unconfirmed account holder. The production public settings report email auto-confirmation off. Administrators must not use the UI to bypass email ownership. |
| 12. Dependencies | POST /auth/v1/resend; GET /auth/v1/verify; /auth/callback; schema entities below |
| 13. Error and empty states | Differentiate email sending failure, expired link and invalid link; keep confirmation addresses out of URLs where supported. |
| 14. Acceptance criteria | AUTH-003-AC1: Unconfirmed credentials cannot enter member routes. AUTH-003-AC2: A failed send never claims that a message was delivered. |
| 15. Priority | Critical |
| 16. Related database tables | auth.users; public.user_profile |
| 17. API endpoints | POST /auth/v1/resend; GET /auth/v1/verify; /auth/callback |
| 18. Required UI components | checkEmailPage; pendingPage; authCallbackPage; resend controls |
| 19. Verification references | auth-callback.mjs; auth-email-errors.mjs; e2e.mjs — see the QA report for outcome and scope. |


### AUTH-004 — Email/password login

**Classification/status:** Implemented. **Module:** Access.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Provide labelled email/password fields, password visibility, recovery and registration links. |
| 2. Purpose | sign in and reach the permitted screen |
| 3. Target user/role | A registered account holder |
| 4. User story | As a registered account holder, I want to sign in and reach the permitted screen. |
| 5. Functional requirements | Provide labelled email/password fields, password visibility, recovery and registration links. Authenticate, fetch the trusted profile and apply member/admin/status destinations. |
| 6. User interactions | Open/use loginPage, authShell, show/hide password, router guards; supply email, password and optional relative next destination; receive session and correct route, or sanitized failure. |
| 7. Inputs | Email, password and optional relative next destination |
| 8. Outputs | Session and correct route, or sanitized failure |
| 9. Business rules | Suspended/rejected users cannot enter the app. A safe relative next destination does not bypass role, consent or setup guards. |
| 10. Validation requirements | Email syntax and nonempty password are checked before submission; server credentials remain authoritative. |
| 11. Permission requirements | A registered account holder. Suspended/rejected users cannot enter the app. A safe relative next destination does not bypass role, consent or setup guards. |
| 12. Dependencies | POST /auth/v1/token?grant_type=password; GET /auth/v1/user; schema entities below |
| 13. Error and empty states | Wrong credentials, unconfirmed email, missing profile and network failure each have clear feedback; preserve the ability to retry. |
| 14. Acceptance criteria | AUTH-004-AC1: Valid member/admin fixtures reach their permitted destination. AUTH-004-AC2: Invalid credentials and unauthorized routes are rejected. |
| 15. Priority | Critical |
| 16. Related database tables | auth.users; public.user_profile |
| 17. API endpoints | POST /auth/v1/token?grant_type=password; GET /auth/v1/user |
| 18. Required UI components | loginPage; authShell; show/hide password; router guards |
| 19. Verification references | e2e.mjs; profile-onboarding.mjs; auth-callback.mjs — see the QA report for outcome and scope. |


### AUTH-005 — Google sign-in and first-time consent

**Classification/status:** Implemented. **Module:** Access.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Start Google authorization through Supabase using the configured callback. |
| 2. Purpose | sign in with Google while accepting PCEC requirements |
| 3. Target user/role | A Google account holder |
| 4. User story | As a google account holder, I want to sign in with google while accepting pcec requirements. |
| 5. Functional requirements | Start Google authorization through Supabase using the configured callback. For a first-time account, require the app consent flow before newcomer setup. |
| 6. User interactions | Open/use googleButton, finishSignupPage, consentLabel; supply provider action and consent state; receive returned session, consent screen or safe error. |
| 7. Inputs | Provider action and consent state |
| 8. Outputs | Returned session, consent screen or safe error |
| 9. Business rules | Google availability comes from the configured provider settings. Provider authentication does not itself grant admin or approved membership. |
| 10. Validation requirements | Validate callback state/result and explicit app consent; reject expired signup-context state. |
| 11. Permission requirements | A Google account holder. Google availability comes from the configured provider settings. Provider authentication does not itself grant admin or approved membership. |
| 12. Dependencies | GET /auth/v1/settings; GET /auth/v1/authorize?provider=google; /auth/callback; schema entities below |
| 13. Error and empty states | If Google is unavailable, explain that email login remains available; invalid callback recovery must not pretend to be a successful login. |
| 14. Acceptance criteria | AUTH-005-AC1: Consent is required in new Google signup fixtures. AUTH-005-AC2: Returned sessions still pass the same profile/status guards. |
| 15. Priority | Critical |
| 16. Related database tables | auth.users; public.user_profile |
| 17. API endpoints | GET /auth/v1/settings; GET /auth/v1/authorize?provider=google; /auth/callback |
| 18. Required UI components | googleButton; finishSignupPage; consentLabel |
| 19. Verification references | profile-onboarding.mjs; auth-callback.mjs; e2e.mjs — see the QA report for outcome and scope. |


### AUTH-006 — Password recovery and change

**Classification/status:** Implemented. **Module:** Access.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Forgot password requests a recovery link; valid recovery opens the reset form. |
| 2. Purpose | recover access or update a password through an authorized session |
| 3. Target user/role | An account holder |
| 4. User story | As an account holder, I want to recover access or update a password through an authorized session. |
| 5. Functional requirements | Forgot password requests a recovery link; valid recovery opens the reset form. Settings supports a matching new password for an authenticated account. |
| 6. User interactions | Open/use forgotPasswordPage, resetPasswordPage, settingsPage; supply email or authorized new-password fields; receive recovery request result or updated credentials. |
| 7. Inputs | Email or authorized new-password fields |
| 8. Outputs | Recovery request result or updated credentials |
| 9. Business rules | Managed Auth handles password storage/hashing; the frontend never implements its own password database. Real mailbox delivery remains an acceptance gate. |
| 10. Validation requirements | Valid email; minimum password length and matching confirmation; only a valid recovery/session can update credentials. |
| 11. Permission requirements | An account holder. Managed Auth handles password storage/hashing; the frontend never implements its own password database. Real mailbox delivery remains an acceptance gate. |
| 12. Dependencies | POST /auth/v1/recover; PUT /auth/v1/user; schema entities below |
| 13. Error and empty states | Distinguish provider sending failure, rate limit and recovery-token failure; never expose SMTP diagnostics or secrets. |
| 14. Acceptance criteria | AUTH-006-AC1: Fixtures report safe, distinct send errors and reject mismatched passwords. AUTH-006-AC2: Unauthorized password changes are rejected. |
| 15. Priority | Critical |
| 16. Related database tables | auth.users |
| 17. API endpoints | POST /auth/v1/recover; PUT /auth/v1/user |
| 18. Required UI components | forgotPasswordPage; resetPasswordPage; settingsPage |
| 19. Verification references | auth-email-errors.mjs; auth-callback.mjs; security-web.mjs; e2e.mjs — see the QA report for outcome and scope. |


### AUTH-007 — Session renewal, routing and logout

**Classification/status:** Implemented. **Module:** Access.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Renew sessions through the existing request policy and route according to trusted profile state. |
| 2. Purpose | keep an authorized session and leave it safely |
| 3. Target user/role | A signed-in member |
| 4. User story | As a signed-in member, I want to keep an authorized session and leave it safely. |
| 5. Functional requirements | Renew sessions through the existing request policy and route according to trusted profile state. Logout clears the local session and returns to login; pending/blocked/missing-profile screens remain distinct. |
| 6. User interactions | Open/use session.ts, router.ts, request-policy.ts; supply session state, profile and destination; receive authorized route or account problem/logout destination. |
| 7. Inputs | Session state, profile and destination |
| 8. Outputs | Authorized route or account problem/logout destination |
| 9. Business rules | A router guard is UX only; database functions and RLS enforce permissions. User-editable metadata is never a role authority. |
| 10. Validation requirements | Reject invalid/external next links, stale/invalid tokens and disallowed account states. |
| 11. Permission requirements | A signed-in member. A router guard is UX only; database functions and RLS enforce permissions. User-editable metadata is never a role authority. |
| 12. Dependencies | POST /auth/v1/token?grant_type=refresh_token; POST /auth/v1/logout; schema entities below |
| 13. Error and empty states | Expired sessions require sign-in; offline/API errors show a bounded retry rather than a permanently spinning screen. |
| 14. Acceptance criteria | AUTH-007-AC1: Member cannot enter admin workflows. AUTH-007-AC2: Suspension is enforced despite an earlier valid session. |
| 15. Priority | Critical |
| 16. Related database tables | auth.users; public.user_profile |
| 17. API endpoints | POST /auth/v1/token?grant_type=refresh_token; POST /auth/v1/logout |
| 18. Required UI components | session.ts; router.ts; request-policy.ts |
| 19. Verification references | security-db.mjs; api-policy.mjs; navigation-recovery.mjs; e2e.mjs — see the QA report for outcome and scope. |


### PROF-001 — Newcomer profile setup

**Classification/status:** Implemented. **Module:** Profiles.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Guide the member through name, birthday, contact, residence, church and review steps. |
| 2. Purpose | complete profile details once before using the app |
| 3. Target user/role | A new or unfinished member |
| 4. User story | As a new or unfinished member, I want to complete profile details once before using the app. |
| 5. Functional requirements | Guide the member through name, birthday, contact, residence, church and review steps. Save through the guarded setup RPC and return to the intended member destination. |
| 6. User interactions | Open/use profileSetupPage, six-step wizard, review controls; supply setup details and sharing choices; receive atomic saved profile and completion marker. |
| 7. Inputs | Setup details and sharing choices |
| 8. Outputs | Atomic saved profile and completion marker |
| 9. Business rules | Show setup only when the trusted required flag is true and no completion date exists. Returning/completed accounts use Edit Profile. Saved birthday is locked. |
| 10. Validation requirements | Validate a real nonfuture calendar birthday, name, phone/country consistency, location preferences and final confirmation. |
| 11. Permission requirements | A new or unfinished member. Show setup only when the trusted required flag is true and no completion date exists. Returning/completed accounts use Edit Profile. Saved birthday is locked. |
| 12. Dependencies | POST /rest/v1/rpc/complete_profile_setup; schema entities below |
| 13. Error and empty states | Retain the current wizard on failed save; unfinished accounts can resume. Do not persist draft birthdays in device storage. |
| 14. Acceptance criteria | PROF-001-AC1: Newcomer must finish valid setup; existing/completed account does not repeat it. PROF-001-AC2: A locked birthday cannot be replaced by client or ordinary admin editing. |
| 15. Priority | Critical |
| 16. Related database tables | public.user_profile |
| 17. API endpoints | POST /rest/v1/rpc/complete_profile_setup |
| 18. Required UI components | profileSetupPage; six-step wizard; review controls |
| 19. Verification references | profile-onboarding.mjs; profile-onboarding-db.mjs — see the QA report for outcome and scope. |


### PROF-002 — Profile view, edit and photo

**Classification/status:** Implemented. **Module:** Profiles.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show membership/profile actions and edit permitted fields. |
| 2. Purpose | manage editable personal information and an avatar |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to manage editable personal information and an avatar. |
| 5. Functional requirements | Show membership/profile actions and edit permitted fields. Crop a profile photo, upload under the caller folder and save its URL only after successful upload. |
| 6. User interactions | Open/use profilePage, editProfilePage, cropImage, avatar; supply profile form or image selection/crop; receive updated profile and avatar. |
| 7. Inputs | Profile form or image selection/crop |
| 8. Outputs | Updated profile and avatar |
| 9. Business rules | A member edits only their own profile; role/status and birthday locks remain server controlled. Profile photos use the designated public avatar bucket. |
| 10. Validation requirements | Field lengths, allowed images, byte limits and file signatures; server verifies caller identity and upload quota. |
| 11. Permission requirements | An approved member. A member edits only their own profile; role/status and birthday locks remain server controlled. Profile photos use the designated public avatar bucket. |
| 12. Dependencies | GET/PATCH /rest/v1/user_profile; POST /functions/v1/upload-file; schema entities below |
| 13. Error and empty states | Handle missing images, upload/save failure and crop cancellation without claiming success or replacing an existing image prematurely. |
| 14. Acceptance criteria | PROF-002-AC1: Profile edits preserve unrelated role/status fields. PROF-002-AC2: Cancel leaves the prior photo; accepted upload uses the owner folder. |
| 15. Priority | High |
| 16. Related database tables | public.user_profile; storage.objects |
| 17. API endpoints | GET/PATCH /rest/v1/user_profile; POST /functions/v1/upload-file |
| 18. Required UI components | profilePage; editProfilePage; cropImage; avatar |
| 19. Verification references | quality.mjs; profile-onboarding.mjs; security-edge.mjs; e2e.mjs — see the QA report for outcome and scope. |


### PROF-003 — Discovery and shared profile privacy

**Classification/status:** Implemented. **Module:** Profiles.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Allow public/private discovery preference and explicit birthday/location sharing choices. |
| 2. Purpose | control profile discovery and shared birthday/location details |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to control profile discovery and shared birthday/location details. |
| 5. Functional requirements | Allow public/private discovery preference and explicit birthday/location sharing choices. Return shared profile details only through the server-filtered relationship-aware projection. |
| 6. User interactions | Open/use settingsPage, memberPostsPage, profile sharing controls; supply visibility/sharing preferences and permitted target; receive minimal discoverable/shared profile. |
| 7. Inputs | Visibility/sharing preferences and permitted target |
| 8. Outputs | Minimal discoverable/shared profile |
| 9. Business rules | Private/unconfirmed profiles do not appear to strangers. Mutual follow, ownership, blocks and approved status determine permitted details; email/phone are not public directory fields. |
| 10. Validation requirements | Validate target identifiers and booleans; ignore caller attempts to request hidden private fields. |
| 11. Permission requirements | An approved member. Private/unconfirmed profiles do not appear to strangers. Mutual follow, ownership, blocks and approved status determine permitted details; email/phone are not public directory fields. |
| 12. Dependencies | POST /rest/v1/rpc/member_follows; POST /rest/v1/rpc/profile_details; POST /rest/v1/rpc/member_directory; schema entities below |
| 13. Error and empty states | Explain a hidden or unavailable profile without leaking private contact details; persist preferences after reload. |
| 14. Acceptance criteria | PROF-003-AC1: Stranger cannot retrieve private/shared-only details by guessing an ID. PROF-003-AC2: A saved private preference survives reload and removes discovery access. |
| 15. Priority | Critical |
| 16. Related database tables | private.member_privacy; private.member_follows; public.user_profile; public.community_blocks |
| 17. API endpoints | POST /rest/v1/rpc/member_follows; POST /rest/v1/rpc/profile_details; POST /rest/v1/rpc/member_directory |
| 18. Required UI components | settingsPage; memberPostsPage; profile sharing controls |
| 19. Verification references | member-follows-db.mjs; profile-onboarding-db.mjs; social-privacy-db.mjs; community-social.mjs — see the QA report for outcome and scope. |


### ACCT-001 — Account deletion

**Classification/status:** Implemented. **Module:** Profiles.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Require the account-deletion workflow and explicit confirmation. |
| 2. Purpose | request deletion of the account and owned files safely |
| 3. Target user/role | An account holder |
| 4. User story | As an account holder, I want to request deletion of the account and owned files safely. |
| 5. Functional requirements | Require the account-deletion workflow and explicit confirmation. Call the privileged deletion function using the caller session and documented record/file cleanup rules. |
| 6. User interactions | Open/use deleteAccountPage, accountDeletedPage, confirmation dialog; supply authorized deletion confirmation; receive deleted-account result or actionable failure. |
| 7. Inputs | Authorized deletion confirmation |
| 8. Outputs | Deleted-account result or actionable failure |
| 9. Business rules | No user can delete another account by supplying an ID. Financial history may retain a donor-name snapshot while the account link is removed; retention policy needs owner acceptance. |
| 10. Validation requirements | Authenticate the caller, validate deletion confirmation and enforce service-side cleanup rules. |
| 11. Permission requirements | An account holder. No user can delete another account by supplying an ID. Financial history may retain a donor-name snapshot while the account link is removed; retention policy needs owner acceptance. |
| 12. Dependencies | POST /functions/v1/delete-account; schema entities below |
| 13. Error and empty states | Explain irreversible impact before submission and show failures without false success. Do not run destructive production tests as routine QA. |
| 14. Acceptance criteria | ACCT-001-AC1: Anonymous/other-user deletion attempts fail in isolated tests. ACCT-001-AC2: Owned file cleanup follows the documented scope. |
| 15. Priority | Critical |
| 16. Related database tables | auth.users; public.user_profile; private.donation_reports; storage.objects |
| 17. API endpoints | POST /functions/v1/delete-account |
| 18. Required UI components | deleteAccountPage; accountDeletedPage; confirmation dialog |
| 19. Verification references | security-edge.mjs; security-db.mjs; security-web.mjs — see the QA report for outcome and scope. |


### HOME-001 — Home and navigation

**Classification/status:** Implemented. **Module:** Content.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show greeting, community highlights, upcoming events, dated latest news and community feed. |
| 2. Purpose | find updates and core tasks from one readable home screen |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to find updates and core tasks from one readable home screen. |
| 5. Functional requirements | Show greeting, community highlights, upcoming events, dated latest news and community feed. Provide Home, Chat, Donate, About and Profile tabs, with additional modules in Menu/desktop navigation. |
| 6. User interactions | Open/use homePage, appBar, bottomNav, menuPage, feed cards; supply authorized content lists and navigation action; receive home cards and the selected permitted route. |
| 7. Inputs | Authorized content lists and navigation action |
| 8. Outputs | Home cards and the selected permitted route |
| 9. Business rules | Current content respects approved membership, post visibility, blocks and event lifecycle. Re-selecting the same tab must not discard a loaded feed unnecessarily. |
| 10. Validation requirements | Handle empty lists, unavailable optional cards and bounded pagination without horizontal overflow. |
| 11. Permission requirements | An approved member. Current content respects approved membership, post visibility, blocks and event lifecycle. Re-selecting the same tab must not discard a loaded feed unnecessarily. |
| 12. Dependencies | GET /rest/v1/announcements; GET /rest/v1/events_feed; POST /rest/v1/rpc/community_timeline; schema entities below |
| 13. Error and empty states | Show useful empty/retry states when a section cannot load; optional failures must not blank the whole app. |
| 14. Acceptance criteria | HOME-001-AC1: Member can reach each available module on mobile and desktop. HOME-001-AC2: Private/unavailable content is not exposed through highlights. |
| 15. Priority | High |
| 16. Related database tables | public.announcements; public.events_feed; public.community_posts |
| 17. API endpoints | GET /rest/v1/announcements; GET /rest/v1/events_feed; POST /rest/v1/rpc/community_timeline |
| 18. Required UI components | homePage; appBar; bottomNav; menuPage; feed cards |
| 19. Verification references | quality.mjs; responsive.mjs; feed-header.mjs; feed-experience.mjs; e2e.mjs — see the QA report for outcome and scope. |


### NEWS-001 — Church news and announcements

**Classification/status:** Implemented. **Module:** Content.

| Requirement field | Specification |
| --- | --- |
| 1. Description | List current announcements and open full details with optional images. |
| 2. Purpose | read dated church updates with their context and sources |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to read dated church updates with their context and sources. |
| 5. Functional requirements | List current announcements and open full details with optional images. Preserve publication context, source links and image credits when editorial content supplies them. |
| 6. User interactions | Open/use newsListPage, newsDetailPage, news card; supply announcement identifier or list; receive dated article and permitted image. |
| 7. Inputs | Announcement identifier or list |
| 8. Outputs | Dated article and permitted image |
| 9. Business rules | A member reads but cannot create or edit official announcements. News illustrations must not be misrepresented as photos of reported people/events. |
| 10. Validation requirements | Safely render text/links; handle absent or expired image URLs without breaking the article. |
| 11. Permission requirements | An approved member. A member reads but cannot create or edit official announcements. News illustrations must not be misrepresented as photos of reported people/events. |
| 12. Dependencies | GET /rest/v1/announcements; schema entities below |
| 13. Error and empty states | Show no-news, unavailable-image and not-found states; a failed detail read must not render another article. |
| 14. Acceptance criteria | NEWS-001-AC1: List/detail show the selected title/body/date. NEWS-001-AC2: Member writes are denied by server policies. |
| 15. Priority | High |
| 16. Related database tables | public.announcements |
| 17. API endpoints | GET /rest/v1/announcements |
| 18. Required UI components | newsListPage; newsDetailPage; news card |
| 19. Verification references | security-db.mjs; quality.mjs; e2e.mjs — see the QA report for outcome and scope. |


### EVT-001 — Event discovery and lifecycle

**Classification/status:** Implemented. **Module:** Content.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show All/Upcoming/Past lists and event details with date, time and location. |
| 2. Purpose | find upcoming and past gatherings with current details |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to find upcoming and past gatherings with current details. |
| 5. Functional requirements | Show All/Upcoming/Past lists and event details with date, time and location. Apply end/archive lifecycle to lists, highlights and registration availability. |
| 6. User interactions | Open/use eventsPage, eventDetailPage, eventMix; supply event filter or event id; receive current event cards/details and registration availability. |
| 7. Inputs | Event filter or event ID |
| 8. Outputs | Current event cards/details and registration availability |
| 9. Business rules | Only authorized admins manage events. Published date/end-time rules, not client decoration, determine whether an event has ended. |
| 10. Validation requirements | Validate dates/end ordering and identifiers; enforce lifecycle server-side. |
| 11. Permission requirements | An approved member. Only authorized admins manage events. Published date/end-time rules, not client decoration, determine whether an event has ended. |
| 12. Dependencies | GET /rest/v1/events_feed; POST /rest/v1/rpc/event_lifecycle; schema entities below |
| 13. Error and empty states | Handle no upcoming/past items, deleted events and network failure with clear states. |
| 14. Acceptance criteria | EVT-001-AC1: Ended events cannot accept new registrations. EVT-001-AC2: Expiry updates Home and feed framing without changing unrelated event records. |
| 15. Priority | High |
| 16. Related database tables | public.events_feed |
| 17. API endpoints | GET /rest/v1/events_feed; POST /rest/v1/rpc/event_lifecycle |
| 18. Required UI components | eventsPage; eventDetailPage; eventMix |
| 19. Verification references | event-lifecycle-db.mjs; feed-experience.mjs; responsive.mjs; e2e.mjs — see the QA report for outcome and scope. |


### EVT-002 — Event registration and cancellation

**Classification/status:** Implemented. **Module:** Content.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Register once for an eligible event and show the current registration state. |
| 2. Purpose | register personal attendance intent and cancel it |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to register personal attendance intent and cancel it. |
| 5. Functional requirements | Register once for an eligible event and show the current registration state. Cancel the caller registration when permitted. |
| 6. User interactions | Open/use registration controls, event detail button; supply event id and register/cancel action; receive own registration state. |
| 7. Inputs | Event ID and register/cancel action |
| 8. Outputs | Own registration state |
| 9. Business rules | Registrations belong to the authenticated member; duplicate and ended-event registrations are rejected. This is not a payment or scanned-attendance feature. |
| 10. Validation requirements | Validate caller/event relationship, uniqueness and server lifecycle. |
| 11. Permission requirements | An approved member. Registrations belong to the authenticated member; duplicate and ended-event registrations are rejected. This is not a payment or scanned-attendance feature. |
| 12. Dependencies | GET/POST/DELETE /rest/v1/event_registrations; schema entities below |
| 13. Error and empty states | Preserve the previous state on failed submission and provide retry; never report registration before success. |
| 14. Acceptance criteria | EVT-002-AC1: Duplicate registration does not create a second record. EVT-002-AC2: One member cannot cancel or forge another member registration. |
| 15. Priority | High |
| 16. Related database tables | public.event_registrations; public.events_feed |
| 17. API endpoints | GET/POST/DELETE /rest/v1/event_registrations |
| 18. Required UI components | registration controls; event detail button |
| 19. Verification references | event-lifecycle-db.mjs; security-db.mjs; e2e.mjs — see the QA report for outcome and scope. |


### COM-001 — Post composer, photo and audience

**Classification/status:** Implemented. **Module:** Community.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Open a focused composer from Home/Community, accept text and one supported photo, and select audience. |
| 2. Purpose | share a text or photo update with the intended audience |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to share a text or photo update with the intended audience. |
| 5. Functional requirements | Open a focused composer from Home/Community, accept text and one supported photo, and select audience. Crop/compress/upload the photo through the existing protected upload path before creating the post. |
| 6. User interactions | Open/use openComposer, cropImage, audience select, post card; supply body, optional image and audience; receive created post with trusted author/image reference. |
| 7. Inputs | Body, optional image and audience |
| 8. Outputs | Created post with trusted author/image reference |
| 9. Business rules | The database supplies trusted author identity. Public means approved members, not the open internet. Friends-only content follows mutual relationships and blocks. |
| 10. Validation requirements | Posts up to 2,000 characters; one allowed image within the upload limit; permitted audience values and caller-bound author. |
| 11. Permission requirements | An approved member. The database supplies trusted author identity. Public means approved members, not the open internet. Friends-only content follows mutual relationships and blocks. |
| 12. Dependencies | POST/PATCH /rest/v1/community_posts; POST /functions/v1/upload-file; schema entities below |
| 13. Error and empty states | Validation/upload/save errors leave a retry path; cancellation makes no post. Video posting is explicitly unavailable. |
| 14. Acceptance criteria | COM-001-AC1: Successful text/photo post appears with the correct author/audience. COM-001-AC2: Oversized/forged/unauthorized posts fail without leaking a private photo. |
| 15. Priority | High |
| 16. Related database tables | public.community_posts; storage.objects |
| 17. API endpoints | POST/PATCH /rest/v1/community_posts; POST /functions/v1/upload-file |
| 18. Required UI components | openComposer; cropImage; audience select; post card |
| 19. Verification references | feed-experience.mjs; community-actions-db.mjs; social-privacy-db.mjs; e2e.mjs — see the QA report for outcome and scope. |


### COM-002 — Latest and ranked feed, pagination and live updates

**Classification/status:** Implemented. **Module:** Community.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Provide chronological Latest and relationship/engagement-ranked For you views. |
| 2. Purpose | browse permitted posts without losing place |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to browse permitted posts without losing place. |
| 5. Functional requirements | Provide chronological Latest and relationship/engagement-ranked For you views. Page older content and refresh permitted updates using invalidations rather than broadcasting private bodies. |
| 6. User interactions | Open/use communityPage, post cards, Latest/For you, Load more; supply feed choice, cursor and invalidation; receive ordered permitted posts and next-page state. |
| 7. Inputs | Feed choice, cursor and invalidation |
| 8. Outputs | Ordered permitted posts and next-page state |
| 9. Business rules | Ranking never expands visibility; source applies audience, blocks, hidden state and caller permissions before results. Current network access is required for fresh data. |
| 10. Validation requirements | Bound page sizes, validate cursors and cancel stale requests on navigation. |
| 11. Permission requirements | An approved member. Ranking never expands visibility; source applies audience, blocks, hidden state and caller permissions before results. Current network access is required for fresh data. |
| 12. Dependencies | POST /rest/v1/rpc/community_timeline; POST /rest/v1/rpc/community_for_you; private Realtime feed invalidations; schema entities below |
| 13. Error and empty states | Show empty/caught-up/loading/retry states; reconnect refreshes without creating duplicate posts. |
| 14. Acceptance criteria | COM-002-AC1: Pagination retains all permitted fixture posts without duplicates. COM-002-AC2: Private posts never enter ranked results for a stranger. |
| 15. Priority | High |
| 16. Related database tables | public.community_posts; public.community_reactions; public.community_comments; private.member_follows |
| 17. API endpoints | POST /rest/v1/rpc/community_timeline; POST /rest/v1/rpc/community_for_you; private Realtime feed invalidations |
| 18. Required UI components | communityPage; post cards; Latest/For you; Load more |
| 19. Verification references | feed-experience.mjs; community-social.mjs; social-privacy-db.mjs — see the QA report for outcome and scope. |


### COM-003 — Comments and threaded replies

**Classification/status:** Implemented. **Module:** Community.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show existing permitted comments and allow a comment or reply to a specific comment. |
| 2. Purpose | respond within a post discussion |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to respond within a post discussion. |
| 5. Functional requirements | Show existing permitted comments and allow a comment or reply to a specific comment. Support authorized deletion and return updates without exposing hidden parent posts. |
| 6. User interactions | Open/use comment list, reply composer, Send comment; supply post/parent id and comment body; receive saved comment/reply and updated count. |
| 7. Inputs | Post/parent ID and comment body |
| 8. Outputs | Saved comment/reply and updated count |
| 9. Business rules | The caller is the trusted author. A reply remains bound to its post/parent; blocks and post visibility still apply. |
| 10. Validation requirements | Nonblank text up to 1,000 characters, valid parent/post relationship and caller authorization. |
| 11. Permission requirements | An approved member. The caller is the trusted author. A reply remains bound to its post/parent; blocks and post visibility still apply. |
| 12. Dependencies | GET/POST/DELETE /rest/v1/community_comments; POST /rest/v1/rpc/community_reply; schema entities below |
| 13. Error and empty states | Show no-comments, loading and failed-send states; preserve unsent text for an ordinary retry. |
| 14. Acceptance criteria | COM-003-AC1: Reply appears under the intended parent. COM-003-AC2: Forged author or hidden-post comments are denied. |
| 15. Priority | High |
| 16. Related database tables | public.community_comments; public.community_posts |
| 17. API endpoints | GET/POST/DELETE /rest/v1/community_comments; POST /rest/v1/rpc/community_reply |
| 18. Required UI components | comment list; reply composer; Send comment |
| 19. Verification references | community-actions-db.mjs; community-social.mjs; e2e.mjs — see the QA report for outcome and scope. |


### COM-004 — Reactions and reactor list

**Classification/status:** Implemented. **Module:** Community.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Provide quick reactions plus accessible extended choices through hold/keyboard controls. |
| 2. Purpose | react to a post and see permitted reactions |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to react to a post and see permitted reactions. |
| 5. Functional requirements | Provide quick reactions plus accessible extended choices through hold/keyboard controls. Open a paged list of reacting members through a minimal server projection. |
| 6. User interactions | Open/use reaction buttons, reaction chooser, reactor sheet; supply post id and reaction action; receive own reaction, counts and reactor pages. |
| 7. Inputs | Post ID and reaction action |
| 8. Outputs | Own reaction, counts and reactor pages |
| 9. Business rules | Reaction kinds and uniqueness are server enforced; viewing reactors does not bypass the post audience or profile projection. |
| 10. Validation requirements | Allowed reaction kind, valid visible post, caller identity and bounded pagination. |
| 11. Permission requirements | An approved member. Reaction kinds and uniqueness are server enforced; viewing reactors does not bypass the post audience or profile projection. |
| 12. Dependencies | POST/DELETE /rest/v1/community_reactions; POST /rest/v1/rpc/community_reactors; schema entities below |
| 13. Error and empty states | Handle zero reactions, unavailable list and failed toggle without false success. |
| 14. Acceptance criteria | COM-004-AC1: Hold opens the chooser without also adding a reaction. COM-004-AC2: Anonymous/private-post reactor lookup is denied. |
| 15. Priority | High |
| 16. Related database tables | public.community_reactions; public.community_posts; public.user_profile |
| 17. API endpoints | POST/DELETE /rest/v1/community_reactions; POST /rest/v1/rpc/community_reactors |
| 18. Required UI components | reaction buttons; reaction chooser; reactor sheet |
| 19. Verification references | reaction-people-db.mjs; testing-feedback.mjs; community-social.mjs — see the QA report for outcome and scope. |


### COM-005 — Saved posts, reposting and sharing

**Classification/status:** Implemented. **Module:** Community.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Toggle saved/reposted state, list Saved posts, copy or natively share a post link, and send a link into an accessible chat. |
| 2. Purpose | return to useful posts and share a permitted reference |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to return to useful posts and share a permitted reference. |
| 5. Functional requirements | Toggle saved/reposted state, list Saved posts, copy or natively share a post link, and send a link into an accessible chat. Use the current guarded action service with the documented compatibility fallback when unavailable. |
| 6. User interactions | Open/use share sheet, Saved posts, repost/save controls; supply post/action and optional chat target; receive saved/reposted state or shared reference. |
| 7. Inputs | Post/action and optional chat target |
| 8. Outputs | Saved/reposted state or shared reference |
| 9. Business rules | Saved state is personal; reposting never grants a new audience access to the original. The server checks chat membership and original post visibility. |
| 10. Validation requirements | Valid post/action and authorized destination; deduplicate repeat actions and preserve mutation identity. |
| 11. Permission requirements | An approved member. Saved state is personal; reposting never grants a new audience access to the original. The server checks chat membership and original post visibility. |
| 12. Dependencies | POST /rest/v1/rpc/community_actions; POST /rest/v1/chat_messages; schema entities below |
| 13. Error and empty states | Offer copy fallback when native share is unavailable; deleted/inaccessible saved items must not expose content. |
| 14. Acceptance criteria | COM-005-AC1: Toggling does not create duplicate saves/reposts. COM-005-AC2: Blocked/hidden originals remain inaccessible through a shared URL. |
| 15. Priority | High |
| 16. Related database tables | private.community_saves; public.community_reposts; public.community_posts; public.chat_messages |
| 17. API endpoints | POST /rest/v1/rpc/community_actions; POST /rest/v1/chat_messages |
| 18. Required UI components | share sheet; Saved posts; repost/save controls |
| 19. Verification references | community-actions-db.mjs; community-social.mjs; feed-experience.mjs — see the QA report for outcome and scope. |


### COM-006 — Post management, reports and blocking

**Classification/status:** Implemented. **Module:** Community.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Permit supported owner edits/deletion and member reports or blocks. |
| 2. Purpose | manage content and report unwanted activity |
| 3. Target user/role | A content owner or authorized moderator |
| 4. User story | As a content owner or authorized moderator, I want to manage content and report unwanted activity. |
| 5. Functional requirements | Permit supported owner edits/deletion and member reports or blocks. Provide admin moderation/resolution without letting members moderate other users. |
| 6. User interactions | Open/use Post options, report/block confirmations, adminCommunityPage; supply content target, edit/report/block action and reason; receive updated authorized content, report or block state. |
| 7. Inputs | Content target, edit/report/block action and reason |
| 8. Outputs | Updated authorized content, report or block state |
| 9. Business rules | Owner/moderator checks run in the backend. Blocks apply in both directions to protected discovery/content access; reporting is not an automatic punishment. |
| 10. Validation requirements | Validate target, reason length and allowed operation; reject impersonation and unauthorized moderation. |
| 11. Permission requirements | A content owner or authorized moderator. Owner/moderator checks run in the backend. Blocks apply in both directions to protected discovery/content access; reporting is not an automatic punishment. |
| 12. Dependencies | PATCH/DELETE /rest/v1/community_posts; POST /rest/v1/community_reports; POST/DELETE /rest/v1/community_blocks; schema entities below |
| 13. Error and empty states | Show removed/unavailable content safely and keep failed actions retryable. |
| 14. Acceptance criteria | COM-006-AC1: Member cannot delete or edit another member content. COM-006-AC2: Blocks and hidden state remove future protected reads. |
| 15. Priority | Critical |
| 16. Related database tables | public.community_posts; public.community_reports; public.community_blocks |
| 17. API endpoints | PATCH/DELETE /rest/v1/community_posts; POST /rest/v1/community_reports; POST/DELETE /rest/v1/community_blocks |
| 18. Required UI components | Post options; report/block confirmations; adminCommunityPage |
| 19. Verification references | security-db.mjs; community-actions-db.mjs; social-privacy-db.mjs; e2e.mjs — see the QA report for outcome and scope. |


### SOC-001 — Following, followers and suggestions

**Classification/status:** Implemented. **Module:** Connections.

| Requirement field | Specification |
| --- | --- |
| 1. Description | List following/followers and suggestions, follow/unfollow, follow back and reject an incoming follow. |
| 2. Purpose | connect with people while respecting their privacy |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to connect with people while respecting their privacy. |
| 5. Functional requirements | List following/followers and suggestions, follow/unfollow, follow back and reject an incoming follow. Use mutual follows as friends for audiences and the group picker, while retaining legacy accepted-friendship compatibility. |
| 6. User interactions | Open/use friendsPage, directory search, profile connection buttons; supply target/action or contact list request; receive relationship state and protected suggestions. |
| 7. Inputs | Target/action or contact list request |
| 8. Outputs | Relationship state and protected suggestions |
| 9. Business rules | No self follow or relationship with a blocked account; private-profile discovery and messaging rules remain server controlled. |
| 10. Validation requirements | Caller-bound relationship actions, approved/confirmed target and known action; list only minimal fields. |
| 11. Permission requirements | An approved member. No self follow or relationship with a blocked account; private-profile discovery and messaging rules remain server controlled. |
| 12. Dependencies | POST /rest/v1/rpc/member_follows; POST /rest/v1/rpc/member_directory; schema entities below |
| 13. Error and empty states | Show no contacts/matches, hidden target and temporary-unavailable states without inventing relationships. |
| 14. Acceptance criteria | SOC-001-AC1: Follow-back produces a mutual relationship for friend selection. SOC-001-AC2: A stranger cannot follow a known private ID or read another person graph. |
| 15. Priority | Critical |
| 16. Related database tables | private.member_follows; private.member_privacy; public.member_friendships; public.community_blocks |
| 17. API endpoints | POST /rest/v1/rpc/member_follows; POST /rest/v1/rpc/member_directory |
| 18. Required UI components | friendsPage; directory search; profile connection buttons |
| 19. Verification references | member-follows-db.mjs; social-privacy-db.mjs; community-social.mjs — see the QA report for outcome and scope. |


### CHAT-001 — Shared Community Chat

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Load paged shared history and send a text message. |
| 2. Purpose | take part in the shared member conversation |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to take part in the shared member conversation. |
| 5. Functional requirements | Load paged shared history and send a text message. Use trusted author/timestamp fields and private live invalidations. |
| 6. User interactions | Open/use chatPage, composer, paged history, connection status; supply message body and mutation id; receive stored message or retryable rejection. |
| 7. Inputs | Message body and mutation ID |
| 8. Outputs | Stored message or retryable rejection |
| 9. Business rules | Only approved/confirmed users read or send. Shared chat is not a private direct conversation or end-to-end encrypted service. |
| 10. Validation requirements | Nonblank text up to 1,000 characters; caller-bound identity; server limit of 20 messages per minute. |
| 11. Permission requirements | An approved member. Only approved/confirmed users read or send. Shared chat is not a private direct conversation or end-to-end encrypted service. |
| 12. Dependencies | GET/POST /rest/v1/chat_messages; private Realtime chat topics; schema entities below |
| 13. Error and empty states | Keep the current draft after a failed send; show empty history, connection and retry state. |
| 14. Acceptance criteria | CHAT-001-AC1: Member can read/send; anonymous, pending and suspended users cannot. CHAT-001-AC2: Retry of the same mutation does not duplicate a message. |
| 15. Priority | Critical |
| 16. Related database tables | public.chat_messages |
| 17. API endpoints | GET/POST /rest/v1/chat_messages; private Realtime chat topics |
| 18. Required UI components | chatPage; composer; paged history; connection status |
| 19. Verification references | chat-db.mjs; chat-experience.mjs; community-social.mjs — see the QA report for outcome and scope. |


### CHAT-002 — Direct messages and requests

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Start a direct conversation from an allowed profile or New message search. |
| 2. Purpose | contact one permitted person privately |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to contact one permitted person privately. |
| 5. Functional requirements | Start a direct conversation from an allowed profile or New message search. Show an invitation/request where acceptance is required before messages become readable. |
| 6. User interactions | Open/use New message, messageMemberButton, request actions; supply target id and request action; receive existing/new direct room or a pending request. |
| 7. Inputs | Target ID and request action |
| 8. Outputs | Existing/new direct room or a pending request |
| 9. Business rules | Server checks the caller, target visibility, blocks, relationship and the existing unique pair. App admins do not gain automatic access to private conversations. |
| 10. Validation requirements | Approved distinct target, permitted discovery/message rule and deduplicated direct pair. |
| 11. Permission requirements | An approved member. Server checks the caller, target visibility, blocks, relationship and the existing unique pair. App admins do not gain automatic access to private conversations. |
| 12. Dependencies | POST /rest/v1/rpc/chat_groups; POST /rest/v1/rpc/member_follows; schema entities below |
| 13. Error and empty states | Explain blocked/unavailable targets and pending requests without leaking history. |
| 14. Acceptance criteria | CHAT-002-AC1: Repeated open uses the same direct pair. CHAT-002-AC2: Request alone does not authorize private history or Realtime membership. |
| 15. Priority | Critical |
| 16. Related database tables | private.direct_conversations; public.chat_rooms; public.chat_room_members |
| 17. API endpoints | POST /rest/v1/rpc/chat_groups; POST /rest/v1/rpc/member_follows |
| 18. Required UI components | New message; messageMemberButton; request actions |
| 19. Verification references | direct-messages-db.mjs; community-social.mjs; chat-experience.mjs — see the QA report for outcome and scope. |


### CHAT-003 — Private group creation and friend picker

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Expose New group in Chats, collect a name and let the creator search/select mutual friends. |
| 2. Purpose | choose friends to invite into a new private group |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to choose friends to invite into a new private group. |
| 5. Functional requirements | Expose New group in Chats, collect a name and let the creator search/select mutual friends. Create once, send selected invitations and retry only unsent invitations after a partial failure. |
| 6. User interactions | Open/use openChatGroupForm, friend checkboxes, search, retry actions; supply group name and selected friend ids; receive private room plus pending invitations. |
| 7. Inputs | Group name and selected friend IDs |
| 8. Outputs | Private room plus pending invitations |
| 9. Business rules | Groups start private. Invitees accept before joining/history access. Selection is up to 20 per batch; server caps group membership and creation/invite rates. |
| 10. Validation requirements | Trimmed 1–80 character name, mutual-follow candidates, no self/duplicate selection; trusted backend permissions override the UI. |
| 11. Permission requirements | An approved member. Groups start private. Invitees accept before joining/history access. Selection is up to 20 per batch; server caps group membership and creation/invite rates. |
| 12. Dependencies | POST /rest/v1/rpc/chat_groups; POST /rest/v1/rpc/member_follows; schema entities below |
| 13. Error and empty states | Allow empty creation, no-friends guidance and friend-load retry; a partial send clearly states the room already exists. |
| 14. Acceptance criteria | CHAT-003-AC1: Cancelling creates no room. CHAT-003-AC2: A partial retry neither creates another room nor resends successful invitations. |
| 15. Priority | High |
| 16. Related database tables | public.chat_rooms; public.chat_room_members; private.member_follows |
| 17. API endpoints | POST /rest/v1/rpc/chat_groups; POST /rest/v1/rpc/member_follows |
| 18. Required UI components | openChatGroupForm; friend checkboxes; search; retry actions |
| 19. Verification references | group-creation.mjs; chat-db.mjs; member-follows-db.mjs — see the QA report for outcome and scope. |


### CHAT-004 — Group privacy and membership management

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Accept/decline invitations; invite permitted people, rename and remove members. |
| 2. Purpose | manage the group without exposing it to unintended people |
| 3. Target user/role | A group owner or authorized group admin |
| 4. User story | As a group owner or authorized group admin, I want to manage the group without exposing it to unintended people. |
| 5. Functional requirements | Accept/decline invitations; invite permitted people, rename and remove members. Let the owner manage public/friends/private discovery, promote/demote admins and transfer ownership; members can leave. |
| 6. User interactions | Open/use chatGroupSettingsPage, privacy select, member actions; supply room, target and permitted management action; receive updated room/member state. |
| 7. Inputs | Room, target and permitted management action |
| 8. Outputs | Updated room/member state |
| 9. Business rules | An owner must transfer ownership before leaving. Only authorized managers change membership; only the owner removes another group admin. Public/friends visibility is still within approved membership. |
| 10. Validation requirements | Allowed state/role transitions, target membership and server cap of 50 accepted/pending members; creation limited to five/day and invitations to 20/minute. |
| 11. Permission requirements | A group owner or authorized group admin. An owner must transfer ownership before leaving. Only authorized managers change membership; only the owner removes another group admin. Public/friends visibility is still within approved membership. |
| 12. Dependencies | POST /rest/v1/rpc/chat_groups; schema entities below |
| 13. Error and empty states | Show pending/declined/removed/unavailable states; losing membership revokes subsequent history and live access. |
| 14. Acceptance criteria | CHAT-004-AC1: Ordinary member cannot invite/promote/remove others. CHAT-004-AC2: Former member and unaccepted invitee cannot read group messages. |
| 15. Priority | Critical |
| 16. Related database tables | public.chat_rooms; public.chat_room_members |
| 17. API endpoints | POST /rest/v1/rpc/chat_groups |
| 18. Required UI components | chatGroupSettingsPage; privacy select; member actions |
| 19. Verification references | chat-db.mjs; social-privacy-db.mjs; community-social.mjs — see the QA report for outcome and scope. |


### CHAT-005 — Message editing, emoji and footprints

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Insert emoji and offer supported owner editing/unsend actions. |
| 2. Purpose | compose with emoji and manage messages within the permitted rules |
| 3. Target user/role | A conversation member |
| 4. User story | As a conversation member, I want to compose with emoji and manage messages within the permitted rules. |
| 5. Functional requirements | Insert emoji and offer supported owner editing/unsend actions. Preserve a visible footprint when a message is unsent or moderated. |
| 6. User interactions | Open/use message options, emoji picker, edit composer, footprint; supply message id, action and optional replacement text; receive updated message or unsent footprint. |
| 7. Inputs | Message ID, action and optional replacement text |
| 8. Outputs | Updated message or unsent footprint |
| 9. Business rules | Only the trusted author or permitted room moderator may modify a message. Do not physically erase history through a raw client delete. |
| 10. Validation requirements | Message length, allowed action and author/room ownership checks are server enforced. |
| 11. Permission requirements | A conversation member. Only the trusted author or permitted room moderator may modify a message. Do not physically erase history through a raw client delete. |
| 12. Dependencies | POST /rest/v1/rpc/chat_message_action; schema entities below |
| 13. Error and empty states | Reject inaccessible/removed targets; failed edits retain a retry path and do not silently alter history. |
| 14. Acceptance criteria | CHAT-005-AC1: Another member cannot edit or unsend the author message. CHAT-005-AC2: Unsend/moderation retains its footprint and does not leak removed body text. |
| 15. Priority | Critical |
| 16. Related database tables | public.chat_messages |
| 17. API endpoints | POST /rest/v1/rpc/chat_message_action |
| 18. Required UI components | message options; emoji picker; edit composer; footprint |
| 19. Verification references | chat-db.mjs; chat-experience.mjs — see the QA report for outcome and scope. |


### CHAT-006 — Typing, reconnect and current-window drafts

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show best-effort typing without transmitting draft text. |
| 2. Purpose | know connection state and recover an interrupted conversation |
| 3. Target user/role | A conversation member |
| 4. User story | As a conversation member, I want to know connection state and recover an interrupted conversation. |
| 5. Functional requirements | Show best-effort typing without transmitting draft text. Reconnect and refresh permitted history; keep a failed-send draft in the current window. |
| 6. User interactions | Open/use typing indicator, status, composer, cleanup handlers; supply typing state, connection events and unsent current-window text; receive ephemeral status and refreshed history. |
| 7. Inputs | Typing state, connection events and unsent current-window text |
| 8. Outputs | Ephemeral status and refreshed history |
| 9. Business rules | Private typing/live topics check accepted membership. Signals are ephemeral and expire; offline shell is not an offline message queue. |
| 10. Validation requirements | Throttle typing and history polling; stop listeners/polls on route exit, hidden tabs or unavailable sessions. |
| 11. Permission requirements | A conversation member. Private typing/live topics check accepted membership. Signals are ephemeral and expire; offline shell is not an offline message queue. |
| 12. Dependencies | private Realtime chat/typing channels; GET /rest/v1/chat_messages; schema entities below |
| 13. Error and empty states | Explain offline/reconnecting state; do not claim that closing an offline tab preserves all drafts. |
| 14. Acceptance criteria | CHAT-006-AC1: Pending/removed users cannot subscribe to private topics. CHAT-006-AC2: Reconnect refreshes history and retry does not duplicate a send. |
| 15. Priority | High |
| 16. Related database tables | public.chat_messages; public.chat_room_members |
| 17. API endpoints | private Realtime chat/typing channels; GET /rest/v1/chat_messages |
| 18. Required UI components | typing indicator; status; composer; cleanup handlers |
| 19. Verification references | chat-db.mjs; chat-experience.mjs; navigation-recovery.mjs — see the QA report for outcome and scope. |


### CHAT-007 — Delivery/read receipts and unread indicators

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Record caller-bound delivered/read acknowledgements and show permitted receipt information. |
| 2. Purpose | understand delivery and permitted read state accurately |
| 3. Target user/role | A conversation member |
| 4. User story | As a conversation member, I want to understand delivery and permitted read state accurately. |
| 5. Functional requirements | Record caller-bound delivered/read acknowledgements and show permitted receipt information. Paint unread indicators from message/preferences state and clear the relevant seen marker after reading. |
| 6. User interactions | Open/use message status, unread-dot, receipt settings; supply authorized acknowledgement and receipt preference; receive receipt projection and unread state. |
| 7. Inputs | Authorized acknowledgement and receipt preference |
| 8. Outputs | Receipt projection and unread state |
| 9. Business rules | Delivered does not prove a human read. Read receipts are optional; invitation alone cannot acknowledge private messages. |
| 10. Validation requirements | Validate message/room membership, caller identity and idempotent acknowledgement. |
| 11. Permission requirements | A conversation member. Delivered does not prove a human read. Read receipts are optional; invitation alone cannot acknowledge private messages. |
| 12. Dependencies | POST /rest/v1/rpc/chat_receipts; POST /rest/v1/rpc/chat_controls; schema entities below |
| 13. Error and empty states | Missing Seen is not proof of unread status; acknowledge only while the app can legitimately mark the room seen. |
| 14. Acceptance criteria | CHAT-007-AC1: Receipt rows cannot be forged for another user. CHAT-007-AC2: Reading a recent fixture clears the appropriate chat indicator. |
| 15. Priority | High |
| 16. Related database tables | private.chat_message_receipts; private.chat_preferences; public.chat_messages |
| 17. API endpoints | POST /rest/v1/rpc/chat_receipts; POST /rest/v1/rpc/chat_controls |
| 18. Required UI components | message status; unread-dot; receipt settings |
| 19. Verification references | chat-db.mjs; chat-controls-db.mjs; community-social.mjs; chat-experience.mjs — see the QA report for outcome and scope. |


### CHAT-008 — Inbox folders and conversation controls

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Search/filter conversations and access Messages, Archived and Restricted folders. |
| 2. Purpose | organize conversations and control unwanted requests |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to organize conversations and control unwanted requests. |
| 5. Functional requirements | Search/filter conversations and access Messages, Archived and Restricted folders. Support per-user archive, mute, restriction, local conversation deletion boundary and receipt preference. |
| 6. User interactions | Open/use chatGroupsPage, chat controls sheet, conversation search, swipe actions; supply folder/search/filter and preference action; receive filtered inbox and persisted own settings. |
| 7. Inputs | Folder/search/filter and preference action |
| 8. Outputs | Filtered inbox and persisted own settings |
| 9. Business rules | These are the caller preferences, not global room deletion. New content after a delete boundary follows the defined reappearance rules. |
| 10. Validation requirements | Known action, caller-bound room key and valid accepted/request relationship. |
| 11. Permission requirements | An approved member. These are the caller preferences, not global room deletion. New content after a delete boundary follows the defined reappearance rules. |
| 12. Dependencies | POST /rest/v1/rpc/chat_controls; POST /rest/v1/rpc/chat_groups; schema entities below |
| 13. Error and empty states | Show no matches or unavailable status; optional discovery failure must not prevent the inbox loading. |
| 14. Acceptance criteria | CHAT-008-AC1: One user cannot read/change another user preferences. CHAT-008-AC2: Muted/restricted/archived messages follow badge/filter behavior. |
| 15. Priority | High |
| 16. Related database tables | private.chat_preferences; public.chat_rooms; public.chat_room_members |
| 17. API endpoints | POST /rest/v1/rpc/chat_controls; POST /rest/v1/rpc/chat_groups |
| 18. Required UI components | chatGroupsPage; chat controls sheet; conversation search; swipe actions |
| 19. Verification references | chat-controls-db.mjs; chat-experience.mjs; group-creation.mjs — see the QA report for outcome and scope. |


### CHAT-009 — Conversation abuse reports and moderation

**Classification/status:** Implemented. **Module:** Conversations.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Allow an unwanted request or permitted message to be reported with a reason. |
| 2. Purpose | report unwanted requests and review abuse with bounded access |
| 3. Target user/role | A member or authorized application admin |
| 4. User story | As a member or authorized application admin, I want to report unwanted requests and review abuse with bounded access. |
| 5. Functional requirements | Allow an unwanted request or permitted message to be reported with a reason. Show the admin abuse queue and permitted resolution/moderation actions. |
| 6. User interactions | Open/use Report request, report sheet, adminChatReportsPage; supply report target/reason or admin resolution; receive private report and review state. |
| 7. Inputs | Report target/reason or admin resolution |
| 8. Outputs | Private report and review state |
| 9. Business rules | A report does not grant ordinary members or all app admins unrestricted private-group access. Report evidence and admin projections are intentionally bounded. |
| 10. Validation requirements | Nonempty bounded reason, report type and authorized target; caller identity is server derived. |
| 11. Permission requirements | A member or authorized application admin. A report does not grant ordinary members or all app admins unrestricted private-group access. Report evidence and admin projections are intentionally bounded. |
| 12. Dependencies | POST /rest/v1/rpc/chat_controls; schema entities below |
| 13. Error and empty states | Handle unavailable/duplicate targets and failed submission without pretending the report was delivered. |
| 14. Acceptance criteria | CHAT-009-AC1: Member cannot read another member reports or resolve the admin queue. CHAT-009-AC2: Unauthorized private message read remains denied after a report. |
| 15. Priority | Critical |
| 16. Related database tables | private.chat_spam_reports; public.chat_messages |
| 17. API endpoints | POST /rest/v1/rpc/chat_controls |
| 18. Required UI components | Report request; report sheet; adminChatReportsPage |
| 19. Verification references | chat-controls-db.mjs; chat-experience.mjs — see the QA report for outcome and scope. |


### NOTIF-001 — Notifications and activity

**Classification/status:** Implemented. **Module:** Community.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Open a dismissible notification sheet/page with links and available relationship/invitation actions. |
| 2. Purpose | notice relevant updates and return to their source |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to notice relevant updates and return to their source. |
| 5. Functional requirements | Open a dismissible notification sheet/page with links and available relationship/invitation actions. Use private invalidation and per-device read markers to update badges. |
| 6. User interactions | Open/use bellButton, notification sheet, notificationsPage; supply notification list and user action; receive linked permitted page and updated activity marker. |
| 7. Inputs | Notification list and user action |
| 8. Outputs | Linked permitted page and updated activity marker |
| 9. Business rules | Notifications are permission-filtered account activity, not a completed background-push service. Dismissing a sheet returns to its prior page. |
| 10. Validation requirements | Validate destination and authorization; invalidate stale data on relevant live events. |
| 11. Permission requirements | An approved member. Notifications are permission-filtered account activity, not a completed background-push service. Dismissing a sheet returns to its prior page. |
| 12. Dependencies | POST /rest/v1/rpc/community_activity; private activity Realtime channel; schema entities below |
| 13. Error and empty states | Show no-notifications and failed-load states; an unavailable target does not expose its private content. |
| 14. Acceptance criteria | NOTIF-001-AC1: Member sees only permitted activity. NOTIF-001-AC2: Escape/Close returns focus without unintended navigation. |
| 15. Priority | High |
| 16. Related database tables | public.announcements; public.community_comments; public.community_reactions; public.chat_room_members |
| 17. API endpoints | POST /rest/v1/rpc/community_activity; private activity Realtime channel |
| 18. Required UI components | bellButton; notification sheet; notificationsPage |
| 19. Verification references | community-actions-db.mjs; community-social.mjs; quality.mjs — see the QA report for outcome and scope. |


### SEARCH-001 — Permission-aware global search

**Classification/status:** Implemented. **Module:** Discovery.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Search People, Posts, Events, News, Churches, Chats and Pages with category filters. |
| 2. Purpose | find people, content and app pages from one search |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to find people, content and app pages from one search. |
| 5. Functional requirements | Search People, Posts, Events, News, Churches, Chats and Pages with category filters. Debounce text, report partial source unavailability and cancel stale results after navigation. |
| 6. User interactions | Open/use searchPage, search categories, platform results; supply search text/category; receive grouped permitted links and result/availability count. |
| 7. Inputs | Search text/category |
| 8. Outputs | Grouped permitted links and result/availability count |
| 9. Business rules | Search is not a bypass for private/unconfirmed profiles, blocked content or private-room membership. Resources is not an active search category. |
| 10. Validation requirements | At least two characters, bounded text, escaped wildcard/reserved query characters and bounded per-source results. |
| 11. Permission requirements | An approved member. Search is not a bypass for private/unconfirmed profiles, blocked content or private-room membership. Resources is not an active search category. |
| 12. Dependencies | POST /rest/v1/rpc/member_directory; GET permitted PostgREST content; POST /rest/v1/rpc/chat_groups; schema entities below |
| 13. Error and empty states | Explain short query, no matches and partially failed sources rather than returning a false empty success. |
| 14. Acceptance criteria | SEARCH-001-AC1: A malicious or wildcard query remains literal and cannot widen access. SEARCH-001-AC2: Removed Resources results/routes are absent. |
| 15. Priority | High |
| 16. Related database tables | public.user_profile; public.community_posts; public.events_feed; public.announcements; public.churches; public.chat_rooms |
| 17. API endpoints | POST /rest/v1/rpc/member_directory; GET permitted PostgREST content; POST /rest/v1/rpc/chat_groups |
| 18. Required UI components | searchPage; search categories; platform results |
| 19. Verification references | registration-search.mjs; community-social.mjs; social-privacy-db.mjs — see the QA report for outcome and scope. |


### PRAY-001 — Prayer requests and support

**Classification/status:** Implemented. **Module:** Community.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Create an optionally anonymous request, browse permitted requests and toggle prayer support. |
| 2. Purpose | share a prayer request, offer support and record an answer |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to share a prayer request, offer support and record an answer. |
| 5. Functional requirements | Create an optionally anonymous request, browse permitted requests and toggle prayer support. Let the owner mark answered with a note and authorize owner/admin removal or hiding. |
| 6. User interactions | Open/use prayerPage, request form, support/answered controls; supply request text/anonymity, support or answered action; receive request/support counts and answer state. |
| 7. Inputs | Request text/anonymity, support or answered action |
| 8. Outputs | Request/support counts and answer state |
| 9. Business rules | Anonymous presentation does not remove the trusted server owner. Reporting/support must not expose private account details. |
| 10. Validation requirements | Required bounded title/body, optional bounded answer note and caller-bound request/support actions. |
| 11. Permission requirements | An approved member. Anonymous presentation does not remove the trusted server owner. Reporting/support must not expose private account details. |
| 12. Dependencies | POST /rest/v1/rpc/prayer_list; POST /rest/v1/rpc/prayer_create; POST /rest/v1/rpc/prayer_toggle; POST /rest/v1/rpc/prayer_set_answered; POST /rest/v1/rpc/prayer_delete; POST /rest/v1/rpc/prayer_hide; schema entities below |
| 13. Error and empty states | Provide empty, validation, failed action and hidden/deleted request states. |
| 14. Acceptance criteria | PRAY-001-AC1: Support toggles idempotently for the caller. PRAY-001-AC2: Another member cannot answer/delete the owner request. |
| 15. Priority | High |
| 16. Related database tables | public.prayer_requests; public.prayer_supports |
| 17. API endpoints | POST /rest/v1/rpc/prayer_list; POST /rest/v1/rpc/prayer_create; POST /rest/v1/rpc/prayer_toggle; POST /rest/v1/rpc/prayer_set_answered; POST /rest/v1/rpc/prayer_delete; POST /rest/v1/rpc/prayer_hide |
| 18. Required UI components | prayerPage; request form; support/answered controls |
| 19. Verification references | community-extras-db.mjs; e2e.mjs — see the QA report for outcome and scope. |


### DIR-001 — Church directory

**Classification/status:** Implemented. **Module:** Content.

| Requirement field | Specification |
| --- | --- |
| 1. Description | List/search churches and available region/featured information. |
| 2. Purpose | find published church information |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to find published church information. |
| 5. Functional requirements | List/search churches and available region/featured information. Show permitted contact/location/website details maintained by admins. |
| 6. User interactions | Open/use churchesPage, directory cards, region/search controls; supply search/filter or church identifier; receive matching church cards/details. |
| 7. Inputs | Search/filter or church identifier |
| 8. Outputs | Matching church cards/details |
| 9. Business rules | Directory records are editorial information, not a public member-contact dump. Members cannot create administrative records. |
| 10. Validation requirements | Validate search length and safe external links; apply server read/write permissions. |
| 11. Permission requirements | An approved member. Directory records are editorial information, not a public member-contact dump. Members cannot create administrative records. |
| 12. Dependencies | GET /rest/v1/churches; schema entities below |
| 13. Error and empty states | Show no churches/no matches, unavailable records and safe external-link handling. |
| 14. Acceptance criteria | DIR-001-AC1: Directory works at phone/desktop widths. DIR-001-AC2: Member writes and unsafe links are rejected. |
| 15. Priority | High |
| 16. Related database tables | public.churches |
| 17. API endpoints | GET /rest/v1/churches |
| 18. Required UI components | churchesPage; directory cards; region/search controls |
| 19. Verification references | community-extras-db.mjs; responsive.mjs; e2e.mjs — see the QA report for outcome and scope. |


### MEDIA-001 — Member photo gallery and upload

**Classification/status:** Implemented. **Module:** Media.

| Requirement field | Specification |
| --- | --- |
| 1. Description | List permitted media with short-lived signed URLs and captions; open a native viewer. |
| 2. Purpose | share and view appropriate church photos |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to share and view appropriate church photos. |
| 5. Functional requirements | List permitted media with short-lived signed URLs and captions; open a native viewer. Accept one supported photo up to 5 MB; allow owner/admin deletion after confirmation. |
| 6. User interactions | Open/use mediaPage, upload sheet, media tile, viewer; supply selected photo/caption or item action; receive stored media record/file or permitted viewer. |
| 7. Inputs | Selected photo/caption or item action |
| 8. Outputs | Stored media record/file or permitted viewer |
| 9. Business rules | New uploads are photo-only. Legacy video display does not mean new video upload or calls are enabled. Files stay in caller folders in the private media bucket. |
| 10. Validation requirements | Allowed PNG/JPEG/WebP type, signature/size/budget checks and caption up to 300 characters. |
| 11. Permission requirements | An approved member. New uploads are photo-only. Legacy video display does not mean new video upload or calls are enabled. Files stay in caller folders in the private media bucket. |
| 12. Dependencies | GET/POST/DELETE /rest/v1/media; POST /functions/v1/upload-file; POST /storage/v1/object/sign/media/{path}; schema entities below |
| 13. Error and empty states | Show no photos, missing/expired image and upload failure; remove an orphan upload if record creation fails. |
| 14. Acceptance criteria | MEDIA-001-AC1: Unauthorized member cannot delete another owner file. MEDIA-001-AC2: Invalid upload cannot create a successful media entry. |
| 15. Priority | High |
| 16. Related database tables | public.media; storage.objects |
| 17. API endpoints | GET/POST/DELETE /rest/v1/media; POST /functions/v1/upload-file; POST /storage/v1/object/sign/media/{path} |
| 18. Required UI components | mediaPage; upload sheet; media tile; viewer |
| 19. Verification references | community-extras-db.mjs; security-edge.mjs; e2e.mjs — see the QA report for outcome and scope. |


### MEDIA-002 — Keyboard-accessible media navigation

**Classification/status:** Implemented. **Module:** Media.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Add Previous/Next, an item counter and Left/Right navigation to the existing Media sheet. |
| 2. Purpose | browse adjacent photos without repeatedly reopening the gallery |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to browse adjacent photos without repeatedly reopening the gallery. |
| 5. Functional requirements | Add Previous/Next, an item counter and Left/Right navigation to the existing Media sheet. Preserve captions/dates, wrap safely, stop legacy video on change/close and remove handlers on route exit. |
| 6. User interactions | Open/use media viewer, Previous/Next, live counter; supply current item and previous/next/key action; receive selected permitted item and announced counter. |
| 7. Inputs | Current item and previous/next/key action |
| 8. Outputs | Selected permitted item and announced counter |
| 9. Business rules | Adapt the portfolio MediaDetail interaction using existing fetched/signed items. Do not change permissions, upload formats or database schema. |
| 10. Validation requirements | Ignore navigation keys in editable controls; handle empty/one-item lists and missing signed URLs. |
| 11. Permission requirements | An approved member. Adapt the portfolio MediaDetail interaction using existing fetched/signed items. Do not change permissions, upload formats or database schema. |
| 12. Dependencies | Existing listMedia and signed URLs; no new endpoint; schema entities below |
| 13. Error and empty states | One item has no misleading active navigation; unavailable images show a fallback rather than a raw private path. |
| 14. Acceptance criteria | MEDIA-002-AC1: Two-item fixture moves by button and keyboard and wraps correctly. MEDIA-002-AC2: Close/route change removes listeners and stops playback. |
| 15. Priority | Medium |
| 16. Related database tables | public.media |
| 17. API endpoints | Existing listMedia and signed URLs; no new endpoint |
| 18. Required UI components | media viewer; Previous/Next; live counter |
| 19. Verification references | media-viewer.mjs; quality.mjs — see the QA report for outcome and scope. |


### MEM-001 — Membership and NDC information

**Classification/status:** Implemented. **Module:** Content.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show the member church/renewal information and relevant membership/NDC posts. |
| 2. Purpose | review church membership information and NDC updates |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to review church membership information and ndc updates. |
| 5. Functional requirements | Show the member church/renewal information and relevant membership/NDC posts. Offer the existing contact workflow for renewal inquiries. |
| 6. User interactions | Open/use membershipPage, ndcListPage, membership card; supply own profile and membership/ndc post selection; receive membership card, updates and inquiry link. |
| 7. Inputs | Own profile and membership/NDC post selection |
| 8. Outputs | Membership card, updates and inquiry link |
| 9. Business rules | This is information and inquiry, not completed online membership billing or credential issuance. Members cannot edit official NDC publications. |
| 10. Validation requirements | Authorized profile/post reads, safe IDs and optional renewal dates. |
| 11. Permission requirements | An approved member. This is information and inquiry, not completed online membership billing or credential issuance. Members cannot edit official NDC publications. |
| 12. Dependencies | GET /rest/v1/user_profile; GET /rest/v1/membership_ndc; schema entities below |
| 13. Error and empty states | Handle missing church/renewal details and no current NDC posts without inventing credentials. |
| 14. Acceptance criteria | MEM-001-AC1: Own membership details render without exposing another private profile. MEM-001-AC2: Admin-managed NDC posts remain readable only under normal access rules. |
| 15. Priority | High |
| 16. Related database tables | public.user_profile; public.membership_ndc |
| 17. API endpoints | GET /rest/v1/user_profile; GET /rest/v1/membership_ndc |
| 18. Required UI components | membershipPage; ndcListPage; membership card |
| 19. Verification references | security-db.mjs; quality.mjs; e2e.mjs — see the QA report for outcome and scope. |


### DON-001 — Supplied payment QR and amount selection

**Classification/status:** Implemented. **Module:** Giving.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Choose an active payment method and preset/custom amount, including the ₱10 preset. |
| 2. Purpose | pay an amount they can give using the supplied recipient QR |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to pay an amount they can give using the supplied recipient qr. |
| 5. Functional requirements | Choose an active payment method and preset/custom amount, including the ₱10 preset. Save the original QR bytes, use native file sharing when supported, or open the full-size image for bank/wallet scanning/import. |
| 6. User interactions | Open/use donatePage, amount chips, donationQrActions, payment instructions; supply payment method, amount and save/share action; receive original qr file and payment instructions. |
| 7. Inputs | Payment method, amount and save/share action |
| 8. Outputs | Original QR file and payment instructions |
| 9. Business rules | Payment happens in the bank/e-wallet through the original Surgebox QR. Choosing an amount in PCEC does not alter the QR or prove transfer; the bank recipient/amount must be reviewed. |
| 10. Validation requirements | Positive bounded PHP amount; allowed image type and bounded download size; preserve original payment data. |
| 11. Permission requirements | An approved member. Payment happens in the bank/e-wallet through the original Surgebox QR. Choosing an amount in PCEC does not alter the QR or prove transfer; the bank recipient/amount must be reviewed. |
| 12. Dependencies | GET /rest/v1/donation_center; Signed/public QR URL GET; schema entities below |
| 13. Error and empty states | Explain download/share limitations, provide full-size fallback and retain the tab selection when returning from a wallet. |
| 14. Acceptance criteria | DON-001-AC1: Packaged and uploaded/signed QR downloads preserve original bytes. DON-001-AC2: Reported/confirmed payment state is not inferred from scanning or opening a bank app. |
| 15. Priority | Critical |
| 16. Related database tables | public.donation_center; storage.objects |
| 17. API endpoints | GET /rest/v1/donation_center; Signed/public QR URL GET |
| 18. Required UI components | donatePage; amount chips; donationQrActions; payment instructions |
| 19. Verification references | payment-qr.mjs; manual-donations.mjs; admin-donation-qr.mjs — see the QA report for outcome and scope. |


### DON-002 — Donation report, receipt and own activity

**Classification/status:** Implemented. **Module:** Giving.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Collect actual paid amount, method, bank/e-wallet reference, paid date and optional note/private receipt. |
| 2. Purpose | record a completed transfer without losing its evidence |
| 3. Target user/role | An approved donor |
| 4. User story | As an approved donor, I want to record a completed transfer without losing its evidence. |
| 5. Functional requirements | Collect actual paid amount, method, bank/e-wallet reference, paid date and optional note/private receipt. After successful submission open personal activity with reported and confirmed figures kept separate. |
| 6. User interactions | Open/use openDonationReport, donationActivityPage, private receipt controls; supply transfer report and optional receipt; receive private submitted report and own activity. |
| 7. Inputs | Transfer report and optional receipt |
| 8. Outputs | Private submitted report and own activity |
| 9. Business rules | The server binds donor identity. A transaction/reference number is self-reported evidence, not independent payment verification. Only a confirmed report links to the ledger. |
| 10. Validation requirements | Validate amount/reference/date/method and receipt ownership/type/size; normalize duplicate reference checks server-side. |
| 11. Permission requirements | An approved donor. The server binds donor identity. A transaction/reference number is self-reported evidence, not independent payment verification. Only a confirmed report links to the ledger. |
| 12. Dependencies | POST /rest/v1/rpc/submit_donation_report; POST /rest/v1/rpc/donation_report_page; POST /functions/v1/upload-file; schema entities below |
| 13. Error and empty states | Show failed/duplicate submissions without false success; failed receipt/report must not expose another donor files. |
| 14. Acceptance criteria | DON-002-AC1: A donor cannot impersonate or read another donor. DON-002-AC2: Submitting a report does not increase confirmed totals. |
| 15. Priority | Critical |
| 16. Related database tables | private.donation_reports; public.donation_center; storage.objects |
| 17. API endpoints | POST /rest/v1/rpc/submit_donation_report; POST /rest/v1/rpc/donation_report_page; POST /functions/v1/upload-file |
| 18. Required UI components | openDonationReport; donationActivityPage; private receipt controls |
| 19. Verification references | manual-donations-db.mjs; manual-donations.mjs; donation-analytics.mjs — see the QA report for outcome and scope. |


### DON-003 — Finance review and confirmed donation ledger

**Classification/status:** Implemented. **Module:** Giving.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Review reported amount/reference/receipt against bank/provider records and confirm or reject with a note. |
| 2. Purpose | reconcile reports to actual payment records |
| 3. Target user/role | An authorized application admin performing Finance duties |
| 4. User story | As an authorized application admin performing finance duties, I want to reconcile reports to actual payment records. |
| 5. Functional requirements | Review reported amount/reference/receipt against bank/provider records and confirm or reject with a note. Atomically write/link the confirmed transaction so repeats cannot double count. |
| 6. User interactions | Open/use adminDonationReportsPage, review sheet, receipt viewer; supply report id, verified decision and reconciliation details; receive reviewed report and at most one confirmed ledger entry. |
| 7. Inputs | Report ID, verified decision and reconciliation details |
| 8. Outputs | Reviewed report and at most one confirmed ledger entry |
| 9. Business rules | Finance is an operational duty under the current admin role, not a separately implemented database role. No Surgebox API or automatic TN confirmation exists. |
| 10. Validation requirements | Admin authorization, current report state, evidence, matching amount/date and duplicate transaction protection. |
| 11. Permission requirements | An authorized application admin performing Finance duties. Finance is an operational duty under the current admin role, not a separately implemented database role. No Surgebox API or automatic TN confirmation exists. |
| 12. Dependencies | POST /rest/v1/rpc/review_donation_report; POST /rest/v1/rpc/donation_report_page; schema entities below |
| 13. Error and empty states | Concurrent/stale/duplicate review must not create duplicate gifts; explain mismatches rather than silently rewriting evidence. |
| 14. Acceptance criteria | DON-003-AC1: Member review and forged reviewer identity are denied. DON-003-AC2: Repeated/concurrent confirmation cannot add the same gift twice. |
| 15. Priority | Critical |
| 16. Related database tables | private.donation_reports; private.donation_transactions |
| 17. API endpoints | POST /rest/v1/rpc/review_donation_report; POST /rest/v1/rpc/donation_report_page |
| 18. Required UI components | adminDonationReportsPage; review sheet; receipt viewer |
| 19. Verification references | manual-donations-db.mjs; manual-donations.mjs — see the QA report for outcome and scope. |


### DON-004 — Donation analytics and export

**Classification/status:** Implemented. **Module:** Giving.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show range/campaign-filtered confirmed totals, trends, campaign summary and paged transactions. |
| 2. Purpose | understand confirmed giving using bounded filters and reports |
| 3. Target user/role | An authorized application admin |
| 4. User story | As an authorized application admin, I want to understand confirmed giving using bounded filters and reports. |
| 5. Functional requirements | Show range/campaign-filtered confirmed totals, trends, campaign summary and paged transactions. Export the permitted filtered view while keeping reported figures clearly separate. |
| 6. User interactions | Open/use adminDonationAnalyticsPage, metrics, trend, campaign table, CSV export; supply date/campaign/status filters and page/export action; receive permitted aggregate charts and transaction/export data. |
| 7. Inputs | Date/campaign/status filters and page/export action |
| 8. Outputs | Permitted aggregate charts and transaction/export data |
| 9. Business rules | Count confirmed ledger data according to status/refund rules. Raw references, receipts and donor details are not public/community statistics. |
| 10. Validation requirements | Validate date range, campaign/status and cursor; use integer minor currency units and bounded page sizes. |
| 11. Permission requirements | An authorized application admin. Count confirmed ledger data according to status/refund rules. Raw references, receipts and donor details are not public/community statistics. |
| 12. Dependencies | POST /rest/v1/rpc/donation_analytics; POST /rest/v1/rpc/donation_transaction_page; schema entities below |
| 13. Error and empty states | Handle empty ranges, invalid dates and failed analytics without stale totals presented as current. |
| 14. Acceptance criteria | DON-004-AC1: Anonymous/member access is denied. DON-004-AC2: Known fixture totals match confirmed/refunded transaction semantics and filter boundaries. |
| 15. Priority | Critical |
| 16. Related database tables | private.donation_transactions; private.donation_sources |
| 17. API endpoints | POST /rest/v1/rpc/donation_analytics; POST /rest/v1/rpc/donation_transaction_page |
| 18. Required UI components | adminDonationAnalyticsPage; metrics; trend; campaign table; CSV export |
| 19. Verification references | donation-analytics-db.mjs; donation-analytics.mjs — see the QA report for outcome and scope. |


### ADMIN-001 — Admin dashboard and member management

**Classification/status:** Implemented. **Module:** Administration.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show current admin navigation and scoped summary counts. |
| 2. Purpose | review membership and reach administration tasks |
| 3. Target user/role | An authorized application admin |
| 4. User story | As an authorized application admin, I want to review membership and reach administration tasks. |
| 5. Functional requirements | Show current admin navigation and scoped summary counts. Search/page new/all/unconfirmed/suspended members, mark reviewed, suspend and restore under existing rules. |
| 6. User interactions | Open/use adminDashboardPage, adminMembersPage, filters, member cards; supply filter/search/cursor and permitted member action; receive member projection and updated review/status. |
| 7. Inputs | Filter/search/cursor and permitted member action |
| 8. Outputs | Member projection and updated review/status |
| 9. Business rules | The UI does not bypass email confirmation or offer member self-promotion. App roles are separate from Supabase/Vercel/DNS infrastructure access. |
| 10. Validation requirements | Bound/escape member search and keyset cursor; trusted admin session and allowed account transitions. |
| 11. Permission requirements | An authorized application admin. The UI does not bypass email confirmation or offer member self-promotion. App roles are separate from Supabase/Vercel/DNS infrastructure access. |
| 12. Dependencies | GET /rest/v1/member_list; PATCH /rest/v1/user_profile; schema entities below |
| 13. Error and empty states | Handle no matching members, invalid cursor and permission loss; a failed mutation must not claim the member changed. |
| 14. Acceptance criteria | ADMIN-001-AC1: Members cannot invoke admin member actions. ADMIN-001-AC2: Paging/search returns stable records without private-field expansion. |
| 15. Priority | Critical |
| 16. Related database tables | public.user_profile; public.member_list |
| 17. API endpoints | GET /rest/v1/member_list; PATCH /rest/v1/user_profile |
| 18. Required UI components | adminDashboardPage; adminMembersPage; filters; member cards |
| 19. Verification references | security-db.mjs; member-pagination.mjs; responsive.mjs; e2e.mjs — see the QA report for outcome and scope. |


### ADMIN-002 — Official content and church management

**Classification/status:** Implemented. **Module:** Administration.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Create/edit/delete announcements, events, NDC posts and church records; update About/office details. |
| 2. Purpose | maintain accurate official content and office information |
| 3. Target user/role | An authorized application admin |
| 4. User story | As an authorized application admin, I want to maintain accurate official content and office information. |
| 5. Functional requirements | Create/edit/delete announcements, events, NDC posts and church records; update About/office details. Use current forms, optional image crop and protected uploads; expose event image-fit choice where supported. |
| 6. User interactions | Open/use admin content forms, imageField, cropImage, adminAboutPage, adminChurchesPage; supply validated content form or confirmed record action; receive persisted authorized content and list/detail refresh. |
| 7. Inputs | Validated content form or confirmed record action |
| 8. Outputs | Persisted authorized content and list/detail refresh |
| 9. Business rules | Destructive actions require an explicit confirmation and server permissions. Editing content must not alter unrelated events/NDC data or create fake member accounts. |
| 10. Validation requirements | Required/bounded content fields, valid event dates/end order, allowed image signatures and safe website links. |
| 11. Permission requirements | An authorized application admin. Destructive actions require an explicit confirmation and server permissions. Editing content must not alter unrelated events/NDC data or create fake member accounts. |
| 12. Dependencies | Authorized POST/PATCH/DELETE /rest/v1/{content-table}; POST /functions/v1/upload-file; schema entities below |
| 13. Error and empty states | Handle not-found, validation, crop cancellation, upload/save failure and lost admin access. |
| 14. Acceptance criteria | ADMIN-002-AC1: Unauthorized writes fail even with direct API calls. ADMIN-002-AC2: Cancelled image editing preserves the prior draft; saved data appears in the correct module. |
| 15. Priority | High |
| 16. Related database tables | public.announcements; public.events_feed; public.membership_ndc; public.churches; public.about_pcec |
| 17. API endpoints | Authorized POST/PATCH/DELETE /rest/v1/{content-table}; POST /functions/v1/upload-file |
| 18. Required UI components | admin content forms; imageField; cropImage; adminAboutPage; adminChurchesPage |
| 19. Verification references | security-db.mjs; community-extras-db.mjs; feed-header.mjs; e2e.mjs — see the QA report for outcome and scope. |


### ADMIN-003 — Payment options and lossless QR editor

**Classification/status:** Implemented. **Module:** Administration.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Manage payment labels/details/active state/order and choose an uploaded poster/QR. |
| 2. Purpose | publish a usable supplied payment QR without changing its recipient data |
| 3. Target user/role | An authorized application admin |
| 4. User story | As an authorized application admin, I want to publish a usable supplied payment qr without changing its recipient data. |
| 5. Functional requirements | Manage payment labels/details/active state/order and choose an uploaded poster/QR. Extract, resize/position and save a square lossless image only when the decoded QR payload and quiet border remain valid. |
| 6. User interactions | Open/use adminDonationsPage, donationQrField, cropImage; supply payment option form and supplied image/crop; receive configured method and verified square qr image. |
| 7. Inputs | Payment option form and supplied image/crop |
| 8. Outputs | Configured method and verified square QR image |
| 9. Business rules | Choosing/cropping is local until Save. Do not invent provider verification or upload an altered recipient payload. Cancel preserves the previous draft. |
| 10. Validation requirements | Supported image and size; readable QR; exact raw/binary payload equality; complete code and white quiet border. |
| 11. Permission requirements | An authorized application admin. Choosing/cropping is local until Save. Do not invent provider verification or upload an altered recipient payload. Cancel preserves the previous draft. |
| 12. Dependencies | Authorized POST/PATCH /rest/v1/donation_center; POST /functions/v1/upload-file; schema entities below |
| 13. Error and empty states | Explain unreadable/clipped/oversized image; keep the editor open on invalid output and do not upload before saving. |
| 14. Acceptance criteria | ADMIN-003-AC1: Clipped QR or missing quiet border cannot be accepted. ADMIN-003-AC2: Saved PNG decodes to identical payment bytes and cancellation causes no upload. |
| 15. Priority | Critical |
| 16. Related database tables | public.donation_center; storage.objects |
| 17. API endpoints | Authorized POST/PATCH /rest/v1/donation_center; POST /functions/v1/upload-file |
| 18. Required UI components | adminDonationsPage; donationQrField; cropImage |
| 19. Verification references | admin-donation-qr.mjs; payment-qr.mjs; security-edge.mjs — see the QA report for outcome and scope. |


### ADMIN-004 — Moderation and inquiry inbox

**Classification/status:** Implemented. **Module:** Administration.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Review community reports/hide permitted content and resolve bounded chat abuse reports. |
| 2. Purpose | review community concerns and member inquiries |
| 3. Target user/role | An authorized application admin |
| 4. User story | As an authorized application admin, I want to review community concerns and member inquiries. |
| 5. Functional requirements | Review community reports/hide permitted content and resolve bounded chat abuse reports. Read incoming inquiries, mark read and perform permitted inbox management. |
| 6. User interactions | Open/use adminCommunityPage, adminChatReportsPage, adminInboxPage; supply queue/filter and review/read action; receive updated moderation/inquiry state. |
| 7. Inputs | Queue/filter and review/read action |
| 8. Outputs | Updated moderation/inquiry state |
| 9. Business rules | Moderation authority is server scoped. Inquiry receipt means stored in the app; automatic outbound email delivery is not implied. |
| 10. Validation requirements | Known target/action and admin role; preserve report ownership/audit fields and sanitize displayed text. |
| 11. Permission requirements | An authorized application admin. Moderation authority is server scoped. Inquiry receipt means stored in the app; automatic outbound email delivery is not implied. |
| 12. Dependencies | Authorized GET/PATCH /rest/v1/contact_us; Authorized community moderation; POST /rest/v1/rpc/chat_controls; schema entities below |
| 13. Error and empty states | Show empty queues, unavailable evidence and permission loss; do not publish private reports into the member feed. |
| 14. Acceptance criteria | ADMIN-004-AC1: Member cannot read the admin inbox or resolve reports. ADMIN-004-AC2: Allowed review/read actions persist only on their target. |
| 15. Priority | Critical |
| 16. Related database tables | public.community_reports; private.chat_spam_reports; public.contact_us; public.community_posts |
| 17. API endpoints | Authorized GET/PATCH /rest/v1/contact_us; Authorized community moderation; POST /rest/v1/rpc/chat_controls |
| 18. Required UI components | adminCommunityPage; adminChatReportsPage; adminInboxPage |
| 19. Verification references | security-db.mjs; chat-controls-db.mjs; e2e.mjs — see the QA report for outcome and scope. |


### HELP-001 — Help, office contact and feedback

**Classification/status:** Implemented. **Module:** Support.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Show maintained office contact information and accept a subject/message inquiry. |
| 2. Purpose | send an account or ministry inquiry through the app |
| 3. Target user/role | An approved member |
| 4. User story | As an approved member, I want to send an account or ministry inquiry through the app. |
| 5. Functional requirements | Show maintained office contact information and accept a subject/message inquiry. Bind sender identity to the signed-in account and show success only after persistence. |
| 6. User interactions | Open/use contactPage, inquiry form, office details; supply subject and inquiry text; receive stored inquiry and receipt feedback. |
| 7. Inputs | Subject and inquiry text |
| 8. Outputs | Stored inquiry and receipt feedback |
| 9. Business rules | This app uses its existing inquiry table, not the portfolio Formspree destination. Members cannot read other members private inquiries. |
| 10. Validation requirements | Required bounded message, safe subject handling and authenticated caller identity. |
| 11. Permission requirements | An approved member. This app uses its existing inquiry table, not the portfolio Formspree destination. Members cannot read other members private inquiries. |
| 12. Dependencies | POST /rest/v1/contact_us; GET /rest/v1/about_pcec; schema entities below |
| 13. Error and empty states | Show required-field, network and failed-submit feedback; do not claim the office received email merely because an inquiry is stored. |
| 14. Acceptance criteria | HELP-001-AC1: Saved inquiry contains the intended subject/body and caller ID. HELP-001-AC2: Forged sender or other-user inbox reads are denied. |
| 15. Priority | High |
| 16. Related database tables | public.contact_us; public.about_pcec |
| 17. API endpoints | POST /rest/v1/contact_us; GET /rest/v1/about_pcec |
| 18. Required UI components | contactPage; inquiry form; office details |
| 19. Verification references | security-db.mjs; quality.mjs; e2e.mjs — see the QA report for outcome and scope. |


### SYS-001 — Theme and readable responsive interface

**Classification/status:** Implemented. **Module:** Experience.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Provide light/dark/system preferences, bundled fonts/icons, semantic forms and visible focus. |
| 2. Purpose | use readable controls on the available device |
| 3. Target user/role | A visitor or member |
| 4. User story | As a visitor or member, I want to use readable controls on the available device. |
| 5. Functional requirements | Provide light/dark/system preferences, bundled fonts/icons, semantic forms and visible focus. Use mobile Menu/bottom tabs and desktop navigation without horizontal overflow; auth cards follow the supplied light design. |
| 6. User interactions | Open/use theme.ts, styles.css, theme.css, auth.css, shared controls; supply theme/system preference and viewport; receive readable responsive layout. |
| 7. Inputs | Theme/system preference and viewport |
| 8. Outputs | Readable responsive layout |
| 9. Business rules | Theme preference does not change authorization. Essential tasks must not depend on hover, animation, sound or precise gestures. |
| 10. Validation requirements | Readable editable text, labelled inputs, adequate targets, safe-area spacing and reduced-motion behavior. |
| 11. Permission requirements | A visitor or member. Theme preference does not change authorization. Essential tasks must not depend on hover, animation, sound or precise gestures. |
| 12. Dependencies | No new backend endpoint ; versioned static/frontend assets |
| 13. Error and empty states | Unsupported decorative effects fall back to usable surfaces; missing fonts/icons must not block actions. |
| 14. Acceptance criteria | SYS-001-AC1: 320px through desktop and landscape flows have reachable actions. SYS-001-AC2: Automated accessibility scans have no unresolved violations in covered screens. |
| 15. Priority | High |
| 16. Related database tables | No new application table |
| 17. API endpoints | No new backend endpoint |
| 18. Required UI components | theme.ts; styles.css; theme.css; auth.css; shared controls |
| 19. Verification references | quality.mjs; responsive.mjs; feed-header.mjs — see the QA report for outcome and scope. |


### SYS-002 — Installable PWA and offline shell

**Classification/status:** Implemented. **Module:** Experience.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Provide install help, app-link QR and supported home-screen installation. |
| 2. Purpose | open the app conveniently on a supported phone |
| 3. Target user/role | A visitor or member |
| 4. User story | As a visitor or member, I want to open the app conveniently on a supported phone. |
| 5. Functional requirements | Provide install help, app-link QR and supported home-screen installation. Cache interface assets for offline opening while keeping member API data out of general asset caches. |
| 6. User interactions | Open/use installPage, qrMatrix, service worker; supply install action or offline navigation; receive install guidance/home-screen entry or cached interface. |
| 7. Inputs | Install action or offline navigation |
| 8. Outputs | Install guidance/home-screen entry or cached interface |
| 9. Business rules | Offline opening is not offline submission, background sync, universal draft persistence or a native app-store release. Browser installation behavior varies. |
| 10. Validation requirements | Valid manifest/icons and independently decodable install QR; same-origin safe cache scope. |
| 11. Permission requirements | A visitor or member. Offline opening is not offline submission, background sync, universal draft persistence or a native app-store release. Browser installation behavior varies. |
| 12. Dependencies | Static manifest/service worker/install assets ; versioned static/frontend assets |
| 13. Error and empty states | Explain offline limitations and unavailable install prompts; signed-in access remains governed by the existing session rules. |
| 14. Acceptance criteria | SYS-002-AC1: Shell opens after losing connectivity. SYS-002-AC2: Supabase requests and private receipts are not precached as public assets. |
| 15. Priority | High |
| 16. Related database tables | No new application table |
| 17. API endpoints | Static manifest/service worker/install assets |
| 18. Required UI components | installPage; qrMatrix; service worker |
| 19. Verification references | qr.mjs; offline-shell.mjs; e2e.mjs — see the QA report for outcome and scope. |


### SYS-003 — Controlled updates and navigation recovery

**Classification/status:** Implemented. **Module:** Experience.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Publish exact build/release metadata and offer the current update dialog. |
| 2. Purpose | apply a new version without unexpected draft loss |
| 3. Target user/role | A visitor or member |
| 4. User story | As a visitor or member, I want to apply a new version without unexpected draft loss. |
| 5. Functional requirements | Publish exact build/release metadata and offer the current update dialog. Activate the new worker after the chosen update action and recover failed/stale route loads with a retry path. |
| 6. User interactions | Open/use update-bootstrap, pwa.ts, router error recovery; supply build metadata, waiting worker or navigation failure; receive update prompt, correct new shell or safe recovery. |
| 7. Inputs | Build metadata, waiting worker or navigation failure |
| 8. Outputs | Update prompt, correct new shell or safe recovery |
| 9. Business rules | Do not silently reload a tab with unfinished work. A changed service-worker comment alone is not a new product release. |
| 10. Validation requirements | Validate metadata/assets, identify the active release and clean stale caches on activation. |
| 11. Permission requirements | A visitor or member. Do not silently reload a tab with unfinished work. A changed service-worker comment alone is not a new product release. |
| 12. Dependencies | GET /version.json; GET /sw.js; Versioned static assets ; versioned static/frontend assets |
| 13. Error and empty states | Handle missing metadata, late registration, failed asset fetch and interrupted navigation without infinite loops. |
| 14. Acceptance criteria | SYS-003-AC1: Update preserves other tabs pending work according to current lifecycle tests. SYS-003-AC2: Failed metadata/asset fetch does not activate a broken shell. |
| 15. Priority | Critical |
| 16. Related database tables | No new application table |
| 17. API endpoints | GET /version.json; GET /sw.js; Versioned static assets |
| 18. Required UI components | update-bootstrap; pwa.ts; router error recovery |
| 19. Verification references | app-updates.mjs; navigation-recovery.mjs; release-check.mjs — see the QA report for outcome and scope. |


### SYS-004 — Request, file and service safeguards

**Classification/status:** Implemented. **Module:** Platform.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Use bounded requests/timeouts/retries and server rate/upload budgets. |
| 2. Purpose | operate within permission, file and service limits |
| 3. Target user/role | An authorized caller or maintainer |
| 4. User story | As an authorized caller or maintainer, I want to operate within permission, file and service limits. |
| 5. Functional requirements | Use bounded requests/timeouts/retries and server rate/upload budgets. Validate upload bytes/type/size/folder, sign private file access and minimize audit/monitoring payloads. |
| 6. User interactions | Open/use request-policy.ts, images.ts, Edge Functions, monitoring tools; supply authorized api/upload request or minimal audit event; receive permitted result, signed url or bounded rejection. |
| 7. Inputs | Authorized API/upload request or minimal audit event |
| 8. Outputs | Permitted result, signed URL or bounded rejection |
| 9. Business rules | Browser clients receive publishable keys only. Secret/service keys remain server-side; no monitoring payload should forward member text, payment evidence or credentials. |
| 10. Validation requirements | Caller identity, allowed origin/method, table/bucket role, content signature and bounded payload size. |
| 11. Permission requirements | An authorized caller or maintainer. Browser clients receive publishable keys only. Secret/service keys remain server-side; no monitoring payload should forward member text, payment evidence or credentials. |
| 12. Dependencies | POST /functions/v1/upload-file; Guarded internal quota/audit RPCs; Supabase REST/Auth/Storage; schema entities below |
| 13. Error and empty states | Return safe rate/size/permission/service errors; respect Retry-After and avoid endless retry or cost amplification. |
| 14. Acceptance criteria | SYS-004-AC1: Cross-user/anonymous uploads and role escalation fail. SYS-004-AC2: Local traffic tests honor request budgets; production capacity is not inferred from fixture throughput. |
| 15. Priority | Critical |
| 16. Related database tables | private.request_limits; private.cost_usage; private.cost_alerts; private.discord_audit_outbox; storage.objects |
| 17. API endpoints | POST /functions/v1/upload-file; Guarded internal quota/audit RPCs; Supabase REST/Auth/Storage |
| 18. Required UI components | request-policy.ts; images.ts; Edge Functions; monitoring tools |
| 19. Verification references | api-policy.mjs; security-edge.mjs; security-db.mjs; security-web.mjs; load.mjs; discord-audit.mjs — see the QA report for outcome and scope. |


### DOC-001 — Public app guides and advertising boundary

**Classification/status:** Implemented. **Module:** Documentation.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Serve the overview, registration, installation and community/chat guides without login or JavaScript. |
| 2. Purpose | understand the app without opening private member content |
| 3. Target user/role | A visitor |
| 4. User story | As a visitor, I want to understand the app without opening private member content. |
| 5. Functional requirements | Serve the overview, registration, installation and community/chat guides without login or JavaScript. Provide separate About/Public guides links on login and App guides in Menu. |
| 6. User interactions | Open/use public guides, guide index, privacy notice; supply guide link; receive public static article and related guidance. |
| 7. Inputs | Guide link |
| 8. Outputs | Public static article and related guidance |
| 9. Business rules | Ads remain disabled pending approval/consent. Disabled builds contain no ad units/loader; login, chat, profile, giving/admin are outside the ad integration. |
| 10. Validation requirements | Safe static links, readable text and fail-closed activation/CMP checks; do not send account data to an ad service. |
| 11. Permission requirements | A visitor. Ads remain disabled pending approval/consent. Disabled builds contain no ad units/loader; login, chat, profile, giving/admin are outside the ad integration. |
| 12. Dependencies | Static /guides/*.html; GET /ads-config.json only for eligible activated integration ; versioned static/frontend assets |
| 13. Error and empty states | Guides remain readable offline/network-independent where cached; an unavailable ad must not leave a blocking banner. |
| 14. Acceptance criteria | DOC-001-AC1: Static articles read without JavaScript or account access. DOC-001-AC2: Disabled and private-route cases make no Google advertising requests. |
| 15. Priority | High |
| 16. Related database tables | No new application table |
| 17. API endpoints | Static /guides/*.html; GET /ads-config.json only for eligible activated integration |
| 18. Required UI components | public guides; guide index; privacy notice |
| 19. Verification references | adsense.mjs; private-paths.mjs — see the QA report for outcome and scope. |


### DOC-002 — Requirements library and public feature inventory

**Classification/status:** Implemented. **Module:** Documentation.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Publish the six core documents plus audit, QA and portfolio mapping with Markdown downloads and diagrams. |
| 2. Purpose | find current requirements and evidence from one place |
| 3. Target user/role | A maintainer or project reviewer |
| 4. User story | As a maintainer or project reviewer, I want to find current requirements and evidence from one place. |
| 5. Functional requirements | Publish the six core documents plus audit, QA and portfolio mapping with Markdown downloads and diagrams. Add a searchable/filterable feature index, implementation status and actual interface screenshot gallery to the update site. |
| 6. User interactions | Open/use documentation hub, feature filters, document pages, screenshot gallery; supply document/feature query or status filter; receive relevant requirements, evidence and downloads. |
| 7. Inputs | Document/feature query or status filter |
| 8. Outputs | Relevant requirements, evidence and downloads |
| 9. Business rules | The report is separate from member data. Historical audit scores retain their dates; planned/unverified integrations must not be labelled complete. |
| 10. Validation requirements | Valid document/feature links, no private logs/keys/records, honest screenshot provenance and accessible no-JavaScript reading. |
| 11. Permission requirements | A maintainer or project reviewer. The report is separate from member data. Historical audit scores retain their dates; planned/unverified integrations must not be labelled complete. |
| 12. Dependencies | Separate static update site; no member API requests ; versioned static/frontend assets |
| 13. Error and empty states | Offer clear no-match/clear-filter states; full documents remain available if filtering scripts fail. |
| 14. Acceptance criteria | DOC-002-AC1: All PRD feature IDs appear in the index and every download resolves. DOC-002-AC2: No production member data or private files enter public output. |
| 15. Priority | High |
| 16. Related database tables | No new application table |
| 17. API endpoints | Separate static update site; no member API requests |
| 18. Required UI components | documentation hub; feature filters; document pages; screenshot gallery |
| 19. Verification references | Reporting-site layout/link/privacy checks — see the QA report for outcome and scope. |


### PORT-001 — Complete PCEC portfolio case study

**Classification/status:** Implemented. **Module:** Documentation.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Expand the PCEC project entry with the current feature groups, real stack, challenge/approach and verification scope. |
| 2. Purpose | understand the actual app features and engineering work |
| 3. Target user/role | A portfolio visitor |
| 4. User story | As a portfolio visitor, I want to understand the actual app features and engineering work. |
| 5. Functional requirements | Expand the PCEC project entry with the current feature groups, real stack, challenge/approach and verification scope. Add actual interface captures and links to the live app and documentation. |
| 6. User interactions | Open/use ProjectDetail, gallery tabs, feature list, project links; supply pcec project entry/gallery selection; receive complete feature case study and screenshots. |
| 7. Inputs | PCEC project entry/gallery selection |
| 8. Outputs | Complete feature case study and screenshots |
| 9. Business rules | Keep testing-release/launch limitations visible. An isolated sample screenshot is not evidence of real member activity; do not publish private profiles, receipts or chats. |
| 10. Validation requirements | Existing portfolio component contracts, valid public links, captioned assets and no unrelated project changes. |
| 11. Permission requirements | A portfolio visitor. Keep testing-release/launch limitations visible. An isolated sample screenshot is not evidence of real member activity; do not publish private profiles, receipts or chats. |
| 12. Dependencies | Portfolio static assets and projectCatalog data ; versioned static/frontend assets |
| 13. Error and empty states | Gallery has a readable fallback/caption and accessible controls; missing assets fail checks before publication. |
| 14. Acceptance criteria | PORT-001-AC1: Portfolio index opens the expanded PCEC entry and cycles through actual captures. PORT-001-AC2: Every implemented feature group is represented without listing future work as shipped. |
| 15. Priority | High |
| 16. Related database tables | No new application table |
| 17. API endpoints | Portfolio static assets and projectCatalog data |
| 18. Required UI components | ProjectDetail; gallery tabs; feature list; project links |
| 19. Verification references | Portfolio check-projects and browser checks — see the QA report for outcome and scope. |


### FUT-001 — Administrator MFA and recovery enforcement

**Classification/status:** Planned / owner acceptance required. **Module:** Future.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Plan managed-Auth second-factor enrollment/recovery and server assurance checks for privileged actions. |
| 2. Purpose | protect privileged app actions with an accepted second factor |
| 3. Target user/role | An administrator and infrastructure owner |
| 4. User story | As an administrator and infrastructure owner, I want to protect privileged app actions with an accepted second factor. |
| 5. Functional requirements | Plan managed-Auth second-factor enrollment/recovery and server assurance checks for privileged actions. Accept with named account owners before enforcing it on production admins. |
| 6. User interactions | Open/use Future MFA enrollment/challenge/recovery; supply owner-approved mfa enrollment and recovery process; receive enforced privileged-session assurance. |
| 7. Inputs | Owner-approved MFA enrollment and recovery process |
| 8. Outputs | Enforced privileged-session assurance |
| 9. Business rules | Dashboard MFA is not app MFA. Never invent enrolled factors or silently lock out existing admins; enrollment credentials require the account owner. |
| 10. Validation requirements | Verified factor, fresh session/assurance and tested recovery policy. |
| 11. Permission requirements | An administrator and infrastructure owner. Dashboard MFA is not app MFA. Never invent enrolled factors or silently lock out existing admins; enrollment credentials require the account owner. |
| 12. Dependencies | Managed Auth MFA API and future assurance-aware admin contract; schema entities below |
| 13. Error and empty states | Handle missing factor, stale assurance and recovery without a permanent administrative lockout. |
| 14. Acceptance criteria | FUT-001-AC1: Privileged APIs reject insufficient assurance in a staging acceptance test. FUT-001-AC2: A documented owner recovery drill succeeds. |
| 15. Priority | Critical |
| 16. Related database tables | Managed Auth factor/session metadata |
| 17. API endpoints | Managed Auth MFA API and future assurance-aware admin contract |
| 18. Required UI components | Future MFA enrollment/challenge/recovery |
| 19. Verification references | Not run: owner enrollment and server enforcement absent — see the QA report for outcome and scope. |


### FUT-002 — Backup and isolated restore acceptance

**Classification/status:** Planned / external operations gate. **Module:** Future.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Define encrypted database backup plus separate Storage-object backup, retention, custodian and access. |
| 2. Purpose | recover the database and uploaded files after an incident |
| 3. Target user/role | A maintainer and data owner |
| 4. User story | As a maintainer and data owner, I want to recover the database and uploaded files after an incident. |
| 5. Functional requirements | Define encrypted database backup plus separate Storage-object backup, retention, custodian and access. Perform an isolated restore and verify account/content/file integrity without replacing production. |
| 6. User interactions | Open/use Maintainer runbook and recovery evidence; supply approved backup policy and isolated restoration run; receive evidence of recoverable records/files and recovery procedure. |
| 7. Inputs | Approved backup policy and isolated restoration run |
| 8. Outputs | Evidence of recoverable records/files and recovery procedure |
| 9. Business rules | Do not treat a database snapshot as a file-object backup or publish backup credentials. Production restore requires a separate explicit decision. |
| 10. Validation requirements | Verify backup completeness, restore compatibility, integrity checks and restricted decryption access. |
| 11. Permission requirements | A maintainer and data owner. Do not treat a database snapshot as a file-object backup or publish backup credentials. Production restore requires a separate explicit decision. |
| 12. Dependencies | Infrastructure backup/Storage tooling; no new member endpoint; schema entities below |
| 13. Error and empty states | Alert on missing/failed backups and stop an invalid restore before production is affected. |
| 14. Acceptance criteria | FUT-002-AC1: An isolated restored dataset passes integrity and access checks. FUT-002-AC2: A representative uploaded file is retrievable after restoration. |
| 15. Priority | Critical |
| 16. Related database tables | All application tables and Storage objects |
| 17. API endpoints | Infrastructure backup/Storage tooling; no new member endpoint |
| 18. Required UI components | Maintainer runbook and recovery evidence |
| 19. Verification references | Not run: complete database-plus-file restore not supplied — see the QA report for outcome and scope. |


### FUT-003 — Verified provider payment integration

**Classification/status:** Blocked by unavailable provider contract. **Module:** Future.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Obtain the actual Surgebox/API or signed notification contract before building an adapter. |
| 2. Purpose | confirm transfers only from trustworthy provider evidence |
| 3. Target user/role | Finance and the payment-provider owner |
| 4. User story | As finance and the payment-provider owner, I want to confirm transfers only from trustworthy provider evidence. |
| 5. Functional requirements | Obtain the actual Surgebox/API or signed notification contract before building an adapter. Validate provider identity, amount/currency/status, signature, idempotency and refunds in a controlled integration. |
| 6. User interactions | Open/use Future Finance integration status; supply documented provider event/query and authenticated service; receive verified ledger status without duplicate gifts. |
| 7. Inputs | Documented provider event/query and authenticated service |
| 8. Outputs | Verified ledger status without duplicate gifts |
| 9. Business rules | Static QR scanning and a typed TN are not verification. Current manual reconciliation remains in service until the replacement is accepted. |
| 10. Validation requirements | Provider credentials/signature, event identity, transaction uniqueness, amount/currency and replay protection. |
| 11. Permission requirements | Finance and the payment-provider owner. Static QR scanning and a typed TN are not verification. Current manual reconciliation remains in service until the replacement is accepted. |
| 12. Dependencies | Provider endpoint contract not supplied; no live adapter; schema entities below |
| 13. Error and empty states | Quarantine invalid/duplicate/mismatched events; never auto-confirm from a client claim. |
| 14. Acceptance criteria | FUT-003-AC1: Provider sandbox transfer and duplicate/replay tests reconcile correctly. FUT-003-AC2: Failure leaves a report pending rather than increasing confirmed totals. |
| 15. Priority | High |
| 16. Related database tables | private.donation_sources; private.donation_transactions; private.donation_reports |
| 17. API endpoints | Provider endpoint contract not supplied; no live adapter |
| 18. Required UI components | Future Finance integration status |
| 19. Verification references | Not run: no provider API credentials/contract — see the QA report for outcome and scope. |


### FUT-004 — Optional background reminders

**Classification/status:** Planned / service and consent needed. **Module:** Future.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Scope optional event/prayer reminders with subscriptions, revocation and minimal notification text. |
| 2. Purpose | receive a useful reminder outside an open app |
| 3. Target user/role | An opted-in member |
| 4. User story | As an opted-in member, I want to receive a useful reminder outside an open app. |
| 5. Functional requirements | Scope optional event/prayer reminders with subscriptions, revocation and minimal notification text. Test supported browsers and expiry/delivery failure before enabling a push sender. |
| 6. User interactions | Open/use Future reminder opt-in/preferences; supply explicit subscription/reminder choice; receive accepted reminder delivery or safe unavailable state. |
| 7. Inputs | Explicit subscription/reminder choice |
| 8. Outputs | Accepted reminder delivery or safe unavailable state |
| 9. Business rules | Existing notification badges are not background push. Permission must be requested in context; do not expose private prayer/chat details on a lock screen by default. |
| 10. Validation requirements | Opt-in subscription, trusted recipient, bounded delivery and revocation. |
| 11. Permission requirements | An opted-in member. Existing notification badges are not background push. Permission must be requested in context; do not expose private prayer/chat details on a lock screen by default. |
| 12. Dependencies | Push service contract not selected; schema entities below |
| 13. Error and empty states | Denied permission leaves the app usable; expired subscriptions are removed without repeated failures. |
| 14. Acceptance criteria | FUT-004-AC1: Opt-out stops future reminders. FUT-004-AC2: Supported-device acceptance verifies delivery and private-content minimization. |
| 15. Priority | Medium |
| 16. Related database tables | Future subscription/reminder storage; no migration proposed here |
| 17. API endpoints | Push service contract not selected |
| 18. Required UI components | Future reminder opt-in/preferences |
| 19. Verification references | Not run: background sender not implemented — see the QA report for outcome and scope. |


### FUT-005 — Durable offline submission queue

**Classification/status:** Planned / separate data contract. **Module:** Future.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Scope a small allowlist of offline actions with durable mutation IDs and explicit pending/cancelled/failed state. |
| 2. Purpose | submit only supported actions once connectivity and permission return |
| 3. Target user/role | A temporarily offline member |
| 4. User story | As a temporarily offline member, I want to submit only supported actions once connectivity and permission return. |
| 5. Functional requirements | Scope a small allowlist of offline actions with durable mutation IDs and explicit pending/cancelled/failed state. Revalidate the current session, audience and server permissions before replay. |
| 6. User interactions | Open/use Future pending queue and conflict controls; supply approved offline draft/action; receive at most one accepted server mutation or clear conflict. |
| 7. Inputs | Approved offline draft/action |
| 8. Outputs | At most one accepted server mutation or clear conflict |
| 9. Business rules | The existing cached shell and current-tab draft are not a durable queue. Do not queue financial confirmations or privileged destructive actions by default. |
| 10. Validation requirements | Idempotency, expiry, record version, fresh authorization and a policy for locally stored sensitive drafts. |
| 11. Permission requirements | A temporarily offline member. The existing cached shell and current-tab draft are not a durable queue. Do not queue financial confirmations or privileged destructive actions by default. |
| 12. Dependencies | Future action-specific idempotent contract; schema entities below |
| 13. Error and empty states | Show conflict/suspension/expired-session failures without endless automatic resubmission. |
| 14. Acceptance criteria | FUT-005-AC1: Reconnect replay is idempotent. FUT-005-AC2: A revoked/suspended user cannot replay previously authorized work. |
| 15. Priority | Medium |
| 16. Related database tables | Future client queue; existing server-owned records |
| 17. API endpoints | Future action-specific idempotent contract |
| 18. Required UI components | Future pending queue and conflict controls |
| 19. Verification references | Not run: durable queue absent — see the QA report for outcome and scope. |


### FUT-006 — Read-only bilingual help assistant

**Classification/status:** Planned / budget and privacy decision. **Module:** Future.

| Requirement field | Specification |
| --- | --- |
| 1. Description | Define an English/Filipino help corpus and an allowlist of fixed read-only retrieval operations. |
| 2. Purpose | find an answer from reviewed guidance without granting an AI write access |
| 3. Target user/role | A member with an approved support need |
| 4. User story | As a member with an approved support need, I want to find an answer from reviewed guidance without granting an ai write access. |
| 5. Functional requirements | Define an English/Filipino help corpus and an allowlist of fixed read-only retrieval operations. Require budget, data-purpose and privacy acceptance before adding any model/provider. |
| 6. User interactions | Open/use Future optional help panel; supply support question and reviewed retrieval context; receive cited guidance or an explicit inability to answer. |
| 7. Inputs | Support question and reviewed retrieval context |
| 8. Outputs | Cited guidance or an explicit inability to answer |
| 9. Business rules | A portfolio AI demonstration does not authorize private-data disclosure. The model must not write SQL, change accounts, approve donations or send messages. |
| 10. Validation requirements | Approved corpus, safe retrieval scope, grounded answers, bounded requests and no cross-user private context. |
| 11. Permission requirements | A member with an approved support need. A portfolio AI demonstration does not authorize private-data disclosure. The model must not write SQL, change accounts, approve donations or send messages. |
| 12. Dependencies | AI/provider contract not selected; schema entities below |
| 13. Error and empty states | Unavailable/unverified answers fall back to existing guides and Contact Us. |
| 14. Acceptance criteria | FUT-006-AC1: Adversarial prompts cannot obtain private records or invoke actions. FUT-006-AC2: Answers identify their source and decline unsupported claims. |
| 15. Priority | Low |
| 16. Related database tables | Reviewed public guidance only unless separately approved |
| 17. API endpoints | AI/provider contract not selected |
| 18. Required UI components | Future optional help panel |
| 19. Verification references | Not run: no AI integration implemented — see the QA report for outcome and scope. |


## Portfolio integration

The [complete mapping](09-Portfolio-Feature-Mapping.md) covers all 22 portfolio entries and the portfolio's actual navigation, index, dialogs, galleries, contact validation, disclosures and motion patterns. Existing PCEC equivalents are retained. This update scopes keyboard/adjacent-item Media browsing, searchable documentation/feature discovery, and a complete PCEC case study with actual captures. Heavy particle/scramble/pinned-scroll effects, dating games, school grading, stock FEFO and terminal/agent control are excluded from member workflows. Backup, MFA, durable offline writes, push, AI and provider integration are future/external work with their own acceptance criteria.

## Non-functional requirements

| ID | Requirement / measurable acceptance | Evidence boundary |
| --- | --- | --- |
| NFR-01 | No unauthorized cross-user/admin/room access in the permission regression; server derives caller identity. | Source/isolation tests plus bounded live checks; not a full penetration test. |
| NFR-02 | No unresolved automated accessibility violations or horizontal overflow in covered 320px–1440px/landscape screens; keyboard completes essential controls. | Manual screen-reader and current real-phone acceptance still required. |
| NFR-03 | Editable controls use readable mobile text; essential actions remain reachable with safe areas and enlarged text. | Automated checks and screenshot review; not every assistive setting. |
| NFR-04 | Target LCP ≤2.5s and interaction response ≤200ms for representative staging devices; measure before claiming compliance. | Targets, not current production measurements. |
| NFR-05 | Target 95th-percentile ordinary read API response ≤1s under an approved staging workload; bounded client concurrency/retries. | The local 100-session fixture exercise is not a cloud capacity benchmark. |
| NFR-06 | Confirmed gift review is atomic/idempotent; integer minor units and immutable evidence prevent duplicate confirmed totals. | Isolated database and donation fixtures; actual bank reconciliation requires Finance. |
| NFR-07 | Private files use short-lived signed access; upload signature/type/size/folder and budgets are checked server-side. | Public avatar policy and retention need owner acceptance. |
| NFR-08 | Database AND Storage restore must pass an isolated drill under an owner-approved retention/recovery policy. | Open operations gate; no accepted RPO/RTO has been supplied. |
| NFR-09 | Releases bind version metadata, compiled assets, worker and notes; no automatic loss of unfinished tab work. | Update lifecycle and release checks. |
| NFR-10 | Current Chromium/WebKit journeys and the available Firefox environment must be checked; failures reported rather than hidden. | An engine launch failure is not a passing browser result. |
| NFR-11 | Maintain the existing modular TypeScript/native-component stack, pinned dependencies, source-based schema and test ownership. | A rewrite or new dependency needs a concrete justification. |
| NFR-12 | No private member records, credentials, receipts, bank claims or misleading screenshots in public reports/portfolio. | Publish only reviewed documentation and isolated fixture captures. |


## Scope and limitations

The current MVP comprises the implemented member/admin features above, current QR-based giving with manual reconciliation, the documentation pack and bounded portfolio adaptations. Voice/video calls, new video uploads, app-store distribution, automatic Surgebox/TN confirmation, push delivery, durable offline writes, production MFA/recovery acceptance, and backup restore are not silently included as finished features. Resources and the donor in-app scanner remain removed; their retained schema is not deleted. See FUT IDs and the implementation plan for later work and its dependencies.
