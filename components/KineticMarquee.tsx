"use client";

import { PointerEvent, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { wrap } from "framer-motion";

interface KineticMarqueeProps {
  text: string;
  speed?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (current: number, target: number, amount: number) => current + (target - current) * amount;

export default function KineticMarquee({ text, speed = 0.075 }: KineticMarqueeProps) {
  const reduceMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const directionRef = useRef(1);
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const suppressHoverPauseRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const currentVelocityRef = useRef(0);
  const momentumVelocityRef = useRef(0);
  const autoplayStrengthRef = useRef(1);

  const setAutoplayPaused = (paused: boolean) => {
    if (paused) {
      autoplayStrengthRef.current = Math.min(autoplayStrengthRef.current, 0.92);
    }
  };

  const getDragScale = () => {
    const width = trackRef.current?.scrollWidth || window.innerWidth || 1;
    return 100 / width;
  };

  const handlePointerEnter = () => {
    hoveredRef.current = true;
    if (!suppressHoverPauseRef.current) setAutoplayPaused(true);
  };

  const handlePointerLeave = () => {
    hoveredRef.current = false;
    suppressHoverPauseRef.current = false;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    suppressHoverPauseRef.current = true;
    lastPointerXRef.current = event.clientX;
    lastPointerTimeRef.current = event.timeStamp;
    dragVelocityRef.current = 0;
    momentumVelocityRef.current = 0;
    currentVelocityRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    const deltaPx = event.clientX - lastPointerXRef.current;
    const deltaTime = Math.max(8, event.timeStamp - lastPointerTimeRef.current);
    const deltaPercent = deltaPx * getDragScale();

    lastPointerXRef.current = event.clientX;
    lastPointerTimeRef.current = event.timeStamp;
    dragVelocityRef.current = clamp((deltaPercent / deltaTime) * 16, -1.2, 1.2);
    baseX.set(baseX.get() + deltaPercent);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }

    const releaseVelocity = dragVelocityRef.current;
    if (Math.abs(releaseVelocity) > 0.015) {
      directionRef.current = releaseVelocity >= 0 ? 1 : -1;
      momentumVelocityRef.current = clamp(releaseVelocity * 1.65, -1.6, 1.6);
    }
  };

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;

    const frameScale = delta / 16;

    if (draggingRef.current) {
      autoplayStrengthRef.current = lerp(autoplayStrengthRef.current, 0, 0.22);
      return;
    }

    const shouldPause = hoveredRef.current && !suppressHoverPauseRef.current;
    autoplayStrengthRef.current = lerp(autoplayStrengthRef.current, shouldPause ? 0 : 1, shouldPause ? 0.075 : 0.045);

    const autoplayVelocity = directionRef.current * speed * autoplayStrengthRef.current;
    momentumVelocityRef.current *= Math.pow(0.925, frameScale);

    if (Math.abs(momentumVelocityRef.current) < 0.006) {
      momentumVelocityRef.current = 0;
    }

    const targetVelocity = autoplayVelocity + momentumVelocityRef.current;
    currentVelocityRef.current = lerp(currentVelocityRef.current, targetVelocity, 0.09);

    if (Math.abs(currentVelocityRef.current) > 0.0005) {
      baseX.set(baseX.get() + currentVelocityRef.current * frameScale);
    }
  });

  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`);

  return (
    <div
      className="relative w-full touch-pan-y overflow-hidden border-y border-white/[0.03] bg-[#05060a]/80 py-10 backdrop-blur-lg md:py-14"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[10rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-3xl" />

      <div className="flex w-max flex-nowrap whitespace-nowrap">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex cursor-grab whitespace-nowrap text-4xl font-light uppercase tracking-[0.2em] text-white/20 select-none active:cursor-grabbing md:text-7xl"
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <span key={idx} className="flex items-center gap-12 px-6">
              <span className="bg-gradient-to-r from-sky-400/30 to-emerald-400/30 bg-clip-text font-extrabold text-transparent">
                {text}
              </span>
              <span className="text-sky-400/40">•</span>
              <span className="font-light text-white/10 transition duration-500 hover:text-sky-300/40">
                KINETIC ENGINE
              </span>
              <span className="text-sky-400/40">•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
