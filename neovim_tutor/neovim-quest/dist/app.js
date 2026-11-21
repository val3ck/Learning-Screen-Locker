import {tutorChat} from './luna-chat.js';
import { VimEngine } from './engine.js';
import { chapters, sandboxText } from './course.js';
import { ui, dialogueText, chapterTitle, missionTitle, localizedWiki, terminalMessage } from './i18n.js';
import { INTRO_SILENCE_MS, movementArena, movementStart, createNavigationRoute, pointerFor, moveInArena } from './scenes.js';
import { Soundscape } from './audio.js';
import {ExamSession,examCopy,examName} from './exams.js';
import {CODE_LANGUAGES,problemFor,defaultTests} from './programs.js';
import {nextPosition as learningPosition} from './progression.js';
import {runCode} from './runner.js';
import {connectProgress} from './recall-sync.js';

const $ = selector => document.querySelector(selector);
const html = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storageKey = 'neovim-quest-v1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { /* Storage is optional. */ }
const sharedProgress=await connectProgress(saved,storageKey,chapters);
saved=sharedProgress.state;
const sound = new Soundscape(saved.audioRevision===2?saved.audio:{...saved.audio,dialogue:0.5,music:0},{onchange:state=>{const controls=document.querySelector('.sound-controls');if(controls)controls.dataset.audioState=state;}});
let language = saved.language === 'uk' ? 'uk' : 'en';
let progress = chapters.map((c, i) => Math.max(0, Math.min(Number(saved.progress?.[i]) || 0, c.missions.length)));
let sandboxSaved = typeof saved.sandbox === 'string' ? saved.sandbox : sandboxText;
let dialogues = Array.isArray(saved.dialogues) ? saved.dialogues.filter(d => d && (d.kind || typeof d.text === 'string')).slice(-150).map(d => d.kind ? d : ({ kind:d.tone === 'success' ? 'success' : d.chapter < 0 ? 'sandbox' : 'mission', chapter:Math.max(0, Math.min(8, d.chapter || 0)), step:Math.max(0, Math.min(chapters[Math.max(0,Math.min(8,d.chapter||0))].missions.length-1,d.step||0)) })) : [];
let chapter = 0, step = 0, sandbox = false, engine, solved = false, context = {};
let examIndex=null,examSession=null,examCompleted=chapters.map((_,i)=>[0,1,2].map(j=>Array.isArray(saved.examCompleted?.[i])?saved.examCompleted[i][j]===true:j<(Number(saved.examProgress?.[i])||0)));
let examProgress=examCompleted.map(row=>row.filter(Boolean).length);
let codeLanguage=CODE_LANGUAGES[saved.codeLanguage]?saved.codeLanguage:'javascript',referenceOpen=false,examPanelOpen=true;
let runnerState=null,runnerJob=null,menuIntroduced=!!saved.menuIntroduced;
let phase = 'silent', menuOpen = false, menuTab = 'stages', manualQuery = '', resetConfirm = false;
let route = null, routeIndex = 0, currentEntry = null, pointSpec = null, speechState = null;
let flow = new AbortController(), speech = new AbortController(), saveTimer, pointerFrame;
const t = key => ui[language][key];
const ex = key => examCopy[language][key];
const mission = () => chapters[chapter].missions[step];
const totalDone = () => progress.reduce((sum, n) => sum + n, 0)+examProgress.reduce((a,b)=>a+b,0);
const goal = () => examSession?examSession.target:route ? route[routeIndex] : !sandbox ? mission().target : null;
function wait(ms, signal) {
  if (signal?.aborted) return Promise.resolve(false);
  return new Promise(resolve => {
    const abort = () => { clearTimeout(timer); resolve(false); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(true); }, ms);
    signal?.addEventListener('abort', abort, { once:true });
  });
}
function newFlow() { flow.abort(); speech.abort(); flow = new AbortController(); return flow.signal; }
async function active(signal) { while (menuOpen || document.hidden) { if (!await wait(120, signal)) return false; } return !signal.aborted; }
function sessionPosition() {
  return learningPosition({chapter,step,exam:examIndex,solved,sandbox,completed:examCompleted[chapter]},chapters);
}
function persist() {
  const snapshot={progress,examProgress,examCompleted,practice:examSession?.snapshot(),codeLanguage,menuIntroduced,sandbox:sandboxSaved,dialogues,language,audio:sound.settings,audioRevision:2,experience:4,session:sessionPosition()};
  let localSaved=false;
  try{localStorage.setItem(storageKey,JSON.stringify(snapshot));localSaved=true;}catch{/* Continue in memory. */}
  sharedProgress.enqueue(snapshot);
  return localSaved;
}

$('#app').innerHTML = `
  <main class="console silent" aria-label="">
    <div class="editor" id="editor" tabindex="0" role="textbox" aria-label="" aria-multiline="true" spellcheck="false"><div class="buffer" id="buffer"></div></div>
    <div id="file-tabs" class="file-tabs" hidden></div>
    <button id="checklist-toggle" class="checklist-toggle" hidden></button>
    <aside id="practice-panel" class="practice-panel" aria-label="Practice checklist" hidden></aside>
    <div class="terminal-footer"><div class="terminal-status"><span id="mode"></span><span id="pending"></span><span id="position"></span></div><div id="command-line" class="command-line" aria-live="polite"></div></div>
    <svg class="coordinate-pointer" id="coordinate-pointer" aria-hidden="true"><path id="pointer-path" pathLength="1"/><circle id="pointer-ring" r="15"/><circle id="pointer-dot" r="2"/></svg>
    <section class="dialogue" id="dialogue" aria-label="" aria-live="polite" aria-atomic="true"><p id="dialogue-text"><span class="text-reserve" aria-hidden="true"></span><span class="text-visual" aria-hidden="true"></span></p></section>
    <button class="burger" id="menu-toggle" aria-label="" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>
  </main>
  <div class="menu-shade" id="menu-shade" hidden></div>
  <aside class="drawer" id="drawer" role="dialog" aria-label="Menu" aria-modal="true" hidden>
    <header class="drawer-header"><nav aria-label="Menu tabs"><button data-tab="stages"></button><button data-tab="manual"></button><button data-tab="history"></button><button data-tab="luna" hidden>Luna</button></nav><button class="close-menu" data-action="close-menu">×</button></header>
    <div class="drawer-content" id="drawer-content"></div><footer class="drawer-footer" id="drawer-footer"></footer>
  </aside>`;

const luna=tutorChat(()=>({
  id:examSession?'exam:'+chapter:sandbox?'sandbox':chapter+':'+step,
  text:JSON.stringify({
    topic:chapterTitle(language,chapter),
    task:$('#dialogue').textContent,
    mode:engine?.mode,
    goal:goal(),
  }),
}));
$('[data-tab="luna"]').hidden=!luna;

function localizeChrome() {
  document.documentElement.lang = language;
  $('.console').setAttribute('aria-label',t('console')); $('#editor').setAttribute('aria-label',t('editor'));
  $('#dialogue').setAttribute('aria-label',t('dialogue')); $('#menu-toggle').setAttribute('aria-label',t('menu')); $('#menu-toggle').title = `${t('menu')} · F2`;
  $('.close-menu').setAttribute('aria-label',t('close'));
  document.querySelectorAll('[data-tab]').forEach(b => b.textContent=b.dataset.tab==='luna'?'Luna':t(b.dataset.tab));
}
function renderSpeechText() {
  if (!currentEntry) return;
  const text = dialogueText(currentEntry,language);
  $('#dialogue-text').setAttribute('aria-label',text); $('.text-reserve').textContent=text;
  $('.text-visual').textContent = speechState?.typing ? [...text].slice(0,speechState.index).join('') : text;
  requestPointerUpdate();
}
async function speak(entry, { signal=flow.signal, point=null, record=true, speed=42 } = {}) {
  speech.abort(); speech = new AbortController(); const controller=speech;
  const abort = () => controller.abort(); signal.addEventListener('abort',abort,{once:true});
  const voice=sound.beginDialogue();
  const finish = value => { signal.removeEventListener('abort',abort); sound.endDialogue(voice); return value; };
  currentEntry={ chapter,step,exam:examIndex,...entry }; pointSpec=null; requestPointerUpdate();
  const box=$('#dialogue'); const wasVisible=box.classList.contains('visible'); box.classList.remove('visible');
  if (wasVisible && !await wait(reducedMotion?0:210,controller.signal)) return finish(false);
  if (controller.signal.aborted) return finish(false);
  speechState={typing:!reducedMotion,index:0};
  box.dataset.tone=entry.kind==='success'||entry.kind==='routeHit'?'success':''; renderSpeechText();
  if(record){const previous=dialogues.at(-1);if(!previous||previous.kind!==currentEntry.kind||previous.chapter!==chapter||previous.step!==step||entry.kind==='routeHit')dialogues.push({...currentEntry});dialogues=dialogues.slice(-150);persist();}
  box.classList.add('visible');
  if(!await wait(reducedMotion?0:250,controller.signal))return finish(false);
  pointSpec=point;requestPointerUpdate();
  if(!reducedMotion){
    while(speechState.index<[...dialogueText(currentEntry,language)].length){
      const chars=[...dialogueText(currentEntry,language)],char=chars[speechState.index++]; renderSpeechText();
      sound.tick(char,entry.kind);
      if(!await wait(speed+(/[.?!]/.test(char)?95:char==='\n'?130:0),controller.signal))return finish(false);
    }
  }
  speechState.typing=false;renderSpeechText();return finish(true);
}
function requestPointerUpdate(){cancelAnimationFrame(pointerFrame);pointerFrame=requestAnimationFrame(updatePointer);}
function updatePointer(){
  const svg=$('#coordinate-pointer');let target=null;
  if(pointSpec?.cell)target=document.querySelector(`.cell[data-row="${pointSpec.cell[0]}"][data-col="${pointSpec.cell[1]}"]`);
  else if(pointSpec?.selector)target=$(pointSpec.selector);
  if(!target||menuOpen||!$('.console').classList.contains('awakened')||!$('#dialogue').classList.contains('visible')){svg.classList.remove('visible');return;}
  const cell=target.getBoundingClientRect(),box=$('#dialogue').getBoundingClientRect();
  const x=pointSpec.selector?cell.left+20:cell.left+cell.width/2,y=cell.top+cell.height/2;
  if(y<4||y>innerHeight-4||x<0||x>innerWidth){svg.classList.remove('visible');return;}
  let path;
  if(x>box.right+25&&y<box.bottom+24){const sy=Math.max(box.top+16,Math.min(y,box.bottom-16));path=`M ${box.right+9} ${sy} C ${box.right+70} ${sy}, ${x-65} ${y}, ${x-19} ${y}`;}
  else if(y<box.top){const sx=Math.max(box.left+24,Math.min(x,box.right-24));path=`M ${sx} ${box.top-9} C ${sx} ${box.top-65}, ${x} ${y+65}, ${x} ${y+19}`;}
  else {const sx=Math.max(box.left+24,Math.min(x,box.right-24));path=`M ${sx} ${box.bottom+9} C ${sx} ${box.bottom+65}, ${x} ${y-65}, ${x} ${y-19}`;}
  $('#pointer-path').setAttribute('d',path);
  for(const id of ['pointer-ring','pointer-dot']){$('#'+id).setAttribute('cx',x);$('#'+id).setAttribute('cy',y);}
  svg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);svg.classList.add('visible');
}
function focusEditor(){requestAnimationFrame(()=>{if(!menuOpen&&phase!=='silent')$('#editor').focus({preventScroll:true});});}
function prepareScene(c,s,isSandbox=false,exam=null,restore=null){
  runnerJob?.abort();runnerJob=null;runnerState=null;referenceOpen=false;
  chapter=c;step=s;sandbox=isSandbox;solved=false;context={};route=null;routeIndex=0;examIndex=exam;examSession=null;
  if(exam!==null){examSession=new ExamSession(c,exam,restore?.codeLanguage||codeLanguage,restore);engine=examSession.engine;}
  else if(isSandbox)engine=new VimEngine(sandboxSaved);
  else if(c===0&&s===0){route=createNavigationRoute();engine=new VimEngine(movementArena,movementStart);}
  else {engine=new VimEngine(mission().text,mission().cursor);if(mission().modified)engine.savedText='';}
  $('#editor').dataset.scene=isSandbox?'sandbox':c===0?'move':exam!==null?'exam':chapters[c].id;
  $('.console').classList.toggle('exam-mode',exam!==null);
  $('#editor').scrollTop=0;$('#editor').scrollLeft=0;renderBuffer(true);renderExam();persist();
}
function scenePoint(){return sandbox||!engine?null:examSession?(goal()?{cell:goal()}:null):pointerFor(chapter,step,mission(),engine,context,goal());}
async function startMission(c,s=0,isSandbox=false,exam=null,restore=null){
  const signal=newFlow();phase='transition';pointSpec=null;requestPointerUpdate();
  $('.console').classList.add('changing');$('#dialogue').classList.remove('visible');
  if(!await wait(reducedMotion?0:380,signal))return;
  prepareScene(c,s,isSandbox,exam,restore);$('.console').classList.add('awakened');$('.console').classList.remove('silent','changing','hit');sound.setScene('game');
  const line=speak({kind:isSandbox?'sandbox':exam!==null?'examIntro':'mission'},{signal,point:scenePoint()});
  if(!await wait(reducedMotion?0:550,signal))return;phase='playing';focusEditor();await line;
  if(!signal.aborted&&phase==='playing'&&examSession?.done&&!solved)await finishMission();
}
async function runOpening(position={chapter:0,step:0}){
  const signal=newFlow();phase='silent';pointSpec=null;currentEntry=null;engine=null;
  sound.setScene('silent');
  chapter=position.chapter||0;step=position.step||0;sandbox=!!position.sandbox;solved=false;
  examIndex=position.exam??null;examSession=null;runnerJob?.abort();$('#practice-panel').hidden=true;$('#file-tabs').hidden=true;$('#checklist-toggle').hidden=true;$('.console').classList.remove('exam-mode');
  $('#dialogue').classList.remove('visible');$('.console').classList.remove('awakened','changing','hit');$('.console').classList.add('silent');$('#buffer').innerHTML='';
  if(!await wait(INTRO_SILENCE_MS,signal))return;
  phase='intro';$('.console').classList.remove('silent');sound.setScene('intro');
  if(!await speak({kind:'question'},{signal,speed:62}))return;
  if(!await wait(850,signal)||!await active(signal))return;
  prepareScene(position.chapter||0,position.step||0,!!position.sandbox,position.exam??null,saved.practice);$('.console').classList.add('awakened');sound.setScene('game');
  if(!await speak({kind:'wake'},{signal,point:{cell:[engine.row,engine.col]}}))return;
  if(!await wait(550,signal)||!await active(signal))return;
  if(examSession&&chapter===0&&examIndex===0&&!menuIntroduced){menuIntroduced=true;phase='exam-intro';persist();focusEditor();await speak({kind:'menuReveal'},{signal,point:{selector:'#menu-toggle'}});return;}
  phase='playing';focusEditor();await speak({kind:sandbox?'sandbox':examSession?'examIntro':'mission'},{signal,point:scenePoint()});
  if(!signal.aborted&&phase==='playing'&&examSession?.done&&!solved)await finishMission();
}
function nextPosition(){return sessionPosition();}
async function finishMission(){
  if(examSession){solved=true;examCompleted[chapter][examIndex]=true;examProgress[chapter]=examCompleted[chapter].filter(Boolean).length;phase='success';persist();const signal=newFlow();sound.cue(true);renderBuffer();renderExam();await speak({kind:'examDone'},{signal});focusEditor();return;}
  solved=true;progress[chapter]=Math.max(progress[chapter],step+1);persist();phase='success';
  const signal=newFlow(),last=step===chapters[chapter].missions.length-1;
  $('.console').classList.add('hit');renderBuffer();
  sound.cue(true);
  if(last){const reveal=chapter===0&&!menuIntroduced;menuIntroduced=menuIntroduced||reveal;persist();await speak({kind:reveal?'menuReveal':'practiceReady'},{signal,point:reveal?{selector:'#menu-toggle'}:null});focusEditor();return;}
  if(!await speak({kind:'success'},{signal}))return;
  if(!await wait(1600,signal)||!await active(signal))return;
  $('.console').classList.remove('hit');advance();
}
function advance(){if(!solved||menuOpen)return;const next=nextPosition();startMission(next.chapter||0,next.step||0,!!next.sandbox,next.exam??null);}
async function collectTarget(){
  if(routeIndex===route.length-1){finishMission();return;}
  phase='transition';const signal=newFlow();$('.console').classList.add('hit');
  sound.cue();
  if(!await speak({kind:'routeHit'},{signal}))return;
  if(!await wait(450,signal)||!await active(signal))return;
  routeIndex++;$('.console').classList.remove('hit');renderBuffer();
  const line=speak({kind:routeIndex===2?'routeLast':'routeNext'},{signal,point:{cell:goal()}});
  if(!await wait(350,signal))return;phase='playing';await line;
}
function renderBuffer(reveal=false){
  if(!engine)return;
  const selection=engine.selection(),target=goal();let offset=0,result='',appearanceIndex=0;
  const corrections=examSession?.objectives.filter(g=>g.position&&!g.done)||[];
  if(!engine.exited)for(let r=0;r<engine.lines.length;r++){
    const line=engine.lines[r],current=r===engine.row;let content='';
    const correctionEnd=Math.max(0,...corrections.filter(g=>g.position[0]===r).map(g=>g.position[1]+1));
    for(let col=0;col<Math.max(line.length,current?engine.col+1:1,correctionEnd);col++){
      const cursor=current&&col===engine.col,isTarget=target?.[0]===r&&target?.[1]===col&&!solved,selected=selection&&offset+col>=selection[0]&&offset+col<selection[1];
      const correction=corrections.find(g=>g.position[0]===r&&g.position[1]===col);
      const char=isTarget&&!cursor&&(!line[col]||line[col]===' ')?'◆':line[col]||' ';
      const appear=reveal&&char.trim()&&!reducedMotion;
      const classes=['cell',cursor?'cursor':'',cursor&&engine.mode==='insert'?'insert-cursor':'',isTarget&&!cursor?'target':'',selected?'selected':'',correction?'correction':'',appear?'materialize':''].filter(Boolean).join(' ');
      const style=appear?`style="--arrival:${Math.min(appearanceIndex++*9,1300)}ms"`:'';
      content+=`<span class="${classes}" data-row="${r}" data-col="${col}" ${cursor?'id="cursor"':''} ${correction?`title="${html(correction.hint[language])}"`:''} ${style} aria-hidden="true">${html(char)}</span>`;
    }
    result+=`<div class="code-line ${current?'current':''} ${/^\s*(#|\/\/)/.test(line)?'comment':''}"><span class="line-number" aria-hidden="true">${r+1}</span><span class="code" aria-label="${html(line||t('blankLine'))}">${content}</span></div>`;offset+=line.length+1;
  }
  $('#buffer').innerHTML=result;$('#editor').classList.toggle('closed',engine.exited);
  const modes={normal:'NORMAL',insert:'INSERT',visual:'VISUAL','visual-line':'V-LINE',command:'COMMAND',search:'SEARCH'};
  $('#mode').textContent=engine.exited?'':modes[engine.mode];$('#mode').dataset.mode=engine.mode;
  $('#pending').textContent=engine.count+engine.pending;$('#position').textContent=engine.exited?'':`${engine.row+1},${engine.col+1}${engine.dirty?'  [+]':''}`;
  $('#command-line').classList.toggle('error',engine.error);$('#command-line').textContent=engine.mode==='command'?':'+engine.command+'▏':engine.mode==='search'?'/'+engine.command+'▏':terminalMessage(engine.message||'',language);
  const cursor=$('#cursor'),editor=$('#editor');
  if(cursor&&(sandbox||chapter!==0)){const box=cursor.getBoundingClientRect(),bounds=editor.getBoundingClientRect();if(box.top<bounds.top+10||box.bottom>bounds.bottom-10)editor.scrollTop+=box.top-bounds.top-90;if(box.left<bounds.left+35||box.right>bounds.right-20)editor.scrollLeft+=box.left-bounds.left-70;}
  requestPointerUpdate();
}
function sendKey(key){
  if(phase==='exam-intro'&&key==='Enter'&&!menuOpen){phase='playing';speak({kind:'examIntro'},{point:scenePoint()});return;}
  if(menuOpen)return;if(solved){if(key==='Enter')advance();return;}if(phase!=='playing')return;
  if(engine.exited){if(sandbox&&key==='Enter')startMission(0,0,true);return;}
  if(currentEntry?.kind==='keyboard')speak({kind:sandbox?'sandbox':examSession?'examIntro':'mission'},{point:scenePoint(),record:false});
  if(examSession?.coding&&engine.mode==='command'&&key==='Enter'){
    const cmd=engine.command.trim(),file=cmd.startsWith('e ')?cmd.slice(2).trim():'';
    if(file==='tests.json'||file===CODE_LANGUAGES[examSession.codeLanguage].file){engine.command='';engine.mode='normal';switchExamFile(file==='tests.json'?'tests':'main');return;}
  }
  if(examSession){const before=engine.text;examSession.key(key);engine=examSession.engine;if(before!==engine.text&&examSession.coding){runnerState=null;runnerJob?.abort();runnerJob=null;}renderBuffer();renderExam();clearTimeout(saveTimer);saveTimer=setTimeout(persist,180);if(examSession.done&&!solved)finishMission();return;}
  const before=engine.text,event=chapter===0&&!sandbox?moveInArena(engine,key):engine.key(key);
  if(event.action==='command'&&engine.error&&event.command===':q')context.blockedQuit=true;
  if(event.command==='$')context.visitedEnd=true;
  if(event.action==='delete'&&engine.text!==before)context.deleted=true;
  if(route){if(event.action==='move'&&engine.row===goal()[0]&&engine.col===goal()[1])collectTarget();}
  else if(!sandbox&&mission().check(engine,event,context))finishMission();
  else if(sandbox&&engine.exited)speak({kind:'closed'});
  if(!sandbox&&chapter===3&&step===3&&event.command==='$'){pointSpec=scenePoint();requestPointerUpdate();}
  if(sandbox&&engine.text!==before){sandboxSaved=engine.text;clearTimeout(saveTimer);saveTimer=setTimeout(persist,250);}
  renderBuffer();
}
function renderExam(){
  const panel=$('#practice-panel'),tabs=$('#file-tabs'),toggle=$('#checklist-toggle');
  if(!examSession){panel.hidden=true;tabs.hidden=true;toggle.hidden=true;return;}
  panel.hidden=!examPanelOpen;toggle.hidden=false;toggle.textContent=ex('checklist');toggle.setAttribute('aria-expanded',String(examPanelOpen));
  panel.setAttribute('aria-label',ex('checklist'));
  const coding=examSession.coding;
  const instructions=coding?problemFor(chapter)[language]:chapter===0?ex('movement'):chapter===2?ex('saveHint'):ex('reading');
  const langSelect=coding?`<label class="exam-language">${ex('language')}<select id="exam-code-language" aria-label="${ex('language')}">${Object.entries(CODE_LANGUAGES).map(([id,l])=>`<option value="${id}" ${examSession.codeLanguage===id?'selected':''}>${l.name}</option>`).join('')}</select></label>`:'';
  const goals=examSession.objectives.map(g=>`<li class="${g.done?'done':''}"><span class="check-mark">${g.done?'✓':'·'}</span><span class="check-label"><span class="check-copy">${html(g.label[language])}${g.hint?`<span class="check-hint">${html(g.hint[language])}</span>`:''}</span><small>${g.value} / ${g.total}</small></span></li>`).join('');
  let output='';
  if(runnerState?.status==='running')output=`<p class="run-status" role="status">${html(runnerState.message||ex('running'))}</p>`;
  else if(runnerState?.error)output=`<pre class="run-error" role="status">${html(runnerState.error)}</pre>`;
  else if(runnerState?.result)output=`<div class="test-results" role="status">${runnerState.result.results.map(test=>`<div class="${test.passed?'passed':'failed'}">${test.passed?'✓':'×'} solve(${test.input}) → ${html(test.actual??'—')}${test.passed?'':` ≠ ${test.expected}`}</div>`).join('')}${runnerState.result.output?`<pre>${html(runnerState.result.output)}</pre>`:''}</div>`;
  const reference=examSession.reference;
  const example=defaultTests(chapter)[3];
  panel.innerHTML=`<div class="practice-eyebrow">${ex('practice')} ${String(examIndex+1).padStart(2,'0')} / 03</div><h2>${examName(chapter,examIndex,language)}</h2><p class="practice-instructions">${html(instructions)}</p>${langSelect}<ul class="practice-checklist">${goals}</ul>${coding&&examIndex===2?`<p class="custom-test-hint">${ex('customHint')}<code>[{"input":${example.input},"expected":${example.expected}}]</code></p>`:''}${reference?`<button class="reference-button" data-practice-action="reference">${ex(referenceOpen?'hideReference':'reference')}</button>${referenceOpen?`<pre class="reference-code">${html(reference)}</pre>`:''}`:''}${coding?`<button class="run-tests" data-practice-action="run" ${runnerState?.status==='running'?'disabled':''}>${ex(runnerState?.status==='running'?'running':'run')}</button>${output}<p class="runner-provider">${ex('provider')}</p>`:''}${solved?`<p class="practice-next">${ex('next')}</p>`:''}`;
  tabs.hidden=!coding;
  if(coding)tabs.innerHTML=`<button data-exam-file="main" class="${examSession.activeFile==='main'?'active':''}">${CODE_LANGUAGES[examSession.codeLanguage].file}</button><button data-exam-file="tests" class="${examSession.activeFile==='tests'?'active':''}">tests.json</button>`;
}
function switchExamFile(file){if(!examSession?.coding)return;examSession.switchFile(file);engine=examSession.engine;$('#editor').scrollTop=0;$('#editor').scrollLeft=0;renderBuffer(true);renderExam();persist();focusEditor();}
async function runExamTests(){
  if(!examSession?.coding||solved||phase!=='playing'||runnerState?.status==='running')return;
  const session=examSession,code=session.main.text,testsText=session.tests.text;let tests;
  try{tests=session.allTests();}catch(error){runnerState={error:ex('invalidTests')+error.message};renderExam();return;}
  runnerJob?.abort();const job=new AbortController();runnerJob=job;runnerState={status:'running'};renderExam();
  try{
    const result=await runCode(session.codeLanguage,code,tests,{signal:job.signal,onStatus:()=>{runnerState={status:'running',message:ex('loading')};renderExam();}});
    if(runnerJob!==job||examSession!==session||session.main.text!==code||session.tests.text!==testsText)return;
    session.setResults(result);runnerState={result};renderExam();persist();if(session.done)finishMission();
  }catch(error){if(job.signal.aborted)return;runnerState={error:ex('failed')+'\n'+String(error.message||error)};renderExam();}
  finally{if(runnerJob===job)runnerJob=null;}
}
function stagesContent(){return `<div class="stage-list">${chapters.map((c,i)=>`<details class="stage" ${!sandbox&&i===chapter?'open':''}><summary><span class="stage-number">${String(i+1).padStart(2,'0')}</span><span>${html(chapterTitle(language,i))}</span><span class="stage-progress">${progress[i]===c.missions.length&&examProgress[i]===3?'✓':`${progress[i]}/${c.missions.length} · ${examProgress[i]}/3`}</span></summary><div class="mission-list">${c.missions.map((m,j)=>`<button class="mission-choice ${!sandbox&&examIndex===null&&i===chapter&&j===step?'active':''}" data-action="mission" data-chapter="${i}" data-step="${j}"><span>${String(j+1).padStart(2,'0')}</span>${html(missionTitle(language,i,j))}<span class="mission-check">${j<progress[i]?'✓':''}</span></button>`).join('')}<div class="practice-divider">${ex('practice')}</div>${[0,1,2].map(j=>`<button class="mission-choice exam-choice ${examIndex===j&&i===chapter?'active':''}" data-action="exam" data-chapter="${i}" data-exam="${j}"><span>${j+1}</span>${examName(i,j,language)}<span class="mission-check">${examCompleted[i][j]?'✓':''}</span></button>`).join('')}</div></details>`).join('')}</div>`;}
function manualEntries(){
  const query=manualQuery.toLowerCase().trim(),topics=sandbox?[]:chapters[chapter].topics,all=localizedWiki(language);
  const ordered=[...all.filter(w=>topics.includes(w.id)),...all.filter(w=>!topics.includes(w.id))];
  const entries=query?ordered.filter(w=>(w.keys+' '+w.title+' '+w.body).toLowerCase().includes(query)):ordered;
  return entries.length?entries.map(w=>`<details class="manual-entry" ${query?'open':''}><summary><kbd>${html(w.keys)}</kbd><span>${html(w.title)}</span></summary><p>${html(w.body)}</p></details>`).join(''):`<p class="empty">${t('notFound')}</p>`;
}
function menuContent(){
  if(menuTab==='stages')return stagesContent();
  if(menuTab==='manual')return `<input id="manual-search" class="manual-search" type="search" placeholder="${t('search')}" aria-label="${t('searchLabel')}" value="${html(manualQuery)}"><div id="manual-results">${manualEntries()}</div><a class="documentation" href="https://neovim.io/doc/user/quickref/" target="_blank" rel="noopener noreferrer">${t('docs')}</a>`;
  return dialogues.length?`<ol class="dialogue-history">${[...dialogues].reverse().map(d=>`<li><span class="history-location">${d.kind==='question'||d.kind==='wake'?'·':d.kind==='sandbox'?'∞':`${String((d.chapter||0)+1).padStart(2,'0')}.${String((d.step||0)+1).padStart(2,'0')}`}</span><p>${html(dialogueText(d,language))}</p></li>`).join('')}</ol>`:`<p class="empty">${t('empty')}</p>`;
}
function renderMenu(){
  const body=$('#drawer-content');
  if(menuTab==='luna'&&luna){
    luna.refresh();
    if(body.firstChild!==luna.root)body.replaceChildren(luna.root);
  }else body.innerHTML=menuContent();
  document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===menuTab)));
  const langs=`<div class="language-switch" aria-label="${t('language')}"><button data-language="uk" aria-pressed="${language==='uk'}">UKR</button><span>/</span><button data-language="en" aria-pressed="${language==='en'}">ENG</button></div>`;
  const audioControls=`<section class="sound-controls" data-audio-state="${sound.state}" aria-label="${t('sound')}"><div class="sound-heading"><span>${t('sound')}</span><button data-action="sound-toggle" aria-label="${t(sound.settings.muted?'enableSound':'muteSound')}" aria-pressed="${!sound.settings.muted}">${t(sound.settings.muted?'soundOff':'soundOn')}</button></div>${['dialogue','music'].map(channel=>`<label class="sound-slider"><span>${t(channel==='dialogue'?'dialogueVolume':'musicVolume')}</span><input type="range" min="0" max="100" step="1" value="${Math.round(sound.settings[channel]*100)}" data-volume="${channel}" aria-label="${t(channel==='dialogue'?'dialogueVolume':'musicVolume')}"><output id="volume-${channel}">${Math.round(sound.settings[channel]*100)}%</output></label>`).join('')}</section>`;
  $('#drawer-footer').innerHTML=(resetConfirm?`<p class="reset-question">${t('resetQuestion')}</p><div class="menu-actions"><button data-action="confirm-reset">${t('confirm')}</button><button data-action="cancel-reset">${t('cancel')}</button></div>`:`<div class="menu-actions">${!sandbox?`<button data-action="hint">${t('hint')}</button>`:''}<button data-action="restart">${t('restart')}</button><button data-action="sandbox">${t('sandbox')}</button><button data-action="fullscreen">${t('fullscreen')}</button><button data-action="replay">${t('replay')}</button></div><div class="menu-footnote"><span>${totalDone()} / 58</span><button data-action="reset">${t('reset')}</button><span>${t('back')}</span></div>`)+audioControls+langs;
  $('#manual-search')?.addEventListener('input',e=>{manualQuery=e.target.value;$('#manual-results').innerHTML=manualEntries();});
}
function openMenu(){if(phase==='silent')return;menuOpen=true;sound.setMenu(true);resetConfirm=false;renderMenu();$('#drawer').hidden=false;$('#menu-shade').hidden=false;$('#menu-toggle').setAttribute('aria-expanded','true');$('.console').inert=true;requestPointerUpdate();requestAnimationFrame(()=>{$('#drawer').classList.add('open');$('#menu-shade').classList.add('open');});$(`[data-tab="${menuTab}"]`).focus();}
function closeMenu(){menuOpen=false;sound.setMenu(false);$('#drawer').classList.remove('open');$('#menu-shade').classList.remove('open');$('#drawer').hidden=true;$('#menu-shade').hidden=true;$('.console').inert=false;$('#menu-toggle').setAttribute('aria-expanded','false');requestPointerUpdate();focusEditor();}
function setLanguage(lang){language=lang;localizeChrome();renderSpeechText();renderBuffer();renderExam();if(menuOpen){renderMenu();$(`[data-language="${language}"]`)?.focus();}persist();}
async function fullscreen(){closeMenu();try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{if(phase==='playing')speak({kind:'fullscreen'});}}
function dispatch(action,data){
  if(action==='close-menu')return closeMenu();
  if(action==='sound-toggle'){sound.setMuted(!sound.settings.muted);if(!sound.settings.muted)sound.unlock().then(()=>sound.cue());persist();renderMenu();$('[data-action="sound-toggle"]')?.focus();return;}
  if(action==='mission'){if(sandbox)sandboxSaved=engine.text;closeMenu();startMission(Number(data.chapter),Number(data.step));}
  if(action==='exam'){closeMenu();const c=Number(data.chapter);startMission(c,chapters[c].missions.length-1,false,Number(data.exam));}
  if(action==='sandbox'){closeMenu();startMission(0,0,true);}
  if(action==='hint'&&phase==='playing'&&!solved){closeMenu();speak({kind:examSession?'examIntro':'hint'},{point:scenePoint()});}
  if(action==='restart'){closeMenu();startMission(chapter,step,sandbox,examIndex);}
  if(action==='fullscreen')fullscreen();
  if(action==='replay'){closeMenu();runOpening();}
  if(action==='reset'){resetConfirm=true;renderMenu();}
  if(action==='cancel-reset'){resetConfirm=false;renderMenu();}
  if(action==='confirm-reset'){progress=chapters.map(()=>0);examProgress=chapters.map(()=>0);examCompleted=chapters.map(()=>[false,false,false]);dialogues=[];menuIntroduced=false;saved.practice=null;closeMenu();runOpening();}
}
$('#practice-panel').addEventListener('click',e=>{const action=e.target.closest('[data-practice-action]')?.dataset.practiceAction;if(action==='reference'){referenceOpen=!referenceOpen;renderExam();}if(action==='run')runExamTests();});
$('#practice-panel').addEventListener('change',e=>{if(e.target.id!=='exam-code-language')return;runnerJob?.abort();runnerJob=null;runnerState=null;codeLanguage=e.target.value;examSession.setLanguage(codeLanguage);engine=examSession.engine;renderBuffer(true);renderExam();persist();focusEditor();});
$('#file-tabs').addEventListener('click',e=>{const file=e.target.closest('[data-exam-file]')?.dataset.examFile;if(file)switchExamFile(file);});
$('#checklist-toggle').addEventListener('click',()=>{examPanelOpen=!examPanelOpen;renderExam();focusEditor();});
$('#menu-toggle').addEventListener('click',openMenu);$('#menu-shade').addEventListener('click',closeMenu);
$('#drawer').addEventListener('click',e=>{const lang=e.target.closest('[data-language]');if(lang){setLanguage(lang.dataset.language);return;}const tab=e.target.closest('[data-tab]');if(tab){menuTab=tab.dataset.tab;resetConfirm=false;renderMenu();return;}const action=e.target.closest('[data-action]');if(action)dispatch(action.dataset.action,action.dataset);});
$('#drawer').addEventListener('input',e=>{const channel=e.target.dataset.volume;if(!channel)return;sound.setVolume(channel,Number(e.target.value)/100);$('#volume-'+channel).textContent=e.target.value+'%';persist();});
$('#drawer').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu();return;}if(e.key!=='Tab')return;const buttons=[...$('#drawer').querySelectorAll('button,input,textarea,select,a,summary')].filter(el=>el.getClientRects().length&&!el.disabled),first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}});
document.addEventListener('keydown',e=>{
  if(e.key==='F5'&&examSession?.coding){e.preventDefault();runExamTests();return;}
  if(phase==='silent')return;if(e.key==='F2'){e.preventDefault();menuOpen?closeMenu():openMenu();return;}
  if(menuOpen||e.target.closest('button,a,input,summary'))return;
  if(e.metaKey||e.altKey||e.ctrlKey&&!['r','['].includes(e.key))return;
  if(['Shift','Control','Alt','Meta','CapsLock'].includes(e.key))return;
  if(e.key==='Tab'&&engine?.mode!=='insert')return;
  if(engine&&phase==='playing'&&(engine.mode==='normal'||engine.mode.startsWith('visual'))&&/^[а-яіїєґё]$/i.test(e.key)){e.preventDefault();speak({kind:'keyboard'});return;}
  e.preventDefault();sendKey(e.ctrlKey&&e.key==='r'?'C-r':e.ctrlKey&&e.key==='['?'Escape':e.key);
});
$('#editor').addEventListener('click',focusEditor);$('#editor').addEventListener('scroll',requestPointerUpdate);window.addEventListener('resize',requestPointerUpdate);
// No autoplay prompt or extra on-screen controls. A normal game gesture unlocks audio.
document.addEventListener('pointerdown',e=>{if(e.isTrusted)sound.unlock();},{capture:true});
document.addEventListener('keydown',e=>{if(e.isTrusted&&!e.repeat&&!['Shift','Control','Alt','Meta'].includes(e.key))sound.unlock();},{capture:true});
document.addEventListener('visibilitychange',()=>sound.setHidden(document.hidden));
window.addEventListener('blur',()=>sound.setHidden(true));
window.addEventListener('focus',()=>sound.setHidden(document.hidden));
window.addEventListener('pageshow',()=>sound.setHidden(document.hidden));
window.addEventListener('pagehide',()=>sound.setHidden(true));
globalThis.recallSaveTutor=()=>{
  if(sandbox&&engine)sandboxSaved=engine.text;
  const localSaved=persist();return sharedProgress.flush().then(synced=>synced||localSaved);
};
window.addEventListener('pagehide',()=>{void globalThis.recallSaveTutor();});
document.fonts?.ready.then(requestPointerUpdate);
localizeChrome();
const missingPractice=progress.findIndex((n,i)=>n===chapters[i].missions.length&&examProgress[i]<3);
const position=saved.experience<4&&missingPractice>=0?{chapter:missingPractice,step:chapters[missingPractice].missions.length-1,exam:examCompleted[missingPractice].findIndex(done=>!done)}:saved.experience>=3&&saved.session?.sandbox?{sandbox:true}:saved.experience>=3&&Number.isInteger(saved.session?.chapter)&&chapters[saved.session.chapter]?.missions[saved.session.step]?saved.session:{chapter:0,step:0};
runOpening(position);
