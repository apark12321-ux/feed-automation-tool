import Database from 'better-sqlite3';
import fs from 'fs';

fs.mkdirSync('data', { recursive: true });
fs.mkdirSync('public/generated', { recursive: true });

export const db = new Database('data/feedflow.sqlite');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS sources (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL DEFAULT 'rss', name TEXT NOT NULL, url TEXT NOT NULL UNIQUE, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, source_url TEXT UNIQUE, title TEXT NOT NULL, summary TEXT, raw TEXT, published_at TEXT, score INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'collected', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER, title TEXT NOT NULL, slides_json TEXT NOT NULL, caption TEXT NOT NULL, hashtags TEXT NOT NULL, image_paths_json TEXT DEFAULT '[]', scheduled_at TEXT, status TEXT NOT NULL DEFAULT 'draft', publish_result TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
`);

export function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row?.value ?? fallback;
}

export function setSetting(key, value) {
  db.prepare('INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, String(value));
}
