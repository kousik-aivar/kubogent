import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  Box,
  Rocket,
  GitBranch,
  FlaskConical,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { label: 'Dashboard',     path: '/dashboard',       icon: LayoutDashboard },
  { label: 'Workbench',     path: '/workbench',        icon: FlaskConical },
  { label: 'Model Catalog', path: '/aiops/models',     icon: Box },
  { label: 'Pipelines',     path: '/aiops/pipelines',  icon: GitBranch },
  { label: 'Inference',     path: '/aiops/inference',  icon: Rocket },
  { label: 'Clusters',      path: '/clusters',         icon: Server },
  { label: 'Settings',      path: '/settings',         icon: Settings },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } h-screen bg-bg-secondary border-r border-border flex flex-col fixed left-0 top-0 z-50 transition-[width] duration-200 overflow-hidden`}
    >
      {/* Logo + collapse toggle */}
      <div
        className={`flex items-center py-5 flex-shrink-0 ${
          collapsed ? 'justify-center px-4' : 'justify-between px-5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-accent-purple" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-text-primary truncate">Kubogent</span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
        )}
      </div>

      {/* Expand button — shown only when collapsed */}
      {collapsed && (
        <div className="flex justify-center mb-2 flex-shrink-0">
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              collapsed
                ? `flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent-blue/20 text-accent-blue'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }`
                : `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Search + Notifications */}
      <div className="px-2 py-2 border-t border-border flex-shrink-0 space-y-1">
        <button
          title={collapsed ? 'Search' : undefined}
          aria-label="Search"
          className={
            collapsed
              ? 'flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors'
              : 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors'
          }
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Search</span>}
        </button>
        <button
          title={collapsed ? 'Notifications' : undefined}
          aria-label="Notifications"
          className={
            collapsed
              ? 'flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors'
              : 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors'
          }
        >
          <div className="relative flex-shrink-0">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-red" />
          </div>
          {!collapsed && <span>Notifications</span>}
        </button>
      </div>

      {/* User profile + Intelligence status */}
      <div
        className={`px-4 py-4 border-t border-border flex-shrink-0 ${
          collapsed ? 'flex flex-col items-center gap-3' : ''
        }`}
      >
        {collapsed ? (
          <>
            <div
              title="Kousik Ravi — admin@kubogent.ai"
              className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-xs font-medium text-accent-purple"
            >
              KR
            </div>
            <div
              title="Kubogent Intelligence — Active"
              className="w-2 h-2 rounded-full bg-accent-green animate-pulse"
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-xs font-medium text-accent-purple flex-shrink-0">
                KR
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">Kousik Ravi</div>
                <div className="text-xs text-text-muted truncate">admin@kubogent.ai</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs text-text-secondary">Kubogent Intelligence</span>
              <span className="text-xs text-accent-green ml-auto">Active</span>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
