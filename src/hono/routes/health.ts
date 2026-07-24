import { createHono } from '#/hono/factory'
import { HealthResponseSchema } from '#/hono/schemas/health'

const health = createHono()

health.get('/', (c) => {
  const payload = HealthResponseSchema.parse({
    ok: true,
    service: 'zenith-rest',
  })

  return c.json(payload)
})

export default health
