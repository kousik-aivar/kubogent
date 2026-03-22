import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import StepWizard from '../../../components/shared/StepWizard'
import PageHeader from '../../../components/shared/PageHeader'
import StatusBadge from '../../../components/shared/StatusBadge'
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

function ServingConfigStep({ config, onChange }: { config: { framework: string; gpus: number; replicas: number; autoscale: boolean }; onChange: (c: typeof config) => void }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-5">
      <h3 className="text-lg font-medium text-text-primary">Serving Configuration</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Serving Framework</label>
          <select value={config.framework} onChange={(e) => onChange({ ...config, framework: e.target.value })} className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary">
            <option>vLLM</option><option>Ray Serve</option><option>Triton</option><option>TensorRT-LLM</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">GPU Allocation</label>
          <input type="range" min={1} max={16} value={config.gpus} onChange={(e) => onChange({ ...config, gpus: Number(e.target.value) })} className="w-full" />
          <div className="text-xs text-text-muted mt-1">{config.gpus} GPUs</div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Replicas</label>
          <input type="number" min={1} max={8} value={config.replicas} onChange={(e) => onChange({ ...config, replicas: Number(e.target.value) })} className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary">Autoscaling</label>
          <button onClick={() => onChange({ ...config, autoscale: !config.autoscale })} className={`w-10 h-5 rounded-full relative transition-colors ${config.autoscale ? 'bg-accent-green' : 'bg-bg-tertiary'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${config.autoscale ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

function IntelligencePanel({ onApply }: { onApply: () => void }) {
  return (
    <div className="border-2 border-accent-purple/30 rounded-xl p-6 bg-gradient-to-br from-accent-purple/5 to-transparent">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent-purple" />
        <h3 className="text-lg font-medium text-accent-purple">Kubogent Intelligence</h3>
      </div>
      <p className="text-sm text-text-secondary mb-4">
        Based on the model size (70B parameters) and target latency of &lt;500ms, here are our recommendations:
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
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
          <div className="text-sm font-medium text-text-primary">$47.20/hr</div>
          <div className="text-xs text-accent-blue mt-1">$0.41/user/hr</div>
        </div>
      </div>
      <div className="bg-bg-secondary border border-border rounded-lg p-3 mb-4 text-xs text-text-secondary">
        <strong className="text-text-primary">Reasoning:</strong> With tensor_parallel_size=4 on A100 GPUs, the model fits comfortably in VRAM (87.8% utilization). Autoscaling from 2-4 replicas handles traffic spikes while keeping costs optimal. Based on load testing data, this config supports up to 25 concurrent users per replica at &lt;500ms TTFT.
      </div>
      <button onClick={onApply} className="px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-medium hover:bg-accent-purple/90 transition-colors">
        Apply Recommendations
      </button>
    </div>
  )
}

function ObservabilityStep({ obs, onChange }: { obs: Record<string, boolean>; onChange: (o: Record<string, boolean>) => void }) {
  const items = [
    { key: 'prometheus', label: 'Prometheus Metrics', desc: 'GPU utilization, latency, throughput metrics' },
    { key: 'grafana', label: 'Grafana Dashboard', desc: 'Auto-provisioned monitoring dashboards' },
    { key: 'fluentbit', label: 'FluentBit Logging', desc: 'Centralized log aggregation' },
    { key: 'tracing', label: 'Distributed Tracing', desc: 'Request-level tracing with OpenTelemetry' },
  ]
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-medium text-text-primary">Observability Settings</h3>
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div>
            <div className="text-sm text-text-primary">{item.label}</div>
            <div className="text-xs text-text-muted">{item.desc}</div>
          </div>
          <button onClick={() => onChange({ ...obs, [item.key]: !obs[item.key] })} className={`w-10 h-5 rounded-full relative transition-colors ${obs[item.key] ? 'bg-accent-green' : 'bg-bg-tertiary'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${obs[item.key] ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      ))}
    </div>
  )
}

function ReviewStep({ modelId, clusterId, config }: { modelId: string | null; clusterId: string | null; config: { framework: string; gpus: number; replicas: number } }) {
  const model = mockModels.find((m) => m.id === modelId)
  const cluster = mockClusters.find((c) => c.id === clusterId)
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-3">
      <h3 className="text-lg font-medium text-text-primary">Review & Deploy</h3>
      <div className="text-sm space-y-2">
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Model</span><span>{model?.name || '-'}</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Cluster</span><span>{cluster?.name || '-'}</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Framework</span><span>{config.framework}</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">GPUs</span><span>{config.gpus}</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Replicas</span><span>{config.replicas}</span></div>
        <div className="flex justify-between py-2"><span className="text-text-secondary">Est. Cost</span><span className="text-accent-blue">$47.20/hr</span></div>
      </div>
    </div>
  )
}

export default function NewDeploymentWizard() {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [modelId, setModelId] = useState<string | null>(null)
  const [clusterId, setClusterId] = useState<string | null>(null)
  const [config, setConfig] = useState({ framework: 'vLLM', gpus: 4, replicas: 2, autoscale: true })
  const [obs, setObs] = useState<Record<string, boolean>>({ prometheus: true, grafana: true, fluentbit: true, tracing: false })

  const steps = [
    { label: 'Model', content: <SelectModelStep selected={modelId} onSelect={setModelId} /> },
    { label: 'Cluster', content: <SelectClusterStep selected={clusterId} onSelect={setClusterId} /> },
    { label: 'Config', content: <ServingConfigStep config={config} onChange={setConfig} /> },
    { label: 'Intelligence', content: <IntelligencePanel onApply={() => setConfig({ framework: 'vLLM', gpus: 16, replicas: 4, autoscale: true })} /> },
    { label: 'Observability', content: <ObservabilityStep obs={obs} onChange={setObs} /> },
    { label: 'Review', content: <ReviewStep modelId={modelId} clusterId={clusterId} config={config} /> },
  ]

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
        completedMessage="Deployment Initiated Successfully!"
      />
    </div>
  )
}
