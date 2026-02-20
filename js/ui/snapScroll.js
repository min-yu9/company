export function initSnapScroll() {
  const sections = Array.from(document.querySelectorAll("section"));
  if (!sections.length) return;

  // 모바일/터치 환경은 기본 스크롤이 더 자연스러워서 스냅 비활성화
  const isTouch =
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches;

  if (isTouch) {
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    return;
  }

  let currentIndex = 0;

  // 같은 방향 연타만 막고, 반대 방향은 즉시 허용
  let locked = false;
  let lastDir = 0;
  let unlockTimer = 0;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // 현재 진행 중인 smooth를 "끊고" 새 smooth를 시작하기 위한 트릭
  const cancelOngoingScroll = () => {
    window.scrollTo({ top: window.scrollY, behavior: "auto" });
  };

  const scrollToIndex = (idx, behavior = "smooth") => {
    currentIndex = clamp(idx, 0, sections.length - 1);
    sections[currentIndex].scrollIntoView({ behavior, block: "start" });
  };

  // 초기 위치(해시가 있으면 그쪽으로)
  const hash = window.location.hash;
  if (hash) {
    const targetIdx = sections.findIndex((s) => `#${s.id}` === hash);
    if (targetIdx >= 0) currentIndex = targetIdx;
  }

  const lock = (dir) => {
    locked = true;
    lastDir = dir;
    if (unlockTimer) window.clearTimeout(unlockTimer);

    // 짧은 잠금: 자연스럽게 연속 스크롤 방지
    unlockTimer = window.setTimeout(() => {
      locked = false;
      unlockTimer = 0;
    }, 380);
  };

  const forceUnlock = () => {
    locked = false;
    if (unlockTimer) window.clearTimeout(unlockTimer);
    unlockTimer = 0;
  };

  // 아주 작은 휠 떨림은 무시(트랙패드 미세 입력 완화)
  const MIN_DELTA = 6;

  const onWheel = (e) => {
    const navMenu = document.querySelector(".nav-menu");
    if (navMenu?.classList.contains("active")) return;

    // 스냅 스크롤이므로 기본 스크롤은 막음
    e.preventDefault();

    if (Math.abs(e.deltaY) < MIN_DELTA) return;

    const dir = e.deltaY > 0 ? 1 : -1;

    // 잠금 중이라도 반대 방향이면 즉시 "부드럽게" 이동
    if (locked && dir !== lastDir) {
      forceUnlock();
      cancelOngoingScroll();         // 끊고
      scrollToIndex(currentIndex + dir, "smooth"); // 다시 smooth
      lock(dir);
      return;
    }

    if (locked) return;

    cancelOngoingScroll();
    scrollToIndex(currentIndex + dir, "smooth");
    lock(dir);
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  // 키보드도 동일하게
  window.addEventListener("keydown", (e) => {
    const isDown = e.key === "ArrowDown" || e.key === "PageDown";
    const isUp = e.key === "ArrowUp" || e.key === "PageUp";
    if (!isDown && !isUp) return;

    const dir = isDown ? 1 : -1;

    if (locked && dir !== lastDir) {
      forceUnlock();
      cancelOngoingScroll();
      scrollToIndex(currentIndex + dir, "smooth");
      lock(dir);
      return;
    }

    if (locked) return;

    cancelOngoingScroll();
    scrollToIndex(currentIndex + dir, "smooth");
    lock(dir);
  });

  // 현재 보이는 섹션 인덱스 추적
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
