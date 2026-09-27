import type { SuggestionStarter } from '#/features/chat/types'

/** Product copy for the empty chat surface — keep domain vocabulary out of JSX. */
export const chatCopy = {
  brand: 'Zenith',
  cue: 'Ask about Bangladesh law — acts, sections, and offences — and get cited, plain-language answers.',
  composerPlaceholder: 'Ask about an Act, section, or offence…',
  streamError: 'Something went wrong generating a reply.',
  retryLabel: 'Retry',
  disclaimer: 'Not legal advice. Verify against the official Act text.',
} as const

/** Domain starters that map well to the bd_laws corpus. */
export const defaultStarters: SuggestionStarter[] = [
  {
    id: 'bail',
    label: 'When is bail available?',
    prompt:
      'Under Bangladesh criminal procedure, when can bail be granted, and what factors matter?',
  },
  {
    id: 'theft',
    label: 'Punishment for theft',
    prompt:
      'What is the punishment for theft under the Penal Code in Bangladesh? Cite the relevant sections.',
  },
  {
    id: 'contract',
    label: 'When is a contract void?',
    prompt:
      'Under the Contract Act in Bangladesh, when is an agreement void or voidable? Summarize the key grounds with citations.',
  },
  {
    id: 'fir',
    label: 'What must an FIR contain?',
    prompt:
      'What should a First Information Report (FIR) contain under Bangladesh criminal procedure, and what happens after it is lodged?',
  },
]
