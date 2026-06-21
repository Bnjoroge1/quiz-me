import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { QuizDB } from "../src/db.js";
import { createServer, listen } from "../src/server.js";
import type { Server } from "node:http";

describe("server", () => {
  let dir: string;
  let db: QuizDB;
  let server: Server;
  let port: number;
  const host = "127.0.0.1";

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), "quiz-srv-"));
    db = new QuizDB(join(dir, "test.db"));
    server = createServer(db, host);
    port = await listen(server, 0, host);
  });

  afterEach(() => {
    server.close();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("GET /api/health", async () => {
    const res = await fetch(`http://${host}:${port}/api/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { ok: boolean };
    assert.equal(body.ok, true);
  });

  it("POST /api/quizzes and GET back", async () => {
    const payload = {
      summary: "Test",
      questions: [{
        difficulty: "recall", kind: "code", type: "multiple-choice",
        prompt: "Q?", options: ["a","b","c","d"], answer: "a", explanation: "Because"
      }],
    };
    const res = await fetch(`http://${host}:${port}/api/quizzes?scope=uncommitted&contextDigest=digest1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(res.status, 201);
    const created = (await res.json()) as { id: string };
    assert.ok(created.id);
    const get = await fetch(`http://${host}:${port}/api/quizzes/${created.id}`);
    assert.equal(get.status, 200);
  });

  it("POST invalid MC returns 400", async () => {
    const payload = {
      summary: "Bad",
      questions: [{
        difficulty: "recall", kind: "code", type: "multiple-choice",
        prompt: "Q?", options: ["a","b"], answer: "z", explanation: "x"
      }],
    };
    const res = await fetch(`http://${host}:${port}/api/quizzes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(res.status, 400);
  });

  it("POST attempt grades correctly", async () => {
    const createRes = await fetch(`http://${host}:${port}/api/quizzes?scope=uncommitted&contextDigest=d2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: "Grade",
        questions: [{
          difficulty: "recall", kind: "code", type: "true-false",
          prompt: "T?", answer: "true", explanation: "yes"
        }],
      }),
    });
    const { id } = (await createRes.json()) as { id: string };
    const quizRes = await fetch(`http://${host}:${port}/api/quizzes/${id}`);
    const quiz = (await quizRes.json()) as { questions: { id: string }[] };
    const qid = quiz.questions[0].id;
    const attemptRes = await fetch(`http://${host}:${port}/api/quizzes/${id}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: [{ questionId: qid, given: "true" }] }),
    });
    assert.equal(attemptRes.status, 201);
    const attempt = (await attemptRes.json()) as { score: number };
    assert.equal(attempt.score, 1);
  });

  it("GET unknown quiz 404", async () => {
    const res = await fetch(`http://${host}:${port}/api/quizzes/nope`);
    assert.equal(res.status, 404);
  });
});
