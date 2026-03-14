(() => {
  const body = document.body;
  if (!body.classList.contains("wine-detail-page")) return;

  const wrapper = document.getElementById("page-wrapper");
  const footer = document.getElementById("footer-outer");
  const slides = Array.from(document.querySelectorAll(".wine-page-wrap .wine-slide"));
  if (!wrapper || !footer || slides.length < 2) return;

  const totalSections = 3; // slide 1, slide 2, footer reveal
  let currentSection = 0;
  let isScrolling = false;
  let accumulatedDelta = 0;
  let lastWheelAt = 0;
  let gestureEndAt = 0;
  let snappedInGesture = false;
  let rafResize = 0;
  const isDesktop = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const getViewportHeight = () => {
    // On mobile, visualViewport tracks the true visible area (URL bar etc).
    // On desktop, prefer innerHeight to match 100vh more consistently.
    const h = isDesktop ? (window.innerHeight || 0) : (window.visualViewport?.height || window.innerHeight || 0);
    return Math.round(h);
  };

  const syncViewportVars = () => {
    const vh = getViewportHeight();
    const twoVh = vh * 2;
    body.style.setProperty("--wine-vh", `${vh}px`);
    body.style.setProperty("--wine-2vh", `${twoVh}px`);
  };

  const syncWrapperHeight = () => {
    // Keep the wrapper height in px in sync with the snap distances.
    const vh = getViewportHeight();
    // Footer is a fixed-height panel (like home). Any overflow is handled by internal scrolling.
    const footerPanel = Math.round(footer.getBoundingClientRect().height || 0);
    const total = vh * 2 + footerPanel;
    wrapper.style.height = `${total}px`;
    return { vh, footerPanel };
  };

  const setSection = (nextSection) => {
    currentSection = Math.max(0, Math.min(totalSections - 1, nextSection));

    syncViewportVars();
    const { vh: slideHeight, footerPanel: footerHeight } = syncWrapperHeight();
    const offset =
      currentSection === 0 ? 0 : currentSection === 1 ? slideHeight : slideHeight + footerHeight;

    wrapper.style.transform = `translateY(-${Math.round(offset)}px)`;
    body.dataset.wineSection = String(currentSection);
    body.classList.toggle("bottom-lock", currentSection === totalSections - 1);

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === currentSection);
    });
  };

  // Initialize state.
  body.dataset.wineSection = "0";
  syncViewportVars();
  syncWrapperHeight();
  setSection(0);

  const onWheel = (event) => {
    const now = performance.now();
    if (isScrolling) return;

    // Allow native scrolling inside the specs scroller while you're on slide 2.
    // Only when the inner scroller hits top/bottom do we take over and snap sections.
    if (currentSection === 1) {
      const scroller = event.target?.closest?.(".wine-specs-inner");
      if (scroller) {
        const maxScrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        const atTop = scroller.scrollTop <= 1;
        const atBottom = scroller.scrollTop >= maxScrollTop - 1;
        const wantsDown = event.deltaY > 0;
        const wantsUp = event.deltaY < 0;

        if (maxScrollTop > 2) {
          if ((wantsDown && !atBottom) || (wantsUp && !atTop)) {
            return; // let the browser scroll the inner panel
          }
        }
        // If we're at the edge, fall through to snapping behavior.
      }
    }

    // We own page motion; block native wheel (and macOS rubber-band).
    event.preventDefault();

    // Treat a stream of wheel events as one gesture. Allow max one snap per gesture
    // (prevents trackpad inertia from skipping 2 sections).
    if (now > gestureEndAt) {
      snappedInGesture = false;
      accumulatedDelta = 0;
    }
    gestureEndAt = now + 260;

    if (snappedInGesture) return;

    // Accumulate small wheel events so a strong flick still results in one snap.
    if (now - lastWheelAt > 180) accumulatedDelta = 0;
    lastWheelAt = now;
    accumulatedDelta += event.deltaY;

    const threshold = 60;
    if (Math.abs(accumulatedDelta) < threshold) return;

    const direction = accumulatedDelta > 0 ? 1 : -1;
    accumulatedDelta = 0;

    const next = currentSection + direction;
    if (next < 0 || next > totalSections - 1) return;

    snappedInGesture = true;
    isScrolling = true;
    setSection(next);

    window.setTimeout(() => {
      isScrolling = false;
    }, 980);
  };

  const onResize = () => {
    window.cancelAnimationFrame(rafResize);
    rafResize = window.requestAnimationFrame(() => setSection(currentSection));
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("resize", onResize, { passive: true });
  window.visualViewport?.addEventListener("resize", onResize, { passive: true });

})();
