// Procedural generation for the Journey world.
//
// Replaces the old approach — one big illustrated JPEG plus a land/water mask
// baked out of its pixels — with a world that is *grown* at module load. A
// handful of overlapping circles ("blobs") define the two landmasses, a seeded
// value-noise field roughs up the coastline so it never looks like a union of
// circles, and everything else (beaches, shallows, forest, meadow, rock, town
// squares, roads) is derived from that. The same grid is the collision map, so
// what you can walk on is exactly what you can see.
//
// The whole pass is ~9,400 cells of arithmetic: about a millisecond, once.
//
// Nothing here knows about colour or canvases — see journeyPaint.js.

import { WORLD, TILE, PLACES, ROADS, SPAWN, PLAZA_R } from '../data/journey.js'

export const GW = Math.ceil(WORLD.w / TILE)
export const GH = Math.ceil(WORLD.h / TILE)

// Terrain ids. Ordered roughly wettest → driest → built, which makes the
// "is this land" and "is this natural" tests simple range checks.
export const T = {
  DEEP: 0,
  WATER: 1,
  SHALLOW: 2,
  SAND: 3,
  GRASS: 4,
  MEADOW: 5,
  FOREST: 6,
  ROCK: 7,
  PLAZA: 8,
  ROAD: 9,
  BRIDGE: 10,
}

const isWater = (t) => t <= T.SHALLOW

/* ------------------------------------------------------------------ *
 * Seeded noise
 * ------------------------------------------------------------------ */

// Integer hash → [0, 1). Deterministic across browsers (no Math.random), so
// every visitor gets the same island and the same forests.
function hash2(x, y, seed) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1274126177)
  h = (h ^ (h >>> 13)) | 0
  h = Math.imul(h, 1274126177)
  h = (h ^ (h >>> 16)) >>> 0
  return h / 4294967296
}

function vnoise(x, y, seed) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi, seed)
  const b = hash2(xi + 1, yi, seed)
  const c = hash2(xi, yi + 1, seed)
  const d = hash2(xi + 1, yi + 1, seed)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

function fbm(x, y, seed, octaves = 4) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise(x * freq, y * freq, seed + i * 101)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}

// Small xorshift for prop scattering, so consuming randomness in one pass can
// never shift the terrain in another.
function rng(seed) {
  let s = (seed | 0) || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

/* ------------------------------------------------------------------ *
 * Landmasses
 * ------------------------------------------------------------------ */

// [x, y, radius]. India-side continent (bottom-left through top-centre), the
// American side (right), and four islets in the strait so the crossing reads as
// an archipelago rather than a void.
const LAND_IN = [
  [250, 1300, 290], [470, 1200, 240], [300, 1010, 250], [300, 780, 250],
  [430, 560, 230], [600, 330, 250], [860, 300, 240], [980, 480, 220],
  [900, 700, 230], [900, 850, 180], [730, 1010, 250], [150, 950, 170],
  [700, 620, 190],
]
const LAND_US = [
  [1600, 820, 230], [1780, 640, 250], [1980, 560, 240], [2120, 360, 230],
  [2260, 560, 200], [2020, 800, 240], [1820, 1010, 240], [2080, 1120, 220],
  [2230, 900, 180], [1640, 1120, 180],
]
const ISLETS = [
  [1180, 620, 78], [1272, 1162, 92], [1118, 1030, 56], [1338, 372, 66],
]

const ALL_BLOBS = [...LAND_IN, ...LAND_US, ...ISLETS]

// Falloff of the blob field: 1 at a blob's centre, 0 at its rim. Taking the max
// (rather than a sum) keeps small islets from being swallowed by a neighbour.
function landField(x, y) {
  let best = 0
  for (let i = 0; i < ALL_BLOBS.length; i++) {
    const b = ALL_BLOBS[i]
    const dx = x - b[0]
    const dy = y - b[1]
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < b[2]) {
      const f = 1 - d / b[2]
      if (f > best) best = f
    }
  }
  return best
}

/* ------------------------------------------------------------------ *
 * The grid
 * ------------------------------------------------------------------ */

const terrain = new Uint8Array(GW * GH)
const walk = new Uint8Array(GW * GH)

// Pass 1 — land or sea, roughened by noise so the coast wanders.
{
  for (let gy = 0; gy < GH; gy++) {
    for (let gx = 0; gx < GW; gx++) {
      const x = gx * TILE + TILE / 2
      const y = gy * TILE + TILE / 2
      const f = landField(x, y)
      const n = fbm(gx / 9, gy / 9, 7)
      terrain[gy * GW + gx] = f + 0.3 * (n - 0.5) > 0.12 ? T.GRASS : T.DEEP
    }
  }
}

// Pass 2 — distance to the opposite element, in cells, capped at 4. Gives
// beaches on the land side and shallows on the water side in one sweep.
{
  const src = terrain.slice()
  const R = 4
  for (let gy = 0; gy < GH; gy++) {
    for (let gx = 0; gx < GW; gx++) {
      const i = gy * GW + gx
      const land = src[i] !== T.DEEP
      let near = R + 1
      for (let dy = -R; dy <= R; dy++) {
        const yy = gy + dy
        if (yy < 0 || yy >= GH) continue
        for (let dx = -R; dx <= R; dx++) {
          const xx = gx + dx
          if (xx < 0 || xx >= GW) continue
          const other = src[yy * GW + xx] !== T.DEEP
          if (other === land) continue
          const d = Math.max(Math.abs(dx), Math.abs(dy))
          if (d < near) near = d
        }
      }
      if (land) {
        terrain[i] = near <= 1 ? T.SAND : T.GRASS
      } else {
        terrain[i] = near <= 1 ? T.SHALLOW : near <= 3 ? T.WATER : T.DEEP
      }
    }
  }
}

// Pass 3 — biomes on the grassland: forest where the vegetation field peaks,
// bare rock on the high ridges, meadow in between.
{
  for (let gy = 0; gy < GH; gy++) {
    for (let gx = 0; gx < GW; gx++) {
      const i = gy * GW + gx
      if (terrain[i] !== T.GRASS) continue
      const veg = fbm(gx / 6.5, gy / 6.5, 311)
      const ridge = fbm(gx / 5, gy / 5, 907)
      if (ridge > 0.72) terrain[i] = T.ROCK
      else if (veg > 0.585) terrain[i] = T.FOREST
      else if (veg > 0.5) terrain[i] = T.MEADOW
    }
  }
}

// Pass 4 — a paved square under every chapter, so each marker sits somewhere
// that reads as built rather than dropped in a field. Also guarantees the
// marker itself is standable even if the noise carved a lake underneath it.
for (const p of PLACES) {
  if (p.kind === 'travel') continue // the crossing's "square" is the bridge deck
  stampDisc(p.x, p.y, PLAZA_R, T.PLAZA)
}

function stampDisc(cx, cy, r, kind) {
  const g0x = Math.max(0, Math.floor((cx - r) / TILE))
  const g1x = Math.min(GW - 1, Math.floor((cx + r) / TILE))
  const g0y = Math.max(0, Math.floor((cy - r) / TILE))
  const g1y = Math.min(GH - 1, Math.floor((cy + r) / TILE))
  for (let gy = g0y; gy <= g1y; gy++) {
    for (let gx = g0x; gx <= g1x; gx++) {
      const dx = gx * TILE + TILE / 2 - cx
      const dy = gy * TILE + TILE / 2 - cy
      if (dx * dx + dy * dy <= r * r) terrain[gy * GW + gx] = kind
    }
  }
}

// Pass 5 — roads. Rasterised as capsules along each polyline so the collision
// grid and the painted road agree; the bridge overwrites water, everything
// else only paves natural ground.
const ROAD_HALF = 21
const BRIDGE_HALF = 27

for (const road of ROADS) {
  const half = road.bridge ? BRIDGE_HALF : ROAD_HALF
  const kind = road.bridge ? T.BRIDGE : T.ROAD
  for (let s = 0; s < road.pts.length - 1; s++) {
    const [x0, y0] = road.pts[s]
    const [x1, y1] = road.pts[s + 1]
    const len = Math.hypot(x1 - x0, y1 - y0)
    const steps = Math.max(1, Math.ceil(len / (TILE / 2)))
    for (let k = 0; k <= steps; k++) {
      const t = k / steps
      stampRoad(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, half, kind)
    }
  }
}

function stampRoad(cx, cy, r, kind) {
  const g0x = Math.max(0, Math.floor((cx - r) / TILE))
  const g1x = Math.min(GW - 1, Math.floor((cx + r) / TILE))
  const g0y = Math.max(0, Math.floor((cy - r) / TILE))
  const g1y = Math.min(GH - 1, Math.floor((cy + r) / TILE))
  for (let gy = g0y; gy <= g1y; gy++) {
    for (let gx = g0x; gx <= g1x; gx++) {
      const i = gy * GW + gx
      const dx = gx * TILE + TILE / 2 - cx
      const dy = gy * TILE + TILE / 2 - cy
      if (dx * dx + dy * dy > r * r) continue
      // A road never turns water into land — only the bridge does that.
      if (kind === T.ROAD && isWater(terrain[i])) continue
      terrain[i] = kind
    }
  }
}

// Pass 6 — collision. Everything that isn't open water can be walked on.
for (let i = 0; i < terrain.length; i++) walk[i] = isWater(terrain[i]) ? 0 : 1

/* ------------------------------------------------------------------ *
 * Props
 * ------------------------------------------------------------------ */

// Decoration is generated once and kept in a flat list sorted by y, so the
// renderer can binary-search the visible band and draw props interleaved with
// the character for correct front-to-back overlap.
//
// `s` is a per-prop random in [0,1) that the painter uses for size, tilt and
// palette variation — baked in here so a prop never shimmers between frames.

/** @type {{x:number,y:number,type:string,s:number,r:number,region:string}[]} */
export const props = []

const rand = rng(20240817)

// World x where the story crosses the ocean. Everything west of it is the
// Indian half — warmer greens, sandstone towns; everything east is the Hudson
// valley — cooler greens, brick, and trees that turn in autumn.
export const REGION_SPLIT = 1300
const regionAt = (x) => (x < REGION_SPLIT ? 'in' : 'us')

// Keep props off the paths and out of the chapter squares' inner circle, so
// nothing ever hides a marker or blocks the road.
function clearOfPlaces(x, y, pad) {
  for (const p of PLACES) {
    if ((p.x - x) ** 2 + (p.y - y) ** 2 < (NEAR_PAD + pad) ** 2) return false
  }
  return true
}
const NEAR_PAD = 108

for (let gy = 1; gy < GH - 1; gy++) {
  for (let gx = 1; gx < GW - 1; gx++) {
    const t = terrain[gy * GW + gx]
    if (t === T.ROAD || t === T.BRIDGE || t === T.PLAZA || isWater(t)) continue

    let chance = 0
    if (t === T.FOREST) chance = 0.42
    else if (t === T.MEADOW) chance = 0.09
    else if (t === T.GRASS) chance = 0.05
    else if (t === T.ROCK) chance = 0.14
    else if (t === T.SAND) chance = 0.035
    if (rand() > chance) continue

    // Jitter inside the cell so nothing betrays the grid.
    const x = gx * TILE + rand() * TILE
    const y = gy * TILE + rand() * TILE
    if (!clearOfPlaces(x, y, -34)) continue
    if (nextToPath(gx, gy)) continue

    const region = regionAt(x)
    let type
    if (t === T.SAND) type = rand() < 0.45 ? 'palm' : 'rock'
    else if (t === T.ROCK) type = rand() < 0.7 ? 'rock' : 'pine'
    else if (t === T.FOREST) type = rand() < 0.34 ? 'pine' : 'tree'
    else type = rand() < 0.42 ? 'bush' : rand() < 0.8 ? 'tree' : 'flowers'

    props.push({ x, y, type, s: rand(), r: 0, region })
  }
}

// One cell of breathing room around anything paved, so trees never crowd the
// road edge or grow out of the kerb.
function nextToPath(gx, gy) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const t = terrain[(gy + dy) * GW + (gx + dx)]
      if (t === T.ROAD || t === T.BRIDGE || t === T.PLAZA) return true
    }
  }
  return false
}

// Towns: one landmark per chapter, plus a ring of ordinary buildings around
// the square. Footprints are punched out of the collision grid — you walk
// between the buildings, not through them.
//
// The landmark is placed deliberately rather than dropped in the ring: north
// and a little west of the marker, so it stands *behind* the pin in the depth
// sort and never hides it, and so it is the first thing in frame as you walk
// up the road into town. Each one is drawn differently — see LANDMARKS in
// journeyPaint.js — because "a place I studied" and "a place I worked, twice"
// deserve to be recognisable from across the map, not eight identical blocks.
//
// The vertical offset is fixed because the constraint is a screen one: the
// camera keeps the walker centred, and the stage is ~500 world px tall, so
// anything more than ~250px above the walker is off the top of the frame. At
// 118 up, a landmark of up to ~125px still fits entirely on screen while you
// are standing at its marker. Landmark art is capped to match — see the height
// notes in journeyPaint.js.
//
// The horizontal offset has to be searched for, because it depends on the road.
// Chandigarh's road leaves its square heading east and Hyderabad's heads due
// north, so a single hard-coded offset that looks right at one chapter drops a
// building straight onto the highway at another.
const LANDMARK_DY = -118
// Ordered by preference: the classic just-north-west spot first, then further
// out to either side.
const LANDMARK_DX = [-62, -96, -132, 50, 86, 122, -168, 158, -20, 14]

for (const p of PLACES) {
  if (p.kind === 'travel') continue
  const r2 = rng(p.x * 31 + p.y * 17)

  const spot = landmarkSpot(p)
  props.push({ x: spot.x, y: spot.y, type: p.landmark, s: 0.5, r: 0, region: p.region })
  blockBox(spot.x, spot.y, 46, 14)

  const count = p.kind === 'now' ? 5 : 8
  for (let i = 0; i < count; i++) {
    // Spread around the circle with jitter rather than at fixed angles.
    const a = ((i + r2() * 0.7) / count) * Math.PI * 2
    const rad = PLAZA_R + 22 + r2() * 74
    const x = p.x + Math.cos(a) * rad
    const y = p.y + Math.sin(a) * rad * 0.86
    if (x < 40 || y < 40 || x > WORLD.w - 40 || y > WORLD.h - 40) continue
    // Leave the landmark room to breathe.
    if ((x - spot.x) ** 2 + (y - spot.y) ** 2 < 118 ** 2) continue
    // A house is only ~50px tall, but it still must not be drawn sitting in the
    // carriageway — same test as the landmark, smaller box.
    if (!buildable(x, y, 24, 52, 10)) continue
    props.push({ x, y, type: 'building', s: r2(), r: 0, region: p.region })
    // Footprint is narrower than the drawn building: the roof overhangs, and
    // clipping the collision box to the walls keeps doorways reachable.
    blockBox(x, y, 22, 12)
  }
}

// True when nothing in the band a building will *occupy on screen* is paved or
// wet. Testing only the cell the building stands in is not enough: a landmark
// is up to 125px tall, so its base can sit politely beside the road while its
// minarets are painted straight across it.
function buildable(cx, cy, halfW, up, down) {
  const g0x = Math.max(0, Math.floor((cx - halfW) / TILE))
  const g1x = Math.min(GW - 1, Math.floor((cx + halfW) / TILE))
  const g0y = Math.max(0, Math.floor((cy - up) / TILE))
  const g1y = Math.min(GH - 1, Math.floor((cy + down) / TILE))
  if (cx - halfW < 20 || cx + halfW > WORLD.w - 20 || cy - up < 20) return false
  for (let gy = g0y; gy <= g1y; gy++) {
    for (let gx = g0x; gx <= g1x; gx++) {
      const t = terrain[gy * GW + gx]
      if (t === T.ROAD || t === T.BRIDGE || isWater(t)) return false
    }
  }
  return true
}

function landmarkSpot(p) {
  for (const dy of [LANDMARK_DY, LANDMARK_DY + 20, LANDMARK_DY - 20]) {
    for (const dx of LANDMARK_DX) {
      if (buildable(p.x + dx, p.y + dy, 64, 126, 18)) return { x: p.x + dx, y: p.y + dy }
    }
  }
  // Nowhere clean: take the preferred spot rather than dropping the landmark,
  // and say so, because it means the road layout has moved under this code.
  if (import.meta.env?.DEV) console.warn(`[journey] no clear landmark spot for ${p.id}`)
  return { x: p.x + LANDMARK_DX[0], y: p.y + LANDMARK_DY }
}

// The crossing has no town and no ground to build on, so its landmark stands on
// the bridge deck itself: a signpost, one arm back the way you came and one
// pointing on. Deliberately not blocked — the deck is only so wide.
{
  const crossing = PLACES.find((p) => p.kind === 'travel')
  if (crossing) props.push({ x: crossing.x - 76, y: crossing.y - 4, type: 'signpost', s: 0.5, r: 0, region: 'sea' })
}

function blockBox(cx, cy, halfW, halfH) {
  const g0x = Math.max(0, Math.floor((cx - halfW) / TILE))
  const g1x = Math.min(GW - 1, Math.floor((cx + halfW) / TILE))
  const g0y = Math.max(0, Math.floor((cy - halfH) / TILE))
  const g1y = Math.min(GH - 1, Math.floor((cy + halfH) / TILE))
  for (let gy = g0y; gy <= g1y; gy++) {
    for (let gx = g0x; gx <= g1x; gx++) {
      // Paving, and the one cell of verge either side of it, is never blocked.
      // A building is seeded off the road, but its footprint is wider than the
      // cell it was seeded in and would otherwise spill onto the kerb — enough,
      // in a few places, to pinch the road narrower than the character and
      // strand the player short of a chapter.
      if (nextToPath(gx, gy)) continue
      walk[gy * GW + gx] = 0
    }
  }
}

// Lamp posts down both sides of the road. They are what makes the dark theme
// worth looking at — each one throws a warm pool of light on the tarmac.
export const lamps = []
for (const road of ROADS) {
  if (road.bridge) continue
  let carry = 0
  let side = 1
  for (let s = 0; s < road.pts.length - 1; s++) {
    const [x0, y0] = road.pts[s]
    const [x1, y1] = road.pts[s + 1]
    const len = Math.hypot(x1 - x0, y1 - y0)
    const nx = -(y1 - y0) / len
    const ny = (x1 - x0) / len
    for (let d = carry; d < len; d += 190) {
      const t = d / len
      lamps.push({
        x: x0 + (x1 - x0) * t + nx * side * (ROAD_HALF + 8),
        y: y0 + (y1 - y0) * t + ny * side * (ROAD_HALF + 8),
      })
      side = -side
    }
    carry = (carry - len) % 190
    if (carry < 0) carry += 190
  }
}
for (const l of lamps) props.push({ x: l.x, y: l.y, type: 'lamp', s: 0.5, r: 0, region: regionAt(l.x) })

// A few moored boats in the shallows, and buoys marking the crossing — small
// pieces of storytelling in the one part of the map with no ground to stand on.
{
  const r3 = rng(5150)
  const boats = []
  let tries = 0
  while (boats.length < 7 && tries < 900) {
    tries++
    const gx = 1 + Math.floor(r3() * (GW - 2))
    const gy = 1 + Math.floor(r3() * (GH - 2))
    if (terrain[gy * GW + gx] !== T.SHALLOW) continue
    const x = gx * TILE + TILE / 2
    const y = gy * TILE + TILE / 2
    if (boats.some((q) => (q.x - x) ** 2 + (q.y - y) ** 2 < 300 ** 2)) continue
    const boat = { x, y, type: 'boat', s: r3(), r: 0, region: regionAt(x) }
    boats.push(boat)
    props.push(boat)
  }
}

props.sort((a, b) => a.y - b.y)

// Index of the first prop at or after a given world y — lets the renderer skip
// straight to the visible band instead of scanning ~1,500 props every frame.
export function propIndexAtY(y) {
  let lo = 0
  let hi = props.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (props[mid].y < y) lo = mid + 1
    else hi = mid
  }
  return lo
}

/* ------------------------------------------------------------------ *
 * Public queries
 * ------------------------------------------------------------------ */

export function terrainAt(x, y) {
  const gx = Math.floor(x / TILE)
  const gy = Math.floor(y / TILE)
  if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) return T.DEEP
  return terrain[gy * GW + gx]
}

export function isWalkable(x, y) {
  const gx = Math.floor(x / TILE)
  const gy = Math.floor(y / TILE)
  if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) return false
  return walk[gy * GW + gx] === 1
}

export { terrain, walk }

// Water sparkles: a fixed scatter of twinkle positions on open water, so the
// sea reads as moving without repainting it. Phase is baked so each one
// twinkles on its own beat.
export const sparkles = []
{
  const r4 = rng(90210)
  for (let i = 0; i < 520; i++) {
    const x = r4() * WORLD.w
    const y = r4() * WORLD.h
    const t = terrainAt(x, y)
    if (t !== T.DEEP && t !== T.WATER) continue
    sparkles.push({ x, y, ph: r4() * Math.PI * 2, len: 5 + r4() * 9 })
  }
}

// Sanity net for future edits: if a chapter ever ends up in the sea, say so in
// the console rather than silently stranding it.
if (import.meta.env?.DEV) {
  for (const p of PLACES) {
    if (!isWalkable(p.x, p.y)) console.warn(`[journey] chapter ${p.chapter} (${p.id}) is not standable`)
  }
  if (!isWalkable(SPAWN.x, SPAWN.y)) console.warn('[journey] SPAWN is not standable')
}
