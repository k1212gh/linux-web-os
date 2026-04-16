#!/bin/bash
# PostToolUse hook: auto-format after Edit/Write
# Reads tool input from stdin (JSON)

INPUT=$(cat)
FILE=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FILE" ]; then
  exit 0
fi

# Only format JS/JSX/TS/TSX/JSON/CSS files
case "$FILE" in
  *.js|*.jsx|*.ts|*.tsx|*.json|*.css)
    if command -v npx &>/dev/null && [ -f "frontend/node_modules/.bin/prettier" ]; then
      cd frontend && npx prettier --write "../$FILE" 2>/dev/null
    fi
    ;;
esac

exit 0
