// База знань граматики: Лайфхаки, схеми, порівняння та живі приклади
// Мінімум нудної теорії — максимум практичних шаблонів!

const GRAMMAR_HACKS = [
  {
    id: "in-on-at",
    category: "prepositions",
    title: "Трикутник IN - ON - AT (Час і Місце)",
    tag: "Топ-помилка",
    level: "A1 - B1",
    summary: "Універсальний лайфхак-трикутник: від широкого/космосу до крихітної точки.",
    hackRule: "Уяви перевернутий трикутник: вгорі широкий IN (роки, міста), посередині плаский ON (дні, вулиці), внизу гострий AT (точний час, адреса).",
    diagram: [
      { prep: "IN", scope: "Широке / Об'єм", time: "in 2026, in summer, in May, in the morning", place: "in Ukraine, in Kyiv, in a room, in a car" },
      { prep: "ON", scope: "Середнє / Плоске", time: "on Monday, on May 5th, on my birthday", place: "on the table, on Khreshchatyk st., on a bus/train" },
      { prep: "AT", scope: "Точкове / Голка", time: "at 5:00 PM, at midnight, at noon", place: "at home, at 42 Baker St., at the bus stop" }
    ],
    examples: [
      { en: "I was born in 2004, on a Friday, at 7 AM.", ukr: "Я народився у 2004 (IN), в п'ятницю (ON), о 7 ранку (AT)." },
      { en: "We meet at the cafe on Main Street in London.", ukr: "Зустрінемось у кафе (AT) на Мейн Стріт (ON) у Лондоні (IN)." }
    ],
    mistakes: [
      { wrong: "I will call you in Monday.", right: "I will call you on Monday.", reason: "Дні тижня завжди з ON!" },
      { wrong: "She arrives at the evening.", right: "She arrives in the evening.", reason: "Частини доби (in morning/evening), АЛЕ at night!" }
    ]
  },
  {
    id: "past-simple-vs-present-perfect",
    category: "tenses",
    title: "Past Simple проти Present Perfect",
    tag: "Ключовий лайфхак",
    level: "A2 - B1",
    summary: "Як за 2 секунди обрати між 'I did' та 'I have done'.",
    hackRule: "Past Simple описує подію в завершеному минулому періоді. Present Perfect пов’язує минуле з теперішнім результатом, досвідом або незавершеним періодом. Відсутність дати не зобов’язує обирати Perfect; recently і already можливі з різними часами.",
    formula: {
      pastSimple: "Хто + V2 / did (подія в завершеному минулому періоді)",
      presentPerfect: "Хто + have/has + V3 (результат видно прямо зараз, досвід за життя)"
    },
    examples: [
      { en: "I lost my keys (yesterday).", ukr: "Я загубив ключі вчора (може вже знайшов, це просто факт минулого)." },
      { en: "I have lost my keys!", ukr: "Я загубив ключі! (І зараз стою під дверима без них, результат зараз)." },
      { en: "I lived in Lviv for 2 years.", ukr: "Я жив у Львові 2 роки (вже там не живу)." },
      { en: "I have lived in Kyiv for 5 years.", ukr: "Я живу в Києві вже 5 років (і досі тут живу)." }
    ],
    mistakes: [
      { wrong: "I have seen him yesterday.", right: "I saw him yesterday.", reason: "'Yesterday' вбиває Present Perfect наповал! Тільки Past Simple." },
      { wrong: "Have you eat already?", right: "Have you eaten already?", reason: "Після have потрібна третя форма: eaten. Did you already eat? теж коректне, особливо в американській англійській." }
    ]
  },
  {
    id: "svompt-word-order",
    category: "sentence-structure",
    title: "Золотий порядок слів: SVOMPT",
    tag: "Фундамент",
    level: "A1 - B2",
    summary: "Англійський порядок слів менш гнучкий. SVOMPT — опора для нейтральних речень, а не правило для всіх можливих конструкцій.",
    hackRule: "Запам'ятай абревіатуру SVOMPT: Хто (S) -> Що робить (V) -> Кого/Що (O) -> Як (M) -> Де (P) -> Коли (T). Час часто стоїть на початку або наприкінці. Прислівники способу дії можуть стояти й перед дієсловом: I carefully reviewed the code. Порядок місця й часу залежить від акценту та контексту.",
    schema: [
      { step: "S (Subject)", meaning: "Хто?", word: "Alex" },
      { step: "V (Verb)", meaning: "Що робить?", word: "reads" },
      { step: "O (Object)", meaning: "Що?", word: "English books" },
      { step: "M (Manner)", meaning: "Як?", word: "enthusiastically" },
      { step: "P (Place)", meaning: "Де?", word: "in the library" },
      { step: "T (Time)", meaning: "Коли?", word: "every evening" }
    ],
    examples: [
      { en: "I quickly drank coffee in the kitchen this morning.", ukr: "Я швиденько випив каву на кухні сьогодні вранці." },
      { en: "She bought a new laptop online yesterday.", ukr: "Вона вчора купила новий ноутбук в інтернеті." }
    ],
    mistakes: [
      { wrong: "Yesterday I bought in the store a jacket.", right: "Yesterday I bought a jacket in the store.", reason: "Дія і предмет (bought + a jacket) НЕ розриваються місцем!" }
    ]
  },
  {
    id: "do-vs-make",
    category: "vocabulary-hack",
    title: "DO чи MAKE? Раз і назавжди",
    tag: "Лайфхак",
    level: "A2 - B1",
    summary: "Обидва перекладаються як «робити», але логіка зовсім різна.",
    hackRule: "DO = дія, процес, робота, рутина (нічого матеріального не виникає). MAKE = створення нового об'єкта з нуля, результат, приготування.",
    comparison: [
      { word: "DO", items: ["do homework (домашнє)", "do the dishes (посуд)", "do research (дослідження)", "do your best (старатися)", "do sports (спорт)"] },
      { word: "MAKE", items: ["make coffee / cake (приготувати)", "make money (заробити)", "make a mistake (зробити помилку)", "make a decision (прийняти рішення)", "make friends (потоваришувати)"] }
    ],
    examples: [
      { en: "I need to do my homework before I make dinner.", ukr: "Мені треба зробити домашку (DO), перш ніж приготувати вечерю (MAKE)." },
      { en: "Don't be afraid to make mistakes while doing exercises.", ukr: "Не бійся робити помилки (MAKE), коли робиш вправи (DO)." }
    ],
    mistakes: [
      { wrong: "I did a big mistake.", right: "I made a big mistake.", reason: "Помилка — це новостворений результат, тому тільки MAKE a mistake!" }
    ]
  },
  {
    id: "conditionals-cheat-sheet",
    category: "conditionals",
    title: "4 Умовні речення за 60 секунд",
    tag: "Шпаргалка",
    level: "B1 - B2",
    summary: "Як не плутатись у If 0, 1, 2, 3 за допомогою 'шкали реальності'.",
    hackRule: "0 = 100% факт (Present + Present). 1 = Реальне майбутнє (If + Present, WILL + V). 2 = Мрія/Уява зараз (If + Past, WOULD + V). 3 = Жаль за минулим (If + had V3, WOULD HAVE V3).",
    types: [
      { name: "Zero (Факт)", formula: "If + Present, Present", example: "If you heat water, it boils.", tip: "Закони природи та залізне правило." },
      { name: "First (Реальний шанс)", formula: "If + Present, will + V", example: "If it rains tomorrow, I will stay home.", tip: "Пам'ятай: після If ніякого WILL!" },
      { name: "Second (Фантазія/Мрія)", formula: "If + Past Simple, would + V", example: "If I had a million dollars, I would travel.", tip: "У мене нема мільйона, просто фантазую." },
      { name: "Third (Машина часу/Жаль)", formula: "If + had V3, would have V3", example: "If I had studied harder, I would have passed.", tip: "Подія в минулому, нічого вже не змінити." }
    ],
    mistakes: [
      { wrong: "If it will rain, I will not come.", right: "If it rains, I will not come.", reason: "У частині з IF майбутній час (will) НЕ ставиться!" }
    ]
  },
  {
    id: "a-an-the-secrets",
    category: "articles",
    title: "Артиклі A / AN проти THE",
    tag: "Спрощення",
    level: "A1 - A2",
    summary: "Лайфхак мислення носіїв: «Якийсь один» проти «Той самий».",
    hackRule: "A / AN = ONE (один будь-який, уперше згадуємо). THE = THIS (цей конкретний, про якого ти і співрозмовник уже знаєте). Якщо множина і будь-які — взагалі без артикля.",
    examples: [
      { en: "I saw a cat in the garden. The cat was black.", ukr: "Я побачив (якогось) кота (A). (Той самий) кіт був чорний (THE)." },
      { en: "Can you pass me the salt?", ukr: "Передай, будь ласка, сіль (ту конкретну сіль на нашому столі)." }
    ],
    mistakes: [
      { wrong: "I bought the new car today.", right: "I bought a new car today.", reason: "Якщо хвалишся вперше, співрозмовник ще не знає цю машину — тому A car." }
    ]
  },
  {
    id: "used-to-trio",
    category: "confusing-verbs",
    title: "Used to vs Be used to vs Get used to",
    tag: "Тонкощі",
    level: "B1 - B2",
    summary: "Як сказати: «я колись робив», «я вже звик» та «я ще тільки звикаю».",
    hackRule: "Used to + V = минула звичка (зараз не роблю). Be used to + V-ing = стан звички (це для мене норма). Get used to + V-ing = процес адаптації (поступово звикаю).",
    examples: [
      { en: "I used to wake up at 11 AM.", ukr: "Раніше я прокидався об 11 (а зараз ні, змінив графік)." },
      { en: "I am used to waking up at 6 AM.", ukr: "Я вже звик прокидатися о 6 ранку (це мій комфортний стан)." },
      { en: "I am getting used to my new job.", ukr: "Я поступово звикаю до нової роботи (процес триває)." }
    ],
    mistakes: [
      { wrong: "I am used to wake up early.", right: "I am used to waking up early.", reason: "Після 'be used to' дієслово завжди з закінченням -ING або іменник!" }
    ]
  },
  {
    id: "modals-probability",
    category: "modals",
    title: "Модальні дієслова впевненості (Від 0% до 100%)",
    tag: "Лайфхак",
    level: "A2 - B2",
    summary: "Як виражати здогадки без складних конструкцій.",
    scale: [
      { percent: "100%", word: "MUST", meaning: "Точно так! Залізно.", example: "He has 3 Ferraris. He must be rich." },
      { percent: "50%", word: "MIGHT / MAY / COULD", meaning: "Можливо, 50 на 50.", example: "Take an umbrella, it might rain." },
      { percent: "0%", word: "CAN'T", meaning: "Не може бути! Неможливо.", example: "He is in London, he can't be at work right now." }
    ],
    examples: [
      { en: "You have worked 12 hours today, you must be exhausted!", ukr: "Ти працював 12 годин сьогодні, ти точно виснажений!" },
      { en: "It can't be true, you're joking!", ukr: "Це не може бути правдою, ти жартуєш!" }
    ],
    mistakes: [
      { wrong: "It must not be true (коли хочемо сказати 'не може бути').", right: "It can't be true!", reason: "Для неможливості використовуємо CAN'T, а не 'must not' (яке означає заборону 'не можна')." }
    ]
  },
  {
    id: "gerund-vs-infinitive",
    category: "verb-patterns",
    title: "Герундій (-ing) чи Інфінітив (to + V)?",
    tag: "Мнемоніка",
    level: "B1 - B2",
    summary: "Простий психологічний лайфхак, щоб не зубрити сотні списків.",
    hackRule: "Інфінітив (to do) дивиться ВПЕРЕД у майбутнє (цілі, плани, бажання: want, plan, decide, hope). Герундій (doing) фокусується на ПРОЦЕСІ або МИНУЛОМУ (насолода, завершення, уникнення: enjoy, finish, avoid, keep).",
    examples: [
      { en: "I decided to learn English.", ukr: "Я вирішив вчити англійську (рішення спрямоване в майбутнє -> TO learn)." },
      { en: "I enjoy learning English.", ukr: "Я кайфую від вивчення англійської (смакування процесу прямо зараз -> learnING)." }
    ],
    mistakes: [
      { wrong: "I enjoy to swim in the sea.", right: "I enjoy swimming in the sea.", reason: "Після enjoy завжди іде -ING!" }
    ]
  },
  {
    id: "modals-obligation",
    category: "modals",
    title: "Зобов'язання: HAVE TO проти MUST проти SHOULD",
    tag: "Топ-розмовний",
    level: "B1 - B2",
    summary: "Хто змушує діяти: закон, ти сам чи добра порада?",
    hackRule: "HAVE TO = зовнішні обставини/закон (не від мене залежить). MUST = особисте сильне рішення або наказ. SHOULD = дружня рекомендація. HAD BETTER = попередження/погроза («краще зроби, або будуть проблеми»).",
    examples: [
      { en: "I have to pay taxes every year.", ukr: "Я мушу платити податки (закон вимагає -> HAVE TO)." },
      { en: "I must lose weight before summer.", ukr: "Я мушу схуднути до літа (моє власне внутрішнє рішення -> MUST)." },
      { en: "You should get some sleep.", ukr: "Тобі варто поспати (дружня порада -> SHOULD)." },
      { en: "You'd better finish this before the boss arrives!", ukr: "Краще дороби це до приходу боса, бо влетить! (попередження -> HAD BETTER)." }
    ],
    mistakes: [
      { wrong: "You must not pay for water, it's free.", right: "You don't have to pay for water, it's free.", reason: "'Must not' = сувора заборона (НЕ МОЖНА!). Якщо просто нема потреби — кажи 'don't have to'!" }
    ]
  },
  {
    id: "modals-past-regret",
    category: "modals",
    title: "Докори та жаль: SHOULD HAVE vs COULD HAVE vs WOULD HAVE",
    tag: "B2 Чіт-код",
    level: "B2",
    summary: "Як висловити жаль за минулим або пред'явити претензію друзям.",
    hackRule: "Формула: Модальне + HAVE + V3. Should have = треба було зробити (але не зробив). Could have = мав можливість, міг би (але не зробив). Would have = зробив би (якби склалися обставини).",
    examples: [
      { en: "I should have studied harder for that exam.", ukr: "Мені треба було вчитися старанніше (ех, шкода, що забив)." },
      { en: "You could have called me earlier!", ukr: "Ти міг би й раніше мені подзвонити! (була ж можливість!)." },
      { en: "I would have helped you, but I was on a flight.", ukr: "Я б допоміг тобі (залюбки), але був у літаку." }
    ],
    mistakes: [
      { wrong: "I should had done it.", right: "I should have done it.", reason: "Після модальних дієслів завжди ставиться незмінне HAVE, ніколи не 'had'!" },
      { wrong: "I should of known.", right: "I should have known.", reason: "'Should of' — популярна безграмотна помилка носіїв через схоже звучання 'should've'." }
    ]
  },
  {
    id: "linking-words-map",
    category: "sentence-structure",
    title: "Мапа зв'язування думок (Щоб мова лилася, а не спотикалася)",
    tag: "Спікінг & Writing",
    level: "B1 - B2",
    summary: "Слова-мости, які перетворюють рубані дитячі речення на дорослий B2/C1 монолог.",
    hackRule: "Використовуй правило 3 мостів: 1) Контраст (Having said that / Whereas), 2) Додавання (On top of that / Furthermore), 3) Підсумок (At the end of the day / Ultimately).",
    examples: [
      { en: "Remote work is great. Having said that, you need strong self-discipline.", ukr: "Дистанційка — це супер. Разом з тим (Having said that), потрібна залізна дисципліна." },
      { en: "The salary is great. On top of that, the team is very supportive.", ukr: "Зарплата чудова. До того ж (On top of that), колектив дуже підтримує." },
      { en: "At the end of the day, practical experience matters the most.", ukr: "Зрештою (At the end of the day), практичний досвід важить найбільше." }
    ],
    mistakes: [
      { wrong: "I like coffee. But I like tea. But it is hot.", right: "I enjoy coffee. Having said that, I also drink tea, particularly on cold days.", reason: "Уникай починати кожне речення з банального 'But' або 'And' — це звучить примітивно." }
    ]
  }
];

