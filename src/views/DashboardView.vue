<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Users, Ticket, DollarSign, Filter, Search, Download } from 'lucide-vue-next';

const router = useRouter();
const bookings = ref([]);

onMounted(() => {
  // Read bookings from cache
  const cached = localStorage.getItem('ajak_bookings');
  if (cached) {
    try {
      bookings.value = JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse bookings cache', e);
    }
  }

  // Force reset cache if we see other events, so user gets exactly The Sounds Project
  const hasOtherEvents = bookings.value.some(b => b.event?.name && b.event.name !== 'The Sounds Project');
  if (hasOtherEvents) {
    bookings.value = [];
  }
  
  // Inject 40 dummy data items unconditionally if we don't have enough
  if (bookings.value.length < 30) {
    const firstNames = ['Budi', 'Siti', 'Ayu', 'Rizky', 'Dimas', 'Nadia', 'Hendra', 'Kartika', 'Andi', 'Putri', 'Dewi', 'Agus', 'Tari', 'Eko', 'Rini', 'Dodi', 'Maya', 'Reza', 'Sarah', 'Farhan'];
    const lastNames = ['Santoso', 'Aminah', 'Lestari', 'Pratama', 'Anggara', 'Salsabila', 'Wijaya', 'Putri', 'Setiawan', 'Rahayu', 'Kusuma', 'Saputra', 'Wahyuni', 'Nugroho', 'Sari', 'Hidayat', 'Indah', 'Mahendra', 'Aulia', 'Syahputra'];
    const events = [
      { name: 'The Sounds Project', tag: 'SHUTTLE BERSAMA', returnLoc: 'Ancol Ecovention & Ecopark' }
    ];
    const pickups = [
      { name: 'Pondok Indah', address: 'PIM 2' },
      { name: 'Bekasi Barat', address: 'Mega Bekasi Hypermall' },
      { name: 'Depok', address: 'Margocity Mall' },
      { name: 'Sudirman', address: 'FX Sudirman' },
      { name: 'Bogor', address: 'Botani Square' },
      { name: 'TMII', address: 'Taman Mini Indonesia Indah' }
    ];
    const payments = ['BCA Virtual Account', 'Mandiri Virtual Account', 'GoPay', 'OVO', 'ShopeePay', 'QRIS', 'BNI Virtual Account'];
    const notes = ['Tolong kabari kalau sudah dekat', 'Tunggu di lobby utama ya', 'Bawa barang agak banyak', 'Berangkat bareng teman 1 rombongan', '', '', '', '', '', ''];

    const d = new Date();
    for (let i = 0; i < 40; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const evt = events[Math.floor(Math.random() * events.length)];
      const pck = pickups[Math.floor(Math.random() * pickups.length)];
      const pmt = payments[Math.floor(Math.random() * payments.length)];
      const nt = notes[Math.floor(Math.random() * notes.length)];
      
      const adults = Math.floor(Math.random() * 4) + 1;
      const toddlers = Math.floor(Math.random() * 2);
      
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = 'AJK-';
      for (let c = 0; c < 6; c++) code += chars[Math.floor(Math.random() * chars.length)];
      
      const hrsAgo = Math.floor(Math.random() * 300) + 1;
      const dateStr = new Date(d.getTime() - hrsAgo * 60 * 60 * 1000).toISOString();
      
      let basePrice = 150000;
      if (pck.name === 'Sudirman') basePrice = 120000;
      if (pck.name === 'Bogor') basePrice = 175000;
      
      const total = (basePrice * adults) + (adults * 5000);
      const phone = '08' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(Math.random() * 99) + 1}@gmail.com`;

      bookings.value.push({
        code, date: dateStr,
        event: { name: evt.name, tag: evt.tag },
        pickup: { name: pck.name, address: pck.address },
        returnLoc: { name: evt.returnLoc },
        customer: { name: `${fn} ${ln}`, phone, email, note: nt },
        adults, toddlers, totalPrice: total, paymentMethod: pmt
      });
    }
    localStorage.setItem('ajak_bookings', JSON.stringify(bookings.value));
  }
});

const filterLocation = ref('Semua');
const searchQuery = ref('');

// Extract unique pickup locations for the filter
const pickupLocations = computed(() => {
  const locs = new Set();
  bookings.value.forEach(b => {
    if (b.pickup && b.pickup.name) {
      locs.add(b.pickup.name);
    }
  });
  return ['Semua', ...Array.from(locs)];
});

// Filtered bookings
const filteredBookings = computed(() => {
  let res = [...bookings.value];
  if (filterLocation.value !== 'Semua') {
    res = res.filter(b => b.pickup?.name === filterLocation.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    res = res.filter(b => 
      b.code?.toLowerCase().includes(q) ||
      b.customer?.name?.toLowerCase().includes(q) ||
      b.customer?.email?.toLowerCase().includes(q) ||
      b.customer?.phone?.toLowerCase().includes(q)
    );
  }
  return res.sort((a, b) => new Date(b.date) - new Date(a.date));
});

// Summary metrics
const totalTickets = computed(() => {
  return filteredBookings.value.reduce((sum, b) => sum + (b.adults || 0), 0);
});

const totalRevenue = computed(() => {
  return filteredBookings.value.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
});

const formatRp = (num) => 'Rp ' + (num || 0).toLocaleString('id-ID');
const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const exportExcel = () => {
  const headers = [
    'Tanggal', 'Event', 'Booking ID', 'Item', 'Payment', 'Qty', 
    'Subtotal', 'Admin', 'Grand Total', 'Customer', 'Phone', 'Email', 'Note'
  ];

  const rows = filteredBookings.value.map(b => {
    const qty = `${b.adults || 0} Dewasa${b.toddlers ? ', ' + b.toddlers + ' Balita' : ''}`;
    const subtotal = b.totalPrice - ((b.adults || 0) * 5000);
    const admin = (b.adults || 0) * 5000;
    
    return [
      `"${formatDate(b.date)}"`,
      `"${b.event?.name || '-'}"`,
      `"${b.code}"`,
      `"${b.pickup?.name || 'Lokasi Custom'} - Round Trip - 12:00"`,
      `"${b.paymentMethod?.name || b.paymentMethod || '-'}"`,
      `"${qty}"`,
      subtotal,
      admin,
      b.totalPrice,
      `"${b.customer?.name || '-'}"`,
      `"${b.customer?.phone || '-'}"`,
      `"${b.customer?.email || '-'}"`,
      `"${b.note || b.customer?.note || '-'}"`
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(',') + "\n"
    + rows.map(e => e.join(',')).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Data_Transaksi_AJAK_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div class="dashboard-page">
    <div class="container dashboard-container">
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Laporan Penjualan Tiket</h1>
          <p class="dash-sub">Pantau pembelian tiket event secara real-time</p>
        </div>
        <div>
          <button class="btn btn-outline-primary" @click="router.push('/')">Kembali ke Beranda</button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon"><Ticket :size="24" /></div>
          <div class="metric-info">
            <div class="metric-label">Total Pemesanan</div>
            <div class="metric-value">{{ filteredBookings.length }}</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon blue"><Users :size="24" /></div>
          <div class="metric-info">
            <div class="metric-label">Total Tiket Terjual (Dewasa)</div>
            <div class="metric-value">{{ totalTickets }}</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon green"><DollarSign :size="24" /></div>
          <div class="metric-info">
            <div class="metric-label">Total Pendapatan</div>
            <div class="metric-value">{{ formatRp(totalRevenue) }}</div>
          </div>
        </div>
      </div>

      <!-- Filters & Table -->
      <div class="report-card">
        <div class="report-header">
          <h3 class="report-title">Data Transaksi</h3>
          <div class="report-actions">
            <div class="search-box">
              <Search :size="16" class="text-light" />
              <input type="text" v-model="searchQuery" placeholder="Cari ID, Nama..." class="search-input" />
            </div>
            <div class="filter-box">
              <Filter :size="16" class="text-light" />
              <select v-model="filterLocation" class="filter-select">
                <option v-for="loc in pickupLocations" :key="loc" :value="loc">
                  {{ loc === 'Semua' ? 'Semua Titik Jemput' : loc }}
                </option>
              </select>
            </div>
            <button class="export-btn" @click="exportExcel">
              <Download :size="16" />
              Export Excel
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="report-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Event</th>
                <th>Booking ID</th>
                <th>Item</th>
                <th>Payment</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Admin</th>
                <th>Grand Total</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredBookings.length === 0">
                <td colspan="13" class="empty-state">
                  Belum ada data pemesanan untuk filter ini.
                </td>
              </tr>
              <tr v-for="b in filteredBookings" :key="b.code">
                <td style="white-space: nowrap;">{{ formatDate(b.date) }}</td>
                <td class="event-name">{{ b.event?.name || '-' }}</td>
                <td><strong>{{ b.code }}</strong></td>
                <td style="white-space: nowrap;">{{ b.pickup?.name || 'Lokasi Custom' }} - Round Trip - 12:00</td>
                <td>{{ b.paymentMethod?.name || b.paymentMethod || '-' }}</td>
                <td style="white-space: nowrap;">{{ b.adults || 0 }} Dewasa<span v-if="b.toddlers">, {{ b.toddlers }} Balita</span></td>
                <td>{{ formatRp(b.totalPrice - ((b.adults || 0) * 5000)) }}</td>
                <td>{{ formatRp((b.adults || 0) * 5000) }}</td>
                <td><strong>{{ formatRp(b.totalPrice) }}</strong></td>
                <td style="white-space: nowrap;">{{ b.customer?.name || '-' }}</td>
                <td style="white-space: nowrap;">{{ b.customer?.phone || '-' }}</td>
                <td>{{ b.customer?.email || '-' }}</td>
                <td>{{ b.note || b.customer?.note || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding: 100px 0 60px;
}
.dashboard-container {
  max-width: 1200px;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.dash-title {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-dark);
  margin-bottom: 4px;
}
.dash-sub {
  color: var(--text-light);
  font-size: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}
.metric-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow-sm);
}
.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(201, 76, 76, 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.metric-icon.blue { background: rgba(21, 101, 192, 0.1); color: #1565C0; }
.metric-icon.green { background: rgba(46, 125, 50, 0.1); color: #2E7D32; }

.metric-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.metric-value {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--text-dark);
}

.report-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.report-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0;
}
.report-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--input-bg);
  padding: 10px 16px;
  border-radius: 14px;
  border: 1.5px solid var(--border-color);
  transition: all 0.3s ease;
}
.search-box:focus-within {
  border-color: var(--primary);
  background: var(--card-bg);
  box-shadow: 0 4px 15px rgba(201, 76, 76, 0.08);
}
.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--text-dark);
  width: 200px;
}
.filter-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--input-bg);
  padding: 10px 20px;
  border-radius: 14px;
  border: 1.5px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;
}
.filter-box:hover {
  border-color: var(--primary);
  background: var(--card-bg);
  box-shadow: 0 4px 15px rgba(201, 76, 76, 0.08);
}
.filter-box .text-light, .search-box .text-light {
  color: var(--primary);
}
.filter-select {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-dark);
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  padding-right: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23C94C4C' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 14px;
}
.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(201, 76, 76, 0.2);
}
.export-btn:hover {
  background: #b34242;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201, 76, 76, 0.3);
}

.table-responsive {
  overflow-x: auto;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}
.report-table th, .report-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.report-table th {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(0,0,0,0.02);
}
.report-table td {
  font-size: 0.9rem;
  color: var(--text-dark);
  vertical-align: top;
}
.report-table tr:hover td {
  background: rgba(0,0,0,0.01);
}

.report-table td.empty-state {
  text-align: center;
  padding: 60px 24px !important;
  color: var(--text-light);
  font-style: italic;
}

.small-text {
  font-size: 0.8rem;
}
.text-light {
  color: var(--text-light);
}
.event-name {
  font-weight: 800;
  white-space: nowrap;
  font-size: 0.95rem;
}
.tag-badge {
  display: inline-block;
  background: rgba(201, 76, 76, 0.1);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  margin-top: 6px;
  white-space: nowrap;
}
.route-block {
  margin-bottom: 4px;
  font-size: 0.85rem;
}
.route-label {
  font-weight: 700;
  color: var(--primary);
}

@media (max-width: 960px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 80px 16px 40px;
  }
  .dash-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }
  .dash-title {
    font-size: 1.5rem;
  }
  .dash-sub {
    font-size: 0.9rem;
  }
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .metric-card {
    padding: 16px;
    gap: 16px;
  }
  .metric-icon {
    width: 48px;
    height: 48px;
  }
  .metric-value {
    font-size: 1.4rem;
  }
  .metric-label {
    font-size: 0.75rem;
  }
  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }
  .report-title {
    font-size: 1.1rem;
  }
  .report-actions {
    flex-direction: column;
    width: 100%;
  }
  .search-box {
    width: 100%;
  }
  .search-input {
    width: 100%;
  }
  .filter-box {
    width: 100%;
    justify-content: flex-start;
  }
  .export-btn {
    width: 100%;
    justify-content: center;
  }
  .filter-select {
    font-size: 0.85rem;
    width: 100%;
  }
  .report-table th, .report-table td {
    padding: 12px 16px;
  }
  .report-table th {
    font-size: 0.75rem;
  }
  .report-table td {
    font-size: 0.85rem;
  }
}
</style>
