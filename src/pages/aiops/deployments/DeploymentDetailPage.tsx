import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import TabGroup from '../../../components/shared/TabGroup'
import StatusBadge from '../../../components/shared/StatusBadge'
import MetricCard from '../../../components/shared/MetricCard'
import { mockDeployments } from '../../../data/mockDeployments'
import { deploymentLatencyTimeSeries } from '../../../data/mockMetrics'
import { Timer, Zap, CheckCircle, Cpu } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const tabs = [
  { key: 'metrics', label: 'Metrics' },
  { key: 'logs', label: 'Logs' },
  { key: 'scaling', label: 'Scaling History' },
]

const mockLogs = [
  { time: '08:32:15', level: 'INFO', message: 'Health check passed - all replicas healthy' },
  { time: '08:30:00', level: 'INFO', message: 'Autoscaler: current load 72%, within target range' },
  { time: '08:28:45', level: 'WARN', message: 'GPU 2 memory usage at 91%, approaching limit' },
  { time: '08:25:12', level: 'INFO', message: 'Request batch processed: 128 tokens, 45ms latency' },
  { time: '08:22:30', level: 'INFO', message: 'Model warm-up complete, ready to serve' },
  { time: '08:20:00', level: 'INFO', message: 'vLLM engine initialized with tensor_parallel_size=4' },
]

const scalingHistory = [
  { time: '2025-03-22 08:00', event: 'Scale Up', from: 2, to: 4, reason: 'CPU utilization > 80%' },
  { time: '2025-03-21 22:00', event: 'Scale Down', from: 4, to: 2, reason: 'Low traffic detected' },
  { time: '2025-03-21 09:00', event: 'Scale Up', from: 2, to: 4, reason: 'Queue depth > 10' },
  { time: '2025-03-20 23:00', event: 'Scale Down', from: 4, to: 2, reason: 'TTL expired' },
]

export default function DeploymentDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('metrics')
  const dep = mockDeployments.find((d) => d.id === id)

  if (!dep) return <div className="text-text-muted">Deployment not found</div>

  return (
    <div>
      <Link to="/aiops/deployments" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Deployments
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-2xl font-semibold text-text-primary">{dep.modelName}</h1>
            <StatusBadge status={dep.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>{dep.clusterName}</span>
            <span className="px-2 py-0.5 rounded bg-bg-tertiary text-xs">{dep.servingFramework}</span>
            {dep.status === 'Running' && (
              <a href="#" className="flex items-center gap-1 text-accent-blue hover:underline">
                {dep.endpointUrl} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {dep.status === 'Running' && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard label="Avg TTFT" value={`${dep.avgLatencyMs}ms`} icon={Timer} trend={-5.2} trendDirection="down" />
          <MetricCard label="Throughput" value={`${dep.throughputTokensPerSec}`} suffix=" tok/s" icon={Zap} trend={8.1} trendDirection="up" />
          <MetricCard label="Success Rate" value={`${dep.successRate}`} suffix="%" icon={CheckCircle} />
          <MetricCard label="GPU Memory" value={`${dep.gpuMemoryUsage}`} suffix="%" icon={Cpu} trend={2.3} trendDirection="up" />
        </div>
      )}

      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'metrics' && dep.status === 'Running' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">TTFT Over Time (ms)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={deploymentLatencyTimeSeries}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                <Line type="monotone" dataKey="ttft" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Throughput Over Time (tok/s)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={deploymentLatencyTimeSeries}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                <Line type="monotone" dataKey="throughput" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="space-y-1 font-mono text-xs">
            {mockLogs.map((log, i) => (
              <div key={i} className="flex gap-3 py-1">
                <span className="text-text-muted">{log.time}</span>
                <span className={log.level === 'WARN' ? 'text-accent-amber' : log.level === 'ERROR' ? 'text-accent-red' : 'text-accent-green'}>{log.level.padEnd(5)}</span>
                <span className="text-text-secondary">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'scaling' && (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Event</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Replicas</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Reason</th>
            </tr></thead>
            <tbody>
              {scalingHistory.map((e, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm text-text-secondary">{e.time}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${e.event === 'Scale Up' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-blue/10 text-accent-blue'}`}>{e.event}</span></td>
                  <td className="px-4 py-3 text-sm text-text-primary">{e.from} → {e.to}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
