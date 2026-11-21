// Original, entirely procedural score. No samples, downloads, or third-party music.
export const DEFAULT_AUDIO = Object.freeze({ muted:false, dialogue:0.5, music:0 });
export const SCORE = Object.freeze({
  beat:60/72,
  chords:[[50,57,61,66],[47,54,57,62],[43,50,54,57],[45,52,59,61],[50,57,64,66],[47,54,62,66],[43,50,57,62],[45,52,57,64]],
  melody:[74,null,78,76, 73,null,69,74, 71,null,74,78, 76,null,73,null, 78,null,81,78, 74,null,78,76, 71,null,69,74, 73,null,76,null]
});
const hz = midi => 440 * 2 ** ((midi-69)/12);
const level = (value,fallback) => Number.isFinite(Number(value)) ? Math.max(0,Math.min(1,Number(value))) : fallback;
export function audioSettings(settings={}) { return {muted:settings.muted===true,dialogue:level(settings.dialogue,DEFAULT_AUDIO.dialogue),music:level(settings.music,DEFAULT_AUDIO.music)}; }
function smooth(param,value,now,time=0.08) { param.cancelScheduledValues(now);param.setTargetAtTime(value,now,time); }

// Shared synthesis functions are also rendered offline by the audio QA page.
export function tone(ctx,destination,{frequency,time,duration=1,attack=0.02,release=0.4,volume=0.05,type='sine',pan=0,detune=0,cutoff=1600},track){
  const oscillator=ctx.createOscillator(),envelope=ctx.createGain(),filter=ctx.createBiquadFilter();
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,time);oscillator.detune.setValueAtTime(detune,time);
  filter.type='lowpass';filter.frequency.value=cutoff;filter.Q.value=0.35;
  envelope.gain.setValueAtTime(0,time);envelope.gain.linearRampToValueAtTime(volume,time+attack);
  envelope.gain.setValueAtTime(volume,Math.max(time+attack,time+duration-release));envelope.gain.linearRampToValueAtTime(0,time+duration);
  oscillator.connect(filter);filter.connect(envelope);
  const panner=ctx.createStereoPanner?.();if(panner){panner.pan.value=pan;envelope.connect(panner);panner.connect(destination);}else envelope.connect(destination);
  const voice={oscillator,envelope,end:time+duration};track?.add(voice);
  oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();envelope.disconnect();panner?.disconnect();track?.delete(voice);};
  oscillator.start(time);oscillator.stop(time+duration+0.02);return voice;
}
export function pad(ctx,destination,index,time,track){
  const chord=SCORE.chords[index%SCORE.chords.length];
  chord.forEach((note,i)=>tone(ctx,destination,{frequency:hz(note),time,duration:9.8,attack:1.9,release:3.3,volume:0.035,pan:(i-1.5)*0.17,detune:i%2?2:-2,cutoff:950},track));
  tone(ctx,destination,{frequency:hz(chord[0]-12),time,duration:8.6,attack:2.2,release:3.4,volume:0.028,cutoff:350},track);
}
export function melody(ctx,destination,index,time,track){
  const note=SCORE.melody[index%SCORE.melody.length];if(note===null)return;
  tone(ctx,destination,{frequency:hz(note),time,duration:2.2,attack:0.022,release:2.1,volume:0.067,pan:Math.sin(index*1.7)*0.25,cutoff:2400},track);
  tone(ctx,destination,{frequency:hz(note+12),time:time+0.006,duration:0.85,attack:0.015,release:0.8,volume:0.006,pan:-0.15,cutoff:2600},track);
}
export function dialogueTone(ctx,destination,char,kind,time,track){
  const base=kind==='question'?166:kind==='wake'?180:196;
  const pitch=[-1,0,2,0,1][char.codePointAt(0)%5];
  tone(ctx,destination,{frequency:base*2**(pitch/12),time,duration:0.044,attack:0.004,release:0.033,volume:0.087,type:'triangle',cutoff:1350,pan:0},track);
  tone(ctx,destination,{frequency:base*3.01,time,duration:0.023,attack:0.003,release:0.018,volume:0.009,cutoff:1900},track);
}
export function cueTone(ctx,destination,time,complete=false,track){
  (complete?[62,69,74]:[69,74]).forEach((note,i)=>tone(ctx,destination,{frequency:hz(note),time:time+i*0.095,duration:0.48,attack:0.012,release:0.45,volume:complete?0.055:0.04,pan:(i-1)*0.12,cutoff:2200},track));
}
export function createAudioGraph(ctx){
  const effects=ctx.createGain(),music=ctx.createGain(),musicInput=ctx.createGain(),master=ctx.createGain(),limiter=ctx.createDynamicsCompressor();
  effects.gain.value=0;music.gain.value=0;master.gain.value=0;
  limiter.threshold.value=-15;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=0.008;limiter.release.value=0.3;
  effects.connect(master);musicInput.connect(music);music.connect(master);master.connect(limiter);limiter.connect(ctx.destination);
  // Two quiet, non-feedback echoes add space without an accumulating tail.
  const delays=[0.29,0.47].map((seconds,i)=>{const delay=ctx.createDelay(1),wet=ctx.createGain(),filter=ctx.createBiquadFilter();delay.delayTime.value=seconds;wet.gain.value=i?0.07:0.12;filter.type='lowpass';filter.frequency.value=1700;musicInput.connect(delay);delay.connect(filter);filter.connect(wet);wet.connect(music);return [delay,wet,filter];});
  return {effects,music,musicInput,master,limiter,delays};
}

export class Soundscape {
  constructor(settings={},options={}){
    this.settings=audioSettings(settings);this.contextFactory=options.contextFactory||(()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)({latencyHint:'interactive'}));
    this.ctx=null;this.graph=null;this.scene='silent';this.hidden=false;this.menu=false;this.speaking=false;this.dialogueId=0;this.lastTick=-Infinity;
    this.timer=null;this.sleepTimer=null;this.nextPad=0;this.nextNote=0;this.padIndex=0;this.noteIndex=0;this.voices=new Set();this.unsupported=false;this.disposed=false;
    this.onchange=options.onchange||(()=>{});
  }
  get state(){return this.unsupported?'unavailable':this.settings.muted?'muted':!this.ctx?'locked':this.ctx.state;}
  async unlock(){
    if(this.disposed||this.settings.muted)return false;
    if(this.ctx?.state==='running')return true;
    try{
      if(!this.ctx){this.ctx=this.contextFactory();this.graph=createAudioGraph(this.ctx);this.ctx.onstatechange=()=>this.onchange(this.state);}
      // resume() is called synchronously inside the user's gesture, before any await.
      const resume=this.ctx.state==='suspended'?this.ctx.resume():Promise.resolve();await resume;
      this.unsupported=false;this.sync();this.onchange(this.state);return true;
    }catch{this.unsupported=true;this.onchange(this.state);return false;}
  }
  setScene(scene){this.scene=scene;this.sync();}
  setHidden(hidden){this.hidden=hidden;this.sync();}
  setMenu(open){this.menu=open;this.sync();}
  setMuted(muted){this.settings.muted=!!muted;this.sync();this.onchange(this.state);}
  setVolume(channel,value){if(channel!=='dialogue'&&channel!=='music')return;this.settings[channel]=level(value,this.settings[channel]);this.sync();}
  beginDialogue(){this.speaking=true;this.sync();return ++this.dialogueId;}
  endDialogue(id){if(id!==this.dialogueId)return;this.speaking=false;this.sync();}
  tick(char,kind='mission'){
    if(!this.canPlay()||this.menu||!this.settings.dialogue||!/[\p{L}\p{N}]/u.test(char))return false;
    const now=this.ctx.currentTime;if(now-this.lastTick<0.068)return false;this.lastTick=now;
    dialogueTone(this.ctx,this.graph.effects,char,kind,now+0.004,this.voices);return true;
  }
  cue(complete=false){if(this.canPlay()&&this.settings.dialogue)cueTone(this.ctx,this.graph.effects,this.ctx.currentTime+0.005,complete,this.voices);}
  canPlay(){return this.ctx?.state==='running'&&!this.disposed&&!this.hidden&&!this.settings.muted&&this.scene!=='silent';}
  sync(){
    if(!this.ctx||this.disposed)return;
    clearTimeout(this.sleepTimer);const now=this.ctx.currentTime,quiet=this.hidden||this.settings.muted||this.scene==='silent';
    smooth(this.graph.master.gain,quiet?0:0.72,now,quiet?0.035:0.3);
    smooth(this.graph.effects.gain,this.settings.dialogue,now,0.04);
    smooth(this.graph.music.gain,(this.scene==='game'?this.settings.music:0)*(this.speaking?0.48:1)*(this.menu?0.65:1),now,this.speaking?0.15:0.7);
    if(quiet){clearInterval(this.timer);this.timer=null;this.sleepTimer=setTimeout(()=>{if(!this.disposed&&(this.hidden||this.settings.muted||this.scene==='silent'))this.ctx.suspend().catch(()=>{});},180);return;}
    if(this.ctx.state==='suspended')this.ctx.resume().then(()=>this.startMusic()).catch(()=>{});
    else this.startMusic();
  }
  startMusic(){
    if(!this.canPlay()||this.scene!=='game'||!this.settings.music){clearInterval(this.timer);this.timer=null;return;}
    if(this.timer)return;
    const now=this.ctx.currentTime;
    // A suspended context keeps musical time. Do not queue all missed notes.
    if(this.nextPad<now){this.nextPad=now+0.2;this.nextNote=now+SCORE.beat*1.5;}
    this.pump();this.timer=setInterval(()=>this.pump(),160);
  }
  pump(){
    if(!this.canPlay()||this.scene!=='game')return;const now=this.ctx.currentTime,until=now+0.45;
    if(this.nextPad<now-0.1){this.nextPad=now+0.05;this.nextNote=now+SCORE.beat;}
    while(this.nextPad<until){pad(this.ctx,this.graph.musicInput,this.padIndex++,this.nextPad,this.voices);this.nextPad+=SCORE.beat*8;}
    while(this.nextNote<until){melody(this.ctx,this.graph.musicInput,this.noteIndex++,this.nextNote,this.voices);this.nextNote+=SCORE.beat*2;}
  }
  dispose(){this.disposed=true;clearInterval(this.timer);clearTimeout(this.sleepTimer);for(const voice of this.voices){try{voice.oscillator.stop();}catch{}}this.voices.clear();this.ctx?.close().catch(()=>{});}
}

// Offline preview uses exactly the game's synthesis and mixer, without autoplay.
export async function renderSoundPreview(seconds=18,options=DEFAULT_AUDIO){
  const ctx=new OfflineAudioContext(2,Math.ceil(44100*seconds),44100),g=createAudioGraph(ctx);
  const settings=audioSettings(options),master=settings.muted?0:0.72;
  g.master.gain.value=master;g.effects.gain.value=settings.dialogue;g.music.gain.value=settings.music;
  g.music.gain.setTargetAtTime(settings.music*0.48,1.8,0.15);g.music.gain.setTargetAtTime(settings.music,5.2,0.7);
  for(let i=0;i*SCORE.beat*8<seconds;i++)pad(ctx,g.musicInput,i,0.1+i*SCORE.beat*8);
  for(let i=0;i*SCORE.beat*2+1<seconds;i++)melody(ctx,g.musicInput,i,1+i*SCORE.beat*2);
  const phrase='Waiting for something?';let time=2;
  for(const char of phrase){if(/[\p{L}\p{N}]/u.test(char))dialogueTone(ctx,g.effects,char,'question',time);time+=0.12;}
  cueTone(ctx,g.effects,9,true);
  g.master.gain.setValueAtTime(master,seconds-2);g.master.gain.linearRampToValueAtTime(0,seconds);
  return ctx.startRendering();
}
