import {isClockTime,type ClockTime} from './calendar';

export const LEARNING_TRACKS = [
  {
    id: 'postgresql', title: 'PostgreSQL', activity: 'Повторення SQL', defaultStart: 'activity',
    progressLabel: 'тем для практики', defaultMinutes: 15, minMinutes: 5, maxMinutes: 60,
    durationHelp: 'Після цього можна зберегти й вийти. Якщо всі вправи готові, можна завершити раніше.',
  },
  {
    id: 'english', title: 'English', activity: 'Вивчення англійської', defaultStart: '19:00',
    progressLabel: 'уроків завершено', defaultMinutes: 55, minMinutes: 15, maxMinutes: 120,
    durationHelp: 'Після цього часу можна доробити або зберегти поточний блок. З 23:00 до 04:59 сесія починається за твоїм підтвердженням.',
  },
  {
    id: 'nodejs', title: 'Node.js', activity: 'Вивчення Node.js', defaultStart: '22:59',
    progressLabel: 'модулів завершено', defaultMinutes: 60, minMinutes: 5, maxMinutes: 120,
    durationHelp: 'За сесію можна завершити урок із лекцією та двома критеріями практики. Після ліміту можна зберегти частковий результат.',
  },
  {
    id:'git',title:'Git Tutor',activity:'Практика Git',defaultStart:null,
    progressLabel:'вправ завершено',defaultMinutes:20,minMinutes:5,maxMinutes:120,
    durationHelp:'Практика у навчальних репозиторіях Git Tutor.',
  },
  {
    id:'vim',title:'Neovim Quest',activity:'Практика Vim',defaultStart:null,
    progressLabel:'місій та іспитів завершено',defaultMinutes:20,minMinutes:5,maxMinutes:120,
    durationHelp:'Місії та іспити у браузерному симуляторі Vim.',
  },
] as const;

export type TrackId = typeof LEARNING_TRACKS[number]['id'];
export type TrackStart = ClockTime | 'activity' | null;
export type TrackStarts = Partial<Record<TrackId,TrackStart>>;
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
export function defaultStart(id:TrackId):TrackStart {
  const track: {defaultStart?:TrackStart}|undefined=tracks.get(id);
  return track?.defaultStart??null;
}
export function validStarts(value:unknown):value is TrackStarts {
  return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([key,start])=>{
    const id=key as TrackId;
    return tracks.has(id)&&(start===null||isClockTime(start)||start==='activity'&&defaultStart(id)==='activity');
  });
}
export const minuteMs=60_000;
