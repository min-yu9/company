import { qs } from "../utils/dom.js";
import { CONFIG } from "../config.js";

export function initHeaderScroll({ config = CONFIG.header } = {}) {
  const header = qs("header");
  const hero = qs("#hero") || qs(".hero");
  if (!header || !hero) return { destroy() {} };

  const set = (isHeroVisible) => {
    header.classList.toggle("scrolled", !isHeroVisible);
  };

  let obs = null;
  if ("IntersectionObserver" in window) {
    obs = new IntersectionObserver((entries) => set(entries[0].isIntersecting), {
      threshold: config.threshold,
    });
    obs.observe(hero);
  } else {
    const onScroll = () => set(window.scrollY < hero.offsetHeight * config.threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return { destroy() { window.removeEventListener("scroll", onScroll);} };
  }

  return { destroy() { obs?.disconnect(); } };
}
