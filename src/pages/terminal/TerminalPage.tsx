import { useState } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import KubectlTerminal from '../../components/terminal/KubectlTerminal'
import { mockClusters } from '../../data/mockClusters'

const namespaces = ['default', 'kube-system', 'kube-public', 'ml-serving', 'monitoring', 'cert-manager']

export default function TerminalPage() {
  const [selectedCluster, setSelectedCluster] = useState(mockClusters[0]?.name || 'eks-prod-us-east-1')
  const [selectedNamespace, setSelectedNamespace] = useState('default')

  return (
    <div>
      <PageHeader
        title="Terminal"
        description="kubectl console for cluster management"
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Cluster:</label>
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
          >
            {mockClusters.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Namespace:</label>
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
          >
            {namespaces.map((ns) => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
        </div>
      </div>

      <KubectlTerminal
        key={`${selectedCluster}-${selectedNamespace}`}
        clusterName={selectedCluster}
        namespace={selectedNamespace}
      />
    </div>
  )
}
