---
paths:
  - "frontend/src/**/*.jsx"
  - "frontend/src/**/*.js"
---

# 프론트엔드 규칙

## 컴포넌트 패턴
- 함수형 컴포넌트만 사용 (class 컴포넌트 금지)
- **모든 Hook은 early return 위에 배치** — React Rules of Hooks 위반 방지
- 인라인 스타일 사용 (CSS 모듈 아님) — 기존 패턴 유지
- 스타일 객체는 컴포넌트 바깥 `const s = {}` 로 정의

## 상태 관리
- 전역 상태: Zustand (`frontend/src/store/windowStore.js`)
- 로컬 상태: useState
- 앱 간 통신: windowStore의 open/focus 액션

## 새 앱 추가 절차
1. `frontend/src/components/apps/앱이름.jsx` 생성
2. `frontend/src/components/Desktop.jsx`의 APPS 배열에 등록
3. `frontend/src/store/windowStore.js`의 DEFAULT_SIZES에 크기 추가
4. 빌드 확인: `cd frontend && ./node_modules/.bin/vite build`

## 금지 사항
- `dangerouslySetInnerHTML` 사용 시 사용자 입력 직접 렌더링 금지
- `useEffect` 의존성 배열 생략 금지
- `any` 타입 사용 금지 (JS지만 명시적 타입 주석 권장)
