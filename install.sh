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

# ── 0. 포트 선점 체크 ──────────────────────────────────────────────────────
if command -v ss &>/dev/null; then
  BUSY=$(ss -tlnH "sport = :8000" 2>/dev/null | head -n1)
  if [ -n "$BUSY" ]; then
    warn "포트 8000이 이미 사용 중입니다: $BUSY"
    warn "linux-web-os가 아닌 다른 프로세스라면 중단 후 다시 실행하세요."
  fi
fi

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

# ── 5. Dedicated service user ───────────────────────────────────────────────
SERVICE_USER="webos"
if ! id -u "$SERVICE_USER" &>/dev/null; then
  info "전용 서비스 사용자 생성: $SERVICE_USER"
  sudo useradd --system --create-home --home-dir /var/lib/webos \
               --shell /usr/sbin/nologin "$SERVICE_USER"
  ok "사용자 생성됨"
fi
# 레포 읽기 권한(그룹 공유) + backend/.env.json 은 서비스 사용자 전용
sudo chgrp -R "$SERVICE_USER" "$SCRIPT_DIR"
sudo chmod -R g+rX "$SCRIPT_DIR"
if [ -f "$SCRIPT_DIR/backend/.env.json" ]; then
  sudo chown "$SERVICE_USER":"$SERVICE_USER" "$SCRIPT_DIR/backend/.env.json"
  sudo chmod 600 "$SCRIPT_DIR/backend/.env.json"
fi

# ── 6. systemd service ──────────────────────────────────────────────────────
SERVICE_FILE="/etc/systemd/system/linux-web-os.service"
info "systemd 서비스 설치/갱신..."
sudo tee "$SERVICE_FILE" > /dev/null << SVCEOF
[Unit]
Description=Linux Web OS
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$SCRIPT_DIR/backend
Environment=PATH=$SCRIPT_DIR/.venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=HSA_OVERRIDE_GFX_VERSION=10.3.0
ExecStart=$SCRIPT_DIR/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=on-failure
RestartSec=5

# Hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=true
ReadWritePaths=$SCRIPT_DIR/backend
RestrictSUIDSGID=true
LockPersonality=true
RestrictRealtime=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
SVCEOF
sudo systemctl daemon-reload
sudo systemctl enable linux-web-os
ok "systemd 서비스 등록됨 (User=$SERVICE_USER, 127.0.0.1 바인딩)"

# ── 7. Tailscale (optional) ─────────────────────────────────────────────────
info "네트워크 노출 정책: 서비스는 127.0.0.1:8000에만 바인딩됩니다."
info "LAN/원격 접속이 필요하면 Tailscale을 통해 노출하세요."
if ! command -v tailscale &>/dev/null; then
  warn "Tailscale 미설치. 설치: curl -fsSL https://tailscale.com/install.sh | sh"
  warn "설치 후: sudo tailscale up && sudo tailscale serve --bg http://localhost:8000"
else
  ok "Tailscale 설치됨. 노출 예시: sudo tailscale serve --bg http://localhost:8000"
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
