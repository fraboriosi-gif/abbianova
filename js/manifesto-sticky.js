(() => {
  const steps = Array.from(
    document.querySelectorAll(".manifesto-page .manifesto-sticky-sequence .manifesto-step")
  );
  if (!steps.length) return;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let ticking = false;

  const updateParallax = () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      steps.forEach((step) => {
        const img = step.querySelector(".manifesto-step-right img");
        if (img) img.style.setProperty("--img-pan", "0px");
      });
      ticking = false;
      return;
    }

    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const progress = clamp(
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
        0,
        1
      );

      const frame = step.querySelector(".manifesto-step-right");
      const img = step.querySelector(".manifesto-step-right img");
      if (!frame || !img) return;

      const overflow = Math.max(img.offsetHeight - frame.clientHeight, 0);
      let panY = -overflow * progress;
      if (index === 1) {
        panY = -overflow * (1 - progress); // seconda foto: base dal basso
      } else if (index === 2) {
        panY = -overflow * 0.5; // terza foto: base centrata
      }
      img.style.setProperty("--img-pan", `${panY.toFixed(2)}px`);
    });

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateParallax);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  updateParallax();
})();
