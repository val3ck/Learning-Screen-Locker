'use strict';
const fs=require('node:fs'),path=require('node:path'),net=require('node:net'),{spawn}=require('node:child_process');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function courseMatches(text){
  const matches=[],add=(offset,length,replacements,message,ruleId)=>matches.push({offset,length,replacements,message,ruleId,category:'Course grammar'});
  const verbs={help:'helps',use:'uses',build:'builds',work:'works',need:'needs',check:'checks',send:'sends',provide:'provides',allow:'allows',make:'makes',run:'runs',support:'supports',do:'does',have:'has'};
  const singular=/\b(our|the|my|your|this)\s+(project|feature|app|service|system|component|developer|user|tester|designer)\s+(help|use|build|work|need|check|send|provide|allow|make|run|support|do|have)\b/gi;
  for(const m of text.matchAll(singular)){const prefix=text.slice(Math.max(0,m.index-45),m.index),tail=text.slice(m.index+m[0].length);if(/(?:does|did|can|could|will|would|should|may|might|must)\s+$/i.test(prefix)||/\s+(?:cases?|pages?|tools?|files?|pipelines?|processes?)\b/i.test(tail.slice(0,20)))continue;const offset=m.index+m[0].length-m[3].length;add(offset,m[3].length,[verbs[m[3].toLowerCase()]],`If “${m[2]}” is the subject here, use “${verbs[m[3].toLowerCase()]}” in the present simple.`,'RECALL_PRESENT_SIMPLE_SINGULAR');}
  const plural=/\b(I|we|you|they)\s+(helps|uses|builds|works|needs|checks|sends|provides|allows|makes|runs|supports|does|has)\b/gi;
  for(const m of text.matchAll(plural)){const verb=Object.entries(verbs).find(([,form])=>form===m[2].toLowerCase())?.[0];if(verb)add(m.index+m[0].length-m[2].length,m[2].length,[verb],`Use the base verb “${verb}” after “${m[1]}” in the present simple.`,'RECALL_PRESENT_SIMPLE_BASE');}
  for(const m of text.matchAll(/\bhelps?\s+(patient|user|developer|customer)\s+(?:book|use|choose|find|test|create|manage)\b/gi)){const offset=m.index+m[0].indexOf(m[1]);add(offset,m[1].length,[m[1]+'s','a '+m[1]],`“${m[1]}” is a singular countable noun. Use a plural or add an article.`,'RECALL_COUNTABLE_OBJECT');}
  for(const m of text.matchAll(/\bbook\s+(appointment)\b/gi))add(m.index+m[0].lastIndexOf(m[1]),m[1].length,['appointments','an appointment'],'Use “book appointments” for bookings in general, or “book an appointment” for one booking.','RECALL_APPOINTMENT_ARTICLE');
  return matches;
}
class OfflineEnglishChecker{
  constructor({root,workerFile=__filename,nodePath=process.execPath}={}){this.root=root;this.workerFile=workerFile;this.nodePath=nodePath;this.worker=null;this.starting=null;this.url=null;this.queue=Promise.resolve();this.idle=null;}
  async start(){
    if(this.url&&this.worker?.exitCode===null)return this.url;if(this.starting)return this.starting;
    this.starting=(async()=>{
      const java=path.join(this.root,'jre','bin','java.exe'),jar=path.join(this.root,'languagetool','languagetool-server.jar');
      if(!fs.existsSync(java)||!fs.existsSync(jar))throw Error('The offline language checker is not installed. Your answer is saved.');
      const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
      const worker=spawn(java,['-Xms64m','-Xmx768m','-Dfile.encoding=UTF-8','-cp','languagetool-server.jar','org.languagetool.server.HTTPServer','--port',String(port),'--config',path.join(this.root,'server.properties')],{cwd:path.join(this.root,'languagetool'),windowsHide:true,stdio:['pipe','ignore','pipe']});this.worker=worker;worker.stdin.on('error',()=>{});worker.stderr.on('data',()=>{});let failed;worker.on('error',()=>{failed=true;});worker.on('exit',()=>{if(this.worker===worker){this.url=null;this.worker=null;}});
      this.watcher=spawn(this.nodePath,[this.workerFile,'--watch',String(worker.pid),String(process.pid)],{windowsHide:true,stdio:['pipe','ignore','ignore'],env:{...process.env,ELECTRON_RUN_AS_NODE:'1'}});this.watcher.stdin.on('error',()=>{});this.watcher.on('error',()=>{});
      const urls=['http://[::1]:'+port,'http://127.0.0.1:'+port];const deadline=Date.now()+45000;
      while(Date.now()<deadline){if(failed||worker.exitCode!==null){await this.stop();throw Error('The offline language checker could not start. Your answer is saved.');}try{const url=await Promise.any(urls.map(async candidate=>{const response=await fetch(candidate+'/v2/languages',{signal:AbortSignal.timeout(1000)});if(!response.ok)throw Error('Not ready');return candidate;}));this.url=url;return url;}catch{}await pause(150);}
      await this.stop();throw Error('The offline language checker took too long to start. Try again; your answer is saved.');
    })().finally(()=>{this.starting=null;});return this.starting;
  }
  check(text){
    if(typeof text!=='string'||text.length>12000||!text.trim())return Promise.reject(Error('Write an English sentence before checking it (maximum 12,000 characters).'));
    const request=this.queue.catch(()=>{}).then(async()=>{if(this.idle)clearTimeout(this.idle);const url=await this.start();let response;
      try{response=await fetch(url+'/v2/check',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({language:'en-US',text,level:'default'}),signal:AbortSignal.timeout(45000)});}catch{throw Error('The offline check did not finish. Your answer is saved; try again.');}
      if(!response.ok&&response.status===500)response=await fetch(url+'/v2/check',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({language:'en-US',text}),signal:AbortSignal.timeout(45000)});
      if(!response.ok)throw Error('The offline checker could not check this text. Your answer is saved.');
      const raw=await response.json();if(!Array.isArray(raw.matches))throw Error('Invalid response from the offline checker.');
      const matches=raw.matches.slice(0,40).map(m=>({message:String(m.message||'Check this wording.').slice(0,1500),offset:Number(m.offset),length:Number(m.length),replacements:(m.replacements||[]).slice(0,5).map(r=>String(r.value).slice(0,500)),ruleId:String(m.rule?.id||''),category:String(m.rule?.category?.name||'Language')})).filter(m=>Number.isInteger(m.offset)&&m.offset>=0&&Number.isInteger(m.length)&&m.length>=0&&m.offset+m.length<=text.length);
      this.idle=setTimeout(()=>void this.stop(),5*60000);this.idle.unref?.();
      for(const m of courseMatches(text))if(!matches.some(old=>old.offset===m.offset&&old.length===m.length))matches.push(m);matches.sort((a,b)=>a.offset-b.offset);matches.splice(60);
      return {version:1,source:'local-rules',engine:'LanguageTool 6.6 + course rules',text,matches,checkedAt:new Date().toISOString(),reviewed:matches.length===0,ignored:false};
    });this.queue=request;return request;
  }
  async stop(){if(this.idle)clearTimeout(this.idle);this.idle=null;this.url=null;const worker=this.worker;this.worker=null;const watcher=this.watcher;this.watcher=null;watcher?.stdin.end();if(!worker)return;await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);resolve();};const timer=setTimeout(()=>{worker.kill();finish();},4000);worker.once('exit',finish);worker.kill();if(worker.exitCode!==null)finish();});}
}
if(require.main===module&&process.argv[2]==='--watch'){const pid=Number(process.argv[3]),parent=Number(process.argv[4]);const stop=()=>{try{process.kill(pid);}catch{}process.exit(0);};process.stdin.resume();process.stdin.on('end',stop);setInterval(()=>{try{process.kill(parent,0);}catch{stop();}},2000).unref();}
module.exports={OfflineEnglishChecker,courseMatches};
