// cover.js — Slanted Grid cover renderer (fresh code).
// A GTA-style cover is a set of large photo panels cut by thick black
// DIAGONAL gutters, one huge central logo, one sunset palette, no clutter.
// The slant is an affine shear of a rectangular cell grid, clipped to the
// frame: that is what makes the panels trapezoids that interlock, instead
// of plain boxes with pasted photos.

export const DEMO_CAST = [
  { id: 'duo', label: 'The Duo', src: 'samples/duo.jpg', focus: [0.5, 0.42] },
  { id: 'heli', label: 'The Helicopter', src: 'samples/heli.jpg', focus: [0.58, 0.52] },
  { id: 'boat', label: 'The Escape', src: 'samples/boat.jpg', focus: [0.55, 0.55] },
  { id: 'robber', label: 'The Robber', src: 'samples/robber.jpg', focus: [0.62, 0.28] },
  { id: 'girl', label: 'The Cover Girl', src: 'samples/girl.jpg', focus: [0.78, 0.32] },
  { id: 'car', label: 'The Supercar', src: 'samples/car.jpg', focus: [0.55, 0.6] },
  { id: 'gator', label: 'The Gator', src: 'samples/gator.jpg', focus: [0.58, 0.42] },
  { id: 'producer', label: 'The Producer', src: 'samples/producer.jpg', focus: [0.52, 0.3] },
  { id: 'bike', label: 'The Wheelie', src: 'samples/bike.jpg', focus: [0.42, 0.52] },
  { id: 'motel', label: 'The Motel', src: 'samples/motel.jpg', focus: [0.35, 0.35] },
];

// A cell is { p: photo id, c, r, cs, rs } on a cols x rows slanted lattice.
// Logo placement is per layout: { cx, cy, w } as fractions of the cover.
export const LAYOUTS = [
  {
    id: 'slanted-grid', name: 'Slanted Grid', cols: 4, rows: 3,
    slantX: 0.1, slantY: 0.03, logo: { cx: 0.5, cy: 0.46, w: 0.5 },
    cells: [
      { p: 'heli', c: 0, r: 0 }, { p: 'duo', c: 1, r: 0 },
      { p: 'boat', c: 2, r: 0 }, { p: 'robber', c: 3, r: 0 },
      { p: 'bike', c: 0, r: 1 }, { p: 'gator', c: 1, r: 1 },
      { p: 'motel', c: 2, r: 1 }, { p: 'producer', c: 3, r: 1, rs: 2 },
      { p: 'car', c: 0, r: 2, cs: 2 }, { p: 'girl', c: 2, r: 2 },
    ],
  },
  {
    id: 'slanted-duo', name: 'Slanted Duo', cols: 4, rows: 3,
    slantX: 0.09, slantY: 0.03, logo: { cx: 0.6, cy: 0.45, w: 0.44 },
    cells: [
      { p: 'duo', c: 0, r: 0, cs: 2, rs: 2 }, { p: 'heli', c: 2, r: 0 },
      { p: 'boat', c: 3, r: 0 }, { p: 'gator', c: 2, r: 1 },
      { p: 'girl', c: 3, r: 1 }, { p: 'car', c: 0, r: 2, cs: 2 },
      { p: 'robber', c: 2, r: 2 }, { p: 'producer', c: 3, r: 2 },
    ],
  },
  {
    id: 'slanted-quartet', name: 'Slanted Quartet', cols: 2, rows: 2,
    slantX: 0.08, slantY: 0.02, logo: { cx: 0.5, cy: 0.5, w: 0.46 },
    cells: [
      { p: 'duo', c: 0, r: 0 }, { p: 'heli', c: 1, r: 0 },
      { p: 'car', c: 0, r: 1 }, { p: 'girl', c: 1, r: 1 },
    ],
  },
  {
    id: 'slanted-trio', name: 'Slanted Trio', cols: 3, rows: 1,
    slantX: 0.09, slantY: 0.02, logo: { cx: 0.5, cy: 0.5, w: 0.4 },
    cells: [
      { p: 'duo', c: 0, r: 0 }, { p: 'car', c: 1, r: 0 }, { p: 'girl', c: 2, r: 0 },
    ],
  },
  {
    id: 'slanted-mosaic', name: 'Slanted Mosaic', cols: 4, rows: 3,
    slantX: 0.1, slantY: 0.03, logo: { cx: 0.5, cy: 0.55, w: 0.44 },
    cells: [
      { p: 'heli', c: 0, r: 0 }, { p: 'duo', c: 1, r: 0, cs: 2, rs: 2 },
      { p: 'boat', c: 3, r: 0 }, { p: 'robber', c: 0, r: 1 },
      { p: 'girl', c: 3, r: 1 }, { p: 'car', c: 0, r: 2, cs: 2 },
      { p: 'gator', c: 2, r: 2 }, { p: 'producer', c: 3, r: 2 },
    ],
  },
  {
    id: 'slanted-cinema', name: 'Slanted Cinema', cols: 4, rows: 3,
    slantX: 0.08, slantY: 0.02, logo: { cx: 0.5, cy: 0.62, w: 0.46 },
    cells: [
      { p: 'duo', c: 0, r: 0, cs: 4, rs: 2 }, { p: 'heli', c: 0, r: 2 },
      { p: 'car', c: 1, r: 2 }, { p: 'boat', c: 2, r: 2 }, { p: 'girl', c: 3, r: 2 },
    ],
  },
];

export const GRADES = [
  { id: 'sunset', name: 'Sunset Gold', filter: 'saturate(1.25) contrast(1.05) sepia(0.18) brightness(1.02)', wash: 'rgba(255,140,60,0.05)' },
  { id: 'neon', name: 'Neon Night', filter: 'saturate(1.4) hue-rotate(-18deg) contrast(1.08) brightness(0.97)', wash: 'rgba(150,60,255,0.06)' },
  { id: 'teal', name: 'Tropic Teal', filter: 'saturate(1.2) hue-rotate(12deg) contrast(1.05)', wash: 'rgba(0,180,180,0.05)' },
  { id: 'golden', name: 'Golden Hour', filter: 'saturate(1.35) sepia(0.28) contrast(1.04) brightness(1.03)', wash: 'rgba(255,180,40,0.06)' },
  { id: 'ultra', name: 'Ultraviolet', filter: 'saturate(1.3) hue-rotate(28deg) contrast(1.06) brightness(0.98)', wash: 'rgba(120,40,220,0.06)' },
  { id: 'retro', name: 'Retro Print', filter: 'saturate(0.75) contrast(1.12) sepia(0.12) brightness(1.01)', wash: 'rgba(255,220,170,0.04)' },
];

export const SIZES = [
  { id: 'wide', name: '16:9', w: 1920, h: 1080 },
  { id: 'portrait', name: '4:5', w: 1080, h: 1350 },
  { id: 'square', name: '1:1', w: 1080, h: 1080 },
];

// ---- geometry ------------------------------------------------------------

// Shear a point around the cover centre. shx leans vertical dividers
// (top of a divider sits left of its bottom); shy tilts horizontal ones.
function shear(x, y, W, H, shx, shy) {
  const cx = W / 2, cy = H / 2;
  return [x + shx * (y - cy), y + shy * (x - cx)];
}

// Panel polygons for a layout at W x H. Returns [{ photo, poly, bbox }].
// poly is 4 sheared corners (TL, TR, BR, BL); bbox is the axis-aligned box.
export function layoutPanels(layout, W, H) {
  const s = Math.min(W, H);
  const m = Math.round(0.014 * s); // black frame
  const g = Math.round(0.016 * s); // black diagonal gutter
  const iw = W - 2 * m, ih = H - 2 * m;
  const cw = (iw - (layout.cols - 1) * g) / layout.cols;
  const ch = (ih - (layout.rows - 1) * g) / layout.rows;
  const out = [];
  for (const cell of layout.cells) {
    const cs = cell.cs || 1, rs = cell.rs || 1;
    const x0 = m + cell.c * (cw + g);
    const y0 = m + cell.r * (ch + g);
    const x1 = x0 + cs * cw + (cs - 1) * g;
    const y1 = y0 + rs * ch + (rs - 1) * g;
    const raw = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const poly = raw.map(([x, y]) => shear(x, y, W, H, layout.slantX, layout.slantY));
    // Clip the sheared corners back into the frame interior.
    const cp = poly.map(([x, y]) => [
      Math.max(m, Math.min(W - m, x)),
      Math.max(m, Math.min(H - m, y)),
    ]);
    const xs = cp.map((p) => p[0]), ys = cp.map((p) => p[1]);
    const bbox = {
      x: Math.min(...xs), y: Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
    };
    out.push({ photo: cell.p, poly: cp, bbox });
  }
  return { panels: out, frame: m };
}

function tracePoly(ctx, poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
  ctx.closePath();
}

// Cover-fit a photo into a panel bbox, anchored on its focus point.
// focus is [fx, fy] in photo fractions; zoom and pan are per-panel tweaks.
function drawPhoto(ctx, img, bbox, focus, zoom, panX, panY, flip) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(bbox.w / iw, bbox.h / ih) * (zoom || 1);
  const dw = iw * scale, dh = ih * scale;
  const cx = bbox.x + bbox.w / 2 + (panX || 0);
  const cy = bbox.y + bbox.h / 2 + (panY || 0);
  let dx = cx - focus[0] * dw;
  let dy = cy - focus[1] * dh;
  // Clamp so the photo still covers the whole bbox (no empty edges).
  dx = Math.max(bbox.x + bbox.w - dw, Math.min(bbox.x, dx));
  dy = Math.max(bbox.y + bbox.h - dh, Math.min(bbox.y, dy));
  if (flip) {
    ctx.save();
    ctx.translate(bbox.x + bbox.w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(bbox.x + bbox.w / 2), 0);
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
}

// Split a title into at most two stacked lines.
export function splitTitle(title) {
  const words = String(title || 'VICE TIDE').trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [words[0] || 'VICE TIDE'];
  if (words.length === 2) return words;
  return [words[0], words.slice(1).join(' ')];
}

// Deterministic logo size: per-character fit, then a measureText safety clamp,
// then a height cap so short words (VICE, TIDE) cannot grow so tall that the
// logo crosses the faces in the top row. px is capped at 24% of cover height.
function fitFont(ctx, lines, targetW, family, maxPx) {
  const longest = Math.max(...lines.map((l) => l.length));
  let px = targetW / (longest * 0.78);
  if (maxPx && px > maxPx) px = maxPx;
  ctx.font = `900 ${px}px ${family}`;
  const measured = Math.max(...lines.map((l) => ctx.measureText(l).width));
  if (measured > targetW) px *= targetW / measured;
  return px;
}

function drawLogo(ctx, W, H, title, logoSpec) {
  const lines = splitTitle(title);
  const family = `"Arial Black", Arial, "Helvetica Neue", sans-serif`;
  const targetW = logoSpec.w * W;
  const px = fitFont(ctx, lines, targetW, family, Math.round(0.24 * H));
  const cx = logoSpec.cx * W, cy = logoSpec.cy * H;
  const lineH = px * 0.94;
  const totalH = lineH * lines.length;
  const topY = cy - totalH / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = Math.round(px * 0.06);
  ctx.shadowOffsetY = Math.round(px * 0.03);
  ctx.lineJoin = 'round';
  const grad = ctx.createLinearGradient(0, topY, 0, topY + totalH);
  grad.addColorStop(0, '#ff2e88');
  grad.addColorStop(0.5, '#b45cff');
  grad.addColorStop(1, '#ff8a00');
  lines.forEach((line, i) => {
    const y = topY + lineH * (i + 0.5);
    ctx.font = `900 ${px}px ${family}`;
    // Thin magenta edge, then a thick black outline, then the fill.
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = Math.max(2, px * 0.16);
    ctx.strokeText(line, cx, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, px * 0.11);
    ctx.strokeText(line, cx, y);
    ctx.fillStyle = i === 0 ? '#ffffff' : grad;
    ctx.fillText(line, cx, y);
  });
  ctx.restore();
}

// Optional poster furniture. All default OFF — the cover stays clean.
function drawFurniture(ctx, W, H, panels, furn) {
  if (!furn) return;
  const s = Math.min(W, H);
  ctx.save();
  ctx.textAlign = 'center';
  if (furn.roleTags) {
    const tags = ['THE DUO', 'THE HEIST', 'THE ESCAPE', 'THE WHEELIE'];
    panels.slice(0, 4).forEach((p, i) => {
      const cx = p.bbox.x + p.bbox.w / 2, cy = p.bbox.y + p.bbox.h - s * 0.035;
      ctx.font = `700 ${Math.round(s * 0.016)}px Arial, sans-serif`;
      const w = ctx.measureText(tags[i]).width + s * 0.02;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(cx - w / 2, cy - s * 0.016, w, s * 0.032);
      ctx.fillStyle = '#ffd34d';
      ctx.fillText(tags[i], cx, cy + s * 0.002);
    });
  }
  if (furn.reviewStrip) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(W * 0.08, H - s * 0.075, W * 0.84, s * 0.05);
    ctx.fillStyle = '#ffd34d';
    ctx.font = `700 ${Math.round(s * 0.02)}px Arial, sans-serif`;
    ctx.fillText('★★★★★  "THE DEFINITIVE VICE CITY" — VICE GAMING', W / 2, H - s * 0.05);
  }
  if (furn.billing) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `${Math.round(s * 0.011)}px Arial, sans-serif`;
    ctx.fillText('VICE TIDE STUDIOS  •  A LEONIDA STORY  •  IN THEATERS SOON', W / 2, H - s * 0.02);
  }
  if (furn.barcode) {
    const bx = W - s * 0.09, by = H - s * 0.075, bw = s * 0.07, bh = s * 0.045;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
    ctx.fillStyle = '#000000';
    let x = bx;
    let seed = 7;
    while (x < bx + bw) {
      seed = (seed * 16807) % 2147483647;
      const w = 1 + (seed % 4);
      if (seed % 3) ctx.fillRect(x, by, w, bh);
      x += w + 1 + (seed % 3);
    }
  }
  if (furn.comingSoon) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(s * 0.028)}px Arial, sans-serif`;
    ctx.fillText('COMING SOON', W / 2, s * 0.05);
  }
  if (furn.goldSeal) {
    const cx = W - s * 0.075, cy = s * 0.09, r = s * 0.038;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#d4a017'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff2b0'; ctx.stroke();
    ctx.fillStyle = '#3a2500';
    ctx.font = `900 ${Math.round(s * 0.011)}px Arial, sans-serif`;
    ctx.fillText('BEST', cx, cy - s * 0.006);
    ctx.fillText('CAST', cx, cy + s * 0.009);
  }
  if (furn.editionTag) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(s * 0.02, s * 0.02, s * 0.075, s * 0.03);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(s * 0.013)}px Arial, sans-serif`;
    ctx.fillText('VOL. 1', s * 0.057, s * 0.041);
  }
  ctx.restore();
}

// Deterministic grain (seeded, so exports are reproducible).
function drawGrain(ctx, W, H, amount, seedBase) {
  if (!amount) return;
  let seed = seedBase || 1234567;
  const next = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  ctx.save();
  const n = Math.round(amount * 900);
  for (let i = 0; i < n; i++) {
    const x = next() * W, y = next() * H;
    ctx.fillStyle = next() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.restore();
}

// The main render. state: { layout, grade, title, photos, perPanel, gradeStrength,
// grain, glow, halftone, furniture, selectedIndex }. images: Map id -> HTMLImageElement.
// options: { showSelection } — the editor outline; exports render without it.
export function renderCover(ctx, W, H, state, images, options) {
  const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
  const grade = GRADES.find((g) => g.id === state.grade) || GRADES[0];
  const { panels, frame } = layoutPanels(layout, W, H);

  // Black field: the frame and the diagonal gutters.
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  const strength = state.gradeStrength == null ? 80 : state.gradeStrength;
  panels.forEach((panel, i) => {
    const cast = DEMO_CAST.find((c) => c.id === panel.photo) || DEMO_CAST[0];
    const img = images.get(panel.photo);
    const tweak = (state.perPanel && state.perPanel[i]) || {};
    if (!img) return;
    ctx.save();
    // Clip to the frame interior, then to the sheared trapezoid.
    ctx.beginPath();
    ctx.rect(frame, frame, W - 2 * frame, H - 2 * frame);
    ctx.clip();
    tracePoly(ctx, panel.poly);
    ctx.clip();
    ctx.filter = grade.filter;
    // Grade strength: blend the filtered draw with the raw one is complex;
    // instead scale saturation via a wash whose alpha follows the slider.
    drawPhoto(ctx, img, panel.bbox, cast.focus, tweak.zoom || 1, tweak.panX || 0, tweak.panY || 0, !!tweak.flip);
    ctx.filter = 'none';
    if (grade.wash) {
      ctx.globalAlpha = 0.4 + (strength / 100) * 0.6;
      ctx.fillStyle = grade.wash;
      ctx.fillRect(panel.bbox.x, panel.bbox.y, panel.bbox.w, panel.bbox.h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Editor selection outline (preview only, never in exports).
    if (options && options.showSelection && state.selectedIndex === i) {
      ctx.save();
      tracePoly(ctx, panel.poly);
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffd34d';
      ctx.stroke();
      ctx.restore();
    }
  });

  // One huge central logo, no other text on the cover.
  drawLogo(ctx, W, H, state.title || 'VICE TIDE', layout.logo);

  // Optional furniture (all toggles default off).
  drawFurniture(ctx, W, H, panels, state.furniture);

  // Glow: a soft warm radial highlight from the top.
  if (state.glow) {
    const g = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, H) * 0.7);
    g.addColorStop(0, `rgba(255,170,90,${0.05 + (state.glow / 100) * 0.09})`);
    g.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Halftone dots (optional, subtle).
  if (state.halftone) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    const step = Math.max(6, Math.round(Math.min(W, H) / 160));
    for (let y = step / 2; y < H; y += step) {
      for (let x = step / 2; x < W; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawGrain(ctx, W, H, (state.grain || 0) / 100, 987654321);
}

// Point-in-polygon hit test, for clicking a panel in the editor.
export function panelAt(panels, x, y) {
  for (let i = panels.length - 1; i >= 0; i--) {
    const poly = panels[i].poly;
    let inside = false;
    for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
      const [xa, ya] = poly[a], [xb, yb] = poly[b];
      if ((ya > y) !== (yb > y) && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) inside = !inside;
    }
    if (inside) return i;
  }
  return -1;
}
