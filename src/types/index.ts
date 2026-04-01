import type { LucideIcon } from 'lucide-react';

// Navigation
export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  children?: NavItem[];
}

// Cluster types
export interface NodeGroup {
  name: string;
  instanceType: string;
  desiredCount: number;
  minCount: number;
  maxCount: number;
  gpuType: string;
  gpuPerNode: number;
  status: 'Active' | 'Updating' | 'Degraded';
}

export interface KarpenterConfig {
  enabled: boolean;
  consolidationPolicy: 'WhenUnderutilized' | 'WhenEmpty';
  ttlSecondsAfterEmpty: number;
  nodePoolLimits: { cpu: string; memory: string; gpu: string };
}

export interface Cluster {
  id: string;
  name: string;
  status: 'Running' | 'Provisioning' | 'Error' | 'Stopped';
  region: string;
  k8sVersion: string;
  nodeCount: number;
  gpuCount: number;
  gpuType: string;
  costPerHour: number;
  createdAt: string;
  nodeGroups: NodeGroup[];
  karpenterConfig: KarpenterConfig;
  vpcId: string;
  subnetIds: string[];
  securityGroups: string[];
}

// Model types
export type ModelCategory =
  | 'llm'
  | 'slm'
  | 'code'
  | 'embedding'
  | 'stt'
  | 'tts'
  | 'vision'
  | 'video-gen'
  | 'object-detect'
  | 'traditional-ml'
  | 'diffusion';

export const MODEL_CATEGORY_LABELS: Record<ModelCategory, string> = {
  llm: 'LLM',
  slm: 'SLM',
  code: 'Code',
  embedding: 'Embedding',
  stt: 'STT',
  tts: 'TTS',
  vision: 'Vision',
  'video-gen': 'Video Gen',
  'object-detect': 'Object Detection',
  'traditional-ml': 'Traditional ML',
  diffusion: 'Diffusion',
};

export const TRAINING_METHODS: Record<ModelCategory, string[]> = {
  llm: ['LoRA', 'QLoRA', 'Full Fine-tune', 'SFT', 'DPO', 'RLHF'],
  slm: ['LoRA', 'QLoRA', 'Full Fine-tune', 'SFT', 'DPO'],
  code: ['LoRA', 'QLoRA', 'Full Fine-tune', 'SFT'],
  embedding: ['Sequence Classification', 'NER', 'SimCSE', 'Contrastive'],
  stt: ['CTC Fine-tune', 'Seq2Seq Fine-tune', 'Adapter'],
  tts: ['Speaker Adaptation', 'VITS Fine-tune', 'StyleTTS2'],
  vision: ['LoRA', 'Full Fine-tune', 'Linear Probe'],
  'video-gen': ['LoRA (Video)', 'Full Fine-tune'],
  'object-detect': ['Full Fine-tune', 'Transfer Learning'],
  'traditional-ml': ['Retrain', 'Incremental Learning', 'Hyperparameter Sweep'],
  diffusion: ['DreamBooth', 'LoRA', 'Full Fine-tune'],
};

export type InferenceEngine = 'vLLM' | 'Ray Serve' | 'Triton' | 'TensorRT-LLM';

export const INFERENCE_ENGINE_RECOMMENDATIONS: Record<ModelCategory, InferenceEngine[]> = {
  llm: ['vLLM', 'Ray Serve', 'TensorRT-LLM'],
  slm: ['vLLM', 'Ray Serve', 'TensorRT-LLM'],
  code: ['vLLM', 'Ray Serve', 'TensorRT-LLM'],
  embedding: ['Triton', 'Ray Serve'],
  stt: ['Triton', 'Ray Serve'],
  tts: ['Triton', 'Ray Serve'],
  vision: ['Triton', 'Ray Serve'],
  'video-gen': ['Ray Serve', 'Triton'],
  'object-detect': ['Triton', 'Ray Serve'],
  'traditional-ml': ['Triton', 'Ray Serve'],
  diffusion: ['Ray Serve', 'Triton'],
};

export interface InferenceEngineConfig {
  engine: InferenceEngine;
  params: Record<string, string | number | boolean>;
}

export interface ModelVersion {
  version: string;
  source: string;
  date: string;
  pipelineRunId?: string;
}

export interface Model {
  id: string;
  name: string;
  source: 'HuggingFace' | 'GitHub' | 'S3' | 'MLflow';
  status: 'Available' | 'Building' | 'Failed';
  version: string;
  size: string;
  parameters: string;
  architecture: string;
  quantization: string | null;
  lastUpdated: string;
  deploymentCount: number;
  description: string;
  modelCategory: ModelCategory;
  versions?: ModelVersion[];
}

// Deployment types
export interface Deployment {
  id: string;
  modelId: string;
  modelName: string;
  clusterId: string;
  clusterName: string;
  status: 'Running' | 'Deploying' | 'Failed' | 'Stopped';
  servingFramework: 'vLLM' | 'Ray Serve' | 'Triton' | 'TensorRT-LLM';
  endpointUrl: string;
  replicas: number;
  gpuAllocation: number;
  avgLatencyMs: number;
  throughputTokensPerSec: number;
  successRate: number;
  createdAt: string;
  gpuMemoryUsage: number;
  pipelineId?: string;
  pipelineName?: string;
  pipelineRunId?: string;
  modelVersion?: string;
  lastUpdated?: string;
  deploymentPath?: 'direct' | 'pipeline';
}

// Pipeline types
export interface StageArtifact {
  name: string;
  type: 'input' | 'output';
  path: string;
  size?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'data-prep' | 'training' | 'evaluation' | 'deployment' | 'monitoring' | 'approval' | 'model-source';
  status: 'Completed' | 'Running' | 'Pending' | 'Failed' | 'Approved' | 'Rejected';
  duration: string;
  position: { x: number; y: number };
  parentIds?: string[];
  description?: string;
  resources?: { cpu: string; memory: string; gpu: string; instanceType?: string };
  parameters?: Record<string, string | number | boolean>;
  artifacts?: StageArtifact[];
  logs?: string[];
  metrics?: Record<string, number>;
}

export interface PipelineRunStageStatus {
  stageId: string;
  stageName: string;
  status: 'Completed' | 'Running' | 'Pending' | 'Failed' | 'Skipped';
  duration: string;
}

export interface PipelineRun {
  id: string;
  runNumber: number;
  status: 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  triggeredBy: 'Manual' | 'Schedule' | 'Event' | 'Data Drift';
  startedAt: string;
  duration: string;
  stagesCompleted: number;
  totalStages: number;
  metrics?: Record<string, number>;
  stageStatuses: PipelineRunStageStatus[];
}

export interface PipelineTrigger {
  type: 'schedule' | 'event' | 'manual';
  schedule?: string;
  eventSource?: string;
}

export interface PipelineConfig {
  triggers: PipelineTrigger[];
  notifications: { channel: string; events: string[] }[];
  retryPolicy: { maxRetries: number; backoffSeconds: number };
  timeout: string;
  concurrency: number;
  artifactStoragePath: string;
}

export interface Pipeline {
  id: string;
  name: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Idle';
  lastRun: string;
  duration: string;
  stages: PipelineStage[];
  scheduler: 'Argo Workflows' | 'Kubeflow' | 'Kueue';
  description?: string;
  tags?: string[];
  triggerType?: 'Schedule' | 'Manual' | 'Event';
  successRate?: number;
  totalRuns?: number;
  avgDuration?: string;
  config?: PipelineConfig;
  runs?: PipelineRun[];
  yamlDefinition?: string;
  linkedDeploymentIds?: string[];
  lastRunStatus?: 'Running' | 'Completed' | 'Failed';
}

// Metrics
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface BenchmarkResult {
  gpuType: string;
  instanceType: string;
  ttftMs: number;
  throughputTokensPerMin: number;
  tokensPerDollar: number;
  costPerHour: number;
  modelName: string;
  vram: string;
  successRate: number;
}

// Activity
export interface ActivityItem {
  id: string;
  type: 'deployment' | 'cluster' | 'model' | 'pipeline' | 'alert';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

// Table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: string;
  label: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

// Monitoring types
export interface NodeHealth {
  name: string;
  status: 'Ready' | 'NotReady' | 'SchedulingDisabled';
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  gpuPercent: number | null;
  conditions: string[];
  instanceType: string;
  age: string;
}

export interface PodStatusSummary {
  running: number;
  pending: number;
  failed: number;
  crashLoopBackOff: number;
  succeeded: number;
}

export interface GpuMetric {
  id: string;
  name: string;
  model: string;
  utilizationPercent: number;
  memoryUsedMiB: number;
  memoryTotalMiB: number;
  temperatureC: number;
  powerW: number;
  powerCapW: number;
}

export interface ServiceLatency {
  service: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  requestsPerSec: number;
}

export interface LogEntry {
  timestamp: string;
  namespace: string;
  pod: string;
  container: string;
  severity: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface KubernetesEvent {
  type: 'Normal' | 'Warning';
  reason: string;
  object: string;
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertState = 'firing' | 'pending' | 'resolved';

export interface AlertRule {
  id: string;
  name: string;
  severity: AlertSeverity;
  state: AlertState;
  expression: string;
  lastFired: string | null;
  description: string;
}

// Training job types
export interface TrainingJob {
  id: string;
  pipelineId: string;
  pipelineName: string;
  runId: string;
  runNumber: number;
  stageName: string;
  stageType: 'training' | 'evaluation' | 'deployment';
  status: 'Running' | 'Completed' | 'Failed';
  startedAt: string;
  duration: string;
  modelId: string;
  modelName: string;
  modelVersionProduced?: string;
  resources: { gpu: string; cpu: string; memory: string };
  metrics?: Record<string, number>;
}

export interface LifecycleEvent {
  id: string;
  type: 'import' | 'training' | 'evaluation' | 'approval' | 'deployment' | 'inference' | 'failure';
  title: string;
  description: string;
  timestamp: string;
  runId?: string;
  pipelineId?: string;
  deploymentId?: string;
  modelVersion?: string;
  metrics?: Record<string, number>;
}

// AIVA types
export interface AivaSuggestion {
  id: string;
  type: 'recommendation' | 'warning' | 'insight' | 'action';
  title: string;
  body: string;
  accent: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  actionLabel?: string;
}

export interface AivaPageContext {
  page: string;
  entityName?: string;
  suggestions: AivaSuggestion[];
}

// Pipeline creation wizard state
export type PipelineCreationPath = 'training' | 'direct' | null;

export type ApprovalMode = 'manual' | 'automated';

export interface EvalApprovalConfig {
  metrics: string[];
  thresholds: Record<string, number>;
  approvalMode: ApprovalMode;
  notificationChannel: string;
}

export interface PipelineCreationState {
  modelId: string | null;
  modelSource: 'catalog' | 'import' | null;
  pipelinePath: PipelineCreationPath;
  trainingMethod: string | null;
  dataS3Path: string;
  trainValSplit: number;
  evalApproval: EvalApprovalConfig;
  inferenceEngine: InferenceEngine | null;
  inferenceEngineConfig: InferenceEngineConfig | null;
  clusterId: string | null;
  pipelineName: string;
  scheduler: 'Argo Workflows' | 'Kubeflow' | 'Kueue';
}

// Terminal types
export interface TerminalCommand {
  input: string;
  output: string;
  timestamp: string;
  isError?: boolean;
}

export interface KubectlMockResponse {
  pattern: RegExp;
  response: string | ((match: RegExpMatchArray) => string);
  isError?: boolean;
}
