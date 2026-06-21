# quiz-me

Generate a quiz to test your understanding of the current task and code.

## When to run

- **Manual**: when the user invokes `/quiz-me` or asks for a quiz.
- **Auto**: at the end of a code-review/implementation turn (after smoke test confirms it works, before yielding), if there are uncommitted code changes.

## Flow

1. Run `quiz-me serve` (idempotent — exits immediately if server already running).
2. Run `quiz-me generate --scope <scope> --difficulty mix` where scope is one of:
   - `uncommitted` (default) — quiz on `git diff HEAD`
   - `whole` — quiz on project file structure
   - `branch <ref>` — use `--scope branch --branch <ref>` for `git diff <ref>...HEAD`
3. Use your own model to generate the quiz JSON per the printed prompt. Output ONLY the JSON object.
4. POST the JSON to the printed endpoint URL.
5. Print the returned browser URL to the user and open it.

## Scope options

| Scope | Flag | What it quizzes |
|-------|------|-----------------|
| uncommitted | `--scope uncommitted` | Staged + unstaged changes vs HEAD |
| whole | `--scope whole` | Full project file list |
| branch | `--scope branch --branch main` | Changes since fork point vs branch |

## Notes

- No API key needed — you generate the questions using your own model.
- Quizzes persist in SQLite at `~/.local/share/quiz-me/quizzes.db`.
- Auto-hook skips if no uncommitted changes or if context hasn't changed since last quiz.
