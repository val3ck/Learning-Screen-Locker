import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Soundscape} from '../dist/audio.js';

class Param {constructor(){this.value=0;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}cancelScheduledValues(){}setTargetAtTime(v){this.value=v;}}
class Node {constructor(){this.gain=new Param();this.frequency=new Param();this.detune=new Param();this.pan=new Param();this.Q=new Param();this.delayTime=new Param();for(const p of ['threshold','knee','ratio','attack','release'])this[p]=new Param();}connect(){}disconnect(){}start(){}stop(){this.onended?.();}}
class Context {
  constructor(){this.state='suspended';this.currentTime=0;this.destination=new Node();this.sources=0;}
  createGain(){return new Node();}createBiquadFilter(){return new Node();}createStereoPanner(){return new Node();}createDelay(){return new Node();}createDynamicsCompressor(){return new Node();}
  createOscillator(){this.sources++;return new Node();}
  async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){this.state='closed';}
}
test('Audio stays locked before a gesture, preserves the silent opening, and never creates duplicate contexts',async()=>{
  let created=0;const ctx=new Context(),sound=new Soundscape({}, {contextFactory:()=>{created++;return ctx;}});
  try{
    assert.equal(created,0);sound.setScene('game');assert.equal(created,0);
    sound.setScene('silent');await sound.unlock();assert.equal(sound.graph.master.gain.value,0);assert.equal(sound.tick('a'),false);
    sound.setScene('game');ctx.currentTime=0.02;sound.pump();const sources=ctx.sources;
    await sound.unlock();await sound.unlock();assert.equal(created,1);assert.equal(ctx.sources,sources);
    sound.setMuted(true);assert.equal(sound.graph.master.gain.value,0);assert.equal(sound.tick('a'),false);
  }finally{sound.dispose();}
});
test('Dialogue ticks skip whitespace and stay sparse at rapid typing speeds',async()=>{
  const ctx=new Context(),sound=new Soundscape({}, {contextFactory:()=>ctx});
  try{
    sound.setScene('intro');await sound.unlock();let emitted=0;
    for(let i=0;i<100;i++){ctx.currentTime=i*0.01;if(sound.tick('a'))emitted++;}
    assert.ok(emitted>0&&emitted<=15);assert.equal(sound.tick(' '),false);assert.equal(sound.tick('.'),false);
    sound.setMenu(true);ctx.currentTime+=1;assert.equal(sound.tick('a'),false);
  }finally{sound.dispose();}
});
test('An interrupted old dialogue cannot undo the new dialogue ducking',async()=>{
  const ctx=new Context(),sound=new Soundscape({music:0.24}, {contextFactory:()=>ctx});
  try{
    sound.setScene('game');await sound.unlock();const old=sound.beginDialogue(),next=sound.beginDialogue();
    sound.endDialogue(old);assert.equal(sound.speaking,true);assert.ok(sound.graph.music.gain.value<sound.settings.music);
    sound.endDialogue(next);assert.equal(sound.speaking,false);assert.equal(sound.graph.music.gain.value,sound.settings.music);
  }finally{sound.dispose();}
});
test('Returning from a stalled scheduler does not play a backlog of notes',async()=>{
  const ctx=new Context(),sound=new Soundscape({}, {contextFactory:()=>ctx});
  try{
    sound.setScene('game');await sound.unlock();const before=ctx.sources;ctx.currentTime=3600;sound.pump();
    assert.ok(ctx.sources-before<=7);sound.setHidden(true);assert.equal(sound.graph.master.gain.value,0);assert.equal(sound.timer,null);
    sound.dispose();assert.equal(ctx.state,'closed');assert.equal(sound.voices.size,0);
  }finally{sound.dispose();}
});
