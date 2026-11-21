import {CODE_LANGUAGES,compilerProgram} from './programs.js';
const API='https://wandbox.org/api/compile.json';
function runJavaScript(code,tests,signal){
  return new Promise((resolve,reject)=>{
    const frame=document.createElement('iframe');frame.hidden=true;frame.sandbox='allow-scripts';frame.src=new URL('./runner-frame.html',import.meta.url).href;
    const id=crypto.randomUUID();let timer;
    const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',message);signal?.removeEventListener('abort',abort);frame.remove();};
    const abort=()=>{cleanup();reject(new DOMException('Cancelled','AbortError'));};
    const message=e=>{if(e.source!==frame.contentWindow||e.data?.id!==id)return;const result=e.data;cleanup();if(result.error)reject(new Error(result.error));else resolve({results:result.results,output:result.output||'',compiler:'Browser JavaScript'});};
    window.addEventListener('message',message);signal?.addEventListener('abort',abort,{once:true});
    frame.onload=()=>frame.contentWindow.postMessage({id,code,tests},'*');
    timer=setTimeout(()=>{cleanup();reject(new Error('JavaScript execution timed out.'));},6500);
    if(signal?.aborted){abort();return;}document.body.append(frame);
  });
}
export function parseCompilerResult(result,tests){
  if(String(result.status)!=='0'||result.signal)throw new Error((result.compiler_error||result.compiler_message||result.program_error||result.signal||'Compilation failed.').slice(0,2400));
  const output=result.program_output||'',values=new Map();
  for(const line of output.split(/\r?\n/)){const match=line.match(/^__NQ(\d+)__(.*)$/);if(match)values.set(Number(match[1]),match[2].trim());}
  return {results:tests.map((test,i)=>{const raw=values.get(i),actual=raw!==undefined&&/^-?\d+(\.\d+)?$/.test(raw)?Number(raw):raw??null;return {...test,actual,passed:typeof actual==='number'&&actual===test.expected};}),output:output.replace(/^__NQ.*$/gm,'').trim().slice(0,2400),compiler:'Wandbox'};
}
export async function runCode(language,code,tests,{signal,onStatus=()=>{}}={}){
  if(!CODE_LANGUAGES[language])throw new Error('Unknown language.');if(code.length>32000)throw new Error('Keep this exercise below 32,000 characters.');
  if(language==='javascript')return runJavaScript(code,tests,signal);
  const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
  const timer=setTimeout(()=>controller.abort(),50000);onStatus('remote');
  try{
    const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({compiler:CODE_LANGUAGES[language].compiler,code:compilerProgram(language,code,tests),save:false}),signal:controller.signal});
    if(!response.ok)throw new Error(`Online compiler unavailable (${response.status}). Try again, or use JavaScript.`);
    const result=JSON.parse(await response.text());return {...parseCompilerResult(result,tests),compiler:CODE_LANGUAGES[language].compiler};
  }catch(error){if(controller.signal.aborted&&!signal?.aborted)throw new Error('Online execution timed out. Try again.');throw error;}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
