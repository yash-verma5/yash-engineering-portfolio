"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";

const projects = [
  {
    title: "Commerce Operations Dashboard",
    type: "Product Engineering",
    year: "2026",
    description:
      "A dense operational interface for order monitoring, exception handling, and faster decision loops across commerce teams.",
    metrics: "Realtime workflows / data-heavy UI"
  },
  {
    title: "Cinematic Portfolio System",
    type: "Creative Development",
    year: "2026",
    description:
      "The canvas-driven scrollytelling build in this repo, pairing frame-by-frame motion with resilient Next.js architecture.",
    metrics: "120 frame canvas scrub / motion overlays"
  },
  {
    title: "Automation Workflow Console",
    type: "Interaction Design",
    year: "2025",
    description:
      "A structured control surface for reviewing automations, surfacing status, and reducing friction in recurring operational tasks.",
    metrics: "Operator-first flows / clear system states"
  },
  {
    title: "Motion Component Library",
    type: "Design Systems",
    year: "2025",
    description:
      "Reusable animation patterns for navigation, cards, forms, and scroll states, tuned for polished feel without sacrificing performance.",
    metrics: "Framer Motion / reusable UI primitives"
  }
];

function ProjectCard({
  project,
  index,
  compact = false
}: {
  project: (typeof projects)[number];
  index: number;
  compact?: boolean;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 220, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 220, damping: 24 });

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (compact) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    rotateX.set(((centerY - y) / centerY) * 7);
    rotateY.set(((x - centerX) / centerX) * 8);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        rotateX: compact ? 0 : springX,
        rotateY: compact ? 0 : springY,
        transformStyle: "preserve-3d"
      }}
      className={`project-card group relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.055] shadow-glow backdrop-blur-xl transition duration-500 hover:border-sky-200/36 hover:bg-white/[0.085] ${
        compact ? "min-h-72 p-6" : "h-[62vh] min-h-[31rem] w-[72vw] max-w-[58rem] shrink-0 p-8 md:p-10"
      }`}
    >
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-300/14 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-sky-200/0 via-sky-200/70 to-sky-200/0" />
      </div>
      <div
        className="relative flex h-full flex-col justify-between gap-12"
        style={{ transform: compact ? undefined : "translateZ(34px)" }}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/45">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{project.year}</span>
        </div>
        <div>
          <p className="mb-4 text-sm text-sky-100/65">{project.type}</p>
          <h3 className="mb-5 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            {project.title}
          </h3>
          <p className="max-w-xl text-base leading-7 text-white/58 md:text-lg">
            {project.description}
          </p>
          <div className="mt-8 inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            {project.metrics}
          </div>
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

  return (
    <section id="work" className="relative bg-[#08090d]">
      <div ref={sectionRef} className="relative hidden h-[320vh] md:block">
        <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden px-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
          <div className="absolute left-10 top-28 z-10 max-w-4xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">
              04. Selected Work
            </p>
            <h2 className="text-5xl font-semibold leading-none tracking-[-0.05em] text-white lg:text-7xl">
              Case studies with momentum.
            </h2>
          </div>

          <motion.div
            ref={trackRef}
            style={{ x, perspective: 1200 }}
            className="flex w-max items-center gap-6 pt-36"
          >
            <div className="w-[36vw] shrink-0" />
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
            <div className="flex w-[42vw] shrink-0 items-center justify-center text-xs uppercase tracking-[0.28em] text-white/35">
              Continue to contact
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-5 py-24 md:hidden">
        <div className="mb-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">
            04. Selected Work
          </p>
          <h2 className="text-4xl font-semibold leading-none tracking-[-0.04em] text-white">
            Work shaped for speed, feeling, and finish.
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
