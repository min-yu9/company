import { rafThrottle } from "../utils/dom.js";
import { CONFIG } from "../config.js";

/**
 * 모바일 주소창/하단바 show/hide로 뷰포트 높이가 변해도 레이아웃이 덜 출렁이게 CSS 변수 제공
 * - --lvh: 관측된 '최대' 뷰포트 높이 기반 (레이아웃 안정)
 * - --dvh: 현재 뷰포트 높이 기반 (필요 시 사용)
 */
export function initStableViewportVars({ config = CONFIG.viewport } = {}) {
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

  const vv = window.visualViewport;
  const onVVResize = applyRaf;
  const onVVScroll = applyRaf;
  const onResize = applyRaf;
  const onOrientation = () => {
    maxH = 0;
    setTimeout(apply, config.orientationResetDelayMs);
  };

  if (vv) {
    vv.addEventListener("resize", onVVResize, { passive: true });
    vv.addEventListener("scroll", onVVScroll, { passive: true });
  }

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onOrientation);

  return {
    refresh: apply,
    destroy() {
      if (vv) {
        vv.removeEventListener("resize", onVVResize);
        vv.removeEventListener("scroll", onVVScroll);
      }
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
    },
  };
}
