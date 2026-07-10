<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Users, Ticket, DollarSign, Filter, Search, Download, Eye, X, Tag } from 'lucide-vue-next';

const router = useRouter();
const bookings = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/api/shuttle-order');
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json();
    if (result.success && result.data && result.data.data) {
      bookings.value = result.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch shuttle orders:', err);
  } finally {
    isLoading.value = false;
  }
});

const filterStatus = ref('Semua');
const filterSesi = ref('Semua');
const filterJenisTiket = ref('Semua');
const searchQuery = ref('');

const getSesi = (b) => {
  // Helper: extract HH:mm from departure_time
  const getTime = (timeStr) => {
    if (!timeStr) return null;
    if (typeof timeStr === 'string') {
      if (timeStr.includes('T')) {
        const tPart = timeStr.split('T')[1];
        return tPart.slice(0, 5);
      }
      return timeStr.slice(0, 5);
    }
    return null;
  };

  if (b.tickets?.[0]?.shuttle_session?.departure_time) {
    const time = getTime(b.tickets[0].shuttle_session.departure_time);
    if (time) return time;
  }
  if (b.trip && b.trip.departure_time) {
    const time = getTime(b.trip.departure_time);
    if (time) return time;
  }
  return '-';
};

const getTripStatus = (b) => {
  if (b.tickets?.[0]?.trip_status?.name) {
    return b.tickets[0].trip_status.name;
  }
  return '-';
};

const getJenisTiket = (b) => {
  if (b.tickets && b.tickets.length > 0) {
    const types = new Set(b.tickets.map(t => t.ticket?.name).filter(Boolean));
    if (types.size > 0) return Array.from(types).join(', ');
  }
  if (b.passengers && b.passengers.length > 0) {
    const types = new Set(b.passengers.map(p => p.ticket_type?.name || p.ticket_name).filter(Boolean));
    if (types.size > 0) return Array.from(types).join(', ');
  }
  return '-';
};

const getseats = (b) => {
  if (b.tickets && b.tickets.length > 0) {
    const seats = b.tickets.map(t => t.order_seat_number).filter(Boolean);
    if (seats.length > 0) return seats.join(', ');
  }
  if (b.passengers && b.passengers.length > 0) {
    const seats = b.passengers.map(p => p.seat_name || p.trip_seat?.seat_number || p.seat_number).filter(Boolean);
    if (seats.length > 0) return seats.join(', ');
  }
  return '-';
};

const paymentStatuses = computed(() => {
  const statuses = new Set();
  bookings.value.forEach(b => {
    if (b.payment_status) {
      statuses.add(b.payment_status);
    }
  });
  return ['Semua', ...Array.from(statuses)];
});

const sesiList = computed(() => {
  const sesis = new Set();
  bookings.value.forEach(b => {
    const s = getSesi(b);
    if (s && s !== '-') sesis.add(s);
  });
  return ['Semua', ...Array.from(sesis)];
});

const jenisTiketList = computed(() => {
  const jenis = new Set();
  bookings.value.forEach(b => {
    const jt = getJenisTiket(b);
    if (jt && jt !== '-') {
      jt.split(', ').forEach(j => jenis.add(j));
    }
  });
  return ['Semua', ...Array.from(jenis)];
});

// Filtered bookings
const filteredBookings = computed(() => {
  let res = [...bookings.value];
  if (filterStatus.value !== 'Semua') {
    res = res.filter(b => b.payment_status === filterStatus.value);
  }
  if (filterSesi.value !== 'Semua') {
    res = res.filter(b => getSesi(b) === filterSesi.value);
  }
  if (filterJenisTiket.value !== 'Semua') {
    res = res.filter(b => getJenisTiket(b).includes(filterJenisTiket.value));
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    res = res.filter(b => 
      b.invoice_no?.toLowerCase().includes(q) ||
      b.shuttle?.name?.toLowerCase().includes(q)
    );
  }
  return res.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

// Summary metrics
const totalTickets = computed(() => {
  return filteredBookings.value.reduce((sum, b) => {
    if (b.payment_status === 'PAID' || b.payment_status === 'SUCCESS') {
      return sum + (Number(b.total_qty) || 0);
    }
    return sum;
  }, 0);
});

const totalRevenue = computed(() => {
  return filteredBookings.value.reduce((sum, b) => {
    if (b.payment_status === 'PAID' || b.payment_status === 'SUCCESS') {
      return sum + (Number(b.total_price) || 0);
    }
    return sum;
  }, 0);
});


const perSesiDanJenisStats = computed(() => {
  const stats = {};
  filteredBookings.value.forEach(b => {
    if (b.payment_status !== 'PAID' && b.payment_status !== 'SUCCESS') return;
    const sesi = getSesi(b);
    if (sesi === '-') return;
    if (b.tickets && b.tickets.length > 0) {
      b.tickets.forEach(t => {
        const tName = t.ticket?.name || 'Tiket';
        const key = `${tName} - ${sesi}`;
        if (!stats[key]) stats[key] = { qty: 0, revenue: 0, jenisTiket: tName, sesi };
        stats[key].qty += 1;
        stats[key].revenue += Number(t.subtotal_price) || 0;
      });
    }
  });
  // Sort by session time first, then ticket type
  const sorted = Object.entries(stats).sort(([, a], [, b]) => {
    if (a.sesi !== b.sesi) return a.sesi.localeCompare(b.sesi);
    return a.jenisTiket.localeCompare(b.jenisTiket);
  });
  return Object.fromEntries(sorted);
});

const getPemesanName = (booking) => {
  // New API structure: pemesan as direct object
  if (booking.pemesan?.passenger_name) {
    return booking.pemesan.passenger_name;
  }
  if (booking.pemesan?.name) {
    return booking.pemesan.name;
  }
  // Legacy: find from passengers array
  if (booking.passengers && booking.passengers.length > 0) {
    const pemesan = booking.passengers.find(p => p.is_pemesan);
    return pemesan ? pemesan.passenger_name : booking.passengers[0].passenger_name;
  }
  return booking.customer?.name || '-';
};

const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');
const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const exportExcel = () => {
    const headers = [
      'Tanggal Transaksi', 'Invoice No', 'Pemesan', 'Shuttle', 'Deskripsi', 
      'Sesi', 'Jenis Tiket', 'seat',
      'Qty', 'Total Price', 'Status'
    ];
  
    const rows = filteredBookings.value.map(b => {
      return [
        `"${formatDate(b.created_at)}"`,
        `"${b.invoice_no || '-'}"`,
        `"${getPemesanName(b)}"`,
        `"${b.shuttle?.name || '-'}"`,
        `"${b.shuttle?.description || '-'}"`,
        `"${getSesi(b)}"`,
        `"${getJenisTiket(b)}"`,
        `"${getseats(b)}"`,
      b.total_qty || 0,
      b.total_price || 0,
      `"${b.payment_status || '-'}"`
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(',') + "\n"
    + rows.map(e => e.join(',')).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Data_Penjualan_Tiket_AJAK_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const isModalOpen = ref(false);
const invoiceLoading = ref(false);
const selectedInvoice = ref(null);

const selectedInvoiceTickets = computed(() => {
  if (!selectedInvoice.value) return [];
  
  if (selectedInvoice.value.etickets && Array.isArray(selectedInvoice.value.etickets) && selectedInvoice.value.etickets.length > 0) {
    return selectedInvoice.value.etickets.map(et => {
      const ticketObj = et.ticket || {};
      return {
        id: et.id,
        order_seat_number: ticketObj.order_seat_number || '-',
        price: Number(ticketObj.price || 0),
        ticket_fee: Number(ticketObj.ticket_fee || 0),
        subtotal_price: Number(ticketObj.subtotal_price || 0),
        ticket: ticketObj.ticket || {},
        shuttle_session: et.shuttle_session || ticketObj.shuttle_session || null,
        trip_status: ticketObj.trip_status || null,
        passenger_name: et.passenger?.passenger_name || et.passenger?.name || '-'
      };
    });
  }
  
  if (selectedInvoice.value.tickets && Array.isArray(selectedInvoice.value.tickets)) {
    return selectedInvoice.value.tickets;
  }
  
  return [];
});

const viewInvoice = async (invoiceNo) => {
  isModalOpen.value = true;
  invoiceLoading.value = true;
  selectedInvoice.value = null;
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shuttle-order/${invoiceNo}`);
    const result = await response.json();
    if (result.success && result.data) {
      const detail = result.data;
      const listItem = bookings.value.find(b => b.invoice_no === invoiceNo);
      if (listItem) {
        if ((!detail.tickets || detail.tickets.length === 0) && (!detail.etickets || detail.etickets.length === 0)) {
          detail.tickets = listItem.tickets || [];
        }
        if (!detail.passengers || detail.passengers.length === 0) {
          detail.passengers = listItem.passengers || (listItem.pemesan ? [listItem.pemesan] : []);
        }
        if (!detail.pemesan) {
          detail.pemesan = listItem.pemesan || null;
        }
      }
      selectedInvoice.value = detail;
    }
  } catch (err) {
    console.error('Failed to fetch invoice detail', err);
  } finally {
    invoiceLoading.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedInvoice.value = null;
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

      <!-- Metrics + Statistik per Sesi & per Jenis Tiket -->
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
            <div class="metric-label">Total Tiket Terjual</div>
            <div class="metric-value">{{ totalTickets }}</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon green"><span style="font-weight: 900; font-size: 1.1rem;">Rp</span></div>
          <div class="metric-info">
            <div class="metric-label">Total Pendapatan</div>
            <div class="metric-value">{{ formatRp(totalRevenue) }}</div>
          </div>
        </div>
        <div v-for="(stat, key) in perSesiDanJenisStats" :key="key" class="metric-card">
          <div class="metric-icon"><Tag :size="24" /></div>
          <div class="metric-info">
            <div class="metric-label">{{ stat.jenisTiket }} — {{ stat.sesi }} WIB</div>
            <div class="metric-value">{{ stat.qty }} tiket</div>
            <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-light);">{{ formatRp(stat.revenue) }}</div>
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
              <select v-model="filterStatus" class="filter-select">
                <option v-for="status in paymentStatuses" :key="status" :value="status">
                  {{ status === 'Semua' ? 'Semua Status' : status }}
                </option>
              </select>
            </div>
            <div class="filter-box">
              <select v-model="filterSesi" class="filter-select">
                <option v-for="sesi in sesiList" :key="sesi" :value="sesi">
                  {{ sesi === 'Semua' ? 'Semua Sesi' : sesi }}
                </option>
              </select>
            </div>
            <div class="filter-box">
              <select v-model="filterJenisTiket" class="filter-select">
                <option v-for="jt in jenisTiketList" :key="jt" :value="jt">
                  {{ jt === 'Semua' ? 'Semua Jenis Tiket' : jt }}
                </option>
              </select>
            </div>
            <button class="export-btn" @click="exportExcel">
              <Download :size="16" />
              Export Excel
            </button>
          </div>
        </div>

        <div class="table-responsive" style="max-height: 600px; overflow-y: auto; overflow-x: auto;">
          <table class="report-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Invoice No</th>
                <th>Pemesan</th>
                <th>Shuttle</th>
                <th>Deskripsi</th>
                <th>Sesi</th>
                <th>Trip</th>
                <th>Jenis Tiket</th>
                <th>seat</th>
                <th>Qty</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="14" class="empty-state">Loading data...</td>
              </tr>
              <tr v-else-if="filteredBookings.length === 0">
                <td colspan="14" class="empty-state">
                  Belum ada data pemesanan untuk filter ini.
                </td>
              </tr>
              <tr v-for="b in filteredBookings" :key="b.id">
                <td style="white-space: nowrap;">{{ formatDate(b.created_at) }}</td>
                <td style="white-space: nowrap;"><strong>{{ b.invoice_no }}</strong></td>
                <td style="white-space: nowrap;">{{ getPemesanName(b) }}</td>
                <td class="event-name" style="white-space: nowrap;">{{ b.shuttle?.name || '-' }}</td>
                <td style="white-space: nowrap;">{{ b.shuttle?.description || '-' }}</td>
                <td style="white-space: nowrap;">{{ getSesi(b) }}</td>
                <td style="white-space: nowrap;">{{ getTripStatus(b) }}</td>
                <td style="white-space: nowrap;">{{ getJenisTiket(b) }}</td>
                <td style="white-space: nowrap; max-width: 150px; overflow: hidden; text-overflow: ellipsis;" :title="getseats(b)">{{ getseats(b) }}</td>
                <td>{{ b.total_qty }}</td>
                <td style="white-space: nowrap;"><strong>{{ formatRp(b.total_price) }}</strong></td>
                <td>
                  <span class="tag-badge">{{ b.payment_status }}</span>
                </td>
                <td>
                  <button class="btn-icon" @click="viewInvoice(b.invoice_no)" title="Lihat Detail">
                    <Eye :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Invoice Modal -->
    <transition name="modal-fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Detail Invoice</h3>
            <button class="btn-close" @click="closeModal"><X :size="20" /></button>
          </div>
          
          <div class="modal-body" v-if="invoiceLoading">
            <div class="loading-state">Memuat data invoice...</div>
          </div>
          
          <div class="modal-body" v-else-if="selectedInvoice">
            <div class="invoice-meta">
              <div class="meta-group">
                <label>No. Invoice</label>
                <strong>{{ selectedInvoice.invoice_no }}</strong>
              </div>
              <div class="meta-group">
                <label>Tanggal Transaksi</label>
                <span>{{ formatDate(selectedInvoice.created_at) }}</span>
              </div>
              <div class="meta-group">
                <label>Status Pembayaran</label>
                <span class="tag-badge">{{ selectedInvoice.payment_status }}</span>
              </div>
            </div>

            <div class="invoice-section">
              <h4>Detail Penumpang</h4>
              <div class="passenger-list">
                <div v-for="(p, idx) in selectedInvoice.passengers" :key="p.id" class="passenger-item">
                  <div class="p-index">{{ idx + 1 }}</div>
                  <div class="p-info">
                    <strong>{{ p.passenger_name }} <span v-if="p.is_pemesan" class="badge-pemesan">Pemesan</span></strong>
                    <span>{{ p.phone }} | {{ p.email }}</span>
                    <span>{{ p.identity_type }} - {{ p.identity_number }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="invoice-section">
              <h4>Detail Tiket</h4>
              <div class="ticket-list">
                <div v-for="t in selectedInvoiceTickets" :key="t.id" class="ticket-item">
                  <div class="t-main">
                    <strong>{{ t.ticket?.name || 'Tiket Shuttle' }}</strong>
                    <span class="t-seat">
                      seat: {{ t.order_seat_number }}
                      <span v-if="t.shuttle_session"> | Sesi: {{ t.shuttle_session.name }}</span>
                      <span v-if="t.trip_status"> | Trip: {{ t.trip_status.name }}</span>
                    </span>
                  </div>
                  <div class="t-price">
                    {{ formatRp(t.subtotal_price) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="invoice-summary">
              <div class="summary-row">
                <span>Total Tiket ({{ selectedInvoiceTickets.length }}x)</span>
                <span>{{ formatRp(selectedInvoice.total_price) }}</span>
              </div>
              <div class="summary-row">
                <span>Biaya Admin</span>
                <span>{{ formatRp(selectedInvoice.admin_fee) }}</span>
              </div>
              <div class="summary-row grand-total">
                <span>Grand Total</span>
                <span>{{ formatRp(selectedInvoice.grandtotal) }}</span>
              </div>
            </div>
          </div>
          
          <div class="modal-body" v-else>
            <div class="error-state">Data tidak ditemukan.</div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding: 100px 0 60px;
}
.dashboard-container {
  max-width: 1400px;
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
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

/* Stats section — reused .metric-card, .metrics-grid from above */
.metric-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
}
.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(201, 76, 76, 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.metric-icon.blue { background: rgba(21, 101, 192, 0.1); color: #1565C0; }
.metric-icon.green { background: rgba(46, 125, 50, 0.1); color: #2E7D32; }

.metric-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  margin-bottom: 2px;
}
.metric-value {
  font-size: 1.1rem;
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

/* Button Icon */
.btn-icon {
  background: rgba(201, 76, 76, 0.1);
  color: var(--primary);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-icon:hover {
  background: var(--primary);
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 16px;
}
.modal-card {
  background: var(--card-bg);
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}
.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-dark);
}
.btn-close {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
}
.btn-close:hover {
  color: var(--primary);
}
.modal-body {
  padding: 24px;
  overflow-y: auto;
}
.loading-state, .error-state {
  text-align: center;
  padding: 40px;
  color: var(--text-light);
}
.invoice-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  background: var(--input-bg);
  padding: 16px;
  border-radius: 12px;
}
.meta-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-group label {
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  font-weight: 700;
}
.invoice-section {
  margin-bottom: 24px;
}
.invoice-section h4 {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--text-dark);
}
.passenger-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 8px;
}
.p-index {
  background: var(--primary);
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.p-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-light);
}
.p-info strong {
  color: var(--text-dark);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.badge-pemesan {
  background: rgba(46, 125, 50, 0.1);
  color: #2E7D32;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 800;
}
.ticket-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed var(--border-color);
}
.t-main {
  display: flex;
  flex-direction: column;
}
.t-main strong {
  color: var(--text-dark);
}
.t-seat {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 4px;
}
.t-price {
  font-weight: 700;
  color: var(--text-dark);
}
.invoice-summary {
  background: var(--input-bg);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-light);
}
.summary-row.grand-total {
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
  margin-top: 4px;
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--text-dark);
}
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
