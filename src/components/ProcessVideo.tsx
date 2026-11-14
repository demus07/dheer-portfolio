/**
 * Frame-by-frame architectural transformation for the portfolio process section.
 * Scroll progress selects pre-rendered AVIF frames for precise, reversible motion.
 */

"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import { onFrame } from "@/lib/ticker";

const FRAME_COUNT = 181;
const FRAME_DIRECTORY = "/process/architectural-interior-frames";
const PRELOAD_RADIUS = 10;
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const SMOOTHING_TIME_CONSTANT_MS = 32;
const PROCESS_STAGES = [
  "It begins as an instinct.",
  "The instinct finds its structure.",
  "The structure becomes a space.",
] as const;
const PLAN_START_FRAME = 46;
const RENDER_START_FRAME = 85;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

const getStageOpacities = (frameIndex: number): ReadonlyArray<number> => {
  if (frameIndex < PLAN_START_FRAME) return [1, 0, 0];
  if (frameIndex < RENDER_START_FRAME) return [0, 1, 0];
  return [0, 0, 1];
};

const getFramePath = (frameIndex: number): string =>
  `${FRAME_DIRECTORY}/frame-${frameIndex.toString().padStart(3, "0")}.avif`;

const drawFrame = (canvas: HTMLCanvasElement, image: HTMLImageElement): void => {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
};

const resizeCanvas = (canvas: HTMLCanvasElement): void => {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio, MAX_DEVICE_PIXEL_RATIO);
  canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
  canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
};

/** Renders the architectural transformation as a scroll-controlled image sequence. */
export function ProcessVideo() {
  const section = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stageLabels = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const sectionElement = section.current;
    const canvasElement = canvas.current;
    if (!sectionElement || !canvasElement) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameCache = new Map<number, Promise<HTMLImageElement | null>>();
    let sectionTop = 0;
    let scrollDistance = 1;
    let requestedFrame = 0;
    let renderedFrame = 0;
    let smoothedFrame = 0;
    let previousFrameTime = performance.now();
    let currentImage: HTMLImageElement | null = null;
    let isDisposed = false;

    const loadFrame = (
      frameIndex: number,
      fetchPriority: "high" | "low" = "low",
    ): Promise<HTMLImageElement | null> => {
      const cachedFrame = frameCache.get(frameIndex);
      if (cachedFrame) return cachedFrame;

      const pendingFrame = new Promise<HTMLImageElement | null>((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.fetchPriority = fetchPriority;
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = getFramePath(frameIndex);
      });
      frameCache.set(frameIndex, pendingFrame);
      return pendingFrame;
    };

    const updateStageLabels = (frameIndex: number): void => {
      const opacities = getStageOpacities(frameIndex);
      stageLabels.current.forEach((label, stageIndex) => {
        label?.style.setProperty("--stage-opacity", opacities[stageIndex]?.toFixed(3) ?? "0");
      });
    };

    const preloadAround = (frameIndex: number): void => {
      const firstFrame = Math.max(0, frameIndex - PRELOAD_RADIUS);
      const lastFrame = Math.min(FRAME_COUNT - 1, frameIndex + PRELOAD_RADIUS);
      for (let preloadIndex = firstFrame; preloadIndex <= lastFrame; preloadIndex += 1) {
        void loadFrame(preloadIndex);
      }
    };

    const renderFrame = (frameIndex: number): void => {
      requestedFrame = frameIndex;
      void loadFrame(frameIndex, "high").then((image) => {
        if (!image || isDisposed || requestedFrame !== frameIndex) return;
        currentImage = image;
        renderedFrame = frameIndex;
        drawFrame(canvasElement, image);
        updateStageLabels(frameIndex);
      });
      preloadAround(frameIndex);
    };

    const measure = (): void => {
      sectionTop = sectionElement.getBoundingClientRect().top + window.scrollY;
      scrollDistance = Math.max(1, sectionElement.offsetHeight - window.innerHeight);
      resizeCanvas(canvasElement);
      if (currentImage) drawFrame(canvasElement, currentImage);
    };

    const updateAnimation = (frameTime: number): void => {
      if (prefersReducedMotion) return;

      const progress = clamp((window.scrollY - sectionTop) / scrollDistance);
      const targetFrame = progress * (FRAME_COUNT - 1);
      const elapsedMs = Math.min(frameTime - previousFrameTime, 50);
      const smoothing = 1 - Math.exp(-elapsedMs / SMOOTHING_TIME_CONSTANT_MS);
      previousFrameTime = frameTime;
      smoothedFrame += (targetFrame - smoothedFrame) * smoothing;

      const nextFrame = Math.round(smoothedFrame);
      if (nextFrame !== renderedFrame && nextFrame !== requestedFrame) renderFrame(nextFrame);
    };

    measure();
    renderFrame(0);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(sectionElement);
    window.addEventListener("resize", measure);
    const stopFrame = prefersReducedMotion ? () => undefined : onFrame(updateAnimation);

    return () => {
      isDisposed = true;
      stopFrame();
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      frameCache.clear();
    };
  }, []);

  return (
    <section className="process-video" aria-labelledby="process-video-title">
      <h2 className="process-video__title" id="process-video-title">
        How I design a space
      </h2>
      <div className="process-video__timeline" ref={section}>
        <div className="process-video__sticky">
          <div className="process-video__frame">
            <canvas
              className="process-video__canvas"
              ref={canvas}
              role="img"
              aria-label="Architectural interior transforming from drawing to finished space"
            />
            <div
              className="process-video__stage-label"
              aria-label="Design process: instinct, structure, and space"
            >
              {PROCESS_STAGES.map((stage, stageIndex) => (
                <span
                  aria-hidden="true"
                  key={stage}
                  ref={(element) => {
                    stageLabels.current[stageIndex] = element;
                  }}
                  style={{ "--stage-opacity": stageIndex === 0 ? 1 : 0 } as CSSProperties}
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
