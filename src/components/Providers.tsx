"use client";

import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {/* Every Framer Motion animation in the app automatically respects the
          OS-level prefers-reduced-motion setting (WCAG 2.2 AA). */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SessionProvider>
  );
}
