import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { isCodeAssessment, type CodeAssessment } from './node-code-review';

export function backendPathDataDir() {
  return process.env.BACKEND_PATH_DATA_DIR ||
    join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'Backend Path');
}

export class CodeReviewCache {
  private readonly directory: string;

  constructor(dataDir = backendPathDataDir()) {
    this.directory = join(dataDir, 'code-reviews-v2');
  }

  key(prompt: { system: string; user: string }, routing: unknown) {
    return createHash('sha256').update(JSON.stringify([prompt, routing])).digest('hex');
  }

  async read(key: string) {
    try {
      const response: unknown = JSON.parse(await readFile(join(this.directory, key + '.json'), 'utf8'));
      if (isCodeAssessment(response)) return { ...response, cached: true };
    } catch { /* A missing or damaged cache entry can be recomputed. */ }
    return undefined;
  }

  async save(key: string, result: CodeAssessment) {
    const file = join(this.directory, key + '.json');
    const temporary = file + '.' + randomUUID() + '.tmp';
    try {
      await mkdir(this.directory, { recursive: true });
      await writeFile(temporary, JSON.stringify(result), { flag: 'wx' });
      await rename(temporary, file);
      const files = (await readdir(this.directory)).filter(name => /^[a-f0-9]{64}\.json$/.test(name));
      if (files.length <= 160) return;
      const dated = await Promise.all(files.map(async name => {
        const path = join(this.directory, name);
        const info = await stat(path).catch(() => undefined);
        return { path, writtenAt: info?.mtimeMs ?? 0 };
      }));
      dated.sort((a, b) => b.writtenAt - a.writtenAt);
      await Promise.all(dated.slice(160).map(entry => rm(entry.path, { force: true })));
    } catch {
      // A cache write failure should not discard a successful review.
      await rm(temporary, { force: true }).catch(() => {});
    }
  }
}
