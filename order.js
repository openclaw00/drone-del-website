const params = new URLSearchParams(window.location.search);

const trackingId = params.get('id') || `RWX-${Math.floor(100000 + Math.random() * 900000)}`;
const pickup = params.get('pickup') || 'Reigate Grammar School Vietnam';
const dropoff = params.get('dropoff') || 'District 1 delivery zone';
const packageType = params.get('packageType') || 'Documents';
const weight = params.get('weight') || 'Under 1 kg';
const speed = params.get('speed') || 'Immediate priority';
const phone = params.get('phone') || '+84 contact pending';
const notes = params.get('notes') || '';

const etaBySpeed = {
  'Immediate priority': 'ETA 14 min',
  'Same day': 'ETA 42 min',
  'Scheduled window': 'ETA 90 min'
};

const fareBySpeed = {
  'Immediate priority': '$25',
  'Same day': '$18',
  'Scheduled window': '$14'
};

const statuses = {
  'Immediate priority': 'Drone preparing for rapid dispatch',
  'Same day': 'Flight queued for same-day route',
  'Scheduled window': 'Scheduled route locked and awaiting launch window'
};

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

setText('trackingIdDisplay', trackingId);
setText('orderTitle', `Tracking ${trackingId}`);
setText('orderSubtitle', `Shipment from ${pickup} to ${dropoff}`);
setText('pickupValue', pickup);
setText('dropoffValue', dropoff);
setText('packageValue', packageType);
setText('weightValue', weight);
setText('speedValue', speed);
setText('phoneValue', phone);
setText('etaPill', etaBySpeed[speed] || 'ETA 20 min');
setText('liveStatus', statuses[speed] || 'Dispatch confirmed');
setText('fareValue', fareBySpeed[speed] || '$25');
setText('notesValue', notes ? `Handling notes: ${notes}` : 'No special handling notes submitted.');

const mapFrame = document.querySelector('.order-live-map');
if (mapFrame) {
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(dropoff)}&z=15&output=embed`;
}
