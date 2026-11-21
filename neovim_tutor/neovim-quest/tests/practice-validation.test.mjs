import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkAssignment} from '../dist/practice-validation.js';
import {ExamSession} from '../dist/exams.js';
import {VimEngine} from '../dist/engine.js';

const expected='status = "ready for the next move"';

test('Assignment checks allow harmless formatting without changing the buffer',()=>{
  for(const line of [expected+'   ','\t'+expected+'\r','status="ready for the next move"',"  status\t=\t'ready for the next move';  "]){
    const lines=[line];assert.equal(checkAssignment(lines,expected).done,true);assert.equal(lines[0],line);
  }
});

test('A correct assignment can move between lines or follow another draft',()=>{
  assert.equal(checkAssignment(['status = ', 'other = "text"',expected],expected).done,true);
  assert.equal(checkAssignment(['other = "ready for the next move"'],expected).done,false);
});

test('Identical-looking Cyrillic letters are rejected with their exact position',()=>{
  const line='status = "ready fоr the next move"'; // U+043E rather than Latin o.
  const result=checkAssignment([line],expected);
  assert.equal(result.done,false);assert.deepEqual(result.position,[0,17]);
  assert.match(result.hint.en,/Cyrillic «о» \(U\+043E\).*Latin «o»/);
  assert.match(result.hint.uk,/кириличну «о» \(U\+043E\).*латинську «o»/);
});

test('Confusable letters in a variable name also receive feedback',()=>{
  const result=checkAssignment([expected.replace('status','stаtus')],expected);
  assert.equal(result.done,false);assert.deepEqual(result.position,[0,2]);assert.match(result.hint.en,/U\+0430/);
});

test('Whitespace inside a string still matters and is explained',()=>{
  for(const [line,pattern] of [
    ['status = "ready  for the next move"',/remove a space/],
    ['status = "readyfor the next move"',/insert a space/],
    ['status = "ready for the next move "',/remove a space/],
    ['status = "ready\u00a0for the next move"',/non-breaking space \(U\+00A0\)/],
    ['status = "ready\u200b for the next move"',/zero-width space \(U\+200B\)/]
  ]){
    const result=checkAssignment([line],expected);assert.equal(result.done,false);assert.match(result.hint.en,pattern);
  }
});

test('A missing quote is reported, while untouched blanks stay quiet',()=>{
  const result=checkAssignment([expected.slice(0,-1)],expected);
  assert.equal(result.done,false);assert.match(result.hint.en,/insert «"»/);
  assert.deepEqual(result.position,[0,expected.length-1]);
  assert.deepEqual(checkAssignment(['status = '],expected),{done:false,hint:null,position:null});
});

test('Formatting does not block the completed exercise or erase the saved attempt',()=>{
  const original=new ExamSession(1,0);
  for(const text of ['"cursor" ','"ready for the next move"  ',"'one key, one small step' "]){
    original.key('A');for(const char of text)original.key(char);original.key('Escape');original.key('j');
  }
  for(const char of '013lrv')original.key(char);
  assert.equal(original.done,true);
  const snapshot=original.snapshot(),restored=new ExamSession(1,0,'javascript',snapshot);
  assert.equal(restored.done,true);assert.equal(restored.main.text,snapshot.main.text);
});

test('The checklist exposes a mismatch after Escape and clears it after correction',()=>{
  const s=new ExamSession(1,0);
  s.main=new VimEngine('name = "cursor"\nstatus = "ready fоr the next move"\nmessage = "one key, one small step"\neditor = "neovim"',[1,17]);
  assert.equal(s.objectives.find(g=>g.key==='field1').done,false);
  assert.deepEqual(s.objectives.find(g=>g.key==='field1').position,[1,17]);
  s.key('i');assert.equal(s.objectives.find(g=>g.key==='field1').hint,undefined);s.key('Escape');
  s.main.col=17;s.key('r');s.key('o');
  assert.equal(s.objectives.find(g=>g.key==='field1').done,true);
  assert.equal(s.objectives.find(g=>g.key==='field1').hint,null);
});
