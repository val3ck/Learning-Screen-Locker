import test from 'node:test';
import assert from 'node:assert/strict';
import {EnglishController, newEnglishDocument, validateEnglishDocument} from '../src/modules/english/controller';
import {isSpeakingDialogue, speakingBrief, topicConnection, type SpeakingDialogue} from '../src/modules/english/dialogue';
import {renderLiveSpeaking} from '../src/modules/english/live-speaking-view';
import {speakWithLuna} from '../electron/english-dialogue';
import * as Course from '../src/modules/english/vendor/course';
import type {EnglishLesson} from '../src/modules/english/types';

test('Luna asks for clarity, follows the learner’s reply, and needs two clear turns to close',async()=>{
  const lesson=Course.getLesson('daily-030') as EnglishLesson;
  assert.match(speakingBrief(lesson).opening,/two seconds/);
  assert.match(topicConnection(lesson),/filtered rows/);
  assert.ok((Course.lessons as EnglishLesson[]).every(l=>topicConnection(l)));
  const pagination=Course.getLesson('daily-033') as EnglishLesson;
  assert.match(speakingBrief(pagination).facts,/appointment history/);
  assert.match(speakingBrief(pagination).facts,/offset pages/);
  const grade={scores:{relevance:3,clarity:4,language:3},reason:'Your next step is understandable.',corrections:[]};
  let next:any={status:'clarify',reply:'Which search are you referring to?',feedback:'I could not tell which search you meant.'};
  let sent:any;
  const config={};
  const ai={config:()=>config,requestConfig:()=>config,chain:(work:any)=>work('openai',config),generate:async(_id:string,prompt:any)=>{
    sent=JSON.parse(prompt.user);
    return {hint:'Focus on the observed evidence.',recap:{},review:grade,...next};
  }};
  let state=await speakWithLuna(ai,lesson,'Random unrelated words.');
  assert.equal(state.clearReplies,0);
  assert.equal(state.status,'clarify');
  next={status:'ready',reply:'Done.',feedback:'Looks good.'};
  await assert.rejects(()=>speakWithLuna(ai,lesson,'I would check the plan.',state),/incomplete/);
  next={status:'continue',reply:'What would you look for in that plan?',feedback:'Checking the plan is a relevant first step.',
    recap:{action:'check the plan',reason:'The production server times out'},
    review:{...grade,corrections:[{original:'would checks',replacement:'would check',explanation:'Use the base verb after would.'},
      {original:'the server',replacement:'the database',explanation:'The learner did not write this.'}]}};
  state=await speakWithLuna(ai,lesson,'I would checks the plan.',state);
  assert.equal(sent.reply,'I would checks the plan.');
  assert.equal(sent.question,'Which search are you referring to?');
  assert.equal(sent.readyAllowed,false);
  assert.deepEqual(state.recap,{}); // A plausible line that was never said does not become context.
  const reviewed=state.messages.at(-2)!;
  assert.equal(reviewed.review?.score,84);
  assert.equal(reviewed.review?.corrections.length,1);
  const fix=reviewed.review!.corrections[0];
  assert.equal(reviewed.text.slice(fix.start,fix.end),'checks');
  assert.equal(fix.replacement,'check');
  next={status:'ready',reply:'Thanks, let’s compare the results.',feedback:'You named a signal and a comparable measurement.',
    recap:{verification:'compare timings with the same data'}};
  state=await speakWithLuna(ai,lesson,'I would check whether it scans the table and compare timings with the same data.',state);
  assert.equal(sent.readyAllowed,true);
  assert.equal(state.status,'ready');
  assert.equal(state.clearReplies,2);
  assert.deepEqual(state.recap,{verification:'compare timings with the same data'});
  assert.equal(state.messages.length,7);
  assert.equal('messages' in sent,false);
  assert.doesNotMatch(JSON.stringify(sent),/Random unrelated words|I would checks the plan/);
  assert.ok(isSpeakingDialogue(state));
  assert.equal(Object.hasOwn(state,'score'),false);
});

test('Speaking recap carries only confirmed excerpts and the view highlights the exact reply fragment',async()=>{
  const c=new EnglishController(newEnglishDocument());c.start();
  const attempt=c.document.course.activeSession!;attempt.blockIndex=5;
  const config={};
  const prompts:any[]=[];
  const ai={config:()=>config,requestConfig:()=>config,chain:(work:any)=>work('openai',config),generate:async(_id:string,prompt:any)=>{
    prompts.push(JSON.parse(prompt.user));
    return {status:'continue',reply:'How would you verify that change?',feedback:'The next step is clear.',
      hint:'Name a measurement you could compare before and after the change.',
      recap:{action:'change the reminder time',verification:'the service is faster'},
      review:{scores:{relevance:4,clarity:3,language:2},reason:'Your proposal is specific. Use a plural subject with the base verb.',
        corrections:[{original:'we changes',replacement:'we change',explanation:'Use change after we.'}]}};
  }};
  const first=await speakWithLuna(ai,attempt.lesson,'We should change the reminder time.');
  c.acceptSpeakingDialogue(first);
  const second=await speakWithLuna(ai,attempt.lesson,'First we changes the schedule.',first);
  c.acceptSpeakingDialogue(second);
  assert.deepEqual(prompts[1].recap,{action:'change the reminder time'});
  assert.doesNotMatch(JSON.stringify(prompts[1]),/We should change the reminder time|the service is faster/);
  const html=renderLiveSpeaking(c.view(),'');
  assert.match(html,/Current question/);
  assert.match(html,/Luna’s hint/);
  assert.match(html,/79\/100/);
  assert.match(html,/<mark class="en-speaking-error"[^>]*>changes<\/mark>/);
  assert.match(html,/Use change after we/);
  assert.doesNotMatch(html,/the service is faster/);
  assert.deepEqual(new EnglishController(validateEnglishDocument(c.document)).view().attempt?.liveSpeaking,second);
});

test('Saved Speaking conversations resume and only a completed dialogue opens Writing',()=>{
  const now=new Date('2026-11-20T19:00:00+02:00');
  const c=new EnglishController(newEnglishDocument(now),()=>now);
  c.start();
  const attempt=c.document.course.activeSession!;
  attempt.blockIndex=5;
  assert.equal(attempt.lesson.blocks[attempt.blockIndex].id,'speaking');
  const partial:SpeakingDialogue={turn:1,status:'continue',clearReplies:1,messages:[{role:'assistant',text:'What would you check?'}],feedback:'Name a specific signal.'};
  attempt.liveSpeaking=partial;
  assert.equal(c.view().canAdvance,false);
  const restored=new EnglishController(validateEnglishDocument(c.document),()=>now);
  assert.deepEqual(restored.view().attempt?.liveSpeaking,partial);
  restored.acceptSpeakingDialogue({...partial,turn:2,clearReplies:2,status:'ready'});
  assert.equal(restored.view().canAdvance,true);
  restored.dispatch({type:'advance'});
  assert.equal(restored.view().lesson.blocks[restored.view().attempt!.blockIndex].id,'writing');
});

test('A reminder channel and a plain before-and-after count end the dialogue without another metric question',async()=>{
  const lesson=Course.getLesson('daily-004') as EnglishLesson;
  const config={};
  let sent:any;
  const ai={config:()=>config,requestConfig:()=>config,chain:(work:any)=>work('openai',config),generate:async(_id:string,prompt:any)=>{
    sent=JSON.parse(prompt.user);
    assert.match(prompt.system,/A count or a rate is fine/);
    return {status:'continue',reply:'What exact attendance measure would you check?',feedback:'You chose a reminder and a comparison.',
      hint:'Think about who showed up.',recap:{verification:'how many patients came before and after'},
      review:{scores:{relevance:4,clarity:3,language:3},reason:'A clear comparison.',corrections:[]}};
  }};
  const old:SpeakingDialogue={turn:1,status:'continue',clearReplies:1,recap:{action:'test SMS reminders'},
    messages:[{role:'assistant',text:'What would you count?'}],feedback:'You picked SMS.'};
  const next=await speakWithLuna(ai,lesson,'I would compare how many patients came before and after.',old);
  assert.equal(sent.recap.action,'test SMS reminders');
  assert.equal(next.status,'ready');
  assert.doesNotMatch(next.messages.at(-1)!.text,/attendance measure/);
  assert.ok(isSpeakingDialogue(next));
});

test('An unfinished conversation stops after four replies and an existing loop can be closed without an API request',async()=>{
  const controller=new EnglishController(newEnglishDocument());controller.start();
  const attempt=controller.document.course.activeSession!;attempt.blockIndex=5;
  const config={};
  let sent:any;
  const ai={config:()=>config,requestConfig:()=>config,chain:(work:any)=>work('openai',config),generate:async(_id:string,prompt:any)=>{
    sent=JSON.parse(prompt.user);
    return {status:'clarify',reply:'Can you clarify?',feedback:'Work on one concrete detail.',
      hint:'Name one thing to check.',review:{scores:{relevance:1,clarity:1,language:2},reason:'The idea needs more detail.',corrections:[]}};
  }};
  assert.throws(()=>controller.dispatch({type:'finish-speaking'}),/few Speaking/);
  const long='I was trying to explain the next step. '.repeat(36).trim();
  for(let index=0;index<4;index++){
    const next=await speakWithLuna(ai,attempt.lesson,long,attempt.liveSpeaking);
    controller.acceptSpeakingDialogue(next);
    assert.equal(sent.reply,long);
  }
  assert.equal(sent.finalReply,true);
  assert.equal(attempt.liveSpeaking?.status,'wrapped');
  assert.equal(attempt.liveSpeaking?.clearReplies,0);
  assert.equal(controller.view().canAdvance,true);
  assert.ok(isSpeakingDialogue(attempt.liveSpeaking));
  await assert.rejects(()=>speakWithLuna(ai,attempt.lesson,long,attempt.liveSpeaking),/complete/);

  const saved:SpeakingDialogue={turn:11,status:'continue',clearReplies:11,
    messages:[{role:'assistant',text:'What exact attendance measure would you check?'}],feedback:'You chose SMS.'};
  attempt.liveSpeaking=saved;
  const reopened=new EnglishController(validateEnglishDocument(controller.document));
  const html=renderLiveSpeaking(reopened.view(),'');
  assert.match(html,/Finish Speaking/);
  assert.doesNotMatch(html,/Send reply/);
  reopened.dispatch({type:'finish-speaking'});
  assert.deepEqual(reopened.view().attempt?.liveSpeaking,{...saved,status:'wrapped'});
  assert.equal(reopened.view().canAdvance,true);
  reopened.dispatch({type:'advance'});
  assert.equal(reopened.view().lesson.blocks[reopened.view().attempt!.blockIndex].id,'writing');
});
