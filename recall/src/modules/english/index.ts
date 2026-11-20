import type {LearningModule} from '../../core/contracts';
import {EnglishController,importEnglishCourse} from './controller';
import * as Course from './vendor/course';
export const english:LearningModule={
  manifest:{id:'english',version:Course.VERSION,title:'English Daily',capabilities:['lesson','text','audio','ai-assessment','asr','cloud-voice','local-progress']},
  controller:{restore:(state,now)=>new EnglishController(state,now)},
  catalog:Course.lessons.map((l:any)=>({id:l.id,title:l.title,chapter:l.week,prerequisites:l.prerequisites})),
  progressAdapter:{parse(source){const state=importEnglishCourse(source).course;return {version:1,moduleId:'english',catalogVersion:Course.VERSION,confirmedTopicIds:state.sessions.map(s=>s.lessonId),practiceTopicIds:[],completedSourceIds:state.sessions.map(s=>s.lessonId),syncedAt:new Date().toISOString()};}},
  taskProvider:{generate(){throw new Error('English використовує контролер уроку.');},solution(){return '';}},
  runner:{create(){throw new Error('English не використовує SQL-рушій.');}},
  presentation:{language:'text',answerLabel:'Твоя відповідь',contextLabel:'Матеріали уроку'}
};
