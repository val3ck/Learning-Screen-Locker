import {LUNA_PROVIDERS,type LunaModel} from '../../shared/luna-chat';
import './style.css';
import './focus-controls.css';
import {solutionView} from './solution-view';
import {sqlAISettings} from './sql-ai-view';
import {SQLChatView} from './sql-chat-view';
import {EnglishScreen} from './modules/english/view';
import {FolderCoursesView} from './folder-courses-view';
let englishScreen:EnglishScreen|null=null;
import type {Bootstrap,SessionRecord,ExecutionResult,DataTable,Runner} from './core/contracts';
import {getModule} from './modules/registry';
import {isClockTime} from './core/calendar';
import {defaultStart,englishPauseMinutes,LEARNING_TRACKS,MAX_ENGLISH_PAUSE_MINUTES,minuteMs,trackDuration,type TrackId,type TrackDurations,type TrackStart,type TrackStarts} from './core/tracks';
import {recordAttempt,canSurrender,sqlDuration,surrenderMessage,availableTopicIds} from './core/session';
const root=document.querySelector<HTMLDivElement>('#app')!;
const sqlChat=new SQLChatView((sessionId,taskId)=>{
  if(!session||session.id!==sessionId||session.tasks[session.currentIndex]?.id!==taskId)return;
  session.hintLevels[session.currentIndex]++;
  void persist();
});
let boot:Bootstrap,session:SessionRecord|null=null,runner:Runner|null=null,busy=false,ready=false;
let page:'home'|'session'|'statistics'|'settings'|'summary'|'paused'|'english'|'courses'='home';let feedback:ExecutionResult|null=null;
let folderCourses:FolderCoursesView|undefined;
let notice='',showSolution=false,saveTimer:ReturnType<typeof setTimeout>|null=null;
let previousTick=Date.now(),lastSavedAt=0,finishing=false;
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T|null;
const minutes=(ms:number)=>Math.floor(ms/60000);
const time=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
function module(){return getModule(boot.settings.activeModuleId);}
function button(id:string,label:string,kind='',disabled=false){return `<button id="${id}" class="button ${kind}" ${disabled?'disabled':''}>${label}</button>`;}
function scheduleLabel(start:TrackStart){
  return start==='activity'?'Після активності':start??'Вручну';
}
function trackRows(){
  return LEARNING_TRACKS.map(track=>{
    const progress=boot.tracks[track.id];
    const nominal=trackDuration(track.id,boot.settings.durationMinutes);
    return `<li class="sidebar-course"><div class="sidebar-track-heading"><strong>${track.title}</strong><span>${nominal} хв</span></div><small class="sidebar-track-time">${scheduleLabel(boot.startTimes[track.id])}</small>
      ${progress?`<small>${progress.done} / ${progress.total} ${track.progressLabel}</small>
        <progress class="sidebar-meter" max="${Math.max(1,progress.total)}" value="${progress.done}" aria-label="${track.title} · ${track.progressLabel}"></progress>`:'<small>Очікує синхронізації</small>'}</li>`;
  }).join('');
}
function syncTrackRows(tracks:Bootstrap['tracks']){
  if(JSON.stringify(boot.tracks)===JSON.stringify(tracks))return;
  boot.tracks=tracks;
  const list=$('sidebar-tracks');
  if(list)list.innerHTML=trackRows();
  for(const meter of document.querySelectorAll<HTMLElement>('[data-track-card-progress]')){
    const id=meter.dataset.trackCardProgress as TrackId;
    meter.innerHTML=trackCardProgress(tracks[id],meter.dataset.progressUnit||'');
  }
}
function scheduleSettings(){
  return `<section class="panel settings-panel"><form id="track-schedule-form">
    <h2>Розклад і тривалість</h2>
    <p class="schedule-explainer">Recall запрошує у вибраний час за Києвом. «Без розкладу» залишає ручний запуск. Нова тривалість діє з наступної сесії.</p>
    ${LEARNING_TRACKS.map(track=>{
      const start=boot.startTimes[track.id],mode=start===null?'none':start==='activity'?'activity':'clock';
      const suggested=defaultStart(track.id);
      return `<fieldset class="track-settings-row">
        <legend>${track.activity}</legend>
        <div class="track-settings-fields"><label>Коли
          <select id="schedule-mode-${track.id}" aria-label="${track.title} · режим запуску">
            <option value="none" ${mode==='none'?'selected':''}>Без розкладу</option>
            <option value="clock" ${mode==='clock'?'selected':''}>Щодня за часом</option>
            ${suggested==='activity'?`<option value="activity" ${mode==='activity'?'selected':''}>Через 1–2 год активності</option>`:''}
          </select>
        </label>
        <label id="schedule-time-label-${track.id}" ${mode==='clock'?'':'hidden'}>Час за Києвом
          <input id="schedule-time-${track.id}" type="time" step="60" required ${mode==='clock'?'':'disabled'} value="${isClockTime(start)?start:isClockTime(suggested)?suggested:''}" aria-label="${track.title} · час запуску">
        </label>
        <label>Скільки<span class="duration-input"><input id="duration-${track.id}" type="number" inputmode="numeric" required min="${track.minMinutes}" max="${track.maxMinutes}" step="1" value="${trackDuration(track.id,boot.settings.durationMinutes)}" aria-label="${track.title} · тривалість"><span>хв</span></span></label></div>
        <small>${track.durationHelp}</small>
      </fieldset>`;
    }).join('')}
    <label class="setting-row"><div><strong>Пауза English</strong><p>На цей час навчальний таймер зупиняється. Повернутися до вправи можна раніше.</p></div><span class="duration-input"><input id="english-pause-minutes" type="number" min="1" max="${MAX_ENGLISH_PAUSE_MINUTES}" required value="${englishPauseMinutes(boot.settings.englishPauseMinutes)}" aria-label="Пауза English · хвилини"><span>хв</span></span></label>
    <button class="button primary" type="submit">Зберегти розклад</button>
  </form></section>`;
}
function shell(content:string){
  if(page!=='session')sqlChat.unmount();
  document.body.classList.toggle('focus-session',page==='session'&&!!session&&!session.paused||page==='english'&&boot.activeLearningSession?.moduleId==='english'&&boot.activeLearningSession.status==='active');

  root.innerHTML=`<aside class="sidebar"><a class="brand" href="#" id="home-brand"><span class="brand-icon">r<span>_</span></span><span>recall<span class="brand-sub">ТРОХИ ПРАКТИКИ ЩОДНЯ</span></span></a><div class="workspace-label">ТВІЙ ПРОСТІР</div><nav><button class="nav-item ${page==='home'?'active':''}" id="nav-home"><span>◫</span> Сьогодні</button><button class="nav-item ${page==='english'?'active':''}" id="nav-english"><span>◈</span> English</button><button class="nav-item ${page==='statistics'?'active':''}" id="nav-stats"><span>▥</span> Історія повторень</button><button class="nav-item ${page==='settings'?'active':''}" id="nav-settings"><span>⚙</span> Налаштування</button></nav><section class="sidebar-learning" aria-labelledby="sidebar-learning-heading"><h2 id="sidebar-learning-heading">Прогрес навчання</h2><ul id="sidebar-tracks">${trackRows()}</ul></section><div class="sidebar-bottom"><span class="offline-dot"></span> Прогрес зберігається на цьому ПК<br><small>Без акаунта. Без поспіху.</small></div></aside><main class="main"><header class="topbar"><span>${page==='english'?'Your daily space for practice':'Твій щоденний простір для практики'}</span><span class="local-badge">${page==='english'?'● LOCAL PROGRESS · AI ON SUBMIT':(boot.sqlAI?.enabled?'● ЛОКАЛЬНА ПЕРЕВІРКА · AI-ЗАДАЧІ':'● ЛОКАЛЬНО Й ОФЛАЙН')}</span></header>${notice?`<div class="notice" role="status">${escape(notice)}</div>`:''}${boot.recoveryMessages.length?`<div class="notice">${boot.recoveryMessages.map(escape).join('<br>')}</div>`:''}${content}<footer><span>${page==='english'?'Small steps back to learning matter.':'Маленькі повернення до знань мають значення.'}</span><span>Recall · 1.10${boot.demo?' · ДЕМО':''}</span></footer></main>`;
  $('home-brand')?.addEventListener('click',e=>{e.preventDefault();navigate('home');});
  $('nav-stats')?.insertAdjacentHTML('beforebegin',`<button class="nav-item ${page==='courses'?'active':''}" id="nav-courses" ${page==='courses'?'aria-current="page"':''}><span aria-hidden="true">▤</span> Курси</button>`);
  $('nav-courses')?.addEventListener('click',()=>navigate('courses'));
  $('nav-english')?.addEventListener('click',()=>navigate('english'));$('nav-home')?.addEventListener('click',()=>navigate('home'));$('nav-stats')?.addEventListener('click',()=>navigate('statistics'));$('nav-settings')?.addEventListener('click',()=>navigate('settings'));
}
function navigate(next:typeof page){if(boot.activeLearningSession?.moduleId==='english'&&boot.activeLearningSession.status==='active'){page='english';render();return;}if(session&&!session.endedAt&&!session.paused){notice='Поточна сесія збережена. Спочатку заверши її або повернися до вправ.';page=session.paused?'paused':'session';render();return;}page=next;notice='';render();}
function home(){
  const progress=boot.module.progress;const count=availableTopicIds(boot.module).length;
  const duration=trackDuration('postgresql',boot.settings.durationMinutes),sqlStart=boot.startTimes.postgresql;
  const reminder=sqlStart==='activity'
    ?boot.settings.sqlWarnAfter16!==false?'Запрошення SQL з’явиться після 60–120 хв активного користування ПК.':'Запрошення SQL до 16:00. Після 16:00 вправа відкривається одразу.'
    :sqlStart?`SQL · запрошення о ${sqlStart} за Києвом.`:'SQL доступний для ручної практики.';
  const postponed=boot.schedule.snoozedUntil&&boot.schedule.snoozedUntil>Date.now()?`Сесію відкладено до ${new Date(boot.schedule.snoozedUntil).toLocaleTimeString('uk-UA',{timeZone:'Europe/Kyiv',hour:'2-digit',minute:'2-digit'})}`:reminder;
  const history=Object.values(boot.module.history);const reviewed=history.filter(h=>h.lastReviewedAt).length;
  const last=boot.sessions.filter(s=>s.endedAt&&s.mode!=='demo').at(-1);
  const confirmed=module().catalog.filter(t=>availableTopicIds(boot.module).includes(t.id));
  const chapter=confirmed.length?Math.max(...confirmed.map(t=>t.chapter)):0;
  shell(`<div class="meeting-strip"><span>${postponed}</span>${button('postpone-home','Пара / демонстрація · 30 хв','secondary',sqlStart===null)}</div><section class="page-heading"><div class="eyebrow"><span class="small-line"></span> ПОВЕРТАЙСЯ ДО ТОГО, ЩО ВЖЕ ЗНАЄШ</div><h1>Знання люблять<br><em>невеликі нагадування.</em></h1><p>Обери, що сьогодні хочеш вивчити або повторити.</p></section><section class="hero-grid"><article class="practice-card"><div class="card-top"><span class="pill">ЩОДЕННА ПРАКТИКА</span><span class="muted">01 — 03</span></div><div class="practice-symbol">{ <span>sql</span> }</div><h2>${count?'Трохи SQL. І день твій.':'Почнемо з твого прогресу.'}</h2><p>${count?'Розігрів, тема для повторення і невеликий робочий звіт. Завдання з тренажера й теми, які ти вже відпрацював у Recall.':'Відкрий звичний тренажер або імпортуй його прогрес. Тоді тут з’являться вправи саме на вивчені теми.'}</p><div class="practice-meta"><span>◷ ${duration} хв</span><span>⌘ 3 вправи</span><span>↗ Luna поруч</span></div>${button(count?'start-practice':'open-course',count?'Потренуватися зараз <span>↗</span>':'Відкрити SQL-тренажер <span>↗</span>','primary wide')}<small class="card-footnote">${count?`Почати у повноекранному режимі на всіх моніторах. Можеш вийти після виконання вправ або через ${duration} хв практики.`:'Поки прогрес не підключено, повноекранні сесії не запускаються.'}</small></article><div class="right-stack"><article class="progress-card"><div class="card-top"><h3>Твоя відправна точка</h3><span class="icon-box">↗</span></div><div class="progress-number">${count}<span>/ ${module().catalog.length} тем</span></div><p>${count?`Доступні теми до розділу ${chapter}.<br>Нові навчальні кроки додаються після правильної перевірки.`:'Підключи прогрес — і ми почнемо<br>з того місця, де ти зараз.'}</p><div class="wide-progress"><i style="width:${count/module().catalog.length*100}%"></i></div><div class="card-divider"></div><div class="mini-stat"><span>Уже повторено</span><strong>${reviewed} тем</strong></div><div class="mini-stat"><span>Останнє повернення</span><strong>${last?new Date(last.startedAt).toLocaleDateString('uk-UA'):'Попереду'}</strong></div></article><article class="quiet-card"><span class="leaf">✳</span><div><h3>Повторення — не іспит</h3><p>Не потрібно пам’ятати все одразу. Підказка — частина навчання, а не помилка.</p></div></article></div></section>${learningCards()}<section class="below-grid"><article class="flow-card"><div class="section-caption">ЯК ПРОХОДИТЬ SQL-СЕСІЯ</div><div class="flow-steps"><div><span>01</span><h4>Згадати знайоме</h4><p>Спокійний розігрів.</p></div><div><span>02</span><h4>Освіжити деталі</h4><p>Тема, до якої час повернутися.</p></div><div><span>03</span><h4>Поєднати навички</h4><p>Невеликий робочий сценарій.</p></div></div></article><article class="sync-card"><div class="section-caption">ЗВ’ЯЗОК ІЗ ТРЕНАЖЕРОМ</div><p>${progress?'Остання синхронізація: '+new Date(progress.syncedAt).toLocaleString('uk-UA'):'Навчання залишається у твоєму тренажері. Тут — повторення.'}</p><button class="text-button" id="import-progress">Імпортувати JSON <span>↗</span></button>${count?'<button class="text-button" id="open-course">Відкрити тренажер <span>↗</span></button>':''}</article></section>${!boot.settings.setupComplete?`<section class="setup-strip"><div><strong>Зробимо повторення звичкою?</strong><p>Запрошення з’являтимуться за розкладом у налаштуваннях.</p></div><label class="checkbox"><input type="checkbox" id="setup-autostart" checked> Запускати разом із Windows</label>${button('finish-setup','Зберегти налаштування','secondary')}</section>`:''}`);
  $('open-english')?.addEventListener('click',()=>navigate('english'));$('postpone-home')?.addEventListener('click',()=>void postpone());
  $('start-node')?.addEventListener('click',()=>void action(()=>window.recall.nodePractice()));
  for(const id of ['git','vim'] as const)$('start-'+id)?.addEventListener('click',()=>void action(()=>window.recall.browserPractice(id)));
  $('start-practice')?.addEventListener('click',()=>void start());bindCourse();bindImport();
  $('finish-setup')?.addEventListener('click',()=>void action(async()=>{await window.recall.configure({autoStart:$<HTMLInputElement>('setup-autostart')!.checked});await refresh();notice='Готово. Розклад працюватиме після підключення прогресу.';render();}));
}
function trackCardProgress(progress:Bootstrap['tracks'][TrackId],unit:string){
  if(!progress)return '<span class="muted">Прогрес ще не підключено</span>';
  return `<div class="track-card-count"><strong>${progress.done}</strong><span>/ ${progress.total} ${escape(unit)}</span></div>
    <progress class="track-card-meter" max="${Math.max(1,progress.total)}" value="${progress.done}" aria-label="Прогрес · ${escape(unit)}"></progress>`;
}
const cardContent={
  english:{symbol:'En',description:'Зрозумій технічну тему англійською й потренуйся пояснювати її своїми словами.',unit:'уроків',action:'open-english',button:'Open English'},
  nodejs:{symbol:'JS',description:'Прочитай одну лекцію з поточного модуля й підтвердь два виконані критерії практики.',unit:'модулів',action:'start-node',button:'Почати урок'},
  git:{symbol:'git',description:'Відпрацюй команди Git у навчальному репозиторії та перевір результат.',unit:'вправ',action:'start-git',button:'Потренуватися'},
  vim:{symbol:'vim',description:'Потренуй рухи, редагування та команди Vim у коротких місіях.',unit:'місій та іспитів',action:'start-vim',button:'Потренуватися'},
};
function learningCards(){
  const cards=LEARNING_TRACKS.flatMap(track=>{
    if(track.id==='postgresql')return [];
    const content=cardContent[track.id];
    const duration=trackDuration(track.id,boot.settings.durationMinutes);
    const today=track.id==='english'&&boot.english?`<small class="track-card-today">Сьогодні · ${time(boot.english.day.activeMs)} / ${time(boot.english.targetMs)}</small>`:'';
    return [`<article class="practice-card track-card" aria-labelledby="track-card-${track.id}">
      <div class="card-top"><span class="track-card-symbol" aria-hidden="true">${content.symbol}</span><span class="track-card-schedule">${scheduleLabel(boot.startTimes[track.id])} · ${duration} хв</span></div>
      <h3 id="track-card-${track.id}">${track.title}</h3><p>${content.description}</p>
      <div class="track-card-progress" data-track-card-progress="${track.id}" data-progress-unit="${content.unit}">${trackCardProgress(boot.tracks[track.id],content.unit)}</div>
      ${today}${button(content.action,content.button+' <span aria-hidden="true">↗</span>','primary wide')}
    </article>`];
  }).join('');
  return `<section class="track-card-section" aria-labelledby="track-cards-heading"><h2 id="track-cards-heading">Інші тренажери</h2><div class="track-card-grid">${cards}</div></section>`;
}
function englishPage(){if(!boot.english){shell('<section class="panel"><h1>English is temporarily unavailable</h1><p>Check your saved progress or open settings.</p></section>');return;}shell('<div id="english-workspace" lang="en"></div>');englishScreen=new EnglishScreen($('english-workspace')!,boot.english,value=>{boot.english=value;if(value.run?.status==='active'&&!value.run.endedAt||boot.activeLearningSession?.moduleId==='english')boot.activeLearningSession=value.run;document.body.classList.toggle('focus-session',value.run?.status==='active'&&!value.run.endedAt);},()=>navigate('home'));const run=boot.activeLearningSession;if(run?.moduleId==='english'&&run.status==='active')void window.recall.sessionReady(run.id).catch(error=>{notice=String(error);});}
function renderTables(tables:DataTable[],schema=false):string{
  if(!tables.length)return '<div class="empty-state">Запит виконано. Рядків для показу немає.</div>';
  return tables.map(t=>`<section class="data-table"><div class="table-name">${escape(t.name)} <span>${t.rows.length}${t.rows.length===200?' · до 200':''} рядків</span></div>${schema?`<div class="schema-tags">${t.columns.map(c=>`<span><b>${escape(c.name)}</b> ${escape(c.type)}</span>`).join('')}</div>`:''}<div class="table-scroll"><table><thead><tr>${t.columns.map(c=>`<th>${escape(c.name)}</th>`).join('')}</tr></thead><tbody>${t.rows.slice(0,schema?8:200).map(row=>`<tr>${t.columns.map(c=>`<td>${row[c.name]===null?'<span class="null">NULL</span>':escape(typeof row[c.name]==='object'?JSON.stringify(row[c.name]):row[c.name])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`).join('');
}
function exercise(){
  if(!session){page='home';home();return;}
  const i=session.currentIndex,task=session.tasks[i];
  shell(`<section class="session-heading"><div><div class="eyebrow">${session.mode==='daily'?'ЩОДЕННЕ ПОВТОРЕННЯ':session.mode==='demo'?'ДЕМОНСТРАЦІЙНА ПРАКТИКА':'ПРАКТИКА У ПОВНОЕКРАННОМУ РЕЖИМІ'}</div><h1>Одна вправа за раз.</h1></div><div class="session-clock" id="session-clock">${time(session.activeMs)} / ${time(sqlDuration(session)*minuteMs)}</div></section><div class="step-track" style="grid-template-columns:repeat(${session.tasks.length},minmax(0,1fr))">${session.tasks.map((_,index)=>['Розігрів','Освіжити деталі','Поєднати навички'][index]||`Додаткова ${index-2}`).map((name,index)=>`<div class="step ${index===i?'current':''} ${session!.solved[index]?'done':''}"><span>${session!.solved[index]?'✓':String(index+1).padStart(2,'0')}</span>${name}</div>`).join('')}</div><p class="session-plan">Три основні вправи. Якщо впораєшся швидше ніж за ${Math.min(boot.settings.minPracticeMinutes,sqlDuration(session))} хв — додамо до двох вправ: на слабку тему або один новий навчальний крок.</p><p class="focus-reminder">Заверши вправи, щоб вийти. Кнопка «Здатись» доступна після ${sqlDuration(session)} хв практики.</p><section class="exercise-grid"><article class="task-panel"><div class="section-caption">ВПРАВА ${i+1} ІЗ ${session.tasks.length}</div><h2>${escape(task.title)}</h2>${task.selectionReason?`<p class="bonus-note">${escape(task.selectionReason)}</p>`:''}${task.learning?`<aside class="notice learning-step"><strong>Новий навчальний крок · ${escape(task.learning.title)}</strong><p>${escape(task.learning.explanation)}</p><small>Після правильної перевірки ця тема стане доступною для подальшої практики.</small></aside>`:''}${(task.payload as any)?.ai?`<p class="fine-print">AI · ${escape((task.payload as any).ai.model)} · еталон перевірено локально</p>`:''}<p class="task-brief">${escape(task.brief)}</p><details class="schema-panel" open><summary>${escape(module().presentation.contextLabel)} · ${task.tables.length} таблиці</summary>${renderTables(task.tables,true)}</details></article><article class="editor-panel"><div class="editor-header"><span><span class="status-dot ${ready?'':'loading'}"></span> ${escape(module().presentation.answerLabel)}</span><span id="engine-status">${ready?module().manifest.title+' готовий':'Завантажуємо рушій…'}</span></div><div class="editor-wrap"><div class="editor-gutter" id="gutter">${session.answers[i].split('\n').map((_,n)=>n+1).join('<br>')}</div><textarea id="answer" spellcheck="false" aria-label="${escape(module().presentation.answerLabel)}" ${busy||session.solved[i]?'readonly':''}>${escape(session.answers[i])}</textarea></div><div class="editor-actions"><span class="key-hint">Ctrl + Enter — запуск</span><div>${button('run','Запустити','secondary',!ready||busy||session.solved[i])}${button('check',busy?'Перевіряємо…':'Перевірити ↗','primary',!ready||busy||session.solved[i])}</div></div><div class="results-panel"><div class="results-heading">РЕЗУЛЬТАТ <span>${feedback?.tables?.reduce((n,t)=>n+t.rows.length,0)||0} рядків</span></div><div id="feedback" class="feedback ${feedback?.status||''}" role="status">${feedback?escape(feedback.message):'Подивися на таблиці, сформулюй запит і перевір результат.'}</div><div id="results">${feedback?.tables?renderTables(feedback.tables):'<div class="result-placeholder"><span>⌘</span><p>Тут буде результат твого запиту.</p></div>'}</div></div>${session.solved[i]?`<div class="next-action">${button('next',i===session.tasks.length-1?'Завершити повторення ✓':'Наступна вправа ↗','primary')}<button class="text-button" id="show-solution">Розбір і варіанти</button>${showSolution?`${solutionView(module(),task,availableTopicIds(boot.module),session.answers[i])}`:''}</div>`:''}</article></section><div class="surrender-bar"><p id="surrender-message">${surrenderMessage(session)||''}</p><button id="surrender" class="text-button" ${!canSurrender(session)?'hidden':''}>Здатись на сьогодні ↗</button></div>`);
  if(session.moduleId==='postgresql')sqlChat.mount(session.id,task.id,feedback?.message);
  $<HTMLTextAreaElement>('answer')?.addEventListener('input',e=>{session!.answers[i]=(e.target as HTMLTextAreaElement).value.slice(0,100000);void window.recall.sqlDraft(session!.id,i,session!.answers[i]).catch(error=>{notice=String(error);});$('gutter')!.innerHTML=session!.answers[i].split('\n').map((_,n)=>n+1).join('<br>');queueSave();});
  $('answer')?.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const text=e.target as HTMLTextAreaElement;const pos=text.selectionStart;text.setRangeText('  ',pos,text.selectionEnd,'end');text.dispatchEvent(new Event('input'));}if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();void run(e.shiftKey);}});
  $('run')?.addEventListener('click',()=>void run(false));$('check')?.addEventListener('click',()=>void run(true));
  $('next')?.addEventListener('click',()=>{
    if(busy||!session)return;
    if(i===session.tasks.length-1)void end('completed');
    else void action(async()=>{session!.currentIndex=i+1;feedback=null;showSolution=false;await persist();exercise();});
  });
  $('show-solution')?.addEventListener('click',()=>{showSolution=!showSolution;exercise();});
  $('snooze-session')?.addEventListener('click',()=>void postpone());
  $('surrender')?.addEventListener('click',()=>{if(canSurrender(session!))void end('surrendered');});
}
async function run(check:boolean){
  if(!session||!runner||busy||session.paused||session.solved[session.currentIndex])return;
  busy=true;exercise();
  await window.recall.activity('waiting');const waiting=setInterval(()=>void window.recall.activity('waiting'),5000);let result:ExecutionResult;
  try{result=await runner.run(session.tasks[session.currentIndex],session.answers[session.currentIndex],check);}catch(error){result={status:'error',technical:true,message:String(error)};}finally{clearInterval(waiting);await window.recall.activity('interaction');}
  feedback=result;
  recordAttempt(session,result,check);
  if(check&&result.status==='correct'&&session.solved.every(Boolean)){
    try {
      // Decide whether to add a bonus now, while the check's time still applies.
      session=await window.recall.extendSession(session);
    } catch(error) {
      notice='Не вдалося підготувати додаткову вправу. '+String(error);
      await persist();
    }
  }else await persist();
  busy=false;
  if(result.technical){await end('technical');return;}
  if(session.paused){page='paused';render();}else exercise();
}
async function postpone(){await action(async()=>{boot=await window.recall.snooze();if(session&&!session.endedAt&&session.mode==='daily'){session.paused=true;await persist();page='paused';}notice=boot.schedule.snoozedUntil&&boot.schedule.snoozedUntil>Date.now()?'Відкладено на 30 хвилин. Перед початком буде нове попередження.':'На сьогодні щоденну сесію вже завершено.';render();});}
function paused(){
  const until=boot.schedule.snoozedUntil?new Date(boot.schedule.snoozedUntil).toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'}):'пізніше';
  shell(`<section class="summary-card"><div class="summary-mark">Ⅱ</div><div class="eyebrow">ПРАКТИКА ЗБЕРЕЖЕНА</div><h1>Практику відкладено.</h1><p>Відповіді та час збережені. Можна продовжити зараз або повернутися після ${escape(until)}.</p><p class="pause-note">Програму можна згорнути. Відкладення не вважається здачею.</p>${button('resume-daily','Продовжити зараз ↗','primary')}${button('pause-longer','Ще 30 хвилин','secondary')}</section>`);
  $('resume-daily')?.addEventListener('click',()=>void action(async()=>{notice='';await window.recall.resumeDaily();}));
  $('pause-longer')?.addEventListener('click',()=>void postpone());
}
function nextLessonView(record:SessionRecord|null|undefined):string {
  if(!record||record.outcome!=='completed'||record.tasks.length<=3)return '';
  const lesson=module().taskProvider.nextLesson?.(availableTopicIds(boot.module));if(!lesson)return '';
  return `<details class="next-lesson"><summary>Наступний крок · ${escape(lesson.title)}</summary><p>${escape(lesson.explanation)}</p><p class="task-brief">${escape(lesson.brief)}</p><pre><code>${escape(lesson.example)}</code></pre><details><summary>Таблиці прикладу</summary>${renderTables(lesson.tables,true)}</details><p class="fine-print">Це необов’язкове знайомство з темою. Воно не змінює прогрес курсу; підтвердити навичку можна вправою в тренажері.</p>${button('lesson-course','Відкрити тренажер ↗','secondary')}</details>`;
}
async function start(){await action(async()=>{boot=await window.recall.start(boot.demo?'demo':'practice');session=boot.activeSession;page='session';feedback=null;await initializeRunner();});}
async function initializeRunner(){runner?.dispose();runner=module().runner.create();ready=false;render();try{await runner.prepare();ready=true;if(session&&!session.paused)await window.recall.sessionReady(session.id);}catch(error){feedback={status:'error',technical:true,message:String(error)};if(session){await end('technical');return;}}render();}
async function end(outcome:SessionRecord['outcome']){
  if(!session||finishing)return;finishing=true;busy=false;
  if(saveTimer){clearTimeout(saveTimer);saveTimer=null;}
  session.outcome=outcome;session.endedAt=new Date().toISOString();
  try{await window.recall.finishSession(session);runner?.dispose();runner=null;ready=false;await refresh();page='summary';render();}
  catch(error){notice=String(error);page='summary';render();}finally{finishing=false;}
}
function summary(){
  const last=session||boot.sessions.at(-1);const done=last?.solved.filter(Boolean).length||0;
  shell(`<section class="summary-card"><div class="summary-mark">${last?.outcome==='completed'?'✓':'✳'}</div><div class="eyebrow">НА СЬОГОДНІ ДОСТАТНЬО</div><h1>${last?.outcome==='completed'?(last.tasks.length===3?'Три маленькі кроки вперед.':'Практику завершено.'):last?.outcome==='technical'?'Зробимо технічну паузу.':'До решти повернемося.'}</h1><p>${last?.outcome==='technical'?'Рушій не зміг продовжити роботу. Перекриття прибрано; це не впливає на оцінку твоїх знань.':'Уже виконане збережено. Продовжуй свій день — знання дочекаються наступного повернення.'}</p><div class="summary-stats"><div><strong>${done}/${last?.tasks.length||3}</strong><span>вправ виконано</span></div><div><strong>${time(last?.activeMs||0)}</strong><span>часу на практику</span></div><div><strong>${last?.hintLevels.reduce((a,b)=>a+b,0)||0}</strong><span>підказок використано</span></div></div>${button('summary-home','На головну ↗','primary')}${last&&['completed','surrendered'].includes(last.outcome||'')?`<details class="summary-solutions"><summary>Переглянути розбір і варіанти розв’язків</summary>${last.tasks.map((t,i)=>`<article class="summary-task"><h3>${escape(t.title)}</h3><p class="task-brief">${escape(t.brief)}</p>${solutionView(module(),t,availableTopicIds(boot.module),last.answers[i])}</article>`).join('')}</details>`:''}${nextLessonView(last)}</section>`);
  $('summary-home')?.addEventListener('click',()=>{page='home';render();});
  $('lesson-course')?.addEventListener('click',()=>void action(async()=>{notice=(await window.recall.openCourse()).message;render();}));
}
function statistics(){
  const history=boot.module.history;const confirmed=availableTopicIds(boot.module);
  const sessions=boot.sessions.filter(s=>(s.mode!=='demo'||boot.demo)&&s.endedAt);
  shell(`<section class="compact-heading"><div class="eyebrow">БЕЗ ОЦІНОК І ПЕРЕГОНІВ</div><h1>Повернення до знань.</h1><p>Видно, що вже освіжив і до чого можна повернутися.</p></section><div class="stats-overview"><article><strong>${sessions.length}</strong><span>завершених сесій</span></article><article><strong>${Object.values(history).filter(h=>h.lastReviewedAt).length}</strong><span>тем у повторенні</span></article><article><strong>${minutes(sessions.reduce((s,x)=>s+x.activeMs,0))}</strong><span>хвилин практики</span></article></div><section class="panel"><div class="panel-heading"><h2>Теми ${escape(module().manifest.title)}</h2>${button('open-statistics','Відкрити папку ↗','secondary')}</div><div class="table-scroll"><table class="history-table"><thead><tr><th>Тема</th><th>Стан</th><th>Самостійно</th><th>Із допомогою</th><th>Наступне повторення</th></tr></thead><tbody>${module().catalog.map(t=>{const h=history[t.id];return `<tr><td><small>РОЗДІЛ ${t.chapter}</small>${escape(t.title)}</td><td><span class="topic-state ${confirmed.includes(t.id)?'known':''}">${confirmed.includes(t.id)?h?'У повторенні':'Ще не повторював':'Попереду'}</span></td><td>${h?.independent||'—'}</td><td>${h?.assisted||'—'}</td><td>${h?new Date(h.dueAt).toLocaleDateString('uk-UA'):'—'}</td></tr>`;}).join('')}</tbody></table></div></section><section class="panel"><h2>Останні сесії</h2>${sessions.length?sessions.slice(-15).reverse().map(s=>`<div class="session-row"><span>${new Date(s.startedAt).toLocaleString('uk-UA')}</span><span>${s.solved.filter(Boolean).length}/${s.tasks.length} вправ · ${time(s.activeMs)}</span><span>${s.outcome==='completed'?'Виконано':s.outcome==='surrendered'?'Завершено раніше':s.outcome==='technical'?'Технічна пауза':'Перервано'}</span>${['completed','surrendered'].includes(s.outcome||'')?`<button class="text-button" data-review-session="${escape(s.id)}">Розбір ↗</button>`:''}</div>`).join(''):'<p class="muted">Перші записи з’являться після практики.</p>'}</section>`);
  $('open-statistics')?.addEventListener('click',()=>void window.recall.openStatistics());
  document.querySelectorAll<HTMLButtonElement>('[data-review-session]').forEach(button=>button.addEventListener('click',()=>{const record=boot.sessions.find(s=>s.id===button.dataset.reviewSession);if(record){session=structuredClone(record);page='summary';showSolution=false;render();window.scrollTo(0,0);}}));
}
function lunaModelSettings(){
  return `<form id="luna-model-form" class="panel settings-panel"><h2>Моделі Luna</h2>
    <p class="muted">Модель чату для кожного тренажера. За замовчуванням діють наявні ключі й правила маршрутизації.</p>
    ${LEARNING_TRACKS.map(track=>{
      const current=boot.settings.lunaModels?.[track.id];
      return `<div class="setting-row"><strong>${escape(track.title)}</strong>
        <label>Провайдер <select name="provider-${track.id}"><option value="">Автоматично</option>${LUNA_PROVIDERS.map(id=>`<option ${current?.provider===id?'selected':''} value="${id}">${id}</option>`).join('')}</select></label>
        <label>ID моделі <input name="model-${track.id}" maxlength="120" value="${escape(current?.model||'')}" placeholder="gpt-6-luna"></label></div>`;
    }).join('')}
    <button class="button secondary" type="submit">Зберегти моделі</button>
  </form>`;
}
function settings(){
  shell(`<section class="compact-heading"><div class="eyebrow">ТВІЙ ТЕМП І ТВІЙ ПРОСТІР</div><h1>Налаштування.</h1></section>${scheduleSettings()}<section class="panel settings-panel"><h2>Щоденне повторення</h2><label class="setting-row"><div><strong>Запускати разом із Windows</strong><p>Програма чекає у треї та рахує час користування ПК.</p></div><input type="checkbox" id="auto-start" ${boot.settings.autoStart?'checked':''}></label><div class="setting-row"><div><strong>Кількість вправ у SQL-сесії</strong><p>Після основних вправ можливі до двох додаткових, якщо залишився час. У вправі доступна Luna.</p></div><span class="pill">3 + ДО 2 ВПРАВ</span></div><div class="setting-row"><div><strong>Додаткові вправи за швидке проходження</strong><p>За швидшого проходження додається до двох вправ, насамперед на слабкі вивчені теми.</p></div><select id="min-practice">${[5,7,10,15].map(n=>`<option value="${n}" ${boot.settings.minPracticeMinutes===n?'selected':''}>${n} хвилин</option>`).join('')}</select></div><div class="setting-row"><div><strong>Попередження без перемикання фокуса</strong><p>Справа знизу, без перемикання фокуса. Ctrl+Shift+A відкладає запрошення SQL або English на 30 хвилин.</p></div>${button('test-warning','Перевірити попередження','secondary')}</div><label class="setting-row"><div><strong>Попереджати перед SQL і після 16:00</strong><p>У режимі за активністю показувати «Готовий?» незалежно від часу доби.</p></div><input type="checkbox" id="sql-warn-after-16" ${boot.settings.sqlWarnAfter16!==false?'checked':''}></label>${button('save-settings','Зберегти налаштування','primary')}</section>${sqlAISettings(boot)}<section class="panel"><h2>Прогрес і файли</h2><p class="muted">Статистика зберігається лише локально:</p><code class="path">${escape(boot.settings.statisticsPath)}</code><div class="button-row">${button('open-course','Відкрити тренажер ↗','secondary')}${button('import-progress','Імпортувати JSON','secondary')}${button('open-statistics','Папка статистики','secondary')}</div></section>${lunaModelSettings()}`);
  for(const track of LEARNING_TRACKS){
    const mode=$<HTMLSelectElement>('schedule-mode-'+track.id)!;
    mode.addEventListener('change',()=>{
      const showTime=mode.value==='clock';
      $('schedule-time-label-'+track.id)!.hidden=!showTime;
      $<HTMLInputElement>('schedule-time-'+track.id)!.disabled=!showTime;
    });
  }
  $('luna-model-form')?.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(event.currentTarget as HTMLFormElement);
    const choices:Partial<Record<TrackId,LunaModel>>={};
    for(const track of LEARNING_TRACKS){
      const provider=data.get('provider-'+track.id) as LunaModel['provider']|'';
      if(provider)choices[track.id]={provider,model:String(data.get('model-'+track.id)||'').trim()};
    }
    void action(async()=>{
      await window.recall.configureLunaModels(choices);
      await refresh();
      notice='Моделі Luna збережено.';
      render();
    });
  });
  $('track-schedule-form')?.addEventListener('submit',event=>{
    event.preventDefault();
    const durationMinutes:TrackDurations={},startTimes:TrackStarts={};
    for(const track of LEARNING_TRACKS){
      const mode=$<HTMLSelectElement>('schedule-mode-'+track.id)!.value;
      const clock=$<HTMLInputElement>('schedule-time-'+track.id)!.value;
      if(mode==='clock'&&!isClockTime(clock))return;
      startTimes[track.id]=mode==='activity'?'activity':mode==='clock'&&isClockTime(clock)?clock:null;
      durationMinutes[track.id]=$<HTMLInputElement>('duration-'+track.id)!.valueAsNumber;
    }
    void action(async()=>{
      await window.recall.configureTracks({durationMinutes,startTimes,englishPauseMinutes:$<HTMLInputElement>('english-pause-minutes')!.valueAsNumber});
      await refresh();
      notice='Розклад і тривалість збережено.';
      render();
    });
  });
  for(const id of ['sql-ai-save','sql-ai-test','sql-ai-prepare'])$(id)?.addEventListener('click',()=>void action(async()=>{const buttons=['sql-ai-save','sql-ai-test','sql-ai-prepare'].map(k=>$<HTMLButtonElement>(k)!);for(const button of buttons)button.disabled=true;const status=$('sql-ai-status')!;status.textContent=id==='sql-ai-prepare'?'Готуємо новий пакет, екран не блокується…':'Перевіряємо налаштування…';try{const result=await window.recall.sqlAI({action:id==='sql-ai-save'?'settings':id==='sql-ai-test'?'test':'prepare',options:id==='sql-ai-save'?{key:$<HTMLInputElement>('sql-ai-key')!.value,enabled:$<HTMLInputElement>('sql-ai-enabled')!.checked,fallbackEnabled:$<HTMLInputElement>('sql-ai-fallback')!.checked,learningBonus:$<HTMLInputElement>('sql-ai-learning')!.checked}:undefined});await refresh();notice=result.message;render();}finally{for(const button of buttons)button.disabled=false;}}));
  $('test-warning')?.addEventListener('click',()=>void window.recall.previewWarning());
  $('save-settings')?.addEventListener('click',()=>void action(async()=>{await window.recall.configure({autoStart:$<HTMLInputElement>('auto-start')!.checked,sqlWarnAfter16:$<HTMLInputElement>('sql-warn-after-16')!.checked,minPracticeMinutes:Number($<HTMLSelectElement>('min-practice')!.value)});await refresh();notice='Налаштування збережено.';render();}));

}
function render(){if(englishScreen){englishScreen.dispose();englishScreen=null;}if(page==='english')englishPage();else if(page==='courses'){
  shell('<div id="folder-courses"></div>');
  (folderCourses??=new FolderCoursesView(window.recall)).mount($('folder-courses')!);
}else if(page==='paused')paused();else if(page==='session')exercise();else if(page==='statistics')statistics();else if(page==='settings')settings();else if(page==='summary')summary();else home();}
function bindCourse(){$('open-course')?.addEventListener('click',()=>void action(async()=>{notice=(await window.recall.openCourse()).message;render();}));}
function bindImport(){$('import-progress')?.addEventListener('click',()=>void action(async()=>{notice=(await window.recall.importProgress()).message;await refresh();render();}));}
async function refresh(){boot=await window.recall.bootstrap();}
async function action(fn:()=>Promise<void>){try{await fn();}catch(error){notice=String(error);render();}}
function queueSave(){if(saveTimer)clearTimeout(saveTimer);saveTimer=setTimeout(()=>{saveTimer=null;void persist();},400);}
async function persist(){if(session&&!session.endedAt){try{await window.recall.saveSession(session);lastSavedAt=Date.now();}catch(error){notice=`Не вдалося зберегти сесію: ${String(error)}`;}}}
function tick(active:boolean,clock?:{id:string;activeMs:number;taskElapsedMs:number[]}){
  const now=Date.now();const delta=Math.min(1500,Math.max(0,now-previousTick));previousTick=now;
  if(!session||session.endedAt||session.paused||!active||finishing)return;
  if(clock&&clock.id===session.id){session.activeMs=clock.activeMs;session.taskElapsedMs=[...clock.taskElapsedMs];}
  if($('session-clock'))$('session-clock')!.textContent=`${time(session.activeMs)} / ${time(sqlDuration(session)*minuteMs)}`;
  const surrender=$('surrender');if(surrender)surrender.hidden=!canSurrender(session);
  const bar=document.querySelector<HTMLElement>('.surrender-bar');if(bar)bar.hidden=!canSurrender(session);
  if($('surrender-message'))$('surrender-message')!.textContent=surrenderMessage(session)||'';
  if(now-lastSavedAt>10000)void persist();
}
async function initialize(){
  if(!window.recall){root.innerHTML='<main style="padding:40px;font:18px system-ui">Відкрий SQL Recall через Windows-програму, а не як окрему вебсторінку.</main>';return;}
  await refresh();session=boot.activeSession;if(boot.activeLearningSession?.moduleId==='english')page='english';else if(session)page=session.paused?'paused':'session';render();if(page==='session'&&session&&!session.paused)await initializeRunner();
  setInterval(()=>{if(page==='english'&&!(boot.activeLearningSession?.moduleId==='english'&&boot.activeLearningSession.status==='active'))void window.recall.bootstrap().then(next=>{if(page!=='english')return;const changed=boot.english?.readonly!==next.english?.readonly||boot.english?.revision!==next.english?.revision;boot.english=next.english;if(changed)render();}).catch(()=>{});},5000);
  setInterval(()=>{if(!document.body.classList.contains('focus-session')&&!document.hidden)void window.recall.trackProgress().then(syncTrackRows).catch(()=>{});},15000);
  window.recall.onEvent(event=>{if(event.type==='tick'){if(page==='english'&&event.clock&&boot.english?.run?.id===event.clock.id)englishScreen?.clock(event.clock.activeMs,!!event.active,event.clock.breakRemainingMs);else tick(!!event.active,event.clock);return;}void action(async()=>{
    if(event.type==='pause'&&session&&!session.endedAt&&page!=='english'){session.paused=true;page='paused';await persist();}
    if((page==='settings'||page==='courses')&&(event.type==='progress'||event.type==='schedule')){
      syncTrackRows(await window.recall.trackProgress());return;
    }
    await refresh();
    if(event.type==='english'){page='english';render();return;}
    if(event.type==='daily'||event.type==='practice'){session=boot.activeSession;page=session?.paused?'paused':'session';feedback=null;previousTick=Date.now();if(!session?.paused)await initializeRunner();else render();}
    else if(page!=='session'&&(page!=='english'||event.type!=='schedule'&&event.type!=='progress'))render();
  });});
}
void initialize().catch(error=>{root.textContent=`Не вдалося запустити інтерфейс: ${String(error)}. Закрий програму й відкрий її знову.`;});
