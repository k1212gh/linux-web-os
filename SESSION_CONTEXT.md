# 세션 컨텍스트 — 2026-04-17 (최종 업데이트)

> 다른 기기에서 이어서 작업할 때 이 파일을 먼저 읽으세요.

---

## 프로젝트 개요

**linux-web-os** (https://github.com/k1212gh/linux-web-os) 를 포크하여 **개인 포트폴리오 + 클라우드 워크스테이션**으로 고도화하는 프로젝트.

## 누가

- **김건희** (Kim Gunhui) — k1212gh@tukorea.ac.kr
- 한국공학대학교 컴퓨터공학과 / SSAFY 14기 서울
- 주요 프로젝트: Synaptic(노션 시맨틱 검색 SaaS), ALOE MCP Copilot, 딥페이크 탐지

## 오늘 한 일 (2026-04-16)

### 1단계: 바닐라 JS 프로토타입
- CLI 기반 에이전틱 AI 보고서를 Web OS 인터페이스로 구현 (순수 HTML/CSS/JS)
- 윈도우 매니저, 7개 앱, 3개 테마, Canvas 차트 등 완성
- 위치: `test/` 폴더 (바닐라 JS 버전, 보존 중)

### 2단계: 고도화 계획 수립
- 포트폴리오 앱, 블로그, Claude Code 전용 앱 등 기능 확장 계획
- React 전환 결정 (규모 확장성)
- `test/react-app/` 폴더에 React(Vite+TS) 버전 시작했으나 **중단**

### 3단계: linux-web-os 기반으로 전환 (현재)
- 본인의 기존 레포 `k1212gh/linux-web-os`를 분석
- 이미 구현된 6개 앱(Terminal, VS Code, Claude, Monitor, Kasm, Settings) 위에 포트폴리오 앱 추가
- `feat/portfolio-apps` 브랜치에서 작업 중

## 현재 브랜치 상태

**브랜치**: `feat/portfolio-apps` (main에서 분기)

### 추가된 파일 (Phase 0~5 완료)

```
ENHANCEMENT_PLAN.md          ← 전체 7-Phase 고도화 계획서
TEST_PROMPT.md               ← 69개 항목 QA 테스트 프롬프트
SESSION_CONTEXT.md           ← 이 파일

frontend/src/data/
  profile.js                 ← 프로필/이력서 데이터
  projects.js                ← 프로젝트 5개 데이터

frontend/src/hooks/
  useWebSocket.js            ← 재사용 WebSocket 훅

frontend/src/components/apps/
  ClaudeCode.jsx             ← Phase 1: Claude Code 전용 앱 (WS + 도구 승인 UI)
  claude/ConversationView.jsx ← 대화 뷰 (메시지 + 도구 호출 렌더링)
  GitDashboard.jsx           ← Phase 3: Git 브랜치/커밋/상태
  CICD.jsx                   ← Phase 3: 빌드/테스트 파이프라인 + 로그 스트리밍
  FileManager.jsx            ← Phase 3: 파일 탐색/미리보기/업로드
  Memo.jsx                   ← Phase 5: 메모장 (localStorage)
  Calculator.jsx             ← Phase 5: 계산기

backend/services/
  claude_session.py          ← Claude 프로세스 관리 (PTY)

backend/routers/
  claude.py                  ← Claude Code REST + WebSocket
  blog.py                    ← 블로그 CRUD (JSON 파일)
  contact.py                 ← 방명록 CRUD
  git.py                     ← Git CLI 래핑
  cicd.py                    ← 파이프라인 실행 + WS 로그
  files.py                   ← 파일 매니저 API (경로 보안)

frontend/src/components/apps/
  Profile.jsx                ← 프로필 카드 앱 (스킬바, 링크)
  Resume.jsx                 ← 이력서 뷰어 (학력, 교육, 프로젝트, 스택)
  Projects.jsx               ← 프로젝트 쇼케이스 (카드 그리드 + 필터 + 상세)
  Blog.jsx                   ← 블로그 (포스트 리스트/리더 + 가이드 탭)
  Timeline.jsx               ← 타임라인 (세로 연표, 펄스 애니메이션)
  Contact.jsx                ← 연락처 (이메일/링크 + 메시지 폼)
```

### 수정된 파일

```
frontend/src/components/Desktop.jsx  ← 새 앱 6개 import + APPS 배열에 등록
frontend/src/store/windowStore.js    ← 새 앱 기본 윈도우 크기 추가
```

## 빌드 상태

- ✅ `npx vite build` 에러 없이 성공
- ✅ `npm run dev` (localhost:5173) 정상 실행 확인
- ⚠️ 브라우저 실제 동작 테스트 **미완료** (TEST_PROMPT.md 참조)

## 알려진 / 예상되는 문제

| # | 문제 | 심각도 |
|---|------|--------|
| 1 | 아이콘 12개가 세로 1열이라 화면 아래로 잘릴 수 있음 | Medium |
| 2 | Blog의 HTML 콘텐츠(dangerouslySetInnerHTML)가 제대로 렌더링 안 될 수 있음 | High |
| 3 | Timeline 좌우 교차 레이아웃이 작은 윈도우에서 잘릴 수 있음 | Medium |
| 4 | 백엔드 없이 Taskbar의 시스템 트레이 fetch 에러 (무시 가능) | Low |
| 5 | Contact의 input 글자색이 배경과 비슷해 안 보일 수 있음 | Medium |

## 다음 할 일 (우선순위 순)

### 즉시 (Phase 0 마무리)
1. **TEST_PROMPT.md로 브라우저 테스트** → 실제 문제 파악
2. 발견된 문제 수정
3. 수정 후 다시 빌드/테스트

### 그 다음 (Phase 1 — 핵심)
4. **Claude Code 전용 앱** 구현 (ENHANCEMENT_PLAN.md Phase 1 참조)
   - 백엔드: `backend/routers/claude.py` + `backend/services/claude_session.py`
   - 프론트: `ClaudeCode.jsx` + `ConversationView.jsx` + `ToolCallBlock.jsx` + `DiffViewer.jsx`
   - WebSocket으로 `claude` 프로세스에 연결
   - 도구 호출 승인/거부 UI

### 이후
5. Phase 2: 포트폴리오 앱 폴리시 (블로그 에디터, 방명록 백엔드)
6. Phase 3: 개발 도구 (Git 대시보드, CI/CD, 파일 매니저)
7. Phase 4~7: OS 강화, 유틸리티, 배포

## 개발 환경

- **Windows 11** + Git Bash
- **WSL Ubuntu** (Node.js 미설치 — `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -` 필요)
- 프론트엔드: Windows에서 `npm run dev` 실행 가능
- 백엔드: WSL에서 FastAPI 실행 예정 (Python3 있음)

## 핵심 파일 위치

| 용도 | 경로 |
|------|------|
| 전체 계획서 | `ENHANCEMENT_PLAN.md` |
| QA 테스트 | `TEST_PROMPT.md` |
| 앱 등록 | `frontend/src/components/Desktop.jsx` (APPS 배열) |
| 윈도우 상태 | `frontend/src/store/windowStore.js` |
| 스타일 | `frontend/src/styles/global.css` |
| 포트폴리오 데이터 | `frontend/src/data/profile.js`, `projects.js` |
| 포트폴리오 앱 | `frontend/src/components/apps/{Profile,Resume,Projects,Blog,Timeline,Contact}.jsx` |
| 기존 앱 | `frontend/src/components/apps/{Terminal,VSCode,Claude,SystemMonitor,Kasm,Settings}.jsx` |

## 완료된 Sprint

| Sprint | 내용 | 커밋 |
|--------|------|------|
| 0 | 포트폴리오 앱 6개 + QA 테스트 + 버그 수정 | 3 커밋 |
| 1 | Claude Code 앱 + 개발도구(Git/CI·CD/파일) + 유틸(메모/계산기) | 1 커밋 |
| 1b | OS 기능 (부팅/우클릭/단축키/전체화면) + LLM 연동(Ollama) | 1 커밋 |
| 1c | 윈도우 UX (드래그 복원, 타이틀바 메뉴, 스냅) | 3 커밋 |
| Sprint 1 | 디자인/UX 오버홀 (닫기 애니메이션, Dock magnification, 스냅 프리뷰, 다크/라이트 테마, 배경 애니메이션) | 1 커밋 |
| Sprint 2 | 콘텐츠 채우기 (프로필 10스킬, 프로젝트 7개, 블로그 5개, 타임라인 9개) | 1 커밋 |
| Sprint 6 | README 완성 | 1 커밋 |

## 다음 세션에서 할 일 (우선순위 순)

### 1. 하네스(Harness) 엔지니어링 시스템 구현 ⭐ (핵심)

**개념**: AI 에이전트가 안전하고 일관되게 코딩하도록 시스템 환경을 설계하는 프레임워크.

**4대 요소**:
1. `docs/` — PRD, 아키텍처, ADR 등 컨텍스트 문서
2. `CLAUDE.md` — 프로젝트 규칙/헌법
3. 실행 엔진 — `/harness` 명령으로 Phase별 자동 실행 + 상태 관리
4. Hooks — TDD 강제, 위험 명령 차단, 서킷 브레이커

**참고 자료**:
- 노션: https://raspy-roll-970.notion.site/340f7725c9d98176b68bd31c823c7540
- 핵심: 분류기 → 컨텍스트 관리자 → 실행 루프 → 워커 격리 4단계 파이프라인

**AgentOS에 통합 방법**:
- 새 앱: "Harness Manager" — 프로젝트별 하네스 설정 UI
- 백엔드: harness 실행 엔진 (Phase별 자동 실행)
- Claude Code 앱과 연동: 하네스 규칙 하에서 에이전트 실행
- CI/CD 앱과 연동: 하네스 검증 게이트

### 2. WSL 환경 세팅
```bash
# WSL에서 수동 실행 필요:
sudo apt-get update && sudo apt-get install -y nodejs npm
cd /mnt/c/Users/SSAFY/Desktop/ToyPJT/linux-web-os-analysis
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. 실제 백엔드 연동 테스트
- 터미널 PTY, Claude Code, Git 대시보드, 파일 매니저

### 4. main 머지 + GitHub Pages 배포

## 참고: 바닐라 JS 버전

`../test/` 폴더에 첫 번째 프로토타입이 있음 (순수 HTML/CSS/JS). CSS 테마와 데이터 구조 참고용으로 보존.
`../test/react-app/` 에 React 전환 시도가 있으나 **사용하지 않음** — linux-web-os 기반으로 진행.
