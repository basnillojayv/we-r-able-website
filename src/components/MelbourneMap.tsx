/*
  Port Phillip Bay, traced from real shoreline coordinates (Port Melbourne
  round to Brighton) and smoothed through midpoints, so it reads as Melbourne
  rather than as a generic blob. The dashed ring is indicative reach across the
  metropolitan area, not a service boundary — the caption says so.
*/
export function MelbourneMap() {
  return (
    <svg
      viewBox="60 26 400 556"
      role="img"
      aria-label="Stylised map of Greater Melbourne showing Port Phillip Bay, with WE R ABLE based at Caroline Springs and support delivered across the metropolitan area."
      className="w-full"
    >
      <ellipse
        cx="272"
        cy="212"
        rx="163"
        ry="168"
        fill="rgb(247 182 14 / 0.05)"
        stroke="rgb(247 182 14 / 0.32)"
        strokeWidth="1.5"
        strokeDasharray="6 9"
      />

      <path
        d="M316.4 185.0 Q299.6 158.4 271.6 169.8 Q243.6 181.2 221.2 200.2 Q198.8 219.2 184.8 242.0 Q170.8 264.8 137.2 306.6 Q103.6 348.4 123.2 356.0 Q142.8 363.6 162.4 386.4 Q182.0 409.2 170.8 435.8 Q159.6 462.4 140.0 481.4 Q120.4 500.4 134.4 504.2 Q148.4 508.0 182.0 530.8 Q215.6 553.6 249.2 553.6 Q282.8 553.6 310.8 523.2 Q338.8 492.8 350.0 470.0 Q361.2 447.2 386.4 416.8 Q411.6 386.4 400.4 333.2 Q389.2 280.0 361.2 245.8 Q333.2 211.6 316.4 185.0 Z"
        fill="rgb(37 118 180 / 0.26)"
        stroke="rgb(37 118 180 / 0.85)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <text
        x="278"
        y="436"
        textAnchor="middle"
        fill="rgb(168 189 216 / 0.9)"
        fontFamily="var(--font-body)"
        fontSize="12"
        fontWeight="600"
        letterSpacing="1.7"
      >
        PORT PHILLIP BAY
      </text>

      <g
        fill="rgb(168 189 216 / 0.72)"
        fontFamily="var(--font-body)"
        fontSize="12"
        fontWeight="600"
        letterSpacing="1.5"
      >
        <text x="336" y="50" textAnchor="middle">NORTH</text>
        <text x="66" y="256">WEST</text>
        <text x="454" y="240" textAnchor="end">EAST</text>
        <text x="454" y="486" textAnchor="end">SOUTH-EAST</text>
      </g>

      <circle cx="316" cy="136" r="4.5" fill="#e9f1f8" />
      <text
        x="330"
        y="133"
        fill="#e9f1f8"
        fontFamily="var(--font-body)"
        fontSize="13.5"
        fontWeight="500"
      >
        Melbourne CBD
      </text>

      <path
        d="M193 61c-11.9 0-21.5 9.6-21.5 21.5 0 15 21.5 32.5 21.5 32.5s21.5-17.5 21.5-32.5c0-11.9-9.6-21.5-21.5-21.5Z"
        fill="#f7b60e"
      />
      <circle cx="193" cy="82" r="7.6" fill="#071c34" />
      <text
        x="193"
        y="136"
        textAnchor="middle"
        fill="#f7b60e"
        fontFamily="var(--font-body)"
        fontSize="14"
        fontWeight="700"
      >
        Caroline Springs
      </text>
    </svg>
  );
}
