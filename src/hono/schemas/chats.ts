import { z } from 'zod'

export const ChatListQuerySchema = z.object({
  /** Comma-separated chat ids owned by this browser (anonymous list). */
  ids: z.string().min(1),
})

export const ChatListItemSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  updatedAt: z.number(),
  userId: z.string().nullable(),
})

export const ChatListResponseSchema = z.object({
  chats: z.array(ChatListItemSchema),
})

export type ChatListResponse = z.infer<typeof ChatListResponseSchema>
