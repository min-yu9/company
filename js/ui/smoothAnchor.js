import { on } from "../utils/dom.js";

export function initSmoothAnchors() {
  on(document, "click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", href);
  });
}
