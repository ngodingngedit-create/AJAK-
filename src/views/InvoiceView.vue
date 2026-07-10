<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle, Clock, AlertCircle, ArrowLeft, Download, ExternalLink } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const invoiceNo = route.params.invoice_no;
const invoice = ref(null);
const isLoading = ref(true);
const errorMsg = ref('');

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shuttle-order/${invoiceNo}`);
    if (!res.ok) throw new Error('Invoice tidak ditemukan.');
    const result = await res.json();
    if (result.success && result.data) {
      invoice.value = result.data;
    } else {
      errorMsg.value = 'Data invoice tidak valid.';
    }
  } catch (err) {
    console.error(err);
    errorMsg.value = 'Gagal mengambil data invoice.';
  } finally {
    isLoading.value = false;
  }
});

const formatRp = (num) => {
  if (num == null) return 'Rp 0';
  return 'Rp ' + Number(num).toLocaleString('id-ID');
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getStatusConfig = (status) => {
  switch(status?.toUpperCase()) {
    case 'SUCCESS':
    case 'PAID':
      return { color: '#2E7D32', bg: 'rgba(46, 125, 50, 0.1)', icon: CheckCircle, label: 'LUNAS' };
    case 'PENDING':
      return { color: '#F57C00', bg: 'rgba(245, 124, 0, 0.1)', icon: Clock, label: 'MENUNGGU PEMBAYARAN' };
    default:
      return { color: '#C94C4C', bg: 'rgba(201, 76, 76, 0.1)', icon: AlertCircle, label: status || 'FAILED' };
  }
};

const statusConfig = computed(() => getStatusConfig(invoice.value?.payment_status));

const downloadPdf = () => {
  const url = `${import.meta.env.VITE_API_URL}/api/shuttle-order/download/${invoiceNo}`;
  window.open(url, '_blank');
};

const continuePayment = () => {
  if (invoice.value?.xendit_url) {
    window.location.href = invoice.value.xendit_url;
  }
};

const pemesan = computed(() => {
  if (!invoice.value) return null;
  if (invoice.value.pemesan) {
    return invoice.value.pemesan;
  }
  if (invoice.value.passengers && invoice.value.passengers.length > 0) {
    return invoice.value.passengers.find(p => String(p.is_pemesan) === '1' || p.is_pemesan === true) || invoice.value.passengers[0];
  }
  if (invoice.value.etickets && Array.isArray(invoice.value.etickets)) {
    const found = invoice.value.etickets.find(et => et.passenger && (String(et.passenger.is_pemesan) === '1' || et.passenger.is_pemesan === true));
    if (found) return found.passenger;
    if (invoice.value.etickets[0]?.passenger) return invoice.value.etickets[0].passenger;
  }
  return null;
});

const penumpangList = computed(() => {
  if (!invoice.value?.passengers) return [];
  return invoice.value.passengers.filter(p => p !== pemesan.value);
});
const hasIdentity = computed(() => {
  return penumpangList.value.some(p => p.identity_number && p.identity_number.trim() !== '' && p.identity_number.trim() !== '-');
});

const tickets = computed(() => {
  if (!invoice.value) return [];
  
  if (invoice.value.etickets && Array.isArray(invoice.value.etickets) && invoice.value.etickets.length > 0) {
    return invoice.value.etickets.map(et => {
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
        passenger_name: et.passenger?.passenger_name || et.passenger?.name || '-',
        journey_type: et.journey_type || null
      };
    });
  }
  
  if (invoice.value.tickets && Array.isArray(invoice.value.tickets)) {
    return invoice.value.tickets.map((t, idx) => {
      let name = '-';
      if (invoice.value.passengers && invoice.value.passengers.length > 0) {
        if (invoice.value.passengers.length === 1) {
          name = invoice.value.passengers[0].passenger_name || invoice.value.passengers[0].name || '-';
        } else if (invoice.value.tickets.length === invoice.value.passengers.length) {
          name = invoice.value.passengers[idx]?.passenger_name || invoice.value.passengers[idx]?.name || '-';
        } else {
          name = invoice.value.passengers[idx % invoice.value.passengers.length]?.passenger_name || '-';
        }
      }
      return {
        ...t,
        passenger_name: name
      };
    });
  }
  
  return [];
});
</script>

<template>
  <div class="invoice-page">
    <div class="container invoice-container">
      <div class="top-actions print-hidden" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <button class="btn-back" @click="router.push('/')">
          <ArrowLeft :size="20" /> Kembali ke Beranda
        </button>
        <div v-if="invoice" style="display: flex; gap: 12px;">
        </div>
      </div>

      <div class="invoice-card" v-if="isLoading">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Memuat invoice...</p>
        </div>
      </div>

      <div class="invoice-card" v-else-if="errorMsg">
        <div class="error-state">
          <AlertCircle :size="48" />
          <p>{{ errorMsg }}</p>
        </div>
      </div>

      <div class="invoice-card" v-else-if="invoice">
        <div class="invoice-header">
          <div class="header-left" style="width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <h1 class="invoice-title">INVOICE</h1>
              <div class="status-badge" :style="{ backgroundColor: statusConfig.bg, color: statusConfig.color }">
                <component :is="statusConfig.icon" :size="14" />
                <span>{{ statusConfig.label }}</span>
              </div>
            </div>
            <p class="invoice-no">{{ invoice.invoice_no }}</p>
          </div>
          <div class="header-right text-right">
            <p class="invoice-date">Tanggal: {{ formatDate(invoice.created_at) }}</p>
          </div>
        </div>
        <div class="action-area" v-if="invoice.payment_status === 'PENDING' && invoice.xendit_url" style="padding: 16px 40px 0;">
          <button 
            class="btn-action btn-primary" 
            @click="continuePayment"
            style="width: 100%; justify-content: center;"
          >
            Lanjutkan Pembayaran <ExternalLink :size="18" />
          </button>
        </div>
        <div class="invoice-body">
          <div class="invoice-body-actions print-hidden" v-if="invoice.payment_status?.toUpperCase() === 'PAID' || invoice.payment_status?.toUpperCase() === 'SUCCESS'">
            <button class="btn-action btn-outline" @click="downloadPdf">
              <Download :size="18" /> Unduh PDF
            </button>
          </div>
          <div class="section-block">
            <h3 class="section-title">Detail Pemesanan</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Event / Shuttle</span>
                <span class="value">{{ tickets?.[0]?.ticket?.name || 'Shuttle Reguler' }}</span>
              </div>
              <div class="detail-item" v-if="tickets?.[0]?.shuttle_session">
                <span class="label">Sesi Keberangkatan</span>
                <span class="value">{{ tickets[0].shuttle_session.name }} ({{ tickets[0].shuttle_session.departure_time }})</span>
              </div>
              <div class="detail-item" v-if="tickets?.[0]?.trip_status">
                <span class="label">Jenis Trip</span>
                <span class="value">{{ tickets[0].trip_status.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Tiket</span>
                <span class="value">{{ tickets.length }} Tiket</span>
              </div>
              <div class="detail-item" v-if="invoice.xendit_expiry_date && invoice.payment_status === 'PENDING'">
                <span class="label">Batas Pembayaran</span>
                <span class="value" style="color: #F57C00; font-weight: bold;">{{ invoice.xendit_expiry_date }}</span>
              </div>
            </div>
          </div>

          <!-- Data Pemesan -->
          <div class="section-block" v-if="pemesan">
            <h3 class="section-title">Data Pemesan</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Nama Lengkap</span>
                <span class="value">{{ pemesan.passenger_name || pemesan.name || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email</span>
                <span class="value">{{ pemesan.email || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Nomor Telepon</span>
                <span class="value">{{ pemesan.phone || pemesan.no_telp || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="section-block">
            <h3 class="section-title">Rincian Tiket</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Penumpang</th>
                    <th>Tiket / seat</th>
                    <th class="text-right">Harga Satuan</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(t, idx) in tickets" :key="t.id">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <strong>{{ t.passenger_name }}</strong>
                    </td>
                    <td>
                      <strong>{{ t.ticket?.name || 'Tiket Shuttle' }}</strong><br>
                      <small>
                        seat: {{ t.order_seat_number }}
                        <span v-if="t.shuttle_session"> | Sesi: {{ t.shuttle_session.name }}</span>
                        <span v-if="t.trip_status || t.journey_type"> | Trip: {{ t.journey_type || t.trip_status.name }}</span>
                      </small>
                    </td>
                    <td class="text-right">{{ formatRp(t.price + (t.ticket_fee || 0)) }}</td>
                    <td class="text-right">{{ formatRp(t.subtotal_price) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="invoice-summary-box">
            <div class="summary-row">
              <span>Total Harga Tiket ({{ tickets.length }}x)</span>
              <span>{{ formatRp(invoice.total_price) }}</span>
            </div>
            <div class="summary-row" v-if="invoice.total_voucher > 0">
              <span>Diskon / Voucher</span>
              <span class="text-green">- {{ formatRp(invoice.total_voucher) }}</span>
            </div>
            <div class="summary-row">
              <span>Biaya Layanan / Admin</span>
              <span>{{ formatRp(invoice.admin_fee) }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row grand-total">
              <span>Grand Total</span>
              <span>{{ formatRp(invoice.grandtotal) }}</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped>
.invoice-page {
  min-height: 100vh;
  background: var(--bg-color, #f8f9fa);
  padding: 100px 16px 60px;
  font-family: 'Inter', sans-serif;
}
.invoice-container {
  max-width: 800px;
  margin: 0 auto;
}
.top-actions {
  margin-bottom: 24px;
}
.btn-back {
  background: none;
  border: none;
  color: var(--text-light, #666);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.btn-back:hover {
  color: var(--primary, #C94C4C);
}

.invoice-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid var(--border-color, #eaeaea);
}

.loading-state, .error-state {
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-light, #666);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(201, 76, 76, 0.2);
  border-top-color: var(--primary, #C94C4C);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-state {
  color: var(--primary, #C94C4C);
}

.invoice-header {
  padding: 20px 40px 16px;
  border-bottom: 2px dashed var(--border-color, #eaeaea);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}
.invoice-title {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-dark, #222);
  letter-spacing: 2px;
}
.invoice-no {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-light, #666);
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 30px;
  font-weight: 800;
  font-size: 0.85rem;
  margin-bottom: 8px;
}
.invoice-date {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-light, #666);
}

.invoice-body {
  padding: 16px 40px 40px;
}
.invoice-body-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0px;
}
.section-block {
  margin-top: 24px;
  margin-bottom: 32px;
}
.section-title {
  margin: 0 0 16px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-dark, #222);
  border-bottom: 2px solid var(--primary, #C94C4C);
  display: inline-block;
  padding-bottom: 4px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  background: var(--input-bg, #f4f6f8);
  padding: 20px;
  border-radius: 12px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-item .label {
  font-size: 0.8rem;
  color: var(--text-light, #666);
  text-transform: uppercase;
  font-weight: 700;
}
.detail-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark, #222);
}

.table-responsive {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #eaeaea);
  text-align: left;
  white-space: nowrap;
}
.data-table th {
  background: var(--input-bg, #f4f6f8);
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-light, #666);
  text-transform: uppercase;
}
.data-table td {
  font-size: 0.95rem;
  color: var(--text-dark, #222);
  vertical-align: top;
}
.text-right {
  text-align: right !important;
}
.text-green {
  color: #2E7D32 !important;
}

.badge-pemesan {
  display: inline-block;
  background: rgba(46, 125, 50, 0.1);
  color: #2E7D32;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 800;
  margin-left: 8px;
  vertical-align: middle;
}

.invoice-summary-box {
  margin-top: 32px;
  background: var(--input-bg, #f4f6f8);
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  margin-left: auto;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.95rem;
  color: var(--text-light, #666);
}
.summary-row:last-child {
  margin-bottom: 0;
}
.summary-divider {
  height: 1px;
  background: var(--border-color, #eaeaea);
  margin: 16px 0;
}
.grand-total {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--primary, #C94C4C);
}

.invoice-footer {
  padding: 32px 40px;
  background: rgba(0,0,0,0.02);
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  border-top: 1px solid var(--border-color, #eaeaea);
}
.btn-action {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-outline {
  background: transparent;
  border: 2px solid var(--border-color, #eaeaea);
  color: var(--text-dark, #222);
}
.btn-outline:hover {
  background: var(--border-color, #eaeaea);
}
.btn-primary {
  background: var(--primary, #C94C4C);
  border: 2px solid var(--primary, #C94C4C);
  color: white;
}
.btn-primary:hover {
  background: #a93c3c;
  border-color: #a93c3c;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(201, 76, 76, 0.3);
}

@media print {
  .invoice-page {
    padding: 0;
    background: white;
  }
  .print-hidden {
    display: none !important;
  }
  .invoice-card {
    box-shadow: none;
    border: none;
  }
  .invoice-summary-box {
    background: transparent;
    padding: 0;
  }
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .invoice-header {
    padding: 20px;
  }
  .invoice-body {
    padding: 16px 20px 40px;
  }
  .btn-action {
    width: 100%;
    justify-content: center;
  }
  .invoice-title {
    font-size: 1.5rem;
  }
  .invoice-no {
    font-size: 0.9rem;
  }
}
</style>
