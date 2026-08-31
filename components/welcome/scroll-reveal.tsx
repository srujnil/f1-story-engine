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

    // threshold: 0 + a negative bottom rootMargin fires as soon as the
    // element is even 1px into a slightly-shrunk viewport — i.e. a little
    // before it would traditionally be considered "in view". A higher
    // threshold (0.3) needs 30% of the element visible before firing, which
    // a fast scroll can blow straight past without ever satisfying,
    // permanently leaving the element at opacity-0. This is deliberately
    // the easiest possible condition to satisfy, once, ever.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);

    // Fast-scroll fallback: IntersectionObserver callbacks are asynchronous
    // and can in rare cases lag behind a very fast scroll. If the element is
    // already on-screen shortly after mount (e.g. it was in view before the
    // observer even attached), reveal it directly instead of waiting on a
    // callback that may never come.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
