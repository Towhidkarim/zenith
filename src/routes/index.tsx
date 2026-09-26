import { createFileRoute } from '@tanstack/react-router'
import { ChatShell } from '#/features/chat/compositions/chat-shell'

/** Draft chat — no session until the first message is sent. */
export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: 'Zenith' }],
  }),
  component: DraftChatRoute,
})

function DraftChatRoute() {
  return <ChatShell />
}
