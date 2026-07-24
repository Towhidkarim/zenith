import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '#/lib/utils'
import { duration, easeOut } from '#/features/chat/lib/motion'

type ReasoningBlockProps = {
  text: string
  /** True while the reasoning stream is still in progress. */
  isActive?: boolean
}

/**
 * Quiet, collapsible chain-of-thought. Opens while reasoning streams,
 * auto-collapses when it finishes. User can still toggle manually.
 */
export function ReasoningBlock({ text, isActive = false }: ReasoningBlockProps) {
  // Manual override is only valid for the current isActive phase —
  // when isActive flips, we fall back to the auto open/collapsed state.
  const [override, setOverride] = useState<{
    forActive: boolean
    open: boolean
  } | null>(null)

  const open =
    override && override.forActive === isActive ? override.open : isActive

  if (!text.trim()) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setOverride({ forActive: isActive, open: !open })}
        className="flex items-center gap-1.5 py-0.5 text-left text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground"
      >
        <ChevronRight
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-90')}
        />
        Reasoning
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: duration.base, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="whitespace-pre-wrap pt-1.5 pl-5 text-sm leading-normal text-muted-foreground">
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
