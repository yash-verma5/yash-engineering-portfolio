"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Overlay from "@/components/Overlay";
import { useKonamiMode } from "@/components/KonamiProvider";
import {
  getSequenceSources,
  sequenceConfigs,
  SequenceConfig,
  SequenceKey
} from "@/lib/sequence";

type LoadedSequences = Partial<Record<SequenceKey, HTMLImageElement[]>>;
type LoadingProgress = Partial<Record<SequenceKey, number>>;

type IdleHandle = number | ReturnType<typeof globalThis.setTimeout>;

const requestIdle = (callback: () => void): IdleHandle => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, { timeout: 2200 });
  }

  return globalThis.setTimeout(callback, 900);
};

const cancelIdle = (id: IdleHandle) => {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(Number(id));
    return;
  }

  globalThis.clearTimeout(id);
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
  const { active: konamiActive } = useKonamiMode();
  const activeKey: SequenceKey = konamiActive ? "konami" : "default";
  const activeConfig = sequenceConfigs[activeKey];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sequencesRef = useRef<LoadedSequences>({});
  const mountedRef = useRef(true);
  const loadingRef = useRef<Partial<Record<SequenceKey, boolean>>>({});
  const latestFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [loadedKeys, setLoadedKeys] = useState<SequenceKey[]>([]);
  const [loadProgress, setLoadProgress] = useState<LoadingProgress>({});

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const isSequenceLoaded = useCallback(
    (key: SequenceKey) => loadedKeys.includes(key) && Boolean(sequencesRef.current[key]?.length),
    [loadedKeys]
  );

  const renderFrame = useCallback((index: number, key: SequenceKey = activeKey) => {
    const canvas = canvasRef.current;
    const frames = sequencesRef.current[key];
    const image = frames?.[index];

    if (!canvas || !image?.complete) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    drawCover(context, image, canvas);
  }, [activeKey]);

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

  const preloadSequence = useCallback((config: SequenceConfig) => {
    if (sequencesRef.current[config.key]?.length || loadingRef.current[config.key]) {
      return;
    }

    loadingRef.current[config.key] = true;
    let loadedImages = 0;
    const sources = getSequenceSources(config);

    const images = sources.map((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;

      const markLoaded = () => {
        if (!mountedRef.current) return;

        loadedImages += 1;
        setLoadProgress((current) => ({
          ...current,
          [config.key]: loadedImages / sources.length
        }));

        if (loadedImages === sources.length) {
          sequencesRef.current[config.key] = images;
          loadingRef.current[config.key] = false;
          setLoadedKeys((current) => (current.includes(config.key) ? current : [...current, config.key]));

          if (config.key === activeKey) {
            requestAnimationFrame(() => {
              sizeCanvas();
              renderFrame(latestFrameRef.current, config.key);
            });
          }
        }
      };

      image.onload = async () => {
        try {
          await image.decode();
        } catch {
          // Some browsers already decode before this promise resolves.
        }

        markLoaded();
      };

      image.onerror = markLoaded;

      return image;
    });

    sequencesRef.current[config.key] = images;
  }, [activeKey, renderFrame, sizeCanvas]);

  useEffect(() => {
    mountedRef.current = true;
    preloadSequence(sequenceConfigs.default);
    let idleId: IdleHandle | undefined;

    idleId = requestIdle(() => {
      preloadSequence(sequenceConfigs.konami);
    });

    return () => {
      mountedRef.current = false;
      if (idleId !== undefined) cancelIdle(idleId);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [preloadSequence]);

  useEffect(() => {
    preloadSequence(activeConfig);

    if (isSequenceLoaded(activeKey)) {
      const totalFrames = activeConfig.totalFrames;
      const frameIndex = Math.min(
        Math.floor(Math.min(1, Math.max(0, scrollYProgress.get())) * totalFrames),
        totalFrames - 1
      );
      latestFrameRef.current = frameIndex;
      requestAnimationFrame(() => renderFrame(frameIndex, activeKey));
    }
  }, [activeConfig, activeKey, isSequenceLoaded, preloadSequence, renderFrame, scrollYProgress]);

  useEffect(() => {
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    return () => window.removeEventListener("resize", sizeCanvas);
  }, [sizeCanvas]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const config = sequenceConfigs[activeKey];
    const clampedProgress = Math.min(1, Math.max(0, progress));
    const frameIndex = Math.min(
      Math.floor(clampedProgress * config.totalFrames),
      config.totalFrames - 1
    );

    if (frameIndex === latestFrameRef.current && isSequenceLoaded(activeKey)) return;

    latestFrameRef.current = frameIndex;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => renderFrame(frameIndex, activeKey));
  });

  const activeLoaded = isSequenceLoaded(activeKey);
  const firstLoad = !isSequenceLoaded("default");
  const currentProgress = loadProgress[activeKey] ?? 0;

  return (
    <div id="intro" ref={containerRef} className="relative h-[500vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-label="Animated portfolio sequence"
          className={`w-full h-full transition-opacity duration-500 ${
            activeLoaded || !firstLoad ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink/30 via-transparent to-ink/65" />
        {konamiActive && <div className="konami-scanlines pointer-events-none absolute inset-0 z-[2]" />}
        <Overlay progress={scrollYProgress} />

        <AnimatePresence>
          {firstLoad && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="fixed inset-0 z-50 grid place-items-center bg-ink"
            >
              <div className="w-80 px-6">
                <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/45">
                  <span className="font-semibold text-sky-200">preloading frame buffer</span>
                  <span className="font-bold text-white">{Math.round(currentProgress * 100)}%</span>
                </div>
                <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-sky-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentProgress * 100}%` }}
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
