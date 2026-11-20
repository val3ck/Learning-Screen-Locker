import type {Progress} from '../../core/contracts';
import sourceCatalog from './source-catalog.json';
import {CONTENT_VERSION,expandSkills,projectSkills,topicIds} from './catalog';
export const SOURCE_VERSION=JSON.stringify(sourceCatalog);
export function parseProgress(input:unknown):Progress {
  if(!input||typeof input!=='object')throw new Error('Файл не містить прогресу тренажера.');
  const data=input as Record<string,unknown>;
  if(data.version!==undefined&&data.version!==1)throw new Error('Непідтримувана версія прогресу.');
  if(data.catalogVersion!==undefined&&data.catalogVersion!==SOURCE_VERSION)throw new Error('Каталог тренажера змінився. Потрібне оновлення адаптера PostgreSQL.');
  if(!Array.isArray(data.completed)||!data.completed.every(i=>Number.isInteger(i)&&i>=0&&i<sourceCatalog.length))throw new Error('Некоректний список завершених вправ.');
  // Legacy exports have no fingerprint: require their full, recognizable state shape.
  if(data.catalogVersion===undefined&&(!Number.isInteger(data.index)||!data.drafts||typeof data.drafts!=='object'||Array.isArray(data.drafts)))throw new Error('Це не експорт Postgres Path.');
  const completed=[...new Set(data.completed as number[])];const skills:string[]=[];const practiced:string[]=[];
  for(const index of completed){
    const indices=index<37?[index]:index<45?projectSkills[index-37]:index===52?[1,3,4,5,10,11,12]:[];
    const used=expandSkills(indices.map(i=>topicIds[i]));skills.push(...used);if(index>=37)practiced.push(...used);
  }
  return {version:1,moduleId:'postgresql',catalogVersion:CONTENT_VERSION,confirmedTopicIds:[...new Set(skills)],practiceTopicIds:[...new Set(practiced)],completedSourceIds:completed.map(i=>`postgres-path:${i}`),syncedAt:typeof data.syncedAt==='string'&&!Number.isNaN(Date.parse(data.syncedAt))?data.syncedAt:new Date().toISOString()};
}
