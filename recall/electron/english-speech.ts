import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,readdir,stat,unlink} from 'node:fs/promises';
import path from 'node:path';
import type {EnglishSpeechAudio} from '../src/modules/english/types';

// The command is constant. Lesson text is JSON on stdin, never shell source.
const command=String.raw`
$ErrorActionPreference='Stop'
[Console]::InputEncoding=New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$synth=$null
$stream=$null
try {
  $request=[Console]::In.ReadToEnd() | ConvertFrom-Json
  Add-Type -AssemblyName System.Speech
  $synth=New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice=$synth.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'en' } | Select-Object -First 1
  if(-not $voice){throw 'NO_LOCAL_ENGLISH_VOICE'}
  $synth.SelectVoice($voice.VoiceInfo.Name)
  $synth.Rate=-1
  $stream=New-Object System.IO.MemoryStream
  $synth.SetOutputToWaveStream($stream)
  $synth.Speak([string]$request.text)
  $synth.SetOutputToNull()
  [Console]::Out.Write((@{mime='audio/wav';voice=$voice.VoiceInfo.Name;language=$voice.VoiceInfo.Culture.Name;base64=[Convert]::ToBase64String($stream.ToArray())} | ConvertTo-Json -Compress))
} catch {
  [Console]::Error.Write($_.Exception.Message)
  exit 1
} finally {
  if($synth){$synth.Dispose()}
  if($stream){$stream.Dispose()}
}
`;
const MAX_AUDIO_BYTES=8*1024*1024;
export function validateSpeechAudio(value:unknown):EnglishSpeechAudio {
  const a=value as EnglishSpeechAudio;
  if(a?.mime!=='audio/wav'||typeof a.voice!=='string'||a.voice.length>200||typeof a.language!=='string'||!/^en(?:-|$)/i.test(a.language)||typeof a.base64!=='string'||a.base64.length>MAX_AUDIO_BYTES*1.4||!/^[A-Za-z0-9+/]+={0,2}$/.test(a.base64))throw new Error('Windows повернула некоректне озвучення.');
  const bytes=Buffer.from(a.base64,'base64');
  if(bytes.length<=44||bytes.length>MAX_AUDIO_BYTES||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw new Error('Windows не створила звуковий файл.');
  return {base64:a.base64,mime:'audio/wav',voice:a.voice,language:a.language};
}
export async function renderWindowsSpeech(text:string):Promise<EnglishSpeechAudio>{
  if(process.platform!=='win32')throw new Error('Локальне озвучення Windows недоступне. Можна обрати текстовий аналог.');
  const executable=path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
  return new Promise((resolve,reject)=>{
    const child=spawn(executable,['-NoLogo','-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(command,'utf16le').toString('base64')],{windowsHide:true,stdio:['pipe','pipe','pipe']});
    let output='',errors='',settled=false;
    const end=(error?:Error,result?:EnglishSpeechAudio)=>{if(settled)return;settled=true;clearTimeout(timer);if(error)reject(error);else resolve(result!);};
    const timer=setTimeout(()=>{child.kill();end(new Error('Озвучення Windows не відповіло за 20 секунд. Можна повторити або обрати текстовий аналог.'));},20000);
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
    child.stdout.on('data',(chunk:string)=>{output+=chunk;if(output.length>MAX_AUDIO_BYTES*1.4){child.kill();end(new Error('Звуковий файл перевищив дозволений розмір.'));}});
    child.stderr.on('data',(chunk:string)=>{if(errors.length<4000)errors+=chunk;});
    child.on('error',()=>end(new Error('Не вдалося запустити локальне озвучення Windows.')));
    child.stdin.on('error',()=>{});
    child.on('close',code=>{if(settled)return;if(code!==0){end(new Error(errors.includes('NO_LOCAL_ENGLISH_VOICE')?'У Windows не встановлено англійський голос. Можна обрати текстовий аналог.':'Локальне озвучення Windows недоступне. Можна повторити або обрати текстовий аналог.'));return;}try{end(undefined,validateSpeechAudio(JSON.parse(output)));}catch(error){end(error as Error);}});
    child.stdin.end(JSON.stringify({text}),'utf8');
  });
}
export class EnglishSpeech {
  private pending=new Map<string,Promise<EnglishSpeechAudio>>();
  private queue:Promise<unknown>=Promise.resolve();
  constructor(private root:string,private generate=renderWindowsSpeech){}
  synthesize(text:string):Promise<EnglishSpeechAudio>{
    if(typeof text!=='string'||!text.trim()||text.length>8000)return Promise.reject(new Error('Некоректний текст озвучення.'));
    const key=createHash('sha256').update('windows-english-v1\0'+text).digest('hex');
    const existing=this.pending.get(key);if(existing)return existing;
    const result=this.queue.catch(()=>{}).then(async()=>{
      const file=path.join(this.root,key+'.json');
      try{return validateSpeechAudio(JSON.parse(await readFile(file,'utf8')));}catch{}
      const audio=validateSpeechAudio(await this.generate(text));
      await mkdir(this.root,{recursive:true});await writeFile(file+'.tmp',JSON.stringify(audio),'utf8');await rename(file+'.tmp',file);
      await this.prune(file);return audio;
    });
    this.queue=result;this.pending.set(key,result);
    void result.finally(()=>this.pending.delete(key)).catch(()=>{});return result;
  }
  private async prune(current:string){
    const files=await Promise.all((await readdir(this.root)).filter(n=>/^[a-f0-9]{64}\.json$/.test(n)).map(async n=>{const file=path.join(this.root,n),s=await stat(file);return {file,size:s.size,time:s.mtimeMs};}));
    let size=files.reduce((n,f)=>n+f.size,0);for(const f of files.sort((a,b)=>a.time-b.time)){if(size<=64*1024*1024)break;if(f.file===current)continue;await unlink(f.file);size-=f.size;}
  }
}
