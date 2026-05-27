"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { projects } from "@/lib/content";

type Project = (typeof projects)[number];

function ProjectCard({
  project,
  index,
  compact = false
}: {
  project: Project;
  index: number;
  compact?: boolean;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 220, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 220, damping: 24 });
  const boundsRef = useRef<DOMRect | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const tiltRafRef = useRef<number | null>(null);

  const updateTilt = () => {
    tiltRafRef.current = null;
    const rect = boundsRef.current;
    if (!rect) return;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    rotateX.set(((centerY - pointerRef.current.y) / centerY) * 4);
    rotateY.set(((pointerRef.current.x - centerX) / centerX) * 5);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (compact) return;
    boundsRef.current = event.currentTarget.getBoundingClientRect();
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (compact || !boundsRef.current) return;

    pointerRef.current.x = event.clientX - boundsRef.current.left;
    pointerRef.current.y = event.clientY - boundsRef.current.top;

    if (tiltRafRef.current === null) {
      tiltRafRef.current = window.requestAnimationFrame(updateTilt);
    }
  };

  const resetTilt = () => {
    if (tiltRafRef.current !== null) {
      window.cancelAnimationFrame(tiltRafRef.current);
      tiltRafRef.current = null;
    }

    boundsRef.current = null;
    rotateX.set(0);
    rotateY.set(0);
  };

  useEffect(() => {
    return () => {
      if (tiltRafRef.current !== null) {
        window.cancelAnimationFrame(tiltRafRef.current);
      }
    };
  }, []);

  return (
    <motion.article
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{
        rotateX: compact ? 0 : springX,
        rotateY: compact ? 0 : springY,
        transformStyle: "preserve-3d"
      }}
      className={`project-card group relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.055] shadow-glow backdrop-blur-md transition duration-700 [contain:layout_paint_style] [will-change:transform] hover:-translate-y-1 hover:border-sky-200/36 hover:bg-white/[0.085] ${
        compact ? "min-h-96 p-6" : "h-[46vh] min-h-[24rem] w-[76vw] max-w-[56rem] shrink-0 p-7 md:p-8"
      }`}
    >
      <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-300/12 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-sky-200/0 via-sky-200/70 to-sky-200/0" />
        <div className="absolute inset-x-8 top-8 h-px origin-left scale-x-0 bg-gradient-to-r from-sky-200/70 to-transparent transition duration-700 group-hover:scale-x-100" />
      </div>
      <div
        className="relative flex h-full flex-col justify-between gap-8"
        style={{ transform: compact ? undefined : "translateZ(34px)" }}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/45">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{project.category}</span>
        </div>
        <div className="pointer-events-none absolute right-8 top-20 hidden text-[8rem] font-semibold leading-none tracking-[-0.08em] text-white/[0.025] transition duration-700 group-hover:text-sky-200/[0.055] md:block">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            {project.tech.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/58"
              >
                {item}
              </span>
            ))}
          </div>
          <h3 className="mb-5 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
            {project.title}
          </h3>
          <p className="max-w-2xl text-base leading-7 text-white/62 md:text-lg">
            {project.description}
          </p>
          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            {project.impact.map((impact) => (
              <span
                key={impact}
                className="rounded-md border border-white/[0.08] bg-black/18 p-3 text-xs leading-5 text-white/54"
              >
                {impact}
              </span>
            ))}
          </div>
          {project.links.length > 0 && (
            <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
              {project.links.map((link) => (
                <a
                  key={`${project.title}-${link.label}`}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`interactive rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                    "placeholder" in link && link.placeholder
                      ? "border-amber-200/25 bg-amber-200/[0.06] text-amber-100/70"
                      : "border-white/12 bg-white/[0.055] text-white/70 hover:border-sky-200/40 hover:bg-sky-200/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [travelDistance, setTravelDistance] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;

      const distance = Math.max(0, track.scrollWidth - window.innerWidth + 80);
      setTravelDistance(distance);
    };

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

  const rawX = useTransform(scrollYProgress, [0, 1], [0, -travelDistance]);
  const x = useSpring(rawX, { stiffness: 120, damping: 28, mass: 0.35 });
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <section id="work" className="relative bg-[#08090d]">
      <div ref={sectionRef} className="relative hidden h-[420vh] md:block">
        <div className="sticky top-0 h-screen w-full overflow-hidden px-10 pt-20">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(125,211,252,0.08),transparent_34rem)]" />
          <motion.div style={{ scaleX: progressScale }} className="absolute inset-x-10 bottom-10 z-20 h-px origin-left bg-gradient-to-r from-sky-200 via-emerald-200 to-transparent" />
          <div className="relative z-10 max-w-4xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">
              Featured Work
            </p>
            <h2 className="text-5xl font-semibold leading-none tracking-[-0.05em] text-white lg:text-6xl">
              Enterprise case studies and public builds.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/50">
              A horizontal systems pass: migration, fulfillment, integrations, full-stack builds, and documentation.
            </p>
          </div>

          <motion.div
            ref={trackRef}
            style={{ x, perspective: 1200 }}
            className="flex w-max items-center gap-6 pt-10"
          >
            <div className="w-[8vw] shrink-0" />
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
            <div className="flex w-[42vw] shrink-0 items-center justify-center text-xs uppercase tracking-[0.28em] text-white/35">
              Continue to writing
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-5 py-24 md:hidden">
        <div className="mb-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">
            Featured Work
          </p>
          <h2 className="text-4xl font-semibold leading-none tracking-[-0.04em] text-white">
            Enterprise case studies and public builds.
          </h2>
        </div>
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
