import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  BOOKING, BOTH, README, README_BAD, README_COLLEAGUE, README_CURRENT, README_FEATURE, README_MAIN, VALIDATION,
} from './course.mjs';

export const fixturePaths = (directory) => ({
  directory, work: path.join(directory, 'work'), origin: path.join(directory, 'origin.git'),
  colleague: path.join(directory, 'colleague'), metaFile: path.join(directory, 'fixture.json'),
});

const write = (folder, file, text) => writeFile(path.join(folder, file), text);

async function commit(git, directory, file, contents, message) {
  await write(directory, file, contents);
  await git.must(directory, 'add', '--', file);
  await git.must(directory, 'commit', '-m', message);
  return git.must(directory, 'rev-parse', 'HEAD');
}

async function createRemote(git, paths) {
  await git.must(paths.directory, 'init', '--bare', '-b', 'main', 'origin.git');
  await git.must(paths.work, 'remote', 'add', 'origin', '../origin.git');
  await git.must(paths.work, 'push', '-u', 'origin', 'main');
}

async function makeColleague(git, paths) {
  await mkdir(paths.colleague);
  await git.must(paths.colleague, 'clone', '../origin.git', '.');
  await git.must(paths.colleague, 'remote', 'set-url', 'origin', '../origin.git');
}

export async function colleaguePush(git, paths, conflict = false) {
  const contents = conflict ? README_MAIN : README_COLLEAGUE;
  const head = await git.run(paths.colleague, ['show', 'HEAD:README.md']);
  const result = head.out.replace(/\r\n/g, '\n') === contents
    ? await git.must(paths.colleague, 'rev-parse', 'HEAD')
    : await commit(git, paths.colleague, 'README.md', contents, 'Update booking notes');
  await git.must(paths.colleague, 'push', 'origin', 'main');
  return result;
}

async function setup(git, paths, id) {
  const meta = { version: 1, id, base: null, original: null, remote: false, refs: {} };
  await mkdir(paths.work);
  if (id === 'init') {
    await write(paths.work, 'README.md', README);
    return meta;
  }
  await git.must(paths.work, 'init', '-b', 'main');
  await write(paths.work, 'README.md', README);
  await write(paths.work, 'booking.js', BOOKING);
  if (id === 'final-commits') await write(paths.work, '.gitignore', '.env\n');
  await git.must(paths.work, 'add', '.');
  await git.must(paths.work, 'commit', '-m', 'Create booking example');
  meta.base = await git.must(paths.work, 'rev-parse', 'HEAD');

  switch (id) {
    case 'select':
      await write(paths.work, '.gitignore', '');
      await write(paths.work, '.env', 'DEMO_API_KEY=training-only\n');
      await write(paths.work, 'feature.txt', 'Validate the booking request.\n');
      await write(paths.work, 'notes.txt', 'Local scratch notes.\n');
      break;
    case 'first-commit':
    case 'final-commits':
      await write(paths.work, 'booking.js', id === 'first-commit' ? VALIDATION : BOTH);
      await write(paths.work, 'notes.txt', 'Questions for later.\n');
      if (id === 'final-commits') await write(paths.work, '.env', 'DEMO_API_KEY=training-only\n');
      break;
    case 'changes':
      await write(paths.work, 'README.md', README_CURRENT);
      await git.must(paths.work, 'add', 'README.md');
      await write(paths.work, 'booking.js', VALIDATION);
      break;
    case 'hunks':
      await write(paths.work, 'booking.js', BOTH);
      break;
    case 'history':
      await commit(git, paths.work, 'README.md', README_CURRENT, 'Rename the booking project');
      await commit(git, paths.work, 'booking.js', VALIDATION, 'Require a booking email');
      break;
    case 'branch':
      await write(paths.work, 'booking.js', VALIDATION);
      break;
    case 'merge':
    case 'abort-merge': {
      const conflict = id === 'abort-merge';
      await git.must(paths.work, 'switch', '-c', 'feature/validation');
      meta.refs.feature = conflict
        ? await commit(git, paths.work, 'README.md', README_FEATURE, 'Use feature booking heading')
        : await commit(git, paths.work, 'booking.js', VALIDATION, 'Require a booking email');
      await git.must(paths.work, 'switch', 'main');
      meta.refs.mainTip = await commit(git, paths.work, 'README.md', conflict ? README_MAIN : README_CURRENT, 'Update booking overview');
      break;
    }
    case 'clone':
    case 'upstream':
    case 'fast-forward':
    case 'rejected':
    case 'rebase-conflict':
    case 'shared-history':
    case 'final-remote':
    case 'revert':
      await createRemote(git, paths);
      meta.remote = true;
      if (id === 'clone') {
        await rename(paths.work, path.join(paths.directory, 'seed'));
        await mkdir(paths.work);
        return meta;
      }
      if (id === 'upstream') await git.must(paths.work, 'switch', '-c', 'feature/validation');
      if (['fast-forward', 'rejected', 'rebase-conflict', 'shared-history', 'final-remote'].includes(id)) {
        await makeColleague(git, paths);
        if (id !== 'fast-forward') meta.refs.colleague = await colleaguePush(git, paths, id === 'rebase-conflict');
      }
      if (['upstream', 'rejected', 'shared-history', 'final-remote'].includes(id)) {
        meta.refs.local = await commit(git, paths.work, 'booking.js', VALIDATION, 'Require a booking email');
      }
      if (id === 'rebase-conflict') {
        meta.refs.local = await commit(git, paths.work, 'README.md', README_FEATURE, 'Use feature booking heading');
      }
      if (id === 'shared-history') await git.must(paths.work, 'push', 'origin', 'HEAD:refs/heads/collab');
      if (id === 'revert') {
        meta.refs.bad = await commit(git, paths.work, 'README.md', README_BAD, 'Disable bookings');
        await git.must(paths.work, 'push', 'origin', 'main');
      }
      break;
    case 'restore':
      await write(paths.work, 'booking.js', VALIDATION);
      await git.must(paths.work, 'add', 'booking.js');
      await write(paths.work, 'booking.js', BOTH);
      await write(paths.work, 'README.md', README_BAD);
      break;
    case 'amend':
      meta.refs.local = await commit(git, paths.work, 'booking.js', VALIDATION, 'Update');
      await write(paths.work, 'README.md', README_CURRENT);
      break;
    case 'stash':
      await git.must(paths.work, 'branch', 'hotfix');
      await write(paths.work, 'booking.js', VALIDATION);
      break;
    case 'reflog':
      await git.must(paths.work, 'switch', '-c', 'temporary');
      meta.refs.lost = await commit(git, paths.work, 'booking.js', VALIDATION, 'Require a booking email');
      await git.must(paths.work, 'switch', 'main');
      await git.must(paths.work, 'branch', '-D', 'temporary');
      break;
    default:
      throw Error('Невідома навчальна вправа.');
  }
  meta.original = await git.must(paths.work, 'rev-parse', 'HEAD');
  return meta;
}

function safeFixturePath(parent, candidate) {
  return path.dirname(path.resolve(candidate)) === path.resolve(parent);
}

export async function createFixture(git, workspaces, id, target) {
  if (!safeFixturePath(workspaces, target)) throw Error('Некоректний шлях вправи.');
  const scratch = await mkdtemp(path.join(workspaces, '.setup-'));
  try {
    const meta = await setup(git, fixturePaths(scratch), id);
    await writeFile(fixturePaths(scratch).metaFile, JSON.stringify(meta));
    await rename(scratch, target);
  } catch (error) {
    if (safeFixturePath(workspaces, scratch)) await rm(scratch, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

export async function loadFixture(directory, id) {
  const paths = fixturePaths(directory);
  const meta = JSON.parse(await readFile(paths.metaFile, 'utf8'));
  if (meta.version !== 1 || meta.id !== id || !meta.refs || typeof meta.remote !== 'boolean') throw Error('Дані вправи пошкоджено. Почни її заново через «Скинути вправу».');
  return { paths, meta };
}
