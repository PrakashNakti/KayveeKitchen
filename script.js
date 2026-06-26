/* =====================================================================
   KAYVEE KITCHENS — SCRIPT.JS
   Vanilla JS only. Handles:
   1. Sticky nav background on scroll
   2. Mobile menu toggle
   3. Scroll-reveal animations (IntersectionObserver)
   4. Animated hero stat counters
   5. Gallery filtering
   6. Lightbox preview with prev/next
   7. Contact form validation (client-side demo)
   8. Back-to-top button
   9. Footer year
===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------------------
     1. STICKY NAV
  --------------------------------------------------------------- */
  const nav = document.getElementById("siteNav");
  const onScrollNav = () => {
    if (window.scrollY > 40) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------------------------------------------------------------
     2. MOBILE MENU
  --------------------------------------------------------------- */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  burger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-active", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      burger.classList.remove("is-active");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ---------------------------------------------------------------
     3. SCROLL REVEAL
  --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-revealed"));
  }

  /* ---------------------------------------------------------------
     4. HERO STAT COUNTERS
  --------------------------------------------------------------- */
  const statNums = document.querySelectorAll(".hero__stat-num");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || "0", 10);
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.round(value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && statNums.length) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    statNums.forEach((el) => statObserver.observe(el));
  }

  /* ---------------------------------------------------------------
     5. GALLERY FILTERING
  --------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery__item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const filter = btn.dataset.filter;
      galleryItems.forEach((item) => {
        const match = filter === "all" || item.dataset.cat === filter;
        item.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---------------------------------------------------------------
     6. LIGHTBOX
  --------------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let visibleItems = [];
  let currentIndex = 0;

  const getVisibleItems = () =>
    Array.from(galleryItems).filter(
      (item) => !item.classList.contains("is-hidden"),
    );

  const openLightbox = (index) => {
    visibleItems = getVisibleItems();
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const updateLightbox = () => {
    const item = visibleItems[currentIndex];
    if (!item) return;
    const img = item.querySelector("img");
    const span = item.querySelector("figcaption span")?.textContent || "";
    const small = item.querySelector("figcaption small")?.textContent || "";
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = `${span} — ${small}`;
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const idx = getVisibleItems().indexOf(item);
      openLightbox(idx);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lightboxPrev.addEventListener("click", () => {
    currentIndex =
      (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightbox();
  });
  lightboxNext.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    updateLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lightboxPrev.click();
    if (e.key === "ArrowRight") lightboxNext.click();
  });

  /* ---------------------------------------------------------------
     7. CONTACT FORM VALIDATION (front-end demo only)
     NOTE: To actually deliver messages, connect this form to a
     backend endpoint or a form service (e.g. Formspree) — see the
     handout comment near the fetch() call below.
  --------------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  const validators = {
    name: (v) => v.trim().length >= 2 || "Please enter your name.",
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
      "Please enter a valid email address.",
    phone: (v) =>
      /^[+\d][\d\s-]{7,14}$/.test(v.trim()) ||
      "Please enter a valid phone number.",
    message: (v) =>
      v.trim().length >= 10 || "Please add a short message (10+ characters).",
  };

  const showError = (field, message) => {
    const input = form.elements[field];
    const errorEl = form.querySelector(`[data-error-for="${field}"]`);
    input.classList.toggle("is-invalid", !!message);
    if (errorEl) errorEl.textContent = message || "";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach((field) => {
      const value = form.elements[field].value;
      const result = validators[field](value);
      if (result !== true) {
        showError(field, result);
        isValid = false;
      } else {
        showError(field, "");
      }
    });

    if (!isValid) return;

    // Demo behaviour: show a success message and reset the form.
    // To send real emails, replace this block with a fetch() call to
    // your backend or a form service, e.g.:
    // fetch('https://your-endpoint.example.com/contact', { method:'POST', body:new FormData(form) })

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(new FormData(form)).toString(),
      });

      if (response.ok) {
        formSuccess.classList.add("is-visible");
        form.reset();

        setTimeout(() => {
          formSuccess.classList.remove("is-visible");
        }, 5000);
      } else {
        alert("Failed to send enquiry.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  });

  /* ---------------------------------------------------------------
     8. BACK TO TOP
  --------------------------------------------------------------- */
  const backToTop = document.getElementById("backToTop");
  window.addEventListener(
    "scroll",
    () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    },
    { passive: true },
  );

  /* ---------------------------------------------------------------
     9. FOOTER YEAR
  --------------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
