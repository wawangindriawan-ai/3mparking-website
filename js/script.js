// ==========================================================
// 3M PARKING — script.js
// ==========================================================

(function () {
  "use strict";

  var MOBILE_BP = 880;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    var navbar = document.querySelector(".navbar");
    var navToggle = document.getElementById("navToggle");
    var navMenu = document.getElementById("navMenu");
    var navBackdrop = document.getElementById("navBackdrop");
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links > a"));
    var fabWa = document.getElementById("fabWa");

    // ------------------------------------------------------
    // Navbar height → --nav-h
    // Anchor offset (scroll-padding-top) and the hero's top padding are
    // both derived from this, so it must track the real rendered height.
    // ------------------------------------------------------
    function syncNavHeight() {
      if (!navbar) return;
      document.documentElement.style.setProperty("--nav-h", navbar.offsetHeight + "px");
    }
    syncNavHeight();
    window.addEventListener("load", syncNavHeight);

    // ------------------------------------------------------
    // Mobile drawer
    // ------------------------------------------------------
    // Stagger index for the drawer's slide-in.
    navLinks.forEach(function (link, i) {
      link.style.setProperty("--i", i);
    });

    function isMenuOpen() {
      return navbar.classList.contains("menu-open");
    }

    function openMenu() {
      // A transformed .navbar would become the containing block for the
      // drawer (position: fixed), so make sure it is not translated away.
      navbar.classList.remove("is-hidden");
      navbar.classList.add("menu-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Tutup menu navigasi");
      document.body.classList.add("nav-lock");
      if (navBackdrop) {
        navBackdrop.hidden = false;
        // Next frame, so the fade-in transition actually runs.
        requestAnimationFrame(function () {
          navBackdrop.classList.add("is-open");
        });
      }
    }

    function closeMenu() {
      if (!isMenuOpen()) return;
      navbar.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Buka menu navigasi");
      document.body.classList.remove("nav-lock");
      if (navBackdrop) {
        navBackdrop.classList.remove("is-open");
        window.setTimeout(function () {
          if (!isMenuOpen()) navBackdrop.hidden = true;
        }, 350);
      }
    }

    if (navToggle) {
      navToggle.addEventListener("click", function () {
        if (isMenuOpen()) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeMenu);
    }

    // Any link inside the drawer (nav items and the WhatsApp/phone CTAs)
    // closes it after the tap.
    if (navMenu) {
      navMenu.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMenu();
      });
    }

    // Rotating the phone to landscape can cross the breakpoint while the
    // drawer is open — drop the scroll lock so the page stays usable.
    window.addEventListener("resize", function () {
      syncNavHeight();
      if (window.innerWidth > MOBILE_BP) closeMenu();
    });

    // ------------------------------------------------------
    // Scroll behaviour: background, auto-hide, FAB, scroll hint
    // ------------------------------------------------------
    var lastY = window.scrollY;
    var ticking = false;

    function onScrollFrame() {
      var y = window.scrollY;

      navbar.classList.toggle("is-scrolled", y > 24);
      document.body.classList.toggle("is-scrolled-past", y > 80);

      // Auto-hide only on phones, and only well below the hero, so the
      // header never flickers during short scrolls or anchor jumps.
      if (window.innerWidth <= MOBILE_BP && !isMenuOpen()) {
        var goingDown = y > lastY + 6;
        var goingUp = y < lastY - 6;
        if (goingDown && y > 320) {
          navbar.classList.add("is-hidden");
        } else if (goingUp) {
          navbar.classList.remove("is-hidden");
        }
      } else {
        navbar.classList.remove("is-hidden");
      }

      if (fabWa) {
        // On phones the WhatsApp button is the primary conversion path, so
        // it appears early; on desktop only after the hero has passed.
        var trigger = window.innerWidth <= MOBILE_BP ? 260 : window.innerHeight * 0.85;
        fabWa.classList.toggle("is-visible", y > trigger);
      }

      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScrollFrame);
      }
    }

    onScrollFrame();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ------------------------------------------------------
    // Scrollspy — highlights the section currently in view
    // ------------------------------------------------------
    var sections = navLinks
      .map(function (link) {
        var id = link.getAttribute("href");
        return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            navLinks.forEach(function (link) {
              link.classList.toggle(
                "is-active",
                link.getAttribute("href") === "#" + entry.target.id
              );
            });
          });
        },
        // Band across the upper-middle of the viewport: a section counts as
        // "current" once its top reaches roughly a third of the screen.
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
      );
      sections.forEach(function (section) {
        spy.observe(section);
      });
    }

    // ------------------------------------------------------
    // Reveal on scroll
    // ------------------------------------------------------
    var revealSelectors = [
      ".section-head",
      ".about-copy",
      ".vismis-block",
      ".ticket-strip-item",
      ".service-card",
      ".product-item",
      ".why-photos",
      ".why-reason",
      ".gallery-item",
      ".contact-card",
      ".contact-actions",
      ".contact-motto"
    ];
    var revealTargets = [];
    revealSelectors.forEach(function (selector) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
        revealTargets.push(el);
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      // No animation: show everything as-is.
      revealTargets.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      revealTargets.forEach(function (el) {
        el.classList.add("reveal");
      });

      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );

      // Siblings inside one group fade in one after another.
      var groups = document.querySelectorAll(
        ".ticket-strip, .service-list, .product-grid, .why-reasons, .gallery-grid, .contact-grid, .vismis"
      );
      Array.prototype.forEach.call(groups, function (group) {
        Array.prototype.forEach.call(group.children, function (child, i) {
          if (child.classList.contains("reveal")) {
            child.style.setProperty("--i", Math.min(i, 5));
          }
        });
      });

      revealTargets.forEach(function (el) {
        revealObserver.observe(el);
      });
    }

    // ------------------------------------------------------
    // Hero stat count-up
    // ------------------------------------------------------
    var counters = document.querySelectorAll(".hero-stat b[data-count]");
    Array.prototype.forEach.call(counters, function (el) {
      // Years are printed as-is — counting up to 2017 reads like a glitch.
      if (reduceMotion || el.dataset.plain === "true") return;

      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || "";
      if (isNaN(target)) return;

      var duration = 1100;
      var startedAt = null;
      // The real figure stays in the markup until the first frame actually
      // runs — zeroing it up front leaves "0" on screen if rAF is delayed.

      var done = false;

      function step(now) {
        if (startedAt === null) startedAt = now;
        var progress = Math.min((now - startedAt) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          done = true;
        }
      }
      window.setTimeout(function () {
        requestAnimationFrame(step);
      }, 700);
      // Safety net: if rAF stalls (background tab, throttling), never leave
      // a visitor looking at "0+".
      window.setTimeout(function () {
        if (!done) el.textContent = target + suffix;
      }, 3000);
    });

    // ------------------------------------------------------
    // Gallery lightbox
    // ------------------------------------------------------
    var galleryItems = Array.prototype.slice.call(
      document.querySelectorAll("#galleryGrid .gallery-item")
    );
    var lightbox = document.getElementById("lightbox");

    if (lightbox && galleryItems.length) {
      var lbImage = document.getElementById("lbImage");
      var lbTitle = document.getElementById("lbTitle");
      var lbCounter = document.getElementById("lbCounter");
      var lbClose = document.getElementById("lbClose");
      var lbPrev = document.getElementById("lbPrev");
      var lbNext = document.getElementById("lbNext");
      var currentIndex = 0;
      var lastFocused = null;

      var slides = galleryItems.map(function (item) {
        var img = item.querySelector("img");
        var caption = item.querySelector(".gallery-caption");
        return {
          src: img ? img.getAttribute("src") : "",
          alt: img ? img.getAttribute("alt") : "",
          caption: caption ? caption.textContent.trim() : ""
        };
      });

      function render(index) {
        var slide = slides[index];
        currentIndex = index;
        lbImage.setAttribute("src", slide.src);
        lbImage.setAttribute("alt", slide.alt);
        lbTitle.textContent = slide.caption;
        lbCounter.textContent = index + 1 + " / " + slides.length;
      }

      function openLightbox(index) {
        lastFocused = document.activeElement;
        render(index);
        lightbox.hidden = false;
        document.body.classList.add("modal-open");
        requestAnimationFrame(function () {
          lightbox.classList.add("is-open");
        });
        lbClose.focus();
      }

      function closeLightbox() {
        lightbox.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        window.setTimeout(function () {
          lightbox.hidden = true;
          lbImage.removeAttribute("src");
        }, 300);
        if (lastFocused) lastFocused.focus();
      }

      function move(step) {
        render((currentIndex + step + slides.length) % slides.length);
      }

      galleryItems.forEach(function (item, index) {
        item.addEventListener("click", function () {
          openLightbox(index);
        });
      });

      lbClose.addEventListener("click", closeLightbox);
      lbPrev.addEventListener("click", function () { move(-1); });
      lbNext.addEventListener("click", function () { move(1); });

      // Tap the dim area to dismiss.
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
      });

      // Swipe between photos on touch screens.
      var touchStartX = null;
      lightbox.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      lightbox.addEventListener("touchend", function (e) {
        if (touchStartX === null) return;
        var deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 45) move(deltaX < 0 ? 1 : -1);
        touchStartX = null;
      }, { passive: true });

      document.addEventListener("keydown", function (e) {
        if (lightbox.hidden) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") move(-1);
        if (e.key === "ArrowRight") move(1);
        // Keep tabbing inside the dialog while it is open.
        if (e.key === "Tab") {
          var focusables = [lbClose, lbPrev, lbNext];
          var pos = focusables.indexOf(document.activeElement);
          e.preventDefault();
          var nextPos = e.shiftKey ? pos - 1 : pos + 1;
          focusables[(nextPos + focusables.length) % focusables.length].focus();
        }
      });
    }

    // Escape also closes the drawer.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMenuOpen()) {
        closeMenu();
        navToggle.focus();
      }
    });

    // ------------------------------------------------------
    // Current year in footer
    // ------------------------------------------------------
    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  });
})();
