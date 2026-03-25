<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MapPin, Clock, Users, Baby, ArrowRight, Check, ChevronLeft, Calendar, Tag, Navigation } from 'lucide-vue-next';
import { bookingStore } from '../store/booking';

const route = useRoute();
const router = useRouter();

// All events data (same source of truth)
const allEvents = [
  { id: 1, name: 'Neon Lights Festival', date: '2026-10-15', dateLabel: '15 Okt 2026', time: '18:00 WIB', location: 'City Arena', city: 'Jakarta', price: 'Rp 750.000', priceNum: 750000, image: '/hero.png', tag: 'Electronic' },
  { id: 2, name: 'Symphony in the Park', date: '2026-10-22', dateLabel: '22 Okt 2026', time: '19:30 WIB', location: 'Grand Park', city: 'Bandung', price: 'Rp 450.000', priceNum: 450000, image: '/hero.png', tag: 'Classical' },
  { id: 3, name: 'Midnight Rock', date: '2026-11-05', dateLabel: '5 Nov 2026', time: '20:00 WIB', location: 'Stadium One', city: 'Surabaya', price: 'Rp 950.000', priceNum: 950000, image: '/hero.png', tag: 'Rock' },
  { id: 4, name: 'Indie Vibes Fest', date: '2026-11-12', dateLabel: '12 Nov 2026', time: '17:00 WIB', location: 'Downtown Square', city: 'Yogyakarta', price: 'Rp 350.000', priceNum: 350000, image: '/hero.png', tag: 'Indie' },
  { id: 5, name: 'Jazz Under Stars', date: '2026-11-20', dateLabel: '20 Nov 2026', time: '19:00 WIB', location: 'Alun-Alun Kota', city: 'Bandung', price: 'Rp 280.000', priceNum: 280000, image: '/hero.png', tag: 'Jazz' },
  { id: 6, name: 'Future Bass Summit', date: '2026-12-01', dateLabel: '1 Des 2026', time: '21:00 WIB', location: 'Skydome Arena', city: 'Jakarta', price: 'Rp 650.000', priceNum: 650000, image: '/hero.png', tag: 'EDM' },
];

onMounted(() => {
  const id = parseInt(route.params.id);
  if (!bookingStore.selectedEvent || bookingStore.selectedEvent.id !== id) {
    const found = allEvents.find(e => e.id === id);
    if (found) bookingStore.selectedEvent = found;
    else router.push('/events');
  }
});

const event = computed(() => bookingStore.selectedEvent);

// ---- PAYMENT MODAL STATE ----
const showPaymentModal = ref(false);
const selectedPayment = ref('');
const paymentMethods = [
  { id: 'qris', name: 'QRIS', icon: '📱' },
  { id: 'gopay', name: 'GoPay', icon: '🟢' },
  { id: 'dana', name: 'DANA', icon: '🔵' },
  { id: 'bca', name: 'BCA Virtual Account', icon: '🏦' }
];

// ---- STEP 1: PICKUP ----
const pickupLocations = [
  { region: 'DKI Jakarta', name: 'Blok M Plaza', address: 'Jl. Bulungan No.76, Jakarta Selatan' },
  { region: 'DKI Jakarta', name: 'Grand Indonesia', address: 'Jl. M.H. Thamrin No.1, Jakarta Pusat' },
  { region: 'DKI Jakarta', name: 'Central Park', address: 'Jl. Letjen S. Parman, Jakarta Barat' },
  { region: 'Depok', name: 'Margo City', address: 'Jl. Margonda Raya No.358, Depok' },
  { region: 'Bogor', name: 'Botani Square', address: 'Jl. Raya Pajajaran, Tegallega, Bogor' },
  { region: 'Tangerang', name: 'Tangerang City Mall', address: 'Jl. Jenderal Sudirman No.1, Tangerang' },
  { region: 'Bekasi', name: 'Summarecon Mall Bekasi', address: 'Jl. Boulevard Ahmad Yani, Bekasi' },
  { region: 'Bandung', name: 'Trans Studio Mall', address: 'Jl. Gatot Subroto No.289, Bandung' },
  { region: 'Bandung', name: 'Cihampelas Walk', address: 'Jl. Cihampelas No.160, Bandung' },
];

const pickupSearch = ref('');
const filteredLocations = computed(() => {
  const q = pickupSearch.value.toLowerCase();
  return pickupLocations.filter(loc =>
    !q || loc.region.toLowerCase().includes(q) ||
    loc.name.toLowerCase().includes(q) ||
    loc.address.toLowerCase().includes(q)
  );
});
const groupedLocations = computed(() => {
  const groups = {};
  filteredLocations.value.forEach(loc => {
    if (!groups[loc.region]) groups[loc.region] = [];
    groups[loc.region].push(loc);
  });
  return groups;
});

const selectPickup = (loc) => {
  if (bookingStore.selectedPickup?.name === loc.name) {
    bookingStore.selectedPickup = null; // deselect
  } else {
    bookingStore.selectedPickup = loc;
  }
};

// ---- STEP 2: SCHEDULE ----
const schedules = [
  { id: 'a', label: 'Pagi', time: '07:00 WIB', note: 'Berangkat pagi-pagi, rilex di jalan', pricePerPax: 85000, seats: 28 },
  { id: 'b', label: 'Siang', time: '12:00 WIB', note: 'Perjalanan siang, tiba sebelum sound check', pricePerPax: 75000, seats: 40 },
  { id: 'c', label: 'Sore', time: '15:00 WIB', note: 'Rekomendasi! Tiba 2 jam sebelum acara', pricePerPax: 90000, seats: 15, recommended: true },
  { id: 'd', label: 'Malam', time: '17:30 WIB', note: 'Langsung ke venue, tepat waktu', pricePerPax: 95000, seats: 8 },
];

const selectSchedule = (s) => {
  if (bookingStore.selectedSchedule?.id === s.id) {
    bookingStore.selectedSchedule = null; // deselect
  } else {
    bookingStore.selectedSchedule = s;
  }
};

// ---- STEP 3: PASSENGERS ----
const adults = computed({
  get: () => bookingStore.adults,
  set: v => bookingStore.adults = v,
});
const toddlers = computed({
  get: () => bookingStore.toddlers,
  set: v => bookingStore.toddlers = v,
});

// ---- NAVIGATION ----
const canProceed = computed(() => {
  return !!bookingStore.selectedPickup && !!bookingStore.selectedSchedule && adults.value >= 1;
});

const goBack = () => {
  router.back();
};

const handleProceed = () => {
  showPaymentModal.value = true;
};

const confirmBooking = () => {
  if (!selectedPayment.value) {
    alert('Pilih metode pembayaran terlebih dahulu');
    return;
  }
  showPaymentModal.value = false;
  bookingStore.generateBookingCode();
  router.push('/confirmation');
};

// Price summary
const rideTotal = computed(() => {
  if (!bookingStore.selectedSchedule) return 0;
  return bookingStore.selectedSchedule.pricePerPax * adults.value;
});

const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');
</script>

<template>
  <div class="booking-page">
    <!-- Top bar -->
    <div class="booking-topbar">
      <div class="container topbar-inner">
        <button class="back-btn" @click="goBack">
          <ChevronLeft :size="18" />
          Kembali ke Event
        </button>
      </div>
    </div>

    <div class="container booking-layout">
      <!-- LEFT: Form -->
      <div class="booking-form-col">
        <!-- Event preview -->
        <div class="event-preview-card" v-if="event">
          <img :src="event.image" :alt="event.name" class="event-preview-img" />
          <div class="event-preview-info">
            <span class="event-preview-tag">{{ event.tag }}</span>
            <h3 class="event-preview-name">{{ event.name }}</h3>
            <div class="event-preview-meta">
              <span><Calendar :size="12" /> {{ event.dateLabel }}</span>
              <span><MapPin :size="12" /> {{ event.location }}</span>
            </div>
          </div>
        </div>

        <!-- ===== SECTION 1: PICKUP ===== -->
        <div class="form-section">
          <div class="section-heading">
            <h2 class="sect-title"><span class="sect-num">1</span> Pilih Titik Jemput</h2>
            <p class="sect-sub">Pilih lokasi penjemputan terdekat dari kamu</p>
          </div>
          <div class="step-content">
            <div class="pickup-search">
              <MapPin :size="16" class="pkup-ico" />
              <input
                type="text"
                v-model="pickupSearch"
                placeholder="Cari kota atau mall terdekat..."
                class="pickup-search-input"
              />
            </div>

            <div class="locations-list">
              <div v-for="(locs, region) in groupedLocations" :key="region" class="loc-group">
                <div class="loc-region-label">{{ region }}</div>
                <div
                  v-for="loc in locs"
                  :key="loc.name"
                  class="loc-item"
                  :class="{ selected: bookingStore.selectedPickup?.name === loc.name }"
                  @click="selectPickup(loc)"
                >
                  <div class="loc-icon">
                    <MapPin :size="16" />
                  </div>
                  <div class="loc-text">
                    <div class="loc-name">{{ loc.name }}</div>
                    <div class="loc-address">{{ loc.address }}</div>
                  </div>
                  <div class="loc-check" v-if="bookingStore.selectedPickup?.name === loc.name">
                    <Check :size="14" />
                  </div>
                </div>
              </div>
              <div v-if="Object.keys(groupedLocations).length === 0" class="no-results">
                Tidak ada lokasi ditemukan. Coba kata lain.
              </div>
            </div>
          </div>
        </div>

        <!-- ===== SECTION 2: SCHEDULE ===== -->
        <div class="form-section">
          <div class="section-heading">
            <h2 class="sect-title"><span class="sect-num">2</span> Pilih Jadwal Keberangkatan</h2>
            <p class="sect-sub">Jadwal perjalanan tersedia menuju {{ event?.location }}</p>
          </div>
          <div class="step-content">
            <div class="schedules-grid">
              <div
                v-for="s in schedules"
                :key="s.id"
                class="schedule-card"
                :class="{ selected: bookingStore.selectedSchedule?.id === s.id }"
                @click="selectSchedule(s)"
              >
                <div class="schedule-header">
                  <div class="schedule-time-block">
                    <span class="schedule-label-txt">{{ s.label }}</span>
                    <span class="schedule-time">{{ s.time }}</span>
                  </div>
                  <div v-if="s.recommended" class="recommended-badge">⭐ Rekomendasi</div>
                  <div class="schedule-sel-check" v-if="bookingStore.selectedSchedule?.id === s.id">
                    <Check :size="14" />
                  </div>
                </div>
                <p class="schedule-note">{{ s.note }}</p>
                <div class="schedule-footer">
                  <span class="schedule-price">{{ formatRp(s.pricePerPax) }}<span class="per-pax"> / orang</span></span>
                  <span class="schedule-seats" :class="{ 'low-seats': s.seats <= 10 }">
                    <Users :size="12" /> {{ s.seats }} kursi tersedia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== SECTION 3: PASSENGERS ===== -->
        <div class="form-section">
          <div class="section-heading">
            <h2 class="sect-title"><span class="sect-num">3</span> Jumlah Penumpang</h2>
            <p class="sect-sub">Berapa orang yang akan berangkat?</p>
          </div>
          <div class="step-content">
            <div class="passengers-form">
              <div class="passenger-row">
                <div class="passenger-info">
                  <div class="pax-icon"><Users :size="22" /></div>
                  <div>
                    <div class="pax-type">Dewasa</div>
                    <div class="pax-note">Usia 12 tahun ke atas</div>
                  </div>
                </div>
                <div class="counter-ctrl">
                  <button class="cnt-btn" :class="{ faded: adults <= 1 }" @click="adults > 1 ? adults-- : null">−</button>
                  <span class="cnt-val">{{ adults }}</span>
                  <button class="cnt-btn" @click="adults++">+</button>
                </div>
              </div>

              <div class="passenger-row">
                <div class="passenger-info">
                  <div class="pax-icon"><Baby :size="22" /></div>
                  <div>
                    <div class="pax-type">Balita</div>
                    <div class="pax-note">Usia di bawah 5 tahun (gratis)</div>
                  </div>
                </div>
                <div class="counter-ctrl">
                  <button class="cnt-btn" :class="{ faded: toddlers <= 0 }" @click="toddlers > 0 ? toddlers-- : null">−</button>
                  <span class="cnt-val">{{ toddlers }}</span>
                  <button class="cnt-btn" @click="toddlers++">+</button>
                </div>
              </div>

              <div class="pax-note-box">
                <span>🎟️</span>
                <span>Tiket event <strong>tidak termasuk</strong> dalam harga ride ini. Pastikan kamu sudah punya tiket event sebelum memesan.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <button
          class="proceed-btn"
          :class="{ disabled: !canProceed }"
          :disabled="!canProceed"
          @click="handleProceed"
        >
          <span>Lanjutkan Pembayaran <ArrowRight :size="18" /></span>
        </button>
      </div>

      <!-- RIGHT: Order Summary -->
      <div class="booking-summary-col">
        <div class="summary-card">
          <h3 class="summary-title">Ringkasan Pesanan</h3>

          <div class="summary-section" v-if="event">
            <div class="sum-label">Event</div>
            <div class="sum-value bold">{{ event.name }}</div>
            <div class="sum-sub">{{ event.dateLabel }} · {{ event.time }}</div>
          </div>

          <div class="summary-section" v-if="bookingStore.selectedPickup">
            <div class="sum-label">Titik Jemput</div>
            <div class="sum-value bold">{{ bookingStore.selectedPickup.name }}</div>
            <div class="sum-sub">{{ bookingStore.selectedPickup.address }}</div>
          </div>
          <div class="summary-section empty-info" v-else>
            <div class="sum-label">Titik Jemput</div>
            <div class="sum-value muted">Belum dipilih</div>
          </div>

          <div class="summary-section" v-if="bookingStore.selectedSchedule">
            <div class="sum-label">Jadwal</div>
            <div class="sum-value bold">{{ bookingStore.selectedSchedule.time }} ({{ bookingStore.selectedSchedule.label }})</div>
          </div>
          <div class="summary-section empty-info" v-else>
            <div class="sum-label">Jadwal</div>
            <div class="sum-value muted">Belum dipilih</div>
          </div>

          <div class="summary-section">
            <div class="sum-label">Penumpang</div>
            <div class="sum-value bold">{{ adults }} Dewasa{{ toddlers > 0 ? ` + ${toddlers} Balita` : '' }}</div>
          </div>

          <div class="summary-divider"></div>

          <div v-if="bookingStore.selectedSchedule">
            <div class="price-breakdown">
              <span>{{ formatRp(bookingStore.selectedSchedule.pricePerPax) }} × {{ adults }} orang</span>
              <span>{{ formatRp(rideTotal) }}</span>
            </div>
            <div class="price-breakdown" v-if="toddlers > 0">
              <span>Balita ({{ toddlers }})</span>
              <span class="free-label">Gratis</span>
            </div>
            <div class="price-total">
              <span>Total Ride</span>
              <span>{{ formatRp(rideTotal) }}</span>
            </div>
          </div>
          <div class="price-placeholder" v-else>
            <span>Pilih jadwal untuk melihat harga</span>
          </div>

          <div class="summary-guarantee">
            <Check :size="13" />
            <span>Pembatalan gratis hingga 24 jam sebelum keberangkatan</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PAYMENT MODAL -->
    <transition name="modal-fade">
      <div v-if="showPaymentModal" class="payment-modal-overlay" @click.self="showPaymentModal = false">
        <div class="payment-modal">
          <div class="pm-header">
            <h3>Pilih Metode Pembayaran</h3>
            <button class="pm-close" @click="showPaymentModal = false">✕</button>
          </div>
          <div class="pm-body">
            <div class="pm-total">
              <span>Total Tagihan</span>
              <strong>{{ formatRp(rideTotal) }}</strong>
            </div>
            
            <div class="pm-methods">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id" 
                class="pm-method-label"
                :class="{ active: selectedPayment === method.id }"
              >
                <input type="radio" :value="method.id" v-model="selectedPayment" class="pm-radio" />
                <span class="pm-icon">{{ method.icon }}</span>
                <span class="pm-name">{{ method.name }}</span>
                <Check v-if="selectedPayment === method.id" class="pm-check" :size="16" />
              </label>
            </div>
          </div>
          <div class="pm-footer">
            <button class="pm-submit-btn" :disabled="!selectedPayment" @click="confirmBooking">
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ===== PAGE ===== */
.booking-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
  padding-top: 80px;
}

/* ===== TOPBAR ===== */
.booking-topbar {
  background: var(--navbar-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 80px;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  padding-bottom: 14px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-light);
  cursor: pointer;
  border: none;
  background: none;
  padding: 6px 10px;
  border-radius: 10px;
  transition: all 0.2s;
}
.back-btn:hover { background: #f0f0f0; color: var(--text-dark); }

/* ===== LAYOUT ===== */
.booking-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  padding-top: 40px;
  align-items: start;
}

/* ===== EVENT PREVIEW ===== */
.event-preview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--card-bg);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 28px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}
.event-preview-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}
.event-preview-tag {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--primary);
  display: block;
  margin-bottom: 4px;
}
.event-preview-name {
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--text-dark);
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}
.event-preview-meta {
  display: flex;
  gap: 14px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-light);
}
.event-preview-meta span { display: flex; align-items: center; gap: 5px; }
.event-preview-meta svg { color: var(--primary); }

/* ===== SECTIONS ===== */
.form-section {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 28px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}
.section-heading {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding-bottom: 16px;
}
.sect-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 1.25rem; font-weight: 900; color: var(--text-dark);
  margin-bottom: 6px; letter-spacing: -0.3px;
}
.sect-num {
  width: 28px; height: 28px;
  background: rgba(201,76,76,0.1); color: var(--primary);
  border-radius: 8px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
}
.sect-sub {
  font-size: 0.85rem; color: var(--text-light);
  padding-left: 38px;
}

/* ===== STEP 1: PICKUP ===== */
.pickup-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--input-bg);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 1.5px solid transparent;
  transition: all 0.2s;
}
.pickup-search:focus-within {
  border-color: var(--primary);
  background: var(--card-bg);
  box-shadow: 0 0 0 3px rgba(201,76,76,0.08);
}
.pkup-ico { color: var(--primary); flex-shrink: 0; }
.pickup-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--text-dark);
  outline: none;
}

.locations-list { max-height: 380px; overflow-y: auto; }
.loc-group { margin-bottom: 16px; }
.loc-region-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--primary);
  padding: 0 4px;
  margin-bottom: 8px;
}
.loc-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1.5px solid transparent;
  margin-bottom: 6px;
  background: var(--input-bg);
}
.loc-item:hover { background: rgba(201,76,76,0.04); border-color: rgba(201,76,76,0.15); }
.loc-item.selected {
  background: rgba(201,76,76,0.06);
  border-color: var(--primary);
}
.loc-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(201,76,76,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}
.loc-name { font-size: 0.92rem; font-weight: 800; color: var(--text-dark); margin-bottom: 2px; }
.loc-address { font-size: 0.78rem; color: var(--text-light); line-height: 1.4; }
.loc-check {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.no-results { text-align: center; padding: 40px; color: var(--text-light); font-size: 0.9rem; }

/* ===== STEP 2: SCHEDULE ===== */
.schedules-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.schedule-card {
  border: 2px solid var(--border-color);
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s;
  background: var(--card-bg);
  position: relative;
}
.schedule-card:hover { border-color: rgba(201,76,76,0.3); background: rgba(201,76,76,0.02); }
.schedule-card.selected {
  border-color: var(--primary);
  background: rgba(201,76,76,0.04);
  box-shadow: 0 0 0 3px rgba(201,76,76,0.1);
}
.schedule-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.schedule-label-txt { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); display: block; margin-bottom: 4px; }
.schedule-time { font-size: 1.2rem; font-weight: 900; color: var(--text-dark); }
.recommended-badge {
  background: #fff7e6;
  color: #c67c00;
  font-size: 0.62rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.schedule-sel-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.schedule-note {
  font-size: 0.8rem;
  color: var(--text-light);
  line-height: 1.5;
  margin-bottom: 14px;
}
.schedule-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px;
}
.schedule-price { font-size: 0.92rem; font-weight: 900; color: var(--text-dark); }
.per-pax { font-size: 0.72rem; font-weight: 600; color: var(--text-light); }
.schedule-seats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-light);
}
.schedule-seats.low-seats { color: #e65100; }

/* ===== STEP 3: PASSENGERS ===== */
.passengers-form { display: flex; flex-direction: column; gap: 16px; }
.passenger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  background: var(--input-bg);
}
.passenger-info { display: flex; align-items: center; gap: 14px; }
.pax-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(201,76,76,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}
.pax-type { font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin-bottom: 2px; }
.pax-note { font-size: 0.76rem; color: var(--text-light); }
.counter-ctrl { display: flex; align-items: center; gap: 16px; }
.cnt-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border-color);
  background: var(--card-bg);
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  line-height: 1;
}
.cnt-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
.cnt-btn.faded { opacity: 0.3; cursor: not-allowed; pointer-events: none; }
.cnt-val { font-size: 1.3rem; font-weight: 900; color: var(--text-dark); min-width: 24px; text-align: center; }

.pax-note-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fffbeb;
  border: 1px solid #f6d860;
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 0.82rem;
  color: #8a6200;
  line-height: 1.5;
}

/* ===== PROCEED BUTTON ===== */
.proceed-btn {
  width: 100%;
  padding: 18px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 18px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(201,76,76,0.3);
}
.proceed-btn:hover:not(.disabled) {
  background: #b34242;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(201,76,76,0.4);
}
.proceed-btn.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ===== SUMMARY CARD ===== */
.booking-summary-col { position: sticky; top: 140px; }
.summary-card {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 28px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}
.summary-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--text-dark);
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
.summary-section { margin-bottom: 18px; }
.sum-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--primary);
  margin-bottom: 4px;
}
.sum-value { font-size: 0.92rem; font-weight: 700; color: var(--text-dark); }
.sum-value.bold { font-weight: 800; }
.sum-value.muted { color: #ccc; font-weight: 500; font-style: italic; }
.sum-sub { font-size: 0.78rem; color: var(--text-light); margin-top: 2px; }

.summary-divider { height: 1px; background: rgba(0,0,0,0.07); margin: 20px 0; }

.price-breakdown {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 10px;
}
.free-label { color: #2e7d32; font-weight: 700; }
.price-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--text-dark);
  padding-top: 12px;
  border-top: 2px solid var(--primary);
  margin-top: 4px;
}
.price-placeholder {
  font-size: 0.85rem;
  color: #ccc;
  font-style: italic;
  text-align: center;
  padding: 12px 0;
}

.summary-guarantee {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 14px;
  background: rgba(46,125,50,0.06);
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #2e7d32;
}
.summary-guarantee svg { flex-shrink: 0; }

/* ===== PAYMENT MODAL ===== */
.payment-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999;
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  padding: 20px;
}
.payment-modal {
  background: white; width: 100%; max-width: 440px; border-radius: 24px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.15); overflow: hidden;
}
.pm-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.06);
}
.pm-header h3 { font-size: 1.15rem; font-weight: 900; color: var(--text-dark); margin: 0; }
.pm-close { background: none; border: none; font-size: 1.2rem; color: var(--text-light); cursor: pointer; transition: color 0.2s; }
.pm-close:hover { color: var(--primary); }

.pm-body { padding: 24px; }
.pm-total {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(201,76,76,0.06); padding: 18px 20px; border-radius: 14px;
  margin-bottom: 24px; border: 1px dashed rgba(201,76,76,0.3);
}
.pm-total span { font-size: 0.85rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }
.pm-total strong { font-size: 1.3rem; font-weight: 900; color: var(--text-dark); }

.pm-methods { display: flex; flex-direction: column; gap: 10px; }
.pm-method-label {
  display: flex; align-items: center; gap: 14px; padding: 16px 20px;
  border: 1.5px solid rgba(0,0,0,0.08); border-radius: 14px; cursor: pointer; transition: all 0.2s;
}
.pm-method-label:hover { border-color: rgba(201,76,76,0.3); background: rgba(201,76,76,0.02); }
.pm-method-label.active { border-color: var(--primary); background: rgba(201,76,76,0.06); box-shadow: 0 0 0 3px rgba(201,76,76,0.08); }
.pm-radio { display: none; }
.pm-icon { font-size: 1.4rem; }
.pm-name { font-weight: 700; font-size: 0.95rem; color: var(--text-dark); flex: 1; }
.pm-check { color: var(--primary); }

.pm-footer { padding: 20px 24px 24px; border-top: 1px solid rgba(0,0,0,0.04); }
.pm-submit-btn {
  width: 100%; padding: 16px; border-radius: 16px; background: var(--primary); color: white;
  border: none; font-family: inherit; font-size: 1rem; font-weight: 800; cursor: pointer;
  transition: all 0.3s; box-shadow: 0 8px 24px rgba(201,76,76,0.25);
}
.pm-submit-btn:disabled { background: #e0e0e0; color: #aaa; box-shadow: none; cursor: not-allowed; }
.pm-submit-btn:hover:not(:disabled) { background: #b34242; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(201,76,76,0.35); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .payment-modal, .modal-fade-leave-active .payment-modal { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.modal-fade-enter-from .payment-modal, .modal-fade-leave-to .payment-modal { transform: scale(0.95) translateY(20px); }

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }
  .booking-summary-col { position: static; order: -1; }
  .schedules-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .booking-topbar { top: 0; }
  .step-indicator { gap: 16px; }
  .step-title { font-size: 1.2rem; }
}
</style>
