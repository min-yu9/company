import { qs, qsa } from "../utils/dom.js";
import { CONFIG } from "../config.js";

export function initDotNav({ config = CONFIG.dotNav } = {}) {
  const dotNav = qs(".dot-nav");
  if (!dotNav) return { destroy() {} };

  const dots = qsa("span", dotNav);
  const sections = qsa("section");
  if (!dots.length || !sections.length) return { destroy() {} };

  const hero = qs("#hero") || qs(".hero");

  const setActive = (id) => {
    dots.forEach((d) => d.classList.remove("active"));
    const targetDot = dots.find((d) => d.dataset.section === id);
    if (targetDot) targetDot.classList.add("active");
  };

  const go = (id) => {
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  // Keep listener references so we can cleanly destroy()
  const handlers = new Map();

  const makeClick = (dot) => () => go(dot.dataset.section);
  const makeKeydown = (click) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      click();
    }
  };

  dots.forEach((dot) => {
    dot.setAttribute("role", "button");
    dot.setAttribute("tabindex", "0");

    const click = makeClick(dot);
    const keydown = makeKeydown(click);
    handlers.set(dot, { click, keydown });

    dot.addEventListener("click", click);
    dot.addEventListener("keydown", keydown);
  });

  let sectionObs = null;
  let heroObs = null;

  if ("IntersectionObserver" in window) {
    sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (id) setActive(id);
        });
      },
      { threshold: config.threshold }
    );
    sections.forEach((s) => sectionObs.observe(s));

    if (hero) {
      heroObs = new IntersectionObserver(
        (entries) => {
          const isHeroVisible = entries[0].isIntersecting;
          dotNav.style.opacity = isHeroVisible ? "0" : "1";
          dotNav.style.pointerEvents = isHeroVisible ? "none" : "auto";
        },
        { threshold: config.threshold }
      );
      heroObs.observe(hero);
    }
  } else if (hero) {
    const onScroll = () => {
      const isHeroVisible = window.scrollY < hero.offsetHeight * 0.6;
      dotNav.style.opacity = isHeroVisible ? "0" : "1";
      dotNav.style.pointerEvents = isHeroVisible ? "none" : "auto";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return {
      destroy() {
        window.removeEventListener("scroll", onScroll);
        handlers.forEach((h, dot) => {
          dot.removeEventListener("click", h.click);
          dot.removeEventListener("keydown", h.keydown);
        });
        handlers.clear();
      },
    };
  }

  return {
    destroy() {
      sectionObs?.disconnect();
      heroObs?.disconnect();
      handlers.forEach((h, dot) => {
        dot.removeEventListener("click", h.click);
        dot.removeEventListener("keydown", h.keydown);
      });
      handlers.clear();
    },
  };
}
