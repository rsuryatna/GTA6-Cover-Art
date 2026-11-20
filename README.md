# Vice Cover Studio — GTA 6 Cover Art Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/rsuryatna/GTA6-Cover-Art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/rsuryatna/GTA6-Cover-Art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline web app that turns a person's photo and a caption into GTA 6-style cover art: a 7-panel comic grid with a pop-out hero (the person's photo cut out on device, breaking out of its panel), a Vice City sunset or neon colour grade, striped retro frame accents, and bold editable caption lettering. Exports PNG in 1080×1080, 1080×1350 and 1920×1080. Photos never leave the machine — everything runs locally in a desktop browser, no network.

Made for the make.fun bounty [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01). All artwork is original (no Rockstar logo, artwork or fonts); the two sample photos were made with an image model.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Upload a hero photo (the pop-out person) and panel photos, click a panel to select it, drag to position its photo, scroll to zoom, type a caption, pick a colour grade, and export any (or all) of the three post sizes.

## How it works

- `app/src/cover.js` draws the cover: 7-panel grid, pop-out hero, grade wash, striped frame, caption.
- `app/src/cutout.js` removes the hero photo's background on device (flood-fill from the border), so the person pops out of the panel.
- `app/src/main.js` wires the editor: uploads, panel pick/drag/zoom, caption, grades, PNG export.
- `main.ts` hands the app in: it copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
