import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/** Better Auth tables (CLI: `pnpm auth:generate`). */
export {
  user,
  session,
  account,
  verification,
  userRelations,
  sessionRelations,
  accountRelations,
} from './auth-schema'

export const todos = sqliteTable('todos', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  title: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

/** Chat history tables live on Cloudflare D1 (`env.DB`). See migrations/. */
export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title'),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
})

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id')
    .notNull()
    .references(() => chats.id),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  runId: text('run_id'),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
})

/** Citation snapshot attached to an assistant message. */
export const messageCitations = sqliteTable('message_citations', {
  id: text('id').primaryKey(),
  messageId: text('message_id')
    .notNull()
    .references(() => messages.id),
  pointId: text('point_id').notNull(),
  kind: text('kind').notNull().default('act_section'),
  actTitle: text('act_title').notNull(),
  actNo: text('act_no').notNull(),
  actYear: integer('act_year').notNull(),
  sectionNumber: text('section_number').notNull(),
  sectionTitle: text('section_title').notNull(),
  url: text('url'),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
})
