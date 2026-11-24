"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { film, filmFrames, projects, ringCards, site, work } from "@/content/site";
import { Creed } from "./Creed";
import { About } from "./About";
import { Footer } from "./Footer";
import { Journey } from "./Journey";
import { Loader } from "./Loader";
import { ProcessVideo } from "./ProcessVideo";
import { onFrame } from "@/lib/ticker";

const cards = projects.flatMap((p, i) => ringCards[p.slug].map((src) => ({ src, project: i, slug: p.slug })));
const N = cards.length;
// The projects: one tall render for each, cropped from the middle of the picture.
const panels = (
  [
    ["maatik", "vessel"],
    ["light-of-bharat", "dining"],
    ["shararat", "booths"],
  ] as const
).map(([slug, name]) => ({ ...work[slug][name], slug, title: projects.find((p) => p.slug === slug)!.title }));
// How far each panel starts below the others, in screens. The middle one leads, as on Santal.
const lag = [0.45, 0.15, 0.32];

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => n * n * (3 - 2 * n);
const span = (n: number, from: number, to: number) => clamp((n - from) / (to - from));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const frameSrc = (i: number) => `/film/${String(i).padStart(3, "0")}.webp`;

// The home page. His name over a drum of his renders, which opens into a ring as you scroll.
// Then three words on paper turn into what he starts from, his Shararat walkthrough grows out of the dark, the projects, how he works, and him.
export function Experience() {
  const stage = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLElement>(null);
  const frameBox = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worksRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<HTMLAnchorElement[]>([]);

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [front, setFront] = useState(0);
  const [caption, setCaption] = useState(-1);

  useEffect(() => {
    const stageEl = stage.current!;
    const tiltEl = tilt.current!;
    const drumEl = tiltEl.parentElement!;
    const spinEl = spin.current!;
    const reelEl = reel.current!;
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d");
    const boxEl = frameBox.current!;
    const worksEl = worksRef.current!;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);

    let vw = 0;
    let vh = 0;
    let W = 0;
    let stageTop = 0;
    let stageH = 0;
    let reelTop = 0;
    let reelH = 0;
    let worksTop = 0;
    let worksH = 0;
    let rot = 0;
    let last = performance.now();
    let filmT = 0;
    let drawn = -1;
    let shownFront = -1;
    let shownCaption = -2;

    // The walkthrough loads in order, a few frames at a time, once it is close.
    const frames: HTMLImageElement[] = [];
    let next = 0;
    const loadOne = () => {
      if (next >= filmFrames.count) return;
      const img = new window.Image();
      frames[next] = img;
      img.src = frameSrc(next++);
      img.decode().catch(() => {}).finally(loadOne);
    };
    const loadFilm = () => {
      if (next > 0) return;
      for (let i = 0; i < 6; i++) loadOne();
    };
    const ready = (i: number) => frames[i]?.complete && frames[i].naturalWidth > 0;

    const cover = (img: HTMLImageElement) => {
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      context!.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };

    // Each frame dissolves into the next, so 12 frames a second reads as continuous.
    // His cuts stay cuts.
    const drawFilm = (position: number) => {
      if (!context || Math.abs(position - drawn) < 0.003) return;
      const a = Math.floor(position);
      const t = position - a;
      let base = -1;
      for (let d = 0; d <= a && base < 0; d++) if (ready(a - d)) base = a - d;
      if (base < 0) return;
      drawn = position;
      context.globalAlpha = 1;
      cover(frames[base]);
      if (base === a && t > 0.01 && ready(a + 1) && !filmFrames.cuts.includes(a + 1)) {
        context.globalAlpha = t;
        cover(frames[a + 1]);
        context.globalAlpha = 1;
      }
    };

    const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
    // Screen heights are read off the stage's pin, which is 100svh, the unit every section here is
    // sized in. On a phone window.innerHeight changes as the browser's bars come and go.
    const pinEl = stageEl.firstElementChild as HTMLElement;
    const measure = () => {
      vw = window.innerWidth;
      vh = pinEl.clientHeight;
      W = vw < 760 ? vw * 1.7 : Math.min(vw, vh * 1.75);
      stageEl.style.setProperty("--cw", `${(W * 0.085).toFixed(1)}px`);
      stageEl.style.setProperty("--ch", `${(W * 0.16).toFixed(1)}px`);
      stageTop = top(stageEl);
      stageH = stageEl.offsetHeight;
      reelTop = top(reelEl);
      reelH = reelEl.offsetHeight;
      worksTop = top(worksEl);
      worksH = worksEl.offsetHeight;
      canvas.width = Math.min(vw, 1600);
      canvas.height = Math.round((canvas.width * vh) / vw);
      drawn = -1;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const y = window.scrollY;

      // The drum turns on its own, and the scroll turns it further. At the end the ring turns
      // edge-on and flattens into a single line, which the creed takes up as its horizon.
      if (y < stageTop + stageH) {
        const p = clamp((y - stageTop) / (stageH - vh));
        const open = ease(span(p, 0, 0.38));
        const exit = ease(span(p, 0.7, 0.97));
        // It drifts on its own, slowing as it opens, and the scroll adds only a gentle quarter turn,
        // so the ring never whips round under the reader.
        if (!still) rot += dt * mix(0.006, 0.0025, open);
        const turn = rot + ease(p) * 90;

        const drumR = W * 0.25;
        const ringR = Math.min(W * 0.3, vw * 0.44);
        const drumScale = (Math.PI * 2 * drumR) / N / (W * 0.085);
        const lift = mix(mix(vh * 0.11, vh * 0.02, open), 0, exit);
        const tip = mix(mix(-9, -24, open), 0, exit);
        tiltEl.style.transform = `translateY(${lift.toFixed(1)}px) rotateX(${tip.toFixed(2)}deg)`;
        // Seen from its own height the ring is a band; squashed, the band is a line.
        drumEl.style.perspectiveOrigin = `50% ${mix(30, 50, exit).toFixed(2)}%`;
        const flat = mix(1, 1.2 / (W * 0.16 * 0.72), ease(span(exit, 0.45, 1)));
        spinEl.style.transform = `scale3d(1, ${flat.toFixed(4)}, 1) rotateY(${(-turn).toFixed(2)}deg)`;
        spinEl.style.setProperty("--r", `${mix(drumR, ringR, open).toFixed(1)}px`);
        spinEl.style.setProperty("--fin", `${mix(0, 72, open).toFixed(2)}deg`);
        spinEl.style.setProperty("--sx", mix(drumScale * 1.02, 1, open).toFixed(4));
        spinEl.style.setProperty("--sy", mix(1, 0.72, open).toFixed(4));
        stageEl.style.setProperty("--open", open.toFixed(4));
        stageEl.style.setProperty("--exit", exit.toFixed(4));
        const isOpen = String(open > 0.9 && exit < 0.4);
        if (stageEl.dataset.open !== isOpen) stageEl.dataset.open = isOpen;

        // The card turned most toward the viewer names its project.
        const facing = Math.round((((turn % 360) + 360) % 360) / (360 / N)) % N;
        if (cards[facing].project !== shownFront) {
          shownFront = cards[facing].project;
          setFront(shownFront);
        }
      }

      // The walkthrough arrives full screen out of the dive, and the scroll plays it.
      if (y > reelTop - vh * 4) loadFilm();
      if (y + vh > reelTop && y < reelTop + reelH) {
        const q = clamp((y - reelTop) / (reelH - vh));
        filmT += (span(q, 0.02, 0.74) - filmT) * (still ? 1 : 0.18);
        // Its last screen lies under the projects. As their wall rises over it, the film settles
        // back and dims into the dark, so the pictures arrive on it, never after a blank screen.
        const recede = ease(span(q, 0.74, 1));
        boxEl.style.transform = recede > 0 ? `scale(${(1 - recede * 0.1).toFixed(4)})` : "";
        boxEl.style.opacity = String(1 - recede * 0.94);
        reelEl.style.setProperty("--shut", recede.toFixed(3));
        drawFilm(filmT * (filmFrames.count - 1));
        const c = film.findIndex((s) => q >= s.from && q <= s.to);
        if (c !== shownCaption) {
          shownCaption = c;
          setCaption(c);
        }
      }

      // The projects rise from below, the middle one first, and settle level as the section fills
      // the screen. Their title comes up at the top only once the section has, so it never slides
      // across the film. On a phone they stand one above the other and simply scroll.
      if (y + vh > worksTop && y < worksTop + worksH) {
        worksEl.style.setProperty("--label", span(y, worksTop - vh * 0.2, worksTop).toFixed(3));
        const fixed = still || vw < 760;
        const settle = worksTop + Math.max(1, worksH - vh);
        const rise = fixed ? 1 : ease(span(y, worksTop - vh, settle));
        panelRefs.current.forEach((panel, i) => {
          const off = fixed ? 0 : lag[i] * vh * (1 - rise);
          panel.style.transform = off > 0.01 ? `translate3d(0, ${off.toFixed(2)}px, 0)` : "";
        });
      }

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
      history.scrollRestoration = previous;
    };
  }, []);

  const done = () => {
    setLoading(false);
    window.lenis?.start();
  };

  return (
    <>
      {loading && <Loader images={cards.map((c) => c.src)} onLift={() => setReady(true)} onDone={done} />}

      <section className="stage" ref={stage} data-ready={ready}>
        <div className="stage__pin">
          <h1 className="stage__name" aria-label={site.fullName}>
            {site.fullName.split(" ").map((word) => (
              <span key={word} className="mask" aria-hidden>
                <span>{word}</span>
              </span>
            ))}
          </h1>

          <div className="drum" aria-hidden>
            <div className="drum__tilt" ref={tilt}>
              <div className="drum__spin" ref={spin}>
                {cards.map((card, i) => (
                  <Link
                    key={i}
                    href={`/work/${card.slug}`}
                    tabIndex={-1}
                    className="card"
                    style={{ "--a": `${(i / N) * 360}deg` } as React.CSSProperties}
                  >
                    <img src={card.src} alt="" draggable={false} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="stage__foot">
            <p className="stage__intro">
              {site.role}, {site.location}
            </p>
            <a className="talk" href="#contact">
              Let’s talk <span aria-hidden>→</span>
            </a>
          </div>

          <div className="stage__work">
            <h2 className="stage__title">Three rooms, so far.</h2>
            <ul className="stage__names">
              {projects.map((p, i) => (
                <li key={p.slug} data-on={i === front}>
                  <Link href={`/work/${p.slug}`}>
                    <span className="stage__project">{p.title}</span>
                    <span className="stage__line">{p.line}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {site.showAbout && <About />}

      <Creed />

      <section className="reel" ref={reel} aria-label="Shararat, a walkthrough">
        <div className="reel__pin">
          <div className="reel__frame" ref={frameBox}>
            <canvas ref={canvasRef} role="img" aria-label="Walkthrough of Shararat" />
          </div>
          <p className="reel__label">Shararat, a walkthrough</p>
          <div className="reel__captions">
            {film.map((c, i) => (
              <p key={c.text} data-on={i === caption}>
                {c.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="works" id="work" ref={worksRef} aria-labelledby="works-title">
        <h2 id="works-title" className="works__label">
          Selected projects
        </h2>
        <div className="works__panels">
          {panels.map((panel, i) => (
            <Link
              key={panel.slug}
              href={`/work/${panel.slug}`}
              className="shot"
              aria-label={panel.title}
              ref={(n) => {
                if (n) panelRefs.current[i] = n;
              }}
            >
              {/* Cropped to a tall slice, a picture shows only its middle, so it needs to load about as wide as the panel is tall. */}
              <Image src={panel.src} alt={panel.alt} fill sizes="(max-width: 760px) 120vw, 100vw" />
              <span className="shot__name" aria-hidden>
                {panel.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ProcessVideo />

      <Journey />

      <Footer />
    </>
  );
}
