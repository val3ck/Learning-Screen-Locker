import type {Task,GenerationContext} from '../../core/contracts';
import {catalog,CONTENT_VERSION,expandSkills,topicIds} from './catalog';
import {domains,fixture,random} from './fixtures';
import {additionalVariant} from './additional-variants';
import {distinctPractice,functionReviews,practiceProfile} from './practice-profile';
import type {SQLPayload} from './types';
export type {SQLPayload} from './types';
export const VARIANTS_PER_TOPIC=4;
export function makeTask(index:number,variant:number,seed:number,difficulty=1):Task {
  if(!Number.isInteger(variant)||variant<0||variant>=VARIANTS_PER_TOPIC)throw new Error('Невідомий варіант вправи.');
  const r=random(seed);const d=domains[Math.floor(r()*domains.length)];
  const a=d.actors,p=d.items,o=d.events,l=d.lines,b=variant%2===1;
  const n=[20,30,40,50][Math.floor(r()*4)], tax=b?1.1:1.2, threshold=b?60:80;
  let brief='',solution='',ordered=false,verify:string|undefined,metadata:string|undefined;
  let probes:SQLPayload['probes'];let transaction:SQLPayload['transaction'];
  switch(index){
    case 0:brief=`Поверни всі колонки та всі рядки таблиці ${b?a:p}.`;solution=`SELECT * FROM ${b?a:p};`;break;
    case 1:brief=`Поверни ${b?'name і category':'name і price'} з ${p}, саме в такому порядку.`;solution=`SELECT name, ${b?'category':'price'} FROM ${p};`;break;
    case 2:brief=b?`Для ${p} поверни name та вартість усіх доступних одиниць (price × stock) як inventory_value.`:`Для ${p} поверни name та ціну з податком 20% як price_with_tax.`;solution=b?`SELECT name, price*stock AS inventory_value FROM ${p};`:`SELECT name, price*${tax} AS price_with_tax FROM ${p};`;break;
    case 3:brief=`Для ${p} поверни name і price. Сортуй за ціною ${b?'від меншої до більшої':'від більшої до меншої'}, при однаковій ціні — за name за зростанням.`;solution=`SELECT name,price FROM ${p} ORDER BY price ${b?'ASC':'DESC'},name;`;ordered=true;break;
    case 4:brief=`Для ${p} поверни name і price для позицій із ціною ${b?'меншою за':'не меншою за'} ${n}.`;solution=`SELECT name,price FROM ${p} WHERE price ${b?'<':'>='}${n};`;break;
    case 5:brief=b?`Поверни name з ${p}: категорія '${d.categories[0]}' або '${d.categories[1]}', і в обох випадках stock більший за 0.`:`Поверни name з ${p}: категорія '${d.categories[0]}' із ціною нижче ${n+60}, або будь-яка позиція категорії '${d.categories[1]}'.`;solution=b?`SELECT name FROM ${p} WHERE (category='${d.categories[0]}' OR category='${d.categories[1]}') AND stock>0;`:`SELECT name FROM ${p} WHERE (category='${d.categories[0]}' AND price<${n+60}) OR category='${d.categories[1]}';`;break;
    case 6:brief=b?`Поверни name і category з ${p} для категорій '${d.categories[0]}' та '${d.categories[2]}'.`:`Поверни name і price з ${p} для цін від ${n} до ${n+60} включно.`;solution=b?`SELECT name,category FROM ${p} WHERE category IN ('${d.categories[0]}','${d.categories[2]}');`:`SELECT name,price FROM ${p} WHERE price BETWEEN ${n} AND ${n+60};`;break;
    case 7:brief=`Поверни name з ${p}, де назва ${b?'починається з':'містить'} '${b?d.names[0].slice(0,2):d.names[0].slice(1,3)}' незалежно від регістру.`;solution=`SELECT name FROM ${p} WHERE name ILIKE '${b?d.names[0].slice(0,2)+'%':'%'+d.names[0].slice(1,3)+'%'}';`;break;
    case 8:brief=b?`Поверни name і контакт як contact з ${a}; для відсутнього email покажи 'Немає контакту'.`:`Поверни name з ${a} для записів без email.`;solution=b?`SELECT name,COALESCE(email,'Немає контакту') AS contact FROM ${a};`:`SELECT name FROM ${a} WHERE email IS NULL;`;break;
    case 9:brief=b?`Поверни унікальні city з ${a} в алфавітному порядку.`:`Поверни name і price для трьох найдорожчих позицій ${p}; порядок — ціна за спаданням, потім name за зростанням.`;solution=b?`SELECT DISTINCT city FROM ${a} ORDER BY city;`:`SELECT name,price FROM ${p} ORDER BY price DESC,name LIMIT 3;`;ordered=true;break;
    case 10:brief=b?`Для ${a} поверни один рядок: усі записи як total_count та кількість заповнених email як known_emails.`:`Для ${p} поверни один рядок: кількість позицій як item_count та середню ціну як average_price.`;solution=b?`SELECT COUNT(*) AS total_count,COUNT(email) AS known_emails FROM ${a};`:`SELECT COUNT(*) AS item_count,AVG(price) AS average_price FROM ${p};`;break;
    case 11:brief=b?`Для ${a} поверни city та кількість записів як person_count для кожного міста.`:`Для ${p} поверни category та сумарний stock як total_stock для кожної категорії.`;solution=b?`SELECT city,COUNT(*) AS person_count FROM ${a} GROUP BY city;`:`SELECT category,SUM(stock) AS total_stock FROM ${p} GROUP BY category;`;break;
    case 12:brief=b?`Для ${p} поверни category і item_count для категорій із щонайменше трьома позиціями.`:`Для ${p} поверни category і average_price для категорій із середньою ціною понад ${n}.`;solution=b?`SELECT category,COUNT(*) AS item_count FROM ${p} GROUP BY category HAVING COUNT(*)>=3;`:`SELECT category,AVG(price) AS average_price FROM ${p} GROUP BY category HAVING AVG(price)>${n};`;break;
    case 13:brief=`Для ${p} поверни name і ${b?'stock_band':'price_band'}: '${b?'available':'premium'}', якщо ${b?'stock > 0':`price >= ${threshold}`}, інакше '${b?'empty':'standard'}'.`;solution=`SELECT name,CASE WHEN ${b?'stock>0':`price>=${threshold}`} THEN '${b?'available':'premium'}' ELSE '${b?'empty':'standard'}' END AS ${b?'stock_band':'price_band'} FROM ${p};`;break;
    case 14:brief=`Для кожного запису ${o} поверни id як order_id і ${b?'city як customer_city':'name як customer_name'} відповідного запису ${a}; зв’язок — customer_id → id.`;solution=`SELECT o.id AS order_id,c.${b?'city':'name'} AS customer_${b?'city':'name'} FROM ${o} o JOIN ${a} c ON c.id=o.customer_id;`;break;
    case 15:brief=b?`Поверни name і id пов’язаного запису ${o} як order_id для всіх ${a}, зберігши також тих, у кого немає записів у ${o}.`:`Поверни name з ${a} для тих, у кого немає жодного запису в ${o}.`;solution=b?`SELECT c.name,o.id AS order_id FROM ${a} c LEFT JOIN ${o} o ON o.customer_id=c.id;`:`SELECT c.name FROM ${a} c LEFT JOIN ${o} o ON o.customer_id=c.id WHERE o.id IS NULL;`;break;
    case 16:brief=`Для ${l} поверни ${b?'product_id':'order_id'} та суму quantity × unit_price як total для кожного ${b?'product_id':'order_id'}.`;solution=`SELECT ${b?'product_id':'order_id'},SUM(quantity*unit_price) AS total FROM ${l} GROUP BY ${b?'product_id':'order_id'};`;break;
    case 17:brief=`Для кожного запису ${a}, включно з тими, хто не має ${o}, поверни ${b?'name':'id AS customer_id'} і кількість пов’язаних записів ${o} як order_count.`;solution=`SELECT ${b?'c.name':'c.id AS customer_id'},COUNT(o.id) AS order_count FROM ${a} c LEFT JOIN ${o} o ON o.customer_id=c.id GROUP BY c.id${b?',c.name':''};`;break;
    case 18:{const name=b?'labels':'notes',column=b?'label':'body';brief=`Створи порожню таблицю ${name}: id — integer із автоматичною генерацією та первинним ключем; ${column} — обов’язковий унікальний text.`;solution=`CREATE TABLE ${name}(id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,${column} text NOT NULL UNIQUE);`;verify=`SELECT column_name,data_type,is_nullable,is_identity FROM information_schema.columns WHERE table_schema='public' AND table_name='${name}' ORDER BY ordinal_position;`;metadata=`SELECT contype FROM pg_constraint WHERE conrelid='${name}'::regclass ORDER BY contype;`;probes=[{sql:`INSERT INTO ${name}(${column}) VALUES('sample');`,reject:false},{sql:`INSERT INTO ${name}(${column}) VALUES('sample'),('sample');`,reject:true},{sql:`INSERT INTO ${name}(${column}) VALUES(NULL);`,reject:true},{sql:`INSERT INTO ${name}(id,${column}) VALUES(99,'custom');`,reject:true}];break;}
    case 19:brief=`Додай у ${a} запис id ${b?21:20}, name '${b?'Софія':'Данило'}', city '${b?'Одеса':'Київ'}', email NULL. Решту даних збережи.`;solution=`INSERT INTO ${a}(id,name,city,email) VALUES(${b?21:20},'${b?'Софія':'Данило'}','${b?'Одеса':'Київ'}',NULL);`;verify=`SELECT * FROM ${a} ORDER BY id;`;break;
    case 20:brief=`У ${p} збільш stock на ${b?3:5} для id ${b?2:1}. Інші рядки й колонки не змінюй.`;solution=`UPDATE ${p} SET stock=stock+${b?3:5} WHERE id=${b?2:1};`;verify=`SELECT * FROM ${p} ORDER BY id;`;break;
    case 21:brief=b?`Видали з ${p} позицію id 8 та її рядки з ${l}. Інші дані залиш незмінними.`:`Видали з ${a} запис id 6, який не має пов’язаних ${o}. Інші дані залиш незмінними.`;solution=b?`DELETE FROM ${l} WHERE product_id=8; DELETE FROM ${p} WHERE id=8;`:`DELETE FROM ${a} WHERE id=6;`;verify=b?`SELECT 'item' AS kind,row_to_json(p)::text AS data FROM ${p} p UNION ALL SELECT 'line',row_to_json(l)::text FROM ${l} l ORDER BY 1,2;`:`SELECT * FROM ${a} ORDER BY id;`;break;
    case 22:brief=`Додай у ${a} id ${b?20:1}, name 'Софія', city 'Полтава', email 'sofia@example.com'. Якщо id вже існує, зміни тільки city, зберігши решту полів.`;solution=`INSERT INTO ${a}(id,name,city,email) VALUES(${b?20:1},'Софія','Полтава','sofia@example.com') ON CONFLICT(id) DO UPDATE SET city=EXCLUDED.city;`;verify=`SELECT * FROM ${a} ORDER BY id;`;break;
    case 23:brief=`Для ${p} поверни name і price для позицій із ціною ${b?'нижче':'вище'} середньої ціни всіх позицій.`;solution=`SELECT name,price FROM ${p} WHERE price${b?'<':'>'}(SELECT AVG(price) FROM ${p});`;break;
    case 24:brief=`Поверни name з ${a} для тих, у кого ${b?'немає жодного':'є хоча б один'} запис${b?'у':' із status = paid'} в ${o}.`;solution=`SELECT c.name FROM ${a} c WHERE ${b?'NOT ':''}EXISTS(SELECT 1 FROM ${o} o WHERE o.customer_id=c.id${b?'':" AND o.status='paid'"});`;break;
    case 25:brief=`Поверни order_id і total — суму quantity × unit_price з ${l} для замовлень із total ${b?'не більше':'більше'} ${n+60}. Окремий іменований крок може спростити звіт.`;solution=`WITH totals AS(SELECT order_id,SUM(quantity*unit_price) AS total FROM ${l} GROUP BY order_id) SELECT order_id,total FROM totals WHERE total${b?'<=':'>'}${n+60};`;break;
    case 26:brief=`Для ${p} поверни name, category та price_rank — щільний ранг ціни в межах категорії, ${b?'найнижча':'найвища'} ціна має ранг 1.`;solution=`SELECT name,category,DENSE_RANK() OVER(PARTITION BY category ORDER BY price ${b?'ASC':'DESC'}) AS price_rank FROM ${p};`;break;
    case 27:brief=`Для ${p} поверни id та running_${b?'stock':'price'} — накопичувальну суму ${b?'stock':'price'} від першого рядка до поточного за id. Покажи результат за зростанням id.`;solution=`SELECT id,SUM(${b?'stock':'price'}) OVER(ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_${b?'stock':'price'} FROM ${p} ORDER BY id;`;ordered=true;break;
    case 28:brief=`Для ${o} поверни ${b?'year':'month'} — перший день ${b?'року':'місяця'} як date — та order_count, кількість записів за цей період.`;solution=`SELECT DATE_TRUNC('${b?'year':'month'}',ordered_at)::date AS ${b?'year':'month'},COUNT(*) AS order_count FROM ${o} GROUP BY 1;`;break;
    case 29:brief=b?`Для ${a} поверни name і довжину name як name_length.`:`Для ${a} поверни name і email у нижньому регістрі як email_lower; виключи відсутні email.`;solution=b?`SELECT name,LENGTH(name) AS name_length FROM ${a};`:`SELECT name,LOWER(email) AS email_lower FROM ${a} WHERE email IS NOT NULL;`;break;
    case 30:brief=`Поверни name з ${p}, де details містить ${b?"level = beginner":"color = black"}.`;solution=`SELECT name FROM ${p} WHERE details->>'${b?'level':'color'}'='${b?'beginner':'black'}';`;break;
    case 31:brief=`Поверни name з ${p}, у яких масив tags містить '${b?'gift':'beginner'}'.`;solution=`SELECT name FROM ${p} WHERE '${b?'gift':'beginner'}'=ANY(tags);`;break;
    case 32:{const name=b?'items_category_idx':'events_customer_idx',table=b?p:o,column=b?'category':'customer_id';brief=`Створи B-tree індекс ${name} на ${table}(${column}).`;solution=`CREATE INDEX ${name} ON ${table}(${column});`;verify=`SELECT indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND indexname='${name}';`;break;}
    case 33:brief=b?`У транзакції збільш stock позиції id 1 у ${p} на 5, потім скасуй зміни. Усі дані мають лишитися початковими.`:`У транзакції перенеси дві одиниці stock у ${p} від id 1 до id 2 та зафіксуй зміни; решту даних збережи.`;solution=b?`BEGIN; UPDATE ${p} SET stock=stock+5 WHERE id=1; ROLLBACK;`:`BEGIN; UPDATE ${p} SET stock=stock-2 WHERE id=1; UPDATE ${p} SET stock=stock+2 WHERE id=2; COMMIT;`;verify=`SELECT * FROM ${p} ORDER BY id;`;transaction={table:p,end:b?'rollback':'commit'};break;
    case 34:{const name=b?'product_totals':'order_totals',key=b?'product_id':'order_id';brief=`Створи представлення ${name} з колонками ${key} і total — сумою quantity × unit_price з ${l} за кожним ${key}.`;solution=`CREATE VIEW ${name} AS SELECT ${key},SUM(quantity*unit_price) AS total FROM ${l} GROUP BY ${key};`;verify=`SELECT ${key},total FROM ${name} ORDER BY ${key};`;metadata=`SELECT table_type FROM information_schema.tables WHERE table_schema='public' AND table_name='${name}';`;break;}
    case 35:brief=`Для всіх ${a} поверни customer_id, name і paid_total — суму quantity × unit_price лише за ${o} зі status = '${b?'pending':'paid'}'. За відсутності покупок — 0. Сортуй за paid_total за спаданням, потім customer_id.`;solution=`SELECT c.id AS customer_id,c.name,COALESCE(SUM(i.quantity*i.unit_price),0) AS paid_total FROM ${a} c LEFT JOIN ${o} o ON o.customer_id=c.id AND o.status='${b?'pending':'paid'}' LEFT JOIN ${l} i ON i.order_id=o.id GROUP BY c.id,c.name ORDER BY paid_total DESC,customer_id;`;ordered=true;break;
    case 36:brief=`Для всіх ${p} поверни product_id, name, units_sold і revenue лише за ${o} зі status = '${b?'pending':'paid'}'; за відсутності продажів — 0. Сортуй за revenue за спаданням, потім product_id.`;solution=`SELECT p.id AS product_id,p.name,COALESCE(SUM(i.quantity) FILTER(WHERE o.status='${b?'pending':'paid'}'),0) AS units_sold,COALESCE(SUM(i.quantity*i.unit_price) FILTER(WHERE o.status='${b?'pending':'paid'}'),0) AS revenue FROM ${p} p LEFT JOIN ${l} i ON i.product_id=p.id LEFT JOIN ${o} o ON o.id=i.order_id GROUP BY p.id,p.name ORDER BY revenue DESC,product_id;`;ordered=true;break;
    default:throw new Error('Невідома тема PostgreSQL.');
  }
  let extraSkills:string[]=[];
  if(variant>=2){
    const extra=additionalVariant(index,variant,d,n);
    brief=extra.brief;solution=extra.solution;ordered=!!extra.ordered;
    verify=extra.verify;metadata=extra.catalog;probes=extra.probes;transaction=extra.transaction;extraSkills=extra.extraSkills||[];
  }
  const required=expandSkills([topicIds[index],...(index===21&&variant===1?['joins']:[]),...extraSkills]);
  const templateId=`${topicIds[index]}:${variant}`;
  return {moduleId:'postgresql',contentVersion:CONTENT_VERSION,id:`${templateId}:${seed}`,templateId,topicIds:required,seed,difficulty,title:`${d.title} · ${catalog[index].title}`,brief:`${d.title}: потрібен невеликий робочий результат.\n\n${brief}`,hints:[],starter:'-- Напиши свій запит тут\n',tables:fixture(d,seed,0).tables,payload:{domainId:d.id,solution,ordered,verify,catalog:metadata,probes,transaction} satisfies SQLPayload};
}
export function generateTasks(context:GenerationContext):Task[] {
  const known=new Set(context.confirmedTopicIds);const r=random(context.seed);
  const candidates=catalog.map((_,i)=>i).flatMap(i=>Array.from({length:VARIANTS_PER_TOPIC},(_,v)=>makeTask(i,v,Math.floor(r()*0xffffffff)))).filter(t=>t.topicIds.every(id=>known.has(id)));
  if(!candidates.length)throw new Error('Ще немає підтверджених тем для повторення. Спочатку здай вправу в тренажері.');
  const family=(id:string)=>id.split(':').slice(0,2).join(':');
  const recent=context.sessions.filter(s=>Date.parse(s.startedAt)>Date.parse(context.now)-7*86400000).flatMap(s=>s.tasks.map(t=>family(t.templateId)));
  const score=(t:Task)=>Math.min(...t.topicIds.map(id=>{const h=context.history[id];return !h||!h.lastReviewedAt?-1e15:Date.parse(h.dueAt)<=Date.parse(context.now)?Date.parse(h.dueAt):1e15+Date.parse(h.lastReviewedAt);}));
  const primaryIndex=(t:Task)=>topicIds.indexOf(t.templateId.split(':')[0]);
  const chosen:Task[]=[];
  const practiced=functionReviews(context.sessions);
  const last=context.sessions.filter(s=>s.outcome==='completed'&&s.mode!=='demo').slice(-5);
  const average=last.length?last.reduce((s,x)=>s+x.activeMs,0)/last.length:600000;
  const easier=average>15*60000, harder=average<5*60000;
  for(let slot=0;slot<3;slot++){
    let pool=candidates.filter(t=>!chosen.some(c=>family(c.templateId)===t.templateId));
    if(!pool.length)pool=[...candidates];
    if(slot===1){
      const alreadyChosen=new Set(chosen.flatMap(task=>practiceProfile(task).focus));
      const functionPractice=pool.map(task=>({task,focus:practiceProfile(task).focus.filter(name=>!alreadyChosen.has(name))}))
        .filter(candidate=>candidate.focus.length)
        .map(candidate=>({task:candidate.task,age:Math.min(...candidate.focus.map(name=>practiced.get(name)??0))}));
      if(functionPractice.length){
        const oldest=Math.min(...functionPractice.map(candidate=>candidate.age));
        pool=functionPractice.filter(candidate=>candidate.age===oldest).map(candidate=>candidate.task);
      }
    }
    const differentTopics=pool.filter(t=>!chosen.some(c=>c.topicIds[0]===t.topicIds[0]));
    if(differentTopics.length)pool=differentTopics;
    if(slot===0){
      const cap=Math.min(easier?4:9,Math.max(...candidates.map(primaryIndex)));
      const warm=pool.filter(t=>primaryIndex(t)>=Math.min(2,cap)&&primaryIndex(t)<=cap);if(warm.length)pool=warm;
    }
    pool=distinctPractice(pool,chosen);
    const fresh=pool.filter(t=>!recent.includes(t.templateId));if(fresh.length)pool=fresh;
    pool.sort((a,b)=>score(a)-score(b)||(slot===2&&easier?primaryIndex(a)-primaryIndex(b):primaryIndex(b)-primaryIndex(a)));
    const base=pool[0];const index=primaryIndex(base);
    // New seed also for a repeated family when the curriculum is very small.
    const task=makeTask(index,Number(base.templateId.split(':')[1]),Math.floor(r()*0xffffffff),slot===0?0:harder?2:1);
    if(slot===2||harder&&slot===1)combineTask(task,known);
    chosen.push(task);
  }
  return chosen;
}
export function combineTask(task:Task,known:Set<string>):void {
  const index=topicIds.indexOf(task.templateId.split(':')[0]);const payload=task.payload as SQLPayload;
  const domain=domains.find(d=>d.id===payload.domainId)!;
  const stockCase=index===13&&[1,3].includes(Number(task.templateId.split(':')[1]));
  if([1,2,3,10,11,12,13].includes(index)&&!stockCase&&known.has('where')&&payload.solution.includes(`FROM ${domain.items}`)){
    payload.solution=payload.solution.replace(`FROM ${domain.items}`,`FROM ${domain.items} WHERE stock>0`);
    task.brief+='\n\nУ цьому звіті враховуй лише позиції зі stock > 0.';
    task.topicIds=expandSkills([...task.topicIds,'where']);task.templateId+=':stock';
  }
  const projectsName=/^SELECT name(?:,|\s+FROM)/.test(payload.solution);
  if([1,2,4,5,6,7,8,13,23,29,30,31].includes(index)&&projectsName&&known.has('ordering')){
    payload.solution=payload.solution.replace(/;\s*$/,' ORDER BY name;');payload.ordered=true;
    task.brief+='\n\nПокажи результат за name за зростанням.';
    task.topicIds=expandSkills([...task.topicIds,'ordering']);task.templateId+=':sorted';
  }
  task.id=`${task.templateId}:${task.seed}`;
}
