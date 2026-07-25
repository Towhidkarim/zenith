import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { duration, easeOut } from '#/features/chat/lib/motion'
import type { ChatDataParts } from '#/features/chat/types'

type AgentStep = ChatDataParts['agent-step']

type AgentStepListProps = {
  steps: AgentStep[]
  /** True while the agent is still working through steps. */
  isThinking: boolean
}

const line = {
  initial: { y: 14, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -14, opacity: 0 },
}

/**
 * Single-line agent progress ticker. Each step rolls up out of view as the
 * next arrives (Grok-style). When work finishes, the line is replaced by a
 * compact "Thought for Ns" summary instead of a stack of checked items.
 */
export function AgentStepList({ steps, isThinking }: AgentStepListProps) {
  const startRef = useRef<number | null>(null)
  const [elapsedSec, setElapsedSec] = useState<number | null>(null)

  useEffect(() => {
    if (steps.length > 0 && startRef.current === null) {
      startRef.current = Date.now()
    }
  }, [steps.length])

  useEffect(() => {
    if (!isThinking && startRef.current !== null && elapsedSec === null) {
      const secs = Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
      setElapsedSec(secs)
    }
  }, [isThinking, elapsedSec])

  if (steps.length === 0) return null

  const current = steps[steps.length - 1]
  const done = !isThinking
  const stepActive = current.status === 'active'

  return (
    <div className="relative mb-0.5 h-6 overflow-hidden text-sm">
      <AnimatePresence initial={false} mode="popLayout">
        {done ? (
          <motion.div
            key="summary"
            variants={line}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: duration.base, ease: easeOut }}
            className="absolute inset-0 flex items-center gap-2 text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Thought for {elapsedSec ?? 1}s</span>
          </motion.div>
        ) : (
          <motion.div
            key={current.id}
            variants={line}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: duration.base, ease: easeOut }}
            className="absolute inset-0 flex items-center gap-2 text-foreground/80"
          >
            {stepActive ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span>{current.label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
