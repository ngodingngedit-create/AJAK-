<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldCheck, Bus, Zap, Coffee, Sofa, MapPin, Navigation, Search, ArrowRight, Users, Baby, X, Calendar, Star, Clock, Tag } from 'lucide-vue-next';
import { bookingStore } from '../store/booking';

const router = useRouter();

// Hero Images Loop
const heroImages = [
  { src: '/hero.png', alt: 'Concert Event Journey' },
  { src: '/sponsor_banner.png', alt: 'Sponsored Event - Special Promo Available!' }
];
const currentHeroIndex = ref(0);
let heroInterval;

onMounted(() => {
  heroInterval = setInterval(() => {
    currentHeroIndex.value = (currentHeroIndex.value + 1) % heroImages.length;
  }, 6000);
});
onUnmounted(() => {
  if (heroInterval) clearInterval(heroInterval);
});

// Mock Data
const events = [
  { id: 1, name: 'Neon Lights Festival', date: 'Oct 15, 2026', time: '18:00 WIB', location: 'City Arena', city: 'Jakarta', price: 'Rp 750.000', image: '/hero.png', desc: 'Festival musik elektronik terbesar di Asia Tenggara dengan lineup DJ kelas dunia. Nikmati malam yang penuh cahaya neon dan musik yang menggetarkan jiwa.', seats: 42, tag: 'Electronic' },
  { id: 2, name: 'Symphony in the Park', date: 'Oct 22, 2026', time: '19:30 WIB', location: 'Grand Park', city: 'Bandung', price: 'Rp 450.000', image: '/hero.png', desc: 'Konser orkestra klasik di bawah bulan purnama. Rasakan harmoni indah dari musisi terbaik Indonesia bersama orang-orang tersayang.', seats: 18, tag: 'Classical' },
  { id: 3, name: 'Midnight Rock', date: 'Nov 05, 2026', time: '20:00 WIB', location: 'Stadium One', city: 'Surabaya', price: 'Rp 950.000', image: '/hero.png', desc: 'Rock concert dengan energy level tertinggi! Band-band rock legendaris akan tampil di panggung terbesar Indonesia malam ini.', seats: 67, tag: 'Rock' },
  { id: 4, name: 'Indie Vibes Fest', date: 'Nov 12, 2026', time: '17:00 WIB', location: 'Downtown Square', city: 'Yogyakarta', price: 'Rp 350.000', image: '/hero.png', desc: 'Festival indie lokal yang merayakan kreativitas musisi independen Indonesia. Temukan suara baru yang segar dan autentik.', seats: 89, tag: 'Indie' },
];

// Event Modal
const selectedEvent = ref(null);
const modalAdults = ref(1);
const modalToddlers = ref(0);

const openEventModal = (event) => {
  // Navigate directly to booking flow
  bookingStore.selectedEvent = event;
  router.push(`/booking/${event.id}`);
};

const closeEventModal = () => {
  selectedEvent.value = null;
  document.body.style.overflow = '';
};

const bookEvent = () => {
  if (!selectedEvent.value) return;
  bookingStore.selectedEvent = selectedEvent.value;
  router.push(`/booking/${selectedEvent.value.id}`);
  closeEventModal();
};

// Booking Widget State
const bookingOrigin = ref('');
const bookingDestination = ref('');
const adultCount = ref(0);
const toddlerCount = ref(0);

const facilities = [
  { icon: Bus, title: 'Modern Fleet', desc: 'Spacious & comfortable vehicles' },
  { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Verified drivers & tracking' },
  { icon: Sofa, title: 'Comfort Seats', desc: 'Ergonomic seating layout' },
  { icon: Zap, title: 'Free Charging', desc: 'USB ports on every seat' },
  { icon: Coffee, title: 'Complimentary Water', desc: 'Free mineral water' }
];

const searchQuery = ref('');
const pickupLocations = [
  { region: 'Depok', name: 'Margo City', address: 'Jl. Margonda Raya No.358, Depok' },
  { region: 'Bogor', name: 'Botani Square', address: 'Jl. Raya Pajajaran, Tegallega' },
  { region: 'Tangerang', name: 'Tangerang City Mall', address: 'Jl. Jenderal Sudirman No.1' },
  { region: 'DKI Jakarta', name: 'Blok M Plaza', address: 'Jl. Bulungan No.76, Jakarta Selatan' },
  { region: 'DKI Jakarta', name: 'Grand Indonesia', address: 'Jl. M.H. Thamrin No.1, Jakarta Pusat' },
  { region: 'DKI Jakarta', name: 'Central Park', address: 'Jl. Letjen S. Parman, Jakarta Barat' },
  { region: 'Bandung', name: 'Trans Studio Mall', address: 'Jl. Gatot Subroto No.289, Bandung' },
  { region: 'Bandung', name: 'Cihampelas Walk', address: 'Jl. Cihampelas No.160, Bandung' },
  { region: 'Bekasi', name: 'Summarecon Mall Bekasi', address: 'Jl. Boulevard Ahmad Yani' }
];

const groupedLocations = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const filtered = pickupLocations.filter(loc =>
    loc.region.toLowerCase().includes(query) ||
    loc.name.toLowerCase().includes(query) ||
    loc.address.toLowerCase().includes(query)
  );
  const groups = {};
  filtered.forEach(loc => {
    if (!groups[loc.region]) groups[loc.region] = [];
    groups[loc.region].push(loc);
  });
  return groups;
});

const selectPickup = (locName) => {
  bookingOrigin.value = locName;
  document.getElementById('booking-portal').scrollIntoView({ behavior: 'smooth' });
};

const handleSearch = () => {
  if (!bookingDestination.value) { alert('Please enter a destination.'); return; }
  if (!bookingOrigin.value) { alert('Please enter a pickup location.'); return; }
  alert(`Searching ride for ${adultCount.value} adult(s) & ${toddlerCount.value} toddler(s) from ${bookingOrigin.value} to ${bookingDestination.value}`);
};

// Reviews
const reviews = [
  { id: 1, name: 'Rizky Aditya', initials: 'RA', trip: 'Neon Lights Festival → City Arena', stars: 5, color: '#C94C4C', comment: 'Pelayanan luar biasa! Berangkat on time, kursinya nyaman banget, dan drivernya ramah. Gak perlu khawatir soal parkir event lagi. Worth every penny!', date: '16 Oct 2026', tag: 'Crowd Shuttle' },
  { id: 2, name: 'Salsabila Putri', initials: 'SP', trip: 'Symphony in Park → Grand Park', stars: 5, color: '#7C4DFF', comment: 'Pertama kali coba AJAK! dan langsung ketagihan. Mobilnya bersih, ada charger USB, dan rutenya pas banget dari dekat rumah. Akan pakai lagi pastinya!', date: '23 Oct 2026', tag: 'Crowd Shuttle' },
  { id: 3, name: 'Daffa Ramadhan', initials: 'DR', trip: 'Midnight Rock → Stadium One', stars: 5, color: '#00897B', comment: 'VIP experience yang sesungguhnya. Dijemput langsung di depan venue, privat tanpa ribet. Untuk artis dan tamu penting, AJAK! Black Label adalah pilihan terbaik.', date: '6 Nov 2026', tag: 'Black Label' },
  { id: 4, name: 'Nadia Kusuma', initials: 'NK', trip: 'Indie Vibes Fest → Downtown', stars: 4, color: '#F4511E', comment: 'Sangat membantu! Aplikasinya mudah, pick up point-nya jelas, dan harganya reasonable untuk kualitas yang didapat. Sedikit telat 5 menit, tapi overall bagus.', date: '13 Nov 2026', tag: 'Crowd Shuttle' },
  { id: 5, name: 'Kevin Pratama', initials: 'KP', trip: 'Neon Lights → City Arena', stars: 5, color: '#1565C0', comment: 'Game changer untuk concert goers! Gak perlu mikirin parkir, macet, atau pulang kemalaman. AJAK! bikin experience konser jadi 10x lebih enjoyable.', date: '17 Oct 2026', tag: 'Crowd Shuttle' },
  { id: 6, name: 'Amelia Santoso', initials: 'AS', trip: 'Symphony → Grand Park', stars: 5, color: '#6D4C41', comment: 'Recommended banget! Koordinasi grupnya mudah, seats comfy, dan systemnya terorganisir. Tim AJAK! juga responsif kalau ada pertanyaan.', date: '24 Oct 2026', tag: 'Crowd Shuttle' }
];

// duplicated for seamless marquee loop
const reviewsMarquee = [...reviews, ...reviews];

// Marquee logo count
const marqueeCount = 12;
</script>

<template>
  <div class="home-view">

    <!-- ===== EVENT DETAIL MODAL ===== -->
    <transition name="modal-fade">
      <div v-if="selectedEvent" class="modal-overlay" @click.self="closeEventModal">
        <div class="modal-card">
          <button class="modal-close" @click="closeEventModal"><X size="20" /></button>
          <div class="modal-img">
            <img :src="selectedEvent.image" :alt="selectedEvent.name" />
            <div class="modal-img-overlay"></div>
            <div class="modal-tag">{{ selectedEvent.tag }}</div>
          </div>
          <div class="modal-body">
            <h2 class="modal-title">{{ selectedEvent.name }}</h2>
            <p class="modal-desc">{{ selectedEvent.desc }}</p>

            <div class="modal-info-grid">
              <div class="meta-item"><Calendar size="15" /><span>{{ selectedEvent.date }} · {{ selectedEvent.time }}</span></div>
              <div class="meta-item"><MapPin size="15" /><span>{{ selectedEvent.location }}, {{ selectedEvent.city }}</span></div>
              <div class="meta-item"><Tag size="15" /><span>{{ selectedEvent.price }} / orang</span></div>
              <div class="meta-item seats"><Clock size="15" /><span>{{ selectedEvent.seats }} kursi tersisa</span></div>
            </div>

            <div class="modal-divider"></div>
            
            <div class="modal-route-box">
              <p class="section-tag-mini">Rute Perjalanan</p>
              <div class="route-visual">
                <div class="route-dot"></div>
                <div class="route-line-dashed"></div>
                <div class="route-target-icon"><Navigation size="14" /></div>
                <div class="route-labels">
                  <div class="route-label-item">
                    <span class="l-top">Penjemputan</span>
                    <span class="l-bottom">Titik Terdekat Anda</span>
                  </div>
                  <div class="route-label-item text-right">
                    <span class="l-top">Tujuan</span>
                    <span class="l-bottom">{{ selectedEvent.location }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-divider"></div>
            <p class="modal-counter-label">Jumlah Penumpang</p>

            <div class="modal-counters">
              <div class="m-counter-group">
                <span class="m-counter-lbl"><Users size="13" /> Dewasa</span>
                <div class="m-counter-ctrl">
                  <button class="cnt-btn" :class="{ faded: modalAdults <= 1 }" @click="modalAdults > 1 ? modalAdults-- : null">−</button>
                  <span class="cnt-val">{{ modalAdults }}</span>
                  <button class="cnt-btn" @click="modalAdults++">+</button>
                </div>
              </div>
              <div class="m-cnt-sep"></div>
              <div class="m-counter-group">
                <span class="m-counter-lbl"><Baby size="13" /> Balita</span>
                <div class="m-counter-ctrl">
                  <button class="cnt-btn" :class="{ faded: modalToddlers === 0 }" @click="modalToddlers > 0 ? modalToddlers-- : null">−</button>
                  <span class="cnt-val">{{ modalToddlers }}</span>
                  <button class="cnt-btn" @click="modalToddlers++">+</button>
                </div>
              </div>
            </div>

            <button class="modal-book-btn" @click="bookEvent">
              Pesan Ride Sekarang →
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== HERO SECTION ===== -->
    <section class="hero-section">
      <!-- Background slideshow -->
      <div class="hero-bg">
        <transition-group name="fade-slideshow" tag="div">
          <div v-for="(img, index) in heroImages" :key="img.src" v-show="currentHeroIndex === index" class="slide-layer">
            <img :src="img.src" :alt="img.alt" />
          </div>
        </transition-group>
        <!-- Layered overlays for depth -->
        <div class="hero-overlay-bottom"></div>
        <div class="hero-overlay-vignette"></div>
        <!-- Floating decorative orbs -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>

      <!-- Slide dots indicator -->
      <div class="slide-dots">
        <button
          v-for="(img, i) in heroImages"
          :key="i"
          class="slide-dot"
          :class="{ active: currentHeroIndex === i }"
          @click="currentHeroIndex = i"
        ></button>
      </div>

      <div class="hero-body">
        <!-- Top eyebrow badge -->
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Transport Resmi Event Indonesia
        </div>

        <!-- Main headline -->
        <h1 class="hero-title">
          Ride to the
          <span class="hero-highlight"> Beat.</span><br />
          Arrive in <span class="hero-highlight">Style.</span>
        </h1>

        <!-- Subtext -->
        <p class="hero-subtitle">
          Tanpa stres parkir, tanpa macet, tanpa ribet.<br class="d-pc" />
          AJAK! mengantarmu ke event favoritmu dengan nyaman dan aman.
        </p>

        <!-- Dual CTA -->
        <div class="hero-ctas">
          <button class="cta-primary" @click="router.push('/events')">
            <span>Lihat Semua Event</span>
            <ArrowRight :size="18" />
          </button>
          <button class="cta-secondary" @click="document.getElementById('services').scrollIntoView({ behavior: 'smooth' })">
            Jelajahi Layanan
          </button>
        </div>

        <!-- Stats row -->
        <div class="hero-stats">
          <div class="stat-pill">
            <span class="stat-num">50K+</span>
            <span class="stat-lab">Riders</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-pill">
            <span class="stat-num">200+</span>
            <span class="stat-lab">Events</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-pill">
            <span class="stat-num">24/7</span>
            <span class="stat-lab">Support</span>
          </div>
        </div>
      </div>

      <!-- Scroll cue -->
      <!-- <div class="scroll-cue">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span>Scroll</span>
      </div> -->
    </section>

    <!-- ===== MARQUEE 1 ===== -->
    <div class="logo-marquee-wrap">
      <div class="logo-marquee-track">
        <div class="logo-marquee-inner">
          <div v-for="i in marqueeCount" :key="'f'+i" class="logo-marquee-item">
            <img src="/loopinglogo/LOGOLOOPING.png" alt="AJAK!" class="marquee-logo-img white-logo" />
          </div>
          <div v-for="i in marqueeCount" :key="'f2'+i" class="logo-marquee-item" aria-hidden="true">
            <img src="/loopinglogo/LOGOLOOPING.png" alt="AJAK!" class="marquee-logo-img white-logo" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== UPCOMING VIBES ===== -->
    <section class="section vibes-section" id="vibes">
      <div class="container">
        <div class="section-title-box text-center mb-5">
          <span class="sub-title">Curation</span>
          <h2 class="creative-title">Upcoming <span class="text-primary">Vibes</span></h2>
          <div class="title-underline mx-auto"></div>
        </div>

        <div class="events-cards">
          <div v-for="event in events" :key="event.id" class="modern-card" @click="openEventModal(event)">
            <div class="card-image-box">
              <img :src="event.image" :alt="event.name"/>
              <div class="card-status">Selling Fast</div>
              <div class="card-click-hint">Tap to book ride</div>
            </div>
            <div class="card-body">
              <p class="card-location">{{ event.location }} · {{ event.city }}</p>
              <h3 class="card-name">{{ event.name }}</h3>
              <div class="card-footer-info">
                <span class="card-price-tag">{{ event.price }}</span>
                <button class="btn btn-primary-small">Book Ride</button>
              </div>
            </div>
          </div>
        </div>

        <!-- View all CTA -->
        <div class="view-all-wrap">
          <button class="view-all-btn" @click="router.push('/events')">
            Lihat Semua Event
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>
    </section>

    <!-- ===== MARQUEE 2 ===== -->
    <div class="logo-marquee-wrap">
      <div class="logo-marquee-track">
        <div class="logo-marquee-inner">
          <div v-for="i in marqueeCount" :key="'b'+i" class="logo-marquee-item">
            <img src="/loopinglogo/LOGOLOOPING.png" alt="AJAK!" class="marquee-logo-img" />
          </div>
          <div v-for="i in marqueeCount" :key="'b2'+i" class="logo-marquee-item" aria-hidden="true">
            <img src="/loopinglogo/LOGOLOOPING.png" alt="AJAK!" class="marquee-logo-img" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== EXPERIENCE TIERS ===== -->
    <section class="section tiers-section" id="services">
      <div class="container">
        <div class="section-title-box text-center mb-5">
          <span class="sub-title">Our Fleet</span>
          <h2 class="creative-title">Experience <span class="text-primary">Tiers</span></h2>
          <div class="title-underline mx-auto"></div>
        </div>

        <div class="tiers-grid">
          <div class="tier-card public">
            <div class="tier-visual">
              <img src="/public_bus.png" alt="Public Shuttle" />
              <div class="tier-badge">Fan Favorite</div>
            </div>
            <div class="tier-info">
              <div class="tier-tag">Shared Community</div>
              <h3>The Crowd Shuttle</h3>
              <p>The ultimate way to travel with fellow fans. Efficient, safe, and social.</p>
              <ul class="tier-list">
                <li><Zap size="16"/> Smart Pickup Locations</li>
                <li><Zap size="16"/> Scheduled Departures</li>
                <li><Zap size="16"/> Round-trip Security</li>
              </ul>
              <button class="btn btn-outline-red mt-4">Learn More</button>
            </div>
          </div>

          <div class="tier-card dark">
            <div class="tier-visual">
              <img src="/private_car.png" alt="VIP Car" />
              <div class="tier-badge vip">Elite</div>
            </div>
            <div class="tier-info">
              <div class="tier-tag">VIP Exclusive</div>
              <h3>The Black Label</h3>
              <p>Premium privacy for performers and VVIPs. Total control over your schedule.</p>
              <ul class="tier-list">
                <li><Zap size="16"/> Luxury Chauffeurs</li>
                <li><Zap size="16"/> Door-to-Door Direct</li>
                <li><Zap size="16"/> Absolute Privacy</li>
              </ul>
              <button class="btn btn-primary mt-4">Book VIP</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== MARQUEE 3 ===== -->
    <div class="logo-marquee-wrap">
      <div class="logo-marquee-track">
        <div class="logo-marquee-inner">
          <div v-for="i in marqueeCount" :key="'c'+i" class="logo-marquee-item">
            <img src="/loopinglogo/LOGOLOOPING.png" alt="AJAK!" class="marquee-logo-img" />
          </div>
          <div v-for="i in marqueeCount" :key="'c2'+i" class="logo-marquee-item" aria-hidden="true">
            <img src="/loopinglogo/LOGOLOOPING.png" alt="AJAK!" class="marquee-logo-img" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== PICKUP DISCOVERY ===== -->
    <section class="section pickup-discovery bg-light" id="discovery">
      <div class="container">
        <div class="section-title-box mb-5">
          <span class="sub-title">Network</span>
          <h2 class="creative-title">Pick Up <span class="text-primary">Discovery</span></h2>
          <div class="title-underline"></div>
        </div>

        <div class="discovery-grid">
          <div class="search-panel glass-morphism">
            <div class="custom-search">
              <Search size="20" class="srch-icon" />
              <input type="text" v-model="searchQuery" placeholder="Search your city...">
            </div>
            <div class="results-scroll">
              <div v-for="(locations, region) in groupedLocations" :key="region">
                <h4 class="group-label">{{ region }}</h4>
                <div v-for="loc in locations" :key="loc.name" class="loc-card" @click="selectPickup(loc.name)">
                  <div class="loc-text">
                    <h5>{{ loc.name }}</h5>
                    <p>{{ loc.address }}</p>
                  </div>
                  <div class="loc-action"><ArrowRight size="18" /></div>
                </div>
              </div>
            </div>
          </div>

          <div class="map-panel">
            <img src="/map_placeholder.png" alt="Location Map" />
            <div class="map-floating-card">
              <div class="hub-count">24+</div>
              <div class="hub-label">Active Hubs</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FACILITIES ===== -->
    <section class="section amenities-section">
      <div class="container text-center">
        <h2 class="creative-title text-white mb-5">Ride <span class="text-secondary">Amenities</span></h2>
        <div class="amenities-grid">
          <div v-for="(fac, index) in facilities" :key="index" class="amenity-box">
            <div class="amenity-icon">
              <component :is="fac.icon" size="32" />
            </div>
            <h4>{{ fac.title }}</h4>
            <p>{{ fac.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== MARQUEE 4 — WHITE ===== -->
    <div class="logo-marquee-wrap white-marquee">
      <div class="logo-marquee-track">
        <div class="logo-marquee-inner">
          <div v-for="i in marqueeCount" :key="'d'+i" class="logo-marquee-item">
            <img src="/AJAKLogo/LOGO.png" alt="AJAK!" class="marquee-logo-img marquee-logo-color" />
          </div>
          <div v-for="i in marqueeCount" :key="'d2'+i" class="logo-marquee-item" aria-hidden="true">
            <img src="/AJAKLogo/LOGO.png" alt="AJAK!" class="marquee-logo-img marquee-logo-color" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== THE HEART (ABOUT) ===== -->
    <section class="section heart-section" id="about">
      <div class="container">
        <div class="heart-container">
          <span class="sub-title">Foundations</span>
          <h2 class="creative-title mb-4">The Heart of <span class="text-primary">AJAK!</span></h2>
          <div class="title-underline mx-auto mb-5"></div>
          <p class="main-para">
            We started with a simple belief: <strong>getting there should be as exciting as the performance itself.</strong>
          </p>
          <p class="sub-para mt-4">
            Born in 2026, AJAK! bridges the gap between chaotic city transit and the electric atmosphere of the stage. We build safe, organized, and premium transport networks for fans, artists, and everyone in between.
          </p>
          <div class="stats-row mt-5">
            <div class="stat-circle"><span class="val">50k+</span><span class="lab">Riders</span></div>
            <div class="stat-circle secondary"><span class="val">200+</span><span class="lab">Stages</span></div>
            <div class="stat-circle"><span class="val">24/7</span><span class="lab">Care</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Divider -->
    <div class="section-divider-wrap">
      <div class="container">
        <div class="thin-border-divider"></div>
      </div>
    </div>

    <!-- ===== REVIEWS — INFINITE SCROLL MARQUEE ===== -->
    <section class="section reviews-section" id="reviews">
      <div class="container">
        <div class="section-title-box text-center mb-5">
          <span class="sub-title">Testimonial</span>
          <h2 class="creative-title">Apa Kata <span class="text-primary">Pengguna</span></h2>
          <div class="title-underline mx-auto"></div>
        </div>
      </div>

      <!-- Full-width marquee strip -->
      <div class="reviews-marquee-outer">
        <div class="reviews-marquee-inner">
          <div v-for="(review, i) in reviewsMarquee" :key="i + '-rv'" class="review-card">
            <div class="review-header">
              <div class="reviewer-avatar" :style="{ background: review.color }">{{ review.initials }}</div>
              <div class="reviewer-info">
                <div class="reviewer-name">{{ review.name }}</div>
                <div class="reviewer-trip">{{ review.trip }}</div>
              </div>
              <div class="review-stars">
                <span v-for="s in 5" :key="s" class="star" :class="{ filled: s <= review.stars }">★</span>
              </div>
            </div>
            <p class="review-text">{{ review.comment }}</p>
            <div class="review-footer">
              <span class="review-date">{{ review.date }}</span>
              <span class="review-tag">{{ review.tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FINAL CTA SECTION ===== -->
    <section class="section final-cta-section">
      <div class="container shadow-mobile-cleanup">
        <div class="cta-banner-card">
          <div class="cta-content">
            <h2 class="cta-title">Siap untuk perjalanan berikutnya?</h2>
            <p class="cta-desc">Temukan event favoritmu dan pesan ride kamu sekarang tanpa ribet.</p>
          </div>
          <button class="btn btn-primary cta-action-btn" @click="router.push('/events')">
            Lihat Semua Event <ArrowRight size="20" />
          </button>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ===== GLOBAL TOKENS ===== */
.text-gradient {
  background: linear-gradient(135deg, #ff6b6b, #ff9a9a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.sub-title {
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary);
  display: block;
  margin-bottom: 12px;
}
.creative-title {
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: -1px;
}
.title-underline {
  width: 60px;
  height: 4px;
  background: var(--primary);
  border-radius: 2px;
  margin-top: 16px;
}

/* ===== HERO ===== */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Background & overlays */
.hero-bg {
  position: absolute; inset: 0; z-index: 0;
  overflow: hidden; background: #0a0a0a;
}
.slide-layer {
  position: absolute; inset: 0;
  transition: opacity 1s ease;
}
.slide-layer img {
  width: 100%; height: 100%; object-fit: cover;
  transform: scale(1.04);
  animation: hero-zoom 10s ease forwards;
}
@keyframes hero-zoom {
  from { transform: scale(1.04); }
  to   { transform: scale(1.00); }
}
.hero-overlay-bottom {
  position: absolute; bottom: 0; left: 0; right: 0; height: 75%;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%);
  z-index: 1;
}
.hero-overlay-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);
  z-index: 1;
}

/* Decorative orbs */
.orb {
  position: absolute; border-radius: 50%; z-index: 1;
  filter: blur(80px); pointer-events: none;
}
.orb-1 {
  width: 500px; height: 500px;
  background: rgba(201, 76, 76, 0.18);
  top: -100px; right: -100px;
  animation: orb-drift 8s ease-in-out infinite alternate;
}
.orb-2 {
  width: 300px; height: 300px;
  background: rgba(201, 76, 76, 0.10);
  bottom: 80px; left: -80px;
  animation: orb-drift 10s ease-in-out 2s infinite alternate-reverse;
}
@keyframes orb-drift {
  from { transform: translate(0, 0); }
  to   { transform: translate(30px, 20px); }
}

/* Slide dots */
.slide-dots {
  position: absolute; bottom: 88px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 10;
}
.slide-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.35);
  border: none; cursor: pointer; padding: 0;
  transition: all 0.3s ease;
}
.slide-dot.active {
  background: var(--primary);
  width: 24px;
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(201,76,76,0.5);
}

/* Hero body */
.hero-body {
  position: relative; z-index: 5;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; color: white;
  padding: 100px 24px 100px;
  width: 100%; max-width: 1000px; margin: 0 auto;
}

/* Eyebrow */
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  color: rgba(255,255,255,0.8);
  padding: 8px 18px; border-radius: 30px;
  font-size: 0.78rem; font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 32px;
  animation: fade-up 0.6s ease 0.1s both;
}
.eyebrow-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 8px var(--primary);
  animation: pulse-dot 2s ease infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

/* Title */
.hero-title {
  font-size: clamp(3rem, 7vw, 6.5rem);
  font-weight: 900;
  line-height: 1.0;
  margin-bottom: 24px;
  letter-spacing: -3px;
  animation: fade-up 0.6s ease 0.2s both;
}
.hero-highlight {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff9a9a 50%, #ffb3b3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

/* Subtitle */
.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.7;
  margin-bottom: 44px;
  max-width: 520px;
  line-height: 1.75;
  animation: fade-up 0.6s ease 0.3s both;
}

/* CTA buttons */
.hero-ctas {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 56px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fade-up 0.6s ease 0.4s both;
}
.cta-primary {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--primary);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 18px;
  font-family: inherit; font-size: 1rem; font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 8px 32px rgba(201,76,76,0.4), 0 0 0 0 rgba(201,76,76,0.3);
  position: relative; overflow: hidden;
}
.cta-primary::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.cta-primary:hover::before { opacity: 1; }
.cta-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 16px 40px rgba(201,76,76,0.5), 0 0 0 4px rgba(201,76,76,0.15);
}
.cta-primary:active { transform: translateY(0) scale(0.98); }
.cta-primary svg { transition: transform 0.3s; }
.cta-primary:hover svg { transform: translateX(4px); }

.cta-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.08);
  color: white;
  border: 1.5px solid rgba(255,255,255,0.25);
  padding: 16px 32px;
  border-radius: 18px;
  font-family: inherit; font-size: 1rem; font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.cta-secondary:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.5);
  transform: translateY(-2px);
}
.cta-secondary:active { transform: translateY(0); }

/* Stats row */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 18px 36px;
  animation: fade-up 0.6s ease 0.5s both;
}
.stat-pill {
  display: flex; flex-direction: column;
  align-items: center; gap: 2px;
  padding: 0 28px;
}
.stat-num {
  font-size: 1.6rem; font-weight: 900;
  color: white; line-height: 1;
  letter-spacing: -1px;
}
.stat-lab {
  font-size: 0.7rem; font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 1.5px;
}
.stat-sep {
  width: 1px; height: 40px;
  background: rgba(255,255,255,0.15);
}

/* Scroll cue */
.scroll-cue {
  position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  z-index: 10; color: rgba(255,255,255,0.4);
  font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 2px;
  animation: fade-up 0.6s ease 0.8s both;
}
.scroll-mouse {
  width: 22px; height: 34px; border: 2px solid rgba(255,255,255,0.25);
  border-radius: 12px; display: flex; justify-content: center;
  padding-top: 6px;
}
.scroll-wheel {
  width: 3px; height: 6px; background: rgba(255,255,255,0.5);
  border-radius: 2px;
  animation: scroll-anim 1.8s ease infinite;
}
@keyframes scroll-anim {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
}

/* Fade-up animation */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .hero-title { letter-spacing: -1.5px; }
  .hero-stats { padding: 14px 16px; }
  .stat-pill { padding: 0 14px; }
  .stat-num { font-size: 1.3rem; }
  .hero-ctas { gap: 10px; }
  .cta-primary, .cta-secondary { padding: 14px 22px; font-size: 0.92rem; }
  .scroll-cue { display: none; }
}

/* ===== BOOKING CARD ===== */
.booking-card {
  width: 100%; max-width: 900px;
  background: var(--navbar-bg);
  backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
  border-radius: 28px;
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--border-color);
  overflow: hidden;
}
.booking-row-inputs {
  display: flex; align-items: center;
  padding: 30px 32px 20px; gap: 0;
  border-bottom: 1px solid var(--border-color);
}
.booking-row-bottom {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 32px 28px; gap: 24px;
}
.b-field { flex: 1; text-align: left; min-width: 0; }
.b-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 1.5px; color: var(--primary); margin-bottom: 8px;
}
.b-input {
  border: none; background: transparent; font-size: 1rem;
  font-weight: 600; color: var(--text-dark); font-family: inherit; outline: none; width: 100%;
}
.b-input::placeholder { color: #c5c5c5; font-weight: 500; }

.route-arrow { display: flex; align-items: center; padding: 0 20px; gap: 8px; flex-shrink: 0; }
.route-line { width: 40px; height: 1px; background: rgba(201,76,76,0.25); }
.route-icon {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(201,76,76,0.08); border: 1.5px solid rgba(201,76,76,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: var(--primary); flex-shrink: 0;
}

.b-counters { display: flex; align-items: center; gap: 24px; }
.b-counter-group { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.b-counter-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 1.5px; color: var(--primary);
}
.b-cnt-sep { width: 1px; height: 40px; background: rgba(0,0,0,0.07); }
.b-counter-ctrl { display: flex; align-items: center; gap: 12px; }
.cnt-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1.5px solid rgba(201,76,76,0.25); background: rgba(201,76,76,0.05);
  color: var(--primary); font-size: 1.1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: var(--transition); line-height: 1; font-family: inherit;
}
.cnt-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
.cnt-btn.faded { opacity: 0.3; cursor: not-allowed; }
.cnt-val { font-size: 1.25rem; font-weight: 900; color: var(--text-dark); min-width: 22px; text-align: center; }

.b-search-btn {
  display: flex; align-items: center; gap: 10px;
  background: var(--primary); color: white; border: none;
  border-radius: 16px; padding: 16px 32px;
  font-family: inherit; font-size: 0.9rem; font-weight: 800;
  cursor: pointer; transition: var(--transition); white-space: nowrap; letter-spacing: 0.5px;
}
.b-search-btn:hover { background: #b34242; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,76,76,0.4); }

/* ===== LOGO MARQUEE ===== */
.logo-marquee-wrap {
  background: var(--primary); padding: 6px 0; overflow: hidden;
  display: flex; flex-direction: column; gap: 0;
}
.white-marquee {
  background: var(--bg-color);
  border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);
  padding: 4px 0;
}
.logo-marquee-track { overflow: hidden; width: 100%; }
.logo-marquee-inner {
  display: flex; width: max-content;
  animation: marquee-fwd 25s linear infinite;
}
@keyframes marquee-fwd {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.logo-marquee-item { display: flex; align-items: center; padding: 0 44px; }
.marquee-logo-img {
  height: 95px; width: auto; object-fit: contain; opacity: 0.9;
  transition: opacity 0.3s; filter: brightness(0) invert(1);
}
.marquee-logo-color { filter: none; opacity: 0.8; height: 44px; }

/* ===== EVENTS ===== */
.vibes-section { padding-top: 80px; }
.events-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
.modern-card {
  background: var(--card-bg); border-radius: 24px; overflow: hidden;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  border: 1px solid var(--border-color);
  position: relative;
}
.modern-card::after {
  content: '';
  position: absolute; inset: 0;
  border-radius: 24px;
  border: 2px solid transparent;
  transition: border-color 0.3s;
  pointer-events: none;
}
.modern-card:hover {
  transform: translateY(-12px) scale(1.01);
  box-shadow: 0 24px 50px rgba(201,76,76,0.14), 0 8px 20px rgba(0,0,0,0.06);
}
.modern-card:hover::after { border-color: rgba(201,76,76,0.2); }
.modern-card:hover .card-click-hint { opacity: 1; }
.modern-card:active { transform: translateY(-4px) scale(0.99); }

.card-image-box { height: 200px; position: relative; overflow: hidden; }
.card-image-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); }
.modern-card:hover .card-image-box img { transform: scale(1.08); }
.card-status {
  position: absolute; top: 14px; right: 14px;
  background: var(--card-bg); padding: 4px 12px;
  border-radius: 10px; font-size: 0.7rem; font-weight: 800; color: var(--primary);
  box-shadow: var(--shadow-sm);
}
.card-click-hint {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.6); color: white; font-size: 0.7rem; font-weight: 700;
  padding: 5px 14px; border-radius: 20px; opacity: 0; transition: opacity 0.3s;
  white-space: nowrap; backdrop-filter: blur(6px);
}
.card-body { padding: 22px; }
.card-location { font-weight: 700; color: var(--primary); font-size: 0.72rem; text-transform: uppercase; margin-bottom: 6px; }
.card-name { font-size: 1.15rem; font-weight: 800; margin-bottom: 18px; }
.card-footer-info { display: flex; justify-content: space-between; align-items: center; }
.card-price-tag { font-weight: 900; font-size: 1.05rem; color: var(--text-dark); }
.btn-primary-small {
  background: var(--primary); color: white; padding: 8px 18px;
  border-radius: 10px; font-weight: 700; font-size: 0.82rem;
  cursor: pointer; border: none; font-family: inherit; transition: all 0.25s;
  display: flex; align-items: center; gap: 6px;
}
.btn-primary-small::after { content: '→'; transition: transform 0.25s; }
.modern-card:hover .btn-primary-small::after { transform: translateX(4px); }
.btn-primary-small:hover { background: #b34242; transform: scale(1.04); }

/* View all button */
.view-all-wrap {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}
.view-all-btn {
  display: inline-flex; align-items: center; gap: 10px;
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
  padding: 14px 32px;
  border-radius: 16px;
  font-family: inherit; font-size: 0.95rem; font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  letter-spacing: 0.3px;
}
.view-all-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201,76,76,0.25);
}
.view-all-btn:hover svg { transform: translateX(4px); }
.view-all-btn svg { transition: transform 0.3s; }
.view-all-btn:active { transform: translateY(0); }

/* ===== EVENT MODAL ===== */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-card {
  background: var(--card-bg); border-radius: 32px; overflow: hidden;
  width: 100%; max-width: 520px;
  box-shadow: 0 40px 100px rgba(0,0,0,0.3);
  position: relative; max-height: 90vh; overflow-y: auto;
}
.modal-close {
  position: absolute; top: 16px; right: 16px; z-index: 10;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0,0,0,0.4); color: white; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.modal-close:hover { background: var(--primary); transform: rotate(90deg); }
.modal-img { height: 200px; position: relative; }
.modal-img img { width: 100%; height: 100%; object-fit: cover; }
.modal-img-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6)); }
.modal-tag {
  position: absolute; bottom: 16px; left: 20px;
  background: var(--primary); color: white; padding: 4px 14px;
  border-radius: 20px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
}
.modal-body { padding: 32px; }
.modal-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 12px; color: var(--text-dark); letter-spacing: -0.5px; }
.modal-desc { font-size: 0.95rem; color: var(--text-light); line-height: 1.7; margin-bottom: 24px; }

.modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 0; }
.meta-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.8rem; font-weight: 700; color: var(--text-dark);
  background: var(--input-bg); border-radius: 14px; padding: 12px 14px;
  border: 1px solid var(--border-color);
}
.meta-item.seats { color: var(--primary); background: rgba(201,76,76,0.04); border-color: rgba(201,76,76,0.1); }

.modal-divider { height: 1px; background: rgba(0,0,0,0.06); margin: 24px 0; }

.section-tag-mini { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: var(--primary); margin-bottom: 16px; }

/* Route Visual */
.modal-route-box { background: var(--input-bg); border-radius: 20px; padding: 20px; border: 1px dashed rgba(201,76,76,0.2); }
.route-visual { position: relative; height: 50px; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; margin-bottom: 10px; }
.route-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); position: relative; z-index: 2; box-shadow: 0 0 0 4px rgba(201,76,76,0.1); }
.route-line-dashed { position: absolute; left: 15px; right: 15px; height: 1px; border-top: 2px dashed rgba(201,76,76,0.25); z-index: 1; }
.route-target-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; box-shadow: 0 4px 10px rgba(201,76,76,0.3); }
.route-labels { position: absolute; width: 100%; left: 0; bottom: -25px; display: flex; justify-content: space-between; }
.route-label-item { display: flex; flex-direction: column; }
.route-label-item .l-top { font-size: 0.65rem; font-weight: 700; color: #bbb; text-transform: uppercase; }
.route-label-item .l-bottom { font-size: 0.75rem; font-weight: 800; color: var(--text-dark); }
.text-right { text-align: right; }

.modal-counter-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: var(--primary); margin-bottom: 16px; }
.modal-counters { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; }
.m-counter-group { display: flex; flex-direction: column; gap: 8px; }
.m-counter-lbl {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light);
}
.m-counter-ctrl { display: flex; align-items: center; gap: 16px; }
.m-cnt-sep { width: 1px; height: 40px; background: rgba(0,0,0,0.07); }
.modal-book-btn {
  width: 100%; padding: 20px; background: var(--primary); color: white;
  border: none; border-radius: 20px; font-weight: 900; font-size: 1rem;
  cursor: pointer; transition: all 0.3s ease; font-family: inherit; letter-spacing: 0.5px;
  box-shadow: 0 10px 30px rgba(201,76,76,0.2);
}
.modal-book-btn:hover { background: #b34242; transform: translateY(-3px); box-shadow: 0 15px 35px rgba(201,76,76,0.4); }

/* divider */
.thin-border-divider { height: 1px; background: linear-gradient(to right, transparent, rgba(201, 76, 76, 0.1), transparent); margin: 10px 0; }

/* Final CTA */
.final-cta-section { padding: 40px 0 100px; }
.cta-banner-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d1010 100%);
  border-radius: 32px;
  padding: 50px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;
}
.cta-banner-card::before {
  content: ''; position: absolute; top: -50%; left: -20%; width: 60%; height: 200%;
  background: radial-gradient(circle, rgba(201,76,76,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.cta-title { font-size: 2.2rem; font-weight: 900; color: white; margin-bottom: 12px; letter-spacing: -1px; }
.cta-desc { font-size: 1.1rem; color: rgba(255,255,255,0.6); max-width: 500px; }
.cta-action-btn {
  padding: 18px 36px; font-size: 1rem; font-weight: 900;
  display: flex; align-items: center; gap: 12px;
  white-space: nowrap; border-radius: 18px;
  box-shadow: 0 10px 30px rgba(201,76,76,0.3);
}

/* responsive refinements */
@media (max-width: 1024px) {
  .cta-banner-card { flex-direction: column; text-align: center; padding: 40px; }
  .cta-desc { margin: 0 auto; }
}

@media (max-width: 768px) {
  .hero-section { margin-top: 60px; min-height: auto; padding-bottom: 0; }
  .hero-body { padding: 40px 16px 40px; }
  .hero-title { font-size: 2.4rem; letter-spacing: -1px; }
  .hero-subtitle { font-size: 0.9rem; margin-bottom: 32px; }

  .booking-card { border-radius: 20px; }
  .booking-row-inputs { padding: 20px 20px 16px; gap: 12px; }
  .booking-row-bottom { padding: 12px 20px 20px; flex-direction: column; gap: 14px; }
  .b-search-btn { justify-content: center; width: 100%; height: 50px; font-size: 1rem; border-radius: 14px; }
  .b-counters { width: 100%; justify-content: space-around; gap: 10px; }
  .b-cnt-sep { height: 30px; }
  .route-arrow { padding: 4px 0; transform: rotate(90deg); }
  .route-line { width: 15px; }

  .events-cards { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .card-image-box { height: 130px; }
  .card-body { padding: 12px; }
  .card-name { font-size: 0.95rem; margin-bottom: 8px; }
  .card-price-tag { font-size: 0.9rem; }
  .btn-primary-small { padding: 6px 12px; font-size: 0.75rem; border-radius: 8px; }

  .tiers-grid { grid-template-columns: 1fr; gap: 20px; }
  .tier-visual { height: 180px; }
  .tier-info { padding: 20px; }
  .tier-info h3 { font-size: 1.4rem; }

  .discovery-grid { grid-template-columns: 1fr; gap: 16px; }
  .search-panel { height: 360px; padding: 16px; border-radius: 20px; }
  .map-panel { min-height: 200px; border-radius: 20px; margin-bottom: 20px; }
  .map-panel img { height: 200px; }

  .amenities-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .amenity-icon { width: 50px; height: 50px; border-radius: 16px; }
  .amenity-icon component { width: 24px; height: 24px; }
  .amenity-box h4 { font-size: 0.85rem; }
  .amenity-box p { font-size: 0.75rem; }

  .heart-section { padding: 60px 0; }
  .main-para { font-size: 1.2rem; line-height: 1.5; }
  .sub-para { font-size: 0.95rem; line-height: 1.6; }
  .stats-row { gap: 12px; }
  .stat-circle { width: 95px; height: 95px; }
  .stat-circle .val { font-size: 1.2rem; }
  .stat-circle .lab { font-size: 0.55rem; }

  .reviews-section { padding: 40px 0 0; }
  .review-card { width: 280px; padding: 18px; }
  .review-text { font-size: 0.82rem; }

  .cta-banner-card { padding: 32px 24px; border-radius: 24px; }
  .cta-title { font-size: 1.5rem; line-height: 1.2; }
  .cta-desc { font-size: 0.85rem; margin-bottom: 24px; }
  .cta-action-btn { width: 100%; justify-content: center; padding: 16px; font-size: 0.9rem; border-radius: 14px; }

  /* Modal mobile refinements — Centered Rounded Rectangle */
  .modal-card { 
    border-radius: 32px; 
    max-width: 350px; 
    width: 88%;
    max-height: 80vh; 
    margin: auto;
    box-shadow: 0 25px 60px rgba(0,0,0,0.4);
  }
  .modal-img { height: 140px; }
  .modal-body { padding: 18px 16px 24px; }
  .modal-title { font-size: 1.25rem; margin-bottom: 8px; }
  .modal-desc { font-size: 0.85rem; line-height: 1.5; margin-bottom: 16px; }
  .modal-info-grid { grid-template-columns: 1fr; gap: 6px; }
  .meta-item { padding: 8px 12px; font-size: 0.75rem; border-radius: 10px; }
  .modal-divider { margin: 16px 0; }
  .modal-route-box { padding: 12px; border-radius: 14px; }
  .route-visual { height: 36px; margin-bottom: 4px; }
  .route-dot { width: 8px; height: 8px; }
  .route-target-icon { width: 26px; height: 26px; }
  .route-target-icon component { transform: scale(0.85); }
  .route-label-item .l-top { font-size: 0.6rem; }
  .route-label-item .l-bottom { font-size: 0.68rem; }
  .section-tag-mini { font-size: 0.6rem; margin-bottom: 10px; }
  .modal-counter-label { font-size: 0.6rem; margin-bottom: 12px; }
  .modal-counters { gap: 10px; margin-bottom: 20px; }
  .m-counter-group { flex: 1; }
  .m-counter-lbl { font-size: 0.58rem; }
  .m-counter-ctrl { gap: 10px; }
  .cnt-btn { width: 32px; height: 32px; }
  .cnt-val { font-size: 1rem; }
  .modal-book-btn { padding: 14px; font-size: 0.9rem; border-radius: 14px; }
}

/* modal transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95); }

/* ===== TIERS ===== */
.tiers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.tier-card { border-radius: 36px; overflow: hidden; background: var(--card-bg); box-shadow: var(--shadow-md); display: flex; flex-direction: column; }
.tier-card.dark { background: #111; color: white; }
.tier-visual { height: 320px; position: relative; }
.tier-visual img { width: 100%; height: 100%; object-fit: cover; }
.tier-badge { position: absolute; bottom: 24px; left: 24px; background: var(--card-bg); color: var(--text-dark); padding: 7px 18px; border-radius: 10px; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; }
.tier-badge.vip { background: var(--primary); color: white; }
.tier-info { padding: 44px; }
.tier-tag { color: var(--primary); font-weight: 800; text-transform: uppercase; font-size: 0.75rem; margin-bottom: 10px; }
.tier-info h3 { font-size: 2rem; margin-bottom: 16px; }
.tier-list { list-style: none; margin-top: 24px; }
.tier-list li { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.95rem; }
.btn-outline-red { border: 2px solid var(--primary); color: var(--primary); padding: 12px 28px; border-radius: 14px; font-weight: 800; cursor: pointer; background: transparent; font-family: inherit; }
.btn-outline-red:hover { background: var(--primary); color: white; }

/* ===== DISCOVERY ===== */
.discovery-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 36px; }
.search-panel {
  border-radius: 28px; padding: 28px; height: 580px;
  display: flex; flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--border-color); box-shadow: var(--shadow-md);
}
.custom-search { position: relative; margin-bottom: 24px; }
.srch-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--primary); }
.custom-search input { width: 100%; padding: 16px 18px 16px 50px; border: 1px solid var(--border-color); border-radius: 18px; background: var(--input-bg); color: var(--text-dark); font-weight: 600; font-family: inherit; outline: none; }
.results-scroll { flex: 1; overflow-y: auto; padding-right: 8px; }
.group-label { font-size: 0.7rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 2px; margin: 18px 0 8px; }
.loc-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; background: rgba(201,76,76,0.02); border-radius: 16px; margin-bottom: 10px; cursor: pointer; border: 1px solid transparent; transition: var(--transition); }
.loc-card:hover { background: var(--input-bg); border-color: var(--primary); box-shadow: var(--shadow-sm); }
.loc-text h5 { font-weight: 800; font-size: 1rem; margin-bottom: 3px; }
.loc-text p { font-size: 0.82rem; color: var(--text-light); }
.loc-action { color: var(--primary); }
.map-panel { border-radius: 28px; overflow: hidden; position: relative; min-height: 400px; }
.map-panel img { width: 100%; height: 100%; object-fit: cover; }
.map-floating-card { position: absolute; top: 24px; right: 24px; background: var(--card-bg); padding: 18px; border-radius: 20px; text-align: center; box-shadow: var(--shadow-md); }
.hub-count { font-size: 1.8rem; font-weight: 900; color: var(--primary); }
.hub-label { font-size: 0.7rem; font-weight: 800; color: var(--text-light); text-transform: uppercase; }

/* ===== AMENITIES ===== */
.amenities-section { background: var(--primary); padding: 100px 0; }
.amenities-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 36px; margin-top: 56px; color: white; }
.amenity-icon { width: 68px; height: 68px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: white; border-radius: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; transition: var(--transition); }
.amenity-box:hover .amenity-icon { background: white; color: var(--primary); transform: translateY(-4px); }
.amenity-box h4 { font-weight: 800; margin-bottom: 10px; font-size: 1rem; }
.amenity-box p { font-size: 0.88rem; opacity: 0.75; }

/* ===== HEART SECTION ===== */
.heart-section { padding: 140px 0; background-image: radial-gradient(ellipse at 50% 0%, rgba(201,76,76,0.06) 0%, transparent 60%); }
.heart-container { max-width: 800px; margin: 0 auto; text-align: center; }
.main-para { font-size: 1.85rem; font-weight: 800; line-height: 1.45; color: var(--text-dark); }
.sub-para { font-size: 1.1rem; line-height: 1.85; color: var(--text-light); }
.stats-row { display: flex; justify-content: center; gap: 40px; align-items: center; }
.stat-circle {
  width: 140px; height: 140px; border: 1.5px solid rgba(201,76,76,0.12); border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; transition: var(--transition);
}
.stat-circle:hover { border-color: var(--primary); box-shadow: 0 0 0 6px rgba(201,76,76,0.05); transform: scale(1.05); }
.stat-circle.secondary { background: var(--primary); color: white; border: none; box-shadow: 0 12px 30px rgba(201,76,76,0.3); }
.stat-circle .val { font-size: 1.75rem; font-weight: 900; }
.stat-circle .lab { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; opacity: 0.7; }

/* ===== REVIEWS — HORIZONTAL MARQUEE ===== */
.reviews-section { background: var(--bg-color); padding: 100px 0 0; }
.reviews-marquee-outer {
  overflow: hidden;
  padding: 40px 0 80px;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
}
.reviews-marquee-inner {
  display: flex;
  gap: 24px;
  width: max-content;
  animation: reviews-scroll 40s linear infinite;
}
.reviews-marquee-inner:hover { animation-play-state: paused; }
@keyframes reviews-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.review-card {
  background: var(--card-bg); border-radius: 24px; padding: 28px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  display: flex; flex-direction: column; gap: 16px;
  width: 360px; flex-shrink: 0;
  transition: var(--transition);
}
.review-card:hover { box-shadow: var(--shadow-lg); border-color: var(--primary); }
.review-header { display: flex; align-items: center; gap: 14px; }
.reviewer-avatar {
  width: 46px; height: 46px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 1rem; color: white; flex-shrink: 0;
}
.reviewer-info { flex: 1; }
.reviewer-name { font-weight: 800; font-size: 0.95rem; color: var(--text-dark); margin-bottom: 2px; }
.reviewer-trip { font-size: 0.72rem; color: var(--text-light); font-weight: 600; }
.review-stars { display: flex; gap: 2px; flex-shrink: 0; }
.star { font-size: 0.9rem; color: #e0e0e0; }
.star.filled { color: #FFB800; }
.review-text { font-size: 0.9rem; line-height: 1.75; color: var(--text-light); flex: 1; }
.review-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.05); }
.review-date { font-size: 0.72rem; color: #bbb; font-weight: 600; }
.review-tag { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); background: rgba(201,76,76,0.08); padding: 3px 10px; border-radius: 20px; }

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero-title { font-size: 3.5rem; }
  .booking-row-inputs { flex-direction: column; gap: 20px; }
  .route-arrow { transform: rotate(90deg); }
  .booking-row-bottom { flex-direction: column; align-items: stretch; }
  .b-search-btn { justify-content: center; }
  .tiers-grid, .discovery-grid { grid-template-columns: 1fr; }
  .amenities-grid { grid-template-columns: repeat(3, 1fr); }
  .events-cards { grid-template-columns: repeat(2, 1fr); }
  .marquee-logo-img { height: 72px; }
  .map-panel { min-height: 300px; }
  .map-panel img { height: 300px; }
}

@media (max-width: 768px) {
  .hero-section { margin-top: 70px; min-height: auto; padding-bottom: 0; }
  .hero-body { padding: 40px 16px 40px; }
  .hero-title { font-size: 2.6rem; letter-spacing: -1px; }
  .hero-subtitle { font-size: 0.95rem; margin-bottom: 32px; }

  .booking-card { border-radius: 20px; }
  .booking-row-inputs { padding: 20px 20px 16px; gap: 16px; }
  .booking-row-bottom { padding: 16px 20px 20px; flex-direction: column; gap: 16px; }
  .b-search-btn { justify-content: center; width: 100%; }
  .b-counters { width: 100%; justify-content: center; gap: 20px; }
  .route-arrow { padding: 0 10px; transform: rotate(90deg); }
  .route-line { width: 20px; }

  .events-cards { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .card-image-box { height: 150px; }
  .card-body { padding: 14px; }
  .card-name { font-size: 1rem; margin-bottom: 10px; }
  .card-click-hint { display: none; }

  .tiers-grid { grid-template-columns: 1fr; gap: 24px; }
  .tier-visual { height: 200px; }
  .tier-info { padding: 24px; }
  .tier-info h3 { font-size: 1.5rem; }

  .discovery-grid { grid-template-columns: 1fr; gap: 20px; }
  .search-panel { height: 340px; padding: 20px; }
  .map-panel { min-height: 220px; border-radius: 20px; }
  .map-panel img { height: 220px; object-fit: cover; }

  .amenities-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .amenities-section { padding: 60px 0; }

  .heart-section { padding: 80px 0; }
  .main-para { font-size: 1.3rem; }
  .stats-row { gap: 16px; }
  .stat-circle { width: 100px; height: 100px; }
  .stat-circle .val { font-size: 1.3rem; }

  .reviews-section { padding: 60px 0 0; }
  .review-card { width: 290px; padding: 20px; }

  .marquee-logo-img { height: 48px; }
  .logo-marquee-item { padding: 0 18px; }

  /* Modal mobile adjustments */
  .modal-overlay { padding: 0; align-items: flex-end; }
  .modal-card { border-radius: 28px 28px 0 0; max-height: 95vh; }
  .modal-img { height: 180px; }
  .modal-body { padding: 20px; }
  .modal-title { font-size: 1.4rem; }
  .modal-meta { grid-template-columns: 1fr; gap: 8px; }
}

@media (max-width: 480px) {
  .events-cards { grid-template-columns: 1fr; gap: 16px; }
  .hero-title { font-size: 2.2rem; }
}
</style>
