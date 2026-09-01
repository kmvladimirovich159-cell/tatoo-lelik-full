/* =========================================================
   LELKINO TATOO — COMPLETE JAVASCRIPT
   Портфолио загружается из PHP API, поэтому новые фото
   из админки появляются на сайте автоматически.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* MOBILE MENU */
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* SCROLL REVEAL */
  const observeReveal = () => {
    const revealElements = document.querySelectorAll(".reveal:not(.reveal-ready)");
    revealElements.forEach(el => el.classList.add("reveal-ready"));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: .12 });
      revealElements.forEach(el => observer.observe(el));
    } else revealElements.forEach(el => el.classList.add("visible"));
  };
  observeReveal();

  /* PORTFOLIO */
  const gallery = document.getElementById("portfolioGallery");
  const portfolioEmpty = document.getElementById("portfolioEmpty");
  const filtersWrap = document.getElementById("portfolioFilters");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const lightboxCaption = lightbox?.querySelector("p");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  let portfolioItems = [];
  let currentFilter = "all";
  let carousel = null;

  const categoryNames = {
    minimalism: "МИНИМАЛИЗМ",
    nadpisi: "НАДПИСИ",
    grafika: "ГРАФИКА",
    floristika: "ФЛОРИСТИКА",
    realizm: "РЕАЛИЗМ"
  };

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
  }

  function updateFilterCounts() {
    if (!filtersWrap) return;
    const counts = { all: portfolioItems.length };
    Object.keys(categoryNames).forEach(c => counts[c] = portfolioItems.filter(x => x.category === c).length);
    filtersWrap.querySelectorAll(".filter-btn").forEach(btn => {
      const count = btn.querySelector("span");
      if (count) count.textContent = counts[btn.dataset.filter] ?? 0;
    });
  }

  function visibleItems() {
    return [...(gallery?.querySelectorAll(".gallery-item") || [])]
      .filter(item => !item.classList.contains("is-hidden"));
  }

  function buildGallery(items) {
    if (!gallery) return;
    portfolioItems = Array.isArray(items) ? items : [];
    gallery.innerHTML = "";

    portfolioItems.forEach(item => {
      const article = document.createElement("article");
      article.className = "gallery-item reveal";
      article.dataset.category = item.category || "grafika";
      article.dataset.caption = item.caption || item.title || "Работа";
      article.dataset.full = item.src || "";
      article.innerHTML = `
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title || "Татуировка LELKINO TATOO")}" loading="lazy">
        <span class="gallery-label">${escapeHtml(item.title || "Работа")}</span>
        <span class="gallery-arrow" aria-hidden="true">↗</span>
      `;
      gallery.appendChild(article);
    });

    updateFilterCounts();
    bindGalleryClicks();
    applyFilter(currentFilter, false);
    setupCarousel();
    observeReveal();
  }

  function applyFilter(filter = "all", resetCarousel = true) {
    currentFilter = filter;
    let visibleCount = 0;
    document.querySelectorAll(".filter-btn").forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    gallery?.querySelectorAll(".gallery-item").forEach(item => {
      const show = filter === "all" || item.dataset.category === filter;
      if (show) {
        visibleCount++;
        item.classList.remove("is-hidden");
        item.classList.remove("is-showing");
        void item.offsetWidth;
        item.classList.add("is-showing");
      } else item.classList.add("is-hidden");
    });
    portfolioEmpty?.classList.toggle("show", visibleCount === 0);
    if (resetCarousel && carousel) carousel.reset();
  }

  document.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", () => applyFilter(btn.dataset.filter || "all")));

  function openLightbox(item) {
    if (!lightbox || !lightboxImage) return;
    const fullImage = item.dataset.full || item.querySelector("img")?.src || "";
    const caption = item.dataset.caption || item.querySelector(".gallery-label")?.textContent || "";
    lightboxImage.src = fullImage;
    lightboxImage.alt = caption.trim();
    if (lightboxCaption) lightboxCaption.textContent = caption.trim();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.open")) document.body.style.overflow = "";
  }
  function bindGalleryClicks() {
    gallery?.querySelectorAll(".gallery-item").forEach(item => {
      item.addEventListener("click", event => {
        if (item.classList.contains("is-hidden")) return;
        if (event.target.closest("button,a")) return;
        openLightbox(item);
      });
    });
  }
  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });

  function setupCarousel() {
    if (!gallery || !gallery.querySelector(".gallery-item")) return;
    if (carousel?.destroy) carousel.destroy();

    const oldControls = gallery.parentNode?.querySelector(":scope > .portfolio-carousel-controls");
    oldControls?.remove();

    const controls = document.createElement("div");
    controls.className = "portfolio-carousel-controls";
    controls.innerHTML = `
      <button class="carousel-arrow carousel-prev" type="button" aria-label="Предыдущая работа">←</button>
      <div class="carousel-dots" aria-label="Позиция карусели"></div>
      <button class="carousel-arrow carousel-next" type="button" aria-label="Следующая работа">→</button>`;
    gallery.parentNode?.insertBefore(controls, gallery.nextSibling);
    const dotsWrap = controls.querySelector(".carousel-dots");
    const prev = controls.querySelector(".carousel-prev");
    const next = controls.querySelector(".carousel-next");
    let currentIndex = 0, dragging = false, dragStartX = 0, dragStartScroll = 0;

    const updateDots = () => {
      const visible = visibleItems();
      [...dotsWrap.querySelectorAll(".carousel-dot")].forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
      prev.disabled = currentIndex <= 0;
      next.disabled = currentIndex >= Math.max(visible.length - 1, 0);
    };
    const makeDots = () => {
      dotsWrap.innerHTML = "";
      visibleItems().forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button"; dot.className = "carousel-dot"; dot.setAttribute("aria-label", `Работа ${index + 1}`);
        dot.addEventListener("click", () => { currentIndex = index; scrollToCurrent(); });
        dotsWrap.appendChild(dot);
      });
      updateDots();
    };
    const scrollToCurrent = () => {
      const visible = visibleItems(); if (!visible.length) return;
      currentIndex = Math.max(0, Math.min(currentIndex, visible.length - 1));
      visible[currentIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      updateDots();
    };
    const reset = () => { currentIndex = 0; makeDots(); scrollToCurrent(); };
    prev.addEventListener("click", () => { currentIndex--; scrollToCurrent(); });
    next.addEventListener("click", () => { currentIndex++; scrollToCurrent(); });
    gallery.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragging = true; dragStartX = event.clientX; dragStartScroll = gallery.scrollLeft; gallery.setPointerCapture?.(event.pointerId);
    });
    gallery.addEventListener("pointermove", event => { if (dragging) gallery.scrollLeft = dragStartScroll - (event.clientX - dragStartX); });
    const stopDragging = () => {
      if (!dragging) return; dragging = false;
      const visible = visibleItems(); if (!visible.length) return;
      const center = gallery.getBoundingClientRect().left + gallery.clientWidth / 2;
      let closest = 0, distance = Infinity;
      visible.forEach((item, index) => { const r = item.getBoundingClientRect(); const d = Math.abs((r.left + r.width / 2) - center); if (d < distance) { distance = d; closest = index; } });
      currentIndex = closest; scrollToCurrent();
    };
    gallery.addEventListener("pointerup", stopDragging); gallery.addEventListener("pointercancel", stopDragging); gallery.addEventListener("mouseleave", stopDragging);
    gallery.addEventListener("scroll", () => {
      if (dragging) return; const visible = visibleItems(); if (!visible.length) return;
      const center = gallery.getBoundingClientRect().left + gallery.clientWidth / 2;
      let closest = 0, distance = Infinity;
      visible.forEach((item, index) => { const r = item.getBoundingClientRect(); const d = Math.abs((r.left + r.width / 2) - center); if (d < distance) { distance = d; closest = index; } });
      if (closest !== currentIndex) { currentIndex = closest; updateDots(); }
    }, { passive: true });
    carousel = { reset, destroy: () => { controls.remove(); carousel = null; } };
    makeDots();
  }

  async function loadPortfolio() {
    if (!gallery) return;
    try {
      const response = await fetch("api.php?action=list", { cache: "no-store" });
      const data = await response.json();
      if (!data.ok) throw new Error(data.message || "Ошибка API");
      buildGallery(data.items || []);
    } catch (error) {
      console.error("Portfolio load error:", error);
      portfolioEmpty?.classList.add("show");
    }
  }
  loadPortfolio();

  /* MODALS */
  const bookingModal = document.getElementById("bookingModal");
  const reviewModal = document.getElementById("reviewModal");
  const openModal = modal => { if (!modal) return; modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; };
  const closeModal = modal => {
    if (!modal) return; modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true");
    if (!lightbox?.classList.contains("open") && !document.querySelector(".modal.open")) document.body.style.overflow = "";
  };
  document.querySelectorAll(".open-booking").forEach(b => b.addEventListener("click", () => openModal(bookingModal)));
  document.querySelectorAll(".open-review").forEach(b => b.addEventListener("click", () => openModal(reviewModal)));
  document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => closeModal(document.getElementById(b.dataset.close))));
  [bookingModal, reviewModal].forEach(modal => modal?.addEventListener("click", e => { if (e.target === modal) closeModal(modal); }));
  document.addEventListener("keydown", event => { if (event.key === "Escape") { closeLightbox(); closeModal(bookingModal); closeModal(reviewModal); } });

  /* BOOKING FORM */
  const bookingForm = document.getElementById("bookingForm");
  const bookingSuccess = document.getElementById("bookingSuccess");
  bookingForm?.addEventListener("submit", event => {
    event.preventDefault(); bookingForm.style.display = "none"; bookingSuccess?.classList.add("show"); showToast("Заявка отправлена ✦");
    setTimeout(() => { bookingForm.reset(); bookingForm.style.display = ""; bookingSuccess?.classList.remove("show"); closeModal(bookingModal); }, 3500);
  });

  /* REVIEWS */
  const reviewForm = document.getElementById("reviewForm");
  const reviewList = document.getElementById("reviewList");
  const getSavedReviews = () => { try { return JSON.parse(localStorage.getItem("lelkinoReviews")) || []; } catch { return []; } };
  const saveReviews = reviews => localStorage.setItem("lelkinoReviews", JSON.stringify(reviews));
  const renderReview = review => {
    if (!reviewList) return;
    const card = document.createElement("article"); card.className = "review-card reveal visible";
    const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
    card.innerHTML = `<div class="stars">${"★".repeat(rating)}${"☆".repeat(5-rating)}</div><p>«${escapeHtml(review.text)}»</p><strong>${escapeHtml(review.name)}</strong>`;
    reviewList.appendChild(card);
  };
  getSavedReviews().forEach(renderReview);
  reviewForm?.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("reviewName")?.value.trim(); const text = document.getElementById("reviewText")?.value.trim(); const rating = Number(document.getElementById("reviewRating")?.value);
    if (!name || !text || !rating) return;
    const review = { name, text, rating, date: new Date().toISOString() }; const reviews = getSavedReviews(); reviews.push(review); saveReviews(reviews); renderReview(review); reviewForm.reset(); closeModal(reviewModal); showToast("Отзыв опубликован ✦");
  });

  /* TOAST */
  const toast = document.getElementById("toast"); let toastTimer;
  function showToast(message) { if (!toast) return; toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2800); }

  /* HEADER SCROLL */
  const header = document.querySelector(".header");
  window.addEventListener("scroll", () => {
    if (!header) return;
    if (window.scrollY > 50) { header.style.background = "rgba(14,13,16,.72)"; header.style.backdropFilter = "blur(16px)"; header.style.borderBottom = "1px solid rgba(255,255,255,.06)"; }
    else { header.style.background = ""; header.style.backdropFilter = ""; header.style.borderBottom = ""; }
  }, { passive: true });

  /* PHONE */
  const phoneInput = document.querySelector('input[name="phone"]');
  phoneInput?.addEventListener("input", event => {
    let value = event.target.value.replace(/\D/g, "");
    if (value.startsWith("8")) value = "7" + value.substring(1);
    if (!value.startsWith("7") && value.length) value = "7" + value;
    value = value.substring(0, 11); let formatted = "+7";
    if (value.length > 1) formatted += " (" + value.substring(1, 4);
    if (value.length >= 4) formatted += ") " + value.substring(4, 7);
    if (value.length >= 7) formatted += "-" + value.substring(7, 9);
    if (value.length >= 9) formatted += "-" + value.substring(9, 11);
    event.target.value = formatted;
  });

  /* DATE MIN TODAY */
  const dateInput = document.querySelector('input[name="date"]');
  if (dateInput) { const today = new Date(); dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`; }
});
