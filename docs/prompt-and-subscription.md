# Prompt & subscription model

quiz-me **never calls an LLM API**. The server only gathers git context, builds a prompt, persists quizzes, and serves the browser UI. Question generation uses **your existing Claude or Codex subscription** through the coding agent that is already running in your terminal.

## The prompt

`quiz-me generate` prints the full prompt to stdout. It is built by `buildPrompt()` in `src/prompt.ts` from:

| Input | Source |
|-------|--------|
| Plan text | `docs/plan.md`, `PLAN.md`, etc. |
| Diff | `git diff` (scope-dependent) |
| File list | paths + line counts from diff or `git ls-files` |
| Difficulty mix | `--difficulty mix\|easy\|hard` → exact recall/apply/analyze counts |

### Prompt structure

```
You are a quiz generator. Output ONLY a JSON object matching this shape, no prose, no markdown fences.

{ "summary": string, "questions": [ { difficulty, kind, type, prompt, options, answer, explanation, codeRef } ] }

Rules:
- MC: 4 options, answer must match one
- true-false: answer is "true" or "false"
- short-answer: answer is model answer
- Exactly N questions with specified difficulty counts
- Kind distribution: ~40% code, ~30% plan-vs-code, ~30% plan-or-design
- Ground questions in provided diff/files only

## Task scope: <scope>
## Plan
<plan markdown>
## Diff
<unified diff>
## Files
- path (N lines)

Generate the quiz now. Return only the JSON object.
```

Live prompt for this repo:

```bash
node dist/src/cli.js generate --scope whole --difficulty mix
```

## How the subscription is used

1. **No LLM client in quiz-me** — server and db have zero OpenAI/Anthropic imports.
2. **Agent instructions** — adapters tell the agent: *"Generate the quiz JSON per the printed prompt using your own model."*
3. **Agent POSTs result** — CLI prints `POST to http://127.0.0.1:<port>/api/quizzes?...`
4. **Hooks inject context** — Stop hooks run `quiz-me auto`; stdout goes back into the agent session.

The model call is the same as any other agent turn — Codex/Claude Code OAuth or CLI login.

## Adapters

| Platform | Manual | Auto |
|----------|--------|------|
| Oh My Pi | `/quiz-me` skill | before yield on code changes |
| Claude Code | `/quiz-me` | Stop hook → `quiz-me auto` |
| Codex | prompt snippet | Stop hook in hooks.toml |

## Scopes

| Scope | Command |
|-------|---------|
| uncommitted | `git diff HEAD` (auto-hook default) |
| whole | `git ls-files` |
| branch | `git diff <ref>...HEAD` |

## Screenshots (this repo as example)

Demo quiz seeded from `scripts/seed-demo-quiz.json` — questions about quiz-me's own architecture:

![Quiz list](screenshots/01-quiz-list.png)
![Multiple choice](screenshots/02-quiz-question-mc.png)
![Plan vs code (true/false)](screenshots/03-quiz-question-tf.png)
![Short answer](screenshots/05-quiz-question-short-answer.png)
![Results](screenshots/04-quiz-results.png)

Reproduce:

```bash
npm run build
./scripts/seed-demo.sh 4317
# open http://127.0.0.1:4317/
```

Captured with `agent-browser` against the local quiz-me server.
