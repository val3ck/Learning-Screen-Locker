import type {EnglishLesson,EnglishSpeechRequest} from './types';
export function englishSpeechText(lesson:EnglishLesson,request:EnglishSpeechRequest):string{
  if(!request||typeof request!=='object')throw new Error('Некоректний запит озвучення.');
  if(request.kind==='dialogue')return lesson.listening.dialogue.map(turn=>turn.text).join('\n\n');
  if(request.kind==='model')return lesson.speaking.model;
  if(request.kind==='word'&&Number.isInteger(request.index)&&request.index>=0&&request.index<lesson.vocabulary.length)return lesson.vocabulary[request.index].en;
  if(request.kind==='catch-word'&&Number.isInteger(request.index)&&request.index>=0&&Array.isArray(lesson.listening.catchWords)&&request.index<lesson.listening.catchWords.length)return lesson.listening.catchWords[request.index].word;
  throw new Error('Цього фрагмента немає в поточному уроці.');
}
