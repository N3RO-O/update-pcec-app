# 09 — Portfolio feature extraction and PCEC mapping

Reviewed 31 October 2026. References: the published Nero portfolio,
`jonahdev/src/App.jsx`, `src/components/EditorialTools.jsx`, `ProjectIndex.jsx`,
the animation/navigation hooks, and all 22 entries in `projectCatalog.js`.

## Evidence rule

Portfolio UI interactions were inspected in the published site and source.
Capabilities of other featured applications below are statements from their
actual case studies; their private repositories were not all re-audited.
They are references for requirements, not evidence that PCEC already supports
the same integration. **Equivalent** means PCEC has a related implementation;
**Adapt** is a scoped implementation in this update; **Future** needs additional
requirements, testing or operating approval; **Exclude** has no justified PCEC use.

## 1. Features from every portfolio entry

| Portfolio project / original functionality | Existing PCEC equivalent | Integration decision and purpose | Priority / dependencies |
| --- | --- | --- | --- |
| Church Time's Up: countdown/count-up, presenter messages, monitor selection and overlay layout; owner links and operator invitations; fullscreen fitting and phone layout | Events, private group invitations and responsive layouts | Equivalent for invitations and mobile access. Future event run-of-show tools only if organizers request them. Exclude stage display/monitor control from a member community app. | Medium for future organizer work; event permissions and display hardware required. |
| KiddyTrack: teacher/parent/principal dashboards, relational schema, readable grade tracking | Member/admin pages and relational profiles/content | Retain role-specific views and readable summaries. Exclude grades and pupil records; they are a separate data/privacy domain. | High; existing route guards and RLS. |
| PHILRADS Assets: record CRUD, Admin/Staff access, responsive field interface | News/events/church CRUD, member/admin boundaries | Equivalent. Preserve structured forms, validation and phone access rather than adding duplicate CRUD modules. | High; existing content services and upload checks. |
| PHILRADS IMS: batch/expiry/FEFO, two-admin releases, served-person event totals, offline retry/deduplication, bilingual read-only AI lookup, audit/MFA/encrypted backup | Event lifecycle, mutation IDs, confirmed donation reporting, request controls and audit tooling | Adapt lifecycle/status clarity. Future dual Finance approval, durable offline writes, admin MFA and restore exercises require separate acceptance. Future bilingual read-only assistant needs a restricted knowledge/data contract and budget. Exclude stock deduction and FEFO from PCEC donations. | Critical for recovery/MFA acceptance; other additions Medium/Low. No automatic approvals or AI access expansion. |
| Nerovault: percentage budgets, bill states, savings pace/confetti, JSON restore and CSV export | Donation report states, confirmed totals and export | Equivalent for state labels and CSV. Future administrative backup tooling needs encrypted access-controlled export and a restore drill. Exclude household budgets, savings gamification and browser-only storage for member records. | High for backup procedure; Medium for export UX. |
| MyAIpeeps: manager/worker workflow, terminals, task board, shared memory/activity, voice notes, light/dark office | Admin moderation queues, activity records, themes | Equivalent for queue/status and themes. Future support task assignment is a separate role/data feature. Exclude executing terminals, multi-agent control and recording people by default. | Low; support ownership, consent and storage would be required. |
| DateMyLDR: layered avatars, illustrated places, private invitations/two-person rooms, presence/chat/emotes and games | Profile photos, direct chat, invitations, typing and emoji | Equivalent for private invitations and conversations. Retain server membership checks. Exclude dating rooms, movement worlds and relationship games from the PCEC core. | High for existing chat privacy; games out of scope. |
| PCEC Connect case study: profiles/content, friends/audiences/groups, chat/reactions/notifications, installation and admin workflows | The actual reviewed app | Expand the portfolio case study with all PRD feature groups, current status, real fixture screenshots and documentation links. Do not claim unrestricted launch readiness. | High; this documentation and reviewed screenshots. |
| PHILRADS Staff Portal: home/navigation, PWA/offline shell/updates, schema/RBAC, prepared Google Drive upload boundary | Home/Menu, installation/updates, Supabase permissions and signed Storage | Equivalent for navigation/PWA/access. Future Google Drive integration requires its own OAuth/file-sharing contract; do not replace working Storage automatically. | High for existing access; Drive Low/Future. |
| KiddyTrack CPIC: role dashboards, attendance/scores, lesson approval, messages/notifications/reports | Roles, events, chat, notifications and reports; retained attendance table | Equivalent for roles/messages. Future attendance needs a complete event check-in workflow and explicit QR/data scope. Exclude scores and lesson plans. A retained table is not a completed feature. | Medium; event organizer requirements and privacy review. |
| Reportly: daily reports, tasks/hours/holidays, next-day entries, responsive statistics | Admin totals and date-filtered donation analytics | Equivalent for date/status presentation. Future ministry activity reports require defined owners and measures. Exclude staff payroll/timekeeping from this release. | Low/Future; new domain schema would be needed. |
| Habit Ops: daily grid/check-ins, streaks/XP, private per-user data, prepared push reminders | Private account preferences, prayer supports and notification state | Retain private-per-user boundaries. Future optional event/prayer reminders need subscription/permission and delivery tests. Exclude public prayer streaks, XP and competitive faith metrics. | Medium for reminders; push service/budget/consent required. |
| PCEC Update: progress/checklist, architecture/guides, readiness reviews, install/presentation assets | Current project-update website | Adapt into a searchable documentation hub, feature-by-feature PRD, evidence-aware QA, schema/flow diagrams and screenshot gallery. Preserve historical evidence dates. | High; nine reviewed documents and static build integration. |
| PCEC Authentication Prototype: login/signup API, hashing/tokens, Flutter screens, backend drafts | Current Supabase Auth and TypeScript auth forms | Preserve current working Auth. The prototype is historical; do not run two parallel authentication systems or move password hashing into the browser. | Critical; managed Auth, confirmation and recovery acceptance. |
| CTU Publisher: admin/customer auth, discount review, license issuance/revocation, verified-payment history | Member administration, Finance review and audit | Equivalent for review status and payment evidence. Future dual approval can be scoped for Finance. Exclude software licensing and customer-discount mechanics. | High for payment audit; new approval roles need explicit policy. |
| PHILRADS Disaster Monitor: agency/news routing, relevance/priority filtering, queued retry/deduplication, source-health summaries | Dated sourced church news, rate controls, notification invalidation and monitoring | Retain source/date attribution. Future curated news import must preserve licensing, editorial approval, source health and deduplication. No fabricated account activity or automatic unreviewed publishing. | Medium; approved feeds, editorial owner and failure handling. |
| PHILRADS Direct Monitor: source adapters, available source pictures, Discord/Telegram routes, persistent delivery queue and source health | News images/credits and monitoring outbox | Equivalent for attribution and minimal audit delivery. Future Telegram/Discord notifications require authorized recipients and consent. Do not forward private church content by default. | Medium/Future; service credentials and destination authorization. |
| PHILRADS Best-Time Bot: CSV engagement analysis, day/hour charts, seven-day plan, date/content controls | Filtered donation charts and exports | Equivalent for filters and labelled charts. Future aggregate editorial analytics must minimize personal data. Exclude optimizing private prayer/chat engagement. | Low/Future; aggregate dataset and editorial purpose. |
| PHILRADS Feed Bridge: website-to-feed conversion and local PHP integration | Current manually curated news with source links | Future feed ingestion only after a source contract and moderation workflow. A PHP rewrite of this TypeScript/Supabase app is unnecessary. | Low/Future; approved sources and integration tests. |
| Shaina Portfolio: responsive résumé, portrait/skills/history, mobile navigation, reveals, download/contact | Member profiles, navigation, official About, help/contact | Equivalent for readable profiles/mobile navigation. Keep public résumé/contact data out of member records. Reuse accessible disclosure patterns, not a new CV module. | Medium; existing component library. |
| Nero Portfolio: pinned reel/particles, searchable index and case studies, photos/videos/writing, native dialogs and hold-to-download | Global search, news/media, native sheets, protected downloads | Adapt previous/next media navigation, keyboard arrows, item counter and captions. Adapt searchable documentation and explicit implementation status on the update site. Exclude forced animation, particle hero, scroll pinning and hold-to-download for essential actions. | High for gallery/accessibility; no new database needed. |
| GitHub Profile: banner/introduction, featured projects/toolkit and links | Official About and documentation source links | Equivalent for contextual introduction and traceable links. Exclude developer identity/technical toolkit from normal member workflows. | Low; public documentation only. |

## 2. Inspected portfolio UI interactions

| UI feature / reference | How it works | PCEC treatment | Verification |
| --- | --- | --- | --- |
| Primary/mobile navigation; anchor links; Back to top | Visible section links and small-screen menu | Existing Menu/bottom navigation remain. Documentation gets a readable contents index and in-page anchors. | Keyboard, narrow layout, target visibility. |
| Project index search/categories/count/clear/show-more | Client-side text matching and category state; result count updates | Existing global search already supplies member-aware results. Adapt this pattern to the public documentation/feature inventory; no member API data enters the report search. | Search, no-match, clear, filter changes and no-JS reading. |
| Native project/modal dialogs | Native dialog, Escape/Close, focus restoration, body scroll lock | Existing `openSheet` is retained. Gallery uses it and removes keyboard listeners on close/route change. | Focus, Escape, route cancellation and screen-reader labels. |
| Gallery tabs, captions, Previous/Next and live counter | Changes the selected image without leaving a project | Adapt to Media and the screenshot documentation gallery; signed member files stay behind the same access checks. | First/last wrapping, one/zero item, keyboard and broken image states. |
| Media arrow keys and video controls | Left/Right change photographs; video pauses on close | Adapt arrows and stop playback when leaving a media item. Photo upload remains the only enabled upload type. | Arrow keys do not hijack text fields; close stops playback. |
| Project status/attribution/source labels | Separates prototypes, forks and internal/testing projects | Use implemented/proposed/verification labels throughout the PCEC catalog and portfolio entry. | No untested integration or fake launch claim. |
| Contact validation, timeout, sending/error/success | Required fields; bounded request; success only after response | PCEC already has a server-bound inquiry workflow. Preserve that service, not the portfolio's external Formspree destination. | Fixture submission/error/timeout; no unsolicited real message. |
| Experience/certification/FAQ disclosures | Native expandable content keeps the page short | Existing About value disclosures remain; technical docs use accessible details for long schemas. | Keyboard expand/collapse and print readability. |
| Reduced-motion policy, visible focus and semantic headings | User preference reduces motion; keyboard focus remains visible | Preserve PCEC's existing policies. Documentation and gallery must work without animation. | Reduced-motion, headings, focus, contrast and 320px scans. |
| Progress indicator and Lenis smooth scroll | Tracks reading and interpolates scrolling | Contents/anchors are sufficient for the docs; avoid adding a second scrolling framework. | Native browser/keyboard scrolling remains usable. |
| Hold-to-download résumé | Deliberate hold before accessing a public résumé | Exclude from login, giving, reports and essential app actions; it adds a barrier without improving authorization. | No accidental reuse as a security control. |
| Scrambled headings, particles, halftone hover, card fan, pinned horizontal reel | Brand storytelling and animated decorative layouts | Exclude from PCEC workflows; preserve PCEC's blue/orange branding, readable text and predictable scroll. | Essential content remains readable and never requires motion/hover. |

## 3. Integration specification

**PORT-GAL-01 — Media navigation.** Target: approved member reading `/media`.
Reuse already fetched and signed items; provide Previous/Next, an item counter,
caption/date, and Left/Right keys inside the existing sheet. A single item does
not expose misleading active navigation. Closing or navigating away removes
listeners and stops video playback. No permission, bucket or schema change.
If a signed URL is unavailable, show the existing unavailable state rather than
revealing a raw private path. Tests cover two photos, wrap, empty/one item,
keyboard, close, route change and mobile accessibility.

**PORT-DOC-01 — Documentation discovery.** Target: maintainers and project
reviewers on the separate update website. Provide the six core documents,
audit/QA/mapping, an indexed feature list, status filters, search, direct links,
Markdown downloads and actual screenshots. Reading must work without login or
JavaScript; filtering is progressive enhancement. Do not publish internal logs,
keys, receipts, member records or unrestricted raw source. Tests verify document
links, all feature IDs, filters, downloads, screenshots, mobile layout and CSP.

**PORT-SHOW-01 — Portfolio case study.** Target: portfolio visitors. Expand
the PCEC entry from four summaries to all implemented feature groups and explain
the challenge, approach, actual stack, testing scope and launch limitations.
Include real screenshots rendered against an isolated sample backend, with
captions identifying that context. Link to the live app and public documents.
Do not display real donation receipts, account emails or chat content.

## 4. Boundaries for future integrations

MFA, backup automation, durable offline mutation queues, Finance dual approval,
push, AI, Drive and external payment/news APIs require separate service/data
contracts, tests, and owner acceptance. They are not completed because another
portfolio project advertises them. The current work implements only the bounded
items above and closes verified audit defects. The implementation plan records
dependencies, effort and completion criteria for later phases.
