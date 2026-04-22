import './globals.css'

const SITE_URL = 'https://k1212gh.dev'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '김건희 — 풀스택 개발자 포트폴리오',
    template: '%s | 김건희',
  },
  description: 'Web OS 스타일 인터랙티브 포트폴리오. SSAFY 14기 김건희의 프로젝트, 이력서, 블로그.',
  keywords: ['김건희', 'k1212gh', '포트폴리오', '풀스택', 'React', 'Next.js', 'FastAPI', 'Claude Code', 'SSAFY'],
  authors: [{ name: '김건희 (Kim Gunhui)', url: SITE_URL }],
  creator: '김건희',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    title: '김건희 — 풀스택 개발자 포트폴리오',
    description: 'Web OS 스타일 인터랙티브 포트폴리오. 프로젝트·블로그·이력서를 데스크톱 환경에서 탐색하세요.',
    siteName: '김건희',
  },
  twitter: {
    card: 'summary_large_image',
    title: '김건희 — 풀스택 개발자',
    description: 'Web OS 스타일 포트폴리오',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#0a0e1a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Geist:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
