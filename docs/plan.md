# quiz-me — context-aware quiz plugin for coding agents

## Context

Build a plugin (shipped for Oh My Pi, Claude Code, and Codex) that generates quizzes testing the user's understanding of the current task/code. Quizzes use the host coding agent's own model (Claude or Codex subscription) — no separate API key. They vary in difficulty, mix code-understanding questions with plan-vs-code comparison questions, and are scoped to the current context: uncommitted changes, whole project, or against a branch. Quizzes persist in SQLite and are served via a local HTTP endpoint with a browser UI. A hook auto-fires the quiz after a code-review/implementation turn (analogous to Plannotator hooking the plan handoff); a `/quiz-me` command fires it on demand.

## Architecture

Two cooperating halves:

1. **Quiz server** — SQLite store, HTTP server + browser UI, git-context gatherer, and a prompt template. It does NOT call any LLM.
2. **Agent integration** — the coding agent generates questions using its own model, then POSTs JSON to the server.

## Platforms

- Oh My Pi (primary) — `adapters/oh-my-pi/skill.md`
- Claude Code — `adapters/claude-code/`
- Codex — `adapters/codex/`

## Scopes

- `uncommitted` — `git diff HEAD` (default, auto-hook)
- `whole` — `git ls-files`
- `branch` — `git diff <ref>...HEAD`

## Commands

```bash
quiz-me serve
quiz-me generate --scope uncommitted --difficulty mix
quiz-me auto          # hook command with digest dedupe
quiz-me status
quiz-me list
quiz-me install --platform oh-my-pi
```

## Storage

SQLite at `$XDG_DATA_HOME/quiz-me/quizzes.db` via Node built-in `node:sqlite`.

## Verification

```bash
npm install && npm run build && npm test
node dist/src/cli.js serve
node dist/src/cli.js generate --scope uncommitted --difficulty mix
```

## Assumptions

- LLM = host agent's own model (no API key)
- Auto-hook scope = `uncommitted`
- Default difficulty = 10 questions (2 recall / 5 apply / 3 analyze)
