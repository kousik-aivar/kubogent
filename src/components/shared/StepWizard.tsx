import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

interface Step {
  label: string
  content: ReactNode
}

interface StepWizardProps {
  steps: Step[]
  currentStep: number
  onNext: () => void
  onBack: () => void
  onComplete: () => void
  /** Optional: jump directly to a completed step by index */
  onJumpTo?: (index: number) => void
  completedMessage?: string
  isCompleted?: boolean
}

export default function StepWizard({
  steps,
  currentStep,
  onNext,
  onBack,
  onComplete,
  onJumpTo,
  completedMessage,
  isCompleted,
}: StepWizardProps) {
  if (isCompleted) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-accent-green" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          {completedMessage || 'Completed Successfully!'}
        </h2>
        <p className="text-text-secondary">Your changes have been applied.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-initial">
            <div className="flex items-center gap-2">
              {i < currentStep && onJumpTo ? (
                <button
                  onClick={() => onJumpTo(i)}
                  title={`Go back to ${step.label}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-accent-green text-white hover:bg-accent-green/80 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    i < currentStep
                      ? 'bg-accent-green text-white'
                      : i === currentStep
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-tertiary text-text-muted'
                  }`}
                >
                  {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
              )}
              <span
                className={`text-sm hidden sm:inline ${
                  i <= currentStep ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-4 ${
                  i < currentStep ? 'bg-accent-green' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mb-8">{steps[currentStep].content}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={onNext}
            className="px-6 py-2 text-sm font-medium bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="px-6 py-2 text-sm font-medium bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors"
          >
            Deploy
          </button>
        )}
      </div>
    </div>
  )
}
