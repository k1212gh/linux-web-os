# 환경 동기화 (/sync)

현재 기기의 프로젝트 환경을 최신 상태로 동기화합니다.

## 절차

1. **Git 동기화**
   ```bash
   git pull origin feat/portfolio-apps
   ```

2. **프론트엔드 의존성**
   ```bash
   cd frontend && npm install
   ```

3. **프론트엔드 빌드 확인**
   ```bash
   ./node_modules/.bin/vite build
   ```

4. **백엔드 의존성**
   ```bash
   cd ../backend
   # venv 있으면 활성화, 없으면 생성
   if [ -d ".venv" ]; then source .venv/bin/activate; else python3 -m venv .venv && source .venv/bin/activate; fi
   pip install -r requirements.txt
   ```

5. **환경변수 확인**
   ```bash
   if [ ! -f ".env.json" ]; then cp .env.json.example .env.json && echo "⚠️ .env.json 생성됨 — API 키를 입력하세요"; fi
   ```

6. **vite.config.js 프록시 포트 확인**
   - 현재 설정된 포트와 백엔드 실행 포트가 일치하는지 확인

7. **결과 보고**
   ```
   ✅ Sync 완료
   - Git: 최신 ([커밋 해시])
   - Frontend: 빌드 [성공/실패] (XX KB)
   - Backend: 패키지 [설치됨]
   - 환경변수: [OK/⚠️ 설정 필요]
   - 프록시: localhost:[포트]
   ```
