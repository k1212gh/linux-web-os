import { useEffect } from 'react'
import { useWindowStore } from '../store/windowStore'
import AppIcon from './AppIcon'
import Taskbar from './Taskbar'
import Window from './Window'
import ErrorBoundary from './ErrorBoundary'
import TerminalApp from './apps/Terminal'
import VSCodeApp from './apps/VSCode'
import ClaudeApp from './apps/Claude'
import SystemMonitor from './apps/SystemMonitor'
import KasmApp from './apps/Kasm'
import SettingsApp from './apps/Settings'

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
      height: '100dvh',
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

      {/* Desktop icons — left column */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
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
            <ErrorBoundary scope="window">
              <app.component />
            </ErrorBoundary>
          </Window>
        ))}
      </div>

      {/* Taskbar */}
      <Taskbar apps={APPS} />
    </div>
  )
}
