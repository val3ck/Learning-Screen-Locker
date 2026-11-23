import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import AI from '../integration/english-ai.cjs';import P from '../integration/english-ai-prompts.cjs';import * as C from '../src/modules/english/vendor/course';import * as L from '../src/modules/english/vendor/learning';import {EnglishController,newEnglishDocument} from '../src/modules/english/controller';
const fixture=()=>new AI.EnglishAI({statisticsPath:fs.mkdtempSync(path.join(os.tmpdir(),'recall-ai-test-')),env:{}});
const bundle=()=>P.context((C as any).lessons[0],'writing',[{key:'writing',task:'Explain your own view about project introductions, with a reason.',text:'I prefer to introduce the users first because their needs shape the project.'}]);
const reply=(b:any,off=false)=>({answers:b.answers.map((a:any)=>({key:a.key,relevance:off?'off_task':'on_task',scores:{task:off?0:3,grammar:3,vocabulary:3,clarity:3,coherence:3},summary:'Your reasoning is clear for this task.',strengths:['A reason is given.'],conclusion:{skill:'maintain',focus:'Закріпи зрозумілу відповідь.',rule:'Збережи головну думку та додай причину за потреби.',example:'This tool helps our team.',practice:'Name one helpful tool.',solution:'Any relevant tool is acceptable.'},corrections:[],nextStep:'Explain one limitation.'}))});

test('A 413 causes smaller grading requests and a later failure preserves already checked answers',async()=>{
 const ai=fixture();ai.save({provider:'groq',key:'mock'});
 const base=bundle();base.answers=Array.from({length:4},(_,i)=>({
  key:'review-'+i,task:'State one reason for your own opinion.',text:`I prefer option ${i} because it saves time.`,
  learningContext:Array.from({length:8},()=>({skill:'linking',rule:'r'.repeat(600)})),
 }));
 let failLast=true;const sizes:number[]=[],requested:string[]=[];
 ai.fetch=async(_url:string,options:RequestInit)=>{
  const input=JSON.parse(String(options.body)),work=JSON.parse(input.messages[1].content);sizes.push(work.answers.length);
  assert.equal(work.blockContext,undefined);
  assert.ok(work.answers.every((answer:any)=>answer.learningContext.length===2&&answer.learningContext[0].rule.length<=180));
  assert.equal(input.max_completion_tokens,1600*work.answers.length);
  if(work.answers.length>1)return new Response('{}',{status:413});
  requested.push(work.answers[0].key);
  if(failLast&&work.answers[0].key==='review-3')return new Response('{}',{status:503});
  return Response.json({choices:[{message:{content:JSON.stringify(reply(work))}}]});
 };
 await assert.rejects(ai.grade(base),/Saved feedback for 3 of 4/);
 assert.deepEqual(sizes,[2,1,1,2,1,1]);
 failLast=false;requested.length=0;
 const result=await ai.grade(base);
 assert.deepEqual(requested,['review-3']);assert.deepEqual(result.assessment.cache,{reused:3,checked:1,total:4});
 assert.equal(result.assessment.passed,true);
});

test('Failure messages distinguish malformed model output, payload limits and a busy provider',async()=>{
 const ai=fixture();for(const provider of ['openai','groq','gemini'])ai.save({provider,key:'mock'});
 ai.fetch=async(url:string)=>url.includes('groq')?new Response('{}',{status:413}):url.includes('googleapis')?
  new Response('{}',{status:503}):Response.json({output:[{type:'message',content:[{type:'output_text',text:'{truncated'}]}]});
 await assert.rejects(ai.grade(bundle()),(error:Error)=>/invalid JSON/.test(error.message)&&/payload limit/.test(error.message)&&/gemini: API temporarily unavailable/.test(error.message));
});

test('Luna gets one repair attempt for a rejected grading rubric before fallback',async()=>{
 const ai=fixture();ai.save({provider:'openai',key:'mock'});ai.save({provider:'groq',key:'mock',order:['openai','groq','gemini','openrouter']});
 const called:string[]=[];
 ai.generate=async (id:string,prompt:any)=>{
  called.push(id);
  const raw=reply(JSON.parse(prompt.user));
  if(called.length===1)raw.answers[0].corrections=[{original:'Unwritten quote',replacement:'word',explanation:'Example',kind:'error'}] as any;
  else assert.match(prompt.system,/prior assessment failed validation/);
  return raw;
 };
 const result=await ai.grade(bundle());
 assert.deepEqual(called,['openai','openai']);assert.equal(result.assessment.provider,'openai');assert.equal(result.assessment.passed,true);
});
test('Provider failover handles quota, malformed JSON and missing providers without exposing credentials',async()=>{const a=fixture(),calls:string[]=[];a.save({provider:'groq',key:'secret-groq'});a.save({provider:'gemini',key:'secret-gemini'});a.fetch=async(url:string,o:any)=>{calls.push(url);if(url.includes('groq'))return new Response('{}',{status:429});const user=JSON.parse(o.body).contents[0].parts[0].text;return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(reply(JSON.parse(user)))}]}}]});};const r=await a.grade(bundle());assert.equal(r.assessment.provider,'gemini');assert.equal(r.assessment.passed,true);assert.equal(calls.length,2);assert.ok(!JSON.stringify(a.settings()).includes('secret-'));await a.grade(bundle());assert.equal(calls.filter(u=>u.includes('groq')).length,1);});
test('Grading accepts a reasonable original opinion, rejects irrelevant fluency and fabricated quotes',()=>{const b=bundle(),r=P.validateGrade(reply(b),b);assert.equal(r.passed,true);const irrelevant=P.validateGrade(reply(b,true),b);assert.equal(irrelevant.passed,false);assert.ok(irrelevant.score<=25);const fake=reply(b);fake.answers[0].corrections=[{original:'This was never written',replacement:'x',explanation:'x',kind:'error'}] as any;assert.throws(()=>P.validateGrade(fake,b));const uncertain=reply(b);uncertain.answers[0].relevance='uncertain';assert.throws(()=>P.validateGrade(uncertain,b));});
test('Tutor prompt does not contain reference answers; solution leaks and long output are rejected',()=>{const b=bundle(),p=P.helpPrompt(b,'Can you write the answer for me?');assert.ok(!p.user.includes(b.sourceFacts[0]));assert.ok(/NEVER write a sample answer/.test(p.system));assert.throws(()=>P.validateHint({clarification:'Here is the answer: '+b.sourceFacts[0],hint:'x',nextStep:'x'},b));assert.ok(P.validateHint({clarification:'Choose the point you want to defend.',hint:'Who benefits from your proposal?',nextStep:'Give one reason in your own words.'},b));});
test('AI scores apply only to the current complete block; editing and hint use are tracked',()=>{const c=new EnglishController(newEnglishDocument());c.start();const s=c.document.course.activeSession!;s.blockIndex=6;c.dispatch({type:'answer',key:'writing',value:bundle().answers[0].text});const b=P.context(s.lesson,'writing',c.assessmentBundle('writing').answers),a={...P.validateGrade(reply(b),b),provider:'mock',model:'test'};c.acceptAI(a);assert.equal(c.view().canAdvance,true);c.dispatch({type:'answer',key:'writing',value:'The banana is on the table.'});assert.equal(c.view().canAdvance,false);assert.throws(()=>c.acceptAI(a));assert.equal(c.view().attempt!.answers.writing,'The banana is on the table.');});
test('All 84 topics have own-answer tasks and no compulsory chunk reconstruction; legacy drafts survive',()=>{for(const l of (C as any).lessons){assert.equal(l.productionMode,'ai-opinion-v1');assert.equal(l.guidedTasks,undefined);const s={lesson:l,reviews:[],answers:{}};for(const area of ['vocabulary','reading','speaking','writing'])assert.ok((L as any).areaItems(s,area).length>0);}const c=new EnglishController(newEnglishDocument());c.start();const doc=structuredClone(c.document);(doc.course.activeSession!.lesson as any).learningLanguageVersion=3;doc.course.activeSession!.lesson.guidedTasks=(L as any).buildGuidedTasks(doc.course.activeSession!.lesson);doc.course.activeSession!.answers['review-0']='Keep my own draft.';const next=new EnglishController(doc);assert.equal(next.view().attempt!.answers['review-0'],'Keep my own draft.');assert.equal(next.view().attempt!.reviews[0].kind,'open');});
test('ASR falls back to Gemini; cloud TTS is cached and free-router settings cannot choose paid models',async()=>{const a=fixture();a.save({provider:'groq',key:'fake'});a.save({provider:'gemini',key:'fake'});let count=0;a.fetch=async(url:string)=>{count++;if(url.includes('groq'))return new Response('{}',{status:503});if(url.endsWith('interactions'))return Response.json({steps:[{type:'model_output',content:[{type:'audio',data:AI.wav(Buffer.alloc(48)).toString('base64')}]}]});return Response.json({candidates:[{content:{parts:[{text:'This is my uncorrected transcript.'}]}}]});};const t=await a.transcribe({audio:'AAAA',mimeType:'audio/webm'});assert.equal(t.transcript.provider,'gemini');const audio=await a.voice([{speaker:'A',text:'What do you think?'},{speaker:'B',text:'I prefer a clear explanation.'}]);assert.equal(audio.provider,'gemini');const before=count;assert.equal((await a.voice([{speaker:'A',text:'What do you think?'},{speaker:'B',text:'I prefer a clear explanation.'}])).cached,true);assert.equal(count,before);assert.throws(()=>a.save({provider:'openrouter',model:'paid/model'}));});

test('Word pronunciation makes one cloud request and returns independent clips in card order',async()=>{
  const words=['enormous','track down','bottleneck'];
  const turns=words.map(text=>({speaker:'Narrator',text}));
  const samples=words.map((_,index)=>{
    const pcm=Buffer.alloc(24000/2);
    for(let offset=0;offset<pcm.length;offset+=2)pcm.writeInt16LE((index+1)*1000,offset);
    return pcm;
  });
  const silence=Buffer.alloc(48000);
  const combined=AI.wav(Buffer.concat([samples[0],silence,samples[1],silence,samples[2]]));
  for(const provider of ['gemini','groq']){
    const a=fixture();a.save({provider,key:'fake'});
    let calls=0;
    a.remote=async(_url:string,options:any)=>{
      calls++;
      const body=JSON.parse(options.body);
      if(provider==='gemini'){
        assert.equal(body.input[0].content[0].text,words.join(' <long pause> '));
        return {output_audio:{data:combined.toString('base64')}};
      }
      assert.equal(body.input,words.join('...\n\n'));
      return combined;
    };
    const result=await a.voice(turns,true);
    assert.equal(calls,1);
    assert.equal(result.provider,provider);
    assert.equal(result.base64,undefined);
    assert.equal(result.clips.length,words.length);
    for(let index=0;index<words.length;index++){
      const clip=Buffer.from(result.clips[index],'base64');
      assert.equal(clip.toString('ascii',0,4),'RIFF');
      const heard=new Set();
      for(let offset=44;offset<clip.length;offset+=2){const sample=clip.readInt16LE(offset);if(sample)heard.add(sample);}
      assert.deepEqual([...heard],[(index+1)*1000]);
    }
  }
  const ambiguous=fixture();ambiguous.save({provider:'gemini',key:'fake'});
  ambiguous.remote=async()=>({output_audio:{data:AI.wav(Buffer.concat(samples)).toString('base64')}});
  await assert.rejects(ambiguous.voice(turns,true),/All configured providers failed/);
});

test('Malformed provider responses fall through to OpenRouter Free; disconnect does not resurrect a legacy key',async()=>{const a=fixture();for(const id of ['groq','gemini','openrouter'])a.save({provider:id,key:'fake-'+id});a.fetch=async(url:string)=>url.includes('openrouter')?Response.json({choices:[{message:{content:JSON.stringify(reply(bundle()))}}]}):Response.json({choices:[{message:{content:'not-json'}}],candidates:[]});const r=await a.grade(bundle());assert.equal(r.assessment.provider,'openrouter');assert.equal(r.assessment.model,'openrouter/free');assert.equal(r.attempts.length,2);const old=path.join(path.dirname(a.file),'legacy.json');fs.writeFileSync(old,JSON.stringify({keys:{gemini:'old-key'},models:{}}));a.legacy=old;a.save({provider:'gemini',remove:true});assert.equal(a.settings().providers.find((p:any)=>p.id==='gemini').configured,false);assert.equal(JSON.parse(fs.readFileSync(old,'utf8')).keys.gemini,undefined);});
