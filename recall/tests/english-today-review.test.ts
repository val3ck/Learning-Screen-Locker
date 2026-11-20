import assert from 'node:assert/strict';
import test from 'node:test';
import {EnglishController,ENGLISH_EXTENSION_MS,ENGLISH_TARGET_MS,newEnglishDocument,validateEnglishDocument} from '../src/modules/english/controller';
import {renderEnglishScreen} from '../src/modules/english/lesson-view';

test('A +30 minute extension resumes the same lesson and saves a separate active-time budget',()=>{
 const now=new Date('2026-11-18T18:00:00Z'),controller=new EnglishController(newEnglishDocument(now),()=>now);
 controller.start();
 const attempt=controller.document.course.activeSession!;
 controller.dispatch({type:'select-block',value:'1'});
 controller.dispatch({type:'answer',key:'vocab-0',value:'Our feature saves time.'});
 const daily=controller.snapshot()!;
 controller.day().activeMs=ENGLISH_TARGET_MS-1000;
 controller.tick(1000,{active:true});
 assert.ok(controller.view().canExtend);
 assert.match(renderEnglishScreen(controller.view(),'',new Map()),/Допрацювати \+30 хв/);

 controller.startExtension();
 const extra=controller.snapshot()!;
 assert.notEqual(extra.id,daily.id);
 assert.equal(extra.payload.extraPractice,true);
 assert.equal(controller.document.course.activeSession?.id,attempt.id);
 assert.equal(controller.document.course.activeSession?.blockIndex,1);
 assert.equal(controller.document.course.activeSession?.answers['vocab-0'],'Our feature saves time.');
 const screen=renderEnglishScreen(controller.view(),'',new Map());
 assert.match(screen,/0:00 \/ 30:00/);assert.match(screen,/Вийти й зберегти/);
 controller.tick(5000,{active:false});controller.tick(5000,{active:true,waiting:true});
 assert.equal(extra.activeMs,0);
 controller.tick(5000,{active:true});controller.pause();
 const resumed=new EnglishController(validateEnglishDocument(controller.document),()=>now);
 assert.ok(resumed.view().canExtend);
 resumed.startExtension();
 assert.equal(resumed.snapshot()?.id,extra.id);
 assert.equal(resumed.snapshot()?.activeMs,5000);
 resumed.snapshot()!.activeMs=ENGLISH_EXTENSION_MS-1000;
 resumed.tick(5000,{active:true});
 assert.equal(resumed.snapshot()?.activeMs,ENGLISH_EXTENSION_MS);
 assert.equal(resumed.snapshot()?.status,'partial');
 assert.equal(resumed.day().activeMs,ENGLISH_TARGET_MS);
 assert.equal(resumed.view().canExtend,false);
 assert.equal(resumed.document.course.activeSession?.id,attempt.id);
});

test('An extension finishes at the Kyiv learning-day boundary with work preserved',()=>{
 let now=new Date('2026-11-18T23:00:00Z');
 const controller=new EnglishController(newEnglishDocument(now),()=>now);
 controller.start();controller.day().activeMs=ENGLISH_TARGET_MS-1000;controller.tick(1000,{active:true});controller.startExtension();
 const attempt=controller.document.course.activeSession!;
 controller.tick(1000,{active:true});
 now=new Date('2026-11-19T03:00:00Z');controller.tick(5000,{active:true});
 assert.equal(controller.snapshot()?.status,'partial');assert.equal(controller.snapshot()?.activeMs,1000);
 assert.equal(controller.day().activeMs,0);assert.equal(controller.canExtend(),false);
 assert.equal(controller.document.course.activeSession?.id,attempt.id);
});
