import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, Square } from 'lucide-react'
import { cn } from '#/lib/utils'
import { duration, slotSwap, springSnappy } from '#/features/chat/lib/motion'

type SendButtonProps = {
  /** True while a response is streaming — shows the stop affordance. */
  isStreaming: boolean
  /** True when there is text worth sending. */
  canSend: boolean
  onStop: () => void
}

/**
 * Composer trailing control. Morphs between Send (idle/has-text) and
 * Stop (streaming). Circle, 36px, ~44px hit area via padding.
 */
export function SendButton({ isStreaming, canSend, onStop }: SendButtonProps) {
  const disabled = !isStreaming && !canSend

  return (
    <motion.button
      type={isStreaming ? 'button' : 'submit'}
      onClick={isStreaming ? onStop : undefined}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={springSnappy}
      aria-label={isStreaming ? 'Stop generating' : 'Send message'}
      className={cn(
        'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled
          ? 'cursor-not-allowed bg-muted text-muted-foreground'
          : 'bg-primary text-primary-foreground hover:opacity-90',
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isStreaming ? (
          <motion.span
            key="stop"
            variants={slotSwap}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: duration.base }}
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </motion.span>
        ) : (
          <motion.span
            key="send"
            variants={slotSwap}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: duration.base }}
          >
            <ArrowUp className="h-4.5 w-4.5" strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
