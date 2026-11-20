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

export function labFiles(lesson: Lesson, useSolution = false): Record<string, string> {
  const lang = lesson.lab.language;
  const ts = lang !== 'js';
  const ext = lang === 'js' ? 'mjs' : lang;
  const testExt = ts ? 'ts' : 'mjs';
  const outputExt = ts ? 'js' : 'mjs';
  const reactTypes = lang === 'tsx' ? { '@types/react': '19.3.0', '@types/react-dom': '19.3.0' } : {};
  return {
    ...lesson.lab.files,
    [`exercise.${ext}`]: useSolution ? lesson.lab.solution : lesson.lab.starter,
    [`solution.${ext}`]: lesson.lab.solution,
    [`exercise.test.${testExt}`]: `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport * as subject from './exercise.${outputExt}';\n\n${lesson.lab.tests}\n`,
    'package.json': JSON.stringify({ name: lesson.id, private: true, type: 'module', engines: { node: '>=24' }, scripts: { test: ts ? 'tsc && node --test build/exercise.test.js' : 'node --test exercise.test.mjs' }, dependencies: labDependencies(lesson), ...(ts ? { devDependencies: { typescript: '5.9.3', '@types/node': '24.19.2', ...reactTypes } } : {}) }, null, 2),
    ...(ts ? { 'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', outDir: 'build', skipLibCheck: true, strict: true, experimentalDecorators: true, emitDecoratorMetadata: true, jsx: 'react-jsx', esModuleInterop: true }, include: ['*.ts', '*.tsx'] }, null, 2) } : {}),
    '.gitignore': 'node_modules/\nbuild/\n.env\n',
    'README.md': `# ${lesson.title}\n\n${lesson.task}\n\n## Запуск\n\nРекомендовано Node.js 26 LTS; лабораторна також перевірена на Node.js 24.20.0. Прямі залежності мають зафіксовані сумісні версії.\n\n\`\`\`sh\nnpm install\nnpm test\n\`\`\`\n\nПрацюй у exercise.${ext}. Початкові тести мають падати, поки не реалізовано вимоги. Файл solution.${ext} містить окремий еталон для розбору.\n\n## Кроки\n\n${lesson.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n## Критерії\n\n${lesson.criteria.map(s => `- [ ] ${s}`).join('\n')}\n\n## Самостійне поглиблення\n\n${lesson.extensions.map(s => `- ${s}`).join('\n')}\n\n${lesson.lab.instructions ?? ''}\n\n## Джерела\n\n${lesson.sources.map(s => `- [${s.title}](${s.url})`).join('\n')}\n`,
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
