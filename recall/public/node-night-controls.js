'use strict';
const api = window.nightControls;
const description = document.querySelector('#description');
const message = document.querySelector('#message');
async function action(work) {
  message.hidden = true;
  try { await work(); }
  catch (error) {
    message.hidden = false;
    message.textContent = error.message.replace(/^Error invoking remote method .*?: Error: /, '');
  }
}
function settings(state) {
  description.textContent = state.separateKey
    ? 'Збережено окремий ключ. Запити використовують квоту цього ключа.'
    : state.sharedConfigured ? 'Підключено ключ English і спільний локальний лічильник.' : 'Ключ English недоступний. Введи окремий ключ за потреби.';
}
void action(async () => {
  const state = await api.state();
  if (document.body.dataset.screen === 'invitation') {
    description.textContent = 'Продовжити Backend Path · до '+state.durationMinutes+' хв';
    if (state.demo) {
      description.textContent = 'Демо · до '+state.durationMinutes+' хв · без вимкнення ПК';
      document.querySelector('#sleep').textContent = 'Спати · демо';
    }
    document.querySelector('#learn').onclick = () => void action(() => api.choose('learn'));
    const secondary=document.querySelector('#sleep');
    if(!state.canSleep)secondary.textContent='Пропустити';
    secondary.onclick = () => void action(() => api.choose(state.canSleep?'sleep':'dismiss'));
    return;
  }
  settings(state);
  const save = shared => action(async () => {
    const key = document.querySelector('#key');
    settings(await api.save({key: shared ? '' : key.value, shared}));
    key.value = '';
    message.textContent = 'Збережено.';
    message.hidden = false;
  });
  document.querySelector('#settings').onsubmit = event => { event.preventDefault(); void save(false); };
  document.querySelector('#shared').onclick = () => void save(true);
  document.querySelector('#course').onclick = () => void action(() => api.openCourse());
  document.querySelector('#preview').onclick = () => void action(() => api.preview());
});
