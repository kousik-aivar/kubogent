import { useState } from 'react'
import TabGroup from '../../components/shared/TabGroup'
import PageHeader from '../../components/shared/PageHeader'
import StatusBadge from '../../components/shared/StatusBadge'
import { mockBenchmarks, loadTestingResults, costPerMillionTokens } from '../../data/mockBenchmarks'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const tabs = [
  { key: 'optimization', label: 'Model Optimization' },
  { key: 'tuning', label: 'Hyperparameter Tuning' },
  { key: 'benchmark', label: 'GPU Benchmark' },
  { key: 'cost', label: 'Cost Analysis' },
]

function ModelOptimization() {
  const [quant, setQuant] = useState('FP16')
  const [tp, setTp] = useState(4)
  const quantOptions = [
    { label: 'FP32', desc: 'Full precision, max accuracy', mem: '264 GB', speed: '1x' },
    { label: 'FP16', desc: 'Half precision, good balance', mem: '140 GB', speed: '1.8x' },
    { label: 'INT8', desc: 'Integer quantized, fast', mem: '70 GB', speed: '2.5x' },
    { label: 'INT4', desc: 'Aggressive quantization', mem: '35 GB', speed: '3.2x' },
  ]

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Quantization</h3>
          <div className="grid grid-cols-4 gap-3">
            {quantOptions.map((q) => (
              <button key={q.label} onClick={() => setQuant(q.label)} className={`text-left p-3 rounded-lg border transition-colors ${quant === q.label ? 'border-accent-blue bg-accent-blue/5' : 'border-border hover:border-border-light'}`}>
                <div className="text-sm font-medium text-text-primary">{q.label}</div>
                <div className="text-xs text-text-muted mt-1">{q.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Tensor Parallelism</h3>
          <div>
            <input type="range" min={1} max={8} value={tp} onChange={(e) => setTp(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>1 GPU</span><span>{tp} GPUs</span><span>8 GPUs</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">Estimated Impact</h3>
        <div className="space-y-4">
          <div><div className="text-xs text-text-muted mb-1">Memory Footprint</div><div className="text-lg font-semibold text-text-primary">{quantOptions.find((q) => q.label === quant)?.mem}</div></div>
          <div><div className="text-xs text-text-muted mb-1">Speed Multiplier</div><div className="text-lg font-semibold text-accent-green">{quantOptions.find((q) => q.label === quant)?.speed}</div></div>
          <div><div className="text-xs text-text-muted mb-1">TP Degree</div><div className="text-lg font-semibold text-text-primary">{tp}-way</div></div>
          <div><div className="text-xs text-text-muted mb-1">Min GPUs Required</div><div className="text-lg font-semibold text-accent-blue">{tp}</div></div>
        </div>
      </div>
    </div>
  )
}

function HyperparameterTuning() {
  const jobs = [
    { id: 'hp-001', status: 'Completed', metric: 0.924, lr: '2e-4', batch: 32, warmup: 100, duration: '2h 15m' },
    { id: 'hp-002', status: 'Completed', metric: 0.918, lr: '1e-4', batch: 16, warmup: 200, duration: '3h 05m' },
    { id: 'hp-003', status: 'Running', metric: 0.91, lr: '5e-5', batch: 64, warmup: 50, duration: '1h 30m' },
    { id: 'hp-004', status: 'Pending', metric: 0, lr: '1e-3', batch: 32, warmup: 150, duration: '-' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">Parameter Grid</h3>
        <div className="grid grid-cols-4 gap-4">
          <div><label className="block text-xs text-text-muted mb-1">Learning Rate</label><input type="text" defaultValue="[2e-4, 1e-4, 5e-5]" className="w-full px-2 py-1.5 bg-bg-tertiary border border-border rounded text-xs text-text-primary" /></div>
          <div><label className="block text-xs text-text-muted mb-1">Batch Size</label><input type="text" defaultValue="[16, 32, 64]" className="w-full px-2 py-1.5 bg-bg-tertiary border border-border rounded text-xs text-text-primary" /></div>
          <div><label className="block text-xs text-text-muted mb-1">Warmup Steps</label><input type="text" defaultValue="[50, 100, 200]" className="w-full px-2 py-1.5 bg-bg-tertiary border border-border rounded text-xs text-text-primary" /></div>
          <div><label className="block text-xs text-text-muted mb-1">Epochs</label><input type="text" defaultValue="3" className="w-full px-2 py-1.5 bg-bg-tertiary border border-border rounded text-xs text-text-primary" /></div>
        </div>
      </div>
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Job ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Metric (F1)</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">LR</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Batch</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Warmup</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Duration</th>
          </tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-mono text-text-primary">{j.id}</td>
                <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                <td className="px-4 py-3 text-sm text-text-primary">{j.metric > 0 ? j.metric.toFixed(3) : '-'}</td>
                <td className="px-4 py-3 text-sm font-mono text-text-secondary">{j.lr}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{j.batch}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{j.warmup}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{j.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GPUBenchmark() {
  const [modelFilter, setModelFilter] = useState('Llama-3.3-70B')
  const filtered = mockBenchmarks.filter((b) => b.modelName === modelFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm text-text-secondary">Model:</label>
        <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} className="px-3 py-1.5 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary">
          <option>Llama-3.3-70B</option><option>Mistral-7B</option>
        </select>
      </div>
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">GPU Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Instance</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">VRAM</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">TTFT (ms)</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Throughput</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Cost/hr</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Tok/$/hr</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Success</th>
          </tr></thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.gpuType} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{b.gpuType}</td>
                <td className="px-4 py-3 text-sm font-mono text-text-secondary">{b.instanceType}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{b.vram}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{b.ttftMs}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{b.throughputTokensPerMin.toLocaleString()} tok/min</td>
                <td className="px-4 py-3 text-sm text-text-primary">${b.costPerHour}</td>
                <td className="px-4 py-3 text-sm text-accent-green">{b.tokensPerDollar.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-text-primary">{b.successRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">Load Testing Results (Llama 3.3 70B on L40S)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={loadTestingResults}>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
            <XAxis dataKey="users" tick={{ fill: '#a3a3a3', fontSize: 12 }} label={{ value: 'Concurrent Users', position: 'insideBottom', offset: -5, fill: '#a3a3a3' }} />
            <YAxis yAxisId="left" tick={{ fill: '#a3a3a3', fontSize: 12 }} label={{ value: 'TTFT (s)', angle: -90, position: 'insideLeft', fill: '#a3a3a3' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a3a3a3', fontSize: 12 }} label={{ value: 'Throughput (tok/min)', angle: 90, position: 'insideRight', fill: '#a3a3a3' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="ttftAvg" stroke="#3b82f6" strokeWidth={2} name="Avg TTFT (s)" />
            <Line yAxisId="left" type="monotone" dataKey="ttftP95" stroke="#ef4444" strokeWidth={2} name="P95 TTFT (s)" />
            <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#22c55e" strokeWidth={2} name="Throughput" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function CostAnalysis() {
  return (
    <div className="space-y-6">
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
        <ResponsiveContainer width="100%" height={300}>
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
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Instance Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Hourly Cost</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Monthly (24/7)</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Recommended For</th>
          </tr></thead>
          <tbody>
            <tr className="border-b border-border"><td className="px-4 py-3 text-sm font-mono">p4d.24xlarge</td><td className="px-4 py-3 text-sm">$12.90</td><td className="px-4 py-3 text-sm">$9,288</td><td className="px-4 py-3 text-sm text-text-secondary">Large model training & inference</td></tr>
            <tr className="border-b border-border"><td className="px-4 py-3 text-sm font-mono">g6e.12xlarge</td><td className="px-4 py-3 text-sm">$10.32</td><td className="px-4 py-3 text-sm">$7,430</td><td className="px-4 py-3 text-sm text-text-secondary">Cost-effective inference</td></tr>
            <tr className="border-b border-border"><td className="px-4 py-3 text-sm font-mono">trn1.32xlarge</td><td className="px-4 py-3 text-sm">$7.20</td><td className="px-4 py-3 text-sm">$5,184</td><td className="px-4 py-3 text-sm text-text-secondary">Training workloads</td></tr>
            <tr><td className="px-4 py-3 text-sm font-mono">inf2.48xlarge</td><td className="px-4 py-3 text-sm">$5.60</td><td className="px-4 py-3 text-sm">$4,032</td><td className="px-4 py-3 text-sm text-text-secondary">High-volume inference</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function MLEngineeringPage() {
  const [activeTab, setActiveTab] = useState('optimization')

  return (
    <div>
      <PageHeader title="ML Engineering" description="Optimize models, tune parameters, and benchmark GPUs" />
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'optimization' && <ModelOptimization />}
      {activeTab === 'tuning' && <HyperparameterTuning />}
      {activeTab === 'benchmark' && <GPUBenchmark />}
      {activeTab === 'cost' && <CostAnalysis />}
    </div>
  )
}
