import { CONFIG } from "./config.js";
import { createAppState } from "./app/state.js";

import { initStableViewportVars } from "./ui/viewport.js";
import { initMenu } from "./ui/menu.js";
import { initHeaderScroll } from "./ui/headerScroll.js";
import { initReveal } from "./ui/reveal.js";
import { initFooterPeek } from "./ui/footerPeek.js";
import { initSmoothAnchors } from "./ui/smoothAnchor.js";
import { initSnapScroll } from "./ui/snapScroll.js";
import { initDotNav } from "./ui/dotNav.js";

// Prevent double-init (e.g., hot reload / duplicate script injection)
let __APP_INIT_DONE__ = false;

function init() {
  if (__APP_INIT_DONE__) return;
  __APP_INIT_DONE__ = true;

  const appState = createAppState();
  const destroyers = [];

  const vp = initStableViewportVars({ config: CONFIG.viewport });
  if (vp?.destroy) destroyers.push(vp.destroy);

  const menu = initMenu();
  if (menu?.destroy) destroyers.push(menu.destroy);

  const header = initHeaderScroll({ config: CONFIG.header });
  if (header?.destroy) destroyers.push(header.destroy);

  const reveal = initReveal({ config: CONFIG.reveal });
  if (reveal?.destroy) destroyers.push(reveal.destroy);

  const footerPeek = initFooterPeek({ config: CONFIG.footerPeek });
  if (footerPeek?.destroy) destroyers.push(footerPeek.destroy);

  const anchors = initSmoothAnchors({ footerPeek, appState, config: CONFIG.smoothAnchor });
  if (anchors?.destroy) destroyers.push(anchors.destroy);

  const snap = initSnapScroll({ footerPeek, appState, config: CONFIG.snapScroll });
  if (snap?.destroy) destroyers.push(snap.destroy);

  const dot = initDotNav({ config: CONFIG.dotNav });
  if (dot?.destroy) destroyers.push(dot.destroy);

  // Optional: expose a teardown hook for debugging
  window.__appDestroy = () => {
    destroyers.reverse().forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore
      }
    });
    __APP_INIT_DONE__ = false;
  };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
