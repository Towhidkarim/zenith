import { Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { cn } from '#/lib/utils'

/**
 * ChatGPT-style top chrome for the main chat pane.
 * Guests see Log in + Sign up; signed-in users see a compact account control.
 */
export function ChatAuthBar({ className }: { className?: string }) {
  const { data: session, isPending } = authClient.useSession()

  return (
    <header
      className={cn(
        'flex h-12 shrink-0 items-center justify-end gap-2 px-4',
        className,
      )}
    >
      {isPending ? (
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
      ) : session?.user ? (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium text-foreground">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              (session.user.name?.charAt(0) ||
                session.user.email?.charAt(0) ||
                'U'
              ).toUpperCase()
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              void authClient.signOut()
            }}
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      ) : (
        <>
          <Link
            to="/sign-in"
            className={cn(
              'inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-foreground',
              'transition-colors hover:bg-secondary',
            )}
          >
            Log in
          </Link>
          <Link
            to="/sign-up"
            className={cn(
              'inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground',
              'transition-opacity hover:opacity-90',
            )}
          >
            Sign up for free
          </Link>
        </>
      )}
    </header>
  )
}
