import { chapters, wiki } from './course.js';
import {examNarrative} from './exams.js';

export const ui = {
  en: { stages:'Chapters', manual:'Manual', history:'Dialogue', close:'Close menu', menu:'Open menu', console:'Practice console', editor:'Editor. Use your keyboard.', dialogue:'Dialogue', search:'Command or action…', searchLabel:'Search the manual', docs:'Documentation ↗', empty:'Nothing here yet.', notFound:'No matches.', hint:'A hint', restart:'Try again', sandbox:'Sandbox', fullscreen:'Fullscreen', reset:'Reset progress', back:'Esc — back', resetQuestion:'Start all over?', confirm:'Start over', cancel:'Keep going', blankLine:'empty line', replay:'Replay opening', language:'Language' },
  uk: { stages:'Розділи', manual:'Мануал', history:'Діалоги', close:'Закрити меню', menu:'Відкрити меню', console:'Тренувальна консоль', editor:'Редактор. Керування клавіатурою.', dialogue:'Діалог', search:'Команда або дія…', searchLabel:'Пошук у мануалі', docs:'Документація ↗', empty:'Тут поки порожньо.', notFound:'Нічого не знайшлося.', hint:'Натяк', restart:'Ще раз', sandbox:'Пісочниця', fullscreen:'Повний екран', reset:'Скинути прогрес', back:'Esc — назад', resetQuestion:'Почати все спочатку?', confirm:'Спочатку', cancel:'Продовжити', blankLine:'порожній рядок', replay:'Повторити вступ', language:'Мова' }
};
export const chapterNamesEN = ['First contact','Leave a trace','The way out','Think in words','Make some space','Put it together','Copy, then create','Find your way','Your first config'];
Object.assign(ui.en,{sound:'Sound',soundOn:'On',soundOff:'Off',enableSound:'Enable sound',muteSound:'Mute all sound',dialogueVolume:'Dialogue volume',musicVolume:'Ambience volume'});
Object.assign(ui.uk,{sound:'Звук',soundOn:'Увімкнено',soundOff:'Вимкнено',enableSound:'Увімкнути звук',muteSound:'Вимкнути весь звук',dialogueVolume:'Гучність діалогів',musicVolume:'Гучність фону'});
export const missionNamesEN = [
  ['Follow three lights','A little lower','A step back','Up we go'],
  ['Say hello','A little confidence','One more line','One wrong letter'],
  ['Keep this one','Leave the draft behind','Save. Close. Breathe.'],
  ['A word at a time','The end of a word','Back to the beginning','Both ends of a line'],
  ['One letter too many','Two keys. One whole line.','Lose a word','Change your mind'],
  ['Two at once','Change it from within','Nothing past this point'],
  ['An echo of an echo','Choose a word','Take both lines'],
  ['A hidden portal','Another portal','A change everywhere'],
  ['Switch it on','Lose the debug line','Keep your work']
];
export const missionLines = {
  en: [
    ['See that light? Go to it.\nh left · j down · k up · l right.\nThere are three. One at a time.', 'A little lower this time.\nj takes you down.', 'It has moved to the left.\nTry h.', 'One last direction.\nk takes you up.'],
    ['Something is missing.\ni → type hello and a space → Esc.', 'A little more confidence.\nA → ! → Esc.', 'We could use another line.\no → type ready → Esc.', 'That x does not belong here.\nr, then v.'],
    ['Let us keep this one.\n:w → Enter.', 'Try leaving: :q → Enter.\nNo? Then :q! → Enter.', 'Keep it. Then leave.\n:wq → Enter.'],
    ['Why walk one letter at a time?\nw jumps to the next word. Reach portal.', 'Stop on the last letter of portal.\nTry e.', 'Back to the start of this word.\nTry b.', 'To the end of the line: $.\nBack to the beginning: 0. Try both.'],
    ['One x too many.\nDelete it with x.', 'That debug line can go.\ndd removes the whole line.', 'Too many words.\ndw removes very and its space.', 'Delete the line with dd.\nNow change your mind: u.'],
    ['The first two words can go.\nTry 2dw.', 'You are somewhere inside false.\nciw → type true → Esc.', 'Keep only keep.\nd$ removes the rest of the line.'],
    ['Want another echo?\nyy copies the line. p puts it below.', 'Select green. Then copy it.\nv → e → y.', 'Let us take both lines.\nV → j → y → p.'],
    ['There is a portal somewhere.\n/portal → Enter.', 'Find portal: /portal → Enter.\nThen n finds the next one.', 'Make every red a green.\n:%s/red/green/g → Enter.'],
    ['Your first config. Turn enabled on.\nFind false. Change it to true with ciw.', 'Remove the debug = true line.\nYou know how.', 'Everything is ready. Save and leave.\nYour move.']
  ],
  uk: [
    ['Бачиш вогник? Дійди до нього.\nh ліворуч · j вниз · k вгору · l праворуч.\nБуде три. По одному.', 'Цього разу трохи нижче.\nj рухає вниз.', 'Вогник тепер ліворуч.\nСпробуй h.', 'Залишився один напрямок.\nk рухає вгору.'],
    ['Тут чогось бракує.\ni → напиши hello та пробіл → Esc.', 'Трохи більше впевненості.\nA → ! → Esc.', 'Потрібен ще один рядок.\no → напиши ready → Esc.', 'Ця x тут зайва.\nr, потім v.'],
    ['Залишимо це собі.\n:w → Enter.', 'Спробуй вийти: :q → Enter.\nНе пускає? Тоді :q! → Enter.', 'Зберегти й вийти.\n:wq → Enter.'],
    ['Навіщо йти по літері?\nw стрибає до наступного слова. Дійди до portal.', 'Зупинись на останній літері portal.\nСпробуй e.', 'Назад на початок цього слова.\nСпробуй b.', 'До кінця рядка — $.\nНазад на початок — 0. Спробуй обидва.'],
    ['Ця x зайва.\nВидали її клавішею x.', 'Цей debug теж зайвий.\ndd прибере весь рядок.', 'Забагато слів.\ndw прибере very разом із пробілом.', 'Видали рядок через dd.\nА тепер передумай: u.'],
    ['Перші два слова зайві.\nВведи 2dw.', 'Курсор усередині false.\nciw → напиши true → Esc.', 'Залиш тільки keep.\nd$ прибере решту рядка.'],
    ['Хочеш ще одне echo?\nyy — копія рядка. p — вставити.', 'Виділи green і скопіюй.\nv → e → y.', 'Візьмемо одразу два рядки.\nV → j → y → p.'],
    ['Десь тут є portal.\n/portal → Enter.', 'Знайди portal: /portal → Enter.\nПотім n — наступний збіг.', 'Змінимо всі red на green.\n:%s/red/green/g → Enter.'],
    ['Твій перший конфіг. Увімкни enabled.\nЗнайди false та зміни на true через ciw.', 'Прибери рядок debug = true.\nТи вже вмієш.', 'Усе готово. Збережи й вийди.\nТвій хід.']
  ]
};
export const hintsEN = [
  ['Follow the glowing diamond using h (left), j (down), k (up), l (right). Three different places. The arrow points to the current one.', 'Press j twice. Two rows down.', 'Press h five times. It moves left.', 'Press k twice. It moves up.'],
  ['i → hello → space → Esc. The result should be hello world.', 'Capital A: Shift + a. Type !, then Esc. The result is hello world!', 'Lowercase o creates a line below and enters Insert. Type ready, then Esc.', 'r replaces one character. rv turns neoxim into neovim. No Enter needed.'],
  ['In Normal: : → w → Enter. This saves the practice buffer in memory.', 'First try :q and Enter. Then :q! and Enter discards the unsaved draft.', ':wq means write and quit. Press Enter to run it.'],
  ['Press w twice: red → green → portal.', 'e means end. One press reaches the last letter of portal.', 'From the end of portal, press b once.', '$ is the last character (Shift + 4 on EN). 0 is the first. Use both.'],
  ['One x removes the character under your cursor. nexovim becomes neovim.', 'Two lowercase d keys. Only keep this and and this should remain.', 'd means delete, w means to the next word. The result is keep going.', 'dd deletes the line. u brings it back. Ctrl + r redoes an undone change.'],
  ['A number repeats a command. 2dw deletes two words and their spaces.', 'c means change, iw means inner word. ciw → true → Esc. The result is enabled = true.', 'd + $ deletes to the end of the line. Only keep should remain.'],
  ['yy copies the line. p puts the copy below. You should have two echo lines.', 'v enters Visual, e extends the selection, y copies it and returns to Normal.', 'V selects whole lines. V j y copies two lines. p inserts them below the first line.'],
  ['/ opens search. Type portal and press Enter.', 'n repeats the last search. Capital N goes backwards.', '% means all lines. s means substitute. g means all matches in each line.'],
  ['/false → Enter → ciw → true → Esc. Only false should change.', '/debug → Enter → dd. You can also move to the line with j.', ':wq → Enter. Save your work and leave the editor.']
];
const dialogueCatalog = {
  en: { question:'Waiting for something?', wake:'Fine. Let us give that cursor\nsomewhere to go.', routeNext:'Oh. It moved.\nFollow the next light.', routeLast:'One more. Over there.\nYou have all four directions.', routeHit:'Found it.', success:['There you go.','See? It works.','Exactly.','You are in control.'], finish:'You found the way out.\nNow make something of your own.', sandbox:'Your turn to make the rules.\nIf you change your mind, press u.', closed:'You left.\nEnter brings you back.', keyboard:'Switch your keyboard to EN.\nThen try again.', fullscreen:'Fullscreen is unavailable here.\nTry F11 in a regular browser.' },
  uk: { question:'Чекаєш чогось?', wake:'Гаразд. Знайдемо цьому курсору\nкуди піти.', routeNext:'О. Він перемістився.\nДійди до наступного вогника.', routeLast:'Ще один. Он там.\nТепер у тебе всі чотири напрямки.', routeHit:'Є контакт.', success:['Ось так.','Бачиш? Працює.','Саме так.','Ти керуєш.'], finish:'Ти знайшов вихід.\nТепер створи щось своє.', sandbox:'Тепер правила за тобою.\nЯкщо передумаєш, натисни u.', closed:'Ти вийшов.\nEnter — повернутись.', keyboard:'Перемкни клавіатуру на EN.\nТоді спробуй ще раз.', fullscreen:'Тут повний екран недоступний.\nСпробуй F11 у звичайному браузері.' }
};
export function dialogueText(entry, lang) {
  if(['examIntro','examDone','menuReveal','practiceReady'].includes(entry.kind))return examNarrative(entry,lang);
  const c = entry.chapter ?? 0, s = entry.step ?? 0;
  if (entry.kind === 'mission') return missionLines[lang][c][s];
  if (entry.kind === 'hint') return lang === 'en' ? hintsEN[c][s] : c === 0 && s === 0 ? 'Рухайся до ромба: h ліворуч, j вниз, k вгору, l праворуч. Буде три різні цілі. Вказівник показує поточну.' : chapters[c].missions[s].hint;
  if (entry.kind === 'success') return dialogueCatalog[lang].success[s % 4];
  return dialogueCatalog[lang][entry.kind] || (lang === 'uk' && entry.text ? entry.text : missionLines[lang][c]?.[s]) || '';
}
export const chapterTitle = (lang, c) => lang === 'en' ? chapterNamesEN[c] : chapters[c].title;
export const missionTitle = (lang, c, s) => c === 0 && s === 0 ? lang === 'en' ? missionNamesEN[0][0] : 'Дійди до трьох вогників' : lang === 'en' ? missionNamesEN[c][s] : chapters[c].missions[s].title;
const manualEN = [
  ['Keys become commands','Normal is the starting mode. h moves, d starts a deletion, i enters Insert. To type text, enter Insert first.'],
  ['Four directions','h left, j down, k up, l right. Keep your hands on the home row. Arrow keys work too; the challenges teach the letter commands.'],
  ['Start typing','i inserts before the cursor; a after it. I starts at the first non-space character; A at the end. o opens a line below, O above. Each enters Insert.'],
  ['Back to Normal','Finish typing, cancel a partial command, or leave Visual. After Insert, the cursor moves back onto the last entered character.'],
  ['Replace one character','Press r, then its replacement. rv changes the character under the cursor to v. You stay in Normal.'],
  ['Command line',': in Normal opens the command line. Enter runs it; Esc cancels. Supported here: :w, :q, :q!, :wq, :x, :number, and :s substitutions.'],
  ['Keep your work',':w saves the practice buffer in memory; it does not write a file to your device. Mission progress is saved separately in this browser.'],
  ['The way out',':q closes an unchanged buffer. Unsaved changes give E37. :q! discards changes and exits; :wq saves and exits. Confirm with Enter.'],
  ['Move by words','w reaches the next word, b the start of the current or previous word, e the end of the current or next word. Punctuation forms separate groups.'],
  ['Line boundaries','0 reaches the first character; ^ the first non-space character; $ the last. Add an operator: d$ deletes to the end of the line.'],
  ['Repeat with a number','3j moves three rows down. 2w moves two words forward. 2dw deletes two words. d2w also works. Esc clears a partial command.'],
  ['Delete','x deletes the character under the cursor. dd deletes a line; dw deletes to the next word. Deleted text enters a register and can be pasted with p.'],
  ['Undo and redo','u undoes the last change. Ctrl + r redoes it. Typing between i and Esc is one change. A dot repeats the last simple edit.'],
  ['Action plus motion','d deletes, c changes and enters Insert, y copies. Add a motion: dw, ce, y$. Double an operator to act on a line: dd, cc, yy.'],
  ['A word as an object','iw means the word around the cursor, without surrounding spaces. ciw replaces it and enters Insert. diw deletes it. This simulator supports iw.'],
  ['Copy and paste','yy copies a line. p pastes a line below, or text after the cursor. P pastes above or before. Deletion also fills the register.'],
  ['Select','v selects characters, V whole lines. Move, then y to copy, d to delete, c to change. Esc clears the selection.'],
  ['Search','/word and Enter finds the next match. n goes forward, N backwards. Search wraps at file boundaries. Here it is literal and case-sensitive.'],
  ['Search and replace',':s/old/new/ replaces the first match on the current line. g replaces every match on a line; % covers all lines. This simulator uses JavaScript regular expressions.'],
  ['Cross the file','gg reaches the first line, G the last. 5G or :5 and Enter reaches line five. f plus a character finds it to the right; t stops before it.']
];
export function localizedWiki(lang) { return wiki.map((w, i) => lang === 'en' ? { ...w, title: manualEN[i][0], body: manualEN[i][1] } : w); }
const terminalEN = {
  'Редактор закрито. Усе під контролем.':'Buffer closed.', 'Приклад: :s/old/new/g':'Example: :s/old/new/g', 'Заміну виконано':'Substitution complete', 'Некоректний вираз пошуку':'Invalid search expression', 'Довідник — кнопка книги праворуч угорі.':'Open the menu for the manual.', 'Спробуй рух w, e, b, 0, $ або повтори оператор.':'Try w, e, b, 0, $, or repeat the operator.', 'Спочатку введи /слово та Enter.':'First enter /word and press Enter.', 'У Normal клавіші — це команди. Для тексту натисни i.':'In Normal, keys are commands. Press i to type.', 'Цієї команди ще немає у симуляторі. Підглянь у довідник.':'This command is not supported here. Check the manual.'
};
export function terminalMessage(message, lang) { return lang === 'en' ? terminalEN[message] || message.replace('пошук з переходом через край','search wraps at file boundaries') : message; }
