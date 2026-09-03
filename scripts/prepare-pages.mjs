import { cp, mkdir, readFile, access, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const client = path.join(root, 'dist/client');
const destination = path.join(root, 'docs');
const prefix = '/apple-mac-competitive-analysis/';
await access(path.join(client, 'index.html'));
await mkdir(destination, { recursive: true });
for (const name of ['index.html', 'index.rsc', 'favicon.svg']) {
  await cp(path.join(client, name), path.join(destination, name));
}
await cp(path.join(client, 'apple-mac-competitive-analysis/_next'),
  path.join(destination, '_next'), { recursive: true });
await writeFile(path.join(destination, '.nojekyll'), '');
const html = await readFile(path.join(destination, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (match[1].startsWith(prefix)) {
    await access(path.join(destination, match[1].slice(prefix.length).split('?')[0]));
  }
}
console.log('GitHub Pages files ready in docs; referenced assets verified.');

