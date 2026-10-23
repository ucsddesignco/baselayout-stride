"use client";

import { useEffect, type ReactNode } from "react";
import { useAnimate, useInView, useReducedMotion } from "framer-motion";

// Flicker sequence as [duration in ms, light level]. Level 0 is "off".
// Dark gaps shrink (260 → 160 → 90 → 50) before the light catches for good.
const FLICKER: [number, number][] = [
  [120, 0],
  [60, 0.6],
  [260, 0],
  [50, 0.75],
  [160, 0],
  [60, 0.85],
  [90, 0],
  [50, 0.7],
  [50, 0],
];

const OFF_OPACITY = 0.08;
const OFF_BRIGHTNESS = 0.3;

const OFF = { opacity: OFF_OPACITY, filter: `brightness(${OFF_BRIGHTNESS})` };
const ON = { opacity: 1, filter: "brightness(1)" };

// Builds keyframes with hard cuts: each level is held for its duration, then
// jumps to the next level over a near-zero interval.
function buildKeyframes() {
  const total = FLICKER.reduce((sum, [ms]) => sum + ms, 0);
  const EPS = 0.001;
  const levels: number[] = [];
  const times: number[] = [];
  let t = 0;
  for (const [ms, level] of FLICKER) {
    levels.push(level, level);
    times.push(t === 0 ? 0 : t / total + EPS, (t + ms) / total);
    t += ms;
  }
  levels.push(1);
  times[times.length - 1] -= EPS;
  times.push(1);

  return {
    opacity: levels.map((l) => (l === 0 ? OFF_OPACITY : l)),
    filter: levels.map((l) => `brightness(${l === 0 ? OFF_BRIGHTNESS : l})`),
    times,
    duration: total / 1000,
  };
}

const KEYFRAMES = buildKeyframes();

export default function PoolTableLight({ children }: { children: ReactNode }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { amount: 0.3 });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!scope.current) return;
    if (!inView) {
      animate(scope.current, OFF, { duration: 0 });
      return;
    }
    if (reduce) {
      animate(scope.current, ON, { duration: 0 });
      return;
    }
    const controls = animate(
      scope.current,
      { opacity: KEYFRAMES.opacity, filter: KEYFRAMES.filter },
      { duration: KEYFRAMES.duration, times: KEYFRAMES.times, ease: "linear" },
    );
    return () => controls.stop();
  }, [inView, reduce, animate, scope]);

  return (
    <div ref={scope} aria-hidden className="absolute inset-0" style={OFF}>
      {children}
    </div>
  );
}
