export const EXAMS_PER_CHAPTER=3;
export function nextPosition({chapter,step=0,exam=null,solved=false,sandbox=false,completed},chapters){
  if(sandbox)return {sandbox:true};
  if(!solved)return exam===null?{chapter,step}:{chapter,step:chapters[chapter].missions.length-1,exam};
  if(exam!==null){if(completed){const missing=completed.findIndex(done=>!done);if(missing>=0)return {chapter,step,exam:missing};}else if(exam<2)return {chapter,step,exam:exam+1};return chapter+1<chapters.length?{chapter:chapter+1,step:0}:{sandbox:true};}
  if(step+1<chapters[chapter].missions.length)return {chapter,step:step+1};
  if(completed){const missing=completed.findIndex(done=>!done);if(missing>=0)return {chapter,step,exam:missing};return chapter+1<chapters.length?{chapter:chapter+1,step:0}:{sandbox:true};}
  return {chapter,step,exam:0};
}
