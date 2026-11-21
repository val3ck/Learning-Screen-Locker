import {VimEngine} from './engine.js';
import {movementArena,movementStart,createNavigationRoute,moveInArena} from './scenes.js';
import {CODE_LANGUAGES,starterCode,referenceCode,defaultTests,parseCustomTests,problemFor} from './programs.js';
import {checkAssignment} from './practice-validation.js';

export const examCopy={
  en:{practice:'Practice',trial:'Trial',checklist:'Your checklist',complete:'All done. Take a breath.\nEnter when you are ready.',intro:'No new commands. Just a little room to use them.\nThe checklist is yours. Take your time.',menu:'Oh, before you go. That quiet button up there?\nThere is a manual inside. You will find the rest.\nEnter — three practice trials.',ready:'Let those keys settle in.\nThree practice trials next. Enter when ready.',run:'Run tests · F5',running:'Running…',reference:'Reference',hideReference:'Hide reference',next:'Enter — continue',tests:'tests.json',files:'Files',ownTests:'Add a test to tests.json',officialTests:'Pass every built-in and custom test',typed:'Type real text',sessions:'Finish separate insert sessions',esc:'Return to Normal after typing',open:'Open new lines with o / O',replace:'Replace characters with r',language:'Code language',provider:'JS runs in an isolated browser worker. Other languages run on Wandbox.',invalidTests:'Check tests.json: ',changed:'Code changed. Run tests again.',loading:'Running in the online compiler…',timeout:'Execution timed out. Check for an endless loop.',failed:'Could not run tests. Check the compiler message and try again.',showChecklist:'Checklist',passed:'passed',failedTest:'failed',round:'Draft',movement:'Move between the lights. Walls stop the cursor.',saveHint:'Edit a note, then save. Each checkpoint needs real changes.',customHint:'In tests.json, add e.g. ',reading:'Practise these commands in the disposable buffer. Undo is allowed.',examNames:['Hands remember','Repair bay','On your own']},
  uk:{practice:'Практика',trial:'Іспит',checklist:'Твій чекліст',complete:'Усе готово. Можна видихнути.\nEnter, коли будеш готовий.',intro:'Жодних нових команд. Тільки місце потренуватись.\nЧекліст твій. Не поспішай.',menu:'О, перед тим як підеш. Бачиш тиху кнопку вгорі?\nУсередині є мануал. Решту знайдеш сам.\nEnter — три практичні іспити.',ready:'Дай клавішам трохи закріпитися.\nДалі три практичні іспити. Enter, коли будеш готовий.',run:'Запустити тести · F5',running:'Виконання…',reference:'Зразок',hideReference:'Сховати зразок',next:'Enter — продовжити',tests:'tests.json',files:'Файли',ownTests:'Додай тест у tests.json',officialTests:'Пройди всі вбудовані та власні тести',typed:'Введи текст',sessions:'Заверши окремі сеанси введення',esc:'Повернись у Normal після введення',open:'Створи нові рядки через o / O',replace:'Замінюй символи через r',language:'Мова коду',provider:'JS працює в окремому браузерному воркері. Інші мови — у Wandbox.',invalidTests:'Перевір tests.json: ',changed:'Код змінився. Запусти тести знову.',loading:'Виконання в онлайн-компіляторі…',timeout:'Час вичерпано. Перевір, чи немає нескінченного циклу.',failed:'Не вдалося запустити тести. Перевір повідомлення компілятора й спробуй знову.',showChecklist:'Чекліст',passed:'пройдено',failedTest:'помилка',round:'Чернетка',movement:'Рухайся між вогниками. Стіни зупиняють курсор.',saveHint:'Зміни нотатку, потім збережи. Кожен залік потребує справжніх змін.',customHint:'У tests.json додай, наприклад, ',reading:'Тренуй ці команди в одноразовому буфері. Скасовувати зміни можна.',examNames:['Руки запам’ятовують','Ремонтна зона','Самостійно']}
};
const quota=(key,en,uk,n)=>({key,en,uk,n});
export function topicQuotas(chapter,scale=1){
  const q={
    3:[quota('w','Next word · w','Наступне слово · w',20),quota('b','Back a word · b','Назад на слово · b',15),quota('e','Word end · e','Кінець слова · e',15),quota('edge','Line boundaries · 0 / $','Краї рядка · 0 / $',10)],
    4:[quota('x','Delete characters · x','Видали символи · x',8),quota('dd','Delete whole lines · dd','Видали рядки · dd',6),quota('dw','Delete words · dw','Видали слова · dw',6),quota('undo','Undo real changes · u','Скасуй зміни · u',8),quota('redo','Redo changes · Ctrl+r','Поверни зміни · Ctrl+r',4)],
    5:[quota('ciw','Change inner words · ciw','Змінюй слова · ciw',6),quota('dollarDelete','Delete to line end · d$','Видаляй до кінця · d$',5),quota('countedDelete','Counted word deletes · 2dw','Видаляй кілька слів · 2dw',5),quota('repeat','Repeat edits · .','Повторюй редагування · .',4)],
    6:[quota('lineYank','Copy whole lines · yy','Копіюй рядки · yy',6),quota('visualYank','Copy a selection · v … y','Копіюй виділення · v … y',5),quota('lineVisual','Select whole lines · V','Виділяй рядки · V',4),quota('paste','Paste copies · p / P','Вставляй копії · p / P',10)],
    7:[quota('search','Find a word · /','Знайди слово · /',5),quota('next','Next match · n','Наступний збіг · n',10),quota('previous','Previous match · N','Попередній збіг · N',5),quota('substitute','Successful substitutions · :s','Успішні заміни · :s',3)],
    8:[quota('ciw','Change config values · ciw','Змінюй значення · ciw',2),quota('search','Find settings · /','Шукай налаштування · /',2),quota('save','Save changed work · :w','Збережи зміни · :w',1)]
  }[chapter]||[];
  return q.map(x=>({...x,n:Math.max(1,Math.round(x.n*scale))}));
}
const scratch=Array.from({length:26},(_,i)=>`alpha${i} beta portal red green gamma delta`).join('\n');
const targets=['name = "cursor"','status = "ready for the next move"','message = "one key, one small step"'];
const shortProgram='const ready = true;\nconst message = "hello, cursor";\nconsole.log(message);';
const config='# checkpoint.conf\nenabled = false\ndebug = true\ntheme = gray';
const configGoal='# checkpoint.conf\nenabled = true\ntheme = night';
export function examName(chapter,index,lang){
  const names={en:[['Four directions','Follow the lights','Find your rhythm'],['Fill the blanks','Fix and extend','Write it yourself'],['Three saves','Protected exits','Four checkpoints']],uk:[['Чотири напрямки','За вогниками','Знайди свій ритм'],['Заповни пропуски','Виправ і допиши','Напиши сам'],['Три збереження','Захищений вихід','Чотири заліки']]};
  return names[lang][chapter]?.[index]||examCopy[lang].examNames[index];
}
export class ExamSession{
  constructor(chapter,index,codeLanguage='javascript',snapshot=null){
    this.chapter=chapter;this.index=index;this.codeLanguage=CODE_LANGUAGES[codeLanguage]?codeLanguage:'javascript';this.stats={};this.context={segmentTyped:0,roundTyped:0};this.route=[];this.routeIndex=0;this.activeFile='main';this.codePassed=false;this.results=null;this.drafts={};
    this.coding=chapter>=3&&index>=1;
    if(chapter===0){this.route=createNavigationRoute();this.main=new VimEngine(movementArena,movementStart);}
    else if(this.coding){this.main=new VimEngine(this.codeStarter());this.tests=new VimEngine('[]');}
    else if(chapter===1){this.main=new VimEngine(index===0?'name = \nstatus = \nmessage = \neditor = "neoxim"':index===1?Array(6).fill('neoxim alpha beta').join('\n'):'',index===1?[0,3]:[0,0]);}
    else if(chapter===2){this.main=new VimEngine(this.draftText());this.main.savedText='';}
    else this.main=new VimEngine(chapter===8?config:scratch);
    if(snapshot)this.restore(snapshot);
  }
  get engine(){return this.activeFile==='tests'?this.tests:this.main;}
  get target(){if(this.chapter!==0)return null;return this.route[this.routeIndex]||null;}
  get reference(){if(this.coding)return referenceCode(this.chapter,this.codeLanguage);if(this.chapter===1)return this.index===0?targets.join('\n')+'\neditor = "neovim"':this.index===2?shortProgram:'';if(this.chapter===8)return configGoal;return '';}
  get done(){return this.objectives.every(g=>g.done);}
  codeStarter(){const comment=this.codeLanguage==='python'?'#':'//';return starterCode(this.chapter,this.index,this.codeLanguage)+'\n'+Array.from({length:12},(_,i)=>`${comment} scratch ${i}: alpha portal red beta portal green gamma`).join('\n');}
  draftText(){return `# draft ${(this.stats.rounds||0)+(this.stats.force||0)+1}\nnotes = ""\n`;} 
  get objectives(){
    const goals=[],add=(key,en,uk,n,value=this.stats[key]||0)=>goals.push({key,label:{en,uk},value:Math.min(n,value),total:n,done:value>=n});
    if(this.chapter===0){
      if(this.index===0)for(const k of ['h','j','k','l'])add(k,`${k} · real steps`,`${k} · справжні кроки`,8);
      else {add('moves','Real cursor steps','Справжні кроки курсора',this.index===1?50:70);add('directions','Use all four directions','Використай усі чотири напрямки',4,['h','j','k','l'].filter(k=>this.stats[k]>0).length);}
      add('lights','Reach different lights','Дійди до різних вогників',this.index===0?3:this.index===1?5:7);return goals;
    }
    if(this.chapter===1){
      if(this.index===0){
        targets.forEach((text,i)=>{const check=checkAssignment(this.main.lines,text);add('field'+i,text,text,1,check.done?1:0);if(this.main.mode!=='insert')Object.assign(goals.at(-1),{hint:check.hint,position:check.position});});
        const check=checkAssignment(this.main.lines,'editor = "neovim"');add('replace','Fix neoxim with r','Виправ neoxim через r',1,check.done&&(this.stats.replace||0)>0?1:0);
        if(this.main.mode!=='insert'&&!check.done)Object.assign(goals.at(-1),{hint:check.hint,position:check.position});
      }
      if(this.index===1){add('replace','Replace six letters · r','Заміни шість літер · r',6);add('open','Open four new lines · o / O','Створи чотири рядки · o / O',4);}
      if(this.index===2)add('program','Write the three-line example','Напиши трирядковий приклад',1,this.main.text.trim()===shortProgram?1:0);
      add('typed','Type characters','Введи символи',50);add('sessions','Separate insert sessions','Окремі сеанси введення',this.index===1?4:3);return goals;
    }
    if(this.chapter===2){
      if(this.index===0){add('save','Save three changed drafts · :w','Збережи три зміни · :w',3);add('typed','Write notes before saving','Напиши нотатки перед збереженням',40);add('savequit','Save and close · :wq','Збережи й закрий · :wq',1);}
      if(this.index===1){add('blocked','See unsaved protection · :q','Перевір захист незбереженого · :q',3);add('force','Discard three drafts · :q!','Відкинь три чернетки · :q!',3);}
      if(this.index===2){add('rounds','Edit 12+ characters, then :wq','Введи 12+ символів, потім :wq',4);add('typed','Write fresh text','Напиши новий текст',48);}return goals;
    }
    if(this.chapter===8&&!this.coding){add('enabled','Enable the config','Увімкни конфіг',1,this.main.text.includes('enabled = true')?1:0);add('debug','Remove the debug line','Прибери рядок debug',1,!this.main.text.includes('debug')?1:0);add('theme','Set theme to night','Встанови тему night',1,this.main.text.includes('theme = night')?1:0);add('savedConfig','Save and close the finished config','Збережи й закрий готовий конфіг',1);return goals;}
    for(const q of topicQuotas(this.chapter,this.coding?0.4:1))add(q.key,q.en,q.uk,q.n);
    if(this.coding){add('typed','Type and edit real code','Вводь і редагуй код',this.index===1?20:45);if(this.index===2){let own=false;try{own=parseCustomTests(this.tests.text).length>0;}catch{}add('ownTests','Add a case to tests.json','Додай випадок у tests.json',1,own?1:0);}add('codePassed','Pass every program test','Пройди всі тести програми',1,this.codePassed?1:0);}
    return goals;
  }
  key(key){
    const e=this.engine,before={text:e.text,offset:e.offset,row:e.row,col:e.col,mode:e.mode,dirty:e.dirty,lines:e.lines.length};
    const event=this.chapter===0?moveInArena(e,key):e.key(key);this.observe(event,before,key);return event;
  }
  observe(event,before,key){
    const e=this.engine,changed=before.text!==e.text,moved=before.offset!==e.offset,inc=(name,n=1)=>this.stats[name]=(this.stats[name]||0)+n;
    if(!['unsupported','count','pending','closed'].includes(event.action))inc('presses');
    if(event.action==='move'&&moved){inc('moves');const motion=event.command?.slice(-1);if('hjklwbe'.includes(motion))inc(motion);if(['0','$','^'].includes(motion))inc('edge');}
    if(event.action==='insert'&&before.mode==='insert'&&key.length===1&&e.text.length>before.text.length){inc('typed');this.context.segmentTyped++;this.context.roundTyped++;}
    if(event.action==='insert-start'&&['o','O'].includes(event.command)&&changed)inc('open');
    if(event.action==='escape'&&event.from==='insert'&&this.context.segmentTyped){inc('sessions');inc('esc');this.context.segmentTyped=0;}
    if(event.action==='replace'&&changed)inc('replace');
    if(event.action==='delete'&&changed){inc('delete');if(event.command==='x')inc('x');if(event.command==='dd')inc('dd');if(event.command==='dw')inc('dw');if(event.command==='d$')inc('dollarDelete');if(/^\d+d[we]/.test(event.command))inc('countedDelete');}
    if(event.action==='change'&&changed&&event.command==='ciw')inc('ciw');
    if(event.action==='undo'&&changed)inc('undo');if(event.action==='redo'&&changed)inc('redo');if(event.action==='repeat'&&changed)inc('repeat');
    if(event.action==='yank'&&e.register.text){if(event.command==='yy')inc('lineYank');if(event.command==='visual-y')inc('visualYank');}
    if(event.action==='visual'&&event.command==='V'&&e.mode==='visual-line')inc('lineVisual');if(event.action==='paste'&&changed)inc('paste');
    if(event.action==='search'&&event.found&&moved)inc('search');if(event.action==='search-next'&&event.found&&moved)inc(event.command==='N'?'previous':'next');if(event.action==='substitute'&&changed)inc('substitute');
    if(event.action==='save'&&before.dirty)inc('save');if(event.action==='save-quit')inc('savequit');
    if(this.coding&&changed){this.codePassed=false;this.results=null;}
    if(this.chapter===0&&event.action==='move'&&e.row===this.target[0]&&e.col===this.target[1]){inc('lights');this.routeIndex++;if(this.routeIndex>=this.route.length)this.route.push(...createNavigationRoute());}
    if(this.chapter===2&&this.index===1&&event.command===':q'&&e.error&&!this.context.blocked){inc('blocked');this.context.blocked=true;}
    if(this.chapter===2&&e.exited){
      if(this.index===1&&event.command===':q!'&&this.context.blocked)inc('force');
      if(this.index===2&&event.action==='save-quit'&&this.context.roundTyped>=12)inc('rounds');
      if(!this.done){this.main=new VimEngine(this.index===0?e.text:this.draftText());this.main.savedText='';this.context.blocked=false;this.context.roundTyped=0;}
    }
    if(this.chapter===8&&!this.coding&&event.action==='save-quit'&&e.text.trim()===configGoal)inc('savedConfig');
    if(e.exited&&!this.done&&this.chapter!==2){e.exited=false;e.mode='normal';}
  }
  switchFile(file){if(!this.coding)return;this.activeFile=file==='tests'?'tests':'main';}
  setLanguage(language){if(!CODE_LANGUAGES[language])return;this.drafts[this.codeLanguage]={text:this.main.text,cursor:[this.main.row,this.main.col]};this.codeLanguage=language;const prior=this.drafts[language];this.main=new VimEngine(prior?.text??this.codeStarter(),prior?.cursor||[0,0]);this.activeFile='main';this.codePassed=false;this.results=null;}
  allTests(){return [...defaultTests(this.chapter),...parseCustomTests(this.tests.text)];}
  setResults(result){this.results=result;this.codePassed=!!result.results?.length&&result.results.every(t=>t.passed);}
  snapshot(){return {chapter:this.chapter,index:this.index,codeLanguage:this.codeLanguage,stats:this.stats,context:this.context,main:{text:this.main.text,cursor:[this.main.row,this.main.col]},tests:this.tests?{text:this.tests.text,cursor:[this.tests.row,this.tests.col]}:null,activeFile:this.activeFile,route:this.route,routeIndex:this.routeIndex,codePassed:this.codePassed,drafts:this.drafts};}
  restore(s){if(s.chapter!==this.chapter||s.index!==this.index)return;this.stats=s.stats||{};this.context=s.context||{};if(s.main)this.main=new VimEngine(s.main.text,s.main.cursor);if(this.chapter===2)this.main.savedText='';if(this.coding&&s.tests)this.tests=new VimEngine(s.tests.text,s.tests.cursor);this.activeFile=this.coding&&s.activeFile==='tests'?'tests':'main';if(this.chapter===0&&Array.isArray(s.route)&&s.route.length&&s.route.every(p=>Array.isArray(p)&&p[0]>=2&&p[0]<=12&&p[1]>=3&&p[1]<=52)){this.route=s.route;this.routeIndex=Math.min(s.routeIndex||0,s.route.length-1);}this.codePassed=!!s.codePassed;this.drafts=s.drafts||{};}
}
export function examNarrative(entry,lang){
  const c=examCopy[lang];if(entry.kind==='menuReveal')return c.menu;if(entry.kind==='practiceReady')return c.ready;if(entry.kind==='examDone')return c.complete;
  if(entry.kind==='examIntro')return c.intro;
  return '';
}
