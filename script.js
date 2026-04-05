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

const bookingForm = document.getElementById('bookingForm');
const trackingInput = document.getElementById('trackingInput');
const trackButton = document.getElementById('trackButton');

const buildTrackingId = () => `RWX-${Math.floor(100000 + Math.random() * 900000)}`;

if (bookingForm) {
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const trackingId = buildTrackingId();
    const params = new URLSearchParams({
      id: trackingId,
      pickup: formData.get('pickup') || '',
      dropoff: formData.get('dropoff') || '',
      packageType: formData.get('packageType') || '',
      weight: formData.get('weight') || '',
      speed: formData.get('speed') || '',
      phone: formData.get('phone') || '',
      notes: formData.get('notes') || ''
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
