import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  clusters: 'Clusters',
  aiops: 'AIOps',
  models: 'Models',
  deployments: 'Deployments',
  pipelines: 'Pipelines',
  'ml-engineering': 'ML Engineering',
  settings: 'Settings',
  new: 'New',
}

export default function Topbar() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  return (
    <header className="h-16 bg-bg-secondary border-b border-border flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {segments.map((seg, i) => {
          const label = breadcrumbMap[seg] || seg
          const isLast = i === segments.length - 1
          return (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-text-muted">/</span>}
              <span className={isLast ? 'text-text-primary font-medium' : 'text-text-secondary'}>
                {label}
              </span>
            </span>
          )
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
          <Search className="w-4 h-4 text-text-secondary" />
        </button>
        <button className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors relative">
          <Bell className="w-4 h-4 text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-red" />
        </button>
        <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-xs font-medium text-accent-purple">
          KR
        </div>
      </div>
    </header>
  )
}
