# 04 — UI/UX design brief

Prepared 31 October 2026 from the inspected PCEC source, reconstructed empty schema, existing tests and portfolio. Released baseline: 1.1.10. Items marked planned or awaiting acceptance are not shipped integrations. The QA report is the authority for completed test evidence.

## Direction and design ownership

PCEC's interface should be professional, calm and readable for members and office staff. Preserve the official mark, church-focused language, the supplied white/blue login reference, and the existing member/admin task structure. Improve consistency through shared components and feedback; do not apply the portfolio's red developer branding, particle hero, scrambled text or pinned horizontal scroll to church workflows.

The paired login/registration/Google-consent cards are intentionally light in either app theme. The rest of the member application retains its light/dark/system theme. A phone frame, device status bar and fictional people are not app UI assets.

## Color system

| Token/use | Current value or source | Contrast rule |
| --- | --- | --- |
| PCEC primary / Honolulu Blue | #046CAB | Primary/nav/mark; pair text/background using checked contrast. |
| PCEC secondary / Fire Bush | #EC952A | Secondary accent with dark/charcoal text, not small white text. |
| Light cloud background / charcoal text | #F1F1F1 / #353535 | Neutral reading surface and body. |
| Auth navy / link / primary | #0B355B / #0063CC / #0864C7 | Labels, links and white primary-button text. |
| Auth page / card / fields / border | #F5F9FD / #FFFFFF / #F7FAFD / #DCE5EF | Pale fields retain visible edges and focus. |
| Auth secondary text / error | #60758F / #A5261B | Small secondary text remains readable; invalid state also has text. |
| Dark surfaces and semantic states | Existing --surface/--text/--error/success/warning tokens in theme.css | Do not encode meaning through color alone; recheck contrast after changes. |


## Typography and spacing

Headings use bundled Montserrat and body/controls use DM Sans; icons use the bundled Material Symbols or existing SVG set. Keep the original logo geometry. Inputs use at least 16px editable text on phones. Use a clear h1 per screen, h2 module sections, concise labels and readable line height. Favor 8/12/16/24px spacing steps and minimum 44px essential controls where practical; the automated minimum touch-target checks must also pass. Long names, dates, translations and amounts must wrap without clipping.

## Component contract

| Component | Required behavior and states |
| --- | --- |
| Buttons/links | One clear primary action; secondary/ghost actions distinct. Busy disables duplicate submission, success follows confirmed response, errors preserve retry. Links remain identifiable. |
| Inputs | Persistent associated label, readable text, meaningful type/autocomplete, inline error with aria association, visible focus and accessible password visibility. |
| Cards/tables | Clear heading/context/date; bounded summaries; expand or navigate for detail. Small-screen tables scroll within a labelled region or use an equivalent readable layout. |
| Dialogs/sheets | Native dialog/label, Escape/Close, focus management and restoration, scrollable content with reachable actions; cleanup on close and route exit. |
| Navigation | Five member tabs, visible Menu for secondary tasks, role-appropriate desktop/admin navigation; no essential phone action hidden in a desktop-only link. |
| Badges/notifications | Label unread/review/confirmed/pending state in text. Delivered, read, reported and confirmed have different meanings. |
| Charts/metrics | Label range, currency, scope and current data state; accessible group/heading structure and table/export alternative; never mix self reports into confirmed totals. |
| Pagination/search | Result count, clear filters and no-match state; preserve current selection/search during friend picking; cursor failures are recoverable. |
| Empty/loading/error | Explain why content is absent and which action is useful. Bounded loader, retry and offline state; no permanent spinner or false empty success. |
| Images/gallery | Use actual authorized images and meaningful captions/alt text, preserve aspect/fit context and handle missing URLs. Previous/Next and arrow keys have an item counter and cleanup. |
| Cropper/QR editor | Drag/keyboard/zoom are alternatives. Cancel leaves the previous draft; QR output preserves raw bytes and quiet border. Closing prevents queued drawing. |
| Documentation | Readable contents, feature IDs, evidence/status labels, searchable index and no-JS full documents. Markdown downloads and screenshot captions must resolve. |


## Screen layouts

| Area | Layout requirements |
| --- | --- |
| Login/signup | Centered white rounded card on pale blue page; blue mark/organization; labelled email/password; recovery; blue action; Google button; registration/install/public-guide links. Signup keeps consent and structured contact fields. |
| Home | Compact greeting and useful highlights, event/news context and member composer/feed; keep the hierarchy readable rather than adding dense statistic panels. |
| Member modules | Consistent app bar/back/menu, a single primary task, scoped cards/list/search and useful empty state. |
| Chat | Conversation identity and controls above readable bubbles; compact composer with visible send/emoji actions. Disabled media/call controls explain their unavailable state. |
| Giving | Method/amount before instructions; original QR saving; actual transfer reporting; clear Reported versus Confirmed; own activity separate from admin analytics. |
| Admin | Visible management navigation, readable queues/cards and bounded filters/search; explicit confirmation before destructive action; critical form actions reachable on phones. |
| Profile/settings | Edit Profile for returning members, newcomer wizard only when required; privacy choices explain audience and birthday lock. |
| Public report/portfolio | Documentation readable without a member account; sample-interface captions and testing-release status; no private profile/chat/receipt exposure. |


## Responsive acceptance

Test 320×568 and 390×844 phones, 768×1024 tablet, 844×390 landscape, 960px laptop and 1440px desktop. Use content-driven wrapping, safe-area padding and local scrolling only where necessary. Dialog buttons and gallery actions remain visible/reachable; labels cannot disappear merely to compress a short screen. Keyboard navigation, reduced motion, empty/long-content and light/dark/system variants must be checked. Browser-emulated tablet/phone views are not proof of real-device acceptance.

## Portfolio patterns to adapt and exclusions

Native dialogs, labelled gallery buttons/counter, keyboard arrows, index filters/clear/count, meaningful statuses and disclosure structure are useful. Their PCEC mappings and tests are defined in document 09. Keep native scrolling and existing stack; do not add Lenis or React to the member app merely to copy a visual effect. Public help stays member-focused; technical implementation details stay in maintainer documentation on the separate report site.

## Screenshot review

Use actual rendered interfaces, not generated illustrations. Store captures under docs/screenshots/existing-system, portfolio, redesigned-system and mobile with a manifest recording route, viewport, build, fixture/live context and capture date. Use isolated realistic sample data for member/admin captures; passwords remain blank/obscured, and no real account email, private message, payment reference or receipt is published. Capture relevant public portfolio sections without private résumé/contact material. Review every selected image for clipping, unreadable text, misleading status and sensitive content before copying it to either public website.
