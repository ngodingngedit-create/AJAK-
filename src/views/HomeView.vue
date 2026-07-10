<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldCheck, Bus, Zap, Coffee, Sofa, MapPin, Navigation, Search, ArrowRight, Users, Baby, X, Calendar, Star, Clock, Tag, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { bookingStore } from '../store/booking';

const router = useRouter();

// Hero Images Loop (previous bus parkir images)
const heroImages = [
  { src: '/bus_parkir.png', alt: 'Bus Parkir 1' },
  { src: '/bus_parkir2.png', alt: 'Bus Parkir 2' },
  { src: '/bus_parkir3.png', alt: 'Bus Parkir 3' }
];
const currentHeroIndex = ref(0); // Default to first image
let heroInterval;

const prevIndex = computed(() => {
  return (currentHeroIndex.value - 1 + heroImages.length) % heroImages.length;
});
const nextIndex = computed(() => {
  return (currentHeroIndex.value + 1) % heroImages.length;
});

const prevSlide = () => {
  currentHeroIndex.value = prevIndex.value;
  resetAutoplay();
};

const nextSlide = () => {
  currentHeroIndex.value = nextIndex.value;
  resetAutoplay();
};

const goToSlide = (index) => {
  currentHeroIndex.value = index;
  resetAutoplay();
};

const resetAutoplay = () => {
  if (heroInterval) clearInterval(heroInterval);
  heroInterval = setInterval(() => {
    currentHeroIndex.value = nextIndex.value;
  }, 6000);
};

// Touch swipe logic for mobile devices
const touchStartX = ref(0);
const touchEndX = ref(0);

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
  touchEndX.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  const diffX = touchStartX.value - touchEndX.value;
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
};

const ekslusifImages = [
  '/Toyota-Innova-Reborn-1.jpg',
  '/Avanza.jpg',
  '/hiace.jpg'
];
const currentEkslusifIndex = ref(0);
let ekslusifInterval;

// GPS & Map State
const userCoords = ref(null);
const selectedLocation = ref('');
const mapUrl = computed(() => {
  if (!selectedLocation.value) return '';
  return `https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation.value)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
});

onMounted(() => {
  resetAutoplay();

  ekslusifInterval = setInterval(() => {
    currentEkslusifIndex.value = (currentEkslusifIndex.value + 1) % ekslusifImages.length;
  }, 4000);

  // Request user GPS location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        userCoords.value = { lat, lng };
        selectedLocation.value = `${lat},${lng}`;
      },
      (error) => {
        console.warn("Geolocation access denied or failed:", error);
        selectedLocation.value = 'Jakarta, Indonesia';
      }
    );
  } else {
    selectedLocation.value = 'Jakarta, Indonesia';
  }

  fetchUpcomingEvents();
  fetchShuttleBuses();
  fetchPickupLocations();
});

onUnmounted(() => {
  if (heroInterval) clearInterval(heroInterval);
  if (ekslusifInterval) clearInterval(ekslusifInterval);
});

// API Data
const events = ref([]);
const shuttleBuses = ref([]);

const fetchShuttleBuses = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/api/shuttlebuses');
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json();
    if (result.success && result.data && result.data.data) {
      shuttleBuses.value = result.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch shuttle buses:', error);
  }
};

const fetchUpcomingEvents = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/api/shuttle');
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json();
    if (result.success && result.data && result.data.data) {
      events.value = result.data.data.map(item => {
        const dateObj = new Date(item.start_date);
        const day = dateObj.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const month = monthNames[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        
        let seats = 0;
        try {
          if (item.seatmap) {
            const seatmap = JSON.parse(item.seatmap);
            seats = seatmap.rows * seatmap.cols;
          }
        } catch (e) {
          console.warn('Invalid seatmap JSON', e);
        }

        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image_url,
          desc: item.description,
          date: item.start_date ? item.start_date.split('T')[0] : '',
          dateLabel: `${day} ${month} ${year}`,
          time: item.start_time ? item.start_time.slice(0, 5) + ' WIB' : '',
          location: item.description || 'TBA',
          city: 'Jakarta',
          organizer: item.organizer || (item.name && item.name.includes('Joyland') ? 'Plainsong Live' : (item.name && item.name.includes('Jakarta Fair') ? 'JIEXPO' : 'Ajak! Partner')),
          price: 'Rp75.000',
          priceNum: 0,
          tag: 'Shuttle Bersama',
          bus_type: 'MINIBUS',
          plate_number: '-',
          seats: seats
        };
      });
    }
  } catch (error) {
    console.error('Failed to fetch shuttle events:', error);
  }
};

// Event Modal
const selectedEvent = ref(null);
const modalAdults = ref(1);
const modalToddlers = ref(0);

const openEventModal = (event) => {
  // Navigate directly to booking flow
  bookingStore.selectedEvent = event;
  router.push(`/booking/${event.slug}`);
};

const closeEventModal = () => {
  selectedEvent.value = null;
  document.body.style.overflow = '';
};

const bookEvent = () => {
  if (!selectedEvent.value) return;
  bookingStore.selectedEvent = selectedEvent.value;
  router.push(`/booking/${selectedEvent.value.slug}`);
  closeEventModal();
};

// Booking Widget State
const bookingOrigin = ref('');
const bookingDestination = ref('');
const adultCount = ref(0);
const toddlerCount = ref(0);

const facilities = [
  { icon: Bus, title: 'Armada Modern', desc: 'Kendaraan yang luas & nyaman' },
  { icon: ShieldCheck, title: 'Aman & Terpercaya', desc: 'Sopir terverifikasi & pelacakan' },
  { icon: Sofa, title: 'Kursi Nyaman', desc: 'Tata letak kursi ergonomis' },
  { icon: Zap, title: 'Pengisian Daya Gratis', desc: 'Isi daya gadget Anda selama perjalanan' },
  { icon: Coffee, title: 'Air Conditioner', desc: 'AC yang sejuk' }
];

const searchQuery = ref('');
const pickupLocations = ref([]);

const fetchPickupLocations = async () => {
  try {
    const res = await fetch(import.meta.env.VITE_API_URL + '/api/shuttleroutes');
    const result = await res.json();
    if (result.success && result.data?.data) {
      const uniqueOrigins = new Set();
      const mapped = [];
      result.data.data.forEach(r => {
        if (r.origin_name && !uniqueOrigins.has(r.origin_name)) {
          uniqueOrigins.add(r.origin_name);
          const name = r.origin_name.charAt(0).toUpperCase() + r.origin_name.slice(1);
          mapped.push({
            region: name,
            name: name,
            address: 'Titik Jemput ' + name,
            lat: null,
            lng: null
          });
        }
      });
      pickupLocations.value = mapped;
    }
  } catch (error) {
    console.error('Failed to fetch pickup locations:', error);
  }
};

const groupedLocations = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const filtered = pickupLocations.value.filter(loc =>
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

let searchDebounceTimeout = null;
watch(searchQuery, (newVal) => {
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    if (newVal.trim()) {
      selectedLocation.value = newVal;
    }
  }, 1000);
});

const searchOnMap = () => {
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);
  if (searchQuery.value.trim()) {
    selectedLocation.value = searchQuery.value;
  }
};

const selectPickup = (loc) => {
  bookingOrigin.value = loc.name;
  selectedLocation.value = loc.lat && loc.lng ? `${loc.lat},${loc.lng}` : `${loc.name}, ${loc.address}`;
  const portal = document.getElementById('booking-portal');
  if (portal) portal.scrollIntoView({ behavior: 'smooth' });
};

const handleSearch = () => {
  if (!bookingDestination.value) { alert('Please enter a destination.'); return; }
  if (!bookingOrigin.value) { alert('Please enter a pickup location.'); return; }
  alert(`Searching kendaraan for ${adultCount.value} adult(s) & ${toddlerCount.value} toddler(s) from ${bookingOrigin.value} to ${bookingDestination.value}`);
};

// Reviews
const reviews = [
  { id: 1, name: 'Rizky Aditya', initials: 'RA', trip: 'Silaturahmi → City Arena', stars: 5, color: '#C94C4C', comment: 'Pelayanan luar biasa! Berangkat on time, seatnya nyaman banget, dan drivernya ramah. Gak perlu khawatir soal parkir event lagi. Worth every penny!', date: '16 Okt 2026', tag: 'Shuttle Bersama' },
  { id: 2, name: 'Salsabila Putri', initials: 'SP', trip: 'Silaturahmi → Grand Park', stars: 5, color: '#7C4DFF', comment: 'Pertama kali coba AJAK! dan langsung ketagihan. Mobilnya bersih, ada charger USB, dan rutenya pas banget dari dekat rumah. Akan pakai lagi pastinya!', date: '23 Okt 2026', tag: 'Shuttle Bersama' },
  { id: 3, name: 'Daffa Ramadhan', initials: 'DR', trip: 'Silaturahmi → Stadium One', stars: 5, color: '#00897B', comment: 'VIP experience yang sesungguhnya. Dijemput langsung di depan venue, privat tanpa ribet. Untuk artis dan tamu penting, AJAK! Black Label adalah pilihan terbaik.', date: '6 Nov 2026', tag: 'VIP Pribadi' },
  { id: 4, name: 'Nadia Kusuma', initials: 'NK', trip: 'Silaturahmi → Downtown', stars: 4, color: '#F4511E', comment: 'Sangat membantu! Aplikasinya mudah, penjemputan point-nya jelas, dan harganya reasonable untuk kualitas yang didapat. Sedikit telat 5 menit, tapi overall bagus.', date: '13 Nov 2026', tag: 'Shuttle Bersama' },
  { id: 5, name: 'Kevin Pratama', initials: 'KP', trip: 'Silaturahmi → City Arena', stars: 5, color: '#1565C0', comment: 'Game changer untuk concert goers! Gak perlu mikirin parkir, macet, atau pulang kemalaman. AJAK! bikin experience konser jadi 10x lebih enjoyable.', date: '17 Okt 2026', tag: 'Shuttle Bersama' },
  { id: 6, name: 'Amelia Santoso', initials: 'AS', trip: 'Silaturahmi → Grand Park', stars: 5, color: '#6D4C41', comment: 'Recommended banget! Koordinasi grupnya mudah, seats comfy, dan systemnya terorganisir. Tim AJAK! juga responsif kalau ada pertanyaan.', date: '24 Okt 2026', tag: 'Shuttle Bersama' }
];

// duplicated for seamless marquee loop
const reviewsMarquee = [...reviews, ...reviews];

// Marquee logo count
const marqueeCount = 12;

const tagColors = {
  'Shuttle Bersama': '#1565C0',
  'Shuttle Eksklusif': '#C94C4C',
  Electronic: '#7C4DFF',
  Classical: '#00897B',
  Rock: '#C94C4C',
  Indie: '#F4511E',
  Jazz: '#1565C0',
  EDM: '#6D1B7B',
};
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
              Pesan kendaraan Sekarang →
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== HERO SECTION ===== -->
    <section class="hero-section">

      <!-- Main Slider Wrapper -->
      <div 
        class="slider-wrapper"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="slider-track">
          <div 
            v-for="(img, index) in heroImages" 
            :key="img.src" 
            class="slider-card"
            :class="{ 
              'active': index === currentHeroIndex, 
              'prev': index === prevIndex, 
              'next': index === nextIndex,
              'hidden': index !== currentHeroIndex && index !== prevIndex && index !== nextIndex
            }"
            @click="goToSlide(index)"
          >
            <div class="card-inner">
              <img :src="img.src" :alt="img.alt" />
              
              <!-- Navigation chevrons (visible only on active slide) -->
              <button 
                v-if="index === currentHeroIndex" 
                class="nav-arrow arrow-left" 
                @click.stop="prevSlide"
                aria-label="Previous slide"
              >
                <ChevronLeft size="24" stroke-width="3" />
              </button>
              <button 
                v-if="index === currentHeroIndex" 
                class="nav-arrow arrow-right" 
                @click.stop="nextSlide"
                aria-label="Next slide"
              >
                <ChevronRight size="24" stroke-width="3" />
              </button>

              <!-- Slide indicator dots inside the active hero image -->
              <div v-if="index === currentHeroIndex" class="slider-indicators-inside">
                <button
                  v-for="(img, i) in heroImages"
                  :key="i"
                  class="indicator-dot"
                  :class="{ active: currentHeroIndex === i }"
                  @click.stop="goToSlide(i)"
                  :aria-label="`Go to slide ${i + 1}`"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== MARQUEE 1 ===== -->
    <div class="logo-marquee-wrap">
      <div class="logo-marquee-track">
        <div class="logo-marquee-inner">
          <div v-for="i in marqueeCount" :key="'f'+i" class="logo-marquee-item">
            <span class="marquee-text">#SiapAntarKeSetiapSudutKebahagiaan</span>
          </div>
          <div v-for="i in marqueeCount" :key="'f2'+i" class="logo-marquee-item" aria-hidden="true">
            <span class="marquee-text">#SiapAntarKeSetiapSudutKebahagiaan</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== UPCOMING VIBES ===== -->
    <section class="section vibes-section" id="vibes">
      <div class="container">
        <div class="section-title-box text-center mb-5">
          <h2 class="creative-title">Event <span class="text-primary">Mendatang</span></h2>
          <div class="title-underline mx-auto"></div>
        </div>

        <div class="events-cards">
          <div
            v-for="event in events.slice(0, 3)"
            :key="event.id"
            class="event-card"
            @click="openEventModal(event)"
          >
            <div class="event-card-img">
              <img :src="event.image" :alt="event.name" />
              <div class="event-img-overlay"></div>
              <div class="event-genre-tag" :style="{ background: tagColors[event.tag] }">
                {{ event.tag }}
              </div>
            </div>
            <div class="event-card-body">
              <div class="event-city-text">{{ event.city }}</div>
              <h3 class="event-name">{{ event.name }}</h3>
              <div class="event-organizer">Oleh {{ event.organizer }}</div>
              <div class="event-meta">
                <div class="meta-row">
                  <Calendar :size="13" />
                  <span>{{ event.dateLabel }} · {{ event.time }}</span>
                </div>
                <div class="meta-row">
                  <MapPin :size="13" />
                  <span>{{ event.location }}</span>
                </div>
              </div>
              <div class="event-card-footer">
                <div class="event-price-block">
                  <span class="price-label">Mulai dari</span>
                  <div style="display: flex; flex-direction: column;">
                    <span class="event-price">{{ event.price }}</span>
                    <span style="font-size: 0.75rem; color: #000000; font-weight: 600;">pulang - pergi</span>
                  </div>
                </div>
                <button class="book-now-btn">
                  Pesan Sekarang →
                </button>
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
            <span class="marquee-text">#SiapAntarKeSetiapSudutKebahagiaan</span>
          </div>
          <div v-for="i in marqueeCount" :key="'b2'+i" class="logo-marquee-item" aria-hidden="true">
            <span class="marquee-text">#SiapAntarKeSetiapSudutKebahagiaan</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== EXPERIENCE TIERS ===== -->
    <section class="section tiers-section" id="services">
      <div class="container">
        <div class="section-title-box text-center mb-5">
          <span class="sub-title">Armada Kami</span>
          <h2 class="creative-title">Produk <span class="text-primary">Layanan</span></h2>
          <div class="title-underline mx-auto"></div>
        </div>

        <div class="events-cards">
          <div
            v-for="(bus, busIdx) in shuttleBuses"
            :key="bus.id"
            class="event-card"
            @click="router.push(`/shuttlebus/${bus.slug}`)"
          >
            <div class="event-card-img">
              <img :src="busIdx === 0 ? '/bus_parkir2.png' : (busIdx === 1 ? '/bus_parkir.png' : '/bus_parkir3.png')" :alt="bus.bus_name" />
              <div class="event-img-overlay"></div>
              <div class="event-genre-tag" style="background: var(--primary);">
                {{ bus.bus_code }}
              </div>
            </div>
            <div class="event-card-body">
              <div class="event-city-text">{{ bus.plate_number }}</div>
              <h3 class="event-name">{{ bus.bus_name }}</h3>
              <div class="event-organizer">{{ bus.bus_type === 'BIG_BUS' ? 'Big Bus' : (bus.bus_type === 'MEDIUM_BUS' ? 'Medium Bus' : 'Minibus') }}</div>
              <div class="event-meta">
                <div class="meta-row" style="display: flex; align-items: center; gap: 6px;">
                  <Sofa :size="13" />
                  <span>Layout: {{ bus.seat_layout }}</span>
                </div>
                <div class="meta-row" style="display: flex; align-items: center; gap: 6px;">
                  <ShieldCheck :size="13" />
                  <span>Fasilitas: {{ bus.facilities.slice(0, 3).join(', ') }}</span>
                </div>
              </div>
              <div class="event-card-footer">
                <div class="event-price-block">
                  <span class="price-label">Kapasitas</span>
                  <div style="display: flex; align-items: baseline; gap: 5px;">
                    <span class="event-price">{{ bus.total_seat }} Kursi</span>
                    <span style="font-size: 0.75rem; color: #000000; font-weight: 600;">Tersedia</span>
                  </div>
                </div>
                <button class="book-now-btn">
                  Lihat Detail →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== MARQUEE 3 ===== -->
    <div class="text-marquee-wrap text-marquee">
      <div class="logo-marquee-track">
        <div class="logo-marquee-inner text-marquee-inner">
          <span>Alasan harus menggunakan Shuttle Bus dari AJAX! :</span>
          <span>TIDAK USAH REPOT CARI PARKIRAN</span>
          <span>TIDAK PERLU ANTERI PANJANG</span>
          <span>TIDAK PUSING MENGHADAPI KEMACETAN</span>
          <span>HEMAT TENAGA</span>
          <span>HEMAT BIAYA</span>
          <span>HEMAT WAKTU</span>
          <span>AMAN</span>
          <span>NYAMAN</span>
          <span>PERJALANAN MENYENANGKAN</span>
          <span>MENDAPATKAN PENGALAMAN DAN TEMAN BARU</span>
        </div>
      </div>
    </div>

    <!-- ===== PICKUP DISCOVERY ===== -->
    <section class="section pickup-discovery bg-light" id="discovery">
      <div class="container">
        <div class="section-title-box mb-5">
          <span class="sub-title">Denah Lokasi</span>
          <h2 class="creative-title">Temukan <span class="text-primary">Titik Jemput</span></h2>
          <div class="title-underline"></div>
        </div>

        <div class="discovery-grid">
          <div class="search-panel glass-morphism">
            <div class="custom-search">
              <Search size="20" class="srch-icon" />
              <input type="text" v-model="searchQuery" placeholder="Cari kota atau lokasi penjemputan..." @keyup.enter="searchOnMap">
            </div>
            <div class="results-scroll">
              <div v-for="(locations, region) in groupedLocations" :key="region">
                <h4 class="group-label">{{ region }}</h4>
                <div v-for="loc in locations" :key="loc.name" class="loc-card" @click="selectPickup(loc)">
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
            <iframe
              v-if="mapUrl"
              :src="mapUrl"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <div v-else class="map-placeholder-fallback">
              <div class="map-spinner"></div>
              <p>Mencari lokasi Anda...</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FACILITIES ===== -->
    <section class="section amenities-section">
      <div class="container text-center">
        <h2 class="creative-title mb-5" style="color: white !important;">Fasilitas <span style="color: white !important;">Perjalanan</span></h2>
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
    <!-- <div class="logo-marquee-wrap white-marquee">
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
    </div> -->

    <!-- ===== THE HEART (Tentang) ===== -->
    <section class="section heart-section" id="Tentang">
      <div class="container">
        <div class="heart-container">
          <span class="sub-title"> Tentang AJAK!</span>
          <h2 class="creative-title mb-4">Sekapur Sirih dari <span class="text-primary">AJAK!</span></h2>
          <div class="title-underline mx-auto mb-5"></div>
          <p class="main-para">
            Kami memulai dengan keyakinan sederhana: <strong>perjalanan menuju tempat terselenggaranya acara harus sama serunya dengan pertunjukan itu sendiri.</strong>
          </p>
          <p class="sub-para mt-4">
            Lahir pada akhir 2025, AJAK! menjembatani celah antara transit kota yang padat dan atmosfer panggung yang membara. Kami membangun jaringan transportasi yang aman, terorganisir, dan premium untuk penggemar, artis, dan semua orang diantaranya.
          </p>
          <div class="stats-row mt-5">
            <div class="stat-circle"><span class="val">50k+</span><span class="lab">Penumpang</span></div>
            <div class="stat-circle secondary"><span class="val">100+</span><span class="lab">Panggung</span></div>
            <div class="stat-circle"><span class="val">24/7</span><span class="lab">Layanan Customer Service</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Divider -->
    <div v-if="false" class="section-divider-wrap">
      <div class="container">
        <div class="thin-border-divider"></div>
      </div>
    </div>

    <!-- ===== REVIEWS — INFINITE SCROLL MARQUEE ===== -->
    <section v-if="false" class="section reviews-section" id="reviews">
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
            <p class="cta-desc">Temukan event favoritmu dan pesan kendaraan kamu sekarang tanpa ribet.</p>
          </div>
          <button class="btn btn-primary cta-action-btn" @click="router.push('/events')">
            Lihat Semua Event <ArrowRight size="20" />
          </button>
        </div>
      </div>
    </section>

    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/6285178276837" target="_blank" class="wa-float-btn" title="Hubungi Kami via WhatsApp">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
    </a>
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
  font-size: 2.25rem;
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
  min-height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* background-image: url('/herobanner.png'); */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 110px 0 0px;
}

/* Slider Track & Layout */
.slider-wrapper {
  position: relative;
  width: 100%;
  max-width: 1400px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  overflow: visible;
  margin-top: -65px;
}

.slider-track {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Slider Card Styles */
.slider-card {
  position: absolute;
  width: 890px;
  height: 290.91px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), 
              opacity 0.6s ease,
              filter 0.6s ease;
  background: transparent;
  user-select: none;
  filter: brightness(0.6);
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.slider-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Center / Active slide */
.slider-card.active {
  transform: translateX(0) scale(1);
  z-index: 10;
  opacity: 1;
  filter: brightness(1);
  cursor: default;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Side slides */
.slider-card.prev {
  transform: translateX(-44%) scale(0.82);
  z-index: 5;
  opacity: 1;
  cursor: pointer;
}

.slider-card.next {
  transform: translateX(44%) scale(0.82);
  z-index: 5;
  opacity: 1;
  cursor: pointer;
}

/* Hidden slides */
.slider-card.hidden {
  transform: scale(0.6);
  opacity: 0;
  z-index: 1;
  pointer-events: none;
}

/* Navigation Chevrons inside Active Card */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #2A2A2A;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 20;
}

.nav-arrow:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.1);
  color: var(--primary);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.nav-arrow.arrow-left {
  left: 24px;
}

.nav-arrow.arrow-right {
  right: 24px;
}

/* Indicators Dots Inside active card */
.slider-indicators-inside {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 15;
}

.slider-indicators-inside .indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.slider-indicators-inside .indicator-dot.active {
  background: var(--primary);
  width: 24px;
  border-radius: 4px;
  box-shadow: 0 0 8px var(--primary);
}

/* Responsive adjustments for Slider */
@media (max-width: 1200px) {
  .slider-wrapper {
    height: 310px;
  }
  .slider-card {
    width: 720px;
    height: 236px;
  }
  .slider-card.prev {
    transform: translateX(-42%) scale(0.82);
  }
  .slider-card.next {
    transform: translateX(42%) scale(0.82);
  }
}

@media (max-width: 992px) {
  .slider-wrapper {
    height: 260px;
  }
  .slider-card {
    width: 600px;
    height: 196.8px;
  }
  .slider-card.prev {
    transform: translateX(-42%) scale(0.82);
  }
  .slider-card.next {
    transform: translateX(42%) scale(0.82);
  }
  .creative-title {
    font-size: 1.85rem !important;
  }
  .events-cards {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 24px !important;
  }
  .tiers-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 24px !important;
  }
  .amenities-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 24px !important;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: auto;
    padding: 20px 0 0px;
  }
  .slider-wrapper {
    height: 320px !important;
    padding: 0 20px !important;
    margin-top: -35px;
    overflow: visible !important;
  }
  .slider-card {
    position: absolute !important;
    width: 560px !important;
    height: 183px !important;
    border-radius: 4px;
  }
  .slider-card.prev {
    transform: translateX(-42%) scale(0.82) !important;
    opacity: 1 !important;
  }
  .slider-card.next {
    transform: translateX(42%) scale(0.82) !important;
    opacity: 1 !important;
  }
  .nav-arrow {
    width: 32px;
    height: 32px;
  }
  .nav-arrow svg {
    width: 16px;
    height: 16px;
  }
  .nav-arrow.arrow-left {
    left: 12px;
  }
  .nav-arrow.arrow-right {
    right: 12px;
  }
  .slider-indicators-inside {
    bottom: 10px;
  }
  .slider-indicators-inside .indicator-dot {
    width: 6px;
    height: 6px;
  }
  .slider-indicators-inside .indicator-dot.active {
    width: 18px;
  }
}

@media (max-width: 480px) {
  .slider-wrapper {
    height: 240px !important;
    margin-top: -25px;
    overflow: visible !important;
  }
  .slider-card {
    position: absolute !important;
    width: 380px !important;
    height: 124px !important;
  }
  .slider-card.prev {
    transform: translateX(-40%) scale(0.82) !important;
    opacity: 1 !important;
  }
  .slider-card.next {
    transform: translateX(40%) scale(0.82) !important;
    opacity: 1 !important;
  }
  .nav-arrow {
    display: none; /* Hide arrows on small screens, rely on touch swipe and dots */
  }
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
  background: var(--primary); padding: 8px 0; overflow: hidden;
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
  animation: marquee-fwd 50s linear infinite;
  gap: 40px;
}
@keyframes marquee-fwd {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.logo-marquee-item {
  display: flex; align-items: center;
  padding: 0 !important;
  position: relative;
}
.logo-marquee-item::after {
  content: "•";
  position: absolute;
  right: -24px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.25rem;
}
.marquee-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
.marquee-logo-img {
  height: 95px; width: auto; object-fit: contain; opacity: 0.9;
  transition: opacity 0.3s; filter: brightness(0) invert(1);
}
.marquee-logo-color { filter: none; opacity: 0.8; height: 44px; }

/* ===== EVENTS ===== */
.vibes-section { padding-top: 25px; }

/* ===== TIERS (Armada Kami) ===== */
.tiers-section {
  padding-top: 35px;
}
.tiers-section .section-title-box {
  margin-bottom: 2rem !important;
}
.tiers-section .events-cards {
  gap: 20px;
}
.events-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.event-card {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  text-align: left;
  cursor: pointer;
  transition: none !important;
}
.event-card-img {
  height: 160px;
  position: relative;
  overflow: hidden;
  border-radius: 8px !important;
  transform: translateY(0) scale(1);
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s cubic-bezier(0.25, 1, 0.5, 1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.event-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.event-card:hover .event-card-img {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06);
}
.event-card:hover .event-card-img img { transform: scale(1.07); }

/* Shine sweep animation (in/out) */
.event-card-img::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transform: skewX(-20deg);
  transition: left 0.75s cubic-bezier(0.15, 0.85, 0.35, 1);
  pointer-events: none;
  z-index: 5;
}
.event-card:hover .event-card-img::after {
  left: 150%;
}

.event-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
}
.event-genre-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
}

.event-card-body {
  padding: 16px 0 0 !important;
  display: flex;
  flex-direction: column;
}
.event-city-text {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 600;
  margin-bottom: 4px;
}
.event-name {
  font-size: 1.15rem !important;
  font-weight: 800 !important;
  color: var(--text-dark) !important;
  margin-bottom: 4px !important;
  letter-spacing: -0.3px;
  line-height: 1.3;
}
.event-organizer {
  font-size: 0.9rem;
  color: #000000 !important;
  font-weight: 400 !important;
  margin-bottom: 12px;
}
.event-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.meta-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  font-weight: 400 !important;
  color: #000000 !important;
}
.meta-row svg { color: var(--primary); flex-shrink: 0; }
.event-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px dashed #d0d0d0 !important;
}
.price-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600 !important;
  color: #000000 !important;
  margin-bottom: 2px;
}
.event-price {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #000000 !important;
}
.book-now-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}
.book-now-btn:hover {
  background: #b34242;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(201,76,76,0.25);
}

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
  .hero-section { margin-top: 60px; }

  .section {
    padding: 50px 0 !important;
  }
  .creative-title {
    font-size: 1.5rem !important;
  }
  .logo-marquee-wrap {
    padding: 6px 0 !important;
  }
  .logo-marquee-item {
    padding: 0 24px !important;
  }
  .marquee-text {
    font-size: 0.95rem !important;
    letter-spacing: 0.2px !important;
  }

  .booking-card { border-radius: 20px; }
  .booking-row-inputs { padding: 20px 20px 16px; gap: 12px; }
  .booking-row-bottom { padding: 12px 20px 20px; flex-direction: column; gap: 14px; }
  .b-search-btn { justify-content: center; width: 100%; height: 50px; font-size: 1rem; border-radius: 14px; }
  .b-counters { width: 100%; justify-content: space-around; gap: 10px; }
  .b-cnt-sep { height: 30px; }
  .route-arrow { padding: 4px 0; transform: rotate(90deg); }
  .route-line { width: 15px; }

  .events-cards { grid-template-columns: 1fr !important; gap: 28px; }
  .event-card-img { height: 180px !important; }
  .event-card-body { padding: 12px 0 0 !important; }
  .event-name { font-size: 1.15rem !important; margin-bottom: 4px !important; }
  .event-city-text { font-size: 0.85rem !important; }
  .vibes-section { padding-top: 18px !important; }
  .event-price { font-size: 1.1rem !important; }
  .event-card-footer {
    flex-direction: column;
    align-items: stretch !important;
    gap: 10px;
    padding-top: 12px !important;
  }
  .book-now-btn {
    width: 100%;
    text-align: center;
    padding: 8px 16px;
    font-size: 0.8rem;
    border-radius: 10px;
  }

  .tiers-grid { grid-template-columns: 1fr; gap: 20px; }
  .tier-visual { height: 180px; }
  .tier-info { padding: 20px; }
  .tier-info h3 { font-size: 1.4rem; }
  .tiers-section { padding-top: 15px !important; }
  .tiers-section .section-title-box { margin-bottom: 1rem !important; }
  .tiers-section .events-cards { gap: 16px !important; }
  .pickup-discovery { padding-top: 15px !important; }

  .discovery-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
  }
  .search-panel {
    height: 260px !important;
    padding: 12px !important;
    border-radius: 16px !important;
  }
  .custom-search {
    margin-bottom: 12px !important;
  }
  .custom-search input {
    padding: 10px 12px 10px 38px !important;
    font-size: 0.85rem !important;
    border-radius: 12px !important;
  }
  .srch-icon {
    left: 12px !important;
    width: 14px !important;
    height: 14px !important;
  }
  .group-label {
    margin: 10px 0 6px !important;
    font-size: 0.65rem !important;
  }
  .loc-card {
    padding: 10px 12px !important;
    border-radius: 12px !important;
    margin-bottom: 8px !important;
  }
  .loc-text h5 {
    font-weight: 800 !important;
    font-size: 0.85rem !important;
  }
  .loc-text p {
    font-size: 0.72rem !important;
  }
  .map-panel {
    min-height: 220px !important;
    height: 220px !important;
    border-radius: 16px !important;
    margin-bottom: 0 !important;
  }

  .amenities-section { padding: 45px 0 30px; }
  .amenities-grid {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    gap: 16px !important;
    margin-top: 28px !important;
    padding: 10px 20px 20px !important;
    margin-left: -20px !important;
    margin-right: -20px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  .amenities-grid::-webkit-scrollbar {
    display: none !important;
  }
  .amenity-box {
    flex: 0 0 220px !important;
    text-align: center;
    background: rgba(255, 255, 255, 0.08) !important;
    padding: 20px 14px !important;
    border-radius: 18px !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
  }
  .amenity-icon {
    width: 60px !important;
    height: 60px !important;
    border-radius: 18px !important;
    margin: 0 auto 16px !important;
  }
  .amenity-icon svg {
    width: 28px !important;
    height: 28px !important;
  }
  .amenity-box h4 {
    font-size: 1rem !important;
    color: white !important;
    font-weight: 800 !important;
  }
  .amenity-box p {
    font-size: 0.82rem !important;
    color: rgba(255, 255, 255, 0.8) !important;
    line-height: 1.4 !important;
  }

  .heart-section { padding: 20px 0 20px; }
  .main-para { font-size: 1.2rem; line-height: 1.5; }
  .sub-para { font-size: 0.95rem; line-height: 1.6; }
  .stats-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 32px !important;
  }
  .stat-circle {
    width: 105px;
    height: 105px;
    border: 1.5px solid rgba(201, 76, 76, 0.12);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }
  .stat-circle .val {
    font-size: 1.3rem;
    font-weight: 900;
  }
  .stat-circle .lab {
    font-size: 0.55rem;
    line-height: 1.2;
    text-align: center;
    max-width: 90%;
    text-transform: uppercase;
    font-weight: 800;
  }

  .reviews-section { padding: 20px 0 0; }
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
.tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
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
.map-panel { border-radius: 28px; overflow: hidden; position: relative; min-height: 400px; height: 100%; border: 1px solid var(--border-color); box-shadow: var(--shadow-md); }
.map-panel iframe { width: 100%; height: 100%; border: 0; display: block; }
.map-placeholder-fallback { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background: #1a1a1a; color: white; gap: 16px; min-height: 400px; }
.map-spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: map-spin 1s linear infinite; }
@keyframes map-spin { to { transform: rotate(360deg); } }
.map-floating-card { position: absolute; top: 24px; right: 24px; background: var(--card-bg); padding: 18px; border-radius: 20px; text-align: center; box-shadow: var(--shadow-md); }
.hub-count { font-size: 1.8rem; font-weight: 900; color: var(--primary); }
.hub-label { font-size: 0.7rem; font-weight: 800; color: var(--text-light); text-transform: uppercase; }

/* ===== AMENITIES ===== */
.amenities-section { background: var(--primary); padding: 60px 0 40px; }
.amenities-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 36px; margin-top: 36px; color: white; }
.amenity-icon { width: 68px; height: 68px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: white; border-radius: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; transition: var(--transition); }
.amenity-box:hover .amenity-icon { background: white; color: var(--primary); transform: translateY(-4px); }
.amenity-box h4 { font-weight: 800; margin-bottom: 10px; font-size: 1rem; }
.amenity-box p { font-size: 0.88rem; opacity: 0.75; }

/* ===== HEART SECTION ===== */
.heart-section { padding: 40px 0 40px; background-image: radial-gradient(ellipse at 50% 0%, rgba(201,76,76,0.06) 0%, transparent 60%); }
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
.reviews-section { background: var(--bg-color); padding: 40px 0 0; }
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

@media (max-width: 480px) {
  .events-cards { grid-template-columns: 1fr; gap: 32px; }
  .event-card-img { height: 150px !important; }
  .event-card-body { padding: 12px 0 0 !important; }
  .event-name { font-size: 1.1rem !important; }
  .creative-title {
    font-size: 1.3rem !important;
  }
  .logo-marquee-wrap {
    padding: 4px 0 !important;
  }
  .logo-marquee-inner {
    gap: 30px !important;
  }
  .logo-marquee-item {
    padding: 0 !important;
  }
  .logo-marquee-item::after {
    right: -18px !important;
    font-size: 0.85rem;
  }
  .marquee-text {
    font-size: 0.85rem !important;
  }
  .amenities-section { padding: 30px 0 20px; }
  .stats-row {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .stat-circle {
    width: 120px;
    height: 120px;
  }
  .stat-circle .val {
    font-size: 1.5rem;
  }
  .stat-circle .lab {
    font-size: 0.65rem;
  }
}

.text-marquee { background: var(--primary); padding: 15px 0; color: white; display: flex; align-items: center; overflow: hidden; }
.text-marquee-inner { display: flex; gap: 40px; padding-right: 40px; font-weight: bold; font-size: 1.2rem; align-items: center; white-space: nowrap; }
.text-marquee-inner span { position: relative; }
.text-marquee-inner span:not(:last-child)::after { content: "•"; position: absolute; right: -25px; color: rgba(255,255,255,0.5); }

/* WhatsApp Float Button */
.wa-float-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background-color: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  z-index: 999;
  transition: all 0.3s ease;
}
.wa-float-btn img {
  width: 35px;
  height: 35px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
.wa-float-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5);
}

@media (max-width: 768px) {
  .wa-float-btn {
    bottom: 90px; /* Hindari tertimpa bottom navbar */
    right: 20px;
    width: 50px;
    height: 50px;
  }
  .wa-float-btn img {
    width: 28px;
    height: 28px;
  }
}
</style>
