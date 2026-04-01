import { useState } from 'react'
import { Cpu, HardDrive, Box, Network, Thermometer, Zap } from 'lucide-react'
import MetricCard from '../../components/shared/MetricCard'
import DataTable from '../../components/shared/DataTable'
import StatusBadge from '../../components/shared/StatusBadge'
import {
  clusterCpuMemoryTimeSeries,
  mockNodeHealth,
  mockPodStatus,
  mockGpuMetrics,
  networkTimeSeries,
  mockServiceLatency,
  mockAlertRules,
} from '../../data/mockMonitoring'
import type { NodeHealth, ServiceLatency, AlertRule, Column } from '../../types'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const PIE_COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#737373']

const podPieData = [
  { name: 'Running', value: mockPodStatus.running },
  { name: 'Pending', value: mockPodStatus.pending },
  { name: 'Failed', value: mockPodStatus.failed },
  { name: 'CrashLoop', value: mockPodStatus.crashLoopBackOff },
  { name: 'Succeeded', value: mockPodStatus.succeeded },
]

function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  const color = pct >= 90 ? 'bg-accent-red' : pct >= 70 ? 'bg-accent-amber' : 'bg-accent-green'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-bg-tertiary">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-text-secondary w-8">{value}%</span>
    </div>
  )
}

const nodeColumns: Column<NodeHealth>[] = [
  { key: 'name', label: 'Node', render: (r) => <span className="font-mono text-xs">{r.name}</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'instanceType', label: 'Instance', render: (r) => <span className="text-xs">{r.instanceType}</span> },
  { key: 'cpuPercent', label: 'CPU', render: (r) => <ProgressBar value={r.cpuPercent} /> },
  { key: 'memoryPercent', label: 'Memory', render: (r) => <ProgressBar value={r.memoryPercent} /> },
  { key: 'diskPercent', label: 'Disk', render: (r) => <ProgressBar value={r.diskPercent} /> },
  { key: 'gpuPercent', label: 'GPU', render: (r) => r.gpuPercent !== null ? <ProgressBar value={r.gpuPercent} /> : <span className="text-xs text-text-muted">N/A</span> },
  { key: 'age', label: 'Age' },
]

const latencyColumns: Column<ServiceLatency>[] = [
  { key: 'service', label: 'Service', render: (r) => <span className="font-mono text-xs">{r.service}</span> },
  { key: 'p50Ms', label: 'P50 (ms)' },
  { key: 'p95Ms', label: 'P95 (ms)' },
  { key: 'p99Ms', label: 'P99 (ms)', render: (r) => <span className={r.p99Ms > 500 ? 'text-accent-red font-medium' : ''}>{r.p99Ms}</span> },
  { key: 'requestsPerSec', label: 'Req/s' },
]

const alertColumns: Column<AlertRule>[] = [
  { key: 'name', label: 'Alert', render: (r) => <span className="font-medium text-sm">{r.name}</span> },
  { key: 'severity', label: 'Severity', render: (r) => <StatusBadge status={r.severity} /> },
  { key: 'state', label: 'State', render: (r) => <StatusBadge status={r.state} /> },
  { key: 'expression', label: 'Expression', render: (r) => <code className="text-xs font-mono text-text-secondary bg-bg-tertiary px-2 py-0.5 rounded">{r.expression}</code> },
  { key: 'lastFired', label: 'Last Fired', render: (r) => <span className="text-xs text-text-muted">{r.lastFired ?? 'Never'}</span> },
]

export default function MonitoringTab() {
  const [alertFilter, setAlertFilter] = useState<'all' | 'firing' | 'pending'>('all')

  const filteredAlerts = mockAlertRules
    .filter(a => alertFilter === 'all' || a.state === alertFilter)
    .sort((a, b) => {
      const stateOrder = { firing: 0, pending: 1, resolved: 2 }
      return stateOrder[a.state] - stateOrder[b.state]
    })

  const firingCount = mockAlertRules.filter(a => a.state === 'firing').length

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="CPU Usage" value="72" suffix="%" icon={Cpu} trend={3.2} trendDirection="up" />
        <MetricCard label="Memory Usage" value="68" suffix="%" icon={HardDrive} trend={-1.5} trendDirection="down" />
        <MetricCard label="Pod Count" value="176" icon={Box} trend={8} trendDirection="up" />
        <MetricCard label="Network I/O" value="2.4" suffix=" Gbps" icon={Network} trend={12} trendDirection="up" />
      </div>

      {/* CPU & Memory time series */}
      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">CPU & Memory Utilization (24h)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={clusterCpuMemoryTimeSeries}>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#a3a3a3', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
            <Legend />
            <Area type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            <Area type="monotone" dataKey="memory" name="Memory" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Node health + Pod status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Node Health</h3>
          <DataTable columns={nodeColumns} data={mockNodeHealth} />
        </div>
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Pod Status Distribution</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={podPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
                  {podPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{mockPodStatus.running + mockPodStatus.pending + mockPodStatus.failed + mockPodStatus.crashLoopBackOff + mockPodStatus.succeeded}</div>
                <div className="text-xs text-text-muted">Total Pods</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {podPieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-text-secondary">{d.name}</span>
                <span className="text-text-primary ml-auto font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GPU Metrics */}
      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">GPU Metrics (DCGM)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockGpuMetrics.map((gpu) => {
            const tempColor = gpu.temperatureC >= 75 ? 'text-accent-red' : gpu.temperatureC >= 65 ? 'text-accent-amber' : 'text-accent-green'
            const utilColor = gpu.utilizationPercent >= 90 ? 'bg-accent-red' : gpu.utilizationPercent >= 70 ? 'bg-accent-amber' : 'bg-accent-green'
            const memPct = (gpu.memoryUsedMiB / gpu.memoryTotalMiB) * 100
            const memColor = memPct >= 90 ? 'bg-accent-red' : memPct >= 70 ? 'bg-accent-amber' : 'bg-accent-blue'
            return (
              <div key={gpu.id} className="bg-bg-tertiary border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">{gpu.name}</span>
                  <span className="text-xs text-text-muted">{gpu.model.split(' ').slice(-1)}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Utilization</span>
                      <span className="text-text-primary">{gpu.utilizationPercent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-primary">
                      <div className={`h-1.5 rounded-full ${utilColor}`} style={{ width: `${gpu.utilizationPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Memory</span>
                      <span className="text-text-primary">{(gpu.memoryUsedMiB / 1024).toFixed(1)} / {(gpu.memoryTotalMiB / 1024).toFixed(1)} GiB</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-primary">
                      <div className={`h-1.5 rounded-full ${memColor}`} style={{ width: `${memPct}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="flex items-center gap-1 text-text-secondary"><Thermometer className="w-3 h-3" /><span className={tempColor}>{gpu.temperatureC}°C</span></span>
                    <span className="flex items-center gap-1 text-text-secondary"><Zap className="w-3 h-3" />{gpu.powerW}/{gpu.powerCapW}W</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Network + Service Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Network Traffic (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={networkTimeSeries}>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
              <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} tickFormatter={(v) => `${v} Mbps`} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="ingressMbps" name="Ingress" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
              <Area type="monotone" dataKey="egressMbps" name="Egress" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Service Latency</h3>
          <DataTable columns={latencyColumns} data={mockServiceLatency} />
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-text-primary">Alert Rules</h3>
            {firingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent-red/10 text-accent-red">
                {firingCount} firing
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {(['all', 'firing', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAlertFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  alertFilter === f
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <DataTable columns={alertColumns} data={filteredAlerts} />
      </div>
    </div>
  )
}
