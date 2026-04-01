import { mockModels } from '../../../../data/mockModels'
import { mockClusters } from '../../../../data/mockClusters'
import type { PipelineCreationState } from '../../../../types'

interface ReviewStepProps {
  state: PipelineCreationState
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm font-medium ${accent ?? 'text-text-primary'}`}>{value}</span>
    </div>
  )
}

export default function ReviewStep({ state }: ReviewStepProps) {
  const model = mockModels.find((m) => m.id === state.modelId)
  const cluster = mockClusters.find((c) => c.id === state.clusterId)
  const isTraining = state.pipelinePath === 'training'

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Review & Create</h3>
      <p className="text-sm text-text-secondary mb-5">Confirm the pipeline configuration before creation.</p>

      <div className="space-y-4">
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h4 className="text-sm font-medium text-text-primary mb-3">Pipeline</h4>
          <div className="space-y-0">
            <Row label="Name" value={state.pipelineName || 'Unnamed Pipeline'} />
            <Row label="Scheduler" value={state.scheduler} />
            <Row
              label="Type"
              value={isTraining ? 'Training / Fine-Tuning' : 'Direct to Inference'}
              accent={isTraining ? 'text-accent-purple' : 'text-accent-green'}
            />
          </div>
        </div>

        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h4 className="text-sm font-medium text-text-primary mb-3">Model</h4>
          <div className="space-y-0">
            <Row label="Model" value={model?.name ?? '-'} />
            <Row label="Parameters" value={model?.parameters ?? '-'} />
            <Row label="Source" value={model?.source ?? '-'} />
          </div>
        </div>

        {isTraining && (
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h4 className="text-sm font-medium text-text-primary mb-3">Training</h4>
            <div className="space-y-0">
              <Row label="Method" value={state.trainingMethod ?? '-'} accent="text-accent-purple" />
              <Row label="Data Source" value={state.dataS3Path || 'Not specified'} />
              <Row label="Train / Val Split" value={`${state.trainValSplit}% / ${100 - state.trainValSplit}%`} />
            </div>
          </div>
        )}

        {isTraining && (
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h4 className="text-sm font-medium text-text-primary mb-3">Evaluation & Approval</h4>
            <div className="space-y-0">
              <Row
                label="Metrics"
                value={state.evalApproval.metrics.length > 0 ? state.evalApproval.metrics.join(', ') : 'None selected'}
              />
              <Row
                label="Approval"
                value={state.evalApproval.approvalMode === 'manual' ? 'Manual' : 'Automated'}
                accent={state.evalApproval.approvalMode === 'manual' ? 'text-accent-amber' : 'text-accent-green'}
              />
              {state.evalApproval.notificationChannel && (
                <Row label="Notify" value={state.evalApproval.notificationChannel} />
              )}
            </div>
          </div>
        )}

        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h4 className="text-sm font-medium text-text-primary mb-3">Inference</h4>
          <div className="space-y-0">
            <Row label="Engine" value={state.inferenceEngine ?? '-'} accent="text-accent-blue" />
            <Row label="Cluster" value={cluster?.name ?? '-'} />
            {cluster && <Row label="Est. Cost" value={`$${cluster.costPerHour}/hr`} accent="text-accent-blue" />}
          </div>
        </div>

        {isTraining && (
          <div className="p-3 bg-bg-tertiary rounded-xl border border-border">
            <p className="text-xs text-text-muted mb-2">Estimated timeline</p>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-0.5 rounded bg-accent-purple/10 text-accent-purple">Train: ~2–4h</span>
              <span className="text-text-muted">→</span>
              <span className="px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber">Eval: ~30m</span>
              <span className="text-text-muted">→</span>
              <span className="px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber">
                {state.evalApproval.approvalMode === 'manual' ? 'Approval: manual' : 'Approval: auto'}
              </span>
              <span className="text-text-muted">→</span>
              <span className="px-2 py-0.5 rounded bg-accent-green/10 text-accent-green">Deploy: ~5m</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
