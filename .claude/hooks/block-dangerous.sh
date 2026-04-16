#!/bin/bash
# PreToolUse hook: block dangerous bash commands
# Exit 2 = block, Exit 0 = allow

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | cut -d'"' -f4)

# Block patterns
BLOCKED=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf ."
  "push --force"
  "reset --hard"
  "DROP TABLE"
  "DROP DATABASE"
  "DELETE FROM"
  "chmod 777"
  ":(){ :|:& };:"
)

for pattern in "${BLOCKED[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "🛡 차단됨: '$pattern' 패턴이 감지되었습니다." >&2
    exit 2
  fi
done

exit 0
