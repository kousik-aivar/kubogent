import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Database, Brain, BarChart3, Rocket, Activity } from 'lucide-react'
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
import { mockPipelines } from '../../../data/mockPipelines'

const typeColors: Record<string, { bg: string; border: string; icon: typeof Database }> = {
  'data-prep': { bg: 'bg-accent-blue/10', border: 'border-accent-blue', icon: Database },
  training: { bg: 'bg-accent-purple/10', border: 'border-accent-purple', icon: Brain },
  evaluation: { bg: 'bg-accent-amber/10', border: 'border-accent-amber', icon: BarChart3 },
  deployment: { bg: 'bg-accent-green/10', border: 'border-accent-green', icon: Rocket },
  monitoring: { bg: 'bg-accent-cyan/10', border: 'border-accent-cyan', icon: Activity },
}

function PipelineNode({ data }: { data: { label: string; type: string; status: string; duration: string } }) {
  const style = typeColors[data.type] || typeColors['data-prep']
  const Icon = style.icon
  return (
    <div className={`${style.bg} border-l-4 ${style.border} bg-bg-secondary rounded-lg p-3 w-56 shadow-lg`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">{data.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={data.status} />
        {data.duration !== '-' && <span className="text-xs text-text-muted">{data.duration}</span>}
      </div>
    </div>
  )
}

const nodeTypes = { pipeline: PipelineNode }

export default function PipelineDesignerPage() {
  const { id } = useParams()
  const pipeline = mockPipelines.find((p) => p.id === id)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  if (!pipeline) return <div className="text-text-muted">Pipeline not found</div>

  const nodes: Node[] = pipeline.stages.map((stage) => ({
    id: stage.id,
    type: 'pipeline',
    position: stage.position,
    data: { label: stage.name, type: stage.type, status: stage.status, duration: stage.duration },
  }))

  const edges: Edge[] = pipeline.stages.slice(0, -1).map((stage, i) => ({
    id: `e-${stage.id}-${pipeline.stages[i + 1].id}`,
    source: stage.id,
    target: pipeline.stages[i + 1].id,
    animated: stage.status === 'Running' || stage.status === 'Completed',
    style: { stroke: stage.status === 'Completed' ? '#22c55e' : stage.status === 'Running' ? '#3b82f6' : '#262626', strokeWidth: 2 },
  }))

  const selectedStage = pipeline.stages.find((s) => s.id === selectedNode)

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

      <div className="flex gap-4" style={{ height: 'calc(100vh - 240px)' }}>
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
          <div className="w-72 bg-bg-secondary border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-text-primary mb-3">Stage Details</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-text-muted">Name:</span> <span className="text-text-primary">{selectedStage.name}</span></div>
              <div><span className="text-text-muted">Type:</span> <span className="text-text-primary capitalize">{selectedStage.type.replace('-', ' ')}</span></div>
              <div className="flex items-center gap-2"><span className="text-text-muted">Status:</span> <StatusBadge status={selectedStage.status} /></div>
              <div><span className="text-text-muted">Duration:</span> <span className="text-text-primary">{selectedStage.duration}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
