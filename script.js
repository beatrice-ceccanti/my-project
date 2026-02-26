/* =========================================
   YEAR AUTO UPDATE
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});


/* =========================================
   LANGUAGE SWITCHER (keeps same page)
========================================= */
(function () {
  const SUPPORTED = ["en", "it", "de", "fr"];
  const links = document.querySelectorAll(".languageLink[data-language]");
  if (!links.length) return;

  const parts = window.location.pathname.split("/").filter(Boolean);

  const project = parts[0] || "";
  const base = project ? `/${project}/` : "/";

  const currentLang = parts[1] || "en";
  const remainder = parts.slice(2);
  const hasLang = SUPPORTED.includes(currentLang);

  links.forEach(link => {
    const lang = link.getAttribute("data-language");
    if (!SUPPORTED.includes(lang)) return;

    const targetPath = hasLang
      ? base + lang + (remainder.length ? "/" + remainder.join("/") : "/")
      : base + lang + "/";

    link.href = targetPath;

    link.addEventListener("click", () => {
      localStorage.setItem("site_language", lang);
    });
  });
})();


/* =========================================
   BRAND LINK FIX (go to language home)
========================================= */
(function () {
  const brand = document.querySelector(".brand");
  if (!brand) return;

  const SUPPORTED = ["en", "it", "de", "fr"];
  const parts = window.location.pathname.split("/").filter(Boolean);

  const project = parts[0] || "";
  const base = project ? `/${project}/` : "/";

  const currentLang = parts[1] || "en";
  const lang = SUPPORTED.includes(currentLang) ? currentLang : "en";

  brand.href = base + lang + "/";
})();


/* =========================================
   ARTICLES LOADER (GitHub Pages safe)
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("articlesGrid");
  if (!grid) return;

  const SUPPORTED = ["en", "it", "de", "es"];
  const parts = window.location.pathname.split("/").filter(Boolean);
  const lang = SUPPORTED.includes(parts[1]) ? parts[1] : "en";

  const I18N = {
    it: { read: "Leggi →", noResults: "Nessun articolo trovato.", results: "risultati" },
    en: { read: "Read →", noResults: "No articles found.", results: "results" },
    de: { read: "Lesen →", noResults: "Keine Artikel gefunden.", results: "Ergebnisse" },
    fr: { read: "Lire →", noResults: "Aucun article trouvé.", results: "résultats" }
  };

  const t = I18N[lang] || I18N.en;

  const searchInput = document.getElementById("searchInput");
  const tagSelect = document.getElementById("tagSelect");
  const resultsHint = document.getElementById("resultsHint");

  // JSON si trova sempre in /<lang>/articles/articles.json
  fetch("articles/articles.json")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load articles.json");
      return res.json();
    })
    .then(articles => {

      function render(filtered) {
        grid.innerHTML = "";

        if (!filtered.length) {
          grid.innerHTML = `<p class="muted">${t.noResults}</p>`;
          if (resultsHint) resultsHint.textContent = `0 ${t.results}`;
          return;
        }

        filtered.forEach(article => {

          const title = article.title || "";
          const excerpt = article.excerpt || "";
          const tags = Array.isArray(article.tags) ? article.tags : [];
          const url = article.url || ""; // es: "articles/first-article.html"

          if (!url) return;

          const card = document.createElement("div");
          card.className = "card";

          card.innerHTML = `
            <h3>${title}</h3>
            <p class="muted">${excerpt}</p>
            <div class="tagsRow">
              ${tags.map(tag => `<span class="pill">${tag}</span>`).join("")}
            </div>
            <a class="link" href="${url}">${t.read}</a>
          `;

          grid.appendChild(card);
        });

        if (resultsHint) {
          resultsHint.textContent = `${filtered.length} ${t.results}`;
        }
      }

      function filter() {
        const query = (searchInput?.value || "").toLowerCase();
        const selectedTag = tagSelect?.value || "All";

        const filtered = articles.filter(article => {
          const title = (article.title || "").toLowerCase();
          const excerpt = (article.excerpt || "").toLowerCase();
          const tags = Array.isArray(article.tags) ? article.tags : [];

          const matchesQuery = title.includes(query) || excerpt.includes(query);
          const matchesTag = selectedTag === "All" || tags.includes(selectedTag);

          return matchesQuery && matchesTag;
        });

        render(filtered);
      }

      searchInput?.addEventListener("input", filter);
      tagSelect?.addEventListener("change", filter);

      render(articles);
    })
    .catch(err => {
      console.error("Errore caricamento articoli:", err);
      grid.innerHTML = `<p class="muted">Error loading articles.</p>`;
    });
});

