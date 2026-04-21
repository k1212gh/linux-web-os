import { useEffect, useRef } from 'react'

let xtermLoaded = false
let xtermPromise = null

function loadXterm() {
  if (xtermPromise) return xtermPromise
  xtermPromise = new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Terminal) {
      resolve()
      return
    }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.3.0/css/xterm.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.3.0/lib/xterm.js'
    script.onload = () => {
      const script2 = document.createElement('script')
      script2.src = 'https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/lib/addon-fit.js'
      script2.onload = () => resolve()
      document.head.appendChild(script2)
    }
    document.head.appendChild(script)
  })
  return xtermPromise
}

export default function TerminalApp() {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const wsRef = useRef(null)
  const fitRef = useRef(null)

  useEffect(() => {
    let term, ws

    const init = async () => {
      await loadXterm()
      if (!containerRef.current) return

      term = new window.Terminal({
        cursorBlink: true,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 1.5,
        theme: {
          background: '#0d1117',
          foreground: '#e6edf3',
          cursor: '#58a6ff',
          cursorAccent: '#0d1117',
          black: '#484f58',
          red: '#ff7b72',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          magenta: '#bc8cff',
          cyan: '#39c5cf',
          white: '#b1bac4',
          brightBlack: '#6e7681',
          brightRed: '#ffa198',
          brightGreen: '#56d364',
          brightYellow: '#e3b341',
          brightBlue: '#79c0ff',
          brightMagenta: '#d2a8ff',
          brightCyan: '#56d4dd',
          brightWhite: '#f0f6fc',
        },
        allowTransparency: true,
      })

      const fitAddon = new window.FitAddon.FitAddon()
      fitRef.current = fitAddon
      term.loadAddon(fitAddon)
      term.open(containerRef.current)
      fitAddon.fit()
      termRef.current = term

      // Connect WebSocket
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/terminal`
      ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        term.writeln('\x1b[32m╔══════════════════════════════════╗\x1b[0m')
        term.writeln('\x1b[32m║   Linux Web OS — Terminal v1.0   ║\x1b[0m')
        term.writeln('\x1b[32m╚══════════════════════════════════╝\x1b[0m')
        term.writeln('')
        // Send initial size
        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }))
      }

      ws.onmessage = (e) => {
        term.write(e.data)
      }

      ws.onclose = () => {
        term.writeln('\r\n\x1b[33m[연결 끊김 — 새로고침하여 재연결]\x1b[0m')
      }

      ws.onerror = () => {
        term.writeln('\r\n\x1b[31m[WebSocket 연결 실패 — 백엔드가 실행 중인지 확인하세요]\x1b[0m')
        term.writeln('\x1b[33m백엔드: cd backend && uvicorn main:app --reload\x1b[0m')
      }

      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }))
        }
      })

      term.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }))
        }
      })

      // Fit on container resize
      const ro = new ResizeObserver(() => fitAddon.fit())
      ro.observe(containerRef.current)
    }

    init()

    return () => {
      term?.dispose()
      ws?.close()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: '#0d1117',
        padding: '4px',
        overflow: 'hidden',
      }}
    />
  )
}
