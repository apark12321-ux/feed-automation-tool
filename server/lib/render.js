import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

function wrap(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function renderSlides(postId, plan, brand = {}) {
  const dir = path.join('public', 'generated', String(postId));
  fs.mkdirSync(dir, { recursive: true });
  const colorA = brand.colorA || process.env.BRAND_COLOR_A || '#18d5ff';
  const colorB = brand.colorB || process.env.BRAND_COLOR_B || '#8b5cf6';
  const name = brand.name || process.env.BRAND_NAME || 'FeedFlow Auto';
  const paths = [];
  const slides = plan.slides || [];
  slides.forEach((slide, idx) => {
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
    bg.addColorStop(0, '#061120');
    bg.addColorStop(0.55, '#152955');
    bg.addColorStop(1, '#110f2a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1080);
    const accent = ctx.createLinearGradient(96, 96, 984, 96);
    accent.addColorStop(0, colorA);
    accent.addColorStop(1, colorB);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.strokeRect(78, 78, 924, 924);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fillRect(110, 110, 860, 860);
    ctx.fillStyle = colorA;
    ctx.font = '800 30px sans-serif';
    ctx.fillText(`${idx + 1}/${slides.length}`, 140, 170);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 78px sans-serif';
    wrap(ctx, slide.heading, 800).slice(0, 3).forEach((line, i) => ctx.fillText(line, 140, 310 + i * 92));
    ctx.fillStyle = 'rgba(255,255,255,.82)';
    ctx.font = '500 38px sans-serif';
    wrap(ctx, slide.body, 800).slice(0, 7).forEach((line, i) => ctx.fillText(line, 140, 615 + i * 58));
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 28px sans-serif';
    ctx.fillText(name, 140, 930);
    const file = path.join(dir, `slide-${String(idx + 1).padStart(2, '0')}.png`);
    fs.writeFileSync(file, canvas.toBuffer('image/png'));
    paths.push('/' + file.replaceAll('\\', '/').replace(/^public\//, ''));
  });
  return paths;
}
