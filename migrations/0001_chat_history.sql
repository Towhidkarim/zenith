-- Chat conversation history (D1)
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES chats(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  run_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS message_citations (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES messages(id),
  point_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'act_section',
  act_title TEXT NOT NULL,
  act_no TEXT NOT NULL,
  act_year INTEGER NOT NULL,
  section_number TEXT NOT NULL,
  section_title TEXT NOT NULL,
  url TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_run_role ON messages(run_id, role) WHERE run_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_citations_message ON message_citations(message_id);
