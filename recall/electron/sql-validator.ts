import {parentPort,workerData} from 'node:worker_threads';
import {PGlite} from '@electric-sql/pglite';
import {fixture,domains} from '../src/modules/postgresql/fixtures';
import type {SQLPayload} from '../src/modules/postgresql/types';
import type {Task} from '../src/core/contracts';
import {normalize} from '../src/modules/postgresql/engine';
export async function validateGeneratedTasks(db:PGlite,tasks:Task[]):Promise<string[]>{
  const valid:string[]=[];
  for(const task of tasks){try{
    const p=task.payload as SQLPayload,domain=domains.find(d=>d.id===p.domainId)!;
    const signatures=new Set<string>(),caseValues=new Map<string,Set<unknown>>();
    const plan=p.ai?.plan as any;for(const field of plan?.select||[])if(field?.expr?.when)caseValues.set(field.as,new Set());
    for(let variant=0;variant<3;variant++){
      await db.exec('ROLLBACK; DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
      await db.exec(fixture(domain,task.seed,variant).sql);
      await db.exec("SET statement_timeout='4000ms'; BEGIN READ ONLY;");
      const rows=await db.query(p.solution);
      await db.exec('ROLLBACK;');
      if(!rows.rows.length||rows.rows.length>200||!rows.fields.length)throw Error('Порожній або завеликий навчальний результат.');
      signatures.add(normalize(rows,p.ordered));for(const [key,values]of caseValues)for(const row of rows.rows as any[])values.add(row[key]);
    }
    if(signatures.size<2||[...caseValues.values()].some(values=>values.size<2))throw Error('Набори даних не перевіряють умову достатньо.');
    valid.push(task.id);
  }catch{try{await db.exec('ROLLBACK;');}catch{}}}
  return valid;
}
if(parentPort){void(async()=>{const db=new PGlite();try{await db.waitReady;parentPort!.postMessage({ids:await validateGeneratedTasks(db,workerData.tasks)});}catch{parentPort!.postMessage({ids:[]});}finally{await db.close();}})();}
