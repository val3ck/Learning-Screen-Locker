(function(){
  'use strict';
  const C=EnglishCourse,E=EnglishDailyEngine;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(action,label,extra='',primary=false)=>`<button type="button" class="${primary?'ed-primary':'ed-button'}" data-action="${action}" ${extra}>${label}</button>`;
  const wordCount=text=>String(text||'').trim().split(/\s+/).filter(Boolean).length;
  const SKILLS={task:'Виконання задачі',clarity:'Зрозумілість',grammar:'Граматика',vocabulary:'Словник',coherence:'Зв’язність',interaction:'Взаємодія'};
  class DailyApp{
    constructor(){
      this.root=document.getElementById('daily-root');this.notice='';this.waiting=false;this.lastActivity=Date.now();this.recording=null;this.audioUrls=new Map();
      this.ai=window.dailyAI||(window.dailyAI=new EnglishAIProvider());
      try{this.engine=new E.Engine(localStorage);}catch(error){this.root.innerHTML=`<div class="ed-card"><h2>Потрібне відновлення збереження</h2><p>${esc(error.message)}</p><button id="ed-recovery-export">Завантажити пошкоджене збереження</button><p>Оригінальні дані не перезаписано.</p></div>`;document.getElementById('ed-recovery-export').onclick=()=>this.download(localStorage.getItem(E.STORAGE_KEY)||'','english-daily-recovery.json');return;}
      this.root.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(b)this.dispatch(b.dataset.action,b).catch(error=>this.message(error.message));});
      this.root.addEventListener('input',event=>this.onInput(event));
      this.root.addEventListener('change',event=>{if(event.target.matches('input[type=radio], input[type=checkbox]'))this.onInput(event);});
      for(const name of ['pointerdown','keydown','input','scroll'])document.addEventListener(name,()=>{this.lastActivity=Date.now();},{passive:true});
      document.addEventListener('visibilitychange',()=>{if(document.hidden){this.stopSpeech();this.stopRecording();this.persist();}});
      window.addEventListener('pagehide',()=>{this.stopRecording();this.persist();});
      this.importInput=document.getElementById('daily-import');this.importInput.addEventListener('change',()=>this.importFile());
      this.sync=window.EnglishRecallSync;this.sync?.attach(this);this.bindSettings();this.patchLibrary();
      if(!location.hash.startsWith('#milestone=')&&!location.hash.startsWith('#m_'))window.app?.switchTab('daily',false);
      this.render();this.ai.refresh().then(()=>{this.updateProviderLabel();window.app?.updateAIMentorStatusLabel();});
      let last=Date.now(),ticks=0;
      this.timer=setInterval(()=>{const now=Date.now();if(this.engine.current()&&!this.sync?.readonly){
        this.engine.tick(now-last,{visible:!document.hidden&&document.getElementById('pane-daily').classList.contains('active'),focused:document.hasFocus(),waiting:this.waiting||Date.now()-this.lastActivity>5*60000});
        if(++ticks%10===0)this.persist();this.updateTimer();
      }last=now;},1000);
    }
    persist(){try{this.engine?.save();}catch(error){this.message(error.message);}}
    message(text){this.notice=text;const n=document.getElementById('ed-notice');if(n){n.textContent=text;n.hidden=!text;}}
    updateProviderLabel(){const n=document.getElementById('ed-ai-label');if(n)n.textContent=this.ai.settings.configured?`${this.ai.settings.provider} підключено`:'Готові сценарії · AI за бажанням';}
    updateTimer(){const s=this.engine.current(),n=document.getElementById('ed-timer');if(n&&s)n.textContent=`${Math.floor(s.activeMs/60000)}:${String(Math.floor(s.activeMs/1000)%60).padStart(2,'0')} / ≈55 хв`;
      const next=document.getElementById('ed-next');if(next&&s)next.disabled=s.paused||this.waiting||!!this.sync?.readonly||!this.engine.requirements();
      const optional=document.getElementById('ed-time-note');if(optional&&s){optional.hidden=s.activeMs<55*60000;optional.textContent='55 хв практики: додаткові спроби необов’язкові. Можна зберегти урок і продовжити пізніше.';}}
    onInput(event){
      const target=event.target,key=target.dataset.answer;if(!key||this.sync?.readonly)return;
      try{
        const hadFeedback=!!this.engine.current().feedback[key==='writing'?'writing':'speaking'];
        if(target.type==='checkbox'){this.engine.grade(key,target.checked,{assisted:true});}
        else{this.engine.setAnswer(key,target.value,target.dataset.voice==='true'?'voice-edited':'typed');}
        if(hadFeedback&&['writing','monologue','turn-0','turn-1','turn-2'].includes(key)&&!this.engine.current().feedback[key==='writing'?'writing':'speaking'])this.message('Відповідь змінено. Онови розбір або самоперевірку перед переходом далі.');
        const tag=document.querySelector(`[data-result-for="${CSS.escape(key)}"]`);if(tag)tag.textContent='Відповідь збережена';
        const footer=document.getElementById('ed-next');if(footer)footer.disabled=!this.engine.requirements();
        const status=document.getElementById('ed-footer-status');if(status)status.textContent=this.engine.requirements()?'Готово до наступного кроку':'Виконай завдання й перевір відповіді';
      }catch(error){this.message(error.message);}
    }
    render(){
      const state=this.engine.state,s=this.engine.current();
      this.root.innerHTML=`<div class="ed-shell"><div class="ed-topline"><span>ENGLISH DAILY / IT COMMUNICATION</span><span id="ed-ai-label"></span></div>
      <div class="ed-toolbar"><span>🔥 ${this.engine.streak()} дн. · ${state.sessions.length} уроків · ${state.xp} XP</span><div>${button('export','Експорт')}${button('import','Імпорт')}${button('migrate-audio','Перенести аудіо в Recall')}${button('settings','⚙ AI та голос')}</div></div>
      <div id="ed-notice" class="ed-notice" role="status" ${this.notice?'':'hidden'}>${esc(this.notice)}</div>
      ${s?this.sessionHtml(s):this.homeHtml()}</div>`;
      this.updateProviderLabel();this.updateTimer();
      if(s&&s.paused)this.root.querySelectorAll('[data-answer]').forEach(n=>n.disabled=true);
      if(this.waiting)this.root.querySelectorAll('button').forEach(n=>n.disabled=true);
      this.restoreAudio();this.sync?.applyReadonly(this.root);
    }
    homeHtml(){
      const next=this.engine.nextLesson(),today=E.localDay(),done=this.engine.state.completedDays.includes(today),latest=this.engine.state.sessions.at(-1);
      return `<div class="ed-home-grid"><div><article class="ed-hero"><span class="ed-eyebrow">${done?'СЬОГОДНІ ВЖЕ Є РЕЗУЛЬТАТ':next?`ТИЖДЕНЬ ${next.week} · УРОК ${next.number} / 84`:'ПЕРСОНАЛЬНА ПРАКТИКА'}</span>
        <h2>${done?'Good work.<br>До зустрічі завтра.':next?esc(next.title):'Курс пройдено.<br>Практика триває.'}</h2>
        <p>${done?'Твої відповіді збережено. Наступний урок почнеться з потрібного повторення.':esc(next?.mission||'Змішане повторення, знайомі концепти та нові приклади для розмови.')}</p>
        <div class="ed-hero-meta"><span>◷ 55 хвилин</span><span>🎙 16 хв speaking</span><span>Без окремого ДЗ</span></div>
        ${!done||!next?button('start',done?'Додаткова практика →':'Почати урок →','',true):''}
      </article><div class="ed-card"><h3>Один урок. Одна робоча ситуація.</h3><div class="ed-preview">${C.BLOCKS.map(b=>`<div><span>${esc(b.title)}</span><strong>${b.minutes} хв</strong></div>`).join('')}</div><p class="ed-muted">Таймер — орієнтир, а не замок. Пауза й очікування AI не додають навчального часу.</p></div>
      ${latest?`<div class="ed-card"><span class="ed-eyebrow">ОСТАННІЙ РЕЗУЛЬТАТ</span><h3>${esc(latest.lesson.title)}</h3><p>${esc(latest.feedback.speaking?.summary||'Пояснення, діалог і письмовий підсумок збережені.')}</p>${button('history','Мої відповіді та прогрес')}</div>`:''}
      </div><aside class="ed-card ed-curriculum"><span class="ed-eyebrow">ТВОЇ 12 ТИЖНІВ</span><h3>A2–B1 → впевнене спілкування</h3><p class="ed-muted">84 уроки — перший цикл. Рівень визначається практикою, а не датою.</p>${C.WEEKS.map((name,i)=>{
        const count=this.engine.state.sessions.filter(s=>s.mode==='course'&&s.lesson.week===i+1).length;
        return `<details ${next?.week===i+1?'open':''}><summary><span>${String(i+1).padStart(2,'0')} · ${esc(name)}</span><small>${count}/7</small></summary><ol>${C.lessons.filter(l=>l.week===i+1).map(l=>`<li>${esc(l.title)}${this.engine.state.sessions.some(s=>s.mode==='course'&&s.lessonId===l.id)?' ✓':''}</li>`).join('')}</ol></details>`;
      }).join('')}<p class="ed-muted">${this.engine.state.familiarWords.length} старих слів збережено як попереднє знайомство. Новий стрік рахує завершені уроки.</p></aside></div>`;
    }
    sessionHtml(s){
      const l=s.lesson,b=C.BLOCKS[s.blockIndex];
      return `<div class="ed-lesson-heading"><div><span class="ed-eyebrow">ТИЖДЕНЬ ${l.week} · ${l.type==='lesson'?'КОНЦЕПТ':l.type==='simulation'?'СИМУЛЯЦІЯ':'ЗАКРІПЛЕННЯ'} · ${esc(l.level)}</span><h2>${esc(l.title)}</h2><p>${esc(l.mission)}</p></div><div class="ed-session-tools"><strong id="ed-timer"></strong>${button('pause',s.paused?'▶ Продовжити':'Ⅱ Зберегти та пауза')}</div></div>
      <div id="ed-time-note" class="ed-notice" hidden></div>
      <div class="ed-route" aria-label="Блоки уроку">${C.BLOCKS.map((item,i)=>`<div class="${i===s.blockIndex?'current':i<s.blockIndex?'complete':''}" ${i===s.blockIndex?'aria-current="step"':''}><span>${i<s.blockIndex?'✓':i+1}</span><strong>${esc(item.title)}</strong><small>${item.minutes} хв</small></div>`).join('')}</div>
      ${s.paused?'<div class="ed-card ed-pause"><h3>Урок на паузі</h3><p>Відповіді збережено. Натисни «Продовжити», коли будеш готовий.</p></div>':`<div class="ed-workspace"><article class="ed-card ed-active-block"><div class="ed-block-title"><span class="ed-eyebrow">БЛОК ${s.blockIndex+1} / 8 · ${b.minutes} ХВ</span><h3>${esc(b.title)}</h3></div>${this.blockHtml(b.id,s)}</article><aside class="ed-card ed-coach"><span class="ed-eyebrow">TODAY’S TOOLKIT</span><h3>Поясни своїми словами</h3><p>${esc(l.concept.explanation)}</p><details><summary>Технічна підказка</summary><p>${esc(l.concept.caveat)}</p>${l.speaking.code?`<pre><code>${esc(l.speaking.code)}</code></pre>`:''}</details>${s.support!=='light'?`<ul>${l.speaking.phrases.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:'<p class="ed-muted">Спробуй спочатку без мовних опор.</p>'}${this.deepDive(l)}<p class="ed-muted">Не знаєш концепт? Прочитай пояснення. Це не мовна помилка.</p></aside></div>`}
      <footer class="ed-footer">${button('previous','← Попередній блок',s.blockIndex===0||s.paused?'disabled':'')}<span id="ed-footer-status">${s.paused?'Пауза':this.engine.requirements()?'Готово до наступного кроку':'Виконай завдання й перевір відповіді'}</span>${button(s.blockIndex===7?'finish':'next',s.blockIndex===7?'Завершити урок ✓':'Наступний блок →',`id="ed-next" ${s.paused||!this.engine.requirements()?'disabled':''}`,true)}</footer>`;
    }
    deepDive(l){const scenario=C.getScenario(l,window.IT_CODE_SCENARIOS||[]);if(!scenario)return'';
      return `<details><summary>Код і deep dive · бібліотека</summary><p>${esc(scenario.problemExplanation)}</p><h4>До</h4><pre><code>${esc(scenario.beforeCode)}</code></pre><h4>Після</h4><pre><code>${esc(scenario.afterCode)}</code></pre><p>${esc(scenario.solutionExplanation)}</p>${scenario.deepDive?`<p>${esc(scenario.deepDive.mechanics||scenario.deepDive.explanation||'')}</p>`:''}<p class="ed-muted">Додаткова технічна довідка. Можна пояснювати концепт простішими словами.</p></details>`;
    }
    textField(key,label,{placeholder='',voice=false,rows=3}={}){
      const s=this.engine.current(),source=s.sources[key],hasVoice=source==='voice'||source==='voice-edited';
      return `<div class="ed-field"><label for="ed-${esc(key)}">${esc(label)}</label><textarea id="ed-${esc(key)}" data-answer="${esc(key)}" data-voice="${hasVoice}" rows="${rows}" maxlength="12000" placeholder="${esc(placeholder)}">${esc(s.answers[key]||'')}</textarea>${voice?`<div class="ed-inline">${button('record',this.recording?.key===key?'■ Завершити запис':'🎙 Записати',`data-key="${esc(key)}"`)}${button('play-question','🔊 Питання',`data-key="${esc(key)}"`)}<small>${source==='voice'?'Голос → транскрипція':source==='voice-edited'?'Голос → відредагований текст':'Введений текст · письмова відповідь'}</small></div><div data-audio="${esc(key)}"></div>`:''}<span class="ed-field-status" data-result-for="${esc(key)}"></span></div>`;
    }
    result(key,explanation){const r=this.engine.current().results[key];return r?`<p class="ed-result ${r.correct?'correct':'incorrect'}">${r.correct?(r.assisted?'✓ Відпрацьовано з допомогою':'✓ Самостійно'):'Спробуй ще раз'}${explanation?` · ${esc(explanation)}`:''}</p>`:'';}
    choices(key,q){const s=this.engine.current();return `<fieldset class="ed-question"><legend>${esc(q.prompt)}</legend>${q.options.map((option,i)=>`<label class="ed-option"><input type="radio" name="${esc(key)}" data-answer="${esc(key)}" value="${i}" ${String(s.answers[key])===String(i)?'checked':''}><span>${esc(option)}</span></label>`).join('')}${button('check-choice','Перевірити',`data-key="${key}"`)}${this.result(key,s.results[key]?.correct?q.explanation:'Зістав відповідь зі змістом і спробуй ще раз.')}${s.results[key]&&!s.results[key].correct?button('hint','Показати підказку',`data-key="${key}"`):''}${s.revealed[key]?`<p class="ed-hint">${esc(q.options[q.correct])} · ${esc(q.explanation)}</p>`:''}</fieldset>`;}
    selfCheck(key,label){return `<label class="ed-check"><input type="checkbox" data-answer="${esc(key)}" ${this.engine.current().results[key]?.correct?'checked':''}> ${esc(label)}</label>`;}
    blockHtml(block,s){
      const l=s.lesson;
      if(block==='review')return `<p class="ed-muted">Твоя домашка вже тут. Спочатку згадай без підказки. До 8 завдань / 8 хвилин; решта черги почекає.</p>${s.reviews.map((item,i)=>{
        const key=`review-${i}`,open=['diagnostic','transfer','correction','grammar'].includes(item.kind);
        return `<div class="ed-exercise">${this.textField(key,item.prompt)}${!open?button('check-review','Перевірити',`data-index="${i}"`):''}${button('reveal-review','Порівняти з прикладом',`data-index="${i}"`)}${s.revealed[key]?`<div class="ed-hint"><p>${esc(item.answer)}</p><small>${esc(item.explanation)}</small></div>${button('self-review','Згадав самостійно',`data-index="${i}" data-clean="true"`)}${button('self-review','Потрібна допомога',`data-index="${i}" data-clean="false"`)}`:''}${this.result(key)}</div>`;
      }).join('')}`;
      if(block==='vocabulary')return `<p class="ed-muted">${l.newVocabulary?'Шість фраз для сьогоднішньої ситуації.':'Сьогодні використовуємо слова тижня; нових обов’язкових слів немає.'} Прослухай, пригадай, потім застосуй у власному реченні.</p>${l.vocabulary.map((v,i)=>{
        const key=`vocab-${i}`;return `<div class="ed-exercise"><div class="ed-inline"><h4>${esc(v.uk)}</h4>${button('speak-word','🔊',`data-index="${i}" aria-label="Прослухати слово"`)}</div>${this.textField(key,'Англійське слово або фраза',{rows:1})}${button('check-vocab','Перевірити',`data-index="${i}"`)}${button('hint','Відкрити картку',`data-key="${key}"`)}${s.revealed[key]?`<div class="ed-hint"><strong>${esc(v.en)}</strong><p>${esc(v.example)}</p></div>`:''}${this.result(key)}</div>`;
      }).join('')}${this.textField('vocab-example','Власний приклад із двома сьогоднішніми фразами',{placeholder:'In our project, we…'})}${this.selfCheck('vocab-example','Перевірив значення й використав щонайменше дві фрази у власному контексті.')}`;
      if(block==='reading')return `<div class="ed-reading">${l.reading.text.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}</div>${l.reading.questions.map((q,i)=>this.choices(`reading-${i}`,q)).join('')}${this.textField('retell',l.reading.retell)}${this.selfCheck('retell','Переказав проблему, дію й обмеження своїми словами.')}`;
      if(block==='listening')return `<p>1. Послухай загальну думку. 2. Послухай деталі. 3. Перевір себе за транскриптом.</p><div class="ed-audio-panel"><strong>${s.listens>=2?'Два прослуховування завершено':s.listens===1?'Тепер слухай деталі':'Спробуй без тексту'}</strong>${button('listen',s.listens===0?'▶ Слухати: головна думка':'▶ Слухати ще раз','',true)}${button('stop-speech','■ Зупинити')}${button('transcript','Транскрипт',s.listens<2&&!s.listeningUnavailable?'disabled':'')}</div>${button('audio-unavailable','Не можу прослухати зараз')}${s.listeningUnavailable?'<p class="ed-hint">Цей блок пройдено як читання транскрипту. Listening не зараховується як перевірена навичка.</p>':''}${s.transcriptVisible?`<div class="ed-dialogue">${l.listening.dialogue.map(turn=>`<p><strong>${esc(turn.speaker)}:</strong> ${esc(turn.text)}</p>`).join('')}</div>`:''}${l.listening.questions.map((q,i)=>this.choices(`listening-${i}`,q)).join('')}`;
      if(block==='grammar')return `<h4>${esc(l.grammar.title)}</h4><p class="ed-hint">${esc(l.grammar.explanation)}</p>${l.grammar.exercises.map((q,i)=>this.choices(`grammar-${i}`,q)).join('')}`;
      if(block==='speaking')return `<p>${esc(l.speaking.prompt)}</p><ol class="ed-outline">${l.speaking.outline.map(line=>`<li>${esc(line)}</li>`).join('')}</ol><p class="ed-muted">60–120 секунд пояснення → три уточнення → дві поправки → нова спроба. Короткі змістовні репліки дозволені.</p>
        ${this.textField('monologue','1. Поясни концепт або код',{voice:true,rows:5})}
        <h4>2. Розмова з ${esc(l.speaking.role)}</h4>${l.speaking.questions.map((q,i)=>`${this.textField(`turn-${i}`,`${i+1}. ${s.dialogueQuestions?.[i]||q}`,{voice:true})}${i>0?button('ai-question','Уточнення AI за моєю відповіддю',`data-index="${i}" ${this.waiting?'disabled':''}`):''}`).join('')}
        <details><summary>Четверте запитання · за бажанням</summary>${this.textField('turn-3',l.speaking.optionalQuestion,{voice:true})}</details>
        <h4>3. Розбір і дві головні поправки</h4><div class="ed-inline">${button('evaluate','Розбір AI',`data-area="speaking"`)}${button('self-feedback','Самоперевірка',`data-area="speaking"`)}</div>${this.feedbackHtml(s.feedback.speaking)}
        <details><summary>Приклад пояснення · спочатку спробуй сам</summary><p>${esc(l.speaking.model)}</p>${button('speak-model','🔊 Прослухати приклад')}</details>
        ${this.textField('correction-original','Моя головна помилка або невдалий фрагмент',{rows:1})}${this.textField('correction-improved','Як сказати краще',{rows:1})}<p class="ed-muted">Ця поправка потрапить у наступне повторення. Якщо помилок немає — залиш поля порожніми.</p>
        <h4>4. Повтори після розбору</h4>${this.textField('retry',l.speaking.retry,{voice:true,rows:4})}${this.selfCheck('speaking-reflection','Порівняв спроби: пояснив ідею, відповів на уточнення та врахував поправки.')}`;
      if(block==='writing')return `<p>${esc(l.writing.prompt)}</p><p class="ed-muted">Орієнтир: ${esc(l.writing.targetWords)} слів. Зміст важливіший за кількість.</p>${this.textField('writing','Твій текст',{rows:7})}<div class="ed-inline">${button('evaluate','Розбір AI',`data-area="writing"`)}${button('self-feedback','Самоперевірка',`data-area="writing"`)}</div>${this.feedbackHtml(s.feedback.writing)}<details><summary>Приклад для порівняння</summary><p>${esc(l.writing.model)}</p></details>${l.writing.checklist.map((text,i)=>this.selfCheck(`writing-check-${i}`,text)).join('')}`;
      return this.summaryHtml(s);
    }
    feedbackHtml(f){if(!f)return'';return `<div class="ed-feedback"><span class="ed-eyebrow">${f.source==='ai'?'AI · ОЦІНКА ЦІЄЇ ВІДПОВІДІ':'САМОПЕРЕВІРКА · БЕЗ АВТОМАТИЧНОЇ ОЦІНКИ'}</span><p>${esc(f.summary)}</p>${(f.strengths||[]).map(t=>`<p>✓ ${esc(t)}</p>`).join('')}${(f.corrections||[]).map(c=>`<div class="ed-correction"><del>${esc(c.original)}</del><strong>${esc(c.improved)}</strong><small>${esc(c.explanation)}</small></div>`).join('')}${f.rewrite?`<p><strong>Можливе формулювання:</strong> ${esc(f.rewrite)}</p>`:''}${f.skills?`<div class="ed-skills">${Object.entries(SKILLS).map(([key,label])=>`<span>${label}: ${f.skills[key]===null||f.skills[key]===undefined?'немає даних':`${f.skills[key]}/4`}</span>`).join('')}</div>`:''}<small>За текстом не оцінюємо вимову й темп. Це не сертифікація рівня.</small></div>`;}
    summaryHtml(s){
      const corrections=[...(s.feedback.speaking?.corrections||[]),...(s.feedback.writing?.corrections||[])].slice(0,2);
      return `<h4>Сьогодні ти пояснив ${esc(s.lesson.title.toLowerCase())}</h4><div class="ed-summary-grid"><div><strong>${wordCount(s.answers.monologue)+wordCount(s.answers.retry)}</strong><span>слів у двох поясненнях</span></div><div><strong>${wordCount(s.answers.writing)}</strong><span>слів у письмовій відповіді</span></div><div><strong>${s.lesson.vocabulary.length}</strong><span>фраз у практиці</span></div></div>
      ${this.feedbackHtml(s.feedback.speaking)}${corrections.length?`<h4>Дві головні поправки</h4>${corrections.map(c=>`<p>${esc(c.original)} → <strong>${esc(c.improved)}</strong></p>`).join('')}`:'<p>Виділи одну фразу, яку хочеш сказати впевненіше наступного разу.</p>'}
      <h4>На повторення</h4><p>Слова уроку, конструкції з підказками та твої поправки. Наступного разу — інший приклад із пам’яті.</p>
      <details><summary>Мої відповіді цього уроку</summary>${['monologue','retry','writing'].map(key=>`<h4>${key==='monologue'?'Перша спроба':key==='retry'?'Повторна спроба':'Письмо'}</h4><p class="ed-preserve">${esc(s.answers[key])}</p>`).join('')}</details><p class="ed-muted">${s.status==='completed'?'Результат збережено.':'Завершення збереже результат і додасть 100 XP один раз.'} Окремого ДЗ немає.</p>`;
    }
    question(key){const s=this.engine.current(),[type,index]=key.split('-');if(type==='reading'||type==='listening')return s.lesson[type].questions[Number(index)];if(type==='grammar')return s.lesson.grammar.exercises[Number(index)];return null;}
    async dispatch(action,b){
      if(this.sync?.readonly&&!['export','history','settings','play-question','speak-word','speak-model'].includes(action))throw new Error('Урок зараз відкрито в іншому вікні.');if(this.waiting&&action!=='stop-speech')return;
      const s=this.engine.current(),key=b.dataset.key,index=Number(b.dataset.index);
      if(s?.paused&&!['pause','export','import','settings','history'].includes(action))return;
      this.notice='';
      switch(action){
        case 'start':this.engine.start();break;
        case 'next':case 'previous':this.stopSpeech();this.stopRecording();action==='next'?this.engine.advance():this.engine.previous();break;
        case 'pause':this.stopSpeech();this.stopRecording();this.engine.pause(!s.paused);break;
        case 'finish':{
          if(s.answers['correction-original']?.trim()&&s.answers['correction-improved']?.trim())s.feedback.speaking.corrections=[...(s.feedback.speaking.corrections||[]),{original:s.answers['correction-original'],improved:s.answers['correction-improved'],explanation:'Власна поправка після самоперевірки.'}].slice(-2);
          this.engine.finish();window.app?.updateStatsBar();this.message('Урок завершено. +100 XP. Наступний урок — наступного дня.');break;
        }
        case 'check-choice':this.engine.checkChoice(key,this.question(key));break;
        case 'check-vocab':this.engine.checkText(`vocab-${index}`,s.lesson.vocabulary[index].en);break;
        case 'check-review':this.engine.checkText(`review-${index}`,s.reviews[index].answer);break;
        case 'reveal-review':{
          const k=`review-${index}`;if(!s.answers[k]?.trim())throw new Error('Спочатку спробуй відповісти з пам’яті.');
          s.reviewBeforeReveal||={};s.reviewBeforeReveal[k]=!s.revealed[k];this.engine.reveal(k);break;
        }
        case 'self-review':{
          const k=`review-${index}`;if(!s.answers[k]?.trim())throw new Error('Додай власну відповідь.');
          // Open production is explicitly self-reported. Remembering after a hint
          // cannot create independent mastery; only delayed retrieval can.
          const clean=b.dataset.clean==='true'&&s.reviewBeforeReveal?.[k]&&!s.attempts.some(a=>a.key===k);
          const original=s.revealed[k];s.revealed[k]=!clean;this.engine.grade(k,true,{assisted:!clean,selfReported:true});s.revealed[k]=original;this.persist();break;
        }
        case 'hint':this.engine.reveal(key);break;
        case 'speak-word':this.speak(s.lesson.vocabulary[index].en);return;
        case 'speak-model':this.speak(s.lesson.speaking.model);return;
        case 'listen':await this.listen(s);return;
        case 'stop-speech':this.stopSpeech();return;
        case 'transcript':s.transcriptVisible=true;this.persist();break;
        case 'audio-unavailable':s.listeningUnavailable=true;s.transcriptVisible=true;this.persist();break;
        case 'record':await this.record(key);return;
        case 'play-question':this.speak(this.promptFor(key));return;
        case 'evaluate':await this.evaluate(b.dataset.area);return;
        case 'self-feedback':{
          const area=b.dataset.area;if(!s.answers[area==='speaking'?'monologue':'writing']?.trim())throw new Error('Спочатку додай власну відповідь.');
          s.feedback[area]={source:'self',summary:'Порівняй свою відповідь із прикладом: чи зрозуміла основна думка, є причина та конкретний наступний крок? Виправ дві найважливіші речі й спробуй ще раз.',corrections:[],rewrite:'',skills:null};this.persist();break;
        }
        case 'ai-question':await this.aiQuestion(index);return;
        case 'migrate-audio':await this.sync?.migrateAudio();return;
        case 'export':this.download(this.engine.exportProgress(),`english-daily-${E.localDay()}.json`);return;
        case 'import':this.importInput.click();return;
        case 'settings':this.openSettings();return;
        case 'history':this.showHistory();return;
        default:return;
      }
      this.render();if(['start','next','previous'].includes(action))this.root.scrollIntoView({behavior:'smooth',block:'start'});
    }
    promptFor(key){const s=this.engine.current();if(key==='monologue')return s.lesson.speaking.prompt;if(key==='retry')return s.lesson.speaking.retry;const i=Number(key.split('-')[1]);return s.dialogueQuestions?.[i]||s.lesson.speaking.questions[i]||s.lesson.speaking.optionalQuestion;}
    speak(text){
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){this.message('Озвучення недоступне. Можна працювати з транскриптом.');return;}
      this.stopSpeech();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=0.9;
      const preferred=window.sound?.maleVoice;if(preferred)u.voice=preferred;speechSynthesis.speak(u);
    }
    stopSpeech(){this.listenToken=null;window.speechSynthesis?.cancel();}
    async listen(session){
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){this.message('Озвучення недоступне. Обери «Не можу прослухати зараз».');return;}
      this.stopSpeech();const token={};this.listenToken=token;
      const turns=session.lesson.listening.dialogue;this.message('Слухай діалог. Зарахуємо прослуховування після завершення.');
      const read=i=>{
        if(this.listenToken!==token||this.engine.current()?.id!==session.id)return;
        if(i===turns.length){session.listens++;this.persist();this.message('Прослуховування завершено.');this.render();return;}
        const u=new SpeechSynthesisUtterance(turns[i].text);u.lang='en-US';u.rate=session.lesson.week<4?0.84:0.95;
        const voices=speechSynthesis.getVoices().filter(v=>v.lang.startsWith('en'));if(voices.length)u.voice=voices[i%Math.min(2,voices.length)];
        u.onend=()=>read(i+1);u.onerror=()=>{if(this.listenToken===token)this.message('Аудіо перервано. Спробуй знову або скористайся транскриптом.');};speechSynthesis.speak(u);
      };read(0);
    }
    async busy(work){this.waiting=true;this.render();try{return await work();}finally{this.waiting=false;this.render();}}
    async evaluate(area){
      const s=this.engine.current(),isSpeaking=area==='speaking',text=s.answers[isSpeaking?'monologue':'writing'];
      if(!text?.trim())throw new Error('Спочатку додай відповідь.');
      const turns=isSpeaking?s.lesson.speaking.questions.map((q,i)=>({question:s.dialogueQuestions?.[i]||q,answer:s.answers[`turn-${i}`]||''})):[];
      try{await this.busy(async()=>{const feedback=await this.ai.evaluate(area,isSpeaking?s.lesson.speaking.prompt:s.lesson.writing.prompt,text,turns,s.sources[isSpeaking?'monologue':'writing']||'typed');if(this.engine.current()?.id===s.id){s.feedback[area]=feedback;this.persist();}});}catch(error){this.message(error.message+' Натисни «Самоперевірка», щоб продовжити.');}
    }
    async aiQuestion(index){
      const s=this.engine.current();if(!s.answers[index===0?'monologue':`turn-${index-1}`]?.trim())throw new Error('Спочатку відповідай на попереднє запитання.');
      try{await this.busy(async()=>{const turns=[{question:s.lesson.speaking.prompt,answer:s.answers.monologue},...s.lesson.speaking.questions.slice(0,index).map((q,i)=>({question:s.dialogueQuestions?.[i]||q,answer:s.answers[`turn-${i}`]||''}))];const r=await this.ai.nextTurn(s.lesson.concept.explanation,s.lesson.speaking.role,turns);if(this.engine.current()?.id===s.id){s.dialogueQuestions||={};s.dialogueQuestions[index]=r.question;this.persist();}});}catch(error){this.message(error.message+' Готове уточнення залишається доступним.');}
    }
    async audioDb(){if(!window.indexedDB)return null;if(!this.db)this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('english-daily-audio',1);r.onupgradeneeded=()=>r.result.createObjectStore('clips');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return this.db;}
    async saveClip(id,blob){try{const db=await this.audioDb();if(!db)return;await new Promise((resolve,reject)=>{const tx=db.transaction('clips','readwrite');tx.objectStore('clips').put(blob,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});await this.sync?.uploadClip(id,blob);}catch{this.message('Аудіо доступне до закриття сторінки; текст зберігається автоматично.');}}
    async restoreAudio(){
      const session=this.engine.current();if(!session)return;
      for(const box of this.root.querySelectorAll('[data-audio]')){
        const id=session.id+':'+box.dataset.audio;let url=this.audioUrls.get(id);
        if(!url)try{const db=await this.audioDb();if(db){const blob=await new Promise(resolve=>{const r=db.transaction('clips').objectStore('clips').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);});if(blob){url=URL.createObjectURL(blob);this.audioUrls.set(id,url);}}}catch{}
        if(!url)try{const blob=await this.sync?.downloadClip(id);if(blob){url=URL.createObjectURL(blob);this.audioUrls.set(id,url);}}catch{}
        if(url&&box.isConnected){box.innerHTML='';const player=document.createElement('audio');player.controls=true;player.src=url;player.preload='metadata';box.append(player);}
      }
    }
    async record(key){
      if(this.recording){this.stopRecording();return;}
      if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('Мікрофон недоступний. Запусти start.bat або введи відповідь вручну.');
      const s=this.engine.current();let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true});}catch{throw new Error('Доступ до мікрофона не надано. Можна продовжити письмово.');}
      if(this.engine.current()?.id!==s.id){stream.getTracks().forEach(t=>t.stop());return;}
      this.stopSpeech();const mime=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t));
      const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined),chunks=[];
      const rec={recorder,stream,key,sessionId:s.id};this.recording=rec;
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      recorder.onerror=()=>{this.stopRecording();this.message('Запис не вдався. Можна ввести відповідь вручну.');};
      recorder.onstop=async()=>{
        clearTimeout(rec.timeout);stream.getTracks().forEach(t=>t.stop());if(this.recording===rec)this.recording=null;
        const blob=new Blob(chunks,{type:recorder.mimeType||mime||'audio/webm'}),id=s.id+':'+key;
        const old=this.audioUrls.get(id);if(old)URL.revokeObjectURL(old);this.audioUrls.set(id,URL.createObjectURL(blob));await this.saveClip(id,blob);
        if(this.engine.current()?.id!==s.id)return;
        this.render();
        if(!this.ai.settings.transcription){this.message('Запис збережено локально. Прослухай його та введи текст або додай Groq у налаштуваннях.');return;}
        try{await this.busy(async()=>{const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});const r=await this.ai.transcribe(base64,blob.type);if(this.engine.current()?.id===s.id)this.engine.setAnswer(key,r.text,'voice');});this.message('Транскрипція готова. Перевір, чи голос розпізнано правильно.');}catch(error){this.message(error.message+' Локальний запис збережено.');}
      };
      recorder.start(250);rec.timeout=setTimeout(()=>this.stopRecording(),180000);this.render();this.message('Записую. Натисни ■ для завершення. Максимум 3 хвилини на репліку.');
    }
    stopRecording(){const rec=this.recording;if(!rec)return;clearTimeout(rec.timeout);if(rec.recorder.state!=='inactive')rec.recorder.stop();rec.stream.getTracks().forEach(t=>t.stop());this.recording=null;}
    download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    async importFile(){const file=this.importInput.files[0];if(!file)return;try{if(file.size>20000000)throw new Error('Файл перевищує 20 МБ.');const content=await file.text();E.validateImport(JSON.parse(content).state);this.download(this.engine.exportProgress(),`english-daily-before-import-${E.localDay()}.json`);this.stopRecording();this.engine.importProgress(content);if(window.appStorage)window.appStorage.state=window.appStorage.loadState();window.app?.updateStatsBar();this.message('Імпортовано. Попередній стан завантажено окремим файлом.');this.render();}catch(error){this.message('Імпорт не виконано: '+error.message);}finally{this.importInput.value='';}}
    showHistory(){
      const dialog=document.getElementById('daily-history');
      document.getElementById('daily-history-content').innerHTML=this.progressHtml()+this.engine.state.sessions.slice().reverse().map(s=>`<details><summary>${esc(s.lesson.title)} · ${esc(s.dayKey)} · ${Math.round(s.activeMs/60000)} хв</summary>${this.summaryHtml(s)}${this.feedbackHtml(s.feedback.writing)}<p>${s.listeningUnavailable?'Listening: використано транскрипт':'Listening: два прослуховування'}</p></details>`).join('');
      dialog.showModal();
    }
    progressHtml(){
      const sessions=this.engine.state.sessions,checkpoints=sessions.filter(s=>s.lesson.type==='checkpoint');
      const independent=sessions.flatMap(s=>s.attempts).filter(a=>a.correct&&!a.assisted&&!a.selfReported).length;
      const cells=Object.entries(SKILLS).map(([key,label])=>{
        const measured=checkpoints.filter(s=>s.feedback.speaking?.source==='ai'&&Number.isInteger(s.feedback.speaking.skills?.[key]));
        return `<tr><th scope="row">${label}</th><td>${measured.length?measured[0].feedback.speaking.skills[key]+'/4':'—'}</td><td>${measured.length?measured.at(-1).feedback.speaking.skills[key]+'/4':'—'}</td></tr>`;
      }).join('');
      return `<div class="ed-card"><h3>Навички в нових ситуаціях</h3><p>${checkpoints.length} тижневих перевірок · ${independent} правильних самостійних відповідей у вправах.</p><table class="ed-progress-table"><thead><tr><th>Спікінг · задача 0–4</th><th>Перша перевірка</th><th>Остання перевірка</th></tr></thead><tbody>${cells}</tbody></table><p class="ed-muted">Показники з’являються після розбору AI у checkpoint. Самоперевірка зберігається окремо; відсутність даних не означає нуль. Оцінки різних задач — орієнтир для практики, не сертифікат B2.</p></div>`;
    }
    bindSettings(){
      const dialog=document.getElementById('daily-settings');
      dialog.querySelector('[data-close]').onclick=()=>dialog.close();document.getElementById('daily-history').querySelector('[data-close]').onclick=()=>document.getElementById('daily-history').close();
      const select=document.getElementById('daily-provider');select.onchange=()=>{document.getElementById('daily-api-key').value='';const m=document.getElementById('daily-model');m.replaceChildren(new Option(this.ai.settings.defaults?.[select.value]||(select.value==='groq'?'openai/gpt-oss-20b':'gemini-3.5-flash-lite')));};
      const run=async(work)=>{const status=document.getElementById('daily-settings-status');status.textContent='Перевіряю…';const buttons=dialog.querySelectorAll('button:not([data-close])');buttons.forEach(b=>b.disabled=true);try{await work();}catch(error){status.textContent=error.message;}finally{buttons.forEach(b=>b.disabled=false);}};
      document.getElementById('daily-load-models').onclick=()=>run(async()=>{const result=await this.ai.models({provider:select.value,key:document.getElementById('daily-api-key').value.trim()});const m=document.getElementById('daily-model');m.replaceChildren(...result.models.map(id=>new Option(id,id)));if(result.models.includes(result.default))m.value=result.default;statusText('Список доступних моделей оновлено.');});
      const statusText=text=>{document.getElementById('daily-settings-status').textContent=text;};
      document.getElementById('daily-save-settings').onclick=()=>run(async()=>{await this.ai.configure({provider:select.value,key:document.getElementById('daily-api-key').value.trim(),model:document.getElementById('daily-model').value});document.getElementById('daily-api-key').value='';statusText('Ключ перевірено й збережено на локальному сервері.');this.updateProviderLabel();window.app?.updateAIMentorStatusLabel();});
      document.getElementById('daily-remove-key').onclick=()=>run(async()=>{await this.ai.configure({provider:select.value,remove:true});document.getElementById('daily-api-key').value='';statusText('Ключ цього провайдера видалено.');this.updateProviderLabel();});
      dialog.addEventListener('close',()=>{document.getElementById('daily-api-key').value='';});
    }
    openSettings(){const dialog=document.getElementById('daily-settings'),p=document.getElementById('daily-provider');p.value=this.ai.settings.provider||'groq';document.getElementById('daily-api-key').value='';const m=document.getElementById('daily-model');const current=this.ai.settings.model||(p.value==='groq'?'openai/gpt-oss-20b':'gemini-3.5-flash-lite');m.replaceChildren(new Option(current,current));document.getElementById('daily-settings-status').textContent=this.ai.settings.configured?'Ключ підключено. Значення ключа не повертається в браузер.':'Додай новий ключ або продовжуй із готовими сценаріями.';dialog.showModal();}
    patchLibrary(){
      // Retain every library trainer, route all legacy AI through the same gateway.
      const app=window.app;if(!app)return;
      const switchTab=app.switchTab.bind(app);app.switchTab=(name,persist=true)=>{if(name!=='daily'){this.stopSpeech();this.stopRecording();this.persist();}return switchTab(name,persist);};
      app.renderAIResultsCard=(container,evaluation)=>{container.style.display='block';container.innerHTML=this.feedbackHtml(evaluation.feedback||evaluation);};
      app.updateStatsBar=()=>{document.getElementById('stat-streak-display').textContent=`${this.engine.streak()} дн.`;document.getElementById('stat-xp-display').textContent=`${this.engine.state.xp+(window.appStorage.state.xp||0)} XP`;document.getElementById('stat-rank-display').textContent='IT English · practice';};app.updateStatsBar();
      app.submitSentenceToAIMentor=async()=>{const input=document.getElementById('ai-user-sentence-input'),container=document.getElementById('ai-sentence-results');if(!input.value.trim())return;try{app.renderAIResultsCard(container,await window.aiMentor.evaluateSentence(input.value,app.currentTargetWord?.word||''));}catch(error){this.message(error.message);container.textContent=error.message;container.style.display='block';}};
      app.evaluateSpokenText=async()=>{const input=document.getElementById('speaking-transcript-display'),container=document.getElementById('ai-speaking-results');if(!input.value.trim())return;try{app.renderAIResultsCard(container,await window.aiMentor.evaluateSpeaking(input.value,app.activeTopic?.topic||''));}catch(error){container.textContent=error.message;container.style.display='block';}};
      app.updateSpeakingStats=()=>{const n=document.getElementById('counter-words-badge');if(n)n.textContent=`${wordCount(document.getElementById('speaking-transcript-display')?.value)} слів`;const hint=document.getElementById('counter-hint-text');if(hint)hint.textContent='Коротка змістовна відповідь дозволена. Для пояснення спробуй 60–120 секунд.';};app.updateSpeakingStats();
    }
  }
  // Patch before the legacy DOMContentLoaded constructor runs.
  if(typeof LinguoApp!=='undefined'){
    LinguoApp.prototype.openApiKeyModal=function(){window.dailyApp?.openSettings();};
    LinguoApp.prototype.initApiKeyModal=function(){document.getElementById('btn-open-api-modal')?.addEventListener('click',()=>this.openApiKeyModal());};
    LinguoApp.prototype.updateAIMentorStatusLabel=function(){for(const id of ['ai-mentor-engine-status','speaking-engine-badge']){const n=document.getElementById(id);if(n)n.textContent=window.dailyAI?.settings.configured?'AI через локальний сервер · оцінка відповіді':'Готові сценарії · автоматичний розбір не підключено';}};
  }
  window.addEventListener('DOMContentLoaded',async()=>{await window.EnglishRecallSync?.prepare();window.dailyApp=new DailyApp();});
})();
