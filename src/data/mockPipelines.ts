import type { Pipeline } from '../types'

export const mockPipelines: Pipeline[] = [
  {
    id: 'pip-001',
    name: 'Llama-3.1 Fine-Tuning Pipeline',
    status: 'Running',
    lastRun: '2025-03-22 08:30',
    duration: '2h 15m',
    scheduler: 'Argo Workflows',
    description: 'End-to-end fine-tuning pipeline for Llama-3.1-70B using LoRA with automated evaluation and deployment to staging.',
    tags: ['llm', 'fine-tuning', 'lora', 'production'],
    triggerType: 'Schedule',
    successRate: 83,
    totalRuns: 12,
    avgDuration: '2h 05m',
    linkedDeploymentIds: ['dep-001', 'dep-003'],
    lastRunStatus: 'Running',
    stages: [
      {
        id: 's1', name: 'Data Preparation', type: 'data-prep', status: 'Completed', duration: '15m',
        position: { x: 250, y: 0 },
        description: 'Download and preprocess training data from S3, apply filtering and tokenization.',
        resources: { cpu: '8', memory: '32Gi', gpu: '0', instanceType: 'm5.2xlarge' },
        parameters: { source_bucket: 's3://kubogent-data/llama-ft/', max_samples: 50000, tokenizer: 'meta-llama/Llama-3.1-70B', max_seq_length: 4096 },
        artifacts: [
          { name: 'raw_dataset.jsonl', type: 'input', path: 's3://kubogent-data/llama-ft/raw/', size: '2.4 GB' },
          { name: 'train_dataset.parquet', type: 'output', path: 's3://kubogent-artifacts/pip-001/s1/train.parquet', size: '1.8 GB' },
          { name: 'val_dataset.parquet', type: 'output', path: 's3://kubogent-artifacts/pip-001/s1/val.parquet', size: '200 MB' },
        ],
        logs: [
          '2025-03-22T08:30:00Z INFO  Starting data preparation stage',
          '2025-03-22T08:30:05Z INFO  Downloading dataset from s3://kubogent-data/llama-ft/raw/',
          '2025-03-22T08:32:18Z INFO  Downloaded 2.4 GB in 133s',
          '2025-03-22T08:33:00Z INFO  Filtering samples: 62,341 → 50,000 (quality threshold: 0.8)',
          '2025-03-22T08:38:42Z INFO  Tokenization complete: avg_length=2,847 tokens',
          '2025-03-22T08:42:15Z INFO  Train/val split: 45,000 / 5,000',
          '2025-03-22T08:44:30Z INFO  Uploaded artifacts to S3',
          '2025-03-22T08:45:00Z INFO  Stage completed successfully in 15m',
        ],
        metrics: { samples_processed: 50000, avg_token_length: 2847, data_quality_score: 0.94 },
      },
      {
        id: 's2', name: 'LoRA Fine-Tuning', type: 'training', status: 'Running', duration: '1h 45m',
        position: { x: 250, y: 150 },
        parentIds: ['s1'],
        description: 'Fine-tune Llama-3.1-70B with LoRA (rank=16) using DeepSpeed ZeRO-3 on 4x A100 GPUs.',
        resources: { cpu: '32', memory: '128Gi', gpu: '4x NVIDIA A100 80GB', instanceType: 'p4d.24xlarge' },
        parameters: { learning_rate: 2e-5, batch_size: 4, gradient_accumulation: 8, epochs: 3, lora_rank: 16, lora_alpha: 32, warmup_steps: 100, weight_decay: 0.01 },
        artifacts: [
          { name: 'train_dataset.parquet', type: 'input', path: 's3://kubogent-artifacts/pip-001/s1/train.parquet', size: '1.8 GB' },
          { name: 'lora_adapter.safetensors', type: 'output', path: 's3://kubogent-artifacts/pip-001/s2/adapter/', size: '420 MB' },
          { name: 'training_logs.jsonl', type: 'output', path: 's3://kubogent-artifacts/pip-001/s2/logs/', size: '12 MB' },
        ],
        logs: [
          '2025-03-22T08:45:05Z INFO  Initializing LoRA fine-tuning',
          '2025-03-22T08:45:30Z INFO  Loading base model: meta-llama/Llama-3.1-70B-Instruct',
          '2025-03-22T08:48:12Z INFO  Model loaded across 4 GPUs with DeepSpeed ZeRO-3',
          '2025-03-22T08:48:15Z INFO  LoRA config: rank=16, alpha=32, target_modules=[q_proj, v_proj, k_proj, o_proj]',
          '2025-03-22T08:48:20Z INFO  Starting training: 3 epochs, 4,219 steps',
          '2025-03-22T09:15:00Z INFO  Epoch 1/3 completed. Loss: 1.842, LR: 2.0e-5',
          '2025-03-22T09:45:00Z INFO  Epoch 2/3 completed. Loss: 0.956, LR: 1.5e-5',
          '2025-03-22T10:15:00Z INFO  Epoch 3/3 in progress... Step 3,800/4,219. Loss: 0.234',
        ],
        metrics: { current_loss: 0.234, current_epoch: 2.9, learning_rate: 0.000012, gpu_utilization: 94, throughput_samples_sec: 12.4 },
      },
      {
        id: 's3', name: 'Model Evaluation', type: 'evaluation', status: 'Pending', duration: '-',
        position: { x: 100, y: 300 },
        parentIds: ['s2'],
        description: 'Evaluate fine-tuned model on held-out validation set using BLEU, ROUGE, and perplexity metrics.',
        resources: { cpu: '16', memory: '64Gi', gpu: '2x NVIDIA A100 80GB', instanceType: 'p4d.24xlarge' },
        parameters: { eval_batch_size: 8, max_new_tokens: 512, temperature: 0.1, num_beams: 4 },
        artifacts: [
          { name: 'lora_adapter.safetensors', type: 'input', path: 's3://kubogent-artifacts/pip-001/s2/adapter/', size: '420 MB' },
          { name: 'val_dataset.parquet', type: 'input', path: 's3://kubogent-artifacts/pip-001/s1/val.parquet', size: '200 MB' },
          { name: 'eval_report.json', type: 'output', path: 's3://kubogent-artifacts/pip-001/s3/eval_report.json', size: '2 MB' },
        ],
        metrics: {},
      },
      {
        id: 's3b', name: 'Bias & Safety Check', type: 'evaluation', status: 'Pending', duration: '-',
        position: { x: 400, y: 300 },
        parentIds: ['s2'],
        description: 'Run bias detection and safety evaluations using ToxiGen and BBQ benchmarks.',
        resources: { cpu: '8', memory: '32Gi', gpu: '1x NVIDIA A100 80GB', instanceType: 'g5.12xlarge' },
        parameters: { toxigen_threshold: 0.05, bbq_accuracy_min: 0.85, content_filter: true },
        artifacts: [
          { name: 'lora_adapter.safetensors', type: 'input', path: 's3://kubogent-artifacts/pip-001/s2/adapter/', size: '420 MB' },
          { name: 'safety_report.json', type: 'output', path: 's3://kubogent-artifacts/pip-001/s3b/safety_report.json', size: '1 MB' },
        ],
        metrics: {},
      },
      {
        id: 's4', name: 'Deploy to Staging', type: 'deployment', status: 'Pending', duration: '-',
        position: { x: 250, y: 450 },
        parentIds: ['s3', 's3b'],
        description: 'Deploy fine-tuned model to staging cluster using vLLM with canary release strategy.',
        resources: { cpu: '4', memory: '16Gi', gpu: '0' },
        parameters: { serving_framework: 'vLLM', canary_percentage: 10, health_check_interval: 30, rollback_threshold: 0.95 },
        artifacts: [
          { name: 'lora_adapter.safetensors', type: 'input', path: 's3://kubogent-artifacts/pip-001/s2/adapter/', size: '420 MB' },
          { name: 'deployment_manifest.yaml', type: 'output', path: 's3://kubogent-artifacts/pip-001/s4/manifest.yaml', size: '4 KB' },
        ],
        metrics: {},
      },
      {
        id: 's5', name: 'Performance Monitor', type: 'monitoring', status: 'Pending', duration: '-',
        position: { x: 250, y: 600 },
        parentIds: ['s4'],
        description: 'Monitor deployment metrics for 1 hour, auto-promote to production if SLOs met.',
        resources: { cpu: '2', memory: '4Gi', gpu: '0' },
        parameters: { monitoring_duration_min: 60, p99_latency_threshold_ms: 500, error_rate_threshold: 0.01, auto_promote: true },
        artifacts: [],
        metrics: {},
      },
    ],
    config: {
      triggers: [
        { type: 'schedule', schedule: '0 8 * * 1' },
        { type: 'event', eventSource: 'S3: kubogent-data/llama-ft/ (new file)' },
      ],
      notifications: [
        { channel: 'Slack #ml-pipelines', events: ['success', 'failure'] },
        { channel: 'Email: ml-team@kubogent.ai', events: ['failure'] },
      ],
      retryPolicy: { maxRetries: 2, backoffSeconds: 300 },
      timeout: '6h',
      concurrency: 1,
      artifactStoragePath: 's3://kubogent-artifacts/pip-001/',
    },
    runs: [
      { id: 'run-6', runNumber: 6, status: 'Running', triggeredBy: 'Manual', startedAt: '2h ago', duration: '2h 15m', stagesCompleted: 1, totalStages: 6, metrics: { current_loss: 0.234 }, stageStatuses: [
        { stageId: 's1', stageName: 'Data Preparation', status: 'Completed', duration: '15m' },
        { stageId: 's2', stageName: 'LoRA Fine-Tuning', status: 'Running', duration: '1h 45m' },
        { stageId: 's3', stageName: 'Model Evaluation', status: 'Pending', duration: '-' },
        { stageId: 's3b', stageName: 'Bias & Safety Check', status: 'Pending', duration: '-' },
        { stageId: 's4', stageName: 'Deploy to Staging', status: 'Pending', duration: '-' },
        { stageId: 's5', stageName: 'Performance Monitor', status: 'Pending', duration: '-' },
      ]},
      { id: 'run-5', runNumber: 5, status: 'Completed', triggeredBy: 'Schedule', startedAt: '1d ago', duration: '1h 58m', stagesCompleted: 6, totalStages: 6, metrics: { final_loss: 0.198, bleu_score: 0.72, accuracy: 94.2, perplexity: 8.3 }, stageStatuses: [
        { stageId: 's1', stageName: 'Data Preparation', status: 'Completed', duration: '14m' },
        { stageId: 's2', stageName: 'LoRA Fine-Tuning', status: 'Completed', duration: '1h 22m' },
        { stageId: 's3', stageName: 'Model Evaluation', status: 'Completed', duration: '8m' },
        { stageId: 's3b', stageName: 'Bias & Safety Check', status: 'Completed', duration: '5m' },
        { stageId: 's4', stageName: 'Deploy to Staging', status: 'Completed', duration: '4m' },
        { stageId: 's5', stageName: 'Performance Monitor', status: 'Completed', duration: '5m' },
      ]},
      { id: 'run-4', runNumber: 4, status: 'Failed', triggeredBy: 'Schedule', startedAt: '3d ago', duration: '1h 42m', stagesCompleted: 2, totalStages: 6, metrics: { final_loss: 0.312 }, stageStatuses: [
        { stageId: 's1', stageName: 'Data Preparation', status: 'Completed', duration: '16m' },
        { stageId: 's2', stageName: 'LoRA Fine-Tuning', status: 'Completed', duration: '1h 26m' },
        { stageId: 's3', stageName: 'Model Evaluation', status: 'Failed', duration: '0m' },
        { stageId: 's3b', stageName: 'Bias & Safety Check', status: 'Skipped', duration: '-' },
        { stageId: 's4', stageName: 'Deploy to Staging', status: 'Skipped', duration: '-' },
        { stageId: 's5', stageName: 'Performance Monitor', status: 'Skipped', duration: '-' },
      ]},
      { id: 'run-3', runNumber: 3, status: 'Completed', triggeredBy: 'Manual', startedAt: '5d ago', duration: '2h 10m', stagesCompleted: 6, totalStages: 6, metrics: { final_loss: 0.205, bleu_score: 0.69, accuracy: 93.1, perplexity: 9.1 }, stageStatuses: [
        { stageId: 's1', stageName: 'Data Preparation', status: 'Completed', duration: '15m' },
        { stageId: 's2', stageName: 'LoRA Fine-Tuning', status: 'Completed', duration: '1h 30m' },
        { stageId: 's3', stageName: 'Model Evaluation', status: 'Completed', duration: '9m' },
        { stageId: 's3b', stageName: 'Bias & Safety Check', status: 'Completed', duration: '6m' },
        { stageId: 's4', stageName: 'Deploy to Staging', status: 'Completed', duration: '5m' },
        { stageId: 's5', stageName: 'Performance Monitor', status: 'Completed', duration: '5m' },
      ]},
      { id: 'run-2', runNumber: 2, status: 'Completed', triggeredBy: 'Event', startedAt: '7d ago', duration: '2h 02m', stagesCompleted: 6, totalStages: 6, metrics: { final_loss: 0.221, bleu_score: 0.67, accuracy: 91.8, perplexity: 10.2 }, stageStatuses: [
        { stageId: 's1', stageName: 'Data Preparation', status: 'Completed', duration: '13m' },
        { stageId: 's2', stageName: 'LoRA Fine-Tuning', status: 'Completed', duration: '1h 25m' },
        { stageId: 's3', stageName: 'Model Evaluation', status: 'Completed', duration: '8m' },
        { stageId: 's3b', stageName: 'Bias & Safety Check', status: 'Completed', duration: '6m' },
        { stageId: 's4', stageName: 'Deploy to Staging', status: 'Completed', duration: '5m' },
        { stageId: 's5', stageName: 'Performance Monitor', status: 'Completed', duration: '5m' },
      ]},
      { id: 'run-1', runNumber: 1, status: 'Failed', triggeredBy: 'Manual', startedAt: '10d ago', duration: '18m', stagesCompleted: 1, totalStages: 6, metrics: {}, stageStatuses: [
        { stageId: 's1', stageName: 'Data Preparation', status: 'Completed', duration: '14m' },
        { stageId: 's2', stageName: 'LoRA Fine-Tuning', status: 'Failed', duration: '4m' },
        { stageId: 's3', stageName: 'Model Evaluation', status: 'Skipped', duration: '-' },
        { stageId: 's3b', stageName: 'Bias & Safety Check', status: 'Skipped', duration: '-' },
        { stageId: 's4', stageName: 'Deploy to Staging', status: 'Skipped', duration: '-' },
        { stageId: 's5', stageName: 'Performance Monitor', status: 'Skipped', duration: '-' },
      ]},
    ],
    yamlDefinition: `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: llama-3.1-fine-tuning
  namespace: ml-pipelines
  labels:
    app: kubogent
    pipeline: llama-ft
spec:
  entrypoint: fine-tuning-dag
  serviceAccountName: pipeline-runner
  artifactRepositoryRef:
    configMap: artifact-repositories
    key: kubogent-s3
  templates:
    - name: fine-tuning-dag
      dag:
        tasks:
          - name: data-preparation
            template: data-prep
          - name: lora-fine-tuning
            template: training
            dependencies: [data-preparation]
          - name: model-evaluation
            template: evaluation
            dependencies: [lora-fine-tuning]
          - name: bias-safety-check
            template: bias-check
            dependencies: [lora-fine-tuning]
          - name: deploy-staging
            template: deployment
            dependencies: [model-evaluation, bias-safety-check]
          - name: performance-monitor
            template: monitoring
            dependencies: [deploy-staging]

    - name: data-prep
      container:
        image: kubogent/data-prep:v2.1
        command: [python, -m, data_pipeline.prepare]
        args: ["--source", "s3://kubogent-data/llama-ft/"]
        resources:
          requests:
            cpu: "8"
            memory: 32Gi

    - name: training
      container:
        image: kubogent/lora-trainer:v1.4
        command: [torchrun, --nproc_per_node=4]
        args: ["train.py", "--lr=2e-5", "--epochs=3"]
        resources:
          requests:
            cpu: "32"
            memory: 128Gi
            nvidia.com/gpu: "4"

    - name: evaluation
      container:
        image: kubogent/eval:v1.2
        resources:
          requests:
            cpu: "16"
            memory: 64Gi
            nvidia.com/gpu: "2"

    - name: bias-check
      container:
        image: kubogent/safety-eval:v1.0
        resources:
          requests:
            cpu: "8"
            memory: 32Gi
            nvidia.com/gpu: "1"

    - name: deployment
      container:
        image: kubogent/deployer:v2.0
        args: ["--framework=vllm", "--canary=10%"]

    - name: monitoring
      container:
        image: kubogent/monitor:v1.1
        args: ["--duration=60m", "--auto-promote"]`,
  },
  {
    id: 'pip-002',
    name: 'Whisper ASR Optimization',
    status: 'Completed',
    lastRun: '2025-03-21 14:00',
    duration: '45m',
    scheduler: 'Kubeflow',
    description: 'Optimize Whisper Large V3 model with INT8 quantization and accuracy benchmarking.',
    tags: ['asr', 'quantization', 'optimization'],
    triggerType: 'Manual',
    successRate: 100,
    totalRuns: 4,
    avgDuration: '42m',
    linkedDeploymentIds: ['dep-004'],
    lastRunStatus: 'Completed',
    stages: [
      {
        id: 's1', name: 'Audio Preprocessing', type: 'data-prep', status: 'Completed', duration: '10m',
        position: { x: 250, y: 0 },
        description: 'Download and preprocess LibriSpeech test set for benchmarking.',
        resources: { cpu: '4', memory: '16Gi', gpu: '0' },
        parameters: { dataset: 'librispeech-test-clean', sample_rate: 16000, max_duration_s: 30 },
        artifacts: [
          { name: 'test_audio.tar.gz', type: 'output', path: 's3://kubogent-artifacts/pip-002/s1/', size: '680 MB' },
        ],
        logs: ['2025-03-21T14:00:00Z INFO  Preprocessing 2,620 audio samples', '2025-03-21T14:10:00Z INFO  Stage completed'],
        metrics: { samples: 2620, avg_duration_s: 12.4 },
      },
      {
        id: 's2', name: 'INT8 Quantization', type: 'training', status: 'Completed', duration: '20m',
        position: { x: 250, y: 150 },
        parentIds: ['s1'],
        description: 'Apply INT8 post-training quantization with calibration dataset.',
        resources: { cpu: '16', memory: '32Gi', gpu: '1x NVIDIA L40S', instanceType: 'g5.12xlarge' },
        parameters: { quantization_method: 'PTQ', calibration_samples: 500, target_precision: 'INT8' },
        artifacts: [
          { name: 'whisper-large-v3-int8.onnx', type: 'output', path: 's3://kubogent-artifacts/pip-002/s2/', size: '780 MB' },
        ],
        metrics: { model_size_reduction: 48, calibration_loss: 0.002 },
      },
      {
        id: 's3', name: 'Accuracy Benchmark', type: 'evaluation', status: 'Completed', duration: '10m',
        position: { x: 250, y: 300 },
        parentIds: ['s2'],
        resources: { cpu: '8', memory: '16Gi', gpu: '1x NVIDIA L40S' },
        parameters: { metric: 'WER', baseline_model: 'whisper-large-v3-fp32' },
        artifacts: [
          { name: 'benchmark_results.json', type: 'output', path: 's3://kubogent-artifacts/pip-002/s3/', size: '500 KB' },
        ],
        metrics: { wer_fp32: 3.2, wer_int8: 3.4, wer_degradation: 0.2, speedup: 2.1 },
      },
      {
        id: 's4', name: 'Deploy to Production', type: 'deployment', status: 'Completed', duration: '5m',
        position: { x: 250, y: 450 },
        parentIds: ['s3'],
        resources: { cpu: '2', memory: '8Gi', gpu: '0' },
        parameters: { serving_framework: 'Triton', deployment_strategy: 'blue-green' },
        artifacts: [],
        metrics: { endpoint_latency_ms: 45, deployment_time_s: 180 },
      },
    ],
    config: {
      triggers: [{ type: 'manual' }],
      notifications: [{ channel: 'Slack #asr-team', events: ['success', 'failure'] }],
      retryPolicy: { maxRetries: 1, backoffSeconds: 60 },
      timeout: '2h',
      concurrency: 1,
      artifactStoragePath: 's3://kubogent-artifacts/pip-002/',
    },
    runs: [
      { id: 'run-4', runNumber: 4, status: 'Completed', triggeredBy: 'Manual', startedAt: '2d ago', duration: '45m', stagesCompleted: 4, totalStages: 4, metrics: { wer_int8: 3.4, speedup: 2.1 }, stageStatuses: [
        { stageId: 's1', stageName: 'Audio Preprocessing', status: 'Completed', duration: '10m' },
        { stageId: 's2', stageName: 'INT8 Quantization', status: 'Completed', duration: '20m' },
        { stageId: 's3', stageName: 'Accuracy Benchmark', status: 'Completed', duration: '10m' },
        { stageId: 's4', stageName: 'Deploy to Production', status: 'Completed', duration: '5m' },
      ]},
      { id: 'run-3', runNumber: 3, status: 'Completed', triggeredBy: 'Manual', startedAt: '5d ago', duration: '43m', stagesCompleted: 4, totalStages: 4, metrics: { wer_int8: 3.5, speedup: 2.0 }, stageStatuses: [
        { stageId: 's1', stageName: 'Audio Preprocessing', status: 'Completed', duration: '10m' },
        { stageId: 's2', stageName: 'INT8 Quantization', status: 'Completed', duration: '19m' },
        { stageId: 's3', stageName: 'Accuracy Benchmark', status: 'Completed', duration: '9m' },
        { stageId: 's4', stageName: 'Deploy to Production', status: 'Completed', duration: '5m' },
      ]},
      { id: 'run-2', runNumber: 2, status: 'Completed', triggeredBy: 'Manual', startedAt: '8d ago', duration: '40m', stagesCompleted: 4, totalStages: 4, metrics: { wer_int8: 3.6, speedup: 1.9 }, stageStatuses: [
        { stageId: 's1', stageName: 'Audio Preprocessing', status: 'Completed', duration: '9m' },
        { stageId: 's2', stageName: 'INT8 Quantization', status: 'Completed', duration: '18m' },
        { stageId: 's3', stageName: 'Accuracy Benchmark', status: 'Completed', duration: '8m' },
        { stageId: 's4', stageName: 'Deploy to Production', status: 'Completed', duration: '5m' },
      ]},
    ],
    yamlDefinition: `apiVersion: kubeflow.org/v1
kind: Pipeline
metadata:
  name: whisper-asr-optimization
spec:
  steps:
    - name: audio-preprocessing
      container:
        image: kubogent/audio-prep:v1.0
        resources:
          cpu: "4"
          memory: 16Gi
    - name: int8-quantization
      container:
        image: kubogent/quantizer:v2.0
        resources:
          gpu: "1"
          memory: 32Gi
      dependsOn: [audio-preprocessing]
    - name: accuracy-benchmark
      container:
        image: kubogent/eval:v1.2
      dependsOn: [int8-quantization]
    - name: deploy-production
      container:
        image: kubogent/deployer:v2.0
        args: ["--framework=triton", "--strategy=blue-green"]
      dependsOn: [accuracy-benchmark]`,
  },
  {
    id: 'pip-003',
    name: 'FinBERT Retraining Pipeline',
    status: 'Failed',
    lastRun: '2025-03-20 10:00',
    duration: '32m',
    scheduler: 'Kueue',
    description: 'Scheduled retraining of FinBERT model on latest financial news corpus with automated deployment.',
    tags: ['nlp', 'finance', 'retraining'],
    triggerType: 'Event',
    successRate: 33,
    totalRuns: 3,
    avgDuration: '35m',
    linkedDeploymentIds: ['dep-005'],
    lastRunStatus: 'Failed',
    stages: [
      {
        id: 's1', name: 'Data Ingestion', type: 'data-prep', status: 'Completed', duration: '8m',
        position: { x: 250, y: 0 },
        description: 'Ingest latest financial news from Bloomberg and Reuters feeds.',
        resources: { cpu: '4', memory: '16Gi', gpu: '0' },
        parameters: { sources: 'bloomberg,reuters', lookback_days: 30, min_articles: 10000 },
        artifacts: [
          { name: 'financial_corpus.jsonl', type: 'output', path: 's3://kubogent-artifacts/pip-003/s1/', size: '450 MB' },
        ],
        metrics: { articles_ingested: 14200, avg_word_count: 342 },
      },
      {
        id: 's2', name: 'Model Training', type: 'training', status: 'Failed', duration: '24m',
        position: { x: 250, y: 150 },
        parentIds: ['s1'],
        description: 'Fine-tune FinBERT on financial corpus with sentiment classification head.',
        resources: { cpu: '16', memory: '64Gi', gpu: '2x NVIDIA L40S', instanceType: 'g5.12xlarge' },
        parameters: { learning_rate: 3e-5, batch_size: 32, epochs: 5, warmup_ratio: 0.1 },
        artifacts: [],
        logs: [
          '2025-03-20T10:08:00Z INFO  Starting FinBERT training',
          '2025-03-20T10:08:10Z INFO  Loading base model: ProsusAI/finbert',
          '2025-03-20T10:10:00Z INFO  Epoch 1/5 started',
          '2025-03-20T10:18:00Z INFO  Epoch 1/5 completed. Loss: 0.45',
          '2025-03-20T10:22:00Z INFO  Epoch 2/5 started',
          '2025-03-20T10:30:00Z ERROR CUDA error: device-side assert triggered',
          '2025-03-20T10:30:01Z ERROR Training failed at step 2,341. NaN loss detected.',
          '2025-03-20T10:30:02Z ERROR Stack trace: RuntimeError at train.py:245',
        ],
        metrics: { last_loss: 0.45, failed_at_epoch: 2, failed_at_step: 2341 },
      },
      {
        id: 's3', name: 'Evaluation', type: 'evaluation', status: 'Pending', duration: '-',
        position: { x: 250, y: 300 },
        parentIds: ['s2'],
        resources: { cpu: '8', memory: '16Gi', gpu: '1x NVIDIA L40S' },
        metrics: {},
      },
      {
        id: 's4', name: 'Deploy', type: 'deployment', status: 'Pending', duration: '-',
        position: { x: 250, y: 450 },
        parentIds: ['s3'],
        resources: { cpu: '2', memory: '8Gi', gpu: '0' },
        metrics: {},
      },
    ],
    config: {
      triggers: [
        { type: 'event', eventSource: 'Data drift detected (>5% distribution shift)' },
        { type: 'schedule', schedule: '0 2 * * 0' },
      ],
      notifications: [
        { channel: 'Slack #finbert-alerts', events: ['failure'] },
        { channel: 'PagerDuty: finance-ml-oncall', events: ['failure'] },
      ],
      retryPolicy: { maxRetries: 3, backoffSeconds: 600 },
      timeout: '4h',
      concurrency: 1,
      artifactStoragePath: 's3://kubogent-artifacts/pip-003/',
    },
    runs: [
      { id: 'run-3', runNumber: 3, status: 'Failed', triggeredBy: 'Event', startedAt: '3d ago', duration: '32m', stagesCompleted: 1, totalStages: 4, metrics: { last_loss: 0.45 }, stageStatuses: [
        { stageId: 's1', stageName: 'Data Ingestion', status: 'Completed', duration: '8m' },
        { stageId: 's2', stageName: 'Model Training', status: 'Failed', duration: '24m' },
        { stageId: 's3', stageName: 'Evaluation', status: 'Skipped', duration: '-' },
        { stageId: 's4', stageName: 'Deploy', status: 'Skipped', duration: '-' },
      ]},
      { id: 'run-2', runNumber: 2, status: 'Failed', triggeredBy: 'Data Drift', startedAt: '10d ago', duration: '35m', stagesCompleted: 1, totalStages: 4, metrics: { last_loss: 0.52 }, stageStatuses: [
        { stageId: 's1', stageName: 'Data Ingestion', status: 'Completed', duration: '9m' },
        { stageId: 's2', stageName: 'Model Training', status: 'Failed', duration: '26m' },
        { stageId: 's3', stageName: 'Evaluation', status: 'Skipped', duration: '-' },
        { stageId: 's4', stageName: 'Deploy', status: 'Skipped', duration: '-' },
      ]},
      { id: 'run-1', runNumber: 1, status: 'Completed', triggeredBy: 'Manual', startedAt: '14d ago', duration: '38m', stagesCompleted: 4, totalStages: 4, metrics: { f1_score: 0.89, accuracy: 91.2 }, stageStatuses: [
        { stageId: 's1', stageName: 'Data Ingestion', status: 'Completed', duration: '7m' },
        { stageId: 's2', stageName: 'Model Training', status: 'Completed', duration: '20m' },
        { stageId: 's3', stageName: 'Evaluation', status: 'Completed', duration: '6m' },
        { stageId: 's4', stageName: 'Deploy', status: 'Completed', duration: '5m' },
      ]},
    ],
    yamlDefinition: `apiVersion: kueue.x-k8s.io/v1beta1
kind: Workload
metadata:
  name: finbert-retraining
spec:
  queueName: ml-training-queue
  podSets:
    - name: training
      count: 1
      template:
        spec:
          containers:
            - name: trainer
              image: kubogent/finbert-trainer:v1.3
              resources:
                requests:
                  cpu: "16"
                  memory: 64Gi
                  nvidia.com/gpu: "2"`,
  },
]

export const pipelineTemplates = [
  { id: 'tpl-1', name: 'Fine-Tuning Pipeline (LoRA/QLoRA)', description: 'Complete fine-tuning workflow with data prep, LoRA training, evaluation, and deployment.', icon: 'Brain', stages: 6, estimatedDuration: '2-4h' },
  { id: 'tpl-2', name: 'Model Evaluation Pipeline', description: 'Evaluate model on benchmarks with bias detection and safety checks.', icon: 'BarChart3', stages: 3, estimatedDuration: '30m-1h' },
  { id: 'tpl-3', name: 'Data Processing Pipeline', description: 'ETL pipeline for preparing training data with validation and quality checks.', icon: 'Database', stages: 4, estimatedDuration: '15m-1h' },
  { id: 'tpl-4', name: 'Full Lifecycle (Train → Eval → Deploy)', description: 'End-to-end pipeline from training through evaluation to production deployment.', icon: 'Rocket', stages: 5, estimatedDuration: '3-6h' },
  { id: 'tpl-5', name: 'Custom Pipeline', description: 'Start with a blank canvas and build your pipeline from scratch.', icon: 'Settings', stages: 0, estimatedDuration: 'Variable' },
]
