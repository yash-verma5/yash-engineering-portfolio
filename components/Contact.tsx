"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize custom micro-sine-wave chime on hover
  const playHoverTone = (freq = 880) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Sleek visual chime envelope
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
    }, 1200);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#08090d] px-6 py-28 md:px-12 md:py-36"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Floating Audio Controller */}
      <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            // Trigger audio initiation context
            if (!soundEnabled && typeof window !== "undefined") {
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
          }}
          onMouseEnter={() => playHoverTone(660)}
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] backdrop-blur-md transition-all hover:border-sky-300/35 hover:bg-sky-300/10"
        >
          {soundEnabled ? (
            <div className="flex items-center gap-[2px] h-3">
              <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-[1.5px] bg-sky-200" />
              <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-[1.5px] bg-sky-200" />
              <motion.div animate={{ height: [3, 10, 3] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-[1.5px] bg-sky-200" />
            </div>
          ) : (
            <svg
              className="h-4 w-4 stroke-white/50 group-hover:stroke-white transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 md:grid-cols-2">
          {/* Section Titles */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/60">
                03. Collaboration
              </p>
              <h2 className="max-w-xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white md:text-8xl">
                Let&apos;s make it real.
              </h2>
              <p className="mt-8 max-w-md text-base leading-7 text-white/58 md:text-lg">
                Have a design in need of engineering, a product seeking cinematic motion, or a question? Get in touch.
              </p>
            </div>

            {/* Social Grid */}
            <div className="mt-16 flex flex-wrap gap-4">
              {[
                { label: "Github", url: "https://github.com", note: "Source code" },
                { label: "LinkedIn", url: "https://linkedin.com", note: "Network" },
                { label: "Email", url: "mailto:yashv521@gmail.com", note: "Primary inbox" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playHoverTone(social.label === "Github" ? 440 : social.label === "LinkedIn" ? 550 : 660)}
                  className="group relative rounded-lg border border-white/8 bg-white/[0.02] p-4 pr-16 transition-all duration-300 hover:border-sky-300/30 hover:bg-sky-300/5 hover:-translate-y-1"
                >
                  <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{social.label}</span>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">{social.note}</p>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-sky-300">
                    -&gt;
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Interactive Form */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md md:p-12">
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
                <h3 className="text-2xl font-bold tracking-tight text-white">Transmission complete.</h3>
                <p className="mt-3 text-sm text-white/50">
                  Thank you. I will respond to your message shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  onMouseEnter={() => playHoverTone(440)}
                  className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200 underline underline-offset-4"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Name */}
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
                  <label
                    htmlFor="name"
                    className="absolute top-3 left-0 -z-10 origin-[0%] -translate-y-7 scale-75 text-xs uppercase tracking-wider text-white/40 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-white/50 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-sky-300"
                  >
                    Name
                  </label>
                </div>

                {/* Email */}
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
                  <label
                    htmlFor="email"
                    className="absolute top-3 left-0 -z-10 origin-[0%] -translate-y-7 scale-75 text-xs uppercase tracking-wider text-white/40 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-white/50 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-sky-300"
                  >
                    Email address
                  </label>
                </div>

                {/* Message */}
                <div className="group relative flex flex-col">
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="peer border-b border-white/15 bg-transparent py-3 text-base text-white outline-none transition-colors focus:border-sky-300 resize-none"
                    placeholder=" "
                    id="message"
                  />
                  <label
                    htmlFor="message"
                    className="absolute top-3 left-0 -z-10 origin-[0%] -translate-y-7 scale-75 text-xs uppercase tracking-wider text-white/40 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-white/50 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-sky-300"
                  >
                    Brief details of your project
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onMouseEnter={() => playHoverTone(990)}
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-sky-200"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">-&gt;</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-28 flex flex-col justify-between gap-6 border-t border-white/[0.08] pt-12 text-xs uppercase tracking-wider text-white/45 md:flex-row">
          <div>
            <p>&copy; {new Date().getFullYear()} Yash Verma. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6">
            <span>KINETIC SYSTEM V1.0</span>
            <span>DEVELOPED FOR Realtime 60FPS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
