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
  ['Eligibility', 'Open to students of recognised institutions. Year restrictions: TBC by the organising committee.'],
  ['Team size', '2 to 4 members per team. Solo entries are not accepted.'],
  ['Registration', 'Registration is through the official form only. Fee: ₹350 per person. Confirmation is sent to the team lead.'],
  ['Technology', 'Any language, framework, or hardware. Pre-existing boilerplate is fine; a pre-built project is not.'],
  ['Submission', 'Code plus a short demo, submitted before the deadline. Submission channel: TBC.'],
  ['Judging', "Panel review against the published criteria. Judges' decisions are final."],
  ['Code of conduct', 'Respect participants, volunteers, and the campus. Harassment of any kind ends your event.'],
  ['Plagiarism', 'Copied projects are disqualified. Open-source use must be credited.'],
  ['Intellectual property', 'Teams keep ownership of what they build.'],
  ['Disqualification', 'Plagiarism, misconduct, or breaking venue rules.'],
  ['Food & accommodation', 'Meals during the event: TBC.'],
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
