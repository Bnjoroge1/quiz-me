import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GatheredContext, Scope } from "./types.js";

export class ContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContextError";
  }
}

const PLAN_CANDIDATES = ["PLAN.md", "plan.md", "docs/plan.md", ".quiz-me/plan.md"];

function runGit(args: string[], cwd: string): string {
  try {
    return execSync(`git ${args.join(" ")}`, {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ContextError(`git command failed: ${msg}`);
  }
}

function filesFromDiff(diff: string): { path: string; lines: number }[] {
  const files: { path: string; lines: number }[] = [];
  const chunks = diff.split(/^diff --git /m).filter(Boolean);
  for (const chunk of chunks) {
    const m = chunk.match(/^a\/(.+?) b\//);
    if (m) {
      const path = m[1];
      const plusLines = (chunk.match(/^\+[^+]/gm) ?? []).length;
      files.push({ path, lines: plusLines });
    }
  }
  return files;
}

function discoverPlan(cwd: string, planPath?: string): string | undefined {
  if (planPath) {
    try {
      return readFileSync(planPath, "utf8");
    } catch {
      return undefined;
    }
  }
  for (const rel of PLAN_CANDIDATES) {
    const full = join(cwd, rel);
    if (existsSync(full)) {
      try {
        return readFileSync(full, "utf8");
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

function digest(ctx: Omit<GatheredContext, "contextDigest">): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        scope: ctx.scope,
        branchRef: ctx.branchRef ?? null,
        diff: ctx.diff,
        files: ctx.files,
        planText: ctx.planText ?? null,
      })
    )
    .digest("hex");
}

export function gatherContext(
  scope: Scope,
  opts?: { branchRef?: string; planPath?: string; cwd?: string }
): GatheredContext {
  const cwd = opts?.cwd ?? process.cwd();
  let diff = "";
  let files: { path: string; lines: number }[] = [];
  const filesContent: { path: string; content: string }[] = [];

  try {
    runGit(["rev-parse", "--is-inside-work-tree"], cwd);
  } catch {
    throw new ContextError("not a git repository");
  }

  if (scope === "uncommitted") {
    diff = runGit(["diff", "HEAD"], cwd);
    files = filesFromDiff(diff);
  } else if (scope === "whole") {
    const listed = runGit(["ls-files"], cwd);
    files = listed
      .split("\n")
      .filter(Boolean)
      .map((path) => {
        try {
          const content = readFileSync(join(cwd, path), "utf8");
          return { path, lines: content.split("\n").length };
        } catch {
          return { path, lines: 0 };
        }
      });
  } else if (scope === "branch") {
    const ref = opts?.branchRef;
    if (!ref) throw new ContextError("branch ref required for scope=branch");
    try {
      diff = runGit(["diff", `${ref}...HEAD`], cwd);
    } catch {
      throw new ContextError(`branch ref not found: ${ref}`);
    }
    files = filesFromDiff(diff);
  }

  // Populate actual file contents of referenced files to support side-by-side traceability
  for (const f of files) {
    try {
      const content = readFileSync(join(cwd, f.path), "utf8");
      filesContent.push({ path: f.path, content });
    } catch (e) {}
  }

  const planText = discoverPlan(cwd, opts?.planPath);
  const partial = { scope, branchRef: opts?.branchRef, diff, files, planText, filesContent };
  return { ...partial, contextDigest: digest(partial) };
}
