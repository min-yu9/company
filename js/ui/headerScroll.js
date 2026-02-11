export function initHeaderScroll() {
  const header = document.querySelector("header");
  const hero = document.querySelector("#hero") || document.querySelector(".hero");
  if (!header || !hero) return;

  const set = (isHeroVisible) => {
    if (isHeroVisible) header.classList.remove("scrolled");
    else header.classList.add("scrolled");
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => set(entries[0].isIntersecting),
      { threshold: 0.6 }
    );
    obs.observe(hero);
  } else {
    // fallback
    const onScroll = () => set(window.scrollY < hero.offsetHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
}
