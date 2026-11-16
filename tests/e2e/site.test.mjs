/**
 * Smoke tests over the static build: the contact form validates before
 * sending, and the SEO endpoints are well formed.
 *
 *   yarn build && yarn test:e2e
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startStaticServer } from '../../scripts/lib/static_server.mjs';

let server;
let browser;

before(async () => {
  server = await startStaticServer();
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
});

after(async () => {
  await browser?.close();
  server?.close();
});

async function openForm(path) {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto(server.base + path);
  return page;
}

describe('formulario de contacto', () => {
  it('marca todos los campos requeridos, incluida la casilla de privacidad', async () => {
    const page = await openForm('/contacto');
    await page.click('.form_submit');
    const invalid = await page.$$eval('[aria-invalid="true"]', (els) => els.map((e) => e.id).sort());
    assert.deepEqual(invalid, ['consent', 'email', 'message', 'name', 'subject']);
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'name');
    await page.close();
  });

  it('no envía sin aceptar la política, aunque lo demás esté bien', async () => {
    const page = await openForm('/contacto');
    await page.fill('#name', 'Ana Rojas');
    await page.fill('#email', 'ana@example.com');
    await page.fill('#subject', 'Exoneración');
    await page.fill('#message', 'Quiero exonerar mi propiedad este año.');
    await page.click('.form_submit');
    assert.equal(
      await page.textContent('#consent_error'),
      'Debe aceptar la política de privacidad para enviar el mensaje',
    );
    await page.close();
  });

  it('muestra los errores en inglés en /en/contact', async () => {
    const page = await openForm('/en/contact');
    await page.click('.form_submit');
    assert.equal(await page.textContent('#consent_error'), 'You must accept the privacy policy to send the message');
    await page.close();
  });
});

describe('SEO', () => {
  const get = (path) => fetch(server.base + path);

  it('la 404 no se indexa ni declara canonical', async () => {
    const html = await (await get('/404.html')).text();
    assert.match(html, /<meta name="robots" content="noindex, follow"/);
    assert.doesNotMatch(html, /rel="canonical"/);
  });

  it('el sitemap lista cada página con sus versiones de idioma', async () => {
    const xml = await (await get('/sitemap.xml')).text();
    const urls = xml.match(/<url>/g) ?? [];
    const alternates = xml.match(/hreflang="x-default"/g) ?? [];
    assert.ok(urls.length > 10);
    assert.equal(alternates.length, urls.length);
    assert.doesNotMatch(xml, /404/);
  });

  it('cada página tiene su imagen Open Graph de 1200×630', async () => {
    const html = await (await get('/guias/exoneracion-bien-unico')).text();
    const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    assert.ok(image?.endsWith('/og/guias/exoneracion-bien-unico.png'));
    const png = Buffer.from(await (await get(new URL(image).pathname)).arrayBuffer());
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  });

  it('llms.txt resume servicios y guías', async () => {
    const text = await (await get('/llms.txt')).text();
    assert.match(text, /^# TramiMuniSC/);
    assert.match(text, /## Servicios/);
    assert.match(text, /## Guías/);
  });
});
