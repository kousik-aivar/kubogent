import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StepWizard from '../../../components/shared/StepWizard'
import PageHeader from '../../../components/shared/PageHeader'
import StatusBadge from '../../../components/shared/StatusBadge'
import DeploymentPathStep, { type DeploymentPath } from './DeploymentPathStep'
import PipelineConfigStep, { type PipelineDeployConfig } from './PipelineConfigStep'
import InferenceEngineStep from '../pipelines/create/InferenceEngineStep'
import { mockModels } from '../../../data/mockModels'
import { mockClusters } from '../../../data/mockClusters'
import type { InferenceEngine, InferenceEngineConfig } from '../../../types'

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

function ReviewStep({ modelId, clusterId, deploymentPath, pipelineConfig, inferenceEngine, engineConfig }: {
  modelId: string | null
  clusterId: string | null
  deploymentPath: DeploymentPath
  pipelineConfig: PipelineDeployConfig
  inferenceEngine: InferenceEngine | null
  engineConfig: InferenceEngineConfig | null
}) {
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
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Inference Engine</span>
          {inferenceEngine
            ? <span className="text-accent-blue font-medium">{inferenceEngine}</span>
            : <span className="text-text-muted">—</span>}
        </div>
        {engineConfig && Object.keys(engineConfig.params).length > 0 && (
          <div className="py-2 border-b border-border">
            <p className="text-text-secondary mb-2">Engine Parameters</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {Object.entries(engineConfig.params).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-text-muted font-mono">{k}</span>
                  <span className="text-text-primary font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Cluster</span><span>{cluster?.name || '-'}</span></div>
        <div className="flex justify-between py-2"><span className="text-text-secondary">Est. Cost</span><span className="text-accent-blue">{isPipeline ? '$52.80/hr' : '$47.20/hr'}</span></div>
      </div>
    </div>
  )
}

export default function NewDeploymentWizard() {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [modelId, setModelId] = useState<string | null>(null)
  const [clusterId, setClusterId] = useState<string | null>(null)
  const [deploymentPath, setDeploymentPath] = useState<DeploymentPath>(null)
  const [inferenceEngine, setInferenceEngine] = useState<InferenceEngine | null>(null)
  const [engineConfig, setEngineConfig] = useState<InferenceEngineConfig | null>(null)
  const [pipelineConfig, setPipelineConfig] = useState<PipelineDeployConfig>({
    templateId: null, trigger: 'once', schedule: '0 8 * * 1', eventSource: 'data_drift', dataSource: '', params: {},
  })

  const isPipeline = deploymentPath === 'pipeline'

  function handleEngineSelect(engine: InferenceEngine, config: InferenceEngineConfig) {
    setInferenceEngine(engine)
    setEngineConfig(config)
  }

  const steps = useMemo(() => {
    const base = [
      { label: 'Model', content: <SelectModelStep selected={modelId} onSelect={setModelId} /> },
      { label: 'Path', content: <DeploymentPathStep selected={deploymentPath} onSelect={setDeploymentPath} /> },
    ]

    if (isPipeline) {
      base.push({ label: 'Pipeline', content: <PipelineConfigStep config={pipelineConfig} onChange={setPipelineConfig} /> })
    }

    base.push(
      { label: 'Engine', content: <InferenceEngineStep modelId={modelId} selectedEngine={inferenceEngine} engineConfig={engineConfig} onSelect={handleEngineSelect} /> },
      { label: 'Cluster', content: <SelectClusterStep selected={clusterId} onSelect={setClusterId} /> },
      { label: 'Review', content: <ReviewStep modelId={modelId} clusterId={clusterId} deploymentPath={deploymentPath} pipelineConfig={pipelineConfig} inferenceEngine={inferenceEngine} engineConfig={engineConfig} /> },
    )

    return base
  }, [modelId, clusterId, deploymentPath, isPipeline, pipelineConfig, inferenceEngine, engineConfig])

  return (
    <div>
      <Link to="/aiops/inference" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Inference
      </Link>
      <PageHeader title="New Inference Deployment" description="Deploy a model to a cluster for serving" />
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
