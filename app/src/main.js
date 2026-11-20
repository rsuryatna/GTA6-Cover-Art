// Wires the cover maker: photo uploads, panel pick / drag / zoom, caption,
// colour grades, and PNG export in the three post sizes. A `?shot=` query
// sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, renderCoverToSize, coverLayout, GRADES } from './cover.js';
import { removeBackground } from './cutout.js';
import { runShot } from './shots.js';

export const EXPORT_SIZES = [
  { label: '1080 x 1080', w: 1080, h: 1080, file: 'cover-1080x1080.png' },
  { label: '1080 x 1350', w: 1080, h: 1350, file: 'cover-1080x1350.png' },
  { label: '1920 x 1080', w: 1920, h: 1080, file: 'cover-1920x1080.png' },
];

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const statusEl = document.getElementById('status');
const panelLabel = document.getElementById('panelLabel');

/** The whole cover state; panels[3] is the hero panel. */
export const state = {
  caption: 'Sunset Heist',
  grade: 'sunset',
  heroCutout: null,
  panels: Array.from({ length: 7 }, () => ({ img: null, ox: 0, oy: 0, zoom: 1 })),
};
let selectedPanel = 3;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function redraw() {
  drawCover(canvas, state);
  panelLabel.textContent = selectedPanel === 3
    ? 'Hero panel (the pop-out)'
    : `Panel ${selectedPanel + 1} of 7`;
}

/** Sets the hero portrait and cuts its background out on device. The hero
 * panel's backdrop stays a landscape photo (the street scene by default):
 * a tall portrait stretched across the wide hero panel reads as a giant
 * close-up behind the cutout, so it is never used there. */
export async function setHeroPhoto(img) {
  state.heroCutout = null;
  redraw();
  statusEl.textContent = 'Cutting the hero out of its background…';
  const cutout = removeBackground(img, 52);
  state.heroCutout = cutout;
  statusEl.textContent = 'Hero cut out — it pops out of its panel.';
  redraw();
}

/** Fills every empty panel with `img`, and the hero panel's backdrop too. */
export function fillPanels(img) {
  for (let i = 0; i < 7; i++) {
    if (!state.panels[i].img) {
      state.panels[i].img = img;
      state.panels[i].ox = 0;
      state.panels[i].oy = 0;
      state.panels[i].zoom = 1;
    }
  }
  redraw();
}

/** The default scene: every panel gets `img`, each cropped to a different
 * part of it so the grid reads as seven views, not one photo repeated. The
 * hero panel (index 3) keeps the landscape scene as its backdrop; the
 * cutout person pops out over it. */
const DEFAULT_CROPS = [
  { ox: -0.14, oy: -0.04, zoom: 1.35 },
  { ox: 0, oy: -0.04, zoom: 1.35 },
  { ox: 0.14, oy: -0.04, zoom: 1.35 },
  { ox: 0, oy: 0, zoom: 1.15 },
  { ox: -0.12, oy: 0.06, zoom: 1.35 },
  { ox: 0, oy: 0.08, zoom: 1.5 },
  { ox: 0.12, oy: 0.06, zoom: 1.35 },
];
export function setDefaultScene(img) {
  for (let i = 0; i < 7; i++) {
    state.panels[i].img = img;
    state.panels[i].ox = DEFAULT_CROPS[i].ox;
    state.panels[i].oy = DEFAULT_CROPS[i].oy;
    state.panels[i].zoom = DEFAULT_CROPS[i].zoom;
  }
  redraw();
}

/** Exports the cover at one size, as a PNG download. */
export function exportSize(size) {
  const out = renderCoverToSize(state, size.w, size.h);
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = size.file;
    a.click();
    statusEl.textContent = `Saved ${size.file}`;
  }, 'image/png');
}

export function exportAll() {
  EXPORT_SIZES.forEach((size, i) => {
    setTimeout(() => exportSize(size), i * 350);
  });
  statusEl.textContent = 'Exporting all three sizes…';
}

// --- Panel picking, dragging and zooming on the preview -------------------
function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  const { panels } = coverLayout(canvas.width, canvas.height);
  for (let i = 0; i < 7; i++) {
    const r = panels[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  selectedPanel = i;
  const rect = canvas.getBoundingClientRect();
  dragging = { x: e.clientX, y: e.clientY, scale: canvas.width / rect.width };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = state.panels[selectedPanel];
  const { panels } = coverLayout(canvas.width, canvas.height);
  const r = panels[selectedPanel];
  // Pan is stored as a fraction of the panel, so the crop scales to any export size.
  p.ox += ((e.clientX - dragging.x) * dragging.scale) / r.w;
  p.oy += ((e.clientY - dragging.y) * dragging.scale) / r.h;
  dragging.x = e.clientX;
  dragging.y = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const p = state.panels[selectedPanel];
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
  p.zoom = Math.min(4, Math.max(1, p.zoom * factor));
  redraw();
}, { passive: false });

// --- Controls -------------------------------------------------------------
document.getElementById('heroPhoto').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = await loadImage(URL.createObjectURL(file));
  await setHeroPhoto(img);
});
document.getElementById('panelPhoto').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = await loadImage(URL.createObjectURL(file));
  const p = state.panels[selectedPanel];
  p.img = img;
  p.ox = 0;
  p.oy = 0;
  p.zoom = 1;
  statusEl.textContent = `Photo placed in ${selectedPanel === 3 ? 'the hero panel' : `panel ${selectedPanel + 1}`}.`;
  redraw();
});
document.getElementById('fillAll').addEventListener('click', async () => {
  const file = document.getElementById('panelPhoto').files[0];
  if (file) {
    fillPanels(await loadImage(URL.createObjectURL(file)));
    statusEl.textContent = 'Every empty panel filled with that photo.';
  } else {
    statusEl.textContent = 'Pick a panel photo first, then Fill all panels.';
  }
});
captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  redraw();
});
for (const button of document.querySelectorAll('[data-grade]')) {
  button.addEventListener('click', () => {
    state.grade = button.dataset.grade;
    for (const b of document.querySelectorAll('[data-grade]')) {
      b.classList.toggle('active', b === button);
    }
    statusEl.textContent = `Colour grade: ${GRADES[state.grade].name}.`;
    redraw();
  });
}
for (const button of document.querySelectorAll('[data-export]')) {
  button.addEventListener('click', () => exportSize(EXPORT_SIZES[Number(button.dataset.export)]));
}
document.getElementById('exportAll').addEventListener('click', exportAll);

// --- Startup: the two sample photos, hero cut out -------------------------
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    loadImage,
    setHeroPhoto,
    fillPanels,
    setDefaultScene,
    setCaption: (text) => {
      state.caption = text;
      captionInput.value = text;
    },
    setGrade: (grade) => { state.grade = grade; },
    redraw,
  });
} else {
  (async () => {
    const hero = await loadImage('samples/hero.jpg');
    const street = await loadImage('samples/street.jpg');
    setDefaultScene(street);
    await setHeroPhoto(hero);
  })();
}
