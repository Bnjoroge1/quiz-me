export type Difficulty = "recall" | "apply" | "analyze";
export type QuestionKind = "code" | "plan-vs-code" | "plan";
export type QuestionType = "multiple-choice" | "short-answer" | "true-false";
export type Scope = "uncommitted" | "whole" | "branch";

export interface CodeRef {
  path: string;
  startLine: number;
  endLine: number;
}

export interface Question {
  id: string;
  quizId: string;
  difficulty: Difficulty;
  kind: QuestionKind;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  codeRef?: CodeRef;
}

export interface Quiz {
  id: string;
  createdAt: string;
  scope: Scope;
  branchRef?: string;
  summary: string;
  contextDigest: string;
  questions: Question[];
  // Rich extension properties
  diff?: string;
  planText?: string;
  filesJson?: string; // stringified Array of { path: string, content: string }
}

export interface AttemptAnswer {
  questionId: string;
  given: string;
  correct: boolean;
}

export interface Attempt {
  id: string;
  quizId: string;
  createdAt: string;
  score: number;
  answers: AttemptAnswer[];
}

export interface GatheredContext {
  scope: Scope;
  branchRef?: string;
  diff: string;
  files: { path: string; lines: number }[];
  planText?: string;
  contextDigest: string;
  filesContent?: { path: string; content: string }[];
}
export interface QuizPayload {
  summary: string;
  questions: Omit<Question, "id" | "quizId">[];
}

export interface CreateQuizMeta {
  scope: Scope;
  branchRef?: string;
  contextDigest: string;
}
