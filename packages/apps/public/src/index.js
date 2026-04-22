import ProfileApp from './Profile'
import ResumeApp from './Resume'
import ProjectsApp from './Projects'
import BlogApp from './Blog'
import TimelineApp from './Timeline'
import ContactApp from './Contact'
import CalculatorApp from './Calculator'
import MemoApp from './Memo'
import SettingsApp from './Settings'

export const publicApps = [
  { id: 'profile',    title: '프로필',     icon: '👤', label: 'Profile',    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', component: ProfileApp },
  { id: 'resume',     title: '이력서',     icon: '📄', label: 'Resume',     gradient: 'linear-gradient(135deg, #22c55e, #15803d)', component: ResumeApp },
  { id: 'projects',   title: '프로젝트',   icon: '💼', label: 'Projects',   gradient: 'linear-gradient(135deg, #f59e0b, #b45309)', component: ProjectsApp },
  { id: 'blog',       title: '블로그',     icon: '📝', label: 'Blog',       gradient: 'linear-gradient(135deg, #6366f1, #4338ca)', component: BlogApp },
  { id: 'timeline',   title: '타임라인',   icon: '📅', label: 'Timeline',   gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', component: TimelineApp },
  { id: 'contact',    title: '연락처',     icon: '✉', label: 'Contact',    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', component: ContactApp },
  { id: 'calculator', title: '계산기',     icon: '🧮', label: 'Calc',       gradient: 'linear-gradient(135deg, #6b7280, #374151)', component: CalculatorApp },
  { id: 'memo',       title: '메모장',     icon: '📒', label: 'Memo',       gradient: 'linear-gradient(135deg, #fbbf24, #d97706)', component: MemoApp },
  { id: 'settings',   title: '설정',       icon: '⚙', label: 'Settings',   gradient: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', component: SettingsApp },
]
