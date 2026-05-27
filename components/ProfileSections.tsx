"use client";

import { useRef } from "react";
import { motion, MotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { about, education, experience, skillGroups, writing } from "@/lib/content";


type AboutBeat = (typeof about.beats)[number];

function useBeatMotion(progress: MotionValue<number>, index: number, total: number) {
  const step = 1 / total;
  const start = Math.max(0, index * step - step * 0.38);
  const enter = index * step + step * 0.12;
  const hold = index * step + step * 0.58;
  const exit = Math.min(1, (index + 1) * step + step * 0.3);
  const next = Math.min(1, (index + 1) * step + step * 0.08);

  const opacity = useTransform(progress, [start, enter, hold, exit], [0, 1, 1, 0.22]);
  const y = useTransform(progress, [start, enter, next, exit], [42, 0, -16, -34]);
  const scale = useTransform(progress, [start, enter, next, exit], [0.96, 1, 0.94, 0.9]);
  const rotateX = useTransform(progress, [start, enter, exit], [3, 0, -2]);
  const z = useTransform(progress, [start, enter, next, exit], [-80, 0, -110, -180]);
  const layerOpacity = useTransform(progress, [start, enter, next, exit], [0, 0.2, 0.55, 0]);

  return { opacity, y, scale, rotateX, z, layerOpacity, start, enter, hold, exit };
}

function ResolveLine({
  line,
  index,
  progress,
  range,
  reduceMotion
}: {
  line: string;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  reduceMotion: boolean;
}) {
  const lineStart = range[0] + index * 0.025;
  const lineEnd = Math.min(range[1], lineStart + 0.1);
  const opacity = useTransform(progress, [lineStart, lineEnd], [0.18, 1]);
  const y = useTransform(progress, [lineStart, lineEnd], [14, 0]);
  const clipPath = useTransform(
    progress,
    [lineStart, lineEnd],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
  );

  return (
    <span className="relative block overflow-hidden">
      <motion.span
        style={{ opacity, y: reduceMotion ? 0 : y, clipPath: reduceMotion ? "inset(0 0% 0 0)" : clipPath }}
        className="block"
      >
        {line}
      </motion.span>
    </span>
  );
}

function NarrativeBeat({
  beat,
  index,
  progress,
  total,
  reduceMotion
}: {
  beat: AboutBeat;
  index: number;
  progress: MotionValue<number>;
  total: number;
  reduceMotion: boolean;
}) {
  const motionState = useBeatMotion(progress, index, total);
  const spotlightOpacity = useTransform(motionState.opacity, [0.45, 1], [0, reduceMotion ? 0 : 0.26]);
  const bodyLines = beat.body.match(/.{1,74}(?:\s|$)/g)?.map((line) => line.trim()).filter(Boolean) ?? [beat.body];

  return (
    <motion.article
      style={{
        opacity: motionState.opacity,
        y: reduceMotion ? 0 : motionState.y,
        scale: reduceMotion ? 1 : motionState.scale,
        rotateX: reduceMotion ? 0 : motionState.rotateX,
        z: reduceMotion ? 0 : motionState.z,
        transformPerspective: 1200,
        transformStyle: "preserve-3d"
      }}
      className="absolute inset-0 isolate flex flex-col justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-8 shadow-glow backdrop-blur-md [contain:layout_paint_style] [will-change:transform,opacity] md:p-10"
    >
      <motion.div
        style={{ opacity: motionState.layerOpacity }}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(125,211,252,0.12),transparent_42%,rgba(16,185,129,0.08))]"
      />
      <motion.div
        style={{ opacity: spotlightOpacity }}
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_52%_44%,rgba(186,230,253,0.28),rgba(125,211,252,0.07)_28%,transparent_56%)] md:block"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-100/50 to-transparent" />

      <div className="relative z-10 mb-8 flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-100/55">
        <span>{beat.label}</span>
        <span>{beat.proof}</span>
      </div>
      <h3 className="relative z-10 max-w-3xl text-4xl font-semibold leading-none tracking-[-0.045em] text-white lg:text-6xl">
        {beat.title}
      </h3>
      <p className="relative z-10 mt-7 max-w-2xl text-base leading-7 text-white/64 md:text-lg">
        {bodyLines.map((line, lineIndex) => (
          <ResolveLine
            key={`${beat.label}-${line}`}
            line={line}
            index={lineIndex}
            progress={progress}
            range={[motionState.enter, motionState.hold]}
            reduceMotion={reduceMotion}
          />
        ))}
      </p>
      <div className="relative z-10 mt-9 flex flex-wrap gap-2">
        {beat.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-black/24 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/62"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

function AboutSignalRail({ progress }: { progress: MotionValue<number> }) {
  const smoothProgress = useSpring(progress, { stiffness: 120, damping: 28, mass: 0.35 });
  const railHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const packetY = useTransform(smoothProgress, [0, 1], ["0%", "91%"]);
  const packetGlow = useTransform(smoothProgress, [0, 0.5, 1], [0.35, 0.7, 0.45]);

  return (
    <div className="relative hidden h-[34rem] w-28 shrink-0 lg:block" aria-hidden="true">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
      <div className="absolute left-1/2 top-0 h-full w-14 -translate-x-1/2">
        {about.beats.map((beat, index) => (
          <div
            key={beat.label}
            className="absolute left-1/2 h-px w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/16 to-transparent"
            style={{ top: `${(index / (about.beats.length - 1)) * 100}%` }}
          >
            <span className="absolute -right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/22" />
            <span className="absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2 bg-sky-200/20" />
          </div>
        ))}
      </div>
      <motion.div
        style={{ height: railHeight }}
        className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-sky-200 via-emerald-200 to-white/20"
      />
      <motion.div
        style={{ y: packetY, opacity: packetGlow }}
        className="absolute left-1/2 top-0 h-12 w-12 -translate-x-1/2 rounded-full bg-sky-200/10 blur-md"
      />
      <motion.div
        style={{ y: packetY }}
        className="absolute left-1/2 top-0 h-5 w-8 -translate-x-1/2 rounded-full border border-sky-100/55 bg-[#07111a]/80 shadow-[0_0_42px_rgba(125,211,252,0.4)] backdrop-blur"
      >
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200" />
      </motion.div>
      <div className="absolute -right-2 inset-y-0 flex flex-col justify-between py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/28">
        {about.beats.map((beat) => (
          <span key={beat.label}>{beat.label.slice(0, 2)}</span>
        ))}
      </div>
    </div>
  );
}


function AboutHighlight({
  item,
  index,
  progress,
  reduceMotion
}: {
  item: string;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const opacity = useTransform(progress, [index * 0.18, index * 0.18 + 0.18], [0.35, 1]);
  const x = useTransform(progress, [index * 0.18, index * 0.18 + 0.18], [-12, 0]);

  return (
    <motion.div
      style={{ opacity, x: reduceMotion ? 0 : x }}
      className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/58 backdrop-blur-md"
    >
      {item}
    </motion.div>
  );
}


function AboutActiveReadoutItem({
  beat,
  index,
  progress
}: {
  beat: AboutBeat;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = Math.max(0, index / about.beats.length - 0.04);
  const middle = (index + 0.5) / about.beats.length;
  const end = Math.min(1, (index + 1) / about.beats.length + 0.04);
  const opacity = useTransform(progress, [start, middle, end], [0.28, 1, 0.28]);
  const scaleX = useTransform(progress, [start, middle, end], [0.35, 1, 0.35]);

  return (
    <motion.div style={{ opacity }} className="min-w-0">
      <motion.div
        style={{ scaleX }}
        className="mb-2 h-px origin-left rounded-full bg-gradient-to-r from-sky-200 to-emerald-200"
      />
      <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/38">
        {beat.label.slice(5)}
      </span>
    </motion.div>
  );
}

function AboutActiveReadout({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="mt-10 grid max-w-md grid-cols-4 gap-2">
      {about.beats.map((beat, index) => (
        <AboutActiveReadoutItem key={beat.label} beat={beat} index={index} progress={progress} />
      ))}
    </div>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative bg-[#08090d] px-5 py-24 [contain-intrinsic-size:900px] [content-visibility:auto] md:px-10 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-4xl md:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-semibold leading-none tracking-[-0.04em] text-white md:text-7xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function RevealBlock({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.82, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SkillCluster({ group, index }: { group: (typeof skillGroups)[number]; index: number }) {
  return (
    <RevealBlock delay={index * 0.08}>
      <article className="group relative min-h-72 overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md transition duration-700 [contain:layout_paint_style] hover:-translate-y-1 hover:border-sky-200/35 hover:bg-white/[0.075]">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-300/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-sky-200/65 to-transparent" />
        </div>
        <div className="relative z-10 mb-8 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/36">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>Capability Cluster</span>
        </div>
        <h3 className="relative z-10 mb-8 text-2xl font-semibold tracking-[-0.03em] text-white">
          {group.title}
        </h3>
        <div className="relative z-10 flex flex-wrap gap-2">
          {group.skills.map((skill, skillIndex) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 + skillIndex * 0.035 }}
              className="rounded-full border border-white/10 bg-black/24 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/58 transition duration-300 group-hover:border-sky-200/22 group-hover:text-sky-100/72"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </article>
    </RevealBlock>
  );
}

function ExperienceAchievement({ achievement, index }: { achievement: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.62, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-md border border-white/[0.08] bg-black/18 p-4 text-sm leading-6 text-white/62 transition duration-500 hover:border-sky-200/24 hover:bg-sky-200/[0.035] hover:text-white/74"
    >
      <span className="absolute -left-[1.72rem] top-5 hidden h-2 w-2 rounded-full bg-sky-200/60 shadow-[0_0_24px_rgba(125,211,252,0.45)] md:block" />
      {achievement}
    </motion.div>
  );
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.3, 0.72, 1], [0.18, 0.34, 0.28, 0.12]);
  const ambientScale = useTransform(scrollYProgress, [0, 1], [0.92, 1.12]);
  const ambientX = useTransform(scrollYProgress, [0, 1], [-60, 80]);

  return (
    <section id="about" ref={sectionRef} className="relative bg-[#08090d] md:h-[360vh]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
style={{ opacity: ambientOpacity, scale: ambientScale }}
          className="absolute left-1/2 top-20 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl"
        />
        <motion.div
          style={{ x: reduceMotion ? 0 : ambientX }}
          className="absolute bottom-24 right-0 h-72 w-72 rounded-full bg-emerald-300/8 blur-3xl"
        />
      </div>

      <div className="mx-auto hidden h-screen max-w-7xl px-10 md:sticky md:top-0 md:flex md:items-center">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[0.78fr_1fr]">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">
              {about.eyebrow}
            </p>
            <h2 className="max-w-3xl text-5xl font-semibold leading-none tracking-[-0.055em] text-white lg:text-7xl">
              {about.title}
            </h2>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/54">
              Scroll through the signal: identity, systems, debugging, and stack. The details arrive in sequence because that is how the work usually becomes clear.
            </p>
            <div className="mt-10 grid max-w-lg gap-3">
              {about.highlights.map((item, index) => (
                <AboutHighlight
                  key={item}
                  item={item}
                  index={index}
                  progress={scrollYProgress}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
            <AboutActiveReadout progress={scrollYProgress} />
          </div>

          <div className="flex items-center gap-8">
            <AboutSignalRail progress={scrollYProgress} />
            <div className="relative h-[34rem] min-w-0 flex-1 [perspective:1200px]">
              {about.beats.map((beat, index) => (
                <NarrativeBeat
                  key={beat.label}
                  beat={beat}
                  index={index}
                  progress={scrollYProgress}
                  total={about.beats.length}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-24 md:hidden">
        <div className="mb-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/65">
            {about.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold leading-none tracking-[-0.04em] text-white">
            {about.title}
          </h2>
          <p className="mt-6 text-base leading-7 text-white/58">
            A compact path through the systems I work with and the way I approach production problems.
          </p>
        </div>
        <div className="grid gap-4">
          {about.beats.map((beat) => (
            <article
              key={beat.label}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md"
            >
              <div className="mb-5 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100/55">
                <span>{beat.label}</span>
                <span>{beat.proof}</span>
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{beat.title}</h3>
              <p className="mt-5 text-sm leading-6 text-white/62">{beat.body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {beat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/54"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SkillsSection() {
  return (
    <SectionShell id="skills" eyebrow="Skills" title="A working toolkit, grouped by how systems actually ship.">
      <div className="relative">
        <div className="pointer-events-none absolute -left-10 top-10 hidden h-72 w-px bg-gradient-to-b from-sky-200/0 via-sky-200/35 to-sky-200/0 md:block" />
        <div className="mb-8 max-w-3xl text-base leading-7 text-white/56 md:text-lg">
          Skills are staged as clusters instead of badges: backend language, operational infrastructure, and the working stack around production debugging.
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {skillGroups.map((group, index) => (
            <SkillCluster key={group.title} group={group} index={index} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function ExperienceSection() {
  return (
    <SectionShell id="experience" eyebrow="Experience" title="Enterprise systems work with production weight.">
      <div className="space-y-6">
        {experience.map((item) => (
          <RevealBlock key={`${item.company}-${item.role}`}>
            <article className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md [contain:layout_paint_style] md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(125,211,252,0.08),transparent_32rem)]" />
              <div className="relative z-10 mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-100/55">{item.company}</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
                    {item.role}
                  </h3>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-white/62">{item.summary}</p>
                </div>
                <div className="shrink-0 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-white/58">
                  <p>{item.location}</p>
                  <p className="mt-1 text-sky-100/70">{item.duration}</p>
                </div>
              </div>
              <div className="relative z-10 border-l border-white/10 pl-7">
                <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-sky-200/0 via-sky-200/45 to-sky-200/0" />
                <div className="grid gap-3 md:grid-cols-2">
                  {item.achievements.map((achievement, index) => (
                    <ExperienceAchievement key={achievement} achievement={achievement} index={index} />
                  ))}
                </div>
              </div>
            </article>
          </RevealBlock>
        ))}
      </div>
    </SectionShell>
  );
}

export function WritingSection() {
  return (
    <SectionShell id="writing" eyebrow="Writing" title="Documentation as part of the engineering system.">
      <div className="grid gap-4 md:grid-cols-3">
        {writing.map((item, index) => (
          <RevealBlock key={item.href} delay={index * 0.07}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block min-h-72 overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md transition duration-700 [contain:layout_paint_style] hover:-translate-y-1 hover:border-sky-200/35 hover:bg-white/[0.075]"
            >
              <div className="absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-sky-200 to-transparent transition duration-700 group-hover:scale-x-100" />
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/55">
                {item.label}
              </p>
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
              <p className="mt-5 text-sm leading-6 text-white/58">{item.description}</p>
              <span className="mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/70 transition group-hover:text-white">
                Open resource -&gt;
              </span>
            </a>
          </RevealBlock>
        ))}
      </div>
    </SectionShell>
  );
}

export function EducationSection() {
  return (
    <SectionShell id="education" eyebrow="Education & Certifications" title="Formal training behind the systems work.">
      <div className="grid gap-4 md:grid-cols-2">
        {education.map((item, index) => (
          <RevealBlock key={item.title} delay={index * 0.08}>
            <article
              className={`relative overflow-hidden rounded-lg border p-6 backdrop-blur-md [contain:layout_paint_style] md:p-8 ${
                item.featured
                  ? "border-sky-200/28 bg-sky-200/[0.07] shadow-glow"
                  : "border-white/10 bg-white/[0.045]"
              }`}
            >
              <div className="absolute right-6 top-6 text-6xl font-semibold tracking-[-0.08em] text-white/[0.035]">
                0{index + 1}
              </div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/58">
                {item.completion || "Academic Foundation"}
              </p>
              <h3 className="relative z-10 text-3xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
              <p className="relative z-10 mt-5 text-base leading-7 text-white/62">{item.institution}</p>
              <p className="relative z-10 mt-6 inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/58">
                {item.meta}
              </p>
            </article>
          </RevealBlock>
        ))}
      </div>
    </SectionShell>
  );
}
