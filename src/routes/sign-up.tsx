import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/sign-up')({
  head: () => ({
    meta: [{ title: 'Sign up · Zenith' }],
  }),
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setPending(true)
    const { error: signUpError } = await authClient.signUp.email({
      email: email.trim(),
      password,
      name: username.trim(),
      username: username.trim(),
    })
    setPending(false)

    if (signUpError) {
      setError(signUpError.message || 'Could not create account.')
      return
    }

    void navigate({ to: '/' })
  }

  return (
    <main className="mx-auto flex h-full w-full max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Create account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-foreground underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Email</span>
          <input
            type="email"
            required
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
            required
            autoComplete="username"
            minLength={3}
            maxLength={30}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-[12px] border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-[var(--hairline-strong)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Password</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[12px] border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-[var(--hairline-strong)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Confirm password</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-[12px] border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-[var(--hairline-strong)]"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-[12px] bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Sign up'}
        </button>
      </form>
    </main>
  )
}
