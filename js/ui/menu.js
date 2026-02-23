import { qs, on } from "../utils/dom.js";

export function initMenu() {
  const hamburger = qs(".hamburger");
  const navMenu = qs(".nav-menu");
  if (!hamburger || !navMenu) return { destroy() {} };

  const open = () => {
    navMenu.classList.add("active");
    hamburger.classList.add("active");
    hamburger.setAttribute("aria-label", "메뉴 닫기");
    hamburger.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    navMenu.classList.remove("active");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-label", "메뉴 열기");
    hamburger.setAttribute("aria-expanded", "false");
  };

  const toggle = () => (navMenu.classList.contains("active") ? close() : open());

  const onHamburgerClick = () => toggle();
  const onHamburgerKeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "Escape") close();
  };

  const onMenuClick = (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    close();
  };

  const onDocClick = (e) => {
    if (window.matchMedia("(min-width: 769px)").matches) return;
    if (navMenu.contains(e.target) || hamburger.contains(e.target)) return;
    close();
  };

  on(hamburger, "click", onHamburgerClick);
  on(hamburger, "keydown", onHamburgerKeydown);
  on(navMenu, "click", onMenuClick);
  on(document, "click", onDocClick);

  return {
    close,
    open,
    destroy() {
      hamburger.removeEventListener("click", onHamburgerClick);
      hamburger.removeEventListener("keydown", onHamburgerKeydown);
      navMenu.removeEventListener("click", onMenuClick);
      document.removeEventListener("click", onDocClick);
    },
  };
}
