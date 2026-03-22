import type { BenchmarkResult } from '../types'

export const mockBenchmarks: BenchmarkResult[] = [
  // Llama 3.3 70B benchmarks (from real load testing data)
  { gpuType: 'NVIDIA A100', instanceType: 'p4d.24xlarge', ttftMs: 85, throughputTokensPerMin: 16000, tokensPerDollar: 1240, costPerHour: 12.90, modelName: 'Llama-3.3-70B', vram: '320 GB', successRate: 100 },
  { gpuType: 'NVIDIA L40S', instanceType: 'g6e.12xlarge', ttftMs: 410, throughputTokensPerMin: 16000, tokensPerDollar: 980, costPerHour: 10.32, modelName: 'Llama-3.3-70B', vram: '192 GB', successRate: 99.9 },
  { gpuType: 'AWS Trainium', instanceType: 'trn1.32xlarge', ttftMs: 320, throughputTokensPerMin: 14200, tokensPerDollar: 1580, costPerHour: 7.20, modelName: 'Llama-3.3-70B', vram: '256 GB', successRate: 99.5 },
  { gpuType: 'AWS Inferentia2', instanceType: 'inf2.48xlarge', ttftMs: 450, throughputTokensPerMin: 12800, tokensPerDollar: 1820, costPerHour: 5.60, modelName: 'Llama-3.3-70B', vram: '192 GB', successRate: 99.2 },

  // Mistral 7B benchmarks
  { gpuType: 'NVIDIA A100', instanceType: 'p4d.24xlarge', ttftMs: 22, throughputTokensPerMin: 42000, tokensPerDollar: 3250, costPerHour: 12.90, modelName: 'Mistral-7B', vram: '320 GB', successRate: 100 },
  { gpuType: 'NVIDIA L40S', instanceType: 'g6e.xlarge', ttftMs: 35, throughputTokensPerMin: 38000, tokensPerDollar: 5280, costPerHour: 2.58, modelName: 'Mistral-7B', vram: '48 GB', successRate: 100 },
  { gpuType: 'AWS Trainium', instanceType: 'trn1.2xlarge', ttftMs: 45, throughputTokensPerMin: 34000, tokensPerDollar: 8500, costPerHour: 1.34, modelName: 'Mistral-7B', vram: '32 GB', successRate: 99.8 },
  { gpuType: 'AWS Inferentia2', instanceType: 'inf2.xlarge', ttftMs: 52, throughputTokensPerMin: 30000, tokensPerDollar: 12500, costPerHour: 0.76, modelName: 'Mistral-7B', vram: '16 GB', successRate: 99.7 },
]

export const loadTestingResults = [
  { users: 1, ttftAvg: 0.085, ttftP95: 0.087, throughput: 1107, successRate: 100, costPerUser: 10.32 },
  { users: 5, ttftAvg: 0.12, ttftP95: 0.15, throughput: 5200, successRate: 100, costPerUser: 1.98 },
  { users: 10, ttftAvg: 0.18, ttftP95: 0.22, throughput: 9800, successRate: 100, costPerUser: 1.05 },
  { users: 15, ttftAvg: 0.25, ttftP95: 0.32, throughput: 13200, successRate: 100, costPerUser: 0.78 },
  { users: 20, ttftAvg: 0.32, ttftP95: 0.41, throughput: 15400, successRate: 100, costPerUser: 0.52 },
  { users: 25, ttftAvg: 0.41, ttftP95: 0.52, throughput: 16000, successRate: 100, costPerUser: 0.41 },
  { users: 31, ttftAvg: 0.474, ttftP95: 0.629, throughput: 19467, successRate: 100, costPerUser: 0.33 },
  { users: 35, ttftAvg: 1.20, ttftP95: 9.40, throughput: 14030, successRate: 100, costPerUser: 0.29 },
  { users: 50, ttftAvg: 4.50, ttftP95: 14.20, throughput: 14200, successRate: 100, costPerUser: 0.21 },
  { users: 96, ttftAvg: 10.44, ttftP95: 19.80, throughput: 14351, successRate: 100, costPerUser: 0.11 },
]

export const costPerMillionTokens = [
  { gpu: 'NVIDIA A100', cost: 0.48 },
  { gpu: 'NVIDIA L40S', cost: 0.53 },
  { gpu: 'AWS Trainium', cost: 0.38 },
  { gpu: 'AWS Inferentia2', cost: 0.33 },
]
