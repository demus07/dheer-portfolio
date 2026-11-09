"use client";

import { memo, useEffect, useRef } from "react";
import { about, notes, site, work } from "@/content/site";
import { onFrame } from "@/lib/ticker";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

const words = about.lead.split(" ");

// About, in his words. The lead darkens word by word as you read down it. Below, a page of his
// sketchbook sits straight on the paper beside his stance, and a short index of where he's from,
// how he began, who he looks to and what he does away from the drawing board.
function AboutSection() {
  const lead = useRef<HTMLParagraphElement>(null);
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leadEl = lead.current!;
    const pageEl = page.current!;
    const spans = Array.from(leadEl.querySelectorAll<HTMLSpanElement>("span"));
    let vh = 0;
    let leadTop = 0;
    let leadH = 0;
    let pageTop = 0;
    let shown = -1;

    const measure = () => {
      vh = window.innerHeight;
      leadTop = leadEl.getBoundingClientRect().top + window.scrollY;
      leadH = leadEl.offsetHeight;
      pageTop = pageEl.getBoundingClientRect().top + window.scrollY;
      shown = -1;
    };

    const tick = () => {
      const y = window.scrollY;
      if (y + vh < leadTop || y > pageTop + vh * 1.5) return;
      if (Math.abs(y - shown) < 0.5) return;
      shown = y;
      // Read from when the lead's top is low on the screen until its end is a third of the way up.
      const read = clamp((y + vh * 0.82 - leadTop) / (leadH + vh * 0.4));
      const at = read * words.length;
      spans.forEach((s, i) => s.style.setProperty("--ink", clamp(at - i).toFixed(3)));
      // The page drifts a little slower than the text beside it.
      pageEl.style.transform = `translate3d(0, ${((y + vh - pageTop) * -0.08).toFixed(2)}px, 0)`;
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

  const picture = site.portrait || work.sketchbook["page-2"].src;

  return (
    <section className="about" id="about">
      <p className="about__eyebrow">About</p>
      <p className="about__lead" ref={lead}>
        {words.map((w, i) => (
          <span key={i}>{w} </span>
        ))}
      </p>

      <div className="about__body">
        <figure className="about__page" data-portrait={!!site.portrait}>
          <div ref={page}>
            <img src={picture} alt={site.portrait ? site.fullName : work.sketchbook["page-2"].alt} loading="lazy" />
          </div>
          <figcaption>{site.portrait ? site.fullName : "From the sketchbook"}</figcaption>
        </figure>

        <div className="about__side">
          <blockquote className="about__stance">{about.stance}</blockquote>
          <dl className="about__index">
            {notes.map((n) => (
              <div key={n.label}>
                <dt>{n.label}</dt>
                <dd>{n.text}</dd>
              </div>
            ))}
          </dl>
          <a className="talk" href="#contact">
            Let’s talk <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export const About = memo(AboutSection);
