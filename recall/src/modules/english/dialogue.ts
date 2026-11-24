import type {EnglishLesson} from './types';

export const LUNA_CONTEXT_LIMIT = 5;
export const LUNA_INPUT_LIMIT = 1200;
export const SPEAKING_INPUT_LIMIT = 3600;
export const SPEAKING_MAX_REPLIES = 4;
export const SPEAKING_FINISH_AVAILABLE = 3;
export const SPEAKING_HISTORY_LIMIT = 20;
export const SPEAKING_RECAP_LIMIT = 130;
export const SPEAKING_RECAP_KEYS = ['action','reason','verification'] as const;
export interface LunaMessage { role: 'user' | 'assistant'; text: string }
export type SpeakingRecap = Partial<Record<typeof SPEAKING_RECAP_KEYS[number],string>>;
export interface SpeakingCorrection {start:number;end:number;replacement:string;explanation:string}
export interface SpeakingReview {score:number;reason:string;corrections:SpeakingCorrection[]}
export interface SpeakingMessage extends LunaMessage {review?:SpeakingReview}
export interface SpeakingDialogue {
  turn: number;
  clearReplies: number;
  status: 'clarify' | 'continue' | 'ready' | 'wrapped';
  messages: SpeakingMessage[];
  feedback: string;
  recap?: SpeakingRecap;
  hint?: string;
}

function shortText(value:unknown,max:number):value is string {
  return typeof value==='string'&&!!value.trim()&&value.length<=max;
}

function isLunaMessage(message:any):message is LunaMessage {
  return !!message&&['user','assistant'].includes(message.role)&&shortText(message.text,LUNA_INPUT_LIMIT);
}

export function isLunaContext(value: unknown): value is LunaMessage[] {
  return Array.isArray(value)&&value.length<=LUNA_CONTEXT_LIMIT&&value.every(isLunaMessage);
}

function validReview(review:SpeakingReview,text:string){
  return !!review&&Number.isInteger(review.score)&&review.score>=0&&review.score<=100&&shortText(review.reason,320)&&
    Array.isArray(review.corrections)&&review.corrections.length<=3&&review.corrections.every((fix,index,all)=>
      !!fix&&Number.isInteger(fix.start)&&Number.isInteger(fix.end)&&fix.start>=(all[index-1]?.end??0)&&fix.end>fix.start&&
      fix.end<=text.length&&typeof fix.replacement==='string'&&fix.replacement.length<=64&&shortText(fix.explanation,280));
}

export function isSpeakingDialogue(value: unknown): value is SpeakingDialogue {
  const d = value as SpeakingDialogue;
  return !!d && Number.isSafeInteger(d.turn) && d.turn > 0 && Number.isSafeInteger(d.clearReplies) &&
    d.clearReplies >= 0 && d.clearReplies <= d.turn && ['clarify', 'continue', 'ready','wrapped'].includes(d.status) &&
    (d.status !== 'ready' || d.clearReplies >= 2) && (d.status!=='wrapped'||d.turn>=SPEAKING_FINISH_AVAILABLE) &&
    Array.isArray(d.messages)&&d.messages.length<=SPEAKING_HISTORY_LIMIT&&
    d.messages.every(m=>m&&['user','assistant'].includes(m.role)&&shortText(m.text,m.role==='user'?SPEAKING_INPUT_LIMIT:LUNA_INPUT_LIMIT)&&
      (m.review===undefined||m.role==='user'&&validReview(m.review,m.text)))&&
    d.messages.at(-1)?.role === 'assistant' && typeof d.feedback === 'string' && d.feedback.length <= 280 &&
    (d.hint===undefined||shortText(d.hint,280))&&
    (d.recap===undefined||!!d.recap&&typeof d.recap==='object'&&!Array.isArray(d.recap)&&
      Object.entries(d.recap).every(([key,value])=>SPEAKING_RECAP_KEYS.some(allowed=>allowed===key)&&shortText(value,SPEAKING_RECAP_LIMIT)));
}

export function speakingDone(state?:SpeakingDialogue) {
  return state?.status==='ready'||state?.status==='wrapped';
}

export function canWrapSpeaking(state?:SpeakingDialogue):state is SpeakingDialogue {
  return !!state&&!speakingDone(state)&&state.turn>=SPEAKING_FINISH_AVAILABLE;
}

export function dialogueKey(state?: SpeakingDialogue) { return `live-speaking-${state?.turn ?? 0}`; }
export function speakingQuestion(lesson:EnglishLesson,state?:SpeakingDialogue) {
  return state?.messages.at(-1)?.text||speakingBrief(lesson).opening;
}

export function speakingBrief(lesson: EnglishLesson) {
  if (lesson.id === 'daily-004') return {
    opening: 'The team cannot finish every reminder request in one sprint. What would you change first, and why?',
    goal: 'Pick one change to the appointment reminders. Say what you would count before and after the change to see if it helped.',
    facts: 'The clinic team has two weeks to improve the appointment reminders. There are more requests than the team can finish in this sprint.',
    phrases: ['I’d prioritize… because…', 'Within this sprint, we could…', 'To tell whether it worked, I’d compare…'],
  };
  if (lesson.id === 'daily-030') return {
    opening: 'We added an index on patient_email, but the search still takes two seconds. What would you check first?',
    goal: 'Explain what you would look for in the query plan and how you would verify an improvement.',
    facts: 'The clinic searches appointments by exact patient email. An index was added. The current search still takes two seconds. No new query plan has been shared.',
    phrases: ['I’d start by checking…', 'That would tell us whether…', 'To verify the improvement, I’d compare…'],
  };
  if (lesson.id === 'daily-065') return {
    opening: 'The API container now starts, but I still can’t reach it from the host on port 3000. What would you check first?',
    goal: 'Explain how to narrow down the connection problem and how to verify the fix from the host.',
    facts: 'The team packaged a consistent runtime. On staging, the API logs say it is listening on port 3000, but a request from the host gets connection refused.',
    phrases: ['Let’s rule out… first.', 'If the logs show…, I’d check…', 'To confirm it’s fixed, we can…'],
  };
  const scenario = lesson.speaking.scenario;
  const source = lesson.concept.caseStudy;
  return {
    opening: 'What would you do next in this situation, and why?',
    goal: scenario?.pointsToCover.at(-1) || 'Explain your next step and how you would check it.',
    facts: source?.scene&&source?.problem ? `${source.scene} ${source.problem}` : scenario?.context || lesson.concept.explanation,
    phrases: ['I’d start by…', 'The reason is that…', 'To check whether it worked, I’d…'],
  };
}

const weeklyConnections = [
  ['Start by explaining what the project does and who uses it.', 'You introduced the project. Now explain who owns each part of it.', 'Once the team knows who owns each part, decide what to change using user feedback.', 'Turn that feedback into a sprint goal and a backlog item.', 'Use the sprint plan to explain what you finished, what is blocked, and what help you need.'],
  ['You reported what changed. Now use Git history to show when and where it changed.', 'You can trace a change in history. Next, keep your proposed fix separate on a branch.', 'A branch contains your work. Split that work into commits a teammate can understand.', 'Turn those commits into a pull request that explains the change and how to test it.', 'Take the reviewer’s side and ask for a concrete improvement to the pull request.'],
  ['The review is done. Follow the approved change from development toward production.', 'Before shipping the change, explain how its build and dependencies become a repeatable artifact.', 'Run the repeatable build and checks automatically for every change.', 'The checks ran, but deployment failed. Explain what happened and how to recover.', 'Compare the environments to explain why a fix can work locally and fail after deployment.'],
  ['Look at the deployed service from the client’s side. Follow one request and response.', 'You traced a request. Make its fields and responses predictable for both ends.', 'Now decide which requests need to identify the user and keep a session.', 'Consider what the client should see when a request fails or a session has expired.', 'Carry that error handling to a service your team cannot control.'],
  ['Follow an API request past the server and into the database.', 'You filtered rows in SQL. Now explain how the database finds those rows.', 'You sped up a read. Next, protect a reservation when two writes arrive together.', 'After protecting writes, count how many reads the dashboard sends for related records.', 'You reduced extra reads. Now return a large result set a page at a time.'],
  ['The API now returns a page at a time. Explain how the interface remembers what to show.', 'The screen has state. Next, find which events change it and when listeners should be removed.', 'Each keypress triggers an event. Decide which ones should actually send a request.', 'Search now sends fewer requests. Handle an older response arriving after a newer one.', 'You handled late responses. Check what resources still remain when the view closes.'],
  ['You saw a callback return late. Now explain how asynchronous work makes that possible.', 'Compare waiting for one request at a time with starting independent requests together.', 'Those requests can overlap. Explain when actual parallel work will help.', 'Apply the same reasoning to a large payload and process it a chunk at a time.', 'The stream produces chunks. Decide what happens when the consumer cannot keep up.'],
  ['You identified boundaries between parts of the system. Change one without changing its behaviour.', 'After moving code, pick tests that verify the boundary you moved.', 'Once that boundary is tested, let a caller switch between implementations behind it.', 'A common interface is one option. Compare it with a simpler approach and explain the cost.', 'Apply the same trade-off reasoning to whether the whole service should be split.'],
  ['Before changing the architecture, decide which measurements describe the performance problem.', 'You found a slow read. Try serving repeated reads from a cache.', 'The cache speeds up reads. Now explain what happens when the underlying data changes.', 'Expiry fixes freshness. Next, handle many callers trying to refill the same key.', 'Turn those performance hypotheses into a load test with a clear comparison.'],
  ['The load test showed limits. Decide which infrastructure resources need to change.', 'You picked an environment. Package the application so its runtime travels with it.', 'A container is running. Compare adding replicas with increasing capacity per instance.', 'You can run several instances. Decide how to roll out a change to only some of them first.', 'Keep the rollout observable. Explain which logs, metrics and traces would confirm its health.'],
  ['You can see who uses the system. Define which actions each role should be allowed to take.', 'Permissions limit who can act. Next, explain why data sent by a trusted user still needs safe handling.', 'We handle inputs safely. Decide how to store and rotate the credentials the service uses.', 'Prepare for failures despite those controls. Explain how to restore the service and verify it.', 'You recovered the service. Write the timeline and agree on a concrete follow-up with the team.'],
  ['You reviewed a failure in one system. Now ask what different copies of data can observe during a failure.', 'One request can fail temporarily. Decide when and how often to retry it.', 'Retries can repeat an action. Explain how the receiver recognises a duplicate.', 'You can recognise duplicates. Next, make sure a saved change does not lose its outgoing event.', 'You protected event delivery. Decide when to stop calling an unhealthy dependency and when to recover.'],
] as const;

export function topicConnection(lesson: EnglishLesson): string {
  if (lesson.type === 'simulation') return 'Bring this week’s ideas together. Explain the evidence, agree on a next step, and tell the team how you will check it.';
  if (lesson.type === 'checkpoint') return 'Use what you practised this week in a new situation. Start with what you remember, then verify the technical details.';
  return weeklyConnections[lesson.week - 1]?.[lesson.day - 1] || '';
}
