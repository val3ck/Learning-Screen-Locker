// Секретний Бункер (Secret Vault): ексклюзивний контент, що відкривається ТІЛЬКИ за XP!
// Ніякої шкільної нудоти — реальний сленг, британський сарказм, темні маніпуляції та чіт-коди.

const SECRET_VAULT_CHAPTERS = [
  {
    id: "vault-1",
    levelReq: 2,
    xpReq: 300,
    title: "Бункер 1: Вуличний сленг та ідіоми, яких соромляться викладачі",
    badge: "Рівень 2 (300 XP)",
    description: "Те, що говорять носії в серіалах, Discord, Twitter та на вулицях Лондона й Нью-Йорка.",
    items: [
      {
        term: "No cap / Cap",
        meaning: "Без брехні / Чиста правда (або 'брехня, не вірю')",
        example: "This pizza is the best in town, no cap!",
        usage: "Коли запевняєш, що не перебільшуєш. Якщо друг верзе дурню — кажеш просто: 'That's cap'."
      },
      {
        term: "Lowkey vs Highkey",
        meaning: "Тишком-нишком / Відкрито на повну",
        example: "I lowkey want to cancel plans and stay home.",
        usage: "Lowkey = коли тобі трохи соромно зізнатися, але ти цього хочеш. Highkey = кричиш про це на весь світ."
      },
      {
        term: "Salty",
        meaning: "Ображений, токсичний через дрібницю",
        example: "Why are you so salty just because you lost one game?",
        usage: "Коли людина біситься після програшу або коли її зачепило за живе."
      },
      {
        term: "Ghosting",
        meaning: "Морозитися, різко зникнути без пояснень",
        example: "We had two great dates and then he just ghosted me.",
        usage: "Класика сучасних знайомств та навіть робочих співбесід."
      },
      {
        term: "Rip-off",
        meaning: "Грабіж серед білого дня, шалений оверпрайс",
        example: "$15 for a tiny coffee? That's a total rip-off!",
        usage: "Коли ціна неадекватно завищена."
      }
    ]
  },
  {
    id: "vault-2",
    levelReq: 3,
    xpReq: 800,
    title: "Бункер 2: Мистецтво британського сарказму та пасивної агресії",
    badge: "Рівень 3 (800 XP)",
    description: "Як британці кажуть найжорсткіші образи під маскою королівської ввічливості.",
    items: [
      {
        term: "With all due respect...",
        meaning: "Що чуєш: 'З усією повагою...'\nЩо це насправді: 'Ти верзеш повну нісенітницю і я вважаю тебе ідіотом.'",
        example: "With all due respect, your idea will destroy our entire budget.",
        usage: "Легальний спосіб культурно рознести чиюсь ідею вщент."
      },
      {
        term: "Interesting perspective...",
        meaning: "Що чуєш: 'Цікава точка зору'\nЩо це насправді: 'Це найдурніша думка, яку я чув за все своє життя.'",
        example: "That's an... interesting perspective on the problem.",
        usage: "Універсальна відповідь на нарадах, коли колега несе абсурд."
      },
      {
        term: "As per my previous email...",
        meaning: "Що чуєш: 'Як зазначено в попередньому листі'\nЩо це насправді: 'Ти взагалі вмієш читати? Я вже все розписав 5 хвилин тому!'",
        example: "As per my previous email, the files were attached yesterday.",
        usage: "Головна зброя офісних воєн."
      },
      {
        term: "I hear what you say...",
        meaning: "Що це насправді: 'Я тебе почув, і мені абсолютно плювати, я зроблю по-своєму.'",
        example: "I hear what you say, but we are moving forward with plan B.",
        usage: "Ввічливе закриття дискусії без шансів на оскарження."
      }
    ]
  },
  {
    id: "vault-3",
    levelReq: 4,
    xpReq: 1500,
    title: "Бункер 3: Dark English — Психологічні маніпуляції та переговори",
    badge: "Рівень 4 (1500 XP)",
    description: "Фрази, що змушують звучати авторитетно, захищати кордони та закривати угоди на свою користь.",
    items: [
      {
        term: "Let's put a pin in that",
        meaning: "Заморозити незручну тему",
        example: "That's a valid concern, let's put a pin in that and revisit it later.",
        usage: "Ідеальний спосіб зупинити токсичного співрозмовника, який тягне розмову в глухий кут."
      },
      {
        term: "Help me understand why...",
        meaning: "Витончений допит замість агресивного 'Чому ти накосячив?'",
        example: "Help me understand why the deployment was done without testing.",
        usage: "Змушує людину саму визнати свою помилку без відчуття прямого нападу."
      },
      {
        term: "I don't have the bandwidth for this",
        meaning: "Залізне 'НІ' без відчуття провини",
        example: "I would love to help, but I simply don't have the bandwidth this week.",
        usage: "Ніхто не може посперечатися з браком ресурсу. Звучить професійно і непохитно."
      },
      {
        term: "Walk me through your thinking",
        meaning: "Покажи мені логіку",
        example: "Walk me through your thinking on this architecture choice.",
        usage: "Ставить людину в ситуацію, де вона мусить аргументувати кожне слово."
      }
    ]
  },
  {
    id: "vault-4",
    levelReq: 5,
    xpReq: 2500,
    title: "Бункер 4: The Overlord Cheat Codes — Неперекладні концепції",
    badge: "Рівень 5 (2500 XP)",
    description: "Рівень С2: концепції, які роблять ваше мислення англійським на 100%.",
    items: [
      {
        term: "Silver lining",
        meaning: "Промінь світла у повній темряві",
        example: "I lost my job, but the silver lining is I finally started my own business.",
        usage: "Від приказки 'Every cloud has a silver lining' — прихована користь у біді."
      },
      {
        term: "Elephant in the room",
        meaning: "Величезна очевидна проблема, про яку всі мовчать",
        example: "We need to address the elephant in the room: our budget deficit.",
        usage: "Коли ситуація критична, але всі вдають, ніби все гаразд."
      },
      {
        term: "Bikeshedding",
        meaning: "Запеклі суперечки про дрібниці замість вирішення головного",
        example: "We spent 2 hours bikeshedding the button color while the database was down.",
        usage: "Психологічний закон Паркінсона: легше сперечатися про колір сараю, ніж будувати атомну станцію."
      },
      {
        term: "Scope creep",
        meaning: "Непомітне розростання завдань до неконтрольованих масштабів",
        example: "Avoid scope creep or we will never ship this product on time.",
        usage: "Коли просте завдання обростає 50 новими 'хотєлками'."
      }
    ]
  }
];
