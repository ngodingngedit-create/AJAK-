<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Calendar, MapPin, Tag, Clock, Search, SlidersHorizontal, X } from 'lucide-vue-next';
import { bookingStore } from '../store/booking';

const router = useRouter();

const events = [
  { id: 1, name: 'Neon Lights Festival', date: '2026-10-15', dateLabel: '15 Okt 2026', time: '18:00 WIB', location: 'City Arena', city: 'Jakarta', price: 'Rp 750.000', priceNum: 750000, image: '/hero.png', desc: 'Festival musik elektronik terbesar di Asia Tenggara dengan lineup DJ kelas dunia.', seats: 42, tag: 'Electronic' },
  { id: 2, name: 'Symphony in the Park', date: '2026-10-22', dateLabel: '22 Okt 2026', time: '19:30 WIB', location: 'Grand Park', city: 'Bandung', price: 'Rp 450.000', priceNum: 450000, image: '/hero.png', desc: 'Konser orkestra klasik di bawah bulan purnama bersama musisi terbaik Indonesia.', seats: 18, tag: 'Classical' },
  { id: 3, name: 'Midnight Rock', date: '2026-11-05', dateLabel: '5 Nov 2026', time: '20:00 WIB', location: 'Stadium One', city: 'Surabaya', price: 'Rp 950.000', priceNum: 950000, image: '/hero.png', desc: 'Rock concert dengan energy level tertinggi! Band-band legendaris tampil di panggung terbesar.', seats: 67, tag: 'Rock' },
  { id: 4, name: 'Indie Vibes Fest', date: '2026-11-12', dateLabel: '12 Nov 2026', time: '17:00 WIB', location: 'Downtown Square', city: 'Yogyakarta', price: 'Rp 350.000', priceNum: 350000, image: '/hero.png', desc: 'Festival indie lokal merayakan kreativitas musisi independen Indonesia.', seats: 89, tag: 'Indie' },
  { id: 5, name: 'Jazz Under Stars', date: '2026-11-20', dateLabel: '20 Nov 2026', time: '19:00 WIB', location: 'Alun-Alun Kota', city: 'Bandung', price: 'Rp 280.000', priceNum: 280000, image: '/hero.png', desc: 'Malam jazz yang tenang di bawah bintang-bintang kota Bandung.', seats: 120, tag: 'Jazz' },
  { id: 6, name: 'Future Bass Summit', date: '2026-12-01', dateLabel: '1 Des 2026', time: '21:00 WIB', location: 'Skydome Arena', city: 'Jakarta', price: 'Rp 650.000', priceNum: 650000, image: '/hero.png', desc: 'DJ dan produser future bass berkumpul dalam satu malam yang legendary.', seats: 55, tag: 'EDM' },
];

const cities = ['Semua', 'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'];
const genres = ['Semua', 'Electronic', 'Classical', 'Rock', 'Indie', 'Jazz', 'EDM'];

const searchQuery = ref('');
const selectedCity = ref('Semua');
const selectedGenre = ref('Semua');
const showFilters = ref(false);
const sortBy = ref('date');

const filteredEvents = computed(() => {
  let result = [...events];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.tag.toLowerCase().includes(q)
    );
  }
  if (selectedCity.value !== 'Semua') result = result.filter(e => e.city === selectedCity.value);
  if (selectedGenre.value !== 'Semua') result = result.filter(e => e.tag === selectedGenre.value);
  if (sortBy.value === 'date') result.sort((a, b) => a.date.localeCompare(b.date));
  if (sortBy.value === 'price-asc') result.sort((a, b) => a.priceNum - b.priceNum);
  if (sortBy.value === 'price-desc') result.sort((a, b) => b.priceNum - a.priceNum);
  return result;
});

const activeFiltersCount = computed(() => {
  let c = 0;
  if (selectedCity.value !== 'Semua') c++;
  if (selectedGenre.value !== 'Semua') c++;
  return c;
});

const clearFilters = () => {
  selectedCity.value = 'Semua';
  selectedGenre.value = 'Semua';
  searchQuery.value = '';
};

const selectEvent = (event) => {
  bookingStore.selectedEvent = event;
  router.push(`/booking/${event.id}`);
};

const tagColors = {
  Electronic: '#7C4DFF',
  Classical: '#00897B',
  Rock: '#C94C4C',
  Indie: '#F4511E',
  Jazz: '#1565C0',
  EDM: '#6D1B7B',
};
</script>

<template>
  <div class="events-page">
    <!-- Header -->
    <section class="events-hero">
      <div class="events-hero-bg"></div>
      <div class="container events-hero-content">
        <span class="subtitle-tag">Curation</span>
        <h1 class="events-hero-title">Upcoming <span class="text-red">Events</span></h1>
        <p class="events-hero-sub">Temukan konser & festival favoritmu, lalu pesan ride-mu sekarang.</p>
      </div>
    </section>

    <!-- Search + Filter Bar -->
    <div class="filter-bar-sticky">
      <div class="container">
        <div class="filter-row">
          <div class="search-box">
            <Search :size="18" class="search-ico" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari event, kota, atau genre..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
              <X :size="14" />
            </button>
          </div>

          <button class="filter-toggle-btn" @click="showFilters = !showFilters">
            <SlidersHorizontal :size="16" />
            Filter
            <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
          </button>

          <select v-model="sortBy" class="sort-select">
            <option value="date">Tanggal Terdekat</option>
            <option value="price-asc">Harga: Terendah</option>
            <option value="price-desc">Harga: Tertinggi</option>
          </select>
        </div>

        <!-- Expanded Filters -->
        <transition name="filter-expand">
          <div v-if="showFilters" class="filter-panel">
            <div class="filter-group">
              <label class="filter-label">Kota</label>
              <div class="filter-chips">
                <button
                  v-for="city in cities"
                  :key="city"
                  class="chip"
                  :class="{ active: selectedCity === city }"
                  @click="selectedCity = city"
                >{{ city }}</button>
              </div>
            </div>
            <div class="filter-group">
              <label class="filter-label">Genre</label>
              <div class="filter-chips">
                <button
                  v-for="genre in genres"
                  :key="genre"
                  class="chip"
                  :class="{ active: selectedGenre === genre }"
                  @click="selectedGenre = genre"
                >{{ genre }}</button>
              </div>
            </div>
            <button v-if="activeFiltersCount > 0" class="clear-filter-btn" @click="clearFilters">
              <X :size="14" /> Reset Filter
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Events Grid -->
    <div class="container events-content">
      <p class="results-count">{{ filteredEvents.length }} event ditemukan</p>

      <div v-if="filteredEvents.length === 0" class="empty-state">
        <div class="empty-icon">🎵</div>
        <h3>Tidak ada event yang cocok</h3>
        <p>Coba ubah filter atau kata pencarian kamu.</p>
        <button class="btn btn-primary" @click="clearFilters">Reset Filter</button>
      </div>

      <div class="events-grid">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card"
          @click="selectEvent(event)"
        >
          <div class="event-card-img">
            <img :src="event.image" :alt="event.name" />
            <div class="event-img-overlay"></div>
            <div class="event-genre-tag" :style="{ background: tagColors[event.tag] }">
              {{ event.tag }}
            </div>
            <div class="event-city-tag">
              <MapPin :size="11" />{{ event.city }}
            </div>
          </div>
          <div class="event-card-body">
            <h3 class="event-name">{{ event.name }}</h3>
            <p class="event-desc">{{ event.desc }}</p>
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
                <span class="event-price">{{ event.price }}</span>
              </div>
              <button class="book-now-btn">
                Pesan Sekarang →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== HERO ===== */
.events-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-top: 80px;
}

.events-hero {
  position: relative;
  padding: 100px 0 64px;
  overflow: hidden;
}

.events-hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 60%, #0d0d0d 100%);
}
.events-hero-bg::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(201,76,76,0.18) 0%, transparent 70%);
  border-radius: 50%;
}

.events-hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.subtitle-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--primary);
  margin-bottom: 16px;
}

.events-hero-title {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  letter-spacing: -2px;
  line-height: 1;
  margin-bottom: 16px;
}

.text-red { color: var(--primary); }

.events-hero-sub {
  color: rgba(255,255,255,0.6);
  font-size: 1.05rem;
  max-width: 480px;
  margin: 0 auto;
}

/* ===== FILTER BAR ===== */
.filter-bar-sticky {
  background: var(--navbar-bg);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 80px;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--input-bg);
  border-radius: 12px;
  padding: 10px 16px;
  border: 1.5px solid transparent;
  transition: all 0.2s;
}
.search-box:focus-within {
  border-color: var(--primary);
  background: var(--card-bg);
  box-shadow: 0 0 0 3px rgba(201,76,76,0.08);
}
.search-ico { color: #aaa; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--text-dark);
  outline: none;
}
.search-input::placeholder { color: #bbb; }
.clear-search {
  color: #aaa;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  padding: 0;
  transition: color 0.2s;
}
.clear-search:hover { color: var(--primary); }

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  font-family: inherit;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}
.filter-toggle-btn:hover {
  background: rgba(201,76,76,0.06);
  border-color: var(--primary);
}
.filter-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--primary);
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-select {
  padding: 10px 14px;
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-dark);
  background: var(--card-bg);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  white-space: nowrap;
}
.sort-select:focus { border-color: var(--primary); }

/* Filter Panel */
.filter-panel {
  padding: 16px 0 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}
.filter-group { display: flex; flex-direction: column; gap: 10px; }
.filter-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--primary);
}
.filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip {
  padding: 6px 16px;
  border-radius: 30px;
  border: 1.5px solid var(--border-color);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--card-bg);
  color: var(--text-light);
}
.chip:hover { border-color: var(--primary); color: var(--primary); }
.chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
.clear-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 30px;
  border: 1.5px dashed rgba(201,76,76,0.4);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary);
  cursor: pointer;
  background: transparent;
  transition: all 0.2s;
  align-self: center;
}
.clear-filter-btn:hover { background: rgba(201,76,76,0.06); }

.filter-expand-enter-active,
.filter-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.filter-expand-enter-from,
.filter-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.filter-expand-enter-to,
.filter-expand-leave-from {
  opacity: 1;
  max-height: 300px;
}

/* ===== EVENTS CONTENT ===== */
.events-content { padding: 40px 24px 100px; }

.results-count {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 28px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
}
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.empty-state h3 { font-size: 1.4rem; margin-bottom: 8px; }
.empty-state p { color: var(--text-light); margin-bottom: 24px; }

/* ===== EVENTS GRID ===== */
.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.event-card {
  background: var(--card-bg);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid var(--border-color);
}
.event-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.event-card-img {
  height: 200px;
  position: relative;
  overflow: hidden;
}
.event-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.event-card:hover .event-card-img img { transform: scale(1.07); }

.event-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5));
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
}
.event-city-tag {
  position: absolute;
  bottom: 14px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(0,0,0,0.45);
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(6px);
}

.event-card-body { padding: 22px; }
.event-name {
  font-size: 1.15rem;
  font-weight: 900;
  color: var(--text-dark);
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}
.event-desc {
  font-size: 0.85rem;
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.event-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.meta-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-light);
}
.meta-row svg { color: var(--primary); flex-shrink: 0; }

.event-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}
.price-label {
  display: block;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #bbb;
  margin-bottom: 2px;
}
.event-price {
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--text-dark);
}

.book-now-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}
.book-now-btn:hover {
  background: #b34242;
  transform: scale(1.03);
  box-shadow: 0 6px 18px rgba(201,76,76,0.3);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 960px) {
  .events-grid { grid-template-columns: repeat(2, 1fr); }
  .events-hero-title { font-size: 2.8rem; }
}

@media (max-width: 600px) {
  .events-grid { grid-template-columns: 1fr; }
  .events-hero { padding: 120px 0 48px; }
  .events-hero-title { font-size: 2.2rem; }
  .filter-row { gap: 8px; }
  .sort-select { font-size: 0.8rem; }
}
</style>
