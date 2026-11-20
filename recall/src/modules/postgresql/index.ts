import type {LearningModule} from '../../core/contracts';
import {catalog,CONTENT_VERSION} from './catalog';
import {parseProgress} from './progress';
import {generateTasks,type SQLPayload} from './templates';
import {PostgreSQLRunner} from './runner';
import {reviewSolution,formatSQL} from './solution-review';
import {extraTask,nextLesson} from './continuation';
import {SQLController} from './controller';
export const postgresql:LearningModule={
  controller:{restore:state=>new SQLController(state as import('../../core/contracts').SessionRecord)},
  manifest:{id:'postgresql',version:CONTENT_VERSION,title:'PostgreSQL',capabilities:['code','tables','schema','offline']},catalog,
  progressAdapter:{parse:parseProgress,source:{url:'http://127.0.0.1:4173',serverEntry:'server.mjs',storageConfigFile:'recall-config.json',bridgeAssets:['recall-bridge.mjs','recall-sync.js']}},taskProvider:{generate:generateTasks,solution:task=>formatSQL((task.payload as SQLPayload).solution),review:reviewSolution,extraTask,nextLesson},
  runner:{create:()=>new PostgreSQLRunner()},presentation:{language:'sql',answerLabel:'Твій SQL',contextLabel:'Навчальна база'}
};
