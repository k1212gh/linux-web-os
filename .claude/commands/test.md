# 테스트 실행 및 분석

프로젝트의 테스트를 실행하고 결과를 분석합니다.

## 절차

1. **빌드 테스트**: `cd frontend && ./node_modules/.bin/vite build`
   - 빌드 성공 여부, 번들 크기, 경고 확인

2. **코드 정적 분석**:
   - React Hook 규칙 위반 검사 (useCallback/useState가 early return 뒤에 있는지)
   - 미사용 import 확인
   - console.log 잔존 확인

3. **백엔드 임포트 테스트**: `cd backend && python3 -c "from main import app; print('OK')"`

4. **결과 보고**:
   ```
   ## 테스트 결과
   - 빌드: ✅/❌ (번들 크기: XXX KB)
   - Hook 규칙: ✅/❌ (위반 N개)
   - 미사용 import: N개
   - 백엔드: ✅/❌
   ```
