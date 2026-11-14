/**
 * Accessibility check: serves the static build and runs axe (WCAG 2.2 AA)
 * on every page, in light and dark mode. Exits with code 1 on violations.
 *
 *   yarn build && yarn test:a11y
 */
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const ROOT = '.vercel/output/static';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.jpg': 'image/jpeg' };

async function listPages(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name === 'index.html')
    .map((e) => '/' + relative(ROOT, join(e.parentPath, e.name)).split(sep).slice(0, -1).join('/'));
}

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = extname(path) ? join(ROOT, path) : join(ROOT, path, 'index.html');
  // Read first, then answer: a missing file (e.g. /_vercel/insights/script.js,
  // which only exists on Vercel) must become a clean 404.
  let body;
  try {
    body = await readFile(file);
  } catch {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
}).listen(0);

const base = `http://localhost:${server.address().port}`;
const pages = await listPages(ROOT);
// CHROMIUM_PATH lets you reuse a browser already installed on the machine.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
let failures = 0;

for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({ colorScheme: scheme, reducedMotion: 'reduce' });
  for (const page_path of pages) {
    const page = await context.newPage();
    await page.goto(base + page_path, { waitUntil: 'networkidle' });
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    for (const v of violations) {
      failures++;
      console.log(`✗ [${scheme}] ${page_path} — ${v.id}: ${v.help}`);
      v.nodes.slice(0, 3).forEach((n) => console.log(`    ${n.target.join(' ')}`));
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
server.close();
console.log(failures ? `\n${failures} violations` : `\n✓ ${pages.length} pages × 2 themes, no violations`);
process.exit(failures ? 1 : 0);
