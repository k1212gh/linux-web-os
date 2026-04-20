---
paths:
  - "**/*"
---

# 보안 규칙 (전체 프로젝트)

## 절대 금지
- `.env`, `.env.json`, `.env.local` 파일을 읽거나 커밋에 포함하지 않음
- API 키, 토큰, 비밀번호를 코드에 하드코딩하지 않음
- `rm -rf /`, `rm -rf ~` 등 시스템 파괴 명령 실행 금지
- `git push --force` 금지 — 항상 일반 push
- `chmod 777` 금지 — 최소 권한 원칙

## 필수 사항
- 외부 입력은 항상 검증 후 사용
- 파일 경로 API는 base path 벗어남 방지
- CORS는 개발 시 `*` 허용하되 프로덕션에서는 특정 origin으로 제한
- subprocess 호출 시 shell=True 대신 리스트 형태 사용 권장

## 커밋 규칙
- Conventional Commits: feat:, fix:, docs:, chore:, refactor:
- `.claude/` 디렉토리는 커밋에 포함 (하네스 설정은 팀 공유)
- `.env*`, `settings.local.json`은 gitignore
