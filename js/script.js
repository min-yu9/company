import { initMenu } from "./ui/menu.js";
import { initSmoothAnchors } from "./ui/smoothAnchor.js";
import { initReveal } from "./ui/reveal.js";
import { initHeaderScroll } from "./ui/headerScroll.js";
import { initSnapScroll } from "./ui/snapScroll.js";
import { initDotNav } from "./ui/dotNav.js";

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initSmoothAnchors();
  initReveal();
  initHeaderScroll();
  initSnapScroll();
  initDotNav();
  // ✅ 모바일에서 브라우저 UI 변화에도 안정적인 뷰포트 높이 변수
function setStableVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

document.addEventListener("DOMContentLoaded", () => {
  setStableVH();
  // 주소창/하단바로 resize가 자주 일어나는데, 그때마다 갱신하면 오히려 더 출렁일 수 있어서
  // 방향 전환(orientationchange) 때만 갱신
  window.addEventListener("orientationchange", () => {
    setTimeout(setStableVH, 200);
  });

  initMenu();
  initSmoothAnchors();
  initReveal();
  initHeaderScroll();
  initSnapScroll();
  initDotNav();
});

});
