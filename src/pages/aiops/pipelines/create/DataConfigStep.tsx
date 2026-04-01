import { Database, Info } from 'lucide-react'

interface DataConfigStepProps {
  s3Path: string
  onS3PathChange: (path: string) => void
  trainValSplit: number
  onSplitChange: (split: number) => void
}

export default function DataConfigStep({ s3Path, onS3PathChange, trainValSplit, onSplitChange }: DataConfigStepProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Data Configuration</h3>
      <p className="text-sm text-text-secondary mb-5">Configure the training data source for this pipeline run.</p>

      <div className="space-y-6">
        {/* S3 Source */}
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-medium text-text-primary">Training Data Source</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-bg-tertiary flex items-center justify-center">
                <span className="text-[10px] font-medium text-text-secondary">S3</span>
              </div>
              <span className="text-sm font-medium text-text-primary">Amazon S3</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue">Active</span>
            </div>
            <p className="text-xs text-text-muted mb-3">GCS and Azure Blob Storage coming soon.</p>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">S3 Path</label>
            <input
              type="text"
              value={s3Path}
              onChange={(e) => onS3PathChange(e.target.value)}
              placeholder="s3://your-bucket/training-data/"
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors font-mono"
            />
            <p className="text-xs text-text-muted mt-1.5">Supported formats: JSONL, Parquet, CSV</p>
          </div>
        </div>

        {/* Train / Val Split */}
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-text-primary">Train / Validation Split</span>
            <span className="text-sm text-text-primary font-medium">{trainValSplit}% / {100 - trainValSplit}%</span>
          </div>
          <input
            type="range"
            min={70}
            max={95}
            step={5}
            value={trainValSplit}
            onChange={(e) => onSplitChange(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>70 / 30</span>
            <span>95 / 5</span>
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 px-4 py-3 bg-bg-tertiary rounded-xl border border-border">
          <Info className="w-4 h-4 text-accent-blue mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-secondary leading-relaxed">
            Kubogent does not perform data engineering. Ensure your S3 path contains pre-processed,
            model-ready data in the expected format before running the pipeline.
          </p>
        </div>
      </div>
    </div>
  )
}
