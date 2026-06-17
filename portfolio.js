/* ============================================================
   PORTFOLIO — MAIN SCRIPT
   Structure: Init → Orb Engine → Typography → Preloader →
              Scroll Snap → Nav Dock → Section Animations →
              Magnetic Tiles → Projects Module → FAQ Module →
              CTA Dock
   ============================================================ */


/* ── 1. INIT ──────────────────────────────────────────────── */
/* Register GSAP plugins and render Lucide icon set */

lucide.createIcons();
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);


/* ── 2. ORB ENGINE ────────────────────────────────────────── */
/* Controls the four SVG background orbs.
   Each section has a unique orb layout (blueprint).
   morphToBlueprint() transitions between them on scroll/nav click.
   initAmbientWander() adds a subtle floating drift on top. */

const blueprints = [
  // Sec 1 — Home: scattered asymmetric layout
  { orb0: { cx: 280, cy: 220, r: 240 }, orb1: { cx: 200, cy: 620, r: 230 }, orb2: { cx: 500, cy: 820, r: 250 }, orb3: { cx: 800, cy: 380, r: 280 } },
  // Sec 2 — Process: vertical pipeline cluster
  { orb0: { cx: 500, cy: 150, r: 220 }, orb1: { cx: 480, cy: 250, r: 180 }, orb2: { cx: 520, cy: 750, r: 200 }, orb3: { cx: 500, cy: 850, r: 240 } },
  // Sec 3 — Projects: symmetric four-corner grid
  { orb0: { cx: 250, cy: 250, r: 210 }, orb1: { cx: 750, cy: 250, r: 210 }, orb2: { cx: 250, cy: 750, r: 210 }, orb3: { cx: 750, cy: 750, r: 210 } },
  // Sec 4 — Stacks: right-side vertical stack
  { orb0: { cx: 850, cy: 150, r: 190 }, orb1: { cx: 800, cy: 400, r: 220 }, orb2: { cx: 850, cy: 650, r: 200 }, orb3: { cx: 780, cy: 900, r: 210 } },
  // Sec 5 — FAQ: exploded corner burst
  { orb0: { cx: 50,  cy: 50,  r: 320 }, orb1: { cx: 950, cy: 50,  r: 300 }, orb2: { cx: 50,  cy: 950, r: 300 }, orb3: { cx: 950, cy: 950, r: 350 } },
  // Sec 6 — CTA: converged centre cluster
  { orb0: { cx: 460, cy: 480, r: 260 }, orb1: { cx: 540, cy: 460, r: 240 }, orb2: { cx: 480, cy: 540, r: 250 }, orb3: { cx: 520, cy: 520, r: 270 } }
];

/* Snap orbs to their section-0 positions instantly on page load */
morphToBlueprint(0, 0);

/* Animates all four orbs to the target blueprint layout */
function morphToBlueprint(index, duration = 1.4) {
  const target = blueprints[index];
  for (let i = 0; i < 4; i++) {
    const orb = target[`orb${i}`];
    gsap.to(`#orb${i}`, {
      attr: { cx: orb.cx, cy: orb.cy, r: orb.r },
      duration,
      ease: "power2.out",
      overwrite: "auto" /* prevents animation conflicts on rapid nav clicks */
    });
  }
}

/* Adds a continuous gentle float to each orb — runs independently of morph */
function initAmbientWander() {
  for (let i = 0; i < 4; i++) {
    /* Each orb gets unique timing so they never move in sync */
    const wX = gsap.utils.random(25, 45);
    const wY = gsap.utils.random(25, 45);
    gsap.to(`#orb${i}`, { x: `+=${wX}`,       y: `+=${wY}`,       duration: gsap.utils.random(4, 7), repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(`#orb${i}`, { x: `-=${wX * 0.5}`, y: `-=${wY * 0.5}`, duration: gsap.utils.random(5, 8), repeat: -1, yoyo: true, ease: "sine.inOut" });
  }
}

initAmbientWander();


/* ── 3. TYPOGRAPHY — LETTER SPLITTER ─────────────────────── */
/* Wraps every character in .color-name in a <span> so GSAP
   can stagger-animate each letter individually on scroll */

gsap.utils.toArray(".color-name").forEach((el) => {
  el.innerHTML = el.textContent.split("").map(ch =>
    ch === " "
      ? `<span style="display:inline-block;width:0.28em">&nbsp;</span>`
      : `<span>${ch}</span>`
  ).join("");
});


/* ── 4. PRELOADER ─────────────────────────────────────────── */
/* Waits for all assets to load, then slides the loader off-screen
   and unlocks body scroll */

window.addEventListener("load", () => {
  /* Safety: if loader is still present after 8 s, force-dismiss it */
  const forceHide = setTimeout(() => {
    document.getElementById("loader").style.display = "none";
    document.body.style.overflowY = "auto";
  }, 8000);

  gsap.timeline()
    .to("#loader", { opacity: 0, y: "-100%", duration: 0.8, ease: "power3.inOut", delay: 0.5 })
    .set("body", { overflowY: "auto" })
    .call(() => clearTimeout(forceHide));
});


/* ── 5. SCROLL SNAP ───────────────────────────────────────── */
/* Locks scrolling to full-page section stops.
   isClickScrolling prevents the onUpdate handler from fighting
   a nav-click-triggered scroll mid-flight. */

let isClickScrolling = false;

ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  snap: { snapTo: 1 / 5, duration: 0.5, delay: 0.05, ease: "power1.out" },
  onUpdate: (self) => {
    if (isClickScrolling) return;
    const index = Math.round(self.progress * 5);
    updatePill(index);
    showDock(index);
    morphToBlueprint(index);
  }
});


/* ── 6. NAVIGATION DOCK ───────────────────────────────────── */
/* Handles: pill position, dock entrance animation, tooltips,
   click-to-scroll, and the Dynamic Island stretch on click */

const navItems = gsap.utils.toArray(".nav-item");

/* Moves the sliding pill to sit behind the active nav icon */
function updatePill(index) {
  const target = navItems[index];
  if (!target) return;
  gsap.to("#activePill", { x: target.offsetLeft - 12, duration: 0.4, ease: "power2.out" });
}

/* Slides the dock up from off-screen — fires once, on first scroll past sec 1 */
let dockVisible = false;
function showDock(index) {
  if (index >= 1 && !dockVisible) {
    dockVisible = true;
    gsap.to("#dockWrapper", { transform: "translateX(-50%) translateY(0px)", duration: 0.8, ease: "back.out(1.4)" });
  }
}

navItems.forEach((item) => {
  const tooltip = item.querySelector(".tooltip");
  const index   = parseInt(item.getAttribute("data-index"));

  /* Click: scroll to target section, trigger orb morph and dock stretch */
  item.addEventListener("click", () => {
    isClickScrolling = true;
    updatePill(index);
    showDock(index);
    morphToBlueprint(index, 1.1);

    gsap.to(window, {
      scrollTo: { y: index * window.innerHeight },
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => { isClickScrolling = false; }
    });

    /* Safety: release the lock after 1.5 s if onComplete never fires */
    setTimeout(() => { isClickScrolling = false; }, 1500);

    /* Dynamic Island elastic stretch on click */
    gsap.timeline()
      .to("#dockContainer", { scaleX: 1.18, scaleY: 0.88, duration: 0.15, ease: "power1.out" })
      .to("#dockContainer", { scaleX: 0.96, scaleY: 1.04, duration: 0.15, ease: "power2.out" })
      .to("#dockContainer", { scaleX: 1,    scaleY: 1,    duration: 0.30, ease: "elastic.out(1.2, 0.6)" });
  });

  /* Hover: fade tooltip in/out above the icon */
  item.addEventListener("mouseenter", () => gsap.to(tooltip, { opacity: 1, y: 0,  duration: 0.25, ease: "power2.out" }));
  item.addEventListener("mouseleave", () => gsap.to(tooltip, { opacity: 0, y: 10, duration: 0.20, ease: "power2.in"  }));
});

/* Recalculate pill position if window is resized (e.g. split-screen) */
window.addEventListener("resize", () => {
  const activeItem = navItems.find(i => i.classList.contains("active"));
  if (activeItem) updatePill(parseInt(activeItem.getAttribute("data-index")));
});


/* ── 7. SECTION ANIMATIONS ────────────────────────────────── */
/* Each section's heading letters blur-stagger in from the top-left
   when the section enters the viewport, and reverse on scroll back */

gsap.utils.toArray(".section").forEach((section) => {
  const letters = section.querySelectorAll(".color-name span");
  gsap.from(letters, {
    x: -60, y: -60, opacity: 0, filter: "blur(20px)", scale: 0.8,
    duration: 1.1, ease: "power3.out",
    stagger: { amount: 0.35, from: "start" },
    scrollTrigger: { trigger: section, start: "top 40%", toggleActions: "play reverse play reverse" }
  });
});


/* ── 8. MAGNETIC TILES ────────────────────────────────────── */
/* Every .tile (process cards, FAQ cards) follows the cursor with
   a subtle XY translate — snaps back elastically on mouse leave */

gsap.utils.toArray(".tile").forEach((tile) => {
  tile.addEventListener("mousemove", (e) => {
    const r  = tile.getBoundingClientRect();
    const tX = e.clientX - (r.left + r.width  / 2);
    const tY = e.clientY - (r.top  + r.height / 2);
    gsap.to(tile, { x: tX * 0.3, y: tY * 0.3, duration: 0.3, ease: "power2.out" });
  });

  tile.addEventListener("mouseleave", () => {
    gsap.to(tile, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  });
});


/* ── 9. PROJECTS MODULE ───────────────────────────────────── */

/* Project card data — add/edit entries here to update the section */
const projectsData = [
  {
    id: "proj-1",
    title: "Hate Speech Detection System",
    description: "High-performance transformer architecture designed to identify linguistic patterns via localised AI arrays.",
    liveUrl: "https://example.com/live1",
    gitUrl:  "https://github.com/user/hate-speech-detection",
    imageUrl: "./assets/images/hate-speech-project.webp" // Save image locally[cite: 1]
  },
  {
    id: "proj-2",
    title: "AI Payment Backend Engine",
    description: "Distributed transaction processing pipeline managing secure automated micro-settlements across edge clusters.",
    liveUrl: "https://example.com/live2",
    gitUrl:  "https://github.com/user/ai-payment-backend",
    imageUrl: "./assets/images/payment-engine-project.webp" // Save image locally[cite: 1]
  },
  {
    id: "proj-3",
    title: "UK Real Estate Automation Workflow",
    description: "Enterprise multi-threaded LLM scraper built to crawl, audit performance flaws, and generate immediate video analytics.",
    liveUrl: "https://example.com/live3",
    gitUrl:  "https://github.com/user/real-estate-workflow",
    imageUrl: "./assets/images/real-estate-project.webp" // Save image locally[cite: 1]
  }
];

/* Case study HTML content — keyed by project id */
const caseStudiesData = {
  "proj-1": `
    <h1>Deep Research: Hate Speech Detection</h1>
    <h3>1. EXECUTIVE OVERVIEW</h3>
    <p>An in-depth analysis looking into multi-modal toxic classification models optimised for rapid hardware setups...</p>
    <h3>2. NEURAL ARCHITECTURE DESIGN</h3>
    <p>Using a customised transformer pipeline to audit datasets, yielding significant accuracy boosts with reduced layer weights.</p>
  `,
  "proj-2": `
    <h1>Deep Research: AI Payment Backend Engine</h1>
    <h3>1. DISTRIBUTED ARCHITECTURE</h3>
    <p>How the settlement cluster isolates transaction states using high-throughput data layers to bypass race conditions.</p>
  `,
  "proj-3": `
    <h1>Deep Research: Real Estate Workflow</h1>
    <h3>1. AUTOMATION SCALING LIFECYCLE</h3>
    <p>Comprehensive engineering breakdown detailing headless browser pooling and localised multi-agent reasoning structures.</p>
  `
};

document.addEventListener("DOMContentLoaded", () => {

  /* ── 9a. Projects: DOM injection ──────────────────────────
     Builds sidebar tabs and preview slides from projectsData array */

  const sidebar      = document.getElementById("projectSidebarContainer");
  const track        = document.getElementById("projectTrack");
  const overlay      = document.getElementById("caseStudyOverlay");
  const scrollArea   = document.getElementById("caseStudyScrollContent");
  const closeBtn     = document.getElementById("closeCaseStudyBtn");

  if (sidebar && track) {
    projectsData.forEach((project, index) => {

      /* Sidebar tab */
      const tab = document.createElement("div");
      tab.className = `project-tab-item ${index === 0 ? "active" : ""}`;
      tab.setAttribute("data-id",    project.id);
      tab.setAttribute("data-index", index);
      tab.innerHTML = `
        <span style="font-family:monospace;opacity:0.4">[0${index + 1}]</span>
        <span>${project.title}</span>
      `;
      sidebar.appendChild(tab);

      /* Preview slide with gradient overlay on top of the project image */
      const slide = document.createElement("div");
      slide.className = "project-slide-item";
      slide.style.backgroundImage = `
        linear-gradient(to top, rgba(13,14,18,0.95) 30%, rgba(13,14,18,0.4) 100%),
        url('${project.imageUrl}')
      `;
      slide.innerHTML = `
        <div class="project-slide-content">
          <h2>${project.title}</h2>
          <p>${project.description}</p>
        </div>
        <div class="project-actions-row">
          <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">View Live</a>
          <a href="${project.gitUrl}"  target="_blank" rel="noopener noreferrer" class="btn-secondary">View Code</a>
          <button class="btn-case-study" data-id="${project.id}">Case Study</button>
        </div>
      `;
      track.appendChild(slide);
    });

    /* ── 9b. Projects: tab switching ─────────────────────── */
    let currentIndex = 0;
    const tabs = document.querySelectorAll(".project-tab-item");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const i = parseInt(tab.getAttribute("data-index"));
        if (i === currentIndex) return;

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentIndex = i;

        /* Slide the track to the selected project */
        gsap.to(track, { xPercent: -(i * 100), duration: 0.75, ease: "power4.out" });
      });
    });
  }

  /* ── 9c. Projects: case study modal ──────────────────────
     Opens the overlay and injects matching case study HTML */

     document.addEventListener("click", (e) => {
      if (!e.target?.classList.contains("btn-case-study")) return;
      const id   = e.target.getAttribute("data-id");
      const html = caseStudiesData[id] || `<h1>Research Pending</h1><p>Deep-dive logs are currently being processed.</p>`;
      
      /* FIXED: Wrapped data stream via DOMPurify to safely block XSS vectors[cite: 1, 4] */
      scrollArea.innerHTML = DOMPurify.sanitize(html); 
      overlay.classList.add("active");
    });

  const closeOverlay = () => overlay.classList.remove("active");
  closeBtn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });


  /* ── 10. FAQ MODULE ───────────────────────────────────────
     Adds 3D magnetic tilt to each FAQ card on mouse move.
     Snaps back with an elastic spring on mouse leave. */

  document.querySelectorAll(".faq-disclosure-node").forEach((node) => {
    node.addEventListener("mousemove", (e) => {
      const r  = node.getBoundingClientRect();
      const dX = e.clientX - (r.left + r.width  / 2);
      const dY = e.clientY - (r.top  + r.height / 2);

      /* pullFactor: max XY translation drift (px)
         tiltFactor: max rotation on each axis (deg) */
      const pull = 12, tilt = 4;
      const mX = (dX / (r.width  / 2)) * pull;
      const mY = (dY / (r.height / 2)) * pull;
      const rX = -(dY / (r.height / 2)) * tilt;
      const rY =  (dX / (r.width  / 2)) * tilt;

      /* Remove transition during active tracking so it follows instantly */
      node.style.transition = "background 0.3s ease, border-color 0.3s ease";
      node.style.transform  = `translate3d(${mX}px, ${mY}px, 0) rotateX(${rX}deg) rotateY(${rY}deg)`;
    });

    node.addEventListener("mouseleave", () => {
      /* Restore spring transition for the snap-back */
      node.style.transition = "background 0.3s ease, border-color 0.3s ease, transform 0.5s cubic-bezier(0.25,1,0.5,1)";
      node.style.transform  = "translate3d(0,0,0) rotateX(0deg) rotateY(0deg)";
    });
  });


  /* ── 11. CTA DOCK ─────────────────────────────────────────
     Manages the active highlight state on the decorative
     dock in the CTA section */

  document.querySelectorAll(".dock-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".dock-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });

});

/* ── 12. NATIVE BACKEND TRANSMISSION INTERFACE ── */
document.getElementById("secureContactForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById("submitBtn");
  const feedback = document.getElementById("formStatusMessage");
  
  // Instant honeypot check to boot automated spambots
  if (document.getElementById("formHoneypot").value !== "") {
    console.warn("Automated malicious telemetry input rejected.");
    return;
  }
  
  // Transition UI into loading state
  submitBtn.disabled = true;
  submitBtn.innerText = "Transmitting Payload...";
  feedback.style.color = "var(--c-muted)";
  feedback.innerText = "Establishing uplink connection to runtime instance...";

  const payload = {
    name: document.getElementById("formName").value,
    email: document.getElementById("formEmail").value,
    message: document.getElementById("formMessage").value
  };

  try {
    // While testing locally, change this domain to http://localhost:10000/api/v1/secure-contact
    // Once deployed, use your live Render URL (e.g., https://your-app.onrender.com/api/v1/secure-contact)
    const response = await fetch("http://localhost:10000/api/v1/secure-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      feedback.style.color = "var(--c-accent)";
      feedback.innerText = "Data stream verified. Your specification profile has been logged.";
      document.getElementById("secureContactForm").reset();
    } else {
      throw new Error(result.error || "Uplink interface rejected pipeline packets.");
    }
  } catch (error) {
    feedback.style.color = "#ff4444";
    feedback.innerText = `Transmission Fault: ${error.message}`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Initiate Recovery";
  }
});
/* end DOMContentLoaded */