import { on } from "../utils/dom.js";
import { CONFIG } from "../config.js";

function getProductsBottomTargetTop(products, extraPx) {
  const rect = products.getBoundingClientRect();
  const targetTop = window.scrollY + (rect.bottom - window.innerHeight) + extraPx;
  return Math.max(0, targetTop);
}

function waitUntilAtBottom(products, cb, { thresholdPx, timeoutMs }) {
  const start = performance.now();

  const tick = () => {
    const rect = products.getBoundingClientRect();
    const bottomDist = rect.bottom - window.innerHeight;

    if (bottomDist < thresholdPx) {
      cb(true);
      return;
    }

    if (performance.now() - start > timeoutMs) {
      cb(false);
      return;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

export function initSmoothAnchors({ footerPeek, appState, config = CONFIG.smoothAnchor } = {}) {
  const setPeekNavActive = appState?.setPeekNavActive;

  const onClick = (e) => {
    const a = e.target.closest('a[data-open-footer], a[href^="#"]');
    if (!a) return;

    const wantsFooter = a.hasAttribute("data-open-footer");
    if (wantsFooter) {
      e.preventDefault();
      setPeekNavActive?.(true, config.peekNavActiveMs);
      // 스크롤 위치에 의존하지 않고 클릭으로 바로 peek를 연다.
      footerPeek?.openPeek?.();
      setTimeout(() => setPeekNavActive?.(false), config.suppressReleaseDelayMs);
      return;
    }

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", href);
  };

  on(document, "click", onClick);

  return {
    destroy() {
      document.removeEventListener("click", onClick);
    },
  };
}
