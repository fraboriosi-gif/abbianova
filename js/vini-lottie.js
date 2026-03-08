(() => {
  const el = document.getElementById("vini-lottie");
  if (!el || typeof lottie === "undefined") return;

  lottie.loadAnimation({
    container: el,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "https://lottie.host/4b72d9f7-78dc-4308-9768-c803d505c9f1/QffSDj3nr6.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet"
    }
  });
})();
