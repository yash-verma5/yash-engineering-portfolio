"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { navItems, profile } from "@/lib/content";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("intro");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const active = navItems.reduce((current, item) => {
        const section = document.getElementById(item.id);
        if (!section) return current;

        const top = section.getBoundingClientRect().top;
        return top <= window.innerHeight * 0.42 ? item.id : current;
      }, "intro");

      setActiveSection(active);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.04] bg-ink/30 py-4 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "bg-transparent py-8"
      }`}
    >
      <div className="mx-auto flex max-w-[92rem] items-center justify-between px-5 md:px-8">
        <button
          type="button"
          className="interactive group flex cursor-pointer items-center gap-3"
          onClick={() => scrollTo("intro")}
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
      </div>
    </motion.header>
  );
}
