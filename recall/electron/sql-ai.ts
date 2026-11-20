import path from 'node:path';
import {Worker} from 'node:worker_threads';
import type {ModuleState,SessionRecord,Settings,SQLAIStatus,Task} from '../src/core/contracts';
import {dayKey} from '../src/core/calendar';
import {availableTopicIds,createSession} from '../src/core/session';
import {getModule} from '../src/modules/registry';
import {extraTask} from '../src/modules/postgresql/continuation';
import {practiceProfile} from '../src/modules/postgresql/practice-profile';
import {AI_TOPICS,compileAIRecord,generationPrompt,type AIIntent,type AIRecord} from '../src/modules/postgresql/ai-plan';
import {Store} from './store';

interface Bank {version:1;day:string;requests:number;records:AIRecord[];used:string[]}
const file='modules/postgresql/ai-bank.json';
export function workerValidator(tasks:Task[]):Promise<string[]>{return new Promise(resolve=>{
  const worker=new Worker(path.join(__dirname,'sql-validator.cjs'),{workerData:{tasks}});let done=false;
  const finish=(ids:string[])=>{if(done)return;done=true;clearTimeout(timer);void worker.terminate();resolve(ids);};
  const timer=setTimeout(()=>finish([]),20000);
  worker.once('message',m=>finish(Array.isArray(m?.ids)?m.ids:[]));worker.once('error',()=>finish([]));worker.once('exit',()=>finish([]));
});}

/** Background-only generation: a protected session never depends on an API reply. */
export class SQLAI {
  private bank:Bank={version:1,day:'',requests:0,records:[],used:[]};
  private pending:Promise<void>|null=null;private lastRequest=0;private message='Задачі готуються у фоні. Перевірка SQL — локальна.';
  constructor(private store:Store,private ai:any,private settings:()=>Settings,private validate=workerValidator){}
  async load(){this.bank=await this.store.read(file,this.bank,(b:any)=>b?.version===1&&typeof b.day==='string'&&Number.isInteger(b.requests)&&b.requests>=0&&Array.isArray(b.records)&&b.records.length<=24&&Array.isArray(b.used)&&b.used.length<=100);}
  status():SQLAIStatus{const c=this.ai.config(),s=this.settings();return {enabled:s.sqlAIEnabled!==false,lunaConfigured:!!c.keys.openai,fallbackEnabled:s.sqlAIFallback!==false,fallbackConfigured:['groq','gemini','openrouter'].some(p=>c.keys[p]),cached:this.bank.records.length,busy:!!this.pending,message:this.message};}
  async save(input:any){if(!input||typeof input!=='object')throw Error('Невірні налаштування.');const s=this.settings();for(const key of ['enabled','fallbackEnabled','learningBonus'])if(input[key]!==undefined&&typeof input[key]!=='boolean')throw Error('Невірне значення перемикача.');if(input.key!==undefined){if(typeof input.key!=='string'||input.key.length>500)throw Error('Невірний ключ.');if(input.key.trim())this.ai.save({provider:'openai',key:input.key});}if(input.remove)this.ai.save({provider:'openai',remove:true});if(typeof input.enabled==='boolean')s.sqlAIEnabled=input.enabled;if(typeof input.fallbackEnabled==='boolean')s.sqlAIFallback=input.fallbackEnabled;if(typeof input.learningBonus==='boolean')s.sqlLearningBonus=input.learningBonus;await this.store.write('settings.json',s);this.lastRequest=0;this.message='Налаштування збережені. Luna — основна модель; резерв використовується лише за потреби.';return this.status();}
  async test(){const c=this.ai.config();if(!c.keys.openai){this.message='OpenAI-ключ ще не додано. Резервні ключі можна налаштувати в English → AI settings.';return this.status();}try{const raw=await this.ai.generate('openai',{system:'Return JSON only: {"ok":true}.',user:'Check the gpt-6-luna connection.'},{...c,models:{...c.models,openai:'gpt-6-luna'}});this.message=raw.ok===true?'Luna 6 відповіла. Підключення працює.':'Luna повернула неочікувану відповідь.';}catch(e){this.message='Luna: '+String((e as Error).message);}return this.status();}
  take(base:Task,known:string[],sessions:SessionRecord[],otherTasks:Task[]=[]):Task{
    if(!this.status().enabled)return base;
    const recent=new Set(sessions.filter(s=>Date.now()-Date.parse(s.startedAt)<7*86400000).flatMap(s=>s.tasks.map(t=>t.templateId)));
    const plannedFocus=practiceProfile(base).focus.join(',');
    const otherShapes=new Set(otherTasks.map(t=>practiceProfile(t).shape));
    for(const record of [...this.bank.records]){try{
      if(record.intent.topicId!==base.topicIds[0]||!!record.intent.learning!==!!base.learning)continue;
      const task=compileAIRecord(record,known);
      if(recent.has(task.templateId)||this.bank.used.includes(task.templateId))continue;
      const profile=practiceProfile(task);
      if(profile.focus.join(',')!==plannedFocus||otherShapes.has(profile.shape))continue;
      this.bank.records=this.bank.records.filter(r=>r!==record);this.bank.used=[...this.bank.used,task.templateId].slice(-100);void this.store.write(file,this.bank);
      task.selectionReason=[base.selectionReason,'Згенеровано '+record.model+'; перевірено PostgreSQL на трьох наборах даних.'].filter(Boolean).join(' ');return task;
    }catch{this.bank.records=this.bank.records.filter(r=>r!==record);}}
    return base;
  }
  prepare(state:ModuleState,sessions:SessionRecord[],force=false){
    if(this.pending)return this.pending;
    if(!this.status().enabled||!this.status().lunaConfigured&&!this.status().fallbackConfigured||!availableTopicIds(state).length)return Promise.resolve();
    if(!force&&Date.now()-this.lastRequest<10*60000)return Promise.resolve();
    this.pending=this.generate(state,sessions).finally(()=>{this.pending=null;});return this.pending;
  }
  private async generate(state:ModuleState,sessions:SessionRecord[]){
    this.lastRequest=Date.now();const today=dayKey(new Date());if(this.bank.day!==today){this.bank.day=today;this.bank.requests=0;}
    if(this.bank.requests>=12){this.message='Фоновий ліміт 12 пакетів на день досягнуто. Готові й локальні задачі залишаються доступними.';return;}
    const known=availableTopicIds(state);
    this.bank.records=this.bank.records.filter(r=>{try{compileAIRecord(r,known);return true;}catch{return false;}});
    const cached=this.bank.records.map(record=>({record,profile:practiceProfile(compileAIRecord(record,known))}));
    const seed=Math.floor(Math.random()*0xffffffff),candidate=createSession(getModule('postgresql'),state,sessions,today,'practice',new Date(),seed);
    const requested=[...candidate.tasks];
    if(this.settings().sqlLearningBonus!==false){const learner={...candidate,solved:[true,true,true]};const next=extraTask({confirmedTopicIds:known,history:state.history,sessions,now:new Date().toISOString(),seed:seed+1,allowNewTopic:true},learner);if(next.learning)requested.push(next);}
    const intents:AIIntent[]=requested.filter(t=>AI_TOPICS.has(t.topicIds[0])).map((t,i)=>({
      key:'task-'+i,topicId:t.topicIds[0],seed:t.seed,domainId:(t.payload as any).domainId,difficulty:t.difficulty,
      learning:t.learning,focusFunctions:practiceProfile(t).focus,
    })).filter(intent=>cached.filter(({record,profile})=>record.intent.topicId===intent.topicId&&
      !!record.intent.learning===!!intent.learning&&profile.focus.join(',')===intent.focusFunctions.join(',')).length<2);
    if(!intents.length){this.message='Запас задач готовий. Новий пакет буде підготовлено після використання.';return;}
    this.bank.requests++;await this.store.write(file,this.bank);
    try{
      const prompt={...generationPrompt(intents,known,this.bank.records.map(r=>JSON.stringify((r.draft as any).plan))),maxOutputTokens:8000},c=this.ai.config(),config={...c,automaticFallback:this.settings().sqlAIFallback!==false,models:{...c.models,openai:'gpt-6-luna'}};
      const result=await this.ai.chain(async(id:string,configuration:any)=>{
        const raw=await this.ai.generate(id,prompt,configuration);if(!Array.isArray(raw?.tasks)||raw.tasks.length>intents.length)throw Error('Невірний пакет SQL-задач.');
        const records:AIRecord[]=[];const tasks:Task[]=[];const seen=new Set();
        for(const draft of raw.tasks){try{const intent=intents.find(i=>i.key===draft.key);if(!intent||seen.has(intent.key))continue;seen.add(intent.key);const record={intent,draft,provider:id,model:configuration.models[id],generatedAt:new Date().toISOString()};tasks.push(compileAIRecord(record,known));records.push(record);}catch{}}
        const valid=new Set(await this.validate(tasks));const accepted=records.filter((r,i)=>valid.has(tasks[i].id));if(!accepted.length)throw Error('Жодна AI-задача не пройшла перевірку.');return {records:accepted};
      },this.settings().sqlAIFallback===false?['openai']:['openai','groq','gemini','openrouter'],'sql',config);
      for(const r of result.records){
        const task=compileAIRecord(r,known),profile=practiceProfile(task);
        if(cached.some(old=>old.record.intent.topicId===r.intent.topicId&&!!old.record.intent.learning===!!r.intent.learning&&old.profile.shape===profile.shape)||this.bank.used.includes(task.templateId))continue;
        this.bank.records.push(r);cached.push({record:r,profile});
      }
      this.bank.records=this.bank.records.slice(-24);await this.store.write(file,this.bank);
      this.message=`Готово ${result.records.length} перевірених задач · ${result.routing.selected.model}.`+(result.routing.switched?' Основна модель недоступна; спрацював резерв.':'');
    }catch{this.message='AI-пакет не вдалося підготувати. Recall використає готові локальні задачі й повторить спробу пізніше.';}
  }
}
