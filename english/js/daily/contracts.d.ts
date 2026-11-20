/** Host-facing contracts. Runtime: course.js + engine.js (CommonJS or globals). */
export type BlockId='review'|'vocabulary'|'reading'|'listening'|'grammar'|'speaking'|'writing'|'summary';
export interface ChoiceQuestion {prompt:string;options:string[];correct:number;explanation:string}
export interface VocabularyItem {id:string;en:string;uk:string;example:string}
export interface Correction {original:string;improved:string;explanation:string}
export interface Feedback {source:'ai'|'self';summary:string;corrections:Correction[];rewrite:string;strengths?:string[];skills:Partial<Record<'task'|'clarity'|'grammar'|'vocabulary'|'coherence'|'interaction',number|null>>|null;pronunciation?:null}
export interface LessonDefinition {
  id:string;version:string;number:number;week:number;day:number;type:'lesson'|'simulation'|'checkpoint';
  title:string;theme:string;mission:string;prerequisites:string[];level:string;minutes:55;
  blocks:{id:BlockId;title:string;minutes:number}[];
  concept:{explanation:string;uk:string;caveat:string};vocabulary:VocabularyItem[];newVocabulary:boolean;
  reading:{text:string;questions:ChoiceQuestion[];retell:string};
  listening:{dialogue:{speaker:string;text:string}[];questions:ChoiceQuestion[]};
  grammar:{title:string;explanation:string;exercises:(ChoiceQuestion&{id:string})[]};
  speaking:{role:string;prompt:string;outline:string[];phrases:string[];questions:string[];optionalQuestion:string;model:string;retry:string;scenarioId:string|null;code:string|null};
  writing:{prompt:string;minWords:number;targetWords:string;checklist:string[];model:string};
}
export interface ReviewItem {id:string;kind:'vocabulary'|'grammar'|'correction'|'transfer'|'diagnostic';prompt:string;answer:string;explanation:string;intervalIndex?:number;dueDay?:string;lastDay?:string;unresolved?:boolean;independent?:number;assisted?:number;mixed?:boolean}
export interface LessonSession {
  version:1;id:string;lessonId:string;contentVersion:string;mode:'course'|'maintenance';dayKey:string;
  startedAt:string;endedAt?:string;status:'active'|'completed';blockIndex:number;paused:boolean;activeMs:number;
  blockMs:Partial<Record<BlockId,number>>;lesson:LessonDefinition;reviews:ReviewItem[];
  answers:Record<string,string>;results:Record<string,{correct:boolean;assisted:boolean;at:string}>;
  attempts:{key:string;correct:boolean;assisted:boolean;at:string;selfReported?:boolean;technical?:boolean}[];
  revealed:Record<string,boolean>;listens:number;listeningUnavailable?:boolean;transcriptVisible:boolean;
  sources:Record<string,'voice'|'voice-edited'|'typed'>;feedback:Partial<Record<'speaking'|'writing',Feedback>>;
  support:'guided'|'standard'|'light';dialogueQuestions?:Record<number,string>;
}
export interface StorageAdapter {getItem(key:string):string|null;setItem(key:string,value:string):void}
export interface DailyState {
  version:1;contentVersion:string;createdAt:string;activeSession:LessonSession|null;sessions:LessonSession[];
  reviews:Record<string,ReviewItem>;completedDays:string[];xp:number;legacy:Record<string,unknown>;
  familiarWords:{id:string;verified:false}[];settings:{reminderTime:string;reminderEnabled:boolean};migration:{from:string;at:string};
}
export interface LessonEngine {
  state:DailyState;current():LessonSession|null;nextLesson():LessonDefinition|null;start():LessonSession|null;
  save():DailyState;setAnswer(key:string,value:string,source?:'typed'|'voice'|'voice-edited'):void;
  reveal(key:string):void;grade(key:string,correct:boolean,details?:{assisted?:boolean;selfReported?:boolean}):unknown;
  checkText(key:string,expected:string):unknown;checkChoice(key:string,question:ChoiceQuestion):unknown;
  tick(milliseconds:number,status?:{visible?:boolean;waiting?:boolean;focused?:boolean}):void;
  requirements(block?:BlockId):boolean;advance():void;previous():void;pause(value:boolean):void;
  finish():LessonSession|null;streak():number;exportProgress():string;importProgress(data:string|unknown):void;
}
export interface AIProvider {
  transcribe(audio:string,mimeType:string):Promise<{text:string;source:'voice'}>;
  nextTurn(context:string,role:string,turns:{question:string;answer:string}[]):Promise<{question:string}>;
  evaluate(area:'speaking'|'writing',task:string,text:string,turns?:{question:string;answer:string}[],origin?:string):Promise<Feedback>;
}
