/**
 * Accessibility check: serves the static build and runs axe (WCAG 2.2 AA)
 * on every page, in light and dark mode. Exits with code 1 on violations.
 *
 *   yarn build && yarn test:a11y
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { listPages, startStaticServer } from './lib/static_server.mjs';

const { base, close } = await startStaticServer();
const pages = await listPages();
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
close();
console.log(failures ? `\n${failures} violations` : `\n✓ ${pages.length} pages × 2 themes, no violations`);
process.exit(failures ? 1 : 0);
