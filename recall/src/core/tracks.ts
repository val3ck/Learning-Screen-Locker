export const LEARNING_TRACKS = [
  {
    id: 'postgresql', title: 'PostgreSQL', activity: 'Повторення SQL',
    progressLabel: 'тем для практики', defaultMinutes: 15, minMinutes: 5, maxMinutes: 60,
    durationHelp: 'Після цього можна зберегти й вийти. Якщо всі вправи готові, можна завершити раніше.',
  },
  {
    id: 'english', title: 'English', activity: 'Вивчення англійської',
    progressLabel: 'уроків завершено', defaultMinutes: 55, minMinutes: 15, maxMinutes: 120,
    durationHelp: 'Після цього часу можна доробити поточний блок або зберегти його.',
  },
  {
    id: 'nodejs', title: 'Node.js', activity: 'Вивчення Node.js',
    progressLabel: 'модулів завершено', defaultMinutes: 40, minMinutes: 5, maxMinutes: 120,
    durationHelp: 'Після цього Recall знімає повноекранний захист нічного заняття.',
  },
] as const;

export type TrackId = typeof LEARNING_TRACKS[number]['id'];
export type TrackDurations = Partial<Record<TrackId, number>>;
export type TrackProgress = Record<TrackId, {done:number; total:number} | null>;

const tracks = new Map<TrackId, typeof LEARNING_TRACKS[number]>(LEARNING_TRACKS.map(track=>[track.id, track]));
export function defaultDuration(id:TrackId):number {
  return tracks.get(id)!.defaultMinutes;
}
export function validDuration(id:TrackId, minutes:unknown):minutes is number {
  const track=tracks.get(id);
  return !!track&&typeof minutes==='number'&&Number.isInteger(minutes)&&minutes>=track.minMinutes&&minutes<=track.maxMinutes;
}
export function validDurations(value:unknown):value is TrackDurations {
  return !!value&&typeof value==='object'&&!Array.isArray(value)&&
    Object.entries(value).every(([id,minutes])=>validDuration(id as TrackId,minutes));
}
export function trackDuration(id:TrackId, values?:TrackDurations):number {
  const minutes=values?.[id];
  return validDuration(id,minutes)?minutes:defaultDuration(id);
}
export const minuteMs=60_000;
