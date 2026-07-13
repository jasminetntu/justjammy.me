"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import { useContext, useState } from "react";

// holds the outgoing route's content while it fades out — App Router swaps
// `children` immediately on navigation, so without this the exiting layer
// would already show the new page. known pattern; relies on a Next internal,
// revisit if a Next upgrade breaks the import path.
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  // useState captures the context from the first render and never updates it
  const [frozen] = useState(context);
  return <LayoutRouterContext.Provider value={frozen}>{children}</LayoutRouterContext.Provider>;
}

// true cross-fade between routes, matching the prototype's .8s view blend —
// the exiting page pops out of layout flow and fades while the next fades in
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="min-h-dvh w-full"
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
