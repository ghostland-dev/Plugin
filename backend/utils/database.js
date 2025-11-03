import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sur Vercel, utiliser /tmp pour la base de données (temporaire)
// En local, utiliser le fichier db.sqlite normal
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
  ? '/tmp/db.sqlite'  // Vercel Serverless Functions (temporaire)
  : path.join(__dirname, '../db.sqlite'); // Local

const db = new Database(dbPath);

export function initDatabase() {
  // Table des générations
  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      domain TEXT,
      server_type TEXT NOT NULL,
      include_legal INTEGER DEFAULT 0,
      payment_intent_id TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      zip_path TEXT,
      expires_at DATETIME
    )
  `);

  // Table des statistiques (pour l'admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      generation_id INTEGER,
      ip_address TEXT,
      country TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (generation_id) REFERENCES generations(id)
    )
  `);

  // Index pour optimiser les recherches
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_session_id ON generations(session_id);
    CREATE INDEX IF NOT EXISTS idx_created_at ON generations(created_at);
  `);

  console.log('✅ Base de données initialisée');
}

export function createGeneration(data) {
  const stmt = db.prepare(`
    INSERT INTO generations (session_id, domain, server_type, include_legal, payment_intent_id, email, zip_path, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h
  
  return stmt.run(
    data.session_id,
    data.domain || null,
    data.server_type,
    data.include_legal ? 1 : 0,
    data.payment_intent_id || null,
    data.email || null,
    data.zip_path || null,
    expiresAt.toISOString()
  );
}

export function getGenerationBySessionId(sessionId) {
  const stmt = db.prepare('SELECT * FROM generations WHERE session_id = ?');
  return stmt.get(sessionId);
}

export function getGenerationById(id) {
  const stmt = db.prepare('SELECT * FROM generations WHERE id = ?');
  return stmt.get(id);
}

export function getAllGenerations(limit = 100) {
  const stmt = db.prepare('SELECT * FROM generations ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit);
}

export function updateGeneration(sessionId, data) {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data);
  const stmt = db.prepare(`UPDATE generations SET ${fields} WHERE session_id = ?`);
  return stmt.run(...values, sessionId);
}

export function deleteExpiredGenerations() {
  const stmt = db.prepare('DELETE FROM generations WHERE expires_at < datetime("now")');
  return stmt.run();
}

export default db;

