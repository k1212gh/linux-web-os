# Public 사이트 Vercel 배포 가이드

`apps/public` 을 Vercel로 배포. 커스텀 도메인 `k1212gh.dev`.

## 최초 배포 (1회)

### 1. Vercel 프로젝트 생성
1. https://vercel.com → **Add New → Project**
2. GitHub 레포 `k1212gh/linux-web-os` 선택
3. **Configure**:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `apps/public` ← 이거 꼭 설정
   - **Build Command**: `vercel.json`의 값 사용 (자동)
   - **Output Directory**: `out` (자동, output:'export' 때문)
4. **Deploy** 클릭

### 2. 커스텀 도메인 연결 (도메인 구매 후)
1. Vercel 프로젝트 **Settings → Domains**
2. `k1212gh.dev` 추가 → Vercel이 DNS 레코드 안내
3. Cloudflare에 A/CNAME 레코드 추가
4. HTTPS 자동 발급 (~1분)

## 자동 배포
- `main` 브랜치 push → 자동 프로덕션 배포
- PR 생성 → Preview URL 자동 생성 (브랜치별)

## 로컬 확인
```bash
# 프로덕션 빌드
cd apps/public && npx next build
# → apps/public/out/ 에 정적 파일 생성

# 로컬 서빙
npx serve apps/public/out
```

## 블로그 글 배포
1. `content/blog/YYYY-MM-DD-slug.md` 작성
2. frontmatter에 `published: true` 포함
3. `git commit && git push` → Vercel 자동 재빌드
4. https://k1212gh.dev/blog/slug/ 에서 확인

## Troubleshooting
- **빌드 실패**: `npm install` 이 apps/public에서 workspaces 해석을 못 할 때 발생. vercel.json의 buildCommand가 레포 루트에서 install 먼저 실행하도록 설정됨.
- **sitemap.xml 없음**: `output:'export'` 모드에서 sitemap은 `out/sitemap.xml`로 생성됨. Next 14.2+ 필수.
- **OG 이미지**: `app/opengraph-image.jsx` 추가 필요 (Phase 8에서).

## 참고
- Vercel 무료 플랜: 100GB 대역폭/월, 무제한 정적 요청
- 도메인: Cloudflare Registrar $10/년
