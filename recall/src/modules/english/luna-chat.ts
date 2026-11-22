import {LUNA_MAX,lunaQuestion,type LunaOptions} from '../../../../shared/luna-chat';
import {localLunaPreferences,lunaControls,showLunaBtw} from '../../luna-controls';
import {chatMarkup} from '../../chat-markup';
import {LUNA_INPUT_LIMIT, type LunaMessage} from './dialogue';
import type {EnglishView} from './types';
import '../../sql-chat.css';

export class EnglishLunaChat {
  private widget: HTMLDivElement;
  private select: HTMLSelectElement;
  private input: HTMLTextAreaElement;
  private scope = '';
  private area = '';
  private autoKey = '';
  private pending = false;
  private prefs=localLunaPreferences('english');
  private side=new Map<string,{question:string;answer:string}>();
  private disposed = false;
  private conversations = new Map<string, LunaMessage[]>();

  constructor(private root:HTMLElement, private ask:(area:string,key:string,question:string,options:LunaOptions)=>Promise<string>) {
    this.widget=document.createElement('div');
    this.widget.className='sql-chat-widget en-luna-widget';
    this.widget.hidden=true;
    this.widget.innerHTML=`<button type="button" class="sql-chat-launcher" aria-expanded="false" aria-controls="en-luna-panel"><span class="en-luna-moon" aria-hidden="true">🌚</span> Luna</button>
      <section class="sql-chat" id="en-luna-panel" aria-labelledby="en-luna-title" hidden>
        <header class="sql-chat-header en-luna-header">
          <div class="en-luna-header-row"><h2 id="en-luna-title">Luna <span>Task help</span></h2><button type="button" class="sql-chat-close" aria-label="Close Luna chat">×</button></div>
          <label for="en-luna-target">Which task?</label><select id="en-luna-target" aria-describedby="en-luna-context"></select>
          <p class="sql-chat-note en-luna-context" id="en-luna-context"></p>
        </header>
        <div class="sql-chat-content">
          <div class="sql-chat-messages" role="log" aria-label="Luna task help" hidden></div>
          <div class="luna-btw" role="status" hidden></div>
          <form><label for="en-luna-question">Your question</label><textarea id="en-luna-question" rows="2" maxlength="${LUNA_INPUT_LIMIT}" placeholder="What should I clarify in my answer?"></textarea>
            <div class="sql-chat-actions"><p class="sql-chat-status" role="status"></p><button type="submit" class="button primary">Ask Luna</button></div></form>
        </div>
      </section>`;
    this.select=this.widget.querySelector('select')!;
    this.input=this.widget.querySelector('textarea')!;
    const launcher=this.widget.querySelector<HTMLButtonElement>('.sql-chat-launcher')!;
    const panel=this.widget.querySelector<HTMLElement>('#en-luna-panel')!;
    const toggle=(open:boolean)=>{
      panel.hidden=!open;
      launcher.setAttribute('aria-expanded',String(open));
      (open?this.input:launcher).focus({preventScroll:true});
    };
    launcher.addEventListener('click',()=>toggle(panel.hidden));
    this.widget.querySelector('.sql-chat-close')!.addEventListener('click',()=>toggle(false));
    this.widget.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();toggle(false);}
    });
    this.select.addEventListener('change',()=>{this.input.value='';this.status('');this.update();});
    const form=this.widget.querySelector('form')!;
    form.before(lunaControls(this.prefs,value=>{this.prefs=localLunaPreferences('english',value);this.update();},()=>{
      if(this.pending)return;
      this.conversations.delete(this.thread());this.side.delete(this.thread());this.input.value='';this.status('');this.update();
    },()=>{
      if(this.pending)return;
      this.input.value='/btw '+this.input.value.replace(/^\/(?:btw|бтв)\s*/iu,'');this.input.focus();
    },true));
    form.addEventListener('submit',event=>{event.preventDefault();void this.send();});
    this.root.addEventListener('focusin',this.trackFocus);
    document.body.append(this.widget);
  }

  private trackFocus=(event:FocusEvent)=>{
    const field=event.target as HTMLElement|null;
    const key=field?.dataset.enAnswer;
    if(!key||![...this.select.options].some(option=>option.value===key))return;
    this.autoKey=key;
    if(this.select.value==='auto')this.update();
  };

  sync(view:EnglishView) {
    const run=view.run,attempt=view.attempt;
    const active=run?.status==='active'&&!run.endedAt&&run.payload.pauseUntil===undefined&&!view.readonly;
    const area=run?.payload.phase==='reinforcement'?'practice':run?.payload.phase==='lesson'&&attempt?view.lesson.blocks[attempt.blockIndex]?.id:'';
    this.widget.hidden=!active||!area||area==='summary';
    if(this.widget.hidden)return;
    const scope=(attempt?.id||run!.id)+':'+area+(area==='practice'?':'+run!.payload.practice?.id:'');
    const manual=scope===this.scope?this.select.value:'auto';
    if(scope!==this.scope){this.scope=scope;this.autoKey='';this.input.value='';this.status('');}
    this.area=area;
    const options=new Map<string,string>();
    for(const field of this.root.querySelectorAll<HTMLElement>('[data-en-answer]')){
      const key=field.dataset.enAnswer!;
      const card=field.closest('.en-prompt-card')?.querySelector('h3')?.textContent;
      const label=field.id&&this.root.querySelector(`label[for="${CSS.escape(field.id)}"]`)?.textContent;
      options.set(key,(label||card||key).trim().slice(0,92));
    }
    const selected=attempt?.lastAnswerKey;
    if(!options.has(this.autoKey))this.autoKey=typeof selected==='string'&&options.has(selected)?selected:options.keys().next().value||'';
    this.select.replaceChildren(new Option('Focused task · automatic','auto'),new Option('Whole block','__block__'),
      ...[...options].map(([key,label])=>new Option(label,key)));
    this.select.value=options.has(manual)||manual==='__block__'?manual:'auto';
    this.update();
  }

  private key(){return this.select.value==='auto'?this.autoKey||'__block__':this.select.value;}
  private thread(){return this.scope+':'+this.key();}
  private status(text:string){this.widget.querySelector('.sql-chat-status')!.textContent=text;}
  private update(){
    const log=this.widget.querySelector<HTMLElement>('.sql-chat-messages')!;
    const messages=(this.conversations.get(this.thread())||[]).slice(-this.prefs.limit);
    this.widget.querySelector<HTMLButtonElement>('[data-luna-clear]')!.disabled=this.pending;
    showLunaBtw(this.widget.querySelector('.luna-btw')!,this.side.get(this.thread()));
    log.replaceChildren(...messages.map(message=>{
      const row=document.createElement('div'),label=document.createElement('strong'),content=document.createElement('div');
      if(message.role==='user')row.className='sql-chat-user';
      label.textContent=message.role==='user'?'You':'Luna';
      content.className='sql-chat-answer';
      if(message.role==='user')content.textContent=message.text;else content.innerHTML=chatMarkup(message.text);
      row.append(label,content);return row;
    }));
    log.hidden=!messages.length;
    log.scrollTop=log.scrollHeight;
    const option=[...this.select.options].find(o=>o.value===this.key());
    this.widget.querySelector('.en-luna-context')!.textContent=this.select.value==='auto'
      ?`Active: ${option?.text||'Whole block'}`
      :this.select.value==='__block__'?'Context: all tasks in this block':'Pinned to this task';
    this.widget.querySelector<HTMLButtonElement>('[type=submit]')!.disabled=this.pending;
  }

  private async send() {
    const text=this.input.value.trim();
    if(!text||this.pending)return;
    const key=this.key(),thread=this.thread();
    const history=this.conversations.get(thread)||[];
    const parsed=lunaQuestion(text,'Share one useful English tip related to this exercise.');
    this.pending=true;
    this.status('Luna is thinking…');
    this.update();
    try {
      const response=await this.ask(this.area,key,text,{...this.prefs,history:parsed.btw?[]:history.slice(1-this.prefs.limit)});
      if(this.disposed)return;
      if(parsed.btw){
        this.side.set(thread,{question:parsed.question,answer:response});
        if(this.side.size>40)this.side.delete(this.side.keys().next().value!);
      }else{
        this.conversations.set(thread,[...history,{role:'user',text},{role:'assistant',text:response.trim().slice(0,LUNA_INPUT_LIMIT)||'Try asking about a specific part of the task.'}].slice(-LUNA_MAX) as LunaMessage[]);
      }
      if(this.conversations.size>40)this.conversations.delete(this.conversations.keys().next().value!);
      if(thread===this.thread()&&this.input.value.trim()===text)this.input.value='';
      this.status('');
    }catch(error){if(!this.disposed)this.status(String(error).replace(/^.*?Error: /,''));}
    finally{this.pending=false;if(!this.disposed)this.update();}
  }

  dispose(){this.disposed=true;this.root.removeEventListener('focusin',this.trackFocus);this.widget.remove();}
}
