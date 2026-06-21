#!/usr/bin/env bash
TARGET="${1:-.}"
DIR="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$TARGET/.codex"

# Programmatic merge of hooks.toml to prevent duplicates
node -e "
const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.env.HOME, '.codex', 'hooks.toml');
const sourcePath = path.join('$DIR', 'hooks.toml');

if (!fs.existsSync(path.dirname(targetPath))) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

let targetContent = '';
if (fs.existsSync(targetPath)) {
  targetContent = fs.readFileSync(targetPath, 'utf8');
}

const sourceContent = fs.readFileSync(sourcePath, 'utf8');

// Check if the command hook already exists in target
if (targetContent.includes('quiz-me auto')) {
  console.log('quiz-me hook already exists in ' + targetPath + ' (Skipping merge)');
} else {
  const separator = targetContent.length > 0 && !targetContent.endsWith('\n') ? '\n\n' : '\n';
  fs.writeFileSync(targetPath, targetContent + separator + sourceContent.trim() + '\n', 'utf8');
  console.log('Successfully added quiz-me hook to ' + targetPath);
}
"

echo "quiz-me installed for Codex."
