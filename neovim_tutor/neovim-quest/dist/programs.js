export const CODE_LANGUAGES={javascript:{name:'JavaScript',file:'main.js',compiler:null},python:{name:'Python',file:'main.py',compiler:'cpython-3.13.8'},go:{name:'Go',file:'main.go',compiler:'go-1.23.2'},c:{name:'C',file:'main.c',compiler:'gcc-13.2.0-c'},cpp:{name:'C++',file:'main.cpp',compiler:'gcc-13.2.0'},rust:{name:'Rust',file:'main.rs',compiler:'rust-1.82.0'}};
const problems=[
  {en:'Return the sum of integers from 1 to n. For n = 4, return 10.',uk:'Поверни суму цілих чисел від 1 до n. Для n = 4 результат — 10.',inputs:[0,1,2,4,7,10],expected:n=>n*(n+1)/2,formula:{javascript:'return n * (n + 1) / 2;',python:'return n * (n + 1) // 2',go:'return n * (n + 1) / 2',c:'return n * (n + 1) / 2;',cpp:'return n * (n + 1) / 2;',rust:'n * (n + 1) / 2'}},
  {en:'Return 1² + 2² + … + n². For n = 3, return 14.',uk:'Поверни 1² + 2² + … + n². Для n = 3 результат — 14.',inputs:[0,1,2,3,5,8],expected:n=>n*(n+1)*(2*n+1)/6,formula:{javascript:'return n * (n + 1) * (2 * n + 1) / 6;',python:'return n * (n + 1) * (2 * n + 1) // 6',go:'return n * (n + 1) * (2 * n + 1) / 6',c:'return n * (n + 1) * (2 * n + 1) / 6;',cpp:'return n * (n + 1) * (2 * n + 1) / 6;',rust:'n * (n + 1) * (2 * n + 1) / 6'}},
  {en:'Return n factorial. 0! = 1 and 4! = 24.',uk:'Поверни факторіал n. 0! = 1, а 4! = 24.',inputs:[0,1,2,4,6,8],expected:n=>{let x=1;for(let i=2;i<=n;i++)x*=i;return x;},bodies:{javascript:'let result = 1;\nfor (let i = 2; i <= n; i++) result *= i;\nreturn result;',python:'result = 1\nfor i in range(2, n + 1):\n    result *= i\nreturn result',go:'result := 1\nfor i := 2; i <= n; i++ { result *= i }\nreturn result',c:'long long result = 1;\nfor (long long i = 2; i <= n; i++) result *= i;\nreturn result;',cpp:'long long result = 1;\nfor (long long i = 2; i <= n; i++) result *= i;\nreturn result;',rust:'let mut result = 1;\nfor i in 2..=n { result *= i; }\nresult'}},
  {en:'Return Fibonacci number F(n): F(0) = 0, F(1) = 1, F(6) = 8.',uk:'Поверни число Фібоначчі F(n): F(0) = 0, F(1) = 1, F(6) = 8.',inputs:[0,1,2,4,6,10],expected:n=>{let a=0,b=1;for(let i=0;i<n;i++)[a,b]=[b,a+b];return a;},bodies:{javascript:'let a = 0, b = 1;\nfor (let i = 0; i < n; i++) {\n  const next = a + b; a = b; b = next;\n}\nreturn a;',python:'a, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nreturn a',go:'a, b := 0, 1\nfor i := 0; i < n; i++ { a, b = b, a + b }\nreturn a',c:'long long a = 0, b = 1;\nfor (long long i = 0; i < n; i++) {\n  long long next = a + b; a = b; b = next;\n}\nreturn a;',cpp:'long long a = 0, b = 1;\nfor (long long i = 0; i < n; i++) {\n  long long next = a + b; a = b; b = next;\n}\nreturn a;',rust:'let (mut a, mut b) = (0, 1);\nfor _ in 0..n { (a, b) = (b, a + b); }\na'}},
  {en:'Count the decimal digits of a non-negative n. Zero has one digit.',uk:'Порахуй десяткові цифри невід’ємного n. Нуль має одну цифру.',inputs:[0,7,10,99,105,10000],expected:n=>String(n).length,bodies:{javascript:'let digits = 1;\nwhile (n >= 10) { n = Math.floor(n / 10); digits++; }\nreturn digits;',python:'digits = 1\nwhile n >= 10:\n    n //= 10\n    digits += 1\nreturn digits',go:'digits := 1\nfor n >= 10 { n /= 10; digits++ }\nreturn digits',c:'long long digits = 1;\nwhile (n >= 10) { n /= 10; digits++; }\nreturn digits;',cpp:'long long digits = 1;\nwhile (n >= 10) { n /= 10; digits++; }\nreturn digits;',rust:'let mut n = n;\nlet mut digits = 1;\nwhile n >= 10 { n /= 10; digits += 1; }\ndigits'}},
  {en:'Return the sum of even numbers from 0 to n. For n = 6, return 12.',uk:'Поверни суму парних чисел від 0 до n. Для n = 6 результат — 12.',inputs:[0,1,2,6,9,16],expected:n=>{const m=Math.floor(n/2);return m*(m+1);},bodies:{javascript:'const m = Math.floor(n / 2);\nreturn m * (m + 1);',python:'m = n // 2\nreturn m * (m + 1)',go:'m := n / 2\nreturn m * (m + 1)',c:'long long m = n / 2;\nreturn m * (m + 1);',cpp:'long long m = n / 2;\nreturn m * (m + 1);',rust:'let m = n / 2;\nm * (m + 1)'}}
];
export function problemFor(chapter){return problems[Math.max(0,Math.min(5,chapter-3))];}
export function wrapFunction(language,body){
  const indent=body.split('\n').map(line=>'    '+line).join('\n');
  if(language==='python')return `def solve(n):\n${indent}\n`;
  const signature={javascript:'function solve(n)',go:'func solve(n int) int',c:'long long solve(long long n)',cpp:'long long solve(long long n)',rust:'fn solve(n: i64) -> i64'}[language];
  return `${signature} {\n${indent}\n}\n`;
}
export function referenceCode(chapter,language){const p=problemFor(chapter);return wrapFunction(language,p.formula?.[language]||p.bodies[language]);}
export function starterCode(chapter,index,language){
  const fallback=language==='python'?'return n':language==='go'?'return n':language==='rust'?'n':'return n;';
  const comment=language==='python'?'# '+(index===1?'Repair this result.':'Your algorithm goes here.'):'// '+(index===1?'Repair this result.':'Your algorithm goes here.');
  return wrapFunction(language,comment+'\n'+fallback);
}
export function defaultTests(chapter){const p=problemFor(chapter);return p.inputs.map(input=>({input,expected:p.expected(input)}));}
export function parseCustomTests(text){
  const tests=JSON.parse(text);if(!Array.isArray(tests)||tests.length>10)throw new Error('Use an array with at most 10 test cases.');
  return tests.map(t=>{if(!t||!Number.isSafeInteger(t.input)||t.input<0||t.input>10000||!Number.isSafeInteger(t.expected))throw new Error('Each test needs integer input (0…10000) and expected fields.');return {input:t.input,expected:t.expected};});
}
export function compilerProgram(language,code,tests){
  if(language==='python')return code+'\n'+tests.map((t,i)=>`print("__NQ${i}__" + str(solve(${t.input})))`).join('\n');
  if(language==='go')return 'package main\nimport "fmt"\n'+code+'\nfunc main() {\n'+tests.map((t,i)=>`fmt.Printf("__NQ${i}__%d\\n", solve(${t.input}))`).join('\n')+'\n}';
  if(language==='rust')return code+'\nfn main() {\n'+tests.map((t,i)=>`println!("__NQ${i}__{}", solve(${t.input}));`).join('\n')+'\n}';
  if(language==='c'||language==='cpp')return '#include <stdio.h>\n'+code+'\nint main(void) {\n'+tests.map((t,i)=>`printf("__NQ${i}__%lld\\n", (long long)solve(${t.input}));`).join('\n')+'\nreturn 0;\n}';
  throw new Error('Unsupported compiled language.');
}
