import type { ActivityItem } from '../types'

export const gpuUtilizationData = [
  { time: '00:00', value: 72 }, { time: '02:00', value: 68 }, { time: '04:00', value: 55 },
  { time: '06:00', value: 61 }, { time: '08:00', value: 78 }, { time: '10:00', value: 85 },
  { time: '12:00', value: 82 }, { time: '14:00', value: 88 }, { time: '16:00', value: 91 },
  { time: '18:00', value: 86 }, { time: '20:00', value: 79 }, { time: '22:00', value: 74 },
]

export const inferenceLatencyData = [
  { day: 'Mon', p50: 42, p95: 120, p99: 380 },
  { day: 'Tue', p50: 38, p95: 105, p99: 340 },
  { day: 'Wed', p50: 45, p95: 135, p99: 420 },
  { day: 'Thu', p50: 41, p95: 110, p99: 360 },
  { day: 'Fri', p50: 36, p95: 98, p99: 310 },
  { day: 'Sat', p50: 32, p95: 85, p99: 280 },
  { day: 'Sun', p50: 34, p95: 90, p99: 295 },
]

export const costBreakdownData = [
  { name: 'eks-prod-us-east-1', compute: 28400, storage: 3200, networking: 1800 },
  { name: 'eks-staging-us-west-2', compute: 6100, storage: 800, networking: 450 },
  { name: 'eks-dev-eu-west-1', compute: 3200, storage: 400, networking: 200 },
  { name: 'eks-training-us-east-1', compute: 0, storage: 0, networking: 0 },
  { name: 'eks-inference-ap-south-1', compute: 4800, storage: 600, networking: 350 },
]

export const clusterHealthData = [
  { day: 'Mar 16', score: 98 }, { day: 'Mar 17', score: 97 }, { day: 'Mar 18', score: 99 },
  { day: 'Mar 19', score: 96 }, { day: 'Mar 20', score: 94 }, { day: 'Mar 21', score: 92 },
  { day: 'Mar 22', score: 95 },
]

export const dashboardSparklines = {
  clusters: [3, 3, 4, 4, 4, 5, 5],
  models: [4, 5, 5, 6, 6, 7, 8],
  gpuUtil: [65, 70, 72, 75, 78, 80, 78],
  cost: [38000, 39000, 40500, 41200, 42000, 42500, 42850],
  deployments: [2, 3, 3, 3, 4, 4, 4],
}

export const recentActivity: ActivityItem[] = [
  { id: 'a1', type: 'deployment', message: 'Llama-3.1-70B deployed to eks-prod-us-east-1', timestamp: '2 hours ago', status: 'success' },
  { id: 'a2', type: 'cluster', message: 'eks-training-us-east-1 provisioning started', timestamp: '3 hours ago', status: 'info' },
  { id: 'a3', type: 'alert', message: 'eks-inference-ap-south-1 node health check failed', timestamp: '4 hours ago', status: 'error' },
  { id: 'a4', type: 'model', message: 'CodeLlama-34B-Python build initiated from GitHub', timestamp: '5 hours ago', status: 'info' },
  { id: 'a5', type: 'pipeline', message: 'Whisper ASR Optimization pipeline completed', timestamp: '8 hours ago', status: 'success' },
  { id: 'a6', type: 'deployment', message: 'Mistral-7B autoscaled from 1 to 2 replicas', timestamp: '10 hours ago', status: 'warning' },
  { id: 'a7', type: 'pipeline', message: 'FinBERT Retraining Pipeline failed at training stage', timestamp: '2 days ago', status: 'error' },
  { id: 'a8', type: 'model', message: 'Gemma-2-27B build failed - CUDA version mismatch', timestamp: '3 days ago', status: 'error' },
]

export const deploymentLatencyTimeSeries = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  ttft: Math.round(380 + Math.random() * 80),
  throughput: Math.round(240 + Math.random() * 60),
}))

export const gpuMemoryPerNode = [
  { gpu: 'GPU 0', used: 40471, total: 46068, model: 'NVIDIA L40S' },
  { gpu: 'GPU 1', used: 40471, total: 46068, model: 'NVIDIA L40S' },
  { gpu: 'GPU 2', used: 42100, total: 46068, model: 'NVIDIA L40S' },
  { gpu: 'GPU 3', used: 40471, total: 46068, model: 'NVIDIA L40S' },
]
