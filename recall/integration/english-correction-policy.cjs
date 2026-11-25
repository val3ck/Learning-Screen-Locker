'use strict';

function expanded(text){
  return text.toLowerCase().replace(/[’‘]/g,"'").replace(/\b(do|does|did|is|are|was|were|has|have|had|could|should|would|must)n't\b/g,'$1 not').replace(/\s+/g,' ').trim();
}

function focusCorrection(correction,source){
  let {original,replacement}=correction;
  if(typeof source!=='string'||!source.includes(original)||expanded(original)===expanded(replacement))return null;
  const firstMatch=source.indexOf(original);
  const quoteStart=Number.isInteger(correction.start)&&correction.start>=0&&source.startsWith(original,correction.start)
    ?correction.start:source.indexOf(original,firstMatch+1)===-1?firstMatch:undefined;
  const before=[...original.matchAll(/\S+/g)],after=[...replacement.matchAll(/\S+/g)];
  let first=0,oldEnd=before.length,newEnd=after.length;
  while(first<oldEnd&&first<newEnd&&before[first][0]===after[first][0])first++;
  while(oldEnd>first&&newEnd>first&&before[oldEnd-1][0]===after[newEnd-1][0]){oldEnd--;newEnd--;}
  // Anchor a pure insertion or deletion to a neighboring word for a readable change.
  if(oldEnd===first||newEnd===first){
    if(first>0)first--;
    else if(oldEnd<before.length&&newEnd<after.length){oldEnd++;newEnd++;}
  }
  const span=(text,words,end)=>end>first?text.slice(words[first].index,words[end-1].index+words[end-1][0].length):'';
  original=span(original,before,oldEnd);replacement=span(replacement,after,newEnd);
  if(!original||oldEnd-first>5||newEnd-first>5||Math.max(original.length,replacement.length)>64)return null;
  if(expanded(original)===expanded(replacement))return null;
  // A short, wholly reworded sentence is still a rewrite.
  const anchor=quoteStart===undefined?undefined:quoteStart+before[first].index;
  const start=anchor??source.indexOf(original),end=start+original.length;
  const isSentence=/(?:^|[.!?])\s*$/.test(source.slice(0,start))&&
    (/[.!?]$/.test(original)||/^\s*(?:[.!?](?:\s|$)|$)/.test(source.slice(end)));
  if(isSentence&&oldEnd-first>=3&&newEnd-first>=3)return null;
  return {...correction,original,replacement,start:anchor};
}

function localArticleIssues(text){
  const issues=[];
  // In this construction "algorithm" is a countable noun, not a noun modifier.
  const phrase=/\b(?:version|copy|implementation|variant)\s+of\s+((?:prepared|existing|basic|simple|standard|complex|new)\s+algorithm)(?=\s*(?:[.,;!?]|$)|\s+(?:that|which)\b)/gi;
  for(const match of text.matchAll(phrase)){
    const original=match[1],start=match.index+match[0].length-original.length;
    const article=/^(?:existing)\b/i.test(original)?'an':'a';
    issues.push({start,end:start+original.length,original,replacement:article+' '+original,
      explanation:'“Algorithm” is singular and countable here. Add “'+article+'” before the noun phrase.',kind:'error'});
  }
  return issues;
}

function focusedCorrections(corrections,source){
  if(typeof source!=='string')return [];
  const local=localArticleIssues(source);
  const seen=new Set();
  const focused=(corrections||[]).flatMap(correction=>{
    if(!correction||typeof correction.original!=='string'||typeof correction.replacement!=='string'||typeof correction.explanation!=='string')return [];
    const result=focusCorrection(correction,source);
    if(!result)return [];
    if(local.some(issue=>issue.original.startsWith(result.original)||result.original.includes(issue.original)))return [];
    return [result];
  });
  return [...local,...focused]
    .filter(correction=>{
      const key=correction.original+'\n'+correction.replacement;
      if(seen.has(key))return false;
      seen.add(key);return true;
    }).slice(0,3);
}

module.exports={focusedCorrections,localArticleIssues};
