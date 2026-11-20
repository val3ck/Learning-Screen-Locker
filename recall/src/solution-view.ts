import type {LearningModule,SolutionExample,Task} from './core/contracts';
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function solutionView(module:LearningModule,task:Task,knownTopicIds:string[],answer?:string):string {
  const review=module.taskProvider.review?.(task);
  if(!review)return `<pre class="solution"><code>${escape(module.taskProvider.solution(task))}</code></pre>`;
  const known=new Set(knownTopicIds);
  const example=(item:SolutionExample,recommended=false)=>{
    const missing=item.requiredTopicIds.filter(id=>!known.has(id));
    const names=missing.map(id=>module.catalog.find(t=>t.id===id)?.title||id);
    const body=`<p>${escape(item.explanation)}</p><pre><code>${escape(item.code)}</code></pre><p class="solution-when"><strong>Коли доречно.</strong> ${escape(item.whenToUse)}</p>`;
    if(recommended)return `<article class="solution-example recommended"><span class="solution-tag">ПРОСТИЙ І ЗРОЗУМІЛИЙ ПОЧАТОК</span><h4>${escape(item.title)}</h4>${body}</article>`;
    return `<details class="solution-example alternative"><summary>${escape(item.title)}${missing.length?'<span class="solution-next-label">Наступний крок</span>':'<span class="solution-next-label">Інший підхід</span>'}</summary>${missing.length?`<p class="solution-prerequisites">Тут є теми, які ще не підтверджені: ${names.map(escape).join(', ')}. Це необов’язковий приклад; він не відкриває нові теми в повторенні.</p>`:''}${body}</details>`;
  };
  return `<section class="solution-review">${answer?.trim()?`<details class="your-answer"><summary>Твоя відповідь</summary><pre><code>${escape(answer)}</code></pre><p>Перевірка оцінює результат на контрольних даних. Інший коректний запис не означає, що твій підхід поганий.</p></details>`:''}${example(review.recommended,true)}<div class="solution-reasoning"><h4>На що звернути увагу</h4><ul>${review.principles.map(p=>`<li>${escape(p)}</li>`).join('')}</ul><h4>Типова пастка</h4>${review.pitfalls.map(p=>`<p>${escape(p)}</p>`).join('')}</div>${review.alternatives.length?`<div class="solution-alternatives"><h4>Ще ${review.alternatives.length} ${review.alternatives.length===1?'варіант':'варіанти'}</h4>${review.alternatives.map(a=>example(a)).join('')}</div>`:''}<p class="solution-performance"><strong>Про швидкодію.</strong> ${escape(review.performanceNote)} Тут наведені перевірені еквівалентні розв’язки, а не рейтинг швидкості.</p></section>`;
}
