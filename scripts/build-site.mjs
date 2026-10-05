import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

await import('./build-emails.mjs');
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'dist');
if (relative(root, output) !== 'dist') throw new Error('Invalid site output path.');
await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'assets'), { recursive: true });
await mkdir(join(output, 'email-templates'), { recursive: true });
const files = [
  'index.html', 'email-preview.html', 'api-cost-review.html', 'assets/pcec-logo-white.png',
  'email-templates/subjects.json',
  ...['password-reset', 'confirm-email', 'verification-code', 'password-changed',
    'email-change', 'mfa-enabled', 'mfa-removed', 'sign-in-link']
    .map(name => `email-templates/${name}.html`),
];
for (const file of files) await cp(join(root, file), join(output, file));
console.log(`Prepared ${files.length} public site files in dist/.`);
