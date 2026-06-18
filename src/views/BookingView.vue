<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MapPin, Clock, Users, Baby, ArrowRight, Check, ChevronLeft, Calendar, Tag, Navigation, User, Mail, Phone } from 'lucide-vue-next';
import { bookingStore } from '../store/booking';

const route = useRoute();
const router = useRouter();

// All events data (same source of truth
const allEvents = [
  { id: 1, name: 'The Sounds Project', date: '2026-10-15', dateLabel: '15 Okt 2026', time: '18:00 WIB', departureTime: '12:00 WIB', returnTime: '01:00 WIB', location: 'Ancol Ecovention & Ecopark', city: 'Jakarta', price: 'Rp 150.000', priceNum: 150000, image: '/TSP.jpeg', tag: 'Shuttle Bersama' },
  { id: 3, name: 'The Sounds Project', date: '2026-11-05', dateLabel: '5 Nov 2026', time: '20:00 WIB', departureTime: '12:00 WIB', returnTime: '01:00 WIB', location: 'Ancol Ecovention & Ecopark', city: 'Jakarta', price: 'Rp 150.000', priceNum: 150000, image: '/TSP.jpeg', tag: 'Shuttle Bersama' },
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
const isEksklusif = computed(() => event.value?.tag === 'Shuttle Eksklusif');

// ---- PAYMENT MODAL STATE ----
const showPaymentModal = ref(false);
const selectedPayment = ref('');
const paymentMethods = [
  { id: 'qris', name: 'QRIS', icon: '📱' },
  { id: 'gopay', name: 'GoPay', icon: '🟢' },
  { id: 'dana', name: 'DANA', icon: '🔵' },
  { id: 'bca', name: 'BCA Virtual Account', icon: '🏦' }
];

// ---- STEP 1: PICKUP & RETURN ----
const pickupLocations = [
  { region: 'Pondok Indah', name: 'PIM Decathlon', address: 'Pondok Indah', lat: -6.2625, lng: 106.7824, price: 'Rp. 150.000 / Pax / Roundtrip' },
  { region: 'Depok', name: 'Showroom Royal Enfield, Margonda', address: 'Depok', lat: -6.3731, lng: 106.8346, price: 'Rp. 150.000 / Pax / Roundtrip' },
  { region: 'Sudirman', name: 'Jalan New Delhi, Disebelah Mall FX Sudirman', address: 'Sudirman', lat: -6.2241, lng: 106.8021, price: 'Rp. 120.000 / Pax / Roundtrip' },
  { region: 'Bogor', name: 'Terminal Damri Botani Square', address: 'Bogor', lat: -6.6016, lng: 106.8062, price: 'Rp. 175.000 / Pax / Roundtrip' },
  { region: 'BSD', name: 'Pasar Modern Intermoda BSD City', address: 'BSD', lat: -6.3213, lng: 106.6397, price: 'Rp. 150.000 / Pax / Roundtrip' },
  { region: 'Bekasi', name: 'Gerbang Tol Bekasi Barat', address: 'Bekasi', lat: -6.2458, lng: 106.9856, price: 'Rp. 150.000 / Pax / Roundtrip' },
  { region: 'Jakarta Timur', name: 'Taman Mini Indonesia Indah', address: 'Jakarta Timur', lat: -6.3024, lng: 106.8951, price: 'Rp. 150.000 / Pax / Roundtrip' }
];

const groupedLocations = computed(() => {
  const groups = {};
  pickupLocations.forEach(loc => {
    if (!groups[loc.region]) groups[loc.region] = [];
    groups[loc.region].push(loc);
  });
  return groups;
});

const customPickupInput = ref('');
const customReturnInput = ref('');

const selectPickup = (loc) => {
  if (bookingStore.selectedPickup?.name === loc.name) {
    bookingStore.selectedPickup = null;
  } else {
    bookingStore.selectedPickup = loc;
    customPickupInput.value = ''; // clear custom
  }
};

watch(customPickupInput, (val) => {
  if (val.trim()) bookingStore.selectedPickup = { name: 'Custom', address: val };
  else if (bookingStore.selectedPickup?.name === 'Custom') bookingStore.selectedPickup = null;
});

// ---- STEP 2: CUSTOMER DATA ----
const customer = bookingStore.customer;

// ---- STEP 3: PASSENGERS ----
const adults = computed({
  get: () => bookingStore.adults,
  set: v => bookingStore.adults = v,
});
const toddlers = computed({
  get: () => bookingStore.toddlers,
  set: v => bookingStore.toddlers = v,
});

// ---- STEP 4: SEAT SELECTION ----
const selectedSeats = computed({
  get: () => bookingStore.selectedSeats,
  set: v => bookingStore.selectedSeats = v,
});
const occupiedSeats = ref(['A1', 'B1', 'A2', 'D2', 'A3', 'B3', 'C3', 'D3', 'D6']); // Mock occupied seats across the vertical layout

const busRows = [
  {
    rowNum: 1,
    left: [
      { id: 'A1', label: '1A', isOccupied: true },
      { id: 'B1', label: '1B', isOccupied: true }
    ],
    right: [
      { id: 'C1', label: '1C' },
      { id: 'D1', label: '1D' }
    ]
  },
  {
    rowNum: 2,
    left: [
      { id: 'A2', label: '2A', isOccupied: true },
      { id: 'B2', label: '2B' }
    ],
    right: [
      { id: 'C2', label: '2C' },
      { id: 'D2', label: '2D', isOccupied: true }
    ]
  },
  {
    rowNum: 3,
    left: [
      { id: 'A3', label: '3A', isOccupied: true },
      { id: 'B3', label: '3B', isOccupied: true }
    ],
    right: [
      { id: 'C3', label: '3C', isOccupied: true },
      { id: 'D3', label: '3D', isOccupied: true }
    ]
  },
  {
    rowNum: 4,
    left: [
      { id: 'A4', label: '4A' },
      { id: 'B4', label: '4B' }
    ],
    right: [
      { id: 'C4', label: '4C' },
      { id: 'D4', label: '4D' }
    ]
  },
  {
    rowNum: 5,
    left: [
      { id: 'A5', label: '5A' },
      { id: 'B5', label: '5B' }
    ],
    right: [
      { id: 'C5', label: '5C' },
      { id: 'D5', label: '5D' }
    ]
  },
  {
    rowNum: 6,
    left: [
      { id: 'A6', label: '6A' },
      { id: 'B6', label: '6B' }
    ],
    right: [
      { id: 'C6', label: '6C' },
      { id: 'D6', label: '6D', isOccupied: true }
    ]
  },
  {
    rowNum: 7,
    left: [
      { id: 'A7', label: '7A' },
      { id: 'B7', label: '7B' }
    ],
    right: [
      { id: 'C7', label: '7C' },
      { id: 'D7', label: '7D' }
    ]
  },
  {
    rowNum: 8,
    left: [
      { id: 'A8', label: '8A' },
      { id: 'B8', label: '8B' }
    ],
    right: [
      { id: 'C8', label: '8C' },
      { id: 'D8', label: '8D' }
    ]
  },
  {
    rowNum: 9,
    left: [],
    right: [
      { id: 'C9', label: '9C' },
      { id: 'D9', label: '9D' }
    ]
  }
];

// ---- ZOOM MODAL STATE ----
const showZoomModal = ref(false);
const zoomLevel = ref(1.0);

const zoomIn = () => {
  if (zoomLevel.value < 2.0) zoomLevel.value = parseFloat((zoomLevel.value + 0.1).toFixed(1));
};
const zoomOut = () => {
  if (zoomLevel.value > 0.5) zoomLevel.value = parseFloat((zoomLevel.value - 0.1).toFixed(1));
};
const resetZoom = () => {
  zoomLevel.value = 1.0;
};

watch(adults, (newVal) => {
  if (selectedSeats.value.length > newVal) {
    selectedSeats.value = selectedSeats.value.slice(0, newVal);
  }
});

const toggleSeat = (seatId) => {
  if (occupiedSeats.value.includes(seatId)) return;
  const idx = selectedSeats.value.indexOf(seatId);
  const arr = [...selectedSeats.value];
  if (idx !== -1) {
    arr.splice(idx, 1);
    selectedSeats.value = arr;
  } else {
    if (arr.length < adults.value) {
      arr.push(seatId);
      selectedSeats.value = arr;
    } else {
      if (adults.value === 1) {
        selectedSeats.value = [seatId];
      } else {
        arr.shift();
        arr.push(seatId);
        selectedSeats.value = arr;
      }
    }
  }
};

// ---- NAVIGATION ----
const canProceed = computed(() => {
  return !!bookingStore.selectedPickup && 
         adults.value >= 1 &&
         selectedSeats.value.length === adults.value &&
         customer.name.trim() !== '' &&
         customer.email.trim() !== '' &&
         customer.phone.trim() !== '';
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
  
  // Save to Cache (localStorage)
  const code = bookingStore.generateBookingCode();
  const payload = {
    code,
    date: new Date().toISOString(),
    event: event.value,
    pickup: bookingStore.selectedPickup,
    returnLoc: { name: event.value?.location, address: 'Lokasi Tempat Diselenggarakannya Acara' },
    customer: { ...customer },
    adults: adults.value,
    toddlers: toddlers.value,
    selectedSeats: [...selectedSeats.value],
    totalPrice: grandTotal.value,
    paymentMethod: selectedPayment.value
  };

  let existing = [];
  try {
    const cached = localStorage.getItem('ajak_bookings');
    if (cached) existing = JSON.parse(cached);
  } catch(e) {}
  existing.push(payload);
  localStorage.setItem('ajak_bookings', JSON.stringify(existing));

  showPaymentModal.value = false;
  router.push('/confirmation');
};

// Price summary
const rideTotal = computed(() => bookingStore.ridePrice);
const adminFee = computed(() => bookingStore.adminFee);
const grandTotal = computed(() => bookingStore.totalPrice);

const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

// ---- VUE KONVA SEAT MAP ----
const hoveredSeat = ref(null);
const tooltipActive = ref(false);
const tooltipSeat = ref(null);
const tooltipX = ref(0);
const tooltipY = ref(0);

const handleSeatMouseEnter = (seat, x, y, evt) => {
  hoveredSeat.value = seat.id;
  tooltipActive.value = true;
  tooltipSeat.value = seat;
  tooltipX.value = x + 16;
  tooltipY.value = y - 4;

  if (evt && evt.target) {
    const stage = evt.target.getStage();
    if (stage) {
      stage.container().style.cursor = occupiedSeats.value.includes(seat.id) ? 'not-allowed' : 'pointer';
    }
  }
};

const handleSeatMouseLeave = (evt) => {
  hoveredSeat.value = null;
  tooltipActive.value = false;

  if (evt && evt.target) {
    const stage = evt.target.getStage();
    if (stage) {
      stage.container().style.cursor = 'default';
    }
  }
};

const getSeatBaseConfig = (seat) => {
  const isOccupied = occupiedSeats.value.includes(seat.id);
  const isSelected = selectedSeats.value.includes(seat.id);
  const isHovered = hoveredSeat.value === seat.id;
  
  let bgColor = '#ffffff';
  let borderColor = '#cbd5e1';
  
  if (isOccupied) {
    bgColor = '#374151';
    borderColor = '#1f2937';
  } else if (isSelected) {
    bgColor = '#ef4444';
    borderColor = '#b91c1c';
  } else if (isHovered) {
    borderColor = '#94a3b8';
  }

  return {
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    cornerRadius: [6, 6, 9, 9],
    fill: bgColor,
    stroke: borderColor,
    strokeWidth: 1.5
  };
};

const getSeatCushionConfig = (seat) => {
  const isOccupied = occupiedSeats.value.includes(seat.id);
  const isSelected = selectedSeats.value.includes(seat.id);
  const isHovered = hoveredSeat.value === seat.id;

  let cushionColor = '#f8fafc';
  let borderColor = '#cbd5e1';

  if (isOccupied) {
    cushionColor = '#4b5563';
    borderColor = '#1f2937';
  } else if (isSelected) {
    cushionColor = '#ef4444';
    borderColor = '#b91c1c';
  } else if (isHovered) {
    cushionColor = '#ffffff';
    borderColor = '#94a3b8';
  }

  return {
    x: 3,
    y: 2,
    width: 26,
    height: 21,
    cornerRadius: [3, 3, 1.5, 1.5],
    fill: cushionColor,
    stroke: borderColor,
    strokeWidth: 1.2
  };
};

const getSeatBackrestConfig = (seat) => {
  const isOccupied = occupiedSeats.value.includes(seat.id);
  const isSelected = selectedSeats.value.includes(seat.id);

  let backrestColor = '#cbd5e1';

  if (isOccupied) {
    backrestColor = '#1f2937';
  } else if (isSelected) {
    backrestColor = '#b91c1c';
  }

  return {
    x: 4,
    y: 25,
    width: 24,
    height: 5,
    cornerRadius: 2,
    fill: backrestColor
  };
};

const getSeatTextConfig = (seat) => {
  const isOccupied = occupiedSeats.value.includes(seat.id);
  const isSelected = selectedSeats.value.includes(seat.id);

  let textColor = '#1e293b';
  let textVal = seat.label;
  let fontSize = 9;

  if (isOccupied) {
    textColor = '#94a3b8';
    textVal = '✕';
    fontSize = 11;
  } else if (isSelected) {
    textColor = '#ffffff';
  }

  return {
    x: 0,
    y: 0,
    width: 32,
    height: 24,
    text: textVal,
    fontSize: fontSize,
    fontStyle: '800',
    fontFamily: 'sans-serif',
    fill: textColor,
    align: 'center',
    verticalAlign: 'middle'
  };
};
</script>

<template>
  <div class="booking-page">
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

        <!-- ===== SECTION 1: CUSTOMER DATA ===== -->
        <div class="form-section">
          <div class="section-heading">
            <h2 class="sect-title"><span class="sect-num">1</span> Data Pemesan</h2>
            <p class="sect-sub">Informasi kontak untuk pengiriman tiket dan konfirmasi</p>
          </div>
          <div class="step-content">
            <div class="customer-form">
              <div class="form-group mb-3">
                <label class="form-label"><User :size="14"/> Nama Lengkap</label>
                <input type="text" v-model="customer.name" class="form-input" placeholder="Masukkan nama lengkap" />
              </div>
              <div class="form-group mb-3">
                <label class="form-label"><Mail :size="14"/> Email</label>
                <input type="email" v-model="customer.email" class="form-input" placeholder="contoh@email.com" />
              </div>
              <div class="form-group mb-3">
                <label class="form-label"><Phone :size="14"/> Nomor Telepon / WhatsApp</label>
                <input type="tel" v-model="customer.phone" class="form-input" placeholder="08123456789" />
              </div>
            </div>
          </div>
        </div>

        <!-- ===== SECTION 2: PICKUP & RETURN ===== -->
        <div class="form-section">
          <div class="section-heading">
            <h2 class="sect-title"><span class="sect-num">2</span> Rute Perjalanan</h2>
            <p class="sect-sub">Tentukan lokasi perjalanan Anda</p>
          </div>
          <div class="step-content">
            <!-- PICKUP -->
            <h4 class="sub-sect-title mb-1">Titik Jemput</h4>
            <div class="mb-3" style="font-size: 0.85rem; color: var(--primary); font-weight: 700;">Jam Keberangkatan Shuttle: {{ event?.departureTime || '12:00 WIB' }}</div>
            
            <div v-if="isEksklusif" class="custom-input-box mb-3">
              <input type="text" v-model="customPickupInput" placeholder="Ketik alamat jemput spesifik atau pilih dari daftar di bawah..." class="form-input" />
            </div>

            <div class="locations-list mb-4">
              <div v-for="(locs, region) in groupedLocations" :key="'p'+region" class="loc-group">
                <div class="loc-region-label">{{ region }}</div>
                <div v-for="loc in locs" :key="'p'+loc.name" class="loc-item" :class="{ selected: bookingStore.selectedPickup?.name === loc.name }" @click="selectPickup(loc)">
                  <div class="loc-icon"><MapPin :size="16" /></div>
                  <div class="loc-text">
                    <div class="loc-name">{{ loc.name }}</div>
                    <div class="loc-address">{{ loc.address }}</div>
                    <div class="loc-price" style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-top: 4px;">{{ loc.price }}</div>
                  </div>
                  <div class="loc-check" v-if="bookingStore.selectedPickup?.name === loc.name"><Check :size="14" /></div>
                </div>
              </div>
              <div v-if="Object.keys(groupedLocations).length === 0" class="no-results">Tidak ada lokasi ditemukan.</div>
            </div>

            <hr class="my-4" style="border-color: rgba(0,0,0,0.05)" />

            <!-- RETURN (FIXED TO VENUE) -->
            <h4 class="sub-sect-title mb-1">Titik Pulang (Tujuan Akhir)</h4>
            <div class="mb-3" style="font-size: 0.85rem; color: var(--primary); font-weight: 700;">Jam Kepulangan Shuttle: {{ event?.returnTime || '01:00 WIB' }}</div>
            <div class="loc-item selected" style="cursor: default; background: rgba(21,101,192,0.04); border-color: #1565C0;">
              <div class="loc-icon" style="background: rgba(21,101,192,0.1); color: #1565C0;"><Navigation :size="16" /></div>
              <div class="loc-text">
                <div class="loc-name">{{ event?.location }}</div>
                <div class="loc-address">Lokasi Tempat Diselenggarakannya Acara</div>
              </div>
              <div class="loc-check" style="background: #1565C0;"><Check :size="14" /></div>
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
                <span>Tiket event <strong>tidak termasuk</strong> dalam harga shuttle ini. Pastikan kamu sudah punya tiket event sebelum memesan.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== SECTION 4: SEAT SELECTION ===== -->
        <div class="form-section">
          <div class="section-heading">
            <h2 class="sect-title"><span class="sect-num">4</span> Pilih Kursi / Seat Map</h2>
            <p class="sect-sub">Pilih posisi kursi Anda di dalam bus</p>
          </div>
          <div class="step-content">
            <div class="bus-container">
              <!-- Detail View Zoom Button -->
              <div class="bus-zoom-trigger-row" style="margin-bottom: 16px; width: 100%; display: flex; justify-content: flex-end;">
                <button type="button" class="zoom-trigger-btn" @click="showZoomModal = true">
                  🔍 Lihat Detail & Perbesar Kursi
                </button>
              </div>

              <!-- Visual of the bus cabin (vertical, Vue-Konva) -->
              <div class="canvas-bus-container" style="position: relative; width: 200px; height: 456px; margin: 0 auto 24px;">
                <v-stage :config="{ width: 200, height: 456 }">
                  <v-layer>
                    <!-- Cockpit area -->
                    <v-rect :config="{
                      x: 16,
                      y: 16,
                      width: 72,
                      height: 32,
                      cornerRadius: 5,
                      stroke: '#cbd5e1',
                      strokeWidth: 1,
                      dash: [3, 3]
                    }" />
                    <v-text :config="{
                      x: 16,
                      y: 16,
                      width: 72,
                      height: 32,
                      text: '🚪 PINTU DEPAN',
                      fontSize: 8,
                      fontStyle: 'bold',
                      fontFamily: 'sans-serif',
                      fill: '#64748b',
                      align: 'center',
                      verticalAlign: 'middle'
                    }" />

                    <!-- Driver Wheel Icon -->
                    <v-group :config="{ x: 148, y: 32 }">
                      <v-circle :config="{
                        x: 0,
                        y: 0,
                        radius: 10,
                        stroke: '#64748b',
                        strokeWidth: 2
                      }" />
                      <v-circle :config="{
                        x: 0,
                        y: 0,
                        radius: 2.5,
                        stroke: '#64748b',
                        strokeWidth: 2
                      }" />
                      <v-line :config="{
                        points: [0, -10, 0, -2.5],
                        stroke: '#64748b',
                        strokeWidth: 2
                      }" />
                      <v-line :config="{
                        points: [-7.1, 7.1, -1.8, 1.8],
                        stroke: '#64748b',
                        strokeWidth: 2
                      }" />
                      <v-line :config="{
                        points: [7.1, 7.1, 1.8, 1.8],
                        stroke: '#64748b',
                        strokeWidth: 2
                      }" />
                    </v-group>

                    <!-- Dashed dividing line under cockpit -->
                    <v-line :config="{
                      points: [16, 56, 184, 56],
                      stroke: '#e2e8f0',
                      strokeWidth: 1.5,
                      dash: [4, 4]
                    }" />

                    <!-- Passenger rows -->
                    <v-group v-for="(row, rowIndex) in busRows" :key="'row-' + row.rowNum">
                      <!-- Left column (seats or rear door) -->
                      <template v-if="row.left.length > 0">
                        <v-group 
                          v-for="(seat, seatIndex) in row.left" 
                          :key="seat.id"
                          :config="{
                            x: 16 + seatIndex * 40,
                            y: 64 + rowIndex * 44
                          }"
                          @click="toggleSeat(seat.id)"
                          @tap="toggleSeat(seat.id)"
                          @mouseenter="(evt) => handleSeatMouseEnter(seat, 16 + seatIndex * 40, 64 + rowIndex * 44, evt)"
                          @mouseleave="handleSeatMouseLeave"
                        >
                          <v-rect :config="getSeatBaseConfig(seat)" />
                          <v-rect :config="getSeatCushionConfig(seat)" />
                          <v-rect :config="getSeatBackrestConfig(seat)" />
                          <v-text :config="getSeatTextConfig(seat)" />
                        </v-group>
                      </template>
                      <template v-else-if="row.rowNum === 9">
                        <v-rect :config="{
                          x: 16,
                          y: 64 + rowIndex * 44,
                          width: 72,
                          height: 32,
                          cornerRadius: 5,
                          stroke: '#cbd5e1',
                          strokeWidth: 1,
                          dash: [3, 3]
                        }" />
                        <v-text :config="{
                          x: 16,
                          y: 64 + rowIndex * 44,
                          width: 72,
                          height: 32,
                          text: '🚪 PINTU BELAKANG',
                          fontSize: 8,
                          fontStyle: 'bold',
                          fontFamily: 'sans-serif',
                          fill: '#64748b',
                          align: 'center',
                          verticalAlign: 'middle'
                        }" />
                      </template>

                      <!-- Row labels (center aisle) -->
                      <v-text :config="{
                        x: 88,
                        y: 64 + rowIndex * 44,
                        width: 24,
                        height: 32,
                        text: row.rowNum.toString(),
                        fontSize: 11,
                        fontStyle: '800',
                        fontFamily: 'sans-serif',
                        fill: '#94a3b8',
                        align: 'center',
                        verticalAlign: 'middle'
                      }" />

                      <!-- Right column seats -->
                      <v-group 
                        v-for="(seat, seatIndex) in row.right" 
                        :key="seat.id"
                        :config="{
                          x: 112 + seatIndex * 40,
                          y: 64 + rowIndex * 44
                        }"
                        @click="toggleSeat(seat.id)"
                        @tap="toggleSeat(seat.id)"
                        @mouseenter="(evt) => handleSeatMouseEnter(seat, 112 + seatIndex * 40, 64 + rowIndex * 44, evt)"
                        @mouseleave="handleSeatMouseLeave"
                      >
                        <v-rect :config="getSeatBaseConfig(seat)" />
                        <v-rect :config="getSeatCushionConfig(seat)" />
                        <v-rect :config="getSeatBackrestConfig(seat)" />
                        <v-text :config="getSeatTextConfig(seat)" />
                      </v-group>
                    </v-group>
                  </v-layer>
                </v-stage>
                
                <!-- Floating price tooltip -->
                <transition name="fade">
                  <span 
                    v-if="tooltipActive" 
                    class="seat-tooltip" 
                    :style="{ 
                      left: tooltipX + 'px', 
                      top: tooltipY + 'px', 
                      visibility: 'visible', 
                      opacity: 1 
                    }"
                  >
                    <span class="tooltip-price" v-if="!occupiedSeats.includes(tooltipSeat.id)">{{ formatRp(bookingStore.basePrice) }}</span>
                    <span class="tooltip-status occupied" v-else>Terisi</span>
                  </span>
                </transition>
              </div>

              <!-- Legends -->
              <div class="bus-legends">
                <div class="legend-item">
                  <span class="legend-dot available"></span>
                  <span>Tersedia</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot selected"></span>
                  <span>Pilihanmu</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot occupied"></span>
                  <span>Terisi</span>
                </div>
              </div>

              <!-- Status Box -->
              <div class="seat-selection-status" :class="{ complete: selectedSeats.length === adults }">
                <div class="status-summary">
                  <span class="status-lbl">Kursi Terpilih:</span>
                  <div class="selected-seats-badges">
                    <span v-for="seat in selectedSeats" :key="seat" class="seat-badge">{{ seat }}</span>
                    <span v-if="selectedSeats.length === 0" class="no-seats-selected">Belum ada kursi yang dipilih</span>
                  </div>
                </div>
                <div class="status-counter">
                  <span>Jumlah: <strong>{{ selectedSeats.length }}</strong> dari <strong>{{ adults }}</strong> Dewasa</span>
                </div>
              </div>
              
              <div class="seat-error-msg" v-if="selectedSeats.length < adults">
                ⚠️ Silakan pilih {{ adults - selectedSeats.length }} kursi lagi sebelum melanjutkan pembayaran.
              </div>

              <!-- ZOOM MODAL POPUP -->
              <transition name="modal-fade">
                <div v-if="showZoomModal" class="zoom-modal-overlay" @click.self="showZoomModal = false">
                  <div class="zoom-modal-content">
                    <div class="zm-header">
                      <h3>Peta Kursi Bus (Detail & Zoom)</h3>
                      <button type="button" class="zm-close" @click="showZoomModal = false">✕</button>
                    </div>
                    
                    <div class="zm-toolbar">
                      <button type="button" class="zoom-ctrl-btn" @click="zoomIn">Perbesar (+)</button>
                      <button type="button" class="zoom-ctrl-btn" @click="zoomOut">Perkecil (-)</button>
                      <button type="button" class="zoom-ctrl-btn" @click="resetZoom">Reset</button>
                      <span class="zoom-indicator">Skala: {{ Math.round(zoomLevel * 100) }}%</span>
                    </div>

                    <div class="zm-body">
                      <div class="zm-scrollable-viewport">
                        <div class="zm-scale-container" :style="{ transform: 'scale(' + zoomLevel + ')' }">
                          
                          <!-- Bus Cabin Replica inside Modal (Vue-Konva) -->
                          <div class="canvas-bus-container modal-cabin" style="position: relative; width: 200px; height: 456px;">
                            <v-stage :config="{ width: 200, height: 456 }">
                              <v-layer>
                                <!-- Cockpit area -->
                                <v-rect :config="{
                                  x: 16,
                                  y: 16,
                                  width: 72,
                                  height: 32,
                                  cornerRadius: 5,
                                  stroke: '#cbd5e1',
                                  strokeWidth: 1,
                                  dash: [3, 3]
                                }" />
                                <v-text :config="{
                                  x: 16,
                                  y: 16,
                                  width: 72,
                                  height: 32,
                                  text: '🚪 PINTU DEPAN',
                                  fontSize: 8,
                                  fontStyle: 'bold',
                                  fontFamily: 'sans-serif',
                                  fill: '#64748b',
                                  align: 'center',
                                  verticalAlign: 'middle'
                                }" />

                                <!-- Driver Wheel Icon -->
                                <v-group :config="{ x: 148, y: 32 }">
                                  <v-circle :config="{
                                    x: 0,
                                    y: 0,
                                    radius: 10,
                                    stroke: '#64748b',
                                    strokeWidth: 2
                                  }" />
                                  <v-circle :config="{
                                    x: 0,
                                    y: 0,
                                    radius: 2.5,
                                    stroke: '#64748b',
                                    strokeWidth: 2
                                  }" />
                                  <v-line :config="{
                                    points: [0, -10, 0, -2.5],
                                    stroke: '#64748b',
                                    strokeWidth: 2
                                  }" />
                                  <v-line :config="{
                                    points: [-7.1, 7.1, -1.8, 1.8],
                                    stroke: '#64748b',
                                    strokeWidth: 2
                                  }" />
                                  <v-line :config="{
                                    points: [7.1, 7.1, 1.8, 1.8],
                                    stroke: '#64748b',
                                    strokeWidth: 2
                                  }" />
                                </v-group>

                                <!-- Dashed dividing line under cockpit -->
                                <v-line :config="{
                                  points: [16, 56, 184, 56],
                                  stroke: '#e2e8f0',
                                  strokeWidth: 1.5,
                                  dash: [4, 4]
                                }" />

                                <!-- Passenger rows -->
                                <v-group v-for="(row, rowIndex) in busRows" :key="'modal-row-' + row.rowNum">
                                  <!-- Left column (seats or rear door) -->
                                  <template v-if="row.left.length > 0">
                                    <v-group 
                                      v-for="(seat, seatIndex) in row.left" 
                                      :key="seat.id"
                                      :config="{
                                        x: 16 + seatIndex * 40,
                                        y: 64 + rowIndex * 44
                                      }"
                                      @click="toggleSeat(seat.id)"
                                      @tap="toggleSeat(seat.id)"
                                      @mouseenter="(evt) => handleSeatMouseEnter(seat, 16 + seatIndex * 40, 64 + rowIndex * 44, evt)"
                                      @mouseleave="handleSeatMouseLeave"
                                    >
                                      <v-rect :config="getSeatBaseConfig(seat)" />
                                      <v-rect :config="getSeatCushionConfig(seat)" />
                                      <v-rect :config="getSeatBackrestConfig(seat)" />
                                      <v-text :config="getSeatTextConfig(seat)" />
                                    </v-group>
                                  </template>
                                  <template v-else-if="row.rowNum === 9">
                                    <v-rect :config="{
                                      x: 16,
                                      y: 64 + rowIndex * 44,
                                      width: 72,
                                      height: 32,
                                      cornerRadius: 5,
                                      stroke: '#cbd5e1',
                                      strokeWidth: 1,
                                      dash: [3, 3]
                                    }" />
                                    <v-text :config="{
                                      x: 16,
                                      y: 64 + rowIndex * 44,
                                      width: 72,
                                      height: 32,
                                      text: '🚪 PINTU BELAKANG',
                                      fontSize: 8,
                                      fontStyle: 'bold',
                                      fontFamily: 'sans-serif',
                                      fill: '#64748b',
                                      align: 'center',
                                      verticalAlign: 'middle'
                                    }" />
                                  </template>

                                  <!-- Row labels (center aisle) -->
                                  <v-text :config="{
                                    x: 88,
                                    y: 64 + rowIndex * 44,
                                    width: 24,
                                    height: 32,
                                    text: row.rowNum.toString(),
                                    fontSize: 11,
                                    fontStyle: '800',
                                    fontFamily: 'sans-serif',
                                    fill: '#94a3b8',
                                    align: 'center',
                                    verticalAlign: 'middle'
                                  }" />

                                  <!-- Right column seats -->
                                  <v-group 
                                    v-for="(seat, seatIndex) in row.right" 
                                    :key="seat.id"
                                    :config="{
                                      x: 112 + seatIndex * 40,
                                      y: 64 + rowIndex * 44
                                    }"
                                    @click="toggleSeat(seat.id)"
                                    @tap="toggleSeat(seat.id)"
                                    @mouseenter="(evt) => handleSeatMouseEnter(seat, 112 + seatIndex * 40, 64 + rowIndex * 44, evt)"
                                    @mouseleave="handleSeatMouseLeave"
                                  >
                                    <v-rect :config="getSeatBaseConfig(seat)" />
                                    <v-rect :config="getSeatCushionConfig(seat)" />
                                    <v-rect :config="getSeatBackrestConfig(seat)" />
                                    <v-text :config="getSeatTextConfig(seat)" />
                                  </v-group>
                                </v-group>
                              </v-layer>
                            </v-stage>
                            
                            <!-- Floating price tooltip inside modal -->
                            <transition name="fade">
                              <span 
                                v-if="tooltipActive" 
                                class="seat-tooltip" 
                                :style="{ 
                                  left: tooltipX + 'px', 
                                  top: tooltipY + 'px', 
                                  visibility: 'visible', 
                                  opacity: 1 
                                }"
                              >
                                <span class="tooltip-price" v-if="!occupiedSeats.includes(tooltipSeat.id)">{{ formatRp(bookingStore.basePrice) }}</span>
                                <span class="tooltip-status occupied" v-else>Terisi</span>
                              </span>
                            </transition>
                          </div>

                        </div>
                      </div>
                    </div>
                    
                    <div class="zm-footer">
                      <button type="button" class="zm-close-btn" @click="showZoomModal = false">Tutup</button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT: Order Summary -->
      <div class="booking-summary-col">
        <div class="summary-card">
          <h3 class="summary-title">Ringkasan Pesanan</h3>

          <div class="summary-section" v-if="event">
            <div class="sum-label">Event</div>
            <div class="sum-value bold">{{ event.name }}</div>
            <div class="sum-sub">{{ event.dateLabel }} · 14:00 WIB</div>
          </div>

          <div class="summary-section">
            <div class="sum-label">Titik Jemput</div>
            <div class="sum-value bold" v-if="bookingStore.selectedPickup">{{ bookingStore.selectedPickup.name !== 'Custom' ? bookingStore.selectedPickup.name : 'Lokasi Custom' }}</div>
            <div class="sum-value muted" v-else>Belum dipilih</div>
            <div class="sum-sub" v-if="bookingStore.selectedPickup">{{ bookingStore.selectedPickup.address }}</div>
          </div>

          <div class="summary-section">
            <div class="sum-label">Titik Pulang (Tujuan Akhir)</div>
            <div class="sum-value bold">{{ event?.location }}</div>
            <div class="sum-sub">Lokasi Tempat Diselenggarakannya Acara</div>
          </div>

          <div class="summary-section">
            <div class="sum-label">Pemesan</div>
            <div class="sum-value bold" v-if="customer.name">{{ customer.name }}</div>
            <div class="sum-value muted" v-else>Belum diisi</div>
          </div>

          <div class="summary-section">
            <div class="sum-label">Penumpang</div>
            <div class="sum-value bold">{{ adults }} Dewasa{{ toddlers > 0 ? ` + ${toddlers} Balita` : '' }}</div>
          </div>

          <div class="summary-section">
            <div class="sum-label">Nomor Kursi</div>
            <div class="sum-value bold" v-if="selectedSeats.length > 0">{{ selectedSeats.join(', ') }}</div>
            <div class="sum-value muted" v-else>Belum memilih kursi</div>
          </div>

          <div class="summary-divider"></div>

          <div>
            <div class="price-breakdown">
              <span>{{ event ? formatRp(bookingStore.basePrice) : 'Rp 0' }} × {{ adults }} orang</span>
              <span>{{ formatRp(rideTotal) }}</span>
            </div>
            <div class="price-breakdown" v-if="toddlers > 0">
              <span>Balita ({{ toddlers }})</span>
              <span class="free-label">Gratis</span>
            </div>
            <div class="price-breakdown">
              <span>Admin Fee</span>
              <span>{{ formatRp(adminFee) }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="price-total">
              <span>Total Pembayaran</span>
              <span>{{ formatRp(grandTotal) }}</span>
            </div>
          </div>

          <div class="summary-guarantee">
            <Check :size="13" />
            <span>Pembatalan gratis hingga 24 jam sebelum keberangkatan</span>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM NAVBAR -->
    <div class="bottom-navbar">
      <div class="container bottom-navbar-inner">
        <div class="bottom-price-info">
          <span class="bp-label">Total Pembayaran</span>
          <span class="bp-val">{{ formatRp(grandTotal) }}</span>
        </div>
        <button class="proceed-btn bottom-btn" :class="{ disabled: !canProceed }" :disabled="!canProceed" @click="handleProceed">
          <span>Lanjutkan Pembayaran</span>
          <ArrowRight :size="18" />
        </button>
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
              <strong>{{ formatRp(grandTotal) }}</strong>
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
.booking-page { min-height: 100vh; background: var(--bg-color); padding-bottom: 140px; padding-top: 80px; }
.booking-topbar { background: var(--navbar-bg); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-color); position: sticky; top: 80px; z-index: 100; box-shadow: var(--shadow-sm); }
.topbar-inner { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; padding-bottom: 14px; }
.back-btn { display: flex; align-items: center; gap: 6px; font-family: inherit; font-size: 0.88rem; font-weight: 700; color: var(--text-light); cursor: pointer; border: none; background: none; padding: 6px 10px; border-radius: 10px; transition: all 0.2s; }
.back-btn:hover { background: #f0f0f0; color: var(--text-dark); }
.booking-layout { display: grid; grid-template-columns: 1fr 360px; gap: 32px; padding-top: 40px; align-items: start; }

@media (max-width: 992px) {
  .booking-layout {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-top: 20px;
  }
  .booking-summary-col {
    position: static;
  }
}

/* ===== EVENT PREVIEW ===== */
.event-preview-card { display: flex; align-items: center; gap: 16px; background: var(--card-bg); border-radius: 18px; padding: 16px; margin-bottom: 28px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
.event-preview-img { width: 72px; height: 72px; object-fit: cover; border-radius: 12px; flex-shrink: 0; }
.event-preview-tag { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); display: block; margin-bottom: 4px; }
.event-preview-name { font-size: 1.05rem; font-weight: 900; color: var(--text-dark); margin-bottom: 8px; letter-spacing: -0.3px; }
.event-preview-meta { display: flex; gap: 14px; font-size: 0.78rem; font-weight: 600; color: var(--text-light); }
.event-preview-meta span { display: flex; align-items: center; gap: 5px; }
.event-preview-meta svg { color: var(--primary); }

/* ===== SECTIONS ===== */
.form-section { background: var(--card-bg); border-radius: 24px; padding: 28px; margin-bottom: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
.section-heading { margin-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 16px; }
.sect-title { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 900; color: var(--text-dark); margin-bottom: 6px; letter-spacing: -0.3px; }
.sect-num { width: 28px; height: 28px; background: rgba(201,76,76,0.1); color: var(--primary); border-radius: 8px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; }
.sect-sub { font-size: 0.85rem; color: var(--text-light); padding-left: 38px; }
.sub-sect-title { font-size: 1.05rem; font-weight: 800; color: var(--text-dark); }

/* ===== INPUTS & FORMS ===== */
.form-label { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.85rem; color: var(--text-dark); margin-bottom: 8px; }
.form-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid var(--border-color); background: var(--input-bg); font-family: inherit; transition: all 0.2s; outline: none; }
.form-input:focus { border-color: var(--primary); background: var(--card-bg); box-shadow: 0 0 0 3px rgba(201,76,76,0.08); }

.locations-list { max-height: 280px; overflow-y: auto; padding-right: 10px; }
.loc-group { margin-bottom: 16px; }
.loc-region-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); padding: 0 4px; margin-bottom: 8px; }
.loc-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px; cursor: pointer; transition: all 0.2s; border: 1.5px solid transparent; margin-bottom: 6px; background: var(--input-bg); }
.loc-item:hover { background: rgba(201,76,76,0.04); border-color: rgba(201,76,76,0.15); }
.loc-item.selected { background: rgba(201,76,76,0.06); border-color: var(--primary); }
.loc-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(201,76,76,0.08); display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; }
.loc-name { font-size: 0.92rem; font-weight: 800; color: var(--text-dark); margin-bottom: 2px; }
.loc-address { font-size: 0.78rem; color: var(--text-light); line-height: 1.4; }
.loc-check { margin-left: auto; width: 24px; height: 24px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.no-results { text-align: center; padding: 20px; color: var(--text-light); font-size: 0.9rem; }

/* ===== PASSENGERS ===== */
.passengers-form { display: flex; flex-direction: column; gap: 16px; }
.passenger-row { display: flex; align-items: center; justify-content: space-between; padding: 18px; border: 1.5px solid var(--border-color); border-radius: 16px; background: var(--input-bg); }
.passenger-info { display: flex; align-items: center; gap: 14px; }
.pax-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(201,76,76,0.08); display: flex; align-items: center; justify-content: center; color: var(--primary); }
.pax-type { font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin-bottom: 2px; }
.pax-note { font-size: 0.76rem; color: var(--text-light); }
.counter-ctrl { display: flex; align-items: center; gap: 16px; }
.cnt-btn { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--primary); font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-family: inherit; line-height: 1; }
.cnt-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
.cnt-btn.faded { opacity: 0.3; cursor: not-allowed; pointer-events: none; }
.cnt-val { font-size: 1.3rem; font-weight: 900; color: var(--text-dark); min-width: 24px; text-align: center; }
.pax-note-box { display: flex; align-items: flex-start; gap: 10px; background: #fffbeb; border: 1px solid #f6d860; border-radius: 14px; padding: 14px 16px; font-size: 0.82rem; color: #8a6200; line-height: 1.5; }

/* ===== PROCEED BUTTON ===== */
.proceed-btn { width: 100%; padding: 18px; background: var(--primary); color: white; border: none; border-radius: 18px; font-family: inherit; font-size: 1rem; font-weight: 800; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 24px rgba(201,76,76,0.3); }
.proceed-btn:hover:not(.disabled) { background: #b34242; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,76,76,0.4); }
.proceed-btn.disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

/* ===== BOTTOM NAVBAR ===== */
.bottom-navbar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--navbar-bg); backdrop-filter: blur(20px); border-top: 1px solid var(--border-color); z-index: 900; padding: 16px 0; box-shadow: 0 -10px 30px rgba(0,0,0,0.05); }
.bottom-navbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.bottom-price-info { display: flex; flex-direction: column; gap: 4px; }
.bp-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); }
.bp-val { font-size: 1.25rem; font-weight: 900; color: var(--text-dark); }
.bottom-btn { max-width: 320px; padding: 16px; border-radius: 16px; margin: 0; }
@media (max-width: 768px) {
  .bottom-navbar { padding: 12px 0; }
  .bottom-navbar-inner { flex-direction: row; justify-content: space-between; align-items: center; gap: 10px; }
  .bottom-price-info { width: auto; flex-direction: column; align-items: flex-start; gap: 2px; flex-shrink: 0; }
  .bp-label { font-size: 0.65rem; }
  .bp-val { font-size: 1.1rem; }
  .bottom-btn { width: auto; flex-grow: 0; padding: 12px 16px; font-size: 0.85rem; max-width: none; }
}

/* ===== SUMMARY CARD ===== */
.booking-summary-col { position: sticky; top: 140px; }
.summary-card { background: var(--card-bg); border-radius: 24px; padding: 28px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
.summary-title { font-size: 1.1rem; font-weight: 900; color: var(--text-dark); margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(0,0,0,0.07); }
.summary-section { margin-bottom: 18px; }
.sum-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: var(--primary); margin-bottom: 4px; }
.sum-value { font-size: 0.92rem; font-weight: 700; color: var(--text-dark); }
.sum-value.bold { font-weight: 800; }
.sum-value.muted { color: #ccc; font-weight: 500; font-style: italic; }
.sum-sub { font-size: 0.78rem; color: var(--text-light); margin-top: 2px; }
.summary-divider { height: 1px; background: rgba(0,0,0,0.07); margin: 20px 0; }
.price-breakdown { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-light); margin-bottom: 10px; }
.free-label { color: #2e7d32; font-weight: 700; }
.price-total { display: flex; justify-content: space-between; font-size: 1.05rem; font-weight: 900; color: var(--text-dark); padding-top: 12px; border-top: 2px solid var(--primary); margin-top: 4px; }
.summary-guarantee { display: flex; align-items: center; gap: 8px; margin-top: 20px; padding: 12px 14px; background: rgba(46,125,50,0.06); border-radius: 12px; font-size: 0.78rem; font-weight: 600; color: #2e7d32; }
.summary-guarantee svg { flex-shrink: 0; }

/* ===== PAYMENT MODAL ===== */
.payment-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 20px; }
.payment-modal { background: white; width: 100%; max-width: 440px; border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.15); overflow: hidden; }
.pm-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); }
.pm-header h3 { font-size: 1.15rem; font-weight: 900; color: var(--text-dark); margin: 0; }
.pm-close { background: none; border: none; font-size: 1.2rem; color: var(--text-light); cursor: pointer; transition: color 0.2s; }
.pm-close:hover { color: var(--primary); }
.pm-body { padding: 24px; }
.pm-total { display: flex; justify-content: space-between; align-items: center; background: rgba(201,76,76,0.06); padding: 18px 20px; border-radius: 14px; margin-bottom: 24px; border: 1px dashed rgba(201,76,76,0.3); }
.pm-total span { font-size: 0.85rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }
.pm-total strong { font-size: 1.3rem; font-weight: 900; color: var(--text-dark); }
.pm-methods { display: flex; flex-direction: column; gap: 10px; }
.pm-method-label { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border: 1.5px solid rgba(0,0,0,0.08); border-radius: 14px; cursor: pointer; transition: all 0.2s; }
.pm-method-label:hover { border-color: rgba(201,76,76,0.3); background: rgba(201,76,76,0.02); }
.pm-method-label.active { border-color: var(--primary); background: rgba(201,76,76,0.06); box-shadow: 0 0 0 3px rgba(201,76,76,0.08); }
.pm-radio { display: none; }
.pm-icon { font-size: 1.4rem; }
.pm-name { font-weight: 700; font-size: 0.95rem; color: var(--text-dark); flex: 1; }
.pm-check { color: var(--primary); }
.pm-footer { padding: 20px 24px 24px; border-top: 1px solid rgba(0,0,0,0.04); }
.pm-submit-btn { width: 100%; padding: 16px; border-radius: 16px; background: var(--primary); color: white; border: none; font-family: inherit; font-size: 1rem; font-weight: 800; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 24px rgba(201,76,76,0.25); }
.pm-submit-btn:disabled { background: #e0e0e0; color: #aaa; box-shadow: none; cursor: not-allowed; }
.pm-submit-btn:hover:not(:disabled) { background: #b34242; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(201,76,76,0.35); }

/* ===== BUS SEAT SELECTION ===== */
.bus-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  width: 100%;
  background: #f8fafc; /* Canvas background */
  border: 1.5px solid #e2e8f0;
  border-radius: 24px;
  padding: 24px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02);
}
.zoom-trigger-btn {
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  color: var(--text-dark);
  font-family: inherit;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}
.zoom-trigger-btn:hover {
  background: var(--input-bg);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

.bus-cabin {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: fit-content;
  margin: 0 auto 24px;
}

/* Cockpit / Driver Area at the top right */
.bus-left-front {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 12px;
  border-bottom: 1.5px dashed #e2e8f0;
  margin-bottom: 12px;
}

.bus-door-label {
  font-size: 0.55rem;
  font-weight: 850;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 3px 6px;
  border-radius: 5px;
  border: 1px dashed #cbd5e1;
  white-space: nowrap;
}

.front-door {
  align-self: center;
}

.rear-door {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px; /* matches .seat-spacer-pair width */
  height: 32px; /* matches seat height */
  box-sizing: border-box;
  font-size: 0.52rem;
  padding: 2px 4px;
  text-align: center;
}
.driver-seat-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px; /* centered above the right column pair (32 + 8 + 32) */
}
.driver-icon-svg {
  color: #64748b;
  opacity: 0.85;
}

/* Passenger Area */
.bus-passenger-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bus-row-vertical {
  display: flex;
  align-items: center;
  gap: 16px;
}
.seat-pair {
  display: flex;
  gap: 8px;
}
.bus-aisle-vertical {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 32px;
}
.row-num-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
}
.seat-spacer-pair {
  display: flex;
  width: 72px;
  height: 32px;
}
.occupied-x {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 800;
  margin-top: -1px;
}

/* Realistic 3D Chair styled seat button (facing upward) - Slightly smaller basic size */
.seat-btn {
  position: relative;
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px 6px 9px 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.65rem;
  color: #1e293b;
  box-shadow: 0 2px 0 #cbd5e1, 0 3px 5px rgba(0,0,0,0.04);
  transition: all 0.1s ease;
  padding: 0;
}
/* Cushion inside the seat (upper part) */
.seat-btn::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 3px;
  right: 3px;
  bottom: 9px; /* leaves room for the backrest at the bottom */
  background: #f8fafc;
  border: 1.2px solid #cbd5e1;
  border-radius: 3px 3px 1.5px 1.5px;
  z-index: 1;
  transition: all 0.1s ease;
}
/* Backrest part at the bottom */
.seat-btn::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 4px;
  right: 4px;
  height: 5px;
  background: #cbd5e1;
  border-radius: 2px;
  z-index: 1;
  transition: all 0.1s ease;
}
.seat-name {
  position: relative;
  z-index: 2; /* display text above cushion */
  margin-top: -5px;
  font-weight: 850;
  pointer-events: none;
}

/* Hover state */
.seat-btn:not(.selected):hover:not(.occupied) {
  border-color: #94a3b8;
  transform: translateY(-0.5px);
  box-shadow: 0 2px 0 #cbd5e1, 0 4px 8px rgba(0,0,0,0.05);
}
.seat-btn:not(.selected):hover:not(.occupied)::before {
  background: #ffffff;
}

.seat-btn.selected:hover:not(.occupied) {
  transform: translateY(-0.5px);
  box-shadow: 0 2px 0 #b91c1c, 0 4px 8px rgba(239, 68, 68, 0.3);
}
.seat-btn.selected:hover:not(.occupied)::before {
  background: #f87171;
}

/* Selected state (Pilihanmu - Red) */
.seat-btn.selected {
  background: #ef4444;
  border-color: #b91c1c;
  color: #ffffff;
  box-shadow: 0 2px 0 #b91c1c, 0 4px 8px rgba(239, 68, 68, 0.2);
}
.seat-btn.selected::before {
  background: #ef4444;
  border-color: #b91c1c;
}
.seat-btn.selected::after {
  background: #b91c1c;
}

/* Occupied state (Terisi - Dark Grey) */
.seat-btn.occupied {
  background: #374151;
  border-color: #1f2937;
  color: #ffffff;
  box-shadow: 0 2px 0 #1f2937;
  cursor: not-allowed;
  opacity: 1; /* keep colors vivid even if disabled */
}
.seat-btn.occupied::before {
  background: #4b5563;
  border-color: #374151;
}
.seat-btn.occupied::after {
  background: #1f2937;
}

/* Tooltip styles */
.seat-tooltip {
  position: absolute;
  transform: translateX(-50%) translateY(-100%);
  margin-top: -8px; /* Offset to float nicely above the seat */
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  color: #0f172a;
  padding: 6px 12px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04);
  z-index: 100;
  pointer-events: none;
  line-height: 1;
}

/* Tooltip arrow border */
.seat-tooltip::before {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #cbd5e1 transparent transparent transparent;
  z-index: -1;
}

/* Tooltip arrow fill */
.seat-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: -1.5px; /* shift up to overlay the border */
  border-width: 5px;
  border-style: solid;
  border-color: #ffffff transparent transparent transparent;
  z-index: 1;
}

.tooltip-price {
  color: #ef4444; /* Clean theme red for price */
}

.tooltip-status.occupied {
  color: #64748b; /* Slate-500 for occupied */
  font-weight: 700;
}

/* Fade transition for Vue tooltip */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-95%);
}

/* Legends with 3D Chair Silhouettes */
.bus-legends {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-light);
}
.legend-dot {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  box-shadow: 0 1px 0 #cbd5e1;
}
.legend-dot::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 2px;
  right: 2px;
  bottom: 4px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 1.5px;
}
.legend-dot::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 3px;
  right: 3px;
  height: 1.8px;
  background: #cbd5e1;
  border-radius: 1px;
}

/* Legend items colors mapping */
.legend-dot.available {
  background: #ffffff;
  border: 1.2px solid #cbd5e1;
  box-shadow: 0 1px 0 #cbd5e1;
}
.legend-dot.selected {
  background: #ef4444;
  border: 1.2px solid #b91c1c;
  box-shadow: 0 1px 0 #b91c1c;
}
.legend-dot.selected::before {
  background: #ef4444;
  border-color: #b91c1c;
}
.legend-dot.selected::after {
  background: #b91c1c;
}
.legend-dot.occupied {
  background: #374151;
  border: 1.2px solid #1f2937;
  box-shadow: 0 1px 0 #1f2937;
}
.legend-dot.occupied::before {
  background: #4b5563;
  border-color: #374151;
}
.legend-dot.occupied::after {
  background: #1f2937;
}

/* Status Box */
.seat-selection-status {
  width: 100%;
  padding: 16px 20px;
  border-radius: 14px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
.status-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.status-lbl {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-dark);
}
.selected-seats-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.seat-badge {
  background: #ef4444;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(239,68,68,0.2);
}
.no-seats-selected {
  font-size: 0.82rem;
  font-style: italic;
  color: var(--text-light);
}
.status-counter {
  font-size: 0.8rem;
  color: var(--text-light);
  border-top: 1.5px solid #f1f5f9;
  padding-top: 10px;
}
.status-counter strong {
  color: var(--text-dark);
  font-weight: 800;
}
.seat-error-msg {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary);
  text-align: center;
  margin-top: 4px;
}

/* ===== ZOOM MODAL ===== */
.zoom-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  padding: 20px;
}
.zoom-modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 900px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.zm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
}
.zm-header h3 {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}
.zm-close {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s;
}
.zm-close:hover {
  color: #dc2626;
}
.zm-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.zoom-ctrl-btn {
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  color: #334155;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.zoom-ctrl-btn:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}
.zoom-indicator {
  font-size: 0.8rem;
  font-weight: 800;
  color: #475569;
  margin-left: auto;
}
.zm-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  padding: 40px 20px;
}
.zm-scrollable-viewport {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.zm-scale-container {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-cabin {
  margin: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
}
.zm-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}
.zm-close-btn {
  background: var(--primary);
  color: white;
  border: none;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 10px 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.zm-close-btn:hover {
  background: #b34242;
}

/* Responsive adjust for mobile screens */
@media (max-width: 580px) {
  .bus-container {
    padding: 16px;
    border-radius: 18px;
  }
  .bus-cabin {
    margin-bottom: 16px;
  }
  .bus-left-front {
    padding-bottom: 8px;
    margin-bottom: 2px;
  }
  .driver-seat-box {
    width: 54px;
  }
  .bus-passenger-area {
    gap: 8px;
  }
  .bus-row-vertical {
    gap: 10px;
  }
  .seat-pair {
    gap: 6px;
  }
  .bus-aisle-vertical {
    width: 18px;
    height: 24px;
  }
  .row-num-label {
    font-size: 0.65rem;
  }
  .seat-spacer-pair {
    width: 54px;
    height: 24px;
  }
  .occupied-x {
    font-size: 0.65rem;
  }

  .seat-btn {
    width: 24px;
    height: 24px;
    border-width: 1.2px;
    border-radius: 4px 4px 6px 6px;
    box-shadow: 0 1.5px 0 #cbd5e1;
  }
  .seat-btn::before {
    top: 1.5px;
    left: 2px;
    right: 2px;
    bottom: 6px;
    border-radius: 2px 2px 1px 1px;
    border-width: 0.8px;
  }
  .seat-btn::after {
    bottom: 1.5px;
    left: 3px;
    right: 3px;
    height: 3px;
    border-radius: 1px;
  }
  .seat-name {
    font-size: 0.55rem;
    margin-top: -4px;
  }

  .seat-btn.selected {
    box-shadow: 0 1.5px 0 #b91c1c;
  }
  .seat-btn.occupied {
    box-shadow: 0 1.5px 0 #1f2937;
  }
  .zoom-trigger-btn {
    padding: 8px 14px;
    font-size: 0.75rem;
  }
  .zoom-indicator {
    margin-left: 0;
    width: 100%;
    margin-top: 6px;
    text-align: center;
  }
}
</style>
