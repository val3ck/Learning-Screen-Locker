// Small, escaped subset of Markdown. No links, images or model-provided HTML.
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function chatMarkup(text:string):string {
  const inline=(value:string)=>value.split(/(`[^`\n]+`)/g).map(part=>part.startsWith('`')&&part.endsWith('`')
    ?`<code>${escape(part.slice(1,-1))}</code>`
    :escape(part).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>')).join('');
  return text.split(/(```[^\n]*\n[\s\S]*?(?:```|$))/g).filter(Boolean).map(part=>{
    if(!part.startsWith('```'))return `<p>${inline(part.trim())}</p>`;
    const first=part.indexOf('\n');
    return `<pre><code>${escape(part.slice(first+1).replace(/```$/,'').replace(/\n$/,''))}</code></pre>`;
  }).join('');
}
