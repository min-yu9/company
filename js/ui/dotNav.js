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

  const onDotActivate = (dot) => () => go(dot.dataset.section);

  dots.forEach((dot) => {
    dot.setAttribute("role", "button");
    dot.setAttribute("tabindex", "0");

    const click = onDotActivate(dot);
    dot.addEventListener("click", click);
    dot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        click();
      }
    });
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
      },
    };
  }

  return {
    destroy() {
      sectionObs?.disconnect();
      heroObs?.disconnect();
    },
  };
}
