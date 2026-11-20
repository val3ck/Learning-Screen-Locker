import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { createCourseBridge } from './course-bridge';

const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');
const bridge = createCourseBridge(root);
const media: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
const server = createServer((req, res) => {
  if (req.headers.host !== '127.0.0.1:' + req.socket.localPort) { res.writeHead(403).end(); return; }
  bridge(req, res, () => {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
    const pathname = new URL(req.url || '/', 'http://127.0.0.1:5174').pathname;
    const file = resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
    const mime = media[extname(file)];
    if (!file.startsWith(dist + sep) || !mime || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404).end(); return;
    }
    res.writeHead(200, {
      'Content-Type': mime, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'",
    });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).on('error', () => res.destroy()).pipe(res);
  });
});
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(error.code === 'EADDRINUSE' ? 'Порт 5174 уже зайнятий.' : error.message);
  process.exitCode = 1;
});
const port = process.env.BACKEND_PATH_DATA_DIR && process.env.BACKEND_PATH_PORT === '0' ? 0 : 5174;
server.listen(port, '127.0.0.1', () => {
  const address = server.address();
  if (address && typeof address === 'object') console.log('Backend Path listening on ' + address.port);
});
