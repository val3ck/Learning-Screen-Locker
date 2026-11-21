type Selection = {text:string;context:string};
type Provider = 'complimentary'|'openrouter'|'groq';
type WordAction = 'correct'|'synonyms';
type HelpAction = 'explain'|WordAction;
type Edit = {field:HTMLTextAreaElement;value:string;start:number;end:number};
type DictionaryUse = {text:string;context:string;translation:string;explanation:string;alternatives:{text:string;when:string}[]};
type DictionaryEntry = DictionaryUse & {uses?:DictionaryUse[]};
export type EnglishTextRequest =
  | {action:'list'}
  | ({action:'lookup'|HelpAction} & Selection)
  | ({action:'translate';provider:Provider} & Selection);
type Request = (input:EnglishTextRequest)=>Promise<any>;
const roots=new WeakMap<HTMLElement,Request>();
let popup:HTMLElement|null=null;
let restoreFocus:HTMLElement|null=null;
let dismissHandlersInstalled=false;
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const bodyOf=(panel:HTMLElement)=>panel.querySelector<HTMLElement>('.en-translator-body')!;

function close(returnFocus=true){
  const panel=popup;
  if(!panel)return;
  popup=null;
  const trigger=restoreFocus;
  restoreFocus=null;
  if(returnFocus)trigger?.focus({preventScroll:true});
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){panel.remove();return;}
  panel.inert=true;
  panel.setAttribute('aria-hidden','true');
  const remove=()=>{window.clearTimeout(timeout);panel.remove();};
  const timeout=window.setTimeout(remove,220);
  panel.addEventListener('animationend',remove,{once:true});
  panel.classList.add('is-closing');
}
function installDismissHandlers(){
  if(dismissHandlersInstalled)return;
  dismissHandlersInstalled=true;
  document.addEventListener('pointerdown',event=>{
    if(!popup||event.button!==0||!(event.target instanceof Node)||popup.contains(event.target))return;
    if(event.target instanceof Element&&event.target.closest('[data-en-dictionary-open]'))return;
    close(false);
  },true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&popup){event.preventDefault();event.stopPropagation();close();}
  });
}
function openPanel(title:string){
  document.querySelector('.en-translator-popup.is-closing')?.remove();
  popup?.remove();
  const panel=document.createElement('section');
  panel.className='en-translator-popup';
  panel.lang='en';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label',title);
  panel.innerHTML='<header><strong>'+escape(title)+'</strong><button type="button" aria-label="Close" data-dict-close>×</button></header><div class="en-translator-body" aria-live="polite"></div>';
  document.body.append(panel);
  popup=panel;
  const closeButton=panel.querySelector<HTMLButtonElement>('[data-dict-close]')!;
  closeButton.onclick=()=>close();
  closeButton.focus({preventScroll:true});
  return panel;
}
function showError(panel:HTMLElement,error:unknown){
  if(popup!==panel)return;
  const notice=document.createElement('p');
  notice.setAttribute('role','alert');
  notice.textContent=error instanceof Error?error.message.replace(/^Error invoking remote method '.+?': Error: /,''):'Please try again.';
  bodyOf(panel).append(notice);
}
function translationMeaning(entry:DictionaryUse){
  return '<p>'+escape(entry.translation)+'</p><p>'+escape(entry.explanation)+'</p>'
    +(entry.alternatives.length?'<h4 lang="en">Other meanings</h4><ul class="en-translation-alternatives">'+entry.alternatives.map(item=>'<li><strong>'+escape(item.text)+'</strong><small>'+escape(item.when)+'</small></li>').join('')+'</ul>':'');
}
const previewContext=(entry:DictionaryUse)=>entry.context?'<small lang="en">'+escape(entry.context.slice(0,220))+'</small>':'';
function translationEntry(entry:DictionaryEntry,showContexts=false){
  const extra=showContexts?entry.uses?.slice(1):undefined;
  return '<article class="en-dictionary-entry" lang="uk"><strong lang="en">'+escape(entry.text)+'</strong>'+translationMeaning(entry)
    +(showContexts?previewContext(entry):'')
    +(extra?.length?'<details class="en-dictionary-contexts"><summary lang="en">More saved uses ('+extra.length+')</summary>'+extra.map(use=>'<div>'+translationMeaning(use)+previewContext(use)+'</div>').join('')+'</details>':'')+'</article>';
}
async function dictionary(request:Request){
  const panel=openPanel('My dictionary');
  panel.dataset.dictionaryList='';
  const body=bodyOf(panel);
  body.innerHTML='<p>Loading your dictionary…</p>';
  try{
    const result=await request({action:'list'});
    if(popup!==panel)return;
    const entries:DictionaryEntry[]=result.entries;
    body.innerHTML='<label>Search<input data-dict-search type="search" placeholder="Word or translation"></label><div data-dict-entries></div>';
    const list=body.querySelector<HTMLElement>('[data-dict-entries]')!;
    const render=(query='')=>{
      const term=query.trim().toLowerCase();
      const items=entries.filter(entry=>entry.text.toLowerCase().includes(term)
        ||(entry.uses??[entry]).some(use=>use.translation.toLowerCase().includes(term))).slice(0,100);
      list.innerHTML=items.length?items.map(entry=>translationEntry(entry,true)).join(''):term?'<p>No matching entries.</p>':'<p>Select some text and choose “Translate in Dictionary” to add an entry.</p>';
    };
    render();
    const search=body.querySelector<HTMLInputElement>('input')!;
    search.addEventListener('input',()=>render(search.value));
  }catch(error){if(popup===panel){body.replaceChildren();showError(panel,error);}}
}
async function lookup(request:Request,selection:Selection){
  const panel=openPanel('Dictionary · contextual translation');
  const body=bodyOf(panel);
  function render(result:any){
    const entry=result.entry;
    body.innerHTML=(entry?translationEntry(entry)+'<p class="en-dictionary-saved">✓ Saved in My dictionary'+(result.cached?' · cached':'')+'</p>':'<blockquote class="en-selected-text">'+escape(selection.text)+'</blockquote><p>No local entry. Choose an available provider for a contextual translation.</p>')
      +'<div class="en-dict-buttons">'
      +(result.status.complimentary?'<button type="button" data-dict-provider="complimentary">Translate with Luna</button>':'')
      +(result.status.groqFree?'<button type="button" data-dict-provider="groq">Translate with Groq Free</button>':'')
      +(result.status.openrouter?'<button type="button" data-dict-provider="openrouter">Translate with OpenRouter $0</button>':'')
      +'<button type="button" data-dict-list>My dictionary</button></div>';
    body.querySelector<HTMLButtonElement>('[data-dict-list]')!.onclick=()=>void dictionary(request);
    for(const button of body.querySelectorAll<HTMLButtonElement>('[data-dict-provider]'))button.onclick=async()=>{
      for(const control of body.querySelectorAll<HTMLButtonElement>('button'))control.disabled=true;
      body.insertAdjacentHTML('beforeend','<p role="status">Translating…</p>');
      try{
        const next=await request({action:'translate',provider:button.dataset.dictProvider as Provider,...selection});
        if(popup===panel)render(next);
      }catch(error){if(popup===panel){render(result);showError(panel,error);}}
    };
  }
  body.innerHTML='<p>Checking the local dictionary…</p>';
  try{
    const result=await request({action:'lookup',...selection});
    if(popup===panel)render(result);
  }catch(error){if(popup===panel){body.replaceChildren();showError(panel,error);}}
}
const HELP_TITLES={explain:'What does this mean?',correct:'Correct word',synonyms:'Best synonyms'};
async function showHelp(request:Request,action:HelpAction,selection:Selection,edit?:Edit){
  const panel=openPanel(HELP_TITLES[action]);
  const body=bodyOf(panel);
  body.innerHTML='<blockquote class="en-selected-text">'+escape(selection.text)+'</blockquote><div role="status" data-en-explanation><p>Checking the selected text…</p></div><button type="button" data-explain-dictionary>Translate in Dictionary</button>';
  body.querySelector<HTMLButtonElement>('[data-explain-dictionary]')!.onclick=()=>void lookup(request,selection);
  const answer=body.querySelector<HTMLElement>('[data-en-explanation]')!;
  try{
    const result=await request({action,...selection});
    if(popup!==panel)return;
    const suggestions=action==='synonyms'&&result.suggestions.length
      ?'<ul class="en-translation-alternatives">'+result.suggestions.map((item:{word:string;reason:string})=>'<li><strong>'+escape(item.word)+'</strong><small>'+escape(item.reason)+'</small></li>').join('')+'</ul>'
      :'';
    answer.innerHTML=(action==='correct'?'<h3>'+escape(result.replacement)+'</h3>':'')
      +suggestions+'<p>'+escape(result.explanation)+'</p><small class="en-explanation-source">'+escape(result.provider)+' · '+escape(result.model)+'</small>';
    if(action==='correct'&&edit&&result.replacement!==selection.text){
      const apply=document.createElement('button');
      apply.type='button';
      apply.className='en-apply-word';
      apply.textContent='Apply correction';
      answer.after(apply);
      apply.onclick=()=>{
        const {field,value,start,end}=edit;
        if(!field.isConnected||field.value!==value||field.readOnly||field.disabled){
          apply.remove();
          showError(panel,new Error('The original text has changed. Select the word again to apply a correction.'));
          return;
        }
        field.setRangeText(result.replacement,start,end,'end');
        field.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertReplacementText',data:result.replacement}));
        close();
      };
    }
  }catch(error){if(popup===panel){answer.remove();showError(panel,error);}}
}
function localContext(source:string,text:string,start=source.indexOf(text)){
  return start<0?text:source.slice(Math.max(0,start-650),start+text.length+650);
}
function selectedText(root:HTMLElement,target:HTMLElement):{selection:Selection;edit?:Edit}|null{
  if(target.closest('#en-ai-settings,input,.sql-ai-settings'))return null;
  if(target instanceof HTMLTextAreaElement){
    const start=target.selectionStart;
    const selected=target.value.slice(start,target.selectionEnd);
    const text=selected.trim();
    const offset=selected.indexOf(text);
    return {selection:{text,context:localContext(target.value,selected,start)},edit:target.readOnly||target.disabled?undefined:{field:target,value:target.value,start:start+offset,end:start+offset+text.length}};
  }
  const selection=window.getSelection();
  if(!selection?.rangeCount)return null;
  const range=selection.getRangeAt(0);
  if(!root.contains(range.commonAncestorContainer))return null;
  const selected=selection.toString();
  const text=selected.trim();
  const common=range.commonAncestorContainer;
  const owner=(common instanceof HTMLElement?common:common.parentElement)?.closest<HTMLElement>('p,li,blockquote,fieldset,.en-reading,article')||target;
  const source=owner.textContent||'';
  if(!owner.contains(range.startContainer))return {selection:{text,context:localContext(source,text)}};
  const before=document.createRange();
  before.selectNodeContents(owner);
  before.setEnd(range.startContainer,range.startOffset);
  return {selection:{text,context:localContext(source,text,before.toString().length+selected.indexOf(text))}};
}
export function renderTranslatorTools(){
  return '<div class="en-dictionary-toolbar"><small>Right-click selected text for an explanation or translation.</small><button type="button" class="button secondary" data-en-dictionary-open aria-haspopup="dialog">My dictionary</button></div>';
}
export function installContextTranslator(root:HTMLElement,request:Request){
  installDismissHandlers();
  const installed=roots.has(root);
  roots.set(root,request);
  if(installed)return;
  root.addEventListener('contextmenu',event=>{
    const target=event.target;
    if(!(target instanceof HTMLElement))return;
    const selected=selectedText(root,target);
    if(!selected?.selection.text||selected.selection.text.length>800)return;
    const {selection,edit}=selected;
    event.preventDefault();
    restoreFocus=target;
    const panel=openPanel('Selected text');
    panel.classList.add('en-translator-menu');
    const wordActions=selection.text.length<=80&&selection.text.split(/\s+/).length<=8;
    bodyOf(panel).innerHTML='<button type="button" class="en-translate-selection" data-help-selection="explain">Explain with AI</button>'
      +(wordActions?'<button type="button" class="en-translate-selection" data-help-selection="correct">Correct word</button><button type="button" class="en-translate-selection" data-help-selection="synonyms">Best synonyms</button>':'')
      +'<button type="button" class="en-translate-selection" data-translate-selection>Translate in Dictionary</button>';
    for(const button of panel.querySelectorAll<HTMLButtonElement>('[data-help-selection]')){
      button.onclick=()=>void showHelp(roots.get(root)!,button.dataset.helpSelection as HelpAction,selection,edit);
    }
    panel.querySelector<HTMLButtonElement>('[data-translate-selection]')!.onclick=()=>void lookup(roots.get(root)!,selection);
    panel.style.right='auto';
    panel.style.bottom='auto';
    panel.style.left=Math.max(12,Math.min(event.clientX,window.innerWidth-panel.offsetWidth-12))+'px';
    panel.style.top=Math.max(12,Math.min(event.clientY,window.innerHeight-panel.offsetHeight-12))+'px';
    panel.querySelector<HTMLButtonElement>('[data-help-selection]')!.focus({preventScroll:true});
  });
  root.addEventListener('click',event=>{
    const target=event.target;
    if(!(target instanceof HTMLElement))return;
    const button=target.closest<HTMLElement>('[data-en-dictionary-open]');
    if(button){
      if(popup?.hasAttribute('data-dictionary-list')){close(false);return;}
      restoreFocus=button;
      void dictionary(roots.get(root)!);
    }
  });
}
