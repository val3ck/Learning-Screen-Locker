import './warning.css';
import type {WarningStatus} from './core/contracts';
declare global {interface Window {recallWarning:{status():Promise<WarningStatus>;snooze():Promise<unknown>;start():Promise<void>;onTick(callback:(s:WarningStatus)=>void):()=>void}}}
for(const id of ['snooze','start'])document.getElementById(id)!.addEventListener('click',()=>{
  void (id==='snooze'?window.recallWarning.snooze():window.recallWarning.start()).catch(error=>{const el=document.getElementById('error')!;el.hidden=false;el.textContent=String(error);});
});
