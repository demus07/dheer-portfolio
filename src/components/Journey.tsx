"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";

import { journey } from "@/content/site";
import { onFrame } from "@/lib/ticker";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);
const PREVIEW_CURSOR_GAP_PX = 20;
const PREVIEW_VIEWPORT_MARGIN_PX = 16;

// A straight career ledger keeps the chronology legible while the rail, markers and entries
// respond to the reader's position. The sticky title gives the wide left margin a clear purpose.
function JourneySection() {
  const timeline = useRef<HTMLOListElement>(null);
  const stops = useRef<HTMLLIElement[]>([]);
  const [openPreviewIndex, setOpenPreviewIndex] = useState<number | null>(null);

  const positionPreview = (index: number, pointerX: number, pointerY: number): void => {
    const preview = stops.current[index]?.querySelector<HTMLElement>(".journey__preview");
    if (!preview) return;

    const previewWidth = preview.offsetWidth;
    const previewHeight = preview.offsetHeight;
    const hasRoomOnRight = pointerX + PREVIEW_CURSOR_GAP_PX + previewWidth <= window.innerWidth - PREVIEW_VIEWPORT_MARGIN_PX;
    const previewX = hasRoomOnRight ? pointerX + PREVIEW_CURSOR_GAP_PX : pointerX - previewWidth - PREVIEW_CURSOR_GAP_PX;
    const previewY = Math.min(
      Math.max(pointerY - previewHeight / 2, PREVIEW_VIEWPORT_MARGIN_PX),
      window.innerHeight - previewHeight - PREVIEW_VIEWPORT_MARGIN_PX,
    );

    preview.style.setProperty("--preview-x", `${Math.max(PREVIEW_VIEWPORT_MARGIN_PX, previewX)}px`);
    preview.style.setProperty("--preview-y", `${Math.max(PREVIEW_VIEWPORT_MARGIN_PX, previewY)}px`);
  };

  useEffect(() => {
    if (openPreviewIndex === null) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && !target.closest("[data-journey-preview]")) {
        setOpenPreviewIndex(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPreviewIndex(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPreviewIndex]);

  useEffect(() => {
    const timelineElement = timeline.current!;
    const stopElements = stops.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let viewportHeight = 0;
    let timelineTop = 0;
    let markerOffsets: number[] = [];
    let previousReadingPosition = -1;
    let activeIndex = -1;

    const measure = () => {
      viewportHeight = window.innerHeight;
      timelineTop = timelineElement.getBoundingClientRect().top + window.scrollY;
      markerOffsets = stopElements.map((stopElement) => {
        const marker = stopElement.querySelector<HTMLElement>(".journey__marker")!;
        return stopElement.offsetTop + marker.offsetTop + marker.offsetHeight / 2;
      });
      const railStart = markerOffsets[0];
      const railLength = markerOffsets[markerOffsets.length - 1] - railStart;
      timelineElement.style.setProperty("--rail-start", `${railStart.toFixed(2)}px`);
      timelineElement.style.setProperty("--rail-length", `${railLength.toFixed(2)}px`);
      previousReadingPosition = -1;
    };

    const setActiveStop = (nextActiveIndex: number) => {
      if (nextActiveIndex === activeIndex) return;
      if (activeIndex >= 0) {
        stopElements[activeIndex].removeAttribute("data-active");
        stopElements[activeIndex].removeAttribute("aria-current");
      }
      activeIndex = nextActiveIndex;
      if (activeIndex >= 0) {
        stopElements[activeIndex].dataset.active = "true";
        stopElements[activeIndex].setAttribute("aria-current", "step");
      }
    };

    const tick = () => {
      const readingPosition = window.scrollY + viewportHeight * 0.62;
      const railStart = timelineTop + markerOffsets[0];
      const railEnd = timelineTop + markerOffsets[markerOffsets.length - 1];
      const progress = prefersReducedMotion ? 1 : clamp((readingPosition - railStart) / Math.max(1, railEnd - railStart));
      if (Math.abs(readingPosition - previousReadingPosition) < 0.5) return;
      previousReadingPosition = readingPosition;
      timelineElement.style.setProperty("--progress", progress.toFixed(4));

      let nextActiveIndex = readingPosition < railStart ? -1 : 0;
      stopElements.forEach((stopElement, index) => {
        const markerPosition = timelineTop + markerOffsets[index];
        const reveal = prefersReducedMotion ? 1 : ease(clamp((readingPosition - markerPosition + viewportHeight * 0.08) / (viewportHeight * 0.18)));
        stopElement.style.setProperty("--in", reveal.toFixed(4));
        if (readingPosition >= markerPosition - viewportHeight * 0.03) nextActiveIndex = index;
      });
      setActiveStop(prefersReducedMotion ? -1 : nextActiveIndex);
    };

    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    const stopFrame = onFrame(tick);

    return () => {
      stopFrame();
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="journey" aria-labelledby="journey-title">
      <div className="journey__layout">
        <header className="journey__intro">
          <h2 id="journey-title" className="journey__title">
            {journey.title}
          </h2>
          <p className="journey__range">2023 — 2027</p>
        </header>

        <ol className="journey__timeline" ref={timeline}>
          {journey.stops.map((stop, index) => (
            <li
              key={stop.what + stop.where}
              className="journey__item"
              data-loose={!/^\d/.test(stop.when)}
              data-preview-open={openPreviewIndex === index}
              ref={(node) => {
                if (node) stops.current[index] = node;
              }}
            >
              <span className="journey__when">{stop.when}</span>
              <span className="journey__marker" aria-hidden />
              <span className="journey__event">
                <button
                  className="journey__event-title"
                  type="button"
                  aria-expanded={openPreviewIndex === index}
                  aria-controls={`journey-preview-${index}`}
                  data-journey-preview
                  onPointerMove={(event) => positionPreview(index, event.clientX, event.clientY)}
                  onFocus={(event) => {
                    const titleBounds = event.currentTarget.getBoundingClientRect();
                    positionPreview(index, titleBounds.right, titleBounds.top + titleBounds.height / 2);
                  }}
                  onClick={() => setOpenPreviewIndex((currentIndex) => (currentIndex === index ? null : index))}
                >
                  <strong>{stop.what}</strong>
                </button>
                <span>{stop.where}</span>
              </span>
              <figure
                id={`journey-preview-${index}`}
                className="journey__preview"
                data-open={openPreviewIndex === index}
                data-journey-preview
                aria-hidden={openPreviewIndex !== index}
              >
                <Image src={stop.image} alt="" fill sizes="(max-width: 760px) 76vw, 340px" />
              </figure>
            </li>
          ))}
        </ol>
      </div>

      <a className="journey__next" href="#contact">
        What’s next? Let’s talk
      </a>
    </section>
  );
}

export const Journey = memo(JourneySection);
