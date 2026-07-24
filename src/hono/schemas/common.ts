import { z } from 'zod'

/** Shared JSON error envelope for `/api/rest/*`. */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  path: z.string().optional(),
  details: z.unknown().optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/** Generic ok payload for simple health-style routes. */
export const OkResponseSchema = z.object({
  ok: z.literal(true),
})

export type OkResponse = z.infer<typeof OkResponseSchema>
