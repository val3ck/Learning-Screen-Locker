import path from 'node:path';
import {homedir} from 'node:os';
import {access,readFile,writeFile,copyFile} from 'node:fs/promises';
import type {LearningModule} from '../src/core/contracts';
import {readAiEnv} from '../../shared/local-config.mjs';

export function sharedStatisticsPath(localAppData=process.env.LOCALAPPDATA||path.join(homedir(),'AppData','Local')){
  return path.join(localAppData,'SQL Recall','statistics');
}
function executableRoot(projectRoot:string){return path.basename(projectRoot)==='app.asar'?path.resolve(projectRoot,'../..'):projectRoot;}
function installationRoot(projectRoot:string,packaged:boolean){return packaged?path.resolve(executableRoot(projectRoot),'../..'):projectRoot;}
export function folderCoursesPath(projectRoot:string,packaged:boolean){
  return path.resolve(installationRoot(projectRoot,packaged),'../courses');
}
export function readRecallAiEnv(projectRoot:string,packaged:boolean){
  return readAiEnv(path.resolve(installationRoot(projectRoot,packaged),'..'));
}
export async function resolveCoursePath(projectRoot:string,packaged:boolean,legacyPath?:string){
  const installRoot=installationRoot(projectRoot,packaged);
  const candidates=[path.resolve(installRoot,'../SQL'),path.resolve(executableRoot(projectRoot),'../SQL'),legacyPath].filter((p):p is string=>!!p);
  for(const candidate of candidates)try{await access(path.join(candidate,'server.mjs'));return candidate;}catch{}
  return candidates[0];
}
export function legacyStatisticsRoots(projectRoot:string,packaged:boolean,legacyPath?:string){
  return [...new Set([path.join(installationRoot(projectRoot,packaged),'statistics'),path.join(executableRoot(projectRoot),'statistics'),legacyPath].filter((p):p is string=>!!p))];
}
export async function resolveEnglishPath(projectRoot:string,packaged:boolean,legacyPath?:string){
  const root=installationRoot(projectRoot,packaged),candidates=[path.resolve(root,'../english'),path.resolve(root,'../../UNI/english'),path.resolve(executableRoot(projectRoot),'../english'),legacyPath].filter((p):p is string=>!!p);
  for(const candidate of candidates)try{await access(path.join(candidate,'js/daily/engine.js'));return candidate;}catch{}
  return candidates[0];
}
export async function resolveNodePath(projectRoot:string,packaged:boolean,coursePath:string){
  const sibling=path.resolve(installationRoot(projectRoot,packaged),'../nodejs');
  try{await access(path.join(sibling,'package.json'));return sibling;}catch{}
  return path.resolve(coursePath,'../nodejs/new');
}
export async function configureCourseStorage(module:LearningModule,coursePath:string,statisticsPath:string,assetRoot:string){
  const source=module.progressAdapter.source;
  if(!source?.storageConfigFile)return;
  await access(path.join(coursePath,source.serverEntry));
  for(const asset of source.bridgeAssets||[]){
    const target=path.join(coursePath,asset),content=await readFile(path.join(assetRoot,asset),'utf8');
    let old:string|undefined;try{old=await readFile(target,'utf8');}catch{}
    if(old!==content){if(old!==undefined)try{await access(target+'.before-1.4');}catch{await copyFile(target,target+'.before-1.4');}await writeFile(target,content,'utf8');}
  }
  const target=path.join(coursePath,source.storageConfigFile),content=JSON.stringify({version:1,statisticsPath},null,2);
  let old:string|undefined;try{old=await readFile(target,'utf8');}catch{}
  if(old!==content){if(old!==undefined)try{await access(target+'.before-1.4');}catch{await copyFile(target,target+'.before-1.4');}await writeFile(target,content,'utf8');}
}

export async function resolveBrowserTutorPath(projectRoot:string,packaged:boolean,id:'git'|'vim'){
  const suiteRoot=path.resolve(installationRoot(projectRoot,packaged),'..');
  const relative=id==='git'?'git_tutor':path.join('neovim_tutor','neovim-quest');
  const candidates=[path.join(suiteRoot,relative),path.resolve(suiteRoot,'../PGM',relative)];
  for(const folder of candidates)try{await access(path.join(folder,'server.mjs'));return folder;}catch{}
  return null;
}
