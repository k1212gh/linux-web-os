# 💻 AgentOS — Web OS Portfolio & Workstation

> 브라우저 안에서 데스크톱 OS처럼 동작하는 인터랙티브 포트폴리오 & 클라우드 개발 환경

태블릿이나 원격 노트북에서 접속하면 코드 작성, AI 대화, 시스템 모니터링, 빌드/배포까지 가능한 개인 클라우드 워크스테이션입니다.

---

## 주요 기능

### OS 기능
- 🖱 **윈도우 매니저** — 드래그, 리사이즈, 좌/우 스냅, 최대화/복원
- 🎨 **다크/라이트 테마** — CSS 변수 기반 실시간 전환
- 🚀 **부팅 시퀀스** — 프로그레스바 + 메시지 (재방문 시 스킵)
- ⌨ **키보드 단축키** — F11(전체화면), Ctrl+W(닫기), Ctrl+`(전환), Ctrl+D(바탕화면)
- 📋 **우클릭 컨텍스트 메뉴** — 앱 빠른 실행, 전체화면, 아이콘 초기화
- 🎯 **Dock 작업표시줄** — macOS 스타일 magnification, 고정 앱 + 열린 앱

### 19개 앱

| 카테고리 | 앱 |
|----------|-----|
| **개발 도구** | Terminal (PTY), VS Code (Tunnel), Claude Code (WebSocket), Claude Chat |
| **DevOps** | Git 대시보드, CI/CD 러너, 파일 관리자, 시스템 모니터 |
| **AI/LLM** | LLM 대시보드 (Open WebUI iframe), Ollama 연동 로컬 모델 |
| **인프라** | 원격 데스크톱 (KasmVNC), 설정 |
| **유틸리티** | 메모장, 계산기 |
| **포트폴리오** | 프로필, 이력서, 프로젝트 쇼케이스, 블로그, 타임라인, 연락처 |

### 기술 스택

```
Frontend:  React 18 · Vite · Zustand · react-rnd · xterm.js
Backend:   FastAPI · WebSocket PTY · httpx · psutil
AI:        Claude API · Ollama (ROCm) · MCP Protocol
Infra:     WSL · Tailscale · systemd · Docker
```

---

## 빠른 시작

### 개발 모드

```bash
# 프론트엔드
cd frontend && npm install && npm run dev

# 백엔드 (WSL)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**접속**: http://localhost:5173

### 프로덕션 배포

```bash
chmod +x install.sh && ./install.sh
sudo systemctl start linux-web-os
```

자세한 배포 가이드: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 프로젝트 구조

```
frontend/src/
  components/
    Desktop.jsx          # 바탕화면 + 부팅 + 우클릭 + 단축키
    Window.jsx           # 윈도우 (드래그/리사이즈/스냅/애니메이션)
    Taskbar.jsx          # Dock 작업표시줄 (magnification)
    AppIcon.jsx          # 드래그 가능한 데스크톱 아이콘
    apps/                # 19개 앱 컴포넌트
  store/
    windowStore.js       # Zustand 윈도우 상태 관리
  data/
    profile.js           # 프로필/이력서 데이터
    projects.js          # 프로젝트 7개 데이터

backend/
  main.py               # FastAPI 서버 (9개 라우터)
  routers/
    terminal.py          # WebSocket PTY (bash)
    claude.py            # Claude Code 세션 관리
    chat.py              # Claude + Ollama 이중 라우팅
    git.py / cicd.py     # Git 대시보드, CI/CD 러너
    files.py             # 파일 관리자
    system.py            # GPU/CPU/RAM + LLM 모니터링
    blog.py / contact.py # 블로그, 방명록
```

---

## 문서

- [ENHANCEMENT_PLAN.md](ENHANCEMENT_PLAN.md) — 전체 고도화 계획 (7 Phase)
- [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) — 종합 개선 계획 (6 Sprint)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — 배포 가이드
- [TEST_PROMPT.md](TEST_PROMPT.md) — QA 테스트 프롬프트 (69개 항목)
- [SESSION_CONTEXT.md](SESSION_CONTEXT.md) — 개발 세션 컨텍스트

---

## 만든 사람

**김건희** (Kim Gunhui)
- 한국공학대학교 컴퓨터공학과 / SSAFY 14기
- k1212gh@tukorea.ac.kr
- [GitHub](https://github.com/k1212gh) · [Blog](https://k1212gh.tistory.com/)

---

## License

MIT
