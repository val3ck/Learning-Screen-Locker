import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createNavigationRoute,movementArena,movementStart,pointerFor} from '../dist/scenes.js';
import {VimEngine} from '../dist/engine.js';
import {chapters} from '../dist/course.js';
import {ui,dialogueText,localizedWiki,missionTitle,chapterTitle} from '../dist/i18n.js';

test('Random routes cover three separate zones and every target is keyboard-reachable',()=>{
  for(const random of [()=>0,()=>0.999999,Math.random]){
    for(let attempt=0;attempt<20;attempt++){
      const route=createNavigationRoute(random),engine=new VimEngine(movementArena,movementStart);
      assert.equal(new Set(route.map(p=>p.join(','))).size,3);
      for(const [row,col]of route){
        assert.equal(engine.lines[row][col],' ');
        while(engine.row!==row)engine.key(engine.row<row?'j':'k');
        while(engine.col!==col)engine.key(engine.col<col?'l':'h');
        assert.deepEqual([engine.row,engine.col],[row,col]);
      }
      assert.equal(engine.text,movementArena);
    }
  }
});
test('Both languages cover every mission, hint, menu label and manual entry',()=>{
  assert.deepEqual(Object.keys(ui.en),Object.keys(ui.uk));
  for(const lang of ['en','uk']){
    chapters.forEach((chapter,c)=>{
      assert.ok(chapterTitle(lang,c));
      chapter.missions.forEach((_,s)=>{
        for(const value of [missionTitle(lang,c,s),dialogueText({kind:'mission',chapter:c,step:s},lang),dialogueText({kind:'hint',chapter:c,step:s},lang)]){
          assert.ok(value?.trim());if(lang==='en')assert.doesNotMatch(value,/[а-яіїєґ]/i);
        }
      });
    });
    assert.equal(localizedWiki(lang).length,20);
    for(const entry of localizedWiki(lang)){assert.ok(entry.title&&entry.body);if(lang==='en')assert.doesNotMatch(entry.title+entry.body,/[а-яіїєґ]/i);}
    for(const kind of ['question','wake','routeNext','routeLast','routeHit','success','finish','sandbox','closed','keyboard','fullscreen'])assert.ok(dialogueText({kind,chapter:0,step:0},lang));
  }
});
test('Pointers refer to the current random target and switch between line boundaries',()=>{
  const mission=chapters[3].missions[3],engine=new VimEngine(mission.text,mission.cursor);
  assert.deepEqual(pointerFor(0,0,mission,engine,{},[4,8]),{cell:[4,8]});
  assert.deepEqual(pointerFor(3,3,mission,engine,{}),{cell:[0,engine.lines[0].length-1]});
  assert.deepEqual(pointerFor(3,3,mission,engine,{visitedEnd:true}),{cell:[0,0]});
});
