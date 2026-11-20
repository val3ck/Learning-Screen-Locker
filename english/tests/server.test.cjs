'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createApp,validateFeedback}=require('../server');
async function fixture(t,fetchImpl){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'english-test-'));const configPath=path.join(dir,'private.json');const server=createApp({configPath,fetchImpl,env:{}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{await new Promise(resolve=>server.close(resolve));if(!path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep+'english-test-'))throw new Error('Invalid test cleanup target');fs.rmSync(dir,{recursive:true,force:true});});const url=`http://127.0.0.1:${server.address().port}`;return{url,configPath,request:(route,body,headers={})=>fetch(url+route,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined})};}
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
test('gateway serves assets but never private files, source config or traversal',async t=>{const f=await fixture(t);for(const p of ['/','/js/daily/course.js','/css/daily.css'])assert.equal((await f.request(p)).status,200);for(const p of ['/.english-daily-private.json','/server.js','/package.json','/js/../.english-daily-private.json','/%2e%2e/server.js','/tests/daily.test.cjs'])assert.equal((await f.request(p)).status,404);assert.equal((await f.request('/api/ai/settings',null,{Origin:'https://other.example'})).status,403);});
test('missing credentials are explicit and safe; settings never echo a key',async t=>{const f=await fixture(t);const status=await(await f.request('/api/ai/settings')).json();assert.equal(status.configured,false);const r=await f.request('/api/ai/evaluate',{area:'speaking',text:'Short but valid.'});assert.equal(r.status,400);assert.equal((await r.json()).code,'not_configured');});
test('models are verified before saving; provider requests use server-held credentials',async t=>{
  const calls=[],f=await fixture(t,async(url,opts)=>{calls.push({url,opts});if(url.endsWith('/models'))return response({data:[{id:'openai/gpt-oss-20b',active:true},{id:'whisper-large-v3-turbo',active:true}]});return response({choices:[{message:{content:JSON.stringify({summary:'Зрозуміла відповідь',corrections:[],rewrite:'A clear explanation.',skills:{task:3,interaction:null}})}}]});});
  const saved=await(await f.request('/api/ai/settings',{provider:'groq',key:'test-only-not-a-real-credential',model:'openai/gpt-oss-20b'})).json();assert.equal(saved.configured,true);assert.ok(!JSON.stringify(saved).includes('test-only'));assert.ok(fs.existsSync(f.configPath));
  const evaluated=await(await f.request('/api/ai/evaluate',{area:'speaking',task:'Explain a change',text:'We fixed it.'})).json();assert.equal(evaluated.source,'ai');assert.equal(evaluated.pronunciation,null);assert.equal(calls[1].opts.headers.Authorization,'Bearer test-only-not-a-real-credential');
  const removed=await(await f.request('/api/ai/settings',{provider:'groq',remove:true})).json();assert.equal(removed.configured,false);
});
test('429, malformed AI JSON, and provider failure remain recoverable',async t=>{
  let mode='models';const f=await fixture(t,async()=>mode==='models'?response({data:[{id:'openai/gpt-oss-20b'}]}):mode==='limit'?response({},429):mode==='json'?response({choices:[{message:{content:'not json'}}]}):Promise.reject(new Error('network')));
  await f.request('/api/ai/settings',{provider:'groq',key:'test-only',model:'openai/gpt-oss-20b'});
  for(const [value,code] of [['limit','rate_limit'],['json','invalid_response'],['network','network']]){mode=value;const r=await f.request('/api/ai/evaluate',{area:'writing',text:'A valid answer.'});assert.equal((await r.json()).code,code);}
});
test('feedback is bounded, sanitised as data, and never fabricates unsupported skills',()=>{assert.throws(()=>validateFeedback({summary:'bad'}));const feedback=validateFeedback({summary:'Good',corrections:[{original:'a',improved:'b',explanation:'c'}],rewrite:'Example',skills:{grammar:100,task:3}});assert.equal(feedback.skills.grammar,null);assert.equal(feedback.skills.task,3);assert.equal(feedback.skills.interaction,null);assert.equal(feedback.pronunciation,null);});
test('Groq audio uses a multipart file and preserves a recoverable empty-audio error',async t=>{
  let empty=false,seen=false;const f=await fixture(t,async(url,options)=>{
    if(url.endsWith('/models'))return response({data:[{id:'openai/gpt-oss-20b'}]});
    assert.ok(url.endsWith('/audio/transcriptions'));assert.equal(options.body.get('model'),'whisper-large-v3-turbo');assert.equal(options.body.get('language'),'en');assert.equal(options.body.get('file').name,'answer.webm');seen=true;return response({text:empty?'':'A short spoken answer.'});
  });
  await f.request('/api/ai/settings',{provider:'groq',key:'test-only',model:'openai/gpt-oss-20b'});
  const r=await(await f.request('/api/ai/transcribe',{audio:Buffer.from('audio fixture').toString('base64'),mimeType:'audio/webm;codecs=opus'})).json();assert.equal(r.text,'A short spoken answer.');assert.equal(seen,true);empty=true;const bad=await f.request('/api/ai/transcribe',{audio:'YQ==',mimeType:'audio/webm'});assert.equal(bad.status,422);assert.equal((await bad.json()).code,'empty_audio');
});
test('Gemini is a separate configurable text provider; dialogue response is validated',async t=>{
  let malformed=false;const f=await fixture(t,async(url,options)=>{
    if(url.endsWith('/models'))return response({models:[{name:'models/gemini-3.5-flash-lite',supportedGenerationMethods:['generateContent']}]});
    assert.ok(url.includes('gemini-3.5-flash-lite:generateContent'));assert.equal(options.headers['x-goog-api-key'],'test-gemini-only');const body=JSON.parse(options.body);assert.equal(body.generationConfig.responseMimeType,'application/json');return response({candidates:[{content:{parts:[{text:JSON.stringify(malformed?{}:{question:'What would you check next?'})}]}}]});
  });
  const status=await(await f.request('/api/ai/settings',{provider:'gemini',key:'test-gemini-only',model:'gemini-3.5-flash-lite'})).json();assert.equal(status.provider,'gemini');assert.equal(status.transcription,false);
  const r=await(await f.request('/api/ai/dialogue',{context:'A booking app',role:'teammate',turns:[{answer:'We use a pipeline.'}]})).json();assert.equal(r.question,'What would you check next?');malformed=true;assert.equal((await(await f.request('/api/ai/dialogue',{context:'test'})).json()).code,'invalid_response');
});
