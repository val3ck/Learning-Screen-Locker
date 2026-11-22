import path from 'node:path';
import {readFolderCourses} from '../electron/folder-courses';

const root=path.resolve(process.argv[2]??'../courses');
const {courses,issues}=await readFolderCourses(root);
for(const course of courses)console.log(`${course.id} · ${course.lessons.length} уроків`);
for(const issue of issues)console.error(issue);
if(!courses.length)console.error(`Немає валідних курсів у ${root}`);
if(issues.length||!courses.length)process.exitCode=1;
