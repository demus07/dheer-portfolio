"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { about, cv, film, filmFrames, notes, process, projects, ringCards, site, sketches, work } from "@/content/site";
import { Footer } from "./Footer";
import { Loader } from "./Loader";

const cards = projects.flatMap((p, i) => ringCards[p.slug].map((src) => ({ src, project: i, slug: p.slug })));
const N = cards.length;
const steps = process.map((s) =>
  s.image === "sketch"
    ? { ...s, src: sketches.maatik.src, alt: "Maatik, first sketch", paper: true }
    : { ...s, src: work.maatik[s.image].src, alt: work.maatik[s.image].alt, paper: s.image !== "facade" },
);

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => n * n * (3 - 2 * n);
const span = (n: number, from: number, to: number) => clamp((n - from) / (to - from));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const frameSrc = (i: number) => `/film/${String(i).padStart(3, "0")}.webp`;

// The home page. His name over a drum of his renders, which opens into a ring as you scroll.
// Then his Shararat walkthrough grows out of the dark, the projects, how he works, and him.
export function Experience() {
  const stage = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLElement>(null);
  const frameBox = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepsRef = useRef<HTMLElement>(null);

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [front, setFront] = useState(0);
  const [caption, setCaption] = useState(-1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stageEl = stage.current!;
    const tiltEl = tilt.current!;
    const spinEl = spin.current!;
    const reelEl = reel.current!;
    const boxEl = frameBox.current!;
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d");
    const stepsEl = stepsRef.current!;

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
    let stepsTop = 0;
    let stepsH = 0;
    let rot = 0;
    let last = performance.now();
    let frame = 0;
    let filmT = 0;
    let drawn = -1;
    let shownFront = -1;
    let shownCaption = -2;
    let shownStep = -1;

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
    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      W = vw < 760 ? vw * 1.7 : Math.min(vw, vh * 1.75);
      stageEl.style.setProperty("--cw", `${(W * 0.085).toFixed(1)}px`);
      stageEl.style.setProperty("--ch", `${(W * 0.16).toFixed(1)}px`);
      stageTop = top(stageEl);
      stageH = stageEl.offsetHeight;
      reelTop = top(reelEl);
      reelH = reelEl.offsetHeight;
      stepsTop = top(stepsEl);
      stepsH = stepsEl.offsetHeight;
      canvas.width = Math.min(vw, 1600);
      canvas.height = Math.round((canvas.width * vh) / vw);
      drawn = -1;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const y = window.scrollY;

      // The drum turns on its own, and the scroll turns it further.
      if (y < stageTop + stageH) {
        const p = clamp((y - stageTop) / (stageH - vh));
        const open = ease(span(p, 0, 0.55));
        if (!still) rot += dt * 0.007;
        const turn = rot + p * 240;

        const drumR = W * 0.25;
        const ringR = Math.min(W * 0.3, vw * 0.44);
        const drumScale = (Math.PI * 2 * drumR) / N / (W * 0.085);
        tiltEl.style.transform = `translateY(${mix(vh * 0.11, vh * 0.02, open).toFixed(1)}px) rotateX(${mix(-9, -24, open).toFixed(2)}deg)`;
        spinEl.style.transform = `rotateY(${(-turn).toFixed(2)}deg)`;
        spinEl.style.setProperty("--r", `${mix(drumR, ringR, open).toFixed(1)}px`);
        spinEl.style.setProperty("--fin", `${mix(0, 72, open).toFixed(2)}deg`);
        spinEl.style.setProperty("--sx", mix(drumScale * 1.02, 1, open).toFixed(4));
        spinEl.style.setProperty("--sy", mix(1, 0.72, open).toFixed(4));
        stageEl.style.setProperty("--open", open.toFixed(4));
        const isOpen = String(open > 0.9);
        if (stageEl.dataset.open !== isOpen) stageEl.dataset.open = isOpen;

        // The card turned most toward the viewer names its project.
        const facing = Math.round((((turn % 360) + 360) % 360) / (360 / N)) % N;
        if (cards[facing].project !== shownFront) {
          shownFront = cards[facing].project;
          setFront(shownFront);
        }
      }

      // The walkthrough grows out of the dark until it fills the screen.
      if (y > reelTop - vh * 2) loadFilm();
      if (y + vh > reelTop && y < reelTop + reelH) {
        const q = clamp((y - reelTop) / (reelH - vh));
        const grow = still ? 1 : ease(span(q, 0, 0.3));
        const small = Math.min(vw * 0.1, 160);
        const w = mix(small, vw, grow);
        const h = mix((small * 9) / 16, vh, grow);
        boxEl.style.clipPath = `inset(${((vh - h) / 2).toFixed(1)}px ${((vw - w) / 2).toFixed(1)}px round ${mix(4, 0, grow).toFixed(1)}px)`;
        canvas.style.transform = `scale(${mix(1.35, 1, grow).toFixed(4)})`;
        filmT += (span(q, 0.02, 0.97) - filmT) * (still ? 1 : 0.08);
        drawFilm(filmT * (filmFrames.count - 1));
        const c = film.findIndex((s) => q >= s.from && q <= s.to);
        if (c !== shownCaption) {
          shownCaption = c;
          setCaption(c);
        }
      }

      // How he works: one step at a time.
      if (y + vh > stepsTop && y < stepsTop + stepsH) {
        const r = clamp((y - stepsTop) / (stepsH - vh));
        const s = Math.min(steps.length - 1, Math.floor(r * steps.length));
        if (s !== shownStep) {
          shownStep = s;
          setStep(s);
        }
      }

      frame = requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
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
                    className={card.slug === "hubtown-seasons" ? "card card--paper" : "card"}
                    style={{ "--a": `${(i / N) * 360}deg` } as React.CSSProperties}
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

          <div className="stage__work">
            <h2 className="stage__title">Four rooms, so far.</h2>
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

      <section className="work" id="work">
        <h2 className="work__title">Selected projects</h2>
        <div className="work__grid">
          {projects.map((p) => {
            const image = work[p.slug][p.cover];
            return (
              <Link key={p.slug} href={`/work/${p.slug}`} className={image.kind === "drawing" ? "tile tile--paper" : "tile"}>
                <div className="tile__image">
                  <Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
                </div>
                <div className="tile__meta">
                  <span className="tile__name">{p.title}</span>
                  <span>{p.tags[0]}</span>
                  <span>{p.tags[1]}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="steps" ref={stepsRef} aria-label="How I work">
        <div className="steps__pin">
          <p className="steps__label">How I think, on one project</p>
          <ol className="steps__list">
            {steps.map((s, i) => (
              <li key={s.name} data-on={i === step}>
                {s.name}
              </li>
            ))}
          </ol>
          <div className="steps__card">
            <div className="steps__images">
              {steps.map((s, i) => (
                <img key={s.name} src={s.src} alt={s.alt} data-on={i === step} data-paper={s.paper} loading="lazy" />
              ))}
            </div>
            <p className="steps__line">{steps[step].line}</p>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <p className="about__lead">{about.lead}</p>
        <div className="about__row">
          <figure className="about__picture">
            {site.portrait ? (
              <img src={site.portrait} alt={site.fullName} />
            ) : (
              <img src={work.sketchbook["page-2"].src} alt={work.sketchbook["page-2"].alt} loading="lazy" />
            )}
          </figure>
          <div className="about__text">
            <p className="about__stance">{about.stance}</p>
            {notes.map((n) => (
              <p key={n}>{n}</p>
            ))}
            <a className="talk" href="#contact">
              Let’s talk <span aria-hidden>→</span>
            </a>
          </div>
        </div>
        <dl className="cv">
          {cv.map((c) => (
            <div key={c.role + c.place}>
              <dt>{c.role}</dt>
              <dd>{c.place}</dd>
              <dd className="cv__when">{c.when}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Footer />
    </>
  );
}
