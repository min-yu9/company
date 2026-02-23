export function createAppState() {
  const state = {
    peekNav: { active: false, until: 0 },
  };

  const setPeekNavActive = (active, ms = 1600) => {
    if (active) {
      state.peekNav.active = true;
      state.peekNav.until = performance.now() + ms;
      return;
    }
    state.peekNav.active = false;
    state.peekNav.until = 0;
  };

  const isPeekNavActive = () => {
    if (!state.peekNav.active) return false;
    if (state.peekNav.until && performance.now() > state.peekNav.until) {
      state.peekNav.active = false;
      return false;
    }
    return true;
  };

  return { state, setPeekNavActive, isPeekNavActive };
}
