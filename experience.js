/* ADESH / EXPERIENCE INTERACTIONS
   Progressive enhancements: safe when motion, pointer, or observers are limited.
*/
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  const init = () => {
    const hero = document.querySelector(".hero");
    const cards = document.querySelectorAll(".project-card");

    if (!reduceMotion && !coarsePointer && hero) {
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty("--pointer-x", x + "%");
        hero.style.setProperty("--pointer-y", y + "%");
      }, { passive: true });
    }

    if (!reduceMotion && !coarsePointer) {
      cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          const rotateY = (x - 0.5) * 5;
          const rotateX = (0.5 - y) * 5;

          card.style.setProperty("--card-x", (x * 100) + "%");
          card.style.setProperty("--card-y", (y * 100) + "%");
          card.style.setProperty("--tilt-x", rotateY.toFixed(2) + "deg");
          card.style.setProperty("--tilt-y", rotateX.toFixed(2) + "deg");
          card.style.transform =
            "perspective(1100px) rotateX(" + rotateX.toFixed(2) +
            "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-4px)";
        }, { passive: true });

        const reset = () => {
          card.style.transform = "";
          card.style.removeProperty("--tilt-x");
          card.style.removeProperty("--tilt-y");
        };

        card.addEventListener("pointerleave", reset);
        card.addEventListener("blur", reset, true);
      });
    }

    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll('.navigation-links a[href^="#"]');

    if ("IntersectionObserver" in window && sections.length && navLinks.length) {
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const current = "#" + entry.target.id;

          navLinks.forEach((link) => {
            if (link.getAttribute("href") === current) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

      sections.forEach((section) => navObserver.observe(section));
    }

    document.documentElement.classList.add("experience-ready");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
