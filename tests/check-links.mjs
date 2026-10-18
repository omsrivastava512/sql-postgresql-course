import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = [];
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git'].includes(item.name)) continue;
    const target = path.join(dir, item.name);
    if (item.isDirectory()) await walk(target);
    else if (item.name.endsWith('.md')) files.push(target);
  }
}
await walk(root);
const broken = [];
let links = 0;
for (const file of files) {
  const body = await readFile(file, 'utf8');
  for (const match of body.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    const [rel, fragment] = target.split('#');
    const resolved = rel ? path.resolve(path.dirname(file), decodeURIComponent(rel)) : file;
    try {
      await access(resolved);
      if (fragment && resolved.endsWith('.md')) {
        const dest = await readFile(resolved, 'utf8');
        const anchors = [...dest.matchAll(/^#{1,6} (.+)$/gm)].map(m => m[1].toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-'));
        if (!anchors.includes(decodeURIComponent(fragment))) throw new Error('Missing heading');
      }
      links++;
    } catch { broken.push(path.relative(root, file) + ' -> ' + target); }
  }
}
if (broken.length) { console.error(broken.join('\n')); process.exitCode = 1; }
else console.log('PASS ' + links + ' local links in ' + files.length + ' Markdown files.');

