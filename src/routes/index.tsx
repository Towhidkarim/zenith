import { createFileRoute } from '@tanstack/react-router'
import { ChatWindow } from '#/features/chat'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return <ChatWindow />
}
