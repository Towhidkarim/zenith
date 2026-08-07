import { cn } from '#/lib/utils'
import type { SuggestionStarter } from '#/features/chat/types'

type SuggestionChipProps = {
  starter: SuggestionStarter
  onSelect: (prompt: string) => void
  disabled?: boolean
}

/** Domain conversation starter on the empty state. */
export function SuggestionChip({
  starter,
  onSelect,
  disabled = false,
}: SuggestionChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        onSelect(starter.prompt)
      }}
      className={cn(
        'rounded-[16px] border border-border bg-secondary px-3.5 py-2.5 text-left text-sm text-foreground/80 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:border-[var(--hairline-strong)] hover:text-foreground',
      )}
    >
      {starter.label}
    </button>
  )
}
