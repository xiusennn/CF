// app.js — site-wide bootstrap: theme toggle + category-first homepage navigation.
(function () {
  const root = document.documentElement;
  const isSearchHome = document.body.classList.contains("search-home");
  const saved = isSearchHome ? "light" : localStorage.getItem("th-theme");
  if (saved) root.setAttribute("data-theme", saved);
  function toggleTheme() {
    const cur = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", cur);
    localStorage.setItem("th-theme", cur);
    // theme icon handled via CSS ([data-theme])
  }
  document.addEventListener("click", (e) => { if (e.target.closest("#theme-btn")) toggleTheme(); });

  document.addEventListener("DOMContentLoaded", () => {

    const search = document.getElementById("tool-search");
    const browse = document.getElementById("browse");
    const results = document.getElementById("results");
    const empty = document.getElementById("empty");
    if (!results) return; // not the homepage

    const cards = Array.from(results.querySelectorAll("[data-kw]"));
    const sections = Array.from(results.querySelectorAll("[data-section]"));
    const chips = Array.from(document.querySelectorAll(".chip"));
    const catCards = Array.from(document.querySelectorAll(".cat-card"));
    const backBtn = document.getElementById("back-btn");

    const setChip = (cat) => chips.forEach((c) => c.classList.toggle("active", c.getAttribute("data-cat") === cat));

    function showBrowse() {
      results.style.display = "none";
      if (browse) browse.style.display = "";
      if (search) search.value = "";
      setChip("all");
    }
    function showResults() {
      if (browse) browse.style.display = "none";
      results.style.display = "";
    }
    function selectCategory(cat, scroll) {
      showResults();
      setChip(cat);
      if (search) search.value = "";
      cards.forEach((c) => { c.style.display = ""; });
      sections.forEach((sec) => {
        const on = cat === "all" || sec.getAttribute("data-section") === cat;
        sec.style.display = on ? "" : "none";
      });
      if (empty) empty.style.display = "none";
      if (scroll && results.scrollIntoView) results.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function doSearch() {
      const q = ((search && search.value) || "").trim().toLowerCase();
      if (!q) {
        const active = chips.find((c) => c.classList.contains("active"));
        const cat = active ? active.getAttribute("data-cat") : "all";
        if (cat && cat !== "all") selectCategory(cat, false);
        else showBrowse();
        return;
      }
      showResults();
      setChip("all");
      let visible = 0;
      cards.forEach((c) => {
        const hay = (c.getAttribute("data-kw") + " " + c.getAttribute("data-cat")).toLowerCase();
        const show = hay.includes(q);
        c.style.display = show ? "" : "none";
        if (show) visible++;
      });
      sections.forEach((sec) => {
        const any = Array.from(sec.querySelectorAll("[data-kw]")).some((c) => c.style.display !== "none");
        sec.style.display = any ? "" : "none";
      });
      if (empty) empty.style.display = visible ? "none" : "block";
    }

    if (search) search.addEventListener("input", doSearch);
    chips.forEach((ch) => ch.addEventListener("click", () => selectCategory(ch.getAttribute("data-cat"), true)));
    catCards.forEach((cc) => cc.addEventListener("click", () => selectCategory(cc.getAttribute("data-cat"), true)));
    if (backBtn) backBtn.addEventListener("click", showBrowse);

    const hashCat = () => (location.hash || "").replace("#", "");
    const applyHash = (scroll) => {
      const h = hashCat();
      if (h && sections.some((s) => s.getAttribute("data-section") === h)) selectCategory(h, scroll);
      else showBrowse();
    };
    window.addEventListener("hashchange", () => applyHash(true));
    applyHash(false);
  });
})();

// Local-only recent-tool history is handled by workbench.js on pages that load it.
