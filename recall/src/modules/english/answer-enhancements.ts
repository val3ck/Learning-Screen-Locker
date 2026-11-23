const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function scoreTone(score:number){return score===100?'perfect':score>=80?'high':score>=50?'medium':'low';}
const scorePatterns={
  low:['red-orbit','red-steps','red-slants'],
  medium:['amber-dunes','amber-sun','amber-quarter','amber-tiles','amber-beam','amber-ripples','amber-dots'],
  high:['green-pebbles','green-canopy','green-terraces','green-rings','green-grove','green-horizon'],
} as const;

export function scorePattern(score:number,attemptId:string,answerKey:string){
  const tone=scoreTone(score);
  if(tone==='perfect')return undefined;
  const numbered=/^(.*?)-(\d+)$/.exec(answerKey);
  const seed=`${attemptId}:${numbered?.[1]??answerKey}`;
  let hash=0;
  for(let i=0;i<seed.length;i++)hash=(Math.imul(hash,31)+seed.charCodeAt(i))>>>0;
  const options=scorePatterns[tone];
  return options[(hash+Number(numbered?.[2]??0))%options.length];
}
export function scoreBadge(score:number,id:string,animate:boolean){const tone=scoreTone(score);return `<div class="en-score-display" ${animate&&tone==='perfect'?`data-en-celebration-id="${escape(id)}"`:''}><span class="en-score-eyebrow">AI estimate</span><div class="en-score-number"><strong class="en-score-value">${score}</strong><span>/100</span></div><span class="en-score-label">${{perfect:'Perfect for this task',high:'Strong result',medium:'Developing',low:'Needs practice'}[tone]}</span>${tone==='perfect'?`<span class="en-score-fireworks" aria-hidden="true">${[0,1,2].map(b=>`<span class="en-score-burst" style="--burst:${b}">${Array.from({length:8},(_,i)=>`<i style="--ray:${i};--spark:${['#e76886','#d39b24','#269d83','#8b6ccc'][i%4]}"></i>`).join('')}</span>`).join('')}</span>`:''}</div>`;}
const boundRoots=new WeakSet<HTMLElement>(),celebrated=new Set<string>();let restored=false;
const celebrationObservers=new WeakMap<HTMLElement,IntersectionObserver>();
const celebrationStorage='recall-score-celebrations-v2';

function showCelebrations(root:HTMLElement){
 celebrationObservers.get(root)?.disconnect();
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 if(!restored){restored=true;try{for(const id of JSON.parse(sessionStorage.getItem(celebrationStorage)||'[]').slice(-300))if(typeof id==='string')celebrated.add(id);}catch{}}
 const pending=[...root.querySelectorAll<HTMLElement>('[data-en-celebration-id]')]
  .filter(score=>!celebrated.has(score.dataset.enCelebrationId!)&&!score.classList.contains('en-celebrate'));
 if(!pending.length)return;
 const observer=new IntersectionObserver(entries=>{
  for(const {target,isIntersecting,intersectionRatio} of entries){
   if(!target.isConnected){observer.unobserve(target);continue;}
   if(!isIntersecting||intersectionRatio<.35)continue;
   observer.unobserve(target);
   const score=target as HTMLElement,id=score.dataset.enCelebrationId;
   const fireworks=score.querySelector<HTMLElement>('.en-score-fireworks');
   if(!id||!fireworks||celebrated.has(id)||score.closest('.is-stale'))continue;
   fireworks.addEventListener('animationend',event=>{
    if(event.target!==fireworks||event.animationName!=='en-score-fireworks-visibility')return;
    score.classList.remove('en-celebrate');
    if(!score.isConnected||score.closest('.is-stale'))return;
    celebrated.add(id);
    try{sessionStorage.setItem(celebrationStorage,JSON.stringify([...celebrated].slice(-300)));}catch{}
   });
   score.classList.add('en-celebrate');
  }
 },{threshold:.35});
 celebrationObservers.set(root,observer);
 for(const score of pending)observer.observe(score);
}
function sizeField(field:HTMLTextAreaElement){const long=field.dataset.enAutosize==='long',min=long?164:98,max=long?420:250;field.style.height='auto';field.style.height=Math.max(min,Math.min(field.scrollHeight+2,max))+'px';field.style.overflowY=field.scrollHeight>max?'auto':'hidden';}
export function markAnswerEdited(root:HTMLElement,key:string){const card=root.querySelector<HTMLElement>('[data-en-report-key="'+CSS.escape(key)+'"]');card?.classList.add('is-stale');card?.querySelector('.en-celebrate')?.classList.remove('en-celebrate');const caption=card?.querySelector('.en-score-label');if(caption)caption.textContent='Previous estimate';const conclusion=root.querySelector<HTMLElement>('[data-en-section-conclusion]');if(conclusion){conclusion.classList.add('is-stale');const state=conclusion.querySelector<HTMLElement>('[data-en-conclusion-state]');if(state)state.textContent='An answer has changed. Check it again to update this summary.';}}
function tutorPreview(root:HTMLElement){const select=root.querySelector<HTMLSelectElement>('[data-en-hint-target]'),preview=root.querySelector<HTMLElement>('[data-en-tutor-context]');if(!select||!preview)return;const key=select.value;if(key==='__block__'){preview.textContent='The assistant has the tasks from this section and can guide you through them.';return;}const field=key?root.querySelector<HTMLTextAreaElement>('[data-en-answer="'+CSS.escape(key)+'"]'):null;const text=field?.value?.trim();preview.textContent=text?'Your current answer: “'+text.slice(0,280)+(text.length>280?'…':'')+'”. Recall will save this answer and send its latest score and feedback with your question.':'The assistant uses the last saved answer and score for this section. You can choose a specific task.';}
export function focusTutorAnswer(root:HTMLElement,key:string,question?:string){const details=root.querySelector<HTMLDetailsElement>('.en-ai-tutor'),select=root.querySelector<HTMLSelectElement>('[data-en-hint-target]');if(!details||!select)return;details.open=true;if(question){const field=root.querySelector<HTMLTextAreaElement>('[data-en-hint-question]');if(field){field.value=question;sizeField(field);}}select.value=[...select.options].some(o=>o.value===key)?key:'';tutorPreview(root);details.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});root.querySelector<HTMLTextAreaElement>('[data-en-hint-question]')?.focus({preventScroll:true});}
export function enhanceEnglishAnswers(root:HTMLElement){
 for(const field of root.querySelectorAll<HTMLTextAreaElement>('textarea[data-en-autosize]'))sizeField(field);
 showCelebrations(root);
 tutorPreview(root);
 if(boundRoots.has(root))return;boundRoots.add(root);
 root.addEventListener('input',event=>{const field=event.target;if(!(field instanceof HTMLTextAreaElement))return;if(field.matches('[data-en-autosize]'))sizeField(field);if(field.dataset.enAnswer){markAnswerEdited(root,field.dataset.enAnswer);const select=root.querySelector<HTMLSelectElement>('[data-en-hint-target]');if(select&&[...select.options].some(o=>o.value===field.dataset.enAnswer))select.value=field.dataset.enAnswer;tutorPreview(root);}});
 root.addEventListener('change',event=>{if((event.target as HTMLElement)?.matches('[data-en-hint-target]'))tutorPreview(root);});
}
