document.getElementById("year").textContent = new Date().getFullYear();

const articlesGrid = document.getElementById("articlesGrid");
const searchInput = document.getElementById("searchInput");
const tagSelect = document.getElementById("tagSelect");
const resultsHint = document.getElementById("resultsHint");

let allArticles = [];

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

function createArticleCard(article) {
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const tagPills = tags.map(t => `<span class="pill">${t}</span>`).join("");

  return `
    <article class="card">
      <h3><a class="link" href="${article.url}">${article.title}</a></h3>
      <p>${article.excerpt || ""}</p>
      <div class="meta">
        <span>${formatDate(article.date)}</span>
        <span>•</span>
        <span>${article.minutes ?? 5} min</span>
        ${tagPills ? `<span>•</span>${tagPills}` : ""}
      </div>
    </article>
  `;
}

function renderArticles(list) {
  if (!articlesGrid) return;

  if (list.length === 0) {
    articlesGrid.innerHTML = `
      <div class="card" style="grid-column: 1 / -1;">
        <h3>No results</h3>
        <p class="muted">Try another tag or use fewer search words.</p>
      </div>
    `;
    resultsHint.textContent = "0 articles found";
    return;
  }

  articlesGrid.innerHTML = list.map(createArticleCard).join("");
  resultsHint.textContent = `${list.length} article${list.length === 1 ? "" : "s"} found`;
}

function applyFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const selectedTag = tagSelect?.value || "All";

  const filtered = allArticles
    .filter(a => {
      const haystack = `${a.title ?? ""} ${a.excerpt ?? ""}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesTag = selectedTag === "All" || (Array.isArray(a.tags) && a.tags.includes(selectedTag));
      return matchesQuery && matchesTag;
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  renderArticles(filtered);
}

async function init() {
  try {
    const res = await fetch("articles/articles.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load articles.json");
    allArticles = await res.json();

    applyFilters();
    searchInput?.addEventListener("input", applyFilters);
    tagSelect?.addEventListener("change", applyFilters);
  } catch (err) {
    console.error(err);
    if (articlesGrid) {
      articlesGrid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
          <h3>Articles failed to load</h3>
          <p class="muted">Make sure <code>articles/articles.json</code> exists and is valid JSON.</p>
        </div>
      `;
    }
  }
}

init();