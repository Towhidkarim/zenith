import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/sign-in')({
  head: () => ({
    meta: [{ title: 'Sign in · Zenith' }],
  }),
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setPending(true)

    const trimmedEmail = email.trim()
    const trimmedUsername = username.trim()

    const result = trimmedUsername
      ? await authClient.signIn.username({
          username: trimmedUsername,
          password,
        })
      : await authClient.signIn.email({
          email: trimmedEmail,
          password,
        })

    setPending(false)

    if (result.error) {
      setError(result.error.message || 'Could not sign in.')
      return
    }

    void navigate({ to: '/' })
  }

  return (
    <main className="mx-auto flex h-full w-full max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        No account?{' '}
        <Link to="/sign-up" className="text-foreground underline-offset-2 hover:underline">
          Sign up
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[12px] border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-[var(--hairline-strong)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Username</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-[12px] border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-[var(--hairline-strong)]"
          />
        </label>

        <p className="text-xs text-muted-foreground">
          Use either email or username (username wins if both are filled).
        </p>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[12px] border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-[var(--hairline-strong)]"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending || (!email.trim() && !username.trim())}
          className="mt-2 rounded-[12px] bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
