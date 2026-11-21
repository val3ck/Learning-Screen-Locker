export function dayKey(date:Date):string {return kyivDayKey(date);}
export function daysAfter(iso:string,days:number):string {const d=new Date(iso);d.setDate(d.getDate()+days);return d.toISOString();}
const kyivFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function kyivParts(date:Date){const parts=Object.fromEntries(kyivFormatter.formatToParts(date).map(p=>[p.type,p.value]));return {year:Number(parts.year),month:Number(parts.month),day:Number(parts.day),hour:Number(parts.hour),minute:Number(parts.minute)};}
export function kyivDayKey(date:Date):string {const p=kyivParts(date),d=new Date(Date.UTC(p.year,p.month-1,p.day));if(p.hour<5)d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);}

export type ClockTime = `${number}:${number}`;
export function isClockTime(value:unknown):value is ClockTime {
  return typeof value==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
export function formatClockTime(hour:number,minute=0):ClockTime {
  return `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}` as ClockTime;
}
function learningMinute(clockMinute:number){return (clockMinute+19*60)%(24*60);}
export function clockDue(now:Date,time:ClockTime) {
  const p=kyivParts(now),[hour,minute]=time.split(':').map(Number);
  return learningMinute(p.hour*60+p.minute)>=learningMinute(hour*60+minute);
}
export function isLateHour(hour:number){return hour>=23||hour<5;}
