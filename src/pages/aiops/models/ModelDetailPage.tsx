import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Rocket } from 'lucide-react'
import StatusBadge from '../../../components/shared/StatusBadge'
import { mockModels } from '../../../data/mockModels'
import { mockDeployments } from '../../../data/mockDeployments'

export default function ModelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const model = mockModels.find((m) => m.id === id)
  const deployments = mockDeployments.filter((d) => d.modelId === id)

  if (!model) return <div className="text-text-muted">Model not found</div>

  return (
    <div>
      <Link to="/aiops/models" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Models
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-text-primary">{model.name}</h1>
          <StatusBadge status={model.status} />
        </div>
        <button onClick={() => navigate('/aiops/deployments/new')} className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white rounded-lg text-sm font-medium hover:bg-accent-green/90 transition-colors">
          <Rocket className="w-4 h-4" /> Deploy Model
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Model Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Source</span><span>{model.source}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Architecture</span><span className="font-mono text-xs">{model.architecture}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Parameters</span><span>{model.parameters}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Size</span><span>{model.size}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Version</span><span>{model.version}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Quantization</span><span>{model.quantization || 'None'}</span></div>
            <div className="flex justify-between py-2"><span className="text-text-secondary">Last Updated</span><span>{model.lastUpdated}</span></div>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-3">Description</h3>
          <p className="text-sm text-text-secondary">{model.description}</p>
        </div>
      </div>

      {deployments.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Active Deployments</h3>
          <div className="space-y-2">
            {deployments.map((dep) => (
              <Link key={dep.id} to={`/aiops/deployments/${dep.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-tertiary transition-colors">
                <div className="flex items-center gap-3">
                  <StatusBadge status={dep.status} />
                  <span className="text-sm text-text-primary">{dep.clusterName}</span>
                  <span className="text-xs text-text-muted">{dep.servingFramework}</span>
                </div>
                <span className="text-xs text-text-secondary font-mono">{dep.endpointUrl}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
