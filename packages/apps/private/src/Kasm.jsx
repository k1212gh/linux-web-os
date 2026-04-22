'use client'

import { useState, useEffect } from 'react'

export default function KasmApp() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services/kasm')
      .then((r) => r.json())
      .then((d) => { setUrl(d.url || ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100%', background:'#0d0d14', color:'var(--text-secondary)',
      flexDirection:'column', gap:12, fontSize:13 }}>
      <div style={{ fontSize:28 }}>🖥</div>
      <span>KasmVNC 연결 중...</span>
    </div>
  )

  if (!url) return <KasmSetup />

  return (
    <iframe
      src={url}
      style={{ width:'100%', height:'100%', border:'none', background:'#000' }}
      allow="clipboard-read; clipboard-write; fullscreen"
      title="Remote Desktop"
    />
  )
}

function KasmSetup() {
  return (
    <div style={{ padding:24, background:'#0d0d14', height:'100%',
      overflowY:'auto', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22 }}>🖥</span>
        <div>
          <div style={{ fontSize:15, fontWeight:500 }}>원격 데스크톱 (KasmVNC)</div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
            Antigravity, GUI 앱 스트리밍용
          </div>
        </div>
      </div>

      <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.8,
        background:'rgba(255,255,255,0.04)', padding:14, borderRadius:8,
        border:'1px solid var(--border)' }}>
        KasmVNC는 리눅스 GUI 전체를 브라우저로 스트리밍합니다.<br/>
        Antigravity, Postman 등 Electron 기반 앱을 태블릿에서 사용할 때 필요합니다.
      </div>

      {[
        { step:'1', title:'Docker 설치', cmd:'curl -fsSL https://get.docker.com | sh' },
        { step:'2', title:'KasmVNC 실행', cmd:`docker run -d \\
  --name kasmvnc \\
  -p 6901:6901 \\
  -e VNC_PW=yourpassword \\
  -v /home/$USER:/home/kasm-user \\
  lscr.io/linuxserver/webtop:ubuntu-kde` },
        { step:'3', title:'.env에 URL 등록', cmd:'KASM_URL=http://localhost:6901' },
      ].map(({ step, title, cmd }) => (
        <div key={step} style={{ background:'rgba(255,255,255,0.03)', borderRadius:8,
          border:'1px solid var(--border)', padding:'12px 14px' }}>
          <div style={{ fontSize:10, color:'var(--accent)', marginBottom:6, fontWeight:500 }}>
            STEP {step} — {title}
          </div>
          <code style={{ fontSize:11.5, color:'#7ee787', fontFamily:'var(--font-mono)',
            display:'block', whiteSpace:'pre' }}>{cmd}</code>
        </div>
      ))}
    </div>
  )
}
