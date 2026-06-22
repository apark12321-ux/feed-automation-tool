import 'dotenv/config';
import Parser from 'rss-parser';
import { db } from '../db.js';

const parser = new Parser();

function rssList() {
  const fromEnv = (process.env.RSS_FEEDS || '').split(',').map(v => v.trim()).filter(Boolean);
  const fromDb = db.prepare('SELECT url FROM sources WHERE active = 1').all().map(r => r.url);
  return [...new Set([...fromEnv, ...fromDb])];
}

export async function collectFeeds() {
  const feeds = rssList();
  let inserted = 0;
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      db.prepare('INSERT OR IGNORE INTO sources(name, url) VALUES(?, ?)').run(feed.title || url, url);
      for (const item of feed.items || []) {
        const res = db.prepare('INSERT OR IGNORE INTO items(source_url, title, summary, raw, published_at, status) VALUES(?, ?, ?, ?, ?, ?)').run(
          item.link || item.guid,
          item.title || '제목 없음',
          item.contentSnippet || item.summary || '',
          item.content || item.description || '',
          item.isoDate || item.pubDate || '',
          'collected'
        );
        if (res.changes) inserted++;
      }
    } catch (err) {
      console.error('[collect error]', url, err.message);
    }
  }
  console.log(`[collect] inserted ${inserted}`);
  return inserted;
}

if (import.meta.url === `file://${process.argv[1]}`) collectFeeds();
