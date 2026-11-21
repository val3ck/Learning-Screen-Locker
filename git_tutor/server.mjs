import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dataRoot } from './lib/git.mjs';
import { Tutor } from './lib/tutor.mjs';
import { chapters } from './lib/course.mjs';

const project = path.dirname(fileURLToPath(import.meta.url));
const address = '127.0.0.1';
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/luna-chat.js', ['../../shared/tutor-luna.js', 'text/javascript; charset=utf-8']],
  ['/luna-chat.css', ['../../shared/tutor-luna.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
]);

async function readJSON(req) {
  let length = 0;
  const chunks = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 65536) throw Error('Запит задовгий.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Error('Некоректний запит.'); }
}

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

export async function startServer({ directory = path.join(project, 'data'), port = 0 } = {}) {
  const tutor = await Tutor.open(directory);
  const token = randomBytes(24).toString('hex');
  let tasks = Promise.resolve();
  let host = '';
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    if (req.headers.host !== host) return json(res, 403, { error: 'Сервер доступний через локальну адресу запуску.' });
    if (req.method === 'GET' && assets.has(req.url)) {
      const [file, type] = assets.get(req.url);
      try {
        const body = await readFile(path.join(project, 'public', file));
        res.writeHead(200, { 'Content-Type': type });
        res.end(body);
      } catch { json(res, 500, { error: 'Не вдалося завантажити інтерфейс.' }); }
      return;
    }
    if(req.method==='GET'&&req.url==='/api/recall/status'){
      if(req.headers['x-git-tutor-token']!==token)return json(res,403,{error:'Недійсний сеанс.'});
      const ids=chapters.flatMap(([,items])=>items);
      return json(res,200,{version:1,id:'git',done:ids.filter(id=>tutor.doc.missions[id]?.completed).length,total:ids.length});
    }
    if (req.method !== 'POST' || req.url !== '/api') return json(res, 404, { error: 'Сторінку не знайдено.' });
    if (req.headers.origin !== 'http://' + host || req.headers['x-git-tutor-token'] !== token) {
      return json(res, 403, { error: 'Відкрий адресу, яку показав Start-Git-Tutor.bat.' });
    }
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return json(res, 415, { error: 'Очікується JSON.' });
    try {
      const input = await readJSON(req);
      const next = tasks.then(() => tutor.action(input));
      tasks = next.catch(() => {});
      json(res, 200, await next);
    } catch (error) {
      json(res, 400, { error: error instanceof Error ? error.message : 'Не вдалося виконати дію.' });
    }
  });
  server.requestTimeout = 15000;
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, address, () => {
      host = address + ':' + server.address().port;
      server.off('error', reject);
      resolve();
    });
  });
  return {
    server, tutor, token, origin: 'http://' + host, url: 'http://' + host + '/#' + token,
    async close() {
      tutor.close();
      try { await tasks; } finally { tutor.close(); }
      await new Promise(resolve => server.close(resolve));
    },
  };
}

async function startupLock(directory) {
  const file = path.join(directory, '.running');
  for (let i = 0; i < 2; i++) {
    try {
      const handle = await open(file, 'wx');
      try { await handle.writeFile(String(process.pid)); }
      finally { await handle.close(); }
      return () => unlink(file).catch(() => {});
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const raw = await readFile(file, 'utf8');
      if (!/^\d+$/.test(raw)) throw Error('Git Tutor запускається в іншому вікні.');
      try { process.kill(Number(raw), 0); }
      catch (signalError) {
        if (signalError.code === 'ESRCH') { await unlink(file); continue; }
        throw signalError;
      }
      throw Error('Git Tutor уже працює. Повернись до відкритої вкладки або адреси в першому вікні.');
    }
  }
  throw Error('Не вдалося відкрити папку прогресу.');
}

async function main() {
  const directory = await dataRoot(process.env.GIT_TUTOR_DATA_DIR||path.join(project, 'data'));
  const unlock = await startupLock(directory);
  try {
    const app = await startServer({ directory });
    const endpoint=path.join(directory,'recall-endpoint.json');
    try{
      await writeFile(endpoint+'.tmp',JSON.stringify({version:1,id:'git',pid:process.pid,origin:app.origin,token:app.token}),{mode:0o600});
      await rename(endpoint+'.tmp',endpoint);
    }catch(error){await app.close();throw error;}
    console.log('Git Tutor: ' + app.url);
    console.log('Ctrl+C завершує сервер. Збережений прогрес лишається на диску.');
    if (process.argv.includes('--open') && process.platform === 'win32') {
      const browser = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', app.url], {
        shell: false, stdio: 'ignore', windowsHide: true,
      });
      browser.on('error', () => console.log('Відкрий адресу вище у браузері.'));
      browser.unref();
    }
    let stopping = false;
    const stop = async () => {
      if (stopping) return;
      stopping = true;
      try { await app.close(); }
      finally {await unlink(endpoint).catch(()=>{});await unlock();}
    };
    process.on('SIGINT', () => void stop());
    process.on('SIGTERM', () => void stop());
  } catch (error) {
    await unlock();
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
