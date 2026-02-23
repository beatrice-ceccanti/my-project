const SUPPORTED_LANGUAGES = ["en", "it", "de", "es"];

// ===== LANGUAGE SWITCH =====

function getCurrentLanguage() {
  const firstSegment = window.location.pathname.split("/")[1];
  return SUPPORTED_LANGUAGES.includes(firstSegment) ? firstSegment : "en";
}

function switchLanguage(targetLang) {
  const parts = window.location.pathname.split("/");
  if (SUPPORTED_LANGUAGES.includes(parts[1])) {
    parts[1] = targetLang;
    window.location.href = parts.join("/");
  } else {
    window.location.href = `/${targetLang}/`;
  }
}

document.querySelectorAll("[data-language]").forEach(link=>{
  link.addEventListener("click", e=>{
    e.preventDefault();
    const lang = link.getAttribute("data-language");
    localStorage.setItem("site_language", lang);
    switchLanguage(lang);
  });
});

const currentLang = getCurrentLanguage();
document.querySelectorAll("[data-language]").forEach(link=>{
  if(link.getAttribute("data-language") === currentLang){
    link.classList.add("active");
  }
});

// ===== ARTICLES LOADER =====

const articlesGrid = document.getElementById("articlesGrid");
const searchInput = document.getElementById("searchInput");
const tagSelect = document.getElementById("tagSelect");
const resultsHint = document.getElementById("resultsHint");

let allArticles = [];

function renderArticles(list){
  if(!articlesGrid) return;

  if(list.length === 0){
    articlesGrid.innerHTML = "<p>No results</p>";
    return;
  }

  articlesGrid.innerHTML = list.map(a=>`
    <article class="card">
      <h3><a href="${a.url}">${a.title}</a></h3>
      <p>${a.excerpt}</p>
    </article>
  `).join("");
}

function applyFilters(){
  const query = (searchInput?.value || "").toLowerCase();
  const tag = tagSelect?.value || "All";

  const filtered = allArticles.filter(a=>{
    const matchesQuery = !query || a.title.toLowerCase().includes(query);
    const matchesTag = tag === "All" || (a.tags && a.tags.includes(tag));
    return matchesQuery && matchesTag;
  });

  renderArticles(filtered);
}

async function init(){
  try{
    const res = await fetch("articles/articles.json");
    allArticles = await res.json();
    renderArticles(allArticles);

    searchInput?.addEventListener("input", applyFilters);
    tagSelect?.addEventListener("change", applyFilters);

  }catch(err){
    console.error(err);
  }
}

init();