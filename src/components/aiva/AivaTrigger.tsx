import { Sparkles } from 'lucide-react'
import { useAiva } from './AivaContext'

export default function AivaTrigger() {
  const { toggle, isOpen, pageContext } = useAiva()
  const hasItems = (pageContext?.suggestions.length ?? 0) > 0

  return (
    <button
      onClick={toggle}
      aria-label="Open AIVA assistant"
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
        isOpen
          ? 'bg-accent-purple/80 text-white'
          : 'bg-accent-purple text-white hover:bg-accent-purple/90'
      }`}
    >
      <Sparkles className="w-5 h-5" />
      {hasItems && !isOpen && (
        <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-accent-amber border-2 border-bg-primary" />
      )}
    </button>
  )
}
