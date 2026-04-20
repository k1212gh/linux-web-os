# AgentOS 고도화 구현 계획서

> linux-web-os 기반 → 개인 클라우드 워크스테이션 + 포트폴리오 플랫폼
> 작성일: 2026-04-16 | WSL Ubuntu에서 개발/테스트

---

## 현재 상태 (linux-web-os)

| 구현됨 | 기술 |
|--------|------|
| 터미널 (실제 bash PTY) | xterm.js + WebSocket |
| VS Code Tunnel | iframe 임베드 |
| Claude 채팅 | Anthropic API 프록시 |
| 시스템 모니터 | rocm-smi/psutil + 스파크라인 |
| KasmVNC | iframe GUI 스트리밍 |
| 설정 | .env.json 관리 |
| 윈도우 매니저 | react-rnd + Zustand |
| 작업표시줄 | 앱 탭 + 시스템 트레이 + 시계 |

**스택**: React 18 + Vite (프론트) / FastAPI + WebSocket (백엔드)

---

## Phase 0: 기반 정비

**목표**: 포크 후 프로젝트 구조 확장, 새 앱 추가를 위한 토대

### 작업

| # | 작업 | 파일 |
|---|------|------|
| 0-1 | Vite 프록시 설정 (이미 있으면 확인) | `frontend/vite.config.js` |
| 0-2 | 백엔드 라우터 빈 파일 생성 | `backend/routers/{claude,files,git,cicd,docker,blog,contact,logs}.py` |
| 0-3 | 프론트엔드 디렉토리 구조 확장 | `frontend/src/{apps,hooks,stores,styles/apps}/` |
| 0-4 | 새 의존성 설치 | zustand(이미 있음), react-markdown, react-syntax-highlighter |
| 0-5 | 공통 타입 정의 | `frontend/src/types.ts` |
| 0-6 | 아이콘 추가 (새 앱용) | `frontend/src/data/icons.js` 또는 Desktop.jsx APPS 배열 |

### 검증
- `./dev.sh`로 프론트+백엔드 동시 실행
- 기존 6개 앱 정상 동작 확인

---

## Phase 1: Claude Code 전용 앱 ⭐ (핵심 차별화)

**목표**: 태블릿에서 Claude Code를 웹 UI로 사용 — 대화, 도구 호출 확인, 승인/거부, 파일 diff 보기

### 백엔드

| 파일 | 기능 |
|------|------|
| `backend/services/claude_session.py` | Claude 프로세스 관리 (spawn, send, stop) |
| `backend/routers/claude.py` | REST + WebSocket 엔드포인트 |

**API 엔드포인트**:

```
GET  /api/claude/sessions         세션 목록
POST /api/claude/sessions         새 세션 생성 {project_dir}
DELETE /api/claude/sessions/{id}  세션 종료
GET  /api/claude/projects         프로젝트 디렉토리 목록
WS   /ws/claude/{session_id}      양방향 통신
```

**WebSocket 메시지 프로토콜**:

```
Client → Server:
  {type: "message", content: "파일 구조를 분석해줘"}
  {type: "approve", tool_call_id: "tc_123"}
  {type: "deny", tool_call_id: "tc_123"}

Server → Client:
  {type: "assistant_message", content: "분석 결과..."}
  {type: "tool_call", id: "tc_123", tool: "Read", input: {file_path: "..."}}
  {type: "tool_result", id: "tc_123", output: "파일 내용..."}
  {type: "status", state: "thinking|tool_pending|idle"}
```

### 프론트엔드

| 파일 | 역할 |
|------|------|
| `src/components/apps/ClaudeCode.jsx` | 메인 앱 컴포넌트 |
| `src/components/apps/claude/ConversationView.jsx` | 메시지 렌더링 |
| `src/components/apps/claude/ToolCallBlock.jsx` | 도구 호출 카드 (승인/거부) |
| `src/components/apps/claude/DiffViewer.jsx` | 파일 변경 diff 표시 |
| `src/hooks/useWebSocket.js` | 재사용 가능 WS 훅 |

**UI 와이어프레임**:

```
┌─ Claude Code ─────────────────────────────────────┐
│ ┌──────────┐                                      │
│ │ Sessions │  📁 ~/projects/synaptic              │
│ │          │                                      │
│ │ • 현재   │  ┌──────────────────────────────────┐│
│ │ • 어제   │  │ 👤 "이 프로젝트의 구조를 분석해줘"  ││
│ │          │  │                                    ││
│ │          │  │ 🤖 프로젝트 구조를 분석하겠습니다.  ││
│ │          │  │                                    ││
│ │          │  │ ┌─ 🔧 Read ────────────────────┐ ││
│ │          │  │ │ 📄 src/App.tsx               │ ││
│ │          │  │ │ [코드 미리보기...]             │ ││
│ │          │  │ │ ✅ 승인됨                     │ ││
│ │          │  │ └──────────────────────────────┘ ││
│ │          │  │                                    ││
│ │          │  │ ┌─ ✏️ Edit ────────────────────┐ ││
│ │          │  │ │ 📄 src/utils.ts              │ ││
│ │          │  │ │ - const old = "..."          │ ││
│ │          │  │ │ + const new = "..."          │ ││
│ │          │  │ │ [✅ 승인] [❌ 거부]           │ ││
│ │          │  │ └──────────────────────────────┘ ││
│ │          │  │                                    ││
│ │          │  │ 🤖 수정을 완료했습니다. 테스트를   ││
│ │          │  │    실행해볼까요?                    ││
│ │          │  └──────────────────────────────────┘│
│ └──────────┘                                      │
│ ┌────────────────────────────────────────────────┐│
│ │ 메시지 입력...                          [전송] ││
│ └────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────┘
```

### 검증
- 백엔드에서 Claude 세션 생성 → WS 연결
- 메시지 전송 → 응답 스트리밍
- 도구 호출 카드 표시 → 승인/거부
- Edit 도구 → diff 뷰어 표시
- 세션 목록에서 이전 세션 재개

---

## Phase 2: 포트폴리오 앱

**목표**: 프로필, 이력서, 프로젝트, 블로그, 타임라인, 연락처

### 새 앱 컴포넌트

| 파일 | 기능 |
|------|------|
| `src/components/apps/Profile.jsx` | 자기소개 + 스킬 바 + 소셜 링크 |
| `src/components/apps/Resume.jsx` | 학력, 교육, 프로젝트, 기술 스택 |
| `src/components/apps/Projects.jsx` | 카드 그리드 + 필터 + 상세 뷰 |
| `src/components/apps/Blog.jsx` | 포스트 목록 + 리더 + 에디터 + 가이드 |
| `src/components/apps/Timeline.jsx` | 세로 타임라인 + 스크롤 애니메이션 |
| `src/components/apps/Contact.jsx` | 연락처 + 메시지 폼 + 방명록 |

### 데이터 파일

| 파일 | 내용 |
|------|------|
| `src/data/profile.js` | 이름, 이메일, 스킬, 링크 |
| `src/data/projects.js` | 프로젝트 배열 (Synaptic, ALOE, Deepfake, SSAFY PJ, AgentOS) |
| `src/data/resume.js` | 학력, 교육, 스택 카테고리 |

### 백엔드 (선택)

```
GET  /api/blog/posts          블로그 포스트 목록
POST /api/blog/posts          포스트 저장
GET  /api/contact/guestbook   방명록 목록
POST /api/contact/guestbook   방명록 추가
```

### 검증
- 각 앱이 데이터를 정상 렌더링
- 블로그 에디터에서 포스트 작성 → 목록에 추가
- 방명록 메시지 저장 및 표시
- 타임라인 스크롤 시 카드 페이드인

---

## Phase 3: 개발 생산성 도구

**목표**: Git 대시보드, CI/CD 러너, 파일 매니저, 알림 시스템

### 3-1. 알림 시스템 (이후 Phase의 기반)

| 파일 | 역할 |
|------|------|
| `src/store/notificationStore.js` | Zustand 알림 상태 |
| `src/components/NotificationToast.jsx` | 우하단 토스트 |
| `src/components/NotificationPanel.jsx` | 시스템 트레이 패널 |

**Taskbar.jsx 수정**: 알림 벨 아이콘 + 뱃지 카운트 추가

### 3-2. Git 대시보드

```
┌─ Git 대시보드 ────────────────────────────┐
│ 📁 synaptic  [🔄 새로고침]               │
│                                          │
│ [브랜치] [커밋] [PR]                      │
│                                          │
│ ── 브랜치 ──                              │
│ • main (현재)                             │
│   feature/auth                           │
│   feature/embedding                      │
│                                          │
│ ── 최근 커밋 ──                           │
│ a1b2c3d  feat: add OAuth flow  (2h ago)  │
│ d4e5f6g  fix: pgvector index  (5h ago)   │
│ h7i8j9k  chore: update deps  (1d ago)    │
└──────────────────────────────────────────┘
```

**백엔드 API**:
```
GET  /api/git/repos              레포 목록 (설정된 경로)
GET  /api/git/branches?repo=...  브랜치 목록
GET  /api/git/log?repo=...       커밋 로그
GET  /api/git/status?repo=...    작업 트리 상태
GET  /api/git/prs?repo=...       PR 목록 (gh CLI)
POST /api/git/checkout           브랜치 전환
```

### 3-3. CI/CD 러너

```
┌─ CI/CD ──────────────────────────────────┐
│ 📋 synaptic                              │
│                                          │
│ ── 파이프라인 ──                          │
│ ┌────────────────────────────────────┐   │
│ │ 🔨 빌드 & 테스트                    │   │
│ │ Step 1: npm install                │   │
│ │ Step 2: npm run lint               │   │
│ │ Step 3: npm run test               │   │
│ │ Step 4: npm run build              │   │
│ │                                    │   │
│ │ [▶ 실행]  마지막: ✅ 2시간 전       │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ── 실행 로그 ──                           │
│ [14:32:01] npm install... ✓              │
│ [14:32:15] npm run lint... ✓             │
│ [14:32:18] npm run test...               │
│ > 12 tests passed                        │
│ [14:32:22] npm run build... ✓            │
│ ✅ 파이프라인 완료 (21초)                 │
└──────────────────────────────────────────┘
```

**백엔드 API**:
```
GET  /api/cicd/pipelines         파이프라인 목록
POST /api/cicd/pipelines         파이프라인 저장
POST /api/cicd/run/{id}          실행 시작
WS   /ws/cicd/{run_id}          로그 스트리밍
```

### 3-4. 파일 매니저

```
┌─ 파일 매니저 ─────────────────────────────┐
│ 📁 /home/user/projects/synaptic/          │
│                                           │
│ ┌──────────┬──────────────────────────┐   │
│ │ 📁 src   │ 이름        크기  수정일  │   │
│ │  ├─ app  │ ──────────────────────── │   │
│ │  ├─ lib  │ 📁 src       -    2h ago│   │
│ │  └─ ...  │ 📁 docs      -    1d ago│   │
│ │ 📁 docs  │ 📄 README.md 4KB  3h ago│   │
│ │ 📁 tests │ 📄 package.. 2KB  1d ago│   │
│ │          │ 📄 .env.lo.. 1KB  5d ago│   │
│ └──────────┴──────────────────────────┘   │
│                                           │
│ [📤 업로드] [📁 새 폴더] [🔄 새로고침]    │
└───────────────────────────────────────────┘
```

**백엔드 API**:
```
GET    /api/files/list?path=...   디렉토리 목록
GET    /api/files/read?path=...   파일 읽기
POST   /api/files/upload          파일 업로드
GET    /api/files/download?path=  파일 다운로드
POST   /api/files/mkdir           폴더 생성
POST   /api/files/rename          이름 변경
DELETE /api/files/delete          삭제
```

### 검증
- 알림 토스트 표시 + 자동 사라짐
- Git: 실제 레포의 브랜치/커밋 표시
- CI/CD: `echo hello` 파이프라인 실행, 로그 스트리밍
- 파일: 디렉토리 탐색, 파일 미리보기, 업로드/다운로드

---

## Phase 4: OS 기능 강화

**목표**: 부팅 시퀀스, 테마 확장, 윈도우 스냅, 딥링크, 키보드 단축키, 우클릭 메뉴

### 작업

| # | 기능 | 수정 파일 |
|---|------|----------|
| 4-1 | 부팅 시퀀스 애니메이션 | 새: `BootScreen.jsx` + `boot.css` |
| 4-2 | 테마 확장 (다크/라이트/레트로) | `global.css` + `Settings.jsx` |
| 4-3 | 윈도우 스냅 (좌/우/전체) | `Window.jsx` + `windowStore.js` |
| 4-4 | 딥링크 라우팅 (#app/context) | 새: `useDeepLink.js` → `Desktop.jsx` |
| 4-5 | 윈도우 위치 localStorage 저장 | `windowStore.js` |
| 4-6 | 키보드 단축키 | 새: `useKeyboardShortcuts.js` |
| 4-7 | 바탕화면 우클릭 메뉴 | 새: `ContextMenu.jsx` → `Desktop.jsx` |

### CSS 추가 (themes)
```css
/* 라이트 테마 */
[data-theme="light"] {
  --bg-desktop: #f0f0f0;
  --bg-window: #ffffff;
  --text-primary: #1a1a1a;
  --accent: #0078d4;
  /* ... */
}

/* 레트로 테마 (Win95) */
[data-theme="retro"] {
  --bg-desktop: #008080;
  --bg-window: #c0c0c0;
  --border-radius: 0px;
  /* ... */
}
```

### 검증
- 첫 방문 시 부팅 애니메이션 (재방문 시 스킵)
- 3개 테마 전환 동작
- 윈도우 가장자리 드래그 → 스냅
- `#projects/synaptic` URL 직접 접속 → 해당 앱 열림
- Alt+Tab → 윈도우 전환

---

## Phase 5: 추가 개발 도구

**목표**: Docker 매니저, 마크다운 에디터, 로그 뷰어, 메모장

### 앱 목록

| 앱 | 백엔드 | 설명 |
|---|--------|------|
| Docker 매니저 | `/api/docker/*`, `WS /ws/docker/logs/{id}` | 컨테이너 목록/시작/정지/로그 |
| 마크다운 에디터 | 파일 API 재사용 | 분할 뷰 (편집+미리보기), 파일 저장 |
| 로그 뷰어 | `WS /ws/logs` | journalctl / 앱 로그 실시간 tail + 필터 |
| 메모장 | localStorage + 파일 API | 빠른 메모, 노트 목록 |

---

## Phase 6: 유틸리티 & 폴리시

**목표**: 계산기, 북마크, API 테스터, 뮤직 플레이어, 모바일 대응, PWA, 다국어

### 앱 목록

| 앱 | 백엔드 | 설명 |
|---|--------|------|
| 계산기 | ❌ | 기본 산술 연산 |
| 북마크 | ❌ | URL 정리, localStorage |
| API 테스터 | `/api/proxy` | Postman 같은 HTTP 요청 도구 |
| 뮤직 플레이어 | ❌ | YouTube iframe / 로컬 mp3 |

### OS 폴리시

| 기능 | 설명 |
|------|------|
| 모바일 반응형 | 768px 이하 → 전체화면 윈도우, 탭바 스타일 |
| PWA | manifest.json + Service Worker |
| 다국어 (ko/en) | react-i18next |

---

## Phase 7: 배포 & /blog 스킬

**목표**: GitHub Pages 정적 배포, 프로덕션 배포 가이드, Claude Code /blog 스킬

### 7-1. GitHub Pages (정적 포트폴리오)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Pages
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./backend/static
```

### 7-2. /blog 스킬

파일: `.claude/commands/blog.md`
```markdown
# 블로그 포스트 자동 생성

현재 세션의 대화를 분석하여 블로그 포스트를 생성하세요.

## 규칙
- 한국어 작성
- 카테고리: TIL / Project Log / Tutorial
- HTML 태그 사용 (<p>, <h3>, <ul>, <pre><code>)
- frontend/src/data/blog.js의 posts 배열에 추가

## 출력 형식
{
  id: '{category}-{YYYY-MM-DD}-{slug}',
  title: '제목',
  date: 'YYYY-MM-DD',
  category: 'TIL',
  tags: ['tag1', 'tag2'],
  content: '<p>HTML</p>',
  source: 'auto-generated'
}
```

### 7-3. SEO

```html
<meta property="og:title" content="김건희 | AgentOS Portfolio">
<meta property="og:description" content="Web OS 스타일 인터랙티브 포트폴리오">
<meta property="og:image" content="/og-image.png">
```

### 7-4. 프로덕션 배포 (WSL/서버)

```bash
# Tailscale 설치
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# systemd 서비스
sudo systemctl enable linux-web-os
sudo systemctl start linux-web-os

# Tailscale HTTPS
sudo tailscale serve https:443 / http://localhost:8000
```

---

## 전체 파일 생성 맵

```
frontend/src/
  components/apps/
    ClaudeCode.jsx          ← Phase 1
    claude/
      ConversationView.jsx  ← Phase 1
      ToolCallBlock.jsx     ← Phase 1
      DiffViewer.jsx        ← Phase 1
    Profile.jsx             ← Phase 2
    Resume.jsx              ← Phase 2
    Projects.jsx            ← Phase 2
    Blog.jsx                ← Phase 2
    Timeline.jsx            ← Phase 2
    Contact.jsx             ← Phase 2
    GitDashboard.jsx        ← Phase 3
    CICD.jsx                ← Phase 3
    FileManager.jsx         ← Phase 3
    Docker.jsx              ← Phase 5
    MarkdownEditor.jsx      ← Phase 5
    LogViewer.jsx           ← Phase 5
    Memo.jsx                ← Phase 5
    Calculator.jsx          ← Phase 6
    Bookmarks.jsx           ← Phase 6
    ApiTester.jsx            ← Phase 6
    MusicPlayer.jsx         ← Phase 6
  components/
    BootScreen.jsx          ← Phase 4
    ContextMenu.jsx         ← Phase 4
    NotificationToast.jsx   ← Phase 3
    NotificationPanel.jsx   ← Phase 3
  hooks/
    useWebSocket.js         ← Phase 1
    useDeepLink.js          ← Phase 4
    useKeyboardShortcuts.js ← Phase 4
  store/
    notificationStore.js    ← Phase 3
  data/
    profile.js              ← Phase 2
    projects.js             ← Phase 2
    resume.js               ← Phase 2
  styles/apps/
    claude-code.css         ← Phase 1
    portfolio.css           ← Phase 2
    dev-tools.css           ← Phase 3
    boot.css                ← Phase 4

backend/
  routers/
    claude.py               ← Phase 1
    blog.py                 ← Phase 2
    contact.py              ← Phase 2
    git.py                  ← Phase 3
    cicd.py                 ← Phase 3
    files.py                ← Phase 3
    docker.py               ← Phase 5
    logs.py                 ← Phase 5
    proxy.py                ← Phase 6
  services/
    claude_session.py       ← Phase 1
    pty_manager.py          ← Phase 1

.claude/commands/blog.md    ← Phase 7
.github/workflows/deploy.yml ← Phase 7
docs/deployment.md          ← Phase 7
```

---

## 구현 순서 & 예상 소요

```
Phase 0 (기반)          1~2일
    ↓
Phase 1 (Claude Code)   5~7일  ⭐ 핵심
    ↓
Phase 2 (포트폴리오)    3~4일
    ↓
Phase 3 (개발도구)      5~7일
    ↓
Phase 4 (OS 강화)       3~4일
    ↓
Phase 5 (추가도구)      3~4일
    ↓
Phase 6 (유틸리티)      4~5일
    ↓
Phase 7 (배포)          2~3일
─────────────────────────────
합계                   26~36일
```

**MVP (최소 배포 가능)**: Phase 0 + 1 + 2 + 7
**완성형**: 전체 Phase 0~7
