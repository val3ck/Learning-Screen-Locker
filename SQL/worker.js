import {PGlite} from './node_modules/@electric-sql/pglite/dist/index.js';
import {execute} from './engine.js';
const db=new PGlite();
await db.waitReady;
postMessage({ready:true});
self.onmessage=async({data})=>{try{postMessage({id:data.id,...await execute(db,data)});}catch(e){postMessage({id:data.id,error:e.message,hint:e.hint||null});}};
