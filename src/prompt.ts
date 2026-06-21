import type { Difficulty, GatheredContext } from "./types.js";

export const QUIZ_JSON_SCHEMA_URL = "https://quiz-me.local/quiz.schema.json";

export const DIFFICULTY_PRESETS: Record<string, Difficulty[]> = {
  mix: ["recall", "recall", "apply", "apply", "analyze", "recall", "apply", "apply", "analyze", "apply"],
  easy: ["recall", "recall", "recall", "recall", "apply", "apply", "apply", "apply", "analyze", "analyze"],
  hard: ["apply", "apply", "apply", "apply", "analyze", "analyze", "analyze", "analyze", "analyze", "analyze"],
};

export function resolveDifficultyMix(preset: string): Difficulty[] {
  return DIFFICULTY_PRESETS[preset] ?? DIFFICULTY_PRESETS.mix;
}

export function buildPrompt(ctx: GatheredContext, difficultyMix: Difficulty[]): string {
  const hasPlan = Boolean(ctx.planText);
  const hasCode = ctx.diff.length > 0 || ctx.files.length > 0;
  const planSection = ctx.planText ?? "(no plan provided)";
  const diffSection = ctx.diff || "(no diff provided)";
  const filesSection =
    ctx.files.length > 0
      ? ctx.files.map((f) => `- ${f.path} (${f.lines} lines)`).join("\n")
      : "(no files listed)";

  const kindRules = hasPlan
    ? "~40% code, ~30% plan-vs-code, ~30% plan-or-design"
    : "~50% code, ~50% plan-or-design (no plan provided — use code analyze questions about intent)";

  const difficultyCounts = difficultyMix.reduce(
    (acc, d) => {
      acc[d] = (acc[d] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return `You are a quiz generator. Output ONLY a JSON object matching this shape, no prose, no markdown fences.

{
  "summary": string,
  "questions": [
    {
      "difficulty": "recall"|"apply"|"analyze",
      "kind": "code"|"plan-vs-code"|"plan",
      "type": "multiple-choice"|"short-answer"|"true-false",
      "prompt": string,
      "options": string[],
      "answer": string,
      "explanation": string,
      "codeRef": { "path": string, "startLine": number, "endLine": number } | null
    }
  ]
}

Rules:
- For multiple-choice: include "options" with exactly 4 items and "answer" must equal one of them.
- For true-false: "answer" must be "true" or "false". Omit options.
- For short-answer: include "answer" as the model answer. Omit options.
- Every question must have "explanation" detailing the logical reason why the answer is correct.
- Generate exactly ${difficultyMix.length} questions with difficulties: ${JSON.stringify(difficultyCounts)}.
- Kind distribution: ${kindRules}.
${hasPlan ? "- Include at least 3 plan-vs-code questions comparing the design plan against the actual implementation. Focus on divergences, trade-offs made during development, or missing features." : ""}
${!hasCode ? "- diff is empty: ask structural questions about the listed files." : ""}
- CRITICAL TRACEABILITY RULE: For any question of kind "code" or "plan-vs-code", you MUST supply a valid "codeRef" object with the file's "path", "startLine" (1-based), and "endLine" (1-based). The reference must point EXACTLY to the location in the file where the question is grounded.
- If a question is about the plan, "codeRef" should be null.
- Only ask about code present in the provided diff or file list. Never invent APIs, functions, or symbols not visible in the provided context. Include code-specific questions checking implementation logic, control flow, syntax, or potential bugs in the codebase.
- COGNITIVE SCIENCE DISTRACTOR RULE: For multiple-choice questions, the 3 incorrect options (distractors) MUST NOT be obvious filler. They must represent plausible developer misconceptions, such as off-by-one errors, common logical fallacies, incorrect scope references, or syntax misinterpretations.
- DESIRABLE DIFFICULTIES: Ensure \"apply\" and \"analyze\" questions require active evaluation of logic, rather than simple rote memorization.
## Task scope: ${ctx.scope}${ctx.branchRef ? ` (vs ${ctx.branchRef})` : ""}

## Plan
${planSection}

## Diff
${diffSection}

## Files
${filesSection}

Generate the quiz now. Return only the JSON object.`;
}

export const INGEST_PAYLOAD_SHAPE = `POST body: { "summary": string, "questions": [...] } with scope/contextDigest as query params.`;
