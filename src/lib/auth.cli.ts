/**
 * CLI-only Better Auth config (no Cloudflare runtime imports).
 * Used by: `pnpm dlx auth@latest generate --config src/lib/auth.cli.ts`
 */
import { betterAuth } from 'better-auth'
import { username } from 'better-auth/plugins'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
  ],
})
