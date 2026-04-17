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
  {
    threshold: 0.16,
    rootMargin: '0px 0px -8% 0px'
  }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ── Spotlight / GlowCard — pricing cards ──────────────────────────────────────
// Mirrors the React GlowCard component's pointer-tracking logic.
// Writes --x, --y, --xp onto every .pricing-card so their CSS radial-gradient
// spotlights and border glows follow the cursor across the whole viewport.

const pricingCards = document.querySelectorAll('.pricing-card');

if (pricingCards.length > 0) {
  document.addEventListener('pointermove', (e) => {
    const x  = e.clientX.toFixed(2);
    const y  = e.clientY.toFixed(2);
    const xp = (e.clientX / window.innerWidth).toFixed(4);
    const yp = (e.clientY / window.innerHeight).toFixed(4);

    pricingCards.forEach((card) => {
      card.style.setProperty('--x',  x);
      card.style.setProperty('--y',  y);
      card.style.setProperty('--xp', xp);
      card.style.setProperty('--yp', yp);
    });
  });

  // Park the spotlight off-screen when cursor leaves the window
  document.addEventListener('pointerleave', () => {
    pricingCards.forEach((card) => {
      card.style.setProperty('--x', '-9999');
      card.style.setProperty('--y', '-9999');
    });
  });
}

// ── Booking form ──────────────────────────────────────────────────────────────
const bookingForm   = document.getElementById('bookingForm');
const trackingInput = document.getElementById('trackingInput');
const trackButton   = document.getElementById('trackButton');

const buildTrackingId = () => `RWX-${Math.floor(100000 + Math.random() * 900000)}`;

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

    window.location.href = `order.html?${params.toString()}`;
  });
}

if (trackButton && trackingInput) {
  trackButton.addEventListener('click', () => {
    const id = trackingInput.value.trim() || buildTrackingId();
    const params = new URLSearchParams({ id });
    window.location.href = `order.html?${params.toString()}`;
  });
}
