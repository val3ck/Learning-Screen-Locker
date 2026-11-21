export const INTRO_SILENCE_MS = 5000;
export const movementArena = ['', '  +' + '-'.repeat(50) + '+', ...Array(11).fill('  |' + ' '.repeat(50) + '|'), '  +' + '-'.repeat(50) + '+', ''].join('\n');
export const movementStart = [7, 27];
export function moveInArena(engine,key){
  if(key==='Escape'||/^[1-9]$/.test(key)||key==='0'&&engine.count)return engine.key(key);
  const motion={ArrowLeft:'h',ArrowRight:'l',ArrowUp:'k',ArrowDown:'j'}[key]||key;
  if(!'hjkl'.includes(motion)||motion.length!==1)return {action:'unsupported',key};
  const n=Number(engine.count)||1;engine.count='';const large=engine.lines.length>10,minRow=large?2:3,maxRow=large?12:5;
  if(motion==='j')engine.row=Math.min(maxRow,engine.row+n);if(motion==='k')engine.row=Math.max(minRow,engine.row-n);
  const last=engine.lines[engine.row].lastIndexOf('|')-1;
  if(motion==='h')engine.col=Math.max(3,engine.col-n);if(motion==='l')engine.col=Math.min(last,engine.col+n);
  engine.col=Math.max(3,Math.min(last,engine.col));return {action:'move',command:(n>1?n:'')+motion,key};
}

// Separate zones guarantee a real change in direction, even for extreme RNG values.
export function createNavigationRoute(random = Math.random) {
  const between = (a, b) => a + Math.floor(Math.max(0, Math.min(0.999999, random())) * (b - a + 1));
  return [[between(3, 5), between(6, 14)], [between(9, 11), between(12, 23)], [between(4, 8), between(36, 48)]];
}

export function pointerFor(chapter, step, mission, engine, context, routeTarget) {
  if (routeTarget) return { cell: routeTarget };
  if (mission.target) return { cell: mission.target };
  if (chapter === 3 && step === 3) return { cell: [0, context.visitedEnd ? 0 : engine.lines[0].length - 1] };
  if (chapter === 2 || chapter === 8 && step === 2) return { selector: '#command-line' };
  if (chapter === 1 && step === 1) return { cell: [0, engine.lines[0].length - 1] };
  if (chapter === 1 && step === 2) return { cell: [0, 0] };
  if (chapter === 8 && step === 0) return { cell: [1, 10] };
  if (chapter === 8 && step === 1) return { cell: [2, 0] };
  return { cell: mission.cursor };
}
