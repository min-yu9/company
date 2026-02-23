import { qs, rafThrottle } from "../utils/dom.js";
import { CONFIG } from "../config.js";

export function initFooterPeek({ config = CONFIG.footerPeek } = {}) {
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

  // autoSuppressed(문의 클릭으로 프로그램 스크롤 중)일 때도 "열기"는 허용
  // 다만 닫기(close)는 막아서, 스크롤 도중 깜빡임/사라짐 방지
  const onScroll = () => {
    if (document.body.classList.contains("is-snap")) return;

    const rect = products.getBoundingClientRect();
    const bottomDist = rect.bottom - window.innerHeight;

    if (bottomDist < config.openBottomDistPx) {
      openPeek();
      if (autoSuppressed) autoSuppressed = false;
      return;
    }

    if (autoSuppressed) return;
    closePeek();
  };

  const onScrollRaf = rafThrottle(onScroll);

  const onResize = () => {
    if (open) setPeekHeightVar();
    onScrollRaf();
  };

  window.addEventListener("scroll", onScrollRaf, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  closePeek();
  onScroll();

  return {
    openPeek,
    closePeek,
    isOpen,
    setAutoSuppressed,
    destroy() {
      window.removeEventListener("scroll", onScrollRaf);
      window.removeEventListener("resize", onResize);
    },
  };
}
