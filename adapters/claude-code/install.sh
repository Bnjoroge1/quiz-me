#!/usr/bin/env bash
TARGET="${1:-.}"
DIR="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$TARGET/.claude/commands"
mkdir -p "$TARGET/.claude"

# Copy slash command
cp "$DIR/commands/quiz-me.md" "$TARGET/.claude/commands/quiz-me.md"

# Programmatic merge of hooks to prevent settings corruption
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join('$TARGET', '.claude', 'settings.json');
const hooksPath = path.join('$DIR', 'hooks.json');

let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    settings = {};
  }
}

const hooksData = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

if (!settings.hooks) {
  settings.hooks = {};
}

// Merge the Stop hook config
settings.hooks.Stop = hooksData.hooks.Stop;

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
console.log('Successfully merged quiz-me hooks into ' + settingsPath);
"

echo "quiz-me installed for Claude Code."
