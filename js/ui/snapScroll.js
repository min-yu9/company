import { qsa, qs, isTouchLike, isSmallScreen, prefersReducedMotion } from "../utils/dom.js";

export function initSnapScroll() {
  const sections = qsa("section");
  if (!sections.length) return;

  const touch = isSmallScreen() || isTouchLike();
  const reduced = prefersReducedMotion();

  // Enable/disable snap mode via body class
  const body = document.body;
  if (touch) {
    body.classList.remove("is-snap");
    return;
  }
  body.classList.add("is-snap");

  let currentIndex = 0;

  // Same-direction spam lock; reverse direction allowed immediately
  let locked = false;
  let lastDir = 0;
  let unlockTimer = 0;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // Cancel any ongoing smooth so the next smooth starts cleanly
  const cancelOngoingScroll = () => {
    window.scrollTo({ top: window.scrollY, behavior: "auto" });
  };

  const scrollToIndex = (idx, behavior = "smooth") => {
    currentIndex = clamp(idx, 0, sections.length - 1);
    sections[currentIndex].scrollIntoView({ behavior, block: "start" });
  };

  // Initialize index from hash
  const hash = window.location.hash;
  if (hash) {
    const targetIdx = sections.findIndex((s) => `#${s.id}` === hash);
    if (targetIdx >= 0) currentIndex = targetIdx;
  }

  const lock = (dir) => {
    locked = true;
    lastDir = dir;
    if (unlockTimer) window.clearTimeout(unlockTimer);

    unlockTimer = window.setTimeout(() => {
      locked = false;
      unlockTimer = 0;
    }, 380);
  };

  const forceUnlock = () => {
    locked = false;
    if (unlockTimer) window.clearTimeout(unlockTimer);
    unlockTimer = 0;
  };

  const MIN_DELTA = 6;

  const isMenuOpen = () => qs(".nav-menu")?.classList.contains("active");

  const onWheel = (e) => {
    if (isMenuOpen()) return;

    e.preventDefault();
    if (Math.abs(e.deltaY) < MIN_DELTA) return;

    const dir = e.deltaY > 0 ? 1 : -1;

    // If reduced motion, jump without smooth but still keep reverse instant
    const behavior = reduced ? "auto" : "smooth";

    if (locked && dir !== lastDir) {
      forceUnlock();
      cancelOngoingScroll();
      scrollToIndex(currentIndex + dir, behavior);
      lock(dir);
      return;
    }

    if (locked) return;

    cancelOngoingScroll();
    scrollToIndex(currentIndex + dir, behavior);
    lock(dir);
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  window.addEventListener("keydown", (e) => {
    const isDown = e.key === "ArrowDown" || e.key === "PageDown";
    const isUp = e.key === "ArrowUp" || e.key === "PageUp";
    if (!isDown && !isUp) return;
    if (isMenuOpen()) return;

    const dir = isDown ? 1 : -1;
    const behavior = reduced ? "auto" : "smooth";

    if (locked && dir !== lastDir) {
      forceUnlock();
      cancelOngoingScroll();
      scrollToIndex(currentIndex + dir, behavior);
      lock(dir);
      return;
    }

    if (locked) return;

    cancelOngoingScroll();
    scrollToIndex(currentIndex + dir, behavior);
    lock(dir);
  });

  // Keep currentIndex in sync
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = sections.indexOf(entry.target);
          if (idx >= 0) currentIndex = idx;
        });
      },
      { threshold: 0.6 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  // Re-evaluate on resize (switch between snap/non-snap)
  const onResize = () => {
    const nowTouch = isSmallScreen() || isTouchLike();
    if (nowTouch) body.classList.remove("is-snap");
    else body.classList.add("is-snap");
  };
  window.addEventListener("resize", onResize, { passive: true });
}
