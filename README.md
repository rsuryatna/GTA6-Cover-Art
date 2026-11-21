# VICE TIDE Cover Studio — Slanted Grid GTA-style cover art maker

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/rsuryatna/GTA6-Cover-Art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/rsuryatna/GTA6-Cover-Art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your photos and a caption into GTA 6-style
cover art — built for the [gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Slanted Grid** — the defining layout: thick black gutters run diagonally,
  so the panels are trapezoids that interlock like a comic-book cover, not
  plain boxes with pasted photos. Nine large vignettes, one subject per panel,
  with a wide car panel anchoring the bottom-left and a tall hero panel
  anchoring the bottom-right.
- **One huge central logo** — your title (default "VICE TIDE") renders as a
  bold stacked logo with a pink-purple-orange gradient, overlapping the grid
  and breaking it. No other text on the cover: simple and elegant.
- **6 layouts, 6 grades** — Slanted Grid, Slanted Duo, Slanted Quartet,
  Slanted Trio, Slanted Mosaic, Slanted Cinema; Sunset Gold, Neon Night,
  Tropic Teal, Golden Hour, Ultraviolet, Retro Print. Grade strength, film
  grain, glow, and halftone sliders.
- **3-step wizard** — add photos, caption, export. Click a panel to select
  it, drag to pan, wheel to zoom, flip / swap / reset per panel. Undo/redo,
  Surprise me, Auto-fill.
- **Upload your own photos** — file picker, drag-drop, or paste. Everything
  runs offline in the browser; photos never leave the device.
- **PNG export** — 1080×1080, 1080×1350, and 1920×1080.
- **10-photo demo cast** — photorealistic Vice City cast (duo, helicopter,
  speedboat, robber, cover girl, supercar, alligator, producer, wheelie,
  motel), generated fresh for this entry.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Entry

`main.ts` copies `app/` and `screenshots/` to `/output` and writes
`/output/dossier.json` (via the vendored make.fun library).

## License

MIT — see [LICENSE](LICENSE).
