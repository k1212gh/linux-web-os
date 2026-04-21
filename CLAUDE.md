# AgentOS — Claude Code 작업 지침

## 프로젝트 개요
개인 Web OS 프로젝트. 두 목적으로 분리 배포 진행 중:
- **공개** (`apps/public`, Vercel, `k1212gh.dev`) — 포트폴리오/블로그/이력서. Next.js SSG.
- **비공개** (`apps/workstation`, 집 Linux 서버 + Tailscale) — 터미널/Docker/Jenkins 등 풀기능. Next.js + FastAPI.

## 모노레포 구조
```
/
├── apps/
│   ├── public/        ← Next.js 공개 사이트 (9개 앱, Vercel)
│   └── workstation/   ← Next.js 풀기능 (27개 앱, 집 서버)  ← 마이그 중
├── packages/
│   ├── ui/            ← 공통 컴포넌트 (Window, Taskbar, stores)
│   └── apps/
│       ├── public/    ← 공개 앱 컴포넌트 9개
│       └── private/   ← 비공개 앱 컴포넌트 18개
├── backend/           ← FastAPI (집 서버에만 배포)
└── deploy/            ← docker-compose, systemd, Caddy
```

**패키지 매니저**: pnpm workspaces. Node 20+.

## 기술 스택
- Frontend: Next.js (App Router), React 18, Zustand, react-rnd, Tailwind
- Backend: FastAPI + WebSocket PTY, psutil, httpx
- AI: Claude Code CLI (Max 구독), Ollama (ROCm RX 6800 XT)
- Infra: WSL dev, Linux 집 서버 + Tailscale (내부망 전용)
- 배포: Vercel (공개), Caddy+systemd (집 서버)

## 자주 쓰는 명령
```bash
pnpm dev:workstation              # 개발: 풀기능 + :5173
pnpm dev:public                   # 개발: 공개 사이트 + :3000
pnpm backend                      # uvicorn :8000 (127.0.0.1 바인딩)
pnpm build:public                 # 정적 빌드 (apps/public/out)
```

## 공개/비공개 앱 분류
- **공개 (9)**: profile, projects, resume, blog, timeline, contact, calculator, memo, settings
- **비공개/Tailscale (18)**: terminal, claude, claude-code, vscode, monitor, files, kasm, llm-dashboard, git, cicd, infra, docker, jenkins, grafana, portainer, obsidian, harness

## 핵심 규칙
- **보안**: 비공개 앱은 공개 빌드에 절대 포함 금지. `packages/apps/private/*`는 `apps/public`에서 import 불가.
- **블로그**: `content/blog/*.md` frontmatter `published: true`인 글만 공개 빌드에 포함.
- **React Hook**: early return 전에 모든 hook 선언 (Rules of Hooks).
- **백엔드 바인딩**: 집 서버에서 `127.0.0.1:8000` 바인딩, 외부는 Caddy+Tailscale 경유.
- **시크릿**: `.env.json`은 `/etc/agentos/` (chmod 600), git 커밋 금지.

## 커밋 스타일
Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). 한 줄 제목 + 본문에 Why.

## 참고 문서
- `C:\Users\SSAFY\.claude\plans\humming-brewing-graham.md` — 마이그레이션 8 Phase 계획
- `.claude/rules/` — 경로별 상세 규칙
- `.claude/commands/` — /blog, /review, /deploy, /harness, /test 등 스킬
