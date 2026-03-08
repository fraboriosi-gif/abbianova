(() => {
  const body = document.body;
  if (!body.classList.contains("gallery-page")) return;

  const images = Array.from(document.querySelectorAll(".gallery-masonry .gallery-item img"));
  if (!images.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <button class="lb-close" type="button" aria-label="Chiudi">&times;</button>
    <button class="lb-prev" type="button" aria-label="Immagine precedente">&lt;</button>
    <img src="" alt="">
    <button class="lb-next" type="button" aria-label="Immagine successiva">&gt;</button>
  `;
  body.appendChild(lightbox);

  const lbImage = lightbox.querySelector("img");
  const btnClose = lightbox.querySelector(".lb-close");
  const btnPrev = lightbox.querySelector(".lb-prev");
  const btnNext = lightbox.querySelector(".lb-next");
  let current = 0;

  const render = () => {
    const src = images[current].getAttribute("src");
    const alt = images[current].getAttribute("alt") || "";
    lbImage.src = src || "";
    lbImage.alt = alt;
  };

  const open = (index) => {
    current = index;
    render();
    body.classList.add("lightbox-open");
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    body.classList.remove("lightbox-open");
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
  };

  const prev = () => {
    current = (current - 1 + images.length) % images.length;
    render();
  };

  const next = () => {
    current = (current + 1) % images.length;
    render();
  };

  images.forEach((img, idx) => {
    img.addEventListener("click", () => open(idx));
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", prev);
  btnNext.addEventListener("click", next);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  window.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });
})();
