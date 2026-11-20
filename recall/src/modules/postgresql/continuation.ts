import type {GenerationContext,LessonPreview,SessionRecord,Task} from '../../core/contracts';
import {catalog} from './catalog';
import {makeTask,VARIANTS_PER_TOPIC} from './templates';
import {random} from './fixtures';
import {distinctPractice} from './practice-profile';
import {formatSQL} from './solution-review';
import type {SQLPayload} from './types';

export function extraTask(context:GenerationContext,session:SessionRecord):Task {
  const weak=session.hintLevels.some(n=>n>0)||session.attempts.some(a=>a.check&&!a.technical&&a.status!=='correct');
  if(context.allowNewTopic&&!weak&&!session.tasks.some(t=>t.learning)){
    const preview=nextLesson(context.confirmedTopicIds);
    if(preview){const index=catalog.findIndex(t=>t.id===preview.topicId),task=makeTask(index,0,context.seed,1);task.learning={topicId:preview.topicId,title:preview.title,explanation:preview.explanation};task.selectionReason='Наступне поняття для практики. Після правильної перевірки ця тема з’являтиметься в наступних повтореннях Recall.';return task;}
  }
  const known=new Set(context.confirmedTopicIds),r=random(context.seed);
  const candidates=catalog.flatMap((_,index)=>Array.from({length:VARIANTS_PER_TOPIC},(_,variant)=>makeTask(index,variant,Math.floor(r()*0xffffffff),2))).filter(t=>t.topicIds.every(id=>known.has(id)));
  if(!candidates.length)throw new Error('Немає підтверджених тем для додаткової вправи.');
  const weakness=(topicId:string)=>{
    const h=context.history[topicId];
    const current=session.tasks.filter(t=>t.topicIds[0]===topicId);
    const failed=session.attempts.filter(a=>!a.technical&&(a.status==='incorrect'||a.status==='error')&&current.some(t=>t.id===a.taskId)).length;
    const helped=current.filter(t=>session.hintLevels[session.tasks.indexOf(t)]>0).length;
    return failed*4+helped*2+(h?(h.missed*2+h.assisted)/(h.independent+h.assisted+h.missed+1):0);
  };
  const unused=candidates.filter(t=>!session.tasks.some(old=>old.templateId.split(':').slice(0,2).join(':')===t.templateId));
  const pool=distinctPractice(unused.length?unused:candidates,session.tasks);
  pool.sort((a,b)=>weakness(b.topicIds[0])-weakness(a.topicIds[0])||Number(session.tasks.some(t=>t.topicIds[0]===a.topicIds[0]))-Number(session.tasks.some(t=>t.topicIds[0]===b.topicIds[0]))||catalog.findIndex(t=>t.id===b.topicIds[0])-catalog.findIndex(t=>t.id===a.topicIds[0]));
  const task=pool[0];
  task.selectionReason=weakness(task.topicIds[0])>0?'Повернемося до теми, де знадобилася допомога або були помилки.':'Є ще трохи часу — закріпимо іншу вже вивчену навичку.';
  return task;
}

const primers=[
  'SELECT читає дані. Зірочка означає всі колонки, FROM задає таблицю. Це не змінює збережені рядки.',
  'Замість зірочки назви потрібні колонки через кому. Їхній порядок у SELECT стає порядком колонок результату.',
  'У SELECT можна обчислювати значення. AS дає обчисленій колонці зрозуміле ім’я; сама таблиця не змінюється.',
  'ORDER BY задає порядок результату. DESC — спадання, ASC — зростання. Другий ключ розв’язує нічиї.',
  'WHERE залишає рядки, для яких умова істинна. Текстові значення пишуться в одинарних лапках.',
  'AND вимагає виконання обох умов, OR — хоча б однієї. AND має вищий пріоритет, тому для змішаних правил використовуй дужки.',
  'IN перевіряє належність до списку. BETWEEN перевіряє діапазон, включаючи обидві межі.',
  'ILIKE порівнює текст із шаблоном без урахування регістру. % відповідає довільному фрагменту, _ — одному символу.',
  'NULL означає відсутнє значення. Перевіряй його через IS NULL. COALESCE вибирає перше не-NULL значення.',
  'DISTINCT прибирає дублікати вибраних рядків. LIMIT обмежує їхню кількість; для передбачуваної верхівки потрібен стабільний ORDER BY.',
  'Агрегати збирають багато рядків в один підсумок. COUNT(*) рахує рядки, SUM додає значення, AVG обчислює середнє.',
  'GROUP BY створює окрему групу для кожного ключа. Агрегат обчислюється незалежно всередині кожної групи.',
  'WHERE відбирає початкові рядки, HAVING — готові групи після обчислення агрегатів.',
  'CASE створює значення за умовами. Перемагає перша відповідна WHEN-гілка, ELSE обробляє решту.',
  'JOIN поєднує рядки двох таблиць. ON задає правило зв’язку: наприклад, зовнішній ключ документа дорівнює id клієнта. Псевдоніми допомагають розрізняти однакові назви полів.',
  'LEFT JOIN зберігає всі рядки лівої таблиці. За відсутності зв’язку праві поля будуть NULL; так можна знайти сутності без документів.',
  'У рядка документа є своя кількість і зафіксована ціна. Добуток дає вартість рядка; сума за ключем документа — його підсумок.',
  'JOIN може повторити сутність для кожного пов’язаного рядка. Рахуй потрібний ключ; для нульових зв’язків важлива різниця між COUNT(*) і COUNT(праве поле).',
  'CREATE TABLE задає форму даних. Типи, первинний ключ, NOT NULL і UNIQUE описують правила, що діятимуть для кожного запису.',
  'INSERT додає рядки. Явно називай колонки, щоб вставка не залежала від фізичного порядку полів у таблиці.',
  'UPDATE змінює значення у рядках, вибраних WHERE. Нове значення можна обчислити зі старого, наприклад збільшити запас.',
  'DELETE видаляє рядки, вибрані WHERE. Залежні записи й зовнішні ключі можуть обмежувати видалення.',
  'INSERT ... ON CONFLICT обробляє конфлікт унікальності. EXCLUDED містить запропоновані значення; оновлюй лише поля, які дозволяє вимога.',
  'Підзапит — запит усередині іншого запиту. Скалярний підзапит повертає одне значення, наприклад середню ціну для порівняння.',
  'EXISTS перевіряє, чи повернув підзапит хоча б один рядок. Він може посилатися на поточний рядок зовнішнього запиту; NOT EXISTS шукає відсутність зв’язку.',
  'WITH називає проміжний результат у межах одного запиту. Це допомагає розділити складний звіт на окремі зрозумілі кроки.',
  'Віконні функції обчислюють значення серед пов’язаних рядків, не згортаючи їх. PARTITION BY задає групи, ORDER BY у вікні — правило ранжування.',
  'Агрегат із OVER може накопичувати значення від початку до поточного рядка. Явна ROWS-рамка та стабільний ключ роблять правило однозначним.',
  'DATE_TRUNC округлює дату до початку періоду. Приведення ::date залишає календарну дату; ціле число, додане до date, задає кількість днів.',
  'Текстові функції перетворюють значення у результаті: LOWER — нижній регістр, UPPER — верхній, LENGTH — кількість символів.',
  'JSONB зберігає структуровані значення. Оператор ->> дістає текст поля, який можна порівнювати або приводити до потрібного типу.',
  'Масив містить кілька значень одного типу. Вираз значення = ANY(масив) перевіряє, чи є потрібний елемент.',
  'Індекс — окрема структура для певного способу доступу до даних. Він може прискорювати читання, але також має вартість під час записів.',
  'BEGIN починає транзакцію. COMMIT фіксує всі її зміни разом, ROLLBACK скасовує їх.',
  'VIEW зберігає визначення запиту під ім’ям. Це повторно використовуваний звіт, а не готовий знімок рядків.',
  'Для звіту на клієнта спочатку визнач, які документи рахуються, потім їхню вартість. Збережи клієнтів без руху й заміни відсутні суми нулем.',
  'У звіті на позицію окремо визнач кількість і виручку за потрібними документами. Ліве з’єднання зберігає також позиції без продажів.'
];
export function nextLesson(confirmedTopicIds:string[]):LessonPreview|null {
  const known=new Set(confirmedTopicIds);
  const index=catalog.findIndex(t=>!known.has(t.id)&&t.prerequisites.every(id=>known.has(id)));
  if(index<0)return null;
  const task=makeTask(index,0,713),example=formatSQL((task.payload as SQLPayload).solution);
  return {topicId:catalog[index].id,title:catalog[index].title,explanation:primers[index],brief:task.brief,example,tables:task.tables.filter(table=>new RegExp(`\\b${table.name}\\b`).test(example))};
}
