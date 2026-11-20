// Draws the GTA-style cover: a 7-panel comic grid (3 top, 1 wide hero, 3
// bottom), a pop-out hero cutout breaking out of its panel, a Vice City
// sunset or neon colour grade, striped retro frame accents, and bold caption
// lettering. Everything is drawn on canvas, so the same code renders the
// live preview and every exported PNG at its full size.

/** Colour grades: a canvas filter for the photos, an overlay wash, and the accent + stripe colours. */
export const GRADES = {
  sunset: {
    name: 'Sunset',
    filter: 'saturate(1.25) contrast(1.06)',
    overlay: [
      [0, 'rgba(255, 90, 40, 0.10)'],
      [0.55, 'rgba(255, 120, 80, 0.05)'],
      [1, 'rgba(190, 30, 120, 0.30)'],
    ],
    accent: '#ff2e88',
    stripeA: '#ff2e88',
    stripeB: '#ffffff',
    dark: '#1a0b2e',
  },
  neon: {
    name: 'Neon',
    filter: 'saturate(1.35) contrast(1.14)',
    overlay: [
      [0, 'rgba(0, 229, 255, 0.14)'],
      [0.5, 'rgba(120, 0, 255, 0.06)'],
      [1, 'rgba(255, 0, 180, 0.22)'],
    ],
    accent: '#00e5ff',
    stripeA: '#00e5ff',
    stripeB: '#1a1a2e',
    dark: '#0b1026',
  },
  coral: {
    name: 'Coral Heat',
    filter: 'saturate(1.3) contrast(1.08)',
    overlay: [
      [0, 'rgba(255, 190, 90, 0.12)'],
      [0.55, 'rgba(255, 140, 90, 0.06)'],
      [1, 'rgba(230, 60, 60, 0.26)'],
    ],
    accent: '#ffb347',
    stripeA: '#ffb347',
    stripeB: '#2b1838',
    dark: '#241024',
  },
};

/** The 7 panel rects for a cover of size w x h: 3 top, 1 wide hero, 3 bottom. Panel 3 is the hero. */
export function coverLayout(w, h) {
  const m = Math.round(w * 0.018);
  const g = Math.round(w * 0.014);
  const heroH = Math.round(h * 0.46);
  const sideH = Math.round((h - heroH - 2 * m - 2 * g) / 2);
  const pw = Math.round((w - 2 * m - 2 * g) / 3);
  const panels = [];
  for (let i = 0; i < 3; i++) {
    panels.push({ x: m + i * (pw + g), y: m, w: pw, h: sideH });
  }
  panels.push({ x: m, y: m + sideH + g, w: w - 2 * m, h: heroH });
  for (let i = 0; i < 3; i++) {
    panels.push({ x: m + i * (pw + g), y: m + sideH + g + heroH + g, w: pw, h: sideH });
  }
  return { panels, m, g };
}

/** Draws one photo cover-fit inside a panel rect, with pan (ox, oy, as
 * fractions of the panel's width/height so the crop scales to any export
 * size) and zoom. */
export function drawPanelPhoto(ctx, rect, photo, t) {
  if (!photo) return;
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const s = base * (t?.zoom || 1);
  const pw = photo.naturalWidth * s;
  const ph = photo.naturalHeight * s;
  const cx = rect.x + rect.w / 2 + (t?.ox || 0) * rect.w;
  const cy = rect.y + rect.h / 2 + (t?.oy || 0) * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.restore();
}

/** A band of diagonal stripes, clipped to its rect. */
export function drawStripes(ctx, x, y, w, h, colorA, colorB) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = colorA;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = colorB;
  const step = Math.max(8, h * 2.2);
  for (let sx = x - h; sx < x + w + h; sx += step) {
    ctx.beginPath();
    ctx.moveTo(sx, y + h);
    ctx.lineTo(sx + h, y);
    ctx.lineTo(sx + h + step / 2, y);
    ctx.lineTo(sx + step / 2, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** The caption: heavy capitals, black outline, white fill, accent underline bar. */
export function drawCaption(ctx, text, w, h, accent) {
  const clean = (text || '').trim().toUpperCase();
  if (!clean) return;
  let size = Math.round(h * 0.105);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const setFont = (s) => {
    ctx.font = `900 ${s}px 'Arial Black', 'Helvetica Neue', Arial, sans-serif`;
  };
  setFont(size);
  while (ctx.measureText(clean).width > w * 0.9 && size > 14) {
    size -= 2;
    setFont(size);
  }
  const y = h - Math.round(h * 0.055);
  // Accent underline bar behind the words.
  const tw = ctx.measureText(clean).width;
  ctx.fillStyle = accent;
  ctx.fillRect(w / 2 - tw / 2 - size * 0.25, y + size * 0.12, tw + size * 0.5, Math.max(6, size * 0.1));
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, size * 0.09);
  ctx.strokeStyle = '#111111';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = size * 0.18;
  ctx.shadowOffsetY = size * 0.06;
  ctx.strokeText(clean, w / 2, y);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(clean, w / 2, y);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Draws the whole cover onto `canvas` at its own size.
 * state: { caption, grade, heroCutout, panels: [{img, ox, oy, zoom} x 7] }.
 * panels[3] is the hero panel; its photo sits behind the pop-out cutout.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const { panels } = coverLayout(w, h);

  // Deep backdrop; the gutters read as a dark frame.
  ctx.fillStyle = grade.dark;
  ctx.fillRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, 'rgba(255, 120, 60, 0.20)');
  sky.addColorStop(0.5, 'rgba(200, 40, 120, 0.10)');
  sky.addColorStop(1, 'rgba(20, 8, 40, 0.35)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // The seven panels: white comic borders, photo cover-fit inside.
  const border = Math.max(4, Math.round(w * 0.008));
  ctx.filter = grade.filter;
  for (let i = 0; i < 7; i++) {
    const r = panels[i];
    const p = state.panels[i];
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = border * 1.6;
    ctx.shadowOffsetY = border * 0.6;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(r.x - border, r.y - border, r.w + border * 2, r.h + border * 2);
    ctx.restore();
    if (p && p.img) {
      drawPanelPhoto(ctx, r, p.img, p);
    } else {
      const g2 = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
      g2.addColorStop(0, '#3a1c5c');
      g2.addColorStop(1, '#7a2050');
      ctx.fillStyle = g2;
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }
  }
  ctx.filter = 'none';

  // Pop-out hero: the cutout person, larger than the hero panel, breaking
  // out above and below it with a drop shadow.
  const hero = panels[3];
  const cutout = state.heroCutout;
  if (cutout) {
    const aspect = cutout.width / cutout.height;
    const popH = hero.h * 1.3;
    const popW = popH * aspect;
    const popX = hero.x + hero.w / 2 - popW / 2;
    const popY = hero.y + hero.h / 2 - popH / 2 - hero.h * 0.05;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = Math.round(w * 0.02);
    ctx.shadowOffsetY = Math.round(h * 0.012);
    ctx.drawImage(cutout, popX, popY, popW, popH);
    ctx.restore();
  }

  // Colour grade wash over the whole cover.
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  for (const [stop, color] of grade.overlay) wash.addColorStop(stop, color);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);

  // Readability scrim behind the caption, then the striped frame bands.
  const scrim = ctx.createLinearGradient(0, h * 0.68, 0, h);
  scrim.addColorStop(0, 'rgba(0, 0, 0, 0)');
  scrim.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.68, w, h * 0.32);
  const bandH = Math.max(10, Math.round(h * 0.02));
  drawStripes(ctx, 0, 0, w, bandH, grade.stripeA, grade.stripeB);
  drawStripes(ctx, 0, h - bandH, w, bandH, grade.stripeA, grade.stripeB);

  drawCaption(ctx, state.caption, w, h, grade.accent);
}

/** Renders the cover to a fresh canvas at exactly w x h (an export size). */
export function renderCoverToSize(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas, state);
  return canvas;
}
