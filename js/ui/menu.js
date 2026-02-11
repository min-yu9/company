export function initMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  if (!hamburger || !navMenu) return;

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

  hamburger.addEventListener("click", toggle);
  hamburger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });

  // 메뉴 링크 클릭 시 닫기(모바일 UX)
  navMenu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    close();
  });

  // 바깥 클릭 시 닫기(옵션: 원하면 삭제 가능)
  document.addEventListener("click", (e) => {
    if (window.matchMedia("(min-width: 769px)").matches) return;
    if (navMenu.contains(e.target) || hamburger.contains(e.target)) return;
    close();
  });
}
