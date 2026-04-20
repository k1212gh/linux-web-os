# 다른 기기에서 작업 이어받기 (/resume)

다른 기기에서 넘어온 작업을 이어서 시작합니다.

## 절차

1. **코드 동기화**
   - `git pull origin feat/portfolio-apps` 실행
   - 충돌 있으면 해결

2. **SESSION_CONTEXT.md 읽기**
   - 파일 전체를 읽고 현재 프로젝트 상태 파악
   - "마지막 작업" 섹션에서 이전 기기에서 한 일 확인
   - "다음 할 일" 섹션에서 이어서 할 작업 확인
   - "이슈/주의" 섹션 확인

3. **환경 확인**
   - `node --version` (Node.js 20+)
   - `python3 --version` (Python 3.10+)
   - 백엔드 `.env.json` 존재 여부 확인
   - 프론트엔드 `node_modules` 존재 여부 → 없으면 `npm install`

4. **상태 보고**
   ```
   📋 Resume 완료
   
   현재 브랜치: feat/portfolio-apps
   마지막 커밋: [해시] [메시지] ([시간])
   
   ── 이전 기기에서 한 일 ──
   - ...
   
   ── 다음 할 일 ──
   1. ...
   2. ...
   
   ── 환경 상태 ──
   - Node: vXX
   - Python: vXX
   - 백엔드: [.env.json 있음/없음]
   - 빌드: [확인 필요/OK]
   
   ── 이슈 ──
   - ...
   
   시작할까요?
   ```
