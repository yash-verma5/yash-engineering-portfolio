import Contact from "@/components/Contact";
import CustomCursor from "@/components/CustomCursor";
import EasterEggController from "@/components/EasterEggController";
import KineticMarquee from "@/components/KineticMarquee";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import {
  AboutSection,
  EducationSection,
  ExperienceSection,
  SkillsSection,
  WritingSection
} from "@/components/ProfileSections";
import ScrollyCanvas from "@/components/ScrollyCanvas";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Navbar />
      <CustomCursor />
      <EasterEggController />
      <div className="grain-overlay" />
      <div className="vignette-overlay" />
      <ScrollyCanvas />
      <KineticMarquee text="Java / Spring Boot / Apache NiFi / Apache Solr / OMS" />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <Projects />
      <WritingSection />
      <EducationSection />
      <Contact />
    </main>
  );
}
