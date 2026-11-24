'use strict';
const fs=require('node:fs'),path=require('node:path');
function installEnglish(coursePath,statisticsPath,assetRoot,checkerPath=path.resolve(assetRoot,'../resources/english-checker')){
  if(fs.existsSync(path.join(coursePath,'.english-review-site.json')))return; // Independent review site owns its files.
  const read=relative=>fs.readFileSync(path.join(coursePath,relative),'utf8');
  function write(relative,text){const file=path.join(coursePath,relative);let old;try{old=fs.readFileSync(file,'utf8');}catch{}if(old===text)return;fs.mkdirSync(path.dirname(file),{recursive:true});if(old!==undefined&&!fs.existsSync(file+'.before-recall-1.5'))fs.copyFileSync(file,file+'.before-recall-1.5');fs.writeFileSync(file,text,'utf8');}
  let engine=read('js/daily/engine.js'),ui=read('js/daily/ui.js'),server=read('server.js'),index=read('index.html');
  if(!engine.includes("STORAGE_KEY='english_daily_v1'")||!ui.includes('class DailyApp')||!server.includes('function createApp('))throw new Error('Не впізнано English Daily. Файли не змінено.');
  for(const [source,target]of [['english-translation.cjs','english-translation.cjs'],['english-coaching.cjs','english-coaching.cjs'],['english-correction-policy.cjs','english-correction-policy.cjs'],['english-ai.cjs','english-ai.cjs'],['english-ai-prompts.cjs','english-ai-prompts.cjs'],['english-repository.cjs','english-repository.cjs'],['english-bridge.cjs','english-bridge.cjs'],['english-language.cjs','english-language.cjs'],['english-browser-block.js','js/daily/recall-block.js'],['english-browser-ui.js','js/daily/recall-ui.js'],['english-learning.css','js/daily/recall-learning.css'],['english-sync.js','js/daily/recall-sync.js']])write(target,fs.readFileSync(path.join(assetRoot,source),'utf8'));
  for(const [source,target]of [['english-learning.cjs','js/daily/learning.js'],['english-course.cjs','js/daily/course.js'],['english-engine.cjs','js/daily/engine.js']]){
    const next=fs.readFileSync(path.join(assetRoot,source),'utf8'),file=path.join(coursePath,target),previous=fs.existsSync(file)?read(target):undefined;
    if(previous!==next&&fs.existsSync(file)&&!fs.existsSync(file+'.before-recall-1.6'))fs.copyFileSync(file,file+'.before-recall-1.6');write(target,next);
  }
  if(!index.includes('js/daily/recall-ui.js')){index=index.replace('<script src="js/daily/ui.js"></script>','<link rel="stylesheet" href="js/daily/recall-learning.css"><script src="js/daily/recall-block.js"></script><script src="js/daily/recall-ui.js"></script><script src="js/daily/ui.js"></script>');write('index.html',index);}
  engine=read('js/daily/engine.js');
  write('recall-config.json',JSON.stringify({version:1,statisticsPath,checkerPath},null,2));
  if(!index.includes('js/daily/learning.js')){index=index.replace('<script src="js/daily/course.js"></script>','<script src="js/daily/learning.js"></script>\n  <script src="js/daily/course.js"></script>');write('index.html',index);}
  if(!engine.includes("timeZone:'Europe/Kyiv'")){
    const original="const localDay=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;";
    if(!engine.includes(original))throw new Error('Календар English змінився.');
    engine=engine.replace(original,"const localDay=(date=new Date())=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));const d=new Date(Date.UTC(+p.year,+p.month-1,+p.day));if(+p.hour<5)d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);};");
    engine=engine.replace("createdAt:now.toISOString(),activeSession:null","createdAt:now.toISOString(),calendarVersion:2,activeSession:null");
    engine=engine.replace("if(raw){try{this.state=validateImport(JSON.parse(raw));}","if(raw){try{this.state=validateImport(JSON.parse(raw));if(this.state.calendarVersion!==2){try{adapter.setItem('english_daily_before_calendar_v2',raw);}catch{}this.state.completedDays=[...new Set(this.state.sessions.map(s=>localDay(new Date(s.endedAt||s.startedAt))))];this.state.calendarVersion=2;this.save();}}");
    engine=engine.replace("const allowed=['version'","const allowed=['calendarVersion','version'");write('js/daily/engine.js',engine);
  }
  if(!server.includes("require('./english-bridge.cjs')")){
    server="const recallBridge=require('./english-bridge.cjs');\n"+server;
    server=server.replace('fetchImpl=globalThis.fetch,port=5500,env=process.env','fetchImpl=globalThis.fetch,port=5500,env=process.env,recallStatisticsPath');
    const before="return send(200,await api(pathname,req.method,body));";
    if(!server.includes(before))throw new Error('Маршрути English-сервера змінилися.');
    server=server.replace(before,"if(pathname.startsWith('/api/recall/')){const result=await recallBridge.handle(pathname,req.method,body,{root,statisticsPath:recallStatisticsPath});return send(result.status,result.body);}return send(200,await api(pathname,req.method,body));");write('server.js',server);
  }
  if(!index.includes('js/daily/recall-sync.js')){index=index.replace('<script src="js/daily/ui.js"></script>','<script src="js/daily/recall-sync.js"></script>\n  <script src="js/daily/ui.js"></script>');write('index.html',index);}
  if(!ui.includes('EnglishRecallSync')){
    ui=ui.replace("this.bindSettings();this.patchLibrary();","this.sync=window.EnglishRecallSync;this.sync?.attach(this);this.bindSettings();this.patchLibrary();");
    ui=ui.replace("if(this.engine.current()){","if(this.engine.current()&&!this.sync?.readonly){");
    ui=ui.replace("this.restoreAudio();","this.restoreAudio();this.sync?.applyReadonly(this.root);");
    ui=ui.replace("if(next&&s)next.disabled=s.paused||this.waiting||!this.engine.requirements();","if(next&&s)next.disabled=s.paused||this.waiting||!!this.sync?.readonly||!this.engine.requirements();");
    ui=ui.replace("const target=event.target,key=target.dataset.answer;if(!key)return;","const target=event.target,key=target.dataset.answer;if(!key||this.sync?.readonly)return;");
    ui=ui.replace("if(this.waiting&&action!=='stop-speech')return;","if(this.sync?.readonly&&!['export','history','settings','play-question','speak-word','speak-model'].includes(action))throw new Error('Урок зараз відкрито в іншому вікні.');if(this.waiting&&action!=='stop-speech')return;");
    ui=ui.replace("case 'export':this.download", "case 'migrate-audio':await this.sync?.migrateAudio();return;\n        case 'export':this.download");
    ui=ui.replace("${button('import','Імпорт')}","${button('import','Імпорт')}${button('migrate-audio','Перенести аудіо в Recall')}");
    ui=ui.replace("tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}catch{this.message('Аудіо доступне", "tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});await this.sync?.uploadClip(id,blob);}catch{this.message('Аудіо доступне");
    ui=ui.replace("if(url&&box.isConnected){", "if(!url)try{const blob=await this.sync?.downloadClip(id);if(blob){url=URL.createObjectURL(blob);this.audioUrls.set(id,url);}}catch{}\n        if(url&&box.isConnected){");
    ui=ui.replace("window.addEventListener('DOMContentLoaded',()=>{window.dailyApp=new DailyApp();});","window.addEventListener('DOMContentLoaded',async()=>{await window.EnglishRecallSync?.prepare();window.dailyApp=new DailyApp();});");write('js/daily/ui.js',ui);
  }
  if(fs.existsSync(path.join(coursePath,'js/storage.js'))){const storage=read('js/storage.js');write('js/storage.js',storage.replace("localStorage.removeItem('linguo_gemini_api_key');","/* Kept until the explicit browser-key migration succeeds. */"));}

  // Keep the existing browser API contract; mirror validated credential saves
  // into the shared private store, without exposing credentials to the page.
  server=read('server.js');
  if(!server.includes('recall-shared-private-v1')){
    const helper="function syncShared(provider,remove=false){try{let stats=recallStatisticsPath;if(!stats){if(path.resolve(configPath)!==path.join(ROOT,'.english-daily-private.json'))stats=path.join(path.dirname(configPath),'statistics');else stats=JSON.parse(fs.readFileSync(path.join(root,'recall-config.json'),'utf8')).statisticsPath;}const ai=new(require('./english-ai.cjs').EnglishAI)({statisticsPath:stats,legacyConfigPath:configPath,env});if(remove){ai.save({provider,remove:true});return;}for(const id of provider?[provider]:['groq','gemini'])if(config.keys[id])ai.save({provider:id,key:config.keys[id],model:config.models[id]});}catch{}} /* recall-shared-private-v1 */\n";
    server=server.replace('  const persist=()=>{',helper+'  const persist=()=>{');
    server=server.replace("fs.renameSync(configPath+'.tmp',configPath);};","fs.renameSync(configPath+'.tmp',configPath);syncShared(config.provider);};");
    server=server.replace('delete config.keys[p];persist();return publicConfig();','delete config.keys[p];persist();syncShared(p,true);return publicConfig();');
    write('server.js',server);
  }

  server=read('server.js');
  if(!server.includes('recall-shared-api-read-v1')){
    const sync=" /* recall-shared-api-read-v1 */ try{let stats=recallStatisticsPath;if(!stats){if(path.resolve(configPath)!==path.join(ROOT,'.english-daily-private.json'))stats=path.join(path.dirname(configPath),'statistics');else stats=JSON.parse(fs.readFileSync(path.join(root,'recall-config.json'),'utf8')).statisticsPath;}const c=new(require('./english-ai.cjs').EnglishAI)({statisticsPath:stats,legacyConfigPath:configPath,env}).config();config.keys={groq:c.keys.groq,gemini:c.keys.gemini};config.models={groq:c.models.groq,gemini:c.models.gemini};const primary=c.order.find(id=>['groq','gemini'].includes(id)&&c.keys[id]);if(primary)config.provider=primary;}catch{} ";
    server=server.replace('async function api(route,method,b){','async function api(route,method,b){'+sync);write('server.js',server);
  }

}
module.exports={installEnglish};
