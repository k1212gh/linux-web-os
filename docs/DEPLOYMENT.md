# AgentOS 배포 가이드

## 1. GitHub Pages (정적 포트폴리오)

백엔드 없이 포트폴리오 앱만 보여주는 정적 배포.

### 자동 배포 (GitHub Actions)

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동 실행됩니다.

```bash
# feat/portfolio-apps를 main에 머지
git checkout main
git merge feat/portfolio-apps
git push origin main
```

GitHub → Settings → Pages → Source: "GitHub Actions" 선택.

**접속**: `https://k1212gh.github.io/linux-web-os/`

### 수동 배포

```bash
cd frontend
npm ci
npx vite build --base=/linux-web-os/
# backend/static/ 에 빌드 결과 생성됨
```

---

## 2. 풀 배포 (백엔드 포함)

WSL 또는 Linux 서버에서 프론트엔드 + 백엔드를 함께 실행.

### 2-1. WSL 로컬 개발

```bash
# 터미널 1: 백엔드
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 터미널 2: 프론트엔드
cd frontend
npm install
npm run dev
```

**접속**: `http://localhost:5173` (Vite가 `/api`, `/ws`를 8000으로 프록시)

### 2-2. 프로덕션 (systemd)

```bash
# install.sh 실행 (자동 설정)
chmod +x install.sh
./install.sh

# 또는 수동:
sudo systemctl enable linux-web-os
sudo systemctl start linux-web-os
```

### 2-3. Tailscale 원격 접속

```bash
# Tailscale 설치
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# HTTPS 서빙
sudo tailscale serve https:443 / http://localhost:8000
```

**접속**: `https://<machine-name>.<tailnet>.ts.net`

---

## 3. 환경 변수

`backend/.env.json` (gitignored):

```json
{
  "ANTHROPIC_API_KEY": "sk-ant-...",
  "VSCODE_TUNNEL_URL": "https://vscode.dev/tunnel/...",
  "PROJECTS_BASE": "/home/user/projects",
  "KASM_URL": "http://localhost:6901"
}
```

| 변수 | 용도 | 필수 |
|------|------|------|
| `ANTHROPIC_API_KEY` | Claude 채팅 + Claude Code | 선택 |
| `VSCODE_TUNNEL_URL` | VS Code Tunnel iframe | 선택 |
| `PROJECTS_BASE` | Git/파일매니저 기본 경로 | 선택 (기본: ~) |
| `KASM_URL` | KasmVNC URL | 선택 |

---

## 4. Claude Code 사용을 위한 추가 설정

```bash
# Claude Code CLI 설치
npm install -g @anthropic-ai/claude-code

# 확인
claude --version

# PROJECTS_BASE를 프로젝트 폴더로 설정
# backend/.env.json에 추가:
# "PROJECTS_BASE": "/home/user/projects"
```

---

## 5. /blog 스킬 사용

```bash
# Claude Code 터미널에서:
/blog

# 자동으로 현재 세션 내용을 분석하여
# frontend/src/components/apps/Blog.jsx에 포스트 추가
```
