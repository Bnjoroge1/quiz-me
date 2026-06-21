import {
  createServer as createHttpServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { URL } from "node:url";
import type { QuizDB } from "./db.js";
import type { CreateQuizMeta, Question, QuizPayload } from "./types.js";
import { renderIndex } from "./ui.js";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function validatePayload(payload: QuizPayload): string[] {
  const errors: string[] = [];
  if (!payload.summary || typeof payload.summary !== "string") {
    errors.push("summary must be a non-empty string");
  }
  if (!Array.isArray(payload.questions) || payload.questions.length < 1) {
    errors.push("questions must be a non-empty array");
    return errors;
  }
  payload.questions.forEach((q, i) => {
    if (!q.prompt) errors.push(`questions[${i}].prompt required`);
    if (!q.answer) errors.push(`questions[${i}].answer required`);
    if (!q.explanation) errors.push(`questions[${i}].explanation required`);
    if (q.type === "multiple-choice") {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push(`questions[${i}].options must have exactly 4 items`);
      } else if (!q.options.includes(q.answer)) {
        errors.push(`questions[${i}].answer must be one of options`);
      }
    }
    if (q.type === "true-false" && q.answer !== "true" && q.answer !== "false") {
      errors.push(`questions[${i}].answer must be true or false`);
    }
  });
  return errors;
}

export function createServer(db: QuizDB, host = "127.0.0.1"): Server {
  return createHttpServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const path = url.pathname;

      if (req.method === "GET" && path === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(renderIndex());
        return;
      }

      if (req.method === "GET" && path === "/api/health") {
        json(res, 200, { ok: true });
        return;
      }

      if (req.method === "GET" && path === "/api/quizzes") {
        json(res, 200, db.listQuizzes());
        return;
      }

      const quizMatch = path.match(/^\/api\/quizzes\/([^/]+)$/);
      if (req.method === "GET" && quizMatch) {
        const quiz = db.getQuiz(quizMatch[1]);
        if (!quiz) {
          json(res, 404, { error: "not found" });
          return;
        }
        json(res, 200, quiz);
        return;
      }

      if (req.method === "POST" && path === "/api/quizzes") {
        const raw = await readBody(req);
        const body = JSON.parse(raw) as QuizPayload &
          Partial<CreateQuizMeta> & {
            diff?: string;
            planText?: string;
            filesJson?: string;
          };
        const errors = validatePayload(body);
        if (errors.length) {
          json(res, 400, { error: "validation failed", fields: errors });
          return;
        }
        const scope = (body.scope ?? url.searchParams.get("scope") ?? "uncommitted") as CreateQuizMeta["scope"];
        const branchRef = body.branchRef ?? url.searchParams.get("branchRef") ?? undefined;
        const contextDigest = body.contextDigest ?? url.searchParams.get("contextDigest") ?? "";
        const questions: Question[] = body.questions.map((q) => ({
          ...q,
          id: crypto.randomUUID(),
          quizId: "",
          codeRef: q.codeRef ?? undefined,
        }));
        const quiz = db.createQuiz({
          scope,
          branchRef: branchRef || undefined,
          summary: body.summary,
          contextDigest,
          questions,
          diff: body.diff || url.searchParams.get("diff") || undefined,
          planText: body.planText || url.searchParams.get("planText") || undefined,
          filesJson: body.filesJson || url.searchParams.get("filesJson") || undefined,
        });
        const addr = res.socket?.localPort ?? url.port;
        const base = `http://${host}:${addr}`;
        json(res, 201, { id: quiz.id, url: `${base}/#/quiz/${quiz.id}` });
        return;
      }

      const attemptMatch = path.match(/^\/api\/quizzes\/([^/]+)\/attempts$/);
      if (req.method === "POST" && attemptMatch) {
        const raw = await readBody(req);
        const body = JSON.parse(raw) as { answers: { questionId: string; given: string }[] };
        try {
          const attempt = db.createAttempt(attemptMatch[1], body.answers ?? []);
          json(res, 201, attempt);
        } catch {
          json(res, 404, { error: "not found" });
        }
        return;
      }

      json(res, 404, { error: "not found" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      json(res, 500, { error: message });
    }
  });
}

export function listen(server: Server, port: number, host = "127.0.0.1"): Promise<number> {
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, host, () => {
      const addr = server.address();
      const actual = typeof addr === "object" && addr ? addr.port : port;
      resolve(actual);
    });
  });
}
