export default function HeroAxon() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1415]">
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-60" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lime/10 blur-3xl" />
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          <span className="font-mono-tech text-[9px] uppercase tracking-[0.16em] text-mist">
            Proposed · axonometri
          </span>
        </div>
        <span className="font-mono-tech text-[9px] uppercase tracking-[0.12em] text-mist-2">Skala 1:50</span>
      </div>

      <svg viewBox="0 0 620 450" className="relative block w-full" role="img" aria-label="Ilustrasi aksonometri usulan rumah genset">
        <defs>
          <pattern id="axon-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#c6f75c" strokeOpacity="0.055" strokeWidth="1" />
          </pattern>
          <linearGradient id="axon-wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b9bda9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7f8879" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="axon-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8c9b93" />
            <stop offset="100%" stopColor="#52645e" />
          </linearGradient>
          <marker id="axon-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#c6f75c" />
          </marker>
        </defs>

        <rect width="620" height="450" fill="url(#axon-grid)" />

        {/* dimension guides */}
        <g stroke="#c6f75c" strokeOpacity="0.55" strokeWidth="0.9" fill="none">
          <path d="M 140 92 L 492 92" markerStart="url(#axon-arrow)" markerEnd="url(#axon-arrow)" />
          <path d="M 128 132 L 128 384" markerStart="url(#axon-arrow)" markerEnd="url(#axon-arrow)" />
          <path d="M 140 92 L 140 132" strokeDasharray="3 3" strokeOpacity="0.25" />
          <path d="M 492 92 L 492 340" strokeDasharray="3 3" strokeOpacity="0.25" />
        </g>
        <text x="316" y="83" textAnchor="middle" fill="#c6f75c" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="0.6">
          600 CM
        </text>
        <text
          x="118"
          y="258"
          textAnchor="middle"
          fill="#c6f75c"
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
          transform="rotate(-90 118 258)"
          letterSpacing="0.6"
        >
          720 CM
        </text>

        {/* ground */}
        <polygon points="112,367 402,410 536,326 246,286" fill="#17221f" stroke="#354742" strokeWidth="1.2" />
        <polygon points="112,367 402,410 536,326 246,286" fill="url(#axon-grid)" />
        <path d="M 146 360 L 392 396 M 186 350 L 432 386 M 226 340 L 472 376 M 266 330 L 512 366" stroke="#c6f75c" strokeOpacity="0.12" />

        {/* building volume: back + side faces */}
        <polygon points="182,192 430,160 512,211 262,246" fill="#4e5d55" opacity="0.55" />
        <polygon points="182,192 182,336 262,368 262,246" fill="url(#axon-wall)" opacity="0.9" />
        <polygon points="262,246 512,211 512,325 262,368" fill="#8b9384" opacity="0.9" />

        {/* front lower wall */}
        <polygon points="182,258 442,218 442,338 182,336" fill="#c6c7b3" />
        <polygon points="182,258 442,218 442,338 182,336" fill="url(#axon-grid)" opacity="0.7" />
        <line x1="182" y1="336" x2="442" y2="338" stroke="#2b3934" strokeWidth="2" />
        <line x1="182" y1="258" x2="182" y2="336" stroke="#394740" strokeWidth="1.4" />
        <line x1="442" y1="218" x2="442" y2="338" stroke="#394740" strokeWidth="1.4" />

        {/* louver band */}
        <g stroke="#3d4a43" strokeWidth="1.1" opacity="0.85">
          {Array.from({ length: 7 }).map((_, index) => (
            <line key={index} x1="184" y1={206 + index * 4.2} x2="442" y2={170 + index * 4.2} opacity="0" />
          ))}
          {Array.from({ length: 6 }).map((_, index) => (
            <line key={`l-${index}`} x1="192" y1={277 + index * 7} x2="256" y2={268 + index * 7} />
          ))}
          {Array.from({ length: 6 }).map((_, index) => (
            <line key={`r-${index}`} x1="300" y1={256 + index * 7} x2="432" y2={240 + index * 7} />
          ))}
        </g>

        {/* roof */}
        <polygon points="152,203 300,132 492,183 346,251" fill="#2f403b" />
        <polygon points="172,196 300,140 466,184 338,241" fill="url(#axon-roof)" stroke="#93a39a" strokeWidth="1" />
        <polygon points="152,203 300,132 306,140 158,209" fill="#455a52" />
        <polygon points="306,140 492,183 486,190 300,148" fill="#3c5049" />
        <polygon points="158,209 306,140 338,241 192,302" fill="#60746b" opacity="0.55" />
        <path d="M 172 196 L 300 140 L 466 184" stroke="#b7c7bd" strokeWidth="1.3" fill="none" />
        <path d="M 300 132 L 300 148" stroke="#c6f75c" strokeWidth="0" />

        {/* columns + door */}
        <g fill="#2b454b">
          <rect x="180" y="218" width="7" height="120" />
          <rect x="378" y="196" width="7" height="139" />
          <rect x="264" y="245" width="7" height="123" />
        </g>
        <rect x="210" y="290" width="45" height="46" fill="#3c4a43" stroke="#26332e" />
        <line x1="232" y1="290" x2="232" y2="336" stroke="#738376" strokeWidth="1" />
        <rect x="220" y="300" width="25" height="8" fill="#1c2a26" />
        <circle cx="248" cy="313" r="1.6" fill="#c6f75c" />

        {/* gensets */}
        <g>
          <polygon points="286,384 392,363 424,380 318,401" fill="#202d2a" stroke="#3b4d46" />
          <polygon points="292,352 380,336 410,352 322,368" fill="#4e5a52" />
          <polygon points="292,352 322,368 322,385 292,369" fill="#3b4842" />
          <polygon points="322,368 410,352 410,369 322,385" fill="#657168" />
          <polygon points="292,352 380,336 396,344 308,360" fill="#d8ddc9" opacity="0.9" />
          <line x1="302" y1="378" x2="354" y2="368" stroke="#c6f75c" strokeWidth="1.4" />
          <text x="348" y="332" fill="#c6f75c" fontSize="8.5" fontFamily="JetBrains Mono, monospace">GENSET BARU</text>
          <text x="300" y="413" fill="#93a3a3" fontSize="8" fontFamily="JetBrains Mono, monospace">PONDASI 500 × 150</text>

          <polygon points="406,330 488,315 514,328 432,344" fill="#202d2a" stroke="#3b4d46" opacity="0.6" />
          <polygon points="412,308 484,295 506,306 434,320" fill="#456342" />
          <polygon points="412,308 434,320 434,333 412,321" fill="#37503a" />
          <polygon points="434,320 506,306 506,318 434,333" fill="#527a4b" />
          <text x="426" y="286" fill="#93a3a3" fontSize="8" fontFamily="JetBrains Mono, monospace">EXISTING</text>
        </g>

        {/* annotation callouts */}
        <g fontFamily="JetBrains Mono, monospace">
          <path d="M 442 246 L 522 238" stroke="#93a3a3" strokeOpacity="0.55" strokeDasharray="3 3" />
          <text x="526" y="240" fill="#93a3a3" fontSize="8">EAVE 330</text>
          <path d="M 300 132 L 540 126" stroke="#93a3a3" strokeOpacity="0.5" strokeDasharray="3 3" />
          <text x="522" y="116" fill="#93a3a3" fontSize="8">RIDGE 450</text>
          <circle cx="300" cy="132" r="2.6" fill="#c6f75c" />
          <circle cx="442" cy="218" r="2.4" fill="#c6f75c" />
        </g>

        <g fontFamily="JetBrains Mono, monospace">
          <text x="140" y="432" fill="#93a3a3" fontSize="8" letterSpacing="0.8">DENAH & MODEL · SKALA NYATA</text>
          <text x="492" y="432" fill="#c6f75c" fontSize="8" letterSpacing="0.8">POV 06 SISI</text>
        </g>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] px-4 py-2.5">
        <span className="font-mono-tech text-[9px] uppercase tracking-[0.1em] text-mist-2">
          2 zona genset · selubung + louver
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-lime/[0.07] px-2 py-1 font-mono-tech text-[8px] uppercase tracking-[0.1em] text-lime">
          <span className="h-1 w-1 rounded-full bg-lime" /> ready to explore
        </span>
      </div>
    </div>
  );
}
