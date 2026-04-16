import { useEffect } from 'react'
import { useWindowStore } from '../store/windowStore'
import AppIcon from './AppIcon'
import Taskbar from './Taskbar'
import Window from './Window'
import TerminalApp from './apps/Terminal'
import VSCodeApp from './apps/VSCode'
import ClaudeApp from './apps/Claude'
import SystemMonitor from './apps/SystemMonitor'
import KasmApp from './apps/Kasm'
import SettingsApp from './apps/Settings'
import ClaudeCodeApp from './apps/ClaudeCode'
import GitDashboardApp from './apps/GitDashboard'
import CICDApp from './apps/CICD'
import FileManagerApp from './apps/FileManager'
import MemoApp from './apps/Memo'
import CalculatorApp from './apps/Calculator'
import ProfileApp from './apps/Profile'
import ResumeApp from './apps/Resume'
import ProjectsApp from './apps/Projects'
import BlogApp from './apps/Blog'
import TimelineApp from './apps/Timeline'
import ContactApp from './apps/Contact'

const APPS = [
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '⌨',
    label: 'Terminal',
    gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
    component: TerminalApp,
  },
  {
    id: 'vscode',
    title: 'VS Code',
    icon: '◈',
    label: 'VS Code',
    gradient: 'linear-gradient(135deg, #007acc 0%, #005b9a 100%)',
    component: VSCodeApp,
  },
  {
    id: 'claude',
    title: 'Claude',
    icon: '✦',
    label: 'Claude',
    gradient: 'linear-gradient(135deg, #c47f6b 0%, #8b4513 100%)',
    component: ClaudeApp,
  },
  {
    id: 'monitor',
    title: '시스템 모니터',
    icon: '📊',
    label: 'Monitor',
    gradient: 'linear-gradient(135deg, #1a3a5c 0%, #0d2137 100%)',
    component: SystemMonitor,
  },
  {
    id: 'kasm',
    title: '원격 데스크톱',
    icon: '🖥',
    label: 'Desktop',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    component: KasmApp,
  },
  {
    id: 'settings',
    title: '설정',
    icon: '⚙',
    label: 'Settings',
    gradient: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
    component: SettingsApp,
  },
  // ─── Claude Code ───
  {
    id: 'claude-code',
    title: 'Claude Code',
    icon: '🤖',
    label: 'Claude Code',
    gradient: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    component: ClaudeCodeApp,
  },
  // ─── Dev Tools ───
  {
    id: 'git',
    title: 'Git 대시보드',
    icon: '🔀',
    label: 'Git',
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    component: GitDashboardApp,
  },
  {
    id: 'cicd',
    title: 'CI/CD',
    icon: '🔨',
    label: 'CI/CD',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    component: CICDApp,
  },
  {
    id: 'filemanager',
    title: '파일 관리자',
    icon: '📂',
    label: 'Files',
    gradient: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
    component: FileManagerApp,
  },
  // ─── Utilities ───
  {
    id: 'memo',
    title: '메모장',
    icon: '📒',
    label: 'Memo',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    component: MemoApp,
  },
  {
    id: 'calculator',
    title: '계산기',
    icon: '🧮',
    label: 'Calc',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    component: CalculatorApp,
  },
  // ─── Portfolio Apps ───
  {
    id: 'profile',
    title: '프로필',
    icon: '👤',
    label: 'Profile',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    component: ProfileApp,
  },
  {
    id: 'resume',
    title: '이력서',
    icon: '📄',
    label: 'Resume',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    component: ResumeApp,
  },
  {
    id: 'projects',
    title: '프로젝트',
    icon: '💼',
    label: 'Projects',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    component: ProjectsApp,
  },
  {
    id: 'blog',
    title: '블로그',
    icon: '📝',
    label: 'Blog',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    component: BlogApp,
  },
  {
    id: 'timeline',
    title: '타임라인',
    icon: '📅',
    label: 'Timeline',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    component: TimelineApp,
  },
  {
    id: 'contact',
    title: '연락처',
    icon: '✉',
    label: 'Contact',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    component: ContactApp,
  },
]

export default function Desktop() {
  const { registerApp } = useWindowStore()

  useEffect(() => {
    APPS.forEach((app) => registerApp(app))
  }, [])

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-desktop)',
    }}>
      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 40% at 15% 85%, rgba(59,130,246,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 40% 50% at 85% 15%, rgba(139,92,246,0.05) 0%, transparent 55%),
          radial-gradient(ellipse 30% 30% at 50% 50%, rgba(20,30,50,0.3) 0%, transparent 70%)
        `,
      }} />

      {/* Desktop icons — grid */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 80px)',
        gridAutoRows: 'auto',
        gap: 4,
        zIndex: 1,
      }}>
        {APPS.map((app) => (
          <AppIcon
            key={app.id}
            id={app.id}
            label={app.label}
            icon={app.icon}
            gradient={app.gradient}
          />
        ))}
      </div>

      {/* Windows layer */}
      <div style={{ position: 'absolute', inset: 0, bottom: 'var(--taskbar-h)' }}>
        {APPS.map((app) => (
          <Window key={app.id} id={app.id} title={app.title} icon={app.icon}>
            <app.component />
          </Window>
        ))}
      </div>

      {/* Taskbar */}
      <Taskbar apps={APPS} />
    </div>
  )
}
