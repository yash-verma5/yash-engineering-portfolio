"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { profile } from "@/lib/content";

const contactItems = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "LinkedIn", value: "linkedin.com/in/yashverma5", href: profile.links.linkedin },
  { label: "GitHub", value: "github.com/yash-verma5", href: profile.links.github },
  { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/[^+\d]/g, "")}` },
  { label: "Location", value: profile.location, href: "#contact" }
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] });
  const ambientY = useTransform(scrollYProgress, [0, 1], [80, -30]);
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.45, 1], [0.08, 0.22, 0.34]);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playHoverTone = (freq = 880) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("AudioContext failed", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      playHoverTone(1200);
    }, 900);
  };

  return (
    <section id="contact" ref={sectionRef} className="relative overflow-hidden bg-[#08090d] px-6 py-28 md:px-12 md:py-36">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <motion.div
        style={{ y: reduceMotion ? 0 : ambientY, opacity: ambientOpacity }}
        className="pointer-events-none absolute right-[-10rem] top-10 h-[34rem] w-[34rem] rounded-full bg-sky-300/10 blur-3xl"
      />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-black/35 to-transparent" />

      <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled && typeof window !== "undefined") {
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
          }}
          onMouseEnter={() => playHoverTone(660)}
          className="interactive group flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] backdrop-blur-md transition-all hover:border-sky-300/35 hover:bg-sky-300/10"
          aria-label="Toggle subtle hover sound"
        >
          {soundEnabled ? (
            <div className="flex h-3 items-center gap-[2px]">
              <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-[1.5px] bg-sky-200" />
              <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-[1.5px] bg-sky-200" />
              <motion.div animate={{ height: [3, 10, 3] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-[1.5px] bg-sky-200" />
            </div>
          ) : (
            <span className="text-xs font-semibold text-white/55">SND</span>
          )}
        </button>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/60">
                Contact
              </p>
              <h2 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white md:text-8xl">
                Backend, platform, and integration work.
              </h2>
              <p className="mt-8 max-w-xl text-base leading-7 text-white/62 md:text-lg">
                {profile.availability} {profile.contactNote}
              </p>
            </div>

            <div className="mt-14 grid gap-3">
              {contactItems.map((item, index) => (
                <motion.a
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.045 }}
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  onMouseEnter={() => playHoverTone(item.label === "Email" ? 660 : 520)}
                  className="interactive group relative rounded-lg border border-white/8 bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/30 hover:bg-sky-300/5"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                    {item.label}
                  </span>
                  <p className="mt-2 text-sm font-medium text-white/82 transition-colors group-hover:text-white">
                    {item.value}
                  </p>
                </motion.a>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-8 shadow-glow backdrop-blur-md md:p-12">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/55 to-transparent" />
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-full flex-col justify-center py-12 text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-200/10 text-sky-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Message staged.</h3>
                <p className="mt-3 text-sm text-white/50">
                  This demo form does not send email yet. Use the direct email link for live contact.
                </p>
                <a
                  href={`mailto:${profile.email}`}
                  onMouseEnter={() => playHoverTone(440)}
                  className="interactive mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200 underline underline-offset-4"
                >
                  Email Yash directly
                </a>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="group relative flex flex-col">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="peer border-b border-white/15 bg-transparent py-3 text-base text-white outline-none transition-colors focus:border-sky-300"
                    placeholder=" "
                    id="name"
                  />
                  <label htmlFor="name" className="absolute left-0 top-3 -z-10 origin-[0%] -translate-y-7 scale-75 text-xs uppercase tracking-wider text-white/40 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-white/50 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-sky-300">
                    Name
                  </label>
                </div>

                <div className="group relative flex flex-col">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="peer border-b border-white/15 bg-transparent py-3 text-base text-white outline-none transition-colors focus:border-sky-300"
                    placeholder=" "
                    id="email"
                  />
                  <label htmlFor="email" className="absolute left-0 top-3 -z-10 origin-[0%] -translate-y-7 scale-75 text-xs uppercase tracking-wider text-white/40 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-white/50 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-sky-300">
                    Email address
                  </label>
                </div>

                <div className="group relative flex flex-col">
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="peer resize-none border-b border-white/15 bg-transparent py-3 text-base text-white outline-none transition-colors focus:border-sky-300"
                    placeholder=" "
                    id="message"
                  />
                  <label htmlFor="message" className="absolute left-0 top-3 -z-10 origin-[0%] -translate-y-7 scale-75 text-xs uppercase tracking-wider text-white/40 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-white/50 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-sky-300">
                    Backend, platform, or integration role details
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  onMouseEnter={() => playHoverTone(990)}
                  className="interactive group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <>
                      <span>Prepare Message</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">-&gt;</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        <div className="mt-28 flex flex-col justify-between gap-6 border-t border-white/[0.08] pt-12 text-xs uppercase tracking-wider text-white/45 md:flex-row">
          <p>&copy; {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <span>Java / Spring Boot / NiFi / Solr</span>
            <span>{profile.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
