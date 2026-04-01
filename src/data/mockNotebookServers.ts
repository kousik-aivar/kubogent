import type { NotebookServer } from '../types'

export const mockNotebookServers: NotebookServer[] = [
  {
    id: 'nb-001',
    name: 'llama-finetune-ws',
    clusterId: 'cls-001',
    clusterName: 'eks-prod-us-east-1',
    status: 'Running',
    url: 'http://jupyter.eks-prod-us-east-1.svc.cluster.local:8888',
    image: 'pytorch/pytorch:2.3.0-cuda12.1-cudnn8-devel',
    resources: { cpu: '8 vCPU', memory: '64 GB', gpu: '2× A100 40GB' },
    createdAt: '2026-03-28 14:20',
    lastActive: '5 min ago',
    createdBy: 'k.ramanathan',
  },
  {
    id: 'nb-002',
    name: 'yolo-training-ws',
    clusterId: 'cls-002',
    clusterName: 'eks-dev-us-west-2',
    status: 'Stopped',
    url: 'http://jupyter.eks-dev-us-west-2.svc.cluster.local:8888',
    image: 'ultralytics/ultralytics:latest',
    resources: { cpu: '4 vCPU', memory: '32 GB', gpu: '1× L40S 48GB' },
    createdAt: '2026-03-25 10:00',
    lastActive: '2 days ago',
    createdBy: 'k.ramanathan',
  },
  {
    id: 'nb-003',
    name: 'whisper-stt-exp',
    clusterId: 'cls-001',
    clusterName: 'eks-prod-us-east-1',
    status: 'Provisioning',
    url: 'http://jupyter-whisper.eks-prod-us-east-1.svc.cluster.local:8888',
    image: 'pytorch/pytorch:2.3.0-cuda12.1-cudnn8-devel',
    resources: { cpu: '4 vCPU', memory: '32 GB', gpu: '1× A10G 24GB' },
    createdAt: '2026-04-01 09:15',
    lastActive: '—',
    createdBy: 'k.ramanathan',
  },
]

export const NOTEBOOK_IMAGES = [
  { value: 'pytorch/pytorch:2.3.0-cuda12.1-cudnn8-devel', label: 'PyTorch 2.3 (CUDA 12.1)' },
  { value: 'tensorflow/tensorflow:2.16.0-gpu', label: 'TensorFlow 2.16 (GPU)' },
  { value: 'huggingface/transformers-pytorch-gpu:4.40.0', label: 'HuggingFace Transformers 4.40' },
  { value: 'ultralytics/ultralytics:latest', label: 'Ultralytics YOLOv9' },
  { value: 'nvcr.io/nvidia/cuda:12.4.0-devel-ubuntu22.04', label: 'NVIDIA CUDA 12.4 (base)' },
]

export const GPU_OPTIONS = [
  { value: 'none', label: 'No GPU (CPU only)' },
  { value: '1× T4 16GB', label: '1× NVIDIA T4 16GB' },
  { value: '1× A10G 24GB', label: '1× NVIDIA A10G 24GB' },
  { value: '1× L40S 48GB', label: '1× NVIDIA L40S 48GB' },
  { value: '2× A100 40GB', label: '2× NVIDIA A100 40GB' },
  { value: '4× A100 80GB', label: '4× NVIDIA A100 80GB' },
]
