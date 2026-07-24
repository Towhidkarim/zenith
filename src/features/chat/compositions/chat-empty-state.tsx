import { SuggestionChip } from '#/features/chat/components/suggestion-chip'
import type { SuggestionStarter } from '#/features/chat/types'

const STARTERS: SuggestionStarter[] = [
  {
    id: 'explain',
    label: 'Explain a concept in plain language',
    prompt: 'Explain a concept to me in plain language.',
  },
  {
    id: 'compare',
    label: 'Compare two approaches',
    prompt: 'Compare two approaches and tell me the trade-offs.',
  },
  {
    id: 'summarize',
    label: 'Summarize this for me',
    prompt: 'Summarize the following for me: ',
  },
  {
    id: 'draft',
    label: 'Draft something to get started',
    prompt: 'Help me draft something to get started.',
  },
]

type ChatEmptyStateProps = {
  onSelect: (prompt: string) => void
}

/** Centered brand cue + domain starters shown before the first turn. */
export function ChatEmptyState({ onSelect }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2.5">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Zenith
        </h1>
        <p className="max-w-md text-[15px] leading-[1.5] text-muted-foreground">
          Ask a question to get a considered, well-sourced answer.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {STARTERS.map((starter) => (
          <SuggestionChip key={starter.id} starter={starter} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
