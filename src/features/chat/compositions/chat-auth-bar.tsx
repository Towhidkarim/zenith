import { Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

/**
 * Guest actions for the chat header. Signed-in accounts live in the sidebar footer.
 */
export function ChatAuthBar({ className }: { className?: string }) {
  const { data: session, isPending } = authClient.useSession()

  if (!isPending && session?.user) return null

  return (
    <div className={cn('ml-auto flex items-center gap-2', className)}>
      {isPending ? (
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
      ) : (
        <>
          <Button variant="ghost" className="rounded-full" asChild>
            <Link to="/sign-in">Log in</Link>
          </Button>
          <Button className="rounded-full whitespace-nowrap" asChild>
            <Link to="/sign-up">Sign up for free</Link>
          </Button>
        </>
      )}
    </div>
  )
}
