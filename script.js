const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const isTouch = window.matchMedia("(pointer: coarse)").matches;

/* ---------------------------------------
   INTRO / LOADING EXPERIENCE
--------------------------------------- */

const loader = $("#loader");
const loaderCount = $("#loader-count");
const loaderProgress = $("#loader-progress");

let loadValue = 0;

const loaderInterval = setInterval(() => {
  loadValue = Math.min(loadValue + Math.floor(Math.random() * 13) + 5, 100);

  if (loaderCount) loaderCount.textContent = String(loadValue).padStart(2, "0");
  if (loaderProgress) loaderProgress.style.width = `${loadValue}%`;

  if (loadValue >= 100) {
    clearInterval(loaderInterval);

    setTimeout(() => {
      loader?.classList.add("done");
      document.body.classList.add("site-ready");
      revealObserver?.observe(document.body);
    }, 350);
  }
}, 75);

/* ---------------------------------------
   CUSTOM CURSOR
--------------------------------------- */

if (!isTouch) {
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (dot) {
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;

    if (ring) {
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  const interactiveElements = "a, button, [role='button'], .project-card";

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest(interactiveElements)) {
      ring?.classList.add("hovering");
    }
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest(interactiveElements)) {
      ring?.classList.remove("hovering");
    }
  });
}

/* ---------------------------------------
   NAVIGATION
--------------------------------------- */

const menuTrigger = $("#menu-trigger");
const navigation = $("#navigation");

function closeMenu() {
  menuTrigger?.setAttribute("aria-expanded", "false");
  navigation?.classList.remove("open");
  navigation?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  const isOpen = menuTrigger?.getAttribute("aria-expanded") === "true";

  menuTrigger?.setAttribute("aria-expanded", String(!isOpen));
  navigation?.classList.toggle("open", !isOpen);
  navigation?.setAttribute("aria-hidden", String(isOpen));
  document.body.classList.toggle("menu-open", !isOpen);
}

menuTrigger?.addEventListener("click", toggleMenu);

$$("[data-nav-close]").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeProject();
    hideSecret();
  }
});

/* ---------------------------------------
   SCROLL REVEALS
--------------------------------------- */

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -35px 0px",
  },
);

$$(".reveal").forEach((element) => revealObserver.observe(element));

/* ---------------------------------------
   PAGE SCROLL PROGRESS
--------------------------------------- */

const progressFill = $("#page-progress-fill");

function updatePageProgress() {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

  if (progressFill) {
    progressFill.style.width = `${Math.min(progress, 100)}%`;
  }
}

window.addEventListener("scroll", updatePageProgress, { passive: true });
updatePageProgress();

/* ---------------------------------------
   MAGNETIC INTERACTIONS
--------------------------------------- */

if (!isTouch && !reducedMotion) {
  $$(".magnetic").forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      element.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });

    element.addEventListener("mouseleave", () => {
      element.style.transform = "";
    });
  });
}

/* ---------------------------------------
   PROJECT EXHIBITIONS
--------------------------------------- */

const projectModal = $("#project-modal");
const modalContent = $("#modal-content");
const modalClose = $("#modal-close");

const projectDetails = {
  albanian: {
    category: "CONTRIBUTION / VISUAL DESIGN",
    title: "Albanian <em>Ice Cream.</em>",
    description:
      "A contribution to the visual identity of a neighbourhood ice cream business. The work involved exploring its visual direction and creating branding and menu design that helped give the business a more recognisable personality.",
    details: [
      {
        heading: "The contribution",
        text: "Logo and visual identity exploration, alongside menu design. A hands-on creative contribution to an existing small business.",
      },
      {
        heading: "The thinking",
        text: "Finding a visual balance between playful energy, a distinctive identity and a brand that feels memorable.",
      },
    ],
    note: "ROLE: VISUAL DESIGN CONTRIBUTION. This is a presentation of work contributed to the business, not a claim of ownership.",
  },

  stockroom: {
    category: "CONCEPT / PRODUCT EXPLORATION",
    title: "Stockroom<span>.</span>",
    description:
      "An idea for a simple stock and sales estimation tool inspired by the everyday operations of a small business. The underlying question: how can useful information become easier to understand and act on?",
    details: [
      {
        heading: "The problem space",
        text: "Stock quantities, product movement and sales figures can become difficult to follow when information is scattered or tracked manually.",
      },
      {
        heading: "The exploration",
        text: "Thinking through a practical interface that could make inventory and sales information easier to see. This is a concept exploration, not a completed or deployed product.",
      },
    ],
    note: "STATUS: CONCEPT / EXPLORATION. The presentation describes the idea and its intended direction, not a finished application.",
  },
};

function openProject(key) {
  const project = projectDetails[key];
  if (!project || !projectModal || !modalContent) return;

  const detailMarkup = project.details
    .map(
      (detail) => `
    <div>
      <h3>${detail.heading}</h3>
      <p>${detail.text}</p>
    </div>
  `,
    )
    .join("");

  modalContent.innerHTML = `
    <span class="modal-kicker">${project.category}</span>
    <h2 id="modal-title">${project.title}</h2>
    <p class="modal-description">${project.description}</p>
    <div class="modal-detail-grid">${detailMarkup}</div>
    <div class="modal-disclaimer">${project.note}</div>
  `;

  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose?.focus();
}

function closeProject() {
  projectModal?.classList.remove("open");
  projectModal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

$$("[data-project]").forEach((card) => {
  card.addEventListener("click", () => {
    openProject(card.dataset.project);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject(card.dataset.project);
    }
  });
});

modalClose?.addEventListener("click", closeProject);

projectModal?.addEventListener("click", (event) => {
  if (event.target === projectModal) {
    closeProject();
  }
});

/* ---------------------------------------
   SECRET DISCOVERY
   Type A D E S H anywhere on the page.
--------------------------------------- */

const secretMessage = $("#secret-message");
const secretClose = $("#secret-close");

let secretInput = "";
let secretTimeout;

function showSecret() {
  secretMessage?.classList.add("visible");
}

function hideSecret() {
  secretMessage?.classList.remove("visible");
}

secretClose?.addEventListener("click", hideSecret);

document.addEventListener("keydown", (event) => {
  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey)
    return;

  if (document.activeElement?.matches("input, textarea")) return;

  secretInput = (secretInput + event.key.toLowerCase()).slice(-5);

  if (secretInput === "adesh") {
    showSecret();
    secretInput = "";
  }
});

/* ---------------------------------------
   GENERATIVE 3D ART
   Three.js is loaded dynamically.
   A canvas fallback is used if unavailable.
--------------------------------------- */

const artCanvas = $("#art-canvas");

async function createThreeArtwork() {
  if (!artCanvas) return;

  try {
    const THREE =
      await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({
      canvas: artCanvas,
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.TorusKnotGeometry(1.2, 0.33, 220, 18, 2, 5);

    const material = new THREE.MeshStandardMaterial({
      color: 0x9c674f,
      metalness: 0.76,
      roughness: 0.3,
      wireframe: false,
    });

    const sculpture = new THREE.Mesh(geometry, material);
    group.add(sculpture);

    const wireGeometry = new THREE.TorusKnotGeometry(
      1.22,
      0.335,
      120,
      10,
      2,
      5,
    );

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xe0c6a9,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });

    const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
    group.add(wireframe);

    const innerGeometry = new THREE.IcosahedronGeometry(0.42, 2);

    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0xddd4c4,
      metalness: 0.85,
      roughness: 0.22,
      wireframe: true,
    });

    const innerObject = new THREE.Mesh(innerGeometry, innerMaterial);
    group.add(innerObject);

    const ambient = new THREE.AmbientLight(0xc5b8a6, 1.25);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xd4a07d, 35);
    keyLight.position.set(3, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x8a786b, 18);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    const particleCount = 350;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.3 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);

      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);

      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc4a78c,
      size: 0.018,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);

    scene.add(particles);

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = (event.clientX / window.innerWidth - 0.5) * 0.7;
        targetY = (event.clientY / window.innerHeight - 0.5) * 0.5;
      },
      { passive: true },
    );

    const resize = () => {
      const rect = artCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(artCanvas);

    let animationFrame;
    const clock = new THREE.Clock();

    function animate() {
      animationFrame = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;

      if (!reducedMotion) {
        group.rotation.y = elapsed * 0.12 + pointerX;
        group.rotation.x = Math.sin(elapsed * 0.16) * 0.22 + pointerY;
        group.rotation.z = Math.sin(elapsed * 0.09) * 0.12;

        innerObject.rotation.x = elapsed * 0.16;
        innerObject.rotation.y = -elapsed * 0.2;

        particles.rotation.y = elapsed * 0.018;
        particles.rotation.x = Math.sin(elapsed * 0.05) * 0.08;
      }

      renderer.render(scene, camera);
    }

    animate();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
      } else {
        animate();
      }
    });
  } catch (error) {
    console.warn("3D artwork unavailable. Loading visual fallback.", error);
    createFallbackArtwork();
  }
}

/* ---------------------------------------
   FALLBACK PARTICLE ART
--------------------------------------- */

function createFallbackArtwork() {
  if (!artCanvas) return;

  const ctx = artCanvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let frame = 0;
  let pointer = { x: -1000, y: -1000 };

  const resize = () => {
    const rect = artCanvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);

    width = rect.width;
    height = rect.height;

    artCanvas.width = width * ratio;
    artCanvas.height = height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.1,
    }));
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      const rect = artCanvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    },
    { passive: true },
  );

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(artCanvas);
  resize();

  function draw() {
    requestAnimationFrame(draw);
    if (document.hidden) return;

    frame += 0.006;

    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * 0.25;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(frame * 0.15);

    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        radius + i * 24,
        radius * 0.72 + i * 17,
        i * 0.55 + frame * 0.2,
        0,
        Math.PI * 2,
      );

      ctx.strokeStyle = `rgba(189,137,103,${0.32 - i * 0.06})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();

    particles.forEach((particle) => {
      const driftX = Math.sin(frame + particle.phase) * 8;
      const driftY = Math.cos(frame * 0.7 + particle.phase) * 8;

      const x = particle.x + driftX;
      const y = particle.y + driftY;

      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let pushX = 0;
      let pushY = 0;

      if (distance < 110 && distance > 0) {
        const force = (110 - distance) / 110;
        pushX = (dx / distance) * force * 22;
        pushY = (dy / distance) * force * 22;
      }

      ctx.beginPath();
      ctx.arc(x + pushX, y + pushY, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(215,190,163,0.7)";
      ctx.fill();
    });
  }

  draw();
}

createThreeArtwork();

/* ---------------------------------------
   FOOTER YEAR
--------------------------------------- */

const footerYear = $(".footer-bottom span");

if (footerYear) {
  footerYear.textContent = `© ADESH ${new Date().getFullYear()}`;
}

/* ---------------------------------------
   THE EXPERIENCE IS READY
--------------------------------------- */

console.info(
  "%cA little curiosity goes a long way.",
  "color:#bd8967;font-family:Georgia;font-size:15px;",
);

console.info(
  "%cYou found the developer console. There is nothing to fix here. Keep exploring.",
  "color:#969187;font-family:monospace;font-size:10px;",
);
