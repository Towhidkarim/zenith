import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '#/lib/utils'
import { useChatScroll } from '#/features/chat/lib/chat-scroll-context'

type ReasoningBlockProps = {
  text: string
  /** True while the reasoning stream is still in progress. */
  isActive?: boolean
}

/**
 * Quiet, collapsible chain-of-thought. Opens while reasoning streams,
 * auto-collapses when it finishes. User can still toggle manually.
 *
 * Uses CSS grid 0fr→1fr (not motion height:auto) so expand/collapse is
 * smooth, and pauses stick-to-bottom on manual toggle so the scroller
 * doesn't chase every intermediate height and flicker the transcript.
 */
export function ReasoningBlock({ text, isActive = false }: ReasoningBlockProps) {
  // Manual override is only valid for the current isActive phase —
  // when isActive flips, we fall back to the auto open/collapsed state.
  const [override, setOverride] = useState<{
    forActive: boolean
    open: boolean
  } | null>(null)
  const scroll = useChatScroll()

  const open =
    override && override.forActive === isActive ? override.open : isActive

  if (!text.trim()) return null

  const toggle = () => {
    // User-driven accordion: release the bottom lock so resize frames
    // don't instant-jump the viewport for the duration of the transition.
    scroll?.stopScroll()
    setOverride({ forActive: isActive, open: !open })
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 py-0.5 text-left text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground"
      >
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200 ease-out',
            open && 'rotate-90',
          )}
        />
        Reasoning
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'whitespace-pre-wrap pt-1.5 pl-5 text-sm leading-normal text-muted-foreground transition-opacity duration-200 ease-out',
              open ? 'opacity-100' : 'opacity-0',
            )}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  )
}
