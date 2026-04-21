import { useState, useEffect } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', fontFamily: 'var(--font-ui)' },
  sidebar: { width: 160, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' },
  sideTitle: { padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' },
  sideItem: (active) => ({
    padding: '10px 14px', fontSize: 12, cursor: 'pointer',
    background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    transition: 'all 0.12s',
  }),
  main: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  card: { padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  cardSub: { fontSize: 11, color: 'var(--text-muted)' },
  badge: (color) => ({ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${color}20`, color, marginRight: 4 }),
  section: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, marginTop: 4 },
  code: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 },
  statusDot: (ok) => ({ width: 8, height: 8, borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444', flexShrink: 0 }),
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
}

export default function HarnessManagerApp() {
  const [tab, setTab] = useState('status')
  const [status, setStatus] = useState(null)
  const [rules, setRules] = useState([])
  const [hooks, setHooks] = useState({})
  const [permissions, setPermissions] = useState({})
  const [skills, setSkills] = useState([])

  useEffect(() => {
    fetch('/api/harness/status').then(r => r.json()).then(setStatus).catch(() => {})
    fetch('/api/harness/rules').then(r => r.json()).then(d => { if (Array.isArray(d)) setRules(d) }).catch(() => {})
    fetch('/api/harness/hooks').then(r => r.json()).then(d => setHooks(d.hooks || {})).catch(() => {})
    fetch('/api/harness/permissions').then(r => r.json()).then(d => setPermissions(d.permissions || {})).catch(() => {})
    fetch('/api/harness/skills').then(r => r.json()).then(d => { if (Array.isArray(d)) setSkills(d) }).catch(() => {})
  }, [])

  const tabs = [
    { id: 'status', label: '상태' },
    { id: 'rules', label: '규칙' },
    { id: 'hooks', label: 'Hooks' },
    { id: 'permissions', label: '권한' },
    { id: 'skills', label: 'Skills' },
  ]

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.sideTitle}>🔧 하네스</div>
        {tabs.map(t => (
          <div key={t.id} style={s.sideItem(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      <div style={s.main}>
        {/* Status */}
        {tab === 'status' && (
          <>
            <div style={s.section}>시스템 상태</div>
            {status ? (
              <>
                <StatusRow label="CLAUDE.md" ok={status.claude_md} desc="프로젝트 헌법" />
                <StatusRow label="settings.json" ok={status.settings_json} desc="Hooks + Permissions" />
                <StatusRow label="규칙 파일" ok={status.rules_count > 0} desc={`${status.rules_count}개 활성`} />
                <StatusRow label="Hook 스크립트" ok={status.hooks_count > 0} desc={`${status.hooks_count}개 등록`} />
                <StatusRow label="Skills" ok={status.skills_count > 0} desc={`${status.skills_count}개 사용 가능`} />
              </>
            ) : (
              <div style={s.empty}>백엔드 연결 시 표시됩니다.<br/>로컬에서도 하네스 파일은 동작합니다.</div>
            )}

            <div style={s.section}>하네스 레이어</div>
            {[
              { name: 'Hooks', desc: '도구 실행 전/후 강제 자동화', color: '#3b82f6' },
              { name: 'Permissions', desc: '도구별 allow/deny/ask 규칙', color: '#22c55e' },
              { name: 'Rules', desc: '경로별 코딩 규칙 (CLAUDE.md)', color: '#f59e0b' },
              { name: 'Skills', desc: '재사용 워크플로우 (/command)', color: '#8b5cf6' },
              { name: 'MCP', desc: '외부 서비스 연동', color: '#ef4444' },
            ].map(l => (
              <div key={l.name} style={{ ...s.card, borderLeft: `3px solid ${l.color}` }}>
                <div style={s.cardTitle}>{l.name}</div>
                <div style={s.cardSub}>{l.desc}</div>
              </div>
            ))}
          </>
        )}

        {/* Rules */}
        {tab === 'rules' && (
          <>
            <div style={s.section}>활성 규칙 ({rules.length}개)</div>
            {rules.length === 0 && <div style={s.empty}>.claude/rules/ 에 규칙 파일이 없습니다</div>}
            {rules.map(r => (
              <div key={r.name} style={s.card}>
                <div style={s.cardTitle}>📋 {r.name}</div>
                <div style={s.cardSub}>{r.file} ({r.lines}줄)</div>
                {r.paths.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {r.paths.map(p => <span key={p} style={s.code}>{p}</span>)}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Hooks */}
        {tab === 'hooks' && (
          <>
            <div style={s.section}>활성 Hooks</div>
            {Object.keys(hooks).length === 0 && <div style={s.empty}>등록된 Hook이 없습니다</div>}
            {Object.entries(hooks).map(([event, hookList]) => (
              <div key={event}>
                <div style={{ ...s.section, marginTop: 12 }}>{event}</div>
                {hookList.map((h, i) => (
                  <div key={i} style={s.card}>
                    <div style={s.cardTitle}>
                      {event === 'PreToolUse' ? '🛡' : event === 'PostToolUse' ? '🔧' : '✅'} {h.matcher || '전체'}
                    </div>
                    {h.hooks?.map((hk, j) => (
                      <div key={j} style={{ ...s.cardSub, marginTop: 4 }}>
                        <span style={s.badge(hk.type === 'command' ? '#3b82f6' : '#8b5cf6')}>{hk.type}</span>
                        <span style={s.code}>{hk.command?.slice(0, 60)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Permissions */}
        {tab === 'permissions' && (
          <>
            {['allow', 'deny', 'ask'].map(type => {
              const items = permissions[type] || []
              const colors = { allow: '#22c55e', deny: '#ef4444', ask: '#f59e0b' }
              const labels = { allow: '✅ 허용', deny: '🚫 차단', ask: '❓ 확인 필요' }
              return (
                <div key={type}>
                  <div style={s.section}>{labels[type]} ({items.length}개)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {items.map((item, i) => <span key={i} style={s.badge(colors[type])}>{item}</span>)}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Skills */}
        {tab === 'skills' && (
          <>
            <div style={s.section}>사용 가능한 Skills ({skills.length}개)</div>
            {skills.length === 0 && <div style={s.empty}>.claude/commands/ 에 스킬이 없습니다</div>}
            {skills.map(sk => (
              <div key={sk.name} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={s.cardTitle}>⚡ {sk.title}</div>
                  <span style={s.code}>{sk.invoke}</span>
                </div>
                <div style={s.cardSub}>{sk.file}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function StatusRow({ label, ok, desc }) {
  return (
    <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={s.statusDot(ok)} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
      </div>
    </div>
  )
}
