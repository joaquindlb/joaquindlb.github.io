// Año automático en el footer
document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Menú en celular ----------
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => links.classList.remove("open"))
);

// ---------- Atajos de teclado: A, S, P, Q, X, E, O, C ----------
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
  const link = document.querySelector(`.nav-links a[data-key="${e.key.toLowerCase()}"]`);
  if (!link) return;
  // La tecla se "aprieta" un momento, igual que al pasar el mouse
  link.classList.add("pressed");
  setTimeout(() => link.classList.remove("pressed"), 180);
  document.querySelector(link.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
});

// ---------- Barra de progreso de lectura ----------
const bar = document.querySelector(".progress");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = `${(window.scrollY / max) * 100}%`;
}, { passive: true });

// ---------- Efecto "decrypt": las letras se descifran ----------
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*";
function scramble(el) {
  const text = el.dataset.text;
  let frame = 0;
  const total = 24;
  const timer = setInterval(() => {
    el.textContent = text.split("").map((ch, i) => {
      if (ch === " " || i < (frame / total) * text.length) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join("");
    if (++frame > total) { clearInterval(timer); el.textContent = text; }
  }, 40);
}

// ---------- Texto que se escribe solo ----------
const typed = document.querySelector(".typed");
const words = typed.dataset.words.split("|");
if (reduceMotion) {
  typed.textContent = words[0];
} else {
  let w = 0, c = 0, deleting = false;
  (function type() {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!deleting && c < word.length) c++;
    else if (deleting && c > 0) c--;
    else if (!deleting) { deleting = true; return setTimeout(type, 1600); }
    else { deleting = false; w = (w + 1) % words.length; }
    setTimeout(type, deleting ? 35 : 70);
  })();
}

// ---------- Contadores animados ----------
function countUp(el) {
  const target = +el.dataset.target;
  if (reduceMotion) { el.textContent = target; return; }
  let n = 0;
  const step = () => { el.textContent = ++n; if (n < target) setTimeout(step, 180); };
  step();
}

// ---------- Aparición al hacer scroll ----------
const items = document.querySelectorAll(".section-head, .panel, .callout, .big, .contact-lead, .stats");
items.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("visible");
    if (!reduceMotion && el.classList.contains("scramble")) scramble(el);
    if (el.classList.contains("stats")) el.querySelectorAll(".count").forEach(countUp);
    observer.unobserve(el);
  });
}, { threshold: 0.15 });
items.forEach((el) => observer.observe(el));

// Descifra el nombre al cargar la página
if (!reduceMotion) document.querySelectorAll(".hero .scramble").forEach(scramble);

// ---------- Resalta en el menú la sección visible ----------
const navLinks = document.querySelectorAll(".nav-links a");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));

// ---------- Botón para copiar el email ----------
const toast = document.querySelector(".toast");
document.querySelectorAll(".copy").forEach((btn) =>
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 1800);
    } catch {
      window.location.href = `mailto:${btn.dataset.copy}`;
    }
  })
);
