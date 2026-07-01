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
  if (!invoice.value?.passengers) return null;
  return invoice.value.passengers.find(p => String(p.is_pemesan) === '1' || p.is_pemesan === true) || invoice.value.passengers[0];
});

const penumpangList = computed(() => {
  if (!invoice.value?.passengers) return [];
  return invoice.value.passengers.filter(p => p !== pemesan.value);
});

const hasIdentity = computed(() => {
  return penumpangList.value.some(p => p.identity_number && p.identity_number.trim() !== '' && p.identity_number.trim() !== '-');
});

</script>

<template>
  <div class="invoice-page">
    <div class="container invoice-container">
      <div class="top-actions print-hidden">
        <button class="btn-back" @click="router.push('/')">
          <ArrowLeft :size="20" /> Kembali ke Beranda
        </button>
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
          <div class="header-left">
            <h1 class="invoice-title">INVOICE</h1>
            <p class="invoice-no">{{ invoice.invoice_no }}</p>
          </div>
          <div class="header-right text-right">
            <div class="status-badge" :style="{ backgroundColor: statusConfig.bg, color: statusConfig.color }">
              <component :is="statusConfig.icon" :size="16" />
              <span>{{ statusConfig.label }}</span>
            </div>
            <p class="invoice-date">Tanggal: {{ formatDate(invoice.created_at) }}</p>
          </div>
        </div>

        <div class="invoice-body">
          <div class="section-block">
            <h3 class="section-title">Detail Pemesanan</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Event / Shuttle</span>
                <span class="value">{{ invoice.tickets?.[0]?.ticket?.name || 'Shuttle Reguler' }}</span>
              </div>
              <div class="detail-item" v-if="invoice.tickets?.[0]?.shuttle_session">
                <span class="label">Sesi Keberangkatan</span>
                <span class="value">{{ invoice.tickets[0].shuttle_session.name }} ({{ invoice.tickets[0].shuttle_session.departure_time }})</span>
              </div>
              <div class="detail-item" v-if="invoice.tickets?.[0]?.trip_status">
                <span class="label">Jenis Trip</span>
                <span class="value">{{ invoice.tickets[0].trip_status.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Tiket</span>
                <span class="value">{{ invoice.total_qty }} Tiket</span>
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

          <!-- Daftar Penumpang -->
          <div class="section-block" v-if="penumpangList && penumpangList.length > 0">
            <h3 class="section-title">Daftar Penumpang</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Penumpang</th>
                    <th>Kontak</th>
                    <th v-if="hasIdentity">Identitas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, idx) in penumpangList" :key="p.id || idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <strong>{{ p.passenger_name }}</strong>
                    </td>
                    <td>{{ p.phone }}<br><small>{{ p.email }}</small></td>
                    <td v-if="hasIdentity">
                      {{ p.identity_number && p.identity_number.trim() !== '' && p.identity_number.trim() !== '-' ? (p.identity_type + ' - ' + p.identity_number) : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="section-block">
            <h3 class="section-title">Rincian Tiket</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Tiket / Kursi</th>
                    <th class="text-right">Harga Satuan</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in invoice.tickets" :key="t.id">
                    <td>
                      <strong>{{ t.ticket?.name || 'Tiket Shuttle' }}</strong><br>
                      <small>
                        Kursi: {{ t.order_seat_number }}
                        <span v-if="t.shuttle_session"> | Sesi: {{ t.shuttle_session.name }}</span>
                        <span v-if="t.trip_status"> | Trip: {{ t.trip_status.name }}</span>
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
              <span>Total Harga Tiket ({{ invoice.total_qty }}x)</span>
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

        <div class="invoice-footer print-hidden">
          <button class="btn-action btn-outline" @click="downloadPdf">
            <Download :size="18" /> Unduh PDF
          </button>
          
          <button 
            v-if="invoice.payment_status === 'PENDING' && invoice.xendit_url" 
            class="btn-action btn-primary" 
            @click="continuePayment"
          >
            Lanjutkan Pembayaran <ExternalLink :size="18" />
          </button>
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
  padding: 32px 40px;
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
  padding: 40px;
}
.section-block {
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
  .invoice-header {
    flex-direction: column;
    padding: 24px;
  }
  .header-right {
    text-align: left;
  }
  .invoice-body {
    padding: 24px;
  }
  .invoice-footer {
    padding: 24px;
    flex-direction: column;
  }
  .btn-action {
    width: 100%;
    justify-content: center;
  }
  .invoice-summary-box {
    margin-left: 0;
    max-width: 100%;
  }
}
</style>
