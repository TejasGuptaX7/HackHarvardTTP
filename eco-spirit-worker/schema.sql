-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Chat messages with full context
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  timestamp INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);

-- Current recommendations per session
CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  building_id INTEGER NOT NULL,
  reason TEXT,
  score REAL,
  timestamp INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_recommendations_session ON recommendations(session_id, timestamp DESC);