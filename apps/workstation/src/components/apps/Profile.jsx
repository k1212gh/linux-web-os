import { profile } from '../../data/profile'
import { useWindowStore } from '../../store/windowStore'

const s = {
  wrap: { padding: 24, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-ui)' },
  hero: { display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'var(--accent)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, fontWeight: 700, flexShrink: 0,
  },
  name: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  nameEn: { fontSize: 14, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 },
  title: { fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0' },
  email: { fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' },
  bio: {
    fontSize: 15, fontStyle: 'italic', color: 'var(--text-secondary)',
    padding: '12px 20px', borderLeft: '3px solid var(--accent)',
    background: 'rgba(255,255,255,0.03)', borderRadius: 6, margin: '0 0 24px',
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 },
  skillRow: { marginBottom: 10 },
  skillLabel: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 },
  skillBar: { height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  links: { display: 'flex', gap: 8, marginBottom: 20 },
  linkBtn: {
    padding: '8px 16px', borderRadius: 6,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--accent)', textDecoration: 'none', fontSize: 13, cursor: 'pointer',
  },
  actions: { display: 'flex', gap: 8, marginTop: 24 },
  actionBtn: {
    padding: '10px 20px', borderRadius: 6,
    background: 'var(--accent)', color: '#fff', border: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
  },
}

export default function ProfileApp() {
  const { open } = useWindowStore()

  return (
    <div style={s.wrap}>
      <div style={s.hero}>
        <div style={s.avatar}>{profile.name[0]}</div>
        <div>
          <h2 style={s.name}>
            {profile.name}
            <span style={s.nameEn}>{profile.nameEn}</span>
          </h2>
          <p style={s.title}>{profile.title}</p>
          <p style={s.email}>{profile.email}</p>
        </div>
      </div>

      <div style={s.links}>
        {profile.links.map(l => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener" style={s.linkBtn}>
            {l.label}
          </a>
        ))}
      </div>

      <blockquote style={s.bio}>"{profile.bio}"</blockquote>

      <div>
        <h3 style={s.sectionTitle}>핵심 역량</h3>
        {profile.skills.map(sk => (
          <div key={sk.name} style={s.skillRow}>
            <div style={s.skillLabel}>
              <span>{sk.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{sk.level}%</span>
            </div>
            <div style={s.skillBar}>
              <div style={{
                height: '100%', borderRadius: 3, background: sk.color,
                width: `${sk.level}%`, transition: 'width 1s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={s.actions}>
        <button style={s.actionBtn} onClick={() => open('resume')}>📄 이력서</button>
        <button style={s.actionBtn} onClick={() => open('projects')}>💼 프로젝트</button>
        <button style={s.actionBtn} onClick={() => open('blog')}>📝 블로그</button>
      </div>
    </div>
  )
}
