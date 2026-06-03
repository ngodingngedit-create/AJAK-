<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Users, Ticket, DollarSign, Filter, Search } from 'lucide-vue-next';

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
});

const filterLocation = ref('Semua');

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
          <div class="filter-box">
            <Filter :size="16" class="text-light" />
            <select v-model="filterLocation" class="filter-select">
              <option v-for="loc in pickupLocations" :key="loc" :value="loc">
                {{ loc === 'Semua' ? 'Semua Titik Jemput' : loc }}
              </option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="report-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Waktu</th>
                <th>Nama Pemesan</th>
                <th>Kontak</th>
                <th>Event & Layanan</th>
                <th>Rute Perjalanan</th>
                <th>Tiket</th>
                <th>Total Bayar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredBookings.length === 0">
                <td colspan="8" class="empty-state">
                  Belum ada data pemesanan untuk filter ini.
                </td>
              </tr>
              <tr v-for="b in filteredBookings" :key="b.code">
                <td><strong>{{ b.code }}</strong></td>
                <td>{{ formatDate(b.date) }}</td>
                <td>{{ b.customer?.name || '-' }}</td>
                <td>
                  <div class="small-text">{{ b.customer?.phone || '-' }}</div>
                  <div class="small-text text-light">{{ b.customer?.email || '-' }}</div>
                </td>
                <td>
                  <div class="event-name">{{ b.event?.name || '-' }}</div>
                  <div class="tag-badge">{{ b.event?.tag || '-' }}</div>
                </td>
                <td>
                  <div class="route-block">
                    <span class="route-label">Jemput:</span> {{ b.pickup?.name !== 'Custom' ? b.pickup?.name : b.pickup?.address }}
                  </div>
                  <div class="route-block">
                    <span class="route-label">Pulang:</span> {{ b.returnLoc?.name !== 'Custom' ? b.returnLoc?.name : b.returnLoc?.address }}
                  </div>
                </td>
                <td>{{ b.adults }} Dewasa<span v-if="b.toddlers">, {{ b.toddlers }} Balita</span></td>
                <td><strong>{{ formatRp(b.totalPrice) }}</strong><br/><span class="small-text text-light">{{ b.paymentMethod }}</span></td>
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
.filter-box .text-light {
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
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
