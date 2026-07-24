import type { Transition, Variants } from 'motion/react'

/**
 * Motion tokens mirrored from DESIGN.md.
 * Keep animations about presence + state, never decorative loops.
 */
export const duration = {
  instant: 0.12,
  fast: 0.15,
  base: 0.2,
  slow: 0.28,
  presence: 0.35,
} as const

export const easeOut = [0.16, 1, 0.3, 1] as const

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 28,
  mass: 0.9,
}

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
}

/** Enter animation for a new message turn (opacity + small rise). */
export const messagePresence: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.presence, ease: easeOut },
  },
}

/** Crossfade used for the send/stop slot swap. */
export const slotSwap: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
}
