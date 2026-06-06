# The Warriors 🐾

A Warriors-cats character-creator game. **All artwork hand-drawn in Procreate by the
game's designer.** Players build their own warrior cat — ears, eyes, cheek fur, tail,
pattern, colors, width — name it, give it a clan role, and place it in a scene.

## Run it

It's a static site: open `index.html`, or `npx serve .` locally.

**Deploy on Vercel:** Import this GitHub repo → Framework preset **Other** →
no build command → output directory = repo root → Deploy.

## What's where

| Path | What |
|---|---|
| `index.html` | The whole game (no dependencies, no build) |
| `manifest.json` | Every part, palette, role, scene + layout anchors |
| `SPEC.md` | Game design doc — **read this first** |
| `assets/parts/` | Transparent-PNG cat parts (line art) |
| `assets/backgrounds/` | Scenes |
| `assets/characters/` | Finished character art incl. animation frames |
| `assets/ui/` | "None" buttons |
| `assets/reference/` | The artist's original menu sheets & notes |

## Adding new art

1. Draw in Procreate on the usual 2732×2048 canvas, parts positioned on the cat.
2. Export as PNG **with transparent background** (Share → PNG, background off).
3. Drop into the right `assets/parts/...` folder.
4. Add one entry to `manifest.json` in the matching category.

## Working on this repo with Claude Code

Prompt to start a session:

> Read SPEC.md and manifest.json first. The art style is hand-drawn and must stay
> that way — never generate or replace artwork, only use files in assets/.
> Respect the design rules in SPEC.md (they come from the artist's own notes).
> The game is a single static index.html with no dependencies; keep it that way
> unless asked. Current task: <describe the feature from the SPEC.md roadmap>.

Good first tasks are in `SPEC.md → Roadmap ideas`.
