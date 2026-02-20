import { on } from "../utils/dom.js";

function getProductsBottomTargetTop(products) {
  const rect = products.getBoundingClientRect();
  // products 하단이 뷰포트 하단보다 살짝 아래로 가게(= 조건 만족) 여유를 줌
  const targetTop = window.scrollY + (rect.bottom - window.innerHeight) + 140;
  return Math.max(0, targetTop);
}

function waitUntilAtBottom(products, cb, { threshold = 40, timeout = 2500 } = {}) {
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
    if (wantsFooter && href === "#products") {
      const products = target;
      const ctl = window.__footerPeek;

      // 내려가는 동안 close만 막아두기(깜빡임 방지)
      ctl?.setAutoSuppressed?.(true);
      ctl?.closePeek?.();

      const y = getProductsBottomTargetTop(products);
      window.scrollTo({ top: y, behavior: "smooth" });

      // ⭐ 핵심: 프로그램 스크롤은 마지막 구간에서 이벤트/스냅 로직 때문에 open이 안될 수 있어서,
      // 실제로 "바닥 도달"을 rAF로 감지한 뒤 openPeek를 직접 호출
      waitUntilAtBottom(products, () => {
        ctl?.openPeek?.();
        ctl?.setAutoSuppressed?.(false);
      });

      history.replaceState(null, "", href);
      return;
    }

    // 기본 앵커
    target.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", href);
  });
}
