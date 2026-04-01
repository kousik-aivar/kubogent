import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, ArrowLeft, Upload, X, Clock, Tag } from 'lucide-react'
import TabGroup from '../../components/shared/TabGroup'
import ExperimentsTab from './ExperimentsTab'
import WorkspaceTab from './WorkspaceTab'
import { mockNotebooks, NOTEBOOK_TEMPLATES } from '../../data/mockNotebooks'
import { MODEL_CATEGORY_LABELS } from '../../types'
import { mockBenchmarks, loadTestingResults, costPerMillionTokens } from '../../data/mockBenchmarks'
import PublishModelModal from './PublishModelModal'
import NotebookViewer from './NotebookViewer'
import type { MockNotebook } from '../../data/mockNotebooks'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatusBadge from '../../components/shared/StatusBadge'

// ─── New Notebook modal ───────────────────────────────────────────────────────

function NewNotebookModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string, templateId: string) => void
}) {
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('blank')
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">New Notebook</h2>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Notebook Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. llama-experiment.ipynb"
                autoFocus
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Template</label>
              <div className="space-y-2">
                {NOTEBOOK_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      template === t.id ? 'border-accent-blue bg-accent-blue/5' : 'border-border hover:border-border-light'
                    }`}
                  >
                    <div className="text-sm font-medium text-text-primary">{t.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button
              onClick={() => name.trim() && onCreate(name.trim(), template)}
              disabled={!name.trim()}
              className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Optimization tab ─────────────────────────────────────────────────────────

function OptimizationTab() {
  const [quant, setQuant] = useState('FP16')
  const [tp, setTp] = useState(4)
  const quantOptions = [
    { label: 'FP32', desc: 'Full precision, max accuracy', mem: '264 GB', speed: '1×' },
    { label: 'FP16', desc: 'Half precision, good balance', mem: '140 GB', speed: '1.8×' },
    { label: 'INT8', desc: 'Integer quantized, fast', mem: '70 GB', speed: '2.5×' },
    { label: 'INT4', desc: 'Aggressive quantization', mem: '35 GB', speed: '3.2×' },
  ]
  const selected = quantOptions.find((q) => q.label === quant)
  return (
    <div className="grid grid-cols-3 gap-6 mt-4">
      <div className="col-span-2 space-y-6">
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Quantization</h3>
          <div className="grid grid-cols-4 gap-3">
            {quantOptions.map((q) => (
              <button key={q.label} onClick={() => setQuant(q.label)}
                className={`text-left p-3 rounded-lg border transition-colors ${quant === q.label ? 'border-accent-blue bg-accent-blue/5' : 'border-border hover:border-border-light'}`}>
                <div className="text-sm font-medium text-text-primary">{q.label}</div>
                <div className="text-xs text-text-muted mt-1">{q.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Tensor Parallelism</h3>
          <input type="range" min={1} max={8} value={tp} onChange={(e) => setTp(Number(e.target.value))} className="w-full" />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>1 GPU</span><span className="text-text-primary font-medium">{tp} GPUs</span><span>8 GPUs</span>
          </div>
        </div>
      </div>
      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">Estimated Impact</h3>
        <div className="space-y-4">
          <div><div className="text-xs text-text-muted mb-1">Memory Footprint</div><div className="text-lg font-semibold text-text-primary">{selected?.mem}</div></div>
          <div><div className="text-xs text-text-muted mb-1">Speed Multiplier</div><div className="text-lg font-semibold text-accent-green">{selected?.speed}</div></div>
          <div><div className="text-xs text-text-muted mb-1">TP Degree</div><div className="text-lg font-semibold text-text-primary">{tp}-way</div></div>
          <div><div className="text-xs text-text-muted mb-1">Min GPUs Required</div><div className="text-lg font-semibold text-accent-blue">{tp}</div></div>
        </div>
      </div>
    </div>
  )
}

// ─── Benchmarks tab ───────────────────────────────────────────────────────────

function BenchmarksTab() {
  const [subTab, setSubTab] = useState<'gpu' | 'cost'>('gpu')
  const [modelFilter, setModelFilter] = useState('Llama-3.3-70B')
  const filtered = mockBenchmarks.filter((b) => b.modelName === modelFilter)
  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['gpu', 'cost'] as const).map((t) => (
            <button key={t} onClick={() => setSubTab(t)}
              className={`px-4 py-1.5 text-sm transition-colors ${subTab === t ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
              {t === 'gpu' ? 'GPU Benchmark' : 'Cost Analysis'}
            </button>
          ))}
        </div>
        {subTab === 'gpu' && (
          <>
            <label className="text-sm text-text-secondary">Model:</label>
            <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}
              className="px-3 py-1.5 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors">
              <option>Llama-3.3-70B</option><option>Mistral-7B</option>
            </select>
          </>
        )}
      </div>
      {subTab === 'gpu' && (
        <>
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['GPU', 'Instance', 'VRAM', 'TTFT (ms)', 'Throughput', 'Cost/hr', 'Tok/$', 'Success'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                ))}</tr></thead>
              <tbody>{filtered.map((b) => (
                <tr key={b.gpuType} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{b.gpuType}</td>
                  <td className="px-4 py-3 text-sm font-mono text-text-secondary">{b.instanceType}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.vram}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{b.ttftMs}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{b.throughputTokensPerMin.toLocaleString()} tok/min</td>
                  <td className="px-4 py-3 text-sm text-text-primary">${b.costPerHour}</td>
                  <td className="px-4 py-3 text-sm text-accent-green">{b.tokensPerDollar.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status="Running" /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Load Testing — Llama 3.3 70B on L40S</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={loadTestingResults}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="users" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="ttftAvg" stroke="#3b82f6" strokeWidth={2} name="Avg TTFT (s)" />
                <Line yAxisId="left" type="monotone" dataKey="ttftP95" stroke="#ef4444" strokeWidth={2} name="P95 TTFT (s)" />
                <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#22c55e" strokeWidth={2} name="Throughput" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      {subTab === 'cost' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {costPerMillionTokens.map((c) => (
              <div key={c.gpu} className="bg-bg-secondary border border-border rounded-xl p-4">
                <div className="text-sm font-medium text-text-primary">{c.gpu}</div>
                <div className="text-2xl font-semibold text-accent-blue mt-2">${c.cost}</div>
                <div className="text-xs text-text-muted mt-1">per 1M tokens</div>
              </div>
            ))}
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Cost per 1M Tokens</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={costPerMillionTokens}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="gpu" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Notebook workspace (tabs) ────────────────────────────────────────────────

const workspaceTabs = [
  { key: 'notebook',     label: 'Notebook' },
  { key: 'experiments',  label: 'Experiments' },
  { key: 'optimization', label: 'Optimization' },
  { key: 'benchmarks',   label: 'Benchmarks' },
  { key: 'servers',      label: 'Servers' },
]

function NotebookWorkspace({ notebook, onBack }: { notebook: MockNotebook; onBack: () => void }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('notebook')
  const [showPublish, setShowPublish] = useState(false)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Workbench
          </button>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-semibold text-text-primary font-mono">{notebook.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
            notebook.modelCategory === 'llm' ? 'bg-accent-purple/10 text-accent-purple' :
            notebook.modelCategory === 'object-detect' ? 'bg-accent-blue/10 text-accent-blue' :
            'bg-accent-amber/10 text-accent-amber'
          }`}>
            {MODEL_CATEGORY_LABELS[notebook.modelCategory]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/aiops/pipelines/create', { state: { modelId: notebook.modelId } })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            Push to Pipeline
          </button>
          <button
            onClick={() => setShowPublish(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-green text-white rounded-lg text-sm font-medium hover:bg-accent-green/90 transition-colors"
          >
            <Upload className="w-4 h-4" /> Publish Model
          </button>
        </div>
      </div>

      <TabGroup tabs={workspaceTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'notebook'     && <NotebookViewer notebook={notebook} />}
      {activeTab === 'experiments'  && <ExperimentsTab notebookId={notebook.id} />}
      {activeTab === 'optimization' && <OptimizationTab />}
      {activeTab === 'benchmarks'   && <BenchmarksTab />}
      {activeTab === 'servers'      && <WorkspaceTab />}

      {showPublish && (
        <PublishModelModal serverName={notebook.name} onClose={() => setShowPublish(false)} />
      )}
    </div>
  )
}

// ─── Notebook list (initial view) ─────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  llm:           'bg-accent-purple/10 text-accent-purple',
  slm:           'bg-accent-purple/10 text-accent-purple',
  'object-detect': 'bg-accent-blue/10 text-accent-blue',
  stt:           'bg-accent-cyan/10 text-accent-cyan',
  tts:           'bg-accent-cyan/10 text-accent-cyan',
  'traditional-ml': 'bg-accent-amber/10 text-accent-amber',
}

export default function WorkbenchPage() {
  const location = useLocation()
  const [notebooks, setNotebooks] = useState<MockNotebook[]>(mockNotebooks)
  const [openNotebook, setOpenNotebook] = useState<MockNotebook | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

  // Auto-open a notebook if navigated with notebookId state
  const navState = location.state as { notebookId?: string } | null
  const [handled] = useState(() => {
    if (navState?.notebookId) {
      const nb = mockNotebooks.find((n) => n.id === navState.notebookId)
      return nb ?? null
    }
    return null
  })

  const activeNotebook = openNotebook ?? handled

  if (activeNotebook) {
    return <NotebookWorkspace notebook={activeNotebook} onBack={() => setOpenNotebook(null)} />
  }

  function handleCreate(name: string) {
    const newNb: MockNotebook = {
      id: `nb-${Date.now()}`,
      name: name.endsWith('.ipynb') ? name : `${name}.ipynb`,
      description: 'New notebook',
      modelCategory: 'llm',
      modelId: 'mdl-001',
      tags: [],
      lastModified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      cells: [
        { type: 'markdown', content: `## ${name}\n\nStart experimenting here.` },
        { type: 'code', executionCount: undefined, content: '# Your code here\n' },
      ],
    }
    setNotebooks((prev) => [newNb, ...prev])
    setShowNewModal(false)
    setOpenNotebook(newNb)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Workbench</h1>
          <p className="text-sm text-text-secondary mt-1">Experiment, build, and publish models — before pushing to a production pipeline.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Notebook
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {notebooks.map((nb) => (
          <button
            key={nb.id}
            onClick={() => setOpenNotebook(nb)}
            className="text-left bg-bg-secondary border border-border rounded-xl p-5 hover:border-border-light transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-text-primary font-mono group-hover:text-accent-blue transition-colors truncate mr-3">
                {nb.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${categoryColors[nb.modelCategory] ?? 'bg-bg-tertiary text-text-muted'}`}>
                {MODEL_CATEGORY_LABELS[nb.modelCategory]}
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-3 line-clamp-2">{nb.description}</p>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {nb.lastModified}</span>
              {nb.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="flex items-center gap-1"><Tag className="w-3 h-3" />{tag}</span>
              ))}
              <span className="ml-auto">{nb.cells.filter(c => c.type === 'code').length} cells</span>
            </div>
          </button>
        ))}
      </div>

      {showNewModal && (
        <NewNotebookModal onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
