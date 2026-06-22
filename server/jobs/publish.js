import 'dotenv/config';
import { db } from '../db.js';
import { publishToInstagram } from '../lib/publisher.js';

export async function publishDuePosts() {
  const rows = db.prepare("SELECT * FROM posts WHERE status = 'scheduled' AND scheduled_at <= ? ORDER BY scheduled_at ASC LIMIT 3").all(new Date().toISOString());
  let count = 0;
  for (const post of rows) {
    const result = await publishToInstagram(post);
    db.prepare('UPDATE posts SET status = ?, publish_result = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      result.ok ? 'published' : 'publish_failed',
      JSON.stringify(result),
      post.id
    );
    count += 1;
  }
  console.log('publish checked', count);
  return count;
}

if (import.meta.url === 'file://' + process.argv[1]) publishDuePosts();
