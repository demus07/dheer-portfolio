"use client";

import { useEffect, useState } from "react";
import { hook, site } from "@/content/site";

type Phase = "words" | "dark" | "lift";

const SEEN = "dheer-seen";

// The opening. The hook falls into the grid while the landing's images load, the room goes
// dark for the last line, and then the whole screen lifts away. A second visit only lifts.
export function Loader({ images, onLift, onDone }: { images: string[]; onLift: () => void; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("words");
  const [shown, setShown] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const later = (ms: number, run: () => void) => timers.push(window.setTimeout(run, ms));
    let frame = 0;

    const lift = () => {
      setPhase("lift");
      onLift();
      later(still ? 0 : 1150, onDone);
    };

    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
      sessionStorage.setItem(SEEN, "1");
    } catch {}
    if (seen) {
      later(80, lift);
      return () => timers.forEach(clearTimeout);
    }

    let loaded = 0;
    const total = images.length + 1;
    const count = () => loaded++;
    for (const src of images) {
      const img = new Image();
      img.onload = img.onerror = count;
      img.src = src;
    }
    document.fonts.ready.then(count);
    // A slow connection still gets the site after a few seconds.
    later(6000, () => (loaded = total));

    hook.fall.forEach((_, i) => later(still ? 0 : 900 + i * 420, () => setShown(i + 1)));
    const wordsEnd = still ? 300 : 900 + hook.fall.length * 420 + 600;
    const start = performance.now();
    let display = 0;

    const tick = (now: number) => {
      const real = loaded / total;
      display += Math.max((real - display) * 0.07, Math.min(real - display, 0.004));
      setPercent(Math.round(display * 100));
      if (display >= 0.999 && now - start > wordsEnd) {
        setPhase("dark");
        later(still ? 300 : 1700, lift);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
    // Runs once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="loader" data-phase={phase} aria-hidden>
      <div className="loader__grid" />
      <p className="loader__line">
        <span className="loader__lead">{hook.lead}</span>
        {hook.fall.map((word, i) => (
          <span key={word} className="loader__word" data-on={i < shown}>
            {word}
          </span>
        ))}
      </p>
      <p className="loader__close">{hook.close}</p>
      <p className="loader__by">
        {site.fullName}
        <br />
        Interior design student, Mumbai
      </p>
      <p className="loader__percent">
        Loading <b>{percent}%</b>
      </p>
    </div>
  );
}
