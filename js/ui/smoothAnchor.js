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
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    const wantsFooter = a.hasAttribute("data-open-footer");
    e.preventDefault();

    // 문의(data-open-footer) + products: 바닥 근처 도달 감지 후 footer-peek 열기
    if (wantsFooter && href === "#products") {
      const products = target;

      setPeekNavActive?.(true, config.peekNavActiveMs);

      // 내려가는 동안 close만 막아두기(깜빡임 방지)
      footerPeek?.setAutoSuppressed?.(true);

      const y = getProductsBottomTargetTop(products, config.bottomTargetExtraPx);
      window.scrollTo({ top: y, behavior: "smooth" });

      waitUntilAtBottom(
        products,
        () => {
          footerPeek?.openPeek?.();
          footerPeek?.setAutoSuppressed?.(false);

          // 마지막 IO/scroll 이벤트를 흡수한 뒤 해제
          setTimeout(() => setPeekNavActive?.(false), config.suppressReleaseDelayMs);
        },
        {
          thresholdPx: config.bottomThresholdPx,
          timeoutMs: config.bottomTimeoutMs,
        }
      );

      history.replaceState(null, "", href);
      return;
    }

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
