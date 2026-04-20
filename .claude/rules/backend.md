---
paths:
  - "backend/**/*.py"
---

# 백엔드 규칙

## API 패턴
- FastAPI 라우터 패턴 사용 (`APIRouter()`)
- 모든 라우터는 `backend/main.py`에 등록
- prefix: `/api/{도메인}` 또는 `/ws/{도메인}`
- Pydantic BaseModel로 요청/응답 타입 정의

## 보안
- `.env.json`을 git에 커밋하지 않음
- API 키는 서버사이드에만 — 클라이언트 응답에 포함 금지
- 파일 접근 API는 반드시 경로 순회(path traversal) 방어 포함
- `os.path.realpath()` + base path 검증

## 파일 저장소
- JSON 데이터: `backend/data/` 디렉토리
- 설정: `backend/.env.json` (gitignored)

## WebSocket
- 양방향 JSON 메시지 프로토콜
- 연결 해제 시 리소스 정리 (PTY close, process kill)
- 에러 시 클라이언트에 `{type: "error", message: "..."}` 전송
