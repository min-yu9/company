import { qsa, prefersReducedMotion } from "../utils/dom.js";
import { CONFIG } from "../config.js";

export function initReveal({ config = CONFIG.reveal } = {}) {
  const items = qsa(".reveal");
  if (!items.length) return { destroy() {} };

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("show"));
    return { destroy() {} };
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    },
    { threshold: config.threshold }
  );

  items.forEach((el) => obs.observe(el));

  return { destroy() { obs.disconnect(); } };
}
