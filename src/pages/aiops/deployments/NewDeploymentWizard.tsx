import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import StepWizard from '../../../components/shared/StepWizard'
import PageHeader from '../../../components/shared/PageHeader'
import StatusBadge from '../../../components/shared/StatusBadge'
import DeploymentPathStep, { type DeploymentPath } from './DeploymentPathStep'
import PipelineConfigStep, { type PipelineDeployConfig } from './PipelineConfigStep'
import { mockModels } from '../../../data/mockModels'
import { mockClusters } from '../../../data/mockClusters'

function SelectModelStep({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const available = mockModels.filter((m) => m.status === 'Available')
  return (
    <div>
      <h3 className="text-lg font-medium text-text-primary mb-4">Select Model</h3>
      <div className="grid grid-cols-2 gap-3">
        {available.map((m) => (
          <button key={m.id} onClick={() => onSelect(m.id)} className={`text-left p-4 rounded-xl border transition-colors ${selected === m.id ? 'border-accent-blue bg-accent-blue/5' : 'border-border bg-bg-secondary hover:border-border-light'}`}>
            <div className="text-sm font-medium text-text-primary">{m.name}</div>
            <div className="text-xs text-text-muted mt-1">{m.parameters} params · {m.size} · {m.source}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SelectClusterStep({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const running = mockClusters.filter((c) => c.status === 'Running')
  return (
    <div>
      <h3 className="text-lg font-medium text-text-primary mb-4">Select Cluster</h3>
      <div className="grid grid-cols-2 gap-3">
        {running.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)} className={`text-left p-4 rounded-xl border transition-colors ${selected === c.id ? 'border-accent-blue bg-accent-blue/5' : 'border-border bg-bg-secondary hover:border-border-light'}`}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">{c.name}</span>
              <StatusBadge status={c.status} />
            </div>
            <div className="text-xs text-text-muted mt-1">{c.region} · {c.gpuCount} {c.gpuType} · ${c.costPerHour}/hr</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function IntelligencePanel({ onApply, deploymentPath, pipelineConfig }: { onApply: () => void; deploymentPath: DeploymentPath; pipelineConfig: PipelineDeployConfig }) {
  const isPipeline = deploymentPath === 'pipeline'
  return (
    <div className="border-2 border-accent-purple/30 rounded-xl p-6 bg-gradient-to-br from-accent-purple/5 to-transparent">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent-purple" />
        <h3 className="text-lg font-medium text-accent-purple">Kubogent Intelligence</h3>
      </div>
      <p className="text-sm text-text-secondary mb-4">
        {isPipeline
          ? 'Based on model size (70B) and pipeline configuration, here are our recommendations:'
          : 'Based on the model size (70B parameters) and target latency of <500ms, here are our recommendations:'}
      </p>
      <div className={`grid ${isPipeline ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'} gap-3 mb-4`}>
        {isPipeline && (
          <div className="bg-bg-secondary border border-border rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Pipeline Duration</div>
            <div className="text-sm font-medium text-text-primary">~2h 10m</div>
            <div className="text-xs text-accent-cyan mt-1">{pipelineConfig.templateId === 'tpl-1' ? '6 stages' : '4 stages'}</div>
          </div>
        )}
        <div className="bg-bg-secondary border border-border rounded-lg p-3">
          <div className="text-xs text-text-muted mb-1">Recommended GPU</div>
          <div className="text-sm font-medium text-text-primary">NVIDIA A100</div>
          <div className="text-xs text-accent-green mt-1">92% confidence</div>
        </div>
        <div className="bg-bg-secondary border border-border rounded-lg p-3">
          <div className="text-xs text-text-muted mb-1">Optimal Replicas</div>
          <div className="text-sm font-medium text-text-primary">4 replicas</div>
          <div className="text-xs text-accent-green mt-1">For 25 concurrent users</div>
        </div>
        <div className="bg-bg-secondary border border-border rounded-lg p-3">
          <div className="text-xs text-text-muted mb-1">Est. Latency</div>
          <div className="text-sm font-medium text-text-primary">410ms TTFT</div>
          <div className="text-xs text-accent-amber mt-1">P95: 520ms</div>
        </div>
        <div className="bg-bg-secondary border border-border rounded-lg p-3">
          <div className="text-xs text-text-muted mb-1">Est. Cost</div>
          <div className="text-sm font-medium text-text-primary">{isPipeline ? '$52.80/hr' : '$47.20/hr'}</div>
          <div className="text-xs text-accent-blue mt-1">{isPipeline ? 'incl. pipeline GPU' : '$0.41/user/hr'}</div>
        </div>
      </div>
      <button onClick={onApply} className="px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-medium hover:bg-accent-purple/90 transition-colors">
        Apply Recommendations
      </button>
    </div>
  )
}

function ReviewStep({ modelId, clusterId, deploymentPath, pipelineConfig }: { modelId: string | null; clusterId: string | null; deploymentPath: DeploymentPath; pipelineConfig: PipelineDeployConfig }) {
  const model = mockModels.find((m) => m.id === modelId)
  const cluster = mockClusters.find((c) => c.id === clusterId)
  const isPipeline = deploymentPath === 'pipeline'
  const template = pipelineConfig.templateId ? { 'tpl-1': 'LoRA Fine-Tuning', 'tpl-2': 'Evaluation', 'tpl-3': 'Data Processing', 'tpl-4': 'Full Lifecycle' }[pipelineConfig.templateId] || 'Custom' : '-'

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-3">
      <h3 className="text-lg font-medium text-text-primary">Review & Deploy</h3>
      <div className="text-sm space-y-2">
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Model</span><span>{model?.name || '-'}</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Deployment Path</span><span className={isPipeline ? 'text-accent-purple' : 'text-accent-green'}>{isPipeline ? 'Pipeline Deploy' : 'Direct Deploy'}</span></div>
        {isPipeline && (
          <>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Pipeline Template</span><span>{template}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Trigger</span><span>{pipelineConfig.trigger === 'once' ? 'Run Once' : pipelineConfig.trigger === 'schedule' ? `Scheduled (${pipelineConfig.schedule})` : 'Event-Driven'}</span></div>
            {pipelineConfig.dataSource && <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Data Source</span><span className="font-mono text-xs">{pipelineConfig.dataSource}</span></div>}
          </>
        )}
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Cluster</span><span>{cluster?.name || '-'}</span></div>
        <div className="flex justify-between py-2"><span className="text-text-secondary">Est. Cost</span><span className="text-accent-blue">{isPipeline ? '$52.80/hr' : '$47.20/hr'}</span></div>
      </div>
      {isPipeline && (
        <div className="mt-4 p-3 bg-bg-tertiary rounded-lg">
          <div className="text-xs text-text-muted mb-1">Estimated Timeline</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-accent-purple/10 text-accent-purple">Pipeline: ~2h</span>
            <span className="text-text-muted">→</span>
            <span className="px-2 py-0.5 rounded bg-accent-green/10 text-accent-green">Deploy: ~5m</span>
            <span className="text-text-muted">→</span>
            <span className="px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan">Monitor: 1h</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewDeploymentWizard() {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [modelId, setModelId] = useState<string | null>(null)
  const [clusterId, setClusterId] = useState<string | null>(null)
  const [deploymentPath, setDeploymentPath] = useState<DeploymentPath>(null)
  const [pipelineConfig, setPipelineConfig] = useState<PipelineDeployConfig>({
    templateId: null, trigger: 'once', schedule: '0 8 * * 1', eventSource: 'data_drift', dataSource: '', params: {},
  })

  const isPipeline = deploymentPath === 'pipeline'

  const steps = useMemo(() => {
    const base = [
      { label: 'Model', content: <SelectModelStep selected={modelId} onSelect={setModelId} /> },
      { label: 'Path', content: <DeploymentPathStep selected={deploymentPath} onSelect={setDeploymentPath} /> },
    ]

    if (isPipeline) {
      base.push({ label: 'Pipeline', content: <PipelineConfigStep config={pipelineConfig} onChange={setPipelineConfig} /> })
    }

    base.push(
      { label: 'Cluster', content: <SelectClusterStep selected={clusterId} onSelect={setClusterId} /> },
      { label: 'Intelligence', content: <IntelligencePanel onApply={() => {}} deploymentPath={deploymentPath} pipelineConfig={pipelineConfig} /> },
      { label: 'Review', content: <ReviewStep modelId={modelId} clusterId={clusterId} deploymentPath={deploymentPath} pipelineConfig={pipelineConfig} /> },
    )

    return base
  }, [modelId, clusterId, deploymentPath, isPipeline, pipelineConfig])

  return (
    <div>
      <Link to="/aiops/deployments" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Deployments
      </Link>
      <PageHeader title="New Deployment" description="Deploy a model to a cluster" />
      <StepWizard
        steps={steps}
        currentStep={step}
        onNext={() => setStep(step + 1)}
        onBack={() => setStep(step - 1)}
        onComplete={() => setCompleted(true)}
        isCompleted={completed}
        completedMessage={isPipeline ? 'Pipeline & Deployment Initiated Successfully!' : 'Deployment Initiated Successfully!'}
      />
    </div>
  )
}
