"use client";

import { useEffect, type ReactNode } from "react";
import {
  useAnimate,
  useInView,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "framer-motion";

// Intro timeline for the hero stage, replayed each time it scrolls into view:
// the title fades in with a neon glow, the table light flickers on (as the glow
// fades), then the cue slides in. Targets are marked in Hero with
// data-hero-text / -glow-title / -glow-dot / -light / -cue.

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

// Cue axis (unit vector toward the tip), matching PoolShot.
const DIR_X = -0.9918;
const DIR_Y = 0.1271;
const CUE_LEFT = 737; // cue's left edge in stage px
const CUE_OFFSCREEN_MARGIN = 40;

const TITLE_PAUSE = 1; // s between title and flicker
const CUE_PAUSE = 0.5; // s between flicker and cue
const TEXT_FADE = 0.6;
const CUE_SLIDE = 1.1;
const CUE_EASE = [0.16, 1, 0.3, 1] as const;

// Neon glow: on/off pairs keep the same layers so they interpolate.
const titleGlow = (a: number) =>
  `0 0 4px rgba(252,255,242,${0.9 * a}), 0 0 12px rgba(252,255,242,${0.55 * a}), 0 0 32px rgba(252,255,242,${0.35 * a})`;
const dotGlow = (a: number) =>
  `drop-shadow(0 0 4px rgba(164,205,249,${0.9 * a})) drop-shadow(0 0 12px rgba(164,205,249,${0.5 * a}))`;
const GLOW_ON = { title: titleGlow(1), dot: dotGlow(1) };
const GLOW_OFF = { title: titleGlow(0), dot: dotGlow(0) };

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
const GLOW_FADE = KEYFRAMES.duration; // fades out alongside the flicker

export default function HeroIntro({ children }: { children: ReactNode }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { amount: 0.3 });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!scope.current) return;
    let cancelled = false;
    const running: AnimationPlaybackControls[] = [];
    const track = (controls: AnimationPlaybackControls) => {
      running.push(controls);
      return controls;
    };

    if (!inView) {
      animate("[data-hero-light]", OFF, { duration: 0 });
      animate("[data-hero-text]", { opacity: 0 }, { duration: 0 });
      animate("[data-hero-cue]", { opacity: 0 }, { duration: 0 });
      animate("[data-hero-glow-title]", { textShadow: GLOW_OFF.title }, { duration: 0 });
      animate("[data-hero-glow-dot]", { filter: GLOW_OFF.dot }, { duration: 0 });
    } else if (reduce) {
      animate("[data-hero-light]", ON, { duration: 0 });
      animate("[data-hero-cue]", { x: 0, y: 0, opacity: 1 }, { duration: 0 });
      track(animate("[data-hero-text]", { opacity: 1 }, { duration: 0.3 }));
    } else {
      (async () => {
        // 1. title fades in, glow ramps up with it
        const fadeIn = { duration: TEXT_FADE, ease: "easeOut" } as const;
        track(animate("[data-hero-glow-title]", { textShadow: GLOW_ON.title }, fadeIn));
        track(animate("[data-hero-glow-dot]", { filter: GLOW_ON.dot }, fadeIn));
        await track(animate("[data-hero-text]", { opacity: 1 }, fadeIn));
        if (cancelled) return;

        // 2. pause, then the light flickers on while the glow fades out
        const fadeOut = { delay: TITLE_PAUSE, duration: GLOW_FADE, ease: "easeInOut" } as const;
        track(animate("[data-hero-glow-title]", { textShadow: GLOW_OFF.title }, fadeOut));
        track(animate("[data-hero-glow-dot]", { filter: GLOW_OFF.dot }, fadeOut));
        await track(
          animate(
            "[data-hero-light]",
            { opacity: KEYFRAMES.opacity, filter: KEYFRAMES.filter },
            {
              delay: TITLE_PAUSE,
              duration: KEYFRAMES.duration,
              times: KEYFRAMES.times,
              ease: "linear",
            },
          ),
        );
        if (cancelled || !scope.current) return;

        // 3. pause, then the cue slides in

        // Start the cue just past the viewport's right edge, back along its axis.
        const stageLeft = scope.current.getBoundingClientRect().left;
        const dx = window.innerWidth - (stageLeft + CUE_LEFT) + CUE_OFFSCREEN_MARGIN;
        const dy = dx * (DIR_Y / DIR_X);
        track(
          animate(
            "[data-hero-cue]",
            // Explicit start keyframes: the cue stays hidden through the delay,
            // then appears off-screen and slides to rest.
            { x: [dx, 0], y: [dy, 0], opacity: [1, 1] },
            { delay: CUE_PAUSE, duration: CUE_SLIDE, ease: CUE_EASE },
          ),
        );
      })();
    }

    return () => {
      cancelled = true;
      running.forEach((c) => c.stop());
    };
  }, [inView, reduce, animate, scope]);

  return (
    <div ref={scope} className="absolute inset-0">
      {children}
    </div>
  );
}
