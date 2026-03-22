import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/shared/PageHeader'
import DataTable from '../../../components/shared/DataTable'
import StatusBadge from '../../../components/shared/StatusBadge'
import { mockPipelines } from '../../../data/mockPipelines'
import type { Pipeline, Column } from '../../../types'

const columns: Column<Pipeline>[] = [
  { key: 'name', label: 'Pipeline', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'scheduler', label: 'Scheduler', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary">{r.scheduler}</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'lastRun', label: 'Last Run' },
  { key: 'duration', label: 'Duration' },
  { key: 'stages', label: 'Stages', render: (r) => <span>{r.stages.length} stages</span> },
]

export default function PipelinesListPage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader title="Pipelines" description="Manage ML training and deployment pipelines" />
      <DataTable
        columns={columns}
        data={mockPipelines}
        onRowClick={(row) => navigate(`/aiops/pipelines/${(row as unknown as Pipeline).id}`)}
      />
    </div>
  )
}
