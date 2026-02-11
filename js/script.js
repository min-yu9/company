// js/script.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== 1) 햄버거 메뉴 토글 =====
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".nav-menu");

  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("active");
    });
  }

  // ===== 2) 버튼 등장(IntersectionObserver) =====
  const introSection = document.querySelector(".intro-stop");
  const introBtn = document.querySelector(".intro-btn");

  if (introSection && introBtn && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            introBtn.classList.add("show");
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(introSection);
  }

  // ===== 3) 스냅 스크롤 =====
  const sections = document.querySelectorAll("section");
  if (!sections.length) return;

  let currentSection = 0;
  let isScrolling = false;
  let lastDirection = null;

  const SCROLL_LOCK_MS = 1200;

  function scrollToSection(index) {
    isScrolling = true;

    sections[index].scrollIntoView({
      behavior: "smooth",
    });

    window.setTimeout(() => {
      isScrolling = false;
    }, SCROLL_LOCK_MS);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      const direction = e.deltaY > 0 ? "down" : "up";

      // 방향이 바뀌면 잠금 해제(원본 로직 유지)
      if (direction !== lastDirection) {
        isScrolling = false;
      }

      if (isScrolling) return;
      lastDirection = direction;

      currentSection += direction === "down" ? 1 : -1;
      currentSection = Math.max(0, Math.min(currentSection, sections.length - 1));

      scrollToSection(currentSection);
    },
    { passive: true }
  );
});

// ===== 헤더 색상 전환 =====
const header = document.querySelector("header");
const heroSection = document.querySelector(".hero");

if (header && heroSection) {
  const headerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      });
    },
    { threshold: 0.1 }
  );

  headerObserver.observe(heroSection);
}

// ===== 햄버거 메뉴 클릭 시 아이콘 애니메이션 추가 =====
hamburger.addEventListener("click", () => {
  menu.classList.toggle("active");
  hamburger.classList.toggle("active"); // ✅ 추가
});

