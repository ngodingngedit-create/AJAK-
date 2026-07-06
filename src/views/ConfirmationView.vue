<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle, MapPin, Clock, Users, Calendar, Home, Search, ChevronRight, Bus, Ticket, CreditCard, Phone, Mail, User } from 'lucide-vue-next';
import { bookingStore } from '../store/booking';

const router = useRouter();

onMounted(() => {
  if (!bookingStore.selectedEvent || !bookingStore.bookingCode) {
    router.push('/events');
  }
});

const event = computed(() => bookingStore.selectedEvent);
const pickup = computed(() => bookingStore.selectedPickup);
const code = computed(() => bookingStore.bookingCode);
const ticket = computed(() => bookingStore.selectedTicket);
const customer = computed(() => bookingStore.customer);

const formatSeatLabel = (seatId) => {
  if (!seatId) return '';
  const match = seatId.match(/^(.*?)_(1|2)$/);
  if (match) {
    const base = match[1];
    const typeId = parseInt(match[2], 10);
    return `${base} (${typeId === 1 ? 'Pergi' : 'Pulang'})`;
  }
  return seatId;
};

const formatRp = (num) => {
  if (!num) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
};

const totalPrice = computed(() => {
  if (ticket.value && bookingStore.adults) {
    return ticket.value.price * bookingStore.adults;
  }
  return bookingStore.totalPrice || 0;
});

const getNextDay = (dateStr) => {
  if (!dateStr) return '';
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const parts = dateStr.split(' ');
  if (parts.length >= 3) {
    const day = parseInt(parts[0]);
    const monthStr = parts[1];
    const year = parseInt(parts[2]);
    const monthIdx = months.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
    if (monthIdx !== -1) {
      const dateObj = new Date(year, monthIdx, day);
      dateObj.setDate(dateObj.getDate() + 1);
      return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }
  }
  return dateStr + " (H+1)";
};

const goHome = () => {
  bookingStore.reset();
  router.push('/');
};

const browseMore = () => {
  bookingStore.reset();
  router.push('/events');
};

const termsList = [
  "Tiket yang sudah dibeli tidak bisa di refund, terkecuali ada pembatalan dari pihak penyelenggara konser atau force major",
  "Customer wajib datang tepat waktu sesuai Schedule Shuttle",
  "Keterlambatan tanpa informasi lebih dari 10 menit di anggap tidak ada / cancel otomatis",
  "Customer dilarang merokok, menggunakan rokok elektrik/sejenisnya di dalam shuttle bus",
  "Customer dilarang membawa senjata tajam dan senjata api atau sejenisnya di dalam shuttle bus",
  "Tidak menerima pembelian tiket shuttle dalam pembayaran uang tunai/cash",
  "Tidak menerima penitipan barang customer didalam shuttle bus"
];

// QR pattern cells (simulated)
const qrPattern = [1,2,3,4,5,7,11,13,15,17,19,21,22,23,24,25];
</script>

<template>
  <div class="txn-page" v-if="event && code">

    <!-- ===== HERO SECTION ===== -->
    <section class="txn-hero">
      <div class="txn-hero-bg">
        <div class="txn-hero-blob blob1"></div>
        <div class="txn-hero-blob blob2"></div>
        <div class="txn-hero-blob blob3"></div>
      </div>
      <div class="txn-hero-content">
        <!-- Success Icon -->
        <div class="success-anim">
          <div class="success-ring r1"></div>
          <div class="success-ring r2"></div>
          <div class="success-ring r3"></div>
          <CheckCircle :size="48" class="success-ico" />
        </div>

        <div class="txn-hero-text">
          <span class="txn-hero-eyebrow">Transaksi Berhasil</span>
          <h1 class="txn-hero-title">Pesanan Dikonfirmasi!</h1>
          <p class="txn-hero-sub">
            Shuttle kamu sudah siap. Selamat menikmati <strong>{{ event.name }}</strong>! 🎉
          </p>
        </div>

        <!-- Booking Code Badge -->
        <div class="booking-code-badge">
          <div class="code-badge-inner">
            <span class="code-badge-label">Kode Booking</span>
            <span class="code-badge-value">{{ code }}</span>
          </div>
          <div class="code-badge-status">
            <span class="status-dot"></span>
            <span class="status-text">Lunas</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== MAIN CONTENT ===== -->
    <div class="txn-body">
      <div class="txn-container">

        <!-- ===== LEFT / MAIN COLUMN ===== -->
        <div class="txn-main">

          <!-- E-TICKET CARD -->
          <div class="section-block">
            <div class="section-title-row">
              <Ticket :size="18" class="section-icon" />
              <h2 class="section-title">E-Tiket Shuttle</h2>
            </div>

            <div class="eticket-card">
              <!-- Ticket Header with event info -->
              <div class="eticket-header">
                <div class="eticket-event-img-wrap">
                  <img :src="event.image" :alt="event.name" class="eticket-event-img" />
                  <div class="eticket-img-overlay"></div>
                </div>
                <div class="eticket-event-info">
                  <span class="eticket-tag">{{ event.tag }}</span>
                  <h3 class="eticket-event-name">{{ event.name }}</h3>
                  <div class="eticket-meta-row">
                    <span class="eticket-meta-item"><Calendar :size="12" /> {{ event.dateLabel || event.date }}</span>
                    <span class="eticket-meta-item"><MapPin :size="12" /> {{ event.city }}</span>
                  </div>
                  <div class="eticket-category-badge" v-if="ticket">
                    {{ ticket.name }}
                  </div>
                </div>
              </div>

              <!-- Ticket Tear Line -->
              <div class="ticket-tear-line">
                <div class="notch notch-left"></div>
                <div class="tear-dashes"></div>
                <div class="notch notch-right"></div>
              </div>

              <!-- Ticket Body: QR + Details -->
              <div class="eticket-body">
                <div class="eticket-qr-section">
                  <div class="qr-wrapper">
                    <div class="qr-mock-grid">
                      <div v-for="n in 25" :key="n" class="qr-cell" :class="{ dark: qrPattern.includes(n) }"></div>
                    </div>
                  </div>
                  <span class="qr-label">Scan di pintu shuttle</span>
                </div>

                <div class="eticket-detail-section">
                  <div class="eticket-brand">AJAK!</div>
                  <div class="eticket-code">{{ code }}</div>

                  <div class="eticket-details-list">
                    <div class="eticket-detail-row">
                      <span class="ed-icon">📍</span>
                      <div>
                        <div class="ed-label">Titik Jemput</div>
                        <div class="ed-value">{{ pickup?.name }}</div>
                      </div>
                    </div>
                    <div class="eticket-detail-row" v-if="bookingStore.selectedSeats?.length > 0">
                      <span class="ed-icon">💺</span>
                      <div>
                        <div class="ed-label">Nomor Kursi</div>
                        <div class="ed-value">{{ bookingStore.selectedSeats.map(s => formatSeatLabel(s)).join(', ') }}</div>
                      </div>
                    </div>
                    <div class="eticket-detail-row">
                      <span class="ed-icon">🕑</span>
                      <div>
                        <div class="ed-label">Keberangkatan</div>
                        <div class="ed-value">12:00 WIB</div>
                      </div>
                    </div>
                    <div class="eticket-detail-row">
                      <span class="ed-icon">👥</span>
                      <div>
                        <div class="ed-label">Penumpang</div>
                        <div class="ed-value">{{ bookingStore.adults }} Orang</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BOOKING DETAILS CARD -->
          <div class="section-block">
            <div class="section-title-row">
              <Bus :size="18" class="section-icon" />
              <h2 class="section-title">Detail Pemesanan</h2>
            </div>

            <div class="details-card">
              <!-- Route visual -->
              <div class="route-visual">
                <div class="route-point">
                  <div class="route-dot start-dot"></div>
                  <div class="route-info">
                    <div class="route-label">Titik Jemput</div>
                    <div class="route-value">{{ pickup?.name }}</div>
                    <div class="route-sub">{{ pickup?.address }}</div>
                    <div class="route-time">🕑 12:00 WIB — {{ event.dateLabel || event.date }}</div>
                  </div>
                </div>
                <div class="route-line">
                  <div class="route-line-inner"></div>
                  <div class="route-bus-icon"><Bus :size="14" /></div>
                </div>
                <div class="route-point">
                  <div class="route-dot end-dot"></div>
                  <div class="route-info">
                    <div class="route-label">Tujuan Akhir</div>
                    <div class="route-value">{{ event.location }}</div>
                    <div class="route-sub">Lokasi penyelenggaraan acara</div>
                    <div class="route-time">🌙 Kepulangan 01:00 WIB — {{ getNextDay(event.dateLabel || event.date) }}</div>
                  </div>
                </div>
              </div>

              <div class="details-divider"></div>

              <!-- Info Grid -->
              <div class="detail-info-grid">
                <div class="di-item">
                  <div class="di-icon-wrap"><Users :size="16" /></div>
                  <div>
                    <div class="di-label">Penumpang</div>
                    <div class="di-value">{{ bookingStore.adults }} Dewasa{{ bookingStore.toddlers > 0 ? ` + ${bookingStore.toddlers} Balita` : '' }}</div>
                  </div>
                </div>
                <div class="di-item" v-if="bookingStore.selectedSeats?.length > 0">
                  <div class="di-icon-wrap">💺</div>
                  <div>
                    <div class="di-label">Nomor Kursi</div>
                    <div class="di-value">{{ bookingStore.selectedSeats.map(s => formatSeatLabel(s)).join(', ') }}</div>
                  </div>
                </div>
                <div class="di-item" v-if="ticket">
                  <div class="di-icon-wrap"><Ticket :size="16" /></div>
                  <div>
                    <div class="di-label">Kategori Tiket</div>
                    <div class="di-value">{{ ticket.name }}</div>
                  </div>
                </div>
                <div class="di-item">
                  <div class="di-icon-wrap"><CreditCard :size="16" /></div>
                  <div>
                    <div class="di-label">Status Pembayaran</div>
                    <div class="di-value paid">✓ Lunas</div>
                  </div>
                </div>
              </div>

              <div class="details-divider"></div>

              <!-- Price Breakdown -->
              <div class="price-breakdown">
                <div class="pb-row" v-if="ticket">
                  <span class="pb-label">{{ ticket.name }} × {{ bookingStore.adults }}</span>
                  <span class="pb-value">{{ formatRp(ticket.price * bookingStore.adults) }}</span>
                </div>
                <div class="pb-row pb-total">
                  <span class="pb-label">Total Pembayaran</span>
                  <span class="pb-value-total">{{ formatRp(totalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TERMS & CONDITIONS -->
          <div class="section-block">
            <div class="section-title-row">
              <span class="section-icon-emoji">📋</span>
              <h2 class="section-title">Syarat & Ketentuan</h2>
            </div>
            <div class="terms-card">
              <div class="terms-list">
                <div class="term-item" v-for="(term, i) in termsList" :key="i">
                  <div class="term-num">{{ String(i + 1).padStart(2, '0') }}</div>
                  <p class="term-text">{{ term }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== RIGHT / SIDEBAR COLUMN ===== -->
        <aside class="txn-sidebar">

          <!-- Customer Info Card -->
          <div class="sidebar-card">
            <div class="sc-title-row">
              <User :size="16" class="sc-icon" />
              <h3 class="sc-title">Informasi Pemesan</h3>
            </div>
            <div class="sc-info-list">
              <div class="sc-info-item">
                <div class="sc-info-icon"><User :size="14" /></div>
                <div>
                  <div class="sc-info-label">Nama Lengkap</div>
                  <div class="sc-info-value">{{ customer?.name }}</div>
                </div>
              </div>
              <div class="sc-info-item">
                <div class="sc-info-icon"><Mail :size="14" /></div>
                <div>
                  <div class="sc-info-label">Email</div>
                  <div class="sc-info-value">{{ customer?.email }}</div>
                </div>
              </div>
              <div class="sc-info-item">
                <div class="sc-info-icon"><Phone :size="14" /></div>
                <div>
                  <div class="sc-info-label">Nomor HP</div>
                  <div class="sc-info-value">+62 {{ customer?.phone }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Card -->
          <div class="sidebar-card summary-card">
            <div class="sc-title-row">
              <CreditCard :size="16" class="sc-icon" />
              <h3 class="sc-title">Ringkasan Transaksi</h3>
            </div>
            <div class="summary-event-row">
              <img :src="event.image" :alt="event.name" class="summary-event-img" />
              <div>
                <div class="summary-event-name">{{ event.name }}</div>
                <div class="summary-event-date">{{ event.dateLabel || event.date }}</div>
              </div>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-amount">
              <span class="summary-amount-label">Total Bayar</span>
              <span class="summary-amount-value">{{ formatRp(totalPrice) }}</span>
            </div>
            <div class="summary-code-row">
              <span class="summary-code-label">Kode Booking</span>
              <span class="summary-code-val">{{ code }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="sidebar-actions">
            <button class="action-btn primary" @click="browseMore">
              <Search :size="16" />
              Cari Event Lain
              <ChevronRight :size="16" />
            </button>
            <button class="action-btn secondary" @click="goHome">
              <Home :size="16" />
              Kembali ke Beranda
            </button>
          </div>
        </aside>

      </div>
    </div>

    <!-- ===== MOBILE BOTTOM ACTION BAR ===== -->
    <div class="mobile-action-bar">
      <button class="mab-btn-secondary" @click="goHome">
        <Home :size="18" />
      </button>
      <button class="mab-btn-primary" @click="browseMore">
        <Search :size="16" />
        Cari Event Lain
      </button>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ===== ROOT ===== */
.txn-page {
  min-height: 100vh;
  background: var(--bg-color, #0d0d0d);
  font-family: 'Inter', sans-serif;
  padding-bottom: 100px;
}

/* ===== HERO ===== */
.txn-hero {
  position: relative;
  padding: 80px 24px 60px;
  text-align: center;
  overflow: hidden;
  padding-top: 100px;
}
.txn-hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #0d0d0d 0%, #1a0505 60%, #0d0d0d 100%);
}
.txn-hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.blob1 {
  width: 600px; height: 600px;
  top: -200px; left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(201,76,76,0.15) 0%, transparent 70%);
}
.blob2 {
  width: 300px; height: 300px;
  bottom: -100px; left: 10%;
  background: radial-gradient(circle, rgba(255,100,50,0.08) 0%, transparent 70%);
}
.blob3 {
  width: 400px; height: 400px;
  bottom: -150px; right: 5%;
  background: radial-gradient(circle, rgba(100,50,200,0.06) 0%, transparent 70%);
}

.txn-hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Success animation */
.success-anim {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.success-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(76,175,80,0.25);
  animation: ring-expand 2.4s ease-out infinite;
}
.r2 { animation-delay: 0.6s; border-color: rgba(76,175,80,0.15); }
.r3 { animation-delay: 1.2s; border-color: rgba(76,175,80,0.08); }
@keyframes ring-expand {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}
.success-ico {
  color: #4caf50;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 24px rgba(76,175,80,0.5));
}

/* Hero text */
.txn-hero-text { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.txn-hero-eyebrow {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(76,175,80,0.9);
}
.txn-hero-title {
  font-size: clamp(1.8rem, 5vw, 3.2rem);
  font-weight: 900;
  color: #fff;
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin: 0;
}
.txn-hero-sub {
  font-size: clamp(0.85rem, 2vw, 1rem);
  color: rgba(255,255,255,0.6);
  max-width: 480px;
  line-height: 1.65;
  margin: 0;
}
.txn-hero-sub strong { color: rgba(255,255,255,0.9); }

/* Booking code badge */
.booking-code-badge {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 16px 28px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.code-badge-inner { display: flex; flex-direction: column; gap: 4px; }
.code-badge-label {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.4);
}
.code-badge-value {
  font-size: clamp(1.2rem, 3vw, 1.7rem);
  font-weight: 900;
  color: #fff;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  line-height: 1;
}
.code-badge-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-left: 20px;
  border-left: 1px solid rgba(255,255,255,0.1);
}
.status-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 10px rgba(76,175,80,0.6);
  animation: pulse-dot 2s ease infinite;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 10px rgba(76,175,80,0.6); }
  50% { box-shadow: 0 0 20px rgba(76,175,80,0.9); }
}
.status-text {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #4caf50;
}

/* ===== BODY LAYOUT ===== */
.txn-body {
  padding: 40px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.txn-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  align-items: start;
}

/* ===== SECTIONS ===== */
.section-block { margin-bottom: 24px; }
.section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.section-icon { color: var(--primary, #c94c4c); }
.section-icon-emoji { font-size: 1.1rem; }
.section-title {
  font-size: 1rem;
  font-weight: 900;
  color: var(--text-dark, #f0f0f0);
  margin: 0;
  letter-spacing: -0.3px;
}

/* ===== E-TICKET ===== */
.eticket-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #111 100%);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

/* Ticket header */
.eticket-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 24px 20px;
}
.eticket-event-img-wrap {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.eticket-event-img { width: 100%; height: 100%; object-fit: cover; }
.eticket-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201,76,76,0.25), transparent);
}
.eticket-event-info { flex: 1; min-width: 0; }
.eticket-tag {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--primary, #c94c4c);
  margin-bottom: 4px;
}
.eticket-event-name {
  font-size: clamp(0.9rem, 2vw, 1.15rem);
  font-weight: 900;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.3;
}
.eticket-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}
.eticket-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255,255,255,0.45);
}
.eticket-meta-item svg { color: var(--primary, #c94c4c); }
.eticket-category-badge {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(201,76,76,0.15);
  border: 1px solid rgba(201,76,76,0.25);
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--primary, #c94c4c);
  letter-spacing: 0.5px;
}

/* Tear line */
.ticket-tear-line {
  display: flex;
  align-items: center;
  padding: 0 -10px;
  position: relative;
}
.notch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-color, #0d0d0d);
  flex-shrink: 0;
}
.notch-left { margin-left: -10px; }
.notch-right { margin-right: -10px; }
.tear-dashes {
  flex: 1;
  border-top: 2px dashed rgba(255,255,255,0.08);
  margin: 0 4px;
}

/* Ticket body */
.eticket-body {
  display: flex;
  gap: 0;
  padding: 20px 24px 24px;
}

/* QR section */
.eticket-qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-right: 24px;
  border-right: 1px dashed rgba(255,255,255,0.08);
  margin-right: 24px;
}
.qr-wrapper {
  width: 88px;
  height: 88px;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-mock-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  width: 100%;
  height: 100%;
}
.qr-cell { border-radius: 1px; background: #e5e5e5; }
.qr-cell.dark { background: #1a1a1a; }
.qr-label {
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(255,255,255,0.3);
  text-align: center;
}

/* Detail section */
.eticket-detail-section { flex: 1; min-width: 0; }
.eticket-brand {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--primary, #c94c4c);
  text-transform: uppercase;
  margin-bottom: 2px;
}
.eticket-code {
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  font-weight: 900;
  color: #fff;
  letter-spacing: 3px;
  font-family: 'Courier New', monospace;
  line-height: 1;
  margin-bottom: 14px;
}
.eticket-details-list { display: flex; flex-direction: column; gap: 10px; }
.eticket-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.ed-icon { font-size: 0.9rem; line-height: 1.4; flex-shrink: 0; }
.ed-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.35);
  margin-bottom: 1px;
}
.ed-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  line-height: 1.3;
}

/* ===== DETAILS CARD ===== */
.details-card {
  background: var(--card-bg, #161616);
  border: 1px solid var(--border-color, rgba(255,255,255,0.06));
  border-radius: 24px;
  overflow: hidden;
}

/* Route visual */
.route-visual {
  padding: 24px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.route-point { display: flex; align-items: flex-start; gap: 14px; }
.route-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3px;
  position: relative;
  z-index: 1;
}
.start-dot { background: var(--primary, #c94c4c); box-shadow: 0 0 12px rgba(201,76,76,0.5); }
.end-dot { background: #4caf50; box-shadow: 0 0 12px rgba(76,175,80,0.5); }
.route-info { flex: 1; min-width: 0; }
.route-label {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--primary, #c94c4c);
  margin-bottom: 4px;
}
.route-value { font-size: 0.92rem; font-weight: 800; color: var(--text-dark, #f0f0f0); margin-bottom: 2px; }
.route-sub { font-size: 0.75rem; color: var(--text-light, rgba(255,255,255,0.45)); margin-bottom: 4px; }
.route-time { font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.5); }
.route-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 8px 6px;
  margin-left: 0;
}
.route-line-inner {
  width: 2px;
  height: 32px;
  background: linear-gradient(to bottom, var(--primary, #c94c4c), #4caf50);
  border-radius: 2px;
  margin-left: 0;
}
.route-bus-icon {
  color: rgba(255,255,255,0.3);
  margin-left: 16px;
}

.details-divider {
  height: 1px;
  background: var(--border-color, rgba(255,255,255,0.06));
  margin: 0 24px;
}

/* Detail info grid */
.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px 24px;
}
.di-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.di-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(201,76,76,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary, #c94c4c);
  font-size: 0.95rem;
  flex-shrink: 0;
}
.di-label {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.35);
  margin-bottom: 3px;
}
.di-value {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-dark, #f0f0f0);
}
.di-value.paid { color: #4caf50; }

/* Price breakdown */
.price-breakdown { padding: 20px 24px; }
.pb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.pb-label { font-size: 0.85rem; font-weight: 600; color: var(--text-light, rgba(255,255,255,0.55)); }
.pb-value { font-size: 0.88rem; font-weight: 700; color: var(--text-dark, #f0f0f0); }
.pb-total {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, rgba(255,255,255,0.06));
}
.pb-total .pb-label { font-size: 0.9rem; font-weight: 800; color: var(--text-dark, #f0f0f0); }
.pb-value-total { font-size: 1.25rem; font-weight: 900; color: var(--text-dark, #f0f0f0); }

/* ===== TERMS ===== */
.terms-card {
  background: var(--card-bg, #161616);
  border: 1px solid var(--border-color, rgba(255,255,255,0.06));
  border-radius: 24px;
  padding: 24px;
}
.terms-list { display: flex; flex-direction: column; gap: 14px; }
.term-item { display: flex; align-items: flex-start; gap: 14px; }
.term-num {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(201,76,76,0.1);
  border: 1px solid rgba(201,76,76,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 900;
  color: var(--primary, #c94c4c);
  flex-shrink: 0;
  letter-spacing: 0.5px;
}
.term-text {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-light, rgba(255,255,255,0.55));
  line-height: 1.6;
  margin: 0;
  padding-top: 7px;
}

/* ===== SIDEBAR ===== */
.txn-sidebar {
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background: var(--card-bg, #161616);
  border: 1px solid var(--border-color, rgba(255,255,255,0.06));
  border-radius: 20px;
  padding: 20px;
}
.sc-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.sc-icon { color: var(--primary, #c94c4c); }
.sc-title { font-size: 0.88rem; font-weight: 900; color: var(--text-dark, #f0f0f0); margin: 0; }

/* Customer info */
.sc-info-list { display: flex; flex-direction: column; gap: 12px; }
.sc-info-item { display: flex; align-items: flex-start; gap: 10px; }
.sc-info-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(201,76,76,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary, #c94c4c);
  flex-shrink: 0;
}
.sc-info-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.35);
  margin-bottom: 2px;
}
.sc-info-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-dark, #f0f0f0);
  word-break: break-word;
}

/* Summary card */
.summary-card { background: linear-gradient(135deg, #1e0808 0%, #161010 100%); }
.summary-event-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.summary-event-img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
.summary-event-name { font-size: 0.82rem; font-weight: 800; color: #fff; margin-bottom: 2px; line-height: 1.3; }
.summary-event-date { font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.4); }
.summary-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 14px 0; }
.summary-amount { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
.summary-amount-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.35); }
.summary-amount-value { font-size: 1.5rem; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
.summary-code-row { display: flex; justify-content: space-between; align-items: center; }
.summary-code-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.3); }
.summary-code-val { font-size: 0.78rem; font-weight: 900; color: rgba(255,255,255,0.7); font-family: 'Courier New', monospace; letter-spacing: 2px; }

/* Action buttons sidebar */
.sidebar-actions { display: flex; flex-direction: column; gap: 10px; }
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  width: 100%;
}
.action-btn.primary {
  background: var(--primary, #c94c4c);
  color: #fff;
  box-shadow: 0 8px 24px rgba(201,76,76,0.3);
}
.action-btn.primary:hover {
  background: #b03a3a;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(201,76,76,0.45);
}
.action-btn.secondary {
  background: var(--card-bg, #161616);
  color: var(--text-dark, #f0f0f0);
  border: 1.5px solid var(--border-color, rgba(255,255,255,0.08));
}
.action-btn.secondary:hover {
  border-color: var(--primary, #c94c4c);
  background: rgba(201,76,76,0.06);
}

/* ===== MOBILE BOTTOM BAR ===== */
.mobile-action-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 12px 16px;
  background: rgba(13,13,13,0.95);
  border-top: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  gap: 10px;
  align-items: center;
}
.mab-btn-secondary {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
  border: 1.5px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.mab-btn-secondary:hover { background: rgba(255,255,255,0.1); }
.mab-btn-primary {
  flex: 1;
  height: 48px;
  border-radius: 14px;
  background: var(--primary, #c94c4c);
  border: none;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(201,76,76,0.35);
}
.mab-btn-primary:hover { background: #b03a3a; }

/* ===== RESPONSIVE: TABLET (< 1024px) ===== */
@media (max-width: 1024px) {
  .txn-container {
    grid-template-columns: 1fr 300px;
    gap: 20px;
  }
}

/* ===== RESPONSIVE: MOBILE (< 768px) ===== */
@media (max-width: 768px) {
  .txn-page { padding-bottom: 80px; }

  .txn-hero {
    padding: 80px 16px 48px;
    padding-top: 90px;
  }

  .booking-code-badge {
    flex-direction: column;
    gap: 14px;
    padding: 16px 20px;
    width: 100%;
    max-width: 320px;
    text-align: center;
  }
  .code-badge-status {
    flex-direction: row;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 12px;
    gap: 8px;
    width: 100%;
    justify-content: center;
  }

  .txn-body { padding: 24px 16px 16px; }

  .txn-container {
    grid-template-columns: 1fr;
    gap: 0;
  }

  /* Move sidebar below main content on mobile */
  .txn-sidebar {
    position: static;
    order: -1; /* show above main on mobile */
    margin-bottom: 24px;
  }

  /* Customer info card appears inline before main tickets */
  .txn-sidebar .sidebar-card:first-child { order: 2; }
  .txn-sidebar .summary-card { order: 1; }
  .txn-sidebar .sidebar-actions { display: none; }

  /* Show mobile bottom bar */
  .mobile-action-bar { display: flex; }

  /* E-Ticket adjustments */
  .eticket-header { padding: 16px 16px 14px; gap: 12px; }
  .eticket-event-img-wrap { width: 64px; height: 64px; }

  .eticket-body {
    flex-direction: column;
    gap: 16px;
    padding: 14px 16px 20px;
  }
  .eticket-qr-section {
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding-right: 0;
    border-right: none;
    border-bottom: 1px dashed rgba(255,255,255,0.06);
    padding-bottom: 16px;
    margin-right: 0;
    margin-bottom: 0;
  }
  .qr-label { text-align: left; }

  /* Detail info grid: 1 column on mobile */
  .detail-info-grid { grid-template-columns: 1fr; gap: 12px; }

  .route-visual { padding: 16px 16px 12px; }
  .details-divider { margin: 0 16px; }
  .price-breakdown { padding: 16px 16px; }
  .detail-info-grid { padding: 16px 16px; }

  /* Terms */
  .terms-card { padding: 16px; }
  .term-num { width: 32px; height: 32px; }

  /* Sidebar card on mobile */
  .sidebar-card { padding: 16px; }
  .sc-title { font-size: 0.85rem; }
}

/* ===== RESPONSIVE: SMALL MOBILE (< 400px) ===== */
@media (max-width: 400px) {
  .eticket-meta-row { gap: 6px; }
  .eticket-event-name { font-size: 0.85rem; }
  .code-badge-value { font-size: 1.1rem; letter-spacing: 2px; }
  .summary-amount-value { font-size: 1.25rem; }
}
</style>
