// Scheduling guidance is separate from test results and readiness scores.
export const priorityGroups = {
  launch: { label: 'Before launch', explanation: 'Protect members, accounts, spending and recovery. Complete the applicable live checks before public launch.' },
  later: { label: 'Can follow later', explanation: 'The extra work described can follow once the basic safeguards work. Agree an owner and deadline; never defer a known serious flaw.' },
  conditional: { label: 'Only if enabled', explanation: 'The optional paid code reviewer is disabled. Complete these checks before enabling it.' },
  unused: { label: 'Not used now', explanation: 'This feature is absent from the current PCEC app. Recheck before introducing it.' },
};

export const launchPriorities = [
  ['1. Confirm the actual app address', 'Make the member website work over HTTPS, verify account-link destinations and prove a release can be rolled back. The supervisor report is a separate site.'],
  ['2. Make sign-in trustworthy', 'Test confirmation and password-reset email delivery. Require administrators to use a second sign-in step, with recovery, and verify that revoked access stops working.'],
  ['3. Protect member information', 'Install and test server permissions, form and upload validation. Prove members cannot access other private records or administrator actions; decide the intended photo audience.'],
  ['4. Limit abuse and spending', 'Put request and upload limits on the live service. Agree a budget, named alert recipient and a way to pause costly operations. Keep optional paid tools disabled until approved.'],
  ['5. Prove recovery and support', 'Restore a backup in an isolated environment, including actual uploaded files. Test outage alerts and the incident procedure with the named administrator and deputy.'],
  ['6. Approve privacy and member testing', 'Approve the notice, consent, retention and privacy-request procedure. Confirm the official support contact and rules for minors; test real phones and a small member pilot.'],
];

const later = new Map([
  ['Cryptographic token entropy ≥128 bits', 'An independent measurement of the provider’s token generator can follow. Use the trusted Auth provider now; never replace its tokens with a homemade generator.'],
  ['Constant-time secret comparisons', 'A deeper audit of the provider’s password-comparison code can follow. This app has no custom secret-comparison code; revisit before adding one.'],
  ['Meaningful HTTP 429 Retry-After everywhere', 'Consistent “try again later” messages can follow only after the live service actually blocks excess requests and the client cannot retry forever. The limits themselves are needed now.'],
  ['No unbounded or incomplete pagination', 'Complete navigation for the remaining older-content lists as volume grows. Deploy the prepared member paging now and prove the pilot can reach every record it needs; hidden essential records must be fixed before launch.'],
  ['Safe timestamp/actor/IP/endpoint/status context', 'Richer diagnostic detail can follow. Record basic security events and sensitive administrator changes before launch; agree the privacy purpose before collecting extra IP details.'],
  ['Typosquatting/provenance review', 'A broader independent supply-chain review can follow. The maintainer must still confirm the current packages and release tools come from trusted sources.'],
  ['No unused dependencies', 'Removing unused development packages is maintenance work. Keep required packages updated and avoid shipping development tools in the member app.'],
  ['No reachable CVE in any dependency', 'The broader review of every package, tool and operating-system dependency can continue later. Known exploitable or high-impact issues must be fixed before launch.'],
  ['security.txt contact', 'The standard file for security researchers can follow. A real account, privacy and security support contact must exist before members start using the app.'],
]);

const conditional = new Map([
  ['Optional-service spending ceiling', 'Approve a budget and provider limits before enabling the optional review tool.'],
  ['Development reviewer execution isolation', 'Check what the optional code reviewer can access before enabling it. Ordinary release and secret checks remain launch requirements.'],
  ['External-service secret storage', 'Keep the optional reviewer’s key in server/repository secret storage if enabled. Existing member-app secret protection is still required now.'],
]);

const unused = new Map([
  ['Multi-tenant isolation', 'PCEC currently serves one organization. Revisit if separate organizations share the same service and data.'],
  ['XML external entity protection', 'No XML parsing feature exists in the current app. Review protection before adding one.'],
  ['LDAP/NoSQL injection', 'No LDAP or NoSQL integration exists in the current app. Its existing database validation still needs to pass.'],
  ['Secure/HttpOnly/SameSite auth cookies', 'This app uses a different sign-in method, not application session cookies. Its token and session protections still need to pass.'],
  ['Untrusted integration instructions', 'No member feature sends instructions to an external review tool. Recheck before adding one.'],
  ['External-review output validation', 'External review results are not used in member workflows. Recheck before adding them.'],
  ['Private review instructions', 'The member app has no private external-review instructions. Recheck before adding this integration.'],
]);

export function priorityFor(status, title) {
  if (unused.has(title)) {
    if (status !== 'N/A') throw new Error(`Unused check needs an applicability review: ${title}`);
    return { key: 'unused', note: unused.get(title) };
  }
  if (status === 'N/A') throw new Error(`Add an explanation for this unused check: ${title}`);
  if (conditional.has(title)) return { key: 'conditional', note: conditional.get(title) };
  if (later.has(title)) return { key: 'later', note: later.get(title) };
  return { key: 'launch', note: '' };
}

export function verifyPriorityCoverage(checks) {
  const titles = new Set(checks.flatMap(([, items]) => items.map(([, title]) => title)));
  for (const title of [...later.keys(), ...conditional.keys(), ...unused.keys()]) {
    if (!titles.has(title)) throw new Error(`Priority references a missing check: ${title}`);
  }
}
