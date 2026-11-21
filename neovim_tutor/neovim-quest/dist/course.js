const normalText = (text) => (s, e) => s.text === text && s.mode === 'normal' && e.action === 'escape';
const action = (name, command) => (s, e) => e.action === name && (!command || e.command === command);
const reach = (row, col) => (s, e) => e.action === 'move' && s.row === row && s.col === col;
const room = ['', '', '  +-----------------------+', '  |                       |', '  |                       |', '  |                       |', '  +-----------------------+', '', ''].join('\n');
const mission = (title, body, keys, hint, text, cursor, check, extra = {}) => ({ title, body, keys, hint, text, cursor, check, ...extra });
export const chapters = [
  { id:'move', title:'Перші кроки', desc:'Курсор рухається. Миша відпочиває.', symbol:'h j k l', minutes:4, topics:['hjkl','normal'], missions:[
    mission('Ось ти. А ось перша ціль.', 'Зелений блок — твій курсор. Дістанься підсвіченої клітинки праворуч: натискай l.', ['l'], 'Натисни l шість разів. Можна й затиснути — курсор піде праворуч.', room,[3,5],reach(3,11),{target:[3,11]}),
    mission('Тепер поверхом нижче.', 'У цього редактора своя гравітація. Натискай j, щоб спуститися до цілі.', ['j'], 'Два натискання j — два рядки вниз.',room,[3,11],reach(5,11),{target:[5,11]}),
    mission('Крок назад — теж рух.', 'Ціль тепер ліворуч. Клавіша h поверне тебе до неї.', ['h'], 'П’ять разів h. Ліва клавіша в ряду h j k l рухає ліворуч.',room,[5,11],reach(5,6),{target:[5,6]}),
    mission('А тепер — нагору.', 'Натискай k до підсвіченої клітинки. Ти вже знаєш усі чотири напрямки.', ['k'], 'Натисни k двічі. Запам’ятай: j дивиться вниз, k тягнеться вгору.',room,[5,6],reach(3,6),{target:[3,6]})
  ]},
  { id:'insert', title:'Залиш свій слід', desc:'Перемикай режими. Створюй текст.', symbol:'i → Esc', minutes:5, topics:['insert','escape','replace'], missions:[
    mission('Скажи hello.', 'Натисни i, допиши hello та пробіл перед world. Заверши клавішею Esc.', ['i','hello␠','Esc'], 'Послідовність: i → hello → пробіл → Esc. Має вийти hello world.', 'world',[0,0],normalText('hello world')),
    mission('Рядок просить знак оклику.', 'Натисни A — опинишся в кінці рядка й одразу зможеш писати. Додай ! та натисни Esc.', ['A','!','Esc'], 'Велика A: Shift + a. Результат — hello world!', 'hello world',[0,0],normalText('hello world!')),
    mission('Потрібен ще один рядок.', 'Натисни o. Під поточним рядком з’явиться новий. Напиши ready та повернись через Esc.', ['o','ready','Esc'], 'Мала o відкриває рядок знизу й вмикає Insert. Має бути два рядки: hello та ready.', 'hello',[0,0],normalText('hello\nready')),
    mission('Одна літера все псує.', 'У neoxim закралася x. Курсор уже на ній. Натисни r, а потім v — виправ готовий.', ['r','v'], 'r замінює лише один символ. Після rv отримаєш neovim; Enter не потрібен.', 'neoxim',[0,3],(s,e)=>s.text==='neovim'&&e.action==='replace')
  ]},
  { id:'files', title:'Як звідси вийти?', desc:'Збереження й вихід без паніки.', symbol:':wq', minutes:3, topics:['write','quit','command'], missions:[
    mission('Спочатку збережемо.', 'У файлі є зміни. Введи :w та натисни Enter. Двокрапка відкриває командний рядок унизу.', [':w','Enter'], 'У Normal: : → w → Enter. У браузері зберігається навчальний буфер, без завантаження файлу.', 'my first saved file',[0,0],action('save'),{modified:true}),
    mission('Іноді чернетка не потрібна.', 'Спробуй :q та Enter. Редактор захистить незбережені зміни. Потім вийди без збереження через :q!.', [':q','Enter',':q!','Enter'], 'Додай !, щоб відкинути зміни. У цій місії вихід безпечний: це навчальна чернетка.', 'temporary draft',[0,0],(s,e,c)=>e.action==='quit'&&e.command===':q!'&&c.blockedQuit,{modified:true}),
    mission('Зберегти. Закрити. Видихнути.', 'Є команда для обох дій. Введи :wq і натисни Enter.', [':wq','Enter'], ':wq = write + quit. У справжньому Neovim так збережеш файл і закриєш вікно.', 'this one is worth keeping',[0,0],action('save-quit'),{modified:true})
  ]},
  { id:'words', title:'Думай словами', desc:'Стрибай далі, натискай менше.', symbol:'w b e $', minutes:4, topics:['words','edges','counts'], missions:[
    mission('Ціле слово за один крок.', 'Дістанься початку слова portal. Для переходу до наступного слова натискай w.', ['w'], 'Від red до green, потім до portal: w двічі.', 'red green portal blue',[0,0],(s,e)=>s.col===10&&e.action==='move'&&e.command.endsWith('w'),{target:[0,10]}),
    mission('Зупинка в кінці слова.', 'Натисни e, щоб стати на останню літеру слова portal.', ['e'], 'e = end. Один рух на останню літеру поточного слова.', 'red green portal blue',[0,10],(s,e)=>s.col===15&&e.command==='e',{target:[0,15]}),
    mission('Повернись до початку.', 'Клавіша b рухає назад до початку слова. Зараз це перша літера portal.', ['b'], 'З кінця portal натисни b один раз.', 'red green portal blue',[0,15],(s,e)=>s.col===10&&e.command==='b',{target:[0,10]}),
    mission('Долетіти до краю.', 'Натисни $, щоб опинитися на останньому символі рядка. Потім 0 — і повернешся на початок.', ['$','0'], '$ — кінець рядка (Shift + 4 на EN). 0 — перший символ. Виконай обидва рухи.', 'the beginning is another destination',[0,7],(s,e,c)=>e.command==='0'&&s.col===0&&c.visitedEnd)
  ]},
  { id:'delete', title:'Мистецтво прибирати', desc:'Видаляй сміливо. Повертай легко.', symbol:'x d u', minutes:5, topics:['delete','undo'], missions:[
    mission('Прибери зайве.', 'Курсор на зайвій x. Натисни x, щоб видалити символ під курсором.', ['x'], 'Одна клавіша x. З nexovim має вийти neovim.', 'nexovim',[0,2],(s,e)=>s.text==='neovim'&&e.action==='delete'),
    mission('Цілий рядок за дві клавіші.', 'Цей debug більше не потрібен. Натисни dd: рядок зникне повністю.', ['d','d'], 'Дві малі d поспіль. Залишаться тільки keep this та and this.', 'keep this\ndebug debug debug\nand this',[1,0],(s,e)=>s.text==='keep this\nand this'&&e.command==='dd'),
    mission('Слово, забирайся.', 'Видали слово very та пробіл після нього командою dw.', ['d','w'], 'd — видалити, w — до наступного слова. Результат: keep going.', 'very keep going',[0,0],(s,e)=>s.text==='keep going'&&e.command==='dw'),
    mission('Помилки не страшні.', 'Спочатку видали рядок через dd. Передумав? Натисни u та поверни його на місце.', ['d','d','u'], 'dd видалить рядок. u скасує останню зміну. Є також Ctrl + r для повторення скасованої зміни.', 'please keep me\nsecond chance',[0,0],(s,e,c)=>e.action==='undo'&&c.deleted&&s.text==='please keep me\nsecond chance')
  ]},
  { id:'combine', title:'Збирай команди', desc:'Дія + рух. Ось і вся магія.', symbol:'2dw ciw', minutes:5, topics:['operators','counts','textobjects'], missions:[
    mission('Двічі — однією командою.', 'Перші два слова зайві. Введи 2dw — і залишиться тільки keep this.', ['2','d','w'], 'Число перед командою — кількість повторень. 2dw видалить два слова разом із пробілами.', 'drop these keep this',[0,0],(s,e)=>s.text==='keep this'&&e.command==='2dw'),
    mission('Зміни слово зсередини.', 'Курсор усередині false. Введи ciw, напиши true та натисни Esc.', ['c','i','w','true','Esc'], 'c = change, iw = inner word. Курсор може бути будь-де всередині слова. Результат: enabled = true.', 'enabled = false',[0,12],normalText('enabled = true')),
    mission('Решта рядка — зайва.', 'Курсор на пробілі після keep. Команда d$ прибере все від курсора до кінця рядка.', ['d','$'], 'd + $ = видалити до кінця рядка. Має залишитися keep.', 'keep all of this is noise',[0,4],(s,e)=>s.text==='keep'&&e.command==='d$')
  ]},
  { id:'copy', title:'Копіюй і створюй', desc:'Буфер, вставлення та виділення.', symbol:'y p v', minutes:4, topics:['yank','visual'], missions:[
    mission('Збережи копію рядка.', 'Натисни yy, щоб скопіювати рядок, потім p — щоб вставити копію під ним.', ['y','y','p'], 'yy копіює рядок, p вставляє нижче. Має вийти два рядки зі словом echo.', 'echo',[0,0],(s,e)=>s.text==='echo\necho'&&e.action==='paste'),
    mission('Виділяй, як у редакторі.', 'Натисни v, потім e: слово green виділиться. Натисни y, щоб скопіювати його.', ['v','e','y'], 'v вмикає Visual. e розширює виділення до кінця слова. y копіює й повертає в Normal.', 'green light',[0,0],(s,e)=>e.command==='visual-y'&&s.register.text==='green'),
    mission('Велика V бачить рядки.', 'Натисни V, потім j: виділяться два рядки. Скопіюй через y та встав через p.', ['V','j','y','p'], 'Велика V виділяє рядками. Після V j y курсор повернеться на перший рядок; p вставить обидва під ним.', 'one\ntwo',[0,0],(s,e)=>s.text==='one\none\ntwo\ntwo'&&e.action==='paste')
  ]},
  { id:'search', title:'Знайди свій шлях', desc:'Пошук, переходи й заміна.', symbol:'/ n :s', minutes:4, topics:['search','substitute','filemoves'], missions:[
    mission('Де ж той портал?', 'Введи /portal та натисни Enter. Курсор сам знайде слово.', ['/portal','Enter'], '/ відкриває пошук. Введи portal латиницею та підтвердь Enter.', 'a quiet room\na hidden portal\na second portal',[0,0],(s,e)=>e.action==='search'&&e.found&&s.row===1&&s.col===9,{target:[1,9]}),
    mission('А є ще один?', 'Спочатку знайди portal через /portal. Потім натисни n, щоб перейти до наступного збігу.', ['/portal','Enter','n'], 'n повторює останній пошук. Велика N шукає у зворотному напрямку.', 'a quiet room\na hidden portal\na second portal',[0,0],(s,e)=>e.action==='search-next'&&e.found&&s.row===2&&s.col===9,{target:[2,9]}),
    mission('Одна заміна на весь файл.', 'Перетвори red на green в обох рядках: введи :%s/red/green/g та Enter.', [':%s/red/green/g','Enter'], '% — увесь файл; s — заміна; g — усі збіги в кожному рядку.', 'red light\nred door, red key',[0,0],(s,e)=>e.action==='substitute'&&s.text==='green light\ngreen door, green key')
  ]},
  { id:'final', title:'Твій перший конфіг', desc:'Збери навички в справжню задачу.', symbol:':check', minutes:5, topics:['textobjects','filemoves','write','quit'], missions:[
    mission('Запускаємо систему.', 'У конфігу вимкнено навчання. Знайди false та зміни його на true. Використовуй рухи або /false, потім ciw.', ['/false','Enter','ciw','true','Esc'], 'Пошук /false → Enter → ciw → true → Esc. Зміниться тільки слово false.', '# quest.conf\nenabled = false\ndebug = true\ntheme = green',[0,0],normalText('# quest.conf\nenabled = true\ndebug = true\ntheme = green')),
    mission('Зайвий debug.', 'Видали весь рядок debug = true. Решту конфігу залиш на місці.', ['/debug','Enter','dd'], '/debug → Enter → dd. Можна також перейти на рядок клавішею j.', '# quest.conf\nenabled = true\ndebug = true\ntheme = green',[0,0],(s,e)=>s.text==='# quest.conf\nenabled = true\ntheme = green'&&e.action==='delete'),
    mission('Збережи свою перемогу.', 'Конфіг готовий. Збережи його та закрий редактор однією командою. Ти вже знаєш якою.', [':wq','Enter'], 'Введи :wq та Enter. Наступна зупинка — пісочниця або справжній Neovim.', '# quest.conf\nenabled = true\ntheme = green',[0,0],action('save-quit'),{modified:true})
  ]}
];
export const wiki = [
  {id:'normal',keys:'Normal',title:'Клавіші стають командами',body:'Це початковий режим. h пересуває курсор, d починає видалення, i вмикає введення. Щоб писати текст, спочатку перейди в Insert.'},
  {id:'hjkl',keys:'h j k l',title:'Чотири напрямки',body:'h — ліворуч, j — вниз, k — вгору, l — праворуч. Руки залишаються на основному ряду клавіатури. У тренажері стрілки теж працюють, але місії привчають до команд.'},
  {id:'insert',keys:'i a I A o O',title:'Почати писати',body:'i — перед курсором, a — після. I — перед першим непробільним символом, A — у кінці рядка. o створює рядок знизу, O — зверху. Усі вмикають Insert.'},
  {id:'escape',keys:'Esc',title:'Повернутись у Normal',body:'Завершує введення, скасовує незакінчену команду або виходить із виділення. Після Insert курсор зміщується на останній введений символ.'},
  {id:'replace',keys:'r',title:'Замінити один символ',body:'Натисни r, потім новий символ. Наприклад, rv замінить символ під курсором на v. Ти залишаєшся в Normal.'},
  {id:'command',keys:':',title:'Командний рядок',body:'Двокрапка в Normal відкриває командний рядок. Enter виконує команду, Esc скасовує. У симуляторі підтримуються :w, :q, :q!, :wq, :x, :число та заміни :s.'},
  {id:'write',keys:':w',title:'Зберегти зміни',body:'write записує поточний буфер. У грі це навчальне збереження в пам’яті; воно не створює файл на диску. Прогрес місій окремо зберігається в цьому браузері.'},
  {id:'quit',keys:':q :q! :wq',title:'Вихід без загадок',body:':q закриває незмінений буфер; якщо є незбережені зміни, побачиш E37. :q! виходить без збереження. :wq зберігає та закриває. Enter підтверджує команду.'},
  {id:'words',keys:'w b e',title:'Переміщення словами',body:'w — початок наступного слова; b — початок попереднього або поточного слова; e — кінець поточного чи наступного. Пробіли розділяють слова, пунктуація утворює окремі групи.'},
  {id:'edges',keys:'0 ^ $',title:'Краї рядка',body:'0 — перший символ рядка, ^ — перший непробільний, $ — останній. Комбінуй з операторами: d$ видаляє від курсора до кінця рядка.'},
  {id:'counts',keys:'3j 2dw',title:'Кількість перед дією',body:'Число повторює команду. 3j — три рядки вниз, 2w — два слова вперед, 2dw — видалити два слова. Працює й d2w. Esc скидає незакінчену послідовність.'},
  {id:'delete',keys:'x dd dw',title:'Видалення',body:'x прибирає символ під курсором, dd — поточний рядок, dw — від курсора до наступного слова. Видалений текст потрапляє в регістр: його можна вставити через p.'},
  {id:'undo',keys:'u Ctrl+r',title:'Скасувати й повернути',body:'u скасовує останню зміну. Ctrl + r повертає скасовану зміну. Серія введення від i до Esc вважається однією зміною. Крапка . повторює останнє просте редагування.'},
  {id:'operators',keys:'d c y',title:'Дія + рух',body:'d видаляє, c змінює та вмикає Insert, y копіює. Додай рух: dw, ce, y$. Подвійний оператор застосовується до рядка: dd, cc, yy.'},
  {id:'textobjects',keys:'ciw diw',title:'Слово як об’єкт',body:'iw — слово навколо курсора без сусідніх пробілів. ciw видалить це слово й увімкне Insert. diw видалить його. У цьому симуляторі доступний текстовий об’єкт iw.'},
  {id:'yank',keys:'yy p P',title:'Копіювання й вставлення',body:'yank означає скопіювати. yy копіює рядок. p вставляє рядковий регістр нижче або текст після курсора. P — вище або перед курсором. Видалення теж наповнює регістр.'},
  {id:'visual',keys:'v V',title:'Виділення',body:'v — виділення символами, V — цілими рядками. Рухай курсор, потім натисни y для копії, d для видалення або c для зміни. Esc прибирає виділення.'},
  {id:'search',keys:'/ n N',title:'Шукати в тексті',body:'/слово та Enter знаходить наступний збіг. n іде до наступного, N — до попереднього. Досягнувши краю файлу, пошук продовжується з іншого краю. Тут пошук буквальний і чутливий до регістру.'},
  {id:'substitute',keys:':%s/a/b/g',title:'Пошук із заміною',body:':s/old/new/ замінює перший збіг у поточному рядку. g — усі збіги рядка; % — усі рядки. Тренажер використовує синтаксис регулярних виразів JavaScript; у Neovim складні вирази можуть відрізнятися.'},
  {id:'filemoves',keys:'gg G :12',title:'Швидко пройти файл',body:'gg — перший рядок, G — останній. 5G або :5 та Enter — п’ятий рядок. f + символ шукає символ праворуч у рядку, t зупиняється перед ним.'}
];
export const sandboxText = 'const learner = {\n  name: "you",\n  curiosity: true\n};\n\nhello world';
