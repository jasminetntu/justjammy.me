"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { FxEngine } from "@/lib/canvas/engine";
import type { Wash } from "@/lib/canvas/wash";
import { pathToView, VIEW_ACCENT } from "@/lib/views";

interface FxApi {
  engine: FxEngine;
  burst: (x: number, y: number, col: string, n?: number, col2?: string) => void;
  launchShoot: () => void;
  setWashOverride: (wash: Wash | null) => void;
}

const FxContext = createContext<FxApi | null>(null);

export function useFx(): FxApi {
  const ctx = useContext(FxContext);
  if (!ctx) throw new Error("useFx must be used inside <FxProvider>");
  return ctx;
}

export function FxProvider({ children }: { children: React.ReactNode }) {
  // one engine for the whole session; constructor is side-effect free so this
  // is safe during SSR — canvases attach later via <BackgroundCanvas>
  const [api] = useState<FxApi>(() => {
    const engine = new FxEngine();
    return {
      engine,
      burst: (x, y, col, n = 16, col2) => engine.burst(x, y, col, n, col2),
      launchShoot: () => engine.launchShoot(),
      setWashOverride: (wash) => engine.setWashOverride(wash),
    };
  });

  const pathname = usePathname();
  const firstRoute = useRef(true);

  // route changes drive the wash mood + a soft center burst (the prototype's go())
  useEffect(() => {
    const view = pathToView(pathname);
    api.engine.setView(view);
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    api.engine.burstCenter(VIEW_ACCENT[view]);
  }, [pathname, api]);

  return <FxContext.Provider value={api}>{children}</FxContext.Provider>;
}
