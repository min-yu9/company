import { qs, qsa, on } from "../utils/dom.js";

export function initDotNav() {
  const dotNav = qs(".dot-nav");
  if (!dotNav) return;

  const dots = qsa("span", dotNav);
  const sections = qsa("section");
  if (!dots.length || !sections.length) return;

  const hero = qs("#hero") || qs(".hero");

  const setActive = (id) => {
    dots.forEach((d) => d.classList.remove("active"));
    const targetDot = dots.find((d) => d.dataset.section === id);
    if (targetDot) targetDot.classList.add("active");
  };

  // 도트 클릭 이동
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const id = dot.dataset.section;
      const target = id ? document.getElementById(id) : null;
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // 섹션 들어오면 도트 활성화
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (id) setActive(id);
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((s) => obs.observe(s));

    // Hero에서는 dot-nav 숨김(기존 기능 유지)
    if (hero) {
      const heroObs = new IntersectionObserver(
        (entries) => {
          const isHeroVisible = entries[0].isIntersecting;
          dotNav.style.opacity = isHeroVisible ? "0" : "1";
          dotNav.style.pointerEvents = isHeroVisible ? "none" : "auto";
        },
        { threshold: 0.6 }
      );
      heroObs.observe(hero);
    }
  } else {
    // fallback: hero만 간단 처리
    if (hero) {
      const onScroll = () => {
        const isHeroVisible = window.scrollY < hero.offsetHeight * 0.6;
        dotNav.style.opacity = isHeroVisible ? "0" : "1";
        dotNav.style.pointerEvents = isHeroVisible ? "none" : "auto";
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }
}
