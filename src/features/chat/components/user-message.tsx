import { memo } from 'react'

type UserMessageProps = {
  text: string
}

/**
 * Right-aligned user turn. Soft surface bubble with a tail corner,
 * capped at ~78% width. No avatar — position disambiguates the speaker.
 */
function UserMessageImpl({ text }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] whitespace-pre-wrap break-words rounded-[20px] rounded-br-[6px] bg-[var(--surface-1)] px-4 py-3 text-[15px] leading-[1.5] text-foreground">
        {text}
      </div>
    </div>
  )
}

export const UserMessage = memo(UserMessageImpl)
