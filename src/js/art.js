/* Slowly turns the paintings in the margins. Does nothing on narrow screens,
   and nothing at all if the reader has asked their computer for less motion. */
(() => {
  const wide = matchMedia("(min-width: 72rem)");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const STEP = 16000; // one painting every 16 seconds

  document.querySelectorAll(".art").forEach((col, c) => {
    const slides = [...col.querySelectorAll(".slide")];
    let i = 0;

    const load = () => slides.forEach((s) => {
      const img = s.querySelector("img");
      if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
    });
    const ready = (s) => { const img = s.querySelector("img"); return img.complete && img.naturalWidth > 0; };

    // Fetch the rest quietly once the page is up, and only where the art shows.
    const maybeLoad = () => { if (wide.matches) load(); };
    addEventListener("load", maybeLoad);
    wide.addEventListener("change", maybeLoad);

    const next = () => {
      if (document.hidden || !wide.matches) return;
      const to = (i + 1) % slides.length;
      if (!ready(slides[to])) return;           // wait until it has arrived
      slides[i].classList.remove("on");
      slides[to].classList.add("on");
      i = to;
    };
    // The right column turns half a step after the left one.
    setTimeout(() => setInterval(next, STEP), c * (STEP / 2));
  });
})();
