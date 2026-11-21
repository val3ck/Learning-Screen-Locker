// Formatting outside the string is free; the string itself still has to be right.
const assignment = /^([ \t]*)([^\s=]+)[ \t]*=[ \t]*(["'])(.*?)\3[ \t]*;?[ \t\r]*$/u;
const header = /^([ \t]*)([^\s=]+)\s*=/u;
const lookalikes = {'а':'a','е':'e','о':'o','р':'p','с':'c','у':'y','х':'x','і':'i','ј':'j','ѕ':'s','А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P','С':'C','Т':'T','Х':'X','І':'I','Ј':'J'};
const latinShape = text => [...text].map(c => lookalikes[c] || c).join('');
const codepoint = c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0');

function character(c, language) {
  const names = language === 'uk'
    ? {' ':'пробіл','\t':'табуляція','\r':'повернення каретки','\u00a0':'нерозривний пробіл','\u200b':'невидимий пробіл','\u200c':'невидимий символ','\u200d':'невидимий символ','\ufeff':'невидимий символ'}
    : {' ':'a space','\t':'a tab','\r':'a carriage return','\u00a0':'a non-breaking space','\u200b':'a zero-width space','\u200c':'an invisible character','\u200d':'an invisible character','\ufeff':'an invisible character'};
  if (names[c]) return names[c] + (c.charCodeAt(0)>127 ? ` (${codepoint(c)})` : '');
  if (/\p{Script=Cyrillic}/u.test(c)) return `${language==='uk'?'кириличну':'Cyrillic'} «${c}» (${codepoint(c)})`;
  if (/\p{Script=Latin}/u.test(c)) return `${language==='uk'?'латинську':'Latin'} «${c}»`;
  return `«${c}»` + (c.charCodeAt(0)>127 ? ` (${codepoint(c)})` : '');
}

function difference(actual, expected, row, start) {
  const a=[...actual], b=[...expected];
  let i=0;
  while (i<a.length && i<b.length && a[i]===b[i]) i++;
  if (i===a.length && i===b.length) return null;
  const col=start+a.slice(0,i).join('').length;
  const extra=i===b.length || a.slice(i+1).join('')===b.slice(i).join('');
  const missing=i===a.length || b.slice(i+1).join('')===a.slice(i).join('');
  const hint={};
  for (const lang of ['en','uk']) {
    const location=lang==='uk'?`Рядок ${row+1}, позиція ${col+1}: `:`Line ${row+1}, col ${col+1}: `;
    hint[lang]=location+(extra
      ? (lang==='uk'?`прибери ${character(a[i],lang)}.`:`remove ${character(a[i],lang)}.`)
      : missing
        ? (lang==='uk'?`додай ${character(b[i],lang)}.`:`insert ${character(b[i],lang)}.`)
        : (lang==='uk'?`заміни ${character(a[i],lang)} на ${character(b[i],lang)}.`:`replace ${character(a[i],lang)} with ${character(b[i],lang)}.`));
  }
  return {hint,position:[row,col]};
}

export function checkAssignment(lines, expected) {
  const target=expected.match(assignment);
  if (!target) throw new Error('Expected a quoted assignment');
  const entries=lines.map((text,row)=>({text,row,parts:text.match(assignment),heading:text.match(header)}));
  if (entries.some(e=>e.parts?.[2]===target[2] && e.parts[4]===target[4])) return {done:true,hint:null,position:null};
  const candidate=entries.find(e=>e.heading?.[2]===target[2])
    || entries.find(e=>e.heading && latinShape(e.heading[2])===target[2]);
  if (!candidate) return {done:false,hint:null,position:null};
  const {text,row,parts,heading}=candidate;
  let feedback;
  if (heading[2]!==target[2]) feedback=difference(heading[2],target[2],row,heading[1].length);
  else if (parts) {
    const quote=text.indexOf(parts[3],text.indexOf('=')+1);
    feedback=difference(parts[4],target[4],row,quote+1);
  } else {
    // An untouched blank is an invitation to type, rather than an error.
    if (!text.slice(text.indexOf('=')+1).trim()) return {done:false,hint:null,position:null};
    const indent=text.match(/^[ \t]*/)[0].length;
    feedback=difference(text.slice(indent),expected,row,indent);
  }
  return {done:false,...feedback};
}
