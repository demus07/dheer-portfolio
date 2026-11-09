"use client";

import { memo, useEffect, useRef } from "react";
import { creed } from "@/content/site";
import { onFrame } from "@/lib/ticker";
import type { Scene } from "./creed-scene";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => n * n * (3 - 2 * n);
const span = (n: number, from: number, to: number) => clamp((n - from) / (to - from));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Where the scene takes over from the page, and where it hands over to the walkthrough,
// in screen heights scrolled into the section. The section is END + 100 screens tall.
const HANDOFF = 300;
const END = 1060;

// After the landing: three words on paper rise and sink into a horizon, the dark closes on it,
// and "Feeling before form." rises out of it. From there the 3D scene in creed-scene.ts carries
// the phrase into a field of shafts and dives down one, onto the first frame of the walkthrough.
function CreedSection() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const hair = useRef<HTMLDivElement>(null);
  const eyebrow = useRef<HTMLParagraphElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLParagraphElement>(null);
  const lines = useRef<HTMLSpanElement[]>([]);
  const line = useRef<HTMLParagraphElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = section.current!;
    const pinEl = pin.current!;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start = 0;
    let vh = 0;
    let shown = -1;
    let scene: Scene | null = null;
    let building = false;
    let alive = true;
    let rebuild = 0;

    const build = async () => {
      if (building || scene) return;
      building = true;
      // Wait out the opening, then build in the background long before anyone scrolls here.
      while (alive && document.querySelector(".loader")) await new Promise((r) => setTimeout(r, 300));
      if (!alive) return;
      const { createScene } = await import("./creed-scene");
      const phrase = creed.dark.map((text, i) => ({ mask: lines.current[i].parentElement as HTMLElement, text, italic: i === 1 }));
      const made = await createScene(canvas.current!, pinEl, phrase, still).catch(() => null);
      building = false;
      if (!alive) return made?.dispose();
      scene = made;
      shown = -1;
    };

    const measure = () => {
      vh = window.innerHeight;
      start = el.getBoundingClientRect().top + window.scrollY;
      shown = -1;
    };

    // The scene is built for one screen size, so a resize builds it again.
    const resize = () => {
      measure();
      clearTimeout(rebuild);
      rebuild = window.setTimeout(() => {
        scene?.dispose();
        scene = null;
        build();
      }, 200);
    };

    const tick = () => {
      const y = window.scrollY;
      const v = ((y - start) / vh) * 100;
      if (v < -200 || v > END + 120) return;
      if (Math.abs(v - shown) < 0.01) return;
      shown = v;

      // On paper: the words rise, and a hairline swings down to become the horizon they sink into.
      const rise = ease(span(v, 0, 120));
      const sink = ease(span(v, 150, 200));
      const lift = mix(0, -66.6, rise) - 35.4 * sink;
      block.current!.style.transform = `translate3d(0, calc(${mix(52, 0, rise).toFixed(3)}svh + ${lift.toFixed(3)}%), 0)`;
      const swing = ease(span(v, 10, 120));
      hair.current!.style.transform = `translate(-50%, -50%) rotate(${mix(-62, 0, swing).toFixed(3)}deg)`;

      // The dark closes in from both edges onto the horizon, which flares and goes out.
      const close = ease(span(v, 110, 155));
      top.current!.style.transform = `scaleY(${close.toFixed(4)})`;
      bottom.current!.style.transform = `scaleY(${close.toFixed(4)})`;
      hair.current!.style.opacity = String(mix(0.22, 1, close) * (1 - span(v, 165, 190)));
      eyebrow.current!.style.opacity = String(span(v, 20, 50) * (1 - span(v, 90, 120)));
      light.current!.style.visibility = v > 210 ? "hidden" : "visible";

      // In the dark: the phrase rises line by line, then the scene takes it over where it stands.
      lines.current.forEach((l, i) => {
        const up = ease(span(v, 180 + i * 17, 225 + i * 17));
        l.style.transform = `translate3d(0, ${mix(105, 0, up).toFixed(3)}%, 0)`;
      });
      line.current!.style.opacity = String(span(v, 235, 255) * (1 - span(v, 280, 300)));
      const live = !!scene && v >= HANDOFF;
      canvas.current!.style.visibility = live ? "visible" : "hidden";
      dark.current!.style.visibility = live ? "hidden" : "visible";
      if (scene && v >= HANDOFF - 20) scene.update(v);

      // The walkthrough's own shade and title come up as the dive lands, so the cut is invisible.
      const land = span(v, END - 40, END);
      shade.current!.style.opacity = String(land);
      label.current!.style.opacity = String(land);
      // Opacity, not visibility: the canvas sets its own visibility and would show through.
      pinEl.style.opacity = v >= END ? "0" : "1";
    };

    measure();
    build();
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    const off = onFrame(tick);
    return () => {
      alive = false;
      off();
      clearTimeout(rebuild);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      scene?.dispose();
    };
  }, []);

  return (
    <section className="creed" ref={section} aria-labelledby="creed-title">
      <h2 id="creed-title" className="visually-hidden">
        {creed.light.join(", ")}. {creed.dark.join(" ")} {creed.line}
      </h2>

      <div className="creed__pin" ref={pin} aria-hidden>
        <div className="creed__curtain creed__curtain--top" ref={top} />
        <div className="creed__curtain creed__curtain--bottom" ref={bottom} />

        <canvas className="creed__gl" ref={canvas} />

        <p className="creed__dark" ref={dark}>
          {creed.dark.map((word, i) => (
            <span key={word} className="creed__mask">
              <span
                ref={(n) => {
                  if (n) lines.current[i] = n;
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </p>

        <p className="creed__line" ref={line}>
          {creed.line}
        </p>

        <div className="creed__shade" ref={shade} />
        <p className="reel__label creed__label" ref={label}>
          Shararat, a walkthrough
        </p>

        <div className="creed__light" ref={light}>
          <p className="creed__eyebrow" ref={eyebrow}>
            {creed.eyebrow}
          </p>
          <div className="creed__hair" ref={hair} />
          <div className="creed__horizon">
            <div className="creed__block" ref={block}>
              {creed.light.map((word) => (
                <span key={word}>{word}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const Creed = memo(CreedSection);
