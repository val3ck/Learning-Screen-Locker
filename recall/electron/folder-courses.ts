import {readFile,readdir,realpath,stat} from 'node:fs/promises';
import path from 'node:path';
import {kyivDayKey} from '../src/core/calendar';
import {courseIdPattern,normalizeCourseAnswer,type CourseManifest,type CourseSubmission,type FolderCourseView} from '../src/core/folder-courses';
import type {Store} from './store';

const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const id=(v:unknown)=>typeof v==='string'&&v.length<=64&&courseIdPattern.test(v);
const string=(v:unknown,max=2000)=>typeof v==='string'&&v.length<=max&&v.trim().length>0;
const array=(v:unknown,max:number):v is unknown[]=>Array.isArray(v)&&v.length>0&&v.length<=max;
const label=(v:unknown)=>typeof v==='string'?v:'?';
const unique=(values:string[])=>new Set(values).size===values.length;

function requireField(allowed:unknown,field:string,expected:string):asserts allowed {
  if(!allowed)throw Error(`${field} — ${expected}`);
}

function parseManifest(raw:unknown):CourseManifest {
  requireField(object(raw)&&raw.version===1,'version','очікується версія 1');
  requireField(id(raw.id),'id','очікується ID на кшталт docker-compose');
  requireField(string(raw.title,100)&&string(raw.description,400),'title / description','потрібні коротка назва й опис');
  requireField(array(raw.lessons,50),'lessons','потрібно від 1 до 50 уроків');
  const lessonIds:string[]=[];
  for(const lesson of raw.lessons){
    requireField(object(lesson)&&id(lesson.id),'lessons.id','кожному уроку потрібен стабільний ID');
    const location=`lessons.${lesson.id}`;
    lessonIds.push(lesson.id as string);
    requireField(string(lesson.title,100),`${location}.title`,'потрібна коротка назва');
    requireField(typeof lesson.body==='string'&&/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.md$/i.test(lesson.body),`${location}.body`,'очікується шлях до локального Markdown');
    requireField(array(lesson.activities,20),`${location}.activities`,'потрібно від 1 до 20 завдань');
    const activityIds:string[]=[];
    for(const activity of lesson.activities){
      requireField(object(activity)&&id(activity.id),`${location}.activities.id`,'кожному завданню потрібен стабільний ID');
      activityIds.push(activity.id as string);
      const field=`${location}.activities.${activity.id}`;
      requireField(string(activity.prompt)&&string(activity.feedback),`${field}.prompt / feedback`,'потрібні умова й пояснення');
      requireField(activity.recall===undefined||typeof activity.recall==='boolean',`${field}.recall`,'очікується true або false');
      if(activity.kind==='choice'){
        const options=activity.options;
        requireField(array(options,6)&&options.length>=2&&options.every(option=>object(option)&&id(option.id)&&string(option.label,250)),`${field}.options`,'потрібно 2–6 варіантів з ID і текстом');
        const ids=options.map(option=>(option as {id:string}).id);
        requireField(unique(ids)&&ids.includes(label(activity.answer)),`${field}.answer`,'ID варіантів мають бути унікальними, відповідь має посилатися на один із них');
      }else if(activity.kind==='text'){
        requireField(array(activity.accepted,12)&&activity.accepted.every(answer=>string(answer,240)),`${field}.accepted`,'потрібен список коротких прийнятних відповідей');
      }else throw Error(`${field}.kind — підтримуються choice і text`);
    }
    requireField(unique(activityIds),`${location}.activities`,'ID завдань повторюються');
  }
  requireField(unique(lessonIds),'lessons','ID уроків повторюються');
  return raw as unknown as CourseManifest;
}

async function readAsset(root:string,file:string,maxBytes:number){
  const target=await realpath(path.join(root,file));
  const relative=path.relative(root,target);
  if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw Error(`${file} — файл поза папкою курсу`);
  const info=await stat(target);
  if(!info.isFile()||info.size>maxBytes)throw Error(`${file} — потрібен звичайний файл до ${maxBytes} байтів`);
  return readFile(target,'utf8');
}

export async function loadFolderCourse(directory:string):Promise<CourseManifest>{
  const root=await realpath(directory);
  const manifest=parseManifest(JSON.parse((await readAsset(root,'course.json',128*1024)).replace(/^\uFEFF/,'')));
  if(path.basename(directory)!==manifest.id)throw Error('id — має збігатися з назвою папки');
  return {...manifest,lessons:await Promise.all(manifest.lessons.map(async lesson=>{
    try{return {...lesson,body:await readAsset(root,lesson.body,64*1024)};}
    catch(error){throw Error(`lessons.${lesson.id}.body (${lesson.body}) — ${error instanceof Error?error.message:String(error)}`);}
  }))};
}

export async function readFolderCourses(root:string){
  const courses:CourseManifest[]=[];
  const issues:string[]=[];
  let entries;
  try{entries=await readdir(root,{withFileTypes:true});}
  catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;return {courses,issues};}
  for(const entry of entries.filter(item=>item.isDirectory()&&!item.name.startsWith('.')).sort((a,b)=>a.name.localeCompare(b.name))){
    try{courses.push(await loadFolderCourse(path.join(root,entry.name)));}
    catch(error){issues.push(`${entry.name}/course.json · ${error instanceof Error?error.message:String(error)}`);}
  }
  return {courses,issues};
}

type Mark={misses:number;passedOn?:string;reviewedOn?:string};
type Progress={version:1;marks:Record<string,Mark>};
const day=(v:unknown)=>v===undefined||typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v);
const validProgress=(v:unknown)=>object(v)&&v.version===1&&object(v.marks)&&Object.values(v.marks).every(
  mark=>object(mark)&&typeof mark.misses==='number'&&Number.isSafeInteger(mark.misses)&&mark.misses>=0&&day(mark.passedOn)&&day(mark.reviewedOn),
);

export class FolderCourseLibrary {
  private pending=Promise.resolve();
  constructor(private root:string,private store:Store,private now=()=>new Date()){}

  private progress(courseId:string){
    return this.store.read<Progress>(`course-library/${courseId}.json`,{version:1,marks:{}},validProgress);
  }

  private view(course:CourseManifest,progress:Progress):FolderCourseView {
    const today=kyivDayKey(this.now());
    return {id:course.id,title:course.title,description:course.description,lessons:course.lessons.map(lesson=>({
      id:lesson.id,title:lesson.title,body:lesson.body,activities:lesson.activities.map(activity=>{
        const mark=progress.marks[`${lesson.id}/${activity.id}`];
        return {id:activity.id,prompt:activity.prompt,kind:activity.kind,options:activity.kind==='choice'?activity.options:undefined,
          passed:!!mark?.passedOn,misses:mark?.misses??0,due:!!(activity.recall&&mark?.passedOn&&(mark.reviewedOn??mark.passedOn)<today)};
      }),
    }))};
  }

  async list(){
    const {courses,issues}=await readFolderCourses(this.root);
    return {issues,courses:await Promise.all(courses.map(async course=>this.view(course,await this.progress(course.id))))};
  }

  submit(input:CourseSubmission){
    const next=this.pending.then(()=>this.check(input));
    this.pending=next.then(()=>{},()=>{});
    return next;
  }

  private async check(input:CourseSubmission){
    if(!input||!id(input.courseId)||!id(input.lessonId)||!id(input.activityId)||!string(input.answer,240))throw Error('Введи коротку відповідь або обери варіант.');
    const {courses}=await readFolderCourses(this.root);
    const course=courses.find(value=>value.id===input.courseId);
    const activity=course?.lessons.find(lesson=>lesson.id===input.lessonId)?.activities.find(question=>question.id===input.activityId);
    if(!course||!activity)throw Error('Завдання недоступне. Онови список курсів.');
    const answer=normalizeCourseAnswer(input.answer);
    if(activity.kind==='choice'&&!activity.options.some(option=>option.id===answer))throw Error('Обери один із запропонованих варіантів.');
    const correct=activity.kind==='choice'?answer===activity.answer:activity.accepted.some(value=>normalizeCourseAnswer(value)===answer);
    const progress=await this.progress(course.id);
    const key=`${input.lessonId}/${input.activityId}`;
    const mark=progress.marks[key]??{misses:0};
    const today=kyivDayKey(this.now());
    if(correct){
      if(!mark.passedOn)mark.passedOn=today;
      else if(mark.passedOn<today)mark.reviewedOn=today;
    }else mark.misses++;
    progress.marks[key]=mark;
    await this.store.write(`course-library/${course.id}.json`,progress);
    return {correct,feedback:activity.feedback,course:this.view(course,progress)};
  }
}
