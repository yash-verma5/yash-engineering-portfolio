"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useKonamiMode } from "@/components/KonamiProvider";
import { navItems, profile } from "@/lib/content";

export default function Navbar() {
  const { activate } = useKonamiMode();
  const [activeSection, setActiveSection] = useState("intro");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const secretTapCountRef = useRef(0);
  const secretTapTimerRef = useRef<number | null>(null);
  const scrolledRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  const activeIndex = Math.max(
    navItems.findIndex((item) => item.id === activeSection),
    0
  );
  const activeItem = navItems[activeIndex] ?? navItems[0];
  const navProgress = ((activeIndex + 1) / navItems.length) * 100;
  const navEase = [0.16, 1, 0.3, 1] as const;
  const navTransition = {
    duration: shouldReduceMotion ? 0 : 0.68,
    ease: navEase
  };

  useEffect(() => {
    const updateNavbarState = () => {
      const shouldBeScrolled = scrolledRef.current
        ? window.scrollY > 24
        : window.scrollY > 72;

      if (shouldBeScrolled !== scrolledRef.current) {
        scrolledRef.current = shouldBeScrolled;
        setScrolled(shouldBeScrolled);
      }

      const active = navItems.reduce((current, item) => {
        const section = document.getElementById(item.id);
        if (!section) return current;

        const top = section.getBoundingClientRect().top;
        return top <= window.innerHeight * 0.42 ? item.id : current;
      }, "intro");

      setActiveSection(active);
    };

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;

      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateNavbarState();
      });
    };

    updateNavbarState();
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleBrandTap = () => {
    scrollTo("intro");
    secretTapCountRef.current += 1;

    if (secretTapTimerRef.current) {
      window.clearTimeout(secretTapTimerRef.current);
    }

    secretTapTimerRef.current = window.setTimeout(() => {
      secretTapCountRef.current = 0;
    }, 1400);

    if (secretTapCountRef.current >= 5) {
      secretTapCountRef.current = 0;
      activate();
    }
  };

  useEffect(() => {
    return () => {
      if (secretTapTimerRef.current) {
        window.clearTimeout(secretTapTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 1.2,
        ease: navEase,
        delay: shouldReduceMotion ? 0 : 0.8
      }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 py-5 md:py-6"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-full border-b border-white/[0.04] bg-ink/30 shadow-lg shadow-black/10 backdrop-blur-xl"
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={navTransition}
      />

      <motion.div
        className="pointer-events-auto mx-auto flex max-w-[92rem] items-center justify-between px-5 md:px-8"
        animate={{
          y: scrolled ? -3 : 8,
          scale: scrolled ? 0.992 : 1
        }}
        transition={navTransition}
      >
        <button
          type="button"
          className="interactive group flex cursor-pointer items-center gap-3"
          onClick={handleBrandTap}
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 transition-colors group-hover:bg-sky-400" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 transition-colors group-hover:bg-sky-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.26em] text-white/90 transition duration-300 group-hover:text-white">
            {profile.name}
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1.5 backdrop-blur-md xl:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`relative rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.13em] transition-all duration-300 ${
                  isActive ? "text-ink" : "text-white/60 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navBubble"
                    className="absolute inset-0 z-0 rounded-full bg-sky-200"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <a
          href={`mailto:${profile.email}`}
          className="interactive hidden items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 backdrop-blur-md transition hover:border-sky-200/35 hover:bg-sky-200/10 md:flex"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            Available
          </span>
        </a>

        <button
          type="button"
          className="interactive group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/80 shadow-lg shadow-black/10 backdrop-blur-md transition hover:border-sky-200/30 hover:bg-sky-200/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 xl:hidden"
          aria-label={mobileOpen ? "Close mobile navigation" : "Open mobile navigation"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="relative h-4 w-5" aria-hidden="true">
            <motion.span
              className="absolute left-0 top-0 h-px w-5 rounded-full bg-current"
              animate={mobileOpen ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
              transition={navTransition}
            />
            <motion.span
              className="absolute left-1 top-[7px] h-px w-4 rounded-full bg-current"
              animate={mobileOpen ? { opacity: 0, x: 5 } : { opacity: 1, x: 0 }}
              transition={navTransition}
            />
            <motion.span
              className="absolute bottom-0 left-0 h-px w-5 rounded-full bg-current"
              animate={mobileOpen ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
              transition={navTransition}
            />
          </span>
        </button>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close mobile navigation"
              className="pointer-events-auto fixed inset-0 z-[55] cursor-default bg-[#02050b]/45 backdrop-blur-[3px] xl:hidden"
              onClick={() => setMobileOpen(false)}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: navEase }}
            />

            <motion.nav
              id="mobile-nav-panel"
              aria-label="Mobile section navigation"
              className="pointer-events-auto fixed inset-x-4 top-[4.75rem] z-[60] mx-auto max-w-md overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#050910]/88 shadow-2xl shadow-black/35 backdrop-blur-2xl xl:hidden"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
              transition={navTransition}
            >
              <div className="relative overflow-hidden p-4">
                <div
                  className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-sky-300/10 blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/38">
                      Navigation
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {activeItem.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.75)]" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">
                      {String(activeIndex + 1).padStart(2, "0")} / {String(navItems.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-orange-300"
                    animate={{ width: `${navProgress}%` }}
                    transition={navTransition}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                {navItems.map((item, index) => {
                  const isActive = item.id === activeSection;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollTo(item.id)}
                      className={`interactive group relative min-h-12 overflow-hidden rounded-2xl border px-3 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 ${
                        isActive
                          ? "border-sky-200/40 bg-sky-200/[0.14] text-white"
                          : "border-white/[0.06] bg-white/[0.035] text-white/62 active:bg-white/[0.08]"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="mobileNavActiveGlow"
                          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.24),transparent_58%)]"
                          transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-between gap-2">
                        <span>
                          <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em]">
                            {item.label}
                          </span>
                        </span>
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition ${
                            isActive ? "bg-sky-200 shadow-[0_0_14px_rgba(186,230,253,0.8)]" : "bg-white/18"
                          }`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 border-t border-white/[0.06] p-3">
                <button
                  type="button"
                  onClick={() => scrollTo("work")}
                  className="interactive flex-1 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70"
                >
                  Work
                </button>
                <a
                  href={profile.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="interactive flex-1 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70"
                  onClick={() => setMobileOpen(false)}
                >
                  GitHub
                </a>
                <button
                  type="button"
                  onClick={() => scrollTo("contact")}
                  className="interactive flex-1 rounded-full border border-sky-200/20 bg-sky-200/[0.1] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70"
                >
                  Contact
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
