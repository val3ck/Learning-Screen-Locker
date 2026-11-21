// A deliberately bounded, dependency-free Neovim practice buffer.
export class VimEngine {
  constructor(text = '', cursor = [0, 0]) {
    this.lines = text.split('\n'); this.row = cursor[0]; this.col = cursor[1];
    this.mode = 'normal'; this.savedText = text; this.command = ''; this.message = '';
    this.error = false; this.pending = ''; this.count = ''; this.operatorCount = 1;
    this.register = { text: '', linewise: false }; this.undoStack = []; this.redoStack = [];
    this.search = ''; this.searchDirection = 1; this.exited = false; this.anchor = null;
    this.lastChange = null; this.insertReplay = null; this.clamp();
  }
  get text() { return this.lines.join('\n'); }
  get dirty() { return this.text !== this.savedText; }
  get offset() { return this.toOffset(this.row, this.col); }
  toOffset(r, c) { return this.lines.slice(0, r).reduce((a, l) => a + l.length + 1, 0) + c; }
  fromOffset(offset) {
    let n = Math.max(0, Math.min(offset, this.text.length));
    for (let r = 0; r < this.lines.length; r++) {
      if (n <= this.lines[r].length) return [r, n];
      n -= this.lines[r].length + 1;
    }
    return [this.lines.length - 1, this.lines.at(-1).length];
  }
  at(offset) { [this.row, this.col] = this.fromOffset(offset); this.clamp(); }
  clamp() {
    this.row = Math.max(0, Math.min(this.row, this.lines.length - 1));
    this.col = Math.max(0, Math.min(this.col, Math.max(0, this.lines[this.row].length - (this.mode === 'insert' ? 0 : 1))));
  }
  snapshot() { return { lines: [...this.lines], row: this.row, col: this.col }; }
  remember() { this.undoStack.push(this.snapshot()); this.redoStack = []; }
  restore(s) { this.lines = [...s.lines]; this.row = s.row; this.col = s.col; this.clamp(); }
  replace(start, end, text) {
    const full = this.text; this.lines = (full.slice(0, start) + text + full.slice(end)).split('\n'); this.at(start);
  }
  category(ch) { return !ch || /\s/.test(ch) ? 0 : /[\p{L}\p{N}_]/u.test(ch) ? 1 : 2; }
  wordOffset(direction, end = false, offset = this.offset) {
    const text = this.text; let p = offset;
    if (direction < 0) {
      p = Math.max(0, p - 1); while (p > 0 && !this.category(text[p])) p--;
      const cat = this.category(text[p]); while (p > 0 && this.category(text[p - 1]) === cat) p--;
    } else if (end) {
      p = Math.min(text.length - 1, p + 1); while (p < text.length - 1 && !this.category(text[p])) p++;
      const cat = this.category(text[p]); while (p < text.length - 1 && this.category(text[p + 1]) === cat) p++;
    } else {
      const cat = this.category(text[p]); while (p < text.length && this.category(text[p]) === cat) p++;
      while (p < text.length && !this.category(text[p])) p++;
    }
    return Math.max(0, Math.min(p, text.length));
  }
  move(key, n = 1) {
    const start = this.offset;
    for (let i = 0; i < n; i++) {
      if (key === 'h') this.col--;
      if (key === 'l') this.col++;
      if (key === 'j') this.row++;
      if (key === 'k') this.row--;
      if (key === 'w') this.at(this.wordOffset(1));
      if (key === 'b') this.at(this.wordOffset(-1));
      if (key === 'e') this.at(this.wordOffset(1, true));
      if (key === '0') this.col = 0;
      if (key === '^') this.col = this.lines[this.row].search(/\S/); 
      if (key === '$') this.col = this.lines[this.row].length - 1;
      this.clamp();
    }
    return this.offset !== start;
  }
  beginInsert(key) {
    this.remember(); this.mode = 'insert'; this.insertReplay = { key, chars: [] };
    if (key === 'a') this.col = Math.min(this.col + 1, this.lines[this.row].length);
    if (key === 'I') this.col = Math.max(0, this.lines[this.row].search(/\S/));
    if (key === 'A') this.col = this.lines[this.row].length;
    if (key === 'o') { this.lines.splice(++this.row, 0, ''); this.col = 0; }
    if (key === 'O') { this.lines.splice(this.row, 0, ''); this.col = 0; }
  }
  selection() {
    if (!this.anchor) return null;
    const a = this.toOffset(this.anchor[0], this.anchor[1]), b = this.offset;
    if (this.mode === 'visual-line') {
      const first = Math.min(this.anchor[0], this.row), last = Math.max(this.anchor[0], this.row);
      return [this.toOffset(first, 0), this.toOffset(last, this.lines[last].length)];
    }
    return [Math.min(a, b), Math.max(a, b) + 1];
  }
  find(term, direction = 1) {
    if (!term) return false;
    const t = this.text, p = this.offset;
    let i = direction > 0 ? t.indexOf(term, p + 1) : t.lastIndexOf(term, p - 1);
    if (i < 0) i = direction > 0 ? t.indexOf(term) : t.lastIndexOf(term);
    if (i < 0) { this.message = `E486: Pattern not found: ${term}`; this.error = true; return false; }
    this.at(i); this.message = `/${term} · пошук з переходом через край`; return true;
  }
  executeCommand(cmd) {
    const clean = cmd.trim(); let action = 'command'; this.mode = 'normal';
    if (['w', 'write'].includes(clean)) { this.savedText = this.text; this.message = `"quest.txt" ${this.lines.length}L written`; action = 'save'; }
    else if (['q', 'quit', 'q!', 'quit!', 'wq', 'x'].includes(clean)) {
      if (['wq', 'x'].includes(clean)) this.savedText = this.text;
      if (this.dirty && !clean.endsWith('!')) { this.message = 'E37: No write since last change (add ! to override)'; this.error = true; }
      else { this.exited = true; this.message = 'Редактор закрито. Усе під контролем.'; action = clean === 'wq' || clean === 'x' ? 'save-quit' : 'quit'; }
    } else if (/^(%?s)\//.test(clean)) {
      const match = clean.match(/^(%?)s\/((?:\\.|[^/])*)\/((?:\\.|[^/])*)\/(g?)$/);
      if (!match) { this.error = true; this.message = 'Приклад: :s/old/new/g'; }
      else {
        try {
          const regex = new RegExp(match[2], match[4]); const next = [...this.lines]; let changed = false;
          next.forEach((line, r) => { if (match[1] || r === this.row) { next[r] = line.replace(regex, match[3]); if (next[r] !== line) changed = true; } });
          if (changed) { this.remember(); this.lines = next; this.clamp(); this.message = 'Заміну виконано'; action = 'substitute'; }
          else { this.error = true; this.message = 'E486: Pattern not found'; }
        } catch { this.error = true; this.message = 'Некоректний вираз пошуку'; }
      }
    } else if (/^\d+$/.test(clean)) { this.row = Number(clean) - 1; this.col = 0; this.clamp(); action = 'move'; }
    else if (clean === 'help' || clean === 'h') { this.message = 'Довідник — кнопка книги праворуч угорі.'; }
    else if (clean) { this.message = `E492: Not an editor command: ${clean}`; this.error = true; }
    return { action, command: ':' + clean };
  }
  operate(op, motion, n, inside = false) {
    const startRow = this.row, startCol = this.col, start = this.offset;
    let a = start, b = start, linewise = false;
    if (motion === op) {
      linewise = true; const endRow = Math.min(this.lines.length - 1, this.row + n - 1);
      const selected = this.lines.slice(this.row, endRow + 1); this.register = { text: selected.join('\n'), linewise: true };
      if (op !== 'y') {
        this.remember(); this.lines.splice(this.row, selected.length, ...(op === 'c' ? [''] : [])); if (!this.lines.length) this.lines = [''];
        if (op === 'c') { this.row = startRow; this.mode = 'insert'; this.insertReplay = null; }
        this.col = 0; this.clamp();
      }
      return { action: op === 'y' ? 'yank' : op === 'c' ? 'change' : 'delete', command: `${n > 1 ? n : ''}${op}${op}` };
    }
    if (inside && motion === 'w') {
      if (!this.category(this.text[start])) { a = start; while (b < this.text.length && !this.category(this.text[b])) b++; }
      else { const cat = this.category(this.text[start]); while (a > 0 && this.category(this.text[a - 1]) === cat) a--; b = start + 1; while (b < this.text.length && this.category(this.text[b]) === cat) b++; }
    } else if (motion === '$') b = this.toOffset(this.row, this.lines[this.row].length);
    else if (motion === '0') { a = this.toOffset(this.row, 0); b = start; }
    else if (motion === 'w' || motion === 'e' || motion === 'b') {
      let p = start;
      for (let i = 0; i < n; i++) p = this.wordOffset(motion === 'b' ? -1 : 1, motion === 'e' || (op === 'c' && motion === 'w'), p);
      if (motion === 'e' || (op === 'c' && motion === 'w')) p++;
      a = Math.min(start, p); b = Math.max(start, p);
      // dw at the end of a line does not join the following line.
      if (motion === 'w' && n === 1 && this.fromOffset(b)[0] > this.row) b = this.toOffset(this.row, this.lines[this.row].length);
    } else if (motion === 'h') a = Math.max(this.toOffset(this.row, 0), start - n);
    else if (motion === 'l') b = Math.min(this.toOffset(this.row, this.lines[this.row].length), start + n);
    else { this.message = 'Спробуй рух w, e, b, 0, $ або повтори оператор.'; return { action: 'unsupported' }; }
    if (a !== b) {
      this.register = { text: this.text.slice(a, b), linewise };
      if (op !== 'y') { this.remember(); this.replace(a, b, ''); if (op === 'c') { this.mode = 'insert'; this.at(a); this.insertReplay = null; } }
      else { this.row = startRow; this.col = startCol; }
    }
    return { action: op === 'y' ? 'yank' : op === 'c' ? 'change' : 'delete', command: `${n > 1 ? n : ''}${op}${inside ? 'i' : ''}${motion}` };
  }
  key(key) {
    if (this.exited) return { action: 'closed', key };
    this.error = false; this.message = '';
    if (key === 'Escape') {
      const before = this.mode;
      if (before === 'insert') {
        if (this.insertReplay) this.lastChange = [...(this.insertReplay.prefix || [this.insertReplay.key]), ...this.insertReplay.chars, 'Escape'];
        this.col = Math.max(0, this.col - 1);
      }
      this.mode = 'normal'; this.command = ''; this.pending = ''; this.count = ''; this.anchor = null; this.clamp();
      return { action: 'escape', from: before, key };
    }
    if (this.mode === 'command' || this.mode === 'search') {
      if (key === 'Enter') {
        const cmd = this.command, mode = this.mode; this.command = ''; this.mode = 'normal';
        if (mode === 'command') return { ...this.executeCommand(cmd), key };
        this.search = cmd || this.search; const found = this.find(this.search); return { action: 'search', command: '/' + this.search, found, key };
      }
      if (key === 'Backspace') { if (this.command) this.command = this.command.slice(0, -1); else this.mode = 'normal'; }
      else if (key.length === 1) this.command += key;
      return { action: 'command-input', key };
    }
    if (this.mode === 'insert') {
      const p = this.offset; this.insertReplay?.chars.push(key);
      if (key === 'Enter') { const line = this.lines[this.row]; this.lines.splice(this.row, 1, line.slice(0, this.col), line.slice(this.col)); this.row++; this.col = 0; }
      else if (key === 'Backspace') { if (p > 0) { this.replace(p - 1, p, ''); this.at(p - 1); } }
      else if (key === 'Delete') { this.replace(p, p + 1, ''); this.at(p); }
      else if (key === 'Tab' || key.length === 1) { const value = key === 'Tab' ? '  ' : key; const line = this.lines[this.row]; this.lines[this.row] = line.slice(0, this.col) + value + line.slice(this.col); this.col += value.length; }
      else if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key)) this.move({ArrowLeft:'h',ArrowRight:'l',ArrowUp:'k',ArrowDown:'j'}[key]);
      return { action: 'insert', key };
    }
    const visual = this.mode.startsWith('visual');
    if (visual && ['y','d','c'].includes(key)) {
      const [a,b] = this.selection(); this.register = { text: this.text.slice(a,b), linewise: this.mode === 'visual-line' };
      if (this.mode === 'visual-line' && key !== 'y') {
        this.remember(); const first = Math.min(this.row,this.anchor[0]), last = Math.max(this.row,this.anchor[0]);
        this.lines.splice(first,last-first+1); if (!this.lines.length) this.lines=['']; this.row=first; this.col=0;
      } else if (key !== 'y') { this.remember(); this.replace(a,b,''); }
      else this.at(a);
      this.mode = key === 'c' ? 'insert' : 'normal'; if(key === 'c') this.at(a);
      this.anchor = null; this.clamp(); return { action: key === 'y' ? 'yank' : key === 'c' ? 'change' : 'delete', command: 'visual-' + key, key };
    }
    if (this.pending === 'r' || this.pending === 'f' || this.pending === 't') {
      const pending = this.pending; this.pending = ''; const n = Number(this.count) || 1; this.count = '';
      if (key.length !== 1) return {action:'cancel',key};
      if (pending === 'r') { this.remember(); const line = this.lines[this.row]; const width = Math.min(n,line.length-this.col); this.lines[this.row]=line.slice(0,this.col)+key.repeat(width)+line.slice(this.col+width); this.lastChange=[...String(n>1?n:''),'r',key]; return {action:'replace',command:'r'+key,key}; }
      let p = this.col;
      for (let i=0;i<n;i++) { const found = this.lines[this.row].indexOf(key,p+1); if(found<0) return {action:'find',found:false,key}; p=found; }
      this.col=p-(pending==='t'?1:0);return {action:'find',command:pending+key,found:true,key};
    }
    if (this.pending === 'g') {
      this.pending='';const n = Number(this.count)||1;this.count='';
      if(key==='g'){this.row=n-1;this.col=0;this.clamp();return {action:'move',command:'gg',key};}
      return {action:'unsupported',key};
    }
    if (/^([dcy])i?$/.test(this.pending)) {
      if (/[1-9]/.test(key) && key.length===1 || key==='0' && this.count) { this.count+=key; return {action:'pending',key}; }
      if (key==='i' && this.pending.length===1) {this.pending+='i';return {action:'pending',key};}
      const op=this.pending[0],inside=this.pending.endsWith('i'),n=this.operatorCount*(Number(this.count)||1);
      this.pending='';this.count='';const event=this.operate(op,key,n,inside);
      if(op!=='y'&&event.action!=='unsupported') {
        this.lastChange=[...String(n>1?n:''),op,...(inside?['i']:[]),key];
        if(op==='c'&&this.mode==='insert')this.insertReplay={prefix:[...this.lastChange],chars:[]};
      }
      return {...event,key};
    }
    if (key.length===1 && (/[1-9]/.test(key) || key==='0' && this.count)) {this.count+=key;return {action:'count',key};}
    const n=Number(this.count)||1, hadCount=!!this.count; this.count='';
    if ('hjklwbe0$^'.includes(key) && key.length===1 || ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key)) {
      const motion={ArrowLeft:'h',ArrowRight:'l',ArrowUp:'k',ArrowDown:'j'}[key]||key;
      this.move(motion,n);return {action:'move',command:(hadCount?n:'')+motion,key};
    }
    if(key==='g'){this.pending='g';this.count=hadCount?String(n):'';return {action:'pending',key};}
    if(key==='G'){this.row=hadCount?n-1:this.lines.length-1;this.col=0;this.clamp();return {action:'move',command:'G',key};}
    if(['r','f','t'].includes(key)){this.pending=key;this.count=hadCount?String(n):'';return {action:'pending',key};}
    if(['d','c','y'].includes(key)){this.pending=key;this.operatorCount=n;return {action:'pending',key};}
    if(['i','a','I','A','o','O'].includes(key)&&!visual){this.beginInsert(key);return {action:'insert-start',command:key,key};}
    if(key==='v'||key==='V') {if(visual){this.mode='normal';this.anchor=null;}else{this.mode=key==='v'?'visual':'visual-line';this.anchor=[this.row,this.col];}return {action:'visual',command:key,key};}
    if(key===':'||key==='/'){this.mode=key===':'?'command':'search';this.command='';this.pending='';return {action:'command-start',key};}
    if(key==='n'||key==='N'){if(!this.search){this.message='Спочатку введи /слово та Enter.';return {action:'search-next',found:false,key};}return {action:'search-next',found:this.find(this.search,key==='n'?1:-1),command:key,key};}
    if(key==='x'||key==='X'){
      const a=key==='X'?Math.max(0,this.col-n):this.col,b=key==='X'?this.col:Math.min(this.lines[this.row].length,this.col+n);
      if(a!==b){this.remember();const line=this.lines[this.row];this.register={text:line.slice(a,b),linewise:false};this.lines[this.row]=line.slice(0,a)+line.slice(b);this.col=a;this.clamp();this.lastChange=[...String(n>1?n:''),key];}
      return {action:'delete',command:(hadCount?n:'')+key,key};
    }
    if(key==='p'||key==='P'){
      if(!this.register.text)return {action:'paste',key};this.remember();
      if(this.register.linewise){const r=this.row+(key==='p'?1:0);const lines=Array(n).fill(this.register.text).join('\n').split('\n');this.lines.splice(r,0,...lines);this.row=r;this.col=0;}
      else{const p=this.offset+(key==='p'&&this.lines[this.row].length?1:0),text=this.register.text.repeat(n);this.replace(p,p,text);this.at(p+text.length-1);}
      this.lastChange=[...String(n>1?n:''),key];return {action:'paste',command:key,key};
    }
    if(key==='u'||key==='C-r'){
      const from=key==='u'?this.undoStack:this.redoStack,to=key==='u'?this.redoStack:this.undoStack;
      for(let i=0;i<n;i++){if(!from.length)break;to.push(this.snapshot());this.restore(from.pop());}
      return {action:key==='u'?'undo':'redo',command:key,key};
    }
    if(key==='.'&&this.lastChange){const replay=[...this.lastChange];for(let i=0;i<n;i++)for(const k of replay)this.key(k);return {action:'repeat',command:'.',key};}
    if(key==='Tab'){this.message='У Normal клавіші — це команди. Для тексту натисни i.';return {action:'unsupported',key};}
    this.message='Цієї команди ще немає у симуляторі. Підглянь у довідник.';return {action:'unsupported',key};
  }
}
