import assert from 'node:assert/strict';
import {lessons,modules,seed,quickChecks} from './course.js';
import {projectSteps} from './project.js';
import {conceptLessons,gradeConcept} from './concepts.js';
import {checkpoint,helpdeskSchema} from './checkpoint.js';
import {execute,normalize,reset} from './engine.js';
import {readFile} from 'node:fs/promises';
assert.equal(modules.length,12);
assert.equal(lessons.length,37);
assert.equal(projectSteps.length,8);
assert.equal(conceptLessons.length,7);
assert.deepEqual(Object.keys(quickChecks).map(Number).sort((a,b)=>a-b),[0,2,6,8,9,10,11,12,14,18]);
for(const [index,check] of Object.entries(quickChecks)){
 assert.ok(lessons[Number(index)],`Quick check ${index} has a lesson`);
 assert.ok(check.question.length>30&&check.answer.length>60,`Quick check ${index} explains the answer`);
}
assert.equal(checkpoint.module,11);
assert.equal(checkpoint.fixture,'helpdesk');
assert.equal(checkpoint.reports.length,4);
assert.equal(helpdeskSchema.length,3);
for(const key of ['title','concept','example','task','solution','hint'])assert.ok(checkpoint[key].length>5,`Checkpoint: ${key}`);
assert.equal(new Set(lessons.map(l=>l.title)).size,lessons.length);
for(const l of lessons){for(const k of ['title','concept','example','task','solution','hint'])assert.ok(typeof l[k]==='string'&&l[k].length>5,`${l.title}: ${k}`);assert.ok(l.module>=0&&l.module<8);}
for(const l of projectSteps){for(const k of ['title','concept','example','task','solution','hint'])assert.ok(typeof l[k]==='string'&&l[k].length>5,`${l.title}: ${k}`);assert.ok(l.module===8||l.module===9);}
for(const l of conceptLessons){
 assert.equal(l.module,10);
 assert.equal(l.questions.length,3,`${l.title}: three scenarios`);
 assert.ok(l.title.length>5&&l.concept.length>30&&l.brief.length>20);
 for(const q of l.questions)assert.ok(q.prompt.length>20&&q.options.length===3&&new Set(q.options).size===3&&q.answer>=0&&q.answer<3&&q.hint.length>10&&q.why.length>20);
 assert.equal(gradeConcept(l,l.questions.map(q=>q.answer)).complete,true,`${l.title}: reference choices`);
 assert.equal(gradeConcept(l,l.questions.map(q=>(q.answer+1)%3)).complete,false,`${l.title}: wrong choices`);
}
const a={fields:[{name:'n'}],rows:[{n:1},{n:2}]};
const b={fields:[{name:'n'}],rows:[{n:2},{n:1}]};
assert.equal(normalize(a),normalize(b),'Unordered sets may reorder');
assert.notEqual(normalize(a,true),normalize(b,true),'Ordered answers must preserve order');
assert.notEqual(normalize(a),normalize({...a,rows:[...a.rows,{n:1}]}),'Duplicate rows matter');
assert.notEqual(normalize(a),normalize({fields:[{name:'wrong'}],rows:[{wrong:1},{wrong:2}]}),'Aliases matter');
const numeric=values=>({fields:[{name:'amount',dataTypeID:1700}],rows:values.map(amount=>({amount}))});
assert.equal(normalize(numeric(['96.000'])),normalize(numeric(['96.0000'])),'NUMERIC display scale must not affect grading');
assert.notEqual(normalize(numeric(['96.000'])),normalize(numeric(['96.001'])),'Different NUMERIC values must remain different');
assert.notEqual(normalize({fields:[{name:'amount',dataTypeID:25}],rows:[{amount:'96.000'}]}),normalize({fields:[{name:'amount',dataTypeID:25}],rows:[{amount:'96.0000'}]}),'Text values must retain trailing zeroes');
const html=await readFile(new URL('./index.html',import.meta.url),'utf8');
const app=await readFile(new URL('./app.js',import.meta.url),'utf8');
const guide=await readFile(new URL('./guide.js',import.meta.url),'utf8');
const ids=[...html.matchAll(/id="([\w-]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'HTML IDs must be unique');
for(const m of app.matchAll(/\$\('#([\w-]+)'\)/g))assert.ok(ids.includes(m[1])||guide.includes(`id="${m[1]}"`),`Missing element #${m[1]}`);
for(const id of ['quick-check','quick-question','quick-answer'])assert.ok(ids.includes(id),`Missing quick check element #${id}`);
console.log('PASS: 37 lessons, eight project tasks, workplace checkpoint, seven NoSQL concepts, DOM references, and answer-comparison invariants.');
if(process.argv.includes('--static'))process.exit(0);
let PGlite;
try{({PGlite}=await import('@electric-sql/pglite'));}catch{console.error('PostgreSQL integration tests require npm install. No database tests have run.');process.exit(1);}
const db=new PGlite();await db.waitReady;
let passed=0;
try{
 for(let index=0;index<lessons.length+projectSteps.length;index++){
  const l=[...lessons,...projectSteps][index];
  const result=await execute(db,{index,sql:l.solution,check:true});
  assert.equal(result.pass,true,`${index+1}. ${l.title}: reference answer`);
  let rejected=false;
  try{const wrong=await execute(db,{index,sql:'SELECT 999 AS deliberately_wrong;',check:true});rejected=wrong.pass===false;}catch{rejected=true;}
  assert.equal(rejected,true,`${l.title}: incorrect answer must not pass`);
  await reset(db);
  if(!l.example.startsWith('--'))await db.exec(l.example);
  passed++;console.log(`PASS ${String(index+1).padStart(2,'0')} ${l.title}`);
 }
 const equivalent=await execute(db,{index:1,sql:'SELECT p.name, p.price FROM products AS p;',check:true});
 assert.equal(equivalent.pass,true,'Equivalent SQL should pass');
 const tax=await execute(db,{index:2,sql:'SELECT name, price * 1.2 AS price_with_tax FROM products;',check:true});
 assert.equal(tax.pass,true,'Equivalent decimal scale should pass the tax lesson');
 const missingFallback=await execute(db,{index:lessons.length+5,sql:"SELECT COUNT(*) AS product_count, SUM(price * stock) AS inventory_value FROM products WHERE category='Accessories';",check:true});
 assert.equal(missingFallback.pass,false,'Project must require a zero fallback for an empty category');
 await reset(db,true);
 const accessories=await db.query("SELECT COUNT(*) AS product_count FROM products WHERE category='Accessories';");
 assert.equal(Number(accessories.rows[0].product_count),1,'Changed project data must contain an Accessories product');
 const hardcoded="SELECT 'Mechanical Keyboard'::text AS name,80::numeric AS price UNION ALL SELECT 'Studio Headphones',120 UNION ALL SELECT 'Database Internals',60";
 const hardcodedResult=await execute(db,{index:4,sql:hardcoded,check:true});
 assert.equal(hardcodedResult.pass,false,'Changed dataset must reject hardcoded results');
 const resetResult=await execute(db,{index:0,sql:'SELECT COUNT(*) AS n FROM products;'});
 assert.equal(Number(resetResult.result.rows[0].n),8,'Each run gets fresh fixtures');
 const checkpointIndex=lessons.length+projectSteps.length+conceptLessons.length;
 const handoff=await execute(db,{index:checkpointIndex,sql:checkpoint.solution,check:true});
 assert.equal(handoff.pass,true,'All four workplace reports must pass both shifts');
 assert.equal(handoff.results.length,4,'The checker returns all four reports');
 const preview=await execute(db,{index:checkpointIndex,sql:checkpoint.solution});
 assert.equal(preview.results.length,4,'Run displays all four reports');
 const partial=await execute(db,{index:checkpointIndex,sql:checkpoint.solution.split('\n\n')[0],check:true});
 assert.equal(partial.pass,false,'One correct report cannot complete the checkpoint');
 const changed=await execute(db,{index:checkpointIndex,sql:checkpoint.solution.replace('priority>=3','priority>=4'),check:true});
 assert.equal(changed.pass,false,'A wrong report must fail the checkpoint');
 await reset(db,false,'helpdesk');
 const tableNames=await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;");
 assert.deepEqual(tableNames.rows.map(row=>row.tablename),['agents','incidents','tickets'],'Checkpoint uses a separate three-table fixture');
 await assert.rejects(()=>execute(db,{index:0,sql:'SELEC broken;'}),'Invalid SQL must produce an error');
 console.log(`PASS: all ${passed} lesson and project solutions and examples plus four workplace reports; alternate fixtures, wrong answers, equivalent queries, reset, and SQL errors.`);
}finally{await db.close();}
