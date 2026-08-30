const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const bookingModal = $("#bookingModal");
const reviewModal = $("#reviewModal");
const toast = $("#toast");

/* =========================
   ОТКРЫТИЕ И ЗАКРЫТИЕ ОКОН
========================= */

function openModal(modal) {
  modal.classList.add("active");
  document.body.classList.add("modal-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("active");

  if (!$$(".modal.active").length) {
    document.body.classList.remove("modal-open");
  }

  modal.setAttribute("aria-hidden", "true");
}

$$(".open-booking").forEach(btn => {
  btn.addEventListener("click", () => openModal(bookingModal));
});

$$(".open-review").forEach(btn => {
  btn.addEventListener("click", () => openModal(reviewModal));
});

$$("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    closeModal($("#" + btn.dataset.close));
  });
});

$$(".modal").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    $$(".modal.active").forEach(closeModal);

    $("#lightbox").classList.remove("active");
    document.body.classList.remove("modal-open");
  }
});


/* =========================
   ГАЛЕРЕЯ
========================= */

const lightbox = $("#lightbox");
const lightboxImage = $("#lightbox img");
const lightboxCaption = $("#lightbox p");

$$(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector("img").alt;
    lightboxCaption.textContent = item.dataset.caption || "";

    lightbox.classList.add("active");
    document.body.classList.add("modal-open");
  });
});

$(".lightbox-close").addEventListener("click", () => {
  lightbox.classList.remove("active");
  document.body.classList.remove("modal-open");
});

lightbox.addEventListener("click", event => {
  if (event.target === lightbox) {
    lightbox.classList.remove("active");
    document.body.classList.remove("modal-open");
  }
});


/* =========================
   ОТПРАВКА ЗАЯВКИ
========================= */

const bookingForm = $("#bookingForm");
const bookingSuccess = $("#bookingSuccess");

bookingForm.addEventListener("submit", async event => {
  event.preventDefault();

  const submitButton = bookingForm.querySelector(
    'button[type="submit"]'
  );

  const oldText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = "Отправляем...";

  bookingSuccess.style.display = "none";

  console.log("Заявка отправляется на сервер...");

  try {
    const formData = new FormData(bookingForm);

    const response = await fetch("/api/appointment", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    console.log("Ответ сервера:", result);

    if (!response.ok || !result.ok) {
      throw new Error(
        result.message || "Не удалось отправить заявку."
      );
    }

    bookingSuccess.textContent =
      result.message ||
      "Спасибо! Ваша заявка принята. Я свяжусь с вами для уточнения деталей.";

    bookingSuccess.style.display = "block";

    bookingForm.reset();

    setTimeout(() => {
      closeModal(bookingModal);
    }, 3500);

  } catch (error) {

    console.error("Ошибка отправки:", error);

    bookingSuccess.textContent =
      error.message || "Ошибка при отправке заявки.";

    bookingSuccess.style.display = "block";

  } finally {

    submitButton.disabled = false;
    submitButton.textContent = oldText;

  }
});


/* =========================
   ОТЗЫВЫ
========================= */

function stars(rating) {
  return "★★★★★".slice(0, rating) +
         "☆☆☆☆☆".slice(0, 5 - rating);
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function addReview(name, rating, text, prepend = true) {

  const article = document.createElement("article");

  article.className = "review-card";

  article.innerHTML = `
    <div class="stars">${stars(Number(rating))}</div>
    <p>«${escapeHTML(text)}»</p>
    <strong>${escapeHTML(name)}</strong>
  `;

  const list = $("#reviewList");

  if (prepend) {
    list.prepend(article);
  } else {
    list.append(article);
  }
}

$("#reviewForm").addEventListener("submit", event => {

  event.preventDefault();

  const name = $("#reviewName").value.trim();
  const rating = $("#reviewRating").value;
  const text = $("#reviewText").value.trim();

  if (!name || !text) return;

  const saved = JSON.parse(
    localStorage.getItem("tattooReviews") || "[]"
  );

  saved.unshift({
    name,
    rating,
    text
  });

  localStorage.setItem(
    "tattooReviews",
    JSON.stringify(saved)
  );

  addReview(name, rating, text);

  event.target.reset();

  closeModal(reviewModal);

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
});


/* Загрузка сохранённых отзывов */

JSON.parse(
  localStorage.getItem("tattooReviews") || "[]"
)
  .slice(0, 6)
  .reverse()
  .forEach(review => {
    addReview(
      review.name,
      review.rating,
      review.text,
      false
    );
  });


/* =========================
   ГОД В ПОДВАЛЕ
========================= */

$("#year").textContent = new Date().getFullYear();


/* =========================
   АНИМАЦИЯ
========================= */

const observer = new IntersectionObserver(entries => {

  entries.forEach(entry => {

    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }

  });

}, {
  threshold: 0.12
});

$$(".reveal").forEach(element => {
  observer.observe(element);
});


/* =========================
   МОБИЛЬНОЕ МЕНЮ
========================= */

const nav = $(".nav");

$(".menu-toggle").addEventListener("click", () => {
  nav.classList.toggle("open");
});

$$(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
  });
});