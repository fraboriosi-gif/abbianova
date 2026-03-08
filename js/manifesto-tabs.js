(() => {
  const tabsSection = document.querySelector(".manifesto-page .nectar-scrolling-tabs");
  if (!tabsSection) return;

  const menuItems = Array.from(tabsSection.querySelectorAll(".menu-item"));
  const mediaItems = Array.from(tabsSection.querySelectorAll(".manifesto-media-item"));
  if (!menuItems.length || menuItems.length !== mediaItems.length) return;

  let activeIndex = 0;
  let ticking = false;
  const steps = menuItems.length;

  const setActive = (nextIndex) => {
    if (nextIndex === activeIndex) return;
    menuItems[activeIndex].classList.remove("is-active");
    mediaItems[activeIndex].classList.remove("is-active");
    activeIndex = nextIndex;
    menuItems[activeIndex].classList.add("is-active");
    mediaItems[activeIndex].classList.add("is-active");
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getStepState = () => {
    const sectionRect = tabsSection.getBoundingClientRect();
    const totalTravel = Math.max(sectionRect.height + window.innerHeight, 1);
    const sectionProgress = clamp((window.innerHeight - sectionRect.top) / totalTravel, 0, 0.9999);
    const boundedRaw = sectionProgress * steps;
    const index = clamp(Math.floor(boundedRaw), 0, steps - 1);
    const inStepProgress = clamp(boundedRaw - index, 0, 1);
    return { index, inStepProgress };
  };

  const updateTabs = () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      setActive(0);
      ticking = false;
      return;
    }

    const { index: nextIndex, inStepProgress } = getStepState();
    setActive(nextIndex);
    const activeImg = mediaItems[activeIndex].querySelector("img");
    if (activeImg) {
      const mediaOverflow = Math.max(activeImg.offsetHeight - mediaItems[activeIndex].clientHeight, 0);
      const panY = -mediaOverflow * inStepProgress;
      activeImg.style.setProperty("--img-pan", `${panY.toFixed(2)}px`);
    }

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateTabs);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  updateTabs();
})();
