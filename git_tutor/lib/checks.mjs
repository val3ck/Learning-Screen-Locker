import { access, lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { README_COLLEAGUE, VALIDATION } from './course.mjs';

const exists = file => access(file).then(() => true, () => false);
const lines = text => text.trim().split(/\r?\n/).filter(Boolean);

export async function readLocalFile(work, file) {
  const target = path.join(work, file);
  const info = await lstat(target).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  if (!info) return null;
  if (!info.isFile() || info.isSymbolicLink() || info.size > 24000) throw Error('Файл вправи має бути звичайним текстовим файлом до 24 КБ.');
  return (await readFile(target, 'utf8')).replace(/\r\n/g, '\n');
}

export async function repoState(git, work) {
  const state = { repo: false, branch: null, head: null, upstream: null, index: [], working: [], untracked: [], conflicts: [], operation: null };
  if (!await exists(path.join(work, '.git'))) return state;
  const result = await git.run(work, ['status', '--porcelain=v2', '--branch', '-z']);
  if (result.code) throw Error('Не вдалося прочитати стан навчального Git: ' + result.err.trim());
  state.repo = true;
  const records = result.out.split('\0');
  for (let i = 0; i < records.length; i++) {
    const line = records[i];
    if (line.startsWith('# branch.head ')) state.branch = line.slice(14);
    else if (line.startsWith('# branch.oid ')) state.head = line.slice(13) === '(initial)' ? null : line.slice(13);
    else if (line.startsWith('# branch.upstream ')) state.upstream = line.slice(18);
    else if (line.startsWith('? ')) state.untracked.push(line.slice(2));
    else if (/^[12u] /.test(line)) {
      const name = line.split(' ').slice(line[0] === '2' ? 9 : line[0] === 'u' ? 10 : 8).join(' ');
      const [index, working] = line.slice(2, 4);
      if (line[0] === 'u') state.conflicts.push(name);
      else {
        if (index !== '.') state.index.push(name);
        if (working !== '.') state.working.push(name);
        if (line[0] === '2') i++;
      }
    }
  }
  const gitPath = file => path.join(work, '.git', file);
  if (await exists(gitPath('MERGE_HEAD'))) state.operation = 'merge';
  else if (await exists(gitPath('rebase-merge')) || await exists(gitPath('rebase-apply'))) state.operation = 'rebase';
  return state;
}

const sameSet = (a, b) => a.length === b.length && a.every(item => b.includes(item));
const clean = state => state.repo && !state.operation && !state.index.length && !state.working.length && !state.untracked.length && !state.conflicts.length;

export async function grade(git, fixture, mission, state, observed) {
  const { paths, meta } = fixture, { work, origin } = paths;
  const cache = new Map();
  const run = (args, cwd = work) => {
    const key = JSON.stringify([cwd, args]);
    if (!cache.has(key)) cache.set(key, git.run(cwd, args));
    return cache.get(key);
  };
  const out = async (args, cwd) => {
    const result = await run(args, cwd);
    return result.code === 0 ? result.out : null;
  };
  const ref = async (name, cwd) => (await out(['rev-parse', '--verify', name], cwd))?.trim() ?? null;
  const ancestor = async (commit, desc = 'HEAD') => !!commit && (await run(['merge-base', '--is-ancestor', commit, desc])).code === 0;
  const count = async (start) => {
    if (!start || !state.head) return null;
    const value = await out(['rev-list', '--count', start + '..HEAD']);
    return value === null ? null : Number(value.trim());
  };
  const content = async (revision, name, expected) => {
    if (revision === 'work') return await readLocalFile(work, name) === expected;
    const value = await out(['show', (revision === 'index' ? '' : revision) + ':' + name]);
    return value !== null && value.replace(/\r\n/g, '\n') === expected;
  };
  const changesIn = async (commit) => lines((await out(['diff-tree', '--no-commit-id', '--name-only', '-r', commit])) || '');

  const conditions = {
    branch: name => state.branch === name,
    untracked: name => state.untracked.includes(name),
    ignored: async name => (await run(['check-ignore', '--quiet', '--', name])).code === 0,
    staged: (...names) => sameSet(state.index, names) && !state.conflicts.length,
    observed: name => observed[name] === true,
    content,
    commitFiles: async (length, ...names) => await count(meta.base) === length && sameSet(await changesIn('HEAD'), names),
    commitCount: async expected => await count(meta.base) === expected,
    originalHead: () => state.head === meta.original && state.index.length === 0,
    clean: () => clean(state),
    baseRef: async name => !!meta.base && await ref(name) === meta.base,
    ancestors: async (...names) => (await Promise.all(names.map(name => ancestor(meta.refs[name])))).every(Boolean),
    upstream: name => state.upstream === name,
    remoteHead: async name => meta.remote && !!state.head && await ref('refs/heads/' + name, origin) === state.head,
    rebased: async () => !!meta.refs.colleague && !!state.head && state.head !== meta.refs.local && await ref('HEAD^') === meta.refs.colleague,
    remoteFiles: async () => (await Promise.all([content('HEAD', 'README.md', README_COLLEAGUE), content('HEAD', 'booking.js', VALIDATION)])).every(Boolean),
    amended: async () => !!state.head && state.head !== meta.refs.local && await count(meta.base) === 1 && clean(state),
    reverted: async () => await ancestor(meta.refs.bad) && await count(meta.refs.bad) === 1 && clean(state),
    stashEmpty: async () => (await out(['stash', 'list']))?.trim() === '',
    lostRef: async () => !!meta.refs.lost && await ref('refs/heads/rescue') === meta.refs.lost,
    subject: async () => {
      if (!state.head || state.head === meta.base) return false;
      const text = (await out(['log', '-1', '--format=%s']))?.trim() || '';
      return text.length >= 10 && text.split(/\s+/).length >= 2 && !/^(update|fix|changes|test|wip|commit|оновлення|зміни)([\s.!]+[0-9]+)?[.!]*$/i.test(text);
    },
    splitCommits: async () => {
      if (!meta.base || !state.head) return false;
      const revisions = lines((await out(['rev-list', '--reverse', meta.base + '..HEAD'])) || '');
      if (revisions.length !== 2) return false;
      return sameSet(await changesIn(revisions[0]), ['booking.js']) &&
        sameSet(await changesIn(revisions[1]), ['booking.js']) && await content(revisions[0], 'booking.js', VALIDATION);
    },
  };
  const checks = await Promise.all(mission.checks.map(async ({ label, type, args }) => ({
    label, done: !!await conditions[type](...args),
  })));
  return checks;
}
