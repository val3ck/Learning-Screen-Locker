import {spawn} from 'node:child_process';
import {createServer} from 'vite';
import {createRequire} from 'node:module';
await import('./build-main.mjs');
const server=await createServer();await server.listen();
const env={...process.env,RECALL_DEV_URL:'http://127.0.0.1:5173/'};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(createRequire(import.meta.url)('electron'),['.'],{stdio:'inherit',env});
child.on('exit',()=>{void server.close();process.exit();});
