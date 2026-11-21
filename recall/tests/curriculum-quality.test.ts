import test from 'node:test';
import assert from 'node:assert/strict';
import * as Course from '../src/modules/english/vendor/course';
import * as Learning from '../src/modules/english/vendor/learning';
import { EnglishController, newEnglishDocument } from '../src/modules/english/controller';

function splitSentences(text: string): string[] {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.replace(/\s+/g, ' ').trim().toLowerCase())
    .filter(s => s.split(/\s+/).length >= 6);
}

test('All 84 lessons follow v2 5-layer progressive structure with enriched concept brief and catch-words', () => {
  assert.equal(Course.lessons.length, 84);
  for (const lesson of Course.lessons as any[]) {
    assert.equal(lesson.curriculumVersion, 2, `${lesson.id} must be curriculumVersion 2`);
    assert.ok(lesson.concept.summary && lesson.concept.summary.length > 30, `${lesson.id} missing concept.summary`);
    assert.ok(lesson.concept.ukBrief && /[\u0400-\u04ff]/.test(lesson.concept.ukBrief), `${lesson.id} missing Ukrainian concept.ukBrief`);
    assert.ok(Array.isArray(lesson.concept.steps) && lesson.concept.steps.length >= 4, `${lesson.id} needs >= 4 concept.steps`);
    assert.ok(lesson.concept.realWorldWhy && lesson.concept.realWorldWhy.length > 20, `${lesson.id} missing concept.realWorldWhy`);
    assert.ok(lesson.concept.misconception && lesson.concept.misconception.length > 15, `${lesson.id} missing concept.misconception`);

    for (const v of lesson.vocabulary) {
      assert.ok(v.pos, `${lesson.id} vocab ${v.en} missing pos`);
      assert.ok(v.conceptPrompt && v.conceptPrompt.includes(v.en), `${lesson.id} vocab ${v.en} missing conceptPrompt`);
    }

    assert.ok(Array.isArray(lesson.listening.catchWords) && lesson.listening.catchWords.length === 6, `${lesson.id} must have 6 catchWords`);
    const dialogueText = lesson.listening.dialogue.map((d: any) => d.text).join(' ').toLowerCase();
    for (const cw of lesson.listening.catchWords) {
      assert.ok(cw.word && cw.pos && cw.uk && cw.meaning && cw.quote, `${lesson.id} catchWord incomplete`);
      assert.ok(dialogueText.includes(cw.word.toLowerCase()), `${lesson.id} catchWord "${cw.word}" must appear in listening.dialogue`);
    }

    for (const q of lesson.reading.questions) {
      assert.ok(q.openPrompt && q.instruction && q.targetForm && q.hint && q.example, `${lesson.id} reading question missing open task fields`);
    }
    for (const q of lesson.listening.questions) {
      assert.ok(q.openPrompt && q.instruction && q.targetForm && q.hint && q.example, `${lesson.id} listening question missing open task fields`);
    }
    assert.ok(Array.isArray(lesson.grammar.nativePatterns) && lesson.grammar.nativePatterns.length >= 3, `${lesson.id} missing grammar.nativePatterns`);
    for (const q of lesson.grammar.exercises) {
      assert.ok(q.openPrompt && q.instruction && q.targetForm && q.hint && q.example, `${lesson.id} grammar exercise missing open task fields`);
    }
    assert.ok(lesson.speaking.scenario?.context && Array.isArray(lesson.speaking.frames) && lesson.speaking.frames.length >= 3, `${lesson.id} missing speaking scenario/frames`);
    assert.ok(lesson.writing.brief?.situation && Array.isArray(lesson.writing.frames) && lesson.writing.frames.length >= 3, `${lesson.id} missing writing brief/frames`);
  }
});

test('Agile feedback (daily-003) covers the 6 SDLC stages and Containers (daily-065) covers Alpine Linux, Node.js, port mapping, and docker-compose', () => {
  const agile = Course.getLesson('daily-003') as any;
  assert.ok(agile);
  assert.equal(agile.concept.steps.length, 6);
  assert.match(agile.reading.text, /Software Development Life Cycle \(SDLC\)/);
  assert.match(agile.reading.text, /Waterfall/);

  const docker = Course.getLesson('daily-065') as any;
  assert.ok(docker);
  assert.match(docker.reading.text, /Alpine Linux/);
  assert.match(docker.reading.text, /Node\.js/);
  assert.match(docker.speaking.scenario.context, /3000:3000/);
  assert.match(docker.writing.brief.situation, /docker-compose\.yml/);
});

test('Zero duplicated sentences across Reading, Listening, Speaking, and Writing in every lesson', () => {
  for (const lesson of Course.lessons as any[]) {
    const readingSentences = new Set(splitSentences(lesson.reading.text));
    const listeningSentences = splitSentences(lesson.listening.dialogue.map((d: any) => d.text).join(' '));
    const speakingSentences = splitSentences(lesson.speaking.scenario.context);
    const writingSentences = splitSentences(lesson.writing.brief.situation);

    for (const s of listeningSentences) {
      assert.ok(!readingSentences.has(s), `${lesson.id} listening duplicates reading sentence: "${s}"`);
    }
    for (const s of speakingSentences) {
      assert.ok(!readingSentences.has(s), `${lesson.id} speaking duplicates reading sentence: "${s}"`);
      assert.ok(!listeningSentences.includes(s), `${lesson.id} speaking duplicates listening sentence: "${s}"`);
    }
    for (const s of writingSentences) {
      assert.ok(!readingSentences.has(s), `${lesson.id} writing duplicates reading sentence: "${s}"`);
      assert.ok(!listeningSentences.includes(s), `${lesson.id} writing duplicates listening sentence: "${s}"`);
      assert.ok(!speakingSentences.includes(s), `${lesson.id} writing duplicates speaking sentence: "${s}"`);
    }
  }
});

test('Listening requires 1 listen and all 7 blocks support open AI grading and unified mistake logging', () => {
  const c = new EnglishController(newEnglishDocument(new Date('2026-11-19T19:00:00Z')), () => new Date('2026-11-19T19:00:00Z'));
  c.start();
  const session = c.document.course.activeSession as any;
  assert.ok(session);

  c.dispatch({ type: 'listen-complete' });
  assert.equal(session.listens, 1);

  for (const area of ['listening', 'grammar'] as const) {
    const items = (Learning as any).areaItems(session, area);
    assert.ok(items.length >= 3);
    for (const item of items) {
      c.dispatch({ type: 'answer', key: item.key, value: `In Agile software engineering, we verify each stage carefully (${item.key}).` });
    }
    const bundle = (Learning as any).assessmentBundle(session, area);
    const snapshot = JSON.stringify(bundle.answers.map((a: any) => [a.key, a.text]));
    const assessment = {
      version: 1,
      source: 'ai',
      area,
      provider: 'test',
      model: 'test-model',
      checkedAt: new Date().toISOString(),
      passed: true,
      score: 88,
      snapshot,
      answers: bundle.answers.map((a: any, idx: number) => ({
        key: a.key,
        passed: true,
        score: 88,
        scores: { task: 4, grammar: 3, vocabulary: 4, clarity: 4, coherence: 4 },
        summary: 'Хороша відповідь із чітким поясненням концепту.',
        strengths: ['Точне використання термінології.'],
        corrections: idx === 0 ? [{
          original: 'we verify each stage',
          replacement: 'we validate each SDLC stage',
          explanation: 'Використовуй validate для технічної перевірки етапу.',
          kind: 'error'
        }] : [],
        nextStep: 'Спробуй використати фразу under the hood.'
      })),
      conclusion: {
        version: 1,
        passed: bundle.answers.length,
        total: bundle.answers.length,
        strengths: ['Чітке розуміння етапів SDLC.'],
        priorities: [{
          key: bundle.answers[0].key,
          answerKeys: [bundle.answers[0].key],
          skill: 'word-choice',
          focus: 'Використання дієслова validate замість загального verify у контексті SDLC.',
          rule: 'Validate підкреслює перевірку відповідності критеріям прийняття.',
          example: 'We validate the sprint increment during Stage 4.',
          practice: 'Write one sentence using "validate" about Stage 4 of Agile.',
          solution: 'In Stage 4, QA engineers validate the new feature against acceptance criteria.'
        }]
      }
    };
    c.acceptAI(assessment);
  }

  const view = c.view();
  const listeningStatus = view.blockStatus?.find(b => b.id === 'listening');
  const grammarStatus = view.blockStatus?.find(b => b.id === 'grammar');
  assert.equal(listeningStatus?.done, true, 'Listening block must be marked done with 1 listen + AI assessment');
  assert.equal(grammarStatus?.done, true, 'Grammar block must be marked done with AI assessment');
  assert.ok(session.mistakeLog.length >= 2, 'Mistakes from listening and grammar must be logged to session.mistakeLog');
  assert.match(view.advanceBlocker || '', /Fill in the answers.*Check new or edited answers/, 'Unfinished Review shows how to proceed in English');
});
