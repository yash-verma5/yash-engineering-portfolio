"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Overlay from "@/components/Overlay";
import { frameSources } from "@/lib/sequence";

const TOTAL_FRAMES = 89;
const sequenceFrames = frameSources.slice(0, TOTAL_FRAMES);

type DebugState = {
  progress: number;
  frame: number;
};

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) {
  const { width, height } = canvas;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = width / height;

  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > canvasRatio) {
    sourceWidth = image.naturalHeight * canvasRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / canvasRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height
  );
}

export default function ScrollyCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const latestFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [debug, setDebug] = useState<DebugState>({ progress: 0, frame: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const image = framesRef.current[index];

    if (!canvas || !image?.complete) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    drawCover(context, image, canvas);
  }, []);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !sticky) return;

    const width = Math.max(1, Math.floor(sticky.clientWidth || window.innerWidth));
    const height = Math.max(1, Math.floor(sticky.clientHeight || window.innerHeight));

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    renderFrame(latestFrameRef.current);
  }, [renderFrame]);

  useEffect(() => {
    let cancelled = false;
    let loadedImages = 0;

    const images = sequenceFrames.map((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;

      image.onload = async () => {
        try {
          await image.decode();
        } catch {
          // Some browsers resolve onload after decode; keep going either way.
        }

        if (cancelled) return;

        loadedImages += 1;
        setLoadProgress(loadedImages / sequenceFrames.length);

        if (loadedImages === sequenceFrames.length) {
          framesRef.current = images;
          setLoaded(true);
          requestAnimationFrame(() => {
            sizeCanvas();
            renderFrame(0);
          });
        }
      };

      return image;
    });

    framesRef.current = images;

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [renderFrame, sizeCanvas]);

  useEffect(() => {
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    return () => window.removeEventListener("resize", sizeCanvas);
  }, [sizeCanvas]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const clampedProgress = Math.min(1, Math.max(0, progress));
    const frameIndex = Math.min(
      Math.floor(clampedProgress * sequenceFrames.length),
      sequenceFrames.length - 1
    );

    latestFrameRef.current = frameIndex;
    setDebug({ progress: clampedProgress, frame: frameIndex });

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => renderFrame(frameIndex));
  });

  return (
    <div id="intro" ref={containerRef} className="relative h-[500vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-label="Animated portfolio sequence"
          className={`w-full h-full transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink/30 via-transparent to-ink/65" />
        <Overlay progress={scrollYProgress} />

        <div className="fixed left-4 top-4 z-[9998] rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-[11px] text-sky-100 backdrop-blur-md">
          progress {debug.progress.toFixed(2)} / frame {debug.frame}
        </div>

        <AnimatePresence>
          {!loaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="fixed inset-0 z-50 grid place-items-center bg-ink"
            >
              <div className="w-80 px-6">
                <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/45">
                  <span className="font-semibold text-sky-200">preloading frame buffer</span>
                  <span className="font-bold text-white">{Math.round(loadProgress * 100)}%</span>
                </div>
                <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-sky-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadProgress * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
