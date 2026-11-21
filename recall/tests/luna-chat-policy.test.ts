import assert from 'node:assert/strict';
import test from 'node:test';
import {cleanLunaText,forLunaModel,lunaModel,lunaOptions,lunaQuestion} from '../../shared/luna-chat';

test('Luna allows five to twenty messages including the new question, with bounded turn text',()=>{
  const history=Array.from({length:30},(_,n)=>({role:'user',text:String(n)+'a'.repeat(1000)}));
  const opts=lunaOptions({limit:999,minimal:false,history});
  assert.equal(opts.limit,20);
  assert.equal(opts.minimal,false);
  assert.equal(opts.history.length,19);
  assert.equal(opts.history[0].text.slice(0,2),'11');
  assert.equal(opts.history.at(-1)?.text.length,450);
  assert.deepEqual(lunaOptions({limit:2,history:[]}),{limit:5,minimal:true,history:[]});
});

test('Luna parses English and Ukrainian side questions without matching ordinary words',()=>{
  assert.deepEqual(lunaQuestion('/btw\nWhy is that?','default'),{btw:true,question:'Why is that?'});
  assert.deepEqual(lunaQuestion('/бтв','default'),{btw:true,question:'default'});
  assert.equal(lunaQuestion('/btworld','default').btw,false);
});

test('Luna applies a selected provider independently and removes configured keys from chat text',()=>{
  const baseline={models:{openai:'luna',groq:'default'},order:['openai','groq'],automaticFallback:true};
  assert.deepEqual(forLunaModel(baseline,lunaModel({provider:'groq',model:'openai/gpt-oss-120b'})),{
    models:{openai:'luna',groq:'openai/gpt-oss-120b'},order:['groq'],automaticFallback:false,
  });
  assert.equal(baseline.models.groq,'default');
  assert.equal(lunaModel({provider:'unknown',model:'valid-id'}),undefined);
  assert.equal(cleanLunaText('key custom-secret',450,['custom-secret']),'key [secret removed]');
});
