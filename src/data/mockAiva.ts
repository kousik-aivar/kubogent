import type { AivaPageContext } from '../types'

export const aivaContexts: Record<string, AivaPageContext> = {
  dashboard: {
    page: 'dashboard',
    suggestions: [
      {
        id: 'dash-1',
        type: 'warning',
        title: 'GPU Memory Pressure',
        body: 'Llama-3.1-70B on eks-prod-us-east-1 is running at 87.8% GPU memory. Consider adding a replica or enabling memory offloading.',
        accent: 'amber',
        actionLabel: 'View Inference',
      },
      {
        id: 'dash-2',
        type: 'insight',
        title: 'Cost Optimization',
        body: 'Monthly GPU spend is up 3.5% week-over-week. eks-staging-us-west-2 has 2 idle replicas from 08:00–10:00 daily.',
        accent: 'blue',
      },
      {
        id: 'dash-3',
        type: 'recommendation',
        title: 'Pipeline Health',
        body: 'Llama-3.1 Fine-Tuning Pipeline has a 100% success rate across the last 3 runs. Consider increasing run frequency for faster model iteration.',
        accent: 'green',
      },
    ],
  },
  'model-catalog': {
    page: 'model-catalog',
    suggestions: [
      {
        id: 'mc-1',
        type: 'recommendation',
        title: 'Deploy Mistral-7B',
        body: 'Mistral-7B is 3x cheaper to serve than Llama-70B for tasks under 2K tokens. Consider routing short-context requests to it.',
        accent: 'purple',
        actionLabel: 'Deploy to Inference',
      },
      {
        id: 'mc-2',
        type: 'warning',
        title: 'Gemma-2-27B Build Failed',
        body: 'Build failed due to CUDA version mismatch. Upgrade the base image to CUDA 12.1 or use a pre-quantized checkpoint from HuggingFace.',
        accent: 'red',
      },
      {
        id: 'mc-3',
        type: 'insight',
        title: 'DBRX Has No Deployments',
        body: 'DBRX-Instruct (132B) has been imported but never deployed. At 264GB it requires 4× A100 80GB. Consider quantizing to FP8 first.',
        accent: 'blue',
      },
    ],
  },
  'pipeline-designer': {
    page: 'pipeline-designer',
    suggestions: [
      {
        id: 'pd-1',
        type: 'recommendation',
        title: 'LoRA Rank Suggestion',
        body: 'For Llama-3.1-70B with your current dataset size (~50K samples), a LoRA rank of 32 typically outperforms rank 16 with only 12% extra VRAM.',
        accent: 'purple',
      },
      {
        id: 'pd-2',
        type: 'insight',
        title: 'Training Convergence',
        body: 'Current loss at step 1,200 is 0.234. Based on the curve shape, expect convergence around step 2,800 — 40% faster than the 3B-param baseline.',
        accent: 'blue',
      },
      {
        id: 'pd-3',
        type: 'warning',
        title: 'Evaluation Stage Skipped in Run #4',
        body: 'Run #4 failed at the evaluation stage due to a missing BLEU reference corpus. Ensure s3://kubogent-artifacts/eval-refs/ is populated before next run.',
        accent: 'amber',
      },
    ],
  },
  'pipelines-list': {
    page: 'pipelines-list',
    suggestions: [
      {
        id: 'pl-1',
        type: 'action',
        title: 'FinBERT Ready for Retraining',
        body: 'Custom-FinBERT-v2 was last retrained 23 days ago. Financial data drift of 6.2% has been detected. Trigger a retraining run now.',
        accent: 'green',
        actionLabel: 'Trigger Pipeline',
      },
      {
        id: 'pl-2',
        type: 'insight',
        title: 'Whisper Pipeline Underutilized',
        body: 'Whisper ASR Optimization ran once and hasn\'t been scheduled. Set a monthly schedule to continuously improve WER as new audio data arrives.',
        accent: 'blue',
      },
    ],
  },
  'inference-list': {
    page: 'inference-list',
    suggestions: [
      {
        id: 'il-1',
        type: 'warning',
        title: 'Whisper-Large Failed',
        body: 'TensorRT-LLM serialization failed for Whisper-Large-v3. Triton with ONNX backend is a reliable alternative for this model type.',
        accent: 'red',
        actionLabel: 'Redeploy',
      },
      {
        id: 'il-2',
        type: 'recommendation',
        title: 'Scale Llama-70B',
        body: 'P95 latency for Llama-3.1-70B is trending toward 520ms. Adding 1 replica would reduce P95 by an estimated 28% at +$11.80/hr.',
        accent: 'amber',
      },
    ],
  },
  'inference-detail': {
    page: 'inference-detail',
    suggestions: [
      {
        id: 'id-1',
        type: 'recommendation',
        title: 'Enable Speculative Decoding',
        body: 'vLLM speculative decoding with a 70M draft model can reduce TTFT by ~35% for this deployment with minimal accuracy loss.',
        accent: 'purple',
      },
      {
        id: 'id-2',
        type: 'insight',
        title: 'Off-Peak Scaling Opportunity',
        body: 'Traffic drops 80% between 00:00–06:00 UTC. Configuring a scaling schedule would save ~$85/day without impacting SLAs.',
        accent: 'blue',
      },
    ],
  },
  'create-pipeline': {
    page: 'create-pipeline',
    suggestions: [
      {
        id: 'cp-1',
        type: 'recommendation',
        title: 'Use QLoRA for 70B+ Models',
        body: 'For models with 70B+ parameters, QLoRA (4-bit NF4) reduces training VRAM by ~65% vs LoRA, enabling fine-tuning on 2× A100s instead of 8×.',
        accent: 'purple',
      },
      {
        id: 'cp-2',
        type: 'recommendation',
        title: 'Recommended Inference Engine',
        body: 'For this LLM, vLLM provides the highest throughput (up to 6× vs Ray Serve) thanks to PagedAttention. Use TensorRT-LLM only if you need sub-100ms TTFT.',
        accent: 'blue',
      },
    ],
  },
}
