import {BrowserWindow,WebContentsView,ipcMain,screen} from 'electron';
import {spawn,type ChildProcess} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {setTimeout as wait} from 'node:timers/promises';
import {FocusGuard} from './focus-guard';
import type {Store} from './store';
import {clockDue,kyivDayKey,type ClockTime} from '../src/core/calendar';
import {minuteMs} from '../src/core/tracks';
import {SNOOZE_MS} from '../src/core/scheduler';

export const BROWSER_TUTORS=['git','vim'] as const;
export type BrowserTutorId=typeof BROWSER_TUTORS[number];
type Tutor={id:BrowserTutorId;title:string;root:string;data:string;initialTotal:number};
type Progress={done:number;total:number};
type Endpoint={version:1;id:BrowserTutorId;pid:number;origin:string;token?:string};
type Offer={day:string;offered:boolean;snoozedUntil?:number};
type Schedule={version:1;offers:Partial<Record<BrowserTutorId,Offer>>};
type Session={tutor:Tutor;window:BrowserWindow;site:WebContentsView;deadline:number;monotonicDeadline:number;closing:boolean;ready:boolean};
const file='schedules/browser-tutors.json';
const page='recall://app/browser-tutor.html';
const validOffer=(o:Offer)=>o&&/^\d{4}-\d{2}-\d{2}$/.test(o.day)&&typeof o.offered==='boolean'&&
  (o.snoozedUntil===undefined||Number.isFinite(o.snoozedUntil));

export class BrowserTutors {
  private schedule:Schedule={version:1,offers:{}};
  private session:Session|null=null;
  private invitation:{tutor:Tutor;window:BrowserWindow;day:string}|null=null;
  private readonly guard=new FocusGuard();
  private covers:BrowserWindow[]=[];
  private checking=false;
  private launching=false;
  private probeAt=0;
  private testServers=new Set<ChildProcess>();
  private asking=new WeakSet<Session>();

  constructor(private tutors:Partial<Record<BrowserTutorId,Tutor>>,private options:{
    store:Store;preloadRoot:string;isolated:boolean;testGuard:boolean;
    chat:(id:BrowserTutorId,value:unknown)=>Promise<unknown>;
    chatPreferences:(id:BrowserTutorId,value?:unknown)=>Promise<unknown>;
    duration:(id:BrowserTutorId)=>number;startTime:(id:BrowserTutorId)=>ClockTime|null;
    isAvailable:()=>boolean;beforeStart:()=>void;update:()=>void;warn:(message:string)=>void;
  }){}

  get busy(){return this.launching||!!this.session||!!this.invitation;}
  get protected(){return this.guard.active;}

  async init(){
    this.schedule=await this.options.store.read(file,this.schedule,value=>{
      const s=value as Schedule;
      return s?.version===1&&!!s.offers&&BROWSER_TUTORS.every(id=>s.offers[id]===undefined||validOffer(s.offers[id]!));
    });
    ipcMain.handle('recall:tutor-chat',async(event,value:unknown)=>{
      const run=this.session;
      if(!run||event.sender!==run.site.webContents||event.senderFrame!==run.site.webContents.mainFrame||!run.ready||run.closing)
        throw Error('Відкрий активну вправу в Recall.');
      if(this.asking.has(run))throw Error('Дочекайся попередньої відповіді Luna.');
      this.asking.add(run);
      try{return await this.options.chat(run.tutor.id,value);}
      finally{this.asking.delete(run);}
    });
    ipcMain.handle('recall:tutor-chat-preferences',async(event,value:unknown)=>{
      const run=this.session;
      if(!run||event.sender!==run.site.webContents||event.senderFrame!==run.site.webContents.mainFrame||run.closing)
        throw Error('Відкрий тренажер у Recall.');
      return this.options.chatPreferences(run.tutor.id,value);
    });
    ipcMain.handle('recall:vim-session',async(event,action:unknown)=>{
      const run=this.session;
      if(run?.tutor.id!=='vim'||event.sender!==run.site.webContents||
          event.senderFrame!==run.site.webContents.mainFrame||!run.ready||run.closing)
        throw Error('Відкрий активну сесію Neovim Quest.');
      if(action==='state')return {deadline:run.deadline};
      if(action==='finish')return this.finish();
      throw Error('Невідома дія Neovim Quest.');
    });
    ipcMain.handle('recall:tutor-state',event=>{
      if(event.sender===this.session?.window.webContents)return {
        mode:'session',title:this.session.tutor.title,deadline:this.session.deadline,showBar:this.session.tutor.id!=='vim',
      };
      if(event.sender===this.invitation?.window.webContents)return {mode:'invite',title:this.invitation.tutor.title};
      throw Error('Невідоме вікно тренажера.');
    });
    ipcMain.handle('recall:tutor-action',async(event,action:unknown)=>{
      if(event.sender===this.session?.window.webContents&&action==='finish')return this.finish();
      if(event.sender!==this.invitation?.window.webContents||action!=='start'&&action!=='snooze')throw Error('Невідома дія тренажера.');
      const {tutor,day}=this.invitation;
      this.closeInvitation();
      if(action==='snooze'){
        this.schedule.offers[tutor.id]={day,offered:false,snoozedUntil:Date.now()+SNOOZE_MS};
        await this.save();
        return;
      }
      await this.open(tutor.id).catch(error=>this.options.warn(String(error)));
    });
  }

  private save(){return this.options.store.write(file,this.schedule);}
  private async endpoint(tutor:Tutor):Promise<Endpoint|null>{
    try{
      const value=JSON.parse(await readFile(path.join(tutor.data,'recall-endpoint.json'),'utf8')) as Endpoint;
      if(value.version!==1||value.id!==tutor.id||!Number.isSafeInteger(value.pid)||value.pid<=0||
          !/^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(value.origin)||tutor.id==='git'&&!/^[a-f0-9]{48}$/.test(value.token||''))return null;
      const response=await fetch(value.origin+'/api/recall/status',{redirect:'error',signal:AbortSignal.timeout(600),
        headers:value.token?{'X-Git-Tutor-Token':value.token}:{}});
      const status=await response.json() as {version:number;id:string};
      return response.ok&&status.version===1&&status.id===tutor.id?value:null;
    }catch{return null;}
  }

  private async ensureEndpoint(tutor:Tutor){
    const existing=await this.endpoint(tutor);
    if(existing)return existing;
    const env={...process.env,...(tutor.id==='git'?{GIT_TUTOR_DATA_DIR:tutor.data}:{VIM_TUTOR_DATA_DIR:tutor.data}),
      ...(this.options.isolated&&tutor.id==='vim'?{VIM_TUTOR_EPHEMERAL:'1'}:{})};
    const server=spawn('node',[path.join(tutor.root,'server.mjs')],{
      cwd:tutor.root,env,windowsHide:true,detached:!this.options.isolated,stdio:'ignore',
    });
    let failed=false;
    server.on('error',()=>{failed=true;});
    if(this.options.isolated){
      this.testServers.add(server);
      server.once('exit',()=>this.testServers.delete(server));
    }
    server.unref();
    for(let attempt=0;attempt<26&&!failed;attempt++){
      const endpoint=await this.endpoint(tutor);
      if(endpoint)return endpoint;
      await wait(150);
    }
    throw Error(`${tutor.title} не відповів. Перевір, чи встановлено Node.js${tutor.id==='git'?' і Git':''} та чи закритий сервер попередньої версії тренажера.`);
  }

  async progress(id:BrowserTutorId):Promise<Progress|null>{
    const tutor=this.tutors[id];
    if(!tutor)return null;
    const name=path.join(tutor.data,id==='git'?'progress.json':'progress-v1.json');
    let damaged=false;
    for(const suffix of ['', '.bak'])try{
      const value=JSON.parse(await readFile(name+suffix,'utf8'));
      if(value.version===1){
        if(id==='git'&&value.missions&&typeof value.missions==='object'&&!Array.isArray(value.missions)){
          return {done:Math.min(tutor.initialTotal,Object.values(value.missions).filter(row=>(row as {completed?:boolean})?.completed===true).length),total:tutor.initialTotal};
        }
        const s=value.summary;
        if(id==='vim'&&Number.isInteger(s?.done)&&Number.isInteger(s.total)&&s.done>=0&&s.done<=s.total&&s.total>0)return s;
      }
      damaged=true;
    }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')damaged=true;}
    return damaged?null:{done:0,total:tutor.initialTotal};
  }

  async tick(now:Date,active:boolean){
    if(this.session&&this.guard.active&&(now.getTime()>=this.session.deadline||performance.now()>=this.session.monotonicDeadline))this.release();
    const day=kyivDayKey(now);
    if(this.invitation&&this.invitation.day!==day)this.closeInvitation();
    if(this.options.isolated||this.checking||!active||this.busy||!this.options.isAvailable()||now.getTime()<this.probeAt)return;
    const tutor=BROWSER_TUTORS.map(id=>this.tutors[id]).find(t=>{
      if(!t)return false;
      const start=this.options.startTime(t.id),status=this.schedule.offers[t.id];
      return !!start&&clockDue(now,start)&&(status?.day!==day||!status.offered&&(!status.snoozedUntil||status.snoozedUntil<=now.getTime()));
    });
    if(!tutor)return;
    this.checking=true;this.probeAt=now.getTime()+5000;
    try{
      this.schedule.offers[tutor.id]={day,offered:true};await this.save();
      const start=this.options.startTime(tutor.id);
      if(this.busy||!this.options.isAvailable()||!start||!clockDue(new Date(),start)){
        this.schedule.offers[tutor.id]={day,offered:false};await this.save();return;
      }
      this.invite(tutor,day);
    }finally{this.checking=false;}
  }

  async settingChanged(id:BrowserTutorId){
    this.probeAt=0;
    if(this.invitation?.tutor.id!==id)return;
    const {day}=this.invitation;
    this.closeInvitation();
    this.schedule.offers[id]={day,offered:false};await this.save();
  }

  private trusted(options:Electron.BrowserWindowConstructorOptions){
    const win=new BrowserWindow({show:false,backgroundColor:'#202b25',autoHideMenuBar:true,...options,
      webPreferences:{preload:path.join(this.options.preloadRoot,'browser-tutor-preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false}});
    win.setMenu(null);
    win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    win.webContents.on('will-navigate',event=>event.preventDefault());
    return win;
  }

  private invite(tutor:Tutor,day:string){
    const area=screen.getPrimaryDisplay().workArea;
    const win=this.trusted({width:330,height:155,x:area.x+area.width-350,y:area.y+area.height-175,frame:false,alwaysOnTop:true,skipTaskbar:true});
    this.invitation={tutor,window:win,day};
    win.once('closed',()=>{
      if(this.invitation?.window===win)this.invitation=null;
      this.options.update();
    });
    win.once('ready-to-show',()=>{if(!win.isDestroyed())win.showInactive();});
    void win.loadURL(page+'?invite').catch(()=>this.closeInvitation());
    this.options.update();
  }

  private closeInvitation(){
    const win=this.invitation?.window;
    this.invitation=null;
    if(win&&!win.isDestroyed())win.destroy();
    this.options.update();
  }

  async open(id:BrowserTutorId){
    const tutor=this.tutors[id];
    if(!tutor)throw Error('Не знайдено локальний тренажер. Перевір папку курсу.');
    if(this.busy||!this.options.isAvailable())throw Error('Спочатку заверши іншу сесію.');
    this.launching=true;
    try{
      const endpoint=await this.ensureEndpoint(tutor);
      if(!this.options.isAvailable())throw Error('Інша сесія вже почалася.');
      this.options.beforeStart();
      const fullscreen=!this.options.isolated||this.options.testGuard;
      const geometry=fullscreen?screen.getPrimaryDisplay().bounds:{width:1280,height:850};
      const win=this.trusted({...geometry,frame:false,minWidth:560,minHeight:480,title:tutor.title});
      const site=new WebContentsView({webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false,
        preload:path.join(this.options.preloadRoot,'browser-tutor-site-preload.cjs'),partition:this.options.isolated?'tutor-test-'+id:'persist:recall-tutor-'+id}});
      const duration=this.options.duration(id)*minuteMs;
      const run:Session={tutor,window:win,site,deadline:Date.now()+duration,monotonicDeadline:performance.now()+duration,closing:false,ready:false};
      this.session=run;
      win.contentView.addChildView(site);
      const layout=()=>{
        if(win.isDestroyed())return;
        const {width,height}=win.getContentBounds();
        const y=id==='vim'?0:52;
        site.setBounds({x:0,y,width,height:Math.max(1,height-y)});
      };
      win.on('resize',layout);win.on('enter-full-screen',layout);
      win.on('leave-full-screen',()=>{
        if(this.session===run&&this.guard.active&&!win.isDestroyed())win.setFullScreen(true);
        layout();
      });
      win.on('minimize',()=>{if(this.session===run&&this.guard.active&&!win.isDestroyed())win.restore();});
      layout();
      site.webContents.setWindowOpenHandler(()=>({action:'deny'}));
      site.webContents.on('will-navigate',(event,url)=>{if(new URL(url).origin!==endpoint.origin)event.preventDefault();});
      site.webContents.on('will-redirect',(event,url)=>{if(new URL(url).origin!==endpoint.origin)event.preventDefault();});
      site.webContents.on('before-input-event',(event,input)=>{
        if(this.guard.active&&(input.key==='F11'||input.alt&&input.key==='F4'))event.preventDefault();
      });
      site.webContents.on('render-process-gone',()=>{if(this.session===run){this.dispose();this.options.warn(tutor.title+': вікно тренажера завершилося через збій.');}});
      win.on('query-session-end',()=>{if(this.session===run){this.release();void this.flush(run).catch(()=>{});}});
      win.on('close',event=>{
        if(this.session!==run||run.closing)return;
        event.preventDefault();
        if(!this.guard.active)void this.finish().catch(error=>this.options.warn(String(error)));
      });
      win.on('closed',()=>{if(this.session===run)this.dispose();});
      const load=new AbortController();
      try{
        await Promise.race([
          Promise.all([win.loadURL(page),site.webContents.loadURL(endpoint.origin+'/'+(endpoint.token?'#'+endpoint.token:''))]),
          wait(12000,undefined,{signal:load.signal}).then(()=>{throw Error('Тренажер не завантажився вчасно.');}),
        ]);
      }finally{load.abort();}
      if(this.session!==run||win.isDestroyed())return;
      run.ready=true;
      if(!this.options.isolated){this.schedule.offers[id]={day:kyivDayKey(new Date()),offered:true};await this.save();}
      if(this.session!==run||win.isDestroyed())return;
      if(fullscreen)win.setBounds(screen.getPrimaryDisplay().bounds);
      win.show();
      if(fullscreen){this.guard.enter(win);layout();this.coverDisplays();}
      site.webContents.focus();
    }catch(error){if(this.session)this.dispose();throw error;}
    finally{this.launching=false;this.options.update();}
  }

  resume(){
    const run=this.session;
    if(!run||run.window.isDestroyed())return;
    run.window.show();run.window.focus();run.site.webContents.focus();
  }

  private async flush(run:Session){
    if(!run.ready||run.site.webContents.isDestroyed())return;
    const result=await Promise.race([run.site.webContents.executeJavaScript('typeof window.recallSaveTutor === "function" ? window.recallSaveTutor() : false'),
      wait(7500,false)]);
    if(result!==true)throw Error('Збереження не підтверджено. Спробуй ще раз після завершення дії в тренажері.');
  }

  private async finish(){
    const run=this.session;
    if(!run||run.closing)return;
    run.closing=true;
    try{await this.flush(run);if(this.session===run)this.dispose();}
    finally{run.closing=false;}
  }

  private release(){
    const win=this.session?.window;
    this.guard.leave(win&&!win.isDestroyed()?win:null);
    for(const cover of this.covers)if(!cover.isDestroyed())cover.destroy();
    this.covers=[];
    this.options.update();
  }

  coverDisplays(){
    for(const cover of this.covers)if(!cover.isDestroyed())cover.destroy();
    this.covers=[];
    if(!this.guard.active||this.options.isolated&&!this.options.testGuard)return;
    const primary=screen.getPrimaryDisplay();
    for(const display of screen.getAllDisplays().filter(d=>d.id!==primary.id)){
      const cover=new BrowserWindow({...display.bounds,show:false,frame:false,skipTaskbar:true,focusable:false,alwaysOnTop:true,backgroundColor:'#102d29',
        webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}});
      cover.setAlwaysOnTop(true,'screen-saver');
      this.covers.push(cover);
      cover.once('ready-to-show',()=>{if(this.guard.active&&!cover.isDestroyed())cover.showInactive();});
      void cover.loadURL('recall://app/cover.html').catch(()=>{if(!cover.isDestroyed())cover.destroy();});
    }
  }

  private dispose(){
    const run=this.session;
    this.release();this.session=null;
    if(run){
      if(!run.site.webContents.isDestroyed())run.site.webContents.close();
      if(!run.window.isDestroyed())run.window.destroy();
    }
    this.options.update();
  }

  async close(){
    this.closeInvitation();
    await this.finish().catch(()=>this.dispose());
    for(const server of this.testServers)server.kill();
  }
}
