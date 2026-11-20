import {BrowserWindow,screen} from 'electron';
import path from 'node:path';
import type {WarningStatus} from '../src/core/contracts';

export class WarningPanel {
  window:BrowserWindow|null=null;
  constructor(private preloadRoot:string,private postpone:()=>void){}
  get visible(){return !!this.window&&!this.window.isDestroyed()&&this.window.isVisible();}
  show(status:WarningStatus){
    if(this.window&&!this.window.isDestroyed()){this.update(status);return;}
    const area=screen.getPrimaryDisplay().workArea,width=Math.min(380,area.width-24),height=145;
    const win=new BrowserWindow({width,height,x:area.x+area.width-width-16,y:area.y+area.height-height-16,frame:false,resizable:false,minimizable:false,maximizable:false,skipTaskbar:true,show:false,focusable:false,alwaysOnTop:true,backgroundColor:'#f5f4ee',webPreferences:{preload:path.join(this.preloadRoot,'warning-preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
    this.window=win;win.setAlwaysOnTop(true,'screen-saver');
    win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    win.webContents.on('will-navigate',event=>event.preventDefault());
    win.webContents.on('did-fail-load',(_event,code)=>{if(code!==-3&&this.window===win&&!win.isDestroyed())this.postpone();});
    win.webContents.on('render-process-gone',()=>{if(this.window===win&&!win.isDestroyed())this.postpone();});
    win.on('close',event=>{event.preventDefault();this.postpone();});
    win.on('closed',()=>{if(this.window===win)this.window=null;});
    win.once('ready-to-show',()=>{if(!win.isDestroyed()){win.showInactive();this.update(status);}});
    void win.loadURL(process.env.RECALL_DEV_URL?new URL('warning.html',process.env.RECALL_DEV_URL).href:'recall://app/warning.html').catch(()=>{if(this.window===win&&!win.isDestroyed())this.postpone();});
  }
  update(status:WarningStatus){if(this.window&&!this.window.isDestroyed())this.window.webContents.send('recall:warning-tick',status);}
  destroy(){const win=this.window;this.window=null;if(win&&!win.isDestroyed())win.destroy();}
}
