/* =========================================================
   LELKINO TATOO — COMPLETE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     YEAR
  ===================================================== */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =====================================================
     MOBILE MENU
  ===================================================== */

  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

    });

    navLinks.querySelectorAll("a").forEach(link => {

      link.addEventListener("click", () => {

        navLinks.classList.remove("open");

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });

  }


  /* =====================================================
     SCROLL REVEAL
  ===================================================== */

  const revealElements =
    document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {

    const revealObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add("visible");

              revealObserver.unobserve(
                entry.target
              );

            }

          });

        },
        {
          threshold:0.12
        }
      );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach(element => {
      element.classList.add("visible");
    });

  }


  /* =====================================================
     PORTFOLIO FILTER
  ===================================================== */

  const filterButtons =
    document.querySelectorAll(".filter-btn");

  const galleryItems =
    document.querySelectorAll(".gallery-item");

  const portfolioEmpty =
    document.getElementById("portfolioEmpty");

  filterButtons.forEach(button => {

    button.addEventListener("click", () => {

      const filter =
        button.dataset.filter;

      filterButtons.forEach(btn => {

        btn.classList.remove("active");

        btn.setAttribute(
          "aria-selected",
          "false"
        );

      });

      button.classList.add("active");

      button.setAttribute(
        "aria-selected",
        "true"
      );

      let visibleCount = 0;

      galleryItems.forEach(item => {

        const category =
          item.dataset.category;

        const shouldShow =
          filter === "all" ||
          category === filter;

        if (shouldShow) {

          visibleCount++;

          item.classList.remove(
            "is-hidden"
          );

          item.classList.remove(
            "is-showing"
          );

          void item.offsetWidth;

          item.classList.add(
            "is-showing"
          );

        } else {

          item.classList.add(
            "is-hidden"
          );

        }

      });

      if (portfolioEmpty) {

        if (visibleCount === 0) {

          portfolioEmpty.classList.add(
            "show"
          );

        } else {

          portfolioEmpty.classList.remove(
            "show"
          );

        }

      }

      /*
        После фильтра возвращаем карусель
        на первый доступный элемент.
      */

      if (carouselAPI) {
        carouselAPI.reset();
      }

    });

  });


  /* =====================================================
     LIGHTBOX
  ===================================================== */

  const lightbox =
    document.getElementById("lightbox");

  const lightboxImage =
    lightbox?.querySelector("img");

  const lightboxCaption =
    lightbox?.querySelector("p");

  const lightboxClose =
    lightbox?.querySelector(".lightbox-close");


  function openLightbox(item) {

    if (!lightbox || !lightboxImage) {
      return;
    }

    const fullImage =
      item.dataset.full ||
      item.querySelector("img")?.src;

    const caption =
      item.dataset.caption ||
      item.querySelector(".gallery-label")?.textContent ||
      "";

    lightboxImage.src = fullImage;
    lightboxImage.alt = caption;

    if (lightboxCaption) {
      lightboxCaption.textContent =
        caption.trim();
    }

    lightbox.classList.add("open");

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow = "hidden";
  }


  function closeLightbox() {

    if (!lightbox) {
      return;
    }

    lightbox.classList.remove("open");

    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "";
  }


  galleryItems.forEach(item => {

    item.addEventListener("click", event => {

      /*
        Если пользователь двигает карусель,
        не открываем картинку случайным кликом.
      */

      if (
        item.classList.contains("is-hidden")
      ) {
        return;
      }

      openLightbox(item);

    });

  });


  lightboxClose?.addEventListener(
    "click",
    closeLightbox
  );


  lightbox?.addEventListener(
    "click",
    event => {

      if (event.target === lightbox) {
        closeLightbox();
      }

    }
  );


  /* =====================================================
     MODALS
  ===================================================== */

  const bookingModal =
    document.getElementById("bookingModal");

  const reviewModal =
    document.getElementById("reviewModal");


  function openModal(modal) {

    if (!modal) {
      return;
    }

    modal.classList.add("open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow = "hidden";
  }


  function closeModal(modal) {

    if (!modal) {
      return;
    }

    modal.classList.remove("open");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    if (
      !lightbox?.classList.contains("open") &&
      !document.querySelector(".modal.open")
    ) {

      document.body.style.overflow = "";

    }

  }


  document
    .querySelectorAll(".open-booking")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => openModal(bookingModal)
      );

    });


  document
    .querySelectorAll(".open-review")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => openModal(reviewModal)
      );

    });


  document
    .querySelectorAll("[data-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const modal =
            document.getElementById(
              button.dataset.close
            );

          closeModal(modal);

        }
      );

    });


  [bookingModal, reviewModal]
    .forEach(modal => {

      modal?.addEventListener(
        "click",
        event => {

          if (event.target === modal) {
            closeModal(modal);
          }

        }
      );

    });


  /* =====================================================
     ESC
  ===================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") {
        return;
      }

      closeLightbox();
      closeModal(bookingModal);
      closeModal(reviewModal);

    }
  );


  /* =====================================================
     BOOKING FORM
  ===================================================== */

  const bookingForm =
    document.getElementById("bookingForm");

  const bookingSuccess =
    document.getElementById("bookingSuccess");


  bookingForm?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      bookingForm.style.display = "none";

      bookingSuccess?.classList.add(
        "show"
      );

      showToast(
        "Заявка отправлена ✦"
      );

      setTimeout(() => {

        bookingForm.reset();

        bookingForm.style.display = "";

        bookingSuccess?.classList.remove(
          "show"
        );

        closeModal(bookingModal);

      }, 3500);

    }
  );


  /* =====================================================
     REVIEWS
  ===================================================== */

  const reviewForm =
    document.getElementById("reviewForm");

  const reviewList =
    document.getElementById("reviewList");


  function getSavedReviews() {

    try {

      return JSON.parse(
        localStorage.getItem(
          "lelkinoReviews"
        )
      ) || [];

    } catch {

      return [];

    }

  }


  function saveReviews(reviews) {

    localStorage.setItem(
      "lelkinoReviews",
      JSON.stringify(reviews)
    );

  }


  function escapeHtml(value) {

    const div =
      document.createElement("div");

    div.textContent =
      value;

    return div.innerHTML;

  }


  function renderReview(review) {

    if (!reviewList) {
      return;
    }

    const card =
      document.createElement("article");

    card.className =
      "review-card reveal visible";

    const rating =
      Math.max(
        1,
        Math.min(
          5,
          Number(review.rating) || 5
        )
      );

    const stars =
      "★".repeat(rating) +
      "☆".repeat(5 - rating);

    card.innerHTML = `
      <div class="stars">
        ${stars}
      </div>

      <p>
        «${escapeHtml(review.text)}»
      </p>

      <strong>
        ${escapeHtml(review.name)}
      </strong>
    `;

    reviewList.appendChild(card);

  }


  getSavedReviews().forEach(
    renderReview
  );


  reviewForm?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const name =
        document
          .getElementById("reviewName")
          ?.value
          .trim();

      const text =
        document
          .getElementById("reviewText")
          ?.value
          .trim();

      const rating =
        Number(
          document
            .getElementById("reviewRating")
            ?.value
        );

      if (
        !name ||
        !text ||
        !rating
      ) {
        return;
      }

      const review = {
        name,
        text,
        rating,
        date:new Date().toISOString()
      };

      const reviews =
        getSavedReviews();

      reviews.push(review);

      saveReviews(reviews);

      renderReview(review);

      reviewForm.reset();

      closeModal(reviewModal);

      showToast(
        "Отзыв опубликован ✦"
      );

    }
  );


  /* =====================================================
     TOAST
  ===================================================== */

  const toast =
    document.getElementById("toast");

  let toastTimer;


  function showToast(message) {

    if (!toast) {
      return;
    }

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    clearTimeout(
      toastTimer
    );

    toastTimer =
      setTimeout(() => {

        toast.classList.remove(
          "show"
        );

      }, 2800);

  }


  /* =====================================================
     HEADER SCROLL
  ===================================================== */

  const header =
    document.querySelector(".header");


  window.addEventListener(
    "scroll",
    () => {

      if (!header) {
        return;
      }

      if (window.scrollY > 50) {

        header.style.background =
          "rgba(14,13,16,.72)";

        header.style.backdropFilter =
          "blur(16px)";

        header.style.borderBottom =
          "1px solid rgba(255,255,255,.06)";

      } else {

        header.style.background = "";
        header.style.backdropFilter = "";
        header.style.borderBottom = "";

      }

    },
    {
      passive:true
    }
  );


  /* =====================================================
     PHONE INPUT
  ===================================================== */

  const phoneInput =
    document.querySelector(
      'input[name="phone"]'
    );


  phoneInput?.addEventListener(
    "input",
    event => {

      let value =
        event.target.value
          .replace(/\D/g, "");

      if (value.startsWith("8")) {
        value =
          "7" +
          value.substring(1);
      }

      if (
        !value.startsWith("7") &&
        value.length
      ) {

        value =
          "7" +
          value;

      }

      value =
        value.substring(0,11);

      let formatted =
        "+7";

      if (value.length > 1) {

        formatted +=
          " (" +
          value.substring(1,4);

      }

      if (value.length >= 4) {

        formatted +=
          ") " +
          value.substring(4,7);

      }

      if (value.length >= 7) {

        formatted +=
          "-" +
          value.substring(7,9);

      }

      if (value.length >= 9) {

        formatted +=
          "-" +
          value.substring(9,11);

      }

      event.target.value =
        formatted;

    }
  );


  /* =====================================================
     DATE MIN TODAY
  ===================================================== */

  const dateInput =
    document.querySelector(
      'input[name="date"]'
    );


  if (dateInput) {

    const today =
      new Date();

    const y =
      today.getFullYear();

    const m =
      String(
        today.getMonth() + 1
      ).padStart(2,"0");

    const d =
      String(
        today.getDate()
      ).padStart(2,"0");

    dateInput.min =
      `${y}-${m}-${d}`;

  }


  /* =====================================================
     PORTFOLIO CAROUSEL
  ===================================================== */

  const gallery =
    document.getElementById(
      "portfolioGallery"
    );

  let carouselAPI = null;


  if (
    gallery &&
    galleryItems.length
  ) {

    const controls =
      document.createElement("div");

    controls.className =
      "portfolio-carousel-controls";

    controls.innerHTML = `
      <button
        class="carousel-arrow carousel-prev"
        type="button"
        aria-label="Предыдущая работа"
      >
        ←
      </button>

      <div
        class="carousel-dots"
        aria-label="Позиция карусели"
      ></div>

      <button
        class="carousel-arrow carousel-next"
        type="button"
        aria-label="Следующая работа"
      >
        →
      </button>
    `;

    gallery.parentNode?.insertBefore(
      controls,
      gallery.nextSibling
    );


    const dotsWrap =
      controls.querySelector(
        ".carousel-dots"
      );

    const prev =
      controls.querySelector(
        ".carousel-prev"
      );

    const next =
      controls.querySelector(
        ".carousel-next"
      );


    let currentIndex = 0;
    let dragging = false;
    let moved = false;
    let dragStartX = 0;
    let dragStartScroll = 0;


    function visibleItems() {

      return [
        ...galleryItems
      ].filter(
        item =>
          !item.classList.contains(
            "is-hidden"
          )
      );

    }


    function getClosestIndex() {

      const visible =
        visibleItems();

      if (!visible.length) {
        return 0;
      }

      const center =
        gallery.getBoundingClientRect().left +
        gallery.clientWidth / 2;

      let closest = 0;
      let distance = Infinity;

      visible.forEach(
        (item,index) => {

          const rect =
            item.getBoundingClientRect();

          const itemCenter =
            rect.left +
            rect.width / 2;

          const d =
            Math.abs(
              itemCenter - center
            );

          if (d < distance) {

            distance = d;
            closest = index;

          }

        }
      );

      return closest;

    }


    function updateDots() {

      const visible =
        visibleItems();

      const dots =
        dotsWrap.querySelectorAll(
          ".carousel-dot"
        );

      dots.forEach(
        (dot,index) => {

          dot.classList.toggle(
            "active",
            index === currentIndex
          );

        }
      );

      prev.disabled =
        currentIndex <= 0;

      next.disabled =
        currentIndex >=
        Math.max(
          visible.length - 1,
          0
        );

    }


    function makeDots() {

      dotsWrap.innerHTML = "";

      visibleItems().forEach(
        (_,index) => {

          const dot =
            document.createElement(
              "button"
            );

          dot.type =
            "button";

          dot.className =
            "carousel-dot";

          dot.setAttribute(
            "aria-label",
            `Работа ${index + 1}`
          );

          dot.addEventListener(
            "click",
            () => {

              currentIndex =
                index;

              scrollToCurrent();

            }
          );

          dotsWrap.appendChild(
            dot
          );

        }
      );

      updateDots();

    }


    function scrollToCurrent() {

      const visible =
        visibleItems();

      if (!visible.length) {
        return;
      }

      currentIndex =
        Math.max(
          0,
          Math.min(
            currentIndex,
            visible.length - 1
          )
        );

      visible[
        currentIndex
      ].scrollIntoView({
        behavior:"smooth",
        block:"nearest",
        inline:"center"
      });

      updateDots();

    }


    function reset() {

      currentIndex = 0;

      makeDots();

      requestAnimationFrame(
        () => {
          scrollToCurrent();
        }
      );

    }


    prev.addEventListener(
      "click",
      () => {

        if (
          currentIndex <= 0
        ) {
          return;
        }

        currentIndex--;

        scrollToCurrent();

      }
    );


    next.addEventListener(
      "click",
      () => {

        const visible =
          visibleItems();

        if (
          currentIndex >=
          visible.length - 1
        ) {
          return;
        }

        currentIndex++;

        scrollToCurrent();

      }
    );


    /*
      SWIPE / DRAG
    */

    gallery.addEventListener(
      "pointerdown",
      event => {

        if (
          event.pointerType === "mouse" &&
          event.button !== 0
        ) {
          return;
        }

        dragging = true;
        moved = false;

        dragStartX =
          event.clientX;

        dragStartScroll =
          gallery.scrollLeft;

        gallery.setPointerCapture?.(
          event.pointerId
        );

      }
    );


    gallery.addEventListener(
      "pointermove",
      event => {

        if (!dragging) {
          return;
        }

        const delta =
          event.clientX -
          dragStartX;

        if (
          Math.abs(delta) > 8
        ) {
          moved = true;
        }

        gallery.scrollLeft =
          dragStartScroll -
          delta;

      }
    );


    function stopDragging() {

      if (!dragging) {
        return;
      }

      dragging = false;

      currentIndex =
        getClosestIndex();

      scrollToCurrent();

    }


    gallery.addEventListener(
      "pointerup",
      stopDragging
    );

    gallery.addEventListener(
      "pointercancel",
      stopDragging
    );

    gallery.addEventListener(
      "mouseleave",
      stopDragging
    );


    /*
      Обновление точки при ручном
      свайпе/скролле.
    */

    gallery.addEventListener(
      "scroll",
      () => {

        if (dragging) {
          return;
        }

        const visible =
          visibleItems();

        if (!visible.length) {
          return;
        }

        const newIndex =
          getClosestIndex();

        if (
          newIndex !==
          currentIndex
        ) {

          currentIndex =
            newIndex;

          updateDots();

        }

      },
      {
        passive:true
      }
    );


    /*
      API карусели используется
      фильтрами портфолио.
    */

    carouselAPI = {
      reset
    };


    makeDots();

  }

});
