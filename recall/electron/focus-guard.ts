import type {BrowserWindow,Event,Input} from 'electron';

/** App-local focus boundary. Never hooks system shortcuts or blocks Windows. */
export class FocusGuard {
  active=false;
  enter(win:BrowserWindow){
    this.active=true;
    win.setMenuBarVisibility(false);win.setClosable(false);win.setMinimizable(false);win.setMaximizable(false);win.setResizable(false);
    win.setKiosk(true);win.setFullScreen(true);win.setAlwaysOnTop(true,'screen-saver');
  }
  leave(win:BrowserWindow|null){
    this.active=false;
    if(!win||win.isDestroyed())return;
    win.setKiosk(false);win.setAlwaysOnTop(false);win.setFullScreen(false);
    win.setClosable(true);win.setMinimizable(true);win.setMaximizable(true);win.setResizable(true);
  }
  preventClose(event:Pick<Event,'preventDefault'>,endingSystemSession=false):boolean {
    if(!this.active||endingSystemSession)return false;
    event.preventDefault();return true;
  }
  preventExitKey(event:Pick<Event,'preventDefault'>,input:Pick<Input,'key'|'alt'|'control'|'meta'>,endingSystemSession=false):boolean {
    if(!this.active||endingSystemSession)return false;
    if(input.meta)return false;
    const key=input.key.toLowerCase();
    const exits=!input.control&&!input.alt&&['f11','escape'].includes(key)||input.alt&&key==='f4'||input.control&&['w','q','r'].includes(key);
    if(exits)event.preventDefault();return exits;
  }
}
