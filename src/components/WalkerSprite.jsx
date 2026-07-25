import { useState } from 'react'

// The playable character.
//
// Preferred art is the walking vector illustration at WALKER_SRC — used exactly
// as drawn, no rigging. JourneyMap animates it as one rigid body: a two-beat
// bounce with a little squash and lean (.jw-walker.is-walking .wk), flipped with
// scaleX to walk left. Nothing here moves a limb.
//
// If that file is not present the drawn figure below stands in, so the map never
// renders a broken image. Same character, same palette — navy suit with a cream
// rim light, light-blue shirt, brown oxfords, glasses, short beard.

const WALKER_SRC = '/walker.png'

export default function WalkerSprite({ className = '' }) {
  const [missing, setMissing] = useState(false)

  if (!missing) {
    return (
      <img
        className={`wk wk--art ${className}`}
        src={WALKER_SRC}
        alt=""
        draggable="false"
        onError={() => setMissing(true)}
      />
    )
  }

  return <DrawnWalker className={className} />
}

const JACKET = '#3c5170'
const JACKET_HI = '#4a6690'
const JACKET_LO = '#2e4060'
const TROUSER = '#364a67'
const TROUSER_LO = '#2b3c56'
const SHIRT = '#dbe9f7'
const SHIRT_LO = '#bed3e9'
const SKIN = '#c98d5a'
const SKIN_LO = '#ac6f3c'
const HAIR = '#241a13'
const HAIR_HI = '#3d2c1d'
const BEARD = '#31231a'
const FRAME = '#d8bd95'
const SHOE = '#8d5a2c'
const SHOE_LO = '#6b4220'
const SOLE = '#33200f'
const RIM = '#eccfa4'

function DrawnWalker({ className }) {
  return (
    <svg
      className={`wk ${className}`}
      viewBox="0 0 130 210"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Trailing leg: pushed off behind, toe turned back ── */}
      <g>
        <path d="M48 112 L66 112 L58 160 L50 190 L32 190 L38 158 Z" fill={TROUSER_LO} />
        <path d="M57 112 L66 112 L58 160 L50 190 L43 190 L49 158 Z" fill={TROUSER} />
        <path d="M48 116 L39 158 L33 188" stroke={RIM} strokeWidth="2.1" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M32 184 L54 184 L54 194 L19 194 C18 188 24 184 32 184 Z" fill={SHOE_LO} />
        <path d="M38 184 L54 184 L54 192 L28 192 Z" fill={SHOE} />
        <path d="M19 194 L54 194 L54 199 L21 199 C19 199 18 196 19 194 Z" fill={SOLE} />
        <path d="M28 188 L50 188" stroke={SHOE_LO} strokeWidth="1.2" opacity="0.6" />
      </g>

      {/* ── Trailing arm, hanging just behind the body ── */}
      <g>
        <path d="M52 64 L64 70 L59 118 L46 116 Z" fill={JACKET_LO} />
        <path d="M46 114 L59 116 L58 122 L45 120 Z" fill={SHIRT_LO} />
        <ellipse cx="52" cy="128" rx="6.6" ry="8.2" fill={SKIN_LO} />
      </g>

      {/* ── Leading leg: planted forward ── */}
      <g>
        <path d="M62 112 L80 112 L88 158 L92 190 L74 190 L68 158 Z" fill={TROUSER} />
        <path d="M62 112 L69 112 L72 158 L76 190 L74 190 L68 158 Z" fill={TROUSER_LO} opacity="0.65" />
        <path d="M80 116 L88 158 L92 188" stroke={RIM} strokeWidth="2.1" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M74 184 L94 184 C104 184 110 188 110 194 L74 194 Z" fill={SHOE} />
        <path d="M74 184 L94 184 C100 184 104 186 107 189 L74 189 Z" fill={SHOE_LO} opacity="0.5" />
        <path d="M74 194 L110 194 C111 197 110 199 108 199 L74 199 Z" fill={SOLE} />
        <path d="M80 189 L102 189" stroke={SHOE_LO} strokeWidth="1.2" opacity="0.6" />
      </g>

      {/* ── Suit jacket ── */}
      <path
        d="M62 62 C74 61 84 70 87 84 L92 112 C93 120 89 124 81 124 L47 124 C39 124 36 120 37 112 L42 84 C45 70 52 62 62 62 Z"
        fill={JACKET}
      />
      <path d="M60 62 C52 62 45 70 42 84 L37 112 C36 120 39 124 47 124 L60 124 Z" fill={JACKET_LO} />
      <path d="M85 82 L92 112 C93 120 89 124 81 124 L84 100 Z" fill={JACKET_HI} />

      {/* Shirt through the open jacket: collar band plus a broad chest panel —
          narrow it and it reads as a necktie instead. */}
      <path d="M55 56 L80 63 L78 72 L55 65 Z" fill={SHIRT} />
      <path d="M60 66 L81 72 L78 104 L65 100 Z" fill={SHIRT} />
      <path d="M60 66 L70 69 L68 102 L65 100 Z" fill={SHIRT_LO} />
      <path d="M71 70 L73 103" stroke={SHIRT_LO} strokeWidth="1.3" />

      <path d="M58 61 L70 72 L64 100 L56 66 Z" fill={JACKET_LO} />
      <path d="M86 70 L88 84 L79 104 L81 73 Z" fill={JACKET} />
      <path d="M86 70 L88 84 L79 104 L81 73 Z" fill="#000" opacity="0.07" />

      <circle cx="79" cy="106" r="2" fill="#202e46" />
      <path d="M70 110 L88 113 L88 118 L70 115 Z" fill={JACKET_LO} opacity="0.5" />
      <path d="M42 118 L88 121" stroke={JACKET_LO} strokeWidth="1.4" opacity="0.55" />

      <path
        d="M62 62 C52 62 45 70 42 84 L37 112 C36 120 39 124 47 124"
        stroke={RIM}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Leading arm, hanging forward of the body ── */}
      <g>
        <path d="M72 64 L86 72 L92 118 L79 122 Z" fill={JACKET} />
        <path d="M86 72 L92 118 L87 120 L82 73 Z" fill={JACKET_HI} />
        <path d="M87 75 L93 116" stroke={RIM} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M79 118 L92 115 L93 122 L80 125 Z" fill={SHIRT} />
        <ellipse cx="87" cy="132" rx="7" ry="8.8" fill={SKIN} />
        <path d="M83 126 L91 125" stroke={SKIN_LO} strokeWidth="1.2" opacity="0.5" />
      </g>

      {/* ── Head, in profile facing right ──
          Skin, then the beard band along the jaw, then the hair on the crown
          only: keeping the hairline above the brow is what stops the hair and
          the glasses merging into one dark stripe at sprite size. */}
      <g>
        <path d="M56 46 L70 46 L70 66 L56 66 Z" fill={SKIN_LO} />
        <ellipse cx="62" cy="34" rx="17.5" ry="20" fill={SKIN} />
        <path d="M78 30 C84 34 84 40 80 42 L75 42 Z" fill={SKIN} />
        <path d="M67 30 L79 31" stroke={SKIN_LO} strokeWidth="1.4" opacity="0.45" />
        <path d="M50 36 C50 50 57 55 64 55 C73 55 80 49 80 40 C76 45 70 47 64 47 C57 47 52 43 50 36 Z" fill={BEARD} />
        <path d="M73 42 C77 41 79 40 80 39 L80 43 C78 44 75 45 73 45 Z" fill={BEARD} />
        <path d="M43 34 C41 8 84 3 82 27 C79 20 70 17 60 17 C50 17 45 23 44 33 Z" fill={HAIR} />
        <path d="M48 13 C58 5 75 7 81 20 C73 11 57 10 48 13 Z" fill={HAIR_HI} />
        <path d="M43 29 L51 29 L51 43 C46 42 43 37 43 29 Z" fill={HAIR} />
        <path d="M53 33 C49 33 49 41 53 41 Z" fill={SKIN_LO} />
        <path d="M71 48 Q76 49 79 46" stroke="#66302a" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <path d="M72 47 Q75 47.6 77 46.6" stroke="#f6efe6" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M68 31 L82 32 L81 40 L68 39 Z" fill="#cfe4f4" opacity="0.28" />
        <path d="M68 31 L82 32 L81 40 L68 39 Z" fill="none" stroke={FRAME} strokeWidth="1.3" />
        <path d="M82 34 C85 34 86 36 85 38" stroke={FRAME} strokeWidth="1.1" fill="none" />
        <path d="M68 33 L52 31" stroke={FRAME} strokeWidth="1.1" opacity="0.7" />
        <circle cx="75" cy="35.5" r="1.8" fill={HAIR} />
      </g>
    </svg>
  )
}
