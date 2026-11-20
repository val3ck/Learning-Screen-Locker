import assert from 'node:assert/strict';
import test from 'node:test';
import {SQLChat} from '../electron/sql-chat';
import {validSession} from '../electron/store';
import type {SessionRecord, Task} from '../src/core/contracts';
import {isStaleSessionUpdate,recordAttempt,updateHistory} from '../src/core/session';
import AI from '../integration/english-ai.cjs';

const task:Task={
  moduleId:'postgresql',contentVersion:'1',id:'a',templateId:'a',topicIds:['select'],seed:1,difficulty:1,
  title:'Report',brief:'Return the item names',hints:['local hint'],starter:'',payload:{solution:'answer key'},
  tables:[{name:'items',columns:[{name:'name',type:'text'}],rows:[{name:'test row'}]}],
};

function createSession():SessionRecord {
  return {version:1,id:'chat-session',moduleId:'postgresql',contentVersion:'1',dayKey:'2026-11-18',mode:'practice',startedAt:'2026-11-18T10:00:00Z',currentIndex:0,
    activeMs:0,tasks:[task,{...task,id:'b'},{...task,id:'c'}],answers:['select id from items','',''],attempts:[],hintLevels:[0,0,0],solved:[false,false,false],taskElapsedMs:[0,0,0]};
}

test('SQL chat asks Luna with five messages and resets context for the next exercise',async()=>{
  const session=createSession();
  recordAttempt(session,{status:'incorrect',message:'Wrong column'},true);
  session.answers[0]='select name from items';
  const prompts:string[]=[];
  const chat=new SQLChat({
    async generate(provider,prompt,config){assert.equal(provider,'openai');assert.equal(config.models.openai,'gpt-6-luna');assert.equal(prompt.maxOutputTokens,450);prompts.push(prompt.user);return {answer:'Check the selected columns.'};},
    async chain(work,providers,_kind,config){assert.deepEqual(providers,['openai','groq']);return work(providers[0],config);},
  },()=>({keys:{openai:'fake-config-key',groq:'fake-fallback-key'},models:{openai:'configured-model'}}),()=>true);
  for(let index=1;index<=4;index++){
    await chat.ask(session,{sessionId:session.id,taskId:task.id,question:`Question ${index} fake-config-key`,feedback:'Wrong column'});
  }
  const prompt=JSON.parse(prompts.at(-1)!);
  assert.equal(prompt.draft,'select name from items');
  assert.deepEqual(prompt.lastExecution,{status:'incorrect',checked:true,draftChanged:true,message:'Wrong column'});
  assert.equal(prompt.messages.length,5);
  assert.match(prompt.messages[0].text,/Question 2/);
  assert.match(prompt.messages[4].text,/Question 4/);
  assert.doesNotMatch(prompts.at(-1)!,/fake-config-key|test row|answer key|local hint/);
  assert.match(prompts.at(-1)!,/items/);
  session.currentIndex=1;
  await assert.rejects(chat.ask(session,{sessionId:session.id,taskId:'a',question:'Stale task'}),/поточну SQL-вправу/);
  await chat.ask(session,{sessionId:session.id,taskId:'b',question:'New exercise'});
  assert.deepEqual(JSON.parse(prompts.at(-1)!).messages,[{role:'user',text:'New exercise'}]);
});

test('Every submitted hint counts, with legacy assisted attempts still recognized',()=>{
  const session=createSession();
  session.hintLevels[0]=4;
  recordAttempt(session,{status:'correct',message:'OK'},true,new Date('2026-11-18T10:01:00Z'));
  const state={version:1 as const,moduleId:'postgresql',progress:null,history:{}};
  const stats=updateHistory(state,session);
  assert.equal(stats.history.select.assisted,1);
  assert.equal(stats.history.select.independent,0);
  assert.equal(session.attempts[0].hints,4);
  assert.equal(validSession(session),true);
  const legacy={...session,hintLevels:[0,0,0],attempts:[{...session.attempts[0],hints:1}]};
  assert.equal(updateHistory(state,legacy).history.select.assisted,1);
  assert.equal(isStaleSessionUpdate(session,legacy),true);
});

test('All providers honor the compact chat output limit',async()=>{
  const keys={openai:'fake',groq:'fake',gemini:'fake',openrouter:'fake'};
  const models={openai:'gpt-6-luna',groq:'fake',gemini:'fake',openrouter:'fake'};
  const limits:number[]=[];
  const client=new AI.EnglishAI({statisticsPath:'.',env:{},fetchImpl:async (_url:string,options:RequestInit)=>{
    const body=JSON.parse(String(options.body));
    limits.push(body.max_output_tokens??body.max_completion_tokens??body.max_tokens??body.generationConfig?.maxOutputTokens);
    const answer='{"answer":"Short hint."}';
    return Response.json({output:[{type:'message',content:[{type:'output_text',text:answer}]}],choices:[{message:{content:answer}}],candidates:[{content:{parts:[{text:answer}]}}]});
  }});
  for(const provider of Object.keys(keys))await client.generate(provider,{system:'Return JSON.',user:'{}',maxOutputTokens:450},{keys,models});
  assert.deepEqual(limits,[450,450,450,450]);
});
