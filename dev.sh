#!/usr/bin/env bash
# Quick dev start — runs backend + frontend in parallel
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate venv if exists
if [ -f .venv/bin/activate ]; then
  source .venv/bin/activate
else
  echo "⚠️  .venv not found. Run ./install.sh first"
  exit 1
fi

echo "🚀 Starting Linux Web OS (dev mode)..."
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo ""

# Start backend
cd backend
HSA_OVERRIDE_GFX_VERSION=10.3.0 uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start workstation frontend dev server
cd apps/workstation
npm run dev &
FRONTEND_PID=$!
cd ../..

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '🛑 Stopped'" EXIT

wait
