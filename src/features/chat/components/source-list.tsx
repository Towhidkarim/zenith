import { ExternalLink } from 'lucide-react'
import type { SourceLink } from '#/features/chat/lib/message-parts'

type SourceListProps = {
  sources: SourceLink[]
  /** When true, hide sources (e.g. while the answer is still streaming). */
  deferWhileStreaming?: boolean
  isStreaming?: boolean
}

/** Citation row list under an assistant turn. */
export function SourceList({
  sources,
  deferWhileStreaming = false,
  isStreaming = false,
}: SourceListProps) {
  if (sources.length === 0) return null
  if (deferWhileStreaming && isStreaming) return null

  return (
    <div className="mt-1 flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
        Sources
      </span>
      {sources.map((source) => (
        <a
          key={source.sourceId}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{source.title ?? source.url}</span>
        </a>
      ))}
    </div>
  )
}
