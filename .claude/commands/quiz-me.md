Generate a quiz to test your understanding of the task, plan, and code.

1. Ask the user which scope they want to quiz on:
   - **uncommitted** (default): changes in the working tree
   - **whole**: the entire codebase structure
   - **branch**: changes compared to a target branch (ask for target branch name, e.g., 'main')
   - Or if they want to cancel.

2. Run `quiz-me serve` to ensure the server is running.
3. Run `quiz-me generate --scope <chosen-scope> [--branch <ref>] --difficulty mix` to output the prompt template.
4. Generate the quiz JSON per the prompt using your own model.
5. POST the JSON to the printed endpoint.
6. Print the browser URL to the user.
