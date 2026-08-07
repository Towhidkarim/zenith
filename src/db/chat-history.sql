-- Phase 3 chat history (D1 / sqlite). Apply when enabling env.DB.
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
