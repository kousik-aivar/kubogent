import StatusBadge from '../../../../components/shared/StatusBadge'
import { mockClusters } from '../../../../data/mockClusters'

interface ClusterStepProps {
  selectedClusterId: string | null
  onSelect: (id: string) => void
}

export default function ClusterStep({ selectedClusterId, onSelect }: ClusterStepProps) {
  const running = mockClusters.filter((c) => c.status === 'Running')

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Select Cluster</h3>
      <p className="text-sm text-text-secondary mb-5">Pick the Kubernetes cluster to deploy the inference endpoint.</p>
      <div className="grid grid-cols-2 gap-3">
        {running.map((c) => {
          const isSelected = selectedClusterId === c.id
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${
                isSelected
                  ? 'border-accent-blue bg-accent-blue/5'
                  : 'border-border bg-bg-secondary hover:border-border-light'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">{c.name}</span>
                <StatusBadge status={c.status} />
              </div>
              <div className="text-xs text-text-muted space-y-0.5">
                <div>{c.region}</div>
                <div>{c.gpuCount}× {c.gpuType}</div>
                <div className="text-accent-blue">${c.costPerHour}/hr</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
