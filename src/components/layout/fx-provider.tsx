"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { FxEngine } from "@/lib/canvas/engine";
import type { Wash } from "@/lib/canvas/wash";
import { pathToView } from "@/lib/views";

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

  // route changes drive the background wash mood (the page cross-fade is handled
  // by <PageTransition>)
  useEffect(() => {
    api.engine.setView(pathToView(pathname));
  }, [pathname, api]);

  return <FxContext.Provider value={api}>{children}</FxContext.Provider>;
}
