import { supabase } from './supabase.js';

// Auth guard
const { data: { session } } = await supabase.auth.getSession();
if (!session) window.location.href = 'auth.html';

const user = session.user;
document.getElementById('userEmail').textContent = user.email;

// Load profile
const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

const fullName = profile?.full_name || user.user_metadata?.full_name || '—';
const userEmail = profile?.email || user.email;
const role = profile?.role || user.user_metadata?.role || 'user';

document.getElementById('profName').textContent = fullName;
document.getElementById('profEmail').textContent = userEmail;
document.getElementById('profRole').textContent = role;
document.getElementById('profSince').textContent = new Date(user.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

if (role === 'admin') {
  document.getElementById('adminLink').style.display = 'inline';
}

if (!profile) {
  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name || '',
    email: user.email,
    role: user.user_metadata?.role || 'user'
  });
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
});

// Load orders
async function loadOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const tbody = document.getElementById('ordersBody');
  if (error || !orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><code>${o.tracking_id}</code></td>
      <td>${o.pickup}</td>
      <td>${o.dropoff}</td>
      <td>${o.package_type}</td>
      <td><span class="status-badge status-${o.status}">${o.status.replace('_', ' ')}</span></td>
      <td>${new Date(o.created_at).toLocaleDateString('en-GB')}</td>
    </tr>
  `).join('');
}

await loadOrders();

// Place order
document.getElementById('placeOrderBtn').addEventListener('click', async () => {
  const pickup = document.getElementById('oPickup').value.trim();
  const dropoff = document.getElementById('oDropoff').value.trim();
  const package_type = document.getElementById('oType').value;
  const weight = document.getElementById('oWeight').value;
  const speed = document.getElementById('oSpeed').value;
  const phone = document.getElementById('oPhone').value.trim();
  const notes = document.getElementById('oNotes').value.trim();
  const msgEl = document.getElementById('orderMsg');

  if (!pickup || !dropoff || !phone) {
    msgEl.textContent = 'Please fill in pickup, dropoff, and phone.';
    msgEl.className = 'order-msg error';
    return;
  }

  const tracking_id = 'SKY-' + Math.floor(100000 + Math.random() * 900000);

  const { error } = await supabase.from('orders').insert({
    user_id: user.id,
    tracking_id,
    pickup,
    dropoff,
    package_type,
    weight,
    speed,
    phone,
    notes,
    status: 'pending'
  });

  if (error) {
    msgEl.textContent = 'Error placing order: ' + error.message;
    msgEl.className = 'order-msg error';
    return;
  }

  msgEl.textContent = `Order placed! Tracking ID: ${tracking_id}`;
  msgEl.className = 'order-msg success';
  // Clear form
  ['oPickup','oDropoff','oPhone','oNotes'].forEach(id => document.getElementById(id).value = '');
  await loadOrders();
});

// Track
document.getElementById('trackBtn').addEventListener('click', async () => {
  const id = document.getElementById('trackInput').value.trim().toUpperCase();
  const msgEl = document.getElementById('trackMsg');
  const result = document.getElementById('trackResult');
  msgEl.textContent = '';
  result.style.display = 'none';

  if (!id) return;

  const { data, error } = await supabase.from('orders').select('*').eq('tracking_id', id).single();
  if (error || !data) {
    msgEl.textContent = 'No order found with that tracking ID.';
    return;
  }

  document.getElementById('trId').textContent = data.tracking_id;
  document.getElementById('trStatus').textContent = data.status.replace('_', ' ');
  document.getElementById('trPickup').textContent = data.pickup;
  document.getElementById('trDropoff').textContent = data.dropoff;
  document.getElementById('trType').textContent = data.package_type;
  document.getElementById('trDate').textContent = new Date(data.created_at).toLocaleString('en-GB');
  result.style.display = 'block';
});
