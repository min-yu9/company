import { qsa, qs, isTouchLike, isSmallScreen, prefersReducedMotion } from "../utils/dom.js";
import { CONFIG } from "../config.js";

export function initSnapScroll({ footerPeek, appState, config = CONFIG.snapScroll } = {}) {
  const sections = qsa("section");
  if (!sections.length) return { destroy() {} };

  const reduced = prefersReducedMotion();

  const body = document.body;

  let enabled = false;

  let currentIndex = 0;
  const productsIndex = sections.findIndex((s) => s.id === "products");

  // Same-direction spam lock; reverse direction allowed immediately
  let locked = false;
  let lastDir = 0;
  let unlockTimer = 0;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

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
    }, config.lockMs);
  };

  const forceUnlock = () => {
    locked = false;
    if (unlockTimer) window.clearTimeout(unlockTimer);
    unlockTimer = 0;
  };

  const isMenuOpen = () => qs(".nav-menu")?.classList.contains("active");

  const openPeek = () => footerPeek?.openPeek?.();
  const closePeek = () => footerPeek?.closePeek?.();
  const peekIsOpen = () => footerPeek?.isOpen?.();

  const safeClosePeek = () => {
    // 문의 → products 프로그램 이동 중에는 peek 강제 닫지 않음
    if (appState?.isPeekNavActive?.()) return;
    closePeek();
  };

  const MIN_DELTA = config.minWheelDelta;

  const onWheel = (e) => {
    if (isMenuOpen()) return;

    e.preventDefault();
    if (Math.abs(e.deltaY) < MIN_DELTA) return;

    const dir = e.deltaY > 0 ? 1 : -1;
    const behavior = reduced ? "auto" : "smooth";

    if (locked && dir !== lastDir) {
      forceUnlock();

      if (dir === -1 && peekIsOpen()) {
        closePeek();
        lock(dir);
        return;
      }

      cancelOngoingScroll();
      scrollToIndex(currentIndex + dir, behavior);
      lock(dir);
      return;
    }

    if (locked) return;

    if (dir === -1 && peekIsOpen()) {
      closePeek();
      lock(dir);
      return;
    }

    if (dir === 1 && currentIndex === sections.length - 1) {
      openPeek();
      lock(dir);
      return;
    }

    cancelOngoingScroll();
    scrollToIndex(currentIndex + dir, behavior);
    lock(dir);
  };

  const bind = () => {
    if (enabled) return;
    enabled = true;
    body.classList.add("is-snap");
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", onResize, { passive: true });
    obs && sections.forEach((s) => obs.observe(s));
  };

  const unbind = () => {
    if (!enabled) return;
    enabled = false;
    body.classList.remove("is-snap");
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("resize", onResize);
    obs?.disconnect();
    // snap 모드 해제 시 peek는 스크롤 기반으로 열리도록 넘기고,
    // 여기서는 강제 닫지 않음(사용자 스크롤 위치에 따라 footerPeek가 결정)
  };

  const onKeydown = (e) => {
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

    if (dir === 1 && currentIndex === sections.length - 1) {
      openPeek();
      lock(dir);
      return;
    }

    if (dir === -1 && peekIsOpen()) {
      closePeek();
      lock(dir);
      return;
    }

    cancelOngoingScroll();
    scrollToIndex(currentIndex + dir, behavior);
    lock(dir);
  };
  // listeners are bound via bind()

  // Keep currentIndex in sync
  let obs = null;
  if ("IntersectionObserver" in window) {
    obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = sections.indexOf(entry.target);
          if (idx >= 0) {
            currentIndex = idx;
          }
        });
      },
      { threshold: config.sectionThreshold }
    );
  }

  const onResize = () => {
    const touch = isSmallScreen() || isTouchLike();
    if (touch) unbind();
    else bind();
  };

  // Initial enable/disable
  onResize();

  return {
    destroy() {
      unbind();
    },
  };
}
