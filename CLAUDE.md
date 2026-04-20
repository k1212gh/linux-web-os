# AgentOS — Claude Code 작업 지침

## 프로젝트 개요
브라우저 기반 Web OS — 인터랙티브 포트폴리오 + 클라우드 개발 워크스테이션.
19개 앱, FastAPI 백엔드, React 프론트엔드.

## 기술 스택
- Frontend: React 18 + Vite + Zustand + react-rnd
- Backend: FastAPI + WebSocket + psutil + httpx
- AI: Claude API + Ollama (ROCm)
- Infra: WSL + Tailscale + systemd

## 빌드 명령
```bash
cd frontend && ./node_modules/.bin/vite build    # 프론트엔드
cd backend && uvicorn main:app --reload          # 백엔드
```

## 코드 스타일
- 프론트: JSX, 인라인 스타일 (CSS 모듈 아님), Zustand 전역 상태
- 백엔드: FastAPI 라우터 패턴, async/await, Pydantic 모델
- 커밋: Conventional Commits (feat:, fix:, docs:, chore:)

## 핵심 규칙
- **Hook은 early return 위에** — React Rules of Hooks 필수 준수
- **새 앱 추가**: Desktop.jsx APPS 배열 + windowStore DEFAULT_SIZES
- **보안**: .env 읽기/커밋 금지, path traversal 방어, API 키 서버사이드만

## 주요 파일
- `frontend/src/components/Desktop.jsx` — 앱 등록, 부팅, 우클릭, 단축키
- `frontend/src/store/windowStore.js` — 윈도우 상태 (open/close/snap 등)
- `frontend/src/styles/global.css` — 테마 변수, 애니메이션
- `backend/main.py` — 라우터 등록
- `.claude/rules/` — 경로별 상세 규칙
- `.claude/commands/` — /blog, /review, /deploy, /harness, /test 스킬

## 참고 문서
- `ENHANCEMENT_PLAN.md` — 전체 계획
- `IMPROVEMENT_PLAN.md` — 개선 계획
- `NEXT_SESSION_PLAN.md` — 다음 세션 계획
- `SESSION_CONTEXT.md` — 세션 히스토리
