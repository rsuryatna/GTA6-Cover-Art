// shots.js — PNG export and thumbnails (fresh code).
import { renderCover, SIZES } from './cover.js';

// Render the cover at an export size onto a fresh canvas (no selection outline).
export function renderToCanvas(state, images, sizeId) {
  const size = SIZES.find((s) => s.id === sizeId) || SIZES[0];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  renderCover(ctx, size.w, size.h, state, images, { showSelection: false });
  return canvas;
}

export function downloadCover(state, images, sizeId) {
  const size = SIZES.find((s) => s.id === sizeId) || SIZES[0];
  const canvas = renderToCanvas(state, images, sizeId);
  const name = `${slug(state.title)}-${size.id}-${size.w}x${size.h}.png`;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, 'image/png');
}

function slug(title) {
  return String(title || 'vice-tide').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'vice-tide';
}

// A small JPEG data URL of the clean cover (no editor outline), for screenshots.
export function coverJpeg(state, images, sizeId, quality) {
  const canvas = renderToCanvas(state, images, sizeId);
  return canvas.toDataURL('image/jpeg', quality == null ? 0.82 : quality);
}

// Small thumbnails for the export step.
export function thumbUrl(state, images, sizeId, w) {
  const canvas = renderToCanvas(state, images, sizeId);
  const t = document.createElement('canvas');
  const scale = w / canvas.width;
  t.width = w;
  t.height = Math.round(canvas.height * scale);
  t.getContext('2d').drawImage(canvas, 0, 0, t.width, t.height);
  return t.toDataURL('image/jpeg', 0.8);
}
