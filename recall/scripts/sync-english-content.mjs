import fs from 'node:fs/promises';
import {build} from 'esbuild';
// Browser and desktop are generated from one authored curriculum and engine.
for(const [name,dependency]of [['learning',''],['course',"import examples from './examples';\nimport * as learning from './learning';"],['engine',"import * as course from './course';"]]){
  const source=await fs.readFile(`integration/english-${name}.cjs`,'utf8'),start=source.indexOf("  'use strict';");
  if(start<0)throw Error('Unrecognised English content wrapper: '+name);
  const body=source.slice(start).replace(/return \{([^\n]+)\};\s*\}\);\s*$/,'export {$1};\n');
  if(!body.includes('export {'))throw Error('English content has no recognised exports: '+name);
  await fs.writeFile(`src/modules/english/vendor/${name}.ts`,'// @ts-nocheck\n// Generated from integration/english-'+name+'.cjs by scripts/sync-english-content.mjs.\n'+dependency+'\n'+body);
}
await build({entryPoints:['src/modules/english/browser-view.ts'],outfile:'integration/english-browser-block.js',bundle:true,platform:'browser',format:'iife',globalName:'RecallEnglishBlock',target:'es2022',minify:true});
await build({entryPoints:['electron/browser-speech.ts'],outfile:'integration/english-browser-speech.cjs',bundle:true,platform:'node',format:'cjs',target:'node22'});
await fs.copyFile('src/modules/english/view.css','integration/english-learning.css');
