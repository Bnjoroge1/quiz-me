import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { QuizDB } from "../src/db.js";
import type { Question } from "../src/types.js";

function sampleQuestion(overrides: Partial<Question> = {}): Omit<Question, "id" | "quizId"> {
  return {
    difficulty: "recall",
    kind: "code",
    type: "multiple-choice",
    prompt: "What does foo do?",
    options: ["a", "b", "c", "d"],
    answer: "a",
    explanation: "Because a.",
    ...overrides,
  };
}

describe("QuizDB", () => {
  let dir: string;
  let db: QuizDB;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "quiz-me-"));
    db = new QuizDB(join(dir, "test.db"));
  });

  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("createQuiz roundtrip", () => {
    const quiz = db.createQuiz({
      scope: "uncommitted",
      summary: "Test quiz",
      contextDigest: "abc123",
      questions: [sampleQuestion()],
    });
    assert.equal(quiz.questions.length, 1);
    const got = db.getQuiz(quiz.id);
    assert.ok(got);
    assert.equal(got.summary, "Test quiz");
  });

  it("grades multiple-choice correctly", () => {
    const quiz = db.createQuiz({
      scope: "uncommitted",
      summary: "Grade test",
      contextDigest: "x",
      questions: [sampleQuestion()],
    });
    const attempt = db.createAttempt(quiz.id, [{ questionId: quiz.questions[0].id, given: "a" }]);
    assert.equal(attempt.score, 1);
    assert.equal(attempt.answers[0].correct, true);
  });

  it("grades wrong answer as incorrect", () => {
    const quiz = db.createQuiz({
      scope: "uncommitted",
      summary: "Wrong",
      contextDigest: "x",
      questions: [sampleQuestion()],
    });
    const attempt = db.createAttempt(quiz.id, [{ questionId: quiz.questions[0].id, given: "b" }]);
    assert.equal(attempt.score, 0);
  });

  it("missing quiz throws on attempt", () => {
    assert.throws(() => db.createAttempt("nope", []), /not found/);
  });
});
