export async function publishToInstagram(post) {
  const token = process.env.META_ACCESS_TOKEN;
  const igUserId = process.env.META_IG_USER_ID;
  const baseUrl = process.env.PUBLIC_BASE_URL;
  if (!token || !igUserId || !baseUrl) return { ok: false, skipped: true, reason: 'Meta settings required' };
  const images = JSON.parse(post.image_paths_json || '[]');
  if (!images.length) return { ok: false, reason: 'no image generated' };
  const imageUrl = `${baseUrl}${images[0]}`;
  const createBody = new URLSearchParams({ image_url: imageUrl, caption: `${post.caption}\n\n${post.hashtags}`, access_token: token });
  const containerRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, { method: 'POST', body: createBody });
  const container = await containerRes.json();
  if (!container.id) return { ok: false, step: 'container', result: container };
  const publishBody = new URLSearchParams({ creation_id: container.id, access_token: token });
  const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, { method: 'POST', body: publishBody });
  const result = await publishRes.json();
  return { ok: Boolean(result.id), result, imageUrl };
}
