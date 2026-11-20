import type { Lesson } from './schema';

export const platformLessons: Lesson[] = [
  {
    id: 'typescript-contracts', moduleId: 'typescript', title: 'Типи як контракт між частинами програми',
    summary: 'Описуємо дані, відділяємо відсутність значення від помилки й зберігаємо гроші цілими числами.',
    lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Описати об’єкти та readonly-масиви.', 'Пояснити стирання типів під час виконання.', 'Узгодити одиниці вимірювання в контракті.'],
    task: 'Реалізуй totalCents для замовлення. Ціна — невід’ємне ціле число копійок, кількість — додатне ціле число. Порожнє замовлення має суму 0. Вхідні дані залишаються незмінними.',
    steps: ['Опиши тип OrderLine і сигнатуру функції.', 'Перевір priceCents та quantity перед обчисленням.', 'Порахуй суму; перевір, що результат є безпечним цілим числом.'],
    hints: ['ReadonlyArray дозволяє читати елементи без push та sort.', 'Number.isSafeInteger перевіряє цілі числа в точному діапазоні Number.', 'Початкове значення reduce має бути 0, щоб підтримати порожній масив.'],
    criteria: ['Сума обчислена в копійках.', 'Некоректні ціни та кількості спричиняють RangeError.', 'Функція не змінює замовлення.'],
    mistakes: ['Вважати, що тип number гарантує ціле додатне значення.', 'Додавати десяткові гривні без узгодженої політики округлення.'],
    reviewQuestions: ['Що залишається від type після компіляції?', 'Чим readonly у типі відрізняється від Object.freeze?'],
    extensions: ['Додай знижку в базисних пунктах і письмово визнач політику округлення для кожного рядка.', 'Створи окремі типи для чернетки й підтвердженого замовлення; унеможливи підтвердження без ідентифікатора.'],
    sources: [{ title: 'TypeScript: Everyday Types', url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html' }],
    quiz: { kind: 'choice', question: 'Що гарантує параметр price: number?', options: ['Ціна додатна й ціла.', 'Компілятор очікує число; бізнес-обмеження перевіряє код.', 'JSON автоматично перевірятиметься.'], answer: 1, explanation: 'number охоплює від’ємні, дробові значення, NaN та Infinity. Типи не створюють runtime-валідацію.' },
    lab: { language: 'ts', starter: `export type OrderLine = { readonly priceCents: number; readonly quantity: number };
export function totalCents(lines: readonly OrderLine[]): number {
  throw new Error('Реалізуй перевірки та обчислення');
}`, solution: `export type OrderLine = { readonly priceCents: number; readonly quantity: number };
export function totalCents(lines: readonly OrderLine[]): number {
  let total = 0;
  for (const line of lines) {
    if (!Number.isSafeInteger(line.priceCents) || line.priceCents < 0 ||
        !Number.isSafeInteger(line.quantity) || line.quantity <= 0) {
      throw new RangeError('Некоректний рядок замовлення');
    }
    total += line.priceCents * line.quantity;
    if (!Number.isSafeInteger(total)) throw new RangeError('Сума завелика');
  }
  return total;
}`, tests: `test('сума, порожній кошик та незмінність', () => {
  const lines = Object.freeze([Object.freeze({ priceCents: 125, quantity: 3 }), Object.freeze({ priceCents: 0, quantity: 1 })]);
  assert.equal(subject.totalCents(lines), 375);
  assert.equal(subject.totalCents([]), 0);
  assert.equal(lines[0].quantity, 3);
});
test('невалідні та неточні числа', () => {
  for (const line of [{priceCents: -1, quantity: 1}, {priceCents: 1.5, quantity: 1}, {priceCents: 1, quantity: 0}, {priceCents: NaN, quantity: 1}, {priceCents: Number.MAX_SAFE_INTEGER, quantity: 2}]) {
    assert.throws(() => subject.totalCents([line]), RangeError);
  }
});` }
  },
  {
    id: 'typescript-narrowing', moduleId: 'typescript', title: 'unknown, narrowing та Zod-схеми',
    summary: 'Будуємо межу довіри між зовнішнім JSON і типізованою програмою через unknown та Zod.', lectureMinutes: 20, practiceMinutes: 45,
    goals: ['Приймати зовнішні значення як unknown.', 'Описати контракт схемою Zod (trim, int, email, optional).', 'Відкидати зайві поля (strip) й повертати чистий типізований об’єкт.'],
    task: 'Реалізуй ProfileSchema і parseProfile(input: unknown) за допомогою zod. Потрібні id — додатне безпечне ціле число та name — непорожній рядок після trim. email — необов’язковий валідний email. Помилки валідації кидай як TypeError; зайві поля не повинні потрапляти в результат.',
    steps: ['Імпортуй z із zod та оголоси ProfileSchema через z.object.', 'Використай .trim().min(1) для name, перевірку safe integer для id і optional email.', 'У parseProfile виклич ProfileSchema.safeParse(input) та кинь TypeError при помилці.'],
    hints: ['z.object(...) за замовчуванням прибирає невідомі ключі (наприклад, role: admin).', 'Number.isSafeInteger можна додати через .refine(Number.isSafeInteger).', 'safeParse повертає { success: true, data } або { success: false, error }.'],
    criteria: ['Некоректні структури та типи відхиляються з TypeError.', 'Пробіли навколо name прибираються схемою.', 'Зайві поля на кшталт role не копіюються в результат.'],
    mistakes: ['Використовувати JSON.parse(text) as Profile як перевірку даних.', 'Писати 30 рядків ручних typeof-умов на кожен DTO замість декларативної схеми.'],
    reviewQuestions: ['Чому any вимикає захист компілятора, а unknown — змушує перевіряти?', 'Як z.infer<typeof Schema> синхронізує типи з runtime-валідацією?'],
    extensions: ['Додай discriminated union у Zod для фізичної особи та ФОП з різними обов’язковими полями.', 'Напиши валідацію process.env через Zod, яка падає при старті застосунку з читабельним звітом полів.'],
    sources: [{ title: 'TypeScript: Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' }, { title: 'Zod Documentation', url: 'https://zod.dev/' }],
    quiz: { kind: 'choice', question: 'Чи перевірить const user = JSON.parse(text) as User структуру даних?', options: ['Так, User існує під час виконання.', 'Ні, as лише повідомляє припущення компілятору.', 'Так, але лише у strict mode.'], answer: 1, explanation: 'Type assertion не виконує перевірок. Реальну гарантію на межі дає схема (наприклад, Zod) або runtime-guard.' },
    lab: { language: 'ts', dependencies: { zod: '^4.6.7' }, starter: `import { z } from 'zod';

export const ProfileSchema = z.object({
  // Опиши поля id, name, email
});

export type Profile = { id: number; name: string; email?: string };

export function parseProfile(input: unknown): Profile {
  throw new Error('Реалізуй перевірку через ProfileSchema.safeParse');
}`, solution: `import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.number().int().positive().refine(Number.isSafeInteger, 'Небезпечне ціле'),
  name: z.string().trim().min(1),
  email: z.string().email().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export function parseProfile(input: unknown): Profile {
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) throw new TypeError('Некоректний профіль');
  return parsed.data;
}`, tests: `test('нормалізація та відкидання зайвих полів через Zod', () => {
  assert.deepEqual(subject.parseProfile({id: 3, name: '  Іра ', role: 'admin'}), {id: 3, name: 'Іра'});
  assert.deepEqual(subject.parseProfile({id: 3, name: 'Іра', email: 'ira@example.com'}), {id: 3, name: 'Іра', email: 'ira@example.com'});
});
test('межі unknown та невалідного JSON', () => {
  for (const value of [null, [], 'text', {id: '3', name: 'Іра'}, {id: 0, name: 'Іра'}, {id: 1, name: '   '}, {id: 1, name: 'Іра', email: null}, {id: 1, name: 'Іра', email: 'not-an-email'}]) {
    assert.throws(() => subject.parseProfile(value), TypeError);
  }
});` }
  },
  {
    id: 'typescript-generics', moduleId: 'typescript', title: 'Generics: зберігаємо зв’язок між типами',
    summary: 'Узагальнення, виведення типів і корисні обмеження на прикладі групування.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Написати generic-функцію без any.', 'Зберегти тип ключа та елемента.', 'Відрізнити generic від union.'],
    task: 'Реалізуй groupBy<T, K>. Вона приймає readonly-масив і функцію вибору ключа, повертає Map<K, T[]>, зберігає порядок груп та елементів і не змінює джерело.',
    steps: ['Оголоси параметри типів T і K.', 'Створи Map; додай кожен елемент у його групу.', 'Перевір порожній масив, числові та symbol-ключі.'],
    hints: ['K extends PropertyKey дозволяє string, number і symbol.', 'Map не перетворює число 1 на рядок "1".', 'Перший елемент групи створює новий масив; наступні додаються до нього.'],
    criteria: ['Збережені типи вхідного елемента й ключа.', 'Порожній ввід повертає порожній Map.', 'Порядок стабільний, джерело незмінне.'],
    mistakes: ['Замінювати тип результату на any[].', 'Обмежувати generic сильніше, ніж потребує алгоритм.'],
    reviewQuestions: ['Які типи виведе компілятор для groupBy(users, u => u.teamId)?', 'Навіщо readonly у параметрі колекції?'],
    extensions: ['Створи indexBy і визнач політику повторюваних ключів: помилка чи останній елемент.', 'Реалізуй pick<T, K extends keyof T> та покажи помилку компіляції для неіснуючого ключа.'],
    sources: [{ title: 'TypeScript: Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html' }],
    quiz: { kind: 'choice', question: 'Навіщо generic T у функції identity<T>(value: T): T?', options: ['Він перетворює значення на потрібний тип.', 'Він зберігає зв’язок типу аргументу й результату.', 'Він вимикає перевірку типів.'], answer: 1, explanation: 'Generic описує залежність типів. Він не змінює значення та не додає runtime-перевірку.' },
    lab: { language: 'ts', starter: `export function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  throw new Error('Згрупуй елементи без втрати типів');
}`, solution: `export function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item); else groups.set(key, [item]);
  }
  return groups;
}`, tests: `test('групи зберігають порядок та елементи', () => {
  const items = Object.freeze([{team: 2, name: 'А'}, {team: 1, name: 'Б'}, {team: 2, name: 'В'}]);
  const groups = subject.groupBy(items, item => item.team);
  assert.deepEqual([...groups.keys()], [2, 1]);
  assert.deepEqual(groups.get(2)?.map(item => item.name), ['А', 'В']);
  assert.equal(groups.get(2)?.[0], items[0]);
});
test('порожні дані та symbol-ключ', () => {
  assert.equal(subject.groupBy([], value => value).size, 0);
  const key = Symbol('team');
  assert.deepEqual(subject.groupBy([1, 2], () => key).get(key), [1, 2]);
});` }
  },
  {
    id: 'node-http', moduleId: 'node', title: 'HTTP-сервер без фреймворку',
    summary: 'Розбираємо запит на метод, шлях і заголовки та формуємо явну HTTP-відповідь.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Пояснити роль HTTP, DNS і TLS.', 'Створити Node HTTP-сервер.', 'Коректно розділяти 400, 404 і 405.'],
    task: 'Створи createCatalogServer(). GET /health повертає {ok:true}; GET /items?limit=N — перші N елементів каталогу. Limit за замовчуванням 2, дозволений діапазон 1–3. Невідомий шлях дає 404, інший метод для відомого шляху — 405 та Allow: GET.',
    steps: ['Створи сервер через node:http і розбери URL.', 'Виділи функцію JSON-відповіді з Content-Type.', 'Валідуй query-параметр перед використанням.'],
    hints: ['new URL(req.url, "http://localhost") розбирає відносний шлях.', 'Статус 405 описує метод для наявного ресурсу.', 'Закінчи кожну гілку return, щоб не надіслати відповідь двічі.'],
    criteria: ['Усі відповіді API мають JSON Content-Type.', 'Некоректний limit дає 400.', 'Сервер можна закрити після тесту.'],
    mistakes: ['Плутати 404 і помилку методу.', 'Читати тіло або query без обмежень і валідації.'],
    reviewQuestions: ['Де в типовому розгортанні завершується TLS?', 'Чим шлях відрізняється від query-параметрів?'],
    extensions: ['Додай HEAD із тими самими заголовками, але без тіла; перевір поведінку HTTP-клієнтом.', 'За допомогою curl досліди редирект, Cache-Control та CORS; опиши роль браузера в кожному випадку.'],
    sources: [{ title: 'Node.js HTTP', url: 'https://nodejs.org/api/http.html' }, { title: 'MDN: HTTP overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview' }],
    quiz: { kind: 'choice', question: 'Що означає CORS для API?', options: ['Замінює перевірку авторизації.', 'Керує доступом браузерного JavaScript до cross-origin-відповіді.', 'Шифрує HTTP-запит.'], answer: 1, explanation: 'CORS реалізує браузерну політику. Інші HTTP-клієнти можуть звертатися до API; права доступу перевіряє сервер.' },
    lab: { language: 'js', starter: `import { createServer } from 'node:http';
export function createCatalogServer() {
  return createServer((req, res) => { res.statusCode = 501; res.end(); });
}`, solution: `import { createServer } from 'node:http';
export function createCatalogServer() {
  const items = [{id: 1, name: 'Зошит'}, {id: 2, name: 'Олівець'}, {id: 3, name: 'Книга'}];
  return createServer((req, res) => {
    const send = (status, body) => { res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'}); res.end(JSON.stringify(body)); };
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!['/health', '/items'].includes(url.pathname)) return send(404, {error: 'NOT_FOUND'});
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(405, {error: 'METHOD_NOT_ALLOWED'}); }
    if (url.pathname === '/health') return send(200, {ok: true});
    const raw = url.searchParams.get('limit') ?? '2';
    if (!/^[1-3]$/.test(raw)) return send(400, {error: 'INVALID_LIMIT'});
    return send(200, {items: items.slice(0, Number(raw))});
  });
}`, tests: `test('HTTP-маршрути, валідація та методи', async () => {
  const { once } = await import('node:events');
  const server = subject.createCatalogServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const address = server.address(); const base = 'http://127.0.0.1:' + address.port;
  try {
    let response = await fetch(base + '/health'); assert.equal(response.status, 200); assert.equal(response.headers.get('content-type').includes('application/json'), true); assert.deepEqual(await response.json(), {ok: true});
    response = await fetch(base + '/items?limit=1'); assert.equal((await response.json()).items.length, 1);
    assert.equal((await fetch(base + '/items?limit=0')).status, 400);
    assert.equal((await fetch(base + '/missing')).status, 404);
    response = await fetch(base + '/items', {method: 'POST'}); assert.equal(response.status, 405); assert.equal(response.headers.get('allow'), 'GET');
  } finally { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});`, instructions: 'Тест відкриває локальний тимчасовий HTTP-порт. Він не звертається до зовнішніх сервісів. Якщо середовище блокує локальні порти, запусти лабораторну на власному комп’ютері.' }
  },
  {
    id: 'node-modules', moduleId: 'node', title: 'Модулі, процес і конфігурація',
    summary: 'Відділяємо конфігурацію від коду та робимо запуск відтворюваним.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Розрізняти ESM і CommonJS.', 'Перевіряти process.env на старті.', 'Не змішувати конфігурацію з бізнес-логікою.'],
    task: 'Напиши loadConfig(env). Поверни port і mode. PORT за відсутності дорівнює 3000; дозволені лише цілі числа 1–65535, записані цифрами. NODE_ENV за відсутності development; дозволені development, test, production.',
    steps: ['Прийми env як аргумент для незалежного тестування.', 'Перевір формат PORT до Number().', 'Поверни новий об’єкт лише з дозволеними полями.'],
    hints: ['У process.env усі задані значення є рядками.', 'Number("") дає 0, тому перевірка формату має значення.', '?? застосовує default лише для null/undefined, а не для порожнього рядка.'],
    criteria: ['Default застосовується лише за відсутності значення.', 'Некоректні конфігурації зупиняють запуск помилкою.', 'Секрети не потрапляють у результат або лог.'],
    mistakes: ['Читати process.env у десятках файлів.', 'Логувати весь об’єкт середовища для діагностики.'],
    reviewQuestions: ['Як type: module впливає на .js-файли?', 'Чому конфігурацію варто перевіряти до запуску сервера?'],
    extensions: ['Створи окремий entrypoint і перевір імпорт ESM-модуля в тесті без запуску сервера.', 'Додай DATABASE_URL та функцію безпечного опису конфігурації, яка приховує пароль і токени.'],
    sources: [{ title: 'Node.js: Packages', url: 'https://nodejs.org/api/packages.html' }, { title: 'Node.js: Environment variables', url: 'https://nodejs.org/api/environment_variables.html' }],
    quiz: { kind: 'input', question: 'Який typeof має process.env.PORT, якщо змінна задана як PORT=3000?', accepted: ['string', '"string"', "'string'"], explanation: 'Змінні середовища — текст. Перетворення та перевірки виконує конфігураційний модуль.' },
    lab: { language: 'ts', starter: `export function loadConfig(env: Record<string, string | undefined>): {port: number; mode: string} {
  throw new Error('Перевір середовище');
}`, solution: `export function loadConfig(env: Record<string, string | undefined>): {port: number; mode: string} {
  const raw = env.PORT ?? '3000';
  if (!/^\\d+$/.test(raw)) throw new RangeError('PORT має містити цифри');
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('PORT поза діапазоном');
  const mode = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(mode)) throw new RangeError('Невідоме середовище');
  return {port, mode};
}`, tests: `test('значення за замовчуванням та явна конфігурація', () => {
  assert.deepEqual(subject.loadConfig({}), {port: 3000, mode: 'development'});
  assert.deepEqual(subject.loadConfig({PORT: '8080', NODE_ENV: 'production', SECRET: 'hidden'}), {port: 8080, mode: 'production'});
});
test('помилки конфігурації', () => {
  for (const PORT of ['', '0', '65536', '3.2', ' 3000', '3e3', 'abc']) assert.throws(() => subject.loadConfig({PORT}), RangeError);
  assert.throws(() => subject.loadConfig({NODE_ENV: 'prod'}), RangeError);
});` }
  },
  {
    id: 'express-routing', moduleId: 'express', title: 'Express: маршрути та middleware',
    summary: 'Будуємо HTTP-контракт і простий життєвий цикл ресурсу.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Розділяти method/path/body.', 'Підключити JSON middleware.', 'Повертати 201 із Location та 404 для відсутнього ресурсу.'],
    task: 'Реалізуй createApp() із GET /products, POST /products та GET /products/:id. Продукт має непорожнє name та невід’ємне ціле priceCents. POST повертає 201 і Location. Дані ізольовані для кожного екземпляра застосунку.',
    steps: ['Створи express() та обмеж JSON-body до 16kb.', 'Валідуй дані перед зміною колекції.', 'Повертай створений ресурс і підтримай пошук за id.'],
    hints: ['Middleware express.json має стояти до маршрутів.', 'Не довіряй req.body: це зовнішні дані.', 'Масив оголоси всередині createApp, щоб тести не ділили стан.'],
    criteria: ['Створений продукт читається за Location.', 'Невалідне тіло дає 400 і не створює запис.', 'Два createApp мають окремі сховища.'],
    mistakes: ['Повертати 200 для кожного результату.', 'Зберігати навчальний масив на рівні модуля та випадково ділити його між тестами.'],
    reviewQuestions: ['Коли middleware має викликати next?', 'Чому 201 і Location корисні клієнту?'],
    extensions: ['Додай PATCH і DELETE з узгодженою політикою повторного видалення.', 'Винеси роботу з даними в repository-об’єкт і підстав тестову реалізацію без зміни HTTP-контракту.'],
    sources: [{ title: 'Express routing', url: 'https://expressjs.com/en/guide/routing.html' }, { title: 'Express middleware', url: 'https://expressjs.com/en/guide/using-middleware.html' }],
    quiz: { kind: 'order', question: 'Упорядкуй обробку POST /products.', items: [{id:'validate',text:'Перевірити поля'},{id:'respond',text:'Повернути 201 і Location'},{id:'parse',text:'Розібрати JSON-body'},{id:'save',text:'Зберегти продукт'}], answer: ['parse','validate','save','respond'], explanation: 'Парсинг створює значення, валідація перевіряє контракт, запис змінює стан, відповідь повідомляє результат.' },
    lab: { language: 'js', dependencies: {express: '^5.1.0', supertest: '^7.1.1'}, starter: `import express from 'express';
export function createApp() {
  const app = express();
  // Додай middleware, маршрути та ізольоване сховище.
  return app;
}`, solution: `import express from 'express';
export function createApp() {
  const app = express(); const products = []; let nextId = 1;
  app.use(express.json({limit: '16kb'}));
  app.get('/products', (req, res) => res.json({items: products}));
  app.post('/products', (req, res) => {
    const body = req.body;
    if (!body || typeof body.name !== 'string' || body.name.trim() === '' || !Number.isSafeInteger(body.priceCents) || body.priceCents < 0) return res.status(400).json({error: 'INVALID_PRODUCT'});
    const product = {id: nextId++, name: body.name.trim(), priceCents: body.priceCents}; products.push(product);
    return res.status(201).location('/products/' + product.id).json(product);
  });
  app.get('/products/:id', (req, res) => {
    const product = products.find(item => String(item.id) === req.params.id);
    return product ? res.json(product) : res.status(404).json({error: 'NOT_FOUND'});
  });
  return app;
}`, tests: `test('створення та читання ресурсу', async () => {
  const request = (await import('supertest')).default; const app = subject.createApp();
  const created = await request(app).post('/products').send({name: ' Книга ', priceCents: 1500});
  assert.equal(created.status, 201); assert.equal(created.headers.location, '/products/1');
  const found = await request(app).get(created.headers.location); assert.deepEqual(found.body, {id: 1, name: 'Книга', priceCents: 1500});
  assert.equal((await request(app).get('/products/999')).status, 404);
});
test('валідація та ізоляція', async () => {
  const request = (await import('supertest')).default; const app = subject.createApp();
  assert.equal((await request(app).post('/products').send({name: ' ', priceCents: 1})).status, 400);
  assert.equal((await request(app).post('/products').send({name: 'X', priceCents: -1})).status, 400);
  assert.deepEqual((await request(subject.createApp()).get('/products')).body, {items: []});
});`, instructions: 'Зберігання в масиві — навчальна однопроцесна реалізація. Вона втрачає дані після перезапуску; у модулі PostgreSQL її замінює база.' }
  },
  {
    id: 'express-errors', moduleId: 'express', title: 'Єдина модель помилок і request ID',
    summary: 'Відділяємо безпечну відповідь клієнту від діагностики всередині сервера.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Передавати async-помилки в Express 5.', 'Зіставляти доменні помилки з HTTP-статусами.', 'Зберігати request ID без витоку внутрішніх повідомлень.'],
    task: 'Створи DomainError(status, code, message) і createApp({fetchUser}). GET /users/:id повертає користувача; DomainError відображається у визначений HTTP-статус, інша помилка — безпечний 500. Усі помилки мають error.code, error.message і requestId.',
    steps: ['Додай request ID до відповіді та request-об’єкта.', 'Використай async-route та центральний error middleware з чотирма параметрами.', 'Окремо оброби синтаксично неправильний JSON і невідомий маршрут.'],
    hints: ['Express 5 передає rejected Promise з async-handler у next автоматично.', 'Порядок middleware важливий: error-handler ставиться після маршрутів.', 'Для невідомої помилки поверни сталий текст; діагностика не є частиною публічного контракту.'],
    criteria: ['DomainError зберігає дозволені статус і код.', 'Внутрішня помилка не розкриває своє повідомлення.', 'Неправильний JSON дає 400.'],
    mistakes: ['Надсилати stack trace або рядок підключення клієнту.', 'Забувати параметр next у сигнатурі error middleware.'],
    reviewQuestions: ['Чим очікувана доменна помилка відрізняється від програмного бага?', 'Як request ID допомагає знайти лог конкретної відповіді?'],
    extensions: ['Додай структуроване логування з редагуванням секретів і перевір, що Authorization не записується.', 'Відтворюй випадок res.headersSent та передавай помилку стандартному handler замість повторної відповіді.'],
    sources: [{ title: 'Express 5 error handling', url: 'https://expressjs.com/en/guide/error-handling.html' }],
    quiz: { kind: 'choice', question: 'Яке повідомлення доречне в невідомій помилці 500?', options: ['Повний stack trace.', 'Стале безпечне повідомлення та request ID.', 'Пароль бази для налагодження.'], answer: 1, explanation: 'Клієнт отримує стабільний контракт, а оператор знаходить внутрішню діагностику за request ID.' },
    lab: { language: 'js', dependencies: {express: '^5.1.0', supertest: '^7.1.1'}, starter: `import express from 'express';
export class DomainError extends Error {
  constructor(status, code, message) {super(message); this.status = status; this.code = code;}
}
export function createApp({fetchUser}) {
  const app = express();
  return app;
}`, solution: `import express from 'express';
import { randomUUID } from 'node:crypto';
export class DomainError extends Error {
  constructor(status, code, message) {super(message); this.status = status; this.code = code;}
}
export function createApp({fetchUser}) {
  const app = express();
  app.use((req, res, next) => {req.requestId = randomUUID(); res.set('X-Request-Id', req.requestId); next();});
  app.use(express.json({limit: '16kb'}));
  app.get('/users/:id', async (req, res) => res.json(await fetchUser(req.params.id)));
  app.use((req, res, next) => next(new DomainError(404, 'NOT_FOUND', 'Ресурс не знайдено')));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const malformed = error.type === 'entity.parse.failed';
    const known = error instanceof DomainError && Number.isInteger(error.status) && error.status >= 400 && error.status <= 599;
    const status = malformed ? 400 : known ? error.status : 500;
    res.status(status).json({error: {code: malformed ? 'INVALID_JSON' : known ? error.code : 'INTERNAL_ERROR', message: malformed ? 'Некоректний JSON' : known ? error.message : 'Внутрішня помилка сервера'}, requestId: req.requestId});
  });
  return app;
}`, tests: `test('доменні та внутрішні помилки', async () => {
  const request = (await import('supertest')).default;
  let app = subject.createApp({fetchUser: async () => {throw new subject.DomainError(404, 'USER_MISSING', 'Користувача немає');}});
  let response = await request(app).get('/users/1'); assert.equal(response.status, 404); assert.equal(response.body.error.code, 'USER_MISSING'); assert.equal(response.body.requestId, response.headers['x-request-id']);
  app = subject.createApp({fetchUser: async () => {throw new Error('password=secret');}});
  response = await request(app).get('/users/1'); assert.equal(response.status, 500); assert.equal(response.body.error.code, 'INTERNAL_ERROR'); assert.equal(JSON.stringify(response.body).includes('secret'), false);
  response = await request(app).post('/users').set('Content-Type', 'application/json').send('{bad'); assert.equal(response.status, 400); assert.equal(response.body.error.code, 'INVALID_JSON');
});` }
  },
  {
    id: 'express-contracts', moduleId: 'express', title: 'Контракти, OpenAPI та cursor-пагінація',
    summary: 'Робимо спосіб читання колекції явним і перевіряємо межі query-параметрів.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Документувати параметри та відповіді OpenAPI.', 'Реалізувати limit + cursor.', 'Відділити обмеження сторінки від порядку даних.'],
    task: 'Реалізуй parsePage(query) та makePage(rows, limit). Limit — рядок із цілим числом 1–100, default 20. Cursor — канонічний base64url додатного id. makePage приймає вже відсортовані rows у кількості до limit+1 та повертає items і nextCursor.',
    steps: ['Перевір параметри й декодуй cursor в afterId.', 'Використай зайвий запис для визначення наступної сторінки.', 'Закодуй id останнього поверненого елемента тільки коли є продовження.'],
    hints: ['Buffer.from(text).toString("base64url") кодує cursor.', 'Base64-декодер допускає неточний ввід; перевір формат і повторне кодування.', 'Сортування має бути стабільним; у цій вправі порядок задається id.'],
    criteria: ['Верхня межа limit контролюється.', 'Невалідний cursor відхиляється.', 'nextCursor є null на останній сторінці.'],
    mistakes: ['Використовувати cursor без стабільного ORDER BY.', 'Повертати cursor, навіть коли наступних елементів немає.'],
    reviewQuestions: ['Чому сервер запитує limit+1 записів?', 'Що зміниться, якщо сортувати за неунікальним created_at?'],
    extensions: ['Опиши endpoint у OpenAPI з прикладами 200 і 400 та перевір його HTTP-клієнтом.', 'Додай складений cursor created_at + id і тести для однакового часу створення.'],
    sources: [{ title: 'OpenAPI specification', url: 'https://spec.openapis.org/oas/latest.html' }, { title: 'Node.js Buffer', url: 'https://nodejs.org/api/buffer.html' }],
    quiz: { kind: 'choice', question: 'Для limit=10 отримано 11 відсортованих рядків. Скільки повертаємо клієнту?', options: ['11, щоб не втратити дані.', '10; одинадцятий лише показує, що є наступна сторінка.', '9 та два cursor.'], answer: 1, explanation: 'Зайвий рядок — сигнал продовження. Наступний cursor описує останній повернений запис.' },
    lab: { language: 'js', starter: `export function parsePage(query) {throw new Error('Перевір query');}
export function makePage(rows, limit) {throw new Error('Сформуй сторінку');}`, solution: `export function parsePage(query) {
  const raw = query.limit ?? '20';
  if (typeof raw !== 'string' || !/^\\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 100) throw new RangeError('Некоректний limit');
  let afterId = null;
  if (query.cursor !== undefined) {
    const cursor = query.cursor;
    if (typeof cursor !== 'string' || !/^[A-Za-z0-9_-]+$/.test(cursor)) throw new RangeError('Некоректний cursor');
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    if (!/^[1-9]\\d*$/.test(decoded) || !Number.isSafeInteger(Number(decoded)) || Buffer.from(decoded).toString('base64url') !== cursor) throw new RangeError('Некоректний cursor');
    afterId = Number(decoded);
  }
  return {limit: Number(raw), afterId};
}
export function makePage(rows, limit) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Некоректний limit');
  const items = rows.slice(0, limit);
  const nextCursor = rows.length > limit ? Buffer.from(String(items.at(-1).id)).toString('base64url') : null;
  return {items, nextCursor};
}`, tests: `test('параметри та канонічний cursor', () => {
  assert.deepEqual(subject.parsePage({}), {limit: 20, afterId: null});
  const cursor = Buffer.from('15').toString('base64url');
  assert.deepEqual(subject.parsePage({limit: '3', cursor}), {limit: 3, afterId: 15});
  for (const query of [{limit:'0'}, {limit:'101'}, {limit: ['2']}, {cursor:'?'}, {cursor:Buffer.from('-1').toString('base64url')}]) assert.throws(() => subject.parsePage(query), RangeError);
});
test('наступна й остання сторінки', () => {
  const page = subject.makePage([{id:1},{id:2},{id:3}], 2);
  assert.deepEqual(page.items, [{id:1},{id:2}]); assert.equal(Buffer.from(page.nextCursor, 'base64url').toString(), '2');
  assert.equal(subject.makePage([{id:3}], 2).nextCursor, null);
  assert.deepEqual(subject.makePage([], 2), {items:[], nextCursor:null});
});` }
  },
  {
    id: 'postgres-modeling', moduleId: 'postgres', title: 'Модель даних і обмеження PostgreSQL',
    summary: 'Захищаємо інваріанти ключами, NOT NULL, UNIQUE та CHECK.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Розрізняти первинний і зовнішній ключ.', 'Переносити інваріанти в схему.', 'Створювати відтворювану початкову міграцію.'],
    task: 'Створи схему customers та orders: у клієнта унікальний обов’язковий email; замовлення належить існуючому клієнту, має невід’ємну цілу total_cents і час створення. Видалення клієнта з замовленням заборонене.',
    steps: ['Опиши таблиці та типи колонок.', 'Додай ключі, NOT NULL і CHECK.', 'Перевір порушення кожного обмеження окремим запитом.'],
    hints: ['Унікальність поля з NOT NULL відрізняється від самого UNIQUE.', 'REFERENCES захищає зв’язок незалежно від того, який застосунок пише дані.', 'ON DELETE RESTRICT явно документує політику видалення.'],
    criteria: ['Не створюється замовлення з неіснуючим customer_id.', 'Повторний email і від’ємна сума відхиляються.', 'Схема запускається в чистій базі.'],
    mistakes: ['Перевіряти унікальність тільки SELECT-запитом перед INSERT.', 'Зберігати гроші в floating-point без потреби.'],
    reviewQuestions: ['Чому валідація API не замінює UNIQUE?', 'Коли зв’язку багато-до-багатьох потрібна окрема таблиця?'],
    extensions: ['Додай products і order_lines з кількістю та зафіксованою ціною на момент купівлі.', 'Напиши другу міграцію для стану замовлення та перевір її на базі з існуючими даними.'],
    sources: [{ title: 'PostgreSQL constraints', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html' }, { title: 'PGlite', url: 'https://pglite.dev/docs/' }],
    quiz: { kind: 'choice', question: 'Два запити одночасно перевірили відсутність email. Що остаточно захистить від дубля?', options: ['SELECT перед кожним INSERT.', 'UNIQUE-обмеження бази даних.', 'TypeScript-інтерфейс.'], answer: 1, explanation: 'Перевірка перед записом може програти гонку. UNIQUE забезпечує інваріант під час запису.' },
    lab: { language: 'js', dependencies: {'@electric-sql/pglite':'^0.3.7'}, starter: `export const schema = '';
export async function createSchema(db) {await db.exec(schema);}`, solution: `export const schema = \`CREATE TABLE customers (
 id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 email text NOT NULL UNIQUE,
 name text NOT NULL
);
CREATE TABLE orders (
 id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 customer_id integer NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
 total_cents integer NOT NULL CHECK (total_cents >= 0),
 created_at timestamptz NOT NULL DEFAULT now()
);\`;
export async function createSchema(db) {await db.exec(schema);}`, tests: `test('ключі та обмеження схеми', async () => {
  const {PGlite} = await import('@electric-sql/pglite'); const db = new PGlite();
  try {
    await subject.createSchema(db);
    const {rows} = await db.query("INSERT INTO customers(email,name) VALUES ($1,$2) RETURNING id", ['a@example.test','А']);
    const id = rows[0].id;
    await db.query('INSERT INTO orders(customer_id,total_cents) VALUES ($1,$2)', [id,500]);
    await assert.rejects(db.query("INSERT INTO customers(email,name) VALUES ($1,$2)", ['a@example.test','Б']));
    await assert.rejects(db.query('INSERT INTO orders(customer_id,total_cents) VALUES ($1,$2)', [999,500]));
    await assert.rejects(db.query('INSERT INTO orders(customer_id,total_cents) VALUES ($1,$2)', [id,-1]));
    await assert.rejects(db.query('DELETE FROM customers WHERE id=$1', [id]));
  } finally {await db.close();}
});`, instructions: 'Автотест запускає справжній SQL-двигун PostgreSQL у WASM через PGlite, без окремого сервера. Багатоклієнтні блокування й мережевий pool досліджуй окремо з PostgreSQL у Docker; PGlite не відтворює весь production-стенд.' }
  },
  {
    id: 'postgres-queries', moduleId: 'postgres', title: 'JOIN, агрегації й часові межі',
    summary: 'Будуємо звіт і зберігаємо в ньому клієнтів без продажів.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Відрізняти LEFT JOIN від INNER JOIN.', 'Пояснити GROUP BY та агрегати.', 'Задавати часовий інтервал як [from, to).'],
    task: 'Реалізуй salesReport(db, {from, to}). Поверни всіх клієнтів із сумою та кількістю оплачених замовлень за інтервал from включно, to виключно. Клієнт без продажів має нулі. Сортуй за revenue_cents DESC, id ASC.',
    steps: ['Постав фільтри статусу й часу в ON умову LEFT JOIN.', 'Використай COUNT, SUM та COALESCE.', 'Передавай межі параметрами й перевір коректність інтервалу.'],
    hints: ['WHERE o.status = ... прибере рядки клієнтів без замовлень.', 'COUNT(o.id) не рахує NULL, а COUNT(*) порахує рядок клієнта.', 'Сусідні напіввідкриті інтервали не дублюють граничне замовлення.'],
    criteria: ['Клієнти без продажів залишаються у звіті.', 'Неоплачені замовлення не враховані.', 'Початок включено, кінець виключено.'],
    mistakes: ['Застосовувати фільтр правої таблиці в WHERE після LEFT JOIN.', 'Використовувати BETWEEN для сусідніх періодів без аналізу меж.'],
    reviewQuestions: ['Що повертає SUM для відсутніх значень?', 'Чому ORDER BY потребує додаткового стабільного ключа?'],
    extensions: ['Додай віконну функцію для місця клієнта в рейтингу та накопичувальної суми.', 'Побудуй щоденний звіт із календарем дат, щоб дні без продажів також мали рядок.'],
    sources: [{ title: 'PostgreSQL table expressions', url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html' }, { title: 'PostgreSQL aggregate functions', url: 'https://www.postgresql.org/docs/current/functions-aggregate.html' }],
    quiz: { kind: 'choice', question: 'Куди помістити o.status = paid, щоб LEFT JOIN зберіг клієнтів без замовлень?', options: ['В ON умову приєднання orders.', 'У WHERE після JOIN.', 'У LIMIT.'], answer: 0, explanation: 'Умова ON визначає відповідні замовлення. WHERE по полю orders відкине рядки, де замовлення відсутнє.' },
    lab: { language: 'js', dependencies: {'@electric-sql/pglite':'^0.3.7'}, starter: `export async function salesReport(db, {from, to}) {
  throw new Error('Побудуй параметризований звіт');
}`, solution: `export async function salesReport(db, {from, to}) {
  if (!Number.isFinite(Date.parse(from)) || !Number.isFinite(Date.parse(to)) || Date.parse(from) >= Date.parse(to)) throw new RangeError('Некоректний інтервал');
  const result = await db.query(\`SELECT c.id, c.name,
    COALESCE(SUM(o.total_cents),0)::int AS revenue_cents,
    COUNT(o.id)::int AS order_count
    FROM customers c LEFT JOIN orders o ON o.customer_id=c.id
      AND o.status='paid' AND o.created_at >= $1::timestamptz AND o.created_at < $2::timestamptz
    GROUP BY c.id,c.name ORDER BY revenue_cents DESC,c.id ASC\`, [from,to]);
  return result.rows;
}`, tests: `test('LEFT JOIN, статус та часові межі', async () => {
  const {PGlite} = await import('@electric-sql/pglite'); const db = new PGlite();
  try {
    await db.exec(\`CREATE TABLE customers(id int PRIMARY KEY,name text); CREATE TABLE orders(id int PRIMARY KEY,customer_id int,status text,total_cents int,created_at timestamptz);
      INSERT INTO customers VALUES (1,'А'),(2,'Б'),(3,'В');
      INSERT INTO orders VALUES (1,1,'paid',200,'2026-01-01T00:00:00Z'),(2,1,'paid',300,'2026-02-01T00:00:00Z'),(3,2,'pending',900,'2026-01-10T00:00:00Z');\`);
    assert.deepEqual(await subject.salesReport(db,{from:'2026-01-01T00:00:00Z',to:'2026-02-01T00:00:00Z'}), [
      {id:1,name:'А',revenue_cents:200,order_count:1},{id:2,name:'Б',revenue_cents:0,order_count:0},{id:3,name:'В',revenue_cents:0,order_count:0}
    ]);
    await assert.rejects(subject.salesReport(db,{from:'bad',to:'2026-02-01'}), RangeError);
  } finally {await db.close();}
});`, instructions: 'Тест використовує PGlite для ізольованої перевірки SQL. Приведення суми до int у цій вправі спирається на невеликі фікстури; для великих фінансових сум узгодь bigint/numeric і спосіб серіалізації.' }
  },
  {
    id: 'postgres-indexes', moduleId: 'postgres', title: 'Індекси, EXPLAIN і keyset-пагінація',
    summary: 'Підбираємо індекс під конкретний фільтр і порядок читання.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Читати базовий план виконання.', 'Пояснити ціну індексу для запису.', 'Зіставляти WHERE та ORDER BY зі складеним індексом.'],
    task: 'Додай частковий індекс для оплачених orders за customer_id та id. Реалізуй findOrders(db,{customerId,afterId,limit}) із сортуванням id ASC, фільтром status=paid і keyset-пагінацією.',
    steps: ['Напиши CREATE INDEX з WHERE status=paid.', 'Перевір числові параметри й виконай параметризований SELECT.', 'Порівняй EXPLAIN до й після індексу на великій фікстурі.'],
    hints: ['Для рівності customer_id і діапазону id підходить індекс (customer_id,id).', 'Не додавай OFFSET, якщо cursor вже задає id > afterId.', 'Планувальник може обрати Seq Scan для маленької таблиці — це не автоматично помилка.'],
    criteria: ['Повертаються лише оплачені замовлення заданого клієнта.', 'Cursor не повторює попередній запис.', 'Індекс існує, а його користь перевірена планом на відповідному обсязі.'],
    mistakes: ['Вважати будь-який Seq Scan проблемою.', 'Додавати індекси на всі колонки без аналізу записів і розміру.'],
    reviewQuestions: ['Що означає різниця estimated rows і actual rows?', 'Чому індекс status окремо може бути малокорисним?'],
    extensions: ['Створи 100 тисяч записів у Docker PostgreSQL, виконай ANALYZE і порівняй EXPLAIN (ANALYZE, BUFFERS).', 'Додай фільтр за датою й обґрунтуй новий порядок колонок індексу, вимірявши читання та вставки.'],
    sources: [{ title: 'PostgreSQL EXPLAIN', url: 'https://www.postgresql.org/docs/current/using-explain.html' }, { title: 'PostgreSQL multicolumn indexes', url: 'https://www.postgresql.org/docs/current/indexes-multicolumn.html' }],
    quiz: { kind: 'choice', question: 'Чому після створення індексу маленька таблиця може читатися Seq Scan?', options: ['PostgreSQL завжди ігнорує індекси.', 'Послідовне читання може бути дешевшим для цього обсягу.', 'Потрібно прибрати WHERE.'], answer: 1, explanation: 'Планувальник порівнює витрати. Індекс оцінюють на характерних обсягах і розподілі даних.' },
    lab: { language: 'js', dependencies: {'@electric-sql/pglite':'^0.3.7'}, starter: `export const indexSql = '';
export async function findOrders(db, {customerId, afterId, limit}) {throw new Error('Реалізуй keyset-запит');}`, solution: `export const indexSql = "CREATE INDEX orders_customer_paid_id_idx ON orders(customer_id,id) WHERE status='paid'";
export async function findOrders(db, {customerId, afterId, limit}) {
  if (!Number.isSafeInteger(customerId) || customerId <= 0 || !Number.isSafeInteger(afterId) || afterId < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Некоректна сторінка');
  return (await db.query("SELECT id,customer_id,total_cents FROM orders WHERE customer_id=$1 AND status='paid' AND id>$2 ORDER BY id ASC LIMIT $3", [customerId,afterId,limit])).rows;
}`, tests: `test('індекс і стабільні сторінки', async () => {
  const {PGlite} = await import('@electric-sql/pglite'); const db = new PGlite();
  try {
    await db.exec("CREATE TABLE orders(id int PRIMARY KEY,customer_id int,status text,total_cents int); INSERT INTO orders VALUES (1,1,'paid',100),(2,1,'pending',200),(3,1,'paid',300),(4,2,'paid',400),(5,1,'paid',500)");
    await db.exec(subject.indexSql);
    const first = await subject.findOrders(db,{customerId:1,afterId:0,limit:2}); assert.deepEqual(first.map(x => x.id),[1,3]);
    const second = await subject.findOrders(db,{customerId:1,afterId:3,limit:2}); assert.deepEqual(second.map(x => x.id),[5]);
    assert.equal((await db.query("SELECT indexname FROM pg_indexes WHERE tablename='orders' AND indexname='orders_customer_paid_id_idx'")).rows.length,1);
    await assert.rejects(subject.findOrders(db,{customerId:1,afterId:0,limit:101}), RangeError);
  } finally {await db.close();}
});`, instructions: 'PGlite перевіряє SQL і поведінку сторінок. Тест навмисно не вимагає Index Scan на маленькій таблиці; вимірювання виконуються окремо на репрезентативному наборі в PostgreSQL.' }
  },
  {
    id: 'postgres-transactions', moduleId: 'postgres', title: 'Транзакції, блокування й одна connection',
    summary: 'Зберігаємо інваріант переказу та відновлюємо стан після помилки.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Використати один pg client для всієї транзакції.', 'Виконати умовне атомарне списання.', 'Гарантувати rollback і release при відмові.'],
    task: 'Реалізуй transfer(pool,fromId,toId,amount). Сума — додатне безпечне ціле число, рахунки різні. Списання дозволене лише за достатнього балансу; відсутній одержувач спричиняє rollback. Усі запити транзакції виконуються через один отриманий client.',
    steps: ['Перевір аргументи до pool.connect().', 'Після BEGIN виконай умовний UPDATE з RETURNING id.', 'Зарахуй кошти, перевір одержувача, COMMIT; при помилці ROLLBACK; завжди release.'],
    hints: ['UPDATE ... WHERE balance >= amount прибирає гонку SELECT-then-UPDATE.', 'pool.query може вибрати інше з’єднання для кожного запиту.', 'У finally звільняй client; rollback не повинен приховувати початкову помилку.'],
    criteria: ['Загальна сума балансів збережена.', 'Недостатні кошти й відсутній одержувач не змінюють стан.', 'Client звільняється при успіху та помилці.'],
    mistakes: ['Виконувати BEGIN через pool.query.', 'Повторювати лише останній SQL-запит після serialization failure.'],
    reviewQuestions: ['Що означає атомарність транзакції?', 'Чому одночасні перекази у протилежних напрямках можуть спричинити deadlock?'],
    extensions: ['Відтвори два одночасні списання через різні pg clients у Docker PostgreSQL; перевір збереження інваріанта.', 'Додай обмежений retry усієї транзакції для 40001/40P01 з backoff; змоделюй вичерпання спроб.'],
    sources: [{ title: 'node-postgres transactions', url: 'https://node-postgres.com/features/transactions' }, { title: 'PostgreSQL isolation', url: 'https://www.postgresql.org/docs/current/transaction-iso.html' }],
    quiz: { kind: 'order', question: 'Упорядкуй успішну транзакцію.', items: [{id:'commit',text:'COMMIT'},{id:'connect',text:'pool.connect()'},{id:'release',text:'client.release()'},{id:'begin',text:'BEGIN'},{id:'updates',text:'Списання та зарахування'}], answer: ['connect','begin','updates','commit','release'], explanation: 'Весь блок прив’язаний до одного client. При помилці замість COMMIT потрібен ROLLBACK, після якого також виконується release.' },
    lab: { language: 'js', starter: `export async function transfer(pool, fromId, toId, amount) {throw new Error('Проведи транзакцію');}`, solution: `export async function transfer(pool, fromId, toId, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || !Number.isSafeInteger(fromId) || fromId <= 0 || !Number.isSafeInteger(toId) || toId <= 0 || fromId === toId) throw new RangeError('Некоректний переказ');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const debit = await client.query('UPDATE accounts SET balance=balance-$1 WHERE id=$2 AND balance >= $1 RETURNING id', [amount,fromId]);
    if (debit.rows.length === 0) throw new Error('Недостатньо коштів або відправник відсутній');
    const credit = await client.query('UPDATE accounts SET balance=balance+$1 WHERE id=$2 RETURNING id', [amount,toId]);
    if (credit.rows.length === 0) throw new Error('Одержувач відсутній');
    await client.query('COMMIT');
  } catch (error) {try {await client.query('ROLLBACK');} catch {} throw error;}
  finally {client.release();}
}`, tests: `function fakePool(initial) {
  let balances = new Map(initial); let snapshot; const calls = []; let releases = 0; let connects = 0;
  const client = {async query(sql, params = []) {
    calls.push(sql);
    if (sql === 'BEGIN') {snapshot = new Map(balances); return {rows:[]};}
    if (sql === 'COMMIT') {snapshot = undefined; return {rows:[]};}
    if (sql === 'ROLLBACK') {balances = snapshot ?? balances; snapshot = undefined; return {rows:[]};}
    const [amount,id] = params;
    if (!balances.has(id) || (sql.includes('balance >=') && balances.get(id) < amount)) return {rows:[]};
    balances.set(id, balances.get(id) + (sql.includes('balance-$1') ? -amount : amount)); return {rows:[{id}]};
  }, release() {releases++;}};
  return {async connect() {connects++; return client;}, async query() {throw new Error('pool.query заборонено в транзакції');}, get balances() {return balances;}, get releases() {return releases;}, get connects() {return connects;}, calls};
}
test('успішний переказ та release', async () => {
  const pool = fakePool([[1,500],[2,100]]); await subject.transfer(pool,1,2,200);
  assert.deepEqual([...pool.balances],[[1,300],[2,300]]); assert.equal(pool.releases,1); assert.equal(pool.calls.at(-1),'COMMIT');
});
test('rollback при недостатніх коштах і відсутньому одержувачі', async () => {
  for (const [to,amount] of [[2,900],[99,200]]) {
    const pool = fakePool([[1,500],[2,100]]); await assert.rejects(subject.transfer(pool,1,to,amount));
    assert.deepEqual([...pool.balances],[[1,500],[2,100]]); assert.equal(pool.releases,1); assert.equal(pool.calls.at(-1),'ROLLBACK');
  }
  const pool = fakePool([[1,500]]);
  for (const args of [[1,1,100],[1,2,0],[1,2,-1],[1,2,1.5],[0,2,100]]) {
    await assert.rejects(subject.transfer(pool,...args),RangeError);
  }
  assert.equal(pool.connects,0); assert.equal(pool.calls.length,0);
});`, instructions: 'Автотест використовує явно позначений fake pg client: він перевіряє керування транзакцією, rollback і release, а не справжні блокування PostgreSQL. Для лабораторної з конкурентністю запусти compose.yml, дочекайся pg_isready, створи accounts(id int primary key,balance int not null check(balance>=0)), використай pg.Pool та два окремі clients. Після роботи: docker compose down (дані тимчасового контейнера видаляються).', files: {'compose.yml': `services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_USER: course
      POSTGRES_PASSWORD: local-course-only
      POSTGRES_DB: course
    ports: ["127.0.0.1:55432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U course -d course"]
      interval: 2s
      timeout: 2s
      retries: 20
`} }
  },
  {
    id: 'persistence-sql', moduleId: 'persistence', title: 'Repository, параметри та pool',
    summary: 'Прибираємо SQL-конкатенацію та задаємо чітку межу доступу до даних.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Параметризувати значення запиту.', 'Повертати null для відсутнього запису.', 'Пакетно читати набір ідентифікаторів.'],
    task: 'Реалізуй findByEmail(db,email) та findByIds(db,ids). Email передається як значення параметра, не як частина SQL. Відсутній email дає null; список id повертає унікальні записи за id ASC; для порожнього масиву запит не виконується.',
    steps: ['Виділи текст SQL і масив значень.', 'Використай ANY($1::int[]) для пакетного читання.', 'Зістав DB-результат із контрактом repository.'],
    hints: ['$1 — значення, а не назва таблиці чи колонки.', 'Порожній масив можна обробити до звернення до бази.', 'Для динамічних назв колонок потрібен allowlist; параметри не замінюють SQL-ідентифікатори.'],
    criteria: ['Рядок із лапками не змінює структуру запиту.', 'Відсутні записи мають узгоджений результат.', 'Один пакетний запит обслуговує всі id.'],
    mistakes: ['Вставляти email через шаблонний рядок у SQL.', 'Створювати новий pool на кожний HTTP-запит.'],
    reviewQuestions: ['Чому значення можна параметризувати, а ім’я таблиці — ні?', 'Які ресурси утримує connection pool?'],
    extensions: ['Реалізуй pg-адаптер з одним pool на процес, обмеженнями підключень і graceful shutdown.', 'Додай allowlist сортування та перевір вхідні значення, схожі на SQL injection.'],
    sources: [{ title: 'node-postgres queries', url: 'https://node-postgres.com/features/queries' }, { title: 'node-postgres pooling', url: 'https://node-postgres.com/features/pooling' }],
    quiz: { kind: 'choice', question: 'Чи можна передати назву таблиці як $1?', options: ['Так, параметри замінюють будь-який текст SQL.', 'Ні, параметри призначені для значень.', 'Лише якщо назва без пробілів.'], answer: 1, explanation: 'Ідентифікатори є частиною структури SQL. Для них потрібні контрольований перелік та коректне екранування.' },
    lab: { language: 'js', dependencies: {'@electric-sql/pglite':'^0.3.7'}, starter: `export async function findByEmail(db,email) {throw new Error('Знайди користувача параметризовано');}
export async function findByIds(db,ids) {throw new Error('Прочитай користувачів пакетом');}`, solution: `export async function findByEmail(db,email) {
  const result = await db.query('SELECT id,email FROM users WHERE email=$1', [email]);
  return result.rows[0] ?? null;
}
export async function findByIds(db,ids) {
  if (!Array.isArray(ids) || !ids.every(id => Number.isSafeInteger(id) && id > 0)) throw new TypeError('Некоректні id');
  if (ids.length === 0) return [];
  return (await db.query('SELECT id,email FROM users WHERE id=ANY($1::int[]) ORDER BY id ASC', [ids])).rows;
}`, tests: `test('параметри, відсутність та пакетне читання', async () => {
  const {PGlite} = await import('@electric-sql/pglite'); const db = new PGlite();
  try {
    await db.exec("CREATE TABLE users(id int PRIMARY KEY,email text UNIQUE NOT NULL); INSERT INTO users VALUES (1,'a@example.test'),(2,'b@example.test')");
    assert.deepEqual(await subject.findByEmail(db,'a@example.test'),{id:1,email:'a@example.test'});
    assert.equal(await subject.findByEmail(db,"x' OR 1=1 --"),null);
    assert.deepEqual((await subject.findByIds(db,[2,1,1])).map(row=>row.id),[1,2]);
    await assert.rejects(subject.findByIds(db,[-1]), TypeError);
    assert.deepEqual(await subject.findByIds({query(){throw new Error('Не звертайся до DB');}},[]),[]);
  } finally {await db.close();}
});`, instructions: 'PGlite перевіряє SQL на ізольованій базі. У реальному сервісі db є довгоживучим pg.Pool або виділеним pg client; в обох випадках значення передаються окремим масивом.' }
  },
  {
    id: 'persistence-orm', moduleId: 'persistence', title: 'Prisma, зв’язки та проблема N+1',
    summary: 'Зберігаємо контроль над кількістю звернень до даних навіть із ORM.', lectureMinutes: 15, practiceMinutes: 45,
    goals: ['Пояснити роль ORM і міграцій.', 'Виявляти N+1 за кількістю звернень.', 'Порівняти relation query та пакетне завантаження.'],
    task: 'Реалізуй loadOrdersWithCustomers(repository). Прочитай замовлення один раз, збери унікальні customerId та одним пакетом завантаж клієнтів. Поверни замовлення з полем customer у початковому порядку. Відсутній обов’язковий клієнт є помилкою узгодженості.',
    steps: ['Відділи repository-контракт від конкретної ORM.', 'Побудуй Map клієнтів за id.', 'Оброби порожній список без другого запиту та перевір відсутній зв’язок.'],
    hints: ['N+1 виникає при читанні батьківського списку та окремому запиті для кожного елемента.', 'Set прибирає повторні customerId перед пакетним читанням.', 'Map дає пошук клієнта без повторного проходу всього масиву.'],
    criteria: ['Для непорожнього списку — два repository-виклики незалежно від кількості замовлень.', 'Повторні customerId передаються один раз.', 'Порожній список та зламаний зв’язок оброблені явно.'],
    mistakes: ['Вважати ORM гарантією оптимальних запитів.', 'Плутати створення типів клієнта з перевіркою бізнес-інваріантів.'],
    reviewQuestions: ['Як побачити N+1 у логах або trace?', 'Коли два пакетні запити можуть прочитати неузгоджені версії даних?'],
    extensions: ['Створи окремий Prisma-проєкт із зафіксованою версією, моделями Customer/Order і міграцією; порівняй журнал relation-запиту та циклу запитів.', 'Повтори читання у Drizzle або TypeORM, порівняй з явним JOIN і запиши компроміси типізації, SQL та міграцій.'],
    sources: [{ title: 'Prisma ORM: relations and joins', url: 'https://www.prisma.io/docs/orm/fundamentals/relations-and-joins' }, { title: 'Prisma ORM migrations', url: 'https://www.prisma.io/docs/orm/prisma-migrate' }],
    quiz: { kind: 'choice', question: 'Для 100 замовлень виконано 1 запит списку та по запиту клієнта на кожне. Скільки звернень?', options: ['2', '100', '101'], answer: 2, explanation: 'Це N+1. Пакетне завантаження або відповідний relation/JOIN-запит прибирає зростання кількості звернень із N.' },
    lab: { language: 'ts', starter: `type Customer = {id: number; name: string};
type Order = {id: number; customerId: number; totalCents: number};
export interface Repository {findOrders(): Promise<Order[]>; findCustomersByIds(ids: number[]): Promise<Customer[]>;}
export async function loadOrdersWithCustomers(repository: Repository): Promise<(Order & {customer: Customer})[]> {
  throw new Error('Прибери N+1 пакетним завантаженням');
}`, solution: `type Customer = {id: number; name: string};
type Order = {id: number; customerId: number; totalCents: number};
export interface Repository {findOrders(): Promise<Order[]>; findCustomersByIds(ids: number[]): Promise<Customer[]>;}
export async function loadOrdersWithCustomers(repository: Repository): Promise<(Order & {customer: Customer})[]> {
  const orders = await repository.findOrders();
  if (orders.length === 0) return [];
  const ids = [...new Set(orders.map(order => order.customerId))];
  const customers = new Map((await repository.findCustomersByIds(ids)).map(customer => [customer.id,customer]));
  return orders.map(order => {
    const customer = customers.get(order.customerId);
    if (!customer) throw new Error('Порушений зв’язок клієнта');
    return {...order,customer};
  });
}`, tests: `test('два звернення, унікальні id та порядок', async () => {
  let calls = 0; let requested: number[] = [];
  const orders = [{id:2,customerId:7,totalCents:500},{id:1,customerId:7,totalCents:300}];
  const result = await subject.loadOrdersWithCustomers({async findOrders(){calls++; return orders;},async findCustomersByIds(ids){calls++; requested=ids; return [{id:7,name:'А'}];}});
  assert.equal(calls,2); assert.deepEqual(requested,[7]); assert.deepEqual(result.map(x=>x.id),[2,1]); assert.equal(result[0].customer.name,'А');
});
test('порожній список та відсутній зв’язок', async () => {
  assert.deepEqual(await subject.loadOrdersWithCustomers({async findOrders(){return [];},async findCustomersByIds(){throw new Error('Зайвий запит');}}),[]);
  await assert.rejects(subject.loadOrdersWithCustomers({async findOrders(){return [{id:1,customerId:8,totalCents:1}];},async findCustomersByIds(){return [];}}), /зв’язок/);
});`, instructions: 'Автотест перевіряє алгоритм пакетного читання через явно визначений repository, а не згенерований Prisma client. ORM-приклад у лекції позначений Prisma ORM 8; старі API Prisma 6/7 відрізняються. Генерацію, міграції та реальний SQL перевір у незалежному проєкті з зафіксованою версією.' }
  }
];
