import type { Lesson } from './schema';

export const foundationLessons: Lesson[] = [
  {
    "id": "setup-tools",
    "moduleId": "setup",
    "title": "Середовище, npm і перший модуль",
    "summary": "Відтворюваний запуск, аргументи процесу та зрозумілі команди проєкту.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Пояснювати, що саме запускає Node та які аргументи отримує програма.",
      "Розрізняти package.json, lockfile, вихідний код і встановлені залежності.",
      "Перевіряти CLI-параметри до використання."
    ],
    "task": "Реалізуй readOptions(args): поверни { port, verbose }, де порт за замовчуванням 3000, а verbose — false.",
    "steps": [
      "Підтримай --port зі значенням 1…65535 та прапорець --verbose.",
      "Відхиляй невідомі й повторні прапорці, пропущене значення, дроби та зайві позиційні аргументи.",
      "Запусти тести; перевір у debugger значення токена перед перетворенням."
    ],
    "hints": [
      "Пройди масив індексом. Після --port споживай і наступний елемент.",
      "Перевір рядок регулярним виразом лише з цифрами, а потім діапазон Number.",
      "Set уже зустрінутих прапорців допоможе виявити повтор."
    ],
    "criteria": [
      "Порожні аргументи повертають типізовані значення за замовчуванням.",
      "Усі некоректні параметри спричиняють Error.",
      "Вхідний масив не змінюється."
    ],
    "mistakes": [
      "Покладатися на parseInt: він прийме початок рядка 4000oops.",
      "Додавати node_modules у Git.",
      "Перетворювати порожній рядок на нуль без перевірки."
    ],
    "reviewQuestions": [
      "Що означає ненульовий код завершення команди?",
      "Навіщо lockfile, якщо є package.json?",
      "Чому CLI отримує рядок, навіть коли користувач увів число?"
    ],
    "extensions": [
      "Додай --help та окреме форматування помилок у CLI-обгортці; перевір код завершення дочірнього процесу.",
      "Створи мінімальний репозиторій із npm scripts, .gitignore та README; відтвори запуск у новій папці."
    ],
    "sources": [
      {
        "title": "Node.js: process.argv",
        "url": "https://nodejs.org/api/process.html#processargv"
      },
      {
        "title": "npm: package.json",
        "url": "https://docs.npmjs.com/cli/v11/configuring-npm/package-json"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Які аргументи належать програмі після запуску node app.mjs --port 4000?",
      "options": [
        "Увесь process.argv",
        "process.argv.slice(2)",
        "Лише process.argv[0]"
      ],
      "answer": 1,
      "explanation": "Node та шлях до файла займають перші дві позиції."
    },
    "lab": {
      "language": "js",
      "starter": "export function readOptions(args) {\n  throw new Error('Реалізуй перевірку аргументів');\n}\n",
      "solution": "export function readOptions(args) {\n  if (!Array.isArray(args)) throw new TypeError('Очікується масив');\n  const result = { port: 3000, verbose: false };\n  const seen = new Set();\n  for (let i = 0; i < args.length; i += 1) {\n    const flag = args[i];\n    if (seen.has(flag)) throw new Error('Повторний прапорець');\n    seen.add(flag);\n    if (flag === '--verbose') result.verbose = true;\n    else if (flag === '--port') {\n      const raw = args[++i];\n      if (typeof raw !== 'string' || !/^\\d+$/.test(raw)) throw new Error('Некоректний порт');\n      const port = Number(raw);\n      if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Некоректний порт');\n      result.port = port;\n    } else throw new Error('Невідомий прапорець');\n  }\n  return result;\n}\n",
      "tests": "test('defaults and valid combinations', () => {\n  assert.deepEqual(subject.readOptions([]), { port: 3000, verbose: false });\n  assert.deepEqual(subject.readOptions(['--verbose','--port','65535']), { port: 65535, verbose: true });\n  assert.equal(subject.readOptions(['--port','1']).port, 1);\n});\ntest('reject malformed or ambiguous input', () => {\n  for (const args of [['--port'],['--port',''],['--port','3.5'],['--port','4000oops'],['--port','0'],['--port','65536'],['--wat'],['3000'],['--verbose','--verbose'],['--port','2','--port','3']]) {\n    assert.throws(() => subject.readOptions(args));\n  }\n});\ntest('does not consume the caller array', () => {\n  const args = Object.freeze(['--port','4000']);\n  assert.equal(subject.readOptions(args).port,4000);\n});\n"
    }
  },
  {
    "id": "setup-debug",
    "moduleId": "setup",
    "title": "Debugger і перший тест",
    "summary": "Відтворюй помилку, досліджуй значення та перевіряй виправлення.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Відтворювати баг мінімальним прикладом.",
      "Користуватися breakpoint, call stack та перевіркою типів.",
      "Закріплювати виправлення поведінковим тестом."
    ],
    "task": "Виправ totalCents(items): обчисли суму цілих копійок без перетворення на рядки та відхиляй некоректні позиції.",
    "steps": [
      "Постав breakpoint на додаванні; запиши тип проміжної суми.",
      "Перевір priceCents як невід’ємне безпечне ціле, quantity — як додатне безпечне ціле.",
      "Відхиляй переповнення безпечної цілої арифметики; порожній кошик має суму 0."
    ],
    "hints": [
      "Рядок і число з оператором + можуть дати рядок.",
      "Number.isSafeInteger перевіряє і цілісність, і безпечний діапазон.",
      "Перевір не лише окреме множення, а й нову загальну суму."
    ],
    "criteria": [
      "Сума має числовий тип і точне значення в копійках.",
      "Помилка відтворена тестом до виправлення.",
      "Некоректна позиція та переповнення відхиляються."
    ],
    "mistakes": [
      "Виправляти лише конкретні дані замість загального правила.",
      "Порівнювати очікуване значення нестрого.",
      "Ігнорувати помилки в порожньому catch."
    ],
    "reviewQuestions": [
      "Що показує call stack?",
      "Чому Number.isInteger недостатньо для великих сум?",
      "Який тест доводить, що початковий баг усунено?"
    ],
    "extensions": [
      "Додай знижку в базисних пунктах і явно опиши правило округлення; перевір граничні суми.",
      "Додай тест помилки в іншому модулі, запиши короткий звіт: відтворення, гіпотеза, доказ, виправлення."
    ],
    "sources": [
      {
        "title": "Node.js: debugging",
        "url": "https://nodejs.org/en/learn/getting-started/debugging"
      },
      {
        "title": "Node.js: test runner",
        "url": "https://nodejs.org/api/test.html"
      }
    ],
    "quiz": {
      "kind": "input",
      "question": "Який результат має правильний підрахунок 199 копійок × 3?",
      "accepted": [
        "597"
      ],
      "explanation": "Множимо цілі копійки; результат — число 597."
    },
    "lab": {
      "language": "js",
      "starter": "export function totalCents(items) {\n  let sum = 0;\n  for (const item of items) sum = String(sum) + item.priceCents * item.quantity;\n  return sum;\n}\n",
      "solution": "export function totalCents(items) {\n  if (!Array.isArray(items)) throw new TypeError('Очікується масив');\n  let sum = 0;\n  for (const item of items) {\n    if (!item || !Number.isSafeInteger(item.priceCents) || item.priceCents < 0 ||\n        !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new TypeError('Некоректна позиція');\n    const part = item.priceCents * item.quantity;\n    if (!Number.isSafeInteger(part) || !Number.isSafeInteger(sum + part)) throw new RangeError('Переповнення');\n    sum += part;\n  }\n  return sum;\n}\n",
      "tests": "test('totals use numeric addition', () => {\n  assert.equal(subject.totalCents([]),0);\n  assert.equal(subject.totalCents([{priceCents:199,quantity:3},{priceCents:50,quantity:2}]),697);\n});\ntest('invalid quantities and prices fail explicitly', () => {\n  for(const item of [{priceCents:'100',quantity:1},{priceCents:-1,quantity:1},{priceCents:2,quantity:0},{priceCents:2,quantity:1.5},null]) {\n    assert.throws(()=>subject.totalCents([item]),TypeError);\n  }\n});\ntest('reject overflow of either multiplication or sum', () => {\n  assert.throws(()=>subject.totalCents([{priceCents:Number.MAX_SAFE_INTEGER,quantity:2}]),RangeError);\n  assert.throws(()=>subject.totalCents([{priceCents:Number.MAX_SAFE_INTEGER,quantity:1},{priceCents:1,quantity:1}]),RangeError);\n});\n"
    }
  },
  {
    "id": "javascript-values",
    "moduleId": "javascript",
    "title": "Типи, перетворення та рівність",
    "summary": "Приймай зовнішні значення за чітким контрактом і керуй перетвореннями.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Розрізняти примітиви та об’єкти.",
      "Пояснювати ===, truthy/falsy, || і ??.",
      "Нормалізувати значення відповідно до явного контракту."
    ],
    "task": "Реалізуй normalizeLimit(value, fallback = 20): приймай ціле число 1…100 або рядок із цифр; undefined використовує fallback.",
    "steps": [
      "Визнач допустимі форми до числового перетворення.",
      "Відхили null, boolean, порожній рядок, пробіли, дроби, NaN та нескінченність.",
      "Перевір fallback за тими самими межами. Сам експортуй normalizeLimit з exercise.js та імпортуй її у своєму тесті."
    ],
    "hints": [
      "Перевір value === undefined окремо.",
      "Для рядка використай перевірку від початку до кінця, а не parseInt.",
      "Number.isInteger відхиляє NaN, Infinity та дроби."
    ],
    "criteria": [
      "Результат завжди число від 1 до 100.",
      "Default застосовується лише для undefined.",
      "Некоректні значення викликають TypeError або RangeError."
    ],
    "mistakes": [
      "Приймати Boolean('false') за false.",
      "Підміняти перевірку значення умовою if (!value).",
      "Вважати const гарантією незмінності об’єкта."
    ],
    "reviewQuestions": [
      "Чим відрізняються null та undefined у цьому контракті?",
      "Чому Number('') небезпечний без попередньої перевірки?",
      "Коли ?? та || дають різний результат?"
    ],
    "extensions": [
      "Напиши normalizeBoolean для query-параметра з явними дозволеними написами та тестами неправильних значень.",
      "Побудуй таблицю перетворень для null, undefined, '', '0', 0, NaN; перед запуском передбач кожний результат."
    ],
    "sources": [
      {
        "title": "MDN: equality comparisons",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness"
      },
      {
        "title": "MDN: nullish coalescing",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що поверне вираз 0 ?? 25?",
      "options": [
        "25",
        "0",
        "undefined"
      ],
      "answer": 1,
      "explanation": "?? підставляє правий операнд лише для null або undefined."
    },
    "lab": {
      "language": "js",
      "starter": "function normalizeLimit(value, fallback = 20) {\n  throw new Error('Реалізуй нормалізацію за контрактом');\n}\n\n// Експортуй normalizeLimit для своїх тестів.\n",
      "testCases": [
        "Передай рядок із цифр і перевір, що отримуєш відповідне число.",
        "Передай undefined із власним fallback та перевір повернене значення.",
        "Передай null або число на один крок за межами діапазону й перевір, що функція кидає помилку."
      ],
      "refactor": {
        "file": "refactor.js",
        "goal": "Спрости formatLimit. Спершу напиши тести для undefined і 0, щоб зафіксувати, коли спрацьовує значення за замовчуванням. Потім прибери зайві гілки, зберігши поведінку також для null. Покажи Luna код і тести після змін."
      },
      "files": {
        "refactor.js": "export function formatLimit(value) {\n  let isMissing = false;\n  if (value === undefined) {\n    isMissing = true;\n  } else {\n    isMissing = false;\n  }\n  if (isMissing) {\n    const label = 'Limit: ' + 20;\n    return label;\n  } else {\n    const label = 'Limit: ' + value;\n    return label;\n  }\n}\n"
      },
      "solution": "export function normalizeLimit(value, fallback = 20) {\n  const raw = value === undefined ? fallback : value;\n  if (typeof raw !== 'number' && (typeof raw !== 'string' || !/^\\d+$/.test(raw))) throw new TypeError('Очікується ціле число');\n  const result = Number(raw);\n  if (!Number.isInteger(result) || result < 1 || result > 100) throw new RangeError('Межі 1…100');\n  return result;\n}\n",
      "tests": "test('valid numeric forms and default', () => {\n  assert.equal(subject.normalizeLimit(undefined),20);\n  assert.equal(subject.normalizeLimit(undefined,40),40);\n  assert.equal(subject.normalizeLimit('001'),1);\n  assert.equal(subject.normalizeLimit(100),100);\n});\ntest('no accidental coercion or partial parsing', () => {\n  for(const value of [null,true,false,'',' ','1x','1.5',0,101,-1,NaN,Infinity,{},[]]) {\n    assert.throws(()=>subject.normalizeLimit(value));\n  }\n});\ntest('an invalid default also fails', () => {\n  assert.throws(()=>subject.normalizeLimit(undefined,0));\n  assert.throws(()=>subject.normalizeLimit(undefined,Infinity));\n});\n"
    }
  },
  {
    "id": "javascript-functions",
    "moduleId": "javascript",
    "title": "Функції, область видимості й замикання",
    "summary": "Використовуй функції як значення та ізолюй стан у лексичній області.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Передавати й повертати функції без передчасного виклику.",
      "Пояснювати лексичну область видимості та замикання.",
      "Проєктувати невеликий контрольований стан."
    ],
    "task": "Створи createCounter(initial = 0, step = 1), що повертає increment(), value() і reset(). Методи працюють і після відокремлення від об’єкта.",
    "steps": [
      "Збережи поточне значення в області фабрики.",
      "increment повертає нове значення, value — поточне, reset повертає й відновлює initial.",
      "Приймай лише безпечні цілі initial та step. При переповненні збережи стан. Сам експортуй createCounter та імпортуй її у власному тесті."
    ],
    "hints": [
      "Методи можуть замикати локальну змінну без this.",
      "Перед присвоєнням обчисли candidate та перевір Number.isSafeInteger.",
      "Порівняй два виклики фабрики й два посилання на один результат."
    ],
    "criteria": [
      "Два екземпляри мають незалежний стан.",
      "reset відновлює початкове значення.",
      "Переповнення не пошкоджує поточний стан."
    ],
    "mistakes": [
      "Створювати count у глобальній області.",
      "Передавати increment() замість increment як callback.",
      "Міняти стан до перевірки діапазону."
    ],
    "reviewQuestions": [
      "Чому локальна змінна доступна після повернення фабрики?",
      "Чим незалежні екземпляри відрізняються від двох посилань на один?",
      "Коли чиста функція простіша за об’єкт зі станом?"
    ],
    "extensions": [
      "Зроби фабрику обмежувача кількості операцій із reset та ін’єкцією годинника; протестуй незалежність екземплярів.",
      "Реалізуй compose для довільного числа чистих функцій і порівняй порядок викликів із pipeline."
    ],
    "sources": [
      {
        "title": "MDN: closures",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures"
      },
      {
        "title": "MDN: functions",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions"
      }
    ],
    "quiz": {
      "kind": "input",
      "question": "Що виведе третій виклик у прикладі makeCounter: first(), first(), second()?",
      "accepted": [
        "1"
      ],
      "explanation": "second має окреме лексичне середовище, тому його стан починається з нуля."
    },
    "lab": {
      "language": "js",
      "starter": "function createCounter(initial = 0, step = 1) {\n  throw new Error('Реалізуй фабрику незалежних лічильників');\n}\n\n// Експортуй createCounter для своїх тестів.\n",
      "testCases": [
        "Створи два лічильники, зміни перший і перевір, що другий зберіг свій початковий стан.",
        "Виклич окремо збережений increment без об’єкта, потім перевір reset.",
        "Спробуй збільшити значення від MAX_SAFE_INTEGER та перевір, що помилка не змінила стан."
      ],
      "solution": "export function createCounter(initial = 0, step = 1) {\n  if (!Number.isSafeInteger(initial) || !Number.isSafeInteger(step)) throw new TypeError('Потрібні безпечні цілі');\n  let current = initial;\n  return {\n    increment() {\n      const candidate = current + step;\n      if (!Number.isSafeInteger(candidate)) throw new RangeError('Переповнення');\n      current = candidate;\n      return current;\n    },\n    value: () => current,\n    reset: () => { current = initial; return current; }\n  };\n}\n",
      "tests": "test('closure state and detached operations', () => {\n  const counter=subject.createCounter(5,2);\n  const increment=counter.increment;\n  assert.equal(increment(),7);\n  assert.equal(increment(),9);\n  assert.equal(counter.value(),9);\n  assert.equal(counter.reset(),5);\n});\ntest('factories do not share state', () => {\n  const a=subject.createCounter(), b=subject.createCounter();\n  a.increment(); a.increment();\n  assert.equal(b.value(),0);\n  assert.equal(a.value(),2);\n});\ntest('invalid input and overflow leave state intact', () => {\n  assert.throws(()=>subject.createCounter(0,0.5),TypeError);\n  const counter=subject.createCounter(Number.MAX_SAFE_INTEGER,1);\n  assert.throws(()=>counter.increment(),RangeError);\n  assert.equal(counter.value(),Number.MAX_SAFE_INTEGER);\n});\n"
    }
  },
  {
    "id": "javascript-collections",
    "moduleId": "javascript",
    "title": "Масиви, об’єкти та посилання",
    "summary": "Перетворюй колекції, групуй дані й контролюй мутації.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Пояснювати поверхневе копіювання та спільні вкладені посилання.",
      "Обирати між map, filter, reduce та циклом.",
      "Групувати дані без зміни вхідної колекції."
    ],
    "task": "Реалізуй groupTotals(orders), що повертає { byCustomer: Map, totalCents }. Запис має customer — непорожній рядок, amountCents — невід’ємне безпечне ціле.",
    "steps": [
      "За один прохід перевір записи й накопич суми.",
      "Для кожного клієнта збережи число в Map.",
      "Відхиляй переповнення загальної або групової суми. Збережи orders як є. Сам експортуй groupTotals та імпортуй її у власному тесті."
    ],
    "hints": [
      "Початкове значення групи — map.get(customer) ?? 0.",
      "Додавання до Map не потребує зміни об’єктів замовлень.",
      "Нуль є допустимою сумою, тому перевірка if (!amount) не підходить."
    ],
    "criteria": [
      "Повторні клієнти агрегуються, а загальна сума узгоджена з групами.",
      "Порожній список дає порожню Map і нуль.",
      "Некоректні значення явно відхиляються."
    ],
    "mistakes": [
      "Змінювати вхідний масив через sort.",
      "Вважати spread глибоким копіюванням.",
      "Плутати get/set у Map зі звичайними властивостями об’єкта."
    ],
    "reviewQuestions": [
      "Які посилання залишаються спільними після {...object}?",
      "Коли цикл читабельніший за reduce?",
      "Чому перевірка нульової суми через !value некоректна?"
    ],
    "extensions": [
      "Додай групування за клієнтом і місяцем; сформуй новий звіт, не змінюючи джерело.",
      "Побудуй відтворення помилки shallow copy та виправ його копіюванням лише зміненого вкладеного шляху."
    ],
    "sources": [
      {
        "title": "MDN: Array",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array"
      },
      {
        "title": "MDN: spread syntax",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що буде з original.user.name після зміни copy.user.name у прикладі?",
      "options": [
        "Залишиться Іра",
        "Стане Оля",
        "Виникне помилка через const"
      ],
      "answer": 1,
      "explanation": "Spread копіює верхній рівень; вкладений user лишається спільним об’єктом."
    },
    "lab": {
      "language": "js",
      "starter": "function groupTotals(orders) {\n  throw new Error('Реалізуй групування без мутації');\n}\n\n// Експортуй groupTotals для своїх тестів.\n",
      "testCases": [
        "Передай два замовлення одного клієнта й одне іншого. Перевір суми в Map і загальну суму.",
        "Збережи копію вхідних замовлень. Після виклику порівняй із нею вхідний масив і записи.",
        "Додай випадок з переповненням суми або зі значенням, яке порушує контракт."
      ],
      "solution": "export function groupTotals(orders) {\n  if (!Array.isArray(orders)) throw new TypeError('Очікується масив');\n  const byCustomer = new Map();\n  let totalCents = 0;\n  for (const order of orders) {\n    if (!order || typeof order.customer !== 'string' || order.customer.trim() === '' ||\n        !Number.isSafeInteger(order.amountCents) || order.amountCents < 0) throw new TypeError('Некоректне замовлення');\n    const group = (byCustomer.get(order.customer) ?? 0) + order.amountCents;\n    const total = totalCents + order.amountCents;\n    if (!Number.isSafeInteger(group) || !Number.isSafeInteger(total)) throw new RangeError('Переповнення');\n    byCustomer.set(order.customer, group);\n    totalCents = total;\n  }\n  return { byCustomer, totalCents };\n}\n",
      "tests": "test('groups duplicates and preserves input', () => {\n  const rows=Object.freeze([Object.freeze({customer:'a',amountCents:200}),Object.freeze({customer:'b',amountCents:0}),Object.freeze({customer:'a',amountCents:150})]);\n  const result=subject.groupTotals(rows);\n  assert.ok(result.byCustomer instanceof Map);\n  assert.deepEqual([...result.byCustomer],[['a',350],['b',0]]);\n  assert.equal(result.totalCents,350);\n  assert.equal(rows[0].amountCents,200);\n});\ntest('empty and unusual customer keys', () => {\n  const empty=subject.groupTotals([]);\n  assert.equal(empty.totalCents,0);\n  assert.equal(empty.byCustomer.size,0);\n  assert.equal(subject.groupTotals([{customer:'__proto__',amountCents:5}]).byCustomer.get('__proto__'),5);\n});\ntest('invalid amounts and overflow', () => {\n  assert.throws(()=>subject.groupTotals([{customer:'a',amountCents:NaN}]),TypeError);\n  assert.throws(()=>subject.groupTotals([{customer:' ',amountCents:1}]),TypeError);\n  assert.throws(()=>subject.groupTotals([{customer:'a',amountCents:Number.MAX_SAFE_INTEGER},{customer:'b',amountCents:1}]),RangeError);\n});\n"
    }
  },
  {
    "id": "objects-this",
    "moduleId": "objects",
    "title": "this і передавання методів",
    "summary": "Зрозумій контекст виклику та зроби callback із передбачуваною поведінкою.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Пояснювати залежність this від способу виклику.",
      "Відрізняти стрілку, звичайний метод і bind.",
      "Створювати безпечний callback для зовнішнього викликача."
    ],
    "task": "Реалізуй клас Reporter(prefix, write). Його log(message) передає у write рядок '[prefix] message' і зберігає контекст після відокремлення.",
    "steps": [
      "Перевір prefix як непорожній рядок, write — як функцію.",
      "Прив’яжи log до екземпляра в конструкторі.",
      "Відхиляй нестрокове message; зміна reporter.prefix має відобразитися у наступному повідомленні."
    ],
    "hints": [
      "this.log = this.log.bind(this) створює прив’язаний метод.",
      "Прив’язка фіксує отримувача, але читає його поточні поля під час виклику.",
      "Не викликай write, доки повідомлення не перевірене."
    ],
    "criteria": [
      "Відокремлений log працює без додаткового bind у користувача.",
      "Чужий call не підміняє prefix.",
      "Екземпляри ізольовані та використовують власний write."
    ],
    "mistakes": [
      "Очікувати, що const { log } = reporter збереже this.",
      "Ставити стрілку в літерал об’єкта й очікувати його контекст.",
      "Використовувати повторний bind для видалення раніше доданого listener."
    ],
    "reviewQuestions": [
      "Що визначає this у звичайному методі?",
      "Чим bind відрізняється від call?",
      "Чому дві послідовні операції bind дають різні посилання?"
    ],
    "extensions": [
      "Реалізуй аналогічний reporter через замикання та порівняй поведінку й розміщення методів.",
      "Зроби міні-шину подій із subscribe/unsubscribe й перевір видалення прив’язаного обробника."
    ],
    "sources": [
      {
        "title": "MDN: this",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this"
      },
      {
        "title": "MDN: Function.bind",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що повертає bind?",
      "options": [
        "Одразу результат виклику оригіналу",
        "Нову функцію із зафіксованим this",
        "Той самий об’єкт після зміни прототипу"
      ],
      "answer": 1,
      "explanation": "bind створює функцію; саме виконання відбудеться під час її наступного виклику."
    },
    "lab": {
      "language": "js",
      "starter": "export class Reporter {\n  constructor(prefix, write) {\n    throw new Error('Реалізуй прив’язаний callback');\n  }\n}\n",
      "solution": "export class Reporter {\n  constructor(prefix, write) {\n    if (typeof prefix !== 'string' || prefix.trim() === '' || typeof write !== 'function') throw new TypeError('Некоректна конфігурація');\n    this.prefix = prefix;\n    this.write = write;\n    this.log = this.log.bind(this);\n  }\n  log(message) {\n    if (typeof message !== 'string') throw new TypeError('Повідомлення має бути рядком');\n    this.write('[' + this.prefix + '] ' + message);\n  }\n}\n",
      "tests": "test('method survives detachment and foreign call', () => {\n  const output=[];\n  const reporter=new subject.Reporter('api',line=>output.push(line));\n  const {log}=reporter;\n  log('ready');\n  log.call({prefix:'wrong'},'again');\n  reporter.prefix='worker';\n  log('done');\n  assert.deepEqual(output,['[api] ready','[api] again','[worker] done']);\n});\ntest('independent reporters and invalid input', () => {\n  const a=[], b=[];\n  new subject.Reporter('a',line=>a.push(line)).log('one');\n  new subject.Reporter('b',line=>b.push(line)).log('two');\n  assert.deepEqual(a,['[a] one']);\n  assert.deepEqual(b,['[b] two']);\n  assert.throws(()=>new subject.Reporter('',()=>{}),TypeError);\n  const reporter=new subject.Reporter('a',()=>assert.fail('write must not run'));\n  assert.throws(()=>reporter.log(null),TypeError);\n});\n"
    }
  },
  {
    "id": "objects-prototypes",
    "moduleId": "objects",
    "title": "Прототипи, класи та інваріанти",
    "summary": "Розбери спільні методи й захищений стан на прикладі обліку залишків.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Пояснювати пошук властивості вздовж прототипного ланцюжка.",
      "Відрізняти спільні методи від стану екземпляра.",
      "Захищати інваріант через приватний стан і перевірені операції."
    ],
    "task": "Реалізуй Inventory із add(sku, quantity), sell(sku, quantity), getter size та snapshot(). Нульовий залишок видаляє позицію.",
    "steps": [
      "Зберігай залишки у приватній Map; sku має бути непорожнім рядком, кількість — додатним безпечним цілим.",
      "add і sell повертають новий залишок; неможливий продаж і переповнення кидають RangeError без зміни стану.",
      "snapshot повертає новий масив нових об’єктів {sku, quantity}; size рахує наявні позиції."
    ],
    "hints": [
      "Приватне поле #stock створюй для кожного екземпляра.",
      "Спочатку обчисли кандидат нового залишку, потім змінюй Map.",
      "Копія масиву зі старими об’єктами не ізолює вкладені зміни."
    ],
    "criteria": [
      "Залишок ніколи не стає від’ємним або небезпечним цілим.",
      "Зміна snapshot не змінює Inventory.",
      "Два Inventory мають незалежний стан."
    ],
    "mistakes": [
      "Розміщувати змінну Map на прототипі й ділити її між усіма екземплярами.",
      "Повертати внутрішню Map користувачу.",
      "Змінювати залишок перед перевіркою доступної кількості."
    ],
    "reviewQuestions": [
      "Де лежить метод класу, якщо він не оголошений полем?",
      "Яку гарантію надає приватне поле, а яку — ні?",
      "Чому snapshot має копіювати записи?"
    ],
    "extensions": [
      "Додай transfer між двома складами: визнач порядок перевірок і доведи, що невдала операція не змінює жоден склад.",
      "Реалізуй той самий публічний контракт через фабрику з замиканням та порівняй API й тестованість."
    ],
    "sources": [
      {
        "title": "MDN: inheritance and prototype chain",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain"
      },
      {
        "title": "MDN: classes",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Чому a.increment === b.increment у прикладі дорівнює true?",
      "options": [
        "Обидва екземпляри мають спільний #value",
        "Метод знайдено на спільному прототипі",
        "Конструктор повернув один і той самий об’єкт"
      ],
      "answer": 1,
      "explanation": "Методи прототипу можуть бути спільними, хоча приватний стан кожного екземпляра окремий."
    },
    "lab": {
      "language": "js",
      "starter": "export class Inventory {\n  add(sku, quantity) { throw new Error('Реалізуй add'); }\n  sell(sku, quantity) { throw new Error('Реалізуй sell'); }\n  get size() { return 0; }\n  snapshot() { return []; }\n}\n",
      "solution": "function validate(sku, quantity) {\n  if (typeof sku !== 'string' || sku.trim() === '' || !Number.isSafeInteger(quantity) || quantity < 1) throw new TypeError('Некоректна позиція');\n}\nexport class Inventory {\n  #stock = new Map();\n  add(sku, quantity) {\n    validate(sku, quantity);\n    const next = (this.#stock.get(sku) ?? 0) + quantity;\n    if (!Number.isSafeInteger(next)) throw new RangeError('Переповнення');\n    this.#stock.set(sku, next);\n    return next;\n  }\n  sell(sku, quantity) {\n    validate(sku, quantity);\n    const next = (this.#stock.get(sku) ?? 0) - quantity;\n    if (next < 0) throw new RangeError('Недостатній залишок');\n    if (next === 0) this.#stock.delete(sku);\n    else this.#stock.set(sku, next);\n    return next;\n  }\n  get size() { return this.#stock.size; }\n  snapshot() {\n    return [...this.#stock].map(([sku, quantity]) => ({ sku, quantity }));\n  }\n}\n",
      "tests": "test('stock updates and zero removal', () => {\n  const stock=new subject.Inventory();\n  assert.equal(stock.add('book',3),3);\n  assert.equal(stock.add('book',2),5);\n  assert.equal(stock.sell('book',4),1);\n  assert.equal(stock.size,1);\n  assert.equal(stock.sell('book',1),0);\n  assert.equal(stock.size,0);\n});\ntest('failed sale and exported snapshot do not corrupt stock', () => {\n  const stock=new subject.Inventory();\n  stock.add('pen',2);\n  assert.throws(()=>stock.sell('pen',3),RangeError);\n  const view=stock.snapshot();\n  view[0].quantity=99;\n  view.push({sku:'fake',quantity:10});\n  assert.deepEqual(stock.snapshot(),[{sku:'pen',quantity:2}]);\n  assert.equal(new subject.Inventory().size,0);\n});\ntest('validate values before mutation', () => {\n  const stock=new subject.Inventory();\n  assert.throws(()=>stock.add('',1),TypeError);\n  assert.throws(()=>stock.add('a',1.5),TypeError);\n  assert.throws(()=>stock.sell('missing',1),RangeError);\n  stock.add('a',Number.MAX_SAFE_INTEGER);\n  assert.throws(()=>stock.add('a',1),RangeError);\n  assert.equal(stock.snapshot()[0].quantity,Number.MAX_SAFE_INTEGER);\n});\n"
    }
  },
  {
    "id": "objects-composition",
    "moduleId": "objects",
    "title": "Композиція та ін’єкція залежностей",
    "summary": "Поєднуй бізнес-правила без прихованих глобальних залежностей.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Виділяти бізнес-правила від вводу/виводу.",
      "Передавати залежності через явні аргументи.",
      "Обирати композицію для незалежних можливостей."
    ],
    "task": "Реалізуй createPricing({getPrice, discount}), яка повертає quote(lines) із subtotalCents, discountCents і totalCents. discount за замовчуванням повертає 0.",
    "steps": [
      "Кожна позиція містить непорожній sku та додатну цілу quantity; getPrice повертає невід’ємну ціну в копійках.",
      "Визнач subtotal, виклич discount(subtotal) і перевір, що знижка — ціле число між 0 і subtotal.",
      "Відхиляй некоректні залежності, ціни та переповнення; не змінюй кошик."
    ],
    "hints": [
      "Фабрика має приймати функції, а не готові глобальні змінні каталогу.",
      "Розрізняй суму знижки та кінцеву ціну.",
      "У тесті легко підмінити getPrice функцією читання Map."
    ],
    "criteria": [
      "Різні каталоги та правила працюють із тим самим розрахунком.",
      "Знижка не може створити від’ємний результат.",
      "Помилка зовнішнього каталогу не перетворюється на безкоштовний товар."
    ],
    "mistakes": [
      "Викликати мережу безпосередньо в обчисленні, не залишивши точки підміни.",
      "Створювати успадкування для кожної комбінації незалежних правил.",
      "Приховувати відсутній товар через price || 0."
    ],
    "reviewQuestions": [
      "Яку залежність можна підмінити без зміни бізнес-правила?",
      "Чим композиція відрізняється від успадкування?",
      "Чому fallback 0 для невідомої ціни може бути бізнес-помилкою?"
    ],
    "extensions": [
      "Додай податок і доставку як незалежні політики; опиши порядок застосування та перевір округлення.",
      "Оформи CLI-адаптер навколо quote, залишивши модуль розрахунку без process, console та файлових операцій."
    ],
    "sources": [
      {
        "title": "MDN: functions",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions"
      },
      {
        "title": "NestJS: providers and dependency injection",
        "url": "https://docs.nestjs.com/providers"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Як найпростіше протестувати розрахунок без справжньої бази?",
      "options": [
        "Приховати помилки бази в catch",
        "Передати getPrice як тестову функцію",
        "Переписати весь розрахунок окремо для тесту"
      ],
      "answer": 1,
      "explanation": "Явна залежність дозволяє контролювати вхід і помилки без зовнішньої інфраструктури."
    },
    "lab": {
      "language": "js",
      "starter": "export function createPricing({ getPrice, discount = () => 0 }) {\n  throw new Error('Реалізуй розрахунок із явними залежностями');\n}\n",
      "solution": "export function createPricing({ getPrice, discount = () => 0 }) {\n  if (typeof getPrice !== 'function' || typeof discount !== 'function') throw new TypeError('Потрібні функції');\n  return {\n    quote(lines) {\n      if (!Array.isArray(lines)) throw new TypeError('Потрібен масив');\n      let subtotalCents = 0;\n      for (const line of lines) {\n        if (!line || typeof line.sku !== 'string' || line.sku.trim() === '' ||\n            !Number.isSafeInteger(line.quantity) || line.quantity < 1) throw new TypeError('Некоректна позиція');\n        const price = getPrice(line.sku);\n        if (!Number.isSafeInteger(price) || price < 0) throw new TypeError('Некоректна ціна');\n        const part = price * line.quantity;\n        if (!Number.isSafeInteger(part) || !Number.isSafeInteger(subtotalCents + part)) throw new RangeError('Переповнення');\n        subtotalCents += part;\n      }\n      const discountCents = discount(subtotalCents);\n      if (!Number.isSafeInteger(discountCents) || discountCents < 0 || discountCents > subtotalCents) throw new RangeError('Некоректна знижка');\n      return { subtotalCents, discountCents, totalCents: subtotalCents - discountCents };\n    }\n  };\n}\n",
      "tests": "test('different injected catalogs and policies', () => {\n  const catalog=new Map([['book',100],['pen',50]]);\n  const pricing=subject.createPricing({getPrice:sku=>catalog.get(sku),discount:sum=>Math.floor(sum/10)});\n  const lines=Object.freeze([Object.freeze({sku:'book',quantity:2}),Object.freeze({sku:'pen',quantity:1})]);\n  assert.deepEqual(pricing.quote(lines),{subtotalCents:250,discountCents:25,totalCents:225});\n  assert.deepEqual(subject.createPricing({getPrice:()=>7}).quote([{sku:'x',quantity:2}]),{subtotalCents:14,discountCents:0,totalCents:14});\n});\ntest('empty cart and invalid data', () => {\n  assert.equal(subject.createPricing({getPrice:()=>0}).quote([]).totalCents,0);\n  assert.throws(()=>subject.createPricing({getPrice:()=>undefined}).quote([{sku:'missing',quantity:1}]),TypeError);\n  assert.throws(()=>subject.createPricing({getPrice:()=>100,discount:()=>101}).quote([{sku:'x',quantity:1}]),RangeError);\n  assert.throws(()=>subject.createPricing({getPrice:()=>100}).quote([{sku:'x',quantity:0}]),TypeError);\n});\ntest('dependency failures stay visible', () => {\n  const error=new Error('catalog offline');\n  const pricing=subject.createPricing({getPrice:()=>{throw error;}});\n  assert.throws(()=>pricing.quote([{sku:'x',quantity:1}]),value=>value===error);\n});\n"
    }
  },
  {
    "id": "structures-maps",
    "moduleId": "structures",
    "title": "Map, Set та індекси",
    "summary": "Прибирай повторні сканування й явно обробляй дублікати ключів.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Вибирати Map для динамічних індексів і Set для унікальних значень.",
      "Визначати політику повторних ключів.",
      "Оцінювати підготовку індексу та його життєвий цикл."
    ],
    "task": "Реалізуй indexUnique(rows, keyOf) та groupBy(rows, keyOf). Обидві повертають Map; ключ має бути непорожнім рядком. indexUnique відхиляє дублікати, groupBy зберігає масиви записів у початковому порядку.",
    "steps": [
      "Передавай отримання ключа як callback; за замовчуванням використовуй row.id.",
      "Для унікального індексу перевір has перед set.",
      "Для групування створюй власні масиви, залишаючи вхідні записи незмінними."
    ],
    "hints": [
      "Порожній індекс — new Map(), а не {}.",
      "Set перевіряє унікальність об’єктів за посиланням, тому самі записи не замінюють бізнес-ключ.",
      "У groupBy додавай запис у масив конкретної групи."
    ],
    "criteria": [
      "Дублікат у indexUnique спричиняє RangeError.",
      "groupBy зберігає всі записи та їхній порядок.",
      "Некоректний або відсутній ключ явно відхиляється."
    ],
    "mistakes": [
      "Читати map[key] замість map.get(key).",
      "Очікувати дедуплікації різних об’єктів із однаковими полями через Set.",
      "Не враховувати, що індекс утримує посилання на джерело."
    ],
    "reviewQuestions": [
      "Коли вартість побудови Map окупається?",
      "Чому два об’єкти з однаковими id не рівні для Set?",
      "Яка політика повторних ключів потрібна конкретній предметній області?"
    ],
    "extensions": [
      "Побудуй join двох колекцій через індекс; перевір відсутні відповідності та дублікати.",
      "Реалізуй дедуплікацію подій за складеним ключем джерело+id, пояснивши строк життя індексу та обмеження пам’яті."
    ],
    "sources": [
      {
        "title": "MDN: Map",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map"
      },
      {
        "title": "MDN: Set",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Який розмір має new Set([{id: 1}, {id: 1}])?",
      "options": [
        "1",
        "2",
        "Створення Set завершиться помилкою"
      ],
      "answer": 1,
      "explanation": "Це два окремі об’єкти з різними посиланнями."
    },
    "lab": {
      "language": "js",
      "starter": "export function indexUnique(rows, keyOf = row => row.id) {\n  throw new Error('Реалізуй унікальний індекс');\n}\nexport function groupBy(rows, keyOf = row => row.id) {\n  throw new Error('Реалізуй групування');\n}\n",
      "solution": "function validate(rows, keyOf) {\n  if (!Array.isArray(rows) || typeof keyOf !== 'function') throw new TypeError('Некоректні аргументи');\n}\nfunction keyFor(row, keyOf) {\n  const key = keyOf(row);\n  if (typeof key !== 'string' || key.trim() === '') throw new TypeError('Потрібен непорожній рядковий ключ');\n  return key;\n}\nexport function indexUnique(rows, keyOf = row => row.id) {\n  validate(rows, keyOf);\n  const result = new Map();\n  for (const row of rows) {\n    const key = keyFor(row, keyOf);\n    if (result.has(key)) throw new RangeError('Повторний ключ');\n    result.set(key, row);\n  }\n  return result;\n}\nexport function groupBy(rows, keyOf = row => row.id) {\n  validate(rows, keyOf);\n  const result = new Map();\n  for (const row of rows) {\n    const key = keyFor(row, keyOf);\n    if (!result.has(key)) result.set(key, []);\n    result.get(key).push(row);\n  }\n  return result;\n}\n",
      "tests": "test('index uses keys safely and preserves records', () => {\n  const a=Object.freeze({id:'__proto__',group:'x'});\n  const b=Object.freeze({id:'b',group:'x'});\n  const index=subject.indexUnique(Object.freeze([a,b]));\n  assert.equal(index.get('__proto__'),a);\n  assert.equal(index.get('b'),b);\n  assert.equal(subject.indexUnique([]).size,0);\n});\ntest('duplicates and invalid keys are explicit', () => {\n  assert.throws(()=>subject.indexUnique([{id:'a'},{id:'a'}]),RangeError);\n  assert.throws(()=>subject.indexUnique([{id:''}]),TypeError);\n  assert.throws(()=>subject.groupBy([{id:4}]),TypeError);\n});\ntest('grouping preserves order and all rows', () => {\n  const rows=[{id:'a',group:'x'},{id:'b',group:'y'},{id:'c',group:'x'}];\n  const grouped=subject.groupBy(rows,row=>row.group);\n  assert.deepEqual([...grouped.keys()],['x','y']);\n  assert.deepEqual(grouped.get('x'),[rows[0],rows[2]]);\n  assert.equal(grouped.get('y')[0],rows[1]);\n  assert.equal(rows.length,3);\n});\n"
    }
  },
  {
    "id": "async-loop",
    "moduleId": "async",
    "title": "Event loop і керовані порції роботи",
    "summary": "Відрізняй синхронне виконання, microtasks і повернення керування середовищу.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Пояснювати порядок синхронного коду й microtasks.",
      "Розуміти, чому async не робить CPU-код паралельним.",
      "Повертати керування event loop між порціями роботи."
    ],
    "task": "Реалізуй processInBatches(items, batchSize, visit, yieldNow). Послідовно збери результати visit(value,index), очікуючи їх; після кожної порції, крім останньої, очікуй yieldNow().",
    "steps": [
      "Валідуй масив, додатний цілий batchSize та функції.",
      "За замовчуванням yieldNow має повертати Promise, який виконається через setImmediate.",
      "Збережи порядок результатів; помилка visit або yieldNow зупиняє подальшу обробку."
    ],
    "hints": [
      "Перевір межу порції через (index + 1) % batchSize.",
      "Переконайся, що після поточної позиції є ще елементи.",
      "forEach не очікує повернених async-callbacks; використовуй цикл із await."
    ],
    "criteria": [
      "Кожен елемент обробляється один раз у заданому порядку.",
      "yieldNow викликається між порціями, а не після останньої.",
      "Порожній вхід не запускає visit або yieldNow."
    ],
    "mistakes": [
      "Вважати await Promise.resolve() гарантованим пропуском I/O-фази.",
      "Очікувати, що async відправить обчислення в окремий потік.",
      "Залежати від точного часу setTimeout(...,0)."
    ],
    "reviewQuestions": [
      "Коли виконуються microtasks у наведеному прикладі?",
      "Чим порціонування відрізняється від worker thread?",
      "Чому тестування ін’єктованого yield стабільніше за вимірювання мілісекунд?"
    ],
    "extensions": [
      "Створи CPU-приклад із порціонуванням і без нього та виміряй затримку незалежного HTTP-запиту; відокрем загальний час від чутливості сервера.",
      "Перенеси незалежне обчислення в worker thread і додай протокол результату, помилки та завершення worker."
    ],
    "sources": [
      {
        "title": "Node.js: event loop",
        "url": "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick"
      },
      {
        "title": "MDN: microtask guide",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide"
      }
    ],
    "quiz": {
      "kind": "order",
      "question": "Упорядкуй вивід із прикладу лекції.",
      "items": [
        {
          "id": "a",
          "text": "A: синхронний початок"
        },
        {
          "id": "b",
          "text": "B: Promise.then"
        },
        {
          "id": "c",
          "text": "C: queueMicrotask"
        },
        {
          "id": "d",
          "text": "D: синхронне продовження"
        },
        {
          "id": "t",
          "text": "T: таймер"
        }
      ],
      "answer": [
        "a",
        "d",
        "b",
        "c",
        "t"
      ],
      "explanation": "Синхронна частина завершується перед microtasks; таймер у цьому прикладі виконається після них."
    },
    "lab": {
      "language": "js",
      "starter": "export async function processInBatches(items, batchSize, visit, yieldNow = () => new Promise(resolve => setImmediate(resolve))) {\n  throw new Error('Реалізуй послідовну обробку порціями');\n}\n",
      "solution": "export async function processInBatches(items, batchSize, visit, yieldNow = () => new Promise(resolve => setImmediate(resolve))) {\n  if (!Array.isArray(items) || typeof visit !== 'function' || typeof yieldNow !== 'function') throw new TypeError('Некоректні аргументи');\n  if (!Number.isInteger(batchSize) || batchSize < 1) throw new RangeError('Некоректна порція');\n  const results = [];\n  for (let index = 0; index < items.length; index += 1) {\n    results.push(await visit(items[index], index));\n    if ((index + 1) % batchSize === 0 && index + 1 < items.length) await yieldNow();\n  }\n  return results;\n}\n",
      "tests": "test('ordered work with yields only between batches', async () => {\n  const events=[];\n  const result=await subject.processInBatches([1,2,3,4,5],2,async(value,index)=>{events.push('v'+index); return value*2;},async()=>{events.push('yield');});\n  assert.deepEqual(result,[2,4,6,8,10]);\n  assert.deepEqual(events,['v0','v1','yield','v2','v3','yield','v4']);\n});\ntest('empty input, exact batch and invalid size', async () => {\n  const fail=()=>assert.fail('unexpected callback');\n  assert.deepEqual(await subject.processInBatches([],2,fail,fail),[]);\n  assert.deepEqual(await subject.processInBatches([1,2],2,value=>value,fail),[1,2]);\n  await assert.rejects(()=>subject.processInBatches([1],0,value=>value),RangeError);\n});\ntest('failure stops later elements', async () => {\n  const visited=[];\n  await assert.rejects(()=>subject.processInBatches([1,2,3],2,value=>{visited.push(value); if(value===2)throw new Error('bad'); return value;},async()=>{}),/bad/);\n  assert.deepEqual(visited,[1,2]);\n});\n"
    }
  },
  {
    "id": "async-promises",
    "moduleId": "async",
    "title": "Promise, помилки та обмежена конкурентність",
    "summary": "Обирай послідовність або конкурентність і зберігай контракт результату.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Відрізняти послідовний запуск від конкурентного.",
      "Обирати комбінатор Promise за політикою помилок.",
      "Обмежувати активні операції, зберігаючи порядок результатів."
    ],
    "task": "Реалізуй mapLimit(items, limit, worker): виконай worker(value,index) для кожного елемента, маючи не більше limit активних викликів. Поверни результати у вхідному порядку.",
    "steps": [
      "Відхиляй недодатний або дробовий limit, неправильний масив та worker.",
      "Створи максимум min(limit, items.length) виконавців зі спільним індексом.",
      "При помилці відхили результат з оригінальною причиною та припини видачу нової роботи після її спостереження; не обіцяй автоматичного скасування вже запущеного."
    ],
    "hints": [
      "Результат записуй у results[index], а не push за часом завершення.",
      "Отримай індекс і збільш next до await worker(...).",
      "Окремий прапорець stopped дозволяє виконавцям не брати нових позицій після помилки."
    ],
    "criteria": [
      "Спостережена кількість активних worker не перевищує limit.",
      "Порядок результатів відповідає входу.",
      "Порожній список дає []; помилки не приховуються."
    ],
    "mistakes": [
      "Використовувати Promise.all(items.map(worker)) і вважати це обмеженням.",
      "Плутати ліміт конкурентності з кількістю запитів на секунду.",
      "Очікувати автоматичного скасування від Promise.all."
    ],
    "reviewQuestions": [
      "Який порядок результатів повертає Promise.all?",
      "Що відбувається з іншими операціями після його відхилення?",
      "Чим allSettled відрізняється від catch навколо all?"
    ],
    "extensions": [
      "Додай AbortSignal і явну політику скасування вже запущених worker; протестуй припинення видачі роботи.",
      "Побудуй окремий rate limiter з ін’єктованим годинником і порівняй його поведінку з mapLimit під короткими та довгими запитами."
    ],
    "sources": [
      {
        "title": "MDN: Promise.all",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all"
      },
      {
        "title": "MDN: using promises",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що гарантує Promise.all при відхиленні одного з елементів?",
      "options": [
        "Усі інші операції автоматично скасовано",
        "Спільний Promise відхиляється; інші операції можуть продовжуватися",
        "Помилки завжди перетворюються на undefined"
      ],
      "answer": 1,
      "explanation": "Комбінатор визначає результат очікування, але не має універсального механізму скасування операцій."
    },
    "lab": {
      "language": "js",
      "starter": "export async function mapLimit(items, limit, worker) {\n  throw new Error('Реалізуй обмежену конкурентність');\n}\n",
      "solution": "export async function mapLimit(items, limit, worker) {\n  if (!Array.isArray(items) || typeof worker !== 'function') throw new TypeError('Некоректні аргументи');\n  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('Некоректний ліміт');\n  const results = new Array(items.length);\n  let next = 0, stopped = false;\n  async function run() {\n    while (!stopped) {\n      const index = next++;\n      if (index >= items.length) return;\n      try { results[index] = await worker(items[index], index); }\n      catch (error) { stopped = true; throw error; }\n    }\n  }\n  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));\n  return results;\n}\n",
      "tests": "test('bounded concurrency and stable output order', async () => {\n  let active=0, maxActive=0;\n  const items=Array.from({length:12},(_,i)=>i);\n  const result=await subject.mapLimit(items,3,async(value)=>{\n    active++; maxActive=Math.max(maxActive,active);\n    await Promise.resolve();\n    if(value%2===0)await Promise.resolve();\n    active--;\n    return value*10;\n  });\n  assert.deepEqual(result,items.map(value=>value*10));\n  assert.ok(maxActive<=3);\n  assert.ok(maxActive>1,'Independent work should run concurrently');\n  assert.equal(active,0);\n});\ntest('empty input, sequential limit and invalid limit', async () => {\n  assert.deepEqual(await subject.mapLimit([],2,()=>assert.fail('unexpected')),[]);\n  const order=[];\n  assert.deepEqual(await subject.mapLimit([3,2,1],1,async value=>{order.push(value); return value;}),[3,2,1]);\n  assert.deepEqual(order,[3,2,1]);\n  await assert.rejects(()=>subject.mapLimit([1],0,x=>x),RangeError);\n  await assert.rejects(()=>subject.mapLimit([1],1.5,x=>x),RangeError);\n});\ntest('original failure is propagated', async () => {\n  const reason=new Error('worker failed');\n  await assert.rejects(()=>subject.mapLimit([1,2,3],1,async value=>{if(value===2)throw reason; return value;}),error=>error===reason);\n});\n"
    }
  },
  {
    "id": "async-cancellation",
    "moduleId": "async",
    "title": "Скасування, таймаути та очищення ресурсів",
    "summary": "Передавай AbortSignal до операції та відокремлюй зупинку очікування від зупинки роботи.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Розрізняти завершення очікування та реальне скасування.",
      "Об’єднувати timeout і зовнішній AbortSignal.",
      "Очищати власні ресурси через finally."
    ],
    "task": "Реалізуй runWithTimeout(operation, milliseconds, parentSignal). Виклич operation(combinedSignal), поєднавши зовнішнє скасування з власним таймером.",
    "steps": [
      "Приймай цілі milliseconds у межах 0…2147483647; operation має бути функцією.",
      "Вже скасований parentSignal має відхилити виклик без запуску operation.",
      "Для timeout використай причину DOMException з name TimeoutError; повертай успіх або оригінальну помилку операції й завжди очищай таймер."
    ],
    "hints": [
      "Створи окремий AbortController для timeout.",
      "AbortSignal.any поєднує parentSignal і сигнал таймера; перед викликом перевір throwIfAborted.",
      "Обгорни await operation(signal) у try/finally з clearTimeout."
    ],
    "criteria": [
      "Операція отримує дієвий AbortSignal.",
      "Скасування до старту не запускає операцію.",
      "Успіх, timeout і помилка очищають таймер."
    ],
    "mistakes": [
      "Вважати Promise.race механізмом скасування роботи.",
      "Повторно використовувати вже скасований сигнал для нової операції.",
      "Створювати таймер без очищення в finally."
    ],
    "reviewQuestions": [
      "Що саме має зробити операція, яка отримала AbortSignal?",
      "Навіщо перевіряти aborted до додавання listener?",
      "Чому finally потрібний і після успішного завершення?"
    ],
    "extensions": [
      "Реалізуй abortableDelay з очищенням timer і listener; перевір скасування до та під час очікування.",
      "Додай загальний deadline до mapLimit: припини нові задачі й передай спільний сигнал активним; перевір відсутність прихованої фонової роботи."
    ],
    "sources": [
      {
        "title": "MDN: AbortSignal",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal"
      },
      {
        "title": "Node.js: AbortController",
        "url": "https://nodejs.org/api/globals.html#class-abortcontroller"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що станеться з мережевим запитом, якщо лише Promise таймера виграє Promise.race?",
      "options": [
        "Запит гарантовано зупиниться",
        "Запит може продовжити роботу",
        "Його результат перетвориться на HTTP 408"
      ],
      "answer": 1,
      "explanation": "Promise.race визначає результат очікування; скасування треба передати підтримуваній операції."
    },
    "lab": {
      "language": "js",
      "starter": "export async function runWithTimeout(operation, milliseconds, parentSignal) {\n  throw new Error('Передай сигнал і забезпеч очищення таймера');\n}\n",
      "solution": "export async function runWithTimeout(operation, milliseconds, parentSignal) {\n  if (typeof operation !== 'function') throw new TypeError('Потрібна функція');\n  if (!Number.isInteger(milliseconds) || milliseconds < 0 || milliseconds > 2147483647) throw new RangeError('Некоректний timeout');\n  if (parentSignal !== undefined && !(parentSignal instanceof AbortSignal)) throw new TypeError('Потрібен AbortSignal');\n  const controller = new AbortController();\n  const signal = parentSignal ? AbortSignal.any([parentSignal, controller.signal]) : controller.signal;\n  signal.throwIfAborted();\n  const timer = setTimeout(() => controller.abort(new DOMException('Час вичерпано', 'TimeoutError')), milliseconds);\n  try { return await operation(signal); }\n  finally { clearTimeout(timer); }\n}\n",
      "tests": "function untilAborted(signal) {\n  return new Promise((resolve,reject)=>{\n    if(signal.aborted) { reject(signal.reason); return; }\n    signal.addEventListener('abort',()=>reject(signal.reason),{once:true});\n  });\n}\ntest('success and original error with timer cleanup', async () => {\n  assert.equal(await subject.runWithTimeout(async signal=>{assert.ok(signal instanceof AbortSignal); return 42;},10000),42);\n  const reason=new Error('ordinary failure');\n  await assert.rejects(()=>subject.runWithTimeout(async()=>{throw reason;},10000),error=>error===reason);\n});\ntest('timeout actually reaches the cooperative operation', async () => {\n  await assert.rejects(()=>subject.runWithTimeout(untilAborted,0),error=>error.name==='TimeoutError');\n});\ntest('parent cancellation before and during execution', async () => {\n  const before=new AbortController(), reason=new Error('stop');\n  before.abort(reason);\n  await assert.rejects(()=>subject.runWithTimeout(()=>assert.fail('must not start'),10000,before.signal),error=>error===reason);\n  const during=new AbortController();\n  const pending=subject.runWithTimeout(untilAborted,10000,during.signal);\n  during.abort(reason);\n  await assert.rejects(()=>pending,error=>error===reason);\n  await assert.rejects(()=>subject.runWithTimeout(async()=>1,-1),RangeError);\n  await assert.rejects(()=>subject.runWithTimeout(async()=>1,2147483648),RangeError);\n});\n"
    }
  }
];
