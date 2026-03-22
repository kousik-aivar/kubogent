import { useState } from 'react'
import TabGroup from '../../components/shared/TabGroup'
import MetricCard from '../../components/shared/MetricCard'
import PageHeader from '../../components/shared/PageHeader'
import { Server, Box, Cpu, DollarSign, Rocket, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { dashboardSparklines, recentActivity, gpuUtilizationData, inferenceLatencyData, costBreakdownData, clusterHealthData } from '../../data/mockMetrics'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'insights', label: 'Detailed Insights' },
]

const activityIcons: Record<string, { icon: typeof CheckCircle; color: string }> = {
  success: { icon: CheckCircle, color: 'text-accent-green' },
  error: { icon: AlertCircle, color: 'text-accent-red' },
  warning: { icon: AlertTriangle, color: 'text-accent-amber' },
  info: { icon: Info, color: 'text-accent-blue' },
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your AI infrastructure" />
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard label="Active Clusters" value={5} trend={25} trendDirection="up" sparklineData={dashboardSparklines.clusters} icon={Server} />
            <MetricCard label="Running Models" value={8} trend={14} trendDirection="up" sparklineData={dashboardSparklines.models} icon={Box} />
            <MetricCard label="GPU Utilization" value="78" suffix="%" trend={4.2} trendDirection="up" sparklineData={dashboardSparklines.gpuUtil} icon={Cpu} />
            <MetricCard label="Monthly Cost" value="42,850" prefix="$" trend={3.5} trendDirection="up" sparklineData={dashboardSparklines.cost} icon={DollarSign} />
            <MetricCard label="Active Deployments" value={4} trend={33} trendDirection="up" sparklineData={dashboardSparklines.deployments} icon={Rocket} />
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((item) => {
                const { icon: Icon, color } = activityIcons[item.status]
                return (
                  <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{item.message}</p>
                      <p className="text-xs text-text-muted mt-0.5">{item.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cluster Health */}
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-primary mb-4">Cluster Health Score</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={clusterHealthData}>
                  <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <YAxis domain={[85, 100]} tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* GPU Utilization */}
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-primary mb-4">GPU Utilization (24h)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={gpuUtilizationData}>
                  <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Inference Latency */}
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-primary mb-4">Inference Latency (ms)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={inferenceLatencyData}>
                  <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={2} name="P50" />
                  <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} name="P95" />
                  <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} name="P99" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-primary mb-4">Monthly Cost by Cluster ($)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={costBreakdownData}>
                  <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="compute" fill="#3b82f6" name="Compute" stackId="a" />
                  <Bar dataKey="storage" fill="#a855f7" name="Storage" stackId="a" />
                  <Bar dataKey="networking" fill="#06b6d4" name="Networking" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
