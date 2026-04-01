import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import TabGroup from '../../components/shared/TabGroup'
import PageHeader from '../../components/shared/PageHeader'
import StatusBadge from '../../components/shared/StatusBadge'
import WorkspaceTab from './WorkspaceTab'
import ExperimentsTab from './ExperimentsTab'
import { mockBenchmarks, loadTestingResults, costPerMillionTokens } from '../../data/mockBenchmarks'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const tabs = [
  { key: 'workspace', label: 'Workspace' },
  { key: 'experiments', label: 'Experiments' },
  { key: 'optimization', label: 'Optimization' },
  { key: 'benchmarks', label: 'Benchmarks' },
]

// ─── Optimization ─────────────────────────────────────────────────────────────

function ModelOptimization() {
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
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Quantization</h3>
          <div className="grid grid-cols-4 gap-3">
            {quantOptions.map((q) => (
              <button
                key={q.label}
                onClick={() => setQuant(q.label)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  quant === q.label ? 'border-accent-blue bg-accent-blue/5' : 'border-border hover:border-border-light'
                }`}
              >
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
          <div>
            <div className="text-xs text-text-muted mb-1">Memory Footprint</div>
            <div className="text-lg font-semibold text-text-primary">{selected?.mem}</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Speed Multiplier</div>
            <div className="text-lg font-semibold text-accent-green">{selected?.speed}</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">TP Degree</div>
            <div className="text-lg font-semibold text-text-primary">{tp}-way</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Min GPUs Required</div>
            <div className="text-lg font-semibold text-accent-blue">{tp}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Benchmarks ───────────────────────────────────────────────────────────────

function Benchmarks() {
  const [modelFilter, setModelFilter] = useState('Llama-3.3-70B')
  const [activeSubTab, setActiveSubTab] = useState<'gpu' | 'cost'>('gpu')
  const filtered = mockBenchmarks.filter((b) => b.modelName === modelFilter)

  return (
    <div className="space-y-6">
      {activeSubTab === 'gpu' && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['gpu', 'cost'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveSubTab(t)}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    activeSubTab === t ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t === 'gpu' ? 'GPU Benchmark' : 'Cost Analysis'}
                </button>
              ))}
            </div>
            <label className="text-sm text-text-secondary">Model:</label>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="px-3 py-1.5 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
            >
              <option>Llama-3.3-70B</option>
              <option>Mistral-7B</option>
            </select>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">GPU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Instance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">VRAM</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">TTFT (ms)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Throughput</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cost/hr</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Tok/$</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Success</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.gpuType} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{b.gpuType}</td>
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary">{b.instanceType}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{b.vram}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{b.ttftMs}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{b.throughputTokensPerMin.toLocaleString()} tok/min</td>
                    <td className="px-4 py-3 text-sm text-text-primary">${b.costPerHour}</td>
                    <td className="px-4 py-3 text-sm text-accent-green">{b.tokensPerDollar.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.successRate === 100 ? 'Running' : 'Running'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Load Testing — Llama 3.3 70B on L40S</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={loadTestingResults}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="users" tick={{ fill: '#a3a3a3', fontSize: 12 }} label={{ value: 'Concurrent Users', position: 'insideBottom', offset: -5, fill: '#a3a3a3' }} />
                <YAxis yAxisId="left" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="ttftAvg" stroke="#3b82f6" strokeWidth={2} name="Avg TTFT (s)" />
                <Line yAxisId="left" type="monotone" dataKey="ttftP95" stroke="#ef4444" strokeWidth={2} name="P95 TTFT (s)" />
                <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#22c55e" strokeWidth={2} name="Throughput (tok/min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {activeSubTab === 'cost' && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['gpu', 'cost'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveSubTab(t)}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    activeSubTab === t ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t === 'gpu' ? 'GPU Benchmark' : 'Cost Analysis'}
                </button>
              ))}
            </div>
          </div>
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
            <h3 className="text-sm font-medium text-text-primary mb-4">Cost per 1M Tokens by GPU</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costPerMillionTokens}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="gpu" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Instance Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Hourly Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Monthly (24/7)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Recommended For</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { instance: 'p4d.24xlarge', hourly: '$12.90', monthly: '$9,288', use: 'Large model training & inference' },
                  { instance: 'g6e.12xlarge', hourly: '$10.32', monthly: '$7,430', use: 'Cost-effective inference' },
                  { instance: 'trn1.32xlarge', hourly: '$7.20', monthly: '$5,184', use: 'Training workloads' },
                  { instance: 'inf2.48xlarge', hourly: '$5.60', monthly: '$4,032', use: 'High-volume inference' },
                ].map((row) => (
                  <tr key={row.instance} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-sm font-mono">{row.instance}</td>
                    <td className="px-4 py-3 text-sm">{row.hourly}</td>
                    <td className="px-4 py-3 text-sm">{row.monthly}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MLEngineeringPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('workspace')

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="ML Engineering"
          description="Provision notebook servers, run experiments, and publish models to GitHub or S3."
        />
        <button
          onClick={() => navigate('/aiops/pipelines/create')}
          className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white rounded-lg text-sm font-medium hover:bg-accent-green/90 transition-colors flex-shrink-0 mt-1"
        >
          Push to Pipeline <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'workspace'     && <WorkspaceTab />}
      {activeTab === 'experiments'   && <ExperimentsTab />}
      {activeTab === 'optimization'  && <ModelOptimization />}
      {activeTab === 'benchmarks'    && <Benchmarks />}
    </div>
  )
}
