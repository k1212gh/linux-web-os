#!/bin/bash
# Stop hook: verify frontend build after Claude finishes
# Only runs if frontend files were likely modified

if [ -d "frontend/node_modules" ]; then
  cd frontend
  ./node_modules/.bin/vite build 2>&1 | tail -3
  BUILD_EXIT=$?
  if [ $BUILD_EXIT -ne 0 ]; then
    echo "❌ 프론트엔드 빌드 실패" >&2
    exit 1
  fi
  echo "✅ 빌드 검증 통과"
fi

exit 0
