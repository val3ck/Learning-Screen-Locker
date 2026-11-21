import type {TrackDurations,TrackProgress} from './tracks';
export interface Topic {id:string; title:string; chapter:number; prerequisites:string[]}
export interface Progress {version:1; moduleId:string; catalogVersion:string; confirmedTopicIds:string[]; practiceTopicIds:string[]; completedSourceIds:string[]; syncedAt:string}
export interface DataTable {name:string; columns:{name:string; type:string}[]; rows:Record<string,unknown>[]}
export interface Task {
  moduleId:string; contentVersion:string; id:string; templateId:string; topicIds:string[];
  seed:number; difficulty:number; title:string; brief:string; hints:string[];
  starter:string; tables:DataTable[]; payload:unknown; selectionReason?:string;
  learning?:{topicId:string;title:string;explanation:string};
}
export interface ExecutionResult {status:'correct'|'incorrect'|'error'|'ran'; message:string; tables?:DataTable[]; technical?:boolean}
export interface Runner {prepare():Promise<void>; run(task:Task,answer:string,check:boolean):Promise<ExecutionResult>; dispose():void}
export interface TopicHistory {topicId:string; intervalIndex:number; dueAt:string; lastReviewedAt:string; independent:number; assisted:number; missed:number}
export interface Attempt {at:string; taskId:string; templateId:string; topicIds:string[]; seed:number; answer:string; status:ExecutionResult['status']; technical:boolean; elapsedMs:number; hints:number; check:boolean}
export interface SessionRecord {
  version:1; id:string; moduleId:string; contentVersion:string; dayKey:string; mode:'daily'|'practice'|'demo';
  startedAt:string; endedAt?:string; outcome?:'completed'|'surrendered'|'interrupted'|'technical';
  activeMs:number; currentIndex:number; tasks:Task[]; answers:string[]; hintLevels:number[];
  solved:boolean[]; taskElapsedMs:number[]; attempts:Attempt[]; paused?:boolean; baseTaskCount?:number; durationMinutes?:number;
}
export interface GenerationContext {confirmedTopicIds:string[]; history:Record<string,TopicHistory>; sessions:SessionRecord[]; now:string; seed:number;allowNewTopic?:boolean}
export interface SolutionExample {id:string; title:string; code:string; explanation:string; whenToUse:string; requiredTopicIds:string[]}
export interface SolutionReview {recommended:SolutionExample; alternatives:SolutionExample[]; principles:string[]; pitfalls:string[]; performanceNote:string}
export interface LessonPreview {topicId:string; title:string; explanation:string; brief:string; example:string; tables:DataTable[]}
export interface LearningModule {
  controller?:{restore(state:unknown,now?:()=>Date):import('./learning').LearningController};
  manifest:{id:string; version:string; title:string; capabilities:string[]};
  catalog:Topic[];
  progressAdapter:{parse(input:unknown):Progress; source?:{url:string; serverEntry:string; storageConfigFile?:string; bridgeAssets?:string[]}};
  taskProvider:{generate(context:GenerationContext):Task[]; solution(task:Task):string; review?(task:Task):SolutionReview; extraTask?(context:GenerationContext,session:SessionRecord):Task; nextLesson?(confirmedTopicIds:string[]):LessonPreview|null};
  runner:{create():Runner};
  presentation:{language:string; answerLabel:string; contextLabel:string};
}
export interface ModuleState {version:1; moduleId:string; progress:Progress|null; history:Record<string,TopicHistory>; learnedTopicIds?:string[]}
export interface Settings {version:1; setupComplete:boolean; autoStart:boolean; statisticsPath:string; coursePath:string; activeModuleId:string; minPracticeMinutes:number; durationMinutes?:TrackDurations; dailyEnabledAfterDay:string; englishEnabled?:boolean;englishEnabledAfterDay?:string;englishStartHour?:number;englishCoursePath?:string;sqlAIEnabled?:boolean;sqlLearningBonus?:boolean;sqlAIFallback?:boolean}
export interface ScheduleState {version:1; dayKey:string; eligible:boolean; delayMs:number; activeMs:number; warned:boolean; triggered:boolean; finished:boolean; lastTick:number; snoozedUntil?:number; warningRemainingMs?:number}
export interface WarningStatus {remainingSeconds:number; shortcutAvailable:boolean; pausedSession:boolean}
export interface SQLAIStatus {enabled:boolean;lunaConfigured:boolean;fallbackEnabled:boolean;fallbackConfigured:boolean;cached:number;busy:boolean;message:string}
export const SQL_CHAT_LIMIT = 5;
export const SQL_CHAT_QUESTION_LIMIT = 1200;
export interface SQLChatRequest {sessionId:string;taskId:string;question:string;feedback?:string}
export interface SQLChatReply {answer:string;model:string;provider:string}
export interface Bootstrap {settings:Settings; tracks:TrackProgress; module:ModuleState; sessions:SessionRecord[]; schedule:ScheduleState; demo:boolean; recoveryMessages:string[]; activeSession:SessionRecord|null; shortcutAvailable:boolean;english?:import('../modules/english/types').EnglishView;activeLearningSession?:import('./learning').LearningEnvelope|null;sqlAI?:SQLAIStatus}
export interface DesktopAPI {
  bootstrap():Promise<Bootstrap>;
  configure(settings:{autoStart:boolean;minPracticeMinutes?:number}):Promise<void>;
  configureDurations(durations:TrackDurations):Promise<void>;
  trackProgress():Promise<TrackProgress>;
  openCourse():Promise<{ok:boolean; message:string}>;
  importProgress():Promise<{ok:boolean; message:string}>;
  openStatistics():Promise<void>;
  start(mode:'practice'|'demo'):Promise<Bootstrap>;
  saveSession(session:SessionRecord):Promise<void>;
  sqlDraft(sessionId:string,index:number,answer:string):Promise<void>;
  finishSession(session:SessionRecord):Promise<void>;
  extendSession(session:SessionRecord):Promise<SessionRecord>;
  snooze():Promise<Bootstrap>;
  previewWarning():Promise<void>;
  resumeDaily():Promise<Bootstrap>;
  sessionReady(sessionId:string):Promise<void>;
  englishStart(extend?:boolean,lessonId?:string):Promise<import('../modules/english/types').EnglishView>;
  englishPauseExtension():Promise<import('../modules/english/types').EnglishView>;
  englishAction(action:import('./learning').LearningAction):Promise<import('../modules/english/types').EnglishView>;
  englishFinish(reason:'surrendered'|'completed'):Promise<import('../modules/english/types').EnglishView>;
  englishConfigure(settings:{enabled:boolean;startHour:number}):Promise<void>;
  englishOpen(ruleId?:string):Promise<{ok:boolean;message:string}>;
  englishImport():Promise<{ok:boolean;message:string}>;
  englishSaveAudio(key:string,bytes:number[],mime:string):Promise<string>;
  englishLoadAudio(key:string):Promise<{bytes:number[];mime:string}|null>;
  englishSpeech(request:import('../modules/english/types').EnglishSpeechRequest):Promise<import('../modules/english/types').EnglishSpeechAudio>;
  englishTranslate(request:import('../modules/english/translator-view').EnglishTextRequest):Promise<any>;
  englishAI(request:{action:string;area?:string;targetKey?:string;question?:string;provider?:string;options?:Record<string,unknown>;context?:import('../modules/english/dialogue').LunaMessage[]}):Promise<any>;
  sqlAI(request:{action:'settings'|'prepare'|'test';options?:{key?:string;remove?:boolean;enabled?:boolean;fallbackEnabled?:boolean;learningBonus?:boolean}}):Promise<SQLAIStatus>;
  sqlChat(request:SQLChatRequest):Promise<SQLChatReply>;
  englishCheckLanguage(request:{key:string;attemptId?:string}):Promise<{view:import('../modules/english/types').EnglishView;report:import('../modules/english/types').EnglishLanguageReport}>;
  activity(kind:'interaction'|'playback'|'recording'|'waiting'|'idle'):Promise<void>;
  onEvent(callback:(event:{type:'daily'|'progress'|'practice'|'tick'|'pause'|'schedule'|'english'; active?:boolean;clock?:{id:string;activeMs:number;taskElapsedMs:number[];breakRemainingMs?:number}})=>void):()=>void;
}
