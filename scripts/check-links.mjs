import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const OUT = resolve(import.meta.dirname, '..', 'out');
const HREF = /href="(\/[^"#?]*)(#[^"]*)?"/g;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function resolves(urlPath) {
  const rel = decodeURIComponent(urlPath).replace(/^\/+/, '') || 'index.html';
  for (const candidate of [rel, `${rel}.html`, join(rel, 'index.html')]) {
    if (await isFile(join(OUT, candidate))) return true;
  }
  return false;
}

if (!(await isFile(join(OUT, 'index.html')))) {
  console.error(`no export found at ${OUT} — run \`pnpm build\` first`);
  process.exit(1);
}

const broken = new Map();
let checked = 0;

for (const file of await walk(OUT)) {
  const html = await readFile(file, 'utf8');
  for (const [, path] of html.matchAll(HREF)) {
    if (path.startsWith('/_next/')) continue;
    checked++;
    if (await resolves(path)) continue;
    if (!broken.has(path)) broken.set(path, relative(OUT, file));
  }
}

console.log(`checked ${checked} internal links across the export`);

let failed = false;

if (broken.size > 0) {
  for (const [path, source] of broken) console.error(`  broken: ${path}  (in ${source})`);
  console.error(`${broken.size} distinct broken target(s)`);
  failed = true;
} else {
  console.log('no broken internal links');
}

const sitemapPath = join(OUT, 'sitemap.xml');
if (await isFile(sitemapPath)) {
  const xml = await readFile(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
  const missing = [];

  for (const loc of locs) {
    const { pathname } = new URL(loc);
    if (!(await resolves(pathname))) missing.push(loc);
  }

  console.log(`checked ${locs.length} sitemap entries`);
  if (missing.length > 0) {
    for (const loc of missing) console.error(`  sitemap entry does not resolve: ${loc}`);
    failed = true;
  }
} else {
  console.error('no sitemap.xml in the export');
  failed = true;
}

if (failed) process.exit(1);
