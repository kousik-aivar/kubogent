import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import TabGroup from '../../components/shared/TabGroup'
import StatusBadge from '../../components/shared/StatusBadge'
import MetricCard from '../../components/shared/MetricCard'
import DataTable from '../../components/shared/DataTable'
import { mockClusters } from '../../data/mockClusters'
import { gpuMemoryPerNode } from '../../data/mockMetrics'
import type { NodeGroup, Column } from '../../types'
import { Server, Cpu, HardDrive, Clock, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'nodes', label: 'Node Groups' },
  { key: 'gpu', label: 'GPU Utilization' },
  { key: 'network', label: 'Networking' },
  { key: 'security', label: 'Security' },
  { key: 'autoscaling', label: 'Autoscaling' },
]

const nodeGroupColumns: Column<NodeGroup>[] = [
  { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'instanceType', label: 'Instance Type' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'desiredCount', label: 'Desired' },
  { key: 'minCount', label: 'Min' },
  { key: 'maxCount', label: 'Max' },
  { key: 'gpuType', label: 'GPU Type' },
  { key: 'gpuPerNode', label: 'GPU/Node' },
]

export default function ClusterDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const cluster = mockClusters.find((c) => c.id === id)

  if (!cluster) {
    return <div className="text-text-muted">Cluster not found</div>
  }

  return (
    <div>
      <Link to="/clusters" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Clusters
      </Link>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">{cluster.name}</h1>
        <StatusBadge status={cluster.status} />
      </div>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <MetricCard label="Nodes" value={cluster.nodeCount} icon={Server} />
            <MetricCard label="GPUs" value={cluster.gpuCount} icon={Cpu} />
            <MetricCard label="K8s Version" value={cluster.k8sVersion} icon={HardDrive} />
            <MetricCard label="Uptime" value="99.9%" icon={Clock} />
            <MetricCard label="Cost/hr" value={cluster.costPerHour.toFixed(2)} prefix="$" icon={DollarSign} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-primary mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">Region</span><span>{cluster.region}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">GPU Type</span><span>{cluster.gpuType}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">VPC</span><span className="font-mono text-xs">{cluster.vpcId}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Created</span><span>{cluster.createdAt}</span></div>
              </div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-primary mb-3">Node Groups</h3>
              <div className="space-y-2 text-sm">
                {cluster.nodeGroups.map((ng) => (
                  <div key={ng.name} className="flex justify-between items-center">
                    <span className="text-text-secondary">{ng.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">{ng.instanceType}</span>
                      <StatusBadge status={ng.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nodes' && (
        <DataTable columns={nodeGroupColumns} data={cluster.nodeGroups} />
      )}

      {activeTab === 'gpu' && (
        <div className="space-y-6">
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">GPU Memory Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gpuMemoryPerNode} layout="vertical">
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 50000]} tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis dataKey="gpu" type="category" tick={{ fill: '#a3a3a3', fontSize: 12 }} width={60} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} formatter={(v: unknown) => `${(Number(v) / 1024).toFixed(1)} GiB`} />
                <Bar dataKey="used" fill="#3b82f6" name="Used" radius={[0, 4, 4, 0]} />
                <Bar dataKey="total" fill="#262626" name="Total" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {gpuMemoryPerNode.map((gpu) => (
              <div key={gpu.gpu} className="bg-bg-secondary border border-border rounded-xl p-4">
                <div className="text-sm font-medium text-text-primary mb-1">{gpu.gpu}</div>
                <div className="text-xs text-text-muted mb-2">{gpu.model}</div>
                <div className="text-lg font-semibold text-text-primary">{((gpu.used / gpu.total) * 100).toFixed(1)}%</div>
                <div className="text-xs text-text-secondary">{(gpu.used / 1024).toFixed(1)} / {(gpu.total / 1024).toFixed(1)} GiB</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-4">Networking Configuration</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">VPC ID</span><span className="font-mono">{cluster.vpcId}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Subnets</span><span className="font-mono text-xs">{cluster.subnetIds.join(', ')}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Security Groups</span><span className="font-mono text-xs">{cluster.securityGroups.join(', ')}</span></div>
            <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Private Endpoint</span><span className="text-accent-green">Enabled</span></div>
            <div className="flex justify-between py-2"><span className="text-text-secondary">Public Endpoint</span><span className="text-accent-red">Disabled</span></div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Security Configuration</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Pod Security Admission</span><span className="text-accent-green">Enforced</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">IMDSv2</span><span className="text-accent-green">Required</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Image Scanning</span><span className="text-accent-green">Active</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Audit Logging</span><span className="text-accent-green">Enabled</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Network Policies</span><span className="text-accent-green">Calico</span></div>
              <div className="flex justify-between py-2"><span className="text-text-secondary">Encryption at Rest</span><span className="text-accent-green">KMS</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'autoscaling' && (
        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Karpenter Configuration</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Status</span><span className={cluster.karpenterConfig.enabled ? 'text-accent-green' : 'text-text-muted'}>{cluster.karpenterConfig.enabled ? 'Enabled' : 'Disabled'}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Consolidation Policy</span><span>{cluster.karpenterConfig.consolidationPolicy}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">TTL After Empty</span><span>{cluster.karpenterConfig.ttlSecondsAfterEmpty}s</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">CPU Limit</span><span>{cluster.karpenterConfig.nodePoolLimits.cpu} cores</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-secondary">Memory Limit</span><span>{cluster.karpenterConfig.nodePoolLimits.memory}</span></div>
              <div className="flex justify-between py-2"><span className="text-text-secondary">GPU Limit</span><span>{cluster.karpenterConfig.nodePoolLimits.gpu}</span></div>
            </div>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-3">Provisioner YAML</h3>
            <pre className="text-xs text-text-secondary bg-bg-primary p-4 rounded-lg overflow-x-auto font-mono">
{`apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: ${cluster.name}-default
spec:
  consolidation:
    enabled: ${cluster.karpenterConfig.enabled}
  ttlSecondsAfterEmpty: ${cluster.karpenterConfig.ttlSecondsAfterEmpty}
  limits:
    resources:
      cpu: "${cluster.karpenterConfig.nodePoolLimits.cpu}"
      memory: "${cluster.karpenterConfig.nodePoolLimits.memory}"
      nvidia.com/gpu: "${cluster.karpenterConfig.nodePoolLimits.gpu}"`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
