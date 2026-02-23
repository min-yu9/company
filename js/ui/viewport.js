import { rafThrottle } from "../utils/dom.js";
import { CONFIG } from "../config.js";

/**
 * 모바일 주소창/하단바 show/hide로 뷰포트 높이가 변해도 레이아웃이 덜 출렁이게 CSS 변수 제공
 * - --lvh: 관측된 '최대' 뷰포트 높이 기반 (레이아웃 안정)
 * - --dvh: 현재 뷰포트 높이 기반 (필요 시 사용)
 */
export function initStableViewportVars() {
  const root = document.documentElement;
  let maxH = 0;

  const getH = () =>
    (window.visualViewport && window.visualViewport.height) || window.innerHeight;

  const apply = () => {
    const h = getH();
    if (h > maxH) maxH = h;
    root.style.setProperty("--lvh", `${maxH * 0.01}px`);
    root.style.setProperty("--dvh", `${h * 0.01}px`);
  };

  const applyRaf = rafThrottle(apply);

  apply();

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", applyRaf, { passive: true });
    window.visualViewport.addEventListener("scroll", applyRaf, { passive: true });
  }

  window.addEventListener("resize", applyRaf, { passive: true });

  window.addEventListener("orientationchange", () => {
    maxH = 0;
    setTimeout(apply, CONFIG.viewport.orientationResetDelayMs);
  });

  return { refresh: apply };
}
