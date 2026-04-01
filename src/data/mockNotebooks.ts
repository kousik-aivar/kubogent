import type { ModelCategory } from '../types'

export interface NotebookCell {
  type: 'markdown' | 'code' | 'output'
  content: string
  executionCount?: number
}

export interface MockNotebook {
  id: string
  name: string
  description: string
  modelCategory: ModelCategory
  modelId: string
  tags: string[]
  lastModified: string
  lastRun?: string
  cells: NotebookCell[]
}

export const mockNotebooks: MockNotebook[] = [
  {
    id: 'nb-001',
    name: 'llama3.1-lora-finetune.ipynb',
    description: 'LoRA fine-tuning of Llama 3.1-8B on custom Q&A dataset',
    modelCategory: 'llm',
    modelId: 'mdl-001',
    tags: ['lora', 'llm', 'fine-tuning'],
    lastModified: '2026-03-29 14:22',
    lastRun: '2026-03-29 14:18',
    cells: [
      {
        type: 'markdown',
        content: '## LLaMA 3.1 LoRA Fine-Tuning\n\nThis notebook fine-tunes **Llama 3.1-8B** using LoRA (Low-Rank Adaptation) on a custom customer-support Q&A dataset stored in S3.\n\n**Approach:** PEFT LoRA with r=16, targeting attention projections.',
      },
      {
        type: 'code',
        executionCount: 1,
        content: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset

MODEL_ID = "meta-llama/Meta-Llama-3.1-8B"
DATA_PATH = "s3://ml-datasets/customer-support-qa/train.jsonl"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID, torch_dtype=torch.bfloat16, device_map="auto"
)`,
      },
      {
        type: 'output',
        content: `Loading checkpoint shards: 100%|████████████| 4/4 [00:12<00:00,  3.08s/it]
Model loaded on cuda:0, cuda:1  (2× A100 40GB)
Total parameters: 8,030,261,248`,
      },
      {
        type: 'code',
        executionCount: 2,
        content: `lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()`,
      },
      {
        type: 'output',
        content: `trainable params: 20,971,520 || all params: 8,051,539,968 || trainable%: 0.2605`,
      },
      {
        type: 'code',
        executionCount: 3,
        content: `training_args = TrainingArguments(
    output_dir="./checkpoints",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    gradient_accumulation_steps=2,
    learning_rate=2e-4,
    warmup_steps=100,
    logging_steps=10,
    save_steps=500,
    bf16=True,
    report_to="none",
)

trainer = SFTTrainer(model=model, args=training_args, train_dataset=dataset)
trainer.train()`,
      },
      {
        type: 'output',
        content: `{'loss': 1.8421, 'learning_rate': 1.98e-04, 'epoch': 0.10}
{'loss': 1.2834, 'learning_rate': 1.80e-04, 'epoch': 0.50}
{'loss': 0.8921, 'learning_rate': 1.40e-04, 'epoch': 1.00}
{'loss': 0.4312, 'learning_rate': 0.80e-04, 'epoch': 2.00}
{'loss': 0.1981, 'learning_rate': 0.20e-04, 'epoch': 3.00}
Training complete. Final loss: 0.198`,
      },
    ],
  },
  {
    id: 'nb-002',
    name: 'yolo-v9-custom-training.ipynb',
    description: 'YOLOv9-e training on custom defect detection dataset',
    modelCategory: 'object-detect',
    modelId: 'mdl-009',
    tags: ['yolo', 'object-detection', 'computer-vision'],
    lastModified: '2026-03-31 11:05',
    lastRun: '2026-03-31 08:00',
    cells: [
      {
        type: 'markdown',
        content: '## YOLOv9-e Custom Training\n\nFine-tuning **YOLOv9-e** on a manufacturing defect detection dataset (12 classes, 8,400 annotated images).',
      },
      {
        type: 'code',
        executionCount: 1,
        content: `from ultralytics import YOLO
import torch

# Load pretrained YOLOv9-e
model = YOLO("yolov9e.pt")
print(f"Model: {model.info()}")
print(f"Device: {torch.cuda.get_device_name(0)}")`,
      },
      {
        type: 'output',
        content: `YOLOv9-e summary: 839 layers, 58,131,344 parameters
Device: NVIDIA L40S 48GB`,
      },
      {
        type: 'code',
        executionCount: 2,
        content: `results = model.train(
    data="defect-detection.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    lr0=1e-3,
    device=0,
    project="./runs",
    name="yolov9e-defects-v1",
    save=True,
    plots=True,
)`,
      },
      {
        type: 'output',
        content: `      Epoch    GPU_mem   box_loss   cls_loss   dfl_loss  Instances       Size
       1/50      18.2G      1.842      2.341      1.234         87        640
      10/50      19.1G      0.923      1.102      0.891        91        640
      25/50      19.1G      0.621      0.743      0.712        88        640
      50/50      19.1G      0.431      0.521      0.534        85        640

Results saved to runs/yolov9e-defects-v1
mAP50: 0.891   mAP50-95: 0.724`,
      },
    ],
  },
  {
    id: 'nb-003',
    name: 'whisper-stt-evaluation.ipynb',
    description: 'Evaluation of Whisper-Large-v3 on domain-specific audio',
    modelCategory: 'stt',
    modelId: 'mdl-004',
    tags: ['whisper', 'stt', 'evaluation', 'wer'],
    lastModified: '2026-04-01 09:45',
    cells: [
      {
        type: 'markdown',
        content: '## Whisper Large v3 — Domain Evaluation\n\nEvaluating **Word Error Rate (WER)** on 500 audio samples from medical transcription domain.',
      },
      {
        type: 'code',
        executionCount: 1,
        content: `import whisper
from evaluate import load
import json

model = whisper.load_model("large-v3", device="cuda")
wer_metric = load("wer")

# Load evaluation set from S3
eval_data = load_s3_jsonl("s3://ml-datasets/medical-audio/eval.jsonl")
print(f"Loaded {len(eval_data)} samples")`,
      },
      {
        type: 'output',
        content: `Loaded 500 samples
Model: Whisper large-v3 (1.55B params)`,
      },
      {
        type: 'code',
        executionCount: 2,
        content: `predictions, references = [], []

for sample in eval_data:
    result = model.transcribe(sample["audio_path"], language="en")
    predictions.append(result["text"])
    references.append(sample["transcript"])

wer = wer_metric.compute(predictions=predictions, references=references)
print(f"WER: {wer:.4f}  ({wer*100:.2f}%)")`,
      },
      {
        type: 'output',
        content: `Transcribing: 100%|████████████| 500/500 [08:42<00:00,  1.04s/it]
WER: 0.0823  (8.23%)
Baseline WER (general domain): 0.0412  (4.12%)
Domain gap: +4.11% — fine-tuning recommended`,
      },
    ],
  },
  {
    id: 'nb-004',
    name: 'model-quantization-analysis.ipynb',
    description: 'INT4/INT8 quantization impact analysis for Llama 3.1-70B',
    modelCategory: 'llm',
    modelId: 'mdl-001',
    tags: ['quantization', 'optimization', 'int4', 'gguf'],
    lastModified: '2026-03-28 16:30',
    lastRun: '2026-03-28 16:00',
    cells: [
      {
        type: 'markdown',
        content: '## INT4/INT8 Quantization Analysis\n\nComparing **FP16 vs INT8 vs INT4 (GGUF)** for Llama 3.1-70B across latency, throughput, and quality metrics.',
      },
      {
        type: 'code',
        executionCount: 1,
        content: `from transformers import AutoModelForCausalLM, BitsAndBytesConfig
import torch, time

configs = {
    "fp16":  None,
    "int8":  BitsAndBytesConfig(load_in_8bit=True),
    "int4":  BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16),
}

results = {}
for name, quant_config in configs.items():
    model = AutoModelForCausalLM.from_pretrained(
        "meta-llama/Meta-Llama-3.1-70B",
        quantization_config=quant_config,
        device_map="auto",
    )
    results[name] = benchmark_model(model, n_tokens=512)
    print(f"{name}: {results[name]}")`,
      },
      {
        type: 'output',
        content: `fp16:  VRAM=140GB  TTFT=185ms  throughput=4,820 tok/min  perplexity=8.42
int8:  VRAM= 70GB  TTFT=142ms  throughput=6,210 tok/min  perplexity=8.61
int4:  VRAM= 35GB  TTFT=108ms  throughput=8,340 tok/min  perplexity=9.18

Recommendation: INT8 offers best quality/performance tradeoff (2.5% ppl degradation, 1.8× speedup)`,
      },
    ],
  },
]

export const NOTEBOOK_TEMPLATES = [
  { id: 'blank',      label: 'Blank Notebook',         description: 'Empty notebook' },
  { id: 'lora',       label: 'LoRA Fine-Tuning',        description: 'LLM fine-tuning with PEFT LoRA' },
  { id: 'eval',       label: 'Model Evaluation',        description: 'Metric evaluation & WER/BLEU scoring' },
  { id: 'quantize',   label: 'Quantization Analysis',   description: 'INT4/INT8 quantization benchmarking' },
]
