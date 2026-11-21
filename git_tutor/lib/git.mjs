import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { lstat, mkdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const executable = process.platform === 'win32' ? 'git.exe' : 'git';
const patchChoices = new Set(['y', 'n', 'q', 'a', 'd', 's', '?']);
const tokenPattern = /"([^"\r\n]*)"|'([^'\r\n]*)'|([^\s"';&|<>]+)/gy;
const branchName = /^(?:[a-z\d][a-z\d_-]*)(?:\/[a-z\d][a-z\d_-]*)*$/i;
const revision = /^(?:HEAD|ORIG_HEAD|[a-z\d][a-z\d_-]*(?:\/[a-z\d][a-z\d_-]*)*)(?:(?:[~^]\d*)|(?:@\{\d+\}))*$/i;

export function splitCommand(input) {
  if (typeof input !== 'string' || input.length > 1200 || /[\r\n\0]/.test(input)) throw Error('Введи одну коротку Git-команду.');
  const source = input.trim(), tokens = [];
  let pos = 0;
  while (pos < source.length) {
    tokenPattern.lastIndex = pos;
    const match = tokenPattern.exec(source);
    if (!match || (tokenPattern.lastIndex < source.length && !/\s/.test(source[tokenPattern.lastIndex]))) {
      throw Error('Введи одну Git-команду. Текст із пробілами візьми в лапки.');
    }
    tokens.push(match[1] ?? match[2] ?? match[3]);
    pos = tokenPattern.lastIndex;
    while (/\s/.test(source[pos] ?? '')) pos++;
  }
  if (tokens.length > 18 || tokens.shift()?.toLowerCase() !== 'git' || !tokens.length) throw Error('Почни з git, наприклад git status -sb.');
  return tokens;
}

const equal = (list, ...expected) => list.length === expected.length && list.every((item, i) => item === expected[i]);
const from = (list, allowed) => list.every(item => allowed.includes(item));
const withoutSeparator = (list) => list.filter(item => item !== '--');
const simpleRemote = (list) => list.length === 0 || list[0] === 'origin' && (list.length === 1 || list.length === 2 && branchName.test(list[1]));

export function parseGit(input, files, hasRemote) {
  const args = splitCommand(input), [verb, ...rest] = args;
  const known = file => files.includes(file);
  const rev = value => revision.test(value ?? '');
  const treeOrRev = value => {
    const [ref, file, tail] = value.split(':');
    return rev(ref) && (file === undefined || known(file) && tail === undefined);
  };
  const fileArgs = parts => from(withoutSeparator(parts), files) && parts.filter(item => item === '--').length <= 1;
  const valid = {
    init: () => !rest.length || equal(rest, '-b', 'main') || equal(rest, '--initial-branch=main'),
    status: () => from(rest, ['-s', '-b', '-sb', '-bs', '--short', '--branch']),
    add: () => {
      const paths = rest.filter(part => !['-p', '--patch', '-A', '--all', '--'].includes(part));
      return rest.length > 0 && from(paths, [...files, '.']) && rest.every(part => paths.includes(part) || ['-p', '--patch', '-A', '--all', '--'].includes(part));
    },
    diff: () => rest.every(part => ['--', '--staged', '--cached', '--stat', '--name-only'].includes(part) || known(part) || rev(part)),
    log: () => rest.every(part => /^-(?:[1-9]|1[0-9]|20)$/.test(part) || ['--oneline', '--graph', '--all', '--decorate'].includes(part) || rev(part)),
    show: () => rest.every(part => ['--stat', '--name-only', '--oneline'].includes(part) || treeOrRev(part)),
    commit: () => {
      for (let i = 0; i < rest.length; i++) {
        if (['--amend', '--no-edit', '-a', '--all'].includes(rest[i])) continue;
        if (!['-m', '-am', '-ma', '--message'].includes(rest[i]) || !rest[i + 1]?.trim() || rest[i + 1].length > 250) return false;
        i++;
      }
      return true;
    },
    switch: () => rest.length === 1 && branchName.test(rest[0]) || rest.length >= 2 && rest.length <= 3 && ['-c', '--create'].includes(rest[0]) && branchName.test(rest[1]) && (rest.length === 2 || rev(rest[2])),
    branch: () => !rest.length || equal(rest, '-a') || equal(rest, '-v') || equal(rest, '-vv') ||
      rest.length >= 1 && rest.length <= 2 && branchName.test(rest[0]) && (rest.length === 1 || rev(rest[1])),
    merge: () => equal(rest, '--abort') || equal(rest, '--continue') || rest.length === 1 && rev(rest[0]) ||
      rest.length === 2 && ['--no-ff', '--ff-only', '--no-edit'].includes(rest[0]) && rev(rest[1]),
    clone: () => hasRemote && equal(rest, '../origin.git', '.'),
    remote: () => !rest.length || equal(rest, '-v') || equal(rest, '--verbose'),
    fetch: () => hasRemote && simpleRemote(rest),
    pull: () => hasRemote && simpleRemote(rest[0] === '--ff-only' ? rest.slice(1) : rest),
    push: () => {
      const flags = ['-u', '--set-upstream'].includes(rest[0]);
      return hasRemote && simpleRemote(flags ? rest.slice(1) : rest) && (!flags || rest.length === 3);
    },
    rebase: () => equal(rest, '--abort') || equal(rest, '--continue') || rest.length === 1 && rev(rest[0]),
    restore: () => {
      const parts = [...rest];
      if (parts[0] === '--staged' || parts[0] === '-S') parts.shift();
      if (parts[0] === '--source' || parts[0] === '-s') {
        parts.shift();
        if (!rev(parts.shift())) return false;
      } else if (parts[0]?.startsWith('--source=')) {
        if (!rev(parts.shift().slice(9))) return false;
      }
      return withoutSeparator(parts).length > 0 && fileArgs(parts);
    },
    revert: () => rest.length === 1 && rev(rest[0]) || rest.length === 2 && rest[0] === '--no-edit' && rev(rest[1]),
    stash: () => !rest.length || ['list', 'pop', 'apply'].some(part => equal(rest, part)) ||
      equal(rest, 'push') || rest.length === 3 && rest[0] === 'push' && rest[1] === '-m' && rest[2].length <= 250 && !!rest[2].trim(),
    reflog: () => from(rest, ['show', '--oneline']),
  };
  if (!Object.hasOwn(valid, verb) || !valid[verb]()) {
    throw Error('Ця форма команди поза межами вправи. У F2 → Довідник є підтримані команди й прапорці.');
  }
  return args;
}

export async function ownDirectory(directory) {
  const stat = await lstat(directory);
  const actual = await realpath(directory);
  const normalize = value => process.platform === 'win32' ? value.toLowerCase() : value;
  if (stat.isSymbolicLink() || !stat.isDirectory() || normalize(actual) !== normalize(path.resolve(directory))) {
    throw Error('Навчальна папка має бути звичайним каталогом.');
  }
}

export async function dataRoot(directory) {
  const absolute = path.resolve(directory);
  await mkdir(absolute, { recursive: true });
  const info = await lstat(absolute);
  if (info.isSymbolicLink() || !info.isDirectory()) throw Error('Папка даних має бути звичайним каталогом.');
  return realpath(absolute);
}

export class Git {
  constructor(dataDirectory) {
    this.dataDirectory = dataDirectory;
    this.hooks = path.join(dataDirectory, 'disabled-hooks');
    this.config = path.join(dataDirectory, 'empty.gitconfig');
  }

  async prepare() {
    await mkdir(this.hooks, { recursive: true });
    try { await writeFile(this.config, '', { flag: constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }

  start(cwd, args, input = 'ignore') {
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(?:GIT_|SSH_|PAGER$|EDITOR$|VISUAL$)/i.test(key)));
    Object.assign(env, {
      LC_ALL: 'C', LANG: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: this.config,
      GIT_CEILING_DIRECTORIES: path.dirname(this.dataDirectory), GIT_ALLOW_PROTOCOL: 'file',
      GIT_TERMINAL_PROMPT: '0', GIT_EDITOR: ':', GIT_SEQUENCE_EDITOR: ':',
      GIT_MERGE_AUTOEDIT: 'no', GIT_PAGER: 'cat',
    });
    const settings = [
      'color.ui=false', 'core.autocrlf=false', 'core.longpaths=true', 'core.quotepath=false', 'commit.gpgsign=false',
      'tag.gpgsign=false', 'init.defaultBranch=main', 'pull.ff=only', 'push.default=simple',
      'user.name=Git Tutor', 'user.email=student@example.invalid', 'interactive.singleKey=false',
      'core.hooksPath=' + this.hooks,
    ];
    return spawn(executable, ['--no-pager', ...settings.flatMap(value => ['-c', value]), ...args], {
      cwd, env, shell: false, windowsHide: true, stdio: [input, 'pipe', 'pipe'],
    });
  }

  async run(cwd, args) {
    const process = this.start(cwd, args);
    let out = '', err = '';
    process.stdout.setEncoding('utf8').on('data', data => { if (out.length < 200000) out += data; });
    process.stderr.setEncoding('utf8').on('data', data => { if (err.length < 200000) err += data; });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => process.kill(), 10000);
      process.once('error', error => { clearTimeout(timer); reject(error); });
      process.once('close', (code) => {
        clearTimeout(timer);
        resolve({ code: code ?? 124, out, err: err || (code === null ? '\nGit перевищив час очікування.' : '') });
      });
    });
  }

  async must(cwd, ...args) {
    const result = await this.run(cwd, args);
    if (result.code) throw Error('Не вдалося підготувати вправу: git ' + args[0] + '\n' + result.err.trim());
    return result.out.trim();
  }
}

export class PatchSession {
  constructor(git, work, args) {
    this.child = git.start(work, args, 'pipe');
    this.buffer = '';
    this.cursor = 0;
    this.code = null;
    this.finished = false;
    const read = data => { if (this.buffer.length < 120000) this.buffer += data; };
    this.child.stdout.setEncoding('utf8').on('data', read);
    this.child.stderr.setEncoding('utf8').on('data', read);
    this.child.stdin.on('error', () => {});
    this.child.once('error', error => { read(error.message); this.finish(1); });
    this.child.once('close', code => this.finish(code ?? 124));
    this.timer = setTimeout(() => this.child.kill(), 10 * 60000);
    this.timer.unref();
  }

  finish(code) {
    clearTimeout(this.timer);
    this.finished = true;
    this.code = code;
  }

  async read() {
    const deadline = Date.now() + 8000;
    while (!this.finished && !/\[[^\]\r\n]*\?\]\?\s*$/.test(this.buffer.slice(this.cursor))) {
      if (Date.now() >= deadline) {
        this.child.kill();
        this.finish(124);
        this.buffer += '\nНе вдалося дочекатися інтерактивного запиту Git.';
        break;
      }
      await delay(25);
    }
    const output = this.buffer.slice(this.cursor);
    this.cursor = this.buffer.length;
    return { output, code: this.code, pending: !this.finished };
  }

  async answer(choice) {
    if (!patchChoices.has(choice)) throw Error('Введи y, n, q, a, d, s або ? для фрагмента.');
    if (!this.finished) this.child.stdin.write(choice + '\n');
    return this.read();
  }

  close() { if (!this.finished) this.child.kill(); }
}
