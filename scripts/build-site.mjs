import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

await import('./build-emails.mjs');
await import('./build-readiness.mjs');
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'dist');
if (relative(root, output) !== 'dist') throw new Error('Invalid site output path.');
await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'assets'), { recursive: true });
await mkdir(join(output, 'email-templates'), { recursive: true });
const files = [
  'index.html', 'email-preview.html', 'api-cost-review.html', 'income-plan.html', 'production-readiness.html', 'assets/pcec-logo-white.png',
  'email-templates/subjects.json',
  ...['password-reset', 'confirm-email', 'verification-code', 'password-changed',
    'email-change', 'mfa-enabled', 'mfa-removed', 'sign-in-link']
    .map(name => `email-templates/${name}.html`),
];
let scripts = 0;
for (const file of files) {
  if (!file.endsWith('.html')) { await cp(join(root, file), join(output, file)); continue; }
  let html = await readFile(join(root, file), 'utf8');
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  for (const [index, block] of inline.entries()) {
    const asset = `assets/${file.replace('.html','')}-${index}.js`;
    await writeFile(join(output, asset), block[1], 'utf8');
    html = html.replace(block[0], `<script src="${asset}" defer></script>`);
    scripts++;
  }
  if (/\son\w+\s*=/i.test(html)) throw new Error(`Inline event handler in ${file}; use addEventListener.`);
  await writeFile(join(output, file), html, 'utf8');
}
console.log(`Prepared ${files.length + scripts} public site files in dist/. Scripts are served from this site for CSP.`);
