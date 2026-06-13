# The Warriors — Cat Creator Game Spec

A web game where players build their own warrior cat from hand-drawn parts, then see it
in scenes from the forest. All artwork is hand-drawn by the designer (the kid in charge!)
in Procreate. **The art style is the law: keep everything looking hand-drawn.**

## Design rules (from the artist's own notes — do not change without asking her)

- **Eye colors:** player picks **1 or 2** (two = different color per eye).
- **Pattern colors:** player picks **1 or more**.
- **Fur colors:** 9 choices (see `manifest.json → palettes.fur`).
- **Body width:** tap the green **+** to add width, tap the red **−** to take away width.
- **"None" is always an option** for patterns/parts — use her red/orange no-symbols
  (`assets/ui/none_*.png`) as the button icons.
- **Roles:** kittypet, leader, deputy, medicine cat, rogue, loner, kit, elder,
  apprentice, warrior, mentor.

## How the cat is assembled

All parts share one canvas coordinate system (1366×1024, scaled-down from her
2732×2048 Procreate canvases) — parts were drawn in place, so they layer directly
on top of each other without repositioning (except tails, which have per-part
`offset` values in the manifest).

Layer order (bottom → top):

1. Background scene (`assets/backgrounds/`)
2. Tail (line art, behind body, offset from manifest)
3. Body fill — a vector "sitting cat" silhouette drawn in code, filled with the
   chosen fur color. **The silhouette sides trace the chosen cheek's actual
   hand-drawn line** (`manifest.json → bodyShape`, one left/right point list per
   cheek style) so the fur fills exactly up to the line and every part reads as
   one connected outline. The head crown is stretched to reach the ears (so an
   ear never floats), and both sides flare to a seated base. Everything — parts
   and fill — scales together horizontally per the +/− width control, so the
   lines stay touching at any size. The `bodyShape` numbers were measured from
   the PNGs with `tools/measure_cheeks.js`; re-run it (needs `npm i canvas`) and
   eyeball the result with `tools/render_test.js` after adding/redrawing cheeks.
4. Pattern layer — chosen pattern PNG, tinted with the chosen pattern color(s),
   clipped to the body silhouette (`source-in` compositing).
5. Eye color — soft ellipses under the eye line art; positions per eye style in
   `manifest.json → eyeAnchors`. Two colors = left/right heterochromia.
6. Line art parts on top: ears, eyes, cheek fur.
7. Name banner — black rounded bar (like her `reference/banner_rusty_firestar.jpg`)
   with the cat's name + role in white handwriting-style text.

## Assets

- `assets/parts/` — transparent PNG line art: 4 ear styles, 2 eye styles,
  7 cheek-fur styles, 4 tails, 3 patterns (stripes / spots / speckles).
- `assets/backgrounds/` — 3 scenes: grassy hill with mouse, camp with dens, pond.
- `assets/characters/` — her finished cats: Rusty/Firestar (incl. a **blink frame**
  `firestar_blink.png`), Bluestar, **Tigerstar** (the scarred brown tabby, with a
  talking frame `tabby_scarred_alt.png`), **Lionheart** (the yellow cat, with a
  talking frame `cat_yellow_alt.png`), and Needletail & Violetshine (incl. a
  **talking frame** `..._talk.png`). Tigerstar & Lionheart are the Clan cats you
  can **talk to** after building (see `manifest.json → clan`).
- `assets/ui/` — red and orange "none" symbols.
- `assets/reference/` — her original menu sheets and notes (the design source of truth).
- `manifest.json` — every part, palette hex code, role, and anchor the game uses.
  **Add new art by re-exporting from Procreate as transparent PNG and adding one
  manifest entry.**

## v1 (implemented in index.html)

Title screen (gallery of her finished cats) → builder screen:
canvas preview + part tabs (Ears, Eyes, Cheek fur, Tail, Pattern) + color swatches
(fur / eyes ×2 / pattern) + width +/− + name input + role picker + scene picker +
Random button + Save (downloads PNG) + **Meet the Clan** (talk to Lionheart &
Tigerstar; their portraits animate base↔alt frame while they speak, and their
lines use your cat's name and role). Touch-first, iPad-friendly, no external libraries.

## Roadmap ideas (build next, in rough order)

1. **Blink + talk animation** — swap `firestar`/`firestar_blink` and the
   Needletail/Violetshine talk frame on a timer; do the same for created cats by
   animating the eye layer.
2. **Save/load den** — store created cats in localStorage; gallery of saved warriors.
3. **Prey chase mini-game** — the hill_mouse background already has a mouse; tap it
   before it escapes, your cat pounces.
4. **Clan life** — assign roles, mentor/apprentice pairs (she listed both roles!),
   simple story scenes using her camp background.
5. **More art slots** — the manifest accepts new ears/eyes/tails/patterns/scenes
   as she draws them.

## Deployment

Static site — no build step. `index.html` + `manifest.json` + `assets/` is the whole
game. Deployed on Vercel (import the GitHub repo, framework preset "Other", no build
command, output dir = repo root).
