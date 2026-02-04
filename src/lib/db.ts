import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath = process.env.DATABASE_URL?.replace('file://', '') || './data/dev.db';
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Helper functions for database operations
export function runQuery<T = any>(
  query: string,
  params: any[] = []
): T[] {
  const db = getDatabase();
  const stmt = db.prepare(query);
  return stmt.all(...params) as T[];
}

export function runSingle<T = any>(
  query: string,
  params: any[] = []
): T | null {
  const db = getDatabase();
  const stmt = db.prepare(query);
  return (stmt.get(...params) as T) || null;
}

export function runInsert(
  query: string,
  params: any[] = []
): { lastID: number; changes: number } {
  const db = getDatabase();
  const stmt = db.prepare(query);
  const info = stmt.run(...params);
  return {
    lastID: info.lastInsertRowid as number,
    changes: info.changes,
  };
}
