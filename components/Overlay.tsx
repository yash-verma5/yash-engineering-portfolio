import { useState, useRef } from "react";
import { motion, MotionValue, useTransform, useVelocity, useSpring } from "framer-motion";

type OverlayProps = {
  progress: MotionValue<number>;
  reduceMotion?: boolean;
};

function CopyBlock({
  progress,
  range,
  xRange,
  align,
  eyebrow,
  title,
  body,
  reduceMotion = false
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  xRange: [number, number];
  align: "center" | "left" | "right";
  eyebrow: string;
  title: string;
  body: string;
  reduceMotion?: boolean;
}) {
  // Click-glitch Easter Egg state
  const [clickCount, setClickCount] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = () => {
    // Only enable glitch for the introductory Hero section
    if (eyebrow !== "Portfolio 2026") return;

    setClickCount((prev) => prev + 1);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);

    if (clickCount + 1 >= 5) {
      setIsGlitching(true);
      setClickCount(0);

      // Play audio glitch synth
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(90, audioCtx.currentTime);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.12);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.24);
        
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch (_) {}

      setTimeout(() => {
        setIsGlitching(false);
      }, 700);
    }
  };

  // Interpolated progress-based animations
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [60, 0, 0, -60]);
  const x = useTransform(progress, [range[0], range[3]], xRange);

  // Dynamic Variable Font-Weight: Gets bold in focus, light on entry/exit
  const fontWeight = useTransform(
    progress,
    [range[0], (range[1] + range[2]) / 2, range[3]],
    [300, 700, 300]
  );

  // Progressive entrance spatial blur (gives theatrical entry)
  const spatialBlur = useTransform(
    progress,
    [range[0], range[1], range[2], range[3]],
    [10, 0, 0, 10]
  );

  // --- Scroll Velocity Physics ---
  const scrollVelocity = useVelocity(progress);
  
  // Smooth the raw velocity values using spring physics
  const velocitySpring = useSpring(scrollVelocity, {
    stiffness: 180,
    damping: 30
  });

  // Skew, scale, blur, and chromatic aberration reactive to velocity
  const skewY = useTransform(velocitySpring, [-1, 0, 1], [-10, 0, 10]);
  const scaleY = useTransform(velocitySpring, [-1, 0, 1], [1.12, 1, 1.12]);
  
  const velocityBlurVal = useTransform(velocitySpring, [-1.2, 0, 1.2], [6, 0, 6]);
  const textShadowVal = useTransform(
    velocitySpring,
    [-1.2, 0, 1.2],
    [
      "-4px 0 0 rgba(255, 0, 127, 0.75), 4px 0 0 rgba(0, 255, 255, 0.75)",
      "0px 0px 0px rgba(0,0,0,0)",
      "-4px 0 0 rgba(255, 0, 127, 0.75), 4px 0 0 rgba(0, 255, 255, 0.75)"
    ]
  );

  // Combine Spatial entrance blur and scroll Velocity blur
  const filterVal = useTransform(
    [spatialBlur, velocityBlurVal],
    ([spatial, velocity]) => {
      if (reduceMotion) return "none";
      return `blur(${Number(spatial) + Number(velocity)}px)`;
    }
  );

  const alignment =
    align === "center"
      ? "mx-auto items-center text-center"
      : align === "left"
        ? "mr-auto items-start text-left"
        : "ml-auto items-end text-right";

  return (
    <motion.section
      style={{
        opacity,
        x: reduceMotion ? 0 : x,
        y: reduceMotion ? 0 : y,
        scaleY: reduceMotion ? 1 : scaleY,
        skewY: reduceMotion ? 0 : skewY,
        filter: filterVal,
        textShadow: reduceMotion ? "none" : textShadowVal,
        fontWeight
      }}
      className={`absolute inset-x-5 top-1/2 flex max-w-4xl -translate-y-1/2 flex-col ${alignment} md:inset-x-12`}
    >
      <span className="mb-6 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-sky-200/90 backdrop-blur-md">
        {eyebrow}
      </span>
      <h2 
        onClick={handleTitleClick}
        className={`max-w-5xl text-balance text-4xl font-light leading-[0.9] tracking-[-0.04em] text-white md:text-8xl select-none ${
          eyebrow === "Portfolio 2026" ? "cursor-pointer hover:text-sky-300 transition duration-300 active:scale-[0.99]" : ""
        } ${isGlitching ? "animate-glitch-active" : ""}`}
      >
        {title}
      </h2>
      <p className="mt-8 max-w-xl text-sm leading-7 text-white/55 md:text-lg">
        {body}
      </p>
    </motion.section>
  );
}


export default function Overlay({ progress, reduceMotion = false }: OverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(1,8,19,0.22)_50%,rgba(1,8,19,0.75)_100%)]" />

        {/* Copy Block 1: Intro */}
        <CopyBlock
          progress={progress}
          range={[0, 0.03, 0.16, 0.25]}
          xRange={[0, -32]}
          align="center"
          eyebrow="Portfolio 2026"
          title="Kinetic Systems & Creative Code."
          body="I craft premium digital interfaces where physics, cinematic motion, and detailed engineering land in the same viewport."
          reduceMotion={reduceMotion}
        />

        {/* Copy Block 2: Interaction */}
        <CopyBlock
          progress={progress}
          range={[0.22, 0.29, 0.43, 0.52]}
          xRange={[-48, 12]}
          align="left"
          eyebrow="01. Scroll Engine"
          title="Making code feel physically alive."
          body="From micro-interaction feedback to scroll scrubbing sequences, every transition is designed to feel precise, fluid, and weighted."
          reduceMotion={reduceMotion}
        />

        {/* Copy Block 3: Engineering */}
        <CopyBlock
          progress={progress}
          range={[0.52, 0.6, 0.74, 0.83]}
          xRange={[48, -12]}
          align="right"
          eyebrow="02. Core Architecture"
          title="Resilient systems. No compromises."
          body="I bridge high-end conceptual design with modular front-end architecture that runs flawlessly across real browsers."
          reduceMotion={reduceMotion}
        />

        {/* Continuous scroll invite indicator */}
        <motion.div
          style={{
            opacity: useTransform(progress, [0, 0.03, 0.82, 0.92], [0.6, 0.2, 0, 1]),
            y: useTransform(progress, [0.82, 1], [40, 0])
          }}
          className="absolute inset-x-6 bottom-10 mx-auto flex max-w-7xl items-end justify-between gap-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40 md:inset-x-12"
        >
          <span>Selected Case Studies</span>
          <span className="hidden md:block">Keep scrolling to explore</span>
        </motion.div>
      </div>
    </div>
  );
}
