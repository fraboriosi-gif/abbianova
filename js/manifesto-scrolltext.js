(() => {
  const section = document.querySelector(".manifesto-page .nectar-scrolling-text");
  if (!section) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const chunks = Array.from(
    section.querySelectorAll(".nectar-scrolling-text-inner__text-chunk")
  );
  if (!chunks.length) return;

  let speed = 1;
  let targetSpeed = 1;
  let lastY = window.scrollY;
  let lastTs = performance.now();
  let rafId = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getAnimations = () => {
    const anims = [];
    chunks.forEach((chunk) => {
      const list = chunk.getAnimations ? chunk.getAnimations() : [];
      list.forEach((anim) => anims.push(anim));
    });
    return anims;
  };

  const tick = (ts) => {
    const dt = Math.max(ts - lastTs, 16);
    const y = window.scrollY;
    const dy = Math.abs(y - lastY);
    const velocity = dy / dt;

    targetSpeed = clamp(1 + velocity * 5.2, 1, 3.2);
    speed += (targetSpeed - speed) * 0.14;
    speed += (1 - speed) * 0.035;

    const animations = getAnimations();
    animations.forEach((anim) => {
      anim.playbackRate = speed;
    });

    lastY = y;
    lastTs = ts;
    rafId = requestAnimationFrame(tick);
  };

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
})();
