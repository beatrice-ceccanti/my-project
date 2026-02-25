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
   LANGUAGE SWITCHER (GitHub Pages safe)
   Works for:
   /my-project/en/
   /my-project/en/articles/...
========================================= */
(function () {
  const links = document.querySelectorAll(".languageLink[data-language]");
  if (!links.length) return;

  const SUPPORTED = ["en", "it", "de", "es"];

  // pathname examples:
  // /my-project/de/
  // /my-project/de/articles/first-article.html
  const parts = window.location.pathname.split("/").filter(Boolean);

  // parts[0] = project name (my-project)
  const project = parts[0] || "";
  const base = project ? `/${project}/` : "/";

  links.forEach(link => {
    const lang = link.getAttribute("data-language");

    if (!SUPPORTED.includes(lang)) return;

    // Always redirect to language home
    link.href = base + lang + "/";

    link.addEventListener("click", () => {
      localStorage.setItem("site_language", lang);
    });
  });
})();


/* =========================================
   ARTICLES LOADER (GitHub Pages safe + i18n)
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("articlesGrid");
  if (!grid) return;

  // Detect language from URL: /my-project/<lang>/...
  const SUPPORTED = ["en", "it", "de", "es"];
  const parts = window.location.pathname.split("/").filter(Boolean);
  const lang = SUPPORTED.includes(parts[1]) ? parts[1] : "en";

  const I18N = {
    it: { read: "Leggi →", noResults: "Nessun articolo trovato.", results: "risultati" },
    en: { read: "Read →",  noResults: "No articles found.",        results: "results"  },
    de: { read: "Lesen →", noResults: "Keine Artikel gefunden.",   results: "Ergebnisse" },
    es: { read: "Leer →",  noResults: "No se encontraron artículos.", results: "resultados" }
  };

  const t = I18N[lang] || I18N.en;

  const searchInput = document.getElementById("searchInput");
  const tagSelect = document.getElementById("tagSelect");
  const resultsHint = document.getElementById("resultsHint");

  // Always resolve relative to the CURRENT page (works for /it/ and /it/index.html)
  const jsonUrl = new URL("articles/articles.json", window.location.href);

  fetch(jsonUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${jsonUrl}`);
      return res.json();
    })
    .then((articles) => {
      function render(filtered) {
        grid.innerHTML = "";

        if (!filtered.length) {
          grid.innerHTML = `<p class="muted">${t.noResults}</p>`;
          if (resultsHint) resultsHint.textContent = `0 ${t.results}`;
          return;
        }

        filtered.forEach((article) => {
          const card = document.createElement("div");
          card.className = "card";

          const file =
              article.slug ? `${article.slug}.html` :
              article.file ? article.file :
              article.href ? article.href :
              article.url ? article.url :
              article.path ? article.path :
              null;
            
            if (!file) {
              console.warn("Articolo senza slug/file:", article);
              return; // salta la card invece di creare link rotto
            }
            
            const articleHref = new URL(`articles/${file}`, window.location.href);

          card.innerHTML = `
            <h3>${article.title}</h3>
            <p class="muted">${article.description}</p>
            <div class="tagsRow">
              ${(article.tags || []).map(tag => `<span class="pill">${tag}</span>`).join("")}
            </div>
            <a class="link" href="${articleHref.pathname}">${t.read}</a>
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

        const filtered = articles.filter((article) => {
          const title = (article.title || "").toLowerCase();
          const desc = (article.description || "").toLowerCase();
          const tags = Array.isArray(article.tags) ? article.tags : [];

          const matchesQuery = title.includes(query) || desc.includes(query);
          const matchesTag = selectedTag === "All" || tags.includes(selectedTag);

          return matchesQuery && matchesTag;
        });

        render(filtered);
      }

      searchInput?.addEventListener("input", filter);
      tagSelect?.addEventListener("change", filter);

      render(articles);
    })
    .catch((err) => {
      console.error("Errore caricamento articoli:", err);
      grid.innerHTML = `<p class="muted">Error loading articles.</p>`;
    });
});

