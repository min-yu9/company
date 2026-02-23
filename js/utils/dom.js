export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
export const off = (el, ev, fn, opts) => el && el.removeEventListener(ev, fn, opts);

export const isTouchLike = () =>
  window.matchMedia("(pointer: coarse)").matches ||
  window.matchMedia("(hover: none)").matches;

export const isSmallScreen = () => window.matchMedia("(max-width: 768px)").matches;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// rAF throttle (scroll/resize 성능용)
export function rafThrottle(fn) {
  let scheduled = false;
  let lastArgs = null;

  return (...args) => {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn(...(lastArgs || []));
    });
  };
}
