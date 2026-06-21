# quiz-me Plugin Plan

See README.md for usage. This document summarizes the architecture.

## Architecture

Two cooperating halves:
1. **Quiz server** (`quiz-me serve`) — SQLite persistence, HTTP API, browser UI. No LLM calls.
2. **Agent integration** — coding agent generates quiz JSON using its own model, POSTs to server.

## Platforms

- Oh My Pi (primary) — `adapters/oh-my-pi/skill.md`
- Claude Code — `adapters/claude-code/`
- Codex — `adapters/codex/`

## Scopes

- `uncommitted` — `git diff HEAD`
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
