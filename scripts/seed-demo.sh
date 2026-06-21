#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${1:-4317}"
node dist/src/cli.js serve --port "$PORT" &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
sleep 1
DIGEST=$(node dist/src/cli.js generate --scope whole 2>&1 | rg -o 'contextDigest=[a-f0-9]+' | cut -d= -f2)
curl -s -X POST "http://127.0.0.1:${PORT}/api/quizzes?scope=whole&contextDigest=${DIGEST}" \
  -H 'Content-Type: application/json' \
  -d @scripts/seed-demo-quiz.json
echo
