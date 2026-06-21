#!/bin/bash
TARGET="${1:-.}"
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$TARGET/.codex"
if [ -f "$HOME/.codex/hooks.toml" ]; then
  echo "Append hooks from $DIR/hooks.toml to ~/.codex/hooks.toml"
  cat "$DIR/hooks.toml" >> "$HOME/.codex/hooks.toml"
else
  cp "$DIR/hooks.toml" "$HOME/.codex/hooks.toml"
fi
echo "quiz-me installed for Codex."
