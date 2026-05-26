"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue
} from "framer-motion";
import { wrap } from "framer-motion";

interface KineticMarqueeProps {
  text: string;
  speed?: number;
}

export default function KineticMarquee({ text, speed = 1.2 }: KineticMarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  
  // Track scroll velocity in pixels per ms
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300
  });

  // Calculate speed factor from velocity (e.g. scroll speed can increase marquee pace up to 8x)
  const velocityFactor = useTransform(smoothVelocity, [-3000, 0, 3000], [-8, 1, 8]);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((time, delta) => {
    let moveBy = directionFactor.current * speed * (delta / 16); // Normalize to 60fps delta

    // Add scroll velocity boost
    const currentVelocity = velocityFactor.get();
    moveBy += currentVelocity * 0.8;

    // Constrain direction factor
    if (currentVelocity < 0) {
      directionFactor.current = -1;
    } else if (currentVelocity > 0) {
      directionFactor.current = 1;
    }

    baseX.set(baseX.get() + moveBy);
  });

  // Wrap around infinite container (50% translation for two repeating blocks)
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  return (
    <div className="relative overflow-hidden w-full bg-[#05060a]/80 py-10 md:py-14 border-y border-white/[0.03] backdrop-blur-lg">
      {/* Background radial accent glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[10rem] rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

      <div className="flex w-max flex-nowrap whitespace-nowrap">
        <motion.div 
          style={{ x }} 
          className="flex whitespace-nowrap text-4xl font-light uppercase tracking-[0.2em] text-white/20 md:text-7xl select-none"
        >
          {/* Duplicate text array to ensure seamless infinite looping */}
          {Array.from({ length: 4 }).map((_, idx) => (
            <span key={idx} className="flex items-center gap-12 px-6">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400/30 to-emerald-400/30">
                {text}
              </span>
              <span className="text-sky-400/40">•</span>
              <span className="font-light text-white/10 hover:text-sky-300/40 transition duration-500">
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
