import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Database, Brain, BarChart3, Rocket, Activity, Package } from 'lucide-react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import StatusBadge from '../../../components/shared/StatusBadge'
import TabGroup from '../../../components/shared/TabGroup'
import StageDetailPanel from './StageDetailPanel'
import PipelineRunsTab from './PipelineRunsTab'
import PipelineConfigTab from './PipelineConfigTab'
import PipelineCodeTab from './PipelineCodeTab'
import { mockPipelines } from '../../../data/mockPipelines'
import type { PipelineStage } from '../../../types'

const typeColors: Record<string, { bg: string; border: string; icon: typeof Database }> = {
  'data-prep': { bg: 'bg-accent-blue/10', border: 'border-accent-blue', icon: Database },
  training: { bg: 'bg-accent-purple/10', border: 'border-accent-purple', icon: Brain },
  evaluation: { bg: 'bg-accent-amber/10', border: 'border-accent-amber', icon: BarChart3 },
  deployment: { bg: 'bg-accent-green/10', border: 'border-accent-green', icon: Rocket },
  monitoring: { bg: 'bg-accent-cyan/10', border: 'border-accent-cyan', icon: Activity },
}

function PipelineNode({ data }: { data: { label: string; type: string; status: string; duration: string; resources?: { cpu: string; memory: string; gpu: string }; artifactCount?: number } }) {
  const style = typeColors[data.type] || typeColors['data-prep']
  const Icon = style.icon
  const isRunning = data.status === 'Running'

  return (
    <div className={`${style.bg} border-l-4 ${style.border} bg-bg-secondary rounded-lg p-3 w-60 shadow-lg`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 text-text-secondary" />
        <span className="text-sm font-medium text-text-primary flex-1">{data.label}</span>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <StatusBadge status={data.status} />
        {data.duration !== '-' && <span className="text-xs text-text-muted">{data.duration}</span>}
      </div>
      {isRunning && (
        <div className="h-1 rounded-full bg-bg-tertiary mb-1.5 overflow-hidden">
          <div className="h-1 rounded-full bg-accent-blue animate-pulse" style={{ width: '65%' }} />
        </div>
      )}
      <div className="flex items-center gap-2 text-[10px] text-text-muted">
        {data.resources && data.resources.gpu !== '0' && (
          <span className="px-1.5 py-0.5 rounded bg-bg-tertiary">{data.resources.gpu.split(' ')[0]} GPU</span>
        )}
        {data.resources && <span className="px-1.5 py-0.5 rounded bg-bg-tertiary">{data.resources.memory}</span>}
        {data.artifactCount !== undefined && data.artifactCount > 0 && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-bg-tertiary">
            <Package className="w-2.5 h-2.5" />{data.artifactCount}
          </span>
        )}
      </div>
    </div>
  )
}

const nodeTypes = { pipeline: PipelineNode }

const designerTabs = [
  { key: 'designer', label: 'Designer' },
  { key: 'runs', label: 'Runs' },
  { key: 'configuration', label: 'Configuration' },
  { key: 'code', label: 'Code' },
]

export default function PipelineDesignerPage() {
  const { id } = useParams()
  const pipeline = mockPipelines.find((p) => p.id === id)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('designer')

  if (!pipeline) return <div className="text-text-muted">Pipeline not found</div>

  const nodes: Node[] = pipeline.stages.map((stage) => ({
    id: stage.id,
    type: 'pipeline',
    position: stage.position,
    data: {
      label: stage.name,
      type: stage.type,
      status: stage.status,
      duration: stage.duration,
      resources: stage.resources,
      artifactCount: stage.artifacts?.length || 0,
    },
  }))

  // Build edges from parentIds (DAG support)
  const edges: Edge[] = []
  pipeline.stages.forEach((stage) => {
    if (stage.parentIds && stage.parentIds.length > 0) {
      stage.parentIds.forEach((parentId) => {
        const parent = pipeline.stages.find(s => s.id === parentId)
        edges.push({
          id: `e-${parentId}-${stage.id}`,
          source: parentId,
          target: stage.id,
          animated: parent?.status === 'Running' || parent?.status === 'Completed',
          style: {
            stroke: parent?.status === 'Completed' ? '#22c55e' : parent?.status === 'Running' ? '#3b82f6' : '#262626',
            strokeWidth: 2,
          },
        })
      })
    }
  })

  // Fallback: sequential edges if no parentIds defined
  if (edges.length === 0) {
    pipeline.stages.slice(0, -1).forEach((stage, i) => {
      edges.push({
        id: `e-${stage.id}-${pipeline.stages[i + 1].id}`,
        source: stage.id,
        target: pipeline.stages[i + 1].id,
        animated: stage.status === 'Running' || stage.status === 'Completed',
        style: { stroke: stage.status === 'Completed' ? '#22c55e' : stage.status === 'Running' ? '#3b82f6' : '#262626', strokeWidth: 2 },
      })
    })
  }

  const selectedStage: PipelineStage | undefined = pipeline.stages.find((s) => s.id === selectedNode)

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedNode(node.id)
  }, [])

  return (
    <div>
      <Link to="/aiops/pipelines" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Pipelines
      </Link>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-text-primary">{pipeline.name}</h1>
          <StatusBadge status={pipeline.status} />
          <span className="text-sm text-text-muted">{pipeline.scheduler}</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white rounded-lg text-sm font-medium hover:bg-accent-green/90 transition-colors">
          <Play className="w-4 h-4" /> Run Pipeline
        </button>
      </div>

      <TabGroup tabs={designerTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'designer' && (
        <div className="flex gap-4" style={{ height: 'calc(100vh - 280px)' }}>
          <div className="flex-1 bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#262626" gap={20} />
              <Controls />
              <MiniMap style={{ backgroundColor: '#111111' }} nodeColor="#262626" maskColor="rgba(0,0,0,0.5)" />
            </ReactFlow>
          </div>
          {selectedStage && (
            <StageDetailPanel stage={selectedStage} onClose={() => setSelectedNode(null)} />
          )}
        </div>
      )}

      {activeTab === 'runs' && <PipelineRunsTab pipeline={pipeline} />}
      {activeTab === 'configuration' && <PipelineConfigTab pipeline={pipeline} />}
      {activeTab === 'code' && <PipelineCodeTab pipeline={pipeline} />}
    </div>
  )
}
