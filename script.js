// ── Dot grid ──────────────────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('dot-grid');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const SPACING = 16;
  const RADIUS = 1.5;
  const GLOW_RADIUS = 140;
  const BASE_ALPHA = 0.13;
  const SIZE_BOOST = 0.35;

  let mouse = { x: -9999, y: -9999 };
  let dots = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth  * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    buildGrid();
  }

  function buildGrid() {
    dots = [];
    const s = SPACING * devicePixelRatio;
    const offX = (W % s) / 2;
    const offY = (H % s) / 2;
    for (let x = offX; x < W; x += s)
      for (let y = offY; y < H; y += s)
        dots.push({ x, y });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const gr = GLOW_RADIUS * devicePixelRatio;
    const mx = mouse.x * devicePixelRatio;
    const my = mouse.y * devicePixelRatio;

    for (const dot of dots) {
      const dx = dot.x - mx;
      const dy = dot.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = Math.max(0, 1 - dist / gr);
      const eased = t * t * (3 - 2 * t);

      const alpha = BASE_ALPHA + (1 - BASE_ALPHA) * eased;
      const r = RADIUS * devicePixelRatio * (1 + eased * SIZE_BOOST);

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  window.addEventListener('touchmove', function (e) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ── Scroll reveal ─────────────────────────────────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  },
  { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ── Spotlight + neon border — all .glass cards ────────────────────────────────

const glassCards = Array.from(document.querySelectorAll('.glass'));

const state = glassCards.map(() => ({
  ox: 0, oy: 0,
  tx: 0, ty: 0,
  alpha: 0,
  targetAlpha: 0,
  mx: 0, my: 0,
}));

let mouseX = -9999;
let mouseY = -9999;

function updateCards() {
  glassCards.forEach((card, i) => {
    const rect = card.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;

    state[i].mx = x;
    state[i].my = y;
    state[i].targetAlpha = inside ? 1 : 0;

    if (inside) {
      const nx = (x / rect.width  - 0.5) * 2;
      const ny = (y / rect.height - 0.5) * 2;
      state[i].tx = nx * 12;
      state[i].ty = ny * 12;
    }

    card.style.setProperty('--mouse-x', x + 'px');
    card.style.setProperty('--mouse-y', y + 'px');
    card.style.setProperty('--mouse-opacity', inside ? '1' : '0');
  });
}

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  updateCards();
});

window.addEventListener('scroll', updateCards, { passive: true });

document.addEventListener('mouseleave', () => {
  mouseX = -9999;
  mouseY = -9999;
  glassCards.forEach((card, i) => {
    state[i].targetAlpha = 0;
    card.style.setProperty('--mouse-opacity', '0');
  });
});

const LERP_SPEED = 0.07;
function lerp(a, b, t) { return a + (b - a) * t; }

function tick() {
  glassCards.forEach((card, i) => {
    const s = state[i];
    s.alpha = lerp(s.alpha, s.targetAlpha, LERP_SPEED);
    s.ox    = lerp(s.ox,    s.tx,          LERP_SPEED);
    s.oy    = lerp(s.oy,    s.ty,          LERP_SPEED);

    const a = s.alpha;
    if (a < 0.002) {
      card.style.boxShadow = '';
    } else {
      card.style.boxShadow =
        '0 0 0 1px rgba(255,59,59,' + (a * 0.2).toFixed(3) + '),' +
        s.ox + 'px ' + s.oy + 'px 20px 2px rgba(255,59,59,' + (a * 0.7).toFixed(3) + '),' +
        (s.ox * 0.4) + 'px ' + (s.oy * 0.4) + 'px 40px 6px rgba(255,100,80,' + (a * 0.25).toFixed(3) + ')';
    }
  });
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ── Booking form ──────────────────────────────────────────────────────────────
const bookingForm   = document.getElementById('bookingForm');
const trackingInput = document.getElementById('trackingInput');
const trackButton   = document.getElementById('trackButton');

const buildTrackingId = () => 'RWX-' + Math.floor(100000 + Math.random() * 900000);

if (bookingForm) {
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const trackingId = buildTrackingId();
    const params = new URLSearchParams({
      id:          trackingId,
      pickup:      formData.get('pickup')      || '',
      dropoff:     formData.get('dropoff')     || '',
      packageType: formData.get('packageType') || '',
      weight:      formData.get('weight')      || '',
      speed:       formData.get('speed')       || '',
      phone:       formData.get('phone')       || '',
      notes:       formData.get('notes')       || ''
    });
    window.location.href = 'order.html?' + params.toString();
  });
}

if (trackButton && trackingInput) {
  trackButton.addEventListener('click', () => {
    const id = trackingInput.value.trim() || buildTrackingId();
    const params = new URLSearchParams({ id });
    window.location.href = 'order.html?' + params.toString();
  });
}
