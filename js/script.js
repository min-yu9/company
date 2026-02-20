let __APP_INIT_DONE__ = false;

import { initMenu } from "./ui/menu.js";
import { initSmoothAnchors } from "./ui/smoothAnchor.js";
import { initReveal } from "./ui/reveal.js";
import { initHeaderScroll } from "./ui/headerScroll.js";
import { initSnapScroll } from "./ui/snapScroll.js";
import { initDotNav } from "./ui/dotNav.js";
import { initFooterPeek } from "./ui/footerPeek.js";

/**
 * 모바일 브라우저 주소창/하단바 UI가 나타나며 뷰포트 높이가 변하는 문제 대응.
 * - "가장 큰" 뷰포트 높이를 기억(--lvh)해서 섹션 높이를 안정적으로 유지
 *   → 주소창/하단바가 다시 나타나도 레이아웃이 줄지 않아서, 브라우저 UI가 위에 덮히는 느낌
 * - 현재 뷰포트 높이(--dvh)도 같이 제공(필요하면 사용)
 */
function initStableViewportVars() {
  const root = document.documentElement;
  let maxH = 0;

  const getH = () =>
    (window.visualViewport && window.visualViewport.height) || window.innerHeight;

  const apply = () => {
    const h = getH();

    // maxH는 줄어들지 않게(주소창이 나타나도 섹션 높이는 유지)
    if (h > maxH) maxH = h;

    root.style.setProperty("--lvh", `${maxH * 0.01}px`);
    root.style.setProperty("--dvh", `${h * 0.01}px`);
  };

  apply();

  // 주소창 show/hide는 visualViewport resize로 더 잘 잡힘
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", apply, { passive: true });
    window.visualViewport.addEventListener("scroll", apply, { passive: true });
  }

  window.addEventListener("resize", apply, { passive: true });

  // 회전 시에는 maxH를 다시 잡아야 함
  window.addEventListener("orientationchange", () => {
    maxH = 0;
    setTimeout(apply, 250);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (__APP_INIT_DONE__) return;
  __APP_INIT_DONE__ = true;
  initStableViewportVars();

  initMenu();
  initSmoothAnchors();
  initReveal();
  initHeaderScroll();

  // Footer peek controller (used by snapScroll + mobile scroll)
  window.__footerPeek = initFooterPeek();

  initSnapScroll();
  initDotNav();
});
