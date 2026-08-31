"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades + slides content in once it enters the viewport. Renders visible
 * immediately (no animation) under prefers-reduced-motion, matching every
 * other animated piece in this codebase (starting-lights, Car Explorer's
 * showcase rotation, the airflow lab).
 */
export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Lazy initializer, not an effect — avoids a synchronous setState-in-effect
  // render cascade for the (very common) reduced-motion case.
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    // Already showing via the lazy initializer above — nothing to observe.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
