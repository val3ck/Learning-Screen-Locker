export type Question = {
  id:string;
  prompt:string;
  feedback:string;
  recall?:boolean;
} & (
  | {kind:'choice'; options:{id:string;label:string}[]; answer:string}
  | {kind:'text'; accepted:string[]}
);

export interface CourseManifest {
  version:1;
  id:string;
  title:string;
  description:string;
  lessons:{id:string;title:string;body:string;activities:Question[]}[];
}

export type PublicQuestion = Pick<Question,'id'|'prompt'|'kind'> & {
  options?:{id:string;label:string}[];
  passed:boolean;
  due:boolean;
  misses:number;
};

export interface FolderCourseView {
  id:string;
  title:string;
  description:string;
  lessons:{id:string;title:string;body:string;activities:PublicQuestion[]}[];
}

export interface FolderCourseLibrary {courses:FolderCourseView[]; issues:string[]}
export interface CourseSubmission {courseId:string;lessonId:string;activityId:string;answer:string}
export interface CourseResult {correct:boolean;feedback:string;course:FolderCourseView}

export const courseIdPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const normalizeCourseAnswer=(text:string)=>text.normalize('NFC').trim().replace(/\s+/g,' ');
