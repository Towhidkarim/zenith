import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '#/lib/utils'
import { SendButton } from '#/features/chat/components/send-button'

const MAX_TEXTAREA_HEIGHT = 200

type ChatComposerProps = {
  onSend: (text: string) => void
  onStop: () => void
  isStreaming: boolean
  placeholder?: string
  autoFocus?: boolean
  className?: string
  /** Optional slots reserved for attachments / tools / model pills. */
  leadingSlot?: ReactNode
  trailingSlot?: ReactNode
  footerSlot?: ReactNode
}

/**
 * Pinned composer surface. Auto-growing textarea (up to ~5 lines) with a
 * morphing send/stop control. Slots left open for future attachments/tools.
 */
export function ChatComposer({
  onSend,
  onStop,
  isStreaming,
  placeholder = 'Ask anything…',
  autoFocus = false,
  className,
  leadingSlot,
  trailingSlot,
  footerSlot,
}: ChatComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const canSend = value.trim().length > 0

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [value])

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue('')
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-2 rounded-[24px] border border-border bg-[var(--surface-1)] px-3 py-2.5',
        'focus-within:border-[var(--hairline-strong)]',
        className,
      )}
    >
      <div className="flex items-end gap-2">
        {leadingSlot ? (
          <div className="flex shrink-0 items-center pb-1">{leadingSlot}</div>
        ) : null}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-[1.5] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
          {trailingSlot}
          <SendButton
            isStreaming={isStreaming}
            canSend={canSend}
            onStop={onStop}
          />
        </div>
      </div>

      {footerSlot ? <div className="px-1">{footerSlot}</div> : null}
    </form>
  )
}
