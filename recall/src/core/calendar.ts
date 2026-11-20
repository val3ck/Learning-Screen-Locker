export function dayKey(date:Date):string {return kyivDayKey(date);}
export function daysAfter(iso:string,days:number):string {const d=new Date(iso);d.setDate(d.getDate()+days);return d.toISOString();}
const kyivFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'});
export function kyivParts(date:Date){const parts=Object.fromEntries(kyivFormatter.formatToParts(date).map(p=>[p.type,p.value]));return {year:Number(parts.year),month:Number(parts.month),day:Number(parts.day),hour:Number(parts.hour)};}
export function kyivDayKey(date:Date):string {const p=kyivParts(date),d=new Date(Date.UTC(p.year,p.month-1,p.day));if(p.hour<5)d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);}
