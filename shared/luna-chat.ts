export const LUNA_MIN = 5;
export const LUNA_MAX = 20;
export const LUNA_PROVIDERS = ['openai', 'groq', 'gemini', 'openrouter'] as const;
export type LunaProvider = typeof LUNA_PROVIDERS[number];
export type LunaModel = {provider: LunaProvider; model: string};
export type LunaTurn = {role: 'user' | 'assistant'; text: string};
export type LunaPreferences = {limit: number; minimal: boolean};
export type LunaOptions = LunaPreferences & {history: LunaTurn[]};

export function lunaPreferences(input: unknown): LunaPreferences {
  const value = input as Partial<LunaPreferences> | undefined;
  const limit = Number.isInteger(value?.limit) ? value!.limit! : LUNA_MIN;
  return {limit: Math.min(LUNA_MAX, Math.max(LUNA_MIN, limit)), minimal: value?.minimal !== false};
}

export function lunaOptions(input: unknown): LunaOptions {
  const prefs = lunaPreferences(input);
  const history = (input as Partial<LunaOptions> | undefined)?.history;
  return {...prefs, history: Array.isArray(history) ? history.slice(1 - prefs.limit).flatMap(turn =>
    turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.text === 'string'
      ? [{role: turn.role, text: turn.text.slice(0, 450)}] : []
  ) : []};
}

export function lunaQuestion(raw: string, fallback: string) {
  const text = raw.trim();
  const command = /^\/(?:btw|бтв)(?=\s|$)/iu.exec(text);
  return {btw: !!command, question: command ? text.slice(command[0].length).trim() || fallback : text};
}

export function lunaModel(input: unknown): LunaModel | undefined {
  const value = input as Partial<LunaModel> | undefined;
  if (!value?.provider || !LUNA_PROVIDERS.includes(value.provider) || typeof value.model !== 'string') return;
  if (!/^[a-z0-9][a-z0-9_.:@/-]{0,119}$/i.test(value.model)) return;
  return {provider: value.provider, model: value.model};
}

export function forLunaModel<T extends {models: Record<string, string>}>(config: T, choice?: LunaModel): T {
  return choice ? {
    ...config,
    models: {...config.models, [choice.provider]: choice.model},
    order: [choice.provider],
    automaticFallback: false,
  } : config;
}

export function cleanLunaText(text: string, limit: number, keys: string[] = []) {
  for (const key of keys) if (key) text = text.split(key).join('[secret removed]');
  return text.replace(/\b(?:sk-[\w-]{12,}|gsk_[\w-]{12,}|AIza[\w-]{20,})\b|\bBearer\s+[^\s,;]+/gi, '[secret removed]').trim().slice(0, limit);
}
