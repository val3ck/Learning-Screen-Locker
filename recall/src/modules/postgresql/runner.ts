import type {ExecutionResult,Runner,Task} from '../../core/contracts';
export class PostgreSQLRunner implements Runner {
  private worker:Worker|null=null;private ready:Promise<void>|null=null;private sequence=0;
  private pending:((result:ExecutionResult)=>void)|null=null;private timer:ReturnType<typeof setTimeout>|null=null;
  prepare():Promise<void>{
    if(this.ready)return this.ready;
    this.ready=new Promise((resolve,reject)=>{
      this.worker=new Worker(new URL('./worker.ts',import.meta.url),{type:'module'});
      const timeout=setTimeout(()=>{this.dispose();reject(new Error('PostgreSQL не запустився за 30 секунд.'));},30000);
      this.worker.onmessage=({data})=>{
        if(data.ready){clearTimeout(timeout);resolve();return;}
        if(data.startupError){clearTimeout(timeout);this.dispose();reject(new Error(data.startupError));return;}
        if(data.id!==this.sequence)return;
        if(this.timer)clearTimeout(this.timer);this.timer=null;const pending=this.pending;this.pending=null;pending?.(data.result);
      };
      this.worker.onerror=()=>{clearTimeout(timeout);reject(new Error('Збій ізольованого SQL-рушія.'));this.fail('SQL-рушій перезапускається. Спробуй ще раз.');};
    });
    return this.ready;
  }
  async run(task:Task,answer:string,check:boolean):Promise<ExecutionResult>{
    try{await this.prepare();}catch(error){return {status:'error',technical:true,message:String(error)};}
    if(this.pending)return {status:'error',technical:true,message:'Попередній запит ще виконується.'};
    return new Promise(resolve=>{
      this.pending=resolve;const id=++this.sequence;
      this.timer=setTimeout(()=>this.fail('Запит зупинено через 20 секунд. Рушій буде відновлено для наступної спроби.'),20000);
      this.worker!.postMessage({id,task,answer,check});
    });
  }
  private fail(message:string){const pending=this.pending;this.pending=null;this.dispose();pending?.({status:'error',technical:true,message});}
  dispose(){if(this.timer)clearTimeout(this.timer);this.timer=null;this.worker?.terminate();this.worker=null;this.ready=null;}
}
