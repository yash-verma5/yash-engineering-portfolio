"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useKonamiMode } from "@/components/KonamiProvider";

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

function playActivationTone() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(82, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.9);
    gain.gain.setValueAtTime(0.045, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.05);
  } catch {
    // Browser audio policy may block this; the visual mode still works.
  }
}

export default function EasterEggController() {
  const { active, countdown, activate, deactivate } = useKonamiMode();
  const [keys, setKeys] = useState<string[]>([]);
  const [pulse, setPulse] = useState(false);

  const triggerKonamiMode = useCallback(() => {
    activate();
    setPulse(true);
    playActivationTone();
    window.setTimeout(() => setPulse(false), 850);
  }, [activate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      setKeys((prevKeys) => {
        const nextKeys = [...prevKeys, key].slice(-KONAMI_CODE.length);
        const matches = nextKeys.every((val, index) => val === KONAMI_CODE[index]);

        if (matches) {
          triggerKonamiMode();
          return [];
        }

        return nextKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerKonamiMode]);

  return (
    <>
      <AnimatePresence>
        {pulse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-[9997] bg-[radial-gradient(circle_at_center,rgba(103,232,249,0.18),rgba(251,146,60,0.08)_34%,transparent_68%)]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed bottom-6 right-6 z-[9999] max-w-sm rounded-lg border border-cyan-200/20 bg-[#03070d]/88 p-5 font-mono shadow-2xl shadow-cyan-950/30 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-200 opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-300" />
              </span>
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">
                  Alternate Layer Active
                </h4>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-orange-200/70">
                  Konami sequence linked to scroll
                </p>
              </div>
              <span className="text-2xl font-black text-orange-200">
                {String(countdown).padStart(2, "0")}s
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-cyan-200/10 pt-3 text-[9px] uppercase tracking-widest text-white/45">
              <span>Reality Override</span>
              <button
                type="button"
                onClick={deactivate}
                className="cursor-pointer text-cyan-100 underline underline-offset-4 transition-colors hover:text-white"
              >
                Restore
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
