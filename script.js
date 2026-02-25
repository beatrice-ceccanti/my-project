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
   ARTICLES LOADER (if present on page)
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("articlesGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const tagSelect = document.getElementById("tagSelect");
  const resultsHint = document.getElementById("resultsHint");

  fetch("articles/articles.json")
    .then(res => res.json())
    .then(articles => {

      function render(filtered) {
        grid.innerHTML = "";

        if (!filtered.length) {
          grid.innerHTML = "<p class='muted'>Nessun articolo trovato.</p>";
          return;
        }

        filtered.forEach(article => {
          const card = document.createElement("div");
          card.className = "card";

          card.innerHTML = `
            <h3>${article.title}</h3>
            <p class="muted">${article.description}</p>
            <div class="tagsRow">
              ${article.tags.map(tag => `<span class="pill">${tag}</span>`).join("")}
            </div>
            <a class="link" href="articles/${article.slug}.html">Leggi →</a>
          `;

          grid.appendChild(card);
        });

        if (resultsHint) {
          resultsHint.textContent = `${filtered.length} risultati`;
        }
      }

      function filter() {
        const query = searchInput ? searchInput.value.toLowerCase() : "";
        const selectedTag = tagSelect ? tagSelect.value : "All";

        const filtered = articles.filter(article => {
          const matchesQuery =
            article.title.toLowerCase().includes(query) ||
            article.description.toLowerCase().includes(query);

          const matchesTag =
            selectedTag === "All" ||
            article.tags.includes(selectedTag);

          return matchesQuery && matchesTag;
        });

        render(filtered);
      }

      if (searchInput) searchInput.addEventListener("input", filter);
      if (tagSelect) tagSelect.addEventListener("change", filter);

      render(articles);
    })
    .catch(err => {
      console.error("Errore caricamento articoli:", err);
    });
});
