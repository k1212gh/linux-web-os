# 블로그 포스트 자동 생성

현재 세션의 대화 내용을 분석하여 블로그 포스트를 생성하세요.

## 규칙

1. **한국어**로 작성
2. 카테고리 결정:
   - **TIL**: 새로운 것을 배운 경우
   - **Project Log**: 프로젝트 작업을 한 경우
   - **Tutorial**: 가이드/튜토리얼을 만든 경우
3. HTML 태그 사용: `<p>`, `<h3>`, `<ul><li>`, `<ol><li>`, `<pre><code>`, `<strong>`, `<em>`
4. 내용 구성: "오늘 한 일" → "구현 과정" → "느낀 점" 순서

## 출력

`frontend/src/components/apps/Blog.jsx` 파일의 `initialPosts` 배열 맨 앞에 아래 형식의 객체를 추가하세요:

```javascript
{
  id: '{category_lowercase}-{YYYY-MM-DD}-{slug}',
  title: '제목',
  date: 'YYYY-MM-DD',
  category: 'TIL|Project Log|Tutorial',
  tags: ['tag1', 'tag2'],
  summary: '한 줄 요약 (100자 이내)',
  content: `<h3>오늘 한 일</h3><p>...</p>`,
  source: 'auto-generated',
},
```

## 예시

```javascript
{
  id: 'project-log-2026-04-17-cicd-runner',
  title: 'CI/CD 러너를 Web OS에 추가하다',
  date: '2026-04-17',
  category: 'Project Log',
  tags: ['cicd', 'fastapi', 'websocket', 'react'],
  summary: 'FastAPI WebSocket으로 빌드 로그를 실시간 스트리밍하는 CI/CD 러너를 구현했다.',
  content: `<h3>오늘 한 일</h3><p>AgentOS에 CI/CD 러너 앱을 추가했다...</p>`,
  source: 'auto-generated',
},
```
