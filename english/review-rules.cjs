'use strict';
const normal=s=>String(s||'').toLowerCase().replace(/[’]/g,"'").replace(/[.!?,;:]/g,'').replace(/\s+/g,' ').trim();
const RULES=[
 ['present-simple-s','He / she / it + -s','У Present Simple після he, she, it або одного предмета додаємо -s. Після I, you, we, they — базова форма.','She works here. / They work here.',[['My sister ___ near the station.','lives','live'],['The app ___ a reminder every morning.','sends','send'],['Our teacher ___ the lesson at nine.','starts','start'],['This tool ___ time.','saves','save'],['Marta ___ English after work.','studies','study'],['The train ___ at six.','leaves','leave']]],
 ['plural-agreement','People / they + базова форма','People, they, we — множина. У Present Simple дієслово після них не отримує -s.','People need help. / A person needs help.',[['People ___ different languages.','speak','speaks'],['My friends ___ nearby.','live','lives'],['The developers ___ the change.','test','tests'],['They ___ clear instructions.','need','needs'],['We ___ every Friday.','meet','meets'],['The students ___ questions.','ask','asks']]],
 ['be-form','Am / is / are','I am; he, she, it is; you, we, they are. Для дії без допоміжного be в Present Simple зайве is не потрібне.','They are ready. / She is ready.',[['The results ___ ready.','are','is'],['My colleague ___ at home.','is','are'],['I ___ responsible for testing.','am','is'],['Both answers ___ useful.','are','is'],['This explanation ___ clear.','is','are'],['You ___ right.','are','is']]],
 ['passive-be','Пасив: be + past participle','Коли над об’єктом виконують дію, потрібні be та третя форма дієслова.','The report is checked every day.',[['The screen ___ tested before release.','is',''],['These files ___ saved locally.','are','is'],['The room ___ cleaned every morning.','is','are'],['The forms ___ checked by the team.','are','is'],['The answer ___ stored on this computer.','is',''],['The documents ___ signed today.','are','is']]],
 ['present-continuous','Be + -ing','Для дії, що триває зараз, використай am/is/are + дієслово з -ing.','She is studying now.',[['They ___ working on it now.','are','is'],['I ___ reading your message.','am','is'],['She is ___ dinner now.','cooking','cook'],['We are ___ the update.','testing','test'],['He ___ waiting outside.','is','are'],['You are ___ quickly.','learning','learn']]],
 ['past-simple','Минула завершена дія','Для завершеної дії у визначений минулий час використовуємо Past Simple.','I visited them yesterday.',[['Yesterday I ___ to the library.','went','go'],['We ___ the change last night.','tested','test'],['She ___ the report yesterday.','sent','send'],['Last week they ___ a new flat.','found','find'],['He ___ me an hour ago.','called','call'],['I ___ this book last month.','read','reads']]],
 ['articles-a-an','A / an: один невизначений предмет','Перед злічуваним іменником в однині часто потрібен a або an. An — перед голосним звуком.','An idea. / A useful idea.',[['She has ___ interesting idea.','an','a'],['This is ___ useful feature.','a','an'],['I need ___ example.','an','a'],['He is ___ developer.','a','an'],['It takes ___ hour.','an','a'],['We found ___ solution.','a','an']]],
 ['articles-the','The: конкретний предмет','The вказує на конкретний предмет, відомий із ситуації або попереднього речення.','I found a key. The key was under the chair.',[['I bought a book. ___ book is on my desk.','The','A'],['We have a meeting. ___ meeting starts at ten.','The','A'],['Open ___ file I sent you.','the','a'],['I saw a dog. ___ dog was friendly.','The','A'],['This is ___ answer we discussed.','the','an'],['Please close ___ door next to you.','the','a']]],
 ['possessives','Its / it’s; their / they’re','Its — належність; it’s = it is. Their — їхній; they’re = they are.','The team changed its plan. It’s ready now.',[["The company changed ___ name.",'its',"it's"],["___ a helpful example.","It's",'Its'],['They shared ___ ideas.','their',"they're"],["___ ready to begin.","They're",'Their'],['The dog hurt ___ leg.','its',"it's"],['We respect ___ decision.','their',"they're"]]],
 ['prepositions-time','In / on / at: час','In — місяць або рік; on — день; at — точний час.','In May. / On Monday. / At nine.', [['We meet ___ Monday.','on','in'],['The lesson starts ___ seven.','at','in'],['I moved here ___ 2024.','in','at'],['Her birthday is ___ May.','in','on'],['I will call you ___ Friday.','on','at'],['We study ___ the evening.','in','at']]],
 ['word-order','Порядок слів у запитанні','У Present Simple для запитання зазвичай потрібні do/does + підмет + базова форма дієслова.','Does she work here?', [['___ she work here?','Does','Do'],['___ they need help?','Do','Does'],['Does he ___ English?','speak','speaks'],['Do you ___ this idea?','like','likes'],['___ your friend live nearby?','Does','Do'],['Does this app ___ offline?','work','works']]],
 ['countable-plural','Однина та множина','Після числівника більше одного злічуваний іменник зазвичай має форму множини.','One appointment. / Two appointments.', [['We booked two ___.','appointments','appointment'],['There are three ___.','students','student'],['I have several ___.','questions','question'],['We need five ___.','examples','example'],['They fixed two ___.','errors','error'],['I read three ___.','books','book']]]
].map(([id,title,rule,contrast,items])=>({id,title,rule,contrast,items}));
const byId=id=>RULES.find(r=>r.id===id);
const independent=list=>[...new Map(list.map(r=>[r.answerHash&&r.variant?r.answerHash+':'+r.variant:r.taskId||r.at,r])).values()];
function classify(c){if(byId(c.ruleId))return c.ruleId;const a=normal(c.original),b=normal(c.replacement||c.improved),why=String(c.explanation||'').toLowerCase();
 if(/\b(?:is|are|was|were)\s+\w+(?:ed|en)\b/.test(b)&&!/(?:is|are|was|were)\s/.test(a)&&/пасив|passive|trained|saved|tested/.test(why+' '+b))return 'passive-be';
 if(/\b(?:its|it's|their|they're)\b/.test(a+' '+b)&&/its|it's|their|they're/.test(why+' '+a))return 'possessives';
 if(/\b(?:am|is|are)\s+\w+ing\b/.test(b)&&a!==b)return 'present-continuous';
 if(/\b(?:people|they|we|friends|developers|students)\b/.test(a+' '+b)&&a!==b&&/згод|agreement|plural|множ|закінчен|ending/.test(why))return 'plural-agreement';
 if(/third.person|3rd.person|singular subject|однин|he\/she|he, she|закінчен.*s/.test(why)&&a!==b)return 'present-simple-s';
 const aa=a.split(' '),bb=b.split(' ');if(aa.length===bb.length&&aa.some((w,i)=>w!==bb[i]&&(bb[i]===w+'s'||bb[i]===w+'es'||bb[i]===w.replace(/y$/,'ies')))&&!/noun|іменник|plural noun|множин/.test(why))return 'present-simple-s';
 if(/\b(?:people|they|we)\b/.test(b)&&aa.some((w,i)=>w.endsWith('s')&&w.slice(0,-1)===bb[i]))return 'plural-agreement';
 if(/article|артикл/.test(why))return /\bthe\b/.test(b)?'articles-the':'articles-a-an';
 if(/past simple|минулий|минулому|yesterday/.test(why))return 'past-simple';
 if(/preposition|прийменник/.test(why)&&/\b(monday|tuesday|friday|january|may|evening|morning|night|noon|202[0-9]|[0-9]:[0-9])\b|час|time/.test(a+' '+b+' '+why))return 'prepositions-time';
 if(/word order|порядок слів|auxiliary|допоміжн/.test(why))return 'word-order';
 if(/plural|множин|countable|злічуван/.test(why))return 'countable-plural';
 if(/\b(?:am|is|are)\b/.test(a+' '+b)&&/agreement|узгод|be\b|is|are/.test(why))return 'be-form';return null;
}
function rank(observations,results,now=new Date(),rules=RULES){
 return rules.map(rule=>{const all=observations.filter(e=>e.ruleId===rule.id),recent=all.filter(e=>now-new Date(e.at)<=30*86400000),episodes=new Set(recent.filter(e=>e.result==='incorrect').map(e=>e.episodeId));const lastFailure=Math.max(0,...all.map(o=>Date.parse(o.at)||0),...results.filter(r=>r.ruleId===rule.id&&!r.correct).map(r=>Date.parse(r.at)||0));const successes=independent(results.filter(r=>r.ruleId===rule.id&&r.correct&&!r.assisted&&!r.skipped&&Date.parse(r.at)>lastFailure)),days=new Set(successes.map(r=>r.day||r.at.slice(0,10))),maintained=successes.length>=3&&days.size>=2;const latest=successes.at(-1),due=!latest||now-new Date(latest.at)>=([1,3,7,14,30][Math.min(4,Math.floor(successes.length/3))])*86400000;return {...rule,count:episodes.size,total:new Set(all.filter(e=>e.result==='incorrect').map(e=>e.episodeId)).size,maintained,due,evidence:all.filter(e=>e.result==='incorrect').slice(-3),priority:(episodes.size>=2&&!maintained?10000:!maintained&&due&&new Set(all.map(o=>o.episodeId)).size>=2?2000:0)+(!maintained?episodes.size*100:0)+(due&&successes.length?50:0)};}).filter(r=>r.total||results.some(x=>x.ruleId===r.id)).sort((a,b)=>b.priority-a.priority||b.count-a.count||a.id.localeCompare(b.id));
}

function closedTask(rule, index=0) {
  const [prompt,answer,distractor]=rule.items[index%rule.items.length];
  const alternatives=distractor?[answer,distractor]:['is','are'];
  const options=[...alternatives].sort((a,b)=>a.localeCompare(b));
  const length=options.some(option=>option.includes(' '))?'word or phrase':'word';
  return {
    kind:'grammar',ruleId:rule.id,prompt,
    instruction:'Fill the blank. Type only the missing '+length+' ('+options.join(' or ')+').',
    answer,accepted:[answer],title:rule.title,rule:rule.rule,contrast:rule.contrast,
  };
}
const productionPrompts={
  'present-simple-s':['Describe what one person does every morning. Use a singular subject and a Present Simple verb ending in -s or -es.'],
  'plural-agreement':['Describe something two or more people regularly do together. Use a plural subject and the base form of the verb.'],
  'be-form':['Describe how you feel today. Start with “I am”.','Describe how two people feel today. Use “are”.'],
  'passive-be':['Describe how something is checked or cleaned regularly. Start with the thing receiving the action and use “is” plus a past participle.'],
  'present-continuous':['Say what someone is doing right now. Use “is” or “are” plus an -ing verb.'],
  'past-simple':['Say what you finished yesterday. Use a Past Simple verb and a past time expression.'],
  'articles-a-an':['Say what new thing you need. Put “a” or “an” before one singular countable noun.'],
  'articles-the':['Ask someone to open a particular file. Use “the” and describe which file you mean in the same sentence.'],
  'possessives':['Describe something that belongs to a company or team. Use “its” before the thing it owns.','Describe something two people own together. Use “their” before the thing they own.','Give your opinion of a tool. Start with “It’s” to mean “It is”.','Say how two people feel now. Start with “They’re” to mean “They are”.'],
  'prepositions-time':['Tell a friend what time you will meet. Use “at” before the time.','Tell a friend what day you will meet. Use “on” before the day.','Say in which month an event happens. Use “in” before the month.'],
  'word-order':['Ask a question about a friend’s routine. Start with “Does” and use the base form of the main verb.'],
  'countable-plural':['Say what two or more things you need. Use a number and the plural form of a countable noun.'],
};
function productionTask(rule,index=0){
  const prompts=productionPrompts[rule.id], evidence=rule.evidence?.at(-1);
  const prompt=prompts?.[index%prompts.length]||
    (evidence?.replacement
      ?'Use the same language rule as in the corrected phrase “'+evidence.replacement.slice(0,160)+'” in a new situation.'
      :'Apply this rule to a new situation: '+rule.rule.slice(0,300));
  return {kind:'production',ruleId:rule.id,title:rule.title,rule:rule.rule,contrast:rule.contrast,
    prompt,instruction:rule.id==='word-order'?'Write one complete English question.':'Write one complete English sentence.'};
}
function clarifyTask(task){
  if(task.done||task.kind!=='production'||!/^Demonstrate this point CORRECTLY/.test(task.prompt))return task;
  return {...task,...productionTask(byId(task.ruleId)||{...task,id:task.ruleId},task.index)};
}
module.exports={independent,RULES,byId,normal,classify,rank,closedTask,productionTask,clarifyTask};
