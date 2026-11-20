import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {Store} from '../electron/store';
import {migrateLegacyStatistics} from '../electron/migrate';
import {resolveCoursePath,sharedStatisticsPath,configureCourseStorage,legacyStatisticsRoots} from '../electron/locations';
import {postgresql} from '../src/modules/postgresql';
import {SOURCE_VERSION} from '../src/modules/postgresql/progress';
import {createSession,isStaleSessionUpdate} from '../src/core/session';

test('Перенесення C → D об’єднує історію й підтвердження, не стирає чернетку та не дублює статистику',async()=>{
  const temp=await mkdtemp(path.join(tmpdir(),'recall-migration-'));
  try{
    const a=new Store(path.join(temp,'old-C')),b=new Store(path.join(temp,'moved-D')),target=new Store(path.join(temp,'LocalAppData','SQL Recall','statistics'));
    const source={version:1,catalogVersion:SOURCE_VERSION,completed:[0,1,4],syncedAt:'2026-11-13T12:00:00Z'};
    const progress=postgresql.progressAdapter.parse(source),state={version:1 as const,moduleId:'postgresql',progress,history:{}};
    const finished=createSession(postgresql,state,[],'2026-11-12','practice',new Date('2026-11-12T12:00:00Z'),123);
    finished.solved=[true,true,true];finished.activeMs=700000;finished.endedAt='2026-11-12T12:15:00Z';finished.outcome='completed';
    const unfinished=createSession(postgresql,state,[],'2026-11-14','practice',new Date('2026-11-14T12:00:00Z'),456);
    unfinished.solved=[true,true,false];unfinished.currentIndex=2;unfinished.answers[2]='SELECT 42; -- моя чернетка';unfinished.paused=true;
    await a.saveSession(finished);await b.saveSession(finished);await a.saveSession(unfinished);
    await a.write('modules/postgresql/progress-source.json',source);
    await b.write('modules/postgresql/progress-source.json',{...source,completed:[2]});
    await b.write('settings.json',{version:1,setupComplete:true,autoStart:true,activeModuleId:'postgresql',coursePath:'old-course',statisticsPath:a.root,dailyEnabledAfterDay:'2026-11-14'});
    const original=await readFile(path.join(a.root,'sessions',`${unfinished.id}.json`),'utf8');
    const lateSave=structuredClone(unfinished),extended=structuredClone(unfinished);extended.tasks.push({...extended.tasks[0],id:'bonus'});extended.solved.push(false);extended.currentIndex=3;
    assert.equal(isStaleSessionUpdate(extended,lateSave),true);assert.equal(isStaleSessionUpdate(unfinished,structuredClone(unfinished)),false);
    await migrateLegacyStatistics(target,[b.root],new Date('2026-11-14T13:00:00Z'));
    const sessions=await target.sessions(),merged=await target.module('postgresql'),settings=await target.settings('new-course');
    assert.equal(sessions.length,2);assert.equal(sessions[1].answers[2],unfinished.answers[2]);assert.equal(sessions[1].paused,true);
    assert.ok(merged.progress!.confirmedTopicIds.includes('where'));assert.ok(merged.progress!.confirmedTopicIds.includes('calculations'));assert.ok(!merged.progress!.confirmedTopicIds.includes('joins'));
    assert.equal(settings.setupComplete,true);assert.equal(settings.statisticsPath,target.root);assert.equal(settings.dailyEnabledAfterDay,'2026-11-12');
    assert.ok(Object.values(merged.history).some(h=>h.independent>0));
    const snapshot=JSON.stringify(merged);await migrateLegacyStatistics(target,[b.root]);assert.equal(JSON.stringify(await target.module('postgresql')),snapshot);
    assert.equal((await target.sessions()).length,2);assert.equal(await readFile(path.join(a.root,'sessions',`${unfinished.id}.json`),'utf8'),original);
    assert.ok(JSON.parse(await readFile(path.join(target.root,'migration.json'),'utf8')).roots.includes(a.root));
  }finally{await rm(temp,{recursive:true,force:true});}
});
test('Постійна папка даних не залежить від диска програми, шлях тренажера знаходиться від нової папки',async()=>{
  const temp=await mkdtemp(path.join(tmpdir(),'recall-location-'));
  try{
    const install=path.join(temp,'D','Learning','PGM','winlocker'),course=path.resolve(install,'../SQL');
    await mkdir(course,{recursive:true});await writeFile(path.join(course,'server.mjs'),'// local course');
    assert.equal(await resolveCoursePath(path.join(install,'release','win-unpacked'),true,'C:/missing/SQL'),course);
    const asarRoot=path.join(install,'release','win-unpacked','resources','app.asar');
    assert.equal(await resolveCoursePath(asarRoot,true,'C:/missing/SQL'),course);
    assert.ok(legacyStatisticsRoots(asarRoot,true).includes(path.join(install,'statistics')));
    assert.equal(sharedStatisticsPath(path.join(temp,'profile')),path.join(temp,'profile','SQL Recall','statistics'));
    await configureCourseStorage(postgresql,course,sharedStatisticsPath(temp),path.resolve('integration'));
    assert.equal(JSON.parse(await readFile(path.join(course,'recall-config.json'),'utf8')).statisticsPath,sharedStatisticsPath(temp));
    assert.ok((await readFile(path.join(course,'recall-bridge.mjs'),'utf8')).includes('trainer-state.json'));
  }finally{await rm(temp,{recursive:true,force:true});}
});
