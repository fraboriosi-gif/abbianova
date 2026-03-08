(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const body = document.body;

  // Home has no natural page scroll: keep header visible.
  if (body.classList.contains("home-page")) {
    body.classList.add("header-visible");
    return;
  }

  body.classList.add("header-auto");
  const footer = document.getElementById("footer-outer");
  const mainShell = document.querySelector(".main-shell");

  let lastY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const y = window.scrollY;
    const delta = y - lastY;

    if (y < 80) {
      body.classList.add("header-visible");
      body.classList.remove("header-solid");
    } else if (delta < -6) {
      body.classList.add("header-visible");
      body.classList.add("header-solid");
    } else if (delta > 6) {
      body.classList.remove("header-visible");
      body.classList.remove("header-solid");
    }

    if (footer && mainShell) {
      const lockBottom = footer.getBoundingClientRect().top <= window.innerHeight;
      body.classList.toggle("bottom-lock", lockBottom);
    }

    lastY = y;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateHeader);
    },
    { passive: true }
  );

  window.addEventListener("resize", updateHeader, { passive: true });
  updateHeader();
})();
