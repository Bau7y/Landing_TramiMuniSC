/** Serves the static build (.vercel/output/static) on a random port, for local checks. */
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

export const ROOT = '.vercel/output/static';
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

/** Paths of every built page ("/", "/contacto", …). */
export async function listPages(dir = ROOT) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name === 'index.html')
    .map((e) => '/' + relative(dir, join(e.parentPath, e.name)).split(sep).slice(0, -1).join('/'));
}

/** Starts the server; returns its base URL and a close function. */
export async function startStaticServer(dir = ROOT) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = extname(path) ? join(dir, path) : join(dir, path, 'index.html');
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
  });
  await new Promise((resolve) => server.listen(0, resolve));
  return { base: `http://localhost:${server.address().port}`, close: () => server.close() };
}
