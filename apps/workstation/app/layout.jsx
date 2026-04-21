import './globals.css'

export const metadata = {
  title: 'AgentOS — 김건희 워크스테이션',
  description: 'Tailscale 전용 풀기능 Web OS. 터미널, Docker, Jenkins, Claude Code 등 개발 워크스테이션 환경.',
  robots: { index: false, follow: false },
  other: {
    'theme-color': '#0a0e1a',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
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
