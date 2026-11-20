import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {makeTask,combineTask,generateTasks,VARIANTS_PER_TOPIC,type SQLPayload} from '../src/modules/postgresql/templates';
import {catalog,topicIds} from '../src/modules/postgresql/catalog';
import {executeSQL} from '../src/modules/postgresql/engine';
import {formatSQL,reviewSolution} from '../src/modules/postgresql/solution-review';
import {solutionView} from '../src/solution-view';
import {postgresql} from '../src/modules/postgresql';
test('Кожен варіант має перевірений рекомендований запис і перевірені альтернативи',{timeout:600000},async(context)=>{
  const db=new PGlite();await db.waitReady;let checked=0;
  try{
    for(let i=0;i<catalog.length;i++){
      await context.test(catalog[i].id,async()=>{
      const briefs=new Set<string>();
      for(let variant=0;variant<VARIANTS_PER_TOPIC;variant++){
        const task=makeTask(i,variant,17);briefs.add(task.brief);const guide=reviewSolution(task);
        if(guide.recommended.code.startsWith('SELECT'))assert.ok(guide.recommended.code.includes('\n'),task.templateId);
        assert.ok(guide.alternatives.length>=1,`${task.templateId}: no alternative`);
        for(const example of [guide.recommended,...guide.alternatives]){
          assert.ok(example.explanation.length>20&&example.whenToUse.length>15,task.templateId);
          assert.ok(example.requiredTopicIds.every(id=>topicIds.includes(id)));
          const result=await executeSQL(db,task,example.code,true);
          assert.equal(result.status,'correct',`${task.templateId} / ${example.title}: ${result.message}\n${example.code}`);checked++;
        }
        console.log(`PASS review ${task.templateId} (${guide.alternatives.length+1} рішень)`);
      }
      assert.equal(briefs.size,4,`${catalog[i].id}: briefs must be distinct`);
      });
    }
    console.log(`Validated ${checked} executable solution examples on three datasets each.`);
  }finally{await db.close();}
});
test('Розбір працює для комбінованих і старих збережених задач',{timeout:180000},async()=>{
  const db=new PGlite();await db.waitReady;
  try{
    for(const index of [1,2,4,6,7,8,10,11,12,13,23,29,30,31]){
      const task=makeTask(index,0,893);combineTask(task,new Set(topicIds));
      for(const example of [reviewSolution(task).recommended,...reviewSolution(task).alternatives])assert.equal((await executeSQL(db,task,example.code,true)).status,'correct',`${task.templateId}: ${example.title}`);
    }
    const legacy=makeTask(13,1,17);const payload=legacy.payload as SQLPayload;
    payload.solution=payload.solution.replace(' FROM ',' FROM ').replace(/;$/,'');
    payload.solution+=' WHERE stock>0 ORDER BY name;';payload.ordered=true;legacy.templateId+=':stock:sorted';
    const guide=reviewSolution(legacy);assert.ok(!guide.recommended.code.includes('CASE'));
    assert.equal((await executeSQL(db,legacy,guide.recommended.code,true)).status,'correct');
    for(const variant of [1,3]){const task=makeTask(13,variant,17);combineTask(task,new Set(topicIds));assert.ok(!(task.payload as SQLPayload).solution.includes('WHERE stock>0'));}
  }finally{await db.close();}
});
test('Подача рішень не змінює прогрес, екранує введення і не обіцяє найшвидший запит',()=>{
  const task=makeTask(35,0,17);const before=JSON.stringify(task);
  const html=solutionView(postgresql,task,['select'],"<script>alert('x')</script>");
  assert.ok(html.includes('Наступний крок'));assert.ok(html.includes('не відкриває нові теми'));
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
  assert.equal(JSON.stringify(task),before);assert.ok(html.includes('не рейтинг швидкості'));
  assert.ok(formatSQL("SELECT 'FROM WHERE; CASE' AS name; -- ORDER BY\n").includes("'FROM WHERE; CASE'"));
  const tasks=generateTasks({confirmedTopicIds:topicIds,history:{},sessions:[],now:new Date().toISOString(),seed:42});assert.equal(new Set(tasks.map(t=>t.topicIds[0])).size,3);
});
