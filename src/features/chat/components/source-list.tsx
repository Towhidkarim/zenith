import type { SourceLink } from '#/features/chat/lib/message-parts'

type SourceListProps = {
  sources: SourceLink[]
  /** When true, hide sources (e.g. while the answer is still streaming). */
  deferWhileStreaming?: boolean
  isStreaming?: boolean
}

function isInternalCite(url: string) {
  return url.startsWith('#cite-')
}

/** Citation row list under an assistant turn (Act · Section labels). */
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
      {sources.map((source) => {
        const label = source.title ?? source.url
        if (isInternalCite(source.url)) {
          return (
            <div
              key={source.sourceId}
              className="text-sm text-muted-foreground"
            >
              {label}
            </div>
          )
        }
        return (
          <a
            key={source.sourceId}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            <span className="truncate">{label}</span>
          </a>
        )
      })}
    </div>
  )
}
