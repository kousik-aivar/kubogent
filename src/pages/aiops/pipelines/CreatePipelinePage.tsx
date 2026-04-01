import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import PageHeader from '../../../components/shared/PageHeader'
import ModelSourceStep from './create/ModelSourceStep'
import PipelineTypeStep from './create/PipelineTypeStep'
import TrainingMethodStep from './create/TrainingMethodStep'
import DataConfigStep from './create/DataConfigStep'
import EvalApprovalStep from './create/EvalApprovalStep'
import InferenceEngineStep from './create/InferenceEngineStep'
import ClusterStep from './create/ClusterStep'
import PipelineGraphStep from './create/PipelineGraphStep'
import ReviewStep from './create/ReviewStep'
import type { PipelineCreationState, InferenceEngine, InferenceEngineConfig, EvalApprovalConfig } from '../../../types'

const defaultState: PipelineCreationState = {
  modelId: null,
  modelSource: 'catalog',
  pipelinePath: null,
  trainingMethod: null,
  dataS3Path: '',
  trainValSplit: 90,
  evalApproval: {
    metrics: [],
    thresholds: {},
    approvalMode: 'manual',
    notificationChannel: '',
  },
  inferenceEngine: null,
  inferenceEngineConfig: null,
  clusterId: null,
  pipelineName: '',
  scheduler: 'Argo Workflows',
}

interface Step {
  key: string
  label: string
}

function buildSteps(state: PipelineCreationState): Step[] {
  const steps: Step[] = [
    { key: 'model', label: 'Model' },
    { key: 'type', label: 'Type' },
  ]

  if (state.pipelinePath === 'training') {
    steps.push(
      { key: 'method', label: 'Training' },
      { key: 'data', label: 'Data' },
      { key: 'eval', label: 'Approval' },
    )
  }

  steps.push(
    { key: 'engine', label: 'Engine' },
    { key: 'cluster', label: 'Cluster' },
    { key: 'graph', label: 'Preview' },
    { key: 'review', label: 'Review' },
  )

  return steps
}

export default function CreatePipelinePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedModelId = (location.state as { modelId?: string } | null)?.modelId ?? null
  const [stepIndex, setStepIndex] = useState(preselectedModelId ? 1 : 0)
  const [state, setState] = useState<PipelineCreationState>({
    ...defaultState,
    modelId: preselectedModelId,
  })
  const [completed, setCompleted] = useState(false)

  const steps = useMemo(() => buildSteps(state), [state])
  const currentStep = steps[stepIndex]

  function update<K extends keyof PipelineCreationState>(key: K, value: PipelineCreationState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  function updateEval(evalApproval: EvalApprovalConfig) {
    setState((prev) => ({ ...prev, evalApproval }))
  }

  function handleEngineSelect(engine: InferenceEngine, config: InferenceEngineConfig) {
    setState((prev) => ({ ...prev, inferenceEngine: engine, inferenceEngineConfig: config }))
  }

  function canProceed(): boolean {
    switch (currentStep?.key) {
      case 'model':   return !!state.modelId
      case 'type':    return !!state.pipelinePath
      case 'method':  return !!state.trainingMethod
      case 'data':    return !!state.dataS3Path
      case 'eval':    return state.evalApproval.metrics.length > 0
      case 'engine':  return !!state.inferenceEngine
      case 'cluster': return !!state.clusterId
      default:        return true
    }
  }

  if (completed) {
    return (
      <div className="max-w-xl mx-auto mt-16">
        <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-accent-green" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Pipeline Created!</h2>
          <p className="text-sm text-text-secondary mb-6">
            {state.pipelinePath === 'training'
              ? 'Your training pipeline is ready. Run it to start the full model lifecycle.'
              : 'Your direct inference pipeline is configured and ready to deploy.'}
          </p>
          <button
            onClick={() => navigate('/aiops/pipelines')}
            className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
          >
            View Pipelines
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/aiops/pipelines" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Pipelines
      </Link>
      <PageHeader title="Create Pipeline" description="Build a full model lifecycle pipeline end-to-end." />

      {/* Step indicator */}
      <div className="sticky top-0 z-10 bg-bg-primary pt-2 pb-4 mb-4 flex items-center overflow-x-auto">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                i < stepIndex
                  ? 'bg-accent-green text-white'
                  : i === stepIndex
                  ? 'bg-accent-blue text-white'
                  : 'bg-bg-tertiary text-text-muted'
              }`}>
                {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i <= stepIndex ? 'text-text-primary' : 'text-text-muted'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px mx-3 ${i < stepIndex ? 'bg-accent-green' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Pipeline name + scheduler (always visible at top) */}
      {stepIndex > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Pipeline Name</label>
            <input
              type="text"
              value={state.pipelineName}
              onChange={(e) => update('pipelineName', e.target.value)}
              placeholder="e.g. Llama-3.1 Fine-Tuning Pipeline"
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Scheduler</label>
            <select
              value={state.scheduler}
              onChange={(e) => update('scheduler', e.target.value as PipelineCreationState['scheduler'])}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
            >
              <option>Argo Workflows</option>
              <option>Kubeflow</option>
              <option>Kueue</option>
            </select>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="mb-8">
        {currentStep?.key === 'model' && (
          <ModelSourceStep selectedModelId={state.modelId} onSelect={(id) => update('modelId', id)} />
        )}
        {currentStep?.key === 'type' && (
          <PipelineTypeStep selected={state.pipelinePath} onSelect={(p) => {
            setState((prev) => ({ ...prev, pipelinePath: p, trainingMethod: null }))
          }} />
        )}
        {currentStep?.key === 'method' && (
          <TrainingMethodStep modelId={state.modelId} selectedMethod={state.trainingMethod} onSelect={(m) => update('trainingMethod', m)} />
        )}
        {currentStep?.key === 'data' && (
          <DataConfigStep s3Path={state.dataS3Path} onS3PathChange={(p) => update('dataS3Path', p)} trainValSplit={state.trainValSplit} onSplitChange={(s) => update('trainValSplit', s)} />
        )}
        {currentStep?.key === 'eval' && (
          <EvalApprovalStep modelId={state.modelId} config={state.evalApproval} onChange={updateEval} />
        )}
        {currentStep?.key === 'engine' && (
          <InferenceEngineStep modelId={state.modelId} selectedEngine={state.inferenceEngine} engineConfig={state.inferenceEngineConfig} onSelect={handleEngineSelect} />
        )}
        {currentStep?.key === 'cluster' && (
          <ClusterStep selectedClusterId={state.clusterId} onSelect={(id) => update('clusterId', id)} />
        )}
        {currentStep?.key === 'graph' && (
          <PipelineGraphStep state={state} pipelinePath={state.pipelinePath} />
        )}
        {currentStep?.key === 'review' && (
          <ReviewStep state={state} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        {stepIndex < steps.length - 1 ? (
          <button
            onClick={() => setStepIndex((i) => i + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 text-sm font-medium bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setCompleted(true)}
            className="px-6 py-2 text-sm font-medium bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors"
          >
            Create Pipeline
          </button>
        )}
      </div>
    </div>
  )
}
