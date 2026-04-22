#!/usr/bin/env bash
# AgentOS Workstation — 집 Linux 서버 한 방 설치 스크립트
#
# Ubuntu 22.04/24.04 가정. 실행 전 reread 필수:
#   https://github.com/k1212gh/linux-web-os/blob/main/deploy/setup.sh
#
# 사용:
#   cd ~/linux-web-os
#   sudo ./deploy/setup.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_NAME="${SUDO_USER:-$USER}"

log() { printf '\033[32m[setup]\033[0m %s\n' "$*"; }
err() { printf '\033[31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" = "0" ] || err "sudo로 실행해주세요"
[ -d "$REPO_ROOT/backend" ] || err "레포 루트에서 실행해주세요 ($REPO_ROOT)"

log "1/7 — APT 업데이트 + 필수 패키지"
apt-get update -qq
apt-get install -y -qq \
  ca-certificates curl gnupg lsb-release \
  python3 python3-pip python3-venv \
  nodejs npm \
  docker.io docker-compose-v2 \
  caddy

log "2/7 — Docker 그룹에 사용자 추가"
usermod -aG docker "$USER_NAME" || true

log "3/7 — Tailscale 설치 (없으면)"
if ! command -v tailscale >/dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi
log "   → 실행 후 'sudo tailscale up' 으로 로그인 필요 (스크립트 종료 후)"

log "4/7 — Python 의존성 + Node 의존성 설치"
pip3 install --break-system-packages --ignore-installed \
  fastapi uvicorn[standard] psutil httpx python-multipart \
  pydantic websockets pyyaml
su - "$USER_NAME" -c "cd $REPO_ROOT && npm install --no-audit --no-fund"

log "5/7 — apps/workstation 프로덕션 빌드"
su - "$USER_NAME" -c "cd $REPO_ROOT/apps/workstation && npx next build"

log "6/7 — systemd 유닛 설치"
install -m 644 "$REPO_ROOT/deploy/systemd/agentos-backend.service" /etc/systemd/system/
install -m 644 "$REPO_ROOT/deploy/systemd/agentos-workstation.service" /etc/systemd/system/
# 유닛 안의 /home/k1212gh 를 실제 사용자 홈으로 치환
sed -i "s|/home/k1212gh|/home/$USER_NAME|g" /etc/systemd/system/agentos-*.service

# 환경변수 디렉토리
mkdir -p /etc/agentos
[ -f /etc/agentos/env ] || touch /etc/agentos/env
chmod 600 /etc/agentos/env
chown "$USER_NAME:$USER_NAME" /etc/agentos/env

systemctl daemon-reload
systemctl enable --now agentos-backend.service agentos-workstation.service

log "7/7 — Docker 컨테이너 기동 (Jenkins/Grafana/Prometheus/Portainer/Ollama)"
mkdir -p "$REPO_ROOT/deploy/secrets" "$REPO_ROOT/deploy/data"
if [ ! -f "$REPO_ROOT/deploy/secrets/grafana_admin.txt" ]; then
  openssl rand -base64 24 > "$REPO_ROOT/deploy/secrets/grafana_admin.txt"
  log "   → Grafana admin 패스워드 생성: deploy/secrets/grafana_admin.txt"
fi
chown -R "$USER_NAME:$USER_NAME" "$REPO_ROOT/deploy/data" "$REPO_ROOT/deploy/secrets"
chmod 600 "$REPO_ROOT/deploy/secrets/grafana_admin.txt"
su - "$USER_NAME" -c "cd $REPO_ROOT/deploy && docker compose up -d"

log "── Caddy 설정"
install -m 644 "$REPO_ROOT/deploy/caddy/Caddyfile" /etc/caddy/Caddyfile
systemctl reload caddy || systemctl restart caddy

log "✅ 설치 완료"
cat <<EOF

다음 단계:
  1. sudo tailscale up      (로그인)
  2. tailscale status       (호스트명 확인, 예: linux-home.tail-XXXX.ts.net)
  3. sudo tailscale serve --bg http://localhost
     (HTTPS로 Tailscale 내부망 공개)
  4. 다른 Tailscale 기기에서 https://<호스트명> 접속 테스트

서비스 상태:
  systemctl status agentos-backend agentos-workstation
  docker compose -f $REPO_ROOT/deploy/docker-compose.yml ps
  journalctl -u agentos-backend -f   (로그)
EOF
