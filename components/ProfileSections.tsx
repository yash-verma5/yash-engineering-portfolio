import { about, education, experience, skillGroups, writing } from "@/lib/content";

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
    <section id={id} className="relative bg-[#08090d] px-5 py-24 md:px-10 md:py-32">
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

export function AboutSection() {
  return (
    <SectionShell id="about" eyebrow={about.eyebrow} title={about.title}>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 leading-8 text-white/68 backdrop-blur-xl md:p-8 md:text-lg">
          {about.body}
        </div>
        <div className="grid gap-3">
          {about.highlights.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-white/10 bg-black/20 px-5 py-4 text-sm font-medium text-white/72"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function SkillsSection() {
  return (
    <SectionShell id="skills" eyebrow="Skills" title="Tools I use to ship production work.">
      <div className="grid gap-4 md:grid-cols-3">
        {skillGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition hover:border-sky-200/30 hover:bg-white/[0.07]"
          >
            <h3 className="mb-6 text-xl font-semibold tracking-[-0.02em] text-white">
              {group.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-black/24 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/58"
                >
                  {skill}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function ExperienceSection() {
  return (
    <SectionShell id="experience" eyebrow="Experience" title="Enterprise systems work with production weight.">
      <div className="space-y-6">
        {experience.map((item) => (
          <article
            key={`${item.company}-${item.role}`}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl md:p-8"
          >
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
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
            <div className="grid gap-3 md:grid-cols-2">
              {item.achievements.map((achievement) => (
                <div
                  key={achievement}
                  className="rounded-md border border-white/[0.08] bg-black/18 p-4 text-sm leading-6 text-white/62"
                >
                  {achievement}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function WritingSection() {
  return (
    <SectionShell id="writing" eyebrow="Writing" title="Documentation as part of the engineering system.">
      <div className="grid gap-4 md:grid-cols-3">
        {writing.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-sky-200/35 hover:bg-white/[0.075]"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/55">
              {item.label}
            </p>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
            <p className="mt-5 text-sm leading-6 text-white/58">{item.description}</p>
            <span className="mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/70 transition group-hover:text-white">
              Open resource -&gt;
            </span>
          </a>
        ))}
      </div>
    </SectionShell>
  );
}

export function EducationSection() {
  return (
    <SectionShell id="education" eyebrow="Education & Certifications" title="Formal training behind the systems work.">
      <div className="grid gap-4 md:grid-cols-2">
        {education.map((item) => (
          <article
            key={item.title}
            className={`rounded-lg border p-6 backdrop-blur-xl md:p-8 ${
              item.featured
                ? "border-sky-200/28 bg-sky-200/[0.07] shadow-glow"
                : "border-white/10 bg-white/[0.045]"
            }`}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/58">
              {item.completion || "Academic Foundation"}
            </p>
            <h3 className="text-3xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
            <p className="mt-5 text-base leading-7 text-white/62">{item.institution}</p>
            <p className="mt-6 inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/58">
              {item.meta}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
