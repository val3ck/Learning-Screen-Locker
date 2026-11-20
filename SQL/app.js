import {queueRecallProgress,restoreRecallProgress} from './recall-sync.js';
import {lessons as courseLessons,modules,schema,seed,quickChecks} from './course.js';
import {projectSteps} from './project.js';
import {conceptLessons,gradeConcept} from './concepts.js';
import {checkpoint,helpdeskSchema} from './checkpoint.js';
import {guide} from './guide.js';
const lessons=[...courseLessons,...projectSteps,...conceptLessons,checkpoint];
const moduleOrder=[0,1,8,2,9,11,3,4,5,6,7,10];
const pathOrder=moduleOrder.flatMap(module=>lessons.map((lesson,index)=>lesson.module===module?index:-1).filter(index=>index>=0));
const pathPosition=index=>pathOrder.indexOf(index);
const unlockedFromProgress=s=>Math.min(pathOrder.length-1,Math.max(s.unlockedThrough??0,s.unlockedThrough===undefined?pathPosition(s.index):0,...s.completed.map(index=>pathPosition(index)+1)));
const $=s=>document.querySelector(s);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key='postgres-path-v1';
let state={completed:[],drafts:{},conceptAnswers:{},index:0,play:'',unlockedThrough:0,freeExplore:false};
try{const s=JSON.parse(localStorage.getItem(key));if(s&&validState(s)){state={...state,...s};state.unlockedThrough=unlockedFromProgress(s);}}catch{}
function validState(s){return s&&Array.isArray(s.completed)&&s.completed.every(n=>Number.isInteger(n)&&n>=0&&n<lessons.length)&&s.drafts&&typeof s.drafts==='object'&&!Array.isArray(s.drafts)&&Object.values(s.drafts).every(v=>typeof v==='string'&&v.length<100000)&&(s.conceptAnswers===undefined||s.conceptAnswers&&typeof s.conceptAnswers==='object'&&!Array.isArray(s.conceptAnswers)&&Object.values(s.conceptAnswers).every(a=>Array.isArray(a)&&a.length<=4&&a.every(v=>v===null||Number.isInteger(v)&&v>=0&&v<4)))&&Number.isInteger(s.index)&&s.index>=0&&s.index<lessons.length&&(!s.play||typeof s.play==='string')&&(s.unlockedThrough===undefined||Number.isInteger(s.unlockedThrough)&&s.unlockedThrough>=0&&s.unlockedThrough<lessons.length)&&(s.freeExplore===undefined||typeof s.freeExplore==='boolean');}
let mode='map',expanded=lessons[state.index].module,worker,ready=false,busy=false,job=0,timer,lastResult=null;
const locked=index=>!state.freeExplore&&pathPosition(index)>unlockedFromProgress(state)&&!state.completed.includes(index);
const nextStep=()=>pathOrder.find(index=>!state.completed.includes(index)&&!locked(index))??pathOrder.at(-1);
function save(){queueRecallProgress(state.completed,state);try{localStorage.setItem(key,JSON.stringify(state));}catch{$('#lesson-status').textContent='Browser storage is unavailable. Export progress before leaving.';}}
function download(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function progress(){const count=new Set(state.completed).size;$('#completed').textContent=`${count} / ${lessons.length}`;$('#percent').textContent=`${Math.round(count/lessons.length*100)}%`;$('#progress-fill').style.width=`${count/lessons.length*100}%`;$('#lesson-count').textContent=`${lessons.length} steps`;}
function navigation(){
 $('#curriculum').innerHTML=moduleOrder.map(module=>{
  const m=modules[module];
  const group=lessons.map((lesson,index)=>({lesson,index})).filter(item=>item.lesson.module===module);
  const count=group.filter(item=>state.completed.includes(item.index)).length;
  const noun=module===10?'concepts':module===11?'mission':module>=8?'tasks':'lessons';
  const items=expanded===module?'<div class="module-lessons">'+group.map(({lesson,index})=>{
   const done=state.completed.includes(index);
   const unavailable=locked(index);
   return `<button class="lesson-link ${index===state.index?'current':''} ${done?'done':''}" data-lesson="${index}" ${unavailable?'disabled':''} ${index===state.index?'aria-current="step"':''}>${done?'✓ ':unavailable?'◈ ':''}${escape(lesson.title)}</button>`;
  }).join('')+'</div>':'';
  return `<button class="module-button ${expanded===module?'active':''} ${module===10?'concept-module':module>=8?'project-module':''}" data-module="${module}" aria-expanded="${expanded===module}"><span class="module-number">${count===group.length?'✓':m[2]}</span><span><strong>${escape(m[0])}</strong><small>${count}/${group.length} ${noun} · ${escape(m[1])}</small></span></button>${items}`;
 }).join('');
 $('#curriculum').querySelectorAll('[data-module]').forEach(button=>button.onclick=()=>{const module=Number(button.dataset.module);expanded=expanded===module?-1:module;navigation();});
 $('#curriculum').querySelectorAll('[data-lesson]').forEach(button=>button.onclick=()=>selectLesson(Number(button.dataset.lesson)));
}
function renderMap(){
 const recommended=nextStep();
 const completed=new Set(state.completed);
 $('#map-current-title').textContent=lessons[recommended].title;
 $('#map-current-meta').textContent=modules[lessons[recommended].module][0];
 $('#map-progress').textContent=`${completed.size} of ${lessons.length} complete`;
 $('#map-continue').textContent=completed.size===lessons.length?'Review final task →':'Continue learning →';
 $('#map-free-explore').checked=state.freeExplore;
 $('#path-tree').innerHTML=moduleOrder.map(module=>{
  const m=modules[module];
  const group=pathOrder.filter(index=>lessons[index].module===module);
  const doneCount=group.filter(index=>completed.has(index)).length;
  const nodes=group.map(index=>{
   const done=completed.has(index);
   const unavailable=locked(index);
   const status=done?'Completed':unavailable?'Locked':index===recommended?'Next':index===state.index?'In progress':'Available';
   const stateClass=done?'done':unavailable?'locked':index===recommended?'recommended':'available';
   return `<button class="path-node ${stateClass}" data-path-index="${index}" ${unavailable?'disabled':''} aria-label="${escape(lessons[index].title)}: ${status}"><span class="path-node-symbol" aria-hidden="true">${done?'✓':unavailable?'⌁':String(pathPosition(index)+1).padStart(2,'0')}</span><span class="path-node-copy"><strong>${escape(lessons[index].title)}</strong><small>${lessons[index].kind==='checkpoint'?'Workplace mission':lessons[index].kind==='concept'?'Concept lab':lessons[index].kind==='project'?'Project task':'SQL lesson'} · ${status}</small></span><span class="path-node-arrow" aria-hidden="true">↗</span></button>`;
  }).join('');
  return `<section class="path-chapter ${module===10?'concept-chapter':module>=8?'project-chapter':''}" aria-label="${escape(m[0])}"><div class="path-chapter-mark"><span>${m[2]}</span></div><div class="path-chapter-body"><div class="path-chapter-head"><div><span class="path-chapter-kicker">${module===10?'NEXT TRACK':module===11?'WORKPLACE PROJECT':module>=8?'PRACTICE PROJECT':'CHAPTER '+m[2]}</span><h3>${escape(m[0])}</h3><p>${escape(m[1])}</p></div><span class="path-chapter-count">${doneCount}/${group.length}</span></div><div class="path-nodes">${nodes}</div></div></section>`;
 }).join('');
 $('#path-tree').querySelectorAll('[data-path-index]').forEach(button=>button.onclick=()=>selectLesson(Number(button.dataset.pathIndex)));
}
function renderSchema(){const workplace=mode==='learn'&&lessons[state.index].fixture==='helpdesk';const tables=workplace?helpdeskSchema:schema;$('#schema-tab').innerHTML=tables.map(([name,desc,cols])=>`<article class="schema-card"><h3>${name}</h3><p>${desc}</p><table><tbody>${cols.map(([col,type])=>`<tr><td>${col}</td><td>${escape(type)}</td></tr>`).join('')}</tbody></table></article>`).join('')+(workplace?'<p class="schema-note">This is a separate support-desk dataset. Inspect each table before writing the four reports.</p>':'<p class="schema-note">order_items has a composite primary key: (order_id, product_id). Inspect data with SELECT * FROM table_name.</p>');}
function lines(){ $('#line-numbers').textContent=Array.from({length:$('#editor').value.split('\n').length},(_,i)=>i+1).join('\n');$('#line-numbers').scrollTop=$('#editor').scrollTop;}
function draft(){if(mode==='play')state.play=$('#editor').value;else if(mode==='learn'&&lessons[state.index].kind!=='concept')state.drafts[state.index]=$('#editor').value;save();lines();}
function clearResults(){lastResult=null;$('#feedback').textContent='';$('#feedback').className='';$('#row-count').textContent='Ready when you are';$('#download-results').disabled=true;$('#results').innerHTML='<div class="empty-results"><span>⌘</span><h3>A little SQL goes a long way.</h3><p>Run your query to see your data here.</p></div>';}
function completeCurrent(){
 const wasComplete=state.completed.includes(state.index);
 if(!wasComplete)state.completed.push(state.index);
 const previous=state.unlockedThrough;
 state.unlockedThrough=unlockedFromProgress(state);
 if(wasComplete&&state.unlockedThrough===previous)return;
 save();progress();navigation();
 $('#next').disabled=pathPosition(state.index)===pathOrder.length-1||locked(pathOrder[pathPosition(state.index)+1]);
 $('#lesson-status').textContent=state.completed.length===lessons.length?'✓ Full learning path complete.':'✓ Completed. Ready for the next step.';
}
function renderConcept(lesson){
 $('#module-label').textContent='NEXT TRACK · BEYOND SQL';
 $('#lesson-title').textContent=lesson.title;
 $('#lesson-number').textContent=`Concept ${state.index-courseLessons.length-projectSteps.length+1} of ${conceptLessons.length}`;
 $('#concept-intro').textContent=lesson.concept;
 $('#concept-brief').textContent=lesson.brief;
 $('#concept-feedback').textContent='';
 $('#concept-feedback').className='';
 const saved=state.conceptAnswers[state.index]||[];
 $('#concept-scenarios').innerHTML=lesson.questions.map((question,i)=>
  `<fieldset class="concept-scenario"><legend><span>SCENARIO ${i+1}</span>${escape(question.prompt)}</legend><div class="concept-options">${question.options.map((option,j)=>
   `<label><input type="radio" name="concept-${i}" value="${j}" ${saved[i]===j?'checked':''}><span>${escape(option)}</span></label>`).join('')}</div><p class="concept-scenario-feedback" aria-live="polite"></p></fieldset>`
 ).join('');
 $('#concept-scenarios').querySelectorAll('input[type=radio]').forEach(input=>input.onchange=()=>{
  state.conceptAnswers[state.index]=lesson.questions.map((_,i)=>{const selected=document.querySelector(`input[name="concept-${i}"]:checked`);return selected?Number(selected.value):null;});
  save();
 });
}
function checkConcept(){
 const lesson=lessons[state.index];
 if(lesson.kind!=='concept')return;
 const answers=lesson.questions.map((_,i)=>{const selected=document.querySelector(`input[name="concept-${i}"]:checked`);return selected?Number(selected.value):null;});
 if(answers.some(value=>value===null)){$('#concept-feedback').textContent='Choose an answer for every scenario, then check your decisions.';$('#concept-feedback').className='error';return;}
 state.conceptAnswers[state.index]=answers;
 save();
 const result=gradeConcept(lesson,answers);
 $('#concept-scenarios').querySelectorAll('.concept-scenario').forEach((card,i)=>{
  const isWrong=result.wrong.includes(i);
  card.classList.toggle('wrong',isWrong);
  card.classList.toggle('correct',!isWrong);
  card.querySelector('.concept-scenario-feedback').textContent=isWrong?lesson.questions[i].hint:lesson.questions[i].why;
 });
 $('#concept-feedback').textContent=result.complete?'All three decisions fit the scenario. The next concept is unlocked.':`${result.correct} of ${lesson.questions.length} decisions fit. Revisit the highlighted scenarios and try again.`;
 $('#concept-feedback').className=result.complete?'success':'error';
 if(result.complete)completeCurrent();
}
function renderLesson(){
 const lesson=lessons[state.index];
 const position=pathPosition(state.index);
 $('#sql-workspace').hidden=lesson.kind==='concept';
 $('#concept-view').hidden=lesson.kind!=='concept';
 if(lesson.kind==='concept'){
  renderConcept(lesson);
  $('#prev').disabled=position===0;
  $('#next').disabled=position===pathOrder.length-1||locked(pathOrder[position+1]);
  $('#lesson-status').textContent=state.completed.includes(state.index)?'✓ Completed. Revisit these decisions anytime.':'Choose a decision for each scenario, then check your reasoning.';
  progress();navigation();return;
 }
 renderSchema();
 $('#module-label').textContent=lesson.kind==='checkpoint'?'WORKPLACE CHECKPOINT · BEFORE CHAPTER 04':lesson.kind==='project'?`PROJECT · STOREFRONT LAUNCH · PART ${lesson.module-7}`:`MODULE ${modules[lesson.module][2]} · ${modules[lesson.module][0].toUpperCase()}`;
 $('#lesson-title').textContent=lesson.title;
 $('#lesson-number').textContent=lesson.kind==='checkpoint'?'4 reports · 3 tables':lesson.kind==='project'?`Project task ${state.index-courseLessons.length+1} of ${projectSteps.length}`:`Lesson ${state.index+1} of ${courseLessons.length}`;
 $('#concept').textContent=lesson.concept;
 $('#example').textContent=lesson.example;
 const quick=quickChecks[state.index];
 $('#quick-check').hidden=!quick;
 $('#quick-question').textContent=quick?.question??'';
 $('#quick-answer').textContent=quick?.answer??'';
 $('#quick-check details').open=false;
 $('#task').textContent=lesson.task;
 $('#hint').textContent=lesson.hint;
 $('#solution').textContent=lesson.solution;
 $('#idea-label').textContent=lesson.kind==='project'||lesson.kind==='checkpoint'?'THE PROJECT BRIEF':'THE IDEA';
 $('#example-label').textContent=lesson.kind==='project'||lesson.kind==='checkpoint'?'INSPECT THE DATA':'SEE IT IN SQL';
 $('#try-example').textContent=lesson.kind==='project'||lesson.kind==='checkpoint'?'Inspect sample data ↗':'Try this example ↗';
 $('#solution-box').open=false;
 document.querySelectorAll('.reading details').forEach(details=>details.open=false);
 $('#editor').value=state.drafts[state.index]??(lesson.kind==='checkpoint'?'-- Report 1: urgent queue\n\n-- Report 2: channel load\n\n-- Report 3: staffing\n\n-- Report 4: recurring incidents\n':'-- Write your query here\n');
 $('#prev').disabled=position===0;
 $('#next').disabled=position===pathOrder.length-1||locked(pathOrder[position+1]);
 $('#lesson-status').textContent=state.completed.includes(state.index)?'✓ Completed. Revisit this anytime.':lesson.kind==='checkpoint'?'Submit all four SELECT statements together.':lesson.kind==='project'?'Write the report query without a recipe. Inspect the data if needed.':'Take your time. Understanding comes first.';
 lines();progress();navigation();clearResults();
}
function cancelJob(){if(busy){clearTimeout(timer);worker.terminate();busy=false;startWorker();}}
function selectLesson(i){if(!Number.isInteger(i)||!lessons[i]||locked(i))return;draft();cancelJob();state.index=i;expanded=lessons[i].module;mode='learn';save();renderMode();$('.lesson-top').scrollIntoView({block:'start',behavior:'smooth'});$('.sidebar').classList.remove('open');}
function renderMode(){document.body.classList.toggle('playground',mode==='play');document.body.classList.toggle('checkpoint',mode==='learn'&&lessons[state.index]?.fixture==='helpdesk');$('#learning-view').hidden=mode==='guide'||mode==='map';$('#map-view').hidden=mode!=='map';$('#guide-view').hidden=mode!=='guide';$('#learn-nav').classList.toggle('active',mode==='learn'||mode==='map');$('#play-nav').classList.toggle('active',mode==='play');$('#guide-nav').classList.toggle('active',mode==='guide');$('#crumb').textContent=mode==='map'?'Learning map':mode==='learn'?'Current exercise':mode==='play'?'SQL playground':'Field guide';if(mode==='map'){progress();navigation();renderMap();}else if(mode==='learn'){renderLesson();setTab('lesson');}else if(mode==='play'){$('#sql-workspace').hidden=false;$('#concept-view').hidden=true;renderSchema();$('#module-label').textContent='MAKE ROOM FOR CURIOSITY';$('#lesson-title').textContent='Your SQL playground';$('#lesson-number').textContent='No grades. Just exploration.';$('#editor').value=state.play||'SELECT * FROM customers;';setTab('schema');lines();clearResults();}setButtons();}
function setTab(tab){$('#lesson-tab').hidden=tab!=='lesson';$('#schema-tab').hidden=tab!=='schema';document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('selected',b.dataset.tab===tab);b.setAttribute('aria-pressed',b.dataset.tab===tab);});}
function setButtons(){for(const id of ['#run','#check'])$(id).disabled=!ready||busy;$('#engine-state').textContent=busy?'Executing…':ready?'PostgreSQL ready':'Starting PostgreSQL…';$('#engine-dot').style.background=ready?'#4bb99b':'#dfad56';}
function startWorker(){ready=false;setButtons();worker=new Worker('./worker.js',{type:'module'});const startup=setTimeout(()=>{if(!ready){$('#engine-state').textContent='Engine could not start';$('#feedback').className='error';$('#feedback').textContent='PostgreSQL is taking too long to load. Ensure npm install completed, open this site through START-COURSE.cmd, and reload.';}},30000);worker.onmessage=({data})=>{if(data.ready){clearTimeout(startup);ready=true;setButtons();return;}if(data.id!==job)return;clearTimeout(timer);busy=false;setButtons();if(data.error){$('#feedback').className='error';$('#feedback').textContent=data.error+(data.hint?'\nHint: '+data.hint:'');$('#row-count').textContent='Query error';return;}(data.multi?renderReportPack(data.results||[]):renderResult(data.result));$('#feedback').textContent=data.message;$('#feedback').className=data.pass===true?'success':data.pass===false?'error':'';if(data.pass===true)completeCurrent();};worker.onerror=()=>{clearTimeout(startup);clearTimeout(timer);ready=false;busy=false;setButtons();$('#engine-state').textContent='Engine unavailable';$('#feedback').className='error';$('#feedback').textContent='Could not load PostgreSQL. Run npm install from the project folder, start START-COURSE.cmd, and reload. Do not open index.html directly.';};}
function renderResult(result){lastResult=result;const rows=result.rows||[],fields=result.fields||[];$('#row-count').textContent=`${rows.length} row${rows.length===1?'':'s'}${rows.length>200?' · first 200 shown':''}`;$('#download-results').disabled=!fields.length;if(!fields.length){$('#results').innerHTML='<div class="empty-results"><span>✓</span><h3>Statement executed.</h3><p>Add SELECT or RETURNING to see rows.</p></div>';return;}$('#results').innerHTML=`<table><thead><tr>${fields.map(f=>`<th scope="col">${escape(f.name)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,200).map(r=>`<tr>${fields.map(f=>`<td>${r[f.name]===null?'<span class="null">NULL</span>':escape(typeof r[f.name]==='object'?JSON.stringify(r[f.name]):r[f.name])}</td>`).join('')}</tr>`).join('')}</tbody></table>${!rows.length?'<p class="schema-note">No matching rows.</p>':''}`;}
function renderReportPack(reports){
 lastResult=null;$('#download-results').disabled=true;
 $('#row-count').textContent=`${reports.length} of ${checkpoint.reports.length} reports`;
 $('#results').innerHTML=reports.map((report,index)=>{
  const fields=report.fields||[],rows=report.rows||[];
  const table=fields.length?`<table><thead><tr>${fields.map(field=>`<th scope="col">${escape(field.name)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,200).map(row=>`<tr>${fields.map(field=>`<td>${row[field.name]===null?'<span class="null">NULL</span>':escape(row[field.name])}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'<p>No result columns.</p>';
  const heading=reports.length===checkpoint.reports.length?`Report ${index+1}: ${escape(checkpoint.reports[index])}`:`Query ${index+1}`;
  return `<section class="report-result"><h3>${heading} <span>${rows.length} rows</span></h3>${table}</section>`;
 }).join('')||'<div class="empty-results"><h3>No report queries yet.</h3><p>Write four SELECT statements in the editor.</p></div>';
}
function run(check=false){if(!ready||busy)return;draft();clearResults();busy=true;setButtons();$('#feedback').textContent=check?'Checking your answer on two datasets…':'Running against fresh sample data…';job++;worker.postMessage({id:job,index:mode==='play'?0:state.index,sql:$('#editor').value,check,playground:mode==='play'});timer=setTimeout(()=>{worker.terminate();busy=false;$('#feedback').className='error';$('#feedback').textContent='Query stopped after 20 seconds. The sandbox is restarting. Try a smaller query or check for missing join conditions.';startWorker();},20000);}
$('#editor').addEventListener('input',draft);$('#editor').addEventListener('scroll',lines);$('#editor').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run(e.shiftKey);}if(e.key==='Tab'){e.preventDefault();const el=e.target;const start=el.selectionStart;el.setRangeText('  ',start,el.selectionEnd,'end');draft();}});
$('#run').onclick=()=>run();$('#check').onclick=()=>run(true);$('#concept-check').onclick=checkConcept;$('#reset-query').onclick=()=>{if($('#editor').value.trim()&&!confirm('Clear the current query draft?'))return;$('#editor').value='-- Write your query here\n';draft();clearResults();};
$('#try-example').onclick=()=>{$('#editor').value=lessons[state.index].example;draft();run();};$('#use-solution').onclick=()=>{$('#editor').value=lessons[state.index].solution;draft();$('#editor').focus();};
$('#prev').onclick=()=>selectLesson(pathOrder[pathPosition(state.index)-1]);$('#next').onclick=()=>selectLesson(pathOrder[pathPosition(state.index)+1]);$('#back-to-map').onclick=()=>{draft();cancelJob();mode='map';renderMode();};$('#map-continue').onclick=()=>selectLesson(nextStep());$('#map-free-explore').onchange=e=>{state.freeExplore=e.target.checked;save();renderMap();navigation();};
for(const [id,nextMode] of [['#learn-nav','map'],['#play-nav','play'],['#guide-nav','guide']])$(id).onclick=()=>{draft();cancelJob();mode=nextMode;renderMode();$('.sidebar').classList.remove('open');};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
$('#menu').onclick=()=>$('.sidebar').classList.toggle('open');document.addEventListener('click',e=>{if(!e.target.closest('.sidebar')&&!e.target.closest('#menu'))$('.sidebar').classList.remove('open');});
$('#export').onclick=()=>{draft();download('postgres-path-progress.json',JSON.stringify(state,null,2),'application/json');};
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw new Error('Backup is too large.');const s=JSON.parse(await file.text());if(!validState(s))throw new Error('This is not a valid Postgres Path backup.');if(!confirm('Replace your current progress and drafts with this backup?'))return;cancelJob();state={completed:[...new Set(s.completed)],drafts:s.drafts,conceptAnswers:s.conceptAnswers||{},index:s.index,play:s.play||'',unlockedThrough:unlockedFromProgress(s),freeExplore:s.freeExplore??false};expanded=lessons[state.index].module;save();renderMode();progress();navigation();}catch(err){alert(err.message);}finally{e.target.value='';}};
$('#download-results').onclick=()=>{if(!lastResult)return;const fields=lastResult.fields.map(f=>f.name);const csvCell=v=>{let s=v===null?'':typeof v==='object'?JSON.stringify(v):String(v);if(/^[=+@-]/.test(s)&&typeof v==='string')s="'"+s;return '"'+s.replaceAll('"','""')+'"';};download('query-results.csv',[fields,...lastResult.rows.map(r=>fields.map(k=>r[k]))].map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv');};
$('#guide-view').innerHTML=guide;$('#download-seed').onclick=()=>download('sample-data.sql','-- Postgres Path practice data. Run in an empty learning database.\n'+seed());
renderSchema();renderMode();startWorker();

void restoreRecallProgress(state).then(saved=>{if(!validState(saved))return;state=saved;state.unlockedThrough=unlockedFromProgress(state);save();progress();navigation();if(mode==='map')renderMap();});
