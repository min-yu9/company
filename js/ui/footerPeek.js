import { qs, on } from "../utils/dom.js";

export function initFooterPeek() {
  const el = qs("#footerPeek");
  const products = qs("#products");
  if (!el || !products) return null;

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

  // For non-snap (mobile/touch): show when user reaches bottom of products
  const onScroll = () => {
    // If snap mode, snapScroll will manage open/close
    if (document.body.classList.contains("is-snap")) return;
    // ✅ 프로그램 스크롤 중에는 자동 open/close 금지 (문의 클릭 시 깜빡임 방지)
    if (autoSuppressed) return;

    const rect = products.getBoundingClientRect();
    const bottomDist = rect.bottom - window.innerHeight;

    // Start showing when within 40px of bottom (feel like it peeks up)
    if (bottomDist < 40) openPeek();
    else closePeek();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    // 열려있으면 높이 재계산
    if (open) setPeekHeightVar();
    onScroll();
  }, { passive: true });

  // init
  closePeek();
  onScroll();

  return { openPeek, closePeek, isOpen, setAutoSuppressed };
}
