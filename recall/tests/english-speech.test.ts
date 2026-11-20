import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {EnglishSpeech,validateSpeechAudio} from '../electron/english-speech';
import {englishSpeechText} from '../src/modules/english/speech-content';
import {waitForEnglishVoice} from '../src/modules/english/speech-voices';
import * as Course from '../src/modules/english/vendor/course';
import type {EnglishSpeechAudio,EnglishLesson} from '../src/modules/english/types';
const lessons=(Course as unknown as {lessons:EnglishLesson[]}).lessons;
function audio():EnglishSpeechAudio{const wave=Buffer.alloc(48);wave.write('RIFF');wave.writeUInt32LE(40,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(22050,24);wave.writeUInt32LE(44100,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(4,40);return {base64:wave.toString('base64'),mime:'audio/wav',voice:'Local English',language:'en-US'};}
test('Windows speech cache: offline audio, shared requests, Unicode paths and damaged cache recovery',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'recall-голос-'));let generated=0;
  try{const service=new EnglishSpeech(root,async text=>{generated++;assert.equal(text,"A project's $(text) stays data.");return audio();});const text="A project's $(text) stays data.";
    const [first,second]=await Promise.all([service.synthesize(text),service.synthesize(text)]);assert.deepEqual(first,second);assert.equal(generated,1);
    assert.deepEqual(await new EnglishSpeech(root,async()=>{throw Error('cache must be used');}).synthesize(text),first);
    const file=(await readdir(root)).find(n=>n.endsWith('.json'))!;await writeFile(path.join(root,file),'broken');await service.synthesize(text);assert.equal(generated,2);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('Speech failures recover without accepting empty, remote or invalid audio',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'recall-speech-error-'));let calls=0;
  try{const service=new EnglishSpeech(root,async()=>{if(++calls===1)throw Error('No voice');return audio();});await assert.rejects(()=>service.synthesize(''),/Некоректний/);await assert.rejects(()=>service.synthesize('x'.repeat(8001)),/Некоректний/);assert.equal(calls,0);await assert.rejects(()=>service.synthesize('First try'),/No voice/);assert.ok((await service.synthesize('Retry')).base64);
    assert.throws(()=>validateSpeechAudio({...audio(),language:'ru-RU'}));assert.throws(()=>validateSpeechAudio({...audio(),base64:'AQID'}));
  }finally{await rm(root,{recursive:true,force:true});}
});
test('Speech IPC selects only known content from all 84 lessons',()=>{
  for(const lesson of lessons){assert.equal(englishSpeechText(lesson,{kind:'word',index:0}),lesson.vocabulary[0].en);assert.equal(englishSpeechText(lesson,{kind:'model'}),lesson.speaking.model);assert.ok(englishSpeechText(lesson,{kind:'dialogue'}).includes(lesson.listening.dialogue[0].text));}
  assert.throws(()=>englishSpeechText(lessons[0],{kind:'word',index:-1}));assert.throws(()=>englishSpeechText(lessons[0],{kind:'word',index:99}));assert.throws(()=>englishSpeechText(lessons[0],{kind:'text',text:'arbitrary'} as any));
});
test('Browser speech waits for voiceschanged and never substitutes a remote or Russian voice',async()=>{
  let voices:SpeechSynthesisVoice[]=[];const synth=Object.assign(new EventTarget(),{getVoices:()=>voices}) as unknown as SpeechSynthesis;
  const english={lang:'en-US',localService:true} as SpeechSynthesisVoice;
  const delayed=waitForEnglishVoice(synth,100);voices=[english];synth.dispatchEvent(new Event('voiceschanged'));assert.equal(await delayed,english);
  voices=[{lang:'ru-RU',localService:true},{lang:'en-US',localService:false}] as SpeechSynthesisVoice[];assert.equal(await waitForEnglishVoice(synth,10),undefined);
  voices=[];assert.equal(await waitForEnglishVoice(synth,10),undefined);
});
