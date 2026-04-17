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

// ── Spotlight + neon border glow — all .glass cards ───────────────────────────
// ::before  = soft radial fill that follows the cursor (CSS handles this)
// box-shadow = neon border glow that concentrates on the side closest to cursor

const glassCards = document.querySelectorAll('.glass');

document.addEventListener('mousemove', (e) => {
  glassCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;

    // Update fill spotlight position always (CSS reads these)
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--mouse-opacity', inside ? '1' : '0');

    if (inside) {
      // Normalise to -1..1 from card center
      const nx = (x / rect.width  - 0.5) * 2;   // -1 = left edge, +1 = right edge
      const ny = (y / rect.height - 0.5) * 2;   // -1 = top edge,  +1 = bottom edge

      // The neon glow offset: shift toward the cursor side
      const offsetX = nx * 10;
      const offsetY = ny * 10;
      const blur    = 18;
      const spread  = 2;
      const alpha   = 0.85;

      card.style.setProperty('--glow-shadow',
        `0 0 0 1px rgba(255,59,59,0.25),
         ${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(255,59,59,${alpha}),
         ${offsetX * 0.5}px ${offsetY * 0.5}px ${blur * 2}px ${spread * 3}px rgba(255,100,80,0.3)`
      );
    } else {
      card.style.setProperty('--glow-shadow', 'none');
    }
  });
});

document.addEventListener('mouseleave', () => {
  glassCards.forEach((card) => {
    card.style.setProperty('--mouse-opacity', '0');
    card.style.setProperty('--glow-shadow', 'none');
  });
});

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
