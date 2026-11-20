import type {Topic} from '../../core/contracts';
export const CONTENT_VERSION='postgresql-1';
const definitions:[string,string,number,number[]][]=[
 ['select','Читання таблиці',1,[]],['columns','Потрібні колонки',1,[0]],['calculations','Обчислення й псевдоніми',1,[1]],['ordering','Сортування',1,[1]],
 ['where','Фільтрація рядків',2,[1]],['boolean','Поєднання умов',2,[4]],['ranges','Діапазони та списки',2,[4]],['patterns','Пошук тексту',2,[4]],['nulls','Відсутні значення',2,[4]],['top','Унікальні й найкращі результати',2,[3]],
 ['aggregates','Підсумки й кількість',3,[1]],['grouping','Групування',3,[10]],['having','Відбір груп',3,[11]],['case','Умовні значення',3,[2]],
 ['joins','Зв’язки таблиць',4,[1]],['left-join','Відсутні зв’язки',4,[14,8]],['line-totals','Суми позицій',4,[11,2]],['join-counts','Підрахунок зі зв’язками',4,[15,11]],
 ['create-table','Створення таблиць',5,[]],['insert','Додавання рядків',5,[0]],['update','Точкові зміни',5,[4,2]],['delete','Видалення рядків',5,[4]],['upsert','Обмеження й upsert',5,[19]],
 ['subquery','Підзапити',6,[4,10]],['exists','Перевірка існування',6,[4]],['cte','Іменовані кроки',6,[16,4]],['ranking','Ранги',6,[1]],['running','Накопичувальні підсумки',6,[3,10]],
 ['dates','Дати та періоди',7,[11]],['text','Текст і перетворення',7,[8]],['jsonb','Дані JSONB',7,[4]],['arrays','Масиви',7,[4]],['indexes','Індекси',7,[]],
 ['transactions','Транзакції',8,[20]],['views','Представлення',8,[16]],['customer-report','Звіт за клієнтами',8,[15,16,11,8,3]],['product-report','Звіт за позиціями',8,[15,16,11,8,3]]
];
export const topicIds=definitions.map(d=>d[0]);
export const catalog:Topic[]=definitions.map(([id,title,chapter,prerequisites])=>({id,title,chapter,prerequisites:prerequisites.map(i=>topicIds[i])}));
export function expandSkills(ids:string[]):string[]{const found=new Set<string>();function add(id:string){if(found.has(id))return;const t=catalog.find(t=>t.id===id);if(!t)return;found.add(id);t.prerequisites.forEach(add);}ids.forEach(add);return [...found];}
export const projectSkills:number[][]=[ [1,3,8], [3,8,9], [3,5,6], [2,3,5,9], [10], [2,8,10], [2,3,11], [3,6,12] ];
