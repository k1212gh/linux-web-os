#!/usr/bin/env bash
# Linux Web OS — Full Installation Script
# Supports Ubuntu 22.04 / 24.04
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

echo ""
echo "  ██╗     ██╗███╗   ██╗██╗   ██╗██╗  ██╗    ██╗    ██╗███████╗██████╗      ██████╗ ███████╗"
echo "  ██║     ██║████╗  ██║██║   ██║╚██╗██╔╝    ██║    ██║██╔════╝██╔══██╗    ██╔═══██╗██╔════╝"
echo "  ██║     ██║██╔██╗ ██║██║   ██║ ╚███╔╝     ██║ █╗ ██║█████╗  ██████╔╝    ██║   ██║███████╗"
echo "  ██║     ██║██║╚██╗██║██║   ██║ ██╔██╗     ██║███╗██║██╔══╝  ██╔══██╗    ██║   ██║╚════██║"
echo "  ███████╗██║██║ ╚████║╚██████╔╝██╔╝ ██╗    ╚███╔███╔╝███████╗██████╔╝    ╚██████╔╝███████║"
echo "  ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝     ╚══╝╚══╝ ╚══════╝╚═════╝      ╚═════╝ ╚══════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 1. System deps ──────────────────────────────────────────────────────────
info "시스템 패키지 업데이트..."
sudo apt-get update -qq
sudo apt-get install -y -qq curl git python3 python3-pip python3-venv nodejs npm 2>/dev/null || true

# Node.js 20+ check
NODE_VER=$(node --version 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo 0)
if [ "$NODE_VER" -lt 18 ]; then
  info "Node.js 20 설치 중..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
ok "Node.js $(node --version) ✓"

# ── 2. Python venv ──────────────────────────────────────────────────────────
info "Python 가상환경 설정..."
python3 -m venv .venv
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r backend/requirements.txt
ok "Python deps ✓"

# ── 3. Frontend ─────────────────────────────────────────────────────────────
info "프론트엔드 빌드..."
cd frontend
npm install --silent
npm run build
cd ..
ok "Frontend build ✓"

# ── 4. .env.json ────────────────────────────────────────────────────────────
if [ ! -f backend/.env.json ]; then
  info ".env.json 초기 설정..."
  cat > backend/.env.json << 'ENVEOF'
{
  "ANTHROPIC_API_KEY": "",
  "VSCODE_TUNNEL_URL": "",
  "KASM_URL": "http://localhost:6901",
  "FILEBROWSER_URL": "http://localhost:8081",
  "HSA_OVERRIDE_GFX_VERSION": "10.3.0"
}
ENVEOF
  ok ".env.json 생성됨 — 설정 앱에서 API 키를 입력하세요"
fi

# ── 5. systemd service ──────────────────────────────────────────────────────
SERVICE_FILE="/etc/systemd/system/linux-web-os.service"
if [ ! -f "$SERVICE_FILE" ]; then
  info "systemd 서비스 등록..."
  sudo tee "$SERVICE_FILE" > /dev/null << SVCEOF
[Unit]
Description=Linux Web OS
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR/backend
Environment=PATH=$SCRIPT_DIR/.venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=HSA_OVERRIDE_GFX_VERSION=10.3.0
ExecStart=$SCRIPT_DIR/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF
  sudo systemctl daemon-reload
  sudo systemctl enable linux-web-os
  ok "systemd 서비스 등록됨"
fi

# ── 6. Tailscale (optional) ─────────────────────────────────────────────────
if ! command -v tailscale &>/dev/null; then
  warn "Tailscale이 설치되지 않았습니다."
  warn "원격 접속을 위해 설치하려면: curl -fsSL https://tailscale.com/install.sh | sh"
fi

# ── Done ────────────────────────────────────────────────────────────────────
echo ""
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │  설치 완료!                                      │"
echo "  │                                                  │"
echo "  │  시작:  sudo systemctl start linux-web-os        │"
echo "  │  접속:  http://localhost:8000                    │"
echo "  │  로그:  journalctl -u linux-web-os -f            │"
echo "  │                                                  │"
echo "  │  설정 앱에서 Anthropic API 키를 입력하세요       │"
echo "  └─────────────────────────────────────────────────┘"
echo ""
