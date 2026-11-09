"use client";

import { memo, useEffect, useRef } from "react";
import { journey } from "@/content/site";
import { onFrame } from "@/lib/ticker";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => n * n * (3 - 2 * n);

// His CV as a road, read like a page: it starts top left, runs right, cuts down to the left of the
// next row and runs right again, a Z through every row. The section holds still while the scroll
// draws the road, a dot riding its tip, and each stop comes up as the road reaches it.
function JourneySection() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const road = useRef<SVGPathElement>(null);
  const tip = useRef<SVGCircleElement>(null);
  const stops = useRef<HTMLLIElement[]>([]);
  const next = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = section.current!;
    const pinEl = pin.current!;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start = 0;
    let vh = 0;
    let total = 1;
    let marks: number[] = [];
    let points: [number, number][] = [];
    let lengths: number[] = [];
    let shown = -1;

    // Lay the road out for this screen: rows of stops, joined left to right and corner to corner.
    const measure = () => {
      const vw = pinEl.clientWidth;
      vh = pinEl.clientHeight;
      start = el.getBoundingClientRect().top + window.scrollY;
      const narrow = vw < 760;
      const cols = narrow ? 1 : 2;
      const rows = Math.ceil(journey.stops.length / cols);
      const gutter = narrow ? 16 : Math.max(16, Math.min(24, vw * 0.016));
      const left = gutter;
      const right = vw - gutter;
      const top = title.current!.offsetTop + title.current!.offsetHeight + vh * 0.03;
      const bottom = vh * (narrow ? 0.93 : 0.9);
      const row = (bottom - top) / rows;

      points = [];
      for (let r = 0; r < rows; r++) {
        const y = top + row * (r + (narrow ? 0.5 : 0.56));
        points.push([left, y], [right, y]);
      }
      lengths = [0];
      for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        lengths.push(lengths[i - 1] + Math.hypot(x1 - x0, y1 - y0));
      }
      total = lengths[lengths.length - 1];
      svg.current!.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
      road.current!.setAttribute("d", points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(""));
      road.current!.style.strokeDasharray = `${total} ${total}`;

      // Each stop sits on its row's line; its distance along the road is where it lights up.
      marks = journey.stops.map((_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = left + (right - left) * (narrow ? 0 : c === 0 ? 0.06 : 0.53);
        const y = points[r * 2][1];
        const s = stops.current[i];
        s.style.left = `${x}px`;
        s.style.top = `${y}px`;
        return lengths[r * 2] + (x - left);
      });
      const [ex, ey] = points[points.length - 1];
      next.current!.style.left = `${ex}px`;
      next.current!.style.top = `${ey}px`;
      shown = -1;
    };

    // The point a given distance along the road.
    const at = (d: number): [number, number] => {
      let i = 1;
      while (i < lengths.length - 1 && lengths[i] < d) i++;
      const t = clamp((d - lengths[i - 1]) / Math.max(1, lengths[i] - lengths[i - 1]));
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    };

    const tick = () => {
      const y = window.scrollY;
      const height = el.offsetHeight;
      if (y + vh < start || y > start + height) return;
      const p = still ? 1 : clamp((y - start) / Math.max(1, height - vh));
      if (Math.abs(p - shown) < 0.0003) return;
      shown = p;
      // A little of the road is already there when you arrive, and all of it before you leave.
      const drawn = total * clamp(0.02 + p * 1.08);
      road.current!.style.strokeDashoffset = (total - drawn).toFixed(2);
      const [hx, hy] = at(drawn);
      tip.current!.setAttribute("cx", hx.toFixed(1));
      tip.current!.setAttribute("cy", hy.toFixed(1));
      tip.current!.style.opacity = drawn >= total - 1 ? "0" : "1";
      const soft = total * 0.05;
      stops.current.forEach((s, i) => s.style.setProperty("--in", ease(clamp((drawn - marks[i]) / soft)).toFixed(4)));
      next.current!.style.setProperty("--in", ease(clamp((drawn - total + soft) / soft)).toFixed(4));
    };

    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    const off = onFrame(tick);
    return () => {
      off();
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="journey" ref={section} aria-labelledby="journey-title">
      <div className="journey__pin" ref={pin}>
        <h2 id="journey-title" className="journey__title" ref={title}>
          {journey.title}
        </h2>
        <svg className="journey__road" ref={svg} aria-hidden>
          <path ref={road} />
          <circle ref={tip} r="4.5" />
        </svg>
        <ol className="journey__stops">
          {journey.stops.map((stop, i) => (
            <li
              key={stop.what + stop.where}
              className="stop"
              data-loose={!/^\d/.test(stop.when)}
              ref={(n) => {
                if (n) stops.current[i] = n;
              }}
            >
              <span className="stop__when">
                <span>{stop.when}</span>
              </span>
              <span className="stop__dot" aria-hidden />
              <span className="stop__what">{stop.what}</span>
              <span className="stop__where">{stop.where}</span>
            </li>
          ))}
        </ol>
        <a className="journey__next" ref={next} href="#contact">
          What’s next? Let’s talk <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}

export const Journey = memo(JourneySection);
