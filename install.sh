#!/usr/bin/env bash
set -euo pipefail

# This is the root installer for quiz-me.
# It builds the CLI, installs it globally, and registers adapters.

echo "================================================"
echo "Installing quiz-me Developer Studio..."
echo "================================================"

# Verify Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required to install and run quiz-me." >&2
  exit 1
fi

# Build project locally
echo "Building package..."
npm install
npm run build

# Install globally
echo "Installing quiz-me globally..."
npm install -g .

# Helper to configure platform integrations
# Uses current directory for project-level installations, or system locations
CWD=$(pwd)

echo ""
echo "Configuring integrations..."

# 1. Claude Code
if [ -d "$HOME/.claude" ] || [ -f "$HOME/.claude/settings.json" ]; then
  echo "Detected Claude Code. Configuring workspace adapter..."
  quiz-me install --platform claude-code "$CWD"
fi

# 2. Codex CLI
if [ -d "$HOME/.codex" ] || [ -f "$HOME/.codex/config.toml" ]; then
  echo "Detected Codex CLI. Configuring global hooks..."
  quiz-me install --platform codex "$CWD"
fi

# 3. Oh My Pi
if [ -d "$HOME/.omp" ]; then
  echo "Detected Oh My Pi. Installing skill adapter..."
  quiz-me install --platform oh-my-pi "$CWD"
fi

echo ""
echo "================================================"
echo "quiz-me successfully installed!"
echo "Run 'quiz-me help' to view commands."
echo "Start the server with: quiz-me serve"
echo "================================================"
