/*
 * Generates the Jainam brand mark (ornate mandala + Ahimsa hand +
 * Dharmachakra, gold line art) as SVG, then rasterises the app-icon /
 * adaptive-icon / splash / favicon PNGs under assets/images.
 *
 * Requires `rsvg-convert` on PATH (macOS: `brew install librsvg`).
 * Run: `node scripts/build-brand-assets.js`
 *
 * The same geometry is ported to src/components/BrandMark.tsx for in-app use —
 * keep the two in sync if you tweak the shapes.
 */
const fs = require("fs");
const { execFileSync } = require("child_process");
const path = require("path");

const GOLD = "#B8945A";
const CREAM = "#F7F2E7";

const C = 256; // centre of the base 512 canvas

const rad = (deg) => (deg * Math.PI) / 180;
const px = (r, deg) => [
  +(C + r * Math.cos(rad(deg))).toFixed(2),
  +(C + r * Math.sin(rad(deg))).toFixed(2),
];

/** A ring of pointed lotus petals. */
function petalRing(count, baseR, tipR, halfAngle, bulge = 1) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = (360 / count) * i - 90;
    const [x1, y1] = px(baseR, a - halfAngle);
    const [tx, ty] = px(tipR, a);
    const [x2, y2] = px(baseR, a + halfAngle);
    const [c1x, c1y] = px(tipR * bulge, a - halfAngle * 0.7);
    const [c2x, c2y] = px(tipR * bulge, a + halfAngle * 0.7);
    d += `M${x1} ${y1} Q${c1x} ${c1y} ${tx} ${ty} Q${c2x} ${c2y} ${x2} ${y2} `;
  }
  return d;
}

function dotRing(count, r, dotR, offset = 0) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const a = (360 / count) * i - 90 + offset;
    const [x, y] = px(r, a);
    out += `<circle cx="${x}" cy="${y}" r="${dotR}"/>`;
  }
  return out;
}

/* ---- Ahimsa hand: one continuous open-palm outline, fingers up, thumb left ---- */
function hand() {
  const K = 252; // knuckle line
  const hw = 11; // finger half-width
  const fingers = [
    { cx: 223, tip: 188 }, // index
    { cx: 245, tip: 167 }, // middle
    { cx: 267, tip: 186 }, // ring
    { cx: 289, tip: 214 }, // pinky
  ];

  let d = `M302 348`;
  // right palm edge up to the pinky's outer side
  d += ` C310 316 306 278 ${(fingers[3].cx + hw).toFixed(1)} ${K}`;
  // across the finger tops, right -> left (straight sides + rounded caps)
  for (let i = fingers.length - 1; i >= 0; i--) {
    const f = fingers[i];
    const rx = (f.cx + hw).toFixed(1);
    const lx = (f.cx - hw).toFixed(1);
    const capY = (f.tip + hw).toFixed(1);
    const peakY = (f.tip - hw * 0.6).toFixed(1);
    d += ` L${rx} ${capY} Q${f.cx} ${peakY} ${lx} ${capY} L${lx} ${K}`;
    if (i > 0) {
      const nrx = (fingers[i - 1].cx + hw).toFixed(1);
      const midx = ((f.cx - hw + fingers[i - 1].cx + hw) / 2).toFixed(1);
      d += ` Q${midx} ${K + 11} ${nrx} ${K}`;
    }
  }
  // upper-left palm edge, down to the thumb
  d += ` C206 258 200 264 197 274`;
  // thumb: spread out to the left and back
  d += ` C188 266 174 274 170 288`;
  d += ` C166 296 172 308 184 310`;
  d += ` C192 311 199 308 204 304`;
  // lower-left palm down to the wrist
  d += ` C207 320 209 336 219 348`;
  // wrist (gentle convex base)
  d += ` C240 358 268 358 302 348 Z`;
  return d;
}

/* ---- Dharmachakra (wheel of dharma) sitting in the palm ---- */
function wheel(cx, cy, r) {
  let out = `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.72).toFixed(1)}"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.15).toFixed(1)}"/>`;
  for (let i = 0; i < 8; i++) {
    const a = rad(i * 45);
    const x1 = (cx + Math.cos(a) * r * 0.15).toFixed(1);
    const y1 = (cy + Math.sin(a) * r * 0.15).toFixed(1);
    const x2 = (cx + Math.cos(a) * r * 0.72).toFixed(1);
    const y2 = (cy + Math.sin(a) * r * 0.72).toFixed(1);
    out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }
  return out;
}

/**
 * Build the mark SVG.
 * opts: { bg, stroke, mandala, pad }  — pad expands the viewBox on every side
 * (positive = more breathing room; negative = tighter crop / larger mark).
 */
function mark({ bg = "none", stroke = GOLD, mandala = true, pad = 0 } = {}) {
  const min = -pad;
  const size = 512 + pad * 2;
  const parts = [];
  if (bg !== "none") {
    parts.push(`<rect x="${min}" y="${min}" width="${size}" height="${size}" fill="${bg}"/>`);
  }

  if (mandala) {
    parts.push(`<g fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.92">
      <path d="${petalRing(24, 150, 246, 6.0, 1.0)}"/>
      <path d="${petalRing(24, 150, 210, 6.4, 1.0)}"/>
      <circle cx="${C}" cy="${C}" r="150"/>
      <circle cx="${C}" cy="${C}" r="143"/>
      <path d="${petalRing(12, 96, 138, 12.5, 1.02)}"/>
      <circle cx="${C}" cy="${C}" r="92"/>
      <circle cx="${C}" cy="${C}" r="86"/>
    </g>`);
    parts.push(`<g fill="${stroke}" opacity="0.5">${dotRing(24, 168, 2.3, 7.5)}</g>`);
  }

  parts.push(`<g transform="translate(3 0)" fill="none" stroke="${stroke}" stroke-width="4.0" stroke-linecap="round" stroke-linejoin="round">
    <path d="${hand()}"/>
  </g>`);
  parts.push(`<g fill="none" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    ${wheel(259, 296, 29)}
  </g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${min} ${min} ${size} ${size}" width="${size}" height="${size}">${parts.join("")}</svg>`;
}

const projRoot = require("path").join(__dirname, "..");
const projAssets = path.join(projRoot, "assets");
const brandDir = path.join(projAssets, "brand");
const imgDir = path.join(projAssets, "images");
fs.mkdirSync(brandDir, { recursive: true });
fs.mkdirSync(imgDir, { recursive: true });

// Reusable source SVGs (checked in for reference / future edits).
fs.writeFileSync(path.join(brandDir, "mark.svg"), mark({ stroke: GOLD, mandala: true }));
fs.writeFileSync(path.join(brandDir, "mark-plain.svg"), mark({ stroke: GOLD, mandala: false }));
fs.writeFileSync(path.join(brandDir, "icon.svg"), mark({ bg: CREAM, stroke: GOLD, mandala: true }));

function conv(svg, outPath, size) {
  const tmp = path.join(brandDir, ".tmp.svg");
  fs.writeFileSync(tmp, svg);
  execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), "-o", outPath, tmp]);
  fs.unlinkSync(tmp);
  console.log("wrote", path.relative(projRoot, outPath), size + "px");
}

// iOS / store icon — opaque cream, slight inset for the rounded-corner mask.
conv(mark({ bg: CREAM, stroke: GOLD, mandala: true, pad: 40 }), path.join(imgDir, "icon.png"), 1024);
// Android adaptive foreground — transparent (cream comes from adaptiveIcon.backgroundColor),
// mark sized to sit inside the circular/squircle mask safe zone.
conv(mark({ bg: "none", stroke: GOLD, mandala: true, pad: 84 }), path.join(imgDir, "adaptive-icon.png"), 1024);
// Android adaptive monochrome layer (themed icons).
conv(mark({ bg: "none", stroke: "#000000", mandala: true, pad: 84 }), path.join(imgDir, "adaptive-icon-monochrome.png"), 1024);
// Splash mark — transparent, shown centred on cream by expo-splash-screen.
conv(mark({ bg: "none", stroke: GOLD, mandala: true, pad: 40 }), path.join(imgDir, "splash-icon.png"), 1024);
// Favicon — hand + wheel only (mandala detail is lost at tab size), cream bg.
conv(mark({ bg: CREAM, stroke: GOLD, mandala: false, pad: -48 }), path.join(imgDir, "favicon.png"), 96);

console.log("done");
