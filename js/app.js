import { initMenu } from "./ui/menu.js";
import { initSmoothAnchors } from "./ui/smoothAnchor.js";
import { initReveal } from "./ui/reveal.js";
import { initHeaderScroll } from "./ui/headerScroll.js";
import { initSnapScroll } from "./ui/snapScroll.js";
import { initDotNav } from "./ui/dotNav.js";
import { initFooterPeek } from "./ui/footerPeek.js";
import { initStableViewportVars } from "./ui/viewport.js";
import { createAppState } from "./app/state.js";

let __APP_INIT_DONE__ = false;

function init() {
  if (__APP_INIT_DONE__) return;
  __APP_INIT_DONE__ = true;

  const appState = createAppState();

  initStableViewportVars();

  initMenu();
  initHeaderScroll();
  initReveal();

  const footerPeek = initFooterPeek();

  initSmoothAnchors({ footerPeek, appState });
  initSnapScroll({ footerPeek, appState });
  initDotNav();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
