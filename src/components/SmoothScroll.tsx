"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { onFrame } from "@/lib/ticker";

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

// One smooth scroll for every page, stepped by the shared frame before anything reads it.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1, wheelMultiplier: 0.9 });
    window.lenis = lenis;
    const off = onFrame((time) => lenis.raf(time), -1);
    // The home page's opening starts it again when it is done.
    if (document.querySelector(".loader")) lenis.stop();
    return () => {
      off();
      lenis.destroy();
      window.lenis = undefined;
    };
  }, []);
  return null;
}
