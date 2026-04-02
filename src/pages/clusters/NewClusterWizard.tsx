import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StepWizard from '../../components/shared/StepWizard'
import PageHeader from '../../components/shared/PageHeader'

function BasicStep() {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-medium text-text-primary">Cluster Basics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Cluster Name</label>
          <input type="text" defaultValue="eks-new-cluster" className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Region</label>
          <select className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue">
            <option>us-east-1</option><option>us-west-2</option><option>eu-west-1</option><option>ap-south-1</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Kubernetes Version</label>
          <select className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue">
            <option>1.29</option><option>1.28</option><option>1.27</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Environment</label>
          <select className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue">
            <option>Production</option><option>Staging</option><option>Development</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function NodeGroupStep() {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-medium text-text-primary">Node Groups</h3>
      <div className="bg-bg-tertiary border border-border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center"><span className="text-sm font-medium text-text-primary">GPU Node Pool</span><span className="text-xs text-accent-blue">Primary</span></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-text-muted mb-1">Instance Type</label><select className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary"><option>p4d.24xlarge</option><option>g6e.12xlarge</option><option>trn1.32xlarge</option></select></div>
          <div><label className="block text-xs text-text-muted mb-1">Min Nodes</label><input type="number" defaultValue={2} className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary" /></div>
          <div><label className="block text-xs text-text-muted mb-1">Max Nodes</label><input type="number" defaultValue={8} className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary" /></div>
        </div>
      </div>
      <div className="bg-bg-tertiary border border-border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center"><span className="text-sm font-medium text-text-primary">CPU Node Pool</span><span className="text-xs text-text-muted">General</span></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-text-muted mb-1">Instance Type</label><select className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary"><option>m6i.4xlarge</option><option>m6i.2xlarge</option></select></div>
          <div><label className="block text-xs text-text-muted mb-1">Min Nodes</label><input type="number" defaultValue={3} className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary" /></div>
          <div><label className="block text-xs text-text-muted mb-1">Max Nodes</label><input type="number" defaultValue={12} className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary" /></div>
        </div>
      </div>
    </div>
  )
}

function GpuStep() {
  const gpuOptions = [
    { name: 'NVIDIA A100', desc: '80GB HBM2e, Ideal for training & large inference', cost: '$12.90/hr' },
    { name: 'NVIDIA L40S', desc: '48GB GDDR6, Cost-effective inference', cost: '$2.58/hr' },
    { name: 'AWS Trainium', desc: '32GB HBM, Best price/performance for training', cost: '$1.34/hr' },
    { name: 'AWS Inferentia2', desc: '16GB, Lowest cost inference', cost: '$0.76/hr' },
  ]
  const [selected, setSelected] = useState(0)
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-text-primary">Select GPU Type</h3>
      <div className="grid grid-cols-2 gap-4">
        {gpuOptions.map((gpu, i) => (
          <button key={gpu.name} onClick={() => setSelected(i)} className={`text-left p-4 rounded-xl border transition-colors ${i === selected ? 'border-accent-blue bg-accent-blue/5' : 'border-border bg-bg-secondary hover:border-border-light'}`}>
            <div className="text-sm font-medium text-text-primary">{gpu.name}</div>
            <div className="text-xs text-text-secondary mt-1">{gpu.desc}</div>
            <div className="text-xs text-accent-blue mt-2">{gpu.cost}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function NetworkStep() {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-medium text-text-primary">Networking</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-text-secondary mb-1">VPC</label><select className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary"><option>Create New VPC</option><option>vpc-0a1b2c3d4e5f6</option></select></div>
        <div><label className="block text-sm text-text-secondary mb-1">CIDR Block</label><input type="text" defaultValue="10.0.0.0/16" className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary" /></div>
      </div>
      <div className="flex items-center justify-between py-3 border-t border-border">
        <div><div className="text-sm text-text-primary">Private Endpoint</div><div className="text-xs text-text-muted">Access cluster API from within VPC</div></div>
        <div className="w-10 h-5 bg-accent-green rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" /></div>
      </div>
      <div className="flex items-center justify-between py-3 border-t border-border">
        <div><div className="text-sm text-text-primary">Public Endpoint</div><div className="text-xs text-text-muted">Access cluster API from internet</div></div>
        <div className="w-10 h-5 bg-bg-tertiary rounded-full relative"><div className="w-4 h-4 bg-text-muted rounded-full absolute left-0.5 top-0.5" /></div>
      </div>
    </div>
  )
}

function ReviewStep() {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-medium text-text-primary">Review Configuration</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Name</span><span>eks-new-cluster</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Region</span><span>us-east-1</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">K8s Version</span><span>1.29</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">GPU</span><span>NVIDIA A100</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Node Groups</span><span>2 (GPU + CPU)</span></div>
        <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Est. Cost</span><span className="text-accent-blue">$47.20/hr</span></div>
        <div className="flex justify-between py-2"><span className="text-text-secondary">Private Endpoint</span><span className="text-accent-green">Enabled</span></div>
      </div>
    </div>
  )
}

export default function NewClusterWizard() {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  const steps = [
    { label: 'Basics', content: <BasicStep /> },
    { label: 'Node Groups', content: <NodeGroupStep /> },
    { label: 'GPU', content: <GpuStep /> },
    { label: 'Networking', content: <NetworkStep /> },
    { label: 'Review', content: <ReviewStep /> },
  ]

  return (
    <div>
      <Link to="/clusters" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Clusters
      </Link>
      <PageHeader title="Create New Cluster" description="Provision a new EKS cluster for AI workloads" />
      <StepWizard
        steps={steps}
        currentStep={step}
        onNext={() => setStep(step + 1)}
        onBack={() => setStep(step - 1)}
        onJumpTo={(i) => setStep(i)}
        onComplete={() => setCompleted(true)}
        isCompleted={completed}
        completedMessage="Cluster Provisioning Started!"
      />
    </div>
  )
}
