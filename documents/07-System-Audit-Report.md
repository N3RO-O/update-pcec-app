# 07 — PCEC Connect system audit

Assessment date: 31 October 2026. Audience: PCEC product owners, maintainers and QA.

## 1. Evidence and boundaries

The reviewed member application is `N3RO-O/pcec-connect-pwa`, published at
https://pcec-connect.vercel.app. The released baseline is 1.1.10, commit
`fa10585`. The reporting site is `N3RO-O/update-pcec-app`, published at
https://update-pcec-app.vercel.app. The portfolio is `N3RO-O/jonahdev`, published
at https://tabuzoportfolio.vercel.app; its reviewed main revision is `8719d84`.

The assessment uses the route table, page/component code, Supabase access
modules, checked-in schema and migrations, existing automated tests, the
published portfolio interface, and bounded read-only production checks.
It does not claim that an unobserved bank transfer, email receipt, backup
restore, real-phone session, or every production database policy was tested.
Other portfolio projects were inspected through their actual portfolio
descriptions and demonstrations; their private repositories were not all
independently audited. No production records or credentials are included here.

The master brief requires analysis and documents before further implementation.
Audit fixes prepared before that brief remain pending verification. The six
core documents and portfolio mapping define subsequent implementation scope.

## 2. Architecture discovered

| Layer | Existing implementation | Assessment |
| --- | --- | --- |
| Member frontend | Plain TypeScript, native ES modules, semantic HTML and CSS; `src/main.ts` routes through `src/lib/router.ts` | Retain. A React rewrite is unnecessary for the requested work. |
| Backend | Supabase Auth, PostgREST, PostgreSQL functions/RLS, Storage, private Realtime topics, Deno Edge Functions | Retain, with server-side authorization preserved. |
| Build | TypeScript 7.0.2; esbuild 0.28.2 bundles Realtime and QR dependencies; versioned static output | Keep dependency versions and lockfile pinned. |
| Hosting | Member app and reporting site are separate Vercel projects; an alternative Caddy deployment is documented | Verify each deployment independently. |
| Public material | Four static app guides; separate project-update and readiness pages | Keep public guidance separate from member records. |
| Portfolio | React 18, Vite, self-hosted fonts, native dialogs, project index, galleries, reduced-motion-aware effects | Adapt useful interactions rather than transplanting its visual identity. |
| Payments | Supplied Surgebox/QR PH image; bank/e-wallet payment outside the app; private reports and Finance reconciliation | No Surgebox API or automatic reference verification exists. |

## 3. Functional inventory

The PRD gives individually traceable requirements. Existing source includes:

- Welcome, email/Google sign-in, registration, consent, confirmation/resend,
  recovery, session renewal, status-based access and logout.
- Newcomer-only profile setup, birthday locking, profile editing, photo crop,
  birthday/location sharing preferences and profile discovery privacy.
- Home highlights, dated news, events and registrations, event lifecycle,
  official About statements, church directory, membership and NDC information.
- Community text/photo posts and audiences; comments/replies; reactions and
  reactor lists; saved posts, reposts, sharing, reporting and blocking;
  chronological and ranked feeds with live refresh and pagination.
- Following/followers, follow-back, suggestions, protected member lookup and
  legacy friendship compatibility.
- Shared chat, direct requests, private group creation with mutual-friend
  invitations, invitation acceptance, owner/admin settings and member removal.
  Message emoji, edits/unsend footprints, typing, receipts,
  reconnect, unread state, search, archive/mute/restrict and abuse reports.
- Prayer requests/support/answered state; photo uploads and gallery viewing;
  contact inquiries, account preferences, password changes and deletion.
- Original payment QR saving/sharing, selected/custom amounts, manual donation
  reports, optional private receipts, personal activity, Finance review,
  confirmed donation analytics and exports.
- Admin dashboard, member review/suspension, content/church management,
  donation options and QR editing, community/chat moderation and inquiry inbox.
- Installation, cached offline shell, controlled updates, navigation recovery,
  API timeouts/backoff, upload checks/quotas and private-path protection.

Resources and the donor's in-app payment scanner have been removed by request.
The retained `resources` and `attendance` tables are legacy schema, not evidence
of active member modules. Do not delete them as an undocumented cleanup.
Voice/video calls, new video uploads, automatic payment verification, background
push, and a general offline write queue are not completed product features.

## 4. Database assessment

An empty isolated PostgreSQL-compatible database was reconstructed from
`supabase/schema.sql`, six historical migrations, and the 23 timestamped
migrations. It contains 38 application tables, one view, 287 columns and 90
application functions across `public` and `private`. This is source-schema
evidence, not a full live PostgreSQL catalog export.

Five Storage buckets are represented: `profile-photos` is public; `media`,
`community-photos`, `announcement-images` and `donation-receipts` are private.
The schema document supplies actual columns, defaults, constraints, indexes,
foreign keys and relationships. No production data was imported into tests.

Read-only live checks confirmed the presence of 12 core RPCs for groups,
follows, chat controls/receipts, profile setup/details, donation reporting,
review/analytics and event lifecycle. Anonymous requests returned no profile
or community-post rows; chat history was denied. Private donation tables are
accessed through guarded functions and are not public table endpoints.
Email and Google providers are enabled and email auto-confirmation is off.
The upload/deletion functions returned expected CORS responses for the live
origin. These checks do not establish all authenticated production permissions.

## 5. Findings and implementation decisions

| ID | Finding | Effect | Decision / evidence |
| --- | --- | --- | --- |
| AUD-01 | Donation metric containers used a label without a valid ARIA role | Screen-reader semantics were invalid | Add a group role to member/admin metrics; rerun accessibility checks. |
| AUD-02 | Full-size QR link had a small touch target | Difficult interaction beside nearby controls | Give the QR action a 32px minimum target; retain the original QR bytes. |
| AUD-03 | Admin Donation Reports requested an unbundled icon | Icon text could appear instead of a glyph | Use an already bundled donation glyph; check Chromium and WebKit. |
| AUD-04 | A queued cropper frame could draw after cancellation closed its bitmap | Intermittent browser error after closing an editor | Cancel the queued frame and guard drawing after close; exercise quick cancellation. |
| AUD-05 | Broad tests expected removed messenger UI, old About copy and an obsolete cropper button | Tests stopped before covering later workflows | Update expectations to current public controls; preserve assertions about authorization and successful work. |
| AUD-06 | Some tests read an image before decoding or reused expired fixture dates | False failures and oversized diagnostics | Await image decoding, use relative fixture dates and assert outcomes without dumping image bytes. |
| AUD-07 | Media upload is photo-only but a call-to-action says photo or video | Capability is overstated | Use truthful upload copy; keep legacy video playback separate. |
| AUD-08 | Media opens one item without adjacent-item navigation | Browsing many church photos requires repeated closing | Adapt the portfolio's previous/next gallery, counter and arrow-key controls. |
| AUD-09 | Current reporting documentation is scattered and partly historical | Maintainers cannot easily find current requirements or evidence | Publish the nine-document pack with status, source references, searchable feature inventory and real interface captures. |
| AUD-10 | Portfolio PCEC entry lists only four broad capabilities and an illustrative collage | The implemented product is underdocumented | Replace it with the traceable feature inventory, actual interface captures and links to the app/documentation. |

The initial automated run completed 50 suites: 41 passed and nine failed.
Follow-up runs distinguish app defects, obsolete fixture assumptions, and local
browser/port failures. Current detailed results and unresolved cases belong in
the QA report; a visible screen alone is not accepted as a completed feature.

## 6. Launch conditions still outside this audit's proof

The earlier 30 October dashboard review recorded no backups and Gmail SMTP
with a deliverability warning. These observations retain that date until
rechecked. A successful isolated database-and-file restore is still needed.
An account owner must demonstrate real confirmation/recovery email completion,
administrator MFA enrollment/recovery and server enforcement, final-domain
callbacks, a controlled Android/iPhone pilot, and a reconciled bank donation.
Infrastructure ownership, incident response, retention and operating budget
also need named owners. AdSense was rejected for insufficient publisher content;
advertising remains disabled and review/approval is not supplied by app code.

No new permission grants, account-role changes, payments, user invitations,
real messages, destructive cleanup or paid services are part of this audit.

## 7. Approved direction for the next implementation phase

Retain the existing stack, routes and data. Complete the bounded audit fixes;
adapt gallery navigation without a new backend; improve documentation discovery;
and expand the portfolio's PCEC case study. Reuse native dialogs, the existing
theme and permission-aware services. Proposed payment integrations, AI helpers,
new approval roles, push and offline writes remain separately scoped work.

The documentation pack, screenshots and public reporting pages must distinguish
implemented behavior, pending verification, proposed enhancements and external
acceptance gates. Historical audit scores must not be silently recalculated.

## 8. Related deliverables

The scoped implementation is complete in the working release: AUD-01/02 donation accessibility, AUD-03 icon selection, AUD-04 cropper readiness/cancellation, AUD-07 photo-only wording, AUD-08 adjacent media navigation, AUD-09 the documentation library and AUD-10 the expanded portfolio. Focused checks passed. AUD-05/06 test assumptions and fixture timing were corrected while retaining authorization and ledger assertions. The QA report records whole-suite browser results separately from these repairs and from external launch acceptance.

- [PRD](01-Product-Requirements-Document.md)
- [TRD](02-Technical-Requirements-Document.md)
- [Application flows](03-Application-Flow-Document.md)
- [Design brief](04-UI-UX-Design-Brief.md)
- [Schema and implementation](05-Database-Schema-and-Implementation.md)
- [Implementation plan](06-Implementation-Plan.md)
- [QA evidence](08-Testing-and-QA-Report.md)
- [Portfolio mapping](09-Portfolio-Feature-Mapping.md)
