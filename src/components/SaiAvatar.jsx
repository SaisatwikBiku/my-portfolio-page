// A flat, hand-illustrated 2D avatar of Sai — a stylized likeness built from the
// signature features in his photo: an olive knit beanie, black sunglasses, a big
// smile with a short beard, and a black puffer jacket with hoodie drawstrings
// over a blue shirt. Colours are fixed; only the backdrop tracks the theme.
export default function SaiAvatar({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustrated avatar of Sai"
    >
      <defs>
        <radialGradient id="sa-bg" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="var(--surface)" />
          <stop offset="100%" stopColor="var(--bg-alt)" />
        </radialGradient>
        <clipPath id="sa-clip">
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>

      <circle cx="60" cy="60" r="60" fill="url(#sa-bg)" />

      <g clipPath="url(#sa-clip)">
        {/* Jacket panels with a V opening showing the shirt */}
        <path d="M60 104 L70 88 C88 88 112 97 112 121 L60 121 Z" fill="#2b5a86" opacity="0" />
        <path d="M50 90 L60 104 L70 90 Z" fill="#2c5a86" />
        <path d="M8 121 C8 97 28 88 44 88 L60 105 L51 121 Z" fill="#1e222c" />
        <path d="M112 121 C112 97 92 88 76 88 L60 105 L69 121 Z" fill="#1e222c" />
        {/* Puffer stitching hints */}
        <path d="M30 96 L26 118" stroke="#2a2f3b" strokeWidth="2" strokeLinecap="round" />
        <path d="M90 96 L94 118" stroke="#2a2f3b" strokeWidth="2" strokeLinecap="round" />
        {/* Hoodie drawstrings */}
        <path d="M56 92 L54 114" stroke="#e8ebf0" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M64 92 L66 114" stroke="#e8ebf0" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="54" cy="114" r="1.8" fill="#e8ebf0" />
        <circle cx="66" cy="114" r="1.8" fill="#e8ebf0" />

        {/* Neck */}
        <rect x="52" y="78" width="16" height="14" rx="7" fill="#a8703f" />

        {/* Ears */}
        <ellipse cx="30" cy="58" rx="5" ry="7.5" fill="#c88a5a" />
        <ellipse cx="90" cy="58" rx="5" ry="7.5" fill="#c88a5a" />

        {/* Head */}
        <ellipse cx="60" cy="54" rx="31" ry="34" fill="#c88a5a" />

        {/* Beard / stubble along the jaw */}
        <path
          d="M35 62 C37 80 48 90 60 90 C72 90 83 80 85 62 C80 74 71 80 60 80 C49 80 40 74 35 62 Z"
          fill="#4a3526"
          opacity="0.9"
        />
        {/* Moustache */}
        <path d="M50 69 Q60 67 70 69 Q66 72.5 60 72.5 Q54 72.5 50 69 Z" fill="#4a3526" opacity="0.9" />

        {/* Nostrils hint */}
        <path d="M56.5 70 Q60 72 63.5 70" stroke="#a8703f" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Smile */}
        <path d="M49 74 Q60 72 71 74 Q67 85 60 86 Q53 85 49 74 Z" fill="#5c2b26" />
        <path d="M51 75 Q60 74 69 75 Q66 80 60 80.5 Q54 80 51 75 Z" fill="#ffffff" />

        {/* Beanie cap + ribbing */}
        <path d="M27 54 C24 16 96 16 93 54 Z" fill="#5c6b50" />
        <g stroke="#4d5b44" strokeWidth="1.3" opacity="0.55" strokeLinecap="round">
          <path d="M35 28 L35 52" />
          <path d="M43 24 L43 52" />
          <path d="M51 22 L51 52" />
          <path d="M60 21 L60 52" />
          <path d="M69 22 L69 52" />
          <path d="M77 24 L77 52" />
          <path d="M85 28 L85 52" />
        </g>
        {/* Beanie folded brim */}
        <rect x="25" y="43" width="70" height="14" rx="7" fill="#4c5a42" />
        <path d="M28 45 Q60 42 92 45" stroke="#5c6b50" strokeWidth="1.4" fill="none" opacity="0.7" />
        <g stroke="#3f4b37" strokeWidth="1.1" opacity="0.5" strokeLinecap="round">
          <path d="M34 46 L34 54" />
          <path d="M42 46 L42 54" />
          <path d="M50 46 L50 54" />
          <path d="M58 46 L58 54" />
          <path d="M66 46 L66 54" />
          <path d="M74 46 L74 54" />
          <path d="M82 46 L82 54" />
        </g>

        {/* Sunglasses */}
        <path d="M36 58 L29 57" stroke="#191d28" strokeWidth="3" strokeLinecap="round" />
        <path d="M84 58 L91 57" stroke="#191d28" strokeWidth="3" strokeLinecap="round" />
        <rect x="56" y="57" width="8" height="4" rx="2" fill="#191d28" />
        <rect x="36" y="54" width="20" height="14" rx="6" fill="#191d28" />
        <rect x="64" y="54" width="20" height="14" rx="6" fill="#191d28" />
        {/* Lens highlights */}
        <path d="M41 57 L45 57 L39 64 L35 64 Z" fill="#ffffff" opacity="0.14" />
        <path d="M69 57 L73 57 L67 64 L63 64 Z" fill="#ffffff" opacity="0.14" />
        <rect x="36" y="54" width="20" height="14" rx="6" fill="none" stroke="#3a4152" strokeWidth="0.8" opacity="0.6" />
        <rect x="64" y="54" width="20" height="14" rx="6" fill="none" stroke="#3a4152" strokeWidth="0.8" opacity="0.6" />
      </g>
    </svg>
  )
}
