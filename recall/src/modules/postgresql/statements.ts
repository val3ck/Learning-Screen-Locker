// Split only at SQL statement boundaries, preserving comments and quoted bodies.
// This is a lexer for transaction observation, not a SQL correctness checker.
interface Statement {sql:string;words:string[];calls:string[]}
export function statements(sql:string):Statement[]{
  const result:Statement[]=[];let start=0,words:string[]=[],calls:string[]=[];
  let i=0;
  while(i<sql.length){
    if(sql.startsWith('--',i)){const end=sql.indexOf('\n',i+2);i=end<0?sql.length:end+1;continue;}
    if(sql.startsWith('/*',i)){let depth=1;i+=2;while(i<sql.length&&depth){if(sql.startsWith('/*',i)){depth++;i+=2;}else if(sql.startsWith('*/',i)){depth--;i+=2;}else i++;}continue;}
    if(sql[i]==="'"||sql[i]==='"'){
      const quote=sql[i++];while(i<sql.length){if(sql[i]===quote){if(sql[i+1]===quote){i+=2;continue;}i++;break;}if(sql[i]==='\\'&&quote==="'"){i+=2;continue;}i++;}continue;
    }
    if(sql[i]==='$'){
      const match=sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/);if(match){const end=sql.indexOf(match[0],i+match[0].length);i=end<0?sql.length:end+match[0].length;continue;}
    }
    if(sql[i]===';'){if(words.length)result.push({sql:sql.slice(start,i+1),words,calls});words=[];calls=[];start=++i;continue;}
    const word=sql.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if(word){
      const name=word[0].toUpperCase();
      words.push(name);i+=word[0].length;
      if(/^\s*\(/.test(sql.slice(i)))calls.push(name);
    }else i++;
  }
  if(words.length)result.push({sql:sql.slice(start),words,calls});return result;
}
