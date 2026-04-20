const params = new URLSearchParams(window.location.search);

const trackingId  = params.get('id')          || `SKY-${Math.floor(100000 + Math.random() * 900000)}`;
const pickup      = params.get('pickup')      || '2 Dang Thai Mai, Tay Ho, Hanoi';
const dropoff     = params.get('dropoff')     || 'Vinmec Hospital, Tay Ho, Hanoi';
const packageType = params.get('packageType') || 'Documents';
const weight      = params.get('weight')      || 'Under 1 kg';
const speed       = params.get('speed')       || 'Immediate priority';
const phone       = params.get('phone')       || '+84 contact pending';
const notes       = params.get('notes')       || '';

const etaBySpeed = {
  'Immediate priority': 'ETA 14 min',
  'Same day':           'ETA 42 min',
  'Scheduled window':   'ETA 90 min'
};

const fareBySpeed = {
  'Immediate priority': '$25',
  'Same day':           '$18',
  'Scheduled window':   '$14'
};

const statuses = {
  'Immediate priority': 'Drone en route — live position updating',
  'Same day':           'Flight queued for same-day route',
  'Scheduled window':   'Scheduled route locked and awaiting launch window'
};

const flightDurations = {
  'Immediate priority': 14 * 60,
  'Same day':           42 * 60,
  'Scheduled window':   90 * 60
};

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

setText('trackingIdDisplay', trackingId);
setText('orderTitle',        `Tracking ${trackingId}`);
setText('orderSubtitle',     `Shipment from ${pickup} to ${dropoff}`);
setText('pickupValue',       pickup);
setText('dropoffValue',      dropoff);
setText('packageValue',      packageType);
setText('weightValue',       weight);
setText('speedValue',        speed);
setText('phoneValue',        phone);
setText('etaPill',           etaBySpeed[speed]  || 'ETA 20 min');
setText('liveStatus',        statuses[speed]    || 'Dispatch confirmed');
setText('fareValue',         fareBySpeed[speed] || '$25');
setText('notesValue',        notes ? `Handling notes: ${notes}` : 'No special handling notes submitted.');

// ── Map ──────────────────────────────────────────────────────────────────────

// Tay Ho, Hanoi as fallback centre
const TAY_HO = [21.0647, 105.8412];

const map = L.map('liveMap', { zoomControl: true, attributionControl: true })
             .setView(TAY_HO, 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Custom icons
const makeIcon = (emoji, size) => L.divIcon({
  html: `<span style="font-size:${size}px;line-height:1">${emoji}</span>`,
  className: '',
  iconAnchor: [size / 2, size / 2]
});

const droneIcon    = makeIcon('🚁', 28);
const pickupIcon   = makeIcon('📦', 22);
const dropoffIcon  = makeIcon('📍', 22);

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  try {
    const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (data && data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch (_) {}
  return null;
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function advanceTimeline(progress) {
  // 0–0.1  → step 3 (In flight) active
  // 0.7–   → step 4 (Approaching) active
  // 1.0    → step 5 (Delivered)   active
  const steps = document.querySelectorAll('.timeline-step');
  if (!steps.length) return;
  if (progress >= 0.01) steps[2].classList.add('active');
  if (progress >= 0.70) steps[3].classList.add('active');
  if (progress >= 1.00) {
    steps[4].classList.add('active');
    setText('liveStatus', 'Delivered — proof of completion available');
    setText('etaPill', 'Delivered');
  }
}

async function initMap() {
  const [fromCoords, toCoords] = await Promise.all([
    geocode(pickup),
    geocode(dropoff)
  ]);

  const from = fromCoords || TAY_HO;
  const to   = toCoords   || [TAY_HO[0] + 0.01, TAY_HO[1] + 0.01];

  // Markers
  L.marker(from, { icon: pickupIcon })
   .addTo(map)
   .bindPopup(`<b>Pickup</b><br>${pickup}`);

  L.marker(to, { icon: dropoffIcon })
   .addTo(map)
   .bindPopup(`<b>Dropoff</b><br>${dropoff}`);

  // Straight-line route (drones fly straight)
  const routeLine = L.polyline([from, to], {
    color: '#6366f1', weight: 3, dashArray: '8 6', opacity: 0.8
  }).addTo(map);

  map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

  // Drone marker — starts at pickup
  const droneMarker = L.marker(from, { icon: droneIcon, zIndexOffset: 1000 }).addTo(map);

  // Animate along the route
  const totalMs  = flightDurations[speed] * 1000;
  const startMs  = Date.now();
  // For "Immediate priority" compress visually to ~60s so you see movement
  const visualMs = speed === 'Immediate priority' ? 60_000
                 : speed === 'Same day'           ? 120_000
                 : 180_000;

  function tick() {
    const elapsed  = Date.now() - startMs;
    const progress = Math.min(elapsed / visualMs, 1);
    const pos      = lerp(from, to, progress);

    droneMarker.setLatLng(pos);
    advanceTimeline(progress);

    // Update ETA countdown
    const remainSec = Math.max(0, Math.round((1 - progress) * (flightDurations[speed])));
    if (progress < 1) {
      const m = Math.floor(remainSec / 60);
      const s = remainSec % 60;
      setText('etaPill', `ETA ${m}:${String(s).padStart(2, '0')}`);
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

initMap();
