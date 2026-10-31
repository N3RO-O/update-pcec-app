# 06 — Implementation plan

Prepared 31 October 2026 from the inspected PCEC source, reconstructed empty schema, existing tests and portfolio. Released baseline: 1.1.10. Items marked planned or awaiting acceptance are not shipped integrations. The QA report is the authority for completed test evidence.

## Execution policy

The master brief adds an analysis-and-documents gate before further implementation. The system audit and portfolio inventory were prepared first, followed by documents 01–06. Pre-existing working features and production records stay intact. Previously prepared audit fixes must be validated, not silently discarded or called shipped. The intended release is a bounded enhancement on the existing stack, not a replacement application.

Effort below is an engineering estimate for one maintainer with owner availability. It is not an elapsed-time promise, paid-service approval or claim that external acceptance is complete.

| Phase / priority / effort | Tasks | Dependencies | Expected output | Completion criteria / current state |
| --- | --- | --- | --- | --- |
| 1. Existing system audit — Critical; 1–2 days | Inspect source/routes/services, reconstruct empty schema, review portfolio sections/catalog, run regression baseline and read-only live checks. | Repository and existing connection access. | Document 07, source schema/route inventory and 09 mapping. | Completed analysis evidence recorded; failed/limited checks are explicit, not hidden. |
| 2. Requirements and documentation — High; 1–2 days | Prepare six core documents, feature acceptance IDs, role matrix, APIs, flows, design tokens, complete schema and test matrix. | Phase 1 evidence and master brief. | Documents 01–09 and machine-readable feature/schema index. | All feature entries have the required fields, APIs/entities and acceptance criteria; links are consistent. |
| 3. Architecture/database preparation — Critical; 0.5–1 day | Retain native TypeScript/Supabase stack; validate no new schema needed for gallery/docs/a11y; preserve secrets/RLS and existing migrations. | Documents 01/02/05; source security tests. | Validated unchanged data boundary and migration decision. | No production mutation or duplicate schema is introduced; future contracts stay explicitly planned. |
| 4. UI/UX implementation — High; 0.5–1 day | Close metric/touch-target/icon/cropper findings, align truthful media labels, adapt accessible gallery navigation and lifecycle cleanup. | Documents 04/09; existing components and signed media services. | Small reusable improvements and updated interface captures. | Keyboard, cancellation, empty/one-item, mobile/desktop, accessibility and no-regression checks pass. |
| 5. Feature implementation — High; 1 day | Implement MEDIA-002, DOC-002 and PORT-001; preserve all current Auth/community/giving/admin behavior. | Phase 2 requirements and 4 foundation. | Adjacent-item Media browsing, documentation hub and expanded PCEC case study. | New requirements have passing focused tests; no future provider/AI/push capability is misrepresented as shipped. |
| 6. Integration — High; 0.5–1 day | Connect existing media data, static document generation/downloads, screenshot assets and portfolio catalog; verify links and access boundaries. | Phases 3–5; report/portfolio repositories. | Consistent three-site handover and safe public assets. | All cross-site/document links resolve; no member API or secret is required by the report/portfolio. |
| 7. Testing/QA — Critical; 1–2 days | Run existing isolated browser/database/security/QR/donation/update checks; replace obsolete fixture expectations with current user flows; verify actual app/portfolio captures. | Built application and feature acceptance matrix. | Document 08 with suite/feature outcomes and unresolved environment cases. | No known code failure is labelled pass; necessary changed suites pass; external tests retain explicit status. |
| 8. Deployment preparation — Critical; 0.5–1 day plus owner gates | Version app/notes, production build, private-file/secret scans, scoped commits, deploy each site, verify release/headers/assets. | Passing implementation checks and existing publishing authorization. | Reviewable release artifacts and public documentation/portfolio updates. | Exact live release verified; app publication is not broad launch acceptance. |
| 9. Final verification and handover — Critical; 0.5–1 day | Reconcile documents/status/screenshots with final code; verify each role in safe fixtures and representative live reads; list unfinished work/owners. | All earlier phase evidence. | Final report, README/setup links, capture manifest and remaining acceptance list. | Owner can distinguish completed, partial, planned and blocked work without relying on conversation history. |


## Ordered implementation tickets

| Ticket | Scope | Depends on | Acceptance / data impact |
| --- | --- | --- | --- |
| FIX-A11Y | Donation metric role and QR link target. | AUD-01/02 | Covered member/admin screens scan cleanly; no data change. |
| FIX-ICON | Bundled Donation Reports icon. | AUD-03 | Chromium/WebKit detect no missing glyph; no data change. |
| FIX-CROP | Cancel queued cropper drawing and handle closed lifecycle. | AUD-04 | Rapid cancel/route exit causes no detached-bitmap error; crop output still preserves QR data. |
| FIX-QA | Current navigation/About/composer/feed expectations, relative fixture dates and decoded image reads. | AUD-05/06 | Test actual visible controls/outcomes; do not weaken access/ledger assertions or remove coverage without a replacement. |
| PORT-GAL-01 | MEDIA-002 viewer controls/keys/counter/playback cleanup and truthful photo-only upload copy. | Existing Media list and document 09 | Focused gallery interaction and accessibility regression; no new table/endpoint/dependency. |
| PORT-DOC-01 | Nine-document library, search/status filters, downloads and real capture gallery on update site. | Reviewed documents and safe assets | No-JS document reading, valid links, search/clear/no-match and responsive tests. |
| PORT-SHOW-01 | PCEC feature list/story/current stack, links and actual screenshots in portfolio. | Final feature catalog and capture manifest | Existing portfolio check plus mobile/desktop project modal/gallery validation. |
| RELEASE-01 | App release followed by reporting-site and portfolio publication. | Implementation/QA and secret review | Exact deployed versions and assets verified; unrelated local changes preserved. |


## External acceptance and later phases

| Item | Owner/dependency | Why not complete | Next verification |
| --- | --- | --- | --- |
| FUT-001 admin MFA | Account owners and maintainer | Enrollment/recovery and server assurance policy not accepted. | Staging privilege checks and owner recovery drill. |
| FUT-002 backup/restore | Data owner and maintainer | A complete database plus Storage restore has not been demonstrated. | Approved isolated restoration with integrity/access/file checks. |
| Real email confirmation/recovery | Approved sender/mailbox owners and final domain | Configured SMTP/public providers do not prove inbox delivery/completion. | Controlled end-to-end confirmation and reset on agreed accounts. |
| FUT-003 provider payments | Surgebox/provider plus Finance | API/event contract and credentials unavailable. | Sandbox signed-event/query integration and duplicate/mismatch/refund acceptance. |
| FUT-004 push / FUT-005 offline queue | Product/privacy/operations owners | New service/subscription or durable sensitive-data contracts. | Opt-in device tests or idempotent/revoked-user replay tests. |
| FUT-006 assistant / dual Finance approval | Product/Finance/privacy owners | New purpose, budget and least-privilege policy needed. | Reviewed read-only data contract or two-person authorization tests. |
| Final domain and real-device pilot | PCEC domain owner and pilot members | DNS/callback/install behavior and latest Android/iPhone release acceptance outstanding. | Domain handover and current release pilot checklist. |
| AdSense | Advertising account owner/Google | Site approval remains external; ads are off. | Review eligible public content and request Google review when ready. |


## Release and rollback

Build/check the existing app with matching package and release notes. Use scoped commits that exclude unrelated monitoring/email/template/local-folder changes. Publish the app, update site and portfolio separately through their established deployments. Verify live release metadata, assets, headers, private paths, public documents and screenshot links. Keep the prior deployment available for an app-only rollback; there is no new database migration in this scope. Update the QA report and screenshot manifest after verification. Do not erase historical audit scores or claim universal perfection/production acceptance.

## 31 October execution record

Audit and the six core documents preceded implementation. Completed source work: donation accessibility roles/QR target; bundled admin icon; cropper initial readiness and queued-draw cancellation; media navigation/counter/keyboard/cleanup; nine-document searchable public library; 54-capability portfolio inventory with six separate future items and 13 actual app captures. No schema migration, new app role, permission expansion or production data mutation was required. Focused acceptance is recorded in document 08; external service gates remain open. Release target is 1.1.11. Publication and live artifact verification are recorded in the release handoff.
