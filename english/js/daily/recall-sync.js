(function(){
  'use strict';
  const E=EnglishDailyEngine,owner=sessionStorage.getItem('recall-english-owner')||'browser-'+crypto.randomUUID();sessionStorage.setItem('recall-english-owner',owner);
  const Sync={revision:Number(sessionStorage.getItem('recall-english-revision')||0),readonly:false,available:false,busy:false,pending:null,last:'',app:null};
  async function request(route,body){const response=await fetch('/api/recall/'+route,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify({...body,owner}):undefined,signal:AbortSignal.timeout(5000)});const data=await response.json();if(!response.ok){const error=new Error(data.message||'Помилка синхронізації.');error.status=response.status;throw error;}return data;}
  const hasWork=s=>!!s&&(s.sessions?.length||s.activeSession||Object.keys(s.legacy?.learnedWords||{}).length||s.familiarWords?.length);
  function keepBackup(raw){if(raw)localStorage.setItem('english_daily_before_recall_'+Date.now(),raw);}
  Sync.prepare=async()=>{
    if(!/^https?:$/.test(location.protocol))return;
    try{const previousRevision=Sync.revision;let saved=await request('state');Sync.available=true;Sync.revision=saved.revision;Sync.readonly=!!saved.owner&&saved.owner!==owner;const raw=localStorage.getItem(E.STORAGE_KEY);let local;try{local=raw?E.validateImport(JSON.parse(raw)):E.defaultState(JSON.parse(localStorage.getItem('linguo_app_state_v3')||'{}'));}catch{keepBackup(raw);}
      if(local){try{const legacy=E.defaultState(JSON.parse(localStorage.getItem('linguo_app_state_v3')||'{}'));local.legacy={...local.legacy,...legacy.legacy};local.familiarWords=[...new Map([...local.familiarWords,...legacy.familiarWords].map(w=>[w.id,w])).values()];}catch{}}
      if(local&&(hasWork(local)||saved.revision===0)&&JSON.stringify(local)!==JSON.stringify(saved.course)){keepBackup(raw);if(!Sync.readonly){saved=await request('state',{revision:Sync.revision,course:local,import:saved.revision===0||previousRevision!==saved.revision||!!saved.owner&&saved.owner!==owner});Sync.revision=saved.revision;}}
      if(saved.course){E.validateImport(saved.course);localStorage.setItem(E.STORAGE_KEY,JSON.stringify(saved.course));Sync.last=JSON.stringify(saved.course);sessionStorage.setItem('recall-english-revision',String(Sync.revision));}
    }catch(error){Sync.available=false;Sync.initialError='Працюємо з браузерним збереженням: '+error.message;}
  };
  Sync.attach=app=>{
    Sync.app=app;window.installRecallEnglishUI?.(app);const original=app.engine.adapter;
    app.engine.adapter={getItem:key=>original.getItem(key),setItem:(key,value)=>{original.setItem(key,value);if(key===E.STORAGE_KEY&&Sync.available&&!Sync.readonly){Sync.pending=value;clearTimeout(Sync.timer);Sync.timer=setTimeout(Sync.flush,400);}}};
    if(Sync.initialError)app.message(Sync.initialError);
    setInterval(async()=>{if(!Sync.available)return;try{if(Sync.readonly){const state=await request('state');if(!state.readonly||state.owner===owner){Sync.readonly=false;Sync.revision=state.revision;sessionStorage.setItem('recall-english-revision',String(Sync.revision));localStorage.setItem(E.STORAGE_KEY,JSON.stringify(state.course));app.engine=new E.Engine(app.engine.adapter);app.render();}else if(state.revision!==Sync.revision){Sync.revision=state.revision;localStorage.setItem(E.STORAGE_KEY,JSON.stringify(state.course));app.engine=new E.Engine(app.engine.adapter);app.render();}}else if(app.engine.current()&&!app.engine.current().paused&&!document.hidden&&document.hasFocus())await request('heartbeat',{});}catch(error){if(error.status===409){Sync.readonly=true;app.render();}}},10000);
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&Sync.available)void Sync.release().catch(()=>{});});
    window.addEventListener('pagehide',()=>{if(Sync.available)fetch('/api/recall/release',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner}),keepalive:true}).catch(()=>{});});
  };
  Sync.flush=()=>{if(Sync.busy)return Sync.flushing;if(Sync.readonly||!Sync.pending||Sync.pending===Sync.last)return Promise.resolve();Sync.busy=true;const text=Sync.pending;
    Sync.flushing=(async()=>{try{const result=await request('state',{revision:Sync.revision,course:JSON.parse(text)});Sync.revision=result.revision;sessionStorage.setItem('recall-english-revision',String(Sync.revision));Sync.last=text;}
      catch(error){if(error.status===409){keepBackup(text);Sync.readonly=true;Sync.app?.message('Урок відкрито в Recall або іншій вкладці. Локальну чернетку збережено окремо.');Sync.app?.render();}else Sync.app?.message('Дискове збереження тимчасово недоступне; браузерна копія збережена.');}
      finally{Sync.busy=false;if(Sync.pending!==Sync.last&&!Sync.readonly){clearTimeout(Sync.timer);Sync.timer=setTimeout(Sync.flush,3000);}}
    })();return Sync.flushing;
  };
  Sync.release=async()=>{if(!Sync.available)return;clearTimeout(Sync.timer);await Sync.flush();if(Sync.pending!==Sync.last&&!Sync.readonly)await Sync.flush();await request('release',{});};
  window.addEventListener('blur',()=>{void Sync.release().catch(()=>{});});
  window.addEventListener('focus',()=>{if(!Sync.available||!Sync.app)return;void request('state').then(saved=>{if(saved.owner&&saved.owner!==owner){if(Sync.pending!==Sync.last)keepBackup(Sync.pending);Sync.readonly=true;Sync.revision=saved.revision;sessionStorage.setItem('recall-english-revision',String(saved.revision));localStorage.setItem(E.STORAGE_KEY,JSON.stringify(saved.course));Sync.app.engine=new E.Engine(Sync.app.engine.adapter);Sync.app.render();}}).catch(()=>{});});
  Sync.applyReadonly=root=>{if(!Sync.readonly)return;for(const el of root.querySelectorAll('input,textarea,button'))if(!['export','history','settings','play-question','speak-word','speak-model'].includes(el.dataset.action))el.disabled=true;const notice=root.querySelector('#ed-notice');if(notice){notice.hidden=false;notice.textContent='English зараз відкрито в Recall або іншій вкладці. Тут доступний перегляд. Постав активний урок на паузу, щоб продовжити тут.';}};
  async function base64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});}
  Sync.uploadClip=async(key,blob)=>{if(Sync.available&&!Sync.readonly)await request('audio',{key,mime:blob.type||'audio/webm',base64:await base64(blob)});};
  Sync.downloadClip=async key=>{if(!Sync.available)return null;const result=await request('audio-read',{key});if(!result.audio)return null;const bytes=Uint8Array.from(atob(result.audio.base64),c=>c.charCodeAt(0));return new Blob([bytes],{type:result.audio.mime});};
  Sync.migrateAudio=async()=>{if(!Sync.available||Sync.readonly)throw new Error('Постав урок у Recall на паузу перед перенесенням аудіо.');if(!confirm('Скопіювати наявні локальні аудіозаписи в постійну папку Recall? Оригінали залишаться в браузері.'))return;const db=await Sync.app.audioDb();if(!db)return;const keys=await new Promise((resolve,reject)=>{const r=db.transaction('clips').objectStore('clips').getAllKeys();r.onsuccess=()=>resolve(r.result);r.onerror=reject;});let count=0;for(const key of keys){if(!/^[\w-]{1,150}:(?:monologue|retry|turn-[0-3])$/.test(String(key)))continue;const blob=await new Promise(resolve=>{const r=db.transaction('clips').objectStore('clips').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);});if(blob){await Sync.uploadClip(key,blob);count++;}}Sync.app.message('Перенесено аудіозаписів: '+count+'. Оригінали збережено.');};
  window.EnglishRecallSync=Sync;
})();
