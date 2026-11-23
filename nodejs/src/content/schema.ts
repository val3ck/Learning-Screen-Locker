export type Track = 'core' | 'react' | 'advanced';
export interface CourseModule {
  id: string; order: number; title: string; eyebrow: string; description: string;
  track: Track; hours: [number, number]; prerequisites: string[];
  project: { title: string; brief: string; deliverables: string[]; hours: number };
}
export type Quiz = {
  kind: 'choice'; question: string; code?: string; options: string[];
  answer: number; explanation: string;
} | {
  kind: 'order'; question: string; items: { id: string; text: string }[];
  answer: string[]; explanation: string;
} | {
  kind: 'input'; question: string; code?: string; accepted: string[];
  explanation: string;
};
export interface Lab {
  language: 'js' | 'ts' | 'tsx';
  starter: string; solution: string;
  /** Node test body. `test`, `assert`, and the module namespace `subject` are in scope. */
  tests: string;
  dependencies?: Record<string, string>;
  files?: Record<string, string>;
  instructions?: string;
  testCases?: string[];
  refactor?: { file: string; goal: string };
}
export interface Lesson {
  id: string; moduleId: string; title: string; summary: string;
  lectureMinutes: number; practiceMinutes: number;
  goals: string[];
  task: string; steps: string[]; hints: string[]; criteria: string[];
  mistakes: string[]; reviewQuestions: string[];
  extensions: string[];
  sources: { title: string; url: string }[];
  quiz: Quiz; lab: Lab;
}
