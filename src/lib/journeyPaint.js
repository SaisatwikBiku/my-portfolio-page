// Everything that turns the generated Journey world into pixels.
//
// Split in two on purpose:
//
//  · bakeTerrain() runs once per theme. It paints the whole 2500×1500 world into
//    an offscreen canvas — ground, coast, roads, bridge — which the game loop
//    then blits one viewport-sized slice of per frame. Terrain never changes, so
//    paying for it once and copying a rectangle thereafter is the difference
//    between a 60fps map and a slideshow.
//
//  · the draw* helpers are called every frame for the things that do change:
//    props (interleaved with the character so it walks behind trees), markers,
//    the walker, weather and particles.
//
// The ground itself is painted at one cell per pixel into a 125×75 canvas and
// then scaled up, which is what gives it the soft, hand-painted falloff between
// biomes rather than 20px stair-steps. Everything with an edge that must stay
// crisp — roads, foam, plaza kerbs — is drawn afterwards at full resolution.

import { WORLD, TILE, PLACES, ROADS, PLAZA_R } from '../data/journey.js'
import { GW, GH, T, terrain, REGION_SPLIT } from './journeyWorld.js'

/* ------------------------------------------------------------------ *
 * Colour helpers
 * ------------------------------------------------------------------ */

function hex(h) {
  const v = parseInt(h.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
function rgb(a) {
  return `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`
}
function mix(a, b, t) {
  const A = typeof a === 'string' ? hex(a) : a
  const B = typeof b === 'string' ? hex(b) : b
  return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]
}
function shade(c, t) {
  // t > 0 lightens toward white, t < 0 darkens toward black.
  return t >= 0 ? mix(c, [255, 255, 255], t) : mix(c, [0, 0, 0], -t)
}

/* ------------------------------------------------------------------ *
 * Palettes
 * ------------------------------------------------------------------ */

// Two full worlds, not one world with a filter over it. Light is a bright
// midday island; dark is the same island at dusk, where the road lamps and the
// windows are the brightest things on screen.
const LIGHT = {
  night: false,
  deep: '#1a6ba4', water: '#2a88bf', shallow: '#63bdd8', foam: '#ffffff',
  sand: '#e7d5a6', grass: '#84c067', meadow: '#9ad07a', forest: '#57a054', rock: '#a8a795',
  plaza: '#d2c9b2', plazaLine: '#b4a98d',
  road: '#cbb188', roadEdge: '#a98f68', roadDash: '#f2e7cf',
  deck: '#c09361', deckDark: '#966c42', rail: '#7d5836',
  trunk: '#7b5535', leaf: '#4e9a4e', leafHi: '#77bd62', pine: '#357a4d', pineHi: '#4b9a5f',
  leafWarm: '#6aa845', leafCool: '#3f8f63', autumn: '#d98436', autumnHi: '#eaa953',
  stone: '#9d9c8c', stoneHi: '#bcbaa8',
  wallIn: '#e3cba2', wallUs: '#c9714f', wallAlt: '#eee6d8',
  roofIn: '#c0663f', roofUs: '#4d5666', roofAlt: '#8a5a3c',
  window: '#8fb6d6', windowLit: '#ffd489',
  lampPost: '#4e5666', lampGlow: 'rgba(255,214,140,0)',
  shadow: 'rgba(25,35,45,0.20)', propShadow: 'rgba(25,40,30,0.18)',
  grain: 0.035, cloud: 'rgba(20,40,60,0.07)',
  vignette: 'rgba(8,20,35,0.30)',
  label: '#101a2b', labelBg: 'rgba(255,255,255,0.94)', labelEdge: 'rgba(20,30,50,0.14)',
  pinIdle: '#ffffff',
}

const DARK = {
  night: true,
  deep: '#0a2540', water: '#123a5e', shallow: '#1c5f80', foam: '#9fd8ee',
  sand: '#6a5f47', grass: '#2c6444', meadow: '#347552', forest: '#1f4f37', rock: '#454b58',
  plaza: '#414759', plazaLine: '#333949',
  road: '#5d5241', roadEdge: '#403829', roadDash: '#94896e',
  deck: '#5d452c', deckDark: '#432f1d', rail: '#312214',
  trunk: '#3d2c1c', leaf: '#245c3f', leafHi: '#2f7a4f', pine: '#1c4d38', pineHi: '#276746',
  leafWarm: '#2f6b3c', leafCool: '#1f5b4c', autumn: '#7a4a22', autumnHi: '#9c6430',
  stone: '#4a4f5b', stoneHi: '#5f6572',
  wallIn: '#4e4534', wallUs: '#4a2f28', wallAlt: '#3d4152',
  roofIn: '#3d2a20', roofUs: '#252b38', roofAlt: '#33241a',
  window: '#22354c', windowLit: '#ffca6e',
  lampPost: '#20262f', lampGlow: 'rgba(255,196,110,0)',
  shadow: 'rgba(0,0,0,0.38)', propShadow: 'rgba(0,0,0,0.32)',
  grain: 0.05, cloud: 'rgba(0,0,0,0.14)',
  vignette: 'rgba(0,0,0,0.46)',
  label: '#e8eefc', labelBg: 'rgba(16,24,44,0.92)', labelEdge: 'rgba(120,150,200,0.24)',
  pinIdle: '#e6eefb',
}

export function makePalette(dark, accent) {
  return { ...(dark ? DARK : LIGHT), accent: accent || (dark ? '#2492ff' : '#007bff') }
}

/* ------------------------------------------------------------------ *
 * Small canvas utilities
 * ------------------------------------------------------------------ */

function canvasOf(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

// roundRect is not quite universal yet (older Safari), and this is called a few
// hundred times a frame — cheap enough to just always take our own path.
function rr(ctx, x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + k, y)
  ctx.lineTo(x + w - k, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + k)
  ctx.lineTo(x + w, y + h - k)
  ctx.quadraticCurveTo(x + w, y + h, x + w - k, y + h)
  ctx.lineTo(x + k, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - k)
  ctx.lineTo(x, y + k)
  ctx.quadraticCurveTo(x, y, x + k, y)
  ctx.closePath()
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
}

// Deterministic per-cell jitter, so the ground has grain without a texture.
function cellNoise(gx, gy, seed) {
  let h = Math.imul(gx + 1, 0x27d4eb2d) ^ Math.imul(gy + 1, 0x165667b1) ^ Math.imul(seed, 0x9e3779b9)
  h = (h ^ (h >>> 15)) >>> 0
  return h / 4294967296
}

/* ------------------------------------------------------------------ *
 * Terrain bake
 * ------------------------------------------------------------------ */

// Ground colour for one cell, before any of the crisp detail passes.
function groundColor(t, gx, gy, pal) {
  const x = gx * TILE
  let base
  switch (t) {
    case T.DEEP: base = pal.deep; break
    case T.WATER: base = pal.water; break
    case T.SHALLOW: base = pal.shallow; break
    case T.SAND: base = pal.sand; break
    case T.MEADOW: base = pal.meadow; break
    case T.FOREST: base = pal.forest; break
    case T.ROCK: base = pal.rock; break
    // Plaza / road / bridge get painted crisply later; underneath them the soft
    // layer just carries the surrounding ground so no seam shows at the kerb.
    case T.PLAZA:
    case T.ROAD: base = pal.grass; break
    case T.BRIDGE: base = pal.water; break
    default: base = pal.grass
  }
  let c = hex(base)
  // The two halves of the journey are lit differently: India warm and dusty,
  // the Hudson valley cooler and bluer. Only vegetation takes the tint — water
  // and stone would read as a colour-cast bug.
  if (t >= T.SAND && t <= T.ROCK) {
    c = x < REGION_SPLIT ? mix(c, pal.leafWarm, 0.1) : mix(c, pal.leafCool, 0.13)
  }
  const n = cellNoise(gx, gy, 4242)
  return shade(c, (n - 0.5) * 0.13)
}

/**
 * Paint the entire world once. Returns the full-resolution canvas the loop
 * blits from, plus the 125×75 thumbnail the minimap reuses.
 */
export function bakeTerrain(pal) {
  // --- soft ground layer, one pixel per cell -------------------------------
  const low = canvasOf(GW, GH)
  const lg = low.getContext('2d')
  for (let gy = 0; gy < GH; gy++) {
    for (let gx = 0; gx < GW; gx++) {
      lg.fillStyle = rgb(groundColor(terrain[gy * GW + gx], gx, gy, pal))
      lg.fillRect(gx, gy, 1, 1)
    }
  }

  const base = canvasOf(WORLD.w, WORLD.h)
  const ctx = base.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Upscale in two steps: bilinear straight from 20× leaves visible diamond
  // artefacts, whereas 4× then 5× approximates a bicubic and costs nothing.
  const mid = canvasOf(GW * 4, GH * 4)
  const mg = mid.getContext('2d')
  mg.imageSmoothingEnabled = true
  mg.imageSmoothingQuality = 'high'
  mg.drawImage(low, 0, 0, mid.width, mid.height)
  ctx.drawImage(mid, 0, 0, WORLD.w, WORLD.h)

  // --- water: depth banding and swell -------------------------------------
  ctx.save()
  ctx.lineCap = 'round'
  for (let gy = 0; gy < GH; gy++) {
    for (let gx = 0; gx < GW; gx++) {
      const t = terrain[gy * GW + gx]
      if (t !== T.DEEP && t !== T.WATER) continue
      if ((gx * 7 + gy * 13) % 17 !== 0) continue
      const x = gx * TILE + TILE / 2
      const y = gy * TILE + TILE / 2
      const w = 16 + cellNoise(gx, gy, 88) * 22
      ctx.strokeStyle = `rgba(255,255,255,${pal.night ? 0.06 : 0.13})`
      ctx.lineWidth = 2.4
      ctx.beginPath()
      ctx.moveTo(x - w / 2, y)
      ctx.quadraticCurveTo(x, y - 4, x + w / 2, y)
      ctx.stroke()
    }
  }
  ctx.restore()

  // --- coastline: foam where shallow water meets the beach ----------------
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let gy = 1; gy < GH - 1; gy++) {
    for (let gx = 1; gx < GW - 1; gx++) {
      if (terrain[gy * GW + gx] !== T.SHALLOW) continue
      // Only cells actually touching the land get foam.
      let touches = false
      for (let d = 0; d < 4 && !touches; d++) {
        const nx = gx + [1, -1, 0, 0][d]
        const ny = gy + [0, 0, 1, -1][d]
        if (terrain[ny * GW + nx] > T.SHALLOW) touches = true
      }
      if (!touches) continue
      const x = gx * TILE + TILE / 2
      const y = gy * TILE + TILE / 2
      const n = cellNoise(gx, gy, 1717)
      ctx.strokeStyle = pal.foam
      ctx.globalAlpha = pal.night ? 0.16 : 0.42
      ctx.lineWidth = 2.6 + n * 1.6
      ctx.beginPath()
      ctx.arc(x, y, 8 + n * 5, n * 6.28, n * 6.28 + 2.1)
      ctx.stroke()
    }
  }
  ctx.restore()

  // --- grain: breaks up the flat fills, sells it as painted ---------------
  const grain = makeGrain()
  ctx.save()
  ctx.globalAlpha = pal.grain
  const pat = ctx.createPattern(grain, 'repeat')
  ctx.fillStyle = pat
  ctx.fillRect(0, 0, WORLD.w, WORLD.h)
  ctx.restore()

  // --- town squares --------------------------------------------------------
  for (const p of PLACES) {
    if (p.kind === 'travel') continue
    const g = ctx.createRadialGradient(p.x, p.y, PLAZA_R * 0.35, p.x, p.y, PLAZA_R)
    g.addColorStop(0, rgb(shade(hex(pal.plaza), 0.06)))
    g.addColorStop(0.72, pal.plaza)
    g.addColorStop(1, `rgba(0,0,0,0)`)
    ctx.fillStyle = g
    ellipse(ctx, p.x, p.y, PLAZA_R, PLAZA_R)
    ctx.fill()

    // Paving joints — two rings and eight spokes, enough to read as flagstone.
    ctx.save()
    ctx.strokeStyle = pal.plazaLine
    ctx.globalAlpha = 0.34
    ctx.lineWidth = 2
    for (const f of [0.42, 0.72]) {
      ellipse(ctx, p.x, p.y, PLAZA_R * f, PLAZA_R * f)
      ctx.stroke()
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2
      ctx.beginPath()
      ctx.moveTo(p.x + Math.cos(a) * PLAZA_R * 0.42, p.y + Math.sin(a) * PLAZA_R * 0.42)
      ctx.lineTo(p.x + Math.cos(a) * PLAZA_R * 0.94, p.y + Math.sin(a) * PLAZA_R * 0.94)
      ctx.stroke()
    }
    ctx.restore()
  }

  // --- roads ---------------------------------------------------------------
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const road of ROADS) {
    if (road.bridge) continue
    tracePath(ctx, road.pts)
    ctx.strokeStyle = pal.roadEdge
    ctx.lineWidth = 44
    ctx.stroke()
    ctx.strokeStyle = pal.road
    ctx.lineWidth = 36
    ctx.stroke()
  }
  ctx.globalAlpha = 0.55
  ctx.setLineDash([20, 26])
  ctx.strokeStyle = pal.roadDash
  ctx.lineWidth = 3.5
  for (const road of ROADS) {
    if (road.bridge) continue
    tracePath(ctx, road.pts)
    ctx.stroke()
  }
  ctx.restore()

  // --- the bridge: the one road that crosses the ocean ---------------------
  for (const road of ROADS) {
    if (!road.bridge) continue
    ctx.save()
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'round'
    // Piles first, so the deck sits on top of them.
    ctx.strokeStyle = pal.night ? 'rgba(0,0,0,0.45)' : 'rgba(20,45,70,0.30)'
    ctx.lineWidth = 62
    tracePath(ctx, road.pts)
    ctx.stroke()
    ctx.strokeStyle = pal.deckDark
    ctx.lineWidth = 54
    tracePath(ctx, road.pts)
    ctx.stroke()
    ctx.strokeStyle = pal.deck
    ctx.lineWidth = 46
    tracePath(ctx, road.pts)
    ctx.stroke()

    // Planks, then rope rails down both sides.
    const [ax, ay] = road.pts[0]
    const [bx, by] = road.pts[road.pts.length - 1]
    const len = Math.hypot(bx - ax, by - ay)
    const ux = (bx - ax) / len
    const uy = (by - ay) / len
    ctx.strokeStyle = pal.deckDark
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 2
    for (let d = 0; d < len; d += 17) {
      const x = ax + ux * d
      const y = ay + uy * d
      ctx.beginPath()
      ctx.moveTo(x + uy * 23, y - ux * 23)
      ctx.lineTo(x - uy * 23, y + ux * 23)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.strokeStyle = pal.rail
    ctx.lineWidth = 4
    for (const s of [1, -1]) {
      ctx.beginPath()
      ctx.moveTo(ax + uy * 23 * s, ay - ux * 23 * s)
      ctx.lineTo(bx + uy * 23 * s, by - ux * 23 * s)
      ctx.stroke()
    }
    ctx.restore()
  }

  return { base, low }
}

function tracePath(ctx, pts) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  if (pts.length === 2) {
    ctx.lineTo(pts[1][0], pts[1][1])
    return
  }
  // Catmull-Rom-ish smoothing: run through the midpoints so the road curves
  // instead of showing every control vertex as a kink.
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2
    const my = (pts[i][1] + pts[i + 1][1]) / 2
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my)
  }
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
}

let grainTile = null
function makeGrain() {
  if (grainTile) return grainTile
  const c = canvasOf(160, 160)
  const g = c.getContext('2d')
  const img = g.createImageData(160, 160)
  // A plain LCG rather than the positional hash used elsewhere: the hash is
  // built to be smooth in x and y, which is exactly what a grain tile must not
  // be — it showed up as a diagonal weave across the whole ocean.
  let s = 0x2f6e2b1
  for (let i = 0; i < 160 * 160; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const v = 90 + (s >>> 24) * 0.6
    img.data[i * 4] = v
    img.data[i * 4 + 1] = v
    img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255
  }
  g.putImageData(img, 0, 0)
  grainTile = c
  return c
}

/* ------------------------------------------------------------------ *
 * Props
 * ------------------------------------------------------------------ */

export function drawProp(ctx, p, pal, t) {
  switch (p.type) {
    case 'tree': return drawTree(ctx, p, pal, t)
    case 'pine': return drawPine(ctx, p, pal, t)
    case 'bush': return drawBush(ctx, p, pal)
    case 'palm': return drawPalm(ctx, p, pal, t)
    case 'rock': return drawRock(ctx, p, pal)
    case 'flowers': return drawFlowers(ctx, p, pal)
    case 'boat': return drawBoat(ctx, p, pal, t)
    case 'lamp': return drawLamp(ctx, p, pal, t)
    case 'building': return drawBuilding(ctx, p, pal)
    default: return (LANDMARKS[p.type] || drawBuilding)(ctx, p, pal, t)
  }
}

function groundShadow(ctx, x, y, rx, ry, pal) {
  ctx.fillStyle = pal.propShadow
  ellipse(ctx, x + 3, y + 2, rx, ry)
  ctx.fill()
}

// A slow, per-prop sway. Trees on the far side of the ocean lean on a slightly
// different beat so the whole forest never breathes in unison.
function sway(p, t) {
  return Math.sin(t * 0.0011 + p.s * 9.4 + p.x * 0.01) * 0.035
}

function drawTree(ctx, p, pal, t) {
  const r = 15 + p.s * 9
  groundShadow(ctx, p.x, p.y, r * 0.85, r * 0.32, pal)
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(sway(p, t))
  ctx.fillStyle = pal.trunk
  rr(ctx, -r * 0.13, -r * 1.05, r * 0.26, r * 1.05, r * 0.09)
  ctx.fill()

  // Autumn is the Hudson valley's signature — a third of the American trees
  // turn, none of the Indian ones do.
  const turned = p.region === 'us' && p.s > 0.66
  const dark = turned ? pal.autumn : pal.leaf
  const light = turned ? pal.autumnHi : pal.leafHi

  ctx.fillStyle = dark
  ellipse(ctx, 0, -r * 1.35, r * 0.82, r * 0.78)
  ctx.fill()
  ellipse(ctx, -r * 0.55, -r * 1.02, r * 0.6, r * 0.56)
  ctx.fill()
  ellipse(ctx, r * 0.56, -r * 1.08, r * 0.56, r * 0.53)
  ctx.fill()
  ctx.fillStyle = light
  ellipse(ctx, -r * 0.2, -r * 1.55, r * 0.5, r * 0.46)
  ctx.fill()
  ctx.restore()
}

function drawPine(ctx, p, pal, t) {
  const r = 16 + p.s * 11
  groundShadow(ctx, p.x, p.y, r * 0.66, r * 0.26, pal)
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(sway(p, t) * 0.6)
  ctx.fillStyle = pal.trunk
  rr(ctx, -r * 0.11, -r * 0.6, r * 0.22, r * 0.6, r * 0.08)
  ctx.fill()
  for (let i = 0; i < 3; i++) {
    const top = -r * (0.72 + i * 0.52) - r * 0.72
    const halfW = r * (0.74 - i * 0.18)
    ctx.fillStyle = i === 2 ? pal.pineHi : pal.pine
    ctx.beginPath()
    ctx.moveTo(0, top - r * 0.55)
    ctx.lineTo(halfW, top + r * 0.3)
    ctx.lineTo(-halfW, top + r * 0.3)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function drawBush(ctx, p, pal) {
  const r = 8 + p.s * 6
  groundShadow(ctx, p.x, p.y, r, r * 0.36, pal)
  ctx.fillStyle = p.region === 'us' ? pal.leafCool : pal.leafWarm
  ellipse(ctx, p.x - r * 0.4, p.y - r * 0.5, r * 0.7, r * 0.6)
  ctx.fill()
  ellipse(ctx, p.x + r * 0.35, p.y - r * 0.45, r * 0.62, r * 0.54)
  ctx.fill()
  ctx.fillStyle = pal.leafHi
  ellipse(ctx, p.x - r * 0.1, p.y - r * 0.85, r * 0.44, r * 0.36)
  ctx.fill()
}

function drawPalm(ctx, p, pal, t) {
  const h = 34 + p.s * 20
  groundShadow(ctx, p.x, p.y, h * 0.3, h * 0.11, pal)
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(sway(p, t) * 1.6)
  const lean = (p.s - 0.5) * h * 0.34
  ctx.strokeStyle = pal.trunk
  ctx.lineWidth = 4.4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(lean * 0.4, -h * 0.6, lean, -h)
  ctx.stroke()
  ctx.fillStyle = pal.pineHi
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    ctx.save()
    ctx.translate(lean, -h)
    ctx.rotate(a)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(h * 0.28, h * 0.05, h * 0.44, h * 0.2)
    ctx.quadraticCurveTo(h * 0.26, h * 0.02, 0, h * 0.08)
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

function drawRock(ctx, p, pal) {
  const r = 7 + p.s * 11
  groundShadow(ctx, p.x, p.y, r * 1.05, r * 0.38, pal)
  ctx.fillStyle = pal.stone
  ctx.beginPath()
  for (let i = 0; i <= 7; i++) {
    const a = (i / 7) * Math.PI * 2
    const rad = r * (0.72 + cellNoise(i, (p.s * 1000) | 0, 5) * 0.5)
    const x = p.x + Math.cos(a) * rad
    const y = p.y - r * 0.42 + Math.sin(a) * rad * 0.62
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = pal.stoneHi
  ellipse(ctx, p.x - r * 0.22, p.y - r * 0.66, r * 0.4, r * 0.24)
  ctx.fill()
}

function drawFlowers(ctx, p, pal) {
  const tint = ['#e8735a', '#f0c14b', '#dd6ba0', '#8fd2f0']
  for (let i = 0; i < 5; i++) {
    const n = cellNoise(i, (p.s * 997) | 0, 12)
    const x = p.x + (n - 0.5) * 22
    const y = p.y + (cellNoise(i, (p.s * 331) | 0, 3) - 0.5) * 12
    ctx.fillStyle = tint[i % tint.length]
    ctx.globalAlpha = pal.night ? 0.42 : 0.9
    ellipse(ctx, x, y, 2.4, 2.1)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawBoat(ctx, p, pal, t) {
  const w = 26 + p.s * 14
  const bob = Math.sin(t * 0.0016 + p.s * 6) * 1.6
  ctx.save()
  ctx.translate(p.x, p.y + bob)
  ctx.rotate(Math.sin(t * 0.0012 + p.s * 3) * 0.05 + (p.s - 0.5))
  ctx.fillStyle = 'rgba(0,0,0,0.16)'
  ellipse(ctx, 0, 3, w * 0.55, w * 0.2)
  ctx.fill()
  ctx.fillStyle = pal.deck
  ctx.beginPath()
  ctx.moveTo(-w / 2, -3)
  ctx.quadraticCurveTo(0, 8, w / 2, -3)
  ctx.quadraticCurveTo(0, 1, -w / 2, -3)
  ctx.fill()
  ctx.strokeStyle = pal.rail
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -3)
  ctx.lineTo(0, -w * 0.6)
  ctx.stroke()
  ctx.fillStyle = pal.night ? '#c9d6ea' : '#ffffff'
  ctx.beginPath()
  ctx.moveTo(1, -w * 0.6)
  ctx.lineTo(w * 0.3, -6)
  ctx.lineTo(1, -6)
  ctx.fill()
  ctx.restore()
}

function drawLamp(ctx, p, pal, t) {
  const h = 34
  // The pool of light lands on the road, so it is drawn under the post.
  if (pal.night) {
    const flicker = 0.9 + Math.sin(t * 0.004 + p.x) * 0.06
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 78)
    g.addColorStop(0, `rgba(255,203,120,${0.3 * flicker})`)
    g.addColorStop(1, 'rgba(255,203,120,0)')
    ctx.fillStyle = g
    ellipse(ctx, p.x, p.y, 78, 40)
    ctx.fill()
  } else {
    groundShadow(ctx, p.x, p.y, 5, 2.4, pal)
  }
  ctx.strokeStyle = pal.lampPost
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
  ctx.lineTo(p.x, p.y - h)
  ctx.stroke()
  ctx.fillStyle = pal.night ? '#ffd48a' : '#cfd8e4'
  ellipse(ctx, p.x, p.y - h - 2, 5, 6)
  ctx.fill()
  if (pal.night) {
    ctx.fillStyle = 'rgba(255,212,138,0.28)'
    ellipse(ctx, p.x, p.y - h - 2, 11, 12)
    ctx.fill()
  }
}

// Buildings are drawn as a wall plus an overhanging roof: enough of a third
// dimension to give the world depth, shallow enough that it still reads as a
// top-down map rather than a broken isometric one.
function drawBuilding(ctx, p, pal) {
  const w = 34 + p.s * 26
  const wallH = 24 + p.s * 18
  const roofH = 14 + p.s * 9
  const wall = p.region === 'us'
    ? (p.s > 0.55 ? pal.wallUs : pal.wallAlt)
    : (p.s > 0.5 ? pal.wallIn : pal.wallAlt)
  const roof = p.region === 'us' ? pal.roofUs : (p.s > 0.5 ? pal.roofIn : pal.roofAlt)

  ctx.fillStyle = pal.shadow
  ellipse(ctx, p.x + 6, p.y + 2, w * 0.62, w * 0.2)
  ctx.fill()

  const x = p.x - w / 2
  const top = p.y - wallH
  ctx.fillStyle = wall
  rr(ctx, x, top, w, wallH, 3)
  ctx.fill()
  // Right-hand third in shadow: one cheap gradient's worth of form.
  ctx.fillStyle = 'rgba(0,0,0,0.14)'
  rr(ctx, x + w * 0.66, top, w * 0.34, wallH, 3)
  ctx.fill()

  ctx.fillStyle = roof
  rr(ctx, x - 5, top - roofH, w + 10, roofH + 6, 4)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  rr(ctx, x - 5, top - roofH, w + 10, 5, 3)
  ctx.fill()

  const cols = 2
  const winW = w / (cols * 2 + 1)
  for (let i = 0; i < cols; i++) {
    // Lit at night, glazed by day — the per-prop seed decides which windows
    // have someone home, so it never flickers between frames.
    const lit = pal.night && cellNoise(i, (p.s * 641) | 0, 77) > 0.35
    ctx.fillStyle = lit ? pal.windowLit : pal.window
    rr(ctx, x + winW * (i * 2 + 1), top + wallH * 0.22, winW, wallH * 0.3, 2)
    ctx.fill()
    if (lit) {
      ctx.save()
      ctx.globalAlpha = 0.25
      ctx.fillStyle = pal.windowLit
      rr(ctx, x + winW * (i * 2 + 1) - 4, top + wallH * 0.22 - 4, winW + 8, wallH * 0.3 + 8, 4)
      ctx.fill()
      ctx.restore()
    }
  }
  ctx.fillStyle = pal.night ? '#2a2118' : '#6b5340'
  rr(ctx, p.x - w * 0.09, p.y - wallH * 0.42, w * 0.18, wallH * 0.42, 2)
  ctx.fill()
}

/* ------------------------------------------------------------------ *
 * Chapter landmarks
 * ------------------------------------------------------------------ *
 *
 * One per chapter, standing behind its marker. Every other building on the map
 * comes out of the same routine with a different seed, which is fine for a
 * skyline but makes eight very different places — a college in Hyderabad, a
 * design studio in Chandigarh, a state university in upstate New York — read as
 * the same town repeated. These give each chapter something you can recognise
 * from across the map before the label is even legible.
 *
 * All of them are stylised to the map's own language rather than drawn as
 * architectural portraits: flat fills, a shallow overhanging roof, warm palette
 * west of the ocean and cool palette east of it, and windows that light up at
 * night like every other building.
 *
 * Every one of them is kept under ~125px tall. The camera centres the walker
 * and the stage is about 500 world px high, so a taller landmark loses its top
 * — which on the Charminar and the carillon is the whole point of it — exactly
 * when you are standing at its marker reading the chapter.
 */

// Shared bits, so a landmark can never drift out of the world's material set.
function plinth(ctx, p, pal, x, y, w, h, wall, r = 3) {
  ctx.fillStyle = wall
  rr(ctx, x, y, w, h, r)
  ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.14)'
  rr(ctx, x + w * 0.7, y, w * 0.3, h, r)
  ctx.fill()
}

function landmarkShadow(ctx, p, pal, rx) {
  ctx.fillStyle = pal.shadow
  ellipse(ctx, p.x + 6, p.y + 2, rx, rx * 0.3)
  ctx.fill()
}

// Deterministic per-landmark "is anybody in?", so windows never flicker.
function litWindow(ctx, p, pal, x, y, w, h, i, r = 2) {
  const lit = pal.night && cellNoise(i, (p.x * 7) | 0, 313) > 0.32
  ctx.fillStyle = lit ? pal.windowLit : pal.window
  rr(ctx, x, y, w, h, r)
  ctx.fill()
  if (lit) {
    ctx.save()
    ctx.globalAlpha = 0.22
    ctx.fillStyle = pal.windowLit
    rr(ctx, x - 4, y - 4, w + 8, h + 8, r + 2)
    ctx.fill()
    ctx.restore()
  }
}

// 01 · Sri Indu College, Hyderabad — the Charminar, the city's shorthand:
// a square arched base under four minarets.
function drawCharminar(ctx, p, pal) {
  const wall = pal.wallIn
  const roof = pal.roofIn
  landmarkShadow(ctx, p, pal, 62)

  // Back pair of minarets first, so the building overlaps them. Deliberately
  // tall and slender: the four towers over a squat arched base *are* the
  // silhouette, and stubby ones make it just another church.
  for (const s of [-1, 1]) minaret(ctx, p, pal, p.x + s * 36, p.y - 14, 82, wall, roof)

  const baseH = 30
  const bodyH = 34
  plinth(ctx, p, pal, p.x - 52, p.y - baseH, 104, baseH, wall)
  plinth(ctx, p, pal, p.x - 42, p.y - baseH - bodyH, 84, bodyH, wall)

  // Three arches at ground level, two above — the openings are what make it
  // the Charminar rather than a block with a hat on.
  for (let i = 0; i < 3; i++) arch(ctx, p, pal, p.x - 34 + i * 34, p.y - 4, 20, 26, i)
  for (let i = 0; i < 2; i++) arch(ctx, p, pal, p.x - 17 + i * 34, p.y - baseH - 6, 17, 22, i + 3)

  // Cornice between the two storeys and again at the top.
  ctx.fillStyle = roof
  rr(ctx, p.x - 56, p.y - baseH - 7, 112, 8, 2)
  ctx.fill()
  rr(ctx, p.x - 48, p.y - baseH - bodyH - 8, 96, 10, 2)
  ctx.fill()

  for (const s of [-1, 1]) minaret(ctx, p, pal, p.x + s * 46, p.y, 96, wall, roof)
}

function minaret(ctx, p, pal, x, y, h, wall, roof) {
  ctx.fillStyle = wall
  rr(ctx, x - 7, y - h, 14, h, 4)
  ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  rr(ctx, x + 2, y - h, 5, h, 3)
  ctx.fill()
  // Balcony rings up the shaft.
  ctx.fillStyle = roof
  for (const f of [0.42, 0.68]) {
    rr(ctx, x - 9, y - h * f, 18, 4, 2)
    ctx.fill()
  }
  // Onion dome and finial.
  ctx.beginPath()
  ctx.moveTo(x - 9, y - h)
  ctx.quadraticCurveTo(x - 10, y - h - 14, x, y - h - 18)
  ctx.quadraticCurveTo(x + 10, y - h - 14, x + 9, y - h)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(x - 1, y - h - 24, 2, 6)
}

function arch(ctx, p, pal, cx, base, w, h, i) {
  // An archway is a hole you can see through, not a pane of glass — so by day
  // it reads as shadow rather than taking the blue window colour, and at night
  // some of them have a lamp burning inside.
  const lit = pal.night && cellNoise(i, (p.x * 3) | 0, 991) > 0.4
  ctx.fillStyle = lit ? tint(pal.windowLit, 0.85) : pal.night ? 'rgba(0,0,0,0.5)' : 'rgba(40,30,22,0.45)'
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, base)
  ctx.lineTo(cx - w / 2, base - h + w / 2)
  ctx.arc(cx, base - h + w / 2, w / 2, Math.PI, 0)
  ctx.lineTo(cx + w / 2, base)
  ctx.closePath()
  ctx.fill()
}

// 02 · StudyExperts, New Delhi — the India Gate: a single ceremonial arch, the
// one silhouette that says "Delhi" at forty pixels tall.
function drawArchGate(ctx, p, pal) {
  const wall = pal.wallIn
  landmarkShadow(ctx, p, pal, 54)
  const h = 88
  plinth(ctx, p, pal, p.x - 50, p.y - 12, 100, 12, pal.roofAlt, 2)
  plinth(ctx, p, pal, p.x - 42, p.y - h, 84, h - 12, wall, 3)

  // The opening, cut back out of the block.
  arch(ctx, p, pal, p.x, p.y - 12, 40, 62, 1)

  ctx.fillStyle = pal.roofIn
  rr(ctx, p.x - 48, p.y - h - 10, 96, 14, 3)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  rr(ctx, p.x - 48, p.y - h - 10, 96, 4, 2)
  ctx.fill()
  // Shallow dome on the crown.
  ctx.fillStyle = pal.roofIn
  ctx.beginPath()
  ctx.ellipse(p.x, p.y - h - 10, 16, 11, 0, Math.PI, 0)
  ctx.fill()
}

// 03 · Rethink UX, Chandigarh — a flat-roofed studio in Chandigarh's own
// modernist idiom (long glazing band, deep roof slab, no pitch anywhere) with
// a rooftop sign shaped like a browser window. The first draft put the city's
// Open Hand monument here instead, which was a better piece of local colour
// but at forty pixels tall read as a satellite dish; the sign says "this is
// where he built websites" without needing to be recognised.
function drawStudio(ctx, p, pal) {
  landmarkShadow(ctx, p, pal, 56)
  const wallH = 46
  plinth(ctx, p, pal, p.x - 52, p.y - wallH, 92, wallH, pal.wallAlt, 2)

  // A band of glazing rather than punched cottage windows — but in three panes,
  // because one unbroken lit strip reads as a glowing bar, not a shopfront.
  for (let i = 0; i < 3; i++) litWindow(ctx, p, pal, p.x - 44 + i * 26, p.y - wallH + 11, 21, 15, i, 2)

  ctx.fillStyle = pal.roofUs
  rr(ctx, p.x - 58, p.y - wallH - 9, 104, 11, 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.14)'
  rr(ctx, p.x - 58, p.y - wallH - 9, 104, 4, 2)
  ctx.fill()
  ctx.fillStyle = pal.night ? '#2a2118' : '#6b5340'
  rr(ctx, p.x - 10, p.y - 20, 18, 20, 2)
  ctx.fill()

  // Rooftop sign: a browser window on two legs.
  const sx = p.x - 6
  const sy = p.y - wallH - 12
  ctx.fillStyle = pal.stone
  ctx.fillRect(sx - 16, sy - 4, 4, 6)
  ctx.fillRect(sx + 12, sy - 4, 4, 6)
  ctx.fillStyle = pal.roofUs
  rr(ctx, sx - 24, sy - 32, 48, 30, 4)
  ctx.fill()
  ctx.fillStyle = pal.night ? tint(pal.windowLit, 0.9) : '#f4f7fb'
  rr(ctx, sx - 19, sy - 21, 38, 15, 2)
  ctx.fill()
  // Title bar with its three dots — the detail that makes it a browser window
  // rather than a picture frame.
  ctx.fillStyle = pal.accent
  for (let i = 0; i < 3; i++) {
    ellipse(ctx, sx - 17 + i * 6, sy - 26, 1.9, 1.9)
    ctx.fill()
  }
  // A couple of layout bars behind the glass.
  ctx.fillStyle = pal.night ? 'rgba(60,40,10,0.5)' : '#b9c6d8'
  rr(ctx, sx - 16, sy - 18, 14, 9, 1.5)
  ctx.fill()
  rr(ctx, sx + 1, sy - 18, 15, 3, 1)
  ctx.fill()
  rr(ctx, sx + 1, sy - 13, 11, 3, 1)
  ctx.fill()
}

// 04 · Real Craft Tech — the office tower, and 05 the annex next to it. Same
// palette, same crown band, different height: the "invited back to the same
// company" beat, told in buildings.
function corporate(ctx, p, pal, floors) {
  const w = 66
  const floorH = 22
  const h = floors * floorH
  landmarkShadow(ctx, p, pal, 46)
  plinth(ctx, p, pal, p.x - w / 2, p.y - h, w, h, pal.wallAlt, 3)

  for (let r = 0; r < floors; r++) {
    for (let c = 0; c < 3; c++) {
      litWindow(ctx, p, pal, p.x - 24 + c * 17, p.y - h + 7 + r * floorH, 12, 11, r * 3 + c, 1.5)
    }
  }

  // Crown band, with the company's mark on it.
  ctx.fillStyle = pal.roofUs
  rr(ctx, p.x - w / 2 - 5, p.y - h - 13, w + 10, 15, 3)
  ctx.fill()
  ctx.fillStyle = pal.accent
  rr(ctx, p.x - 5, p.y - h - 10, 10, 9, 2)
  ctx.fill()
  ctx.fillStyle = pal.night ? '#2a2118' : '#6b5340'
  rr(ctx, p.x - 8, p.y - 17, 16, 17, 2)
  ctx.fill()
}
const drawTower = (ctx, p, pal) => corporate(ctx, p, pal, 4)
const drawAnnex = (ctx, p, pal) => corporate(ctx, p, pal, 2)

// 07 · University at Albany — a columned podium under a carillon tower, which
// is roughly what the uptown campus actually is, and reads as "university"
// from further away than any amount of window detail would.
function drawCampus(ctx, p, pal) {
  landmarkShadow(ctx, p, pal, 70)
  const wallH = 44
  plinth(ctx, p, pal, p.x - 62, p.y - wallH, 108, wallH, pal.wallAlt, 2)

  // Colonnade across the front.
  ctx.fillStyle = pal.night ? shadeStr(pal.wallAlt, 0.1) : '#ffffff'
  for (let i = 0; i < 6; i++) {
    rr(ctx, p.x - 54 + i * 18, p.y - wallH + 8, 7, wallH - 8, 2)
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  rr(ctx, p.x - 62, p.y - wallH + 4, 108, 5, 2)
  ctx.fill()

  // Pediment.
  ctx.fillStyle = pal.roofUs
  ctx.beginPath()
  ctx.moveTo(p.x - 40, p.y - wallH - 2)
  ctx.lineTo(p.x - 8, p.y - wallH - 24)
  ctx.lineTo(p.x + 24, p.y - wallH - 2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = pal.roofUs
  rr(ctx, p.x - 66, p.y - wallH - 8, 116, 9, 2)
  ctx.fill()

  // Carillon tower.
  const tx = p.x + 54
  plinth(ctx, p, pal, tx - 13, p.y - 104, 26, 104, pal.wallAlt, 2)
  // Paired slot windows up the shaft. Single wide ones stacked at this scale
  // read as a traffic light rather than a tower.
  for (let i = 0; i < 3; i++) {
    litWindow(ctx, p, pal, tx - 8, p.y - 92 + i * 24, 5, 12, 40 + i * 2, 1.5)
    litWindow(ctx, p, pal, tx + 3, p.y - 92 + i * 24, 5, 12, 41 + i * 2, 1.5)
  }
  // Belfry louvres, just under the cap.
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  rr(ctx, tx - 9, p.y - 112, 18, 12, 2)
  ctx.fill()
  ctx.fillStyle = pal.roofUs
  rr(ctx, tx - 17, p.y - 116, 34, 14, 2)
  ctx.fill()
  ctx.fillStyle = pal.night ? pal.windowLit : '#ffffff'
  ellipse(ctx, tx, p.y - 20, 7, 7)
  ctx.fill()
  ctx.strokeStyle = pal.roofUs
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(tx, p.y - 20)
  ctx.lineTo(tx, p.y - 24)
  ctx.moveTo(tx, p.y - 20)
  ctx.lineTo(tx + 4, p.y - 20)
  ctx.stroke()
}

// 08 · You Are Here — not an institution: a house with the lights on, a
// mailbox, and a flag. The only building on the map that is simply somewhere
// to live.
function drawHome(ctx, p, pal) {
  landmarkShadow(ctx, p, pal, 48)
  const wallH = 42
  plinth(ctx, p, pal, p.x - 40, p.y - wallH, 80, wallH, pal.wallUs, 2)

  ctx.fillStyle = pal.roofUs
  ctx.beginPath()
  ctx.moveTo(p.x - 50, p.y - wallH + 2)
  ctx.lineTo(p.x, p.y - wallH - 32)
  ctx.lineTo(p.x + 50, p.y - wallH + 2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.moveTo(p.x - 50, p.y - wallH + 2)
  ctx.lineTo(p.x, p.y - wallH - 32)
  ctx.lineTo(p.x - 4, p.y - wallH - 32)
  ctx.lineTo(p.x - 54, p.y - wallH + 2)
  ctx.closePath()
  ctx.fill()

  // Chimney.
  ctx.fillStyle = pal.roofAlt
  rr(ctx, p.x + 22, p.y - wallH - 30, 12, 24, 2)
  ctx.fill()

  litWindow(ctx, p, pal, p.x - 30, p.y - wallH + 10, 18, 15, 1, 2)
  litWindow(ctx, p, pal, p.x + 12, p.y - wallH + 10, 18, 15, 2, 2)
  ctx.fillStyle = pal.night ? '#2a2118' : '#6b5340'
  rr(ctx, p.x - 8, p.y - 22, 17, 22, 2)
  ctx.fill()
  ctx.fillStyle = pal.night ? pal.windowLit : '#cfd8e4'
  ellipse(ctx, p.x + 6, p.y - 12, 1.8, 1.8)
  ctx.fill()

  // Flag: the one place the site's accent colour flies on the map.
  const fx = p.x + 52
  ctx.strokeStyle = pal.stone
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(fx, p.y)
  ctx.lineTo(fx, p.y - 62)
  ctx.stroke()
  ctx.fillStyle = pal.accent
  ctx.beginPath()
  ctx.moveTo(fx, p.y - 62)
  ctx.lineTo(fx + 26, p.y - 55)
  ctx.lineTo(fx, p.y - 46)
  ctx.closePath()
  ctx.fill()
}

// 06 · The Crossing — no ground, no town, so the landmark stands on the bridge:
// a signpost with one arm pointing back and one pointing on.
function drawSignpost(ctx, p, pal) {
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ellipse(ctx, p.x + 3, p.y + 1, 9, 3.4)
  ctx.fill()
  ctx.fillStyle = pal.rail
  rr(ctx, p.x - 3, p.y - 60, 6, 60, 2)
  ctx.fill()
  for (const [dy, dir] of [[-52, 1], [-36, -1]]) {
    ctx.save()
    ctx.translate(p.x, p.y + dy)
    ctx.scale(dir, 1)
    ctx.fillStyle = pal.deck
    ctx.beginPath()
    ctx.moveTo(0, -6)
    ctx.lineTo(24, -6)
    ctx.lineTo(32, 0)
    ctx.lineTo(24, 6)
    ctx.lineTo(0, 6)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = pal.rail
    ctx.lineWidth = 1.6
    ctx.stroke()
    ctx.restore()
  }
}

const LANDMARKS = {
  charminar: drawCharminar,
  archgate: drawArchGate,
  studio: drawStudio,
  tower: drawTower,
  annex: drawAnnex,
  campus: drawCampus,
  home: drawHome,
  signpost: drawSignpost,
}

const shadeStr = (c, t) => rgb(shade(hex(c), t))

/* ------------------------------------------------------------------ *
 * Chapter markers
 * ------------------------------------------------------------------ */

const ICONS = {
  school: new Path2D('M2 8 12 3l10 5-10 5L2 8Zm4 4v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5'),
  work: new Path2D('M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Zm5-2V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18'),
  travel: new Path2D('M2 13l20-7-7 20-3-8-8-3-2-2Z'),
  // A star, not another map pin — the marker is already pin-shaped, and the
  // two shapes nested inside each other read as one blue blob at sprite size.
  now: new Path2D('M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z'),
}
const CHECK = new Path2D('M4 12.5 9.5 18 20 6')

/** The ring painted on the ground under a marker — drawn beneath the props. */
export function drawMarkerPad(ctx, p, { found, near }, pal, t) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.0026)
  const rx = 66
  const ry = 26

  const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, rx)
  g.addColorStop(0, tint(pal.accent, found ? 0.3 : 0.2))
  g.addColorStop(1, tint(pal.accent, 0))
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.scale(1, ry / rx)
  ctx.translate(-p.x, -p.y)
  ctx.fillStyle = g
  ellipse(ctx, p.x, p.y, rx, rx)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = found ? pal.accent : pal.labelEdge
  ctx.globalAlpha = found ? 0.85 : 0.6
  ctx.lineWidth = 2.4
  ctx.setLineDash([9, 9])
  ctx.lineDashOffset = -t * 0.012
  ellipse(ctx, p.x, p.y, rx * 0.86, ry * 0.86)
  ctx.stroke()
  if (near) {
    // One expanding ring, restarting every beat: the "you can interact" tell.
    ctx.setLineDash([])
    ctx.globalAlpha = (1 - pulse) * 0.8
    ctx.strokeStyle = pal.accent
    ctx.lineWidth = 3
    ellipse(ctx, p.x, p.y, rx * (0.6 + pulse * 0.55), ry * (0.6 + pulse * 0.55))
    ctx.stroke()
  }
  ctx.restore()
}

/** The pin itself — y-sorted with the props, so the walker can stand in front. */
export function drawMarkerPin(ctx, p, { found, near }, pal, t) {
  const bob = Math.sin(t * 0.0028 + p.x * 0.01) * 3
  const scale = near ? 1.16 : 1
  const h = 56

  // Undiscovered chapters throw a soft beam, which is what makes an unexplored
  // corner of the map visible from a distance.
  if (!found) {
    const g = ctx.createLinearGradient(p.x, p.y - 300, p.x, p.y)
    g.addColorStop(0, tint(pal.accent, 0))
    g.addColorStop(0.72, tint(pal.accent, pal.night ? 0.2 : 0.13))
    // Fades back out over the last stretch: run it at full strength all the way
    // down and it washes over the pin it is meant to be advertising.
    g.addColorStop(1, tint(pal.accent, 0.04))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(p.x - 12, p.y)
    ctx.lineTo(p.x - 36, p.y - 300)
    ctx.lineTo(p.x + 36, p.y - 300)
    ctx.lineTo(p.x + 12, p.y)
    ctx.closePath()
    ctx.fill()
  }

  ctx.save()
  ctx.fillStyle = pal.shadow
  ellipse(ctx, p.x + 2, p.y + 1, 11, 4.5)
  ctx.fill()

  ctx.translate(p.x, p.y + bob)
  ctx.scale(scale, scale)

  // Teardrop: a circle with a point dropped to the ground.
  const r = 17
  const cy = -h + r
  ctx.beginPath()
  ctx.moveTo(0, -bob)
  ctx.quadraticCurveTo(-r * 0.62, cy + r * 0.72, -r * 0.86, cy + r * 0.3)
  ctx.arc(0, cy, r, Math.PI * 0.82, Math.PI * 0.18, false)
  ctx.quadraticCurveTo(r * 0.62, cy + r * 0.72, 0, -bob)
  ctx.closePath()
  ctx.fillStyle = found ? pal.accent : pal.pinIdle
  ctx.fill()
  ctx.lineWidth = 2.4
  ctx.strokeStyle = found ? tint(pal.accent, 0.9) : pal.accent
  ctx.stroke()

  ctx.save()
  ctx.translate(0, cy)
  const k = 0.94
  ctx.scale(k, k)
  ctx.translate(-12, -12)
  ctx.strokeStyle = found ? '#ffffff' : pal.accent
  ctx.lineWidth = 2 / k
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke(ICONS[p.kind] || ICONS.work)
  ctx.restore()

  if (found) {
    ctx.fillStyle = pal.accent
    ellipse(ctx, r * 0.78, cy - r * 0.72, 8.5, 8.5)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.6
    ctx.save()
    ctx.translate(r * 0.78 - 5.5, cy - r * 0.72 - 5.5)
    ctx.scale(0.46, 0.46)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke(CHECK)
    ctx.restore()
  }
  ctx.restore()
}

function tint(color, alpha) {
  const c = hex(color)
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`
}
export { tint }

/* ------------------------------------------------------------------ *
 * The character
 * ------------------------------------------------------------------ */

// The sprite is public/walker.png, used exactly as drawn. The walk cycle moves
// the whole body — a two-beat bounce with squash and a degree and a half of
// rock either side of vertical — and never touches a limb, because the stride
// is already in the pose.
export function drawWalker(ctx, w, pal) {
  const { x, y, face, phase, moving, img } = w
  const H = 104
  const aspect = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.42
  const W = H * aspect

  const beat = moving ? Math.abs(Math.sin(phase * Math.PI * 2)) : 0
  const lift = moving ? beat * 3.6 : Math.sin(phase * Math.PI * 2) * 0.8
  const rock = moving ? Math.cos(phase * Math.PI * 2) * 0.026 : 0
  const squash = moving ? 1 - (1 - beat) * 0.022 : 1

  // The shadow runs counter-phase — tight and dark on the footfall, wide and
  // faint at the top of the bounce. It is what sells the bounce as weight.
  ctx.save()
  ctx.fillStyle = pal.shadow
  const sk = moving ? 1 - beat * 0.18 : 1
  ellipse(ctx, x + 2, y + 1, 21 * sk, 7.4 * sk)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.translate(x, y - lift)
  ctx.rotate(rock * face)
  ctx.scale(face, 1)
  ctx.scale(1 / squash, squash)
  if (img && img.complete && img.naturalWidth) {
    ctx.drawImage(img, -W / 2, -H, W, H)
  } else {
    // Only ever seen if walker.png fails to load — a neutral stand-in so the
    // map is still playable rather than empty.
    ctx.fillStyle = pal.accent
    rr(ctx, -13, -H * 0.72, 26, H * 0.72, 10)
    ctx.fill()
    ctx.fillStyle = '#c98d5a'
    ellipse(ctx, 0, -H * 0.82, 12, 13)
    ctx.fill()
  }
  ctx.restore()
}

/* ------------------------------------------------------------------ *
 * Weather and particles
 * ------------------------------------------------------------------ */

/** Slow cloud shadows drifting over the whole world. Cheap, and it makes a
 *  static map feel like a place with a sky over it. */
export function drawClouds(ctx, clouds, view, pal) {
  ctx.save()
  ctx.fillStyle = pal.cloud
  for (const c of clouds) {
    if (c.x + c.r < view.x || c.x - c.r > view.x + view.w) continue
    if (c.y + c.r * 0.6 < view.y || c.y - c.r * 0.6 > view.y + view.h) continue
    const g = ctx.createRadialGradient(c.x, c.y, c.r * 0.2, c.x, c.y, c.r)
    g.addColorStop(0, pal.cloud)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ellipse(ctx, c.x, c.y, c.r, c.r * 0.62)
    ctx.fill()
  }
  ctx.restore()
}

export function drawSparkles(ctx, list, view, pal, t) {
  ctx.save()
  ctx.strokeStyle = pal.foam
  ctx.lineCap = 'round'
  ctx.lineWidth = 2
  for (const s of list) {
    if (s.x < view.x - 20 || s.x > view.x + view.w + 20) continue
    if (s.y < view.y - 20 || s.y > view.y + view.h + 20) continue
    const a = Math.sin(t * 0.0021 + s.ph)
    if (a <= 0) continue
    ctx.globalAlpha = a * (pal.night ? 0.22 : 0.5)
    ctx.beginPath()
    ctx.moveTo(s.x - s.len / 2, s.y)
    ctx.lineTo(s.x + s.len / 2, s.y)
    ctx.stroke()
  }
  ctx.restore()
}

export function drawDust(ctx, particles, pal) {
  ctx.save()
  for (const d of particles) {
    const life = d.t / d.life
    ctx.globalAlpha = (1 - life) * 0.5
    ctx.fillStyle = pal.night ? '#8fa0b8' : '#ffffff'
    ellipse(ctx, d.x, d.y, d.r * (1 + life * 1.4), d.r * 0.6 * (1 + life * 1.4))
    ctx.fill()
  }
  ctx.restore()
}

export function drawBirds(ctx, birds, view, pal, t) {
  ctx.save()
  ctx.strokeStyle = pal.night ? 'rgba(200,215,240,0.5)' : 'rgba(40,60,85,0.5)'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  for (const b of birds) {
    if (b.x < view.x - 40 || b.x > view.x + view.w + 40) continue
    if (b.y < view.y - 40 || b.y > view.y + view.h + 40) continue
    const flap = Math.sin(t * 0.011 + b.ph) * 4
    ctx.beginPath()
    ctx.moveTo(b.x - 8, b.y + flap)
    ctx.quadraticCurveTo(b.x - 4, b.y - 2, b.x, b.y)
    ctx.quadraticCurveTo(b.x + 4, b.y - 2, b.x + 8, b.y + flap)
    ctx.stroke()
  }
  ctx.restore()
}
