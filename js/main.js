(function () {
  "use strict";

  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  const navPanel = document.querySelector(".nav__panel");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
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
     Header background after scrolling
     ------------------------------------------------------------------------ */

  if (nav) {
    let ticking = false;

    const updateHeader = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateHeader);
      },
      { passive: true }
    );

    updateHeader();
  }

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
     Filterable project / certificate grids
     ------------------------------------------------------------------------ */

  const filterGroups = Array.from(document.querySelectorAll("[data-filter-group]"));

  filterGroups.forEach((group) => {
    const key = group.dataset.filterGroup;
    const list = document.querySelector('[data-filter-list="' + key + '"]');
    if (!list) return;

    const items = Array.from(list.querySelectorAll("[data-categories]"));
    const count = group.querySelector("[data-filter-count]");
    const noun = group.dataset.filterNoun || "item";
    const buttons = Array.from(group.querySelectorAll(".filter"));

    const update = (value) => {
      let visible = 0;

      items.forEach((item) => {
        const categories = (item.dataset.categories || "").split(/\s+/);
        const show = value === "all" || categories.indexOf(value) !== -1;
        item.hidden = !show;
        if (show) visible += 1;
      });

      buttons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.filter === value));
      });

      if (count) {
        count.textContent = visible + " " + noun + (visible === 1 ? "" : "s");
      }
    };

    group.addEventListener("click", (event) => {
      const button = event.target.closest(".filter");
      if (!button) return;
      update(button.dataset.filter);
    });

    update("all");
  });

  /* ------------------------------------------------------------------------
     Copy credential IDs to the clipboard
     ------------------------------------------------------------------------ */

  const copyStatus = document.getElementById("copy-status");

  const announce = (message) => {
    if (copyStatus) copyStatus.textContent = message;
  };

  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(helper);

    if (!copied) throw new Error("copy failed");
  };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    const initialLabel = button.textContent.trim();

    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";

      try {
        await copyText(value);
        button.textContent = "Copied";
        button.classList.add("is-copied");
        announce("Copied " + value + " to the clipboard.");

        window.setTimeout(() => {
          button.textContent = initialLabel;
          button.classList.remove("is-copied");
        }, 1800);
      } catch (error) {
        announce("Copy failed. Select the credential code and copy it manually.");
      }
    });
  });

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
      const subjectInput = String(data.get("subject") || "").trim();
      const message = String(data.get("message") || "").trim();

      const subject = subjectInput || "Portfolio enquiry from " + name;
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
