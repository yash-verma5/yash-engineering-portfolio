"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorType = "default" | "pointer" | "card" | "input";

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const leadX = useSpring(mouseX, { stiffness: 450, damping: 28 });
  const leadY = useSpring(mouseY, { stiffness: 450, damping: 28 });
  const trail1X = useSpring(mouseX, { stiffness: 350, damping: 24 });
  const trail1Y = useSpring(mouseY, { stiffness: 350, damping: 24 });
  const trail2X = useSpring(mouseX, { stiffness: 250, damping: 20 });
  const trail2Y = useSpring(mouseY, { stiffness: 250, damping: 20 });
  const trail3X = useSpring(mouseX, { stiffness: 180, damping: 16 });
  const trail3Y = useSpring(mouseY, { stiffness: 180, damping: 16 });

  const trailingSprings = [
    { x: trail1X, y: trail1Y },
    { x: trail2X, y: trail2Y },
    { x: trail3X, y: trail3Y }
  ];

  useEffect(() => {
    const checkDevice = () => {
      const mobile =
        window.matchMedia("(max-width: 768px)").matches ||
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

      setIsMobile(mobile);
      if (mobile) setIsVisible(false);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("input") || target.closest("textarea")) {
        setCursorType("input");
      } else if (target.closest(".project-card")) {
        setCursorType("card");
      } else if (target.closest("a") || target.closest("button") || target.closest(".interactive")) {
        setCursorType("pointer");
      } else {
        setCursorType("default");
      }
    };

    window.addEventListener("mousemove", moveMouse);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveMouse);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isMobile, mouseX, mouseY]);

  if (isMobile || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference">
      {trailingSprings.map((spring, index) => (
        <motion.div
          key={index}
          style={{
            x: spring.x,
            y: spring.y,
            translateX: "-50%",
            translateY: "-50%"
          }}
          animate={{
            scale: cursorType !== "default" ? 0 : 1
          }}
          transition={{ duration: 0.2 }}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/40"
        />
      ))}

      <motion.div
        style={{
          x: leadX,
          y: leadY,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          width: cursorType === "pointer" ? 64 : cursorType === "card" ? 80 : cursorType === "input" ? 24 : 12,
          height: cursorType === "pointer" ? 64 : cursorType === "card" ? 80 : cursorType === "input" ? 24 : 12,
          backgroundColor: cursorType === "input" ? "rgba(255,255,255,0.15)" : "rgba(255, 255, 255, 1)",
          border: cursorType === "pointer" ? "1px solid rgba(255, 255, 255, 0.4)" : "none",
          borderRadius: cursorType === "input" ? "2px" : "9999px"
        }}
        transition={{ type: "spring", stiffness: 450, damping: 26 }}
        className="absolute flex items-center justify-center overflow-hidden"
      >
        {cursorType === "card" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] font-bold uppercase tracking-[0.25em] text-black"
          >
            VIEW
          </motion.span>
        )}
        {cursorType === "input" && (
          <motion.div
            animate={{ height: [4, 12, 4] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="w-[1.5px] bg-black"
          />
        )}
      </motion.div>
    </div>
  );
}
