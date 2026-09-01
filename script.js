/* =========================================
   LELKINO TATOO
   MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {


  /* =======================================
     YEAR
  ======================================= */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =======================================
     MOBILE MENU
  ======================================= */

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


  /* =======================================
     SCROLL REVEAL
  ======================================= */

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
          threshold: .12
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


  /* =======================================
     PORTFOLIO FILTER
  ======================================= */

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


      /* ACTIVE BUTTON */

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


      /* FILTER ITEMS */

      let visibleCount = 0;


      galleryItems.forEach(item => {

        const category =
          item.dataset.category;

        const shouldShow =
          filter === "all" ||
          category === filter;


        if (shouldShow) {

          visibleCount++;

          item.classList.remove("is-hidden");

          /*
            Перезапускаем animation.
          */

          item.classList.remove("is-showing");

          void item.offsetWidth;

          item.classList.add("is-showing");

        } else {

          item.classList.add("is-hidden");

        }

      });


      /* EMPTY STATE */

      if (portfolioEmpty) {

        if (visibleCount === 0) {
          portfolioEmpty.classList.add("show");
        } else {
          portfolioEmpty.classList.remove("show");
        }

      }

    });

  });


  /* =======================================
     LIGHTBOX
  ======================================= */

  const lightbox =
    document.getElementById("lightbox");

  const lightboxImage =
    lightbox?.querySelector("img");

  const lightboxCaption =
    lightbox?.querySelector("p");

  const lightboxClose =
    lightbox?.querySelector(".lightbox-close");


  function openLightbox(item) {

    if (!lightbox ||
        !lightboxImage) {
      return;
    }


    const fullImage =
      item.dataset.full;

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

    item.addEventListener("click", () => {

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

      if (
        event.target === lightbox
      ) {
        closeLightbox();
      }

    }
  );


  /* =======================================
     ESC KEY
  ======================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") {
        return;
      }


      closeLightbox();

      closeModal(
        document.getElementById(
          "bookingModal"
        )
      );

      closeModal(
        document.getElementById(
          "reviewModal"
        )
      );

    }
  );


  /* =======================================
     MODALS
  ======================================= */

  const bookingModal =
    document.getElementById(
      "bookingModal"
    );

  const reviewModal =
    document.getElementById(
      "reviewModal"
    );


  function openModal(modal) {

    if (!modal) {
      return;
    }


    modal.classList.add("open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.style.overflow =
      "hidden";

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


    /*
      Возвращаем прокрутку,
      только если Lightbox закрыт.
    */

    if (
      !lightbox ||
      !lightbox.classList.contains("open")
    ) {

      document.body.style.overflow = "";

    }

  }


  /* OPEN BOOKING */

  document
    .querySelectorAll(".open-booking")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openModal(
            bookingModal
          );

        }
      );

    });


  /* OPEN REVIEW */

  document
    .querySelectorAll(".open-review")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openModal(
            reviewModal
          );

        }
      );

    });


  /* CLOSE BUTTONS */

  document
    .querySelectorAll("[data-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const modalId =
            button.dataset.close;

          const modal =
            document.getElementById(
              modalId
            );

          closeModal(modal);

        }
      );

    });


  /* CLOSE MODAL BY BACKDROP */

  [bookingModal, reviewModal]
    .forEach(modal => {

      modal?.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {

            closeModal(modal);

          }

        }
      );

    });


  /* =======================================
     BOOKING FORM
  ======================================= */

  const bookingForm =
    document.getElementById(
      "bookingForm"
    );

  const bookingSuccess =
    document.getElementById(
      "bookingSuccess"
    );


  bookingForm?.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      /*
        Здесь можно позже подключить
        Telegram / Email / backend.

        Сейчас форма работает
        как полноценный frontend.
      */


      bookingForm.style.display =
        "none";


      bookingSuccess?.classList.add(
        "show"
      );


      showToast(
        "Заявка отправлена ✦"
      );


      setTimeout(() => {

        bookingForm.reset();

        bookingForm.style.display =
          "";

        bookingSuccess?.classList.remove(
          "show"
        );

        closeModal(
          bookingModal
        );

      }, 3500);

    }
  );


  /* =======================================
     REVIEWS
  ======================================= */

  const reviewForm =
    document.getElementById(
      "reviewForm"
    );

  const reviewList =
    document.getElementById(
      "reviewList"
    );


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


  function renderReview(review) {

    const card =
      document.createElement("article");

    card.className =
      "review-card reveal visible";


    const stars =
      "★".repeat(review.rating) +
      "☆".repeat(5 - review.rating);


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


    reviewList?.appendChild(card);

  }


  function escapeHtml(value) {

    const div =
      document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

  }


  /*
    Загружаем отзывы,
    которые пользователь оставлял раньше.
  */

  getSavedReviews().forEach(
    review => renderReview(review)
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
            .getElementById(
              "reviewRating"
            )
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
        date: new Date().toISOString()
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


  /* =======================================
     TOAST
  ======================================= */

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


  /* =======================================
     HEADER SCROLL EFFECT
  ======================================= */

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

        header.style.background =
          "";

        header.style.backdropFilter =
          "";

        header.style.borderBottom =
          "";

      }

    },
    {
      passive: true
    }
  );


  /* =======================================
     PHONE INPUT
  ======================================= */

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


      if (
        value.startsWith("8")
      ) {
        value =
          "7" +
          value.substring(1);
      }


      if (
        !value.startsWith("7") &&
        value.length
      ) {
        value =
          "7" + value;
      }


      value =
        value.substring(0, 11);


      let formatted =
        "+7";


      if (value.length > 1) {

        formatted +=
          " (" +
          value.substring(1, 4);

      }

      if (value.length >= 4) {

        formatted +=
          ") " +
          value.substring(4, 7);

      }

      if (value.length >= 7) {

        formatted +=
          "-" +
          value.substring(7, 9);

      }

      if (value.length >= 9) {

        formatted +=
          "-" +
          value.substring(9, 11);

      }


      event.target.value =
        formatted;

    }
  );


  /* =======================================
     DATE: MIN TODAY
  ======================================= */

  const dateInput =
    document.querySelector(
      'input[name="date"]'
    );


  if (dateInput) {

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");


    dateInput.min =
      `${year}-${month}-${day}`;

  }


});
