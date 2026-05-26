"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI_CODE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a"
];

export default function EasterEggController() {
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [keys, setKeys] = useState<string[]>([]);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const deactivateCyberpunkMode = useCallback(() => {
    setActive(false);
    document.documentElement.classList.remove("cyberpunk-mode");
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  }, []);

  const triggerCyberpunkMode = useCallback(() => {
    if (active) return;
    setActive(true);
    setCountdown(30);
    document.documentElement.classList.add("cyberpunk-mode");

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.3);
    } catch {
      // Audio is optional and can be blocked by browser policy.
    }

    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          deactivateCyberpunkMode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [active, deactivateCyberpunkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      setKeys((prevKeys) => {
        const nextKeys = [...prevKeys, key].slice(-KONAMI_CODE.length);
        const matches = nextKeys.every((val, index) => val === KONAMI_CODE[index]);

        if (matches) {
          triggerCyberpunkMode();
          return [];
        }

        return nextKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerCyberpunkMode]);

  useEffect(() => {
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      document.documentElement.classList.remove("cyberpunk-mode");
    };
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-6 right-6 z-[9999] max-w-sm rounded-xl border border-rose-500/30 bg-black/90 p-5 font-mono shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-4">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
            </span>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                SYSTEM OVERRIDE ACTIVE
              </h4>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-cyan-400">
                CYBERPUNK NEON GLITCH V1.0.0
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-rose-500">
                {String(countdown).padStart(2, "0")}s
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-rose-500/10 pt-3 text-[9px] uppercase tracking-widest text-white/50">
            <span>KONAMI UNLOCKED</span>
            <button
              type="button"
              onClick={deactivateCyberpunkMode}
              className="cursor-pointer text-rose-400 underline transition-colors hover:text-white"
            >
              RESTORE ENGINE
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
