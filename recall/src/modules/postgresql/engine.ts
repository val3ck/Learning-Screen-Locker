import type {PGlite,Results} from '@electric-sql/pglite';
import type {DataTable,ExecutionResult,Task} from '../../core/contracts';
import {domains,fixture} from './fixtures';
import type {SQLPayload} from './templates';
import {statements} from './statements';
export function normalize(result:Results<unknown>,ordered=false):string {
  const fields=result.fields||[];
  const rows=result.rows.map(row=>JSON.stringify(fields.map(f=>{
    const value=(row as Record<string,unknown>)[f.name];
    if(f.dataTypeID===1700&&typeof value==='string'&&/^[-]?\d+(?:\.\d+)?$/.test(value))return value.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'').replace(/^-0$/,'0');
    return value;
  })));
  return JSON.stringify({fields:fields.map(f=>f.name),rows:ordered?rows:rows.sort()});
}
function tables(results:Results<unknown>[]):DataTable[]{return results.filter(r=>r.fields.length).map((r,i)=>({name:`Результат ${i+1}`,columns:r.fields.map(f=>({name:f.name,type:String(f.dataTypeID)})),rows:r.rows.slice(0,200) as Record<string,unknown>[]}));}
export async function executeSQL(db:PGlite,task:Task,answer:string,check:boolean):Promise<ExecutionResult>{
  if(!answer.trim()||answer.length>100000)return {status:'incorrect',message:'Напиши запит довжиною до 100 000 символів.'};
  const p=task.payload as SQLPayload;const domain=domains.find(d=>d.id===p.domainId);
  if(!domain)throw new Error('Невідомий набір даних.');
  const reset=async(variant:number)=>{
    await db.exec('ROLLBACK;');
    await db.exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await db.exec(fixture(domain,task.seed,variant).sql);
    await db.exec("SET statement_timeout='4000ms'; SET TIME ZONE 'UTC';");
  };
  const capture=async(sql:string)=>{
    let results:Results<unknown>[]=[];const transactionSnapshots:string[]=[];
    if(p.transaction){
      let began=false;
      for(const statement of statements(sql)){
        const head=statement.words[0];
        if(head==='BEGIN'||head==='START'&&statement.words[1]==='TRANSACTION')began=true;
        const ending=['COMMIT','END'].includes(head)?'commit':['ROLLBACK','ABORT'].includes(head)&&!statement.words.includes('TO')?'rollback':null;
        if(ending){if(!began||ending!==p.transaction.end)throw new Error('Перевір початок і спосіб завершення транзакції.');transactionSnapshots.push(normalize(await db.query(`SELECT * FROM ${p.transaction.table} ORDER BY id;`),true));began=false;}
        results.push(...await db.exec(statement.sql));
      }
      if(began||transactionSnapshots.length!==1)throw new Error('Виконай зміни в одній завершеній транзакції.');
    }else results=await db.exec(sql);
    const result=p.verify?await db.query(p.verify):results.at(-1)||{fields:[],rows:[],affectedRows:0};
    const signature=[normalize(result,p.ordered),...transactionSnapshots];
    if(p.catalog)signature.push(normalize(await db.query(p.catalog)));
    if(p.probes)for(const probe of p.probes){
      let rejected=false;await db.exec('BEGIN;');
      try{await db.exec(probe.sql);}catch{rejected=true;}finally{await db.exec('ROLLBACK;');}
      signature.push(String(rejected));
    }
    return {signature:JSON.stringify(signature),tables:tables(p.verify?[result]:results)};
  };
  let preview:DataTable[]=[];
  try{
    if(!check){await reset(0);const results=await db.exec(answer);return {status:'ran',message:'Запит виконано на свіжих навчальних даних. Для оцінки натисни «Перевірити».',tables:tables(results)};}
    for(let variant=0;variant<3;variant++){
      await reset(variant);const expected=await capture(p.solution);
      await reset(variant);const actual=await capture(answer);if(variant===0)preview=actual.tables;
      if(actual.signature!==expected.signature)return {status:'incorrect',message:variant===0?'Результат ще відрізняється. Звір колонки, умови, значення та потрібний порядок.':'На прикладі все збігається, але після зміни даних — ні. Перевір межі, NULL, зв’язки та підрахунки.',tables:preview};
    }
    return {status:'correct',message:'Правильно на трьох наборах даних. Цю вправу збережено.',tables:preview};
  }catch(error){return {status:check?'incorrect':'error',message:error instanceof Error?error.message:String(error),tables:preview};}
}
