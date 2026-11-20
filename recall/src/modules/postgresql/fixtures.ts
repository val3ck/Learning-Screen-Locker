import type {DataTable} from '../../core/contracts';
export interface Domain {id:string; title:string; actors:string; items:string; events:string; lines:string; names:string[]; categories:string[]; actorLabel:string; itemLabel:string}
export const domains:Domain[]=[
 {id:'shop',title:'Магазин',actors:'customers',items:'products',events:'orders',lines:'order_items',names:['Клавіатура','Миша','SQL довідник','Лампа','Блокнот','Навушники','Алгоритми','Горнятко'],categories:['Техніка','Книги','Дім','Офіс'],actorLabel:'покупців',itemLabel:'товарів'},
 {id:'library',title:'Книжковий клуб',actors:'members',items:'books',events:'purchases',lines:'purchase_items',names:['Основи SQL','Індекси','Практика Python','Мережі','Робочий зошит','Архітектура','Алгоритми','Постгрес'],categories:['Бази даних','Код','Системи','Нотатки'],actorLabel:'учасників',itemLabel:'книжок'},
 {id:'support',title:'Служба підтримки',actors:'clients',items:'services',events:'invoices',lines:'invoice_lines',names:['Аудит SQL','Налаштування','Підтримка','Міграція','Консультація','Моніторинг','Навчання','Звіт'],categories:['Бази даних','Сервіс','Розробка','Аналітика'],actorLabel:'клієнтів',itemLabel:'послуг'},
 {id:'education',title:'Навчальний центр',actors:'students',items:'courses',events:'enrollments',lines:'enrollment_items',names:['Основи SQL','Фільтри','Python','Мережі','Практикум','Архітектура','Алгоритми','Аналітика'],categories:['Бази даних','Код','Системи','Практика'],actorLabel:'студентів',itemLabel:'курсів'},
 {id:'warehouse',title:'Склад',actors:'suppliers',items:'materials',events:'shipments',lines:'shipment_items',names:['Кабель','Адаптер','Папір','Коробка','Етикетка','Термінал','Пакування','Кріплення'],categories:['Електроніка','Витратні','Пакування','Обладнання'],actorLabel:'постачальників',itemLabel:'матеріалів'},
 {id:'booking',title:'Бронювання',actors:'guests',items:'rooms',events:'bookings',lines:'booking_items',names:['Студія','Люкс','Сімейний','Стандарт','Міні','Панорама','Комфорт','Мансарда'],categories:['Преміум','Стандарт','Сімейні','Економ'],actorLabel:'гостей',itemLabel:'номерів'}
];
export function random(seed:number):()=>number {let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=Math.imul(x^(x>>>15),1|x);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const lit=(value:unknown):string=>value===null?'NULL':typeof value==='number'?String(value):`'${String(value).replaceAll("'","''")}'`;
export function fixture(domain:Domain,seed:number,variant:number):{sql:string; tables:DataTable[]} {
  const r=random(seed+variant*104729);const shift=variant*7+Math.floor(r()*9);
  const actors=[['id','integer · PK'],['name','text'],['city','text'],['email','text · nullable']];
  const items=[['id','integer · PK'],['name','text'],['category','text'],['price','numeric(10,2)'],['stock','integer'],['details','jsonb'],['tags','text[]']];
  const events=[['id','integer · PK'],['customer_id','integer · FK'],['ordered_at','date'],['status','text']];
  const lines=[['order_id','integer · FK'],['product_id','integer · FK'],['quantity','integer'],['unit_price','numeric(10,2)']];
  const ar:unknown[][]=[[1,'Анна','Київ',variant===2?null:'Anna@example.com'],[2,'Богдан','Львів','bohdan@example.com'],[3,'Катерина','Київ',null],[4,'Максим','Одеса','maksym@example.com'],[5,'Олена','Львів',null],[6,'Тарас','Дніпро','taras@example.com']];
  const prices=[80,30,25,45,8,120,60,15];
  const ir:unknown[][]=domain.names.map((name,i)=>[i+1,name,domain.categories[[0,0,1,2,3,0,1,2][i]],prices[i]+shift+(variant===2&&i===1?50:0),[12,25,40,18,100,8,15,0][i]+(i===7?0:variant),JSON.stringify({color:['black','white','blue'][i%3],level:i%2?'advanced':'beginner'}),i%2?'{beginner,gift}':'{popular}']);
  const er:unknown[][]=[[1,1,'2026-01-05','paid'],[2,2,'2026-01-12','paid'],[3,1,'2026-02-03','paid'],[4,3,'2026-02-10','pending'],[5,4,'2026-02-15','paid'],[6,2,'2026-03-01','cancelled'],[7,4,'2026-03-11','paid']];
  const lr:unknown[][]=[[1,1,1,80+shift],[1,3,2,25+shift],[2,2,1,30+shift],[2,5,3,8+shift],[3,6,1,120+shift],[3,8,2,15+shift],[4,4,1,45+shift],[5,7,1,60+shift],[5,3,1,25+shift],[6,1,1,80+shift],[7,2,2,30+shift],[7,8,1,15+shift]];
  if(variant){ar.push([7,'Ірина','Полтава',null]);ir[0][1]=variant===1?domain.names[0].toUpperCase():domain.names[0].toLowerCase();ir.push([9,'SQL '+domain.names[0],domain.categories[1],80+shift,4,'{"color":"black"}','{beginner}']);er.push([8,7,'2026-04-01',variant===2?'pending':'paid']);lr.push([8,9,3,80+shift]);}
  if(variant===2){ar[1][2]='Одеса';er[0][3]='cancelled';ir[3][2]=domain.categories[0];}
  const table=(name:string,columns:string[][],rows:unknown[][]):DataTable=>({name,columns:columns.map(([name,type])=>({name,type})),rows:rows.map(row=>Object.fromEntries(columns.map(([key],i)=>[key,row[i]])))});
  const sql=`CREATE TABLE ${domain.actors}(id integer PRIMARY KEY,name text NOT NULL,city text,email text);
CREATE TABLE ${domain.items}(id integer PRIMARY KEY,name text NOT NULL,category text NOT NULL,price numeric(10,2) NOT NULL CHECK(price>=0),stock integer NOT NULL CHECK(stock>=0),details jsonb NOT NULL DEFAULT '{}',tags text[] NOT NULL DEFAULT '{}');
CREATE TABLE ${domain.events}(id integer PRIMARY KEY,customer_id integer NOT NULL REFERENCES ${domain.actors}(id),ordered_at date NOT NULL,status text NOT NULL CHECK(status IN ('paid','pending','cancelled')));
CREATE TABLE ${domain.lines}(order_id integer REFERENCES ${domain.events}(id),product_id integer REFERENCES ${domain.items}(id),quantity integer NOT NULL CHECK(quantity>0),unit_price numeric(10,2) NOT NULL CHECK(unit_price>=0),PRIMARY KEY(order_id,product_id));
${[[domain.actors,ar],[domain.items,ir],[domain.events,er],[domain.lines,lr]].map(([name,rows])=>`INSERT INTO ${name} VALUES ${(rows as unknown[][]).map(row=>`(${row.map(lit).join(',')})`).join(',')};`).join('\n')}`;
  return {sql,tables:[table(domain.actors,actors,ar),table(domain.items,items,ir),table(domain.events,events,er),table(domain.lines,lines,lr)]};
}
