/* =========================================================
   ADESH® — A WORLD IN PROGRESS
   Main interaction engine
========================================================= */

const CONFIG = {
  cursorEnabled: true,
  sculptureEnabled: true,
  revealThreshold: 0.12,
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

/* =========================================================
   01. INITIALISATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initialiseLoader();
  initialiseNavigation();
  initialiseHeader();
  initialiseCursor();
  initialiseRevealAnimations();
  initialiseSmoothLinks();
  initialiseYear();
  initialiseActiveNavigation();
  initialiseSculpture();
  initialiseHoverEffects();
  initialiseEasterEgg();
  initialiseArchiveInteractions();
});

/* =========================================================
   02. LOADING SCREEN
========================================================= */

function initialiseLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  let hidden = false;

  function hideLoader() {
    if (hidden) return;
    hidden = true;

    loader.classList.add("is-hidden");
    document.body.classList.add("page-ready");

    setTimeout(() => loader.remove(), 1000);
  }

  window.addEventListener("load", hideLoader, { once: true });

  // Never trap visitors behind the loader.
  setTimeout(hideLoader, 3500);
}

/* =========================================================
   03. MOBILE NAVIGATION
========================================================= */

function initialiseNavigation() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");

  if (!toggle || !nav) return;

  const navLinks = nav.querySelectorAll("a");

  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    nav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
    document.body.classList.add("menu-open");
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

/* =========================================================
   04. HEADER SCROLL STATE
========================================================= */

function initialiseHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 35);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;

      requestAnimationFrame(updateHeader);
      ticking = true;
    },
    { passive: true },
  );

  updateHeader();
}

/* =========================================================
   05. CUSTOM CURSOR
========================================================= */

function initialiseCursor() {
  if (!CONFIG.cursorEnabled || isTouchDevice) return;

  const dot = document.querySelector(".cursor-dot");
  const outline = document.querySelector(".cursor-outline");

  if (!dot || !outline) return;

  document.body.classList.add("cursor-active");

  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;
  let animationFrame;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function animateCursor() {
    outlineX += (mouseX - outlineX) * 0.16;
    outlineY += (mouseY - outlineY) * 0.16;

    outline.style.left = `${outlineX}px`;
    outline.style.top = `${outlineY}px`;

    animationFrame = requestAnimationFrame(animateCursor);
  }

  animateCursor();

  const interactiveElements = document.querySelectorAll(
    "a, button, .territory-card, .observation, .lab-card, .archive-entry",
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      document.body.classList.add("cursor-hover");
    });

    element.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-hover");
    });
  });

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    outline.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    dot.style.opacity = "1";
    outline.style.opacity = "1";
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else {
      animateCursor();
    }
  });
}

/* =========================================================
   06. SCROLL REVEAL
========================================================= */

function initialiseRevealAnimations() {
  const revealSelectors = [
    ".section-heading",
    ".manifesto-content",
    ".principle",
    ".territory-card",
    ".project",
    ".case-study",
    ".lab-card",
    ".impossible-item",
    ".observation",
    ".capability-group",
    ".archive-entry",
    ".journey-content",
    ".contact-content",
  ];

  const elements = document.querySelectorAll(revealSelectors.join(","));

  elements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.transitionDelay = `${(index % 4) * 70}ms`;
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: CONFIG.revealThreshold,
      rootMargin: "0px 0px -35px 0px",
    },
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    observer.observe(element);
  });
}

/* =========================================================
   07. SMOOTH INTERNAL LINKS
========================================================= */

function initialiseSmoothLinks() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      let target;

      try {
        target = document.querySelector(targetId);
      } catch {
        return;
      }

      if (!target) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      history.replaceState(null, "", targetId);
    });
  });
}

/* =========================================================
   08. CURRENT YEAR
========================================================= */

function initialiseYear() {
  const year = document.getElementById("currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

/* =========================================================
   09. ACTIVE NAVIGATION
========================================================= */

function initialiseActiveNavigation() {
  const links = [...document.querySelectorAll(".main-nav a[href^='#']")];

  if (!links.length || !("IntersectionObserver" in window)) return;

  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", isActive);

          if (isActive) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-25% 0px -65% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

/* =========================================================
   10. THREE.JS SCULPTURE
========================================================= */

async function initialiseSculpture() {
  const canvas = document.getElementById("universeCanvas");

  if (!canvas || !CONFIG.sculptureEnabled) return;

  try {
    const THREE = await import("three");
    createThreeSculpture(THREE, canvas);
  } catch (error) {
    console.warn("Three.js unavailable. Loading fallback artwork.", error);
    createStaticArtwork(canvas);
  }
}

function createThreeSculpture(THREE, canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 8.8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isTouchDevice,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const sculpture = new THREE.Group();
  scene.add(sculpture);

  const geometries = [];
  const materials = [];

  function trackGeometry(geometry) {
    geometries.push(geometry);
    return geometry;
  }

  const darkMetal = new THREE.MeshPhysicalMaterial({
    color: 0x29231f,
    metalness: 0.88,
    roughness: 0.27,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
    emissive: 0x281009,
    emissiveIntensity: 0.12,
  });

  const copperMetal = new THREE.MeshPhysicalMaterial({
    color: 0xa45b3e,
    metalness: 0.82,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
  });

  const ivoryMetal = new THREE.MeshStandardMaterial({
    color: 0xd8c7ad,
    metalness: 0.72,
    roughness: 0.3,
  });

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xc17b56,
    wireframe: true,
    transparent: true,
    opacity: 0.17,
  });

  materials.push(darkMetal, copperMetal, ivoryMetal, wireMaterial);

  // Main twisted metallic body.
  const coreGeometry = trackGeometry(
    new THREE.TorusKnotGeometry(1.12, 0.34, 220, 28, 2, 5),
  );

  const core = new THREE.Mesh(coreGeometry, darkMetal);
  core.rotation.set(0.35, 0.2, -0.25);
  sculpture.add(core);

  // Delicate wireframe layer.
  const wireCore = new THREE.Mesh(coreGeometry, wireMaterial);
  wireCore.scale.setScalar(1.012);
  wireCore.rotation.copy(core.rotation);
  sculpture.add(wireCore);

  // Inner copper form.
  const innerGeometry = trackGeometry(
    new THREE.TorusKnotGeometry(0.68, 0.055, 180, 12, 3, 4),
  );

  const innerForm = new THREE.Mesh(innerGeometry, copperMetal);
  innerForm.rotation.set(0.8, 0.25, 0.5);
  sculpture.add(innerForm);

  // Orbital rings.
  const orbitSpecs = [
    {
      radius: 2.05,
      tube: 0.012,
      material: copperMetal,
      x: 0.8,
      y: 0.2,
      z: 0.45,
    },
    {
      radius: 2.35,
      tube: 0.008,
      material: ivoryMetal,
      x: 1.35,
      y: 0.4,
      z: -0.5,
    },
    {
      radius: 1.82,
      tube: 0.009,
      material: copperMetal,
      x: 0.2,
      y: 1.15,
      z: 0.9,
    },
  ];

  const orbits = [];

  orbitSpecs.forEach((spec, index) => {
    const geometry = trackGeometry(
      new THREE.TorusGeometry(spec.radius, spec.tube, 8, 180),
    );

    const orbit = new THREE.Mesh(geometry, spec.material);

    orbit.rotation.set(spec.x, spec.y, spec.z);
    orbit.userData.baseRotation = orbit.rotation.clone();
    orbit.userData.speed = index % 2 === 0 ? 1 : -0.65;

    sculpture.add(orbit);
    orbits.push(orbit);
  });

  // Floating particles.
  const particleCount = isTouchDevice ? 180 : 320;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 2.15 + Math.random() * 1.15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);

    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);

    particlePositions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const particleGeometry = trackGeometry(new THREE.BufferGeometry());

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xc18a6c,
    size: 0.022,
    transparent: true,
    opacity: 0.68,
    sizeAttenuation: true,
    depthWrite: false,
  });

  materials.push(particleMaterial);

  const particles = new THREE.Points(particleGeometry, particleMaterial);

  sculpture.add(particles);

  // Atmospheric lighting.
  scene.add(new THREE.AmbientLight(0xd9c5ae, 0.65));

  const copperLight = new THREE.PointLight(0xc17b56, 75, 12);
  copperLight.position.set(3.5, 2.5, 4);
  scene.add(copperLight);

  const ivoryLight = new THREE.PointLight(0xe8dfd0, 48, 10);
  ivoryLight.position.set(-3, -1.5, 3);
  scene.add(ivoryLight);

  const backLight = new THREE.PointLight(0x8f3f29, 65, 10);
  backLight.position.set(0, 3, -3);
  scene.add(backLight);

  /* -----------------------------------------
     MOUSE AND TOUCH INTERACTION
  ----------------------------------------- */

  let targetX = 0;
  let targetY = 0;

  let currentX = 0;
  let currentY = 0;

  let dragOffsetX = 0;
  let dragOffsetY = 0;

  let dragVelocityX = 0;
  let dragVelocityY = 0;

  let isDragging = false;
  let previousPointerX = 0;
  let previousPointerY = 0;

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // Cursor position controls the sculpture's tilt.
    targetX = THREE.MathUtils.clamp((x - 0.5) * 2, -1, 1);
    targetY = THREE.MathUtils.clamp((y - 0.5) * 2, -1, 1);

    // Dragging adds a little rotational momentum.
    if (isDragging) {
      const deltaX = event.clientX - previousPointerX;
      const deltaY = event.clientY - previousPointerY;

      dragVelocityY += deltaX * 0.0025;
      dragVelocityX += deltaY * 0.0025;

      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
    }
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    isDragging = true;

    previousPointerX = event.clientX;
    previousPointerY = event.clientY;

    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }
  }

  function onPointerUp() {
    isDragging = false;
  }

  function onPointerLeave() {
    if (!isDragging) {
      targetX = 0;
      targetY = 0;
    }
  }

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);

  /* -----------------------------------------
     RESPONSIVE RESIZING
  ----------------------------------------- */

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.position.z = width < 600 ? 10.2 : 8.8;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  /* -----------------------------------------
     ANIMATION
  ----------------------------------------- */

  const clock = new THREE.Clock();

  let animationFrame = null;
  let isVisible = !document.hidden;
  let disposed = false;

  const baseRotationX = 0.35;
  const baseRotationY = 0.2;

  function render() {
    if (disposed || !isVisible) return;

    const elapsed = clock.getElapsedTime();

    // Smooth cursor tracking.
    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;

    // Smooth touch/mouse drag momentum.
    dragOffsetX += dragVelocityX;
    dragOffsetY += dragVelocityY;

    dragVelocityX *= 0.93;
    dragVelocityY *= 0.93;

    dragOffsetX *= 0.985;
    dragOffsetY *= 0.985;

    if (!prefersReducedMotion) {
      // The sculpture now has a stable resting position.
      // Cursor movement controls its orientation directly.
      const idleX = Math.sin(elapsed * 0.22) * 0.055;
      const idleY = elapsed * 0.11;

      sculpture.rotation.x =
        baseRotationX + idleX + currentY * 0.42 + dragOffsetX;

      sculpture.rotation.y =
        baseRotationY + idleY + currentX * 0.58 + dragOffsetY;

      sculpture.rotation.z = Math.sin(elapsed * 0.17) * 0.035;

      // Inner structure has its own motion.
      core.rotation.z = -0.25 + Math.sin(elapsed * 0.22) * 0.035;

      innerForm.rotation.y += 0.0015;
      innerForm.rotation.z = 0.5 + Math.sin(elapsed * 0.3) * 0.06;

      // Orbital movement.
      orbits.forEach((orbit, index) => {
        orbit.rotation.z += 0.0008 * orbit.userData.speed;

        orbit.rotation.x =
          orbit.userData.baseRotation.x +
          Math.sin(elapsed * 0.2 + index) * 0.035;
      });

      // Particle drift.
      particles.rotation.y -= 0.00035;
      particles.rotation.x = Math.sin(elapsed * 0.12) * 0.035;

      // Moving copper light.
      copperLight.position.x = 3.5 + Math.sin(elapsed * 0.35) * 0.5;
    } else {
      sculpture.rotation.x = baseRotationX + currentY * 0.42;
      sculpture.rotation.y = baseRotationY + currentX * 0.58;
    }

    renderer.render(scene, camera);

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  function handleVisibility() {
    isVisible = !document.hidden;

    if (!isVisible) {
      cancelAnimationFrame(animationFrame);
      return;
    }

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(render);
    } else {
      renderer.render(scene, camera);
    }
  }

  document.addEventListener("visibilitychange", handleVisibility);

  if (isVisible) {
    if (!prefersReducedMotion) {
      render();
    } else {
      renderer.render(scene, camera);
    }
  }

  /* -----------------------------------------
     CLEANUP
  ----------------------------------------- */

  function dispose() {
    if (disposed) return;
    disposed = true;

    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();

    document.removeEventListener("visibilitychange", handleVisibility);

    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("pointerleave", onPointerLeave);

    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());

    renderer.dispose();
  }

  window.addEventListener("pagehide", dispose, { once: true });
}

/* =========================================================
   11. FALLBACK ARTWORK
   Used if WebGL or Three.js is unavailable.
========================================================= */

function createStaticArtwork(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const container = canvas.parentElement;
  if (!container) return;

  let width = 0;
  let height = 0;

  function resize() {
    const rect = container.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    drawArtwork();
  }

  function drawArtwork() {
    context.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.28;

    for (let i = 0; i < 5; i++) {
      context.beginPath();

      context.ellipse(
        cx,
        cy,
        radius + i * 22,
        radius * 0.48 + i * 22,
        i * 0.35,
        0,
        Math.PI * 2,
      );

      context.strokeStyle = `rgba(193,123,86,${0.35 - i * 0.05})`;
      context.lineWidth = 1;
      context.stroke();
    }

    context.save();
    context.translate(cx, cy);
    context.rotate(Math.PI / 4);

    context.strokeStyle = "rgba(214,161,124,.8)";
    context.lineWidth = 1;
    context.strokeRect(-radius * 0.5, -radius * 0.5, radius, radius);

    context.restore();

    const glow = context.createRadialGradient(cx, cy, 0, cx, cy, radius);

    glow.addColorStop(0, "rgba(193,123,86,.2)");
    glow.addColorStop(1, "rgba(193,123,86,0)");

    context.fillStyle = glow;
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.fill();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);

  resize();
}

/* =========================================================
   12. HOVER EFFECTS
========================================================= */

function initialiseHoverEffects() {
  if (isTouchDevice || prefersReducedMotion) return;

  const cards = document.querySelectorAll(
    ".territory-card, .lab-card, .observation",
  );

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      card.style.setProperty("--pointer-x", `${x * 100}%`);
      card.style.setProperty("--pointer-y", `${y * 100}%`);
    });
  });

  const heroArt = document.getElementById("heroArt");

  if (heroArt) {
    heroArt.addEventListener("mousemove", (event) => {
      const rect = heroArt.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      heroArt.style.setProperty(
        "--hero-pointer-x",
        `${(x / rect.width - 0.5) * 15}px`,
      );

      heroArt.style.setProperty(
        "--hero-pointer-y",
        `${(y / rect.height - 0.5) * 15}px`,
      );
    });

    heroArt.addEventListener("mouseleave", () => {
      heroArt.style.setProperty("--hero-pointer-x", "0px");
      heroArt.style.setProperty("--hero-pointer-y", "0px");
    });
  }
}

/* =========================================================
   13. ARCHIVE INTERACTIONS
========================================================= */

function initialiseArchiveInteractions() {
  const entries = document.querySelectorAll(".archive-entry");

  entries.forEach((entry) => {
    entry.setAttribute("tabindex", "0");
    entry.setAttribute("role", "article");
  });
}

/* =========================================================
   14. HIDDEN EASTER EGG
   Type A D E S H anywhere on the page.
========================================================= */

function initialiseEasterEgg() {
  const secret = "ADESH";
  let typed = "";
  let resetTimeout;

  document.addEventListener("keydown", (event) => {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1
    )
      return;

    const activeElement = document.activeElement;

    if (
      activeElement &&
      (["INPUT", "TEXTAREA"].includes(activeElement.tagName) ||
        activeElement.isContentEditable)
    )
      return;

    typed += event.key.toUpperCase();
    typed = typed.slice(-secret.length);

    clearTimeout(resetTimeout);

    if (typed === secret) {
      activateSecret();
      typed = "";
    }

    resetTimeout = setTimeout(() => {
      typed = "";
    }, 1800);
  });
}

function activateSecret() {
  if (document.querySelector(".secret-overlay")) return;

  const overlay = document.createElement("div");

  overlay.className = "secret-overlay";

  overlay.innerHTML = `
    <div class="secret-content">
      <span class="mono-label">A SMALL DISCOVERY</span>
      <h2>There is more<br><em>to explore.</em></h2>
      <p>Curiosity is a door that keeps opening.</p>
      <button type="button" class="secret-close">
        RETURN TO THE WORLD
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector(".secret-close");

  closeButton.addEventListener("click", () => {
    overlay.classList.add("closing");

    setTimeout(() => overlay.remove(), 450);
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeButton.click();
    }
  });

  if (!document.getElementById("secretOverlayStyles")) {
    const style = document.createElement("style");
    style.id = "secretOverlayStyles";

    style.textContent = `
      .secret-overlay {
        position: fixed;
        inset: 0;
        z-index: 3000;
        display: grid;
        place-items: center;
        padding: 25px;
        background: rgba(17,17,15,.97);
        animation: secretIn .5s ease forwards;
      }

      .secret-content {
        max-width: 650px;
        text-align: center;
      }

      .secret-content h2 {
        margin-top: 25px;
        font-family: Georgia, serif;
        font-size: clamp(45px, 9vw, 90px);
        line-height: 1;
        letter-spacing: -.06em;
        font-weight: 400;
      }

      .secret-content h2 em {
        color: #c17b56;
      }

      .secret-content p {
        margin-top: 25px;
        color: #969187;
      }

      .secret-close {
        margin-top: 40px;
        padding: 13px 20px;
        border: 1px solid #a34f36;
        background: transparent;
        color: #eeeae1;
        font: 10px monospace;
        letter-spacing: .1em;
        cursor: pointer;
      }

      .secret-close:hover {
        background: #a34f36;
      }

      .secret-overlay.closing {
        animation: secretOut .4s ease forwards;
      }

      @keyframes secretIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes secretOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .secret-overlay,
        .secret-overlay.closing {
          animation: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  closeButton.focus();
}

/* =========================================================
   15. CONSOLE SIGNATURE
========================================================= */

console.log(
  "%cADESH® — A WORLD IN PROGRESS.",
  "color:#c17b56;font-size:18px;font-weight:bold;",
);

console.log(
  "%cUnderstand deeply. Question relentlessly. Create beyond expectation.",
  "color:#969187;font-size:11px;",
);

/* =========================================================
   16. SECRET ROOM — LOGO DISCOVERY
   Click the ADESH® logo five times.
========================================================= */

(function initialiseSecretRoom() {
  const trigger = document.querySelector("[data-secret-trigger]");
  const room = document.getElementById("secretRoom");
  const closeButton = document.getElementById("closeSecretRoom");

  if (!trigger || !room || !closeButton) return;

  let clicks = 0;
  let resetTimer;

  function openRoom() {
    room.hidden = false;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeRoom() {
    room.hidden = true;
    document.body.style.overflow = "";
    trigger.focus();
  }

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    clicks++;

    clearTimeout(resetTimer);

    resetTimer = setTimeout(() => {
      clicks = 0;
    }, 1800);

    if (clicks >= 5) {
      clicks = 0;
      clearTimeout(resetTimer);
      openRoom();
    }
  });

  closeButton.addEventListener("click", closeRoom);

  room.addEventListener("click", (event) => {
    if (event.target.classList.contains("secret-room-backdrop")) {
      closeRoom();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !room.hidden) {
      closeRoom();
    }
  });
})();
