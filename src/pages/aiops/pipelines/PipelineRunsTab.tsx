import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import StatusBadge from '../../../components/shared/StatusBadge'
import type { Pipeline, PipelineRun } from '../../../types'

const statusColors: Record<string, string> = {
  Completed: 'bg-accent-green',
  Running: 'bg-accent-blue',
  Failed: 'bg-accent-red',
  Pending: 'bg-bg-tertiary',
  Skipped: 'bg-bg-tertiary',
}

function RunStageTimeline({ run }: { run: PipelineRun }) {
  return (
    <div className="mt-3 bg-bg-primary border border-border rounded-lg p-4">
      <div className="flex items-center gap-1 mb-3">
        {run.stageStatuses.map((s, i) => (
          <div key={s.stageId} className="flex items-center gap-1 flex-1">
            <div className="flex-1">
              <div className="text-[10px] text-text-muted mb-1 truncate">{s.stageName}</div>
              <div className={`h-2 rounded-full ${statusColors[s.status] || 'bg-bg-tertiary'} ${s.status === 'Running' ? 'animate-pulse' : ''}`} />
              <div className="text-[10px] text-text-muted mt-0.5">{s.duration}</div>
            </div>
            {i < run.stageStatuses.length - 1 && (
              <div className="text-text-muted text-[10px] mx-0.5 mb-4">→</div>
            )}
          </div>
        ))}
      </div>
      {run.metrics && Object.keys(run.metrics).length > 0 && (
        <div className="flex gap-4 pt-2 border-t border-border">
          {Object.entries(run.metrics).map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="text-text-muted">{key.replace(/_/g, ' ')}:</span>{' '}
              <span className="text-text-primary font-medium">{typeof value === 'number' && value < 10 ? value.toFixed(3) : value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PipelineRunsTab({ pipeline }: { pipeline: Pipeline }) {
  const [expandedRun, setExpandedRun] = useState<string | null>(null)
  const runs = pipeline.runs || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">Pipeline Runs ({runs.length})</h3>
      </div>

      {runs.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No pipeline runs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {runs.map((run) => {
            const isExpanded = expandedRun === run.id
            return (
              <div key={run.id} className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-bg-tertiary/50 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
                  <span className="text-sm font-mono text-text-secondary w-10">#{run.runNumber}</span>
                  <StatusBadge status={run.status} />
                  <span className="text-xs px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary">{run.triggeredBy}</span>
                  <span className="text-xs text-text-muted ml-auto">{run.startedAt}</span>
                  <span className="text-xs text-text-secondary w-16 text-right">{run.duration}</span>
                  <div className="flex items-center gap-1 w-24">
                    <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary">
                      <div
                        className={`h-1.5 rounded-full ${run.status === 'Failed' ? 'bg-accent-red' : 'bg-accent-green'}`}
                        style={{ width: `${(run.stagesCompleted / run.totalStages) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted">{run.stagesCompleted}/{run.totalStages}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <RunStageTimeline run={run} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
