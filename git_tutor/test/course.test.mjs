import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { README_COMBINED, VALIDATION, course } from '../lib/course.mjs';
import { parseGit } from '../lib/git.mjs';
import { Tutor } from '../lib/tutor.mjs';
import { startServer } from '../server.mjs';

const command = text => ({ type: 'run', command: text });
const edit = (file, text) => ({ type: 'save', file, text });
const actions = (...steps) => steps.map(step => typeof step === 'string' ? command(step) : step);
const scripts = {
  init: actions('git init', 'git status --short --branch'),
  select: actions(edit('.gitignore', '.env\n'), 'git add .gitignore feature.txt'),
  'first-commit': actions('git commit -am "Require a booking email"'),
  changes: actions('git diff', 'git diff --cached', 'git restore --staged README.md', 'git add booking.js'),
  hunks: actions('git add -p booking.js', 'y', 'n'),
  history: actions('git log --oneline', 'git show HEAD~2:README.md', 'git restore -s HEAD~2 -- README.md'),
  branch: actions('git switch -c feature/validation', 'git add booking.js', 'git commit -m "Require a booking email"'),
  merge: actions('git merge feature/validation'),
  'abort-merge': actions('git merge feature/validation', 'git merge --abort', 'git merge feature/validation', edit('README.md', README_COMBINED), 'git add README.md', 'git commit --no-edit'),
  clone: actions('git clone ../origin.git .', 'git remote -v'),
  upstream: actions('git push --set-upstream origin feature/validation'),
  'fast-forward': actions({ type: 'colleague' }, 'git fetch', 'git pull --ff-only'),
  rejected: actions('git push', 'git fetch', 'git rebase origin/main', 'git push'),
  'rebase-conflict': actions('git fetch', 'git rebase origin/main', 'git rebase --abort', 'git rebase origin/main', edit('README.md', README_COMBINED), 'git add README.md', 'git rebase --continue'),
  'shared-history': actions('git fetch', 'git merge origin/main', 'git push'),
  restore: actions('git restore --staged booking.js', 'git restore -- README.md'),
  amend: actions('git add README.md', 'git commit --amend -m "Document booking email validation"'),
  revert: actions('git revert --no-edit HEAD', 'git push'),
  'final-commits': actions('git add -p booking.js', 'y', 'n', 'git commit -m "Require a booking email"', 'git add booking.js', 'git commit -m "Log saved bookings"'),
  'final-remote': actions('git fetch', 'git merge origin/main', 'git push'),
  stash: actions('git stash push -m "Booking draft"', 'git switch hotfix', 'git switch main', 'git stash pop'),
  reflog: actions('git reflog', 'git branch rescue HEAD@{1}'),
};

async function temporary(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'гіт-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test('All 22 exercises are achievable with real Git', { timeout: 160000 }, async t => {
  const tutor = await Tutor.open(await temporary(t));
  t.after(() => tutor.close());
  assert.equal(course.length, 22);
  for (const { id } of course) {
    await t.test(id, async () => {
      let view = await tutor.action({ type: 'select', id });
      assert.equal(view.done, false);
      for (const input of scripts[id]) {
        view = await tutor.action(input);
        if (input.command?.includes('add -p')) assert.equal(view.pending, true, view.terminal.at(-1)?.output);
        if (id === 'rejected' && input.command === 'git push' && !view.done) assert.match(view.tip, /origin/);
      }
      assert.equal(view.done, true, JSON.stringify({ checks: view.checks, terminal: view.terminal.slice(-3) }));
      assert.equal(view.chapters.flatMap(group => group.items).find(item => item.id === id)?.complete, true);
    });
  }
});

test('Review resumes a real merge conflict and resetting preserves other exercises and saved progress', async t => {
  const directory = await temporary(t);
  let tutor = await Tutor.open(directory);
  await tutor.action(command('git init -b main'));
  await tutor.action(command('git status -sb'));
  await tutor.action({ type: 'select', id: 'abort-merge' });
  let view = await tutor.action(command('git merge feature/validation'));
  assert.equal(view.state.operation, 'merge');
  assert.deepEqual(view.state.conflicts, ['README.md']);
  tutor.close();
  tutor = await Tutor.open(directory);
  t.after(() => tutor.close());
  view = await tutor.action({ type: 'state' });
  assert.equal(view.mission.id, 'abort-merge');
  assert.match(view.files.find(file => file.name === 'README.md').text, /<<<<<<< HEAD/);
  assert.equal(view.state.operation, 'merge');
  view = await tutor.action({ type: 'reset' });
  assert.equal(view.state.operation, null);
  assert.equal(view.chapters[0].items[0].complete, true);
  const backup = JSON.parse(await readFile(path.join(directory, 'progress.json.bak'), 'utf8'));
  assert.ok(backup.missions.init.completed);
  await writeFile(path.join(directory, 'progress.json'), 'corrupt');
  tutor = await Tutor.open(directory);
  view = await tutor.action({ type: 'state' });
  assert.match(view.warning, /резервної копії/);
  assert.equal(view.state.operation, 'merge');
});

test('The command gate refuses shell commands, arbitrary Git options, outside paths and network remotes', () => {
  const files = ['README.md', 'booking.js'];
  for (const text of [
    'dir', 'git -C C:/Users status', 'git status; whoami', 'git add ../README.md', 'git add C:/README.md',
    'git clone https://example.invalid/repo .', 'git fetch https://example.invalid/repo',
    'git push origin HEAD:main', 'git push --force', 'git config core.hooksPath ..',
    'git diff --output=../a', 'git restore -- ../README.md',
  ]) assert.throws(() => parseGit(text, files, true), text);
  assert.deepEqual(parseGit('git commit -m "Use Київ timezone"', files, true), ['commit', '-m', 'Use Київ timezone']);
  assert.deepEqual(parseGit('git diff --cached -- booking.js', files, true), ['diff', '--cached', '--', 'booking.js']);
});

test('The loopback server requires the browser origin and launch token', async t => {
  const app = await startServer({ directory: await temporary(t) });
  t.after(() => app.close());
  const input = { method: 'POST', body: JSON.stringify({ type: 'state' }) };
  const good = { Origin: app.origin, 'X-Git-Tutor-Token': app.token, 'Content-Type': 'application/json' };
  assert.equal((await fetch(app.origin)).status, 200);
  assert.equal((await fetch(app.origin + '/api', { ...input, headers: { ...good, Origin: 'http://example.invalid' } })).status, 403);
  assert.equal((await fetch(app.origin + '/api', { ...input, headers: { ...good, 'X-Git-Tutor-Token': '' } })).status, 403);
  const view = await (await fetch(app.origin + '/api', { ...input, headers: good })).json();
  assert.equal(view.mission.id, 'init');
  const save = async file => fetch(app.origin + '/api', {
    method: 'POST', headers: good, body: JSON.stringify(edit(file, VALIDATION)),
  });
  assert.equal((await save('../README.md')).status, 400);
  assert.equal((await save('.git/config')).status, 400);
});
