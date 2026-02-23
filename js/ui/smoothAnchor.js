import { on } from "../utils/dom.js";

function getProductsBottomTargetTop(products) {
  const rect = products.getBoundingClientRect();
  // products 하단이 뷰포트 하단보다 살짝 아래로 가게(= 조건 만족) 여유를 줌
  const targetTop = window.scrollY + (rect.bottom - window.innerHeight) + 40;
  return Math.max(0, targetTop);
}

function waitUntilAtBottom(products, cb, { threshold = 100, timeout = 2500 } = {}) {
  const start = performance.now();

  const tick = () => {
    const rect = products.getBoundingClientRect();
    const bottomDist = rect.bottom - window.innerHeight;

    if (bottomDist < threshold) {
      cb(true);
      return;
    }

    if (performance.now() - start > timeout) {
      cb(false);
      return;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function setPeekNavActive(active, ms = 1600) {
  if (active) {
    window.__peekNav = { active: true, until: performance.now() + ms };
  } else if (window.__peekNav) {
    window.__peekNav.active = false;
    window.__peekNav.until = 0;
  }
}

export function initSmoothAnchors() {
  on(document, "click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    const wantsFooter = a.hasAttribute("data-open-footer");
    e.preventDefault();

    // ✅ 문의: 스크롤이 끝까지 내려간 뒤(도달 감지) footer-peek를 자동으로 열기
    // ✅ snapScroll의 IntersectionObserver가 "섹션이 바뀌는 도중" peek를 force close 하는 문제를 막기 위해
    //    이 이동 동안에는 전역 플래그로 peek close를 suppress
    if (wantsFooter && href === "#products") {
      const products = target;
      const ctl = window.__footerPeek;

      setPeekNavActive(true, 2200);

      // 내려가는 동안 close만 막아두기(깜빡임 방지)
      ctl?.setAutoSuppressed?.(true);

      const y = getProductsBottomTargetTop(products);
      window.scrollTo({ top: y, behavior: "smooth" });

      waitUntilAtBottom(products, () => {
        ctl?.openPeek?.();
        ctl?.setAutoSuppressed?.(false);

        // close suppress는 약간 더 유지했다가 해제(마지막 IO/scroll 이벤트 흡수)
        setTimeout(() => setPeekNavActive(false), 260);
      });

      history.replaceState(null, "", href);
      return;
    }

    // 기본 앵커
    target.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", href);
  });
}
