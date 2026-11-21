export const README = '# Booking\n\nDemo appointment scheduler.\n';
export const README_CURRENT = '# Booking API\n\nDemo appointment scheduler.\n';
export const README_COLLEAGUE = '# Booking\n\nDemo appointment scheduler.\n\nSupport: use the booking queue.\n';
export const README_MAIN = '# Booking · main\n\nDemo appointment scheduler.\n';
export const README_FEATURE = '# Booking · feature\n\nDemo appointment scheduler.\n';
export const README_COMBINED = '# Booking · main + feature\n\nDemo appointment scheduler.\n';
export const README_BAD = '# Booking is disabled\n\nDemo appointment scheduler.\n';
export const BOOKING = [
  'export function canBook(slot, email) {',
  '  return Boolean(slot);',
  '}',
  '',
  'export const defaultSlot = "09:00";',
  'export const maxBookings = 12;',
  '',
  'export function available(appointments) {',
  '  return appointments.length < maxBookings;',
  '}',
  '',
  'export function formatSlot(slot) {',
  '  return slot.trim();',
  '}',
  '',
  'export function saveBooking(booking, logger) {',
  '  return { ...booking, saved: true };',
  '}',
  '',
].join('\n');
export const VALIDATION = BOOKING.replace('Boolean(slot)', 'Boolean(slot && email)');
export const LOGGING = BOOKING.replace('  return { ...booking', '  logger?.info("Booking saved");\n  return { ...booking');
export const BOTH = LOGGING.replace('Boolean(slot)', 'Boolean(slot && email)');

export const chapters = [
  ['Перший коміт', ['init', 'select', 'first-commit']],
  ['Зміни й історія', ['changes', 'hunks', 'history']],
  ['Гілки й конфлікти', ['branch', 'merge', 'abort-merge']],
  ['Віддалений репозиторій', ['clone', 'upstream', 'fast-forward']],
  ['Відхилений push', ['rejected', 'rebase-conflict', 'shared-history']],
  ['Виправлення помилок', ['restore', 'amend', 'revert']],
  ['Підсумок', ['final-commits', 'final-remote']],
  ['За бажанням', ['stash', 'reflog']],
];

const check = (label, type, ...args) => ({ label, type, args });
const mission = (id, title, description, checks, hints, files = ['README.md', 'booking.js']) =>
  ({ id, title, description, checks, hints, files });

export const course = [
  mission('init', 'Почни репозиторій', 'Тут є README.md. Створи репозиторій із гілкою main і переглянь стан. README поки має лишитися новим файлом.',
    [check('Репозиторій готовий, гілка main', 'branch', 'main'), check('README.md ще не додано', 'untracked', 'README.md'), check('Стан переглянуто', 'observed', 'status')],
    ['Почни з git init. Потім перевір, що Git бачить.', '-b задає назву першої гілки. -sb стискає вивід status і додає гілку.', 'git init -b main, потім git status -sb.'], ['README.md']),
  mission('select', 'Вибери файли для коміту', 'Команді потрібні тільки feature.txt і правила ігнорування. Додай .env у .gitignore. Чернетка notes.txt лишається локально.',
    [check('.env ігнорується', 'ignored', '.env'), check('У staging тільки .gitignore і feature.txt', 'staged', '.gitignore', 'feature.txt'), check('notes.txt лишився новим файлом', 'untracked', 'notes.txt')],
    ['Спочатку відредагуй .gitignore. Далі додай у staging файли, які потрібні команді.', 'Один рядок .env. Для staging назви файли після git add.', 'git add .gitignore feature.txt після збереження .gitignore.'], ['.gitignore', '.env', 'feature.txt', 'notes.txt']),
  mission('first-commit', 'Зроби один змістовний коміт', 'Виправлення в booking.js уже готове. Закоміть тільки його. Назви зміну так, щоб із повідомлення було ясно, навіщо вона. notes.txt залиш локально.',
    [check('Створено один коміт із booking.js', 'commitFiles', 1, 'booking.js'), check('Перевірка email потрапила в коміт', 'content', 'HEAD', 'booking.js', VALIDATION), check('Повідомлення описує зміну', 'subject'), check('notes.txt поза комітом', 'untracked', 'notes.txt')],
    ['Порівняй, що змінилося й що вже в staging.', 'git add <файл> готує файл. git commit -m "<повідомлення>" записує staging.', 'git add booking.js, потім git commit -m "Require email for bookings".'], ['booking.js', 'notes.txt']),
  mission('changes', 'Розбери staging і робочу копію', 'README.md уже в staging. У booking.js є зміна в робочій копії. Подивися обидва diff і поміняй місцями: підготуй тільки booking.js, залишивши новий README на диску.',
    [check('Переглянуто обидва diff', 'observed', 'bothDiffs'), check('У staging лише booking.js', 'staged', 'booking.js'), check('Новий README лишився на диску', 'content', 'work', 'README.md', README_CURRENT)],
    ['Один diff показує файл проти staging. Інший показує staging проти коміту.', 'Використай git diff і git diff --staged. restore --staged забирає файл зі staging, залишаючи робочу копію.', 'git restore --staged README.md, потім git add booking.js.']),
  mission('hunks', 'Підготуй частину файла', 'У booking.js змінилися валідація та логування. Підготуй тільки перевірку email. Обидві зміни мають лишитися на диску.',
    [check('У staging лише зміна валідації', 'content', 'index', 'booking.js', VALIDATION), check('Логування лишилося в робочій копії', 'content', 'work', 'booking.js', BOTH), check('Нових комітів ще немає', 'commitCount', 0)],
    ['У Git можна додавати фрагменти одного файла окремо.', 'Запусти git add -p booking.js. y додає показаний фрагмент, n пропускає.', 'Введи git add -p booking.js, потім y для валідації та n для логування.'], ['booking.js']),
  mission('history', 'Знайди стару версію', 'README змінився перед останнім комітом. Подивися історію та поверни README з початкового коміту в робочу копію. Історія й staging лишаються як є.',
    [check('Історію та попередній вміст переглянуто', 'observed', 'historyAndShow'), check('README має початковий вміст', 'content', 'work', 'README.md', README), check('Історія і staging збережені', 'originalHead')],
    ['Знайди початковий коміт, потім перевір його README.', 'git log --oneline показує короткі SHA. git show <SHA>:README.md показує файл у коміті.', 'git log --oneline, git show HEAD~2:README.md, потім git restore --source HEAD~2 -- README.md.']),
  mission('branch', 'Ізолюй зміну у своїй гілці', 'Валідація вже змінена на диску. Створи feature/validation, закоміть її там і залиш main на початковому коміті.',
    [check('Поточна гілка feature/validation', 'branch', 'feature/validation'), check('Валідація закомічена у feature', 'content', 'HEAD', 'booking.js', VALIDATION), check('main лишилася на старті', 'baseRef', 'main'), check('Робоча копія чиста', 'clean')],
    ['Нову гілку можна створити разом із перемиканням.', 'git switch -c <назва> залишає поточні зміни доступними в новій гілці.', 'git switch -c feature/validation, git add booking.js, git commit -m "Require a booking email".']),
  mission('merge', 'Об’єднай дві гілки', 'У main оновили README, у feature/validation змінили booking.js. Об’єднай обидві історії на main і збережи зміни обох гілок.',
    [check('Інтеграція на main', 'branch', 'main'), check('Обидва коміти є в історії', 'ancestors', 'feature', 'mainTip'), check('Валідація і README на місці', 'content', 'HEAD', 'booking.js', VALIDATION), check('Оновлений README збережено', 'content', 'HEAD', 'README.md', README_CURRENT), check('Робоча копія чиста', 'clean')],
    ['Перевір гілку, яка має отримати зміни.', 'У main виконай git merge <гілка>. Якщо історії розійшлися, Git створить merge-коміт.', 'git switch main, якщо потрібно, потім git merge feature/validation.']),
  mission('abort-merge', 'Зупини merge і розв’яжи конфлікт', 'Обидві гілки змінили заголовок README. Спробуй merge, відміни його, потім повтори й об’єднай заголовки. Перший рядок після розв’язання має бути «# Booking · main + feature».',
    [check('Конфліктний merge був скасований', 'observed', 'mergeAborted'), check('Обидві історії збережені', 'ancestors', 'feature', 'mainTip'), check('Заголовки об’єднано без маркерів конфлікту', 'content', 'HEAD', 'README.md', README_COMBINED), check('Робоча копія чиста', 'clean')],
    ['Конфлікт можна зупинити або розв’язати. Спочатку зроби перше.', 'git merge --abort повертає стан до merge. Після повторної спроби виправ README, додай його й заверши коміт.', 'git merge feature/validation → git merge --abort → git merge feature/validation. Виправ README, потім git add README.md і git commit.']),
  mission('clone', 'Забери навчальний репозиторій', 'Робоча папка порожня. Навчальний remote лежить поруч у ../origin.git. Клонуй його сюди й перевір адресу origin.',
    [check('Клон має гілку main', 'branch', 'main'), check('Клон прив’язаний до навчального origin', 'upstream', 'origin/main'), check('Адресу origin переглянуто', 'observed', 'remote'), check('Робоча копія чиста', 'clean')],
    ['Коли репозиторій уже існує, можна клонувати його з історією.', 'Крапка в кінці clone задає поточну папку як призначення.', 'git clone ../origin.git . і git remote -v.']),
  mission('upstream', 'Запуш свою гілку вперше', 'Гілка feature/validation має локальний коміт. Опублікуй її в origin і налаштуй upstream для наступних push.',
    [check('Гілка має власний upstream', 'upstream', 'origin/feature/validation'), check('Локальний коміт є на origin', 'remoteHead', 'feature/validation')],
    ['Перший push може одночасно прив’язати локальну гілку до віддаленої.', 'Прапорець -u зберігає зв’язок з опублікованою гілкою.', 'git push -u origin feature/validation.']),
  mission('fast-forward', 'Спочатку подивись, потім онови', 'Натисни «Колега запушив». Забери інформацію в origin/main, залишивши main на місці. Потім підтягни зміни, дозволивши лише fast-forward.',
    [check('Fetch показав новий origin/main до оновлення main', 'observed', 'fetchedAhead'), check('Зміна колеги є в main', 'ancestors', 'colleague'), check('Локальна й віддалена main збігаються', 'remoteHead', 'main'), check('Робоча копія чиста', 'clean')],
    ['Зміни можна отримати в два кроки. Перший дає час переглянути їх.', 'git fetch оновлює origin/main. git pull --ff-only оновить main лише без розбіжної історії.', 'Натисни «Колега запушив», введи git fetch, перевір git status -sb, потім git pull --ff-only.']),
  mission('rejected', 'Виправ push після fetch first', 'Твій коміт про валідацію ще не публікувався. Колега вже оновив main. Спочатку спробуй push і прочитай відмову, потім перенеси свою роботу поверх оновленої main і запуш.',
    [check('Відмова push зафіксована', 'observed', 'pushRejected'), check('Локальну зміну перенесено поверх колеги', 'rebased'), check('Обидва файли мають потрібний вміст', 'remoteFiles'), check('Результат є на origin/main', 'remoteHead', 'main')],
    ['Git зупинив push, бо на origin є коміт, якого немає в твоїй історії.', 'Отримай origin/main через fetch, потім rebase перенесе твій неопублікований коміт.', 'git fetch, git rebase origin/main, git push.']),
  mission('rebase-conflict', 'Розв’яжи конфлікт під час rebase', 'Ти й колега змінили заголовок README. Почни rebase, спробуй його відмінити. Повтори й об’єднай заголовки як «# Booking · main + feature».',
    [check('Конфліктний rebase був скасований', 'observed', 'rebaseAborted'), check('Твій коміт після коміту колеги', 'rebased'), check('Заголовки об’єднано', 'content', 'HEAD', 'README.md', README_COMBINED), check('Робоча копія чиста', 'clean')],
    ['При зупиненому rebase Git чекає твоєї дії. Перевір git status.', 'rebase --abort відміняє перебудову. Для продовження збережи файл і додай його, щоб Git побачив розв’язання.', 'git fetch → git rebase origin/main → git rebase --abort → git rebase origin/main. Виправ README, потім git add README.md і git rebase --continue.']),
  mission('shared-history', 'Збережи вже опубліковані коміти', 'Твій коміт уже є в спільній гілці collab. На origin/main є робота колеги. Інтегруй обидва на main зі збереженням їхніх SHA й запуш.',
    [check('Оригінальні коміти обох учасників збережені', 'ancestors', 'local', 'colleague'), check('Обидва файли мають потрібний вміст', 'remoteFiles'), check('Оновлення є на origin/main', 'remoteHead', 'main'), check('Робоча копія чиста', 'clean')],
    ['Коміт уже бачили інші. Обери спосіб, який зберігає його ідентичність.', 'Fetch оновить відомості про origin. Merge включить обидві історії зі справжніми SHA.', 'git fetch, git merge origin/main, git push.']),
  mission('restore', 'Прибери зайве зі staging', 'Валідацію booking.js додали у staging, а потім дописали логування. Залиш обидві зміни на диску й очисть staging. Відкинь невдалу правку тільки в README.',
    [check('Staging порожній', 'staged'), check('Обидві зміни booking.js залишилися', 'content', 'work', 'booking.js', BOTH), check('README повернувся до початкової версії', 'content', 'work', 'README.md', README)],
    ['Дія над staging і дія над файлом на диску мають різні наслідки.', 'restore --staged змінює індекс. restore -- <файл> відновлює робочу копію з індексу.', 'git restore --staged booking.js і git restore -- README.md.']),
  mission('amend', 'Уточни останній локальний коміт', 'У неопублікованого коміту повідомлення Update. Додай готове оновлення README в той самий коміт і назви зміну конкретно.',
    [check('Після стартового коміту є один виправлений коміт', 'amended'), check('Оновлений README і валідація закомічені', 'content', 'HEAD', 'README.md', README_CURRENT), check('Попередня валідація збережена', 'content', 'HEAD', 'booking.js', VALIDATION), check('Повідомлення описує зміну', 'subject')],
    ['Можна замінити останній локальний коміт новою версією.', 'Спершу підготуй README. commit --amend -m змінює вміст і повідомлення останнього коміту.', 'git add README.md, потім git commit --amend -m "Document booking email validation".']),
  mission('revert', 'Скасуй опубліковану зміну', 'Помилковий заголовок README уже потрапив у origin/main. Виправ його окремим комітом, збережи оригінальний коміт в історії та запуш результат.',
    [check('Помилка залишилася в історії, після неї один коміт', 'reverted'), check('README відновлено', 'content', 'HEAD', 'README.md', README), check('Виправлення є на origin/main', 'remoteHead', 'main')],
    ['Для спільної історії додай зворотну зміну окремим комітом.', 'git revert HEAD створює коміт зі скасуванням останньої зміни. --no-edit бере стандартне повідомлення Git.', 'git revert --no-edit HEAD, потім git push.']),
  mission('final-commits', 'Підсумок · два чисті коміти', 'Підготуй два окремі коміти в booking.js. Спочатку валідація, потім логування. Чернетка notes.txt і тестовий .env мають лишитися поза історією.',
    [check('Рівно два коміти, кожен змінює тільки booking.js', 'splitCommits'), check('Файл у кінці містить обидві зміни', 'content', 'HEAD', 'booking.js', BOTH), check('Чернетка поза історією', 'untracked', 'notes.txt'), check('.env ігнорується', 'ignored', '.env'), check('Staging порожній', 'staged')],
    ['Перед кожним комітом звір, що саме потрапило в staging.', 'Фрагменти в одному файлі можна розділити через add -p. Після першого коміту підготуй решту.', 'git add -p booking.js → y → n → git commit -m "Require a booking email". Потім git add booking.js і git commit -m "Log saved bookings".'], ['booking.js', 'notes.txt', '.env', '.gitignore']),
  mission('final-remote', 'Підсумок · поверни push у робочий стан', 'Ти додав валідацію. Колега змінив README на origin/main. Достав обидві зміни в origin/main. Вибери спосіб інтеграції самостійно.',
    [check('Оновлення колеги лишилося в історії', 'ancestors', 'colleague'), check('Обидві зміни збережено', 'remoteFiles'), check('Результат є на origin/main', 'remoteHead', 'main'), check('Робоча копія чиста', 'clean')],
    ['З’ясуй, що є тільки локально і що є тільки на origin.', 'Після fetch переглянь git log --oneline --graph --all. Для приватного коміту можеш використати rebase, для збереження двох історій — merge.', 'Один шлях: git fetch, git rebase origin/main, git push.']),
  mission('stash', 'Відклади роботу на час хотфікса', 'У main є незавершена валідація. Тимчасово відклади її, перемкнися на hotfix, потім повернись на main і віднови чернетку зі stash.',
    [check('Роботу було відкладено і гілку hotfix відкрито', 'observed', 'stashAndHotfix'), check('Ти знову на main', 'branch', 'main'), check('Чернетка валідації відновлена', 'content', 'work', 'booking.js', VALIDATION), check('Використаний stash прибрано', 'stashEmpty')],
    ['Відкладення зберігає незакомічені зміни окремо від комітів.', 'stash push -m "<опис>" відкладає зміни. stash pop повертає їх і прибирає використаний запис.', 'git stash push -m "Booking validation draft", git switch hotfix, git switch main, git stash pop.']),
  mission('reflog', 'Знайди загублений локальний коміт', 'Гілку з комітом про валідацію видалили. Знайди цей коміт у локальній історії переміщень HEAD і створи на ньому гілку rescue.',
    [check('Reflog переглянуто', 'observed', 'reflog'), check('rescue вказує на загублений коміт', 'lostRef'), check('У rescue є робоча валідація', 'content', 'rescue', 'booking.js', VALIDATION)],
    ['Звичайний log показує поточну історію гілки. У Git є також журнал переходів HEAD.', 'git reflog шукає коміт навіть після видалення локальної гілки. Коли знайдеш SHA, створи на ньому гілку.', 'git reflog, потім git switch -c rescue <SHA коміту "Require a booking email">.']),
];

export const byId = new Map(course.map(item => [item.id, item]));

export const manual = [
  ['git init -b main', 'Почни репозиторій у поточній папці. -b задає назву першої гілки.'],
  ['git status -sb', '-s показує короткий стан, -b додає інформацію про гілку. Перша колонка — індекс, друга — робоча копія. ?? означає новий файл.'],
  ['git diff / git diff --staged', 'Перший показує зміни поза індексом. Другий показує те, що піде в коміт. --cached у diff означає те саме, що --staged.'],
  ['git add <файл> / git add -p <файл> / git add -A', 'Підготуй конкретний файл, його окремий фрагмент або всі зміни. Перед -A переглянь status.'],
  ['git commit -m "Опис" / git commit -am "Опис"', '-m задає повідомлення. -a готує зміни вже відстежуваних файлів. Нові файли потрібно попередньо додати.'],
  ['git log --oneline --graph --all / git show <SHA>', 'Коротка історія, зв’язки між гілками та деталі конкретного коміту. git show <SHA>:<файл> показує вміст файла.'],
  ['git switch -c <гілка> / git switch <гілка>', 'Створи й відкрий гілку або перемкнись на наявну.'],
  ['git merge <гілка> / git merge --abort', 'Включи зміни іншої гілки в поточну зі збереженням історії. --abort відміняє незавершений merge.'],
  ['git clone ../origin.git . / git remote -v', 'Отримай копію навчального репозиторію в поточну папку. -v у remote показує адреси для fetch і push.'],
  ['git push -u origin <гілка>', 'Опублікуй гілку та признач їй upstream. Надалі звичайний git push використовує цей зв’язок.'],
  ['git fetch / git pull --ff-only', 'Fetch оновлює віддалені посилання. Pull --ff-only також рухає поточну гілку, коли історію можна просто продовжити.'],
  ['git rebase origin/main', 'Перенеси власні неопубліковані коміти поверх оновленої гілки. Після виправлення конфлікту додай файл і виконай --continue. --abort повертає попередній стан.'],
  ['git restore --staged <файл> / git restore -- <файл>', 'Перша команда прибирає зміни з індексу, залишаючи їх на диску. Друга відкидає незбережені зміни в указаному файлі, відновлюючи його з індексу.'],
  ['git commit --amend / git revert --no-edit <SHA>', 'Amend замінює останній локальний коміт. Revert додає зворотний коміт для зміни, яка вже в спільній історії.'],
  ['git stash push -m "Опис" / git stash pop', 'Відклади чернетку під час перемикання і поверни її після роботи.'],
  ['git reflog / git switch -c rescue <SHA>', 'Знайди попередній локальний стан HEAD і створюй гілку на потрібному коміті.'],
];
