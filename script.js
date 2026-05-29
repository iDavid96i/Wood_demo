/* =========================================================
   Olive & Oak — interactions
   Vanilla JS · no dependencies
   ========================================================= */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    initNavbar();
    initMobileMenu();
    initReveal();
    initParticles();
    initGalleryFilter();
    initLightbox();
    initSlider();
    initContactForm();
  });

  /* ---- Footer year ---- */
  function setYear() {
    const el = $("#year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---- Navbar background on scroll ---- */
  function initNavbar() {
    const nav = $("#nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  function initMobileMenu() {
    const burger = $("#burger");
    const links = $("#navLinks");
    if (!burger || !links) return;

    const close = () => {
      burger.classList.remove("is-open");
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    };

    burger.addEventListener("click", () => {
      const open = burger.classList.toggle("is-open");
      links.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });

    $$("a", links).forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---- Scroll reveal via IntersectionObserver ---- */
  function initReveal() {
    const items = $$(".reveal");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // gentle stagger for siblings entering together
          setTimeout(() => entry.target.classList.add("is-visible"), (i % 6) * 70);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ---- Floating hero particles ---- */
  function initParticles() {
    const host = $("#particles");
    if (!host || prefersReduced) return;
    const count = window.innerWidth < 600 ? 12 : 22;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      const size = Math.random() * 5 + 2;
      p.style.width = p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = "-10px";
      p.style.animationDuration = (Math.random() * 14 + 10) + "s";
      p.style.animationDelay = (Math.random() * 12) + "s";
      frag.appendChild(p);
    }
    host.appendChild(frag);
  }

  /* ---- Gallery category filter ---- */
  function initGalleryFilter() {
    const chips = $$(".chip");
    const items = $$(".gallery__item");
    if (!chips.length) return;

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const f = chip.dataset.filter;
        items.forEach((item) => {
          const show = f === "all" || item.dataset.cat === f;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---- Lightbox ---- */
  function initLightbox() {
    const lb = $("#lightbox");
    const lbImg = $("#lbImg");
    const lbCap = $("#lbCaption");
    const closeBtn = $("#lbClose");
    const prevBtn = $("#lbPrev");
    const nextBtn = $("#lbNext");
    const figures = $$(".gallery__item");
    if (!lb || !figures.length) return;

    let current = 0;

    const visibleFigures = () => figures.filter((f) => !f.classList.contains("is-hidden"));

    function open(fig) {
      const list = visibleFigures();
      current = list.indexOf(fig);
      render(list);
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function render(list) {
      const fig = list[current];
      if (!fig) return;
      const img = $("img", fig);
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = $("figcaption", fig)?.textContent || "";
    }
    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function step(dir) {
      const list = visibleFigures();
      current = (current + dir + list.length) % list.length;
      render(list);
    }

    figures.forEach((fig) => fig.addEventListener("click", () => open(fig)));
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---- Testimonials slider ---- */
  function initSlider() {
    const track = $("#sliderTrack");
    const dotsWrap = $("#sliderDots");
    if (!track) return;
    const slides = $$(".slide", track);
    let index = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "Review " + (i + 1));
      dot.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(dot);
    });
    const dots = $$("button", dotsWrap);

    function go(i, user) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
      if (user) restart();
    }
    function restart() {
      if (prefersReduced) return;
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 6000);
    }

    $("#nextSlide")?.addEventListener("click", () => go(index + 1, true));
    $("#prevSlide")?.addEventListener("click", () => go(index - 1, true));

    // pause on hover
    const slider = $("#slider");
    slider?.addEventListener("mouseenter", () => clearInterval(timer));
    slider?.addEventListener("mouseleave", restart);

    go(0);
    restart();
  }

  /* ---- Contact form (frontend only) ---- */
  function initContactForm() {
    const form = $("#contactForm");
    const note = $("#formNote");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const message = $("#message").value.trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !validEmail || !message) {
        note.style.color = "#c0392b";
        note.textContent = "Please fill in every field with a valid email.";
        return;
      }
      note.style.color = "#1faa59";
      note.textContent = `Thank you, ${name.split(" ")[0]}! Your message has been received (demo).`;
      form.reset();
    });
  }
})();
