import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  Box,
  Rocket,
  GitBranch,
  FlaskConical,
  Terminal,
  Settings,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',       path: '/dashboard',         icon: LayoutDashboard },
  { label: 'Clusters',        path: '/clusters',           icon: Server },
  { label: 'ML Engineering',  path: '/ml-engineering',     icon: FlaskConical },
  { label: 'Model Catalog',   path: '/aiops/models',       icon: Box },
  { label: 'Pipelines',       path: '/aiops/pipelines',    icon: GitBranch },
  { label: 'Inference',       path: '/aiops/inference',    icon: Rocket },
  { label: 'Terminal',        path: '/terminal',           icon: Terminal },
  { label: 'Settings',        path: '/settings',           icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-bg-secondary border-r border-border flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent-purple" />
        </div>
        <span className="text-lg font-semibold text-text-primary">Kubogent</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Kubogent Intelligence Status */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs text-text-secondary">Kubogent Intelligence</span>
          <span className="text-xs text-accent-green ml-auto">Active</span>
        </div>
      </div>
    </aside>
  )
}
