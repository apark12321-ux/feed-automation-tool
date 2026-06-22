import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { db, setSetting } from './db.js';
import { collectFeeds } from './jobs/collect.js';
import { generatePosts } from './jobs/generatePosts.js';
import { publishDuePosts } from './jobs/publish.js';

const app = express();
const port = Number(process.env.PORT || 8787);
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/generated', express.static('public/generated'));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/dashboard', (req, res) => {
  const counts = {
    sources: db.prepare('SELECT COUNT(*) n FROM sources').get().n,
    items: db.prepare('SELECT COUNT(*) n FROM items').get().n,
    posts: db.prepare('SELECT COUNT(*) n FROM posts').get().n,
    scheduled: db.prepare("SELECT COUNT(*) n FROM posts WHERE status='scheduled'").get().n,
    published: db.prepare("SELECT COUNT(*) n FROM posts WHERE status='published'").get().n,
    failed: db.prepare("SELECT COUNT(*) n FROM posts WHERE status='publish_failed'").get().n
  };
  res.json({ counts });
});
app.get('/api/items', (req, res) => res.json(db.prepare('SELECT * FROM items ORDER BY id DESC LIMIT 100').all()));
app.get('/api/posts', (req, res) => res.json(db.prepare('SELECT * FROM posts ORDER BY id DESC LIMIT 100').all()));
app.get('/api/sources', (req, res) => res.json(db.prepare('SELECT * FROM sources ORDER BY id DESC').all()));
app.post('/api/sources', (req, res) => {
  const { name, url } = req.body;
  db.prepare('INSERT OR IGNORE INTO sources(name,url) VALUES(?,?)').run(name || url, url);
  res.json({ ok: true });
});
app.post('/api/settings', (req, res) => {
  Object.entries(req.body || {}).forEach(([k, v]) => setSetting(k, v));
  res.json({ ok: true });
});
app.post('/api/run/collect', async (req, res) => res.json({ inserted: await collectFeeds() }));
app.post('/api/run/generate', async (req, res) => res.json({ made: await generatePosts() }));
app.post('/api/run/publish', async (req, res) => res.json({ checked: await publishDuePosts() }));

cron.schedule(process.env.COLLECT_CRON || '0 7 * * *', collectFeeds, { timezone: process.env.RUN_TIMEZONE || 'Asia/Seoul' });
cron.schedule(process.env.GENERATE_CRON || '30 7 * * *', generatePosts, { timezone: process.env.RUN_TIMEZONE || 'Asia/Seoul' });
cron.schedule(process.env.PUBLISH_CRON || '*/15 * * * *', publishDuePosts, { timezone: process.env.RUN_TIMEZONE || 'Asia/Seoul' });

app.listen(port, () => console.log('FeedFlow server running on :' + port));
