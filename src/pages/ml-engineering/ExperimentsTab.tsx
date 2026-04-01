import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Trophy, X } from 'lucide-react'
import StatusBadge from '../../components/shared/StatusBadge'
import { mockExperiments } from '../../data/mockExperiments'
import { mockModels } from '../../data/mockModels'
import { MODEL_CATEGORY_LABELS } from '../../types'
import type { ExperimentRun } from '../../types'

function primaryMetricLabel(run: ExperimentRun): string {
  const m = run.metrics
  if (m.final_loss !== undefined)  return `loss ${m.final_loss.toFixed(3)}`
  if (m.mAP50 !== undefined)       return `mAP50 ${m.mAP50.toFixed(3)}`
  if (m.wer !== undefined)         return `WER ${m.wer.toFixed(3)}`
  if (Object.keys(m).length > 0) {
    const [k, v] = Object.entries(m)[0]
    return `${k} ${typeof v === 'number' ? v.toFixed(3) : v}`
  }
  return '—'
}

interface CompareModalProps {
  runs: [ExperimentRun, ExperimentRun]
  onClose: () => void
}

function CompareModal({ runs, onClose }: CompareModalProps) {
  const [a, b] = runs
  const allMetrics = Array.from(new Set([...Object.keys(a.metrics), ...Object.keys(b.metrics)]))
  const allParams: (keyof ExperimentRun['hyperparams'])[] = ['learningRate', 'batchSize', 'epochs', 'warmupSteps']

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-2xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">Compare Runs</h2>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div />
              {runs.map((r) => (
                <div key={r.id} className={`p-3 rounded-xl border ${r.isBest ? 'border-accent-green/40 bg-accent-green/5' : 'border-border bg-bg-tertiary'}`}>
                  <p className="text-xs font-mono text-text-muted mb-0.5">{r.id}</p>
                  <p className="text-sm font-medium text-text-primary">{r.name}</p>
                  {r.isBest && (
                    <span className="flex items-center gap-1 text-[10px] text-accent-green mt-1">
                      <Trophy className="w-3 h-3" /> Best Run
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Metrics */}
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Metrics</p>
            <div className="space-y-2 mb-6">
              {allMetrics.map((key) => {
                const va = a.metrics[key]
                const vb = b.metrics[key]
                return (
                  <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b border-border-light">
                    <span className="text-sm text-text-secondary">{key.replace(/_/g, ' ')}</span>
                    <span className={`text-sm font-mono ${va !== undefined && vb !== undefined && va < vb ? 'text-accent-green' : 'text-text-primary'}`}>
                      {va !== undefined ? va.toFixed(4) : '—'}
                    </span>
                    <span className={`text-sm font-mono ${va !== undefined && vb !== undefined && vb < va ? 'text-accent-green' : 'text-text-primary'}`}>
                      {vb !== undefined ? vb.toFixed(4) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Hyperparams */}
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Hyperparameters</p>
            <div className="space-y-2">
              {allParams.map((key) => {
                const va = a.hyperparams[key]
                const vb = b.hyperparams[key]
                const differs = String(va) !== String(vb)
                return (
                  <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b border-border-light">
                    <span className="text-sm text-text-secondary">{key}</span>
                    <span className={`text-sm font-mono ${differs ? 'text-accent-amber' : 'text-text-primary'}`}>{String(va)}</span>
                    <span className={`text-sm font-mono ${differs ? 'text-accent-amber' : 'text-text-primary'}`}>{String(vb)}</span>
                  </div>
                )
              })}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-border-light">
                <span className="text-sm text-text-secondary">GPU hours</span>
                <span className="text-sm font-mono text-text-primary">{a.gpuHours}h</span>
                <span className="text-sm font-mono text-text-primary">{b.gpuHours}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

interface ExperimentsTabProps {
  notebookId?: string
}

export default function ExperimentsTab({ notebookId }: ExperimentsTabProps) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [compareRuns, setCompareRuns] = useState<[ExperimentRun, ExperimentRun] | null>(null)
  const [modelFilter, setModelFilter] = useState<string>('all')

  const base = notebookId ? mockExperiments.filter((e) => e.notebookId === notebookId) : mockExperiments
  const models = Array.from(new Set(base.map((e) => e.modelName)))
  const filtered = modelFilter === 'all' ? base : base.filter((e) => e.modelName === modelFilter)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 2) next.add(id)
      return next
    })
  }

  function handleCompare() {
    const [a, b] = Array.from(selected).map((id) => mockExperiments.find((e) => e.id === id)!)
    if (a && b) setCompareRuns([a, b])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary">Model:</label>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-3 py-1.5 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
          >
            <option value="all">All models</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {selected.size === 2 && (
          <button
            onClick={handleCompare}
            className="px-4 py-2 text-sm font-medium bg-accent-purple/10 text-accent-purple rounded-lg hover:bg-accent-purple/20 transition-colors"
          >
            Compare {selected.size} runs
          </button>
        )}
        {selected.size === 1 && (
          <p className="text-xs text-text-muted">Select one more run to compare</p>
        )}
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 w-8" />
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Run</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Model</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Primary Metric</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">LR / Batch / Epochs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">GPU hrs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Started</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((run) => (
              <tr
                key={run.id}
                className={`border-b border-border last:border-0 transition-colors ${
                  run.isBest ? 'bg-accent-green/5' : 'hover:bg-bg-tertiary'
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(run.id)}
                    onChange={() => toggleSelect(run.id)}
                    disabled={!selected.has(run.id) && selected.size >= 2}
                    aria-label={`Select ${run.name}`}
                    className="accent-accent-blue"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {run.isBest && <Trophy className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-text-primary">{run.name}</p>
                      <p className="text-xs text-text-muted font-mono">{run.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-text-primary">{run.modelName}</p>
                  <p className="text-xs text-text-muted">{MODEL_CATEGORY_LABELS[run.modelCategory]}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                <td className="px-4 py-3 text-sm font-mono text-text-primary">{primaryMetricLabel(run)}</td>
                <td className="px-4 py-3 text-xs font-mono text-text-secondary">
                  {run.hyperparams.learningRate} / {run.hyperparams.batchSize} / {run.hyperparams.epochs}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{run.gpuHours}h</td>
                <td className="px-4 py-3 text-xs text-text-muted">{run.startedAt}</td>
                <td className="px-4 py-3">
                  {run.status === 'Completed' && (
                    <button
                      onClick={() => {
                        const modelId = mockModels.find((m) => m.name === run.modelName)?.id ?? null
                        navigate('/aiops/pipelines/create', { state: { modelId } })
                      }}
                      className="flex items-center gap-1 text-xs text-accent-blue hover:underline whitespace-nowrap"
                    >
                      Promote <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compareRuns && (
        <CompareModal runs={compareRuns} onClose={() => setCompareRuns(null)} />
      )}
    </div>
  )
}
