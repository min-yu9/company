import { qs } from "../utils/dom.js";
import { CONFIG } from "../config.js";

export function initFooterPeek({ config = CONFIG.footerPeek } = {}) {
  const el = qs("#footerPeek");
  if (!el) return null;

  let open = false;
  let autoSuppressed = false;

  const setPeekHeightVar = () => {
    const h = el.getBoundingClientRect().height || 0;
    document.documentElement.style.setProperty("--footer-peek-h", `${h}px`);
  };

  const openPeek = () => {
    if (open) return;
    open = true;
    setPeekHeightVar();
    document.body.classList.add("footer-peek-open");
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
  };

  const closePeek = () => {
    if (!open) return;
    open = false;
    document.body.classList.remove("footer-peek-open");
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
  };

  const isOpen = () => open;

  const setAutoSuppressed = (v) => {
    autoSuppressed = !!v;
  };
  // NOTE: auto-open/close based on scroll position is disabled.

  const onResize = () => {
    if (open) setPeekHeightVar();
  };

  window.addEventListener("resize", onResize, { passive: true });

  closePeek();

  return {
    openPeek,
    closePeek,
    isOpen,
    setAutoSuppressed,
    destroy() {
      window.removeEventListener("resize", onResize);
    },
  };
}
