import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const course=path.resolve(process.argv[2]||'../SQL');
const project=path.resolve('.');
const appPath=path.join(course,'app.js'),serverPath=path.join(course,'server.mjs');
let app=await fs.readFile(appPath,'utf8'),server=await fs.readFile(serverPath,'utf8');
if(!app.includes("const key='postgres-path-v1'")||!server.includes("server.listen(4173,'127.0.0.1'"))throw new Error('Unrecognized course; no changes were made.');
try{await fs.access(appPath+'.before-1.4');}catch{await fs.copyFile(appPath,appPath+'.before-1.4');}
for(const file of ['app.js','server.mjs']){const backup=path.join(course,file+'.before-recall');try{await fs.access(backup);}catch{await fs.copyFile(path.join(course,file),backup);}}
for(const file of ['recall-bridge.mjs','recall-sync.js'])await fs.copyFile(path.join(project,'integration',file),path.join(course,file));
const statisticsPath=path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'AppData','Local'),'SQL Recall','statistics');
await fs.writeFile(path.join(course,'recall-config.json'),JSON.stringify({version:1,statisticsPath},null,2));
if(!app.includes("import {queueRecallProgress}")){
  app="import {queueRecallProgress} from './recall-sync.js';\n"+app;
  if(!app.includes('function save(){try{'))throw new Error('Course save hook changed.');
  app=app.replace('function save(){try{','function save(){queueRecallProgress(state.completed);try{');
  app=app.replace("function validState(s){","queueRecallProgress(state.completed);\nfunction validState(s){");
  await fs.writeFile(appPath,app,'utf8');
}
if(!server.includes("import {recallBridge}")){
  server="import {recallBridge} from './recall-bridge.mjs';\n"+server;
  if(!server.includes('async(req,res)=>{try{'))throw new Error('Course server hook changed.');
  server=server.replace('async(req,res)=>{try{','async(req,res)=>{if(await recallBridge(req,res))return;try{');
  await fs.writeFile(serverPath,server,'utf8');
}
console.log('Course integration installed. Existing progress and drafts were not modified. Backups: app.js.before-recall, server.mjs.before-recall.');
app=await fs.readFile(appPath,'utf8');
if(!app.includes('restoreRecallProgress')){
  app=app.replace("import {queueRecallProgress}","import {queueRecallProgress,restoreRecallProgress}");
  app=app.replace('queueRecallProgress(state.completed);\nfunction validState','function validState');
  app=app.replace('queueRecallProgress(state.completed);try{','queueRecallProgress(state.completed,state);try{');
  app+="\nvoid restoreRecallProgress(state).then(saved=>{if(!validState(saved))return;state=saved;state.unlockedThrough=unlockedFromProgress(state);save();progress();navigation();if(mode==='map')renderMap();});\n";
  await fs.writeFile(appPath,app,'utf8');
}
