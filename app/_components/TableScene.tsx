import type { CSSProperties } from "react";

// The pool table is modelled as a small 3D scene seen by an orthographic
// camera. The camera's elevation is driven purely by viewport width in CSS
// (see `.table-scene` in globals.css), so this stays a zero-JS server component.
//
// World coordinates are in tablet-frame px (Figma 9026:1895), origin at the
// table center: x → right, z → toward the viewer, height h → up.
// A point (x, z, h) lands on screen at (x, z·s − h·c), where s/c are the
// sine/cosine of the camera elevation.

const TABLE_RADIUS = 508.48;

type Ball = {
  kind: "yellow" | "blue" | "white" | "eight";
  x: number;
  z: number;
  /** radius at the tablet angle (bigger toward the front, like perspective) */
  rTablet: number;
  /** radius when seen top-down */
  rMobile: number;
};

// Sorted back-to-front (by z) so later balls paint over earlier ones.
// Tablet radii come from 9026:1895; mobile radii from 9026:2063, rescaled from
// its 552px table to this 1017px one.
const balls: Ball[] = [
  { kind: "yellow", x: -47.9, z: -302.4, rTablet: 32.07, rMobile: 55.53 },
  { kind: "blue", x: 264.7, z: -149.4, rTablet: 41.13, rMobile: 57.11 },
  { kind: "white", x: 164.6, z: 197.9, rTablet: 46.76, rMobile: 57.97 },
  { kind: "eight", x: -186.3, z: 386.0, rTablet: 53.16, rMobile: 56.02 },
];

const cueBall = balls.find((b) => b.kind === "white")!;

function ballVars(ball: Ball) {
  return {
    "--x": ball.x,
    "--z": ball.z,
    "--rt": ball.rTablet,
    "--rm": ball.rMobile,
  } as CSSProperties;
}

const cueVars = {
  "--bx": cueBall.x,
  "--bz": cueBall.z,
  "--rt": cueBall.rTablet,
  "--rm": cueBall.rMobile,
} as CSSProperties;

// Ball artwork, drawn on a unit circle (scaled to the ball radius in CSS).
function BallArt({ kind }: { kind: Ball["kind"] }) {
  switch (kind) {
    case "yellow":
      return (
        <>
          <circle r="1" fill="#F4F48F" />
          <g clipPath="url(#table-yellow-ball)">
            <g transform="rotate(15.42)">
              <rect x="-1.45" y="-1.75" width="0.9" height="3.5" fill="#FCFFF2" />
              <rect x="0.55" y="-1.75" width="0.9" height="3.5" fill="#FCFFF2" />
            </g>
          </g>
        </>
      );
    case "blue":
      return (
        <>
          <circle r="1" fill="#A4CDF9" />
          <circle cx="-0.261" cy="0.249" r="0.4953" fill="#FCFFF2" />
        </>
      );
    case "white":
      return (
        <>
          <circle r="1" fill="#FCFFF2" />
          <circle cx="0.040" cy="-0.395" r="0.0617" fill="black" />
          <circle cx="0.466" cy="-0.615" r="0.0617" fill="black" />
          <path
            transform="translate(0.344 -0.377) scale(0.021386) rotate(148.11) scale(1 -1) translate(-4.762 -1.643)"
            d="M0 1.04934C0 0.310679 0.763257 -0.181081 1.43587 0.124221L3.60503 1.10881C4.25845 1.4054 5.00657 1.41304 5.66591 1.12986L8.10117 0.0839565C8.77491 -0.205404 9.52493 0.28874 9.52493 1.02199C9.52493 1.37469 9.34284 1.70512 9.03795 1.88245C5.88333 3.71724 3.49223 3.7875 0.45348 1.88443C0.167429 1.70529 0 1.38686 0 1.04934Z"
            fill="black"
          />
        </>
      );
    case "eight":
      return (
        <>
          <circle r="1" fill="black" />
          <circle cx="0.238" cy="-0.210" r="0.4952" fill="#FCFFF2" />
        </>
      );
  }
}

// Cue artwork on a unit band: x 0 (tip) → 1 (butt), y −0.5 → 0.5.
// Segment proportions from the mobile cue (9026:2118).
function CueArt() {
  return (
    <>
      <rect x="0.064" y="-0.5" width="0.585" height="1" fill="#FFDDD0" />
      <rect x="0.4285" y="-0.5" width="0.002" height="0.25" fill="#FCFFF2" />
      <rect x="0.6482" y="-0.5" width="0.0137" height="1" fill="#FFFFFF" />
      <rect x="0.6617" y="-0.5" width="0.3383" height="1" fill="#9E1717" />
      <rect x="0.037" y="-0.5" width="0.0272" height="1" fill="#FFFFFF" />
      <rect x="0" y="-0.5" width="0.0372" height="1" fill="#A4CDF9" />
    </>
  );
}

export default function TableScene() {
  return (
    <div aria-hidden className="table-scene">
      <svg viewBox="-620 -640 1240 1280" width={1240} height={1280}>
        <defs>
          <clipPath id="table-felt">
            <circle r={TABLE_RADIUS} />
          </clipPath>
          <clipPath id="table-yellow-ball">
            <circle r="1" />
          </clipPath>
        </defs>

        {/* spotlight cone: screen-space, lands on the table's left/right edges */}
        <polygon
          className="table-cone"
          points={`-50.5,-615.4 72.5,-615.4 ${TABLE_RADIUS},0 ${-TABLE_RADIUS},0`}
          fill="#FFDB9F"
        />

        {/* everything lying on the felt, drawn top-down and squashed by the camera */}
        <g className="table-plane">
          <circle r={TABLE_RADIUS} fill="#D32525" />
          <g clipPath="url(#table-felt)" fill="#660000">
            <g className="table-cue-shadow" style={cueVars}>
              <rect y="-0.5" width="1" height="1" />
            </g>
            {balls.map((ball) => (
              <circle key={ball.kind} className="table-ball-shadow" style={ballVars(ball)} r="1" />
            ))}
          </g>
        </g>

        {/* balls stay round; the cue sits just behind the ball it's aimed at */}
        {balls.map((ball) => (
          <g key={ball.kind}>
            {ball === cueBall && (
              <g className="table-cue" style={cueVars}>
                <CueArt />
              </g>
            )}
            <g className="table-ball" style={ballVars(ball)}>
              <BallArt kind={ball.kind} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
