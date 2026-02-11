document.addEventListener("DOMContentLoaded", () => {
  // ===== 1) 햄버거 메뉴 토글 =====
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".nav-menu");

  const toggleMenu = () => {
    if (!hamburger || !menu) return;
    menu.classList.toggle("active");
    hamburger.classList.toggle("active");
  };

  if (hamburger && menu) {
    hamburger.addEventListener("click", toggleMenu);

    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });

    // 메뉴 클릭하면 닫기
    // 메뉴 클릭 시 닫기 + 해당 섹션으로 부드럽게 이동
  document.querySelectorAll(".nav-menu a").forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");

    // #섹션 링크만 처리
    if (href && href.startsWith("#")) {
      e.preventDefault();

      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // 메뉴 닫기(모바일)
    if (menu) menu.classList.remove("active");
    if (hamburger) hamburger.classList.remove("active");
  });
  });

  }

  // ===== 2) 섹션 등장(reveal) =====
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.25 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("show"));
  }

  // ===== 3) 헤더 색상 전환 =====
  const header = document.querySelector("header");
  const heroSection = document.querySelector(".hero");

  if (header && heroSection && "IntersectionObserver" in window) {
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) header.classList.add("scrolled");
          else header.classList.remove("scrolled");
        });
      },
      { threshold: 0.1 }
    );
    headerObserver.observe(heroSection);
  }

  // ===== 4) 스냅 스크롤(휠 1번 = 섹션 1개) =====
  const sections = Array.from(document.querySelectorAll("section"));
  if (!sections.length) return;

  let currentSection = 0;
  let isScrolling = false;
  let lastDirection = null;
  const SCROLL_LOCK_MS = 1000;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function scrollToSection(index) {
    isScrolling = true;
    sections[index].scrollIntoView({ behavior: "smooth" });

    window.setTimeout(() => {
      isScrolling = false;
    }, SCROLL_LOCK_MS);
  }

  // 앵커 이동 등으로 위치 바뀌면 currentSection 동기화
  if ("IntersectionObserver" in window) {
    const syncObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target);
            if (idx >= 0) currentSection = idx;
          }
        });
      },
      { threshold: 0.6 }
    );
    sections.forEach((s) => syncObserver.observe(s));
  }

  window.addEventListener(
    "wheel",
    (e) => {
      const direction = e.deltaY > 0 ? "down" : "up";

      if (direction !== lastDirection) isScrolling = false;
      if (isScrolling) return;

      lastDirection = direction;
      currentSection = clamp(
        currentSection + (direction === "down" ? 1 : -1),
        0,
        sections.length - 1
      );

      scrollToSection(currentSection);
    },
    { passive: true }
  );
  // ===== Dot Navigation 동기화 =====
const dots = document.querySelectorAll(".dot-nav span");
const allSections = Array.from(document.querySelectorAll("section"));

function setActiveDot(index) {
  dots.forEach(dot => dot.classList.remove("active"));
  if (dots[index]) dots[index].classList.add("active");
}

// 섹션 보일 때 도트 활성화
if ("IntersectionObserver" in window) {
  const dotObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = allSections.indexOf(entry.target);
          if (index >= 0) {
            setActiveDot(index);
          }
        }
      });
    },
    { threshold: 0.6 }
  );

  allSections.forEach(section => dotObserver.observe(section));
}

// 도트 클릭 시 이동
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    allSections[index].scrollIntoView({
      behavior: "smooth"
    });
  });
});
// ===== Hero에서는 Dot 숨기기 =====
const dotNav = document.querySelector(".dot-nav");
const heroSectionForDot = document.querySelector("#hero");

if (dotNav && heroSectionForDot && "IntersectionObserver" in window) {
  const heroDotObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          dotNav.style.opacity = "0";
          dotNav.style.pointerEvents = "none";
        } else {
          dotNav.style.opacity = "1";
          dotNav.style.pointerEvents = "auto";
        }
      });
    },
    { threshold: 0.6 }
  );

  heroDotObserver.observe(heroSectionForDot);
}

});
