/* Search box for the reading page. Without scripts, the list simply shows everything. */
(() => {
  const box = document.getElementById("booksearch"), q = document.getElementById("q");
  const none = document.getElementById("none");
  const items = [...document.querySelectorAll("#books .book")];
  box.hidden = false;
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  q.addEventListener("input", () => {
    const words = norm(q.value).split(/\s+/).filter(Boolean);
    let shown = 0;
    items.forEach((li) => {
      const hay = norm(li.dataset.s);
      const ok = words.every((w) => hay.includes(w));
      li.hidden = !ok; if (ok) shown++;
    });
    none.hidden = shown > 0;
  });
})();
