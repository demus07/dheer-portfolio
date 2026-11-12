/**
 * Site-wide pointer treatment for precise, hover-capable devices.
 * The native cursor remains available for touch and reduced-motion users.
 */

"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, summary, label, [role='button']";
const CUSTOM_CURSOR_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Renders the orange arrow and its interactive hover ring. */
export function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorElement = cursor.current;
    const cursorMedia = window.matchMedia(CUSTOM_CURSOR_QUERY);
    if (!cursorElement || !cursorMedia.matches) return;

    document.documentElement.dataset.customCursor = "true";

    const handlePointerMove = (event: PointerEvent) => {
      cursorElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursorElement.style.setProperty("--cursor-y", `${event.clientY}px`);
      cursorElement.dataset.visible = "true";

      const target = event.target;
      cursorElement.dataset.interactive = String(target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR)));
    };
    const handlePointerLeave = () => {
      cursorElement.dataset.visible = "false";
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      delete document.documentElement.dataset.customCursor;
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div className="custom-cursor" data-visible="false" data-interactive="false" ref={cursor} aria-hidden="true">
      <svg className="custom-cursor__arrow" viewBox="0 0 48 52" focusable="false">
        <path d="M4.2 2.5C2.5 1.5.7 2.9.8 4.9l1 41.5c.1 2.8 3.6 4 5.5 2l13.1-13.7c.7-.7 1.6-1 2.6-1h20.3c2.9 0 4.2-3.7 1.8-5.3L4.2 2.5Z" />
      </svg>
    </div>
  );
}
