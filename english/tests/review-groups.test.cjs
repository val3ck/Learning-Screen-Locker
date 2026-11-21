const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const Groups=require('../review-groups.cjs');
const timestamp=new Date().toISOString();
const issue=(original,replacement,explanation,ruleId)=>({original,replacement,explanation,ruleId,kind:'error'});
function attempt(id,correction,cached=false){
 return {id,lessonId:'lesson-01',startedAt:timestamp,aiAssessments:{writing:{checkedAt:timestamp,snapshot:JSON.stringify([['writing',correction.original]]),answers:[{key:'writing',cached,corrections:[correction]}]}}};
}
test('Recall errors count independent answers and preserve the source rule through copies and retries',()=>{
 const cases=Array.from({length:5},(_,i)=>attempt('a'+i,issue('The app work '+i,'The app works '+i,i%2?'':'Third-person singular','HE_VERB_AGR')));
 const one=attempt('one',issue('a idea','an idea','Use the right article','EN_A_VS_AN'));
 const clone=structuredClone(cases[0]);
 clone.aiAssessments.writing.answers[0].corrections[0]=issue('This app save time','This app saves time','Third-person singular');
 const cached=attempt('cache',issue('He go','He goes','Third-person singular'),true);
 const observed=Groups.collect({course:{sessions:[...cases,one,cached],migration:{manualAdvances:[{attempt:clone}]}}});
 const ranked=Groups.rank(observed,[]);
 assert.equal(ranked[0].id,'present-simple-s');assert.equal(ranked[0].count,5);
 assert.equal(ranked[1].count,1);assert.ok(observed.every(o=>o.episodeId!=='cache:writing'));
 const results=[0,1,2].map(i=>({ruleId:'present-simple-s',taskId:'solution-'+i,at:new Date(Date.now()+(i+1)*86400000).toISOString(),correct:true}));
 assert.equal(Groups.rank(observed,results.slice(0,1))[0].maintained,false);
 assert.equal(Groups.rank(observed,results).find(g=>g.id==='present-simple-s').maintained,true);
});
test('Validated AI grouping is shared and uses no second request for unchanged observations',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'recall-groups-'));
 try{
  const repo=Groups.open(temp),observed=Groups.collect({course:{sessions:[
   attempt('a',issue('discuss about it','discuss it','Direct object after discuss')),
   attempt('b',issue('discuss about options','discuss options','Remove the preposition after discuss')),
   attempt('c',issue('he work','he works','Third-person singular'))
  ]}});
  Groups.ingest(repo,observed);Groups.ingest(repo,observed);
  const unknown=observed.filter(o=>o.ruleId.startsWith('specific-')).map(o=>o.ruleId);
  let calls=0;const generate=async()=>{calls++;return {groups:[{target:null,title:'Direct object after discuss',members:unknown},{target:'past-simple',title:'Wrong',members:['present-simple-s']}]};};
  await Groups.group(repo,generate);await Groups.group(repo,generate);
  assert.equal(calls,1);assert.equal(repo.read().observations.length,3);
  assert.equal(Groups.rank(observed,[],Groups.open(temp).read().aliases)[0].count,2);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
