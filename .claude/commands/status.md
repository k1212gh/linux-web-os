# 프로젝트 상태 확인 (/status)

현재 프로젝트의 전반적인 상태를 한눈에 보여줍니다.

## 확인 항목

1. **Git 상태**
   - `git branch --show-current` — 현재 브랜치
   - `git log --oneline -3` — 최근 커밋 3개
   - `git status --short` — 변경된 파일
   - `git diff --stat origin/feat/portfolio-apps` — 리모트와 차이

2. **빌드 상태**
   - `cd frontend && ./node_modules/.bin/vite build 2>&1 | tail -3`

3. **백엔드 상태**
   - `curl -s http://localhost:8000/api/system/quick 2>&1 | head -1` (백엔드 실행 중인지)
   - 실행 안 되면 "❌ 백엔드 미실행" 표시

4. **환경 정보**
   - OS 종류 (Linux/macOS/Windows)
   - Node.js 버전
   - Python 버전
   - GPU 정보 (있으면)

5. **출력 형식**
   ```
   ═══ AgentOS Status ═══
   
   📂 브랜치: feat/portfolio-apps
   📝 최근 커밋:
      [해시1] [메시지1]
      [해시2] [메시지2]
   📊 변경 파일: N개 (커밋 안 됨)
   
   🔨 빌드: ✅ 성공 (XXX KB)
   🖥 백엔드: ✅ 실행 중 / ❌ 미실행
   
   💻 환경:
      OS: Linux/Windows/macOS
      Node: vXX
      Python: vXX
      GPU: [있으면 표시]
   ```
