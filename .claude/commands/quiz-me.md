Generate a quiz to test your understanding of the current task and code.

1. Run `quiz-me serve` to ensure the server is running.
2. Run `quiz-me generate --scope ${SCOPE:-uncommitted} --difficulty ${DIFFICULTY:-mix}` (add `--branch <ref>` if scope is branch).
3. Generate the quiz JSON per the printed prompt using your own model.
4. POST the JSON to the printed endpoint.
5. Print the browser URL to the user.

Scope options: `uncommitted` (default), `whole`, `branch` (requires `--branch <ref>`).
