export function initSnapScroll() {
  const sections = Array.from(document.querySelectorAll("section"));
  if (!sections.length) return;

  // 모바일/터치 환경은 기본 스크롤이 더 자연스러워서 스냅 비활성화(원하면 조건 삭제 가능)
  const isTouch = window.matchMedia("(max-width: 768px)").matches;
  if (isTouch) {
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    return;
  }

  let currentIndex = 0;
  let locked = false;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const scrollToIndex = (idx) => {
    currentIndex = clamp(idx, 0, sections.length - 1);
    sections[currentIndex].scrollIntoView({ behavior: "smooth" });
  };

  // 초기 위치(해시가 있으면 그쪽으로)
  const hash = window.location.hash;
  if (hash) {
    const targetIdx = sections.findIndex((s) => `#${s.id}` === hash);
    if (targetIdx >= 0) currentIndex = targetIdx;
  }

  const onWheel = (e) => {
    // 메뉴 열려있으면 스냅 방해하지 않기
    const navMenu = document.querySelector(".nav-menu");
    if (navMenu?.classList.contains("active")) return;

    e.preventDefault();
    if (locked) return;

    locked = true;
    const dir = e.deltaY > 0 ? 1 : -1;
    scrollToIndex(currentIndex + dir);

    window.setTimeout(() => {
      locked = false;
    }, 850);
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  // 키보드 접근성(옵션)
  window.addEventListener("keydown", (e) => {
    if (locked) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      locked = true;
      scrollToIndex(currentIndex + 1);
      setTimeout(() => (locked = false), 850);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      locked = true;
      scrollToIndex(currentIndex - 1);
      setTimeout(() => (locked = false), 850);
    }
  });

  // 현재 보이는 섹션 인덱스 추적(도트/메뉴 등과 동기화)
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = sections.indexOf(entry.target);
          if (idx >= 0) currentIndex = idx;
        });
      },
      { threshold: 0.6 }
    );
    sections.forEach((s) => obs.observe(s));
  }
}
