// main.js — Slanted Grid editor: 3-step wizard, undo/redo, drag/pan/zoom,
// upload (file / drag-drop / paste), surprise me, auto-fill (fresh code).
import { DEMO_CAST, LAYOUTS, GRADES, SIZES, layoutPanels, renderCover, panelAt, splitTitle } from './cover.js';
import { downloadCover, coverJpeg, thumbUrl } from './shots.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ---- state ----------------------------------------------------------------
function defaultState() {
  return {
    layout: 'slanted-grid',
    grade: 'sunset',
    title: 'VICE TIDE',
    gradeStrength: 80,
    grain: 18,
    glow: 22,
    halftone: false,
    furniture: { roleTags: false, reviewStrip: false, billing: false, barcode: false, comingSoon: false, goldSeal: false, editionTag: false },
    perPanel: {},
    selectedIndex: 0,
    step: 1,
    size: 'wide',
    photos: DEMO_CAST.map((c) => ({ ...c, kind: 'demo' })),
  };
}

let state = defaultState();
let undoStack = [];
let redoStack = [];
const images = new Map(); // photo id -> HTMLImageElement
let imagesReady = false;

function snapshot() { return JSON.stringify(state); }
function pushUndo() {
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}
function restore(json) {
  state = JSON.parse(json);
  syncUI();
  render();
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
  updateUndoButtons();
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
  updateUndoButtons();
}
function updateUndoButtons() {
  $('#undoBtn').disabled = !undoStack.length;
  $('#redoBtn').disabled = !redoStack.length;
}

// ---- images ---------------------------------------------------------------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadDemoCast() {
  for (const photo of state.photos) {
    if (images.has(photo.id)) continue;
    try { images.set(photo.id, await loadImage(photo.src)); } catch (e) { /* missing file: skip */ }
  }
  imagesReady = true;
  render();
}

function addUpload(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    const id = 'up' + Date.now() + Math.floor(Math.random() * 1000);
    const photo = { id, label: file.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'Uploaded', src: reader.result, focus: [0.5, 0.4], kind: 'upload' };
    pushUndo();
    state.photos.push(photo);
    loadImage(photo.src).then((img) => { images.set(id, img); render(); });
    renderWells();
  };
  reader.readAsDataURL(file);
}

// ---- render ---------------------------------------------------------------
const canvas = $('#coverCanvas');
const ctx = canvas.getContext('2d');

function currentSize() {
  return SIZES.find((s) => s.id === state.size) || SIZES[0];
}

function render() {
  if (!imagesReady) return;
  const size = currentSize();
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(ctx, size.w, size.h, state, images, { showSelection: true });
  updatePanelBar();
}

function currentPanels() {
  const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
  const size = currentSize();
  return layoutPanels(layout, size.w, size.h).panels;
}

// ---- UI sync --------------------------------------------------------------
function syncUI() {
  $$('[data-layout]').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  $$('[data-grade]').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
  $$('[data-size]').forEach((b) => b.classList.toggle('active', b.dataset.size === state.size));
  $('#titleInput').value = state.title;
  $('#gradeStrength').value = state.gradeStrength;
  $('#grainRange').value = state.grain;
  $('#glowRange').value = state.glow;
  $('#halftoneCheck').checked = !!state.halftone;
  Object.keys(state.furniture).forEach((k) => {
    const el = document.querySelector(`[data-furn="${k}"]`);
    if (el) el.checked = !!state.furniture[k];
  });
  $$('.step').forEach((el) => el.classList.toggle('active', Number(el.dataset.step) === state.step));
  $$('.stepPane').forEach((el) => el.classList.toggle('active', Number(el.dataset.step) === state.step));
  renderWells();
}

function renderWells() {
  const wrap = $('#photoWells');
  wrap.innerHTML = '';
  state.photos.forEach((photo) => {
    const d = document.createElement('button');
    d.className = 'well';
    d.title = photo.label;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.label;
    const span = document.createElement('span');
    span.textContent = photo.label;
    d.appendChild(img);
    d.appendChild(span);
    d.addEventListener('click', () => {
      const panels = currentPanels();
      const i = state.selectedIndex;
      if (i < 0 || i >= panels.length) return;
      pushUndo();
      const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
      layout.cells[i].p = photo.id;
      render();
    });
    wrap.appendChild(d);
  });
  const count = $('#photoCount');
  if (count) count.textContent = `${state.photos.length} photo${state.photos.length === 1 ? '' : 's'} loaded`;
}

function updatePanelBar() {
  const panels = currentPanels();
  const bar = $('#panelBar');
  const i = state.selectedIndex;
  if (i < 0 || i >= panels.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
  const cell = layout.cells[i];
  const cast = DEMO_CAST.find((c) => c.id === cell.p) || state.photos.find((p) => p.id === cell.p);
  $('#panelLabel').textContent = `Panel ${i + 1} — ${cast ? cast.label : cell.p}`;
  const sel = $('#panelPhoto');
  sel.innerHTML = '';
  state.photos.forEach((photo) => {
    const o = document.createElement('option');
    o.value = photo.id;
    o.textContent = photo.label;
    if (photo.id === cell.p) o.selected = true;
    sel.appendChild(o);
  });
  const tweak = state.perPanel[i] || {};
  $('#zoomRange').value = Math.round((tweak.zoom || 1) * 100);
  $('#flipBtn').classList.toggle('active', !!tweak.flip);
}

// ---- canvas interaction ---------------------------------------------------
function canvasPos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height),
  };
}

let drag = null;
canvas.addEventListener('pointerdown', (evt) => {
  const p = canvasPos(evt);
  const panels = currentPanels();
  const i = panelAt(panels, p.x, p.y);
  if (i < 0) return;
  state.selectedIndex = i;
  drag = { i, startX: p.x, startY: p.y, moved: false };
  canvas.setPointerCapture(evt.pointerId);
  render();
});
canvas.addEventListener('pointermove', (evt) => {
  if (!drag) return;
  const p = canvasPos(evt);
  const dx = p.x - drag.startX, dy = p.y - drag.startY;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  if (!drag.moved) return;
  const tweak = state.perPanel[drag.i] || (state.perPanel[drag.i] = {});
  // Pan is stored in cover pixels; scale the drag by the panel size.
  const size = currentSize();
  tweak.panX = (tweak.panX || 0) + dx;
  tweak.panY = (tweak.panY || 0) + dy;
  drag.startX = p.x; drag.startY = p.y;
  render();
});
canvas.addEventListener('pointerup', () => {
  if (drag && drag.moved) pushUndo();
  drag = null;
});
canvas.addEventListener('wheel', (evt) => {
  evt.preventDefault();
  const i = state.selectedIndex;
  const panels = currentPanels();
  if (i < 0 || i >= panels.length) return;
  pushUndo();
  const tweak = state.perPanel[i] || (state.perPanel[i] = {});
  const z = tweak.zoom || 1;
  tweak.zoom = Math.max(0.6, Math.min(2.5, z * (evt.deltaY < 0 ? 1.08 : 0.93)));
  render();
}, { passive: false });

// ---- controls -------------------------------------------------------------
function bindChips(rowId, key, values) {
  const row = $(rowId);
  row.innerHTML = '';
  values.forEach((v) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = v.name;
    b.dataset[key] = v.id;
    b.addEventListener('click', () => {
      pushUndo();
      state[key] = v.id;
      syncUI();
      render();
    });
    row.appendChild(b);
  });
}

function init() {
  bindChips('#layoutRow', 'layout', LAYOUTS);
  bindChips('#layoutRow2', 'layout', LAYOUTS);
  bindChips('#gradeRow', 'grade', GRADES);
  bindChips('#gradeRow2', 'grade', GRADES);
  bindChips('#sizeRow', 'size', SIZES);

  $('#titleInput').addEventListener('input', (e) => {
    state.title = e.target.value.toUpperCase().slice(0, 24) || 'VICE TIDE';
    render();
  });
  $('#titleInput').addEventListener('change', () => pushUndo());

  $('#gradeStrength').addEventListener('input', (e) => { state.gradeStrength = Number(e.target.value); render(); });
  $('#gradeStrength').addEventListener('change', () => pushUndo());
  $('#grainRange').addEventListener('input', (e) => { state.grain = Number(e.target.value); render(); });
  $('#grainRange').addEventListener('change', () => pushUndo());
  $('#glowRange').addEventListener('input', (e) => { state.glow = Number(e.target.value); render(); });
  $('#glowRange').addEventListener('change', () => pushUndo());
  $('#halftoneCheck').addEventListener('change', (e) => { pushUndo(); state.halftone = e.target.checked; render(); });

  $$('[data-furn]').forEach((el) => {
    el.addEventListener('change', () => {
      pushUndo();
      state.furniture[el.dataset.furn] = el.checked;
      render();
    });
  });

  $('#undoBtn').addEventListener('click', undo);
  $('#redoBtn').addEventListener('click', redo);

  $('#surpriseBtn').addEventListener('click', () => {
    pushUndo();
    const titles = ['VICE TIDE', 'NEON AVENUE', 'AFTERGLOW', 'PALM HEIST', 'SUNSET STRIP', 'OCEAN DRIVE'];
    state.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)].id;
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    state.title = titles[Math.floor(Math.random() * titles.length)];
    // Shuffle the demo photos across the panels.
    const layout = LAYOUTS.find((l) => l.id === state.layout);
    const shuffled = [...DEMO_CAST].sort(() => Math.random() - 0.5);
    layout.cells.forEach((cell, i) => { cell.p = shuffled[i % shuffled.length].id; });
    syncUI();
    render();
  });

  $('#autofillBtn').addEventListener('click', () => {
    pushUndo();
    const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
    layout.cells.forEach((cell, i) => { cell.p = DEMO_CAST[i % DEMO_CAST.length].id; });
    render();
  });

  $('#demoBtn').addEventListener('click', () => {
    pushUndo();
    state.photos = DEMO_CAST.map((c) => ({ ...c, kind: 'demo' }));
    loadDemoCast().then(() => { syncUI(); render(); });
  });

  $('#panelPhoto').addEventListener('change', (e) => {
    pushUndo();
    const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
    layout.cells[state.selectedIndex].p = e.target.value;
    render();
  });
  $('#flipBtn').addEventListener('click', () => {
    pushUndo();
    const t = state.perPanel[state.selectedIndex] || (state.perPanel[state.selectedIndex] = {});
    t.flip = !t.flip;
    render();
  });
  $('#zoomRange').addEventListener('input', (e) => {
    const t = state.perPanel[state.selectedIndex] || (state.perPanel[state.selectedIndex] = {});
    t.zoom = Number(e.target.value) / 100;
    render();
  });
  $('#zoomRange').addEventListener('change', () => pushUndo());
  $('#swapBtn').addEventListener('click', () => {
    const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
    const n = layout.cells.length;
    const j = (state.selectedIndex + 1) % n;
    pushUndo();
    const a = layout.cells[state.selectedIndex].p;
    layout.cells[state.selectedIndex].p = layout.cells[j].p;
    layout.cells[j].p = a;
    state.selectedIndex = j;
    render();
  });
  $('#resetPanelBtn').addEventListener('click', () => {
    pushUndo();
    delete state.perPanel[state.selectedIndex];
    render();
  });

  $$('.step').forEach((el) => {
    el.addEventListener('click', () => {
      state.step = Number(el.dataset.step);
      syncUI();
      if (state.step === 3) renderThumbs();
    });
  });

  // Upload: file input, drag-drop anywhere, paste.
  const fileInput = $('#fileInput');
  $('#chooseBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    Array.from(fileInput.files).forEach(addUpload);
    fileInput.value = '';
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files || []).forEach(addUpload);
  });
  window.addEventListener('paste', (e) => {
    Array.from(e.clipboardData.files || []).forEach(addUpload);
  });

  // Export buttons.
  $$('[data-export]').forEach((b) => {
    b.addEventListener('click', () => downloadCover(state, images, b.dataset.export));
  });

  // Clean-render hook for cover screenshots (no selection outline).
  window.ViceTide = {
    coverJpeg: (sizeId, quality) => coverJpeg(state, images, sizeId, quality),
    state: () => state,
    setState: (patch) => { pushUndo(); Object.assign(state, patch); syncUI(); render(); },
  };

  // URL params (used by the screenshot harness): ?shot=cover&layout=..&grade=..&title=..
  const params = new URLSearchParams(location.search);
  if (params.get('layout')) state.layout = params.get('layout');
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('title')) state.title = params.get('title').toUpperCase();
  if (params.get('size')) state.size = params.get('size');

  syncUI();
  updateUndoButtons();
  loadDemoCast();
}

function renderThumbs() {
  const wrap = $('#thumbRow');
  wrap.innerHTML = '';
  SIZES.forEach((s) => {
    const d = document.createElement('div');
    d.className = 'thumb';
    const img = document.createElement('img');
    img.src = thumbUrl(state, images, s.id, 260);
    img.alt = s.name;
    const span = document.createElement('span');
    span.textContent = `${s.name} · ${s.w}×${s.h}`;
    d.appendChild(img);
    d.appendChild(span);
    wrap.appendChild(d);
  });
}

init();
