import { zipSync, strToU8 } from 'fflate';
import type { Lesson } from '../content/schema';

const pinnedLabDependencies: Record<string, string> = {
  '@electric-sql/pglite': '0.3.16',
  '@nestjs/common': '11.2.9',
  '@nestjs/core': '11.2.9',
  '@nestjs/platform-express': '11.2.9',
  '@nestjs/testing': '11.2.9',
  'class-transformer': '0.5.1',
  'class-validator': '0.15.1',
  express: '5.3.0',
  jose: '6.2.17',
  'react-dom': '19.2.0',
  react: '19.2.0',
  'reflect-metadata': '0.2.2',
  rxjs: '7.8.2',
  supertest: '7.3.2',
  zod: '4.6.7',
};

function labDependencies(lesson: Lesson) {
  return Object.fromEntries(Object.keys(lesson.lab.dependencies ?? {}).map(name => {
    const version = pinnedLabDependencies[name];
    if (!version) throw new Error(`No pinned lab version for ${name}`);
    return [name, version];
  }));
}

export function learnerWritesTests(lesson: Lesson) {
  return lesson.moduleId !== 'setup';
}

export function labTestCases(lesson: Lesson) {
  return lesson.lab.testCases ?? ['Перевір один звичайний випадок з умови.', 'Додай один граничний випадок або помилку з критеріїв.'];
}

const testRunner = `import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', process.argv[2]], { encoding: 'utf8' });
process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
if (result.error) throw result.error;
if (result.status !== 0) process.exitCode = result.status ?? 1;
else if (Number((result.stdout ?? '').match(/^# pass (\\d+)$/m)?.[1] ?? 0) < 2) {
  console.error('Напиши й запусти щонайменше два власні тести. Порожній файл і TODO не зараховуються.');
  process.exitCode = 1;
}
`;

export function labFiles(lesson: Lesson, mode: 'download' | 'check-starter' | 'check-reference' = 'download'): Record<string, string> {
  const lang = lesson.lab.language;
  const ts = lang !== 'js';
  const ext = !ts && !learnerWritesTests(lesson) ? 'mjs' : lang;
  const testExt = ts ? 'ts' : ext;
  const outputExt = ts ? 'js' : ext;
  const testPath = ts ? 'build/exercise.test.js' : `exercise.test.${testExt}`;
  const ownTests = mode === 'download' && learnerWritesTests(lesson);
  const testBody = ownTests ? '// Напиши власні імпорти та тести. Сценарії є в README.\n' :
    `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport * as subject from './exercise.${outputExt}';\n\n${lesson.lab.tests}\n`;
  const reactTypes = lang === 'tsx' ? { '@types/react': '19.3.0', '@types/react-dom': '19.3.0' } : {};
  return {
    ...lesson.lab.files,
    [`exercise.${ext}`]: mode === 'check-reference' ? lesson.lab.solution : lesson.lab.starter,
    [`exercise.test.${testExt}`]: testBody,
    ...(ownTests ? { 'run-tests.js': testRunner } : {}),
    'package.json': JSON.stringify({ name: lesson.id, private: true, type: 'module', engines: { node: '>=24' }, scripts: { test: `${ts ? 'tsc && ' : ''}${ownTests ? 'node run-tests.js' : 'node --test'} ${testPath}` }, dependencies: labDependencies(lesson), ...(ts ? { devDependencies: { typescript: '5.9.3', '@types/node': '24.19.2', ...reactTypes } } : {}) }, null, 2),
    ...(ts ? { 'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', outDir: 'build', skipLibCheck: true, strict: true, experimentalDecorators: true, emitDecoratorMetadata: true, jsx: 'react-jsx', esModuleInterop: true }, include: ['*.ts', '*.tsx'] }, null, 2) } : {}),
    '.gitignore': 'node_modules/\nbuild/\n.env\n',
    'README.md': `# ${lesson.title}\n\n${lesson.task}\n\n## Запуск\n\n\`\`\`sh\n${ts || Object.keys(lesson.lab.dependencies ?? {}).length ? 'npm install\n' : ''}npm test\n\`\`\`\n\nПрацюй у exercise.${lang}.\n\n## Кроки\n\n${lesson.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${ownTests ? `## Власні тести\n\nВідкрий \`exercise.test.${testExt}\`. Самостійно імпортуй \`node:test\`, \`node:assert/strict\` і потрібну функцію. Для локального імпорту використовуй \`./exercise.js\`. Напиши щонайменше два тести. Запусти один до реалізації, щоб побачити причину падіння.\n\n${labTestCases(lesson).map(text => `- ${text}`).join('\n')}\n\n` : ''}## Критерії\n\n${lesson.criteria.map(s => `- [ ] ${s}`).join('\n')}\n\n${lesson.lab.refactor ? `## Рефакторинг\n\n\`${lesson.lab.refactor.file}\`. ${lesson.lab.refactor.goal}\n\n` : ''}## Самостійне поглиблення\n\n${lesson.extensions.map(s => `- ${s}`).join('\n')}\n\n${lesson.lab.instructions ?? ''}\n\n## Джерела\n\n${lesson.sources.map(s => `- [${s.title}](${s.url})`).join('\n')}\n`,
  };
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadLab(lesson: Lesson) {
  const files = Object.fromEntries(Object.entries(labFiles(lesson)).map(([name, body]) => [`${lesson.id}/${name}`, strToU8(body)]));
  downloadBlob(new Blob([zipSync(files) as BlobPart], { type: 'application/zip' }), `${lesson.id}.zip`);
}
