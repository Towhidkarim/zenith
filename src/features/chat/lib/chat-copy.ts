import type { SuggestionStarter } from '#/features/chat/types'

/** Product copy for the empty chat surface — keep domain vocabulary out of JSX. */
export const chatCopy = {
  brand: 'Zenith',
  cue: 'Ask a question to get a considered, well-sourced answer.',
  composerPlaceholder: 'Ask anything…',
  streamError: 'Something went wrong generating a reply.',
  retryLabel: 'Retry',
} as const

export const defaultStarters: SuggestionStarter[] = [
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
