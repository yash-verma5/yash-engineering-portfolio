"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Overlay from "@/components/Overlay";
import { useKonamiMode } from "@/components/KonamiProvider";
import {
  getRuntimeSequenceConfig,
  getSequenceSource,
  RuntimeSequenceConfig,
  SequenceKey
} from "@/lib/sequence";

type SequenceCache = Partial<Record<SequenceKey, Array<HTMLImageElement | undefined>>>;
type LoadedIndexSets = Partial<Record<SequenceKey, Set<number>>>;
type LoadingIndexSets = Partial<Record<SequenceKey, Set<number>>>;
type SequenceProgress = Partial<Record<SequenceKey, number>>;
type IdleHandle = number | ReturnType<typeof globalThis.setTimeout>;

type LoadMode = "initial" | "background";

const MOBILE_QUERY = "(max-width: 768px), (pointer: coarse)";

const requestIdle = (callback: () => void, timeout = 1800): IdleHandle => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, { timeout });
  }

  return globalThis.setTimeout(callback, Math.min(timeout, 1200));
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

function nearestLoadedFrame(targetIndex: number, loadedIndexes?: Set<number>) {
  if (!loadedIndexes?.size) return -1;
  if (loadedIndexes.has(targetIndex)) return targetIndex;

  for (let index = targetIndex - 1; index >= 0; index -= 1) {
    if (loadedIndexes.has(index)) return index;
  }

  const loadedArray = Array.from(loadedIndexes);
  const maxLoadedIndex = loadedArray.length ? Math.max(...loadedArray) : targetIndex;

  for (let index = targetIndex + 1; index <= maxLoadedIndex; index += 1) {
    if (loadedIndexes.has(index)) return index;
  }

  return -1;
}

export default function ScrollyCanvas() {
  const { active: konamiActive } = useKonamiMode();
  const [preferMobile, setPreferMobile] = useState(false);
  const activeKey: SequenceKey = konamiActive ? "konami" : "default";
  const activeConfig = getRuntimeSequenceConfig(activeKey, { preferMobile });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sequenceCacheRef = useRef<SequenceCache>({});
  const loadedIndexesRef = useRef<LoadedIndexSets>({});
  const loadingIndexesRef = useRef<LoadingIndexSets>({});
  const activeConfigRef = useRef(activeConfig);
  const mountedRef = useRef(true);
  const latestFrameRef = useRef(0);
  const latestKeyRef = useRef<SequenceKey>(activeKey);
  const rafRef = useRef<number | null>(null);
  const idleHandlesRef = useRef<IdleHandle[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [loadProgress, setLoadProgress] = useState<SequenceProgress>({});

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    activeConfigRef.current = activeConfig;
  }, [activeConfig]);

  const ensureSequenceStores = useCallback((key: SequenceKey) => {
    if (!sequenceCacheRef.current[key]) sequenceCacheRef.current[key] = [];
    if (!loadedIndexesRef.current[key]) loadedIndexesRef.current[key] = new Set<number>();
    if (!loadingIndexesRef.current[key]) loadingIndexesRef.current[key] = new Set<number>();
  }, []);

  const updateProgress = useCallback((config: RuntimeSequenceConfig) => {
    const loaded = loadedIndexesRef.current[config.key]?.size ?? 0;
    setLoadProgress((current) => ({
      ...current,
      [config.key]: loaded / config.totalFrames
    }));
  }, []);

  const renderFrame = useCallback((index: number, key: SequenceKey = latestKeyRef.current) => {
    const canvas = canvasRef.current;
    const loadedIndex = nearestLoadedFrame(index, loadedIndexesRef.current[key]);
    const image = loadedIndex >= 0 ? sequenceCacheRef.current[key]?.[loadedIndex] : undefined;

    if (!canvas || !image?.complete) return false;

    const context = canvas.getContext("2d");
    if (!context) return false;

    drawCover(context, image, canvas);
    return true;
  }, []);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !sticky) return;

    const width = Math.max(1, Math.floor(sticky.clientWidth || window.innerWidth));
    const height = Math.max(1, Math.floor(sticky.clientHeight || window.innerHeight));

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    renderFrame(latestFrameRef.current, latestKeyRef.current);
  }, [renderFrame]);

  const loadFrame = useCallback((config: RuntimeSequenceConfig, index: number) => {
    ensureSequenceStores(config.key);

    const loadedIndexes = loadedIndexesRef.current[config.key];
    const loadingIndexes = loadingIndexesRef.current[config.key];
    const cache = sequenceCacheRef.current[config.key];

    if (!loadedIndexes || !loadingIndexes || !cache) return Promise.resolve();
    if (loadedIndexes.has(index) || loadingIndexes.has(index)) return Promise.resolve();

    loadingIndexes.add(index);

    return new Promise<void>((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.src = getSequenceSource(config, index);

      const complete = async () => {
        try {
          if (image.complete) await image.decode();
        } catch {
          // Decode can fail for cached/partially decoded images; keep progressive loading moving.
        }

        if (!mountedRef.current) {
          resolve();
          return;
        }

        cache[index] = image;
        loadedIndexes.add(index);
        loadingIndexes.delete(index);
        updateProgress(config);

        if (config.key === latestKeyRef.current) {
          const targetFrame = latestFrameRef.current;
          if (index === targetFrame || index === 0) {
            requestAnimationFrame(() => {
              renderFrame(targetFrame, config.key);
              if (config.key === "default" && loadedIndexes.has(0)) setRevealed(true);
            });
          }
        }

        resolve();
      };

      image.onload = complete;
      image.onerror = () => {
        loadingIndexes.delete(index);
        updateProgress(config);
        resolve();
      };
    });
  }, [ensureSequenceStores, renderFrame, updateProgress]);

  const loadFramesWithLimit = useCallback(async (
    config: RuntimeSequenceConfig,
    indexes: number[],
    concurrency: number
  ) => {
    const queue = [...indexes];
    const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
      while (queue.length && mountedRef.current) {
        const index = queue.shift();
        if (index === undefined) return;
        await loadFrame(config, index);
      }
    });

    await Promise.all(workers);
  }, [loadFrame]);

  const scheduleBackgroundLoad = useCallback((config: RuntimeSequenceConfig, startIndex: number) => {
    const loadBatch = (cursor: number) => {
      if (!mountedRef.current || cursor >= config.totalFrames) return;

      const indexes = Array.from(
        { length: Math.min(config.backgroundBatchSize, config.totalFrames - cursor) },
        (_, offset) => cursor + offset
      );

      loadFramesWithLimit(config, indexes, config.concurrency).finally(() => {
        const idleId = requestIdle(() => loadBatch(cursor + config.backgroundBatchSize), 2400);
        idleHandlesRef.current.push(idleId);
      });
    };

    const idleId = requestIdle(() => loadBatch(startIndex), 1400);
    idleHandlesRef.current.push(idleId);
  }, [loadFramesWithLimit]);

  const startSequenceLoad = useCallback((config: RuntimeSequenceConfig, mode: LoadMode) => {
    ensureSequenceStores(config.key);

    const firstBatchEnd = Math.min(config.initialFramesToLoad, config.totalFrames);
    const initialIndexes = Array.from({ length: firstBatchEnd }, (_, index) => index);

    loadFrame(config, 0).then(() => {
      if (config.key === "default") setRevealed(true);
      renderFrame(latestFrameRef.current, config.key);
    });

    if (mode === "initial") {
      loadFramesWithLimit(config, initialIndexes.slice(1), config.concurrency).finally(() => {
        scheduleBackgroundLoad(config, firstBatchEnd);
      });
    } else {
      loadFramesWithLimit(config, initialIndexes.slice(1), Math.min(2, config.concurrency)).finally(() => {
        scheduleBackgroundLoad(config, firstBatchEnd);
      });
    }
  }, [ensureSequenceStores, loadFrame, loadFramesWithLimit, renderFrame, scheduleBackgroundLoad]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const updatePreference = () => {
      const lowMemory = "deviceMemory" in navigator && Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory) <= 4;
      setPreferMobile(media.matches || lowMemory);
    };

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const defaultConfig = getRuntimeSequenceConfig("default", { preferMobile });
    startSequenceLoad(defaultConfig, "initial");

    return () => {
      mountedRef.current = false;
      idleHandlesRef.current.forEach(cancelIdle);
      idleHandlesRef.current = [];
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [preferMobile, startSequenceLoad]);

  useEffect(() => {
    latestKeyRef.current = activeKey;

    if (activeKey === "konami") {
      startSequenceLoad(activeConfig, "background");
    }

    const frameIndex = Math.min(
      Math.floor(Math.min(1, Math.max(0, scrollYProgress.get())) * activeConfig.totalFrames),
      activeConfig.totalFrames - 1
    );

    latestFrameRef.current = frameIndex;
    requestAnimationFrame(() => renderFrame(frameIndex, activeKey));
  }, [activeConfig, activeKey, renderFrame, scrollYProgress, startSequenceLoad]);

  useEffect(() => {
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    return () => window.removeEventListener("resize", sizeCanvas);
  }, [sizeCanvas]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const config = activeConfigRef.current;
    const clampedProgress = Math.min(1, Math.max(0, progress));
    const frameIndex = Math.min(
      Math.floor(clampedProgress * config.totalFrames),
      config.totalFrames - 1
    );

    if (frameIndex === latestFrameRef.current) return;

    latestFrameRef.current = frameIndex;
    loadFrame(config, frameIndex);

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => renderFrame(frameIndex, config.key));
  });

  const currentProgress = loadProgress.default ?? 0;

  return (
    <div id="intro" ref={containerRef} className="relative h-[500vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-label="Animated portfolio sequence"
          className={`w-full h-full transition-opacity duration-500 ${revealed ? "opacity-100" : "opacity-0"}`}
        />

        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink/30 via-transparent to-ink/65" />
        {konamiActive && <div className="konami-scanlines pointer-events-none absolute inset-0 z-[2]" />}
        <Overlay progress={scrollYProgress} />

        <AnimatePresence>
          {!revealed && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-50 grid place-items-center bg-ink"
            >
              <div className="w-80 px-6">
                <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/45">
                  <span className="font-semibold text-sky-200">loading first frame</span>
                  <span className="font-bold text-white">{Math.max(1, Math.round(currentProgress * 100))}%</span>
                </div>
                <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-sky-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(8, currentProgress * 100)}%` }}
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
