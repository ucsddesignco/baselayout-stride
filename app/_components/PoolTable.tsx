// Pool table with object balls, inlined from Figma so the cue shadow can be
// animated in place. The shadow sits between the felt and the balls so the
// blue ball still draws over it.
export default function PoolTable() {
  return (
    <svg
      aria-hidden
      width={909}
      height={236.002}
      viewBox="0 0 909 236.002"
      fill="none"
      className="absolute left-[480px] top-[442px] max-w-none overflow-visible"
    >
      <defs>
        <clipPath id="pooltable-clip">
          <ellipse cx="454.5" cy="132.002" rx="454.5" ry="104" />
        </clipPath>
        <mask id="pooltable-mask-yellow" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="428" y="15" width="52" height="53">
          <circle cx="453.782" cy="41.6729" r="25.7432" transform="rotate(-164.576 453.782 41.6729)" fill="#FFC929" />
        </mask>
        <mask id="pooltable-mask-blue" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="559" y="107" width="73" height="73">
          <circle cx="595.593" cy="143.596" r="35.775" transform="rotate(-134.567 595.593 143.596)" fill="#FFC929" />
        </mask>
      </defs>

      {/* felt */}
      <ellipse cx="454.5" cy="132.002" rx="454.5" ry="104" fill="#D32525" />

      {/* cue shadow (animated with the cue by HeroIntro) */}
      <g clipPath="url(#pooltable-clip)">
        <path
          data-hero-cue
          className="opacity-0"
          d="M276.54 123.979L1000 72.056L1000 91.953L555.78 116.136L276.501 131.34L276.54 123.979Z"
          fill="#660000"
        />
      </g>

      {/* yellow ball */}
      <ellipse cx="32.411" cy="15.2957" rx="32.411" ry="15.2957" transform="matrix(0.999673 0.0255528 0.0255528 -0.999673 434.004 70.1446)" fill="#660000" />
      <circle cx="453.787" cy="41.6812" r="25.7432" transform="rotate(-164.576 453.787 41.6812)" fill="#F4F48F" />
      <g mask="url(#pooltable-mask-yellow)">
        <rect x="479.412" y="2.00497" width="23.1689" height="90.1014" transform="rotate(15.4236 479.412 2.00497)" fill="#FCFFF2" />
        <rect x="429.782" y="-11.6839" width="23.1689" height="90.1014" transform="rotate(15.4236 429.782 -11.6839)" fill="#FCFFF2" />
      </g>

      {/* blue ball */}
      <ellipse cx="55.7994" cy="22.0243" rx="55.7994" ry="22.0243" transform="matrix(-0.983675 -0.179952 -0.179952 0.983675 681.445 159.409)" fill="#660000" />
      <circle cx="595.596" cy="143.597" r="35.775" transform="rotate(-134.567 595.596 143.597)" fill="#A4CDF9" />
      <g mask="url(#pooltable-mask-blue)">
        <rect x="654.003" y="113.673" width="32.1975" height="125.213" transform="rotate(45.433 654.003 113.673)" fill="#FCFFF2" />
        <rect x="603.794" y="62.7023" width="32.1975" height="125.213" transform="rotate(45.433 603.794 62.7023)" fill="#FCFFF2" />
      </g>

      {/* cue ball */}
      <ellipse cx="46.7848" cy="18.4662" rx="46.7848" ry="18.4662" transform="matrix(-0.990863 -0.134872 -0.134872 0.990863 260 115.705)" fill="#660000" />
      <circle cx="33.3594" cy="33.3594" r="33.3594" transform="matrix(0.701742 -0.712431 -0.712431 -0.701742 190.529 155.349)" fill="#FCFFF2" />
    </svg>
  );
}
