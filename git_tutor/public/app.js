import {tutorChat} from './luna-chat.js';
const get = id => document.getElementById(id);
const editor = get('editor'), prompt = get('command'), drawer = get('drawer');
const resetDialog = get('reset-dialog');
const fragment = location.hash.slice(1);
if (/^[a-f0-9]{48}$/.test(fragment)) {
  sessionStorage.setItem('git-tutor-token', fragment);
  history.replaceState(null, '', '/');
}
const token = sessionStorage.getItem('git-tutor-token') || '';
let view = null, currentFile = '', dirty = false, busy = false, historyIndex = null, drawerTab = 'course';

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function message(text = '', error = false) {
  const box = get('notice');
  box.textContent = text;
  box.hidden = !text;
  box.dataset.tone = error ? 'error' : 'info';
}

async function api(input) {
  const response = await fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Git-Tutor-Token': token },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error);
  return data;
}

function controls() {
  const inactive = !view || busy;
  prompt.disabled = inactive;
  get('run').disabled = inactive;
  get('hint').disabled = inactive || !view.hintAvailable;
  get('check').disabled = inactive || view.pending;
  get('reset').disabled = inactive;
  get('save').disabled = inactive || view.pending || !dirty;
  get('next').disabled = inactive || view.pending;
  get('colleague').disabled = inactive || view.pending;
  editor.readOnly = inactive || view.pending;
}

function fileStatus() {
  get('file-status').textContent = currentFile ? currentFile + (dirty ? ' · незбережені зміни' : ' · збережено') : '';
}

function drawFiles() {
  const files = view.files.filter(file => file.text !== null);
  if (!files.some(file => file.name === currentFile)) {
    currentFile = files[0]?.name || '';
    dirty = false;
  }
  get('tabs').replaceChildren(...files.map(file => {
    const button = node('button', file.name);
    button.type = 'button';
    button.dataset.file = file.name;
    button.setAttribute('aria-pressed', String(file.name === currentFile));
    return button;
  }));
  editor.hidden = !currentFile;
  get('empty-files').hidden = !!currentFile;
  if (!dirty) editor.value = files.find(file => file.name === currentFile)?.text || '';
  fileStatus();
}

function drawTerminal() {
  const rows = view.terminal.map(({ command, output, failed }) => {
    const row = node('div', undefined, 'console-row' + (failed ? ' failed' : ''));
    row.append(node('p', '❯ ' + command, 'command'));
    if (output) row.append(node('pre', output));
    return row;
  });
  const terminal = get('terminal');
  terminal.replaceChildren(...(rows.length ? rows : [node('p', 'Введи Git-команду й натисни Enter.', 'quiet')]));
  terminal.scrollTop = terminal.scrollHeight;
  prompt.placeholder = view.pending ? 'y / n / q / ?' : 'git status -sb';
  prompt.setAttribute('aria-label', view.pending ? 'Відповідь для фрагмента' : 'Git-команда');
  get('operation').textContent = view.pending ? 'Вибір фрагмента' :
    view.state.operation === 'merge' ? 'Merge триває' : view.state.operation === 'rebase' ? 'Rebase триває' : '';
}

function drawRepo() {
  const { state } = view;
  const parts = state.repo ? [
    node('span', state.branch === '(detached)' ? 'detached HEAD' : state.branch || 'HEAD', 'status-branch'),
    node('span', 'staged ' + state.index.length),
    node('span', 'modified ' + state.working.length),
    node('span', 'untracked ' + state.untracked.length),
    ...(state.conflicts.length ? [node('span', 'конфлікти ' + state.conflicts.length)] : []),
    ...(state.upstream ? [node('span', '↑ ' + state.upstream)] : []),
  ] : [node('span', 'Робоча папка без репозиторію')];
  get('repo-status').replaceChildren(...parts);
}

function nextMission() {
  const course = view.chapters.flatMap(chapter => chapter.items);
  const i = course.findIndex(item => item.id === view.mission.id);
  return course[i + 1] ?? null;
}

const luna = tutorChat(() => ({
  id: view.mission.id,
  text: [view.mission.title,view.mission.description,...(view.mission.goals||[])].join('\n'),
}));
drawer.querySelector('[data-drawer-tab="luna"]').hidden = !luna;

function drawMenu() {
  if (!view || !drawer.open) return;
  const content = get('drawer-content');
  for (const button of drawer.querySelectorAll('[data-drawer-tab]')) button.setAttribute('aria-pressed', String(button.dataset.drawerTab === drawerTab));
  if (drawerTab === 'luna' && luna) {
    luna.refresh();
    if (content.firstChild !== luna.root) content.replaceChildren(luna.root);
    return;
  }
  if (drawerTab === 'manual') {
    content.replaceChildren(...view.manual.map(([command, description]) => {
      const section = node('article');
      section.append(node('code', command), node('p', description));
      return section;
    }));
    return;
  }
  content.replaceChildren(...view.chapters.flatMap(({ title, items }) => [
    node('h3', title),
    ...items.map(item => {
      const button = node('button', (item.complete ? '✓ ' : '') + item.title, 'lesson');
      button.type = 'button';
      button.dataset.mission = item.id;
      if (item.id === view.mission.id) button.setAttribute('aria-current', 'step');
      return button;
    }),
  ]));
}

function draw() {
  const chapter = view.chapters.find(group => group.items.some(item => item.id === view.mission.id));
  const main = view.chapters.slice(0, 7).flatMap(group => group.items);
  get('progress').textContent = main.filter(item => item.complete).length + ' / ' + main.length + ' вправ';
  get('chapter').textContent = chapter.title;
  get('mission-title').textContent = view.mission.title;
  get('description').textContent = view.mission.description;
  get('checks').replaceChildren(...view.checks.map(check => {
    const row = node('li');
    if (check.done) row.dataset.done = '';
    const icon = node('span', check.done ? '✓' : '·', 'goal-icon');
    icon.setAttribute('aria-hidden', 'true');
    row.append(icon, node('span', check.label));
    if (check.done) row.setAttribute('aria-label', 'Виконано: ' + check.label);
    return row;
  }));
  get('hints').replaceChildren(...view.hints.map(text => node('li', text)));
  get('hints').hidden = !view.hints.length;
  get('colleague').hidden = !view.colleagueAvailable;
  const next = nextMission();
  get('next').hidden = !view.done || !next;
  get('next').textContent = view.mission.id === 'final-remote' ? 'Додаткова вправа →' : 'Далі →';
  drawFiles();
  drawTerminal();
  drawRepo();
  drawMenu();
  controls();
}

function load(data) {
  const changed = view?.mission.id !== data.mission.id;
  view = data;
  if (changed) {
    currentFile = '';
    dirty = false;
    historyIndex = null;
    prompt.value = '';
  }
  draw();
}

async function flushEditor() {
  if (!dirty) return;
  const data = await api({ type: 'save', file: currentFile, text: editor.value });
  dirty = false;
  load(data);
}

// Recall waits for the current operation and the editor draft before closing.
globalThis.recallSaveTutor=async()=>{
  while(busy)await new Promise(resolve=>setTimeout(resolve,40));
  await flushEditor();
  return true;
};
async function perform(input, { save = true, focus = false, after } = {}) {
  if (busy) return;
  busy = true;
  controls();
  try {
    if (save) await flushEditor();
    const data = input ? await api(input) : view;
    if (input?.type === 'reset') { dirty = false; currentFile = ''; }
    if (data) load(data);
    message(data?.tip || data?.warning || (input?.type === 'check'
      ? data.done ? 'Вправа виконана.' : 'Залишилися незавершені пункти. Перевір їх у списку.'
      : ''));
    if (after) after();
  } catch (error) {
    message(error instanceof Error ? error.message : 'Дію не виконано.', true);
  } finally {
    busy = false;
    controls();
    if (focus) prompt.focus({ preventScroll: true });
  }
}

get('brand').addEventListener('click', event => { event.preventDefault(); prompt.focus(); });
get('command-form').addEventListener('submit', event => {
  event.preventDefault();
  const command = prompt.value.trim();
  if (!command || busy) return;
  prompt.value = '';
  historyIndex = null;
  void perform({ type: 'run', command }, { focus: true });
});
prompt.addEventListener('keydown', event => {
  if (!view || view.pending || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
  const history = view.terminal.map(entry => entry.command).filter(command => /^git\s/i.test(command));
  if (!history.length) return;
  event.preventDefault();
  historyIndex = Math.min(history.length, Math.max(0, (historyIndex ?? history.length) + (event.key === 'ArrowUp' ? -1 : 1)));
  prompt.value = history[historyIndex] ?? '';
});

editor.addEventListener('input', () => { dirty = true; fileStatus(); controls(); });
get('save').onclick = () => void perform(null);
get('tabs').addEventListener('click', event => {
  const file = event.target.closest('[data-file]')?.dataset.file;
  if (file && file !== currentFile) void perform(null, {
    after: () => { currentFile = file; drawFiles(); editor.focus(); },
  });
});
get('hint').onclick = () => void perform({ type: 'hint' });
get('check').onclick = () => void perform({ type: 'check' });
get('colleague').onclick = () => void perform({ type: 'colleague' }, { focus: true });
get('next').onclick = () => {
  const next = nextMission();
  if (next) void perform({ type: 'select', id: next.id }, { focus: true });
};
get('reset').onclick = () => { resetDialog.returnValue = ''; resetDialog.showModal(); };
resetDialog.addEventListener('close', () => {
  if (resetDialog.returnValue === 'reset') void perform({ type: 'reset' }, { save: false, focus: true });
});

function toggleMenu() {
  if (drawer.open) drawer.close();
  else { drawer.showModal(); drawMenu(); }
}
get('menu').onclick = toggleMenu;
drawer.querySelector('[data-close-drawer]').onclick = () => drawer.close();
drawer.addEventListener('click', event => {
  const tab = event.target.closest('[data-drawer-tab]')?.dataset.drawerTab;
  const id = event.target.closest('[data-mission]')?.dataset.mission;
  if (tab) { drawerTab = tab; drawMenu(); }
  if (id && !busy) {
    drawer.close();
    void perform({ type: 'select', id }, { focus: true });
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'F2' && !resetDialog.open) { event.preventDefault(); toggleMenu(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && view && !drawer.open && !resetDialog.open) {
    event.preventDefault();
    if (dirty && !view.pending) void perform(null);
  }
});

void perform({ type: 'state' }, { focus: true });
