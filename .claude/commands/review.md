# 코드 리뷰

현재 브랜치의 변경사항을 리뷰합니다.

## 절차

1. `git diff main --stat`으로 변경 파일 목록 확인
2. 각 파일의 diff를 읽고 아래 관점에서 분석:
   - **보안**: SQL 인젝션, XSS, 하드코딩된 시크릿, path traversal
   - **버그**: null 체크 누락, 무한 루프, 메모리 누수, Race condition
   - **스타일**: 프로젝트 규칙(`.claude/rules/`) 준수 여부
   - **성능**: 불필요한 리렌더링, N+1 쿼리, 큰 번들
3. 발견 사항을 `파일:라인 — 문제 — 권장 수정` 형식으로 정리
4. 심각도 태그: CRITICAL / HIGH / MEDIUM / LOW

## 출력 형식

```
## 코드 리뷰 결과

### CRITICAL
- `파일:라인` — 문제 설명 — 수정 방법

### HIGH
...

### 요약
- 변경 파일: N개
- 발견: CRITICAL X, HIGH Y, MEDIUM Z
- 결론: 머지 가능 / 수정 필요
```
