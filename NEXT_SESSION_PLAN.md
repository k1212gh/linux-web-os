# 다음 세션 계획서

> 이 파일을 다음 세션 시작 시 Claude Code에게 전달하세요.
> 프로젝트: https://github.com/k1212gh/linux-web-os (feat/portfolio-apps 브랜치)

---

## 현재 상태

- 브랜치: `feat/portfolio-apps` (main에서 분기, 16+ 커밋)
- 앱 19개, 백엔드 라우터 9개
- Sprint 1(디자인) + Sprint 2(콘텐츠) 완료
- WSL Node.js 미설치 (수동 필요)
- 백엔드 실제 테스트 미완료

---

## 작업 1: 하네스(Harness) 엔지니어링 시스템

### 개념

Claude Code의 내장 시스템을 활용하여 AI 에이전트가 안전하고 일관되게 코딩하도록 환경을 설계.

### 공식 문서 기반 7개 레이어

| 레이어 | 설정 파일 | 역할 |
|--------|----------|------|
| Hooks | `.claude/settings.json` | 도구 실행 전/후 강제 자동화 (PreToolUse, PostToolUse, Stop) |
| Permissions | `.claude/settings.json` | 도구별 allow/deny/ask 규칙 |
| Memory | `CLAUDE.md`, `.claude/rules/` | 프로젝트 규칙, 경로별 코딩 규칙 |
| Skills | `.claude/commands/` | 재사용 워크플로우 (/review, /deploy, /harness) |
| MCP | `.mcp.json` | 외부 서비스 연동 (Obsidian, GitHub 등) |
| Agent SDK | 별도 코드 | 커스텀 에이전트 빌드 |
| Auto Memory | `~/.claude/projects/*/memory/` | 자동 학습 메모리 |

### 구현할 파일

```
.claude/
├── CLAUDE.md                    ← 프로젝트 헌법 (빌드 명령, 코드 스타일, 아키텍처)
├── settings.json                ← 팀 permissions + hooks
├── settings.local.json          ← 개인 설정 (gitignored)
├── rules/
│   ├── frontend.md              ← React 컴포넌트 규칙
│   ├── backend.md               ← FastAPI 라우터 규칙
│   └── security.md              ← 보안 규칙 (.env 보호 등)
├── commands/
│   ├── blog.md                  ← /blog (이미 존재)
│   ├── review.md                ← /review — PR 코드 리뷰
│   ├── deploy.md                ← /deploy — 빌드 + 배포
│   ├── harness.md               ← /harness — Phase별 자동 실행
│   └── test.md                  ← /test — 테스트 실행 + 결과 분석
├── hooks/
│   ├── format-on-save.sh        ← PostToolUse(Edit|Write) → prettier
│   ├── lint-check.sh            ← PreToolUse(Bash:git commit) → eslint
│   └── block-dangerous.sh       ← PreToolUse(Bash:rm -rf|DROP|push --force) → 차단
└── agents/
    ├── reviewer.md              ← 코드 리뷰 서브에이전트
    └── tester.md                ← 테스트 생성 서브에이전트
```

### settings.json 예시

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep"
    ],
    "deny": [
      "Read(.env*)",
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(DROP *)"
    ],
    "ask": [
      "Bash(git push *)",
      "Bash(git commit *)",
      "Bash(npm install *)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "if": "Bash(rm -rf *|DROP *|push --force*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '위험한 명령이 차단되었습니다' >&2; exit 2"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd frontend && npx vite build --mode production 2>&1 | tail -3"
          }
        ]
      }
    ]
  }
}
```

### /harness 스킬 (`.claude/commands/harness.md`)

```markdown
# Phase별 자동 실행 하네스

이 프로젝트의 구현을 아래 Phase 순서로 실행하세요.
각 Phase 완료 시 빌드 검증을 수행하세요.

## Phase 순서
1. docs/ 문서 확인 및 요구사항 파악
2. 아키텍처 설계 (필요 시 ADR 작성)
3. 구현 (TDD: 테스트 먼저 → 코드 → 리팩토링)
4. 빌드 검증 (npm run build)
5. 커밋 (Conventional Commits)

## 규칙
- 각 Phase에서 에러 발생 시 다음으로 넘어가지 마세요
- 3회 실패 시 사용자에게 보고하고 중단하세요 (서킷 브레이커)
- .env 파일을 절대 읽지 마세요
```

### AgentOS "Harness Manager" 앱

**새 파일**: `frontend/src/components/apps/HarnessManager.jsx`

```
┌─ Harness Manager ──────────────────────────────┐
│                                                │
│ [규칙] [Hooks] [Skills] [실행 로그]             │
│                                                │
│ ── 활성 규칙 ──                                │
│ ✅ frontend.md — React 컴포넌트 규칙           │
│ ✅ backend.md — FastAPI 라우터 규칙            │
│ ✅ security.md — 보안 규칙                     │
│                                                │
│ ── 활성 Hooks ──                               │
│ 🔧 PostToolUse(Edit) → prettier               │
│ 🛡 PreToolUse(Bash) → 위험 명령 차단          │
│ ✅ Stop → 빌드 검증                            │
│                                                │
│ ── 실행 로그 ──                                │
│ 14:32 ✅ Edit: Window.jsx → prettier 완료     │
│ 14:33 🛡 Bash: rm -rf 차단됨                  │
│ 14:35 ✅ Stop → vite build 성공               │
│                                                │
└────────────────────────────────────────────────┘
```

**백엔드**: `backend/routers/harness.py`
- `GET /api/harness/rules` — 활성 규칙 목록
- `GET /api/harness/hooks` — 활성 hooks 목록
- `GET /api/harness/log` — 실행 로그
- `POST /api/harness/run` — /harness 스킬 실행

---

## 작업 2: Obsidian 통합

### 구현 항목

| # | 작업 | 파일 |
|---|------|------|
| 1 | Settings 앱에 `OBSIDIAN_VAULT` 경로 설정 추가 | `Settings.jsx` |
| 2 | 파일 매니저에서 볼트 탐색 가능하도록 | `backend/.env.json`에 경로 추가 |
| 3 | `.claude/knowledge` 심링크 생성 스크립트 | `scripts/setup-obsidian.sh` |
| 4 | MCP 서버 연동 (Obsidian REST API 플러그인) | `.mcp.json` |
| 5 | Blog ↔ 옵시디언 양방향 동기화 라우터 | `backend/routers/obsidian.py` |
| 6 | Obsidian Viewer 앱 (마크다운 + wiki-link 미리보기) | `frontend/src/components/apps/ObsidianViewer.jsx` |

### MCP 설정 (`.mcp.json`)

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "obsidian-claude-code-mcp"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/vault"
      }
    }
  }
}
```

### Blog ↔ 옵시디언 동기화

```python
# backend/routers/obsidian.py

@router.get("/notes")
async def list_notes():
    """옵시디언 볼트의 마크다운 파일 목록"""

@router.get("/note")
async def read_note(path: str):
    """노트 내용 읽기 (프론트매터 파싱)"""

@router.post("/sync-to-blog")
async def sync_to_blog(note_path: str):
    """옵시디언 노트 → Blog 포스트 변환"""

@router.post("/sync-from-blog")
async def sync_from_blog(post_id: str):
    """Blog 포스트 → 옵시디언 노트로 저장"""
```

---

## 작업 3: WSL 백엔드 연동

### 순서

```bash
# 1. WSL에서 Node.js 설치
sudo apt-get update && sudo apt-get install -y nodejs npm

# 2. 프로젝트 경로 이동
cd /mnt/c/Users/SSAFY/Desktop/ToyPJT/linux-web-os-analysis

# 3. 프론트엔드 빌드
cd frontend && npm install && npm run build

# 4. 백엔드 실행
cd ../backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 5. 브라우저에서 http://localhost:8000 접속
```

### 테스트 체크리스트

- [ ] 터미널 앱 → 실제 bash 셸 동작
- [ ] Claude Code 앱 → 세션 생성 (claude CLI 필요)
- [ ] Claude 채팅 → API 키 설정 → 대화 동작
- [ ] 시스템 모니터 → GPU/CPU/RAM 데이터 표시
- [ ] Git 대시보드 → 실제 레포 브랜치/커밋 표시
- [ ] 파일 매니저 → 디렉토리 탐색/파일 읽기
- [ ] CI/CD → 테스트 파이프라인 실행

---

## 작업 4: 배포

### GitHub Pages (정적 포트폴리오)

```bash
# feat/portfolio-apps → main 머지
git checkout main
git merge feat/portfolio-apps
git push origin main

# GitHub Settings → Pages → Source: GitHub Actions
```

### Tailscale 프로덕션 (풀스택)

```bash
sudo tailscale serve https:443 / http://localhost:8000
```

---

## 우선순위

```
작업 1 (하네스)    ← 핵심 차별화, 가장 먼저
    ↓
작업 2 (Obsidian)  ← 하네스의 docs 레이어로 활용
    ↓
작업 3 (WSL 연동)  ← 실사용 테스트
    ↓
작업 4 (배포)      ← 공개
```
