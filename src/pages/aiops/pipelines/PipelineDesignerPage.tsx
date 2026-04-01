import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Database, Brain, BarChart3, Rocket, Activity, Package } from 'lucide-react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type EdgeProps,
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import StatusBadge from '../../../components/shared/StatusBadge'
import TabGroup from '../../../components/shared/TabGroup'
import StageDetailPanel from './StageDetailPanel'
import PipelineRunsTab from './PipelineRunsTab'
import PipelineJobsTab from './PipelineJobsTab'
import PipelineLifecycleTab from './PipelineLifecycleTab'
import PipelineConfigTab from './PipelineConfigTab'
import PipelineCodeTab from './PipelineCodeTab'
import { mockPipelines } from '../../../data/mockPipelines'
import type { PipelineStage } from '../../../types'

const typeColors: Record<string, { bg: string; border: string; icon: typeof Database; handleColor: string }> = {
  'data-prep': { bg: 'bg-accent-blue/10', border: 'border-accent-blue', icon: Database, handleColor: '#3b82f6' },
  training: { bg: 'bg-accent-purple/10', border: 'border-accent-purple', icon: Brain, handleColor: '#a855f7' },
  evaluation: { bg: 'bg-accent-amber/10', border: 'border-accent-amber', icon: BarChart3, handleColor: '#f59e0b' },
  deployment: { bg: 'bg-accent-green/10', border: 'border-accent-green', icon: Rocket, handleColor: '#22c55e' },
  monitoring: { bg: 'bg-accent-cyan/10', border: 'border-accent-cyan', icon: Activity, handleColor: '#06b6d4' },
}

function PipelineNode({ data }: { data: { label: string; type: string; status: string; duration: string; resources?: { cpu: string; memory: string; gpu: string }; artifactCount?: number } }) {
  const style = typeColors[data.type] || typeColors['data-prep']
  const Icon = style.icon
  const isRunning = data.status === 'Running'

  return (
    <div className={`border ${data.status === 'Running' ? 'border-accent-blue' : data.status === 'Completed' ? 'border-accent-green/60' : 'border-border-light'} bg-bg-secondary rounded-xl p-4 w-64 shadow-xl relative`}>
      {/* Colored top accent bar */}
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-b`} style={{ backgroundColor: style.handleColor }} />

      {/* Source handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: style.handleColor, width: 10, height: 10, border: '2px solid #111111', top: -5 }}
      />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${style.handleColor}20` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: style.handleColor }} />
        </div>
        <span className="text-sm font-semibold text-text-primary flex-1">{data.label}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <StatusBadge status={data.status} />
        {data.duration !== '-' && <span className="text-xs text-text-muted">{data.duration}</span>}
      </div>
      {isRunning && (
        <div className="h-1.5 rounded-full bg-bg-tertiary mb-2 overflow-hidden">
          <div className="h-1.5 rounded-full bg-accent-blue animate-pulse" style={{ width: '65%' }} />
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

      {/* Target handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: style.handleColor, width: 10, height: 10, border: '2px solid #111111', bottom: -5 }}
      />
    </div>
  )
}

// Custom edge with label and bright styling
function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style: edgeStyle }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    curvature: 0.4,
  })

  const label = (data as { label?: string })?.label
  const edgeColor = (edgeStyle as { stroke?: string })?.stroke || '#22c55e'

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth: 2.5,
          strokeDasharray: '8 4',
          filter: `drop-shadow(0 0 3px ${edgeColor}40)`,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: `${edgeColor}15`,
              border: `1px solid ${edgeColor}40`,
              color: edgeColor,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const nodeTypes = { pipeline: PipelineNode }
const edgeTypes = { custom: CustomEdge }

const designerTabs = [
  { key: 'designer', label: 'Designer' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'lifecycle', label: 'Lifecycle' },
  { key: 'runs', label: 'Runs' },
  { key: 'configuration', label: 'Configuration' },
  { key: 'code', label: 'Code' },
]

function getEdgeLabel(parentStatus: string): string {
  if (parentStatus === 'Completed') return '✓ Completed'
  if (parentStatus === 'Running') return '⟳ In progress'
  return 'On success'
}

function getEdgeColor(parentStatus: string): string {
  if (parentStatus === 'Completed') return '#22c55e'
  if (parentStatus === 'Running') return '#3b82f6'
  return '#22c55e'  // bright green for pending "on success" edges
}

export default function PipelineDesignerPage() {
  const { id } = useParams()
  const pipeline = mockPipelines.find((p) => p.id === id)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('designer')

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedNode(node.id)
  }, [setSelectedNode])

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
        const parentStatus = parent?.status || 'Pending'
        edges.push({
          id: `e-${parentId}-${stage.id}`,
          source: parentId,
          target: stage.id,
          type: 'custom',
          animated: parentStatus === 'Running',
          data: { label: getEdgeLabel(parentStatus) },
          style: {
            stroke: getEdgeColor(parentStatus),
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
        type: 'custom',
        animated: stage.status === 'Running',
        data: { label: getEdgeLabel(stage.status) },
        style: { stroke: getEdgeColor(stage.status) },
      })
    })
  }

  const selectedStage: PipelineStage | undefined = pipeline.stages.find((s) => s.id === selectedNode)

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
              edgeTypes={edgeTypes}
              onNodeClick={onNodeClick}
              fitView
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{ type: 'custom' }}
            >
              <Background color="#333333" gap={24} size={1.5} />
              <Controls />
              <MiniMap style={{ backgroundColor: '#111111' }} nodeColor="#333333" maskColor="rgba(0,0,0,0.5)" />
            </ReactFlow>
          </div>
          {selectedStage && (
            <StageDetailPanel stage={selectedStage} onClose={() => setSelectedNode(null)} />
          )}
        </div>
      )}

      {activeTab === 'jobs' && <PipelineJobsTab pipeline={pipeline} />}
      {activeTab === 'lifecycle' && <PipelineLifecycleTab pipeline={pipeline} />}
      {activeTab === 'runs' && <PipelineRunsTab pipeline={pipeline} />}
      {activeTab === 'configuration' && <PipelineConfigTab pipeline={pipeline} />}
      {activeTab === 'code' && <PipelineCodeTab pipeline={pipeline} />}
    </div>
  )
}
