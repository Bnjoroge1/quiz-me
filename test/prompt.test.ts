import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildPrompt, resolveDifficultyMix, DIFFICULTY_PRESETS } from "../src/prompt.js";
import type { GatheredContext } from "../src/types.js";

const baseCtx: GatheredContext = {
  scope: "uncommitted",
  diff: "diff --git a/foo.ts b/foo.ts\n+export const x = 1;",
  files: [{ path: "foo.ts", lines: 1 }],
  planText: "# Plan\nDo foo.",
  contextDigest: "abc",
};

describe("buildPrompt", () => {
  it("includes JSON shape and plan text", () => {
    const mix = resolveDifficultyMix("mix");
    const prompt = buildPrompt(baseCtx, mix);
    assert.ok(prompt.includes('"summary"'));
    assert.ok(prompt.includes("Do foo."));
    assert.ok(prompt.includes("Generate exactly 10 questions"));
  });

  it("difficulty mix length controls count", () => {
    const mix = DIFFICULTY_PRESETS.easy;
    const prompt = buildPrompt(baseCtx, mix);
    assert.ok(prompt.includes(`Generate exactly ${mix.length} questions`));
  });

  it("handles no plan", () => {
    const ctx = { ...baseCtx, planText: undefined };
    const prompt = buildPrompt(ctx, resolveDifficultyMix("mix"));
    assert.ok(prompt.includes("(no plan provided)"));
  });
});
