import { Link } from 'react-router-dom'
import { Database, GitBranch, Box, Rocket, Globe, ArrowRight } from 'lucide-react'
import type { Deployment } from '../../../types'
import { mockModels } from '../../../data/mockModels'

function LineageNode({ icon: Icon, title, subtitle, link, color, active }: { icon: typeof Database; title: string; subtitle: string; link?: string; color: string; active?: boolean }) {
  const content = (
    <div className={`bg-bg-secondary border ${active ? `border-${color}` : 'border-border'} rounded-xl p-4 w-48 transition-colors ${link ? 'hover:border-border-light cursor-pointer' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2`} style={{ backgroundColor: `var(--color-${color})10` }}>
        <Icon className="w-4 h-4" style={{ color: `var(--color-${color})` }} />
      </div>
      <div className="text-sm font-medium text-text-primary">{title}</div>
      <div className="text-xs text-text-muted mt-0.5">{subtitle}</div>
    </div>
  )

  if (link) {
    return <Link to={link}>{content}</Link>
  }
  return content
}

function LineageArrow() {
  return (
    <div className="flex items-center px-2">
      <div className="w-8 h-px bg-accent-green" />
      <ArrowRight className="w-4 h-4 text-accent-green -ml-1" />
    </div>
  )
}

export default function DeploymentLineageTab({ deployment }: { deployment: Deployment }) {
  const model = mockModels.find(m => m.id === deployment.modelId)
  const isPipeline = !!deployment.pipelineId

  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <h3 className="text-sm font-medium text-text-primary mb-6">Deployment Lineage</h3>

        <div className="flex items-center justify-center flex-wrap gap-0">
          {/* Source */}
          <LineageNode
            icon={Database}
            title={model?.source || 'Unknown'}
            subtitle={model?.source === 'HuggingFace' ? 'meta-llama/...' : model?.source === 'S3' ? 's3://kubogent-models/' : model?.source || ''}
            color="accent-blue"
          />
          <LineageArrow />

          {/* Model */}
          <LineageNode
            icon={Box}
            title={deployment.modelName}
            subtitle={`${model?.parameters || ''} · ${model?.size || ''}`}
            link={`/aiops/models/${deployment.modelId}`}
            color="accent-amber"
          />
          <LineageArrow />

          {/* Pipeline (if applicable) */}
          {isPipeline && (
            <>
              <LineageNode
                icon={GitBranch}
                title={deployment.pipelineName || 'Pipeline'}
                subtitle={`Run ${deployment.pipelineRunId?.replace('run-', '#') || ''}`}
                link={`/aiops/pipelines/${deployment.pipelineId}`}
                color="accent-purple"
              />
              <LineageArrow />
            </>
          )}

          {/* Model Version */}
          <LineageNode
            icon={Box}
            title={`${deployment.modelName.split('-')[0]} ${deployment.modelVersion || ''}`}
            subtitle={isPipeline ? 'Fine-tuned model' : 'Base model'}
            color="accent-green"
            active
          />
          <LineageArrow />

          {/* Deployment */}
          <LineageNode
            icon={Rocket}
            title={deployment.clusterName}
            subtitle={`${deployment.servingFramework} · ${deployment.replicas}x replicas`}
            color="accent-cyan"
          />
          <LineageArrow />

          {/* Endpoint */}
          <LineageNode
            icon={Globe}
            title="Endpoint"
            subtitle={deployment.status === 'Running' ? deployment.endpointUrl.replace('https://', '').split('/')[0] : deployment.status}
            color="accent-green"
            active={deployment.status === 'Running'}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <h3 className="text-sm font-medium text-text-primary mb-4">Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-blue" />
            <div className="text-xs text-text-muted w-32">Model imported</div>
            <div className="text-xs text-text-secondary">{model?.lastUpdated || deployment.createdAt}</div>
          </div>
          {isPipeline && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-purple" />
                <div className="text-xs text-text-muted w-32">Pipeline started</div>
                <div className="text-xs text-text-secondary">{deployment.lastUpdated || deployment.createdAt}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-purple" />
                <div className="text-xs text-text-muted w-32">Pipeline completed</div>
                <div className="text-xs text-text-secondary">{deployment.lastUpdated || deployment.createdAt}</div>
              </div>
            </>
          )}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-green" />
            <div className="text-xs text-text-muted w-32">Deployed</div>
            <div className="text-xs text-text-secondary">{deployment.createdAt}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${deployment.status === 'Running' ? 'bg-accent-green animate-pulse' : 'bg-accent-red'}`} />
            <div className="text-xs text-text-muted w-32">Current status</div>
            <div className="text-xs text-text-secondary">{deployment.status}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
