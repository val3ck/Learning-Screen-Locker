import {LUNA_MAX, LUNA_MIN, lunaPreferences, type LunaPreferences} from '../../shared/luna-chat';

export function localLunaPreferences(track: string, value?: LunaPreferences): LunaPreferences {
  const key = 'recall.luna.' + track;
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    return lunaPreferences(JSON.parse(localStorage.getItem(key) || 'null'));
  } catch { return lunaPreferences(value); }
}

export function lunaControls(prefs: LunaPreferences, onChange: (value: LunaPreferences) => void, onClear: () => void, onBtw: () => void, english = false) {
  const bar = document.createElement('div');
  bar.className = 'luna-controls';
  const label = document.createElement('label');
  label.textContent = english ? 'Context' : 'Контекст';
  const limit = document.createElement('select');
  for (let n = LUNA_MIN; n <= LUNA_MAX; n++) limit.add(new Option(String(n), String(n)));
  limit.value = String(prefs.limit);
  label.append(limit);
  const makeButton = (text: string, action: () => void) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.addEventListener('click', action);
    return button;
  };
  const minimal = makeButton(english ? 'Concise' : 'Стисло', () => {
    const active = minimal.getAttribute('aria-pressed') !== 'true';
    minimal.setAttribute('aria-pressed', String(active));
    onChange(lunaPreferences({limit: Number(limit.value), minimal: active}));
  });
  minimal.title = english ? 'Use the concise response style' : 'Стислі відповіді Luna';
  minimal.setAttribute('aria-pressed', String(prefs.minimal));
  limit.addEventListener('change', () => onChange(lunaPreferences({limit: Number(limit.value), minimal: minimal.getAttribute('aria-pressed') === 'true'})));
  const clear = makeButton(english ? 'Clear chat' : 'Очистити чат', onClear);
  clear.dataset.lunaClear = '';
  bar.append(makeButton('/btw', onBtw), label, clear, minimal);
  return bar;
}

export function showLunaBtw(card: HTMLElement, reply: {question:string;answer:string} | undefined) {
  card.hidden = !reply;
  card.replaceChildren();
  if (!reply) return;
  const heading = document.createElement('strong');
  heading.textContent = '/btw · ' + reply.question;
  const answer = document.createElement('div');
  answer.textContent = reply.answer;
  card.append(heading, answer);
}
