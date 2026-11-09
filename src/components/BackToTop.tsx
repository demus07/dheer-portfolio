"use client";

// Back to the top, the long way round: the smooth scroll carries you back up through the whole film.
export function BackToTop() {
  const go = () => {
    if (window.lenis) window.lenis.scrollTo(0, { duration: 3.2, easing: (t) => 1 - Math.pow(1 - t, 4), force: true });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button type="button" className="top" onClick={go}>
      Back to the top <span aria-hidden>↑</span>
    </button>
  );
}
