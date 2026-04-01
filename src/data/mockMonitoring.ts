import type { NodeHealth, PodStatusSummary, GpuMetric, ServiceLatency, LogEntry, KubernetesEvent, AlertRule } from '../types'

// 24-hour CPU/Memory time series (business-hour peaks)
export const clusterCpuMemoryTimeSeries = Array.from({ length: 24 }, (_, i) => {
  const hour = i
  // Simulate business hours pattern: low at night, peaks 9-17
  const baseLoad = hour >= 8 && hour <= 18 ? 55 : 25
  const cpuNoise = Math.sin(hour * 0.8) * 12 + (Math.random() * 8 - 4)
  const memNoise = Math.sin(hour * 0.6) * 8 + (Math.random() * 6 - 3)
  return {
    time: `${String(hour).padStart(2, '0')}:00`,
    cpu: Math.round(Math.max(15, Math.min(95, baseLoad + cpuNoise + 10))),
    memory: Math.round(Math.max(30, Math.min(92, baseLoad + memNoise + 15))),
  }
})

// Node health
export const mockNodeHealth: NodeHealth[] = [
  { name: 'ip-10-0-1-42', status: 'Ready', cpuPercent: 72, memoryPercent: 68, diskPercent: 45, gpuPercent: 89, conditions: ['Ready'], instanceType: 'p4d.24xlarge', age: '14d' },
  { name: 'ip-10-0-1-87', status: 'Ready', cpuPercent: 56, memoryPercent: 74, diskPercent: 38, gpuPercent: 78, conditions: ['Ready'], instanceType: 'p4d.24xlarge', age: '14d' },
  { name: 'ip-10-0-2-15', status: 'Ready', cpuPercent: 83, memoryPercent: 82, diskPercent: 52, gpuPercent: 92, conditions: ['Ready'], instanceType: 'g5.12xlarge', age: '7d' },
  { name: 'ip-10-0-2-63', status: 'NotReady', cpuPercent: 95, memoryPercent: 94, diskPercent: 87, gpuPercent: null, conditions: ['MemoryPressure', 'DiskPressure'], instanceType: 'g5.12xlarge', age: '7d' },
  { name: 'ip-10-0-3-21', status: 'Ready', cpuPercent: 41, memoryPercent: 55, diskPercent: 29, gpuPercent: 65, conditions: ['Ready'], instanceType: 'g5.48xlarge', age: '21d' },
  { name: 'ip-10-0-3-98', status: 'Ready', cpuPercent: 62, memoryPercent: 61, diskPercent: 34, gpuPercent: 71, conditions: ['Ready'], instanceType: 'inf2.24xlarge', age: '3d' },
  { name: 'ip-10-0-4-44', status: 'Ready', cpuPercent: 38, memoryPercent: 42, diskPercent: 22, gpuPercent: null, conditions: ['Ready'], instanceType: 'm5.4xlarge', age: '30d' },
]

// Pod status summary
export const mockPodStatus: PodStatusSummary = {
  running: 142,
  pending: 3,
  failed: 1,
  crashLoopBackOff: 2,
  succeeded: 28,
}

// GPU metrics (DCGM)
export const mockGpuMetrics: GpuMetric[] = [
  { id: 'gpu-0', name: 'GPU 0', model: 'NVIDIA A100 80GB', utilizationPercent: 89, memoryUsedMiB: 71680, memoryTotalMiB: 81920, temperatureC: 72, powerW: 312, powerCapW: 400 },
  { id: 'gpu-1', name: 'GPU 1', model: 'NVIDIA A100 80GB', utilizationPercent: 92, memoryUsedMiB: 73728, memoryTotalMiB: 81920, temperatureC: 75, powerW: 335, powerCapW: 400 },
  { id: 'gpu-2', name: 'GPU 2', model: 'NVIDIA A100 80GB', utilizationPercent: 78, memoryUsedMiB: 61440, memoryTotalMiB: 81920, temperatureC: 68, powerW: 278, powerCapW: 400 },
  { id: 'gpu-3', name: 'GPU 3', model: 'NVIDIA A100 80GB', utilizationPercent: 85, memoryUsedMiB: 67584, memoryTotalMiB: 81920, temperatureC: 71, powerW: 298, powerCapW: 400 },
  { id: 'gpu-4', name: 'GPU 4', model: 'NVIDIA L40S', utilizationPercent: 67, memoryUsedMiB: 30720, memoryTotalMiB: 49152, temperatureC: 58, powerW: 215, powerCapW: 350 },
  { id: 'gpu-5', name: 'GPU 5', model: 'NVIDIA L40S', utilizationPercent: 73, memoryUsedMiB: 34816, memoryTotalMiB: 49152, temperatureC: 62, powerW: 238, powerCapW: 350 },
  { id: 'gpu-6', name: 'GPU 6', model: 'NVIDIA L40S', utilizationPercent: 95, memoryUsedMiB: 45056, memoryTotalMiB: 49152, temperatureC: 78, powerW: 325, powerCapW: 350 },
  { id: 'gpu-7', name: 'GPU 7', model: 'NVIDIA L40S', utilizationPercent: 71, memoryUsedMiB: 32768, memoryTotalMiB: 49152, temperatureC: 55, powerW: 222, powerCapW: 350 },
]

// Network time series
export const networkTimeSeries = Array.from({ length: 24 }, (_, i) => {
  const hour = i
  const base = hour >= 8 && hour <= 18 ? 1800 : 600
  return {
    time: `${String(hour).padStart(2, '0')}:00`,
    ingressMbps: Math.round(base + Math.random() * 400),
    egressMbps: Math.round(base * 0.7 + Math.random() * 300),
  }
})

// Service latency
export const mockServiceLatency: ServiceLatency[] = [
  { service: 'llm-inference-svc', p50Ms: 145, p95Ms: 380, p99Ms: 720, requestsPerSec: 342 },
  { service: 'model-registry-api', p50Ms: 12, p95Ms: 45, p99Ms: 89, requestsPerSec: 128 },
  { service: 'training-controller', p50Ms: 28, p95Ms: 92, p99Ms: 156, requestsPerSec: 45 },
  { service: 'metrics-collector', p50Ms: 5, p95Ms: 18, p99Ms: 34, requestsPerSec: 890 },
  { service: 'model-serving-gateway', p50Ms: 78, p95Ms: 210, p99Ms: 540, requestsPerSec: 567 },
  { service: 'data-pipeline-svc', p50Ms: 234, p95Ms: 560, p99Ms: 1200, requestsPerSec: 23 },
]

// Log entries
export const mockLogEntries: LogEntry[] = [
  { timestamp: '2025-03-23T14:32:18Z', namespace: 'ml-serving', pod: 'llm-inference-7f8d9c-x4k2p', container: 'vllm', severity: 'info', message: 'Model loaded successfully: meta-llama/Llama-3.1-70B-Instruct' },
  { timestamp: '2025-03-23T14:31:45Z', namespace: 'ml-serving', pod: 'llm-inference-7f8d9c-x4k2p', container: 'vllm', severity: 'info', message: 'Serving on http://0.0.0.0:8000 with tensor_parallel_size=4' },
  { timestamp: '2025-03-23T14:30:12Z', namespace: 'kube-system', pod: 'coredns-5d78c9869d-abc12', container: 'coredns', severity: 'info', message: 'CoreDNS-1.10.1 linux/amd64, go1.20.7' },
  { timestamp: '2025-03-23T14:29:55Z', namespace: 'monitoring', pod: 'prometheus-server-0', container: 'prometheus', severity: 'warn', message: 'Chunk pool exhaustion, allocating new chunk from OS: 2.4MB' },
  { timestamp: '2025-03-23T14:28:33Z', namespace: 'ml-serving', pod: 'model-registry-6b5c4d-m3n1q', container: 'registry', severity: 'info', message: 'Synced 8 models from S3 bucket s3://kubogent-models/registry/' },
  { timestamp: '2025-03-23T14:27:18Z', namespace: 'default', pod: 'training-job-mistral-7b-ft-2', container: 'trainer', severity: 'info', message: 'Epoch 3/5 completed. Loss: 0.2341, LR: 2.0e-5' },
  { timestamp: '2025-03-23T14:26:01Z', namespace: 'kube-system', pod: 'karpenter-5f9b7c-k8m2j', container: 'controller', severity: 'info', message: 'Launched instance i-0a1b2c3d4e5f67890, type=g5.12xlarge, zone=us-east-1a' },
  { timestamp: '2025-03-23T14:25:44Z', namespace: 'ml-serving', pod: 'llm-inference-7f8d9c-r9p3v', container: 'vllm', severity: 'error', message: 'CUDA out of memory. Tried to allocate 2.00 GiB. GPU 0 has 0.12 GiB remaining.' },
  { timestamp: '2025-03-23T14:24:30Z', namespace: 'monitoring', pod: 'grafana-6f8d9c-t5v2w', container: 'grafana', severity: 'info', message: 'HTTP Server Listen addr=0.0.0.0:3000 subUrl= protocol=http' },
  { timestamp: '2025-03-23T14:23:15Z', namespace: 'kube-system', pod: 'aws-node-7h9j2', container: 'aws-node', severity: 'warn', message: 'Insufficient IP addresses available in subnet-0abc123: 4 remaining' },
  { timestamp: '2025-03-23T14:22:08Z', namespace: 'ml-serving', pod: 'data-pipeline-4k2m8-worker-0', container: 'spark', severity: 'info', message: 'Stage 12 (parquet scan) completed in 4.2s, 1.2M rows processed' },
  { timestamp: '2025-03-23T14:21:33Z', namespace: 'default', pod: 'codellama-build-job-x7n2p', container: 'builder', severity: 'info', message: 'Docker image build completed: kubogent/codellama-34b:v2.1.0' },
  { timestamp: '2025-03-23T14:20:18Z', namespace: 'kube-system', pod: 'ebs-csi-controller-0', container: 'ebs-plugin', severity: 'error', message: 'Volume vol-0f1e2d3c4b5a6789 attachment timed out after 60s' },
  { timestamp: '2025-03-23T14:19:02Z', namespace: 'monitoring', pod: 'fluent-bit-8x2n4', container: 'fluent-bit', severity: 'info', message: 'Output cloudwatch_logs: sent 2847 events to log group /kubogent/eks-prod' },
  { timestamp: '2025-03-23T14:18:45Z', namespace: 'ml-serving', pod: 'whisper-asr-5c7d9e-h3k4m', container: 'triton', severity: 'info', message: 'Model whisper-large-v3 loaded on GPU 0, max_batch_size=8' },
  { timestamp: '2025-03-23T14:17:30Z', namespace: 'default', pod: 'training-job-mistral-7b-ft-2', container: 'trainer', severity: 'warn', message: 'Gradient overflow detected at step 4521, scaling factor reduced to 0.5' },
  { timestamp: '2025-03-23T14:16:12Z', namespace: 'kube-system', pod: 'karpenter-5f9b7c-k8m2j', container: 'controller', severity: 'info', message: 'Consolidated 2 empty nodes, terminated i-0987654321fedcba' },
  { timestamp: '2025-03-23T14:15:01Z', namespace: 'ml-serving', pod: 'llm-inference-7f8d9c-x4k2p', container: 'vllm', severity: 'debug', message: 'KV cache utilization: 78.4%, pending requests in queue: 12' },
]

// Kubernetes events
export const mockKubeEvents: KubernetesEvent[] = [
  { type: 'Normal', reason: 'Scheduled', object: 'pod/llm-inference-7f8d9c-x4k2p', message: 'Successfully assigned ml-serving/llm-inference-7f8d9c-x4k2p to ip-10-0-1-42', count: 1, firstSeen: '14m ago', lastSeen: '14m ago' },
  { type: 'Normal', reason: 'Pulled', object: 'pod/llm-inference-7f8d9c-x4k2p', message: 'Container image "kubogent/vllm:0.4.2" already present on machine', count: 1, firstSeen: '14m ago', lastSeen: '14m ago' },
  { type: 'Normal', reason: 'Created', object: 'pod/llm-inference-7f8d9c-x4k2p', message: 'Created container vllm', count: 1, firstSeen: '13m ago', lastSeen: '13m ago' },
  { type: 'Normal', reason: 'Started', object: 'pod/llm-inference-7f8d9c-x4k2p', message: 'Started container vllm', count: 1, firstSeen: '13m ago', lastSeen: '13m ago' },
  { type: 'Warning', reason: 'FailedScheduling', object: 'pod/training-job-large-x9m2p', message: 'Insufficient nvidia.com/gpu: requested 8, available 4', count: 3, firstSeen: '45m ago', lastSeen: '12m ago' },
  { type: 'Warning', reason: 'BackOff', object: 'pod/model-registry-6b5c4d-crash1', message: 'Back-off restarting failed container registry in pod model-registry-6b5c4d-crash1', count: 8, firstSeen: '2h ago', lastSeen: '5m ago' },
  { type: 'Normal', reason: 'ScalingReplicaSet', object: 'deployment/llm-inference', message: 'Scaled up replica set llm-inference-7f8d9c to 4', count: 1, firstSeen: '1h ago', lastSeen: '1h ago' },
  { type: 'Warning', reason: 'Unhealthy', object: 'pod/metrics-collector-3k4m5-w2x1y', message: 'Liveness probe failed: HTTP probe failed with statuscode: 503', count: 2, firstSeen: '30m ago', lastSeen: '15m ago' },
  { type: 'Normal', reason: 'Provisioned', object: 'node/ip-10-0-2-15', message: 'Karpenter launched instance i-0a1b2c3d4e, type=g5.12xlarge', count: 1, firstSeen: '2h ago', lastSeen: '2h ago' },
  { type: 'Normal', reason: 'NodeReady', object: 'node/ip-10-0-2-15', message: 'Node ip-10-0-2-15 status is now: NodeReady', count: 1, firstSeen: '2h ago', lastSeen: '2h ago' },
  { type: 'Warning', reason: 'OOMKilled', object: 'pod/data-pipeline-4k2m8-worker-2', message: 'Container spark was OOMKilled (memory limit: 16Gi, used: 16.2Gi)', count: 1, firstSeen: '3h ago', lastSeen: '3h ago' },
  { type: 'Normal', reason: 'SuccessfulAttachVolume', object: 'pod/prometheus-server-0', message: 'AttachVolume.Attach succeeded for volume "pvc-monitoring-data"', count: 1, firstSeen: '6h ago', lastSeen: '6h ago' },
]

// Alert rules
export const mockAlertRules: AlertRule[] = [
  { id: 'alert-1', name: 'HighNodeMemoryPressure', severity: 'critical', state: 'firing', expression: 'node_memory_utilization > 90', lastFired: '5m ago', description: 'Node memory utilization exceeds 90% threshold' },
  { id: 'alert-2', name: 'GPUTemperatureHigh', severity: 'warning', state: 'firing', expression: 'dcgm_gpu_temp > 80', lastFired: '12m ago', description: 'GPU temperature exceeds 80°C safe threshold' },
  { id: 'alert-3', name: 'PodCrashLooping', severity: 'critical', state: 'firing', expression: 'kube_pod_container_status_restart_total > 5', lastFired: '8m ago', description: 'Pod has restarted more than 5 times in 10 minutes' },
  { id: 'alert-4', name: 'HighInferenceLatency', severity: 'warning', state: 'pending', expression: 'inference_latency_p99 > 1000', lastFired: null, description: 'P99 inference latency exceeds 1 second' },
  { id: 'alert-5', name: 'DiskSpaceLow', severity: 'warning', state: 'resolved', expression: 'node_disk_utilization > 85', lastFired: '2h ago', description: 'Node disk space utilization exceeds 85%' },
  { id: 'alert-6', name: 'KarpenterProvisioningFailed', severity: 'info', state: 'resolved', expression: 'karpenter_provisioning_error_total > 0', lastFired: '6h ago', description: 'Karpenter failed to provision a node' },
  { id: 'alert-7', name: 'HighErrorRate', severity: 'critical', state: 'resolved', expression: 'http_error_rate_5xx > 5', lastFired: '1d ago', description: 'HTTP 5xx error rate exceeds 5% of total requests' },
  { id: 'alert-8', name: 'GPUMemoryExhausted', severity: 'critical', state: 'pending', expression: 'dcgm_fb_used / dcgm_fb_total > 0.95', lastFired: null, description: 'GPU framebuffer memory usage exceeds 95%' },
  { id: 'alert-9', name: 'IPAddressExhaustion', severity: 'warning', state: 'firing', expression: 'aws_subnet_available_ips < 10', lastFired: '3m ago', description: 'Subnet has fewer than 10 available IP addresses' },
]
