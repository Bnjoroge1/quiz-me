#!/bin/bash
TARGET="${1:-.}"
mkdir -p "$TARGET/.omp/skills/quiz-me"
cp "$(dirname "$0")/skill.md" "$TARGET/.omp/skills/quiz-me/SKILL.md"
cp "$(dirname "$0")/plugin.json" "$TARGET/.omp/skills/quiz-me/plugin.json" 2>/dev/null || true
echo "quiz-me installed for Oh My Pi at $TARGET/.omp/skills/quiz-me/"
