// Navbar mobile
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  // Chiudi menu quando clicchi un link
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// Footer anno
document.getElementById("year").textContent = new Date().getFullYear();

// Form demo (senza backend)
const form = document.getElementById("contactForm");
const hint = document.getElementById("formHint");

if (form && hint) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hint.textContent = "Messaggio pronto ✅ (più avanti lo colleghiamo davvero con Netlify Forms).";
    form.reset();
  });
}
