import {dialogueKey, LUNA_INPUT_LIMIT, speakingBrief} from './dialogue';
import type {EnglishView, EnglishAttempt} from './types';

const escape = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

function turns(messages: {role:string;text:string}[]) {
  return messages.map(message => `<div class="en-dialogue-turn ${message.role==='user'?'en-dialogue-user':''}"><strong>${message.role==='user'?'You':'Luna'}</strong><p>${escape(message.text)}</p></div>`).join('');
}

export function savedDialogue(dialogue: EnglishAttempt['liveSpeaking']) {
  return dialogue ? `<details class="en-task-source"><summary>Speaking conversation</summary>${turns(dialogue.messages)}<p>${escape(dialogue.feedback)}</p></details>` : '';
}

export function renderLiveSpeaking(view: EnglishView, recordingKey: string) {
  const attempt=view.attempt!, dialogue=attempt.liveSpeaking;
  const brief=speakingBrief(view.lesson), key=dialogueKey(dialogue);
  const ready=dialogue?.status==='ready';
  const reviewPhrases=attempt.reviews.filter(item=>item.kind==='vocabulary'&&/^word-/.test(item.id)).map(item=>item.answer).filter(Boolean).slice(0,2);
  const hasLegacyDraft=['monologue','turn-0','turn-1','turn-2','retry'].some(k=>attempt.answers[k]?.trim());
  const canContinue=ready||view.canAdvance;
  const previousDrafts=hasLegacyDraft?`<details class="en-task-source"><summary>Earlier Speaking drafts</summary>${['monologue','turn-0','turn-1','turn-2','retry'].map(k=>attempt.answers[k]?`<blockquote>${escape(attempt.answers[k])}</blockquote>`:'').join('')}</details>`:'';
  return `<section class="en-live-speaking">
    <h2>Talk it through with Luna</h2>
    <p>${escape(brief.facts)}</p>
    <p><strong>Your goal</strong> ${escape(brief.goal)}</p>
    <div class="en-dialogue-log" role="log" aria-label="Speaking conversation">
      ${turns(dialogue?.messages||[{role:'assistant',text:brief.opening}])}
    </div>
    ${dialogue?.feedback?`<p class="en-dialogue-feedback" role="status"><strong>${ready?'✓ Goal reached':dialogue.status==='clarify'?'Clarify this point':'Feedback'}</strong> ${escape(dialogue.feedback)}</p>`:''}
    ${view.canAdvance&&!dialogue?'<p class="en-dialogue-feedback">✓ Your earlier Speaking work already counts. You can continue or try this conversation.</p>':''}
    ${!ready?`<div class="en-inline"><button class="button secondary" data-en-action="luna-say">Listen to Luna</button></div>
    <details class="en-dialogue-phrases"><summary>Ways to start your reply</summary><ul>${brief.phrases.map(phrase=>`<li>${escape(phrase)}</li>`).join('')}</ul>${reviewPhrases.length?`<p>Try reusing an earlier phrase if it fits: ${reviewPhrases.map(escape).join(' · ')}.</p>`:''}</details>
    <label for="en-live-reply">Your reply in English</label>
    <textarea id="en-live-reply" lang="en" rows="3" maxlength="${LUNA_INPUT_LIMIT}" data-en-answer="${key}" placeholder="Reply as you would to a colleague…">${escape(attempt.answers[key]?.startsWith('[Local audio recording')?'':attempt.answers[key]||'')}</textarea>
    <div class="en-inline en-dialogue-actions">
      <button class="button primary" data-en-action="dialogue">Send reply</button>
      <button class="button secondary" data-en-action="record" data-key="${key}">${recordingKey===key?'Stop recording':'Record reply'}</button>
      <button class="button secondary" data-en-action="dialogue-transcribe" hidden>Transcribe recording</button>
    </div>
    <div data-en-audio="${key}"></div><small>Type your answer or record it and review the transcript before sending.</small>`:''}
    ${canContinue&&ready?'<p>You can move on to Writing.</p>':''}
    ${previousDrafts}
  </section>`;
}
