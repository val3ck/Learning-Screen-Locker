import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { parseEnv } from 'node:util';

const aiVariables = [
  'OPENAI_API_KEY',
  'GROQ_API_KEY',
  'GEMINI_API_KEY',
  'OPENROUTER_API_KEY',
  'NODE_OPENAI_API_KEY',
];

export function readAiEnv(root, environment = process.env) {
  let file = {};
  try {
    file = parseEnv(readFileSync(path.join(root, '.env'), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Could not read Recall .env. Check the file format and permissions.');
  }
  const result = {};
  for (const variable of aiVariables) {
    const key = (environment[variable] || file[variable])?.trim();
    if (key) result[variable] = key;
  }
  return result;
}

export function recallStatisticsPath(localAppData = process.env.LOCALAPPDATA || path.join(homedir(), 'AppData', 'Local')) {
  return path.join(localAppData, 'SQL Recall', 'statistics');
}

