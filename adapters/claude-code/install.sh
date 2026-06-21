#!/bin/bash
TARGET="${1:-.}"
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$TARGET/.claude/commands"
mkdir -p "$TARGET/.claude"
cp "$DIR/commands/quiz-me.md" "$TARGET/.claude/commands/quiz-me.md"
if [ -f "$TARGET/.claude/settings.json" ]; then
  echo "Merge hooks from $DIR/hooks.json into $TARGET/.claude/settings.json manually or via jq."
else
  cp "$DIR/hooks.json" "$TARGET/.claude/settings.json"
fi
echo "quiz-me installed for Claude Code."
