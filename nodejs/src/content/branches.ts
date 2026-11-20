import type { Lesson } from './schema';

export const branchLessons: Lesson[] = [
  {
    "id": "react-markup",
    "moduleId": "react",
    "title": "HTML, CSS і доступна розмітка",
    "summary": "Семантична сторінка лишається зрозумілою без стилів та миші.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Підібрати семантичні елементи для змісту.",
      "Пов’язати підписи, кнопки та стани з діями користувача.",
      "Застосувати адаптивні стилі без втрати змісту."
    ],
    "task": "Створи доступну картку профілю: семантичний article, заголовок, опис і посилання. Порожнє ім’я відхиляй; текст користувача відображай як текст, а не HTML.",
    "steps": [
      "Опиши Props та перевір обов’язкове ім’я.",
      "Поверни article із h2, p і доступним посиланням.",
      "Пройди готову сторінку клавіатурою та перевір вузьку ширину."
    ],
    "hints": [
      "Повернення JSX має один кореневий елемент.",
      "React екранує звичайні рядкові значення.",
      "Посилання потребує зрозумілого тексту."
    ],
    "criteria": [
      "Картка має семантичну структуру та доступне посилання.",
      "Порожнє ім’я відхиляється.",
      "Ввід зі спеціальними символами не перетворюється на HTML."
    ],
    "mistakes": [
      "Використати div з onClick замість посилання або кнопки.",
      "Підставити HTML із зовнішнього рядка."
    ],
    "reviewQuestions": [
      "Чим посилання відрізняється від кнопки?",
      "Що станеться зі структурою після вимкнення CSS?"
    ],
    "extensions": [
      "Додай адаптивний CSS та перевір масштаб 200% у браузері.",
      "Додай довгий перекладений текст і перевір перенос без горизонтальної прокрутки."
    ],
    "sources": [
      {
        "title": "MDN: HTML semantics",
        "url": "https://developer.mozilla.org/en-US/docs/Glossary/Semantics"
      },
      {
        "title": "React: JSX",
        "url": "https://react.dev/learn/writing-markup-with-jsx"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Який елемент створює перехід на іншу сторінку?",
      "options": [
        "button",
        "a",
        "div з onClick"
      ],
      "answer": 1,
      "explanation": "Посилання описує навігацію, тому браузер і клавіатура вже знають, як з ним працювати."
    },
    "lab": {
      "language": "tsx",
      "starter": "import React from 'react';\nexport function ProfileCard({name, role, href}:{name:string;role:string;href:string}) {\n  throw new Error('Реалізуй картку');\n}\n",
      "solution": "import React from 'react';\nexport function ProfileCard({name, role, href}:{name:string;role:string;href:string}) {\n  if(!name.trim()) throw new Error('name_required');\n  return <article><h2>{name}</h2><p>{role}</p><a href={href}>Переглянути профіль {name}</a></article>;\n}\n",
      "tests": "test('semantic card and escaped text', async()=>{ const React=(await import('react')).default; const {renderToStaticMarkup}=await import('react-dom/server'); const html=renderToStaticMarkup(React.createElement(subject.ProfileCard,{name:'A <script>',role:'Інженер',href:'/a'})); assert.match(html,/<article>/); assert.match(html,/<h2>/); assert.match(html,/&lt;script&gt;/); assert.match(html,/<a href=\"\\/a\">/); assert.doesNotMatch(html,/<script>/); assert.throws(()=>renderToStaticMarkup(React.createElement(subject.ProfileCard,{name:' ',role:'x',href:'/'})),/name_required/); });",
      "dependencies": {
        "react": "^19.2.0",
        "react-dom": "^19.2.0"
      }
    }
  },
  {
    "id": "react-components",
    "moduleId": "react",
    "title": "Компоненти, props і списки",
    "summary": "Невеликі компоненти складаються в інтерфейс із чіткими контрактами.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Передавати дані через props.",
      "Розрізняти порожній список і помилку.",
      "Використовувати стабільні ключі списку."
    ],
    "task": "Створи TopicList для масиву тем з id і title. Порожній перелік показує пояснення. Список відображає посилання, не змінюючи вхідний масив.",
    "steps": [
      "Опиши readonly Topic і props.",
      "Поверни порожній стан або ul з li та посиланнями.",
      "Використай id як key та перевір незмінність масиву."
    ],
    "hints": [
      "Перевір length до map.",
      "Під час map повертай JSX для кожного елемента.",
      "Стабільний id годиться як key."
    ],
    "criteria": [
      "Порожній список має змістовний стан.",
      "Посилання містять відповідні заголовки.",
      "Вхідний масив не змінено."
    ],
    "mistakes": [
      "Використати index як ключ після сортування.",
      "Мутувати props методом sort."
    ],
    "reviewQuestions": [
      "Чому key має бути стабільним?",
      "Хто володіє даними, переданими через props?"
    ],
    "extensions": [
      "Додай сортування за заголовком зі збереженням ідентичності рядків.",
      "Розбий список на картку й секцію та перевір keyboard focus у браузері."
    ],
    "sources": [
      {
        "title": "React: Passing props",
        "url": "https://react.dev/learn/passing-props-to-a-component"
      },
      {
        "title": "React: Rendering lists",
        "url": "https://react.dev/learn/rendering-lists"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Який key підходить для списку, який можна сортувати?",
      "options": [
        "Поточний індекс",
        "Стабільний id елемента",
        "Випадкове число щоразу"
      ],
      "answer": 1,
      "explanation": "Стабільний id зберігає ідентичність елемента при зміні порядку."
    },
    "lab": {
      "language": "tsx",
      "starter": "import React from 'react';\nexport type Topic={id:string;title:string};\nexport function TopicList({topics}:{topics:readonly Topic[]}){throw new Error('Реалізуй список');}\n",
      "solution": "import React from 'react';\nexport type Topic={id:string;title:string};\nexport function TopicList({topics}:{topics:readonly Topic[]}){\n if(!topics.length)return <p>Тем поки немає</p>;\n return <ul>{topics.map(t=><li key={t.id}><a href={'/topics/'+encodeURIComponent(t.id)}>{t.title}</a></li>)}</ul>;\n}\n",
      "tests": "test('topics and empty state without mutation',async()=>{const React=(await import('react')).default;const {renderToStaticMarkup}=await import('react-dom/server');const data=Object.freeze([{id:'a',title:'Async'},{id:'b',title:'SQL'}]);const html=renderToStaticMarkup(React.createElement(subject.TopicList,{topics:data}));assert.match(html,/<ul>/);assert.match(html,/href=\"\\/topics\\/a\"/);assert.match(html,/Async/);assert.match(html,/SQL/);assert.match(renderToStaticMarkup(React.createElement(subject.TopicList,{topics:[]})),/Тем поки немає/);assert.deepEqual(data,[{id:'a',title:'Async'},{id:'b',title:'SQL'}]);});",
      "dependencies": {
        "react": "^19.2.0",
        "react-dom": "^19.2.0"
      }
    }
  },
  {
    "id": "react-state",
    "moduleId": "react",
    "title": "Стан, події та незмінні оновлення",
    "summary": "Стан задає те, що інтерфейс показує зараз.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Відрізняти локальний стан від props.",
      "Оновлювати масиви й об’єкти без мутації.",
      "Пов’язувати подію з наступним станом."
    ],
    "task": "Реалізуй toggleSelected для списку id. Додавання, повторне натискання, порожній стан і незмінність попереднього масиву мають працювати передбачувано.",
    "steps": [
      "Поверни новий масив для додавання й видалення.",
      "Захистися від порожнього id.",
      "Підключи функцію до прикладу з useState у власному клієнті."
    ],
    "hints": [
      "includes знаходить наявний елемент.",
      "filter прибирає лише потрібний id.",
      "Оператор spread створює новий масив."
    ],
    "criteria": [
      "Повторне натискання знімає вибір.",
      "Попередній масив не змінюється.",
      "Порожній id відхиляється."
    ],
    "mistakes": [
      "Викликати обробник під час рендеру.",
      "Змінити попередній масив через push або splice."
    ],
    "reviewQuestions": [
      "Чому updater-функція отримує previous?",
      "Коли стан слід підняти до батьківського компонента?"
    ],
    "extensions": [
      "Побудуй React-список із кнопками та лічильником вибраних тем.",
      "Додай збереження вибору на час сесії і перевір події швидких натискань."
    ],
    "sources": [
      {
        "title": "React: State",
        "url": "https://react.dev/learn/state-a-components-memory"
      },
      {
        "title": "React: Updating arrays",
        "url": "https://react.dev/learn/updating-arrays-in-state"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що потрібно повернути після перемикання елемента стану?",
      "options": [
        "Мутований старий масив",
        "Новий масив зі зміненим складом",
        "Нічого"
      ],
      "answer": 1,
      "explanation": "Нова структура відображає зміну явно й дає React можливість оновити інтерфейс."
    },
    "lab": {
      "language": "ts",
      "starter": "export function toggleSelected(ids:readonly string[],id:string):string[]{throw new Error('Реалізуй перемикання');}\n",
      "solution": "export function toggleSelected(ids:readonly string[],id:string):string[]{if(!id.trim())throw new Error('invalid_id');return ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];}\n",
      "tests": "test('toggle is immutable and validates id',()=>{const ids=Object.freeze(['a','b']);assert.deepEqual(subject.toggleSelected(ids,'a'),['b']);assert.deepEqual(subject.toggleSelected(ids,'c'),['a','b','c']);assert.deepEqual(ids,['a','b']);assert.deepEqual(subject.toggleSelected([],'z'),['z']);assert.throws(()=>subject.toggleSelected(ids,' '),/invalid_id/);});"
    }
  },
  {
    "id": "react-forms",
    "moduleId": "react",
    "title": "Форми та повідомлення про помилки",
    "summary": "Керовані поля поєднують введення, перевірку та зрозумілий зворотний зв’язок.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Зберігати значення форми в стані.",
      "Відокремити перевірку від відображення.",
      "Пов’язати помилку з відповідним полем."
    ],
    "task": "Реалізуй validateSignup, що повертає нормалізовані значення або точні повідомлення для полів. Перевір порожній email, невалідний формат, короткий пароль і коректний ввід.",
    "steps": [
      "Визнач тип результату з ok:true або ok:false.",
      "Нормалізуй пробіли в email та перевір межі.",
      "Додай тести та покажи повідомлення біля поля у React."
    ],
    "hints": [
      "trim видаляє крайні пробіли, але не виправляє некоректний email.",
      "Використай discriminated union для результату.",
      "Поверни окремі ключі email та password у помилках."
    ],
    "criteria": [
      "Успішний ввід нормалізований.",
      "Кожне невалідне поле має конкретну помилку.",
      "Пароль не входить у текст помилки."
    ],
    "mistakes": [
      "Перевіряти форму лише в браузері.",
      "Видаляти введені дані після помилки сервера."
    ],
    "reviewQuestions": [
      "Чому клієнтська валідація не захищає API?",
      "Навіщо aria-describedby?"
    ],
    "extensions": [
      "Збери React-форму з локальним і серверним станом помилки та перевір її клавіатурою.",
      "Додай асинхронну перевірку зайнятості email зі скасуванням попереднього запиту."
    ],
    "sources": [
      {
        "title": "React: Forms",
        "url": "https://react.dev/reference/react-dom/components/input"
      },
      {
        "title": "MDN: Form validation",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Де потрібно перевіряти дані форми для захисту сервісу?",
      "options": [
        "Лише у React",
        "На сервері для кожного запиту; клієнт також допомагає людині",
        "У TypeScript-типі"
      ],
      "answer": 1,
      "explanation": "Клієнтський код може бути змінений або пропущений, тому сервер завжди перевіряє ввід."
    },
    "lab": {
      "language": "ts",
      "starter": "export type Result={ok:true;email:string;password:string}|{ok:false;errors:{email?:string;password?:string}};\nexport function validateSignup(email:string,password:string):Result{throw new Error('Реалізуй перевірку');}\n",
      "solution": "export type Result={ok:true;email:string;password:string}|{ok:false;errors:{email?:string;password?:string}};\nexport function validateSignup(email:string,password:string):Result{const normalized=email.trim().toLowerCase();const errors:{email?:string;password?:string}={};if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalized)||normalized.length>254)errors.email='invalid_email';if(password.length<12)errors.password='password_too_short';return Object.keys(errors).length?{ok:false,errors}:{ok:true,email:normalized,password};}\n",
      "tests": "test('normalized result and field-specific failures',()=>{assert.deepEqual(subject.validateSignup(' A@B.COM ','abcdefghijkl'),{ok:true,email:'a@b.com',password:'abcdefghijkl'});const bad=subject.validateSignup('bad','secret');assert.equal(bad.ok,false);if(!bad.ok){assert.equal(bad.errors.email,'invalid_email');assert.equal(bad.errors.password,'password_too_short');assert.doesNotMatch(JSON.stringify(bad.errors),/secret/)}assert.equal(subject.validateSignup('x'.repeat(250)+'@a.com','abcdefghijkl').ok,false);});"
    }
  },
  {
    "id": "react-routing",
    "moduleId": "react",
    "title": "Маршрути й прямі посилання",
    "summary": "URL зберігає місце користувача й дозволяє повернутися до нього.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Розрізняти route й локальний стан.",
      "Підтримати прямі посилання на ресурс.",
      "Безпечно розібрати параметр маршруту."
    ],
    "task": "Реалізуй resolveRoute для /topics і /topics/:id. Невідомі шляхи та некоректні id повертають notFound; query-рядок не повинен змінити вибраний ресурс.",
    "steps": [
      "Відділи pathname від query.",
      "Перевір форму id та безпечно декодуй його.",
      "Додай notFound і перевір пряме посилання після оновлення."
    ],
    "hints": [
      "new URL(path, базова адреса) дістає pathname.",
      "decodeURIComponent може викинути помилку.",
      "Порожній або довгий id варто відхилити."
    ],
    "criteria": [
      "Список і сторінка теми розпізнаються.",
      "Невідомі та некоректні шляхи обробляються.",
      "Query не підмінює id."
    ],
    "mistakes": [
      "Вважати URL-параметр довіреним.",
      "Покладатися лише на клієнт для перевірки доступу."
    ],
    "reviewQuestions": [
      "Навіщо прямому посиланню fallback на хостингу?",
      "Де перевіряти право доступу до теми?"
    ],
    "extensions": [
      "Підключи React Router у клієнті та перевір перехід назад/уперед.",
      "Зроби сторінку 404 з фокусом на її заголовку та посиланням до каталогу."
    ],
    "sources": [
      {
        "title": "React Router: Declarative mode",
        "url": "https://reactrouter.com/start/declarative/installation"
      },
      {
        "title": "MDN: History API",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/History_API"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Хто має остаточно перевірити доступ до /topics/123?",
      "options": [
        "React Router",
        "Серверний API",
        "Regex у браузері"
      ],
      "answer": 1,
      "explanation": "Маршрут лише обирає сторінку. Право доступу до даних перевіряє сервер."
    },
    "lab": {
      "language": "ts",
      "starter": "export type Route={kind:'index'}|{kind:'topic';id:string}|{kind:'notFound'};\nexport function resolveRoute(path:string):Route{throw new Error('Реалізуй маршрути');}\n",
      "solution": "export type Route={kind:'index'}|{kind:'topic';id:string}|{kind:'notFound'};\nexport function resolveRoute(path:string):Route{try{const url=new URL(path,'https://example.invalid');if(url.pathname==='/topics')return {kind:'index'};const match=/^\\/topics\\/([^/]+)$/.exec(url.pathname);if(!match)return {kind:'notFound'};const id=decodeURIComponent(match[1]);return /^[a-zA-Z0-9_-]{1,36}$/.test(id)?{kind:'topic',id}:{kind:'notFound'};}catch{return {kind:'notFound'};}}\n",
      "tests": "test('routes, query and invalid inputs',()=>{assert.deepEqual(subject.resolveRoute('/topics'),{kind:'index'});assert.deepEqual(subject.resolveRoute('/topics/a-1?x=2'),{kind:'topic',id:'a-1'});assert.deepEqual(subject.resolveRoute('/topics/'),{kind:'notFound'});assert.deepEqual(subject.resolveRoute('/topics/%2F'),{kind:'notFound'});assert.deepEqual(subject.resolveRoute('/else'),{kind:'notFound'});});"
    }
  },
  {
    "id": "react-requests",
    "moduleId": "react",
    "title": "Запити, скасування та стани даних",
    "summary": "Клієнт показує завантаження, порожній результат і відмову окремо.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Передавати AbortSignal у fetch.",
      "Відрізняти HTTP-відмову від невалідного JSON.",
      "Уникати застарілої відповіді після нового запиту."
    ],
    "task": "Створи getTopics(fetcher, signal): перевір HTTP-статус, форму JSON і підтримай скасування. Тести замінюють fetch, тому працюють без мережі.",
    "steps": [
      "Передай signal у fetcher.",
      "Перевір response.ok до читання JSON.",
      "Валідуй, що topics — масив об’єктів з id і title."
    ],
    "hints": [
      "fetch(url,{signal}) передає скасування.",
      "response.json() повертає зовнішні дані невідомої форми.",
      "Покажи різні коди для HTTP-помилки та контракту."
    ],
    "criteria": [
      "Signal передається запиту.",
      "HTTP-відмова й невалідні дані розрізняються.",
      "AbortError проходить без маскування."
    ],
    "mistakes": [
      "Плутати порожній масив із мережевою помилкою.",
      "Вважати Promise.race реальним скасуванням fetch."
    ],
    "reviewQuestions": [
      "Чому запит може дати застарілий результат?",
      "Що перевіряти після успішного HTTP-статусу?"
    ],
    "extensions": [
      "Зроби React-екран із loading, error, empty і success; змінюй фільтр під час повільної відповіді.",
      "Додай кеш із TTL та інвалідацію після створення теми."
    ],
    "sources": [
      {
        "title": "MDN: Fetch API",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
      },
      {
        "title": "MDN: AbortController",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/AbortController"
      },
      {
        "title": "React: useEffect",
        "url": "https://react.dev/reference/react/useEffect"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Чи відхиляє fetch Promise на HTTP 404?",
      "options": [
        "Так, завжди",
        "Ні, потрібно перевірити response.ok",
        "Лише у TypeScript"
      ],
      "answer": 1,
      "explanation": "HTTP-відповідь 404 усе ще є виконаним мережевим запитом; перевір статус явно."
    },
    "lab": {
      "language": "ts",
      "starter": "export type Topic={id:string;title:string};\nexport async function getTopics(fetcher:typeof fetch,signal:AbortSignal):Promise<Topic[]>{throw new Error('Реалізуй клієнт');}\n",
      "solution": "export type Topic={id:string;title:string};\nexport async function getTopics(fetcher:typeof fetch,signal:AbortSignal):Promise<Topic[]>{const response=await fetcher('/api/topics',{signal});if(!response.ok)throw new Error('http_'+response.status);const data:unknown=await response.json();if(!Array.isArray(data)||!data.every(x=>x&&typeof x==='object'&&typeof x.id==='string'&&typeof x.title==='string'))throw new Error('invalid_topics');return data as Topic[];}\n",
      "tests": "test('signal, status, validation and cancellation',async()=>{const controller=new AbortController();let passed: AbortSignal | undefined;const fetcher: typeof fetch=async (_url,options)=>{passed=options?.signal ?? undefined;return new Response(JSON.stringify([{id:'a',title:'Async'}]),{status:200})};assert.deepEqual(await subject.getTopics(fetcher,controller.signal),[{id:'a',title:'Async'}]);assert.equal(passed,controller.signal);await assert.rejects(()=>subject.getTopics(async()=>new Response(null,{status:503}),controller.signal),/http_503/);await assert.rejects(()=>subject.getTopics(async()=>new Response(JSON.stringify([{id:1,title:'x'}]),{status:200}),controller.signal),/invalid_topics/);const cancel=async()=>{throw Object.assign(new Error('aborted'),{name:'AbortError'})};await assert.rejects(()=>subject.getTopics(cancel,controller.signal),{name:'AbortError'});});"
    }
  },
  {
    "id": "protocols-transports",
    "moduleId": "protocols",
    "title": "SSE та клієнт Node.js ↔ Go API",
    "summary": "Потоковий SSE у браузер і надійний виклик сусіднього Go-мікросервісу з AbortSignal та Zod.",
    "lectureMinutes": 20,
    "practiceMinutes": 50,
    "goals": [
      "Побудувати безпечний SSE-фрейм без ін’єкції CR/LF.",
      "Викликати Go API по HTTP з AbortSignal.timeout та Zod-валідацією контракту.",
      "Розділяти мережевий таймаут, HTTP 5xx і зламану схему відповіді."
    ],
    "task": "Реалізуй formatSse(id, event, payload) та fetchGoJobs(baseUrl, query, { fetcher, timeoutMs }): побудуй GET /api/jobs?q=..., передай AbortSignal.timeout(timeoutMs), перевір response.ok і провалідуй JSON через Zod ({ items: [{ id, title, salaryUsd }] }).",
    "steps": [
      "У formatSse заборони CR/LF у полях id/event і заверши фрейм порожнім рядком.",
      "У fetchGoJobs перевір baseUrl (лише http/https) та timeoutMs (>0), збери URL через searchParams.",
      "Оброби помилки: invalid_base_url, upstream_timeout при AbortError/TimeoutError, upstream_http_error при !ok, invalid_upstream_contract при збої JSON/Zod."
    ],
    "hints": [
      "Порожній query не має падати — просто передай q або пропусти параметр.",
      "Zod z.object({ items: z.array(...) }) автоматично відкине зайві поля з Go-відповіді.",
      "Зовнішній сервіс може повернути 200 OK із битим JSON — не довіряй чужому API без схеми."
    ],
    "criteria": [
      "SSE-фрейм екранує payload і відхиляє CR/LF ін’єкції.",
      "Валідна відповідь Go-сервісу повертає типізований масив без зайвих полів.",
      "Таймаут, HTTP 502/503 і порушений JSON-контракт дають чіткі контрольовані помилки."
    ],
    "mistakes": [
      "Викликати сусідній сервіс без таймауту (витік з’єднань і зависання Node).",
      "Приймати відповідь іншого сервісу через response.json() as GoResponse без перевірки."
    ],
    "reviewQuestions": [
      "Коли для live-оновлень краще SSE, а коли WebSocket?",
      "Як BFF на Node.js/NestJS ізолює фронтенд від збоїв Go-воркера?"
    ],
    "extensions": [
      "Підніми свій Go-сервіс (наприклад, JobParser) на :8080 і підключи цей клієнт у NestJS контролер.",
      "Додай SSE-маршрут @Sse('jobs/stream') у NestJS, який транслює статус парсингу в браузер."
    ],
    "sources": [
      {
        "title": "MDN: Server-sent events",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"
      },
      {
        "title": "Node.js AbortSignal.timeout",
        "url": "https://nodejs.org/api/globals.html#abortsignaltimeoutdelay"
      },
      {
        "title": "Zod Documentation",
        "url": "https://zod.dev/"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що робити, якщо Go-мікросервіс відповідає HTTP 200, але повернув невалідний формат поля?",
      "options": [
        "Довіритись, бо це внутрішній сервіс",
        "Відхилити на межі схемою Zod (invalid_upstream_contract) і повернути контрольовану помилку",
        "Зробити type assertion as Job[]"
      ],
      "answer": 1,
      "explanation": "Контракт між сервісами перевіряється під час виконання; падіння схеми одразу виявляє розсинхрон версій."
    },
    "lab": {
      "language": "ts",
      "dependencies": {
        "zod": "^4.6.7"
      },
      "starter": "import { z } from 'zod';\n\nexport const GoJobsResponseSchema = z.object({\n  items: z.array(z.object({\n    id: z.string().min(1),\n    title: z.string().min(1),\n    salaryUsd: z.number().int().nonnegative(),\n  })),\n});\n\nexport type GoJob = z.infer<typeof GoJobsResponseSchema>['items'][number];\n\nexport function formatSse(id: string, event: string, payload: unknown): string {\n  throw new Error('Реалізуй formatSse');\n}\n\nexport async function fetchGoJobs(\n  baseUrl: string,\n  query: string,\n  options: { fetcher?: typeof fetch; timeoutMs?: number } = {},\n): Promise<GoJob[]> {\n  throw new Error('Реалізуй fetchGoJobs із AbortSignal.timeout і Zod');\n}\n",
      "solution": "import { z } from 'zod';\n\nexport const GoJobsResponseSchema = z.object({\n  items: z.array(z.object({\n    id: z.string().min(1),\n    title: z.string().min(1),\n    salaryUsd: z.number().int().nonnegative(),\n  })),\n});\n\nexport type GoJob = z.infer<typeof GoJobsResponseSchema>['items'][number];\n\nexport function formatSse(id: string, event: string, payload: unknown): string {\n  for (const value of [id, event]) {\n    if (typeof value !== 'string' || !value || /[\\r\\n]/.test(value)) throw new Error('invalid_field');\n  }\n  return `id: ${id}\\nevent: ${event}\\ndata: ${JSON.stringify(payload)}\\n\\n`;\n}\n\nexport async function fetchGoJobs(\n  baseUrl: string,\n  query: string,\n  { fetcher = fetch, timeoutMs = 2000 }: { fetcher?: typeof fetch; timeoutMs?: number } = {},\n): Promise<GoJob[]> {\n  let url: URL;\n  try {\n    url = new URL('/api/jobs', baseUrl);\n  } catch {\n    throw new Error('invalid_base_url');\n  }\n  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid_base_url');\n  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('invalid_timeout');\n  if (query.trim()) url.searchParams.set('q', query.trim());\n  let res: Response;\n  try {\n    res = await fetcher(url.toString(), { signal: AbortSignal.timeout(timeoutMs), headers: { accept: 'application/json' } });\n  } catch (err) {\n    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) throw new Error('upstream_timeout');\n    throw err;\n  }\n  if (!res.ok) throw new Error('upstream_http_error');\n  let json: unknown;\n  try {\n    json = await res.json();\n  } catch {\n    throw new Error('invalid_upstream_contract');\n  }\n  const parsed = GoJobsResponseSchema.safeParse(json);\n  if (!parsed.success) throw new Error('invalid_upstream_contract');\n  return parsed.data.items;\n}\n",
      "tests": "test('SSE frame and injection rejection', () => {\n  assert.equal(subject.formatSse('7', 'updated', { text: 'a\\nb' }), 'id: 7\\nevent: updated\\ndata: {\"text\":\"a\\\\nb\"}\\n\\n');\n  assert.throws(() => subject.formatSse('x\\ndata:bad', 'updated', {}), /invalid_field/);\n  assert.throws(() => subject.formatSse('7', 'x\\r', {}), /invalid_field/);\n});\ntest('fetchGoJobs validates contract, forwards timeout signal and rejects bad upstream', async () => {\n  let seenUrl = ''; let hadSignal = false;\n  const jobs = await subject.fetchGoJobs('http://127.0.0.1:8080', ' nestjs ', {\n    timeoutMs: 1500,\n    fetcher: async (input, init) => {\n      seenUrl = String(input); hadSignal = init?.signal instanceof AbortSignal;\n      return new Response(JSON.stringify({ items: [{ id: '1', title: 'Strong Junior Node', salaryUsd: 1800, extraDebug: true }] }), { status: 200 });\n    },\n  });\n  assert.equal(seenUrl, 'http://127.0.0.1:8080/api/jobs?q=nestjs');\n  assert.equal(hadSignal, true);\n  assert.deepEqual(jobs, [{ id: '1', title: 'Strong Junior Node', salaryUsd: 1800 }]);\n  await assert.rejects(() => subject.fetchGoJobs('ftp://go:8080', 'go'), /invalid_base_url/);\n  await assert.rejects(() => subject.fetchGoJobs('http://go:8080', 'go', { fetcher: async () => new Response('err', { status: 502 }) }), /upstream_http_error/);\n  await assert.rejects(() => subject.fetchGoJobs('http://go:8080', 'go', { fetcher: async () => new Response(JSON.stringify({ items: [{ id: 1 }] }), { status: 200 }) }), /invalid_upstream_contract/);\n  await assert.rejects(() => subject.fetchGoJobs('http://go:8080', 'go', { timeoutMs: 10, fetcher: async (_u, init) => new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason))) }), /upstream_timeout/);\n});\n"
    }
  },
  {
    "id": "events-delivery",
    "moduleId": "events",
    "title": "Повторна доставка подій",
    "summary": "Обробник має зберігати правильний результат після повтору й тимчасового збою.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Пояснити at-least-once delivery.",
      "Пов’язати бізнес-ефект і запис inbox атомарно.",
      "Розрізнити підтвердження, retry і dead-letter."
    ],
    "task": "Реалізуй consume(event,store): валідовуй id, виконуй apply і markSeen в одному store.transaction, повторну доставку пропускай.",
    "steps": [
      "Перевір стабільний id події.",
      "Використай один tx для seen, apply та markSeen.",
      "Змоделюй повтор і збій усередині транзакції."
    ],
    "hints": [
      "Порт transaction отримує callback із tx.",
      "Позначка seen до ефекту втратить подію під час збою.",
      "Результат duplicate може бути окремим станом."
    ],
    "criteria": [
      "Повтор має лише один бізнес-ефект.",
      "Помилка не зберігає позначку seen.",
      "Операції виконуються в одному transaction callback."
    ],
    "mistakes": [
      "Зберігати dedup лише у Set процесу.",
      "Підтверджувати повідомлення до збереження ефекту."
    ],
    "reviewQuestions": [
      "Чому брокер повторно доставляє повідомлення?",
      "Яка межа атомарності у цьому прикладі?"
    ],
    "extensions": [
      "Замінити fake store на PostgreSQL із unique event_id і перевірити повтор після перезапуску.",
      "Підняти RabbitMQ у Docker, налаштувати acknowledgment, retry й dead-letter та зафіксувати сценарії."
    ],
    "sources": [
      {
        "title": "RabbitMQ: Work queues for JavaScript",
        "url": "https://www.rabbitmq.com/tutorials/tutorial-two-javascript"
      },
      {
        "title": "BullMQ: Idempotent jobs",
        "url": "https://docs.bullmq.io/patterns/idempotent-jobs"
      }
    ],
    "quiz": {
      "kind": "order",
      "question": "Яка послідовність належить одній транзакції?",
      "items": [
        {
          "id": "0",
          "text": "Перевірити seen"
        },
        {
          "id": "1",
          "text": "Застосувати ефект"
        },
        {
          "id": "2",
          "text": "Позначити seen"
        }
      ],
      "answer": [
        "0",
        "1",
        "2"
      ],
      "explanation": "Перевірка, ефект і позначка виконуються атомарно. За відмови транзакція відкочується."
    },
    "lab": {
      "language": "js",
      "starter": "export async function consume(event,store){throw new Error('Реалізуй споживач');}\n",
      "solution": "export async function consume(event,store){if(!event||typeof event.id!=='string'||!event.id.trim())throw new Error('invalid_event');return store.transaction(async tx=>{if(await tx.seen(event.id))return 'duplicate';await tx.apply(event);await tx.markSeen(event.id);return 'applied';});}\n",
      "tests": "test('one effect, one transaction and failure retry',async()=>{const seen=new Set();let effects=0,transactions=0;const store={async transaction(fn){transactions++;const staged=new Set(seen);let next=0;const tx={seen:async id=>staged.has(id),apply:async event=>{if(event.fail)throw new Error('temporary');next++;},markSeen:async id=>staged.add(id)};const result=await fn(tx);effects+=next;seen.clear();for(const x of staged)seen.add(x);return result;}};const e={id:'e1'};assert.equal(await subject.consume(e,store),'applied');assert.equal(await subject.consume(e,store),'duplicate');assert.equal(effects,1);assert.equal(transactions,2);await assert.rejects(()=>subject.consume({id:'e2',fail:true},store),/temporary/);assert.equal(seen.has('e2'),false);assert.equal(await subject.consume({id:'e2'},store),'applied');assert.equal(effects,2);await assert.rejects(()=>subject.consume({id:''},store),/invalid_event/);});"
    }
  }
];
