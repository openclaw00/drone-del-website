import { supabase } from './supabase.js';

// Auth + admin guard
const { data: { session } } = await supabase.auth.getSession();
if (!session) window.location.href = 'auth.html';

const user = session.user;
document.getElementById('userEmail').textContent = user.email;

// Check admin role
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
if (!profile || profile.role !== 'admin') {
  alert('Access denied. Admins only.');
  window.location.href = 'dashboard.html';
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
});

let allOrders = [];

async function loadAllOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }
  allOrders = orders || [];
  updateStats();
  renderTable(allOrders);
}

function updateStats() {
  document.getElementById('statTotal').textContent = allOrders.length;
  document.getElementById('statPending').textContent = allOrders.filter(o => o.status === 'pending').length;
  document.getElementById('statFlight').textContent = allOrders.filter(o => o.status === 'in_flight').length;
  document.getElementById('statDelivered').textContent = allOrders.filter(o => o.status === 'delivered').length;
}

function renderTable(orders) {
  const tbody = document.getElementById('adminOrdersBody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No orders found.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><code>${o.tracking_id}</code></td>
      <td style="font-size:0.82rem;">${o.profiles?.full_name || '—'}<br><span style="color:#666">${o.profiles?.email || ''}</span></td>
      <td>${o.pickup}</td>
      <td>${o.dropoff}</td>
      <td>${o.package_type}</td>
      <td>${o.weight}</td>
      <td>${o.speed}</td>
      <td>
        <select class="status-select" data-id="${o.id}" data-current="${o.status}">
          <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
          <option value="in_flight" ${o.status==='in_flight'?'selected':''}>In flight</option>
          <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
          <option value="cancelled" ${o.status==='cancelled'?'selected':''}>Cancelled</option>
        </select>
      </td>
      <td style="white-space:nowrap;">${new Date(o.created_at).toLocaleDateString('en-GB')}</td>
    </tr>
  `).join('');

  // Status change handlers
  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const status = e.target.value;
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) {
        alert('Failed to update status: ' + error.message);
        e.target.value = e.target.dataset.current;
      } else {
        e.target.dataset.current = status;
        // Update local data and stats
        const order = allOrders.find(o => o.id === id);
        if (order) order.status = status;
        updateStats();
      }
    });
  });
}

// Filters
function applyFilters() {
  const status = document.getElementById('filterStatus').value;
  const search = document.getElementById('filterSearch').value.toLowerCase();
  let filtered = allOrders;
  if (status) filtered = filtered.filter(o => o.status === status);
  if (search) filtered = filtered.filter(o =>
    o.tracking_id.toLowerCase().includes(search) ||
    o.pickup.toLowerCase().includes(search) ||
    o.dropoff.toLowerCase().includes(search)
  );
  renderTable(filtered);
}

document.getElementById('filterStatus').addEventListener('change', applyFilters);
document.getElementById('filterSearch').addEventListener('input', applyFilters);

await loadAllOrders();
