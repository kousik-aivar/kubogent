import type { Pipeline } from '../types'

export const mockPipelines: Pipeline[] = [
  {
    id: 'pip-001',
    name: 'Llama-3.1 Fine-Tuning Pipeline',
    status: 'Running',
    lastRun: '2025-03-22 08:30',
    duration: '2h 15m',
    scheduler: 'Argo Workflows',
    stages: [
      { id: 's1', name: 'Data Preparation', type: 'data-prep', status: 'Completed', duration: '15m', position: { x: 250, y: 0 } },
      { id: 's2', name: 'LoRA Fine-Tuning', type: 'training', status: 'Running', duration: '1h 45m', position: { x: 250, y: 150 } },
      { id: 's3', name: 'Model Evaluation', type: 'evaluation', status: 'Pending', duration: '-', position: { x: 250, y: 300 } },
      { id: 's4', name: 'Deploy to Staging', type: 'deployment', status: 'Pending', duration: '-', position: { x: 250, y: 450 } },
      { id: 's5', name: 'Performance Monitor', type: 'monitoring', status: 'Pending', duration: '-', position: { x: 250, y: 600 } },
    ],
  },
  {
    id: 'pip-002',
    name: 'Whisper ASR Optimization',
    status: 'Completed',
    lastRun: '2025-03-21 14:00',
    duration: '45m',
    scheduler: 'Kubeflow',
    stages: [
      { id: 's1', name: 'Audio Preprocessing', type: 'data-prep', status: 'Completed', duration: '10m', position: { x: 250, y: 0 } },
      { id: 's2', name: 'INT8 Quantization', type: 'training', status: 'Completed', duration: '20m', position: { x: 250, y: 150 } },
      { id: 's3', name: 'Accuracy Benchmark', type: 'evaluation', status: 'Completed', duration: '10m', position: { x: 250, y: 300 } },
      { id: 's4', name: 'Deploy to Production', type: 'deployment', status: 'Completed', duration: '5m', position: { x: 250, y: 450 } },
    ],
  },
  {
    id: 'pip-003',
    name: 'FinBERT Retraining Pipeline',
    status: 'Failed',
    lastRun: '2025-03-20 10:00',
    duration: '32m',
    scheduler: 'Kueue',
    stages: [
      { id: 's1', name: 'Data Ingestion', type: 'data-prep', status: 'Completed', duration: '8m', position: { x: 250, y: 0 } },
      { id: 's2', name: 'Model Training', type: 'training', status: 'Failed', duration: '24m', position: { x: 250, y: 150 } },
      { id: 's3', name: 'Evaluation', type: 'evaluation', status: 'Pending', duration: '-', position: { x: 250, y: 300 } },
      { id: 's4', name: 'Deploy', type: 'deployment', status: 'Pending', duration: '-', position: { x: 250, y: 450 } },
    ],
  },
]
