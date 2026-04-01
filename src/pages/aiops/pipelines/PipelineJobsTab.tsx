import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import StatusBadge from '../../../components/shared/StatusBadge'
import { mockTrainingJobs } from '../../../data/mockTrainingJobs'
import type { Pipeline, TrainingJob } from '../../../types'

interface PipelineJobsTabProps {
  pipeline: Pipeline
}

const stageTypeColors: Record<TrainingJob['stageType'], string> = {
  training: 'bg-accent-purple/10 text-accent-purple',
  evaluation: 'bg-accent-amber/10 text-accent-amber',
  deployment: 'bg-accent-green/10 text-accent-green',
}

function primaryMetric(job: TrainingJob): string {
  if (!job.metrics || Object.keys(job.metrics).length === 0) return '—'
  const priority = ['final_loss', 'eval_loss', 'accuracy', 'bleu_score', 'wer', 'f1', 'size_reduction_pct']
  for (const key of priority) {
    if (key in job.metrics) {
      const val = job.metrics[key]
      const label = key.replace(/_/g, ' ')
      return `${label}: ${typeof val === 'number' && val < 1 ? val.toFixed(3) : val}`
    }
  }
  const [k, v] = Object.entries(job.metrics)[0]
  return `${k.replace(/_/g, ' ')}: ${v}`
}

function JobRow({ job }: { job: TrainingJob }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className="border-b border-border hover:bg-bg-tertiary transition-colors cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-4 py-3 w-8">
          {expanded
            ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${stageTypeColors[job.stageType]}`}>
            {job.stageType}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-text-primary">{job.stageName}</td>
        <td className="px-4 py-3 text-sm text-text-secondary">Run #{job.runNumber}</td>
        <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
        <td className="px-4 py-3 text-xs text-text-muted">{job.startedAt}</td>
        <td className="px-4 py-3 text-sm text-text-secondary">{job.duration}</td>
        <td className="px-4 py-3 text-xs text-text-secondary font-mono">{primaryMetric(job)}</td>
        {job.modelVersionProduced
          ? <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue">{job.modelVersionProduced}</span></td>
          : <td className="px-4 py-3 text-xs text-text-muted">—</td>}
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-bg-tertiary">
          <td colSpan={9} className="px-8 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Resources</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">GPU</span>
                    <span className="text-text-primary font-mono text-xs">{job.resources.gpu}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">CPU</span>
                    <span className="text-text-primary font-mono text-xs">{job.resources.cpu}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Memory</span>
                    <span className="text-text-primary font-mono text-xs">{job.resources.memory}</span>
                  </div>
                </div>
              </div>
              {job.metrics && Object.keys(job.metrics).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Metrics</p>
                  <div className="space-y-1">
                    {Object.entries(job.metrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-text-secondary">{k.replace(/_/g, ' ')}</span>
                        <span className="text-text-primary font-mono text-xs">
                          {typeof v === 'number' && v < 1 ? v.toFixed(4) : v}
                          {k === 'gpu_utilization' || k === 'size_reduction_pct' ? '%' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function PipelineJobsTab({ pipeline }: PipelineJobsTabProps) {
  const jobs = mockTrainingJobs.filter((j) => j.pipelineId === pipeline.id)

  if (jobs.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center mt-4">
        <p className="text-text-muted">No jobs recorded for this pipeline yet.</p>
      </div>
    )
  }

  return (
    <div className="mt-4 bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 w-8" />
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Stage</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Run</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Started</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Key Metric</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Version</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => <JobRow key={job.id} job={job} />)}
        </tbody>
      </table>
    </div>
  )
}
