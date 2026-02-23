export const CONFIG = Object.freeze({
  viewport: {
    orientationResetDelayMs: 250,
  },
  header: { threshold: 0.6 },
  dotNav: { threshold: 0.6 },
  reveal: { threshold: 0.15 },
  footerPeek: {
    // products 섹션 하단이 뷰포트 하단보다 이 값(px)만큼 위로 올라오면 열기
    openBottomDistPx: 10,
  },
  smoothAnchor: {
    // products 하단이 뷰포트 하단보다 살짝 아래로 가도록 만드는 추가 스크롤 여유(px)
    bottomTargetExtraPx: 80,
    // 바닥 근처 판정(이 값보다 작으면 "도달"로 간주)
    bottomThresholdPx: 140,
    bottomTimeoutMs: 2500,
    peekNavActiveMs: 2200,
    suppressReleaseDelayMs: 260,
  },
  snapScroll: {
    lockMs: 380,
    minWheelDelta: 6,
    sectionThreshold: 0.6,
  },
});
