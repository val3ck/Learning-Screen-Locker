import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {FolderCourseLibrary,readFolderCourses} from '../electron/folder-courses';
import {folderCoursesPath} from '../electron/locations';
import {Store} from '../electron/store';

test('The Docker sample loads from the same library in source and the Windows release layout',async()=>{
  const actual=folderCoursesPath(process.cwd(),false);
  assert.equal(folderCoursesPath(path.join(process.cwd(),'release-local-demo','win-unpacked','resources','app.asar'),true),actual);
  const result=await readFolderCourses(actual);
  const pilot=result.courses.find(course=>course.id==='docker-compose');
  assert.ok(pilot,result.issues.join('\n'));
  assert.equal(pilot.lessons.length,3);
  assert.equal(pilot.lessons.flatMap(lesson=>lesson.activities).length,6);
});

test('A fresh course folder validates, saves answers by stable ID, and reschedules review at 05:00 Kyiv',async t=>{
  const temp=await mkdtemp(path.join(os.tmpdir(),'recall-course-'));
  t.after(()=>rm(temp,{recursive:true,force:true}));
  const root=path.join(temp,'courses');
  const folder=path.join(root,'demo');
  const broken=path.join(root,'broken');
  await mkdir(folder,{recursive:true});
  await mkdir(broken);
  const lesson={id:'start',title:'Start',body:'start.md',activities:[
    {id:'port',prompt:'Which port?',kind:'text',accepted:['8080'],feedback:'Use the published port.',recall:true},
    {id:'name',prompt:'Which name?',kind:'choice',answer:'db',options:[{id:'db',label:'db'},{id:'host',label:'host'}],feedback:'Use the service name.'},
  ]};
  const manifest={version:1,id:'demo',title:'Example',description:'A new course folder',lessons:[lesson]};
  await writeFile(path.join(folder,'course.json'),JSON.stringify(manifest));
  await writeFile(path.join(folder,'start.md'),'## Lesson\n\n`docker compose ps`');
  await writeFile(path.join(broken,'course.json'),JSON.stringify({...manifest,id:'broken',lessons:[{...lesson,body:'../start.md'}]}));
  const stats=path.join(temp,'statistics');
  let now=new Date('2026-11-23T02:59:00Z');
  let service=new FolderCourseLibrary(root,new Store(stats),()=>now);
  const opened=await service.list();
  assert.match(opened.issues[0],/broken\/course\.json.*lessons\.start\.body/);
  assert.equal(opened.courses.length,1);
  assert.ok(!JSON.stringify(opened.courses).includes('8080'));
  const input={courseId:'demo',lessonId:'start',activityId:'port',answer:'1000'};
  const results=await Promise.all([service.submit(input),service.submit({...input,answer:' 8080 '})]);
  assert.equal(results[0].correct,false);
  assert.equal(results[1].correct,true);
  assert.equal(results[1].course.lessons[0].activities[0].misses,1);
  assert.equal(results[1].course.lessons[0].activities[0].due,false);
  assert.equal((await service.submit({...input,activityId:'name',answer:'db'})).correct,true);
  await assert.rejects(service.submit({...input,courseId:'../demo'}));

  now=new Date('2026-11-23T03:00:00Z');
  await writeFile(path.join(folder,'course.json'),JSON.stringify({...manifest,lessons:[{...lesson,title:'Renamed'}]}));
  service=new FolderCourseLibrary(root,new Store(stats),()=>now);
  const reopened=(await service.list()).courses[0].lessons[0];
  assert.equal(reopened.title,'Renamed');
  assert.deepEqual(reopened.activities.map(activity=>[activity.passed,activity.due]),[[true,true],[true,false]]);
  assert.equal((await service.submit({...input,answer:'8080'})).course.lessons[0].activities[0].due,false);
  assert.match(await readFile(path.join(stats,'course-library','demo.json'),'utf8'),/2026-11-23/);
});
