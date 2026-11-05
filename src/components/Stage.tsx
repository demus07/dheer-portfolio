"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects, site } from "@/content/site";

const cards = projects.flatMap((p, i) =>
  [...p.plates, p.plates[0], p.plates[2]].map((src) => ({ src, project: i, slug: p.slug })),
);

// Share of the pinned scroll spent opening the shade. The rest tours the projects.
const OPEN_END = 0.28;
const SECTOR = 360 / projects.length;

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => n * n * (3 - 2 * n);

// The drum is a lampshade made of the work. Scrolling opens its slats into a ring
// around the lamp, then turns each project to face the viewer.
export function Stage() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [touring, setTouring] = useState(false);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const follow = still ? 1 : 0.12;
    let open = 0;
    let rot = 0;
    let last = performance.now();
    let frame = 0;
    let visible = true;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;

      const box = wrap.current!.getBoundingClientRect();
      const progress = clamp(-box.top / (box.height - window.innerHeight));
      const tour = clamp((progress - OPEN_END) / (1 - OPEN_END));
      const inTour = progress >= OPEN_END;

      open += (ease(clamp(progress / OPEN_END)) - open) * follow;

      if (inTour) {
        const position = 0.2 + tour * (projects.length - 0.4);
        const goal = -90 - position * SECTOR;
        const turn = ((goal - rot) % 360 + 540) % 360 - 180;
        rot += turn * (still ? 1 : 0.08);
        setActive(Math.floor(position));
      } else if (!still) {
        rot += dt * 0.005;
      }

      stage.current!.style.setProperty("--open", open.toFixed(4));
      ring.current!.style.transform = `rotateY(${rot.toFixed(3)}deg)`;
      setTouring(inTour && open > 0.9);

      if (visible) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });

    observer.observe(wrap.current!);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="stage-wrap" ref={wrap}>
      <span className="anchor" id="work" />
      <section className="stage" ref={stage} data-touring={touring}>
        <div className="spill" aria-hidden />

        <h1 className="stage__name">{site.name}</h1>

        <div className="scene" aria-hidden>
          <div className="tilt">
            <div className="lamp" />
            <div className="ring" ref={ring}>
              {cards.map((card, i) => (
                <Link
                  key={i}
                  href={`/work/${card.slug}`}
                  tabIndex={-1}
                  className="slat"
                  data-on={!touring || card.project === active}
                  style={{ "--angle": `${(i / cards.length) * 360}deg` } as React.CSSProperties}
                >
                  <img src={card.src} alt="" draggable={false} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="stage__foot">
          <p className="stage__intro">{site.intro}</p>
          <a className="talk" href="#contact">
            Let’s talk <span aria-hidden>→</span>
          </a>
        </div>

        <ul className="tour">
          {projects.map((p, i) => (
            <li key={p.slug} className="tour__item" data-on={touring && i === active}>
              <h2 className="tour__title">{p.title}</h2>
              <p className="tour__line">{p.line}</p>
              <Link
                className="talk"
                href={`/work/${p.slug}`}
                tabIndex={touring && i === active ? 0 : -1}
              >
                See the project <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
