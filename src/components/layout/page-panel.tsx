"use client";

import { useEffect, useState } from "react";

import { ease } from "@/lib/theme";

// shared section-enter animation: content rises + fades in like the
// prototype's applyView panel reveal
export function PagePanel({ children, className }: { children: React.ReactNode; className?: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // double rAF so the hidden state paints before the transition starts
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(26px)",
        transition: `opacity .9s ease, transform .9s ${ease.soft}`,
      }}
    >
      {children}
    </div>
  );
}
