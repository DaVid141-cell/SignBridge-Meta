export default function HandTrackingSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 700 700" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      
      {/* Definitions for the scanning light gradient */}
      <defs>
        <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C82FF" stopOpacity="0" />
          <stop offset="100%" stopColor="#7C82FF" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* ============================================ */}
      {/* BLUE LINES / CONNECTIONS                     */}
      {/* ============================================ */}
      <g stroke="#7C82FF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
        <path d="M350 672 L196 546 L154 462 L112 378 L77 294" />
        <path d="M350 672 L273 364 L238 259 L224 175 L217 91" />
        <path d="M350 672 L364 336 L364 224 L364 126 L364 35" />
        <path d="M350 672 L455 371 L469 266 L483 189 L490 112" />
        <path d="M350 672 L567 434 L588 350 L616 287 L630 231" />
        <path d="M273 364 L364 336 L455 371 L567 434" />
      </g>

      {/* ============================================ */}
      {/* SCANNING ANIMATION - Blue light moving down  */}
      {/* Change dur="4s" to make it faster/slower     */}
      {/* ============================================ */}
      <g>
        <animateTransform 
          attributeName="transform" 
          type="translate" 
          values="0 -120; 0 700; 0 -120" 
          dur="4s" 
          repeatCount="indefinite" 
        />
        {/* The soft glow band */}
        <rect x="0" y="0" width="700" height="110" fill="url(#scanGradient)" />
        {/* The bright line at the bottom of the band */}
        <rect x="0" y="108" width="700" height="4" fill="#7C82FF" opacity="0.9" />
      </g>

      {/* ============================================ */}
      {/* RIPPLE / PULSE RINGS                         */}
      {/* These are the expanding rings behind 3 main balls */}
      {/* ============================================ */}
      <g fill="none" stroke="#7C82FF" strokeWidth="3">
        {/* Pulse Ring - Middle Tip */}
        <circle cx="364" cy="35" r="19">
          <animate attributeName="r" values="19;38;19" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Pulse Ring - Middle Knuckle */}
        <circle cx="364" cy="336" r="19">
          <animate attributeName="r" values="19;38;19" dur="2s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" begin="0.4s" repeatCount="indefinite" />
        </circle>
        {/* Pulse Ring - Wrist */}
        <circle cx="350" cy="672" r="18">
          <animate attributeName="r" values="18;45;18" dur="2s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" begin="0.8s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* ============================================ */}
      {/* BLACK BALLS / TRACKING POINTS START HERE     */}
      {/* Every ball now pulses: r goes 19 -> 24 -> 19 */}
      {/* begin="0.1s" is the delay, so they don't all pulse at once */}
      {/* ============================================ */}
      <g fill="#0E1022">
        
        {/* --- BLACK BALL: Wrist --- */}
        <circle cx="350" cy="672" r="18">
          <animate attributeName="r" values="18;23;18" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* --- BLACK BALLS: THUMB --- */}
        <circle cx="196" cy="546" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0s" repeatCount="indefinite" /></circle>
        <circle cx="154" cy="462" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.1s" repeatCount="indefinite" /></circle>
        <circle cx="112" cy="378" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.2s" repeatCount="indefinite" /></circle>
        <circle cx="77"  cy="294" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.3s" repeatCount="indefinite" /></circle>

        {/* --- BLACK BALLS: INDEX FINGER --- */}
        <circle cx="273" cy="364" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.1s" repeatCount="indefinite" /></circle>
        <circle cx="238" cy="259" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.2s" repeatCount="indefinite" /></circle>
        <circle cx="224" cy="175" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.3s" repeatCount="indefinite" /></circle>
        <circle cx="217" cy="91"  r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.4s" repeatCount="indefinite" /></circle>

        {/* --- BLACK BALLS: MIDDLE FINGER --- */}
        <circle cx="364" cy="336" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.2s" repeatCount="indefinite" /></circle>
        <circle cx="364" cy="224" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.3s" repeatCount="indefinite" /></circle>
        <circle cx="364" cy="126" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.4s" repeatCount="indefinite" /></circle>
        <circle cx="364" cy="35"  r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.5s" repeatCount="indefinite" /></circle>

        {/* --- BLACK BALLS: RING FINGER --- */}
        <circle cx="455" cy="371" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.3s" repeatCount="indefinite" /></circle>
        <circle cx="469" cy="266" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.4s" repeatCount="indefinite" /></circle>
        <circle cx="483" cy="189" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.5s" repeatCount="indefinite" /></circle>
        <circle cx="490" cy="112" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.6s" repeatCount="indefinite" /></circle>

        {/* --- BLACK BALLS: PINKY FINGER --- */}
        <circle cx="567" cy="434" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.4s" repeatCount="indefinite" /></circle>
        <circle cx="588" cy="350" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.5s" repeatCount="indefinite" /></circle>
        <circle cx="616" cy="287" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.6s" repeatCount="indefinite" /></circle>
        <circle cx="630" cy="231" r="19"><animate attributeName="r" values="19;24;19" dur="1.8s" begin="0.7s" repeatCount="indefinite" /></circle>

      </g>
      {/* ============ BLACK BALLS END HERE ============ */}

    </svg>
  );
}