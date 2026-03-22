import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SearchInput from '../../components/shared/SearchInput'
import DataTable from '../../components/shared/DataTable'
import StatusBadge from '../../components/shared/StatusBadge'
import { mockClusters } from '../../data/mockClusters'
import type { Cluster, Column } from '../../types'

const columns: Column<Cluster>[] = [
  { key: 'name', label: 'Cluster Name', render: (row) => <span className="font-medium">{row.name}</span> },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'region', label: 'Region' },
  { key: 'k8sVersion', label: 'K8s Version' },
  { key: 'nodeCount', label: 'Nodes' },
  { key: 'gpuCount', label: 'GPUs', render: (row) => <span>{row.gpuCount} <span className="text-text-muted text-xs">({row.gpuType})</span></span> },
  { key: 'costPerHour', label: 'Cost/hr', render: (row) => <span>${row.costPerHour.toFixed(2)}</span> },
]

export default function ClustersListPage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = mockClusters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Clusters"
        description="Manage your EKS clusters"
        actions={
          <button
            onClick={() => navigate('/clusters/new')}
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Cluster
          </button>
        }
      />
      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search clusters..." />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/clusters/${(row as unknown as Cluster).id}`)}
      />
    </div>
  )
}
