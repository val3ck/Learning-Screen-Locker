const api = window.recallTutorChat;

export function tutorChat(context) {
  if (!api) return null;

  const root = document.createElement('section');
  root.className = 'tutor-luna';
  root.setAttribute('aria-label', 'Luna');
  root.innerHTML = `
    <h2>Luna</h2>
    <div class="tutor-luna-log" role="log"></div>
    <aside class="tutor-luna-side" aria-label="Побічне запитання" hidden></aside>
    <form>
      <label>Твоє запитання<textarea rows="3" maxlength="1400" placeholder="Що робить ця команда?"></textarea></label>
      <div class="tutor-luna-actions">
        <button type="button" data-chat="btw">/btw</button>
        <label>Контекст <select aria-label="Кількість повідомлень у контексті"></select></label>
        <button type="button" data-chat="clear">Очистити чат</button>
        <button type="button" data-chat="minimal" title="Стислі відповіді Luna" aria-pressed="true">Стисло</button>
        <button type="submit">Запитати</button>
      </div>
      <p class="tutor-luna-status" role="status"></p>
    </form>`;

  const form = root.querySelector('form');
  const input = form.querySelector('textarea');
  const limit = form.querySelector('select');
  const concise = form.querySelector('[data-chat="minimal"]');
  const clear = form.querySelector('[data-chat="clear"]');
  const send = form.querySelector('[type="submit"]');
  const log = root.querySelector('.tutor-luna-log');
  const side = root.querySelector('.tutor-luna-side');
  const status = root.querySelector('[role="status"]');
  for (let n = 5; n <= 20; n++) limit.add(new Option(String(n), String(n)));
  let prefs = {limit: 5, minimal: true};
  let messages = [], scope = '', pending = false, savedOnce = false;
  limit.value = String(prefs.limit);

  function showLog() {
    log.replaceChildren(...messages.slice(-prefs.limit).map(turn => {
      const row = document.createElement('div'), label = document.createElement('strong'), answer = document.createElement('p');
      label.textContent = turn.role === 'user' ? 'Ти' : 'Luna';
      answer.textContent = turn.text;
      row.append(label, answer);
      return row;
    }));
    log.hidden = !messages.length;
    log.scrollTop = log.scrollHeight;
  }

  function apply(next) {
    prefs = next;
    limit.value = String(prefs.limit);
    concise.setAttribute('aria-pressed', String(prefs.minimal));
    showLog();
  }

  let saving = Promise.resolve();
  function save(next) {
    savedOnce = true;
    apply(next);
    saving = saving.then(() => api.preferences(next)).catch(() => {status.textContent = 'Налаштування чату не збережено.';});
  }
  api.preferences().then(next => {if (!savedOnce) apply(next);}).catch(() => {});
  limit.addEventListener('change', () => save({...prefs, limit: Number(limit.value)}));
  concise.addEventListener('click', () => save({...prefs, minimal: !prefs.minimal}));

  function reset() {
    messages = [];
    input.value = '';
    side.hidden = true;
    side.replaceChildren();
    status.textContent = '';
    showLog();
  }
  clear.addEventListener('click', () => {reset();input.focus();});
  const prefix = /^\/(?:btw|бтв)(?=\s|$)/iu;
  root.querySelector('[data-chat="btw"]').addEventListener('click', () => {
    input.value = '/btw ' + input.value.replace(prefix, '').trimStart();
    input.focus();
  });
  function refresh() {
    const current = context();
    if (scope !== current.id) {scope = current.id;reset();}
    return current;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const current = refresh();
    const question = input.value.trim();
    if (!question || pending) return;
    const requestedScope = scope;
    const isBtw = prefix.test(question);
    send.disabled = clear.disabled = pending = true;
    input.readOnly = true;
    status.textContent = 'Чекаємо на відповідь…';
    try {
      const reply = await api.ask({question,context:current.text.slice(0,5000),
        luna:{...prefs,history:isBtw?[]:messages.slice(1-prefs.limit).map(turn=>({...turn,text:turn.text.slice(0,450)}))}});
      if (requestedScope !== scope) return;
      if (isBtw) {
        const title = document.createElement('strong'), answer = document.createElement('p');
        title.textContent = question;
        answer.textContent = reply.answer;
        side.replaceChildren(title, answer);
        side.hidden = false;
      } else {
        messages = [...messages,{role:'user', text:question},{role:'assistant', text:reply.answer}].slice(-20);
        showLog();
      }
      input.value = '';
      status.textContent = '';
    } catch (error) {
      if (requestedScope === scope) status.textContent = error.message.replace(/^Error invoking remote method .*?: Error: /, '');
    } finally {
      send.disabled = clear.disabled = pending = false;
      input.readOnly = false;
    }
  });
  return {root, refresh};
}
