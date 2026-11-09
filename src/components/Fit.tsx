"use client";

import { useEffect, useRef, useState } from "react";
import { fit } from "@/content/site";

// Who he'd love to design for. Tick what sounds like you; once most of it does, the panel says so
// and points to the contact. The rows come in one after another as the section arrives.
export function Fit() {
  const section = useRef<HTMLElement>(null);
  const [ticked, setTicked] = useState<boolean[]>(() => fit.yes.items.map(() => false));
  const count = ticked.filter(Boolean).length;
  const total = fit.yes.items.length;
  const match = count >= Math.ceil(total * 0.66);

  useEffect(() => {
    const el = section.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.in = "true";
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="fit" ref={section} aria-labelledby="fit-title" data-in="false">
      <h2 id="fit-title" className="fit__title">
        {fit.title}
      </h2>

      <div className="fit__panels">
        <fieldset className="fit__panel fit__panel--yes">
          <legend className="fit__label">{fit.yes.label}</legend>
          <ul>
            {fit.yes.items.map((item, i) => (
              <li key={item} style={{ "--i": i } as React.CSSProperties}>
                <label>
                  <input
                    type="checkbox"
                    checked={ticked[i]}
                    onChange={() => setTicked((t) => t.map((v, j) => (j === i ? !v : v)))}
                  />
                  <span className="fit__box" aria-hidden />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="fit__count" aria-live="polite">
            <span className="fit__n">{count}</span>
            <span className="fit__of"> / {total}</span>
            {match ? (
              <a className="fit__match" href="#contact">
                {fit.match} <span aria-hidden>→</span>
              </a>
            ) : (
              <span className="fit__prompt">{fit.prompt}</span>
            )}
          </p>
        </fieldset>

        <div className="fit__panel fit__panel--no">
          <p className="fit__label">{fit.no.label}</p>
          <ul>
            {fit.no.items.map((item, i) => (
              <li key={item} style={{ "--i": i } as React.CSSProperties}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
