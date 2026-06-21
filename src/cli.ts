#!/usr/bin/env node
import { spawn, execSync } from "node:child_process";
import { platform } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { QuizDB } from "./db.js";
import { gatherContext, ContextError } from "./context.js";
import { buildPrompt, resolveDifficultyMix } from "./prompt.js";
import { createServer, listen } from "./server.js";
import {
  readPortFile,
  writePortFile,
  readLastDigest,
  writeLastDigest,
} from "./paths.js";
import type { Scope } from "./types.js";

const HOST = "127.0.0.1";

function usage(): void {
  console.log(`quiz-me — context-aware quiz plugin

Usage:
  quiz-me serve [--port <n>] [--auto-open]
  quiz-me generate [--scope uncommitted|whole|branch] [--branch <ref>] [--difficulty easy|mix|hard] [--plan <path>]
  quiz-me auto [--scope uncommitted] [--difficulty mix]
  quiz-me status
  quiz-me list
  quiz-me install --platform <claude-code|codex|oh-my-pi> [target-dir]`);
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  out._ = positional.join(" ");
  return out;
}

async function healthCheck(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://${HOST}:${port}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

function openBrowser(url: string): void {
  const cmd = platform() === "darwin" ? "open" : platform() === "win32" ? "start" : "xdg-open";
  spawn(cmd, [url], { detached: true, stdio: "ignore" }).unref();
}

async function cmdServe(args: Record<string, string | boolean>): Promise<void> {
  const existing = readPortFile();
  if (existing && (await healthCheck(existing))) {
    const url = `http://${HOST}:${existing}`;
    console.log(`Server already running at ${url}`);
    if (args["auto-open"]) openBrowser(url);
    return;
  }

  const db = new QuizDB();
  const server = createServer(db, HOST);
  const requested = args.port ? parseInt(String(args.port), 10) : 0;
  const port = await listen(server, requested, HOST);
  writePortFile(port);
  const url = `http://${HOST}:${port}`;
  console.log(`Listening on ${url}`);
  if (args["auto-open"]) openBrowser(url);

  const shutdown = () => {
    server.close();
    db.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function ensureServer(): Promise<number> {
  const existing = readPortFile();
  if (existing && (await healthCheck(existing))) return existing;
  const db = new QuizDB();
  const server = createServer(db, HOST);
  const port = await listen(server, 0, HOST);
  writePortFile(port);
  console.error(`Started server on http://${HOST}:${port}`);
  return port;
}

async function cmdGenerate(args: Record<string, string | boolean>): Promise<void> {
  const scope = (String(args.scope ?? "uncommitted")) as Scope;
  const branchRef = args.branch ? String(args.branch) : undefined;
  if (scope === "branch" && !branchRef) {
    console.error("Error: --branch required when --scope=branch");
    process.exit(2);
  }
  const difficulty = String(args.difficulty ?? "mix");
  const mix = resolveDifficultyMix(difficulty);
  try {
    const ctx = gatherContext(scope, {
      branchRef,
      planPath: args.plan ? String(args.plan) : undefined,
    });

    const port = readPortFile() ?? 7331;

    // Pre-stage context payload to server
    try {
      const payload = {
        contextDigest: ctx.contextDigest,
        diff: ctx.diff,
        planText: ctx.planText,
        filesJson: JSON.stringify(ctx.filesContent ?? []),
      };
      const res = await fetch(`http://${HOST}:${port}/api/contexts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.warn(`[quiz-me] Warning: context staging returned status ${res.status}`);
      }
    } catch (e) {
      console.warn("[quiz-me] Warning: failed to connect to local server for context pre-staging. Code traces may not be available in this quiz.");
    }

    const prompt = buildPrompt(ctx, mix);
    console.log(prompt);
    console.log(
      `\nPOST to http://${HOST}:${port}/api/quizzes?scope=${ctx.scope}&contextDigest=${ctx.contextDigest}${ctx.branchRef ? `&branchRef=${ctx.branchRef}` : ""} with the JSON body.`
    );
  } catch (err) {
    if (err instanceof ContextError) {
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
}

async function cmdAuto(args: Record<string, string | boolean>): Promise<void> {
  const scope = (String(args.scope ?? "uncommitted")) as Scope;
  try {
    const ctx = gatherContext(scope);
    if (scope === "uncommitted" && !ctx.diff.trim()) {
      process.exit(0);
    }
    const last = readLastDigest();
    if (last === ctx.contextDigest) {
      process.exit(0);
    }

    // Interactive Agent Instruction
    console.log(`[quiz-me] New modifications detected since the last session.
Ask the user if they would like to take a quiz to verify their understanding of the changes.
Offer the following options:
1. uncommitted (Default: quiz on recent changes)
2. whole (Quiz on the entire project)
3. branch (Quiz on changes against a target branch)
4. Skip/No thanks.

If they select 1, 2, or 3, run the corresponding command:
'quiz-me generate --scope <uncommitted|whole|branch> [--branch <ref>]'
and complete the quiz generation flow.`);
    
    // Save digest to prevent duplicate prompts for the same unmodified changes
    writeLastDigest(ctx.contextDigest);
  } catch (err) {
    if (err instanceof ContextError) {
      process.exit(0);
    }
    throw err;
  }
}

async function cmdStatus(): Promise<void> {
  const port = readPortFile();
  if (!port || !(await healthCheck(port))) {
    console.log("not running");
    process.exit(1);
  }
  console.log(`running on http://${HOST}:${port}`);
}

async function cmdList(): Promise<void> {
  const port = readPortFile();
  if (!port || !(await healthCheck(port))) {
    console.error("Server not running. Start with: quiz-me serve");
    process.exit(1);
  }
  const res = await fetch(`http://${HOST}:${port}/api/quizzes`);
  const quizzes = (await res.json()) as { id: string; summary: string; createdAt: string; questions: unknown[] }[];
  if (!quizzes.length) {
    console.log("No quizzes.");
    return;
  }
  for (const q of quizzes) {
    console.log(`${q.id}\t${q.questions.length}q\t${q.summary}\t${q.createdAt}`);
  }
}

function cmdInstall(args: Record<string, string | boolean>): void {
  const platformName = String(args.platform ?? "");
  const target = args._ ? String(args._).trim() || "." : ".";
  const valid = ["claude-code", "codex", "oh-my-pi"];
  if (!valid.includes(platformName)) {
    console.error(`Error: --platform must be one of: ${valid.join(", ")}`);
    process.exit(2);
  }
  
  // Resolve path relative to the package installation directory
  const currentDir = import.meta.dirname || dirname(fileURLToPath(import.meta.url));
  const packageRootDir = resolve(currentDir, "..", "..");
  const script = join(packageRootDir, "adapters", platformName, "install.sh");

  console.log(`[quiz-me] Executing installer: ${script}`);
  execSync(`bash "${script}" "${target}"`, { stdio: "inherit" });
}

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;
  const args = parseArgs(rest);

  switch (command) {
    case "serve":
      await cmdServe(args);
      break;
    case "generate":
      await cmdGenerate(args);
      break;
    case "auto":
      await cmdAuto(args);
      break;
    case "status":
      await cmdStatus();
      break;
    case "list":
      await cmdList();
      break;
    case "install":
      cmdInstall(args);
      break;
    case undefined:
    case "help":
    case "--help":
    case "-h":
      usage();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
