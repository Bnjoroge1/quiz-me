import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { gatherContext, ContextError } from "../src/context.js";

function git(cwd: string, cmd: string): void {
  execSync(cmd, { cwd, stdio: "pipe" });
}

describe("gatherContext", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "quiz-ctx-"));
    git(dir, "git init");
    git(dir, "git config user.email test@test.com");
    git(dir, "git config user.name Test");
    writeFileSync(join(dir, "foo.ts"), "export const x = 1;\n");
    git(dir, "git add .");
    git(dir, 'git commit -m "init"');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("uncommitted returns diff after edit", () => {
    writeFileSync(join(dir, "foo.ts"), "export const x = 2;\n");
    const ctx = gatherContext("uncommitted", { cwd: dir });
    assert.ok(ctx.diff.includes("foo.ts"));
    assert.ok(ctx.contextDigest.length === 64);
  });

  it("whole returns file list", () => {
    const ctx = gatherContext("whole", { cwd: dir });
    assert.ok(ctx.files.some((f) => f.path === "foo.ts"));
  });

  it("non-git throws ContextError", () => {
    const nogit = mkdtempSync(join(tmpdir(), "nogit-"));
    try {
      assert.throws(() => gatherContext("uncommitted", { cwd: nogit }), ContextError);
    } finally {
      rmSync(nogit, { recursive: true, force: true });
    }
  });

  it("branch without ref throws", () => {
    assert.throws(() => gatherContext("branch", { cwd: dir }), ContextError);
  });
});
