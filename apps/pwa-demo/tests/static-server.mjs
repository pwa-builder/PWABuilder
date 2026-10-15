// A Pages-like test server: directory index files, never an SPA/404 fallback.
// node tests/static-server.mjs --dir .pages-test --base /PWABuilder/ --port 4176
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, sep, extname } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    dir: { type: 'string', default: 'dist' },
    base: { type: 'string', default: '/' },
    port: { type: 'string', default: '4176' },
  },
});
const root = resolve(values.dir);
const base = values.base;
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('--base must start and end with /');
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2',
};
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (!url.pathname.startsWith(base)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const path = resolve(root, decodeURIComponent(url.pathname.slice(base.length)));
    const local = relative(root, path);
    if (local === '..' || local.startsWith(`..${sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const info = await stat(path);
    if (info.isDirectory() && !url.pathname.endsWith('/')) {
      response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    const file = info.isDirectory() ? resolve(path, 'index.html') : path;
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') response.writeHead(404).end('Not found');
    else {
      console.error(error);
      response.writeHead(500).end('Server error');
    }
  }
}).listen(Number(values.port), '127.0.0.1', () => {
  console.log(`Static test server: http://127.0.0.1:${values.port}${base}`);
});
