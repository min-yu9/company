import { qs, on } from "../utils/dom.js";

export function initFooterPeek() {
  const el = qs("#footerPeek");
  const products = qs("#products");
  if (!el || !products) return null;

  let open = false;

  const openPeek = () => {
    if (open) return;
    open = true;
    el.classList.add("is-open");
  };

  const closePeek = () => {
    if (!open) return;
    open = false;
    el.classList.remove("is-open");
  };

  const isOpen = () => open;

  // For non-snap (mobile/touch): show when user reaches bottom of products
  const onScroll = () => {
    // If snap mode, snapScroll will manage open/close
    if (document.body.classList.contains("is-snap")) return;

    const rect = products.getBoundingClientRect();
    const bottomDist = rect.bottom - window.innerHeight;

    // Start showing when within 40px of bottom (feel like it peeks up)
    if (bottomDist < 40) openPeek();
    else closePeek();
  };;

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  return { openPeek, closePeek, isOpen };
}
