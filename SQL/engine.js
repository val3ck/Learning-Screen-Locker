import {lessons,seed} from './course.js';
import {projectSteps} from './project.js';
import {conceptLessons} from './concepts.js';
import {checkpoint,helpdeskSeed} from './checkpoint.js';
const exercises=[...lessons,...projectSteps,...Array(conceptLessons.length).fill(null),checkpoint];
export function normalize(result,ordered=false){
 const columns=result.fields||[];
 const fields=columns.map(f=>f.name);
 const rows=(result.rows||[]).map(row=>JSON.stringify(columns.map(({name,dataTypeID})=>{
  const value=row[name];
  if(dataTypeID!==1700||typeof value!=='string'||!/^[-]?\d+(?:\.\d+)?$/.test(value))return value;
  const trimmed=value.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'');
  return trimmed==='-0'?'0':trimmed;
 })));
 return JSON.stringify({fields,rows:ordered?rows:rows.sort()});
}
export async function reset(db,variant=false,fixture='shop'){
 await db.exec('ROLLBACK;');
 await db.exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
 await db.exec(fixture==='helpdesk'?helpdeskSeed(variant):seed(variant));
 await db.exec("SET statement_timeout='4000ms';");
}
async function capture(db,l,sql){
 const results=await db.exec(sql);
 if(l.reports){
  const reports=results.filter(result=>result.fields?.length);
  const parts=reports.map((result,index)=>normalize(result,l.orderedReports[index]));
  return {result:reports.at(-1)||{rows:[],fields:[]},results:reports,parts,signature:JSON.stringify(parts)};
 }
 let result=l.verify?await db.query(l.verify):(results.at(-1)||{rows:[],fields:[]});
 const signature=[normalize(result,l.ordered)];
 if(l.catalog) signature.push(normalize(await db.query(l.catalog)));
 if(l.probe){await db.exec(l.probe);signature.push(normalize(await db.query(l.post)));}
 if(l.reject)for(const invalid of l.reject){let rejected=false;try{await db.exec(invalid);}catch{rejected=true;}signature.push(rejected);}
 return {result,signature:JSON.stringify(signature),results};
}
export async function execute(db,{index,sql,check=false,playground=false}){
 const l=exercises[index];
 if(!l)throw new Error('Unknown exercise. Reload the course.');
 if(!sql.trim())throw new Error('Write a SQL statement first.');
 await reset(db,false,l.fixture);
 let actual;
 if(check&&!playground){
  const expected=await capture(db,l,l.solution);
  await reset(db,false,l.fixture);
  actual=await capture(db,l,sql);
  if(actual.signature!==expected.signature){const issue=l.reports?Math.max(0,expected.parts.findIndex((part,i)=>actual.parts[i]!==part)):0;return {result:actual.result,results:actual.results,multi:!!l.reports,pass:false,message:l.reports?`Report ${issue+1} needs another look. Check its columns, rows, and order; all four reports must be in one script.`:'Not quite yet. Check the requested columns, aliases, rows, and ordering. For writes, also check the final table state.'};}
  await reset(db,true,l.fixture);
  const alternate=await capture(db,l,l.solution);
  await reset(db,true,l.fixture);
  const candidate=await capture(db,l,sql);
  if(candidate.signature!==alternate.signature)return {result:actual.result,results:actual.results,multi:!!l.reports,pass:false,message:'Your answer matches the sample, but not a changed shift. Use the data instead of hard-coded results.'};
  return {result:actual.result,results:actual.results,multi:!!l.reports,pass:true,message:l.reports?'All four reports are correct on both shifts. Ready for relationships and JOINs.':'Correct on both datasets. Explain why it works, then move on.'};
 }
 const results=await db.exec(sql);
 const result=results.at(-1)||{rows:[],fields:[]};
 if(l.reports){const reports=results.filter(entry=>entry.fields?.length);return {result:reports.at(-1)||{rows:[],fields:[]},results:reports,multi:true,message:`Executed ${reports.length} of ${l.reports.length} report queries.`,pass:null};}
 return {result,message:`Executed ${results.length} statement${results.length===1?'':'s'}. ${result.rows?.length||0} rows in the final result.`,pass:null};
}
