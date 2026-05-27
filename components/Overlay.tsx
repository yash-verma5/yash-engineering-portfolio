"use client";

import { useRef, useState } from "react";
import { motion, MotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import { profile } from "@/lib/content";
import { useKonamiMode } from "@/components/KonamiProvider";

type OverlayProps = {
  progress: MotionValue<number>;
  reduceMotion?: boolean;
};

type Cta = {
  label: string;
  href: string;
};

function CopyBlock({
  progress,
  range,
  xRange,
  align,
  eyebrow,
  title,
  body,
  note,
  ctas,
  reduceMotion = false
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  xRange: [number, number];
  align: "center" | "left" | "right";
  eyebrow: string;
  title: string;
  body: string;
  note?: string;
  ctas?: Cta[];
  reduceMotion?: boolean;
}) {
  const [clickCount, setClickCount] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = () => {
    if (title !== profile.name) return;

    setClickCount((prev) => prev + 1);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => setClickCount(0), 1000);

    if (clickCount + 1 >= 5) {
      setIsGlitching(true);
      setClickCount(0);
      setTimeout(() => setIsGlitching(false), 700);
    }
  };

  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [60, 0, 0, -60]);
  const x = useTransform(progress, [range[0], range[3]], xRange);
  const scrollVelocity = useVelocity(progress);
  const velocitySpring = useSpring(scrollVelocity, { stiffness: 180, damping: 30 });
  const skewY = useTransform(velocitySpring, [-1, 0, 1], [-6, 0, 6]);
  const scaleY = useTransform(velocitySpring, [-1, 0, 1], [1.06, 1, 1.06]);

  const alignment =
    align === "center"
      ? "mx-auto items-center text-center"
      : align === "left"
        ? "mr-auto items-start text-left"
        : "ml-auto items-end text-right";

  return (
    <motion.section
      style={{
        opacity,
        x: reduceMotion ? 0 : x,
        y: reduceMotion ? 0 : y,
        scaleY: reduceMotion ? 1 : scaleY,
        skewY: reduceMotion ? 0 : skewY
      }}
      className={`absolute inset-x-5 top-1/2 flex max-w-5xl -translate-y-1/2 flex-col [will-change:transform,opacity] ${alignment} md:inset-x-12`}
    >
      <span className="mb-6 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-sky-200/90 backdrop-blur-sm">
        {eyebrow}
      </span>
      <h1
        onClick={handleTitleClick}
        className={`konami-rgb-text max-w-5xl text-balance text-5xl font-semibold leading-[0.9] tracking-[-0.05em] text-white md:text-8xl ${
          title === profile.name ? "cursor-pointer select-none" : ""
        } ${isGlitching ? "animate-glitch-active" : ""}`}
      >
        {title}
      </h1>
      <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 md:text-xl">{body}</p>
      {note && <p className="mt-3 max-w-xl text-sm leading-6 text-white/48 md:text-base">{note}</p>}
      {ctas && (
        <div className="pointer-events-auto mt-9 flex flex-wrap justify-center gap-3">
          {ctas.map((cta, index) => (
            <a
              key={cta.href}
              href={cta.href}
              target={cta.href.startsWith("http") ? "_blank" : undefined}
              rel={cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`interactive rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                index === 0
                  ? "bg-white text-ink hover:bg-sky-200"
                  : "border border-white/14 bg-white/[0.055] text-white/76 backdrop-blur-sm hover:border-sky-200/40 hover:bg-sky-200/10 hover:text-white"
              }`}
            >
              {cta.label}
            </a>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default function Overlay({ progress, reduceMotion = false }: OverlayProps) {
  const { active: konamiActive } = useKonamiMode();
  const blocks = konamiActive
    ? [
        {
          range: [0, 0.03, 0.17, 0.26] as [number, number, number, number],
          xRange: [0, -32] as [number, number],
          align: "center" as const,
          eyebrow: "Signal Detected",
          title: "Reality Override",
          body: "A hidden frame layer takes over the same scroll engine, keeping the canvas pinned while the signal scrubs through an alternate sequence.",
          note: "Konami mode is temporary. The system will restore itself cleanly.",
          ctas: undefined
        },
        {
          range: [0.23, 0.3, 0.43, 0.52] as [number, number, number, number],
          xRange: [-48, 12] as [number, number],
          align: "left" as const,
          eyebrow: "Alternate Layer",
          title: "Scroll stays locked.",
          body: "The same production canvas pipeline now reads a second preloaded frame cache without changing layout or scroll physics.",
          note: undefined,
          ctas: undefined
        },
        {
          range: [0.52, 0.6, 0.74, 0.84] as [number, number, number, number],
          xRange: [48, -12] as [number, number],
          align: "right" as const,
          eyebrow: "Mode Shift",
          title: "Signal over structure.",
          body: "Cyan edges, ember highlights, scanlines, and the alternate sequence sit above the original portfolio system without breaking it.",
          note: undefined,
          ctas: undefined
        },
        {
          range: [0.78, 0.86, 0.94, 1] as [number, number, number, number],
          xRange: [0, 0] as [number, number],
          align: "center" as const,
          eyebrow: "Restore Pending",
          title: "The layer will collapse.",
          body: "When the timer ends, the theme and canvas return to the default engineering portfolio state.",
          note: undefined,
          ctas: undefined
        }
      ]
    : [
        {
          range: [0, 0.03, 0.17, 0.26] as [number, number, number, number],
          xRange: [0, -32] as [number, number],
          align: "center" as const,
          eyebrow: profile.title,
          title: profile.name,
          body: profile.headline,
          note: profile.subtext,
          ctas: [
            { label: "View Work", href: "#work" },
            { label: "GitHub", href: profile.links.github },
            { label: "LinkedIn", href: profile.links.linkedin },
            { label: "Contact", href: `mailto:${profile.email}` }
          ]
        },
        {
          range: [0.23, 0.3, 0.43, 0.52] as [number, number, number, number],
          xRange: [-48, 12] as [number, number],
          align: "left" as const,
          eyebrow: "Backend Focus",
          title: "Java. Integrations. Search.",
          body: "Backend services, data pipelines, and Solr-backed search workflows built for retail systems that have to keep moving.",
          note: undefined,
          ctas: undefined
        },
        {
          range: [0.52, 0.6, 0.74, 0.84] as [number, number, number, number],
          xRange: [48, -12] as [number, number],
          align: "right" as const,
          eyebrow: "Production Systems",
          title: "Building systems that move real orders.",
          body: "OMS workflows, NiFi operations, fulfillment logic, and integration debugging with a production-first mindset.",
          note: undefined,
          ctas: undefined
        },
        {
          range: [0.78, 0.86, 0.94, 1] as [number, number, number, number],
          xRange: [0, 0] as [number, number],
          align: "center" as const,
          eyebrow: "Debugging Depth",
          title: "From pipelines to production fixes.",
          body: "Tracing cursor behavior, timestamps, shipment states, search documents, and API boundaries until the system explains itself.",
          note: undefined,
          ctas: undefined
        }
      ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(1,8,19,0.22)_50%,rgba(1,8,19,0.75)_100%)]" />

        {blocks.map((block) => (
          <CopyBlock
            key={`${block.eyebrow}-${block.title}`}
            progress={progress}
            range={block.range}
            xRange={block.xRange}
            align={block.align}
            eyebrow={block.eyebrow}
            title={block.title}
            body={block.body}
            note={block.note}
            ctas={block.ctas}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}
