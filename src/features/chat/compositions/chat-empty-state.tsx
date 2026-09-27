import { motion, useReducedMotion } from 'motion/react'
import { SuggestionChip } from '#/features/chat/components/suggestion-chip'
import { chatCopy, defaultStarters } from '#/features/chat/lib/chat-copy'
import { duration, easeOut } from '#/features/chat/lib/motion'
import type { SuggestionStarter } from '#/features/chat/types'

type ChatEmptyStateProps = {
  onSelect: (prompt: string) => void
  /** True while a reply is in flight — starters must not queue another send. */
  disabled?: boolean
  brand?: string
  cue?: string
  starters?: SuggestionStarter[]
}

/** Centered brand cue + Bangladesh-law starters before the first turn. */
export function ChatEmptyState({
  onSelect,
  disabled = false,
  brand = chatCopy.brand,
  cue = chatCopy.cue,
  starters = defaultStarters,
}: ChatEmptyStateProps) {
  const reduceMotion = useReducedMotion()
  const enter = reduceMotion
    ? { duration: 0 }
    : { duration: duration.presence, ease: easeOut }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={enter}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Bangladesh legal research
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {brand}
        </h1>
        <p className="max-w-lg text-[15px] leading-[1.55] text-muted-foreground">
          {cue}
        </p>
      </motion.div>

      <motion.div
        className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...enter, delay: reduceMotion ? 0 : 0.06 }}
      >
        {starters.map((starter) => (
          <SuggestionChip
            key={starter.id}
            starter={starter}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </motion.div>
    </div>
  )
}
