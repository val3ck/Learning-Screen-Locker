import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ExamSession,topicQuotas} from '../dist/exams.js';
import {nextPosition} from '../dist/progression.js';
import {chapters} from '../dist/course.js';
import {VimEngine} from '../dist/engine.js';
import {referenceCode,defaultTests,parseCustomTests,compilerProgram,CODE_LANGUAGES} from '../dist/programs.js';
import {parseCompilerResult} from '../dist/runner.js';
import {moveInArena,movementArena,movementStart} from '../dist/scenes.js';
import {DEFAULT_AUDIO} from '../dist/audio.js';

const keys=(session,list)=>{for(const key of list)session.key(key);};
const type=(session,text)=>keys(session,[...text].map(c=>c==='\n'?'Enter':c));
const command=(s,c)=>keys(s,[...c,'Enter']);
function replaceBuffer(s,text){keys(s,[...'gg100dd','i']);type(s,text);s.key('Escape');}
function practiseTopic(s){
  const c=s.chapter;
  if(c===3){keys(s,Array(20).fill('w'));keys(s,Array(15).fill('b'));keys(s,Array(15).fill('e'));for(let i=0;i<5;i++)keys(s,['0','$']);}
  if(c===4){keys(s,Array(8).fill('x'));for(let i=0;i<6;i++)keys(s,['d','d']);for(let i=0;i<6;i++)keys(s,['d','w']);keys(s,Array(8).fill('u'));keys(s,Array(4).fill('C-r'));}
  if(c===5){for(let i=0;i<6;i++){keys(s,[...'ciw']);type(s,'changed');s.key('Escape');}for(let i=0;i<5;i++)keys(s,['d','$','u']);for(let i=0;i<5;i++)keys(s,[...'02dw','u']);keys(s,[...'dd....']);}
  if(c===6){for(let i=0;i<6;i++)keys(s,['y','y']);for(let i=0;i<5;i++)keys(s,['v','e','y']);for(let i=0;i<4;i++)keys(s,['V','Escape']);keys(s,Array(10).fill('p'));}
  if(c===7){for(let i=0;i<5;i++)command(s,'/portal');keys(s,Array(10).fill('n'));keys(s,Array(5).fill('N'));command(s,':%s/red/green/g');command(s,':%s/green/blue/g');command(s,':%s/blue/red/g');}
  if(c===8){for(let i=0;i<2;i++){command(s,'/portal');keys(s,[...'ciw']);type(s,'portal');s.key('Escape');}command(s,':w');}
}
for(let c=0;c<9;c++)for(let index=0;index<3;index++)test(`Practice ${c+1}.${index+1} can be completed with actual editor commands`,()=>{
  const s=new ExamSession(c,index);
  if(c===0){let moves=0;while(!s.done&&moves<2500){const [r,col]=s.target;if(s.engine.row!==r)s.key(s.engine.row<r?'j':'k');else s.key(s.engine.col<col?'l':'h');moves++;}assert.ok(moves<2500);}
  else if(c===1){
    if(index===0){for(const text of ['"cursor"','"ready for the next move"','"one key, one small step"']){s.key('A');type(s,text);keys(s,['Escape','j']);}keys(s,[...'013lrv']);}
    if(index===1){for(let i=0;i<6;i++)keys(s,['r','v','j']);for(let i=0;i<4;i++){s.key('o');type(s,'a fresh line of text');s.key('Escape');}}
    if(index===2){s.key('i');type(s,'const ready = true;');s.key('Escape');s.key('o');type(s,'const message = "hello, cursor";');s.key('Escape');s.key('o');type(s,'console.log(message);');s.key('Escape');}
  }else if(c===2){
    if(index===0){for(let i=0;i<3;i++){s.key('A');type(s,' checkpoint note');s.key('Escape');command(s,':w');}command(s,':wq');}
    if(index===1){for(let i=0;i<3;i++){command(s,':q');command(s,':q!');}}
    if(index===2){for(let i=0;i<4;i++){s.key('A');type(s,'twelve chars');s.key('Escape');command(s,':wq');}}
  }else if(c===8&&index===0){replaceBuffer(s,'# checkpoint.conf\nenabled = true\ntheme = night');command(s,':wq');}
  else{
    // A disposable scratch file lets the topic be practised before the code is repaired.
    if(s.coding)s.main=new VimEngine(Array.from({length:26},(_,i)=>`alpha${i} beta portal red green gamma delta`).join('\n'));
    practiseTopic(s);
    if(s.coding){replaceBuffer(s,referenceCode(c,'javascript'));if(c===8)command(s,':w');if(index===2){s.switchFile('tests');replaceBuffer(s,JSON.stringify([defaultTests(c)[3]]));s.switchFile('main');}assert.equal(s.done,false);s.setResults({results:defaultTests(c).map(t=>({...t,actual:t.expected,passed:true}))});}
  }
  assert.ok(s.done,JSON.stringify(s.objectives.filter(g=>!g.done)));
  const restored=new ExamSession(c,index,s.codeLanguage,s.snapshot());assert.equal(restored.done,true);
});
test('Chapter transitions always include all three exams',()=>{
  for(let c=0;c<9;c++){
    let p=nextPosition({chapter:c,step:chapters[c].missions.length-1,solved:true},chapters);assert.equal(p.exam,0);
    p=nextPosition({...p,solved:true},chapters);assert.equal(p.exam,1);p=nextPosition({...p,solved:true},chapters);assert.equal(p.exam,2);
    p=nextPosition({...p,solved:true},chapters);assert.deepEqual(p,c===8?{sandbox:true}:{chapter:c+1,step:0});
  }
});
test('Walls stop long movements without changing the other coordinate',()=>{
  const e=new VimEngine(movementArena,movementStart);for(const key of '999k')moveInArena(e,key);assert.deepEqual([e.row,e.col],[2,27]);for(const key of '999h')moveInArena(e,key);assert.deepEqual([e.row,e.col],[2,3]);
});
test('Manual exam selection cannot mark skipped exams as complete or bypass them',()=>{
  assert.deepEqual(nextPosition({chapter:0,step:3,exam:2,solved:true,completed:[false,false,true]},chapters),{chapter:0,step:3,exam:0});
  assert.deepEqual(nextPosition({chapter:0,step:3,exam:0,solved:true,completed:[true,false,true]},chapters),{chapter:0,step:3,exam:1});
  assert.deepEqual(nextPosition({chapter:0,step:3,solved:true,completed:[true,true,false]},chapters),{chapter:0,step:3,exam:2});
});
test('No-op motion, empty undo and repeated unmodified saves do not earn credit',()=>{
  const s=new ExamSession(3,0);s.key('0');s.key('u');assert.equal(s.stats.edge,undefined);assert.equal(s.stats.undo,undefined);
  const f=new ExamSession(2,0);command(f,':w');command(f,':w');assert.equal(f.stats.save,1);
});
test('Program edits invalidate tests, built-in cases cannot be removed, and custom tests are validated',()=>{
  const s=new ExamSession(3,2);s.setResults({results:[{passed:true}]});s.key('i');s.key('x');assert.equal(s.codePassed,false);
  assert.equal(s.allTests().length,6);assert.throws(()=>parseCustomTests('[{"input":-1,"expected":0}]'));assert.throws(()=>parseCustomTests('{}'));
  assert.equal(parseCustomTests('[{"input":4,"expected":10}]').length,1);
});
test('Every JavaScript reference solves its actual problem, and all compiled wrappers carry the same cases',()=>{
  for(let c=3;c<9;c++){
    const solve=new Function(referenceCode(c,'javascript')+';return solve;')();for(const t of defaultTests(c))assert.equal(solve(t.input),t.expected);
    for(const lang of Object.keys(CODE_LANGUAGES).filter(l=>l!=='javascript')){const program=compilerProgram(lang,referenceCode(c,lang),defaultTests(c));assert.ok(program.includes('__NQ5__'));}
  }
  const results=parseCompilerResult({status:'0',signal:'',program_output:'__NQ0__10\n'},[{input:4,expected:10}]);assert.equal(results.results[0].passed,true);
});
test('Practice objectives focus on the current topic and new audio defaults are quiet',()=>{
  assert.deepEqual(topicQuotas(3).map(q=>q.key),['w','b','e','edge']);assert.equal(DEFAULT_AUDIO.music,0);assert.equal(DEFAULT_AUDIO.dialogue,0.5);
});
