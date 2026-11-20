import type {SessionRecord,Task} from '../../core/contracts';
import {statements} from './statements';
import type {SQLPayload} from './types';

const functions=new Set(['COUNT','SUM','AVG','MIN','MAX','COALESCE','DENSE_RANK','ROW_NUMBER','RANK','DATE_TRUNC','LOWER','UPPER','LENGTH','ANY','CAST']);
const clauses=new Set([
  'SELECT','FROM','WHERE','GROUP','HAVING','ORDER','LIMIT','OFFSET','DISTINCT','JOIN','LEFT','CROSS','ON',
  'CASE','WHEN','ELSE','BETWEEN','IN','LIKE','ILIKE','IS','NOT','NULL','AND','OR','FILTER','EXISTS',
  'WITH','OVER','PARTITION','ROWS','CREATE','TABLE','VIEW','INDEX','INSERT','UPDATE','DELETE','VALUES',
  'CONFLICT','BEGIN','COMMIT','ROLLBACK','UNION',
]);

export function practiceProfile(task:Task){
  const sql=(task.payload as SQLPayload|undefined)?.solution;
  const parts=typeof sql==='string'?statements(sql):[];
  const focus=[...new Set(parts.flatMap(part=>part.calls).filter(name=>functions.has(name)))].sort();
  const shape=parts.map(part=>part.words.filter(word=>clauses.has(word)).join(' ')).join(';')+'|'+focus.join(',');
  return {focus,shape};
}

export function functionReviews(sessions:SessionRecord[]){
  const last=new Map<string,number>();
  for(const session of sessions){
    if(session.moduleId!=='postgresql'||session.mode==='demo')continue;
    const at=Date.parse(session.endedAt??session.startedAt);
    if(!Number.isFinite(at))continue;
    session.tasks.forEach((task,index)=>{
      if(session.solved?.[index])for(const name of practiceProfile(task).focus)last.set(name,Math.max(at,last.get(name)??0));
    });
  }
  return last;
}

export function distinctPractice<T extends Task>(pool:T[],used:Task[]):T[]{
  const past=used.map(practiceProfile);
  const seenShapes=new Set(past.map(profile=>profile.shape));
  const newShapes=pool.filter(task=>!seenShapes.has(practiceProfile(task).shape));
  if(newShapes.length)pool=newShapes;
  const seenFunctions=new Set(past.flatMap(profile=>profile.focus));
  if(!seenFunctions.size)return pool;
  const newFunctions=pool.filter(task=>practiceProfile(task).focus.every(name=>!seenFunctions.has(name)));
  return newFunctions.length?newFunctions:pool;
}
