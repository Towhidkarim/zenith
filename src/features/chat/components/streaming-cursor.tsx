/**
 * Blinking block caret used while the assistant is thinking / streaming,
 * matching ChatGPT / Gemini / Claude style UIs.
 */
export function StreamingCursor() {
  return (
    <span
      aria-hidden
      className="zenith-stream-caret ml-0.5 inline-block h-[1.05em] w-[0.55ch] translate-y-[0.1em] rounded-[1px] bg-foreground align-text-bottom"
    />
  )
}
