"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type ValueAnimationTransition,
} from "framer-motion";

// Shot direction: unit vector along the cue's axis (tip end), stage/table px.
const DIR_X = -0.9918;
const DIR_Y = 0.1271;

// Cue ball, in pool-table.svg coordinates (table sits at stage 480,442).
const BALL_CX = 190.15;
const BALL_CY = 108.17;
const BALL_R = 33.36;

// Cue travel along DIR, in px. Tip meets the ball at CONTACT.
const DRAWBACK = -26;
const CONTACT = 37;
const FOLLOW_THROUGH = 45;

// Ball physics, px/s and px/s².
const V0 = 460;
const FRICTION = 300;
const V_MIN = 220;
const GRAVITY = 2600;
const EDGE_X = 8; // ball center x (table space) where it tips off the left edge
const OFFSCREEN_DY = 270; // fall distance that clears the bottom of the hero

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TABLE_SVG_PROPS = {
  width: 909,
  height: 236.002,
  viewBox: "0 0 909 236.002",
  fill: "none",
  className: "pointer-events-none absolute left-[480px] top-[442px] overflow-visible",
} as const;

export default function PoolShot({ children }: { children?: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const controlsRef = useRef<AnimationPlaybackControls[]>([]);
  const mountedRef = useRef(true);

  // cue: scalar offset along DIR (shot) + hover nudge
  const cueS = useMotionValue(0);
  const hoverS = useMotionValue(0);
  const cueX = useTransform(() => (cueS.get() + hoverS.get()) * DIR_X);
  const cueY = useTransform(() => (cueS.get() + hoverS.get()) * DIR_Y);

  // ball
  const ballX = useMotionValue(0);
  const ballY = useMotionValue(0);
  const ballRotate = useMotionValue(0);
  const ballScale = useMotionValue(1);
  const ballOpacity = useMotionValue(1);
  const squashX = useMotionValue(1);
  const squashY = useMotionValue(1);

  // ball shadow
  const shadowX = useMotionValue(0);
  const shadowY = useMotionValue(0);
  const shadowScale = useMotionValue(1);
  const shadowOpacity = useMotionValue(1);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      controlsRef.current.forEach((c) => c.stop());
    };
  }, []);

  const run = (
    value: MotionValue<number>,
    to: number | number[],
    options: ValueAnimationTransition<number>,
  ) => {
    const controls = animate(value, to, options);
    controlsRef.current.push(controls);
    return controls;
  };

  // Roll along DIR with friction, then fall off the edge under gravity.
  const rollBall = () =>
    new Promise<void>((resolve) => {
      let s = 0;
      let v = V0;
      let fallVy = 0;
      let falling = false;
      let fallY = 0;
      let last = performance.now();

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;

        if (!falling) {
          v = Math.max(v - FRICTION * dt, V_MIN);
          s += v * dt;
          ballX.set(s * DIR_X);
          ballY.set(s * DIR_Y);
          shadowX.set(s * DIR_X);
          shadowY.set(s * DIR_Y);

          if (BALL_CX + s * DIR_X <= EDGE_X) {
            falling = true;
            fallY = s * DIR_Y;
            fallVy = v * DIR_Y;
            run(shadowOpacity, 0, { duration: 0.2, ease: "easeOut" });
            run(shadowScale, 0.6, { duration: 0.2, ease: "easeOut" });
          }
        } else {
          fallVy += GRAVITY * dt;
          fallY += fallVy * dt;
          s += v * dt; // horizontal speed carries over; also drives spin
          ballX.set(s * DIR_X);
          ballY.set(fallY);
        }

        ballRotate.set((-s / BALL_R) * (180 / Math.PI));

        if (falling && fallY > OFFSCREEN_DY) {
          rafRef.current = null;
          resolve();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });

  const respawnBall = async () => {
    ballX.set(0);
    ballY.set(0);
    ballRotate.set(0);
    ballOpacity.set(0);
    ballScale.set(0.85);
    shadowX.set(0);
    shadowY.set(0);
    shadowScale.set(0.85);
    run(shadowOpacity, 1, { duration: 0.35, ease: "easeOut" });
    run(shadowScale, 1, { type: "spring", stiffness: 260, damping: 18 });
    run(ballOpacity, 1, { duration: 0.3, ease: "easeOut" });
    await run(ballScale, 1, { type: "spring", stiffness: 260, damping: 18 });
  };

  const shoot = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    run(hoverS, 0, { duration: 0.15 });

    if (reduceMotion) {
      await run(cueS, 8, { duration: 0.12 });
      run(cueS, 0, { duration: 0.2 });
      await run(ballOpacity, 0, { duration: 0.3 });
      shadowOpacity.set(0);
      await sleep(400);
      if (!mountedRef.current) return;
      await respawnBall();
    } else {
      // drawback + hold
      await run(cueS, DRAWBACK, { duration: 0.42, ease: [0.33, 0, 0.2, 1] });
      await sleep(90);
      if (!mountedRef.current) return;

      // strike — the ball launches the frame the tip reaches it
      let ballDone: Promise<void> = Promise.resolve();
      let hit = false;
      const unsubscribe = cueS.on("change", (s) => {
        if (hit || s < CONTACT) return;
        hit = true;
        run(squashX, [1, 0.93, 1], { duration: 0.14, times: [0, 0.5, 1] });
        run(squashY, [1, 1.04, 1], { duration: 0.14, times: [0, 0.5, 1] });
        ballDone = rollBall();
      });
      await run(cueS, FOLLOW_THROUGH, { duration: 0.12, ease: [0.55, 0, 1, 0.6] });
      unsubscribe();

      // follow-through hold, then the cue eases back to rest
      await sleep(180);
      if (!mountedRef.current) return;
      const cueBack = run(cueS, 0, { duration: 0.7, ease: [0.4, 0, 0.2, 1] });

      await Promise.all([ballDone, cueBack]);
      await sleep(500);
      if (!mountedRef.current) return;
      await respawnBall();
    }

    controlsRef.current = [];
    busyRef.current = false;
    setBusy(false);
  };

  const nudge = (to: number) => {
    if (busyRef.current) return;
    run(hoverS, to, { type: "spring", stiffness: 300, damping: 20 });
  };

  return (
    <>
      {/* moving pieces, drawn in table coordinates (table box at stage 480,442) */}
      <svg aria-hidden {...TABLE_SVG_PROPS}>
        <defs>
          <clipPath id="poolshot-table-clip">
            <ellipse cx="454.5" cy="132.002" rx="454.5" ry="104" />
          </clipPath>
        </defs>

        {/* cue shadow */}
        <g clipPath="url(#poolshot-table-clip)">
          <motion.path
            style={{ x: cueX, y: cueY }}
            d="M276.54 123.979L1000 72.056L1000 91.953L555.78 116.136L276.501 131.34L276.54 123.979Z"
            fill="#660000"
          />
        </g>
      </svg>

      {/* object balls sit above the cue shadow */}
      {children}

      <svg aria-hidden {...TABLE_SVG_PROPS}>

        {/* ball shadow */}
        <motion.g
          style={{ x: shadowX, y: shadowY, scale: shadowScale, opacity: shadowOpacity }}
        >
          <ellipse
            cx="46.7848"
            cy="18.4662"
            rx="46.7848"
            ry="18.4662"
            transform="matrix(-0.990863 -0.134872 -0.134872 0.990863 260 115.705)"
            fill="#660000"
          />
        </motion.g>

        {/* cue ball */}
        <motion.g
          style={{ x: ballX, y: ballY, scale: ballScale, opacity: ballOpacity }}
          className={busy ? "" : "pointer-events-auto cursor-pointer"}
          onClick={shoot}
          onPointerEnter={() => nudge(-6)}
          onPointerLeave={() => nudge(0)}
        >
          <motion.g style={{ scaleX: squashX, scaleY: squashY }}>
            <motion.g style={{ rotate: ballRotate }}>
              <circle cx={BALL_CX} cy={BALL_CY} r={BALL_R} fill="#FCFFF2" />
              {/* mascot face — Figma "Group 179942123" (8924:3263), drawn at r=64.81 */}
              <g transform={`translate(${BALL_CX} ${BALL_CY}) scale(${BALL_R / 64.81})`}>
                <image
                  href="/hero/smiley/eyes.svg"
                  width={40.5939}
                  height={15.7771}
                  transform="translate(-13.4 -32.2) rotate(27.65) scale(-1 1) translate(-20.297 -7.889)"
                />
                <image
                  href="/hero/smiley/smile.svg"
                  width={35.0196}
                  height={11.284}
                  transform="translate(-21.5 -13.25) rotate(25.16) translate(-17.51 -5.642)"
                />
              </g>
            </motion.g>
          </motion.g>
        </motion.g>
      </svg>

      {/* pool cue */}
      <motion.button
        type="button"
        aria-label="Take the shot"
        disabled={busy}
        onClick={shoot}
        onPointerEnter={() => nudge(-6)}
        onPointerLeave={() => nudge(0)}
        style={{ x: cueX, y: cueY }}
        className="absolute left-[737px] top-[438.98px] cursor-pointer disabled:cursor-default"
      >
        <Image
          src="/hero/cue.svg"
          alt=""
          aria-hidden
          width={696.486}
          height={105.807}
          className="block max-w-none"
        />
      </motion.button>
    </>
  );
}
