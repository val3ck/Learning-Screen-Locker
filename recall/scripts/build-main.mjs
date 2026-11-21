import {build} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
await fs.mkdir('resources',{recursive:true});
await fs.writeFile('resources/runtime.json',JSON.stringify({version:2,storage:'local-app-data'},null,2));
await build({entryPoints:{main:'electron/main.ts',preload:'electron/preload.ts','warning-preload':'electron/warning-preload.ts','browser-tutor-preload':'electron/browser-tutor-preload.ts','browser-tutor-site-preload':'electron/browser-tutor-site-preload.ts','sql-validator':'electron/sql-validator.ts','node-night-preload':'electron/node-night-preload.ts','node-night-controls-preload':'electron/node-night-controls-preload.ts'},outdir:'dist-main',outExtension:{'.js':'.cjs'},bundle:true,platform:'node',format:'cjs',target:'node22',external:['electron','@electric-sql/pglite'],define:{'import.meta.url':'"file:///unused-main-worker"'}});
