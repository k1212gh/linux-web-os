# AgentOS 세션 컨텍스트 — 최종 (2026-04-19)

> **리눅스 서버에서 이어서 작업할 때 이 파일을 Claude Code에 전달하세요.**

---

## 프로젝트 개요

**AgentOS** — 브라우저 기반 Web OS 포트폴리오 + 클라우드 개발 워크스테이션
- GitHub: https://github.com/k1212gh/linux-web-os
- 브랜치: `feat/portfolio-apps` (main에서 분기, 30 커밋)
- 68파일 변경, 8877줄 추가

## 누가

- **김건희** (Kim Gunhui) — k1212gh@tukorea.ac.kr
- 한국공학대학교 컴퓨터공학과 / SSAFY 14기 서울
- GitHub: https://github.com/k1212gh
- 블로그: https://k1212gh.tistory.com/

---

## 커밋 히스토리 (30개)

```
1b0b5c5 feat: initial commit — Linux Web OS v1.0
73e02b7 feat: initial commit - Linux Web OS v1.0
1e6816d feat: add portfolio apps (6개: Profile, Resume, Projects, Blog, Timeline, Contact)
6ec18fe docs: add session context
78af333 fix: QA test failures (Window hook, project filter, contact contrast)
541c016 feat: Phase 1-5 (Claude Code앱, Git, CI/CD, 파일매니저, 메모, 계산기)
7205d53 docs: session context update
1abf667 feat: Phase 6-7 (GitHub Actions, SEO, /blog skill)
53de35d feat: UX overhaul (드래그 아이콘, Dock, 윈도우 리디자인, 설정)
355cbf3 feat: 시스템 모니터 redesign (Windows 작업관리자 스타일 + LLM 탭)
f16fa6e feat: OS features (부팅, 우클릭, 단축키, Ollama 연동, LLM 대시보드)
73e6fe7 fix: keyboard shortcuts (Ctrl+W/`/D로 변경)
60babf6 fix: Window Hook rules violation
97f24ff fix: drag-to-restore maximized window
8233e07 docs: improvement plan (6 sprints)
2fc97f8 feat: Sprint 1 — 디자인/UX (닫기 애니메이션, 스냅, Dock magnification, 테마)
7b7363c feat: Sprint 2 — 콘텐츠 (프로필/프로젝트/블로그/타임라인 보강)
918dbe9 docs: README 완성
1ca0aeb docs: session context update
29dd0d6 docs: next session plan (harness + obsidian)
0f524d1 feat: 하네스 시스템 (rules, hooks, skills, CLAUDE.md, HarnessManager앱)
b84af77 feat: Obsidian 통합 (백엔드 라우터)
56369b9 feat: WSL 백엔드 실행 확인 (포트 8001)
f4d6db4 feat: 시작메뉴 (Win키) + 레이아웃 수정
4c99435 fix: 버그 수정 + 모바일 CSS + 라이트 테마 보강
3aada86 feat: 통합 AI Chat (Claude+Gemini+GPT+Ollama 한 앱에서)
ca6d9af fix: 윈도우 위치 오버플로 + Win키 전체화면에서만
b6b5d6d fix: 윈도우 off-screen + Claude CLI chat
f8c96e2 feat: 3 OS 스타일 (Windows 11, macOS, GNOME 선택 가능)
c815c36 fix: 윈도우 위치 저장 비활성화 (react-rnd 좌표 drift 문제)
```

---

## 현재 구현 상태

### 앱 21개

| # | 앱 | 파일 | 백엔드 | 상태 |
|---|-----|------|--------|------|
| 1 | Terminal | Terminal.jsx | terminal.py (PTY) | ⚠️ WSL에서만 |
| 2 | VS Code | VSCode.jsx | services.py (iframe) | ⚠️ Tunnel URL 필요 |
| 3 | AI Chat | Claude.jsx | chat.py (4사 라우팅) | ✅ 멀티 프로바이더 |
| 4 | Claude Code | ClaudeCode.jsx | claude.py (WS) | ⚠️ CLI 필요 |
| 5 | 시스템 모니터 | SystemMonitor.jsx | system.py | ✅ 동작 확인 |
| 6 | LLM 대시보드 | LLMDashboard.jsx | services.py | ⚠️ Open WebUI 필요 |
| 7 | 원격 데스크톱 | Kasm.jsx | services.py | ⚠️ KasmVNC 필요 |
| 8 | Git 대시보드 | GitDashboard.jsx | git.py | ⚠️ WSL에서만 |
| 9 | CI/CD | CICD.jsx | cicd.py (WS) | ⚠️ WSL에서만 |
| 10 | 파일 관리자 | FileManager.jsx | files.py | ⚠️ WSL에서만 |
| 11 | 하네스 매니저 | HarnessManager.jsx | harness.py | ✅ 동작 |
| 12 | 메모장 | Memo.jsx | localStorage | ✅ 동작 |
| 13 | 계산기 | Calculator.jsx | 없음 | ✅ 동작 |
| 14 | 설정 | Settings.jsx | config.py | ✅ 동작 |
| 15 | 프로필 | Profile.jsx | 없음 | ✅ 동작 |
| 16 | 이력서 | Resume.jsx | 없음 | ✅ 동작 |
| 17 | 프로젝트 | Projects.jsx | 없음 | ✅ 동작 |
| 18 | 블로그 | Blog.jsx | blog.py | ✅ 프론트 동작 |
| 19 | 타임라인 | Timeline.jsx | 없음 | ✅ 동작 |
| 20 | 연락처 | Contact.jsx | contact.py | ⚠️ mailto만 |
| 21 | (Obsidian) | 앱 없음 | obsidian.py | ❌ 프론트 미구현 |

### 백엔드 라우터 13개

```
backend/routers/
├── terminal.py    ← WebSocket PTY (bash)
├── chat.py        ← Claude/Gemini/GPT/Ollama + Claude CLI
├── claude.py      ← Claude Code 세션 관리 (WebSocket)
├── system.py      ← GPU/CPU/RAM + LLM 모니터링
├── config.py      ← .env.json 관리 (10개 허용 키)
├── services.py    ← VS Code/Kasm/FileBrowser/LLM 대시보드 health check
├── git.py         ← Git CLI 래핑 (repos/branches/log/status)
├── cicd.py        ← 파이프라인 실행 + WebSocket 로그
├── files.py       ← 파일 CRUD (경로 보안)
├── harness.py     ← .claude/ 디렉토리 읽기
├── blog.py        ← 블로그 CRUD (JSON 파일)
├── contact.py     ← 방명록 CRUD
└── obsidian.py    ← 옵시디언 볼트 탐색/동기화
```

### 하네스 시스템

```
.claude/
├── settings.json         ← permissions (allow 18, deny 9, ask 7) + hooks 3개
├── rules/
│   ├── frontend.md       ← React 규칙 (Hook early return 등)
│   ├── backend.md        ← FastAPI 패턴
│   └── security.md       ← 보안 규칙
├── hooks/
│   ├── format-on-save.sh ← PostToolUse: prettier
│   ├── block-dangerous.sh← PreToolUse: 위험 명령 차단
│   └── verify-build.sh   ← Stop: 빌드 검증
├── commands/
│   ├── blog.md           ← /blog 스킬
│   ├── review.md         ← /review 코드 리뷰
│   ├── deploy.md         ← /deploy 배포
│   ├── harness.md        ← /harness Phase별 실행
│   └── test.md           ← /test 테스트
└── CLAUDE.md             ← 프로젝트 헌법
```

### OS 기능

- 3개 OS 스타일 (Windows 11 / macOS / GNOME) — 설정에서 전환
- 다크/라이트 테마
- 부팅 시퀀스 (1시간 내 재방문 스킵)
- 시작 메뉴 (Start 버튼 + 전체화면에서 Win키)
- 우클릭 컨텍스트 메뉴 (단축키 힌트 포함)
- 키보드: F11(전체화면), Ctrl+W(닫기), Ctrl+`(전환), Ctrl+D(바탕화면)
- Dock magnification (코사인 거리 기반)
- 윈도우 스냅 (좌/우/상단 + 프리뷰 오버레이)
- 닫기 애니메이션 (scale+opacity fade)
- 비활성 윈도우 dim
- 배경 그래디언트 애니메이션
- 드래그 가능한 데스크톱 아이콘 (위치 localStorage 저장)

---

## 미구현 항목 (우선순위 순)

### 1순위 — 인프라 관리 통합 (다음 작업)
- [ ] Jenkins/GitHub Actions 대시보드 (하이브리드: iframe + 상태 API)
- [ ] Docker/Portainer 관리 (컨테이너 목록/시작/정지/로그)
- [ ] Grafana/Prometheus 모니터링 iframe
- [ ] 통합 인프라 패널 앱

### 2순위 — 자동화
- [ ] 블로그 에디터 완성 (마크다운 + 미리보기)
- [ ] /blog 스킬 실동작 테스트
- [ ] Obsidian 뷰어 앱 (프론트엔드)
- [ ] Blog ↔ Obsidian 양방향 동기화

### 3순위 — 배포
- [ ] main 머지 + GitHub Pages (정적 포트폴리오)
- [ ] Tailscale 프로덕션 배포
- [ ] PWA manifest
- [ ] OG 이미지

### 4순위 — 추가 앱
- [ ] 마크다운 에디터 (독립 앱)
- [ ] 알림 센터 (토스트 + 패널)
- [ ] Docker 매니저 (프론트)
- [ ] 웹 브라우저 (iframe)

### 5순위 — 보안 강화 (다중 사용자 시)
- [ ] CORS 특정 도메인 제한
- [ ] CI/CD shell injection 방어
- [ ] XSS 방어 (DOMPurify)
- [ ] 터미널 환경변수 필터링

---

## 리눅스 서버에서 시작하기

```bash
# 1. Clone + checkout
git clone https://github.com/k1212gh/linux-web-os.git
cd linux-web-os
git checkout feat/portfolio-apps

# 2. 프론트엔드
cd frontend && npm install && npm run build

# 3. 백엔드
cd ../backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 4. 환경변수
cp .env.json.example .env.json
nano .env.json  # API 키 입력

# 5. 실행
uvicorn main:app --host 0.0.0.0 --port 8000

# 6. (선택) Ollama 설치
chmod +x scripts/setup-ollama.sh && ./scripts/setup-ollama.sh

# 7. (선택) Tailscale 원격 접속
sudo tailscale serve https:443 / http://localhost:8000

# 8. Claude Code에 컨텍스트 전달
# → 이 파일(SESSION_CONTEXT.md)을 읽게 하세요
```

### vite.config.js 프록시 포트

현재 `localhost:8001`로 설정됨 (Windows에서 8000이 사용 중이었음).
리눅스에서는 `localhost:8000`으로 변경 필요:
```js
// frontend/vite.config.js
proxy: { '/api': { target: 'http://localhost:8000' }, '/ws': { target: 'ws://localhost:8000', ws: true } }
```

---

## 핵심 파일

| 용도 | 파일 |
|------|------|
| 앱 등록 | `frontend/src/components/Desktop.jsx` (APPS 배열) |
| 윈도우 상태 | `frontend/src/store/windowStore.js` |
| OS 스타일 | `frontend/src/store/osStyleStore.js` |
| 스타일 | `frontend/src/styles/global.css` |
| 백엔드 진입점 | `backend/main.py` |
| 포트폴리오 데이터 | `frontend/src/data/profile.js`, `projects.js` |
| 하네스 설정 | `.claude/settings.json`, `.claude/rules/`, `.claude/commands/` |
| 프로젝트 헌법 | `CLAUDE.md` |
| 전체 계획 | `ENHANCEMENT_PLAN.md`, `IMPROVEMENT_PLAN.md` |
| 다음 작업 | `NEXT_SESSION_PLAN.md` |
| 배포 가이드 | `docs/DEPLOYMENT.md` |
| QA 테스트 | `TEST_PROMPT.md` |
