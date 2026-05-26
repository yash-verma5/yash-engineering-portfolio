"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
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

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (compact) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    rotateX.set(((centerY - y) / centerY) * 5);
    rotateY.set(((x - centerX) / centerX) * 6);
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
        compact ? "min-h-96 p-6" : "h-[66vh] min-h-[35rem] w-[76vw] max-w-[60rem] shrink-0 p-8 md:p-10"
      }`}
    >
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-300/14 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-sky-200/0 via-sky-200/70 to-sky-200/0" />
      </div>
      <div
        className="relative flex h-full flex-col justify-between gap-8"
        style={{ transform: compact ? undefined : "translateZ(34px)" }}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/45">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{project.category}</span>
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
          <h3 className="mb-5 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
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

  return (
    <section id="work" className="relative bg-[#08090d]">
      <div ref={sectionRef} className="relative hidden h-[420vh] md:block">
        <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden px-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
          <div className="absolute left-10 top-24 z-10 max-w-4xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">
              Featured Work
            </p>
            <h2 className="text-5xl font-semibold leading-none tracking-[-0.05em] text-white lg:text-7xl">
              Enterprise case studies and public builds.
            </h2>
          </div>

          <motion.div
            ref={trackRef}
            style={{ x, perspective: 1200 }}
            className="flex w-max items-center gap-6 pt-40"
          >
            <div className="w-[34vw] shrink-0" />
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
