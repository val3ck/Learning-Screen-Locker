import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VimEngine } from '../dist/engine.js';
import { chapters } from '../dist/course.js';

const keys = (engine, sequence) => { let event;for (const key of sequence) event=engine.key(key);return event; };
const esc='Escape',enter='Enter';
const solutions = [
  [['l','l','l','l','l','l'],['j','j'],['h','h','h','h','h'],['k','k']],
  [['i',...'hello ',esc],['A','!',esc],['o',...'ready',esc],['r','v']],
  [[...':w',enter],[...':q',enter,...':q!',enter],[...':wq',enter]],
  [['w','w'],['e'],['b'],['$','0']],
  [['x'],['d','d'],['d','w'],['d','d','u']],
  [['2','d','w'],['c','i','w',...'true',esc],['d','$']],
  [['y','y','p'],['v','e','y'],['V','j','y','p']],
  [[...'/portal',enter],[...'/portal',enter,'n'],[...':%s/red/green/g',enter]],
  [[...'/false',enter,'c','i','w',...'true',esc],[...'/debug',enter,'d','d'],[...':wq',enter]]
];
chapters.forEach((chapter,c)=>chapter.missions.forEach((mission,m)=>{
  test(`Mission ${c+1}.${m+1}: ${mission.title}`,()=>{
    const engine=new VimEngine(mission.text,mission.cursor);if(mission.modified)engine.savedText='';
    const context={};let passed=false;
    for(const key of solutions[c][m]){
      const before=engine.text,event=engine.key(key);
      if(event.action==='command'&&engine.error&&event.command===':q')context.blockedQuit=true;
      if(event.command==='$')context.visitedEnd=true;
      if(event.action==='delete'&&engine.text!==before)context.deleted=true;
      if(mission.check(engine,event,context))passed=true;
    }
    assert.ok(passed,`Unsolvable mission; final buffer: ${engine.text}; cursor ${engine.row}:${engine.col}; mode ${engine.mode}`);
  });
}));
test('Insert session is one undo unit; redo restores the complete edit',()=>{
  const e=new VimEngine('world');keys(e,['i',...'hello ',esc]);assert.equal(e.text,'hello world');e.key('u');assert.equal(e.text,'world');e.key('C-r');assert.equal(e.text,'hello world');
});
test('Search wraps and missing searches leave cursor untouched',()=>{
  const e=new VimEngine('portal\nportal',[1,0]);keys(e,[...'/portal',enter]);assert.equal(e.row,0);e.key('n');assert.equal(e.row,1);e.key('N');assert.equal(e.row,0);keys(e,[...'/missing',enter]);assert.equal(e.row,0);assert.equal(e.error,true);
});
test('Unsaved quit is refused, write clears dirty, then quit closes',()=>{
  const e=new VimEngine('a');keys(e,['A','b',esc]);keys(e,[...':q',enter]);assert.equal(e.exited,false);assert.equal(e.error,true);keys(e,[...':w',enter]);assert.equal(e.dirty,false);keys(e,[...':q',enter]);assert.equal(e.exited,true);
});
test('Counts before and after the operator multiply',()=>{
  const e=new VimEngine('a b c d e f g');keys(e,[...'2d3w']);assert.equal(e.text,'g');e.key('u');assert.equal(e.text,'a b c d e f g');
});
test('Character registers and line registers paste differently',()=>{
  const e=new VimEngine('abc');keys(e,['x','p']);assert.equal(e.text,'bac');
  const f=new VimEngine('abc\ndef');keys(f,['d','d','p']);assert.equal(f.text,'def\nabc');
});
test('Whole-line deletion keeps a valid empty buffer',()=>{
  const e=new VimEngine('only');keys(e,['d','d']);assert.deepEqual(e.lines,['']);assert.equal(e.row,0);assert.equal(e.col,0);keys(e,['i','x',esc]);assert.equal(e.text,'x');
});
test('Visual deletion, range undo, counted replace, and repeat',()=>{
  const e=new VimEngine('hello world');keys(e,['v','e','d']);assert.equal(e.text,' world');e.key('u');assert.equal(e.text,'hello world');keys(e,['0','2','r','x']);assert.equal(e.text,'xxllo world');keys(e,['w','.']);assert.equal(e.text,'xxllo xxrld');
});
test('Esc cancels partial operators and commands without changing text',()=>{
  const e=new VimEngine('safe');keys(e,['2','d',esc,'l']);assert.equal(e.col,1);assert.equal(e.text,'safe');keys(e,[...':q!',esc]);assert.equal(e.exited,false);assert.equal(e.mode,'normal');
});
test('Substitute affects only current line unless % is specified',()=>{
  const e=new VimEngine('red red\nred');keys(e,[...':s/red/green/',enter]);assert.equal(e.text,'green red\nred');keys(e,[...':%s/red/blue/g',enter]);assert.equal(e.text,'green blue\nblue');e.key('u');assert.equal(e.text,'green red\nred');
});
