import { qsa, prefersReducedMotion } from "../utils/dom.js";

export function initReveal() {
  const items = qsa(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion()) {
    items.forEach((el) => el.classList.add("show"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("show"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => obs.observe(el));
}
