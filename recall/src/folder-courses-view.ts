import type {DesktopAPI} from './core/contracts';
import type {FolderCourseLibrary,FolderCourseView,PublicQuestion} from './core/folder-courses';
import './folder-courses.css';

const escape=(text:string)=>text.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));

function lessonBody(text:string){
  const chunks=text.replace(/\r\n/g,'\n').split(/(^```[^\n]*\n[\s\S]*?^```[ \t]*$)/m);
  const inline=(line:string)=>escape(line).replace(/`([^`\n]+)`/g,'<code>$1</code>');
  return chunks.map((chunk,index)=>index%2
    ?`<pre><code>${escape(chunk.slice(chunk.indexOf('\n')+1,chunk.lastIndexOf('\n')))}</code></pre>`
    :chunk.trim().split(/\n\s*\n/).filter(Boolean).map(block=>{
      if(/^#{1,3} /.test(block)&&!block.includes('\n'))return `<h3>${inline(block.replace(/^#{1,3} /,''))}</h3>`;
      const lines=block.split('\n');
      if(lines.every(line=>line.startsWith('- ')))return `<ul>${lines.map(line=>`<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
      return `<p>${inline(lines.join(' '))}</p>`;
    }).join('')).join('');
}

const complete=(lesson:FolderCourseView['lessons'][number])=>lesson.activities.every(activity=>activity.passed);
const dueQuestions=(course:FolderCourseView)=>course.lessons.flatMap(lesson=>lesson.activities
  .filter(activity=>activity.due).map(activity=>({lesson,activity})))
  .sort((a,b)=>b.activity.misses-a.activity.misses);

export class FolderCoursesView {
  private library:FolderCourseLibrary|null=null;
  private root:HTMLElement|null=null;
  private courseId='';
  private lessonId='';
  private review=false;
  private message='';
  private error=false;
  private pending=false;

  constructor(private api:DesktopAPI){}

  mount(root:HTMLElement){
    this.root=root;
    if(this.pending)this.render();
    else void this.refresh();
  }

  private async refresh(){
    this.error=false;
    this.message='';
    this.pending=true;
    this.render();
    try{this.library=await this.api.folderCourses();}
    catch(error){this.error=true;this.message=(error as Error).message;}
    finally{this.pending=false;this.render();}
  }

  private render(){
    if(!this.root?.isConnected)return;
    const courses=this.library?.courses??[];
    const course=courses.find(value=>value.id===this.courseId);
    const message=this.message?`<p class="notice" role="${this.error?'alert':'status'}">${escape(this.message)}</p>`:'';
    this.root.innerHTML=course?this.coursePage(course,message):`<section class="page-heading"><h1>Курси</h1><p>Мінікурси з папки <code>courses/</code>. Відкриваються вручну.</p></section>
      <div class="folder-course-toolbar"><button type="button" class="button secondary" data-course-refresh ${this.pending?'disabled':''}>Оновити список</button></div>
      ${message}${!this.library&&!this.error?'<p role="status">Шукаю курси…</p>':''}
      <div class="folder-course-grid">${courses.map(value=>`<article class="panel folder-course-card"><h2>${escape(value.title)}</h2>
        <p>${escape(value.description)}</p><p>${value.lessons.filter(complete).length} / ${value.lessons.length} уроків · ${dueQuestions(value).length} до повторення</p>
        <button type="button" class="button primary" data-open-course="${escape(value.id)}">Відкрити курс</button></article>`).join('')}</div>
      ${this.library&&!courses.length?'<p>Поклади папку з файлом <code>course.json</code> в <code>courses/</code> поруч із SQL-Recall.bat.</p>':''}
      ${this.library?.issues.length?`<details class="notice"><summary>Не завантажено курсів: ${this.library.issues.length}</summary><ul>${this.library.issues.map(issue=>`<li>${escape(issue)}</li>`).join('')}</ul></details>`:''}`;
    this.root.onclick=event=>this.click(event);
    this.root.onsubmit=event=>{
      const form=event.target;
      if(!course||!(form instanceof HTMLFormElement)||!form.dataset.activity)return;
      event.preventDefault();
      void this.submit(course,form);
    };
  }

  private click(event:MouseEvent){
    const control=(event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if(!control||this.pending)return;
    if(control.hasAttribute('data-course-refresh')){void this.refresh();return;}
    if(control.dataset.openCourse){this.courseId=control.dataset.openCourse;this.lessonId='';}
    else if(control.hasAttribute('data-course-back'))this.courseId='';
    else if(control.dataset.courseLesson){this.lessonId=control.dataset.courseLesson;this.review=false;}
    else if(control.hasAttribute('data-course-review'))this.review=true;
    else return;
    if(!this.courseId||control.dataset.openCourse)this.review=false;
    this.message='';
    this.render();
    this.root?.querySelector('h1')?.focus();
  }

  private coursePage(course:FolderCourseView,message:string){
    const lesson=course.lessons.find(value=>value.id===this.lessonId)??course.lessons.find(value=>!complete(value))??course.lessons[0];
    const reviews=dueQuestions(course);
    const next=reviews[0];
    return `<div class="folder-course-toolbar"><button type="button" class="button secondary" data-course-back>← Усі курси</button></div>
      <section class="page-heading"><h1 tabindex="-1">${escape(course.title)}</h1><p>${escape(course.description)}</p></section>
      <nav class="folder-course-toolbar" aria-label="Уроки курсу">${course.lessons.map((value,index)=>`<button type="button" class="button ${!this.review&&lesson.id===value.id?'primary':'secondary'}" data-course-lesson="${escape(value.id)}" ${!this.review&&lesson.id===value.id?'aria-current="step"':''}>${index+1}. ${escape(value.title)}${complete(value)?' ✓':''}</button>`).join('')}
      <button type="button" class="button ${this.review?'primary':'secondary'}" data-course-review ${this.review?'aria-current="step"':''}>Повторення · ${reviews.length}</button></nav>
      ${message}${this.review
        ?`<article class="panel folder-course-lesson"><h2>Повторення</h2>${next?`<p>${escape(next.lesson.title)}</p>${this.question(next.lesson.id,next.activity)}`:'<p>Наразі немає вправ до повторення. Пройдені завдання з’являються тут наступного навчального дня.</p>'}</article>`
        :`<article class="panel folder-course-lesson"><h2>${escape(lesson.title)}</h2>${lessonBody(lesson.body)}</article>
          <section aria-label="Перевірка знань">${lesson.activities.map(activity=>this.question(lesson.id,activity)).join('')}</section>`}`;
  }

  private question(lessonId:string,activity:PublicQuestion){
    const formId=`course-${lessonId}-${activity.id}`;
    const input=activity.kind==='choice'
      ?(activity.options??[]).map(option=>`<label class="folder-course-option"><input type="radio" name="answer" value="${escape(option.id)}" required> ${escape(option.label)}</label>`).join('')
      :`<label class="folder-course-option" for="${formId}-answer">Коротка відповідь</label><input id="${formId}-answer" type="text" name="answer" maxlength="240" required autocomplete="off">`;
    return `<form class="panel folder-course-question" data-lesson="${escape(lessonId)}" data-activity="${escape(activity.id)}"><fieldset ${this.pending?'disabled':''}>
      <legend>${escape(activity.prompt)}</legend>${input}
      <div class="folder-course-toolbar"><button class="button primary" type="submit">Перевірити</button>${activity.passed&&!this.review?'<span>✓ Зараховано</span>':''}</div></fieldset>
      <p class="folder-course-feedback" role="status" hidden></p></form>`;
  }

  private async submit(course:FolderCourseView,form:HTMLFormElement){
    if(this.pending)return;
    const answer=new FormData(form).get('answer');
    if(typeof answer!=='string'||!answer.trim())return;
    const fieldset=form.querySelector('fieldset')!;
    const feedback=form.querySelector<HTMLElement>('.folder-course-feedback')!;
    this.pending=true;
    fieldset.disabled=true;
    try{
      const result=await this.api.checkFolderCourse({courseId:course.id,lessonId:form.dataset.lesson!,activityId:form.dataset.activity!,answer});
      this.library!.courses=this.library!.courses.map(value=>value.id===course.id?result.course:value);
      const message=(result.correct?'Правильно. ':'Спробуй ще раз. ')+result.feedback;
      if(result.correct){
        this.message=message;
        this.error=false;
        this.pending=false;
        this.render();
        const resultMessage=this.root?.querySelector<HTMLElement>('.notice[role="status"]');
        if(resultMessage){resultMessage.tabIndex=-1;resultMessage.focus();}
      }
      else{feedback.hidden=false;feedback.textContent=message;}
    }catch(error){feedback.hidden=false;feedback.textContent=(error as Error).message;}
    finally{this.pending=false;fieldset.disabled=false;}
  }
}
