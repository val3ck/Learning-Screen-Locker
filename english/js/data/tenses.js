// Повна база 12 активних часів англійської мови
// Стовпчики: PAST (ліворуч) | PRESENT (посередині) | FUTURE (праворуч)
// Рядки: Simple | Continuous | Perfect | Perfect Continuous

const TENSES_DATA = {
  // Пояснення відмінності Present Perfect vs Past Simple (Живий приклад з Марічкою)
  perfectVsSimpleDeepDive: {
    title: "Past Simple проти Present Perfect: Раз і назавжди",
    subtitle: "Головний секрет: ТОЧНИЙ час у минулому проти РЕЗУЛЬТАТУ без точного часу",
    analogy: {
      pastSimple: {
        title: "Past Simple (Точна точка в минулому)",
        marichkaExample: "Marichka graduated from university in 2023 / yesterday.",
        marichkaUkr: "Марічка закінчила університет у 2023 році / вчора.",
        explanation: "Тут чітко вказано ТОЧНИЙ час (in 2023, yesterday, 2 years ago). Подія відбулася в конкретній точці минулого, ця точка вже минула і закрита.",
        badge: "Точний час відомий 📌"
      },
      presentPerfect: {
        title: "Present Perfect (Результат зараз, час не важливий / невідомий)",
        marichkaExample: "Marichka has recently graduated from university!",
        marichkaUkr: "Марічка нещодавно закінчила університет!",
        explanation: "Ми кажемо: 'О, Марічка недавно закінчила ВНЗ!'. Вона вже має диплом (результат зараз), але КОЛИ САМЕ? Точного дня і року ми не називаємо! Нам важливий сам факт і свіжість події.",
        badge: "Час НЕ вказаний точно 🏆"
      }
    },
    goldenRule: "Якщо можеш поставити точну дату на календарі (вчора, о 5:00, минулого вівторка) -> ставиш PAST SIMPLE. Якщо точного часу нема або є слова 'недавно', 'вже', 'ніколи в житті' і результат важливий зараз -> ставиш PRESENT PERFECT."
  },

  // 12 Часів матриці
  matrix: [
    // --- ROW 1: SIMPLE ---
    {
      id: "past-simple",
      time: "past",
      aspect: "simple",
      name: "Past Simple",
      ukrName: "Минулий простий",
      formula: "V2 / did + V1",
      negativeFormula: "did not (didn't) + V1",
      questionFormula: "Did + Хто + V1?",
      coreSense: "Одноразова або регулярна дія в ТОЧНИЙ час у минулому (час названо або він очевидний).",
      markers: ["yesterday", "in 2022", "ago", "last week", "when I was a child"],
      example: "I bought a new laptop yesterday.",
      exampleUkr: "Я купив новий ноутбук учора (є точний час: yesterday).",
      trap: "Не ставити did разом з дієсловом у 2-й формі (❌ Did you went? -> ✅ Did you go?)."
    },
    {
      id: "present-simple",
      time: "present",
      aspect: "simple",
      name: "Present Simple",
      ukrName: "Теперішній простий",
      formula: "V1 (he/she/it + s/es)",
      negativeFormula: "don't / doesn't + V1",
      questionFormula: "Do / Does + Хто + V1?",
      coreSense: "Факти, закони природи, рутина, розклад, регулярні звички по життю.",
      markers: ["always", "usually", "often", "every day", "never", "sometimes"],
      example: "Water boils at 100 degrees Celsius.",
      exampleUkr: "Вода закипає при 100 градусах (загальний закон природи).",
      trap: "Не забувати закінчення -s для he/she/it (❌ He work -> ✅ He works)."
    },
    {
      id: "future-simple",
      time: "future",
      aspect: "simple",
      name: "Future Simple",
      ukrName: "Майбутній простий",
      formula: "will + V1",
      negativeFormula: "will not (won't) + V1",
      questionFormula: "Will + Хто + V1?",
      coreSense: "Спонтанне рішення в момент розмови, обіцянка або суб'єктивний прогноз.",
      markers: ["tomorrow", "next year", "soon", "in 2 days", "I think", "I promise"],
      example: "I will call you in 5 minutes, I promise!",
      exampleUkr: "Я подзвоню тобі через 5 хвилин, обіцяю!",
      trap: "Не вживати will після IF та WHEN у підрядних умови (❌ If I will come -> ✅ If I come)."
    },

    // --- ROW 2: CONTINUOUS ---
    {
      id: "past-continuous",
      time: "past",
      aspect: "continuous",
      name: "Past Continuous",
      ukrName: "Минулий тривалий",
      formula: "was / were + V-ing",
      negativeFormula: "wasn't / weren't + V-ing",
      questionFormula: "Was / Were + Хто + V-ing?",
      coreSense: "Дія була В ПРОЦЕСІ у точний конкретний момент у минулому (був зайнятий дією).",
      markers: ["at 5 PM yesterday", "while", "when you called", "all night long"],
      example: "I was sleeping when you called me at midnight.",
      exampleUkr: "Я спав (був у процесі сну), коли ти зателефонував опівночі.",
      trap: "Was — для I/he/she/it, Were — для you/we/they."
    },
    {
      id: "present-continuous",
      time: "present",
      aspect: "continuous",
      name: "Present Continuous",
      ukrName: "Теперішній тривалий",
      formula: "am / is / are + V-ing",
      negativeFormula: "am not / isn't / aren't + V-ing",
      questionFormula: "Am / Is / Are + Хто + V-ing?",
      coreSense: "Дія відбувається прямо ЗАРАЗ у момент розмови, або тимчасова ситуація цього тижня.",
      markers: ["now", "right now", "at the moment", "currently", "these days"],
      example: "I am learning English tenses right now.",
      exampleUkr: "Я прямо зараз вчу англійські часи (процес триває в цю секунду).",
      trap: "Дієслова стану (know, love, understand, believe) НЕ вживаються в Continuous!"
    },
    {
      id: "future-continuous",
      time: "future",
      aspect: "continuous",
      name: "Future Continuous",
      ukrName: "Майбутній тривалий",
      formula: "will be + V-ing",
      negativeFormula: "won't be + V-ing",
      questionFormula: "Will + Хто + be + V-ing?",
      coreSense: "Дія буде В ПРОЦЕСІ у точний момент у майбутньому (буду саме цим зайнятий).",
      markers: ["at 3 PM tomorrow", "this time next week", "when you arrive"],
      example: "This time tomorrow, I will be flying to London.",
      exampleUkr: "Завтра в цей самий час я буду летіти в літаку до Лондона.",
      trap: "Пам'ятати про частку 'be' після will (will be doing)."
    },

    // --- ROW 3: PERFECT ---
    {
      id: "past-perfect",
      time: "past",
      aspect: "perfect",
      name: "Past Perfect",
      ukrName: "Передминулий (дія ДО дії)",
      formula: "had + V3 (ed)",
      negativeFormula: "hadn't + V3",
      questionFormula: "Had + Хто + V3?",
      coreSense: "Передминулий час: дія відбулася РАНІШЕ за іншу дію в минулому.",
      markers: ["before", "by the time", "already", "after", "never before"],
      example: "When I arrived at the cinema, the movie had already started.",
      exampleUkr: "Коли я прийшов у кіно (Past Simple), фільм УЖЕ почався раніше (Past Perfect).",
      trap: "Використовується ТІЛЬКИ тоді, коли є інша дія в минулому для порівняння черговості."
    },
    {
      id: "present-perfect",
      time: "present",
      aspect: "perfect",
      name: "Present Perfect",
      ukrName: "Теперішній доконаний",
      formula: "have / has + V3 (ed)",
      negativeFormula: "haven't / hasn't + V3",
      questionFormula: "Have / Has + Хто + V3?",
      coreSense: "Дія сталася в минулому, але ТОЧНИЙ час НЕ вказано. Важливий свіжий результат зараз!",
      markers: ["already", "just", "yet", "recently", "ever", "never", "so far"],
      example: "Marichka has recently graduated from university.",
      exampleUkr: "Марічка нещодавно закінчила ВНЗ (час невідомий, але диплом є зараз!).",
      trap: "НІКОЛИ не вживати зі словами точного часу (yesterday, in 2020, ago)."
    },
    {
      id: "future-perfect",
      time: "future",
      aspect: "perfect",
      name: "Future Perfect",
      ukrName: "Майбутній доконаний",
      formula: "will have + V3 (ed)",
      negativeFormula: "won't have + V3",
      questionFormula: "Will + Хто + have + V3?",
      coreSense: "Дія буде ПОВНІСТЮ завершена ДО певного моменту або дедлайну в майбутньому.",
      markers: ["by tomorrow", "by 5 PM", "by the end of this year", "before"],
      example: "I will have finished this project by Friday.",
      exampleUkr: "Я повністю закінчу цей проєкт до п'ятниці (до дедлайну все буде готове).",
      trap: "Завжди вимагає маркера дедлайну з прийменником BY (до якого моменту)."
    },

    // --- ROW 4: PERFECT CONTINUOUS ---
    {
      id: "past-perfect-continuous",
      time: "past",
      aspect: "perfect-continuous",
      name: "Past Perfect Continuous",
      ukrName: "Передминулий тривалий",
      formula: "had been + V-ing",
      negativeFormula: "hadn't been + V-ing",
      questionFormula: "Had + Хто + been + V-ing?",
      coreSense: "Дія тривала певний час ДО того, як сталася інша подія в минулому (і видно наслідок).",
      markers: ["for 3 hours before", "since morning when", "how long had you been"],
      example: "I had been driving for 6 hours before I finally took a break.",
      exampleUkr: "Я кермував авто вже 6 годин поспіль (процес), перш ніж нарешті зробив зупинку.",
      trap: "Підкреслює саме тривалість і виснаженість до певного моменту в минулому."
    },
    {
      id: "present-perfect-continuous",
      time: "present",
      aspect: "perfect-continuous",
      name: "Present Perfect Continuous",
      ukrName: "Теперішній тривалий доконаний",
      formula: "have / has been + V-ing",
      negativeFormula: "haven't / hasn't been + V-ing",
      questionFormula: "Have / Has + Хто + been + V-ing?",
      coreSense: "Дія почалася в минулому, ТРИВАЛА певний період часу і триває ДОСІ або щойно закінчилася.",
      markers: ["for 2 years", "since morning", "how long", "all day", "lately"],
      example: "I have been learning English for 3 months.",
      exampleUkr: "Я вчу англійську вже 3 місяці (почав 3 місяці тому, процес триває досі).",
      trap: "Якщо питають 'How long...?' (Скільки часу ти вже...?) — 99% це Present Perfect Continuous!"
    },
    {
      id: "future-perfect-continuous",
      time: "future",
      aspect: "perfect-continuous",
      name: "Future Perfect Continuous",
      ukrName: "Майбутній тривалий доконаний",
      formula: "will have been + V-ing",
      negativeFormula: "won't have been + V-ing",
      questionFormula: "Will + Хто + have been + V-ing?",
      coreSense: "Дія триватиме вже певний період часу ДО конкретного моменту в майбутньому.",
      markers: ["by next month for 5 years", "by 2030 for a decade"],
      example: "By next year, I will have been living in Kyiv for 10 years.",
      exampleUkr: "Наступного року виповниться рівно 10 років, як я безперервно живу в Києві.",
      trap: "Рідкісний час у розмовній мові, але незамінний для круглих ювілеїв та стажу."
    }
  ]
};
