"use client";

import { useEffect, useRef } from "react";

// One of his screen recordings, drawn from a line to a render. It plays only while it is on
// screen, and under reduced motion it stays on the finished render.
export function LoopVideo({ src, poster, label, width, height }: { src: string; poster: string; label: string; width: number; height: number }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video ref={video} src={src} poster={poster} width={width} height={height} muted loop playsInline preload="none" aria-label={label} />
  );
}
