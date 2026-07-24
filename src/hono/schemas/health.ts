import { z } from 'zod'
import { OkResponseSchema } from './common'

export const HealthResponseSchema = OkResponseSchema.extend({
  service: z.literal('zenith-rest'),
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>
