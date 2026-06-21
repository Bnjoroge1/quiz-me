import { DatabaseSync } from "node:sqlite";
import { dbPath, ensureDir, dataDir } from "./paths.js";
import type { Attempt, AttemptAnswer, Question, Quiz } from "./types.js";

export class QuizDB {
  private db: DatabaseSync;

  constructor(path?: string) {
    ensureDir(dataDir());
    this.db = new DatabaseSync(path ?? dbPath());
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quizzes(
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        scope TEXT NOT NULL,
        branch_ref TEXT,
        summary TEXT NOT NULL,
        context_digest TEXT NOT NULL,
        questions_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS attempts(
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        score REAL NOT NULL,
        answers_json TEXT NOT NULL,
        FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON attempts(quiz_id);
      CREATE TABLE IF NOT EXISTS staged_contexts(
        context_digest TEXT PRIMARY KEY,
        diff TEXT,
        plan_text TEXT,
        files_json TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // Add new columns if not present (migration step)
    try {
      this.db.exec("ALTER TABLE quizzes ADD COLUMN diff TEXT;");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE quizzes ADD COLUMN plan_text TEXT;");
    } catch (e) {}
    try {
      this.db.exec("ALTER TABLE quizzes ADD COLUMN files_json TEXT;");
    } catch (e) {}
  }

  createQuiz(input: {
    scope: Quiz["scope"];
    branchRef?: string;
    summary: string;
    contextDigest: string;
    questions: Omit<Question, "id" | "quizId">[];
    diff?: string;
    planText?: string;
    filesJson?: string;
  }): Quiz {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const questions = input.questions.map((q) => ({ ...q, id: crypto.randomUUID(), quizId: id }));
    const quiz: Quiz = { ...input, id, createdAt, questions };
    this.db
      .prepare(
        `INSERT INTO quizzes (id, created_at, scope, branch_ref, summary, context_digest, questions_json, diff, plan_text, files_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        quiz.id,
        quiz.createdAt,
        quiz.scope,
        quiz.branchRef ?? null,
        quiz.summary,
        quiz.contextDigest,
        JSON.stringify(questions),
        quiz.diff ?? null,
        quiz.planText ?? null,
        quiz.filesJson ?? null
      );
    return quiz;
  }

  getQuiz(id: string): Quiz | undefined {
    const row = this.db
      .prepare(`SELECT * FROM quizzes WHERE id = ?`)
      .get(id) as
      | {
          id: string;
          created_at: string;
          scope: string;
          branch_ref: string | null;
          summary: string;
          context_digest: string;
          questions_json: string;
          diff: string | null;
          plan_text: string | null;
          files_json: string | null;
        }
      | undefined;
    if (!row) return undefined;
    return {
      id: row.id,
      createdAt: row.created_at,
      scope: row.scope as Quiz["scope"],
      branchRef: row.branch_ref ?? undefined,
      summary: row.summary,
      contextDigest: row.context_digest,
      questions: JSON.parse(row.questions_json) as Question[],
      diff: row.diff ?? undefined,
      planText: row.plan_text ?? undefined,
      filesJson: row.files_json ?? undefined,
    };
  }

  listQuizzes(limit = 50): Quiz[] {
    const rows = this.db
      .prepare(`SELECT id FROM quizzes ORDER BY created_at DESC LIMIT ?`)
      .all(limit) as { id: string }[];
    return rows
      .map((r) => this.getQuiz(r.id))
      .filter((q): q is Quiz => q !== undefined);
  }

  createAttempt(
    quizId: string,
    answers: { questionId: string; given: string }[]
  ): Attempt {
    const quiz = this.getQuiz(quizId);
    if (!quiz) {
      throw new Error("not found");
    }
    const graded: AttemptAnswer[] = answers.map((a) => {
      const q = quiz.questions.find((x) => x.id === a.questionId);
      if (!q) return { questionId: a.questionId, given: a.given, correct: false };
      let correct = false;
      if (q.type === "multiple-choice" || q.type === "true-false") {
        correct = a.given.trim() === q.answer.trim();
      } else {
        correct =
          a.given.trim().toLowerCase() === q.answer.trim().toLowerCase();
      }
      return { questionId: a.questionId, given: a.given, correct };
    });
    const autoGraded = graded.filter((a) => {
      const q = quiz.questions.find((x) => x.id === a.questionId);
      return q?.type !== "short-answer";
    });
    const score =
      autoGraded.length === 0
        ? 0
        : autoGraded.filter((a) => a.correct).length / autoGraded.length;
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      quizId,
      createdAt: new Date().toISOString(),
      score,
      answers: graded,
    };
    this.db
      .prepare(
        `INSERT INTO attempts (id, quiz_id, created_at, score, answers_json) VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        attempt.id,
        attempt.quizId,
        attempt.createdAt,
        attempt.score,
        JSON.stringify(attempt.answers)
      );
    return attempt;
  }

  listAttempts(quizId: string): Attempt[] {
    const rows = this.db
      .prepare(`SELECT * FROM attempts WHERE quiz_id = ? ORDER BY created_at DESC`)
      .all(quizId) as {
      id: string;
      quiz_id: string;
      created_at: string;
      score: number;
      answers_json: string;
    }[];
    return rows.map((r) => ({
      id: r.id,
      quizId: r.quiz_id,
      createdAt: r.created_at,
      score: r.score,
      answers: JSON.parse(r.answers_json) as AttemptAnswer[],
    }));
  }

  stageContext(input: { contextDigest: string; diff?: string; planText?: string; filesJson?: string }): void {
    const createdAt = new Date().toISOString();
    // Use REPLACE to avoid duplicate key errors on regenerations
    this.db
      .prepare(
        `INSERT OR REPLACE INTO staged_contexts (context_digest, diff, plan_text, files_json, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        input.contextDigest,
        input.diff ?? null,
        input.planText ?? null,
        input.filesJson ?? null,
        createdAt
      );
  }

  getStagedContext(contextDigest: string): { diff?: string; planText?: string; filesJson?: string } | undefined {
    const row = this.db
      .prepare(`SELECT * FROM staged_contexts WHERE context_digest = ?`)
      .get(contextDigest) as
      | {
          context_digest: string;
          diff: string | null;
          plan_text: string | null;
          files_json: string | null;
          created_at: string;
        }
      | undefined;
    if (!row) return undefined;
    return {
      diff: row.diff ?? undefined,
      planText: row.plan_text ?? undefined,
      filesJson: row.files_json ?? undefined,
    };
  }

  close(): void {
    this.db.close();
  }
}
