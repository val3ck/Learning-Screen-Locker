'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
class Conflict extends Error{constructor(message='Урок уже відкритий в іншому вікні.',status=409){super(message);this.status=status;}}
class EnglishRepository{
  constructor(root,{validate,createDefault,now=()=>Date.now()}={}){this.root=path.resolve(root);this.file=path.join(this.root,'state.json');this.validate=validate;this.createDefault=createDefault;this.now=now;}
  read(){
    for(const suffix of ['', '.bak'])try{const data=JSON.parse(fs.readFileSync(this.file+suffix,'utf8'));return this.validate?this.validate(data):data;}catch(error){if(error.code!=='ENOENT'&&!suffix)this.damaged=true;}
    if(fs.existsSync(this.file)||fs.existsSync(this.file+'.bak'))throw new Conflict('Збереження English пошкоджене. Потрібне відновлення з резервної копії.',503);
    return this.createDefault();
  }
  atomic(file,value){const temp=file+'.tmp';fs.writeFileSync(temp,JSON.stringify(value,null,2),'utf8');if(fs.existsSync(file)&&!(this.damaged&&file===this.file))try{JSON.parse(fs.readFileSync(file,'utf8'));fs.copyFileSync(file,file+'.bak');}catch{}fs.renameSync(temp,file);if(file===this.file)this.damaged=false;}
  locked(work){
    fs.mkdirSync(this.root,{recursive:true});const lock=this.file+'.lock';let descriptor;
    try{descriptor=fs.openSync(lock,'wx');fs.writeFileSync(descriptor,JSON.stringify({pid:process.pid,at:this.now()}));}
    catch(error){if(error.code!=='EEXIST')throw error;try{const saved=JSON.parse(fs.readFileSync(lock,'utf8'));let alive=true;try{process.kill(saved.pid,0);}catch(e){if(e.code==='ESRCH')alive=false;}if(!alive){fs.unlinkSync(lock);return this.locked(work);}}catch{}throw new Conflict('Збереження зайняте іншим вікном. Спробуй ще раз.',503);}
    try{return work();}finally{fs.closeSync(descriptor);try{fs.unlinkSync(lock);}catch{}}
  }
  lease(){try{const value=JSON.parse(fs.readFileSync(path.join(this.root,'owner.json'),'utf8'));return value.expiresAt>this.now()?value:null;}catch{return null;}}
  readonly(owner){const lease=this.lease();return !!lease&&lease.owner!==owner;}
  acquire(owner){return this.locked(()=>{if(this.readonly(owner))throw new Conflict();this.atomic(path.join(this.root,'owner.json'),{owner,expiresAt:this.now()+45000,pid:process.pid});return this.read();});}
  renew(owner){this.locked(()=>{if(this.readonly(owner))throw new Conflict();this.atomic(path.join(this.root,'owner.json'),{owner,expiresAt:this.now()+45000,pid:process.pid});});}
  release(owner){this.locked(()=>{if(this.lease()?.owner===owner)try{fs.unlinkSync(path.join(this.root,'owner.json'));}catch{}});}
  write(value,expectedRevision,owner){return this.locked(()=>{if(this.readonly(owner))throw new Conflict();const previous=this.read();if(previous.revision!==expectedRevision)throw new Conflict('Є новіший прогрес. Чернетку збережено окремо; онови стан.');const next=this.validate?this.validate(value):structuredClone(value);next.revision=previous.revision+1;this.atomic(this.file,next);return next;});}
  backup(value,label='import'){fs.mkdirSync(path.join(this.root,'backups'),{recursive:true});const file=path.join(this.root,'backups',`${label}-${this.now()}-${crypto.randomBytes(3).toString('hex')}.json`);fs.writeFileSync(file,JSON.stringify(value,null,2));return file;}
  repair(value){return this.locked(()=>{if(this.readonly('desktop'))throw new Conflict();for(const suffix of ['', '.bak'])if(fs.existsSync(this.file+suffix)){fs.mkdirSync(path.join(this.root,'backups'),{recursive:true});fs.copyFileSync(this.file+suffix,path.join(this.root,'backups',`damaged-${this.now()}${suffix}.json`));}const next=this.validate(value);next.revision=1;this.damaged=true;this.atomic(this.file,next);return next;});}
  audioPath(key){
    if(typeof key!=='string'||key.trim()!==key||!/^[\w-]{1,150}:(?:monologue|retry|turn-[0-3]|live-speaking-(?:0|[1-9]\d{0,15}))$/.test(key))
      throw new Conflict('Некоректний ідентифікатор аудіо.',400);
    return path.join(this.root,'audio',crypto.createHash('sha256').update(key).digest('hex'));
  }
  saveAudio(key,bytes,mime,owner){if(this.readonly(owner))throw new Conflict();if(!Buffer.isBuffer(bytes))bytes=Buffer.from(bytes);if(!bytes.length||bytes.length>10000000||!/^audio\/(?:webm|ogg|mp4|wav)(?:;[\w=.-]+)*$/.test(mime))throw new Conflict('Некоректний або надто великий аудіозапис.',400);const file=this.audioPath(key);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',bytes);fs.renameSync(file+'.tmp',file+'.audio');this.atomic(file+'.json',{key,mime});return path.basename(file);}
  loadAudio(key){const file=this.audioPath(key);try{const meta=JSON.parse(fs.readFileSync(file+'.json','utf8'));return {base64:fs.readFileSync(file+'.audio').toString('base64'),mime:meta.mime};}catch{return null;}}
}
module.exports={EnglishRepository,Conflict};
