import { on } from "../utils/dom.js";

function waitForScrollEnd({ timeout = 2200, idle = 140 } = {}) {
  return new Promise((resolve) => {
    const start = performance.now();
    let lastY = window.scrollY;
    let lastChange = performance.now();
    let rafId = null;

    const tick = () => {
      const now = performance.now();
      const y = window.scrollY;

      if (Math.abs(y - lastY) > 0.5) {
        lastY = y;
        lastChange = now;
      }

      // idle 만큼 움직임 없으면 "스크롤 끝"으로 간주
      if (now - lastChange >= idle) {
        cancelAnimationFrame(rafId);
        resolve();
        return;
      }

      if (now - start >= timeout) {
        cancelAnimationFrame(rafId);
        resolve();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  });
}

function scrollToProductsBottom() {
  const products = document.querySelector("#products");
  if (!products) return null;

  const rect = products.getBoundingClientRect();
  // products의 bottom이 뷰포트 바닥 근처(= footer-peek 트리거 지점)에 오도록 이동
  const targetTop = window.scrollY + (rect.bottom - window.innerHeight) + 10;
  return Math.max(0, targetTop);
}

export function initSmoothAnchors() {
  on(document, "click", async (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    const wantsFooter = a.hasAttribute("data-open-footer");

    e.preventDefault();

    // ✅ 문의 버튼: 스크롤이 "끝난 다음" footer-peek이 자연스럽게 나오게
    if (wantsFooter && href === "#products") {
      const ctl = window.__footerPeek;

      // 깜빡임 방지: 자동 트리거 잠깐 막고, 먼저 닫아둠
      ctl?.setAutoSuppressed?.(true);
      ctl?.closePeek?.();

      const y = scrollToProductsBottom();
      if (y != null) {
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }

      history.replaceState(null, "", href);

      // 스크롤이 멈춘 뒤에 열기
      await waitForScrollEnd();
      ctl?.setAutoSuppressed?.(false);
      ctl?.openPeek?.();
      return;
    }

    // 기본 앵커 스크롤
    target.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", href);
  });
}
