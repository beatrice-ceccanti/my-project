document.getElementById("year").textContent = new Date().getFullYear();

const grid = document.getElementById("articlesGrid");
const searchInput = document.getElementById("search");
const tagSelect = document.getElementById("tag");
const countHint = document.getElementById("countHint");

let allArticles = [];

function formatDate(iso) {
  // iso: YYYY-MM-DD
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" });
}

function makeCard(a) {
  const tags = a.tags || [];
  const tagPills = tags.map(t => `<span class="pill">${t}</span>`).join("");

  return `
    <article class="card">
      <h3><a class="link" href="${a.url}">${a.title}</a></h3>
      <p>${a.excerpt || ""}</p>
      <div class="meta">
        <span>${formatDate(a.date)}</span>
        <span>•</span>
        <span>${a.minutes ?? 5} min</span>
        ${tagPills ? `<span>•</span>${tagPills}` : ""}
      </div>
    </article>
  `;
}

function render(list) {
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="card" style="grid-column: 1 / -1;">
        <h3>Nessun risultato</h3>
        <p class="muted">Prova a cambiare tag o a cercare con meno parole.</p>
      </div>
    `;
    countHint.textContent = "0 articoli trovati";
    return;
  }

  grid.innerHTML = list.map(makeCard).join("");
  countHint.textContent = `${list.length} articol${list.length === 1 ? "o" : "i"} trovati`;
}

function applyFilters() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  const tag = tagSelect?.value || "Tutti";

  const filtered = allArticles.filter(a => {
    const hay = `${a.title ?? ""} ${a.excerpt ?? ""}`.toLowerCase();
    const matchesQuery = !q || hay.includes(q);
    const matchesTag = tag === "Tutti" || (a.tags || []).includes(tag);
    return matchesQuery && matchesTag;
  });

  // più recenti prima
  filtered.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  render(filtered);
}

async function init() {
  try {
    const res = await fetch("articoli/articoli.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Impossibile caricare articoli.json");
    allArticles = await res.json();

    applyFilters();

    searchInput?.addEventListener("input", applyFilters);
    tagSelect?.addEventListener("change", applyFilters);
  } catch (err) {
    console.error(err);
    if (grid) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
          <h3>Errore nel caricamento degli articoli</h3>
          <p class="muted">Controlla che esista <code>articoli/articoli.json</code> e che sia scritto correttamente.</p>
        </div>
      `;
    }
  }
}

init();