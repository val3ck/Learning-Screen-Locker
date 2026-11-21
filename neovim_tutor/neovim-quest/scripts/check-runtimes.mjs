import {runCode} from '../dist/runner.js';
import {referenceCode,defaultTests} from '../dist/programs.js';
for(const language of (process.argv.length>2?process.argv.slice(2):['python','go','c','cpp','rust'])){
  const started=Date.now();
  try{
    const result=await runCode(language,referenceCode(3,language),defaultTests(3));
    const passed=result.results.filter(t=>t.passed).length;
    console.log(JSON.stringify({language,compiler:result.compiler,passed,total:result.results.length,ms:Date.now()-started}));
    if(passed!==result.results.length)process.exitCode=1;
  }catch(error){console.log(JSON.stringify({language,error:error.message,ms:Date.now()-started}));process.exitCode=1;}
}
