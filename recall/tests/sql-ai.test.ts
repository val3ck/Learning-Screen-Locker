import test from 'node:test';import assert from 'node:assert/strict';import os from 'node:os';import path from 'node:path';import {mkdtemp} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import AI from '../integration/english-ai.cjs';
import {compileAIRecord,generationPrompt,type AIRecord} from '../src/modules/postgresql/ai-plan';
import {withoutAIRecipe} from '../src/modules/postgresql/ai-task-text';
import {catalog} from '../src/modules/postgresql/catalog';
import {makeTask} from '../src/modules/postgresql/templates';
import {practiceProfile} from '../src/modules/postgresql/practice-profile';
import {executeSQL} from '../src/modules/postgresql/engine';
import {validateGeneratedTasks} from '../electron/sql-validator';
import {Store} from '../electron/store';import {SQLAI} from '../electron/sql-ai';
import {createSession,addSpeedBonus,updateHistory,availableTopicIds,recordAttempt,learnedTopics} from '../src/core/session';import {getModule} from '../src/modules/registry';
const known=catalog.slice(0,14).map(t=>t.id);
const record=(plan:any,topicId='where'):AIRecord=>({intent:{key:'x',topicId,seed:55,domainId:'shop',difficulty:1},draft:{key:'x',title:'Робочий список',context:'Команді потрібен невеликий звіт для щоденної роботи.',plan},provider:'mock',model:'gpt-6-luna',generatedAt:new Date().toISOString()});
const projection=[{expr:'name'},{expr:'price'}],filter={left:'price',op:'>=',value:50};
test('AI compiler enforces actual learned skills, exact schema and deterministic requirements',()=>{
 const r=record({from:'products',select:projection,where:filter,orderBy:[{column:'price',direction:'DESC'},{column:'name',direction:'ASC'}],limit:3});
 const t=compileAIRecord(r,known);assert.match(t.brief,/price не менше ніж 50/);assert.match((t.payload as any).solution,/LIMIT 3/);assert.equal(t.templateId,compileAIRecord(r,known).templateId);const boxed=structuredClone(r) as any;boxed.draft.plan.where.value={literal:50};assert.equal((compileAIRecord(boxed,known).payload as any).solution,(t.payload as any).solution);
 for(const plan of [{from:'secrets',select:['*']},{from:'products',select:projection,where:{left:'price',op:'>=',value:'x'}},{from:'products',select:projection,sql:'DROP TABLE products'},{from:'products',select:[{expr:{fn:'pg_read_file',arg:'name'},as:'stolen'}]}]){
  if((plan as any).where?.value==='x')continue;assert.throws(()=>compileAIRecord(record(plan),known));
 }
 assert.throws(()=>compileAIRecord(record({from:'products',select:projection,joins:[{table:'orders',type:'INNER',left:'products.id',right:'orders.id'}]}),known));
 assert.throws(()=>compileAIRecord(r,['select','columns','where']));
 assert.throws(()=>compileAIRecord(record({from:'products',select:[{expr:{literal:1},as:'answer'}]} ,'columns'),known));
});
test('AI pattern tasks and saved tasks explain the result while hiding the SQL method',{timeout:120000},async()=>{
 const plan={from:'customers',select:[{expr:'name'},{expr:'email'}],where:{left:'email',op:'ILIKE',value:'%example.com%'}};
 const draft=record(plan,'patterns');
 const t=compileAIRecord(draft,known);
 assert.match(t.brief,/name; email/);
 assert.match(t.brief,/email містить «example\.com» без урахування регістру літер/);
 assert.doesNotMatch(t.brief,/\bILIKE\b|%example/);
 assert.match((t.payload as any).solution,/ILIKE '%example\.com%'/);
 const saved=withoutAIRecipe({...t,title:'Магазин · Використай ILIKE',brief:"Команді потрібен звіт про email.\n\nТочні вимоги:\nЗалиш рядки, де email ILIKE '%example.com%'."});
 assert.doesNotMatch(saved.title+saved.brief,/\bILIKE\b|%example/);
 assert.match(saved.brief,/Команді потрібен звіт про email/);
 assert.match(saved.brief,/email містить «example\.com»/);
 assert.equal(saved.id,t.id);
 assert.equal(saved.payload,t.payload);
 assert.deepEqual(withoutAIRecipe(saved),saved);
 const stripped=withoutAIRecipe({...saved,brief:"Спробуй ILIKE.\n\nТочні вимоги:\nСтарий текст."});
 assert.doesNotMatch(stripped.brief,/ILIKE|Старий текст/);
 assert.deepEqual(withoutAIRecipe(stripped),stripped);
 const exact=compileAIRecord(record({...plan,where:{...plan.where,op:'LIKE',value:'abc%'}},'patterns'),known);
 assert.match(exact.brief,/email починається з «abc» з урахуванням регістру/);
 const mixed=compileAIRecord(record({...plan,where:{...plan.where,value:{literal:'a\\_%_z'}}},'patterns'),known);
 assert.match(mixed.brief,/«a_» → будь-яка кількість символів, зокрема нуль → рівно один довільний символ → «z»/);

 const db=new PGlite();await db.waitReady;
 try {
  const equivalent="SELECT name, email FROM customers WHERE STRPOS(LOWER(email), 'example.com') > 0;";
  assert.equal((await executeSQL(db,t,equivalent,true)).status,'correct');
 }finally{await db.close();}
});
test('Generated references, equivalent SQL, wrong SQL and hardcoded values run against real PostgreSQL',{timeout:120000},async()=>{
 const db=new PGlite();await db.waitReady;try{
  for(const seed of [17,893]){
   const r=record({from:'products',select:projection,where:filter,orderBy:[{column:'price',direction:'DESC'},{column:'name',direction:'ASC'}]});r.intent.seed=seed;
   const t=compileAIRecord(r,known);assert.deepEqual(await validateGeneratedTasks(db,[t]),[t.id]);
   assert.equal((await executeSQL(db,t,(t.payload as any).solution,true)).status,'correct');
   assert.equal((await executeSQL(db,t,'SELECT p.name,p.price FROM products p WHERE p.price >= 50 ORDER BY p.price DESC,p.name ASC;',true)).status,'correct');
   assert.equal((await executeSQL(db,t,'SELECT name,price FROM products;',true)).status,'incorrect');
   assert.equal((await executeSQL(db,t,"SELECT 'Клавіатура' AS name,80::numeric AS price;",true)).status,'incorrect');
  }
  const bad=compileAIRecord(record({from:'products',select:projection,where:{left:'price',op:'>',value:99999}}),known);assert.deepEqual(await validateGeneratedTasks(db,[bad]),[]);
  const constant=compileAIRecord(record({from:'customers',select:[{expr:{fn:'COUNT',arg:'id'},as:'people'}],where:{left:'city',op:'=',value:'Київ'}},'aggregates'),known);assert.deepEqual(await validateGeneratedTasks(db,[constant]),[]);
  const deadCase=compileAIRecord(record({from:'products',select:[{expr:'name'},{expr:{when:{left:'stock',op:'>',value:0},then:'available',else:'empty'},as:'band'}],where:{left:'stock',op:'>',value:0}},'case'),known);assert.deepEqual(await validateGeneratedTasks(db,[deadCase]),[]);
  const type=compileAIRecord(record({from:'products',select:projection,where:{left:'price',op:'>=',value:'not-a-number'}}),known);assert.deepEqual(await validateGeneratedTasks(db,[type]),[]);
 }finally{await db.close();}
});
test('CASE and aggregation plans follow the known schema without raw SQL; aliases are checked',()=>{
 const t=compileAIRecord(record({from:'products',select:[{expr:'category'},{expr:{fn:'AVG',arg:'price'},as:'average_price'}],groupBy:['category'],having:{left:{fn:'AVG',arg:'price'},op:'>',value:40}},'having'),known);
 assert.match(t.brief,/середнє значення price/);assert.ok(t.topicIds.every(id=>known.includes(id)));
 const c=compileAIRecord(record({from:'products',select:[{expr:'name'},{expr:{when:{left:'price',op:'>=',value:80},then:'premium',else:'standard'},as:'price_band'}]},'case'),known);assert.match((c.payload as any).solution,/CASE WHEN/);
 const p=generationPrompt([record({}).intent],known,[]);assert.ok(!p.user.includes('answers'));assert.match(p.system,/No raw SQL/);
});
test('Local sessions rotate all functions available within confirmed course progress',()=>{
 const aggregates=['COUNT','SUM','AVG','MIN','MAX'];
 const cases=[
  {topics:catalog.slice(0,9),expected:['COALESCE'],days:4},
  {topics:catalog.slice(0,14),expected:['COALESCE',...aggregates],days:7},
  {topics:catalog,expected:['COALESCE',...aggregates,'DENSE_RANK','ROW_NUMBER','RANK','DATE_TRUNC','LOWER','UPPER','LENGTH','ANY','CAST'],days:16},
 ];
 const module=getModule('postgresql');
 for(const {topics,expected,days} of cases){
  const confirmedTopicIds=topics.map(topic=>topic.id);
  const state:any={version:1,moduleId:'postgresql',history:{},progress:{confirmedTopicIds}};
  const sessions=[] as ReturnType<typeof createSession>[],covered=new Set<string>();
  for(let day=1;day<=days;day++){
   const now=new Date(Date.UTC(2026,10,day,12));
   const session=createSession(module,state,sessions,now.toISOString().slice(0,10),'practice',now,333+day);
   assert.ok(session.tasks.every(task=>task.topicIds.every(topic=>confirmedTopicIds.includes(topic))));
   const profiles=session.tasks.map(practiceProfile);
   assert.equal(new Set(profiles.map(p=>p.shape)).size,3);
   const focus=profiles.flatMap(p=>p.focus);
   assert.ok(focus.length>0);
   focus.forEach(name=>covered.add(name));
   session.solved.fill(true);session.outcome='completed';session.endedAt=now.toISOString();session.activeMs=7*60000;sessions.push(session);
  }
  assert.deepEqual(covered,new Set(expected));
 }
});

test('The text conversion exercise accepts CAST and the equivalent PostgreSQL shorthand',async()=>{
 const db=new PGlite();await db.waitReady;
 try {
  const task=makeTask(29,3,42),solution=(task.payload as any).solution as string;
  assert.deepEqual(practiceProfile(task).focus,['CAST']);
  assert.equal((await executeSQL(db,task,solution,true)).status,'correct');
  assert.equal((await executeSQL(db,task,solution.replace('CAST(id AS text)','id::text'),true)).status,'correct');
 } finally {await db.close();}
});

test('Cached tasks on different tables cannot replace a planned SUM with COUNT or repeat a query shape',async()=>{
 const store=new Store(await mkdtemp(path.join(os.tmpdir(),'sql-ai-practice-shape-'))),settings=await store.settings('course');
 const ai={config:()=>({keys:{}})},manager=new SQLAI(store,ai,()=>settings);
 const grouping=(fn:string,from='products',column='category',arg='stock')=>record({from,groupBy:[column],select:[{expr:column},{expr:{fn,arg},as:'result'}]},'grouping');
 const count=grouping('COUNT','customers','city','id'),sum=grouping('SUM');
 const countOnAnotherTable=grouping('COUNT','products','category','id');
 assert.equal(practiceProfile(compileAIRecord(count,known)).shape,practiceProfile(compileAIRecord(countOnAnotherTable,known)).shape);
 assert.throws(()=>compileAIRecord({...count,intent:{...count.intent,focusFunctions:['SUM']}},known),/інші SQL-функції/);
 const base=makeTask(11,0,991);
 assert.deepEqual(practiceProfile(base).focus,['SUM']);
 await store.write('modules/postgresql/ai-bank.json',{version:1,day:'',requests:0,records:[count],used:[]});
 await manager.load();assert.equal(manager.take(base,known,[]),base);
 await store.write('modules/postgresql/ai-bank.json',{version:1,day:'',requests:0,records:[count,sum],used:[]});
 await manager.load();assert.equal(manager.take(base,known,[],[compileAIRecord(sum,known)]),base);
 const replacement=manager.take(base,known,[],[compileAIRecord(count,known)]);
 assert.notEqual(replacement.id,base.id);assert.deepEqual(practiceProfile(replacement).focus,['SUM']);
 await store.flush();
});
test('A checked learning step becomes repeatable in Recall; unfinished, technical and demo steps do not unlock it',()=>{
 const module=getModule('postgresql'),state:any={version:1,moduleId:'postgresql',history:{},progress:{confirmedTopicIds:known}};
 const s=createSession(module,state,[],'2026-11-17','practice');
 recordAttempt(s,{status:'incorrect',message:'A first slip'},true);
 s.solved.fill(true);assert.ok(addSpeedBonus(module,state,[],s,7,new Date(),123,true));
 const task=s.tasks.at(-1)!;assert.equal(task.learning?.topicId,'joins');assert.equal(s.tasks.length,4);s.solved.fill(true);s.outcome='completed';assert.equal(updateHistory(state,s).history.joins,undefined);assert.deepEqual(state.progress.confirmedTopicIds,known);
 assert.ok(addSpeedBonus(module,state,[],s,7,new Date(),124,true));assert.equal(s.tasks.filter(t=>t.learning).length,1);assert.equal(s.tasks.length,5);
 s.currentIndex=3;s.answers[3]=module.taskProvider.solution(task);recordAttempt(s,{status:'correct',message:'Correct',tables:[]},true);s.endedAt=new Date().toISOString();
 const next=updateHistory(state,s);assert.deepEqual(next.learnedTopicIds,['joins']);assert.equal(next.history.joins.assisted,1);assert.ok(availableTopicIds(next).includes('joins'));assert.deepEqual(next.progress!.confirmedTopicIds,known);
 assert.ok(module.taskProvider.generate({confirmedTopicIds:availableTopicIds(next),history:{},sessions:[],now:new Date().toISOString(),seed:81}).every(t=>t.topicIds.every(id=>availableTopicIds(next).includes(id))));
 const unfinished=structuredClone(s);unfinished.solved[3]=false;assert.deepEqual(learnedTopics(unfinished),[]);
 const technical=structuredClone(s);technical.attempts.find(attempt=>attempt.taskId===task.id)!.technical=true;assert.deepEqual(learnedTopics(technical),[]);
 const demo=structuredClone(s);demo.mode='demo';assert.deepEqual(learnedTopics(demo),[]);
 const weak=createSession(module,state,[],'2026-11-17','practice');weak.solved.fill(true);weak.hintLevels[0]=1;addSpeedBonus(module,state,[],weak,7,new Date(),123,true);assert.equal(weak.tasks.at(-1)!.learning,undefined);
 const repeated=createSession(module,state,[],'2026-11-17','practice');
 recordAttempt(repeated,{status:'incorrect',message:'Wrong result'},true);
 recordAttempt(repeated,{status:'incorrect',message:'Still wrong'},true);
 repeated.solved.fill(true);addSpeedBonus(module,state,[],repeated,7,new Date(),123,true);
 assert.equal(repeated.tasks.at(-1)!.learning,undefined);
 assert.equal(repeated.tasks.at(-1)!.topicIds[0],repeated.tasks[0].topicIds[0]);
});
test('Background bank uses Luna first, validated fallback, durable cache and immediate local tasks on outage',async()=>{
 const store=new Store(await mkdtemp(path.join(os.tmpdir(),'sql-ai-bank-'))),settings=await store.settings('course');
 const ai=new AI.EnglishAI({statisticsPath:store.root,env:{}});ai.save({provider:'openai',key:'fake'});ai.save({provider:'gemini',key:'fake'});
 let calls:string[]=[];ai.generate=async(id:string,prompt:any)=>{calls.push(id);if(id==='openai')throw Error('Provider down');const data=JSON.parse(prompt.user);return {tasks:data.intents.map((i:any)=>({key:i.key,title:'Новий звіт',context:'Команда готує дані для робочої зустрічі.',plan:{from:i.schema[1].name,select:projection,where:filter}}))};};
 const state:any={version:1,moduleId:'postgresql',history:{},progress:{confirmedTopicIds:['select','columns','where']}},manager=new SQLAI(store,ai,()=>settings,async tasks=>tasks.map(t=>t.id));await manager.load();await manager.prepare(state,[],true);assert.equal(calls[0],'openai');assert.ok(calls.includes('gemini'));assert.ok(manager.status().cached>0);
 const t=manager.take(makeTask(4,0,991),state.progress.confirmedTopicIds,[]);assert.equal((t.payload as any).ai.provider,'gemini');await store.flush();
 const restored=new SQLAI(store,ai,()=>settings,async()=>[]);await restored.load();assert.equal(restored.status().cached,manager.status().cached);
 const noFallback={...settings,sqlAIFallback:false};const strict=new SQLAI(new Store(await mkdtemp(path.join(os.tmpdir(),'sql-ai-strict-'))),ai,()=>noFallback,async()=>[]);await strict.load();calls=[];await strict.prepare(state,[],true);assert.deepEqual(calls,['openai']);assert.equal(strict.take(makeTask(4,0,9),state.progress.confirmedTopicIds,[]).id,makeTask(4,0,9).id);
 assert.ok(!JSON.stringify(manager.status()).includes('fake'));
});
