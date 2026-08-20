"use client";

import { useEffect, useRef, useState } from "react";

function supportsCustomCursor() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function SiteCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const frameRef = useRef(null);
  const [enabled] = useState(supportsCustomCursor);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const moveCursor = (event) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const updateHoverState = (event) => {
      const target = event.target;
      setIsHovering(Boolean(target?.closest?.("a, button, input, textarea, select, summary, [role='button']")));
    };

    const animateRing = () => {
      ring.current.x += (pointer.current.x - ring.current.x) * 0.18;
      ring.current.y += (pointer.current.y - ring.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }

      frameRef.current = requestAnimationFrame(animateRing);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", updateHoverState);
    frameRef.current = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", updateHoverState);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden lg:block" aria-hidden="true">
      <div
        ref={ringRef}
        className={`fixed left-0 top-0 h-10 w-10 rounded-full border transition-[height,width,background-color,border-color,opacity] duration-200 ${
          isHovering
            ? "h-14 w-14 border-emerald-500/35 bg-emerald-500/10 opacity-100"
            : "border-emerald-700/25 bg-white/20 opacity-80"
        }`}
      />
      <div
        ref={dotRef}
        className={`fixed left-0 top-0 rounded-full bg-emerald-600 shadow-[0_0_20px_rgba(5,150,105,0.32)] transition-[height,width,opacity] duration-200 ${
          isHovering ? "h-2 w-2 opacity-70" : "h-3 w-3 opacity-100"
        }`}
      />
    </div>
  );
}
