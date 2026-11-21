import {LUNA_MAX,lunaQuestion} from '../../shared/luna-chat';
import {localLunaPreferences,lunaControls,showLunaBtw} from './luna-controls';
import {SQL_CHAT_QUESTION_LIMIT, type SQLChatReply, type SQLChatRequest} from './core/contracts';
import './sql-chat.css';
import {chatMarkup} from './chat-markup';

type Message = {question:string}|SQLChatReply;
type Conversation = {
  sessionId:string;taskId:string;open:boolean;draft:string;pending:string;error:string;messages:Message[];
  feedback?:string;btw?:{question:string;answer:string};pendingBtw?:boolean;
};

export class SQLChatView {
  private prefs=localLunaPreferences('postgresql');
  private conversation:Conversation|null=null;
  private widget:HTMLDivElement|null=null;
  private update:()=>void=()=>{};

  constructor(private onSend:(sessionId:string,taskId:string)=>void){}

  unmount(){
    this.widget?.remove();
    this.widget=null;
    this.update=()=>{};
  }

  mount(sessionId:string,taskId:string,feedback?:string){
    if(this.conversation?.sessionId!==sessionId||this.conversation.taskId!==taskId){
      this.unmount();
      this.conversation={sessionId,taskId,open:false,draft:'',pending:'',error:'',messages:[]};
    }
    const chat=this.conversation;
    chat.feedback=feedback?.slice(0,1200);
    if(this.widget)return;

    const widget=document.createElement('div');
    widget.className='sql-chat-widget';
    widget.innerHTML=`<button class="sql-chat-launcher" type="button" aria-expanded="false" aria-controls="sql-chat-panel">Luna</button>
      <section class="sql-chat" id="sql-chat-panel" aria-labelledby="sql-chat-title" hidden>
        <header class="sql-chat-header">
          <h2 id="sql-chat-title">Luna <span>Поточна вправа</span></h2>
          <button class="sql-chat-close" type="button" aria-label="Згорнути чат Luna">×</button>
        </header>
        <div class="sql-chat-content">
          <p class="sql-chat-note">Кожне надіслане запитання рахується як підказка. Luna отримує умову, схему, SQL і результат перевірки.</p>
          <div class="sql-chat-messages" role="log" aria-label="Діалог з Luna" hidden></div>
          <div class="luna-btw" role="status" hidden></div>
          <form>
            <label for="sql-chat-question">Твоє запитання</label>
            <textarea id="sql-chat-question" rows="2" maxlength="${SQL_CHAT_QUESTION_LIMIT}" placeholder="Наприклад, чому в результаті дублікати?"></textarea>
            <div class="sql-chat-actions"><p class="sql-chat-status" role="status"></p><button class="button primary" type="submit">Запитати</button></div>
          </form>
        </div>
      </section>`;
    document.body.append(widget);
    this.widget=widget;
    const panel=widget.querySelector<HTMLElement>('#sql-chat-panel')!;
    const launcher=widget.querySelector<HTMLButtonElement>('.sql-chat-launcher')!;
    const log=panel.querySelector<HTMLElement>('.sql-chat-messages')!;
    const form=panel.querySelector<HTMLFormElement>('form')!;
    const question=form.querySelector('textarea')!;
    const button=form.querySelector('button')!;
    const status=form.querySelector<HTMLElement>('[role="status"]')!;
    const side=panel.querySelector<HTMLElement>('.luna-btw')!;
    form.before(lunaControls(this.prefs,value=>{this.prefs=localLunaPreferences('postgresql',value);this.update();},()=>{
      if(chat.pending)return;
      chat.messages=[];chat.btw=undefined;chat.draft='';chat.error='';this.update();
    },()=>{
      if(chat.pending)return;
      chat.draft='/btw '+chat.draft.replace(/^\/(?:btw|бтв)\s*/iu,'');this.update();question.focus();
    }));
    question.value=chat.draft;
    const setOpen=(open:boolean,moveFocus=false)=>{
      chat.open=open;
      panel.hidden=!open;
      launcher.setAttribute('aria-expanded',String(open));
      if(open)log.scrollTop=log.scrollHeight;
      if(moveFocus)(open?question:launcher).focus({preventScroll:true});
    };
    setOpen(chat.open);
    launcher.addEventListener('click',()=>setOpen(!chat.open,true));
    panel.querySelector('.sql-chat-close')!.addEventListener('click',()=>setOpen(false,true));
    widget.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&chat.open){event.preventDefault();event.stopPropagation();setOpen(false,true);}
    });
    question.addEventListener('input',()=>{chat.draft=question.value;button.disabled=!chat.draft.trim()||!!chat.pending;});
    this.update=()=>{
      if(!panel.isConnected)return;
      const messages=(chat.pending&&!chat.pendingBtw?[...chat.messages,{question:chat.pending}]:chat.messages).slice(-this.prefs.limit);
      panel.querySelector<HTMLButtonElement>('[data-luna-clear]')!.disabled=!!chat.pending;
      showLunaBtw(side,chat.pendingBtw?{question:chat.pending,answer:'Чекаємо на відповідь…'}:chat.btw);
      log.replaceChildren(...messages.map(message=>{
        const row=document.createElement('div');
        const label=document.createElement('strong');
        const text=document.createElement('div');
        text.className='sql-chat-answer';
        if('question' in message){row.className='sql-chat-user';label.textContent='Ти';text.textContent=message.question;}
        else{label.textContent=message.provider==='demo'?'Luna · демо':message.provider==='openai'?'Luna':message.model;text.innerHTML=chatMarkup(message.answer);}
        row.append(label,text);
        return row;
      }));
      log.hidden=!messages.length;
      log.scrollTop=log.scrollHeight;
      question.readOnly=!!chat.pending;
      if(question.value!==chat.draft)question.value=chat.draft;
      button.disabled=!chat.draft.trim()||!!chat.pending;
      status.textContent=chat.pending?'Чекаємо на відповідь…':chat.error;
    };
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!chat.pending&&chat.draft.trim())void this.ask(chat,{sessionId,taskId,question:chat.draft.trim(),feedback:chat.feedback});
    });
    this.update();
  }

  private async ask(chat:Conversation,request:SQLChatRequest){
    const parsed=lunaQuestion(request.question,'Дай одну практичну пораду з цієї SQL-теми.');
    chat.pending=parsed.question;
    chat.pendingBtw=parsed.btw;
    chat.error='';
    this.update();
    try {
      this.onSend(request.sessionId,request.taskId);
      const reply=await window.recall.sqlChat({...request,luna:{...this.prefs,history:parsed.btw?[]:chat.messages.slice(1-this.prefs.limit).map(message=>
        'question' in message?{role:'user',text:message.question}:{role:'assistant',text:message.answer}
      )}});
      if(parsed.btw)chat.btw={question:parsed.question,answer:reply.answer};
      else chat.messages=[...chat.messages,{question:parsed.question},reply].slice(-LUNA_MAX);
      chat.draft='';
    } catch(error) {
      chat.error=error instanceof Error?error.message.replace(/^Error invoking remote method .*?: Error: /,''):'Чат тимчасово недоступний.';
    } finally {
      chat.pending='';
      chat.pendingBtw=false;
      if(this.conversation===chat)this.update();
    }
  }
}
