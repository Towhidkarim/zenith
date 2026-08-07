import { SuggestionChip } from '#/features/chat/components/suggestion-chip'
import { chatCopy, defaultStarters } from '#/features/chat/lib/chat-copy'
import type { SuggestionStarter } from '#/features/chat/types'

type ChatEmptyStateProps = {
  onSelect: (prompt: string) => void
  /** True while a reply is in flight — starters must not queue another send. */
  disabled?: boolean
  brand?: string
  cue?: string
  starters?: SuggestionStarter[]
}

/** Centered brand cue + domain starters shown before the first turn. */
export function ChatEmptyState({
  onSelect,
  disabled = false,
  brand = chatCopy.brand,
  cue = chatCopy.cue,
  starters = defaultStarters,
}: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2.5">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          {brand}
        </h1>
        <p className="max-w-md text-[15px] leading-[1.5] text-muted-foreground">
          {cue}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {starters.map((starter) => (
          <SuggestionChip
            key={starter.id}
            starter={starter}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
