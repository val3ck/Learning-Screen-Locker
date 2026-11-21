import { randomUUID } from 'node:crypto';
import { access, copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { byId, chapters, manual } from './course.mjs';
import { grade, readLocalFile, repoState } from './checks.mjs';
import { colleaguePush, createFixture, loadFixture } from './fixtures.mjs';
import { Git, PatchSession, dataRoot, ownDirectory, parseGit } from './git.mjs';

const makeRecord = () => ({ workspace: null, attempts: 0, help: 0, completed: false, observed: {}, terminal: [] });
const fresh = () => ({ version: 1, active: 'init', missions: {} });
const valid = doc => doc?.version === 1 && byId.has(doc.active) && doc.missions &&
  Object.entries(doc.missions).every(([id, record]) => byId.has(id) && record &&
    (record.workspace === null || record.workspace.startsWith(id + '-') && /^[a-z0-9-]+$/.test(record.workspace)) &&
    Number.isInteger(record.attempts) && Number.isInteger(record.help) && typeof record.completed === 'boolean' &&
    record.observed && Array.isArray(record.terminal));

async function savedProgress(file) {
  let damaged = false;
  for (const suffix of ['', '.bak']) {
    try {
      const doc = JSON.parse(await readFile(file + suffix, 'utf8'));
      if (valid(doc)) return { doc, warning: suffix ? 'Прогрес завантажено з резервної копії.' : '' };
      damaged = true;
    } catch (error) { if (error.code !== 'ENOENT') damaged = true; }
  }
  return { doc: fresh(), warning: damaged ? 'Файл прогресу пошкоджений. Почато новий запис. Навчальні каталоги збережені.' : '' };
}

function responseTip(args, result, state) {
  if (result.code === 0) return '';
  const error = result.err;
  if (/fetch first|non-fast-forward|remote contains work/i.test(error)) return 'На origin є зміни, яких немає локально. Fetch дасть змогу порівняти історії.';
  if (state.conflicts.length) return 'Git зупинив операцію на конфлікті. Status покаже файли, які треба розв’язати.';
  if (/not a git repository/i.test(error)) return 'Робоча папка ще не має репозиторію. Перевір, чи задача просить init або clone.';
  if (/nothing to commit|no changes added/i.test(result.out + error)) return 'Переглянь staging. Коміт записує лише підготовлені зміни.';
  if (/no upstream branch/i.test(error)) return 'Гілка ще не прив’язана до origin. Згадай прапорець, який це робить під час першого push.';
  if (/not possible to fast-forward/i.test(error)) return 'Історії розійшлися. Подивись обидві гілки в git log --oneline --graph --all.';
  if (args[0] === 'restore') return 'Звір назву файла й перевір, чи хочеш змінити staging або робочу копію.';
  return '';
}

export class Tutor {
  static async open(directory) {
    const tutor = new Tutor(await dataRoot(directory));
    await mkdir(tutor.workspaces, { recursive: true });
    await ownDirectory(tutor.workspaces);
    await tutor.git.prepare();
    ({ doc: tutor.doc, warning: tutor.warning } = await savedProgress(tutor.progressFile));
    return tutor;
  }

  constructor(directory) {
    this.directory = directory;
    this.workspaces = path.join(directory, 'workspaces');
    this.progressFile = path.join(directory, 'progress.json');
    this.git = new Git(directory);
    this.patch = null;
  }

  get id() { return this.doc.active; }
  get mission() { return byId.get(this.id); }
  get record() { return this.doc.missions[this.id] ??= makeRecord(); }

  async persist() {
    const tmp = this.progressFile + '.' + randomUUID() + '.tmp';
    await writeFile(tmp, JSON.stringify(this.doc, null, 2), { flag: 'wx' });
    try {
      try {
        const previous = JSON.parse(await readFile(this.progressFile, 'utf8'));
        if (valid(previous)) await copyFile(this.progressFile, this.progressFile + '.bak');
      } catch (error) {
        if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
      }
      await rename(tmp, this.progressFile);
    } catch (error) {
      await rm(tmp, { force: true }).catch(() => {});
      throw error;
    }
  }

  async startWorkspace(reset = false) {
    const record = this.record;
    if (record.workspace && !reset) return;
    const name = this.id + '-' + randomUUID();
    await createFixture(this.git, this.workspaces, this.id, path.join(this.workspaces, name));
    const previous = this.doc.missions[this.id];
    this.doc.missions[this.id] = { ...makeRecord(), workspace: name, attempts: record.attempts, completed: record.completed };
    try { await this.persist(); } catch (error) { this.doc.missions[this.id] = previous; throw error; }
    // Older progress backups can still reopen their original workspaces.
    if (reset) this.warning = '';
  }

  async fixture() {
    await this.startWorkspace();
    const fixture = await loadFixture(path.join(this.workspaces, this.record.workspace), this.id);
    await ownDirectory(fixture.paths.work);
    return fixture;
  }

  log(command, output, failed = false) {
    const terminal = this.record.terminal;
    terminal.push({ command, output: output.slice(0, 5000), failed });
    if (terminal.length > 45) terminal.splice(0, terminal.length - 45);
  }

  async publicState(fixture, { pending = false, state, tip = '' } = {}) {
    const { work } = fixture.paths;
    state ??= await repoState(this.git, work);
    const checks = pending
      ? this.patch.checks
      : await grade(this.git, fixture, this.mission, state, this.record.observed);
    const done = checks.every(item => item.done);
    if (done && !this.record.completed) { this.record.completed = true; await this.persist(); }
    const files = await Promise.all(this.mission.files.map(async name => ({ name, text: await readLocalFile(work, name) })));
    return {
      mission: { id: this.id, title: this.mission.title, description: this.mission.description },
      chapters: chapters.map(([title, ids]) => ({ title, items: ids.map(id => ({
        id, title: byId.get(id).title, complete: !!this.doc.missions[id]?.completed,
      })) })),
      files, state, checks, done, pending, tip, terminal: this.record.terminal,
      hints: this.mission.hints.slice(0, this.record.help),
      hintAvailable: this.record.help < this.mission.hints.length,
      colleagueAvailable: this.id === 'fast-forward' && !fixture.meta.refs.colleague,
      warning: this.warning, manual,
    };
  }

  async observe(fixture, args, result, before, state) {
    const observed = this.record.observed, [verb, ...rest] = args;
    if (result.code === 0) {
      if (['status', 'remote', 'reflog'].includes(verb)) observed[verb] = true;
      if (verb === 'diff') observed[rest.some(flag => ['--cached', '--staged'].includes(flag)) ? 'indexDiff' : 'workingDiff'] = true;
      observed.bothDiffs = !!(observed.indexDiff && observed.workingDiff);
      if (verb === 'log') observed.log = true;
      if (verb === 'show' && rest.some(ref => ref.endsWith(':README.md') && !ref.startsWith('HEAD:'))) observed.showPrior = true;
      observed.historyAndShow = !!(observed.log && observed.showPrior);
      if (verb === 'merge' && rest.includes('--abort') && before.operation === 'merge' && before.conflicts.length) observed.mergeAborted = true;
      if (verb === 'rebase' && rest.includes('--abort') && before.operation === 'rebase' && before.conflicts.length) observed.rebaseAborted = true;
      if (verb === 'fetch' && fixture.meta.refs.colleague && state.head === fixture.meta.base) {
        const tracking = await this.git.run(fixture.paths.work, ['rev-parse', 'refs/remotes/origin/main']);
        if (tracking.out.trim() === fixture.meta.refs.colleague) observed.fetchedAhead = true;
      }
      if (verb === 'stash' && (!rest.length || rest[0] === 'push') && before.working.length && !state.working.length) observed.stashed = true;
      if (observed.stashed && state.branch === 'hotfix') observed.stashAndHotfix = true;
    } else if (verb === 'push' && /fetch first|non-fast-forward|remote contains work/i.test(result.err)) observed.pushRejected = true;
  }

  async runCommand(fixture, raw) {
    if (typeof raw !== 'string' || !raw.trim()) return this.publicState(fixture);
    const work = fixture.paths.work;
    if (this.patch) {
      const { session } = this.patch;
      const result = await session.answer(raw.trim());
      this.log(raw.trim(), result.output, (result.code ?? 0) !== 0);
      if (!result.pending) this.patch = null;
      await this.persist();
      return this.publicState(fixture, { pending: result.pending });
    }
    let args;
    try { args = parseGit(raw, this.mission.files, fixture.meta.remote); }
    catch (error) {
      this.log(raw.slice(0, 1200), error.message, true);
      await this.persist();
      return this.publicState(fixture);
    }
    if (['fetch', 'pull', 'push'].includes(args[0])) await this.checkRemote(fixture);
    const before = await repoState(this.git, work);
    this.record.attempts++;
    if (args[0] === 'add' && args.some(flag => ['-p', '--patch'].includes(flag))) {
      const checks = await grade(this.git, fixture, this.mission, before, this.record.observed);
      const session = new PatchSession(this.git, work, args);
      const result = await session.read();
      if (result.pending) this.patch = { session, checks };
      this.log(raw, result.output, (result.code ?? 0) !== 0);
      await this.persist();
      return this.publicState(fixture, { pending: result.pending });
    }
    const result = await this.git.run(work, args);
    const state = await repoState(this.git, work);
    await this.observe(fixture, args, result, before, state);
    this.log(raw, [result.out.trimEnd(), result.err.trimEnd()].filter(Boolean).join('\n'), result.code !== 0);
    await this.persist();
    return this.publicState(fixture, { state, tip: responseTip(args, result, state) });
  }

  async checkRemote(fixture) {
    const { work, origin } = fixture.paths;
    await ownDirectory(origin);
    const fetch = await this.git.run(work, ['remote', 'get-url', '--all', 'origin']);
    const push = await this.git.run(work, ['remote', 'get-url', '--push', '--all', 'origin']);
    const local = result => result.code === 0 && !/[\r\n]/.test(result.out.trim()) &&
      path.resolve(work, result.out.trim().replace(/^\/([a-z]):\//i, '$1:/')).toLowerCase() === origin.toLowerCase();
    if (!local(fetch) || !local(push)) throw Error('Для цієї вправи потрібен її локальний origin. Спочатку перевір git remote -v.');
  }

  async action(input) {
    if (!input || typeof input.type !== 'string') throw Error('Невідома дія.');
    if (input.type === 'select' && !this.patch) {
      if (!byId.has(input.id)) throw Error('Вправу не знайдено.');
      this.doc.active = input.id;
      await this.persist();
    }
    if (input.type === 'reset') {
      this.patch?.session.close();
      this.patch = null;
      await this.startWorkspace(true);
    }
    const fixture = await this.fixture();
    if (input.type === 'run') return this.runCommand(fixture, input.command);
    if (this.patch && !['state', 'hint'].includes(input.type)) throw Error('Спочатку заверши вибір фрагментів через q або відповіді y/n.');
    switch (input.type) {
      case 'state':
      case 'select':
      case 'reset':
      case 'check':
        break;
      case 'hint':
        this.record.help = Math.min(this.record.help + 1, this.mission.hints.length);
        await this.persist();
        break;
      case 'save': {
        if (!this.mission.files.includes(input.file) || typeof input.text !== 'string' || Buffer.byteLength(input.text) > 24000 || input.text.includes('\0')) throw Error('Некоректний текст або файл вправи.');
        await readLocalFile(fixture.paths.work, input.file);
        await writeFile(path.join(fixture.paths.work, input.file), input.text.replace(/\r\n/g, '\n'));
        break;
      }
      case 'colleague': {
        if (this.id !== 'fast-forward' || fixture.meta.refs.colleague) throw Error('Зміна колеги вже доступна або не входить до цієї вправи.');
        const { paths, meta } = fixture;
        await ownDirectory(paths.colleague);
        await ownDirectory(paths.origin);
        meta.refs.colleague = await colleaguePush(this.git, paths);
        const next = paths.metaFile + '.tmp';
        await writeFile(next, JSON.stringify(meta));
        await rename(next, paths.metaFile);
        break;
      }
      default:
        throw Error('Невідома дія.');
    }
    return this.publicState(fixture, { pending: !!this.patch });
  }

  close() { this.patch?.session.close(); }
}
