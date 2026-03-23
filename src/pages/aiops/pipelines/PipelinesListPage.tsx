import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../../components/shared/PageHeader'
import DataTable from '../../../components/shared/DataTable'
import SearchInput from '../../../components/shared/SearchInput'
import StatusBadge from '../../../components/shared/StatusBadge'
import CreatePipelineModal from './CreatePipelineModal'
import { mockPipelines } from '../../../data/mockPipelines'
import type { Pipeline, Column } from '../../../types'

const columns: Column<Pipeline>[] = [
  { key: 'name', label: 'Pipeline', render: (r) => (
    <div>
      <span className="font-medium">{r.name}</span>
      {r.description && <div className="text-xs text-text-muted mt-0.5 truncate max-w-xs">{r.description}</div>}
    </div>
  )},
  { key: 'scheduler', label: 'Scheduler', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary">{r.scheduler}</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'triggerType', label: 'Trigger', render: (r) => (
    <span className={`text-xs px-2 py-0.5 rounded ${
      r.triggerType === 'Schedule' ? 'bg-accent-blue/10 text-accent-blue' :
      r.triggerType === 'Event' ? 'bg-accent-amber/10 text-accent-amber' :
      'bg-bg-tertiary text-text-secondary'
    }`}>{r.triggerType || 'Manual'}</span>
  )},
  { key: 'successRate', label: 'Success Rate', render: (r) => (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 rounded-full bg-bg-tertiary">
        <div className={`h-1.5 rounded-full ${(r.successRate || 0) >= 80 ? 'bg-accent-green' : (r.successRate || 0) >= 50 ? 'bg-accent-amber' : 'bg-accent-red'}`} style={{ width: `${r.successRate || 0}%` }} />
      </div>
      <span className="text-xs text-text-secondary">{r.successRate || 0}%</span>
    </div>
  )},
  { key: 'totalRuns', label: 'Runs', render: (r) => <span className="text-sm">{r.totalRuns || 0}</span> },
  { key: 'avgDuration', label: 'Avg Duration', render: (r) => <span className="text-sm text-text-secondary">{r.avgDuration || '-'}</span> },
  { key: 'stages', label: 'Stages', render: (r) => <span className="text-sm">{r.stages.length}</span> },
]

export default function PipelinesListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filteredPipelines = mockPipelines.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Pipelines"
        description="Manage ML training and deployment pipelines"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Pipeline
          </button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search pipelines..." />
      </div>

      <DataTable
        columns={columns}
        data={filteredPipelines}
        onRowClick={(row) => navigate(`/aiops/pipelines/${(row as unknown as Pipeline).id}`)}
      />

      {showCreate && <CreatePipelineModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
