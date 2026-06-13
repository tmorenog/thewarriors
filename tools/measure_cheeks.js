// Measure each cheek's left/right outline from its PNG so the fur silhouette
// can trace the real hand-drawn line. Outputs manifest-ready bodyShape data.
// Run in node only (uses getImageData); results are baked into manifest.json,
// so the browser never needs pixel access.
const { loadImage, createCanvas } = require("canvas");
const fs = require("fs"); const path = require("path");
const ROOT = path.join(__dirname, "..");
const M = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
const W = M.canvas.w, H = M.canvas.h, MID = W / 2;

async function measure(src) {
  const img = await loadImage(path.join(ROOT, src));
  const cv = createCanvas(W, H), x = cv.getContext("2d");
  x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const opaque = (px, py) => d[(py * W + px) * 4 + 3] > 40;
  // per row, outer x of the left stroke (min x) and right stroke (max x)
  const rows = [];
  for (let y = 0; y < H; y++) {
    let lMin = null, rMax = null;
    for (let px = 0; px < W; px++) {
      if (!opaque(px, y)) continue;
      if (px < MID) { if (lMin === null) lMin = px; }
      else { rMax = px; }
    }
    rows.push({ y, lMin, rMax });
  }
  const ys = rows.filter(r => r.lMin !== null || r.rMax !== null).map(r => r.y);
  const top = Math.min(...ys), bot = Math.max(...ys);
  // sample shared y-bands; at each take the outermost edge in a growing window
  const sample = (yc, pickLeft) => {
    for (let win = 22; win <= 90; win += 22) {
      let best = null;
      for (let y = Math.max(top, yc - win); y <= Math.min(bot, yc + win); y++) {
        const v = pickLeft ? rows[y].lMin : rows[y].rMax;
        if (v === null) continue;
        if (best === null || (pickLeft ? v < best : v > best)) best = v;
      }
      if (best !== null) return best;
    }
    return null;
  };
  const bands = [0.05, 0.38, 0.66, 0.95].map(f => Math.round(top + (bot - top) * f));
  const fill = side => {                       // carry nearest non-null x into gaps
    for (let i = 0; i < side.length; i++) if (side[i][0] === null)
      for (let j = 1; j < side.length; j++) {
        if (side[i - j] && side[i - j][0] !== null) { side[i][0] = side[i - j][0]; break; }
        if (side[i + j] && side[i + j][0] !== null) { side[i][0] = side[i + j][0]; break; }
      }
    return side;
  };
  const left  = fill(bands.map(yc => [sample(yc, true),  yc]));
  const right = fill(bands.map(yc => [sample(yc, false), yc]));
  return { left, right };
}

(async () => {
  const out = {};
  for (const c of M.categories.cheeks) out[c.id] = await measure(c.src);
  console.log(JSON.stringify(out, null, 0));
})();
