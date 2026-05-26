import Contact from "@/components/Contact";
import CustomCursor from "@/components/CustomCursor";
import EasterEggController from "@/components/EasterEggController";
import KineticMarquee from "@/components/KineticMarquee";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
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
      <KineticMarquee text="Creative Developer / Scrollytelling / Product Interfaces" />
      <Projects />
      <Contact />
    </main>
  );
}
