// ---------- Mobile nav ----------
const navBurger = document.getElementById('navBurger');
const mobileNav = document.getElementById('mobileNav');
navBurger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('is-open');
  navBurger.textContent = open ? '✕' : '☰';
});
mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  mobileNav.classList.remove('is-open');
  navBurger.textContent = '☰';
}));

// ---------- Hero letter magnet ----------
function buildLetters(el, text) {
  el.innerHTML = '';
  text.split('').forEach((ch) => {
    const span = document.createElement('span');
    span.textContent = ch;
    el.appendChild(span);
  });
  return Array.from(el.children);
}
const heroWordEl = document.getElementById('heroWord');
const heroYearEl = document.getElementById('heroYear');
const heroLetters = buildLetters(heroWordEl, 'BOTATHON');
const yearLetters = buildLetters(heroYearEl, '2K26');

let mx = -1;
function applyMagnet(letters, spread) {
  letters.forEach((span, i) => {
    const center = (i + 0.5) / letters.length;
    const d = mx < 0 ? 1 : Math.abs(mx - center);
    const k = Math.max(0, 1 - d / spread);
    span.style.transform = `translateY(${(-26 * k).toFixed(1)}px) scale(${(1 + k * 0.06).toFixed(3)})`;
    if (k > 0.02) {
      span.style.color = `rgb(255,${Math.round(150 + k * 70)},${Math.round(40 + k * 90)})`;
      span.style.textShadow = `0 0 ${Math.round(k * 46)}px rgba(255,150,40,${(k * 0.55).toFixed(2)})`;
    } else {
      span.style.color = '';
      span.style.textShadow = 'none';
    }
  });
}
let magnetRaf = 0;
window.addEventListener('pointermove', (e) => {
  if (magnetRaf) return;
  magnetRaf = requestAnimationFrame(() => {
    magnetRaf = 0;
    mx = e.clientX / window.innerWidth;
    applyMagnet(heroLetters, 0.22);
    applyMagnet(yearLetters, 0.2);
  });
}, { passive: true });

// ---------- Countdown ----------
const START = new Date('2026-10-01T09:00:00+05:30').getTime();
const dialsEl = document.getElementById('countdownDials');
const statusEl = document.getElementById('countdownStatus');
const UNITS = [
  { key: 'days', label: 'DAYS' },
  { key: 'hours', label: 'HOURS' },
  { key: 'minutes', label: 'MINUTES' },
  { key: 'seconds', label: 'SECONDS' }
];
UNITS.forEach((u) => {
  const dial = document.createElement('div');
  dial.className = 'dial';
  dial.innerHTML = `
    <div class="dial__ring" data-ring="${u.key}"></div>
    <div class="dial__dashed"></div>
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;">
      <span class="dial__value" data-value="${u.key}">00</span>
      <span class="dial__label">${u.label}</span>
    </div>`;
  dialsEl.appendChild(dial);
});
function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }
function tickCountdown() {
  let d = Math.floor((START - Date.now()) / 1000);
  if (d < 0) d = 0;
  const days = Math.floor(d / 86400);
  const hours = Math.floor(d / 3600) % 24;
  const mins = Math.floor(d / 60) % 60;
  const secs = d % 60;
  const vals = { days, hours, minutes: mins, seconds: secs };
  const pcts = {
    days: Math.min(100, (days / 30) * 100),
    hours: (hours / 24) * 100,
    minutes: (mins / 60) * 100,
    seconds: (secs / 60) * 100
  };
  UNITS.forEach((u) => {
    document.querySelector(`[data-value="${u.key}"]`).textContent = pad(vals[u.key]);
    document.querySelector(`[data-ring="${u.key}"]`).style.background =
      `conic-gradient(#ffb43a calc(${pcts[u.key]} * 1%), rgba(255,255,255,.08) 0)`;
  });
  statusEl.textContent = Date.now() >= START ? 'EVENT LIVE' : 'CLOCK RUNNING';
}
tickCountdown();
setInterval(tickCountdown, 1000);

// ---------- Section-local videos: play only when visible ----------
document.querySelectorAll('[data-bgvideo]').forEach((section) => {
  const video = section.querySelector('video');
  if (!video) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { rootMargin: '200px 0px 200px 0px' });
  io.observe(section);
});

// ---------- About video parallax ----------
const aboutSection = document.getElementById('about');
const aboutVideo = document.getElementById('aboutVideo');
function updateParallax() {
  const b = aboutSection.getBoundingClientRect();
  const vh = window.innerHeight;
  const p = Math.min(1, Math.max(0, (vh - b.top) / (vh + b.height)));
  const shift = (p - 0.5) * -110;
  aboutVideo.style.height = '118%';
  aboutVideo.style.transform = `translate3d(0, ${shift}px, 0)`;
}
window.addEventListener('scroll', () => requestAnimationFrame(updateParallax), { passive: true });
updateParallax();

// ---------- Timeline zigzag ----------
const SCHEDULE = [
  { time: '9:30', title: 'Inauguration', note: 'Opening ceremony begins.' },
  { time: '10:30', title: 'Hackathon start', note: 'Build sprint begins.' },
  { time: '11:00', title: 'Refreshment', note: 'Short break.' },
  { time: '12:30', title: 'Review 1', note: 'First progress review.' },
  { time: '1:00', title: 'Lunch', note: 'Lunch break.' },
  { time: '3:30', title: 'Review 2', note: 'Second progress review.' },
  { time: '4:15', title: 'Final review', note: 'Last review before judging.' },
  { time: '5:00', title: 'Prizes & certificates', note: 'Winners announced, closing.' }
];
const zigzagEl = document.getElementById('zigzag');
const zigzagFill = document.getElementById('zigzagFill');
SCHEDULE.forEach((item, i) => {
  const side = i % 2 === 0 ? 'left' : 'right';
  const row = document.createElement('div');
  row.className = `zigzag__row zigzag__row--${side}`;
  row.innerHTML = `
    <span class="zigzag__dot"></span>
    <div class="zigzag__card">
      <span class="zigzag__time">${item.time}</span>
      <span class="zigzag__title">${item.title}</span>
      <span class="zigzag__note">${item.note}</span>
    </div>`;
  zigzagEl.appendChild(row);
});
const rows = Array.from(document.querySelectorAll('.zigzag__row'));
const rowObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
rows.forEach((r) => rowObserver.observe(r));
function updateZigzagFill() {
  const spine = zigzagEl.querySelector('.zigzag__spine');
  const b = spine.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - b.top) / b.height));
  zigzagFill.style.height = (p * b.height) + 'px';
}
window.addEventListener('scroll', () => requestAnimationFrame(updateZigzagFill), { passive: true });
updateZigzagFill();

// ---------- Community block: one-time signal-lock transition ----------
const community = document.getElementById('community');
const communityVideo = document.getElementById('communityVideo');
const communityScan = document.getElementById('communityScan');
let communityShown = false;
const communityObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !communityShown) {
      communityShown = true;
      communityVideo.classList.add('is-live');
      communityScan.classList.add('is-flicker');
      setTimeout(() => communityScan.classList.remove('is-flicker'), 550);
    }
  });
}, { rootMargin: '0px 0px -20% 0px' });
communityObserver.observe(community);

// ---------- Sub-team modal ----------
document.querySelectorAll('[data-open-modal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const modal = document.getElementById('modal' + btn.dataset.openModal.charAt(0).toUpperCase() + btn.dataset.openModal.slice(1));
    if (modal) modal.hidden = false;
  });
});
document.querySelectorAll('[data-close-modal]').forEach((el) => {
  el.addEventListener('click', () => { el.closest('.modal').hidden = true; });
});
document.querySelectorAll('.modal__dialog').forEach((d) => d.addEventListener('click', (e) => e.stopPropagation()));

// ---------- Rules accordion ----------
const RULES = [
  ['Eligibility', 'Open to students of recognised institutions. Year restrictions will be finalised by the organising committee and communicated before registration closes.'],
  ['Team size', '2 to 4 members per team. Solo entries are not accepted.'],
  ['Registration', 'Registration is through the official form only. Fee: ₹350 per person. Confirmation is sent to the team lead.'],
  ['Technology', 'Any language, framework, or hardware. Pre-existing boilerplate is fine; a pre-built project is not.'],
  ['Submission', 'Code along with a short demo must be submitted before the deadline. The submission channel will be finalised and communicated by the organising committee before registration closes.'],
  ['Judging', "Panel review against the published criteria. Judges' decisions are final."],
  ['Code of conduct', 'Respect participants, volunteers, and the campus. Harassment of any kind ends your event.'],
  ['Plagiarism', 'Copied projects are disqualified. Open-source use must be credited.'],
  ['Intellectual property', 'Teams keep ownership of what they build.'],
  ['Disqualification', 'Plagiarism, misconduct, or breaking venue rules.'],
  ['Food & accommodation', 'Meals and accommodation arrangements will be finalised and communicated by the organising committee before registration closes.'],
  ['What to bring', 'Laptop, charger, college ID, and any hardware your build needs.']
];
const accordionEl = document.getElementById('accordion');
RULES.forEach(([title, body]) => {
  const item = document.createElement('div');
  item.className = 'accordion__item';
  item.innerHTML = `
    <button type="button" class="accordion__trigger">
      <span>${title}</span><span class="accordion__icon">+</span>
    </button>
    <p class="accordion__body">${body}</p>`;
  const trigger = item.querySelector('.accordion__trigger');
  const icon = item.querySelector('.accordion__icon');
  trigger.addEventListener('click', () => {
    const open = item.classList.toggle('is-open');
    icon.textContent = open ? '−' : '+';
  });
  accordionEl.appendChild(item);
});

/* =========================================
   PREMIUM CURSOR SYSTEM
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  // Only run on mouse / trackpad devices
  if (!window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  const cursor = document.querySelector(".custom-cursor");
  const ring = document.querySelector(".custom-cursor-ring");

  if (!cursor || !ring) return;


  /* =========================================
     CURSOR MOVEMENT
  ========================================= */

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let ringX = mouseX;
  let ringY = mouseY;

  document.addEventListener("mousemove", (event) => {

    mouseX = event.clientX;
    mouseY = event.clientY;

    // Small dot follows immediately
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

  });


  // Smooth outer ring
  function animateCursor() {

    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();


  /* =========================================
     HOVER EFFECT
  ========================================= */

  const interactiveElements = document.querySelectorAll(
    "a, button, input, textarea, select, .magnetic"
  );

  interactiveElements.forEach((element) => {

    element.addEventListener("mouseenter", () => {
      ring.classList.add("is-hovering");
    });

    element.addEventListener("mouseleave", () => {
      ring.classList.remove("is-hovering");
    });

  });


  /* =========================================
     CLICK EFFECT
  ========================================= */

  document.addEventListener("mousedown", () => {
    ring.classList.add("is-clicking");
  });

  document.addEventListener("mouseup", () => {
    ring.classList.remove("is-clicking");
  });


  /* =========================================
     MAGNETIC BUTTON EFFECT
  ========================================= */

  const magneticElements = document.querySelectorAll(
    ".magnetic, .hero__ctas a, .subteam-btn"
  );

  magneticElements.forEach((element) => {

    element.addEventListener("mousemove", (event) => {

      const rect = element.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const moveX = (event.clientX - centerX) * 0.18;
      const moveY = (event.clientY - centerY) * 0.18;

      element.style.transform =
        `translate(${moveX}px, ${moveY}px)`;

    });


    element.addEventListener("mouseleave", () => {

      element.style.transform = "translate(0, 0)";

    });

  });


  /* =========================================
     SUBTLE CARD TILT
  ========================================= */

  const cards = document.querySelectorAll(
    ".card, .prize-card, .org-card, .sponsor-card"
  );

  cards.forEach((card) => {

    card.classList.add("cursor-tilt");

    card.addEventListener("mousemove", (event) => {

      const rect = card.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX =
        ((y - centerY) / centerY) * -3;

      const rotateY =
        ((x - centerX) / centerX) * 3;

      card.style.transform =
        `perspective(800px)
         rotateX(${rotateX}deg)
         rotateY(${rotateY}deg)
         translateY(-3px)`;

    });


    card.addEventListener("mouseleave", () => {

      card.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";

    });

  });

});
/* ==========================================
   NEON CROSSHAIR CURSOR
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Don't run on touch devices
    if (!window.matchMedia("(pointer: fine)").matches) {
        return;
    }

    const cursor = document.querySelector(".crosshair-cursor");

    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let currentX = mouseX;
    let currentY = mouseY;


    /* ==========================================
       MOUSE POSITION
    ========================================== */

    document.addEventListener("mousemove", (event) => {

        mouseX = event.clientX;
        mouseY = event.clientY;

    });


    /* ==========================================
       SMOOTH CURSOR MOVEMENT
    ========================================== */

    function animateCrosshair() {

        currentX += (mouseX - currentX) * 0.18;
        currentY += (mouseY - currentY) * 0.18;

        cursor.style.left = `${currentX}px`;
        cursor.style.top = `${currentY}px`;

        requestAnimationFrame(animateCrosshair);
    }

    animateCrosshair();


    /* ==========================================
       HOVER EFFECT
    ========================================== */

    const interactiveElements = document.querySelectorAll(
        "a, button, input, textarea, select, .subteam-btn, .card, .prize-card, .org-card, .sponsor-card"
    );

    interactiveElements.forEach((element) => {

        element.addEventListener("mouseenter", () => {

            cursor.classList.add("active");

        });

        element.addEventListener("mouseleave", () => {

            cursor.classList.remove("active");

        });

    });


    /* ==========================================
       CLICK EFFECT
    ========================================== */

    document.addEventListener("mousedown", () => {

        cursor.classList.add("click");

    });

    document.addEventListener("mouseup", () => {

        cursor.classList.remove("click");

    });

});
/* ==========================================
   PREMIUM GLOW ORB CURSOR
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (!window.matchMedia("(pointer: fine)").matches) {
        return;
    }

    const cursor = document.querySelector(".premium-cursor");

    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let currentX = mouseX;
    let currentY = mouseY;


    /* Mouse position */

    document.addEventListener("mousemove", (e) => {

        mouseX = e.clientX;
        mouseY = e.clientY;

    });


    /* Smooth movement */

    function moveCursor() {

        currentX += (mouseX - currentX) * 0.18;
        currentY += (mouseY - currentY) * 0.18;

        cursor.style.left = `${currentX}px`;
        cursor.style.top = `${currentY}px`;

        requestAnimationFrame(moveCursor);
    }

    moveCursor();


    /* Interactive elements */

    const interactive = document.querySelectorAll(
        "a, button, input, textarea, select, .card, .prize-card, .org-card, .sponsor-card, .subteam-btn"
    );

    interactive.forEach((element) => {

        element.addEventListener("mouseenter", () => {
            cursor.classList.add("hovering");
        });

        element.addEventListener("mouseleave", () => {
            cursor.classList.remove("hovering");
        });

    });


    /* Click animation */

    document.addEventListener("mousedown", () => {
        cursor.classList.add("clicking");
    });

    document.addEventListener("mouseup", () => {
        cursor.classList.remove("clicking");
    });

});
/* =========================================================
   BOTATHON — ENERGY PARTICLE CURSOR
   ========================================================= */

(() => {

    // Only enable on mouse / trackpad
    if (!window.matchMedia("(pointer: fine)").matches) {
        return;
    }

    /* ---------------------------------------------------------
       CREATE CURSOR
    --------------------------------------------------------- */

    const cursor = document.createElement("div");
    cursor.className = "energy-cursor";

    cursor.innerHTML = `
        <div class="energy-cursor__core"></div>
        <div class="energy-cursor__aura"></div>
        <div class="energy-cursor__ring"></div>
    `;

    document.body.appendChild(cursor);


    /* ---------------------------------------------------------
       CREATE PARTICLE CONTAINER
    --------------------------------------------------------- */

    const particleContainer = document.createElement("div");
    particleContainer.className = "cursor-particles";

    document.body.appendChild(particleContainer);


    /* ---------------------------------------------------------
       MOUSE POSITION
    --------------------------------------------------------- */

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let cursorX = mouseX;
    let cursorY = mouseY;

    let lastX = mouseX;
    let lastY = mouseY;

    let speed = 0;


    document.addEventListener("mousemove", (e) => {

        mouseX = e.clientX;
        mouseY = e.clientY;

        const dx = mouseX - lastX;
        const dy = mouseY - lastY;

        speed = Math.min(Math.sqrt(dx * dx + dy * dy), 35);

        lastX = mouseX;
        lastY = mouseY;

    }, { passive: true });


    /* ---------------------------------------------------------
       SMOOTH CURSOR
    --------------------------------------------------------- */

    function animateCursor() {

        cursorX += (mouseX - cursorX) * 0.22;
        cursorY += (mouseY - cursorY) * 0.22;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        speed *= 0.90;

        requestAnimationFrame(animateCursor);
    }

    animateCursor();


    /* ---------------------------------------------------------
       PARTICLE CREATOR
    --------------------------------------------------------- */

    function createParticle() {

        if (speed < 2) return;

        const particle = document.createElement("span");

        particle.className = "cursor-particle";

        const angle = Math.random() * Math.PI * 2;

        const distance =
            10 + Math.random() * 25 + speed * 0.5;

        const size =
            2 + Math.random() * 4;

        const startX =
            cursorX + Math.cos(angle) * 8;

        const startY =
            cursorY + Math.sin(angle) * 8;

        const endX =
            cursorX + Math.cos(angle) * distance;

        const endY =
            cursorY + Math.sin(angle) * distance;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.setProperty(
            "--particle-x",
            `${endX - startX}px`
        );

        particle.style.setProperty(
            "--particle-y",
            `${endY - startY}px`
        );

        particleContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 650);
    }


    /* ---------------------------------------------------------
       PARTICLE LOOP
    --------------------------------------------------------- */

    let particleCounter = 0;

    function particleLoop() {

        particleCounter++;

        if (speed > 3 && particleCounter % 2 === 0) {
            createParticle();
        }

        requestAnimationFrame(particleLoop);
    }

    particleLoop();


    /* ---------------------------------------------------------
       HOVER EFFECT
    --------------------------------------------------------- */

    const interactiveElements = document.querySelectorAll(
        "a, button, input, textarea, select, " +
        ".card, .prize-card, .org-card, .sponsor-card, " +
        ".subteam-btn, .accordion__trigger"
    );


    interactiveElements.forEach((element) => {

        element.addEventListener("mouseenter", () => {

            cursor.classList.add("is-hovering");

        });

        element.addEventListener("mouseleave", () => {

            cursor.classList.remove("is-hovering");

        });

    });


    /* ---------------------------------------------------------
       MAGNETIC BUTTON EFFECT
    --------------------------------------------------------- */

    const magneticElements = document.querySelectorAll(
        ".hero__ctas a, .subteam-btn, .nav__cta, button"
    );


    magneticElements.forEach((element) => {

        element.addEventListener("mousemove", (e) => {

            const rect = element.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const moveX =
                (e.clientX - centerX) * 0.12;

            const moveY =
                (e.clientY - centerY) * 0.12;

            element.style.transform =
                `translate(${moveX}px, ${moveY}px)`;

        });


        element.addEventListener("mouseleave", () => {

            element.style.transform = "";

        });

    });


    /* ---------------------------------------------------------
       CLICK EXPLOSION
    --------------------------------------------------------- */

    document.addEventListener("mousedown", (e) => {

        cursor.classList.add("is-clicking");

        for (let i = 0; i < 14; i++) {

            const particle = document.createElement("span");

            particle.className =
                "cursor-particle cursor-particle--burst";

            const angle =
                (Math.PI * 2 / 14) * i;

            const distance =
                35 + Math.random() * 45;

            particle.style.left =
                `${e.clientX}px`;

            particle.style.top =
                `${e.clientY}px`;

            particle.style.setProperty(
                "--burst-x",
                `${Math.cos(angle) * distance}px`
            );

            particle.style.setProperty(
                "--burst-y",
                `${Math.sin(angle) * distance}px`
            );

            particleContainer.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 700);
        }

    });


    document.addEventListener("mouseup", () => {

        cursor.classList.remove("is-clicking");

    });


    /* ---------------------------------------------------------
       HIDE WHEN MOUSE LEAVES WINDOW
    --------------------------------------------------------- */

    document.addEventListener("mouseleave", () => {

        cursor.classList.add("is-hidden");

    });

    document.addEventListener("mouseenter", () => {

        cursor.classList.remove("is-hidden");

    });

})();