import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AivaPageContext } from '../../types'

interface AivaContextValue {
  isOpen: boolean
  toggle: () => void
  close: () => void
  pageContext: AivaPageContext | null
  setPageContext: (ctx: AivaPageContext) => void
}

const AivaContext = createContext<AivaContextValue | null>(null)

export function AivaProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pageContext, setPageContext] = useState<AivaPageContext | null>(null)

  function toggle() { setIsOpen((v) => !v) }
  function close() { setIsOpen(false) }

  return (
    <AivaContext.Provider value={{ isOpen, toggle, close, pageContext, setPageContext }}>
      {children}
    </AivaContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAiva() {
  const ctx = useContext(AivaContext)
  if (!ctx) throw new Error('useAiva must be used inside AivaProvider')
  return ctx
}
