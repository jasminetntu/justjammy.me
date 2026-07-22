"use client";

import { useEffect, useRef } from "react";

import { useFx } from "@/components/layout/fx-provider";

// two fixed full-viewport canvases — washes+ribbon behind content, sparkles
// above; pointer events pass through both
export function BackgroundCanvas() {
  const { engine } = useFx();
  const bgRef = useRef<HTMLCanvasElement>(null);
  const sparkRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!bgRef.current || !sparkRef.current) return;
    engine.mount(bgRef.current, sparkRef.current);
    return () => engine.unmount();
  }, [engine]);

  return (
    <>
      <canvas ref={bgRef} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
      <canvas ref={sparkRef} aria-hidden className="pointer-events-none fixed inset-0 z-20 h-full w-full" />
    </>
  );
}
