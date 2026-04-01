import { Sparkles } from 'lucide-react'
import { TRAINING_METHODS, MODEL_CATEGORY_LABELS } from '../../../../types'
import type { ModelCategory } from '../../../../types'
import { mockModels } from '../../../../data/mockModels'

interface TrainingMethodStepProps {
  modelId: string | null
  selectedMethod: string | null
  onSelect: (method: string) => void
}

const methodDescriptions: Record<string, string> = {
  'LoRA': 'Low-Rank Adaptation — efficient fine-tuning by injecting trainable rank-decomposition matrices. Best balance of quality and VRAM.',
  'QLoRA': '4-bit quantised LoRA. Reduces VRAM by ~65% vs LoRA. Ideal for 70B+ models on limited GPU budgets.',
  'Full Fine-tune': 'Update all model weights. Highest quality but requires the most GPU memory. Best for small models (<7B).',
  'SFT': 'Supervised Fine-Tuning on instruction-response pairs. Standard approach for instruction-following and chat models.',
  'DPO': 'Direct Preference Optimisation. Aligns model to human preferences without a separate reward model.',
  'RLHF': 'Reinforcement Learning from Human Feedback. Highest alignment quality; requires reward model and PPO training.',
  'Sequence Classification': 'Add a classification head on top of the encoder. For sentiment analysis, topic classification, NLI.',
  'NER': 'Named Entity Recognition fine-tuning with token-level labels.',
  'SimCSE': 'Contrastive sentence embedding training. Improves semantic search and clustering quality.',
  'Contrastive': 'Train with positive/negative pairs to improve embedding quality.',
  'CTC Fine-tune': 'Connectionist Temporal Classification — standard ASR fine-tuning for Wav2Vec, Whisper-CTC.',
  'Seq2Seq Fine-tune': 'Encoder-decoder fine-tuning for transcription tasks like Whisper.',
  'Adapter': 'Lightweight bottleneck adapter layers. Very low VRAM, good for multi-domain ASR.',
  'Speaker Adaptation': 'Adapt TTS to a new speaker voice with as few as 5 minutes of audio.',
  'VITS Fine-tune': 'End-to-end TTS system fine-tuning for naturalness and speaker identity.',
  'StyleTTS2': 'Style-based TTS fine-tuning with diffusion-based prosody modelling.',
  'Linear Probe': 'Freeze the backbone and train only a linear classifier head. Fast and prevents catastrophic forgetting.',
  'LoRA (Video)': 'LoRA adapted for temporal attention layers in video diffusion/generation models.',
  'Transfer Learning': 'Fine-tune the final detection head and neck on domain-specific bounding box data.',
  'Retrain': 'Full model retraining from scratch on updated training data.',
  'Incremental Learning': 'Update the model incrementally without full retraining. Preserves performance on existing classes.',
  'Hyperparameter Sweep': 'Grid or random search over key hyperparameters using the same training pipeline.',
  'DreamBooth': 'Few-shot personalisation for diffusion models using ~20 subject images.',
}

const recommendedByCategory: Record<ModelCategory, string> = {
  llm: 'QLoRA',
  slm: 'LoRA',
  code: 'LoRA',
  embedding: 'Sequence Classification',
  stt: 'Seq2Seq Fine-tune',
  tts: 'Speaker Adaptation',
  vision: 'LoRA',
  'video-gen': 'LoRA (Video)',
  'object-detect': 'Transfer Learning',
  'traditional-ml': 'Retrain',
  diffusion: 'LoRA',
}

export default function TrainingMethodStep({ modelId, selectedMethod, onSelect }: TrainingMethodStepProps) {
  const model = mockModels.find((m) => m.id === modelId)
  const category = model?.modelCategory
  const methods = category ? TRAINING_METHODS[category] : []
  const recommended = category ? recommendedByCategory[category] : null

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Training Method</h3>
      <p className="text-sm text-text-secondary mb-1">
        Methods available for{' '}
        <span className="text-text-primary font-medium">
          {category ? MODEL_CATEGORY_LABELS[category] : 'this model type'}
        </span>{' '}
        models.
      </p>
      {model && (
        <p className="text-xs text-text-muted mb-5">Model: {model.name} · {model.parameters} · {model.size}</p>
      )}
      <div className="space-y-2">
        {methods.map((method) => {
          const isSelected = selectedMethod === method
          const isRecommended = method === recommended
          return (
            <button
              key={method}
              onClick={() => onSelect(method)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                isSelected
                  ? 'border-accent-purple bg-accent-purple/5'
                  : 'border-border bg-bg-secondary hover:border-border-light'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-text-primary">{method}</span>
                    {isRecommended && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple font-medium">
                        <Sparkles className="w-3 h-3" /> Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {methodDescriptions[method] ?? 'Fine-tuning method for this model type.'}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${isSelected ? 'border-accent-purple bg-accent-purple' : 'border-border'}`} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
