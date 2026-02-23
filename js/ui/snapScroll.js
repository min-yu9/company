import { qsa, qs, isTouchLike, isSmallScreen, prefersReducedMotion } from "../utils/dom.js";

function peekNavActive() {
  const s = window.__peekNav;
  if (!s || !s.active) return false;
  // until이 지났으면 자동 해제
  if (s.until && performance.now() > s.until) {
    s.active = false;
    return false;
  }
  return true;
}

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

  const productsIndex = sections.findIndex((s) => s.id === "products");
  const footerPeek = window.__footerPeek;

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

  const openPeek = (opts) => footerPeek && footerPeek.openPeek && footerPeek.openPeek(opts);
  const closePeek = (opts) => footerPeek && footerPeek.closePeek && footerPeek.closePeek(opts);
  const peekIsOpen = () => footerPeek && footerPeek.isOpen && footerPeek.isOpen();

  const safeClosePeek = (opts) => {
    // ✅ "문의 → products" 프로그램 이동 중에는 peek를 강제로 닫지 않음(깜빡임/멈칫 방지)
    if (peekNavActive()) return;
    closePeek(opts);
  };

  const onWheel = (e) => {
    if (isMenuOpen()) return;

    e.preventDefault();
    if (Math.abs(e.deltaY) < MIN_DELTA) return;

    const dir = e.deltaY > 0 ? 1 : -1;

    // If reduced motion, jump without smooth but still keep reverse instant
    const behavior = reduced ? "auto" : "smooth";

    if (locked && dir !== lastDir) {
      forceUnlock();

      // reverse direction: if peek is open and user scrolls up, close peek first
      if (dir === -1 && peekIsOpen()) {
        closePeek({ force: true });
        lock(dir);
        return;
      }

      // if at products and scrolling down while locked, show peek first
      if (dir === 1 && productsIndex >= 0 && currentIndex === productsIndex && !peekIsOpen()) {
        openPeek({ pin: false });
        lock(dir);
        return;
      }

      cancelOngoingScroll();
      scrollToIndex(currentIndex + dir, behavior);
      if (currentIndex !== productsIndex) safeClosePeek({ force: true });
      lock(dir);
      return;
    }

    if (locked) return;

    // PRODUCTS -> 다음 진입 전에 "footer peek"를 한 번 보여주기
    if (dir === 1 && productsIndex >= 0 && currentIndex === productsIndex && !peekIsOpen()) {
      openPeek({ pin: false });
      lock(dir);
      return;
    }

    // Peek가 열린 상태에서 위로 올리면(반대 방향) 먼저 peek 닫고 products 유지
    if (dir === -1 && peekIsOpen()) {
      closePeek({ force: true });
      lock(dir);
      return;
    }

    if (dir === 1 && currentIndex === sections.length - 1) {
      // 마지막 섹션에서는 peek만 유지하고 더 아래로 이동하지 않음
      openPeek({ pin: false });
      lock(dir);
      return;
    }

    cancelOngoingScroll();
    scrollToIndex(currentIndex + dir, behavior);
    // 섹션 이동하면 peek 닫기(깔끔하게)
    if (currentIndex !== productsIndex) safeClosePeek({ force: true });
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

    if (dir === 1 && currentIndex === sections.length - 1) {
      openPeek({ pin: false });
      lock(dir);
      return;
    }

    if (dir === -1 && peekIsOpen()) {
      closePeek({ force: true });
      lock(dir);
      return;
    }

    cancelOngoingScroll();
    scrollToIndex(currentIndex + dir, behavior);
    if (currentIndex !== productsIndex) safeClosePeek({ force: true });
    lock(dir);
  });

  // Keep currentIndex in sync
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = sections.indexOf(entry.target);
          if (idx >= 0) {
            currentIndex = idx;
            if (currentIndex !== productsIndex) safeClosePeek({ force: true });
          }
        });
      },
      { threshold: 0.6 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  const onResize = () => {
    const nowTouch = isSmallScreen() || isTouchLike();
    if (nowTouch) body.classList.remove("is-snap");
    else body.classList.add("is-snap");
  };
  window.addEventListener("resize", onResize, { passive: true });
}
