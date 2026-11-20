import {PGlite} from '@electric-sql/pglite';
import {executeSQL} from './engine';
import type {Task} from '../../core/contracts';
const wasmURL=new URL('../../../node_modules/@electric-sql/pglite/dist/pglite.wasm',import.meta.url).href;
const dataURL=new URL('../../../node_modules/@electric-sql/pglite/dist/pglite.data',import.meta.url).href;
let db:PGlite;
const ready=(async()=>{
  const [wasm,fsBundle]=await Promise.all([fetch(wasmURL).then(r=>{if(!r.ok)throw new Error('Не вдалося завантажити PostgreSQL WASM.');return r.arrayBuffer();}).then(b=>WebAssembly.compile(b)),fetch(dataURL).then(r=>{if(!r.ok)throw new Error('Не вдалося завантажити навчальний PostgreSQL.');return r.blob();})]);
  db=new PGlite({wasmModule:wasm,fsBundle});await db.waitReady;
})();
ready.then(()=>self.postMessage({ready:true})).catch(error=>self.postMessage({startupError:String(error)}));
self.onmessage=async({data}:{data:{id:number;task:Task;answer:string;check:boolean}})=>{
  try{await ready;self.postMessage({id:data.id,result:await executeSQL(db,data.task,data.answer,data.check)});}
  catch(error){self.postMessage({id:data.id,result:{status:'error',technical:true,message:`Рушій PostgreSQL недоступний: ${String(error)}`}});}
};
