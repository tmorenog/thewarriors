// Headless render harness: replicates index.html draw() with node-canvas so we
// can see whether the fur silhouette lines up with the hand-drawn parts.
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const M = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
const W = M.canvas.w, H = M.canvas.h;

const IMG = {};
const load = async src => (IMG[src] ||= await loadImage(path.join(ROOT, src)));

function tinted(img, color, w, h) {
  const c = createCanvas(w, h), x = c.getContext("2d");
  x.drawImage(img, 0, 0, w, h);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = color; x.fillRect(0, 0, w, h);
  return c;
}

// ---- silhouette under test ----
// Per-cheek body sides: left/right outline points (top->bottom) tracing the
// chosen cheek's hand-drawn line. Crown + seated base are shared.
const BODY = M.bodyShape;
function bodyShapeFor(state) { return BODY[state.cheeks] || BODY.cheeks_smooth; }

function bodyPath(x, state) {
  const ears = (M.earFill && M.earFill[state.ears]) || [];
  ears.forEach(tri => {
    x.beginPath(); x.moveTo(tri[0][0], tri[0][1]);
    for (let i = 1; i < tri.length; i++) x.lineTo(tri[i][0], tri[i][1]);
    x.closePath(); x.fill();
  });
  // make each side reach its ear so ears never float, then taper to the cheek
  const tris = (M.earFill && M.earFill[state.ears]) || [];
  const earBase = tri => {                                  // base = two non-apex pts
    const s = [...tri].sort((a, b) => a[1] - b[1]);
    return { xs: [s[1][0], s[2][0]], y: (s[1][1] + s[2][1]) / 2 };
  };
  const side = (pts, isRight) => {
    if (tris.length < 2) return pts;
    const b = earBase(isRight ? tris[1] : tris[0]);
    const earX = isRight ? Math.max(...b.xs) : Math.min(...b.xs);
    const reaches = isRight ? pts[0][0] >= earX : pts[0][0] <= earX;
    if (reaches) return pts;                                // head already meets the ear
    return [[earX, b.y], ...pts.filter(p => p[1] > b.y + 10)];
  };
  const L = side(bodyShapeFor(state).left, false);
  const R = side(bodyShapeFor(state).right, true);
  const lt = L[0], rt = R[0], lb = L[L.length - 1], rb = R[R.length - 1];
  const crownY = Math.min(lt[1], rt[1]) - 95;
  x.beginPath();
  x.moveTo(lt[0], lt[1]);
  x.bezierCurveTo(lt[0] + 165, crownY, rt[0] - 165, crownY, rt[0], rt[1]);      // crown
  for (let i = 1; i < R.length; i++) x.lineTo(R[i][0], R[i][1]);                // right cheek
  x.bezierCurveTo(rb[0] + 95, rb[1] + 95, rb[0] + 100, 1024, rb[0] + 90, 1024); // right flare
  x.lineTo(lb[0] - 90, 1024);                                                   // seated base
  x.bezierCurveTo(lb[0] - 100, 1024, lb[0] - 95, lb[1] + 95, lb[0], lb[1]);     // left flare
  for (let i = L.length - 2; i >= 0; i--) x.lineTo(L[i][0], L[i][1]);           // left cheek up
  x.closePath(); x.fill();
}

async function render(state, outName) {
  const cv = createCanvas(W, H), ctx = cv.getContext("2d");
  ctx.fillStyle = "#cfe3b8"; ctx.fillRect(0, 0, W, H);     // plain bg

  const cat = createCanvas(W, H), c = cat.getContext("2d");
  if (state.tail) {
    const t = M.categories.tail.find(p => p.id === state.tail);
    const img = await load(t.src);
    c.save(); c.translate(t.offset[0], t.offset[1]); c.drawImage(img, 0, 0, W, H); c.restore();
  }
  const body = createCanvas(W, H), bx = body.getContext("2d");
  bx.fillStyle = state.fur; bodyPath(bx, state);
  if (state.pattern) {
    const p = M.categories.pattern.find(q => q.id === state.pattern);
    const img = await load(p.src);
    state.patColors.forEach((col, i) => {
      const t = tinted(img, col, W, H);
      bx.save(); bx.globalCompositeOperation = "source-atop"; bx.globalAlpha = 0.9;
      if (i > 0) bx.translate(40 * i, 60 * i);
      bx.drawImage(t, 0, 0); bx.restore();
    });
  }
  c.drawImage(body, 0, 0);
  for (const k of ["ears", "eyes", "cheeks"]) {
    if (!state[k]) continue;
    const p = M.categories[k].find(q => q.id === state[k]);
    c.drawImage(await load(p.src), 0, 0, W, H);
  }
  ctx.save();
  ctx.translate(650 * (1 - state.width), 0); ctx.scale(state.width, 1);
  ctx.drawImage(cat, 0, 0); ctx.restore();

  fs.writeFileSync(path.join("/tmp", outName), cv.toBuffer("image/png"));
  console.log("wrote /tmp/" + outName);
}

(async () => {
  const base = {
    ears: "ears_pointed", eyes: "eyes_calm", cheeks: "cheeks_smooth",
    tail: "tail_curved", pattern: null, fur: "#f59502",
    eyeColors: ["#17f288"], patColors: ["#513b23"], width: 1,
  };
  for (const ch of ["cheeks_smooth", "cheeks_spiky", "cheeks_bolt", "cheeks_curly", "cheeks_jagged", "cheeks_wavy", "cheeks_thin"])
    await render({ ...base, cheeks: ch }, ch + ".png");
})();
