"use client";

import Lenis from "lenis";
import { useEffect } from "react";

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

// One smooth scroll for every page.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 });
    window.lenis = lenis;
    // The home page's opening starts it again when it is done.
    if (document.querySelector(".loader")) lenis.stop();
    return () => {
      lenis.destroy();
      window.lenis = undefined;
    };
  }, []);
  return null;
}
