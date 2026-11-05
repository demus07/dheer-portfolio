"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects, site } from "@/content/site";
import { Fill } from "./Fill";
import { PlanLines, rooms } from "./Plan";

const VIEWBOX = "0 0 1200 560";

export function Hero() {
  const plan = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // The lamp follows the cursor, and drifts through the rooms when there isn't one.
  useEffect(() => {
    const el = plan.current;
    if (!el) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const place = (x: number, y: number) => {
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
    };

    let box = el.getBoundingClientRect();
    let x = box.width * 0.3;
    let y = box.height * 0.45;
    place(x, y);
    if (still) return;

    let target: { x: number; y: number } | null = null;
    let frame = 0;
    let visible = true;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      box = el.getBoundingClientRect();
      target = { x: e.clientX - box.left, y: e.clientY - box.top };
    };
    const tick = (t: number) => {
      const goal = target ?? {
        x: Math.min(box.width, window.innerWidth) * (0.5 + 0.38 * Math.sin(t / 5200)),
        y: box.height * (0.5 + 0.34 * Math.sin(t / 3400)),
      };
      x += (goal.x - x) * 0.09;
      y += (goal.y - y) * 0.09;
      place(x, y);
      if (visible) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(tick);
    });

    observer.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const room = active === null ? null : projects[active];

  return (
    <section className="hero">
      <div className="hero__plan" ref={plan}>
        <div className="hero__glow" aria-hidden />
        <svg className="plan" viewBox={VIEWBOX} aria-hidden>
          <PlanLines draw />
        </svg>
        <svg className="plan plan--lit" viewBox={VIEWBOX} aria-hidden>
          <PlanLines />
        </svg>
        <svg className="plan plan--rooms" viewBox={VIEWBOX}>
          {rooms.map((r, i) => (
            <Link
              key={r.points}
              href={`/work/${projects[i].slug}`}
              aria-label={projects[i].title}
              className={active === i ? "room is-active" : "room"}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <polygon points={r.points} />
              <text x={r.label[0]} y={r.label[1]}>
                {projects[i].no}
              </text>
            </Link>
          ))}
        </svg>
      </div>

      <div className="hero__foot">
        <h1 className="hero__name">{site.name}</h1>
        <div className="hero__meta">
          <p className="hero__words">
            <Fill>{site.words}</Fill>
          </p>
          <p className="label">
            <Fill>{`${site.role}, ${site.location}`}</Fill>
          </p>
          <p className="label hero__readout">
            {room ? (
              <>
                <b>({room.no})</b> {room.title}, {room.type}
              </>
            ) : (
              "(Plan) Six rooms. Step into one."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
