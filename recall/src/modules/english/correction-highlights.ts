import CorrectionPolicy from '../../../integration/english-correction-policy.cjs';

const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const word=/[\p{L}\p{M}\p{N}_]/u;

interface Correction {original:string;replacement:string;explanation:string;kind:'error'|'style';start?:number}

export function answerCorrections(source:string, corrections:Correction[]){
  const focused:Correction[]=CorrectionPolicy.focusedCorrections(corrections,source);
  return focused.map((correction,index)=>{
    const {original,kind}=correction;
    const matches:number[]=[];
    for(let start=source.indexOf(original);start!==-1;start=source.indexOf(original,start+original.length)){
      const end=start+original.length;
      if(word.test(original[0])&&word.test(source[start-1]||''))continue;
      if(word.test(original.at(-1)!)&&word.test(source[end]||''))continue;
      matches.push(start);
    }
    const positions=correction.start!==undefined&&matches.includes(correction.start)?[correction.start]:matches;
    return {...correction,index,ranges:positions.map(start=>({start,end:start+original.length,index,kind}))};
  });
}

export function renderCheckedText(source:string,corrections:ReturnType<typeof answerCorrections>){
  const ranges=corrections.flatMap(c=>c.ranges);
  if(!ranges.length)return escape(source);
  const boundaries=[...new Set([0,source.length,...ranges.flatMap(r=>[r.start,r.end])])].sort((a,b)=>a-b);
  return boundaries.slice(1).map((end,i)=>{
    const start=boundaries[i],text=escape(source.slice(start,end));
    const active=ranges.filter(r=>r.start<=start&&r.end>=end);
    if(!active.length)return text;
    return '<mark class="en-correction-mark '+(active.some(r=>r.kind==='error')?'is-error':'is-style')+'" data-en-correction-match="'+active.map(r=>r.index).join(' ')+'" data-start="'+start+'" data-end="'+end+'">'+text+'</mark>';
  }).join('');
}

const resizeObservers=new WeakMap<HTMLElement,ResizeObserver>();
function syncOverlay(field:HTMLTextAreaElement,overlay:HTMLElement){
  overlay.style.insetBlockStart=field.clientTop+'px';
  overlay.style.insetInlineStart=field.clientLeft+'px';
  overlay.style.width=field.clientWidth+'px';
  overlay.style.height=field.clientHeight+'px';
  overlay.scrollTop=field.scrollTop;
  overlay.scrollLeft=field.scrollLeft;
}

export function mountCorrectionHighlights(root:HTMLElement){
  resizeObservers.get(root)?.disconnect();
  const observer=new ResizeObserver(entries=>{
    for(const {target} of entries){
      const overlay=target.nextElementSibling;
      if(target instanceof HTMLTextAreaElement&&overlay instanceof HTMLElement)syncOverlay(target,overlay);
    }
  });
  resizeObservers.set(root,observer);
  for(const field of root.querySelectorAll<HTMLTextAreaElement>('.en-answer-editor textarea')){
    const row=field.closest('.en-answer-row');
    const checked=row?.querySelector<HTMLElement>('.en-checked-draft blockquote');
    const overlay=field.nextElementSibling;
    if(!checked||!(overlay instanceof HTMLElement))continue;
    if(field.value!==checked.textContent||!checked.querySelector('mark'))continue;
    overlay.replaceChildren(...Array.from(checked.childNodes,node=>node.cloneNode(true)));
    const style=getComputedStyle(field);
    for(const property of ['font','letter-spacing','word-spacing','padding','tab-size','text-align']){
      overlay.style.setProperty(property,style.getPropertyValue(property));
    }
    if(field.value.endsWith('\n'))overlay.append('\u200b');
    field.addEventListener('scroll',()=>syncOverlay(field,overlay));
    observer.observe(field);
    syncOverlay(field,overlay);
  }
}

export function clearCorrectionHighlights(field:HTMLTextAreaElement){
  const overlay=field.nextElementSibling;
  if(overlay?.classList.contains('en-answer-overlay'))overlay.replaceChildren();
}

export function showAnswerCorrection(event:MouseEvent){
  const link=event.target instanceof Element?event.target.closest<HTMLElement>('[data-en-show-correction]'):null;
  if(!link)return;
  const row=link.closest('.en-answer-row');
  const field=row?.querySelector<HTMLTextAreaElement>('.en-answer-editor textarea');
  const details=row?.querySelector<HTMLDetailsElement>('.en-checked-draft');
  const quote=details?.querySelector('blockquote');
  const matches='[data-en-correction-match~="'+CSS.escape(link.dataset.enShowCorrection!)+'"]';
  const target=quote?.querySelector<HTMLElement>(matches);
  if(!field||!details||!target)return;
  event.preventDefault();
  if(field.disabled||field.value!==quote?.textContent){
    details.open=true;
    target.tabIndex=-1;
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'center'});
    return;
  }
  field.focus({preventScroll:true});
  const start=Number(target.dataset.start);
  field.setSelectionRange(start,start+Number(link.dataset.enOriginalLength));
  field.scrollIntoView({block:'nearest'});
  const overlay=field.nextElementSibling;
  const mark=overlay?.querySelector(matches);
  if(mark&&overlay instanceof HTMLElement){
    const bounds=mark.getBoundingClientRect();
    const top=bounds.top-overlay.getBoundingClientRect().top;
    if(top<0||top+bounds.height>field.clientHeight){
      field.scrollTop+=top-field.clientHeight/2;
      syncOverlay(field,overlay);
    }
  }
}
