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
export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
}
