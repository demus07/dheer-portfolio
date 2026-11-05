"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { about, film, joint, projects, site } from "@/content/site";
import { Footer } from "./Footer";

const cards = projects.flatMap((p, i) =>
  [...p.plates, p.plates[0], p.plates[2]].map((src) => ({ src, project: i, slug: p.slug })),
);

// Share of the pinned scroll spent opening the shade. The rest tours the projects.
const OPEN_END = 0.28;
const SECTOR = 360 / projects.length;

// Keyhole at 100 × 160, with the circle's centre at (50, 40).
const KEYHOLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 160'%3E%3Ccircle cx='50' cy='40' r='40'/%3E%3Cpath d='M30 66 12 160h76L70 66z'/%3E%3C/svg%3E\")";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => n * n * (3 - 2 * n);
const span = (n: number, from: number, to: number) => clamp((n - from) / (to - from));

type Scene = { draw(t: number): void; resize(w: number, h: number): void; dispose(): void };

// One continuous shot. The drum opens into the ring, the keyhole opens onto the film,
// the film burns out to white, and the last screen is the first, so the page wraps.
export function Experience() {
  const stage = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const lamp = useRef<HTMLDivElement>(null);
  const filmCanvas = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const holdStage = useRef<HTMLDivElement>(null);
  const holdFilm = useRef<HTMLDivElement>(null);
  const holdJoint = useRef<HTMLDivElement>(null);
  const jointCanvas = useRef<HTMLCanvasElement>(null);

  const [active, setActive] = useState(0);
  const [touring, setTouring] = useState(false);
  const [caption, setCaption] = useState(-1);
  const [jointLine, setJointLine] = useState(0);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Held here because React clears refs just before this effect is cleaned up.
    const canvas = filmCanvas.current!;
    const stageEl = stage.current!;
    const ringEl = ring.current!;
    const lampEl = lamp.current!;
    const flashEl = flash.current!;
    const holdStageEl = holdStage.current!;
    const holdFilmEl = holdFilm.current!;
    const holdJointEl = holdJoint.current!;
    const jointEl = jointCanvas.current!;
    const follow = (rate: number) => (still ? 1 : rate);
    let filmScene: Scene | null = null;
    let jointScene: Scene | null = null;
    let gone = false;
    let frame = 0;
    let last = performance.now();
    let open = 0;
    let rot = 0;
    let filmT = 0;
    let jointT = 0;
    let S = 0;
    let F = 0;
    let max = 0;
    let vh = 0;
    let jointTop = 0;
    let jointHeight = 0;

    const measure = () => {
      vh = window.innerHeight;
      S = holdStageEl.offsetHeight;
      F = holdFilmEl.offsetHeight;
      max = document.documentElement.scrollHeight - vh;
      const box = holdJointEl.getBoundingClientRect();
      jointTop = box.top + window.scrollY;
      jointHeight = box.height;
      filmScene?.resize(window.innerWidth, vh);
      jointScene?.resize(window.innerWidth, vh);
    };

    canvas.style.setProperty("mask-image", KEYHOLE);
    canvas.style.setProperty("-webkit-mask-image", KEYHOLE);

    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    // Three.js stays out of the first load, so the landing paints straight away.
    Promise.all([import("@/scenes/film"), import("@/scenes/joint")])
      .then(([{ createFilm }, { createJoint }]) => {
        if (gone) return;
        filmScene = createFilm(canvas);
        jointScene = createJoint(jointEl);
        measure();
      })
      .catch(() => {
        // No WebGL: the captions and the rest of the page still carry the story.
      });

    const openKeyhole = (opening: number) => {
      const size = (value: string) => {
        canvas.style.setProperty("mask-size", value);
        canvas.style.setProperty("-webkit-mask-size", value);
      };
      const place = (value: string) => {
        canvas.style.setProperty("mask-position", value);
        canvas.style.setProperty("-webkit-mask-position", value);
      };
      if (opening >= 1) {
        size("100% 100%");
        canvas.style.setProperty("mask-image", "none");
        canvas.style.setProperty("-webkit-mask-image", "none");
        return;
      }
      canvas.style.setProperty("mask-image", KEYHOLE);
      canvas.style.setProperty("-webkit-mask-image", KEYHOLE);
      const box = lampEl.getBoundingClientRect();
      const width = 2 + opening * opening * Math.max(window.innerWidth, vh) * 6;
      size(`${width}px ${width * 1.6}px`);
      place(`${box.left + box.width / 2 - width * 0.5}px ${box.top + box.height / 2 - width * 0.4}px`);
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const y = window.scrollY;

      if (!still && max > 0 && y >= max - 1) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }

      // The lamp
      const progress = clamp(y / S);
      const tour = span(progress, OPEN_END, 1);
      const past = y >= S + F;
      open += ((past ? 0 : ease(span(progress, 0, OPEN_END))) - open) * (past ? 1 : follow(0.12));

      if (progress >= OPEN_END && !past) {
        const position = 0.2 + tour * (projects.length - 0.4);
        const goal = -90 - position * SECTOR;
        rot += (((((goal - rot) % 360) + 540) % 360) - 180) * follow(0.08);
        setActive(Math.min(projects.length - 1, Math.floor(position)));
        setTouring(open > 0.9);
      } else {
        if (!still) rot += dt * 0.005;
        setTouring(false);
      }
      stageEl.style.setProperty("--open", open.toFixed(4));
      ringEl.style.transform = `rotateY(${rot.toFixed(3)}deg)`;

      // The film
      const f = clamp((y - S + vh) / F);
      const showing = f > 0 && y < S + F + vh;
      canvas.style.visibility = showing ? "visible" : "hidden";
      if (showing) {
        openKeyhole(ease(span(f, 0, 0.1)));
        filmT += (span(f, 0.03, 1) - filmT) * follow(0.1);
        filmScene?.draw(filmT);
        setCaption(film.findIndex((c) => f >= c.from && f <= c.to));
        const burn = ease(span(f, 0.86, 0.95));
        const white = ease(span(f, 0.94, 1));
        flashEl.style.opacity = String(burn);
        flashEl.style.background = `color-mix(in srgb, var(--snow) ${white * 100}%, var(--lava))`;
      } else {
        setCaption(-1);
        flashEl.style.opacity = "0";
      }
      stageEl.style.visibility = f >= 0.12 && y < max - vh * 1.2 ? "hidden" : "visible";

      // The joint
      if (y + vh > jointTop && y < jointTop + jointHeight) {
        const p = clamp((y - jointTop) / (jointHeight - vh));
        jointT += (p - jointT) * follow(0.1);
        jointScene?.draw(jointT);
        setJointLine(Math.min(joint.length - 1, Math.floor(p * joint.length)));
      }

      frame = requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    frame = requestAnimationFrame(tick);

    return () => {
      gone = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      history.scrollRestoration = previous;
      filmScene?.dispose();
      jointScene?.dispose();
    };
  }, []);

  return (
    <>
      <section className="stage" ref={stage} data-touring={touring}>
        <div className="spill" aria-hidden />

        <h1 className="stage__name">{site.name}</h1>

        <div className="scene" aria-hidden>
          <div className="tilt">
            <div className="lamp" ref={lamp} />
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
              <Link className="talk" href={`/work/${p.slug}`} tabIndex={touring && i === active ? 0 : -1}>
                See the project <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <canvas className="film" ref={filmCanvas} aria-hidden />
      <div className="captions">
        {film.map((c, i) => (
          <p key={c.text} data-on={i === caption}>
            {c.text}
          </p>
        ))}
      </div>
      <div className="flash" ref={flash} aria-hidden />

      <div className="page">
        <div className="hold hold--stage" ref={holdStage}>
          <span className="anchor" id="work" />
        </div>
        <div className="hold hold--film" ref={holdFilm} />

        <div className="lit">
          <section className="about" id="about">
            <div className="about__head">
              <h2 className="headline">{about.headline}</h2>
              <p className="about__line">{about.line}</p>
            </div>
            {site.portrait && <img className="about__portrait" src={site.portrait} alt={site.name} />}
            <div className="about__story">
              {about.story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section className="stance">
            <h2 className="headline">{about.stance}</h2>
            <p className="about__line">{about.stanceLine}</p>
          </section>

          <div className="hold--joint" ref={holdJoint}>
            <div className="joint">
              <canvas className="joint__canvas" ref={jointCanvas} aria-hidden />
              <div className="joint__text">
                {joint.map((line, i) => (
                  <p key={line} data-on={i === jointLine}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <section className="notes">
            <p>{about.process}</p>
            <p>{about.influences}</p>
            <p>{about.films}</p>
          </section>
        </div>

        <Footer />
        <div className="hold hold--loop" />
      </div>
    </>
  );
}
