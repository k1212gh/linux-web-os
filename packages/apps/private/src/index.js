import TerminalApp from './Terminal'
import VSCodeApp from './VSCode'
import ClaudeApp from './Claude'
import ClaudeCodeApp from './ClaudeCode'
import SystemMonitor from './SystemMonitor'
import LLMDashboardApp from './LLMDashboard'
import KasmApp from './Kasm'
import GitDashboardApp from './GitDashboard'
import CICDApp from './CICD'
import InfraDashboardApp from './InfraDashboard'
import DockerApp from './Docker'
import JenkinsApp from './Jenkins'
import GrafanaApp from './Grafana'
import PortainerApp from './Portainer'
import ObsidianViewerApp from './ObsidianViewer'
import FileManagerApp from './FileManager'
import HarnessManagerApp from './HarnessManager'

export const privateApps = [
  { id: 'terminal',      title: 'Terminal',        icon: '⌨',  label: 'Terminal',    gradient: 'linear-gradient(135deg, #0d1117, #161b22)', component: TerminalApp },
  { id: 'vscode',        title: 'VS Code',         icon: '◈',  label: 'VS Code',     gradient: 'linear-gradient(135deg, #007acc, #005b9a)', component: VSCodeApp },
  { id: 'claude',        title: 'AI Chat',         icon: '✦',  label: 'AI Chat',     gradient: 'linear-gradient(135deg, #c47f6b, #8b4513)', component: ClaudeApp },
  { id: 'claude-code',   title: 'Claude Code',     icon: '🤖', label: 'Claude Code', gradient: 'linear-gradient(135deg, #d97706, #92400e)', component: ClaudeCodeApp },
  { id: 'monitor',       title: '시스템 모니터',   icon: '📊', label: 'Monitor',     gradient: 'linear-gradient(135deg, #1a3a5c, #0d2137)', component: SystemMonitor },
  { id: 'llm-dashboard', title: 'LLM 대시보드',    icon: '🧠', label: 'LLM UI',      gradient: 'linear-gradient(135deg, #7c3aed, #4c1d95)', component: LLMDashboardApp },
  { id: 'kasm',          title: '원격 데스크톱',   icon: '🖥', label: 'Desktop',     gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', component: KasmApp },
  { id: 'git',           title: 'Git 대시보드',    icon: '🔀', label: 'Git',         gradient: 'linear-gradient(135deg, #f97316, #c2410c)', component: GitDashboardApp },
  { id: 'cicd',          title: 'CI/CD',           icon: '🔨', label: 'CI/CD',       gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)', component: CICDApp },
  { id: 'infra',         title: '인프라',          icon: '🏗', label: 'Infra',       gradient: 'linear-gradient(135deg, #0ea5e9, #0369a1)', component: InfraDashboardApp },
  { id: 'docker',        title: 'Docker',          icon: '🐳', label: 'Docker',      gradient: 'linear-gradient(135deg, #2496ed, #1d6fa5)', component: DockerApp },
  { id: 'jenkins',       title: 'Jenkins',         icon: '⚙',  label: 'Jenkins',     gradient: 'linear-gradient(135deg, #d33833, #a1201b)', component: JenkinsApp },
  { id: 'grafana',       title: 'Grafana',         icon: '📊', label: 'Grafana',     gradient: 'linear-gradient(135deg, #f46800, #a04100)', component: GrafanaApp },
  { id: 'portainer',     title: 'Portainer',       icon: '🐋', label: 'Portainer',   gradient: 'linear-gradient(135deg, #13bef9, #0275d8)', component: PortainerApp },
  { id: 'obsidian',      title: 'Obsidian',        icon: '🗒', label: 'Obsidian',    gradient: 'linear-gradient(135deg, #6b46c1, #4c1d95)', component: ObsidianViewerApp },
  { id: 'filemanager',   title: '파일 관리자',     icon: '📂', label: 'Files',       gradient: 'linear-gradient(135deg, #eab308, #a16207)', component: FileManagerApp },
  { id: 'harness',       title: '하네스',          icon: '🔧', label: 'Harness',     gradient: 'linear-gradient(135deg, #a855f7, #7e22ce)', component: HarnessManagerApp },
]
