import type {LearningEnvelope} from '../../core/learning';
export type EnglishSpeechRequest={kind:'word'|'catch-word';index:number}|{kind:'dialogue'|'model'};
export interface EnglishSpeechAudio {base64:string;mime:'audio/wav';voice:string;language:string;provider?:string;fallbackReason?:string}
export interface EnglishChoice {prompt:string;options:string[];correct:number;explanation:string;id?:string;openPrompt?:string;instruction?:string;targetForm?:string;hint?:string;example?:string}
export interface EnglishWord {id:string;en:string;uk:string;example:string;pos?:string;definition?:string;conceptPrompt?:string;task?:{instruction:string;prompt:string;clue:string;answer:string;example:string;hint:string}}
export interface EnglishCatchWord {word:string;pos:string;uk:string;meaning:string;quote:string}
export interface EnglishFrame {label:string;phrase:string;uk:string;example:string}
export interface EnglishGuidedTask {key:string;kind:'reorder'|'gap';prompt:string;answer:string;instruction:string;chunks:string[];context?:string;explanation:string}
export interface EnglishLesson {
 productionMode?:'ai-opinion-v1';
 curriculumVersion?:number;
  guidedTasks?:{version:1;vocabulary:EnglishGuidedTask[];reading:EnglishGuidedTask[];speaking:EnglishGuidedTask[];writing:EnglishGuidedTask[]};
  id:string;version:string;number:number;week:number;day:number;type:'lesson'|'simulation'|'checkpoint';title:string;theme:string;mission:string;level:string;minutes:number;newVocabulary:boolean;
  blocks:{id:string;title:string;minutes:number}[];
  concept:{explanation:string;uk:string;caveat:string;summary?:string;steps?:string[];realWorldWhy?:string;misconception?:string;ukBrief?:string};
  vocabulary:EnglishWord[];
  reading:{title?:string;genre?:string;guide?:string;text:string;questions:EnglishChoice[];retell:string};
  listening:{context?:string;catchWords?:EnglishCatchWord[];dialogue:{speaker:string;text:string}[];questions:EnglishChoice[]};
  grammar:{title:string;explanation:string;nativePatterns?:EnglishFrame[];exercises:EnglishChoice[]};
  speaking:{role:string;prompt:string;outline:string[];phrases:string[];questions:string[];optionalQuestion:string;model:string;retry:string;code:string|null;scenario?:{layerTitle:string;context:string;task:string;pointsToCover:string[]};frames?:EnglishFrame[]};
  writing:{prompt:string;minWords:number;targetWords:string;checklist:string[];model:string;brief?:{layerTitle?:string;format:string;recipient:string;purpose:string;situation:string;requirements:string[]};frames?:EnglishFrame[]};
}
export interface EnglishResult {correct:boolean;assisted:boolean;at:string;selfReported?:boolean;ungraded?:boolean;wordingChecked?:boolean;scope?:'rules'|'answer'|'guided'|'wording'|'ai';message?:string}
export interface EnglishLanguageIssue {message:string;offset:number;length:number;replacements:string[];ruleId:string;category:string}
export interface EnglishLanguageReport {version:1;source:'local-rules';engine:string;text:string;matches:EnglishLanguageIssue[];checkedAt:string;reviewed:boolean;ignored:boolean;taskMessage?:string}
export interface EnglishReview {id:string;kind:string;prompt:string;answer:string;explanation:string;unresolved?:boolean;dueDay?:string;lastDay?:string;mixed?:boolean;intervalIndex?:number;independent?:number;assisted?:number}
export interface EnglishFeedback {source:'self'|'ai'|'local';summary:string;corrections:{original:string;improved:string;explanation:string}[];rewrite?:string;skills?:Record<string,number|null>|null}
export interface EnglishAttempt {
  id:string;lessonId:string;dayKey:string;startedAt:string;endedAt?:string;status:'active'|'completed';paused:boolean;activeMs:number;blockIndex:number;blockMs:Record<string,number>;lesson:EnglishLesson;reviews:EnglishReview[];answers:Record<string,string>;sources:Record<string,string>;results:Record<string,EnglishResult>;attempts:({key:string;correct:boolean;assisted:boolean;at:string;selfReported?:boolean;technical?:boolean;scope?:string;ungraded?:boolean;answer?:string})[];revealed:Record<string,boolean>;listens:number;transcriptVisible:boolean;listeningUnavailable?:boolean;feedback:Record<string,EnglishFeedback>;support:string;languageChecks?:Record<string,EnglishLanguageReport>;[key:string]:unknown;
}
export interface EnglishCourseState {version:1;contentVersion:string;createdAt:string;activeSession:EnglishAttempt|null;sessions:EnglishAttempt[];reviews:Record<string,EnglishReview>;completedDays:string[];xp:number;legacy:Record<string,unknown>;familiarWords:{id:string;verified:false}[];settings:{reminderTime:string;reminderEnabled:boolean};migration:unknown}
export interface EnglishPractice {aiAssessment?:any;id:string;kind:'word'|'choice'|'production'|'sentence';prompt:string;answer:string;explanation:string;options?:string[];correct?:number;result?:EnglishResult;value:string;revealed:boolean;attempts:number;instruction?:string;clue?:string;hint?:string;example?:string;wordBank?:string[];wordId?:string;presentationVersion?:number;reference?:{label:string;text:string;status:string};previousAnswers?:string[]}
export interface EnglishRunPayload {phase:'lesson'|'break'|'reinforcement';lessonId:string;breakRemainingMs:number;breakUsed:boolean;practiceIndex:number;practice:EnglishPractice|null;practiceHistory?:EnglishPractice[];extraPractice?:true}
export interface EnglishDay {activeMs:number;dismissed:boolean;fulfilled:boolean;learningComplete:boolean}
export interface EnglishDocument {version:2;revision:number;course:EnglishCourseState;days:Record<string,EnglishDay>;runs:LearningEnvelope<EnglishRunPayload>[];activeRunId:string|null;lease?:{owner:string;expiresAt:number};importedAt?:string}
export interface EnglishView {
 aiSettings?:any;
 canExtend?:boolean;
 blockStatus?:{id:string;title:string;done:boolean}[];
 advanceBlocker?:string;
  revision:number;courseVersion:string;lesson:EnglishLesson;attempt:EnglishAttempt|null;run:LearningEnvelope<EnglishRunPayload>|null;day:EnglishDay;completedLessons:number;totalLessons:number;familiarWords:number;reviewsDue:number;readonly:boolean;canAdvance:boolean;canCompleteLesson:boolean;canSurrender:boolean;canFinish:boolean;exitQuestions:{key:string;prompt:string;kind:'word'|'choice';answer:string;options?:string[];correct?:number}[];history:{id:string;title:string;at:string;activeMs:number;selfReported:number;assisted:number;independent:number;listeningUnavailable:boolean}[];recordings?:Record<string,string>;message?:string;
  savedWork?:{id:string;title:string;at:string;answers:Record<string,string>;checks:Record<string,EnglishLanguageReport>;assessments?:Record<string,any>;coachingPrompt?:string}[];
}
