import { createFileRoute } from '@tanstack/react-router'
import { ChatShell } from '#/features/chat/compositions/chat-shell'

export const Route = createFileRoute('/chat/$chatId')({
  head: () => ({
    meta: [{ title: 'Zenith' }],
  }),
  component: ChatRoute,
})

function ChatRoute() {
  const { chatId } = Route.useParams()
  return <ChatShell chatId={chatId} />
}
