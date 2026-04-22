---
title: "개인 워크스테이션 + 포트폴리오 프로젝트 시작"
slug: "hello-world"
date: "2026-04-20"
published: true
tags: ["portfolio", "nextjs", "tailscale", "monorepo"]
summary: "Web OS 스타일 포트폴리오를 공개/비공개로 분리 배포. Vercel에 SEO 최적화된 정적 사이트, 집 서버에 풀기능 워크스테이션."
---

## 왜 시작했나

포트폴리오를 만들면서 "이왕이면 내가 매일 쓰는 개발 도구도 같이 브라우저 안에 넣자"는 생각으로 시작했다. 결과물은 브라우저에서 돌아가는 Web OS — 터미널, Docker, Jenkins, Claude Code 같은 앱이 창 형태로 뜨는 데스크톱 환경이다.

## 공개 vs 비공개 분리

하지만 몇 가지 앱은 절대 공개해서는 안 된다:

- **Terminal**: PTY 기반 bash 세션. 공개하면 내 서버 완전 장악.
- **Docker API**: 컨테이너 전체 제어권.
- **Files**: 파일 시스템 접근.
- **Jenkins**: 빌드 파이프라인 → 서버 코드 실행 경로.

그래서 **물리적으로 두 개의 배포**로 분리했다:

| | 공개 사이트 | 비공개 워크스테이션 |
|---|---|---|
| 호스팅 | Vercel | 집 Linux 서버 |
| 접근 | `k1212gh.dev` (누구나) | Tailscale 내부망만 |
| 앱 | 9개 (프로필/블로그 등) | 27개 (전부) |
| 빌드 | Next.js SSG | Next.js + FastAPI |

## 아키텍처

pnpm 모노레포로 공통 컴포넌트 공유:

```
apps/public         → Next.js 공개 (Vercel)
apps/workstation    → Next.js 풀기능 (Tailscale)
packages/ui         → Window/Desktop/Taskbar
packages/apps/public  → 공개 앱 9개
packages/apps/private → 비공개 앱 18개
```

보안 경계는 **import 그래프**로 강제한다. `apps/public`은 `@k1212gh/apps-private`를 참조하지 않으므로 빌드 번들에 private 앱 코드가 들어갈 수 없다.

## 앞으로

- [x] 공개/비공개 분리 배포
- [ ] 집 서버 Tailscale 설정
- [ ] 도메인 연결 (`k1212gh.dev`)
- [ ] Synaptic 프로젝트 (`synaptic.k1212gh.dev`)

계속 씁니다.
