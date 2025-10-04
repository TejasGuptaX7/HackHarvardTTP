// src/lib/db.ts
import { ChatMessage } from '../types';

export async function createSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('INSERT OR IGNORE INTO chat_sessions (id) VALUES (?)').bind(sessionId).run();
}

export async function saveMessage(
  db: D1Database,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  await createSession(db, sessionId);
  await db
    .prepare('INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)')
    .bind(sessionId, role, content)
    .run();
}

export async function getConversationHistory(
  db: D1Database,
  sessionId: string,
  limit: number = 10
): Promise<ChatMessage[]> {
  const result = await db
    .prepare(
      'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?'
    )
    .bind(sessionId, limit)
    .all();

  if (!result.results) return [];

  // Reverse to get chronological order
  return result.results.reverse().map((row: any) => ({
    role: row.role as 'user' | 'assistant',
    content: row.content as string,
  }));
}

export async function saveRecommendations(
  db: D1Database,
  sessionId: string,
  recommendations: Array<{ buildingId: number; reason: string; score: number }>
): Promise<void> {
  // Clear old recommendations for this session
  await db.prepare('DELETE FROM recommendations WHERE session_id = ?').bind(sessionId).run();

  // Insert new recommendations
  for (const rec of recommendations) {
    await db
      .prepare(
        'INSERT INTO recommendations (session_id, building_id, reason, score) VALUES (?, ?, ?, ?)'
      )
      .bind(sessionId, rec.buildingId, rec.reason, rec.score)
      .run();
  }
}

export async function getRecommendations(
  db: D1Database,
  sessionId: string
): Promise<Array<{ buildingId: number; reason: string; score: number }>> {
  const result = await db
    .prepare(
      'SELECT building_id, reason, score FROM recommendations WHERE session_id = ? ORDER BY score DESC'
    )
    .bind(sessionId)
    .all();

  if (!result.results) return [];

  return result.results.map((row: any) => ({
    buildingId: row.building_id,
    reason: row.reason,
    score: row.score,
  }));
}