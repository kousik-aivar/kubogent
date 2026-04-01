import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../../components/shared/PageHeader'
import SearchInput from '../../../components/shared/SearchInput'
import DataTable from '../../../components/shared/DataTable'
import StatusBadge from '../../../components/shared/StatusBadge'
import { mockDeployments } from '../../../data/mockDeployments'
import type { Deployment, Column } from '../../../types'

const columns: Column<Deployment>[] = [
  { key: 'modelName', label: 'Model', render: (r) => (
    <div>
      <span className="font-medium">{r.modelName}</span>
      {r.modelVersion && <span className="text-xs text-text-muted ml-1.5">{r.modelVersion}</span>}
    </div>
  )},
  { key: 'pipelineName', label: 'Pipeline', render: (r) => r.pipelineName ? (
    <span className="text-xs px-2 py-0.5 rounded bg-accent-purple/10 text-accent-purple">{r.pipelineName.split(' ').slice(0, 2).join(' ')}</span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded bg-accent-green/10 text-accent-green">Direct</span>
  )},
  { key: 'clusterName', label: 'Cluster', render: (r) => <span className="text-text-secondary text-xs">{r.clusterName}</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'endpointUrl', label: 'Endpoint', render: (r) => r.status === 'Running' ? <span className="font-mono text-xs text-accent-blue truncate max-w-40 block">{r.endpointUrl}</span> : <span className="text-text-muted text-xs">-</span> },
  { key: 'avgLatencyMs', label: 'Latency', render: (r) => r.avgLatencyMs > 0 ? <span>{r.avgLatencyMs}ms</span> : <span className="text-text-muted">-</span> },
  { key: 'throughputTokensPerSec', label: 'Throughput', render: (r) => r.throughputTokensPerSec > 0 ? <span>{r.throughputTokensPerSec} tok/s</span> : <span className="text-text-muted">-</span> },
  { key: 'successRate', label: 'Success', render: (r) => r.successRate > 0 ? <span className="text-accent-green">{r.successRate}%</span> : <span className="text-text-muted">-</span> },
  { key: 'lastUpdated', label: 'Updated', render: (r) => <span className="text-xs text-text-muted">{r.lastUpdated || r.createdAt}</span> },
]

export default function DeploymentsListPage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = mockDeployments.filter((d) =>
    d.modelName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Inference"
        description="Live model serving endpoints across clusters"
        actions={
          <button onClick={() => navigate('/aiops/inference/new')} className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors">
            <Plus className="w-4 h-4" /> New Inference
          </button>
        }
      />
      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search inference..." />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/aiops/inference/${(row as unknown as Deployment).id}`)}
      />
    </div>
  )
}
