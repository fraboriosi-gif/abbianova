// IMG SEQUENCE

// Page transition (smooth swoosh left -> right) for internal navigation.
(() => {
  let isLeaving = false;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ensureWipe = () => {
    if (!document.body) return null;
    let wipe = document.querySelector(".page-wipe");
    if (wipe) return wipe;
    wipe = document.createElement("div");
    wipe.className = "page-wipe";
    document.body.appendChild(wipe);
    return wipe;
  };

  const startLeave = (href) => {
    if (isLeaving) return;
    isLeaving = true;
    ensureWipe();
    document.body.classList.add("is-page-leaving");
    if (reduceMotion) {
      window.location.href = href;
      return;
    }
    // Navigate after the wipe has mostly covered the viewport.
    window.setTimeout(() => {
      window.location.href = href;
    }, 520);
  };

  // Reset on bfcache restore / normal navigation.
  window.addEventListener("pageshow", () => {
    isLeaving = false;
    document.body && document.body.classList.remove("is-page-leaving");
  });

  document.addEventListener("DOMContentLoaded", ensureWipe, { once: true });

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    if (a.dataset && a.dataset.noTransition === "true") return;
    if (a.hasAttribute("download")) return;

    const target = a.getAttribute("target");
    if (target && target !== "_self") return;

    const rawHref = a.getAttribute("href") || "";
    if (!rawHref) return;
    if (rawHref.startsWith("#")) return;
    if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return;

    let url;
    try {
      url = new URL(a.href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

    e.preventDefault();
    startLeave(url.href);
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".img-sequence-container");
  if (!container) return;

  const mainImage = container.querySelector(".main-image");
  if (!mainImage) return;

  const images = container.querySelectorAll(".sequence-img");
  let interval = null;
  let index = 0;

  const showFrame = (i) => {
    images.forEach(img => (img.style.display = "none"));
    if (images[i]) images[i].style.display = "block";
  };

  if (mainImage.complete) {
    mainImage.classList.add("fade-in");
  } else {
    mainImage.addEventListener("load", () => {
      mainImage.classList.add("fade-in");
    });
  }

  mainImage.addEventListener("mouseenter", () => {
    index = 0;
    showFrame(index);
    interval = setInterval(() => {
      index = (index + 1) % images.length;
      showFrame(index);
    }, 180);
  });

  mainImage.addEventListener("mouseleave", () => {
    clearInterval(interval);
    images.forEach(img => (img.style.display = "none"));
  });
});

// BEE CANVAS
(() => {
  const canvas = document.getElementById("beeCanvas");
  const buzz = document.getElementById("buzzSound");
  if (!canvas || !buzz) return;

  const ctx = canvas.getContext("2d");
  const getAssetsBase = () => {
    const styleLink = document.querySelector('link[rel="stylesheet"][href*="css/style.css"]');
    if (!styleLink) return "../";
    return styleLink.href.replace(/\/css\/style\.css$/, "/");
  };

  const ASSETS_BASE = getAssetsBase();
  const beeImage = new Image();
  beeImage.src = ASSETS_BASE + "assets/images/bee-e1749633999355.png";
  const fireflyImage = new Image();
  fireflyImage.src = ASSETS_BASE + "assets/images/firefly_inv.png";

  let animationId;
  let isAnimating = false;
  let isFireflyMode = false;
  let mouse = { x: null, y: null };

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("click", () => {
    if (isAnimating) bees.push(new Bee(false));
  });

  class Bee {
    constructor(isQueen = false) {
      this.isQueen = isQueen;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.speed = isQueen ? 0.6 : 1 + Math.random() * 1.5;
      this.angle = Math.random() * Math.PI * 2;
      this.oscillation = Math.random() * 0.1 + 0.02;
      this.oscCount = 0;
      this.size = isQueen ? 60 : 30 + Math.random() * 20;
      this.trail = [];
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 100) this.trail.shift();
      this.angle += (Math.random() - 0.5) * 0.05;

      if (!this.isQueen && mouse.x && mouse.y) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const repulseAngle = Math.atan2(dy, dx);
          this.angle += (repulseAngle - this.angle) * 0.1;
        }
      }

      const vx = Math.cos(this.angle) * this.speed;
      const vy = Math.sin(this.angle) * this.speed;
      this.x += vx;
      this.y += vy;

      if (this.x < 0 || this.x > canvas.width) this.angle = Math.PI - this.angle;
      if (this.y < 0 || this.y > canvas.height) this.angle = -this.angle;
      this.oscCount += this.oscillation;
    }

    draw(ctx) {
      if (isFireflyMode) {
        const glowRadius = 30 + 10 * Math.sin(Date.now() / 300);
        let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius * 0.5);
        gradient.addColorStop(0, "rgba(149, 98, 0, 1)");
        gradient.addColorStop(1, "rgba(149, 98, 0, 0.3)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        gradient.addColorStop(0, "rgba(149, 98, 0, 0.6)");
        gradient.addColorStop(1, "rgba(149, 98, 0, 0.1)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        for (let i = 0; i < this.trail.length - 4; i += 8) {
          const p1 = this.trail[i];
          const p2 = this.trail[i + 4];
          const alpha = i / this.trail.length;
          ctx.strokeStyle = `rgba(34, 34, 34, ${alpha.toFixed(2)})`;
          ctx.lineWidth = 1.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle + Math.sin(this.oscCount) * 0.2);
      ctx.drawImage(isFireflyMode ? fireflyImage : beeImage, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  const bees = [new Bee(true)];
  for (let i = 0; i < 2; i++) bees.push(new Bee());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bees.forEach(bee => {
      bee.update();
      bee.draw(ctx);
    });
    animationId = requestAnimationFrame(animate);
  }

  window.addEventListener("load", () => {
    const lottieContainer = document.getElementById("lottieContainer");
    const button = document.getElementById("startButton");
    const toggleModeBtn = document.getElementById("toggleMode");
    if (!button || !toggleModeBtn || !lottieContainer || typeof lottie === "undefined") return;

    const animation = lottie.loadAnimation({
      container: lottieContainer,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "https://lottie.host/57969f01-d8bc-4d4f-b2d1-14ad3bc3f361/lTLwkjdrG6.json",
    });

    button.addEventListener("click", () => {
      if (!isAnimating) {
        canvas.style.display = "block";
        buzz.play();
        animate();
        animation.play();
      } else {
        cancelAnimationFrame(animationId);
        canvas.style.display = "none";
        buzz.pause();
        buzz.currentTime = 0;
        animation.stop();
      }
      isAnimating = !isAnimating;
    });

    toggleModeBtn.addEventListener("click", () => {
      const footer = document.getElementById("footer-outer");
      if (isFireflyMode) {
        document.body.classList.remove("invert-colors");
        toggleModeBtn.textContent = "Firefly Mode";
      } else {
        document.body.classList.add("invert-colors");
        toggleModeBtn.textContent = "Bee Mode";
      }
      isFireflyMode = !isFireflyMode;
    });
  });
})();

// CUSTOM CURSOR

document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor) return;

  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX - 8}px, ${e.clientY - 8}px)`;
  });

  document.addEventListener("mousedown", () => {
    cursor.style.transform += " scale(0.6)";
    setTimeout(() => {
      cursor.style.transform = cursor.style.transform.replace(" scale(0.6)", "");
    }, 100);
  });

  document.addEventListener("mouseover", (e) => {
    const interactive = e.target.closest("a, button, input[type='submit'], .site-lang-switch");
    if (interactive) {
      cursor.classList.add("cursor-small");
    } else {
      cursor.classList.remove("cursor-small");
    }
  });
});

// HOVER LINK EFFECT (fixed bottom links)
document.addEventListener("mousemove", (e) => {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor) return;
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

  const links = document.querySelectorAll(".fixed-bottom-links a");
  let overLink = false;

  links.forEach((link) => {
    const rect = link.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(e.clientX - (rect.left + rect.width / 2), 2) +
      Math.pow(e.clientY - (rect.top + rect.height / 2), 2)
    );

    if (distance < 50) {
      overLink = true;
      link.classList.add("cursor-hover");
    } else {
      link.classList.remove("cursor-hover");
    }
  });

  if (overLink) {
    cursor.classList.add("link-hover");
  } else {
    cursor.classList.remove("link-hover");
  }
});

// NOISE OVERLAY

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("noise-canvas-element");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height;
  let frame = 0;
  const noiseFrames = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    generateNoiseFrames();
  }

  function generateNoiseFrames() {
    noiseFrames.length = 0;
    for (let i = 0; i < 10; i++) {
      const imageData = ctx.createImageData(width, height);
      for (let j = 0; j < imageData.data.length; j += 4) {
        const shade = Math.floor(Math.random() * 255);
        imageData.data[j] = shade;
        imageData.data[j + 1] = shade;
        imageData.data[j + 2] = shade;
        imageData.data[j + 3] = 60;
      }
      noiseFrames.push(imageData);
    }
  }

  function drawNoise() {
    ctx.putImageData(noiseFrames[frame % noiseFrames.length], 0, 0);
    frame++;
    requestAnimationFrame(drawNoise);
  }

  window.addEventListener("resize", resize);
  resize();
  drawNoise();
});

// Rotating words
const words = document.querySelectorAll(".dynamic-words span");
let currentWord = 0;
if (words.length) {
  const rotateWord = () => {
    words.forEach((w) => w.classList.remove("active"));
    words[currentWord].classList.add("active");
    currentWord = (currentWord + 1) % words.length;
  };

  rotateWord();
  setInterval(rotateWord, 2500);
}

// Wine detail page: keep the specs title on a single line by fitting it to its container.
function fitSingleLineTitle(el) {
  if (!el) return;

  // Reset inline size so we re-measure from CSS-defined size.
  el.style.fontSize = "";

  const cs = window.getComputedStyle(el);
  const maxPx = parseFloat(cs.fontSize) || 64;
  const minPx = 18;

  const fits = () => el.scrollWidth <= el.clientWidth + 1;
  if (fits()) return;

  let lo = minPx;
  let hi = maxPx;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    el.style.fontSize = `${mid}px`;
    if (fits()) lo = mid;
    else hi = mid;
  }
  el.style.fontSize = `${Math.max(minPx, Math.floor(lo))}px`;
}

function initWineTitleFit() {
  if (!document.body.classList.contains("wine-detail-page")) return;
  const title = document.querySelector(".wine-specs-title");
  if (!title) return;

  const run = () => fitSingleLineTitle(title);

  // Fit after fonts are ready (avoids a second resize when webfonts swap in).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run).catch(run);
  } else {
    run();
  }

  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(run);
  });
}

initWineTitleFit();

// Form submit
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const action = (form.getAttribute("action") || "").trim();
    const isFormspree = /https?:\/\/(www\.)?formspree\.io\/f\//i.test(action);

    if (!action || action.includes("REPLACE_ME") || action.includes("YOUR_FORM_ID")) {
      alert("Form non configurato: imposta l'endpoint Formspree nel campo action del form.");
      return;
    }

    try {
      const response = await fetch(action, {
        method: "POST",
        body: formData,
        headers: isFormspree ? { Accept: "application/json" } : undefined,
      });
      if (!response.ok) throw new Error("Errore server");

      // Formspree returns { ok: true } when Accept: application/json is set.
      let data = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      const ok = (data && (data.success === true || data.ok === true)) || (isFormspree && response.ok);
      if (ok) {
        form.style.display = "none";
        document.getElementById("form-success").style.display = "block";
      } else {
        alert((data && data.message) || "Errore durante l'invio");
      }
    } catch (err) {
      alert("Si è verificato un errore. Riprova più tardi.");
      console.error(err);
    }
  });
}

// Lenis smooth scrolling (static site).
// Note: enabled only on non-home, non-wine-detail pages.
(() => {
  if (document.body.classList.contains("home-page")) return;
  if (document.body.classList.contains("wine-detail-page")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof Lenis === "undefined") return;

  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.05,
    infinite: false,
  });

  window.lenis = lenis;

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };

  requestAnimationFrame(raf);
})();

// Home-style split scroll (page wrapper)
const wrapper = document.getElementById("page-wrapper");
const footerSection = document.getElementById("footer-outer");
let currentSection = 0;
let isScrolling = false;

if (document.body.classList.contains("wine-detail-page")) {
  window.scrollTo(0, 0);
}

if (wrapper && document.body.classList.contains("home-page")) {
  // Ensure the wrapper is tall enough for the real footer height on responsive layouts.
  let homeFooterShift = 0;
  const updateHomeFooterMetrics = () => {
    if (!footerSection) return;
    // Use scrollHeight to capture full content even if layout changes with media queries.
    const h = Math.ceil(footerSection.scrollHeight || footerSection.getBoundingClientRect().height || 0);
    homeFooterShift = h;
    // Inline height overrides CSS var-based height when footer gets taller on mobile.
    wrapper.style.height = `${window.innerHeight + homeFooterShift}px`;
  };

  updateHomeFooterMetrics();
  window.addEventListener("resize", updateHomeFooterMetrics);

  window.addEventListener(
    "wheel",
    (e) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }

      const maxSections = 2;
      if (e.deltaY > 0 && currentSection < maxSections - 1) {
        currentSection++;
      } else if (e.deltaY < 0 && currentSection > 0) {
        currentSection--;
      } else {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      isScrolling = true;

      updateHomeFooterMetrics();
      const footerShift = homeFooterShift || (footerSection ? footerSection.getBoundingClientRect().height : window.innerHeight);
      const translateY = currentSection === 0 ? 0 : footerShift;
      wrapper.style.transform = `translateY(-${translateY}px)`;

      setTimeout(() => {
        isScrolling = false;
      }, 900);
    },
    { passive: false }
  );

  // Mobile/tablet: swipe up/down to reveal footer (same behavior as wheel).
  let touchStartY = 0;
  let touchEndY = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches || !e.touches[0]) return;
      touchStartY = e.touches[0].clientY;
      touchEndY = touchStartY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches || !e.touches[0]) return;
      touchEndY = e.touches[0].clientY;
      // Prevent "double swipe" while animating between sections.
      if (isScrolling) e.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener(
    "touchend",
    () => {
      if (isScrolling) return;
      const delta = touchEndY - touchStartY;
      if (Math.abs(delta) < 55) return;

      const maxSections = 2;
      if (delta < 0 && currentSection < maxSections - 1) {
        currentSection++;
      } else if (delta > 0 && currentSection > 0) {
        currentSection--;
      } else {
        return;
      }

      isScrolling = true;
      updateHomeFooterMetrics();
      const footerShift = homeFooterShift || (footerSection ? footerSection.getBoundingClientRect().height : window.innerHeight);
      const translateY = currentSection === 0 ? 0 : footerShift;
      wrapper.style.transform = `translateY(-${translateY}px)`;

      setTimeout(() => {
        isScrolling = false;
      }, 900);
    },
    { passive: true }
  );
}
