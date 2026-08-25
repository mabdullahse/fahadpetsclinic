/**
 * Fahad Pets Clinic Website — Main JavaScript
 * Handles: Navbar, Mobile Menu, Scroll Reveal, Counters,
 *          Testimonial Slider, Gallery Lightbox, FAQ Accordion,
 *          Form Validation, Back to Top, Smooth Scroll
 */

"use strict";

/* =====================================================
   UTILITY FUNCTIONS
   ===================================================== */

/**
 * Select a single DOM element
 * @param {string} selector
 * @param {Element} parent
 */
const $ = (selector, parent = document) => parent.querySelector(selector);

/**
 * Select all matching DOM elements
 * @param {string} selector
 * @param {Element} parent
 */
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];

/**
 * Add event listener helper
 */
const on = (el, event, handler, options) =>
  el && el.addEventListener(event, handler, options);

/**
 * Check if element is in viewport
 */
const inViewport = (el, threshold = 0.15) => {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * (1 - threshold) && rect.bottom > 0;
};

/* =====================================================
   NAVBAR — sticky scroll behavior
   ===================================================== */
const initNavbar = () => {
  const navbar = $("#navbar");
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  on(window, "scroll", handleScroll, { passive: true });
  handleScroll(); // run on load

  // Set active nav link based on current page
  const currentPage = location.pathname.split("/").pop() || "index.html";
  $$(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
};

/* =====================================================
   MOBILE MENU
   ===================================================== */
const initMobileMenu = () => {
  const hamburger = $("#hamburger");
  const mobileMenu = $("#mobileMenu");
  const overlay = $("#mobileOverlay");
  const closeBtn = $("#mobileMenuClose");

  if (!hamburger || !mobileMenu) return;

  const openMenu = () => {
    hamburger.classList.add("active");
    mobileMenu.classList.add("open");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    hamburger.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
    hamburger.setAttribute("aria-expanded", "false");
  };

  on(hamburger, "click", openMenu);
  on(closeBtn, "click", closeMenu);
  on(overlay, "click", closeMenu);

  // Close menu when a link is clicked
  $$(".mobile-nav-link").forEach((link) => on(link, "click", closeMenu));

  // Set active mobile nav link
  const currentPage = location.pathname.split("/").pop() || "index.html";
  $$(".mobile-nav-link").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
};

/* =====================================================
   BACK TO TOP BUTTON
   ===================================================== */
const initBackToTop = () => {
  const btn = $("#backToTop");
  if (!btn) return;

  on(
    window,
    "scroll",
    () => {
      if (window.scrollY > 400) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    },
    { passive: true },
  );

  on(btn, "click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

/* =====================================================
   SCROLL REVEAL ANIMATIONS (IntersectionObserver)
   ===================================================== */
const initScrollReveal = () => {
  const revealClasses = [
    ".reveal",
    ".reveal-left",
    ".reveal-right",
    ".reveal-scale",
  ];
  const elements = $$(revealClasses.join(", "));

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.12 },
  );

  elements.forEach((el) => observer.observe(el));
};

/* =====================================================
   ANIMATED COUNTERS (IntersectionObserver)
   ===================================================== */
const initCounters = () => {
  const counters = $$("[data-count]");
  if (!counters.length) return;

  const formatNumber = (num, suffix) => {
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num + (suffix || "");
  };

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out function
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 },
  );

  counters.forEach((counter) => observer.observe(counter));
};

/* =====================================================
   TESTIMONIAL SLIDER
   ===================================================== */
const initTestimonialSlider = () => {
  const track = $("#testimonialsTrack");
  const dots = $$(".testimonial-dot");
  const prevBtn = $("#testimonialPrev");
  const nextBtn = $("#testimonialNext");
  const slides = $$(".testimonial-slide");

  if (!track || !slides.length) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  const AUTOPLAY_DELAY = 5000;

  const goTo = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  };

  const startAutoPlay = () => {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => goTo(currentIndex + 1), AUTOPLAY_DELAY);
  };

  const stopAutoPlay = () => clearInterval(autoPlayTimer);

  // Event listeners
  on(prevBtn, "click", () => {
    goTo(currentIndex - 1);
    startAutoPlay();
  });
  on(nextBtn, "click", () => {
    goTo(currentIndex + 1);
    startAutoPlay();
  });

  dots.forEach((dot, i) => {
    on(dot, "click", () => {
      goTo(i);
      startAutoPlay();
    });
  });

  // Pause on hover
  on(track, "mouseenter", stopAutoPlay);
  on(track, "mouseleave", startAutoPlay);

  // Touch / swipe support
  let touchStartX = 0;
  on(
    track,
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      stopAutoPlay();
    },
    { passive: true },
  );
  on(track, "touchend", (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      goTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
    }
    startAutoPlay();
  });

  // Init
  goTo(0);
  startAutoPlay();
};

/* =====================================================
   GALLERY LIGHTBOX
   ===================================================== */
const initLightbox = () => {
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  const closeBtn = $("#lightboxClose");
  const prevBtn = $("#lightboxPrev");
  const nextBtn = $("#lightboxNext");
  const galleryItems = $$(".gallery-item");

  if (!lightbox || !galleryItems.length) return;

  let currentImageIndex = 0;
  const images = galleryItems.map((item) => ({
    src: item.querySelector("img")?.src,
    caption: item.querySelector(".gallery-caption")?.textContent || "",
  }));

  const openLightbox = (index) => {
    currentImageIndex = index;
    lightboxImg.src = images[index].src;
    lightboxImg.alt = images[index].caption;
    if (lightboxCaption) lightboxCaption.textContent = images[index].caption;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  };

  const showPrev = () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    lightboxImg.style.opacity = "0";
    setTimeout(() => {
      lightboxImg.src = images[currentImageIndex].src;
      if (lightboxCaption)
        lightboxCaption.textContent = images[currentImageIndex].caption;
      lightboxImg.style.opacity = "1";
    }, 200);
  };

  const showNext = () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    lightboxImg.style.opacity = "0";
    setTimeout(() => {
      lightboxImg.src = images[currentImageIndex].src;
      if (lightboxCaption)
        lightboxCaption.textContent = images[currentImageIndex].caption;
      lightboxImg.style.opacity = "1";
    }, 200);
  };

  // Bind gallery items
  galleryItems.forEach((item, i) => {
    on(item, "click", () => openLightbox(i));
  });

  on(closeBtn, "click", closeLightbox);
  on(prevBtn, "click", showPrev);
  on(nextBtn, "click", showNext);

  // Close on backdrop click
  on(lightbox, "click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  on(document, "keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });

  // Smooth image transition
  lightboxImg.style.transition = "opacity 0.2s ease";
};

/* =====================================================
   FAQ ACCORDION
   ===================================================== */
const initFAQ = () => {
  const faqItems = $$(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    on(question, "click", () => {
      const isOpen = item.classList.contains("open");

      // Close all items
      faqItems.forEach((i) => {
        i.classList.remove("open");
      });

      // Open clicked item if it was closed
      if (!isOpen) {
        item.classList.add("open");
      }

      // Update ARIA
      question.setAttribute("aria-expanded", !isOpen);
    });
  });
};

/* =====================================================
   APPOINTMENT FORM VALIDATION
   ===================================================== */
const initAppointmentForm = () => {
  const form = $("#appointmentForm");
  if (!form) return;

  const successMsg = $("#appointmentSuccess");

  // Show error for a field
  const showError = (field, msg) => {
    const group = field.closest(".form-group");
    field.classList.add("error");
    const errEl = group?.querySelector(".form-error");
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add("visible");
    }
  };

  // Clear error for a field
  const clearError = (field) => {
    field.classList.remove("error");
    const group = field.closest(".form-group");
    const errEl = group?.querySelector(".form-error");
    if (errEl) errEl.classList.remove("visible");
  };

  // Validate a single field
  const validateField = (field) => {
    const value = field.value.trim();
    const name = field.name;

    clearError(field);

    if (field.hasAttribute("required") && !value) {
      showError(field, "This field is required.");
      return false;
    }

    if (name === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        showError(field, "Please enter a valid email address.");
        return false;
      }
    }

    if (name === "phone" && value) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(value)) {
        showError(field, "Please enter a valid phone number.");
        return false;
      }
    }

    if (name === "pet_age" && value) {
      const age = parseFloat(value);
      if (isNaN(age) || age < 0 || age > 50) {
        showError(field, "Please enter a valid pet age (0–50).");
        return false;
      }
    }

    if (name === "date" && value) {
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        showError(field, "Please select a future date.");
        return false;
      }
    }

    return true;
  };

  // Real-time validation on blur
  $$(".form-control", form).forEach((field) => {
    on(field, "blur", () => validateField(field));
    on(field, "input", () => {
      if (field.classList.contains("error")) validateField(field);
    });
  });

  // Form submission
  on(form, "submit", (e) => {
    e.preventDefault();

    const fields = $$(".form-control", form);
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) return;

    // Save to localStorage
    const formData = {};
    fields.forEach((field) => {
      if (field.name) formData[field.name] = field.value;
    });
    formData.timestamp = new Date().toISOString();

    const appointments = JSON.parse(
      localStorage.getItem("fahadpets_appointments") || "[]",
    );
    appointments.push(formData);
    localStorage.setItem(
      "fahadpets_appointments",
      JSON.stringify(appointments),
    );

    // Show success
    form.style.display = "none";
    if (successMsg) successMsg.classList.add("visible");
  });
};

/* =====================================================
   CONTACT FORM VALIDATION
   ===================================================== */
const initContactForm = () => {
  const form = $("#contactForm");
  if (!form) return;

  const successMsg = $("#contactSuccess");

  const showError = (field, msg) => {
    const group = field.closest(".form-group");
    field.classList.add("error");
    const errEl = group?.querySelector(".form-error");
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add("visible");
    }
  };

  const clearError = (field) => {
    field.classList.remove("error");
    const group = field.closest(".form-group");
    const errEl = group?.querySelector(".form-error");
    if (errEl) errEl.classList.remove("visible");
  };

  const validateField = (field) => {
    const value = field.value.trim();
    clearError(field);

    if (field.hasAttribute("required") && !value) {
      showError(field, "This field is required.");
      return false;
    }

    if (field.name === "email" && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showError(field, "Please enter a valid email address.");
        return false;
      }
    }

    if (field.name === "phone" && value) {
      if (!/^[\+]?[\d\s\-\(\)]{7,15}$/.test(value)) {
        showError(field, "Please enter a valid phone number.");
        return false;
      }
    }

    return true;
  };

  $$(".form-control", form).forEach((field) => {
    on(field, "blur", () => validateField(field));
    on(field, "input", () => {
      if (field.classList.contains("error")) validateField(field);
    });
  });

  on(form, "submit", (e) => {
    e.preventDefault();
    const fields = $$(".form-control", form);
    let isValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });
    if (!isValid) return;

    form.style.display = "none";
    if (successMsg) successMsg.classList.add("visible");
  });
};

/* =====================================================
   SET MINIMUM DATE FOR APPOINTMENT DATE PICKER
   ===================================================== */
const initDatePicker = () => {
  const dateInputs = $$('input[type="date"]');
  const today = new Date().toISOString().split("T")[0];
  dateInputs.forEach((input) => input.setAttribute("min", today));
};

/* =====================================================
   SMOOTH SCROLLING FOR ANCHOR LINKS
   ===================================================== */
const initSmoothScroll = () => {
  $$('a[href^="#"]').forEach((anchor) => {
    on(anchor, "click", (e) => {
      const target = $(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
};

/* =====================================================
   HERO STATS COUNTER (on load, visible immediately)
   ===================================================== */
const initHeroStats = () => {
  const heroStats = $$(".hero-stat .stat-number[data-count]");
  heroStats.forEach((el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      }
    }, 25);
  });
};

/* =====================================================
   GALLERY HOVER LABEL
   ===================================================== */
const initGallery = () => {
  // Already handled by CSS; this ensures overlay keyboard accessibility
  $$(".gallery-item").forEach((item, i) => {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `View gallery image ${i + 1}`);
    on(item, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        item.click();
      }
    });
  });
};

/* =====================================================
   NAVBAR ACTIVE STATE on scroll (index page)
   ===================================================== */
const initScrollSpy = () => {
  const sections = $$("section[id]");
  const navLinks = $$(".nav-link");
  const mobileLinks = $$(".mobile-nav-link");

  if (!sections.length) return;

  const currentPage = location.pathname.split("/").pop() || "index.html";
  if (currentPage !== "index.html" && currentPage !== "") return;

  const spy = () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) current = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`)
        link.classList.add("active");
    });
  };

  on(window, "scroll", spy, { passive: true });
};

/* =====================================================
   INIT ALL MODULES
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initMobileMenu();
  initBackToTop();
  initScrollReveal();
  initCounters();
  initTestimonialSlider();
  initLightbox();
  initFAQ();
  initAppointmentForm();
  initContactForm();
  initDatePicker();
  initSmoothScroll();
  initHeroStats();
  initGallery();
  initScrollSpy();

  // Log loaded page for debugging
  console.log(
    `✅ Fahad Pets Clinic Website loaded — ${new Date().toLocaleString()}`,
  );
});
