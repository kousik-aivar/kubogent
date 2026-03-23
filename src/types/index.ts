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
}

// Pipeline types
export interface PipelineStage {
  id: string;
  name: string;
  type: 'data-prep' | 'training' | 'evaluation' | 'deployment' | 'monitoring';
  status: 'Completed' | 'Running' | 'Pending' | 'Failed';
  duration: string;
  position: { x: number; y: number };
}

export interface Pipeline {
  id: string;
  name: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Idle';
  lastRun: string;
  duration: string;
  stages: PipelineStage[];
  scheduler: 'Argo Workflows' | 'Kubeflow' | 'Kueue';
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
