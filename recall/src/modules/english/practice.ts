import type {EnglishAttempt,EnglishCourseState,EnglishLesson,EnglishPractice} from './types';
import * as Learning from './vendor/learning';
import {practiceGrammar} from './practice-grammar';

export const PRACTICE_VERSION=4;
const gap=/_{3,}/;

function grammarContext(p:EnglishPractice){
  // Reconstruct the same sentence from both legacy exercise formats.
  return Learning.normalize(p.kind==='choice'?p.prompt.replace(gap,()=>p.answer):p.answer);
}

export function practiceTask(lesson:EnglishLesson,record:EnglishAttempt|undefined,course:EnglishCourseState,index:number,history:EnglishPractice[]):EnglishPractice|null{
  const usedWords=new Set(history.filter(p=>p?.kind==='word').map(p=>Learning.normalize(p.wordId||p.answer)));
  const usedSentences=new Set(history.filter(p=>p?.kind==='choice'||p?.kind==='sentence').map(grammarContext));
  const words=lesson.vocabulary.map((word,i)=>{
    const meaning=word.definition||Learning.wordTask(word).clue;
    const result=record?.results['vocab-'+i];
    const needsReview=!!result?.assisted||Object.values(course.reviews).some(r=>r.kind==='vocabulary'&&r.unresolved&&Learning.normalize(r.answer)===Learning.normalize(word.en));
    return {word,meaning,needsReview};
  }).filter(({word})=>!usedWords.has(Learning.normalize(word.en)))
    .sort((a,b)=>Number(b.needsReview)-Number(a.needsReview));
  const grammar=(practiceGrammar[lesson.week-1]||[]).map(([prompt,answer,incorrect,other,explanation],i)=>{
    const result=record?.results['grammar-'+i];
    return {prompt,answer,incorrect,other,explanation,needsReview:!!result&&(result.assisted||!result.correct)};
  }).filter(q=>!usedSentences.has(Learning.normalize(q.prompt.replace(gap,()=>q.answer))))
    .sort((a,b)=>Number(b.needsReview)-Number(a.needsReview));

  const base={id:'practice-'+index,value:'',revealed:false,attempts:0,presentationVersion:PRACTICE_VERSION};
  if(words.length&&(index%3===0||!grammar.length)){
    const {word,meaning}=words[0];
    return {...base,kind:'word',instruction:'Type one word or phrase from the word bank.',
      prompt:'Which lesson word matches this meaning?',clue:meaning,answer:word.en,wordId:word.en,
      explanation:meaning,example:word.example,wordBank:lesson.vocabulary.map(w=>w.en)};
  }

  const q=grammar[0];
  if(!q)return null;
  if(index%3===1){
    const options=[q.incorrect,q.other];
    const correct=(index+Math.floor(index/3))%3;
    options.splice(correct,0,q.answer);
    return {...base,kind:'choice',instruction:'Choose one option to complete the sentence.',
      prompt:q.prompt,answer:q.answer,explanation:q.explanation,options,correct};
  }
  return {...base,kind:'sentence',instruction:'Fix the incorrect form. Type the whole sentence and keep the other words.',
    prompt:q.prompt.replace(gap,()=>q.incorrect),answer:q.prompt.replace(gap,()=>q.answer),explanation:q.explanation};
}

export function practiceMessage(p:EnglishPractice,correct:boolean){if(correct)return p.kind==='sentence'?'The corrected sentence matches the target structure.':'Correct.';if(p.kind==='word'&&(/\n/.test(p.value.trim())||p.value.trim().split(/\s+/).length>p.answer.split(/\s+/).length+2))return 'Type ONE missing word or phrase, not a list of lesson words.';if(p.kind==='word')return 'Read the meaning and choose one word or phrase from the word bank.';if(p.kind==='sentence')return 'Write the whole corrected sentence. Change the incorrect form and keep the other words.';return 'That does not fit this item. Read the sentence and try again.';}
