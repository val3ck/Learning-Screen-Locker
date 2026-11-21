import type {LunaModel} from '../../shared/luna-chat';
import { app, BrowserWindow, ipcMain, screen, shell, type IpcMainInvokeEvent } from 'electron';
import { execFile, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { nightPlan } from '../../nodejs/src/lib/night-plan';
import { parseProgress } from '../../nodejs/src/lib/progress';
import { defaultDuration, defaultStart, minuteMs } from '../src/core/tracks';
import { isClockTime, kyivDayKey, type ClockTime } from '../src/core/calendar';
import path from 'node:path';
import {
  nodeInvitationDay, nextNightStep, reviewNightProgress, validNightDocument,
  type CourseNight, type NightDocument, type NightRun,
} from '../src/core/node-night';
import { FocusGuard } from './focus-guard';
import { NodeNightAI } from './node-night-ai';
import type { Store } from './store';

const defaultOrigin = 'http://127.0.0.1:5174';
const documentFile = 'modules/nodejs/night.json';
type Phase = 'loading' | 'learning' | 'editor' | 'wrap-up' | 'finished';
type Choice = 'learn' | 'sleep' | 'dismiss';

export function powerOffWindows(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'win32') { reject(Error('Вимкнення доступне лише у Windows.')); return; }
    const program = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'shutdown.exe');
    execFile(program, ['/s', '/t', '0'], { windowsHide: true }, error => error
      ? reject(Error('Windows не змогла вимкнути ПК. Прогрес збережено.')) : resolve());
  });
}

function allowedPage(url: string, origin: string) {
  try { const page = new URL(url); return page.origin === origin && page.pathname === '/'; }
  catch { return false; }
}

export class NodeNight {
  private document: NightDocument = { version: 1, enabled: true, runs: [] };
  private invitation: BrowserWindow | null = null;
  private settingsWindow: BrowserWindow | null = null;
  private browser: BrowserWindow | null = null;
  private covers: BrowserWindow[] = [];
  private guard = new FocusGuard();
  private running: NightRun | null = null;
  private course: CourseNight | null = null;
  private phase: Phase = 'finished';
  private picking = false;
  private checking = false;
  private setupProbeAt = 0;
  private stateProbeAt = 0;
  private promptNight: string | null = null;
  private preview = false;
  private loadTimer: ReturnType<typeof setTimeout> | null = null;
  private cutoff: ReturnType<typeof setTimeout> | null = null;
  private monotonicDeadline = 0;
  private readonly origin: string;
  private readonly ai: NodeNightAI;

  constructor(private options: {
    store: Store; coursePath: string; preloadRoot: string; englishAI: any;
    isolated: boolean; isAvailable: () => boolean; onStatus: () => void; report: (message: string) => void;
    beforeOffer: () => void;
    canOffer?: () => boolean;
    scheduledTime?: () => ClockTime|null|undefined;
    shutdown?: () => Promise<void>;
    exerciseGuard?: boolean; testPort?: number; separateApiKey?: string; lunaModel?:()=>LunaModel|undefined; durationMinutes?: () => number;
  }) {
    this.ai = new NodeNightAI(options.store, options.englishAI, options.isolated, options.separateApiKey, options.lunaModel);
    const port = options.testPort;
    this.origin = options.isolated && Number.isInteger(port) && port! > 0 && port! <= 65535
      ? 'http://127.0.0.1:' + port : defaultOrigin;
  }

  get startTime():ClockTime|null {
    const configured=this.options.scheduledTime?.();
    if(configured!==undefined)return configured;
    const starting=defaultStart('nodejs');
    return this.document.enabled&&isClockTime(starting)?starting:null;
  }

  private get canSleep(){
    const hour=Number(this.startTime?.slice(0,2)??'12');
    return this.preview||hour>=22||hour<5;
  }

  async startPractice() {
    if(this.picking||this.invitation||this.browser||!this.options.isAvailable())throw Error('Інша сесія вже триває.');
    this.picking=true;
    try{
      const health=await this.ensureCourse();
      if(!health.ready)throw Error('Спочатку відкрий Backend Path у звичному браузері та дочекайся синхронізації.');
      const course=await this.readCourse();
      if(!course.candidate)throw Error('Усі доступні уроки завершені. Відкрий Backend Path для повторення.');
      if(!this.options.isAvailable())throw Error('Інша сесія вже триває.');
      this.course=course;
      this.preview=false;
      this.promptNight=kyivDayKey(new Date());
      this.options.beforeOffer();
      this.openStudy(course.candidate.lessonId);
    }finally{this.picking=false;}
  }

  async scheduleChanged() {
    this.setupProbeAt=0;
    if(this.preview||this.picking||!this.invitation)return;
    this.closeInvitation();
    if(!this.document.choice){
      this.document.offeredNight=undefined;
      await this.save();
    }
  }

  private get durationMinutes(){return this.options.durationMinutes?.()??defaultDuration('nodejs');}

  async progress():Promise<{done:number;total:number}|null> {
    if(this.options.isolated&&!this.options.testPort)return null;
    const summarize=(course:CourseNight)=>({done:course.completedModules,total:course.totalModules});
    if(this.running&&this.course)return summarize(this.course);
    if(!this.options.isolated){
      const localData=process.env.LOCALAPPDATA||path.join(homedir(),'AppData','Local');
      const file=path.join(process.env.BACKEND_PATH_DATA_DIR||path.join(localData,'Backend Path'),'progress-v1.json');
      for(const suffix of ['', '.bak']){
        try{
          const saved=JSON.parse(await readFile(file+suffix,'utf8'));
          if(saved.version===1&&Number.isInteger(saved.revision)&&saved.revision>0)return summarize(nightPlan(parseProgress(saved.progress)));
        }catch{/* Try the saved backup or the local bridge. */}
      }
    }
    try{return summarize(await this.readCourse(500));}catch{return null;}
  }

  get protected() { return this.guard.active; }
  get busy() { return this.picking||!!this.invitation && !this.preview || !!this.browser && ['loading','learning','editor'].includes(this.phase); }
  get canResume() { return !!this.browser && !this.browser.isDestroyed(); }

  async init() {
    this.document = await this.options.store.read(documentFile, this.document, validNightDocument);
    const unfinished = this.document.runs.filter(run => !run.endedAt);
    for (const run of unfinished) { run.endedAt = Date.now(); run.outcome = 'interrupted'; }
    if (unfinished.length) await this.save();
    await this.ai.load();
    this.installHandlers();
  }

  private save() { return this.options.store.write(documentFile, structuredClone(this.document)); }

  private async request(route: string, timeout = 1500) {
    const response = await fetch(this.origin + '/api/backend-path/' + route, {
      signal: AbortSignal.timeout(timeout), redirect: 'error', cache: 'no-store',
    });
    if (!response.ok) throw Error('Локальний Backend Path недоступний.');
    return response.json();
  }

  private async health() {
    const status = await this.request('health');
    if (status?.app !== 'backend-path' || status.protocol !== 1 || typeof status.ready !== 'boolean')
      throw Error('На порту 5174 потрібна оновлена версія Backend Path.');
    return status as { ready: boolean };
  }

  private async ensureCourse() {
    try { return await this.health(); } catch {}
    if (this.origin !== defaultOrigin) throw Error('Тестове сховище Backend Path недоступне.');
    const entry = path.join(this.options.coursePath, 'dist-server', 'recall.cjs');
    await access(entry).catch(() => { throw Error('Оновлений Backend Path не знайдено в ' + this.options.coursePath); });
    const child = spawn(process.execPath, [entry], {
      cwd: this.options.coursePath, detached: true, windowsHide: true,
      stdio: 'ignore', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    });
    child.on('error', () => {});
    child.unref();
    for (let n = 0; n < 8; n++) {
      try { return await this.health(); }
      catch { await new Promise(resolve => setTimeout(resolve, 250)); }
    }
    throw Error('Backend Path не відкрився. Перевір локальний сервер на порту 5174.');
  }

  private async readCourse(timeout?:number) {
    const value = await this.request('night',timeout) as CourseNight | null;
    if (!value || !Array.isArray(value.completed) || !Number.isInteger(value.completedModules) ||
        !Number.isInteger(value.totalModules) || value.totalModules<1 || value.completedModules<0 || value.completedModules>value.totalModules || value.candidate &&
          (!/^[a-z0-9-]+$/.test(value.candidate.lessonId) ||
          !['lecture','practice','check'].includes(value.candidate.section) ||
          ![5,10,20].includes(value.candidate.minutes))) {
      throw Error('Спочатку відкрий Backend Path у звичному браузері та дочекайся синхронізації.');
    }
    return value;
  }

  async tick(now: Date, active: boolean) {
    if (this.running) this.applyDeadline(now.getTime());
    if (this.checking) return;
    const start=this.startTime,night=nodeInvitationDay(now,start);
    if (this.invitation && !this.preview && night !== this.promptNight && !this.picking) this.closeInvitation();
    this.checking = true;
    try {
      if (this.running && now.getTime() >= this.stateProbeAt) {
        this.stateProbeAt = now.getTime() + 2500;
        await this.refresh();
      }
      if (this.options.isolated || this.busy || this.browser || !night ||
          !active || !this.options.isAvailable() || this.options.canOffer?.()===false || night===this.document.offeredNight || this.document.runs.some(run=>run.night===night) || now.getTime() < this.setupProbeAt) return;
      this.setupProbeAt = now.getTime() + 30_000;
      const canOffer=()=>this.startTime===start&&nodeInvitationDay(new Date(),start)===night&&this.options.isAvailable()&&this.options.canOffer?.()!==false;
      const status = await this.ensureCourse();
      if (!status.ready || !canOffer()) return;
      const course = await this.readCourse();
      if (!course.candidate || !canOffer()) return;
      this.document.offeredNight = night;
      this.document.choice = undefined;
      await this.save();
      if (!canOffer()) {
        this.document.offeredNight = undefined;
        await this.save();
        return;
      }
      this.options.beforeOffer();
      this.openInvitation(night);
    } catch {
      // A temporarily unavailable course won't lock the screen or stop other schedules.
    } finally { this.checking = false; }
  }

  openSettings() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) { this.settingsWindow.focus(); return; }
    const win = this.trustedWindow('node-night-settings.html', { width: 570, height: 510 });
    this.settingsWindow = win;
    win.on('closed', () => { if (this.settingsWindow === win) this.settingsWindow = null; });
  }

  private trustedWindow(file: string, options: Electron.BrowserWindowConstructorOptions) {
    const win = new BrowserWindow({
      backgroundColor: '#1c241f', ...options, show: false, autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(this.options.preloadRoot, 'node-night-controls-preload.cjs'),
        sandbox: true, contextIsolation: true, nodeIntegration: false,
      },
    });
    win.setMenu(null);
    win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
    win.webContents.on('will-navigate', event => event.preventDefault());
    win.once('ready-to-show', () => { if (!win.isDestroyed()) file === 'node-night.html' ? win.showInactive() : win.show(); });
    void win.loadURL('recall://app/' + file).catch(() => { if (!win.isDestroyed()) win.destroy(); });
    return win;
  }

  private openInvitation(night: string | null) {
    if (this.invitation || this.browser) return;
    const area = screen.getPrimaryDisplay().workArea;
    const width = Math.min(area.width - 24, 340);
    const height = 168;
    const win = this.trustedWindow('node-night.html', {
      width, height, x: area.x + area.width - width - 16, y: area.y + area.height - height - 16,
      frame: false, transparent: true, backgroundColor: '#00000000', hasShadow: false,
      resizable: false, minimizable: false, maximizable: false, alwaysOnTop: true, skipTaskbar: true,
    });
    this.promptNight = night;
    this.invitation = win;
    win.on('close', event => { if (this.picking) event.preventDefault(); });
    win.on('closed', () => {
      if (this.invitation !== win) return;
      this.invitation = null;
      if (!this.preview) { this.document.choice = 'dismiss'; void this.save().catch(() => {}); }
      this.preview = false;
      this.options.onStatus();
    });
    this.options.onStatus();
  }

  private closeInvitation() {
    const win = this.invitation;
    this.invitation = null;
    if (win && !win.isDestroyed()) win.destroy();
    this.options.onStatus();
  }

  private async select(choice: Choice) {
    if (this.picking) return;
    if (!this.preview && !this.options.isAvailable()) throw Error('Інша сесія вже почалася.');
    if (!this.preview && nodeInvitationDay(new Date(),this.startTime) !== this.promptNight) { this.closeInvitation(); return; }
    if(choice==='sleep'&&!this.canSleep)throw Error('Для цього запрошення доступна дія «Пропустити».');
    this.picking = true;
    try {
      if (!this.preview) { this.document.choice = choice; await this.save(); }
      if (choice === 'sleep') {
        await this.options.store.flush();
        if (this.preview || this.options.isolated) {
          if (this.options.shutdown) await this.options.shutdown();
          this.closeInvitation();
        } else {
          await (this.options.shutdown ?? powerOffWindows)();
          this.closeInvitation();
        }
      } else if (choice === 'dismiss') {
        this.closeInvitation();
      } else {
        const health = await this.ensureCourse();
        if (!health.ready) throw Error('Спочатку відкрий Backend Path у звичному браузері та дочекайся синхронізації.');
        this.course = await this.readCourse();
        if (!this.course.candidate) throw Error('Усі доступні уроки завершені. Відкрий сайт для повторення.');
        this.openStudy(this.course.candidate.lessonId);
        this.closeInvitation();
        return;
      }
      this.preview = false;
    } finally { this.picking = false; this.options.onStatus(); }
  }

  private openStudy(lessonId: string) {
    const win = new BrowserWindow({
      show: false, width: 1280, height: 880, autoHideMenuBar: true, backgroundColor: '#191d21',
      webPreferences: {
        partition: this.options.isolated ? 'node-night-test' : 'persist:backend-path-recall',
        sandbox: true, nodeIntegration: false, contextIsolation: true, webSecurity: true,
        preload: path.join(this.options.preloadRoot, 'node-night-preload.cjs'),
      },
    });
    this.browser = win;
    this.phase = 'loading';
    this.ai.newSession();
    win.setMenu(null);
    win.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
    win.webContents.on('will-navigate', (event, url) => { if (!allowedPage(url, this.origin)) event.preventDefault(); });
    win.webContents.on('before-input-event', (event, input) => this.guard.preventExitKey(event, input));
    win.on('close', event => {
      if (this.guard.active) event.preventDefault();
    });
    win.on('leave-full-screen', () => { if (this.guard.active && !win.isDestroyed()) win.setFullScreen(true); });
    const restore = () => {
      if (this.guard.active && !win.isDestroyed()) { win.restore(); win.show(); }
    };
    win.on('minimize', restore);
    win.on('hide', restore);
    win.on('query-session-end', () => this.stop('interrupted'));
    win.on('session-end', () => this.stop('interrupted'));
    win.on('unresponsive', () => this.fail('Вікно Backend Path перестало відповідати.'));
    win.webContents.on('render-process-gone', () => this.fail('Сторінку Backend Path закрито через збій.'));
    win.on('closed', () => {
      if (this.browser !== win) return;
      this.browser = null;
      this.stop('partial');
    });
    this.loadTimer = setTimeout(() => this.fail('Backend Path не завантажився.'), 12_000);
    void win.loadURL(this.origin + '/#/lesson/' + lessonId).catch(() => {
      if (this.browser === win && !win.isDestroyed()) this.fail('Backend Path не завантажився.');
    });
  }

  private async ready() {
    if (this.running) return this.view();
    if (!this.course?.candidate || !this.browser || this.phase !== 'loading' || !this.options.isAvailable()) {
      this.fail('Нічний урок не готовий або інша сесія вже триває.');
      throw Error('Нічний урок не готовий.');
    }
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = null;
    const now = Date.now(), budget = this.durationMinutes*minuteMs;
    const run: NightRun = {
      id: randomUUID(), night: this.promptNight || 'demo', startedAt: now, deadline: now + budget,
      steps: [this.course.candidate], passed: [],
    };
    this.running = run;
    this.monotonicDeadline = performance.now() + budget;
    if (!this.preview && !this.options.isolated) {
      this.document.runs = [...this.document.runs.slice(-365), run];
      try { await this.save(); } catch {
        this.fail('Не вдалося зберегти нічну сесію.'); throw Error('Не вдалося зберегти нічну сесію.');
      }
    }
    if (!this.browser || this.running !== run) throw Error('Сесію вже закрито.');
    this.phase = 'learning';
    this.cutoff = setTimeout(() => this.applyDeadline(Date.now()), budget);
    this.resume();
    this.publish();
    return this.view();
  }

  private view() {
    const run = this.running!;
    const step = run.steps.at(-1)!;
    const course = this.course!;
    const counts = course.lessonCounts?.[step.lessonId];
    return {
      deadline: run.deadline, phase: this.phase, step,
      next: this.phase === 'learning' ? nextNightStep(run, course, Date.now()) : null,
      done: run.passed.length, stepDone: run.passed.includes(step.id),
      completedModules: course.completedModules, totalModules: course.totalModules,
      criteriaDone: counts?.criteriaDone ?? step.criteriaDone, lessonsDone: counts?.lessonsDone ?? step.lessonsDone,
    };
  }

  private publish() {
    if (this.running && this.browser && !this.browser.isDestroyed())
      this.browser.webContents.send('recall:node-state', this.view());
  }

  private applyDeadline(now: number) {
    if (!this.running || (now < this.running.deadline && performance.now() < this.monotonicDeadline) ||
        this.phase === 'wrap-up' || this.phase === 'finished') return;
    this.phase = 'wrap-up';
    this.releaseScreens();
    this.publish();
    this.options.onStatus();
  }

  private async refresh() {
    const run = this.running;
    if (!run || run.endedAt) return;
    const current = await this.readCourse();
    if (run !== this.running) return;
    const before = run.passed.length;
    this.course = current;
    reviewNightProgress(run, current);
    if (this.phase === 'wrap-up' && run.passed.includes(run.steps.at(-1)!.id)) this.phase = 'finished';
    if (run.passed.length !== before && !this.preview && !this.options.isolated) await this.save();
    this.publish();
  }

  private coverDisplays() {
    this.removeCovers();
    if (!this.guard.active || !this.options.exerciseGuard && (this.preview || this.options.isolated)) return;
    const primary = screen.getPrimaryDisplay();
    for (const display of screen.getAllDisplays().filter(d => d.id !== primary.id)) {
      const cover = new BrowserWindow({
        ...display.bounds, show: false, frame: false, resizable: false, focusable: false,
        skipTaskbar: true, closable: false, minimizable: false, alwaysOnTop: true, backgroundColor: '#102d29',
        webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
      });
      cover.setAlwaysOnTop(true, 'screen-saver');
      cover.once('ready-to-show', () => { if (this.guard.active && !cover.isDestroyed()) cover.showInactive(); });
      this.covers.push(cover);
      void cover.loadURL('recall://app/cover.html').catch(() => {
        if (this.guard.active && this.covers.includes(cover) && !cover.isDestroyed())
          this.fail('Не вдалося відкрити другий екран.');
      });
    }
  }

  displaysChanged() { if (this.guard.active) this.coverDisplays(); }

  resume() {
    const win = this.browser;
    if (!win || win.isDestroyed() || !this.running) return;
    this.applyDeadline(Date.now());
    if (this.phase === 'editor') this.phase = 'learning';
    if (this.phase === 'learning' && (this.options.exerciseGuard || !this.preview && !this.options.isolated)) {
      win.setBounds(screen.getPrimaryDisplay().bounds);
      this.guard.enter(win);
      this.coverDisplays();
    }
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    this.publish();
    this.options.onStatus();
  }

  private removeCovers() {
    const retiring = this.covers;
    this.covers = [];
    for (const cover of retiring) if (!cover.isDestroyed()) cover.destroy();
  }

  private releaseScreens() {
    this.guard.leave(this.browser);
    this.removeCovers();
  }

  stop(outcome: NightRun['outcome'] = 'interrupted') {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    if (this.cutoff) clearTimeout(this.cutoff);
    this.loadTimer = this.cutoff = null;
    this.releaseScreens();
    const run = this.running;
    const win = this.browser;
    this.browser = null;
    this.running = null;
    this.phase = 'finished';
    if (run && !this.preview && !this.options.isolated && !run.endedAt) {
      run.endedAt = Date.now();
      run.outcome = outcome;
      void this.save().catch(() => this.options.report('Не вдалося зберегти підсумок Node.js.'));
    }
    this.closeInvitation();
    this.preview = false;
    if (win && !win.isDestroyed()) win.destroy();
    this.options.onStatus();
  }

  private fail(message: string) { this.stop('technical'); this.options.report(message); }

  private async act(action: unknown) {
    const run = this.running;
    if (!run || !this.browser || !this.course) throw Error('Нічна сесія закрита.');
    this.applyDeadline(Date.now());
    const step = run.steps.at(-1)!;
    if (action === 'editor') {
      if (this.phase !== 'learning' || step.section !== 'practice') return;
      this.phase = 'editor';
      this.releaseScreens();
      this.browser.minimize();
      this.publish();
      return;
    }
    if (action !== 'exit') await this.refresh();
    else await this.refresh().catch(() => {});
    if (this.running !== run) return;
    this.applyDeadline(Date.now());
    if (action === 'exit') {
      if (this.phase !== 'wrap-up' && this.phase !== 'finished' && !run.passed.includes(step.id))
        throw Error('Спочатку заверши поточний крок або дочекайся кінця сесії.');
      this.stop(run.passed.includes(step.id) ? 'finished' : 'partial');
    } else if (action === 'next') {
      const next = nextNightStep(run, this.course, Date.now());
      if (!next || this.phase !== 'learning') throw Error('Наступний крок уже не вкладається в час.');
      run.steps.push(next);
      if (!this.preview && !this.options.isolated) await this.save();
      this.publish();
    } else throw Error('Невідома дія Node.js.');
  }

  private control(event: IpcMainInvokeEvent, settings = false) {
    const win = settings ? this.settingsWindow : this.invitation;
    const expected = settings ? 'recall://app/node-night-settings.html' : 'recall://app/node-night.html';
    if (!win || event.sender !== win.webContents || event.senderFrame !== event.sender.mainFrame ||
        event.senderFrame.url !== expected) throw Error('Ця дія доступна лише у вікні Recall.');
  }

  private site(event: IpcMainInvokeEvent) {
    if (!this.browser || event.sender !== this.browser.webContents || event.senderFrame !== event.sender.mainFrame ||
        !allowedPage(event.senderFrame.url, this.origin)) throw Error('Ця дія доступна лише в нічній сесії Backend Path.');
  }

  private installHandlers() {
    const state = () => ({ durationMinutes:this.durationMinutes, canSleep:this.canSleep, demo: this.preview || this.options.isolated, ...this.ai.settings() });
    ipcMain.handle('recall:node-control-state', event => {
      this.control(event, event.sender === this.settingsWindow?.webContents); return state();
    });
    ipcMain.handle('recall:node-choice', (event, choice) => {
      this.control(event);
      if (!['learn','sleep','dismiss'].includes(choice)) throw Error('Невідома дія.');
      return this.select(choice);
    });
    ipcMain.handle('recall:node-config', async (event, value) => {
      this.control(event, true);
      if (!value || typeof value.shared !== 'boolean' ||
          typeof value.key !== 'string' || value.key.length > 500) throw Error('Некоректні налаштування.');
      await this.ai.configure(value.key, value.shared);
      return state();
    });
    ipcMain.handle('recall:node-open-course', async event => {
      this.control(event, true);
      await this.ensureCourse();
      await shell.openExternal(this.origin + '/');
    });
    ipcMain.handle('recall:node-preview', async event => {
      this.control(event, true);
      if (this.busy || this.invitation || this.browser || !this.options.isAvailable()) throw Error('Інша сесія вже триває.');
      this.preview = true;
      this.openInvitation(null);
    });
    ipcMain.handle('recall:node-ready', event => { this.site(event); return this.ready(); });
    ipcMain.handle('recall:node-act', (event, action) => { this.site(event); return this.act(action); });
    ipcMain.handle('recall:node-ask', async (event, input) => {
      this.site(event);
      if (!this.running || !input || typeof input.lesson !== 'string' || !/^[a-z0-9-]{1,100}$/.test(input.lesson) ||
          !['lecture','practice','check'].includes(input.section) || typeof input.question !== 'string' ||
          input.question.length > 1100 || typeof input.code !== 'string' || input.code.length > 2600 ||
          input.btw !== undefined && typeof input.btw !== 'boolean' ||
          !input.question.trim() && input.btw !== true)
        throw Error('Введи коротке запитання.');
      const visible = new URL(event.senderFrame!.url).hash.split('/')[2];
      const lesson = visible === input.lesson ? input.lesson : this.running.steps.at(-1)!.lessonId;
      const context = await this.request('context?lesson=' + encodeURIComponent(lesson) + '&section=' + input.section);
      const plan = this.running.steps.map(step => step.lesson + ': ' + step.title).join(' → ');
      if (this.preview) return 'Демо Luna. Скористайся підказками до поточного завдання та перевір один приклад.';
      return this.ai.ask(input.question, input.code, context, plan, lesson, input.btw === true, input.luna);
    });
    app.on('before-quit', () => this.closeInvitation());
  }
}
