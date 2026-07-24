/**
 * Quiet teletype cursor for the pre-text thinking state.
 * (During text streaming the caret is a CSS ::after on the last markdown block.)
 */
export function StreamingCursor() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[0.95em] w-[1.5px] translate-y-[0.12em] rounded-[1px] bg-foreground align-baseline animate-[zenith-caret_1.15s_ease-in-out_infinite]"
    />
  )
}
