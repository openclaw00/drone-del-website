const params = new URLSearchParams(window.location.search);

const trackingId = params.get('id') || `RWX-${Math.floor(100000 + Math.random() * 900000)}`;
const pickup = params.get('pickup') || 'Reigate Grammar School Vietnam';
const dropoff = params.get('dropoff') || 'District 1 delivery zone';
const deliveryType = params.get('deliveryType') || 'Documents / person-to-person';
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

const quoteRules = {
  'UrgentWing priority': { base: 120000, handling: 65000 },
  'Medical delivery': { base: 95000, handling: 55000 },
  'Food delivery': { base: 70000, handling: 25000 },
  'Business courier': { base: 80000, handling: 30000 },
  'Retail package': { base: 75000, handling: 35000 },
  'Documents / person-to-person': { base: 60000, handling: 15000 }
};

const weightFees = {
  'Under 1 kg': 0,
  '1 - 3 kg': 20000,
  '3 - 5 kg': 45000
};

const speedFees = {
  'Immediate priority': 40000,
  'Same day': 15000,
  'Scheduled window': 0
};

const statuses = {
  'Immediate priority': 'Drone preparing for rapid dispatch',
  'Same day': 'Flight queued for same-day route',
  'Scheduled window': 'Scheduled route locked and awaiting launch window'
};

const formatVnd = (amount) => amount.toLocaleString('vi-VN') + ' ₫';

const estimateFare = () => {
  const rule = quoteRules[deliveryType] || quoteRules['Documents / person-to-person'];
  return rule.base + rule.handling + (weightFees[weight] || 0) + (speedFees[speed] || 0);
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
setText('deliveryTypeValue', deliveryType);
setText('packageValue', packageType);
setText('weightValue', weight);
setText('speedValue', speed);
setText('phoneValue', phone);
setText('etaPill', etaBySpeed[speed] || 'ETA 20 min');
setText('liveStatus', statuses[speed] || 'Dispatch confirmed');
setText('fareValue', formatVnd(estimateFare()));
setText('notesValue', notes ? `Handling notes: ${notes}` : 'No special handling notes submitted.');

const mapFrame = document.querySelector('.order-live-map');
if (mapFrame) {
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(dropoff)}&z=15&output=embed`;
}
