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

// ── Spotlight — pricing cards ─────────────────────────────────────────────────
// Attaches to the pricing-section container so mousemove always fires
// even when hovering over child text nodes inside each card.

const pricingSection = document.querySelector('.pricing-section');
const pricingCards   = document.querySelectorAll('.pricing-card');

if (pricingSection && pricingCards.length > 0) {
  pricingSection.addEventListener('mousemove', (e) => {
    pricingCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Only show spotlight when cursor is actually inside this card
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      card.style.setProperty('--mouse-opacity', inside ? '1' : '0');
    });
  });

  pricingSection.addEventListener('mouseleave', () => {
    pricingCards.forEach((card) => {
      card.style.setProperty('--mouse-opacity', '0');
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
