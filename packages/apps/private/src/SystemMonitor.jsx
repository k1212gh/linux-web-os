'use client'

import { useState, useEffect, useRef } from 'react'

const HISTORY_LEN = 60

// ─── Graph component ───
function Graph({ data, color, height = 64, label, value, unit }) {
  const max = Math.max(...data, 1)
  const w = 300
  const pts = data.map((v, i) => {
    const x = (i / (HISTORY_LEN - 1)) * w
    const y = height - (v / max) * (height - 4)
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontSize: 20, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{unit}</span>
        </div>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {[0.25, 0.5, 0.75].map(r => (
          <line key={r} x1="0" y1={height * r} x2={w} y2={height * r} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}
        <polyline points={`0,${height} ${pts} ${w},${height}`} fill={color} opacity="0.1" strokeWidth="0" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      </svg>
    </div>
  )
}

function SidebarItem({ name, subtitle, value, active, onClick, color }) {
  return (
    <div onClick={onClick} style={{
      padding: '10px 12px', cursor: 'pointer',
      background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
      borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
      transition: 'all 0.12s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      </div>
      <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: value, background: color, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function Section({ title, defaultOpen = true, children, onToggle }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <div onClick={() => { setOpen(!open); onToggle?.(!open) }} style={{
        padding: '8px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)',
      }}>
        <span>{title}</span>
        <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: open ? 'rotate(0)' : 'rotate(-90deg)' }}>▼</span>
      </div>
      {open && children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  )
}

export default function SystemMonitor() {
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('cpu')
  const [hwPolling, setHwPolling] = useState(true)
  const [history, setHistory] = useState({
    gpu_util: [], vram_used: [], cpu: [], ram: [], gpu_temp: [], gpu_power: [],
    tokens_per_sec: [], ttft: [],
  })
  const intervalRef = useRef(null)

  const fetchStats = async () => {
    if (!hwPolling && activeTab !== 'llm') return
    try {
      const res = await fetch('/api/system/stats')
      const data = await res.json()
      setStats(data)
      setHistory(h => {
        const a = (key, val) => [...h[key].slice(-HISTORY_LEN + 1), val ?? 0]
        return {
          gpu_util: a('gpu_util', data.gpu?.utilization),
          vram_used: a('vram_used', data.gpu?.vram_used_gb),
          cpu: a('cpu', data.cpu?.percent),
          ram: a('ram', data.ram?.percent),
          gpu_temp: a('gpu_temp', data.gpu?.temperature),
          gpu_power: a('gpu_power', data.gpu?.power_watts),
          tokens_per_sec: a('tokens_per_sec', data.inference?.tokens_per_sec),
          ttft: a('ttft', data.inference?.ttft_ms),
        }
      })
    } catch {}
  }

  useEffect(() => {
    fetchStats()
    intervalRef.current = setInterval(fetchStats, 2000)
    return () => clearInterval(intervalRef.current)
  }, [hwPolling])

  const gpu = stats?.gpu || {}
  const cpu = stats?.cpu || {}
  const ram = stats?.ram || {}
  const inf = stats?.inference || {}
  const procs = stats?.processes || []

  const tabs = {
    cpu: { name: 'CPU', subtitle: cpu.model || 'CPU', value: `${Math.round(cpu.percent || 0)}%`, color: '#d29922' },
    ram: { name: '메모리', subtitle: `${(ram.used_gb || 0).toFixed(1)}/${(ram.total_gb || 0).toFixed(0)}GB`, value: `${Math.round(ram.percent || 0)}%`, color: '#39c5cf' },
    gpu: { name: 'GPU', subtitle: gpu.name || 'GPU', value: `${Math.round(gpu.utilization || 0)}%`, color: '#58a6ff' },
    llm: { name: 'LLM 추론', subtitle: inf.active_model || '대기 중', value: inf.active_model ? `${Math.round(inf.tokens_per_sec || 0)} t/s` : '—', color: '#3fb950' },
  }

  return (
    <div style={{ height: '100%', display: 'flex', fontFamily: 'var(--font-ui)', background: 'var(--bg-window)' }}>
      {/* Sidebar */}
      <div style={{ width: 160, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.04)', overflowY: 'auto' }}>
        <div style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          성능
        </div>
        {Object.entries(tabs).map(([key, t]) => (
          <SidebarItem key={key} {...t} active={activeTab === key} onClick={() => setActiveTab(key)} />
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{tabs[activeTab]?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tabs[activeTab]?.subtitle}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 300, color: tabs[activeTab]?.color, fontVariantNumeric: 'tabular-nums' }}>
            {tabs[activeTab]?.value}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activeTab === 'cpu' && (
            <Section title="CPU 사용률" onToggle={setHwPolling}>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Graph data={history.cpu} color="#d29922" label="사용률" value={Math.round(cpu.percent || 0)} unit="%" height={80} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <InfoRow label="코어" value={`${cpu.cores || '-'} (${cpu.threads || '-'} 스레드)`} />
                  <InfoRow label="클럭" value={`${cpu.freq_mhz || '-'} MHz`} />
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'ram' && (
            <Section title="메모리" onToggle={setHwPolling}>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Graph data={history.ram} color="#39c5cf" label="사용률" value={Math.round(ram.percent || 0)} unit="%" height={80} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <InfoRow label="사용 중" value={`${(ram.used_gb || 0).toFixed(1)} GB`} />
                  <InfoRow label="전체" value={`${(ram.total_gb || 0).toFixed(1)} GB`} />
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'gpu' && (
            <Section title="GPU" onToggle={setHwPolling}>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Graph data={history.gpu_util} color="#58a6ff" label="사용률" value={Math.round(gpu.utilization || 0)} unit="%" height={80} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Graph data={history.vram_used} color="#bc8cff" label="VRAM" value={(gpu.vram_used_gb || 0).toFixed(1)} unit={`/${gpu.vram_total_gb || 16}GB`} height={50} />
                  <Graph data={history.gpu_temp} color="#ff7b72" label="온도" value={Math.round(gpu.temperature || 0)} unit="°C" height={50} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <InfoRow label="모델" value={gpu.name || '-'} />
                  <InfoRow label="전력" value={`${Math.round(gpu.power_watts || 0)} W`} />
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'llm' && (
            <Section title="LLM 추론 모니터링">
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {inf.active_model ? (
                  <>
                    <div style={{ padding: '10px 14px', background: 'rgba(63,185,80,0.08)', borderRadius: 8, border: '1px solid rgba(63,185,80,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px rgba(63,185,80,0.5)', animation: 'pulse 2s infinite' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{inf.active_model}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>활성 모델</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Graph data={history.tokens_per_sec} color="#3fb950" label="토큰/초 (TPS)" value={(inf.tokens_per_sec || 0).toFixed(1)} unit="t/s" height={60} />
                      <Graph data={history.ttft} color="#f59e0b" label="첫 토큰 시간 (TTFT)" value={Math.round(inf.ttft_ms || 0)} unit="ms" height={60} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <InfoRow label="TPS" value={`${(inf.tokens_per_sec || 0).toFixed(1)}`} />
                      <InfoRow label="TTFT" value={`${Math.round(inf.ttft_ms || 0)} ms`} />
                      <InfoRow label="요청 수" value={`${inf.total_requests || 0}`} />
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
                    <div style={{ marginBottom: 8 }}>로컬 LLM이 감지되지 않습니다</div>
                    <div style={{ fontSize: 11, lineHeight: 1.8 }}>
                      Ollama 설치 후 모델을 실행하세요:<br />
                      <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>ollama run llama3.2</code>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Process list — always available, collapsed by default */}
          <Section title={`프로세스 (상위 ${procs.length}개)`} defaultOpen={false}>
            <div>
              <div style={{ display: 'flex', padding: '6px 12px', fontSize: 10, color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.04)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ flex: 1 }}>이름</span>
                <span style={{ width: 70, textAlign: 'right' }}>CPU</span>
                <span style={{ width: 70, textAlign: 'right' }}>메모리</span>
              </div>
              {procs.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', padding: '5px 12px', fontSize: 11,
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}>
                  <span style={{ flex: 1, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{p.name}</span>
                  <span style={{ width: 70, textAlign: 'right', color: '#d29922' }}>{p.cpu?.toFixed(1)}%</span>
                  <span style={{ width: 70, textAlign: 'right', color: '#39c5cf' }}>{(p.memory_mb / 1024).toFixed(1)}G</span>
                </div>
              ))}
              {procs.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
                  백엔드 연결 시 표시됩니다
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
