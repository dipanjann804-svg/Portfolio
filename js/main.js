(function () {
  "use strict";

  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  const navPanel = document.querySelector(".nav__panel");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const pageCurrent = document.getElementById("page-current");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------------ */

  const setMenuState = (open) => {
    if (!navToggle || !navPanel) return;

    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navPanel.classList.toggle("is-open", open);

    const label = navToggle.querySelector(".sr-only");
    if (label) {
      label.textContent = open ? "Close navigation menu" : "Open navigation menu";
    }
  };

  const closeMenu = () => setMenuState(false);

  if (navToggle && navPanel) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (nav && !nav.contains(event.target)) closeMenu();
    });

    const desktopQuery = window.matchMedia("(min-width: 941px)");
    const handleDesktop = (event) => {
      if (event.matches) closeMenu();
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleDesktop);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(handleDesktop);
    }
  }

  /* ------------------------------------------------------------------------
     Scroll spy + page marker
     ------------------------------------------------------------------------ */

  let scrollTicking = false;

  const updateActiveSection = () => {
    if (!sections.length) return;

    const probe = window.scrollY + Math.min(window.innerHeight * 0.35, 280);
    let current = sections[0];

    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= probe) current = section;
    });

    // Keep the final section active when the page is scrolled to the bottom.
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = sections[sections.length - 1];

    const activeId = current.id;

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === "#" + activeId;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (pageCurrent && current.dataset.page) {
      pageCurrent.textContent = current.dataset.page;
    }
  };

  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;

    window.requestAnimationFrame(() => {
      updateActiveSection();
      scrollTicking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateActiveSection();

  /* ------------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------------ */

  const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------------
     Contact form — opens the visitor's email client with a prefilled draft
     ------------------------------------------------------------------------ */

  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();

      const subject = "Portfolio enquiry from " + name;
      const body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
      const mailto =
        "mailto:dipanjann804@gmail.com" +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      if (formStatus) {
        formStatus.textContent = "Opening your email app with the message ready to send…";
      }

      window.location.href = mailto;
    });
  }
})();
