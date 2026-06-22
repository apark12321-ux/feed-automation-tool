import 'dotenv/config';
import { db } from '../db.js';
import { makePostPlan } from '../lib/ai.js';
import { renderSlides } from '../lib/render.js';

export async function generatePosts() {
  const limit = Number(process.env.POSTS_PER_DAY || 3);
  const items = db.prepare("SELECT * FROM items WHERE status = 'collected' ORDER BY id DESC LIMIT ?").all(limit);
  let made = 0;
  for (const item of items) {
    const plan = await makePostPlan(item, {
      name: process.env.BRAND_NAME,
      tone: process.env.BRAND_TONE,
      colorA: process.env.BRAND_COLOR_A,
      colorB: process.env.BRAND_COLOR_B
    });
    const scheduledAt = new Date(Date.now() + made * 2 * 60 * 60 * 1000).toISOString();
    const row = db.prepare('INSERT INTO posts(item_id,title,slides_json,caption,hashtags,scheduled_at,status) VALUES(?,?,?,?,?,?,?)').run(
      item.id,
      plan.title || item.title,
      JSON.stringify(plan.slides || []),
      plan.caption || '',
      Array.isArray(plan.hashtags) ? plan.hashtags.join(' ') : String(plan.hashtags || ''),
      scheduledAt,
      'scheduled'
    );
    const images = renderSlides(row.lastInsertRowid, plan, {
      name: process.env.BRAND_NAME,
      colorA: process.env.BRAND_COLOR_A,
      colorB: process.env.BRAND_COLOR_B
    });
    db.prepare('UPDATE posts SET image_paths_json = ? WHERE id = ?').run(JSON.stringify(images), row.lastInsertRowid);
    db.prepare("UPDATE items SET status = 'used', score = ? WHERE id = ?").run(plan.score || 0, item.id);
    made += 1;
  }
  console.log('generated', made);
  return made;
}

if (import.meta.url === 'file://' + process.argv[1]) generatePosts();
