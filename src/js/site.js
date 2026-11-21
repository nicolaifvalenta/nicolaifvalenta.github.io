/* The only script on the site.
   1. Turns footnotes into sidenotes when there is room for them.
   2. Shows a small preview when you hover over a footnote or an internal link. */
(() => {
  const WIDE = window.matchMedia("(min-width: 76rem)");
  const CAN_HOVER = window.matchMedia("(hover: hover)");

  /* ---- 1. Sidenotes ------------------------------------------------- */
  const refs = [...document.querySelectorAll(".prose .footnote-ref")];
  const noteFor = (ref) => {
    const a = ref.querySelector("a");
    return a ? document.getElementById(decodeURIComponent(a.hash.slice(1))) : null;
  };
  const noteHTML = (li) => {
    const c = li.cloneNode(true);
    c.querySelectorAll(".footnote-backref").forEach((n) => n.remove());
    c.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    return [...c.children].map((p) => p.innerHTML).join("<br>");
  };
  refs.forEach((ref, i) => {
    const li = noteFor(ref);
    if (!li) return;
    const s = document.createElement("span");
    s.className = "sidenote";
    s.innerHTML = `<span class="sn-num">${i + 1}</span>${noteHTML(li)}`;
    ref.after(s);
    ref.addEventListener("mouseenter", () => s.classList.add("hl"));
    ref.addEventListener("mouseleave", () => s.classList.remove("hl"));
  });
  if (refs.length) document.documentElement.classList.add("js-sidenotes");

  /* ---- 2. Previews -------------------------------------------------- */
  if (!CAN_HOVER.matches) return;

  const pop = document.createElement("div");
  pop.className = "preview";
  pop.setAttribute("role", "tooltip");
  document.body.append(pop);

  let showT, hideT, current;
  const cache = new Map();

  const strip = (node) => {
    node.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    node.querySelectorAll(".sidenote, script").forEach((n) => n.remove());
    node.querySelectorAll("a").forEach((a) => a.removeAttribute("href"));
    return node;
  };

  async function internalPreview(url) {
    const key = url.pathname + url.search;
    if (!cache.has(key)) {
      cache.set(key, fetch(key).then((r) => (r.ok ? r.text() : Promise.reject()))
        .then((t) => new DOMParser().parseFromString(t, "text/html")));
    }
    const doc = await cache.get(key);
    const box = document.createElement("div");

    // A link to a particular spot: show that spot.
    const target = url.hash && doc.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (target) {
      if (/^H[1-6]$/.test(target.tagName)) {
        box.append(target.cloneNode(true));
        let n = target.nextElementSibling, k = 0;
        while (n && k < 2 && !/^H[1-6]$/.test(n.tagName)) { box.append(n.cloneNode(true)); n = n.nextElementSibling; k++; }
      } else if (target.tagName === "LI" && target.classList.contains("footnote-item")) {
        box.innerHTML = noteHTML(target);
      } else {
        box.append(target.cloneNode(true));
      }
      return strip(box).innerHTML;
    }

    // Otherwise: title, date, and the opening of the page.
    const h1 = doc.querySelector(".post-head h1, h1.page-title, h2.page-title");
    const meta = doc.querySelector(".post-head .meta");
    const paras = [...doc.querySelectorAll(".prose > p")].slice(0, 2);
    if (h1) box.insertAdjacentHTML("beforeend", `<p class="pv-title">${h1.textContent}</p>`);
    if (meta) box.insertAdjacentHTML("beforeend", `<p class="pv-meta">${meta.textContent}</p>`);
    paras.forEach((p) => box.append(p.cloneNode(true)));
    if (!h1 && !paras.length) throw 0;
    return strip(box).innerHTML;
  }

  function place(anchor) {
    const r = anchor.getClientRects()[0] || anchor.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    const vw = document.documentElement.clientWidth;
    let left = Math.min(Math.max(r.left, 8), vw - pw - 8) + window.scrollX;
    let top = r.bottom + 6;
    if (top + ph > window.innerHeight - 8 && r.top - ph - 6 > 8) top = r.top - ph - 6;
    pop.style.left = left + "px";
    pop.style.top = top + window.scrollY + "px";
  }

  async function show(anchor) {
    current = anchor;
    let html;
    try {
      if (anchor.closest(".footnote-ref")) {
        if (WIDE.matches && document.documentElement.classList.contains("js-sidenotes")) return; // note is already in the margin
        const li = noteFor(anchor.closest(".footnote-ref"));
        if (!li) return;
        html = noteHTML(li);
      } else {
        html = await internalPreview(new URL(anchor.href));
      }
    } catch { return; }
    if (current !== anchor) return;
    pop.innerHTML = html;
    pop.classList.add("on");
    place(anchor);
  }
  const hide = () => { current = null; pop.classList.remove("on"); };

  const eligible = (a) => {
    if (!a || !a.href || a.classList.contains("no-preview")) return false;
    if (a.closest(".footnote-ref")) return true;
    if (a.closest(".footnotes") || a.closest(".preview") || a.closest(".sidenote")) return false;
    let u; try { u = new URL(a.href); } catch { return false; }
    if (u.origin !== location.origin || /\.(pdf|xml|zip)$/i.test(u.pathname)) return false;
    if (u.pathname === location.pathname && !u.hash) return false;
    return !!a.closest(".prose, .listing");
  };

  document.addEventListener("mouseover", (e) => {
    const a = e.target.closest && e.target.closest("a");
    if (e.target.closest && e.target.closest(".preview")) { clearTimeout(hideT); return; }
    if (!eligible(a)) return;
    clearTimeout(hideT); clearTimeout(showT);
    showT = setTimeout(() => show(a), 140);
  });
  document.addEventListener("mouseout", (e) => {
    const a = e.target.closest && e.target.closest("a, .preview");
    if (!a) return;
    clearTimeout(showT);
    hideT = setTimeout(hide, 220);
  });
  document.addEventListener("focusin", (e) => { const a = e.target.closest("a"); if (eligible(a)) show(a); });
  document.addEventListener("focusout", hide);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  window.addEventListener("scroll", () => { if (current) place(current); }, { passive: true });
})();
