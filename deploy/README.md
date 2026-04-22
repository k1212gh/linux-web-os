# deploy/ — 집 Linux 서버 배포

개인 워크스테이션용 풀기능 Web OS 배포 자산. **Tailscale 내부망 전용**. 공개 금지.

## 구성요소

| 파일 | 역할 |
|---|---|
| `setup.sh` | 한 방 설치 (apt + Docker + systemd + Caddy + Tailscale 안내) |
| `docker-compose.yml` | Jenkins/Grafana/Prometheus/Portainer/Ollama 스택 |
| `systemd/agentos-backend.service` | FastAPI uvicorn (port 8000, 127.0.0.1) |
| `systemd/agentos-workstation.service` | Next.js workstation (port 3000, 127.0.0.1) |
| `caddy/Caddyfile` | 127.0.0.1:80 → workstation+backend 리버스 프록시 |
| `prometheus.yml` | Prometheus 스크랩 설정 |

## 설치 순서 (집 서버)

```bash
# 1. 레포 클론
cd ~
git clone https://github.com/k1212gh/linux-web-os
cd linux-web-os

# 2. 설치
sudo ./deploy/setup.sh

# 3. Tailscale 로그인 (브라우저 플로우)
sudo tailscale up

# 4. 호스트명 확인
tailscale status

# 5. Tailscale serve로 내부망 HTTPS 공개
sudo tailscale serve --bg http://localhost

# 6. 다른 Tailscale 기기에서 접속 테스트
#    https://<hostname>.tail-XXXX.ts.net
```

## 보안 원칙

- **모든 서비스 `127.0.0.1` 바인딩**: Docker 컨테이너 포트, systemd 서비스, Caddy 전부 공인망에 노출 안 됨
- **외부 접근은 Tailscale만**: `tailscale serve`가 Tailscale 내부망 전용 HTTPS를 부여
- **`/etc/agentos/env` chmod 600**: API 키/비밀번호 저장, 전용 사용자만 읽기 가능
- **Grafana admin 자동 생성**: `deploy/secrets/grafana_admin.txt` (chmod 600)

## 환경변수 (`/etc/agentos/env`)

```bash
# AI API 키 (선택)
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=

# 외부 서비스 URL (선택)
OLLAMA_URL=http://localhost:11434
JENKINS_URL=http://localhost:8080
GRAFANA_URL=http://localhost:3001
PORTAINER_URL=http://localhost:9000
PROMETHEUS_URL=http://localhost:9090
```

## 운영 명령

```bash
# 상태 확인
systemctl status agentos-backend agentos-workstation
docker compose -f deploy/docker-compose.yml ps

# 로그
journalctl -u agentos-backend -f
journalctl -u agentos-workstation -f
docker compose -f deploy/docker-compose.yml logs -f jenkins

# 재시작
sudo systemctl restart agentos-backend
docker compose -f deploy/docker-compose.yml restart

# 업데이트
cd ~/linux-web-os && git pull
npm install --no-audit --no-fund
cd apps/workstation && npx next build
sudo systemctl restart agentos-workstation
```

## 원격 접속 테스트

```bash
# SSAFY PC (Tailscale 설치됨)에서:
curl -I https://linux-home.tail-XXXX.ts.net/          # → 200
curl    https://linux-home.tail-XXXX.ts.net/api/system/quick  # → JSON
```

Tailscale 연결이 없으면 접근 불가 (공인 IP 없음).
