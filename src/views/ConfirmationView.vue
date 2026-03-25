<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle, MapPin, Clock, Users, Calendar, Download, ArrowRight, Home } from 'lucide-vue-next';
import { bookingStore } from '../store/booking';

const router = useRouter();

onMounted(() => {
  if (!bookingStore.selectedEvent || !bookingStore.bookingCode) {
    router.push('/events');
  }
});

const event = computed(() => bookingStore.selectedEvent);
const pickup = computed(() => bookingStore.selectedPickup);
const schedule = computed(() => bookingStore.selectedSchedule);
const code = computed(() => bookingStore.bookingCode);

const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

const totalRide = computed(() => {
  if (!schedule.value) return 0;
  return schedule.value.pricePerPax * bookingStore.adults;
});

const goHome = () => {
  bookingStore.reset();
  router.push('/');
};

const browseMore = () => {
  bookingStore.reset();
  router.push('/events');
};
</script>

<template>
  <div class="confirm-page" v-if="event && code">
    <!-- Success Header -->
    <section class="confirm-hero">
      <div class="confirm-hero-bg"></div>
      <div class="confirm-hero-content">
        <div class="success-anim">
          <div class="success-ring"></div>
          <div class="success-ring ring2"></div>
          <CheckCircle :size="52" class="success-ico" />
        </div>
        <h1 class="confirm-title">Pesanan Dikonfirmasi!</h1>
        <p class="confirm-sub">Ride kamu sudah siap. Selamat menikmati {{ event.name }}! 🎉</p>
        <div class="booking-code-badge">
          <span class="code-label">Kode Booking</span>
          <span class="code-value">{{ code }}</span>
        </div>
      </div>
    </section>

    <div class="container confirm-body">
      <!-- Booking Detail Card -->
      <div class="confirm-card">
        <div class="cc-header">
          <div class="cc-event-img">
            <img :src="event.image" :alt="event.name" />
            <div class="cc-img-overlay"></div>
          </div>
          <div class="cc-event-info">
            <span class="cc-tag">{{ event.tag }}</span>
            <h2 class="cc-event-name">{{ event.name }}</h2>
            <div class="cc-event-meta">
              <span><Calendar :size="13" /> {{ event.dateLabel }}</span>
              <span><Clock :size="13" /> {{ event.time }}</span>
              <span><MapPin :size="13" /> {{ event.location }}, {{ event.city }}</span>
            </div>
          </div>
        </div>

        <div class="cc-divider cc-divider-dashed"></div>

        <div class="cc-details-grid">
          <div class="cc-detail-item">
            <div class="cc-detail-icon"><MapPin :size="18" /></div>
            <div>
              <div class="cc-detail-label">Titik Jemput</div>
              <div class="cc-detail-value">{{ pickup?.name }}</div>
              <div class="cc-detail-sub">{{ pickup?.address }}</div>
            </div>
          </div>

          <div class="cc-detail-item">
            <div class="cc-detail-icon"><Clock :size="18" /></div>
            <div>
              <div class="cc-detail-label">Jadwal Keberangkatan</div>
              <div class="cc-detail-value">{{ schedule?.time }} ({{ schedule?.label }})</div>
              <div class="cc-detail-sub">{{ event.dateLabel }}</div>
            </div>
          </div>

          <div class="cc-detail-item">
            <div class="cc-detail-icon"><Users :size="18" /></div>
            <div>
              <div class="cc-detail-label">Penumpang</div>
              <div class="cc-detail-value">{{ bookingStore.adults }} Dewasa{{ bookingStore.toddlers > 0 ? ` + ${bookingStore.toddlers} Balita` : '' }}</div>
            </div>
          </div>

          <div class="cc-detail-item">
            <div class="cc-detail-icon">💳</div>
            <div>
              <div class="cc-detail-label">Status Pembayaran</div>
              <div class="cc-detail-value green">✓ Lunas</div>
            </div>
          </div>
        </div>

        <div class="cc-divider"></div>

        <!-- Price -->
        <div class="cc-price-row">
          <span class="cc-price-label">Total Ride</span>
          <span class="cc-price-total">{{ formatRp(totalRide) }}</span>
        </div>

        <!-- Ticket QR Mockup -->
        <div class="cc-ticket-area">
          <div class="cc-ticket-card">
            <div class="ticket-left">
              <div class="ticket-code-label">Scan di pintu shuttle</div>
              <div class="qr-mock">
                <div class="qr-inner">
                  <div class="qr-grid">
                    <div v-for="n in 25" :key="n" class="qr-cell" :class="{ dark: [1,2,3,4,5,7,11,13,15,17,19,21,22,23,24,25].includes(n) }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="ticket-sep">
              <div class="ticket-notch top"></div>
              <div class="ticket-dashes"></div>
              <div class="ticket-notch bottom"></div>
            </div>
            <div class="ticket-right">
              <div class="ticket-ajak">AJAK!</div>
              <div class="ticket-code-big">{{ code }}</div>
              <div class="ticket-event-nm">{{ event.name }}</div>
              <div class="ticket-pickup">📍 {{ pickup?.name }}</div>
              <div class="ticket-dep">🕑 {{ schedule?.time }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- What's Next -->
      <div class="whats-next">
        <h3 class="wn-title">Yang Perlu Kamu Tahu</h3>
        <div class="wn-steps">
          <div class="wn-step">
            <div class="wn-num">01</div>
            <div>
              <div class="wn-step-title">Datang 15 menit lebih awal</div>
              <div class="wn-step-desc">Ke titik jemput sebelum jadwal keberangkatan untuk memastikan kursimu.</div>
            </div>
          </div>
          <div class="wn-step">
            <div class="wn-num">02</div>
            <div>
              <div class="wn-step-title">Tunjukkan kode booking</div>
              <div class="wn-step-desc">Scan QR atau tunjukkan kode <strong>{{ code }}</strong> ke petugas AJAK! di lokasi.</div>
            </div>
          </div>
          <div class="wn-step">
            <div class="wn-num">03</div>
            <div>
              <div class="wn-step-title">Nikmati perjalananmu!</div>
              <div class="wn-step-desc">Duduk, relax, dan biarkan AJAK! yang mengantarmu ke {{ event.location }}.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="confirm-actions">
        <button class="action-btn outline" @click="goHome">
          <Home :size="18" />
          Kembali ke Beranda
        </button>
        <button class="action-btn primary" @click="browseMore">
          Cari Event Lain <ArrowRight :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== HERO ===== */
.confirm-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
  padding-top: 80px;
}

.confirm-hero {
  position: relative;
  padding: 60px 24px 80px;
  text-align: center;
  overflow: hidden;
}
.confirm-hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 100%);
}
.confirm-hero-bg::before {
  content: '';
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(46,125,50,0.2) 0%, transparent 65%);
}

.confirm-hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Success animation */
.success-anim {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}
.success-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(46,125,50,0.3);
  animation: ring-pulse 2s ease infinite;
}
.ring2 {
  animation-delay: 0.5s;
  border-color: rgba(46,125,50,0.15);
}
@keyframes ring-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}
.success-ico { color: #4caf50; position: relative; z-index: 2; filter: drop-shadow(0 0 20px rgba(76,175,80,0.4)); }

.confirm-title {
  font-size: 2.8rem;
  font-weight: 900;
  color: white;
  letter-spacing: -1.5px;
  margin-bottom: 12px;
}
.confirm-sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.65);
  max-width: 440px;
  margin-bottom: 32px;
  line-height: 1.6;
}

.booking-code-badge {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 14px 28px;
  backdrop-filter: blur(10px);
}
.code-label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.5);
}
.code-value {
  font-size: 1.6rem;
  font-weight: 900;
  color: white;
  letter-spacing: 3px;
  font-family: 'Courier New', monospace;
}

/* ===== CONFIRM CARD ===== */
.confirm-body { padding: 40px 24px 20px; max-width: 800px; margin: 0 auto; }

.confirm-card {
  background: var(--card-bg);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  margin-bottom: 28px;
}

/* Card header */
.cc-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 28px;
}
.cc-event-img {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.cc-event-img img { width: 100%; height: 100%; object-fit: cover; }
.cc-img-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(201,76,76,0.2), transparent); }
.cc-tag {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--primary);
  margin-bottom: 6px;
}
.cc-event-name {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--text-dark);
  letter-spacing: -0.5px;
  margin-bottom: 12px;
}
.cc-event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-light);
}
.cc-event-meta span { display: flex; align-items: center; gap: 5px; }
.cc-event-meta svg { color: var(--primary); }

/* Dividers */
.cc-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0 28px;
}
.cc-divider-dashed {
  background: none;
  border-top: 2px dashed var(--border-color);
}

/* Details grid */
.cc-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 28px;
}
.cc-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.cc-detail-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(201,76,76,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 1.1rem;
  flex-shrink: 0;
}
.cc-detail-label {
  font-size: 0.66rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--primary);
  margin-bottom: 4px;
}
.cc-detail-value { font-size: 0.92rem; font-weight: 800; color: var(--text-dark); margin-bottom: 2px; }
.cc-detail-value.green { color: #2e7d32; }
.cc-detail-sub { font-size: 0.78rem; color: var(--text-light); }

/* Price row */
.cc-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
}
.cc-price-label { font-size: 0.88rem; font-weight: 700; color: var(--text-light); }
.cc-price-total { font-size: 1.4rem; font-weight: 900; color: var(--text-dark); }

/* ===== TICKET ===== */
.cc-ticket-area { padding: 0 28px 28px; }
.cc-ticket-card {
  display: flex;
  background: #1a1a1a;
  border-radius: 20px;
  overflow: hidden;
  min-height: 160px;
}
.ticket-left {
  flex: 0 0 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 10px;
}
.ticket-code-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.4);
  text-align: center;
}
.qr-mock {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}
.qr-inner { width: 100%; height: 100%; }
.qr-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  width: 100%;
  height: 100%;
}
.qr-cell { border-radius: 1px; background: #eee; }
.qr-cell.dark { background: #1a1a1a; }

.ticket-sep {
  width: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.ticket-notch {
  width: 20px;
  height: 20px;
  background: var(--bg-color);
  border-radius: 50%;
  flex-shrink: 0;
}
.ticket-notch.top { margin-top: -10px; }
.ticket-notch.bottom { margin-bottom: -10px; }
.ticket-dashes {
  flex: 1;
  border-left: 2px dashed rgba(255,255,255,0.1);
}

.ticket-right {
  flex: 1;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}
.ticket-ajak {
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--primary);
  text-transform: uppercase;
}
.ticket-code-big {
  font-size: 1.6rem;
  font-weight: 900;
  color: white;
  letter-spacing: 3px;
  font-family: 'Courier New', monospace;
  line-height: 1;
}
.ticket-event-nm {
  font-size: 0.9rem;
  font-weight: 800;
  color: rgba(255,255,255,0.85);
}
.ticket-pickup, .ticket-dep {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.5);
  font-weight: 600;
}

/* ===== WHAT'S NEXT ===== */
.whats-next {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 28px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 28px;
}
.wn-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--text-dark);
  margin-bottom: 24px;
}
.wn-steps { display: flex; flex-direction: column; gap: 20px; }
.wn-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.wn-num {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}
.wn-step-title { font-size: 0.92rem; font-weight: 800; color: var(--text-dark); margin-bottom: 4px; }
.wn-step-desc { font-size: 0.82rem; color: var(--text-light); line-height: 1.5; }

/* ===== ACTIONS ===== */
.confirm-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
  border-radius: 16px;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.25s;
}
.action-btn.outline {
  background: var(--card-bg);
  color: var(--text-dark);
  border: 1.5px solid var(--border-color);
}
.action-btn.outline:hover {
  background: var(--input-bg);
  border-color: var(--primary);
}
.action-btn.primary {
  background: var(--primary);
  color: white;
  border: none;
  box-shadow: 0 8px 24px rgba(201,76,76,0.3);
}
.action-btn.primary:hover {
  background: #b34242;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(201,76,76,0.4);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 700px) {
  .confirm-title { font-size: 2rem; }
  .cc-details-grid { grid-template-columns: 1fr; }
  .cc-header { flex-direction: column; }
  .ticket-left { flex: 0 0 120px; }
  .confirm-actions { flex-direction: column; }
  .action-btn { justify-content: center; }
}
</style>
