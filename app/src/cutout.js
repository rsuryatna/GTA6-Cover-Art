// Removes a near-uniform background from a portrait photo, on device, in the
// browser: no server, no network. It flood-fills from the image border, so
// only background connected to the edge is removed (a coral jacket stays
// coral). Returns a canvas with the person on transparency, ready to pop out
// of a panel. Works best on a portrait shot against a plain backdrop.

/** Colour distance in RGB space, 0 (same) to ~441 (opposite). */
export function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Cut the background out of `img` and return a canvas with transparency.
 * `threshold` is how far a pixel may stray from the border colour and still
 * count as background (default 48, in RGB distance units).
 */
export function removeBackground(img, threshold = 48) {
  const workW = 360;
  const scale = workW / img.naturalWidth;
  const workH = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = workW;
  canvas.height = workH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, workW, workH);
  const image = ctx.getImageData(0, 0, workW, workH);
  const data = image.data;

  // Background colour: the average of the four corners.
  const corners = [
    [0, 0],
    [workW - 1, 0],
    [0, workH - 1],
    [workW - 1, workH - 1],
  ];
  let br = 0;
  let bg = 0;
  let bb = 0;
  for (const [x, y] of corners) {
    const i = (y * workW + x) * 4;
    br += data[i];
    bg += data[i + 1];
    bb += data[i + 2];
  }
  br /= corners.length;
  bg /= corners.length;
  bb /= corners.length;

  // Flood-fill from every border pixel that looks like background.
  const w = workW;
  const h = workH;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const isBg = (x, y) => {
    const i = (y * w + x) * 4;
    return colorDistance(data[i], data[i + 1], data[i + 2], br, bg, bb) < threshold;
  };
  for (let x = 0; x < w; x++) {
    if (isBg(x, 0)) stack.push([x, 0]);
    if (isBg(x, h - 1)) stack.push([x, h - 1]);
  }
  for (let y = 0; y < h; y++) {
    if (isBg(0, y)) stack.push([0, y]);
    if (isBg(w - 1, y)) stack.push([w - 1, y]);
  }
  while (stack.length) {
    const [x, y] = stack.pop();
    const idx = y * w + x;
    if (seen[idx]) continue;
    seen[idx] = 1;
    if (!isBg(x, y)) continue;
    const i = idx * 4;
    data[i + 3] = 0;
    if (x > 0) stack.push([x - 1, y]);
    if (x < w - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < h - 1) stack.push([x, y + 1]);
  }

  // Feather the alpha edge by one pixel so the cutout has no hard stair-step.
  const alpha = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) alpha[i] = data[i * 4 + 3];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (alpha[i] === 0 || alpha[i] === 255) continue;
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          sum += alpha[ny * w + nx];
          n++;
        }
      }
      data[i * 4 + 3] = Math.round(sum / n);
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}
