import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import DataTable from '../../components/shared/DataTable'
import StatusBadge from '../../components/shared/StatusBadge'
import { mockLogEntries, mockKubeEvents } from '../../data/mockMonitoring'
import type { KubernetesEvent, Column } from '../../types'

const severityColors: Record<string, string> = {
  info: 'text-accent-cyan',
  warn: 'text-accent-amber',
  error: 'text-accent-red',
  debug: 'text-text-muted',
}

const eventColumns: Column<KubernetesEvent>[] = [
  { key: 'type', label: 'Type', render: (r) => <StatusBadge status={r.type} /> },
  { key: 'reason', label: 'Reason', render: (r) => <span className="font-medium text-sm">{r.reason}</span> },
  { key: 'object', label: 'Object', render: (r) => <span className="font-mono text-xs text-accent-blue">{r.object}</span> },
  { key: 'message', label: 'Message', render: (r) => <span className="text-xs text-text-secondary">{r.message}</span> },
  { key: 'count', label: 'Count' },
  { key: 'lastSeen', label: 'Last Seen', render: (r) => <span className="text-xs text-text-muted">{r.lastSeen}</span> },
]

export default function LogsEventsTab() {
  const [subTab, setSubTab] = useState<'logs' | 'events'>('logs')
  const [nsFilter, setNsFilter] = useState('all')
  const [sevFilter, setSevFilter] = useState('all')
  const [search, setSearch] = useState('')

  const namespaces = ['all', ...new Set(mockLogEntries.map(l => l.namespace))]

  const filteredLogs = mockLogEntries.filter(log => {
    if (nsFilter !== 'all' && log.namespace !== nsFilter) return false
    if (sevFilter !== 'all' && log.severity !== sevFilter) return false
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.pod.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Sub-tab toggle */}
      <div className="flex gap-1 bg-bg-secondary border border-border rounded-lg p-1 w-fit">
        {(['logs', 'events'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              subTab === t ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {subTab === 'logs' && (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-3">
            <select
              value={nsFilter}
              onChange={(e) => setNsFilter(e.target.value)}
              className="bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              {namespaces.map(ns => (
                <option key={ns} value={ns}>{ns === 'all' ? 'All Namespaces' : ns}</option>
              ))}
            </select>
            <select
              value={sevFilter}
              onChange={(e) => setSevFilter(e.target.value)}
              className="bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value="all">All Severities</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
              />
            </div>
            <button className="p-2 rounded-lg bg-bg-tertiary border border-border hover:bg-bg-elevated text-text-secondary transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Log viewer */}
          <div className="bg-bg-primary border border-border rounded-xl p-4 font-mono text-xs max-h-[600px] overflow-y-auto space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="text-text-muted text-center py-8">No logs match the current filters</div>
            ) : (
              filteredLogs.map((log, i) => (
                <div key={i} className="flex gap-2 py-0.5 hover:bg-bg-tertiary/50 rounded px-1">
                  <span className="text-text-muted whitespace-nowrap shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`uppercase font-bold w-12 shrink-0 ${severityColors[log.severity]}`}>
                    {log.severity.slice(0, 4)}
                  </span>
                  <span className="text-accent-blue shrink-0 whitespace-nowrap">
                    [{log.namespace}/{log.pod}]
                  </span>
                  <span className={`text-text-primary ${log.severity === 'error' ? 'text-accent-red' : ''}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="text-xs text-text-muted">
            Showing {filteredLogs.length} of {mockLogEntries.length} log entries
          </div>
        </>
      )}

      {subTab === 'events' && (
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Kubernetes Events</h3>
          <DataTable columns={eventColumns} data={mockKubeEvents} />
        </div>
      )}
    </div>
  )
}
