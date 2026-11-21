import test from 'node:test';import assert from 'node:assert/strict';import {Engine,STORAGE_KEY,validateImport} from '../src/modules/english/vendor/engine';import {EnglishController,newEnglishDocument,validateEnglishDocument} from '../src/modules/english/controller';import Bridge from '../integration/english-bridge.cjs';
test('Manual advance archives unfinished work, preserves real scores and does not grant completion, XP or extra time',()=>{const c=new EnglishController(newEnglishDocument());c.start();c.dispatch({type:'answer',key:'writing',value:'Keep my original unfinished response.'});c.pause();const before=structuredClone(c.document),storage={getItem:()=>JSON.stringify(c.document.course),setItem:(key:string,value:string)=>{if(key===STORAGE_KEY)c.document.course=JSON.parse(value);}},engine:any=new Engine(storage);engine.advanceByRequest();const next=engine.start();engine.pause(true);assert.equal(next.lessonId,'daily-002');const doc=validateEnglishDocument(c.document),restored=new EnglishController(doc),archive=(doc.course.migration as any).manualAdvances[0];assert.equal(archive.attempt.answers.writing,before.course.activeSession!.answers.writing);assert.equal(archive.attempt.status,'active');assert.equal(doc.course.sessions.length,0);assert.equal(doc.course.xp,before.course.xp);assert.deepEqual(doc.days,before.days);assert.deepEqual(doc.runs,before.runs);assert.equal(restored.view().lesson.id,'daily-002');assert.ok(restored.view().savedWork!.some(x=>x.title.includes('skipped at your request')&&x.answers.writing==='Keep my original unfinished response.'));assert.equal(restored.view().completedLessons,0);const merged:any=Bridge.mergeCourse(before.course,doc.course);assert.equal(merged.activeSession.lessonId,'daily-002');assert.equal(new Engine({getItem:()=>JSON.stringify(merged),setItem:()=>{}}).nextLesson().id,'daily-002');assert.equal((Bridge.mergeCourse(doc.course,before.course) as any).activeSession.lessonId,'daily-002');const bad=structuredClone(doc.course);(bad.migration as any).manualAdvances[0].attempt.lessonId='daily-084';assert.throws(()=>validateImport(bad));});

test('A legacy lesson-upgrade snapshot is preserved without becoming a skipped lesson',()=>{
  const controller=new EnglishController(newEnglishDocument());
  controller.start();
  controller.dispatch({type:'answer',key:'writing',value:'My current draft stays here.'});
  const data=JSON.parse(JSON.stringify(controller.document)) as ReturnType<typeof newEnglishDocument>;
  const attempt=data.course.activeSession!;
  const archived={fromLessonId:attempt.lessonId,toLessonId:attempt.lessonId,at:new Date().toISOString(),reason:'Backup of prior lesson before content upgrade',attempt:{...structuredClone(attempt),answers:{writing:'My earlier draft.'}}};
  (data.course.migration as any).manualAdvances=[archived];
  const loaded=validateEnglishDocument(data);
  assert.deepEqual(loaded.course.activeSession,attempt);
  assert.deepEqual((loaded.course.migration as any).manualAdvances,[]);
  assert.deepEqual((loaded.course.migration as any).lessonBackups,[archived]);
  assert.deepEqual(validateEnglishDocument(loaded),loaded);
  const engine=new Engine({getItem:()=>JSON.stringify(loaded.course),setItem:()=>{}});
  assert.equal(engine.nextLesson().id,attempt.lessonId);
  assert.deepEqual((data.course.migration as any).manualAdvances,[archived]);
});
