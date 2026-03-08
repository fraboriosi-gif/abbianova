(() => {
  const root = document.querySelector(".manifesto-page .manifesto-carousel");
  if (!root) return;

  const track = root.querySelector(".manifesto-carousel-track");
  if (!track) return;

  const baseSlides = Array.from(track.children);
  if (baseSlides.length < 2) return;

  const firstClone = baseSlides[0].cloneNode(true);
  const lastClone = baseSlides[baseSlides.length - 1].cloneNode(true);
  firstClone.classList.add("is-clone");
  lastClone.classList.add("is-clone");
  track.appendChild(firstClone);
  track.insertBefore(lastClone, track.firstChild);

  let slides = Array.from(track.children);
  let index = 1;
  let isAnimating = false;
  let autoplayTimer = null;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  const autoplay = root.dataset.autoplay === "true";
  const pauseOnHover = root.dataset.pauseOnHover === "true";
  const dur = Number(root.dataset.autoplayDur || 5000);
  const customCursor = document.getElementById("custom-cursor");

  const updateParallax = () => {
    const viewportCenter = window.innerHeight * 0.5;
    slides.forEach((slide) => {
      const bg = slide.querySelector(".manifesto-carousel-bg");
      if (!bg) return;
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.top + rect.height * 0.5;
      const delta = (viewportCenter - slideCenter) / Math.max(window.innerHeight, 1);
      const offset = Math.max(-28, Math.min(28, delta * 56));
      bg.style.setProperty("--carousel-parallax", `${offset.toFixed(2)}px`);
    });
  };

  const setTranslate = (withTransition = true) => {
    track.style.transition = withTransition ? "transform 620ms ease" : "none";
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    updateParallax();
  };

  const normalizeIndex = () => {
    if (index === 0) {
      index = slides.length - 2;
      setTranslate(false);
    } else if (index === slides.length - 1) {
      index = 1;
      setTranslate(false);
    }
    isAnimating = false;
  };

  const goTo = (next) => {
    if (isAnimating) return;
    isAnimating = true;
    index = next;
    setTranslate(true);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const startAutoplay = () => {
    if (!autoplay) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(next, dur);
  };

  const stopAutoplay = () => {
    if (!autoplayTimer) return;
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const onPointerDown = (clientX) => {
    isDragging = true;
    startX = clientX;
    currentX = clientX;
    track.style.transition = "none";
    stopAutoplay();
  };

  const onPointerMove = (clientX) => {
    if (!isDragging) return;
    currentX = clientX;
    const delta = currentX - startX;
    const offsetPercent = (delta / root.clientWidth) * 100;
    track.style.transform = `translate3d(${-(index * 100) + offsetPercent}%, 0, 0)`;
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;
    const delta = currentX - startX;
    if (Math.abs(delta) > root.clientWidth * 0.13) {
      if (delta < 0) next();
      else prev();
    } else {
      setTranslate(true);
    }
    startAutoplay();
  };

  track.addEventListener("transitionend", normalizeIndex);

  root.addEventListener("touchstart", (e) => onPointerDown(e.touches[0].clientX), { passive: true });
  root.addEventListener("touchmove", (e) => onPointerMove(e.touches[0].clientX), { passive: true });
  root.addEventListener("touchend", onPointerUp);

  root.addEventListener("mousedown", (e) => {
    e.preventDefault();
    onPointerDown(e.clientX);
  });
  window.addEventListener("mousemove", (e) => onPointerMove(e.clientX));
  window.addEventListener("mouseup", onPointerUp);

  if (pauseOnHover) {
    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
  }

  if (customCursor) {
    root.addEventListener("mouseenter", () => {
      customCursor.classList.add("carousel-arrows");
    });
    root.addEventListener("mouseleave", () => {
      customCursor.classList.remove("carousel-arrows");
    });
    root.addEventListener("touchstart", () => {
      customCursor.classList.remove("carousel-arrows");
    }, { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  setTranslate(false);
  const parallaxLoop = () => {
    updateParallax();
    requestAnimationFrame(parallaxLoop);
  };
  requestAnimationFrame(parallaxLoop);
  startAutoplay();
})();
