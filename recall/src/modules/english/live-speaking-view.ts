import {
  canWrapSpeaking,dialogueKey,SPEAKING_INPUT_LIMIT,speakingBrief,speakingDone,speakingQuestion,
  SPEAKING_MAX_REPLIES,SPEAKING_RECAP_KEYS,
  type SpeakingDialogue, type SpeakingMessage,
} from './dialogue';
import type {EnglishView, EnglishAttempt} from './types';

const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

function turn(message:SpeakingMessage){
  const review=message.review;
  let offset=0;
  const segments=review?.corrections.map(fix=>{
    const prefix=message.text.slice(offset,fix.start);
    offset=fix.end;
    return escape(prefix)+`<mark class="en-speaking-error" title="${escape(fix.explanation)}">${escape(message.text.slice(fix.start,fix.end))}</mark>`;
  }).join('')||'';
  const details=review?.corrections.length?`<ul class="en-speaking-fixes">${review.corrections.map(fix=>
    `<li><del>${escape(message.text.slice(fix.start,fix.end))}</del> → <ins>${fix.replacement?escape(fix.replacement):'Remove this'}</ins><br>${escape(fix.explanation)}</li>`).join('')}</ul>`:'';
  return `<article class="en-dialogue-turn${message.role==='user'?' en-dialogue-user':''}">
    <header><strong>${message.role==='user'?'You':'Luna'}</strong>${review?`<span class="en-speaking-score" aria-label="Score for this reply">${review.score}/100</span>`:''}</header>
    <p>${segments+escape(message.text.slice(offset))}</p>
    ${review?`<div class="en-speaking-review"><p>${escape(review.reason)}</p>${details}</div>`:''}
  </article>`;
}

function recap(dialogue?:SpeakingDialogue){
  const labels={action:'Proposed action',reason:'Reason',verification:'How to check it'};
  const facts=SPEAKING_RECAP_KEYS.flatMap(key=>{
    const value=dialogue?.recap?.[key];
    return value?[`<div><dt>${labels[key]}</dt><dd>${escape(value)}</dd></div>`]:[];
  });
  return facts.length?`<section class="en-speaking-recap"><h3>What you’ve covered</h3><dl>${facts.join('')}</dl></section>`:'';
}

export function savedDialogue(dialogue:EnglishAttempt['liveSpeaking']){
  return dialogue?`<details class="en-task-source"><summary>Speaking conversation</summary>${recap(dialogue)}<div class="en-dialogue-log">${dialogue.messages.map(turn).join('')}</div><p>${escape(dialogue.feedback)}</p></details>`:'';
}

export function renderLiveSpeaking(view:EnglishView,recordingKey:string){
  const attempt=view.attempt!,dialogue=attempt.liveSpeaking;
  const brief=speakingBrief(view.lesson),key=dialogueKey(dialogue);
  const ready=speakingDone(dialogue),wrapped=dialogue?.status==='wrapped';
  const exhausted=!ready&&(dialogue?.turn??0)>=SPEAKING_MAX_REPLIES;
  const lastReply=dialogue?.messages.map(message=>message.role).lastIndexOf('user')??-1;
  const earlier=lastReply>0?dialogue!.messages.slice(0,lastReply):[];
  const legacy=['monologue','turn-0','turn-1','turn-2','retry'].map(k=>attempt.answers[k]).filter(text=>text?.trim());
  const guide=dialogue?.hint||(lastReply>=0?dialogue?.feedback:undefined)||
    'Start with the situation. Pick one concrete next step and explain your reason in your own words.';
  const words=view.lesson.id==='daily-004'?'<p><strong>Specify</strong> means say exactly what you mean. An <strong>attendance measure</strong> is something you count to see how many patients showed up.</p>':'';
  const finish='<button class="button secondary" data-en-action="finish-speaking">Finish Speaking</button>';
  return `<section class="en-live-speaking">
    <h2>Talk it through with Luna</h2>
    <div class="en-speaking-layout">
      <aside class="en-speaking-context" aria-label="Conversation context">
        <div class="en-speaking-brief"><h3>Situation</h3><p>${escape(brief.facts)}</p><h3>Your goal</h3><p>${escape(brief.goal)}</p></div>
        ${recap(dialogue)}
        <div class="en-speaking-hint"><h3>Luna’s hint</h3><p>${escape(guide)}</p>
          ${ready?'':words+`<details><summary>Ways to start your reply</summary><ul>${brief.phrases.map(phrase=>`<li>${escape(phrase)}</li>`).join('')}</ul></details>`}</div>
      </aside>
      <div class="en-speaking-main">
        <div class="en-speaking-question"><h3>${ready?'Speaking summary':exhausted?'Ready to wrap up':'Current question'}</h3>
          <p id="en-speaking-question">${wrapped?'Your replies are saved with their feedback.':exhausted?'You have already practised this conversation. Finish Speaking to continue.':escape(speakingQuestion(view.lesson,dialogue))}</p>
          ${dialogue?.feedback?`<small>${escape(dialogue.feedback)}</small>`:''}
        </div>
        ${view.canAdvance&&!dialogue?'<p>Your earlier Speaking work already counts. You can continue or try this conversation.</p>':''}
        ${ready?(wrapped?'<p>✓ Speaking complete with feedback. You can move on to Writing.</p>':'<p>✓ Speaking goal reached. You can move on to Writing.</p>'):exhausted?finish:`
          <label for="en-live-reply">Your reply in English</label>
          <textarea id="en-live-reply" lang="en" rows="3" maxlength="${SPEAKING_INPUT_LIMIT}" data-en-answer="${key}" aria-describedby="en-speaking-question" placeholder="Reply as you would to a colleague…">${escape(attempt.answers[key]?.startsWith('[Local audio recording')?'':attempt.answers[key]||'')}</textarea>
          <div class="en-inline en-dialogue-actions">
            <button class="button primary" data-en-action="dialogue">Send reply</button>
            <button class="button secondary" data-en-action="record" data-key="${key}">${recordingKey===key?'Stop recording':'Record reply'}</button>
            <button class="button secondary" data-en-action="dialogue-transcribe" hidden>Transcribe recording</button>
            <button class="button secondary" data-en-action="luna-say">Listen to Luna</button>
            ${canWrapSpeaking(dialogue)?finish:''}
          </div>
          <div data-en-audio="${key}"></div>
        `}
        ${lastReply>=0?`<section class="en-speaking-latest"><h3>Feedback on your last reply</h3>${turn(dialogue!.messages[lastReply])}</section>`:''}
        ${earlier.length?`<details class="en-speaking-earlier"><summary>Earlier turns</summary><div class="en-dialogue-log">${earlier.map(turn).join('')}</div></details>`:''}
        ${legacy.length?`<details class="en-task-source"><summary>Earlier Speaking drafts</summary>${legacy.map(text=>`<blockquote>${escape(text)}</blockquote>`).join('')}</details>`:''}
      </div>
    </div>
  </section>`;
}
