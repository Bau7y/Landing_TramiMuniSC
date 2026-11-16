/**
 * Open Graph image (1200×630 PNG) for one page, rendered at build time.
 * satori lays out the text as SVG paths (no system fonts needed) and sharp
 * rasterizes it. Pure function of its inputs: pages decide what to show.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';

import { OG_SIZE } from '../data/pages';

const require = createRequire(import.meta.url);
const fontFile = (weight: 400 | 700) => require.resolve(`@fontsource/geist/files/geist-latin-${weight}-normal.woff`);

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all(
    ([400, 700] as const).map(async (weight) => ({
      name: 'Geist',
      data: await readFile(fontFile(weight)),
      weight,
      style: 'normal' as const,
    })),
  ));

const COLORS = {
  canvas: '#f4f5f1',
  tint: '#e7eee5',
  text: '#17201a',
  muted: '#56625a',
  brand: '#2e7d32',
  accent: '#2e6b3f',
};

/** Building icon of the logo tile, as in public/favicon.svg. */
const ICON =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#2e7d32"/><g fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 26 32 16l18 10"/><path d="M14 26h36"/><path d="M20 31v13M28 31v13M36 31v13M44 31v13"/><path d="M12 49h40"/></g></svg>',
  ).toString('base64');

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

export interface OgContent {
  title: string;
  description: string;
  /** Small label above the title, e.g. the law or the section. */
  eyebrow: string;
  footer: string;
}

export async function renderOgImage({ title, description, eyebrow, footer }: OgContent): Promise<Buffer> {
  const titleSize = title.length > 60 ? 52 : title.length > 40 ? 58 : 66;
  const svg = await satori(
    el(
      'div',
      {
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 72px',
        backgroundColor: COLORS.canvas,
        backgroundImage: `radial-gradient(circle at 92% 8%, ${COLORS.tint} 0%, ${COLORS.canvas} 55%)`,
        fontFamily: 'Geist',
        color: COLORS.text,
      },
      [
        el('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
          el('img', { width: 64, height: 64 }, undefined, { src: ICON, width: 64, height: 64 }),
          el('div', { display: 'flex', fontSize: 34, fontWeight: 700, letterSpacing: -1 }, [
            el('span', {}, 'Trami'),
            el('span', { color: COLORS.brand }, 'Muni'),
            el('span', {}, 'SC'),
          ]),
        ]),
        el('div', { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1040 }, [
          el(
            'div',
            {
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '8px 18px',
              borderRadius: 999,
              backgroundColor: COLORS.tint,
              color: COLORS.accent,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
            },
            eyebrow,
          ),
          el('div', { display: 'block', fontSize: titleSize, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, lineClamp: 3 }, title),
          el('div', { display: 'block', fontSize: 26, lineHeight: 1.4, color: COLORS.muted, maxWidth: 980, lineClamp: 2 }, description),
        ]),
        el('div', { display: 'flex', fontSize: 24, color: COLORS.muted }, footer),
      ],
    ) as never,
    { ...OG_SIZE, fonts: await loadFonts() },
  );
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
}
