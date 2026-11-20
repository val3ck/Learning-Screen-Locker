type Voices=Pick<SpeechSynthesis,'getVoices'|'addEventListener'|'removeEventListener'>;
export function localEnglishVoice(synth:Voices|undefined):SpeechSynthesisVoice|undefined{return synth?.getVoices().find(v=>v.localService&&/^en(?:-|$)/i.test(v.lang));}
export function waitForEnglishVoice(synth:Voices|undefined,timeoutMs=1000):Promise<SpeechSynthesisVoice|undefined>{
  const initial=localEnglishVoice(synth);if(initial||!synth||synth.getVoices().length)return Promise.resolve(initial);
  return new Promise(resolve=>{
    const finish=()=>{clearTimeout(timer);synth.removeEventListener('voiceschanged',changed);resolve(localEnglishVoice(synth));};
    const changed=()=>{if(localEnglishVoice(synth)||synth.getVoices().length)finish();};
    const timer=setTimeout(finish,timeoutMs);synth.addEventListener('voiceschanged',changed);changed();
  });
}
