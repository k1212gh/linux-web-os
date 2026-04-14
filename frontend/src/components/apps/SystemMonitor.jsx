import { useState, useEffect, useRef } from 'react'

const HISTORY_LEN = 60

function Sparkline({ data, color, height = 40 }) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const w = 200
  const pts = data.map((v, i) => {
    const x = (i / (HISTORY_LEN - 1)) * w
    const y = height - (v / max) * (height - 4)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none"
      style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
      <polyline points={`0,${height} ${pts} ${w},${height}`}
        fill={color} opacity="0.12" strokeWidth="0" />
    </svg>
  )
}

function StatCard({ label, value, unit, color, history }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10,
      border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.06em' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unit}</span>
        </div>
      </div>
      <Sparkline data={history} color={color} />
    </div>
  )
}

export default function SystemMonitor() {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState({
    gpu_util: [], vram_used: [], cpu: [], ram: [], gpu_temp: [], tokens_per_sec: []
  })
  const intervalRef = useRef(null)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/system/stats')
      const data = await res.json()
      setStats(data)
      setHistory((h) => {
        const append = (key, val) => [...h[key].slice(-HISTORY_LEN + 1), val ?? 0]
        return {
          gpu_util:      append('gpu_util',      data.gpu?.utilization ?? 0),
          vram_used:     append('vram_used',      data.gpu?.vram_used_gb ?? 0),
          cpu:           append('cpu',            data.cpu?.percent ?? 0),
          ram:           append('ram',            data.ram?.percent ?? 0),
          gpu_temp:      append('gpu_temp',       data.gpu?.temperature ?? 0),
          tokens_per_sec: append('tokens_per_sec', data.inference?.tokens_per_sec ?? 0),
        }
      })
    } catch { /* backend not running */ }
  }

  useEffect(() => {
    fetchStats()
    intervalRef.current = setInterval(fetchStats, 2000)
    return () => clearInterval(intervalRef.current)
  }, [])

  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
      color: 'var(--text-secondary)', fontSize: 13, flexDirection: 'column', gap: 10,
      background: 'var(--bg-window)' }}>
      <div style={{ fontSize: 28, animation: 'pulse 2s ease infinite' }}>📊</div>
      <span>시스템 데이터 로딩 중...</span>
    </div>
  )

  const gpu = stats.gpu || {}
  const cpu = stats.cpu || {}
  const ram = stats.ram || {}
  const inf = stats.inference || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-window)',
      overflowY: 'auto', padding: 16, gap: 12 }}>
      {/* GPU section */}
      <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 2 }}>
        GPU — {gpu.name || 'Radeon RX 6800 XT'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatCard label="GPU 사용률" value={Math.round(gpu.utilization ?? 0)} unit="%" color="#58a6ff" history={history.gpu_util} />
        <StatCard label="VRAM 사용" value={(gpu.vram_used_gb ?? 0).toFixed(1)} unit={`/ ${gpu.vram_total_gb ?? 16} GB`} color="#bc8cff" history={history.vram_used} />
        <StatCard label="GPU 온도" value={Math.round(gpu.temperature ?? 0)} unit="°C" color="#ff7b72" history={history.gpu_temp} />
        <StatCard label="토큰/초" value={Math.round(inf.tokens_per_sec ?? 0)} unit="t/s" color="#3fb950" history={history.tokens_per_sec} />
      </div>

      {/* CPU/RAM */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', marginTop: 4 }}>
        시스템 — {cpu.model || 'Ryzen 5 5600X'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatCard label="CPU 사용률" value={Math.round(cpu.percent ?? 0)} unit="%" color="#d29922" history={history.cpu} />
        <StatCard label="RAM 사용" value={(ram.used_gb ?? 0).toFixed(1)} unit={`/ ${ram.total_gb ?? 32} GB`} color="#39c5cf" history={history.ram} />
      </div>

      {/* Process list */}
      {stats.processes?.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
            상위 프로세스
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8,
            border: '1px solid var(--border)', overflow: 'hidden' }}>
            {stats.processes.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '8px 12px', borderBottom: i < stats.processes.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{p.name}</span>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: '#d29922' }}>{p.cpu?.toFixed(1)}% CPU</span>
                  <span style={{ color: '#39c5cf' }}>{(p.memory_mb / 1024).toFixed(1)} GB</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
