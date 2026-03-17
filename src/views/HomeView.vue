<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ShieldCheck, Bus, CarFront, Zap, Coffee, Sofa, MapPin, Search, ArrowRight } from 'lucide-vue-next';

// 1. Hero Images Loop (Includes Space for Sponsors)
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
  { id: 1, name: 'Neon Lights Festival', date: 'Oct 15, 2026', location: 'City Arena', price: '$49.99', image: '/hero.png' },
  { id: 2, name: 'Symphony in the Park', date: 'Oct 22, 2026', location: 'Grand Park', price: '$35.00', image: '/hero.png' },
  { id: 3, name: 'Midnight Rock', date: 'Nov 05, 2026', location: 'Stadium One', price: '$65.00', image: '/hero.png' },
  { id: 4, name: 'Indie Vibes Fest', date: 'Nov 12, 2026', location: 'Downtown Square', price: '$40.00', image: '/hero.png' }
];

const pickupPointsList = [
  'Margo City (Depok)',
  'Botani Square (Bogor)',
  'Tangerang City (Tangerang)',
  'Blok M Plaza (Jakarta Selatan)',
  'Trans Studio Mall (Bandung)'
];

// Booking Widget State
const activeTab = ref('public'); 
const bookingOrigin = ref('');
const bookingDestination = ref('');
const passengerCount = ref(1);

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
    if(!groups[loc.region]) groups[loc.region] = [];
    groups[loc.region].push(loc);
  });
  return groups;
});

const selectPickup = (locName) => {
  bookingOrigin.value = `${locName}`;
  activeTab.value = 'public';
  document.getElementById('booking-portal').scrollIntoView({ behavior: 'smooth' });
};

const switchTab = (tab) => {
  activeTab.value = tab;
  bookingOrigin.value = '';
};

const handleSearch = () => {
  if (!bookingDestination.value) {
    alert("Please select an event to attend.");
    return;
  }
  if (!bookingOrigin.value) {
    alert("Please enter a pickup location.");
    return;
  }
  alert(`Searching ${activeTab.value} ride for ${passengerCount.value} passenger(s) to ${bookingDestination.value} from ${bookingOrigin.value}`);
};
</script>

<template>
  <div class="home-view">
    
    <!-- Modern Hero Section -->
    <section class="hero-section">
      <div class="hero-bg">
        <transition-group name="fade-slideshow" tag="div">
          <div 
            v-for="(img, index) in heroImages" 
            :key="img.src"
            v-show="currentHeroIndex === index"
            class="slide-layer"
          >
            <img :src="img.src" :alt="img.alt" />
            <div class="hero-overlay"></div>
          </div>
        </transition-group>
      </div>
      
      <div class="container hero-content">
        <div class="hero-badge" v-if="currentHeroIndex === 1">Special Partner Offer</div>
        <h1 class="hero-title">
          Ride to the <span class="text-gradient">Beat.</span> <br/>
          Arrive in <span class="text-gradient">Style.</span>
        </h1>
        <p class="hero-subtitle mb-5">
          Eliminate the stress of event transit. Whether you're a fan or a VIP, AJAK! provides the ultimate round-trip journey.
        </p>
      </div>

      <!-- Floating Booking Widget -->
      <div class="container hero-widget-container" id="booking-portal">
        <div class="booking-widget glass-morphism shadow-lg">
          <div class="widget-tabs">
            <button 
              class="tab-btn" 
              :class="{ 'active': activeTab === 'public' }" 
              @click="switchTab('public')"
            >
              Public Experience
            </button>
            <button 
              class="tab-btn" 
              :class="{ 'active': activeTab === 'private' }" 
              @click="switchTab('private')"
            >
              Private VIP
            </button>
          </div>
          
          <div class="widget-body">
            <div class="form-grid">
              
              <div class="input-group">
                <label>Depart From</label>
                <div v-if="activeTab === 'public'" class="select-wrapper">
                  <MapPin size="18" class="input-icon" />
                  <select v-model="bookingOrigin">
                    <option value="" disabled selected>Choose a Pickup Hub</option>
                    <option v-for="point in pickupPointsList" :key="point" :value="point">{{ point }}</option>
                  </select>
                </div>
                <div v-else class="input-wrapper">
                  <MapPin size="18" class="input-icon" />
                  <input type="text" v-model="bookingOrigin" placeholder="Full Address Pickup" />
                </div>
              </div>

              <div class="swap-icon-container">
                <div class="swap-icon shadow-sm">⇌</div>
              </div>

              <div class="input-group">
                <label>Destination Stage</label>
                <div class="select-wrapper">
                  <select v-model="bookingDestination">
                    <option value="" disabled selected>Select Event</option>
                    <option v-for="event in events" :key="event.id" :value="event.name">{{ event.name }}</option>
                  </select>
                </div>
              </div>

              <div class="input-group passenger-group">
                <label>Attendies</label>
                <div class="number-input">
                  <button @click="passengerCount > 1 ? passengerCount-- : null">-</button>
                  <span>{{ passengerCount }} Adult</span>
                  <button @click="passengerCount++">+</button>
                </div>
              </div>
              
              <div class="search-action">
                <button class="btn btn-search" @click="handleSearch">
                  Find My Ride <ArrowRight size="18" class="ms-2" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Vibes (Events) -->
    <section class="section vibes-section bg-gradient-light">
      <div class="container mt-5 pt-5">
        <div class="section-title-box text-center mb-5 mt-5">
          <span class="sub-title">Curation</span>
          <h2 class="creative-title">Upcoming <span class="text-primary">Vibes</span></h2>
          <div class="title-underline mx-auto"></div>
        </div>

        <div class="events-cards">
          <div v-for="event in events" :key="event.id" class="modern-card">
            <div class="card-image-box">
              <img :src="event.image" :alt="event.name"/>
              <div class="card-status">Selling Fast</div>
            </div>
            <div class="card-body">
              <p class="card-location">{{ event.location }}</p>
              <h3 class="card-name">{{ event.name }}</h3>
              <div class="card-footer-info">
                <span class="card-price-tag">{{ event.price }}</span>
                <button class="btn btn-primary-small">Book Ride</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Tiers (Layanan Kita) -->
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
              <button class="btn btn-outline-white mt-4">Learn More</button>
            </div>
          </div>

          <div class="tier-card private dark">
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

    <!-- Pick Up Discovery (Pickup Points) -->
    <section class="section pickup-discovery bg-light">
      <div class="container">
        <div class="section-title-box mb-5">
          <span class="sub-title">Network</span>
          <h2 class="creative-title">Pick Up <span class="text-primary">Discovery</span></h2>
          <div class="title-underline"></div>
        </div>

        <div class="discovery-grid">
          <div class="search-panel glass-morphism shadow-sm">
            <div class="custom-search">
              <Search size="20" class="icon" />
              <input type="text" v-model="searchQuery" placeholder="Search your city (e.g. Bogor, Jakarta)...">
            </div>

            <div class="results-scroll">
              <div v-for="(locations, region) in groupedLocations" :key="region" class="group-block">
                <h4 class="group-label">{{ region }}</h4>
                <div v-for="loc in locations" :key="loc.name" class="loc-card" @click="selectPickup(loc.name)">
                  <div class="loc-text">
                    <h5>{{ loc.name }}</h5>
                    <p>{{ loc.address }}</p>
                  </div>
                  <div class="loc-action">
                    <ArrowRight size="18" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="map-panel shadow-lg">
            <img src="/map_placeholder.png" alt="Location Map" />
            <div class="map-floating-card">
              <div class="hub-count">24+</div>
              <div class="hub-label">Active Hubs</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Facilities -->
    <section class="section amenities-section">
      <div class="container text-center">
        <h2 class="creative-title text-white mb-5">Ride <span class="text-secondary">Amenities</span></h2>
        
        <div class="amenities-grid">
          <div v-for="(fac, index) in facilities" :key="index" class="amenity-box">
            <div class="amenity-icon shadow-sm">
              <component :is="fac.icon" size="32" />
            </div>
            <h4>{{ fac.title }}</h4>
            <p>{{ fac.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Centered About (The Heart) -->
    <section class="section heart-section" id="about">
      <div class="container">
        <div class="heart-container text-center mx-auto">
          <span class="sub-title">Foundations</span>
          <h2 class="creative-title mb-4">The Heart of <span class="text-primary">AJAK!</span></h2>
          <div class="title-underline mx-auto mb-5"></div>
          
          <div class="heart-content">
            <p class="main-para">
              We started with a simple belief: <strong>getting there should be as exciting as the performance itself.</strong> 
            </p>
            <p class="sub-para text-muted mt-4">
              Born in 2026, AJAK! bridges the gap between chaotic city transit and the electric atmosphere of the stage. We build safe, organized, and premium transport networks for fans, artists, and everyone in between. Our mission is to ensure that your memories are made at the show, not in the parking lot.
            </p>
            
            <div class="stats-row mt-5">
              <div class="stat-circle">
                <span class="val">50k+</span>
                <span class="lab">Riders</span>
              </div>
              <div class="stat-circle secondary">
                <span class="val">200+</span>
                <span class="lab">Stages</span>
              </div>
              <div class="stat-circle">
                <span class="val">24/7</span>
                <span class="lab">Care</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* Modern UI Tokens */
.text-gradient {
  background: linear-gradient(135deg, var(--primary), #FF7E7E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sub-title {
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 0.8rem;
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

/* Hero Section Refinements */
.hero-section {
  position: relative;
  min-height: 90vh;
  margin-top: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: #0d0d0d;
}

.slide-layer {
  position: absolute;
  inset: 0;
}

.slide-layer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 10s linear;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%);
}

.hero-content {
  position: relative;
  z-index: 5;
  color: white;
  padding-bottom: 100px;
}

.hero-title {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 24px;
}

.hero-subtitle {
  font-size: 1.4rem;
  max-width: 600px;
  opacity: 0.9;
}

.hero-badge {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(201, 76, 76, 0.2);
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: 30px;
  font-weight: 700;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

/* Glass Widget */
.glass-morphism {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-widget-container {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 20;
}

.booking-widget {
  border-radius: 30px;
  overflow: hidden;
  max-width: 1100px;
  margin: 0 auto;
}

.widget-tabs {
  display: flex;
  padding: 10px;
  gap: 10px;
}

.tab-btn {
  flex: 1;
  padding: 14px;
  border-radius: 20px;
  font-weight: 800;
  transition: var(--transition);
  color: var(--text-light);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
}

.widget-body {
  padding: 30px 40px;
}

.form-grid {
  display: flex;
  align-items: center;
  gap: 20px;
}

.input-icon { color: var(--primary); }

.select-wrapper, .input-wrapper, .number-input {
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(201,76,76,0.1);
  border-radius: 12px;
  height: 56px;
  display: flex;
  align-items: center;
  width: 100%;
}

.select-wrapper select, .input-wrapper input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0 15px;
  font-weight: 600;
  outline: none;
}

.number-input {
  justify-content: space-between;
  padding: 0 10px;
}

/* Modern Cards */
.modern-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  transition: var(--transition);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}

.modern-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(201,76,76,0.1);
}

.card-image-box {
  height: 200px;
  position: relative;
}

.card-image-box img { width: 100%; height: 100%; object-fit: cover; }

.card-status {
  position: absolute;
  top: 15px;
  right: 15px;
  background: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--primary);
}

.card-body { padding: 24px; }
.card-location { font-weight: 700; color: var(--primary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px; }
.card-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 20px; }
.card-footer-info { display: flex; justify-content: space-between; align-items: center; }
.card-price-tag { font-weight: 900; font-size: 1.1rem; color: var(--text-dark); }
.btn-primary-small { background: var(--primary); color: white; padding: 8px 16px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; }

/* Discovery Panel */
.discovery-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;
}

.search-panel {
  border-radius: 30px;
  padding: 30px;
  height: 600px;
  display: flex; flex-direction: column;
}

.custom-search {
  position: relative;
  margin-bottom: 30px;
}

.custom-search .icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: var(--primary); }
.custom-search input { width: 100%; padding: 18px 20px 18px 55px; border: 1px solid rgba(201,76,76,0.1); border-radius: 20px; background: white; font-weight: 600; }

.results-scroll { flex: 1; overflow-y: auto; padding-right: 10px; }
.group-label { font-size: 0.75rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 2px; margin: 20px 0 10px; }

.loc-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(201,76,76,0.02);
  border-radius: 20px;
  margin-bottom: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: var(--transition);
}

.loc-card:hover { background: white; border-color: var(--primary); box-shadow: 0 10px 20px rgba(201,76,76,0.05); }
.loc-text h5 { font-weight: 800; font-size: 1.1rem; margin-bottom: 4px; }
.loc-text p { font-size: 0.85rem; color: var(--text-light); }
.loc-action { color: var(--primary); }

.map-panel { border-radius: 30px; overflow: hidden; position: relative; }
.map-panel img { width: 100%; height: 100%; object-fit: cover; }
.map-floating-card { position: absolute; top: 30px; right: 30px; background: white; padding: 20px; border-radius: 24px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.hub-count { font-size: 2rem; font-weight: 900; color: var(--primary); }
.hub-label { font-size: 0.75rem; font-weight: 800; color: var(--text-light); text-transform: uppercase; }

/* Tiers Section */
.tiers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.tier-card {
  border-radius: 40px;
  overflow: hidden;
  background: white;
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.tier-card.dark { background: #111; color: white; }
.tier-visual { height: 350px; position: relative; }
.tier-visual img { width: 100%; height: 100%; object-fit: cover; }
.tier-badge { position: absolute; bottom: 30px; left: 30px; background: white; color: var(--text-dark); padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 0.8rem; text-transform: uppercase; }
.tier-badge.vip { background: var(--primary); color: white; }
.tier-info { padding: 50px; }
.tier-tag { color: var(--primary); font-weight: 800; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 12px; }
.tier-info h3 { font-size: 2.2rem; margin-bottom: 20px; }
.tier-list { list-style: none; margin-top: 30px; }
.tier-list li { margin-bottom: 15px; display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 1rem; }
.btn-outline-white { border: 2px solid var(--primary); color: var(--primary); padding: 12px 30px; border-radius: 15px; font-weight: 800; }

/* Amenities */
.amenities-section { background: var(--primary); padding: 100px 0; }
.amenities-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 40px; margin-top: 60px; color: white; }
.amenity-icon { width: 70px; height: 70px; background: white; color: var(--primary); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; transition: var(--transition); }
.amenity-box:hover .amenity-icon { transform: rotate(10deg) scale(1.1); }
.amenity-box h4 { font-weight: 800; margin-bottom: 12px; }
.amenity-box p { font-size: 0.9rem; opacity: 0.8; }

/* Heart (About) Centered */
.heart-section { padding: 150px 0; background-image: radial-gradient(circle at 10% 20%, rgba(201, 76, 76, 0.05), transparent 40%); }
.heart-container { max-width: 900px; }
.main-para { font-size: 2rem; font-weight: 800; line-height: 1.4; color: var(--text-dark); }
.sub-para { font-size: 1.15rem; line-height: 1.8; }

.stats-row { display: flex; justify-content: center; gap: 40px; align-items: center; }
.stat-circle { width: 140px; height: 140px; border: 1px solid rgba(201,76,76,0.1); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: var(--transition); }
.stat-circle:hover { border-color: var(--primary); background: white; transform: scale(1.05); }
.stat-circle.secondary { background: var(--primary); color: white; border: none; }
.stat-circle .val { font-size: 1.8rem; font-weight: 900; }
.stat-circle .lab { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }

/* Responsive */
@media (max-width: 1024px) {
  .hero-title { font-size: 3.5rem; }
  .form-grid { flex-direction: column; gap: 15px; }
  .hero-widget-container { bottom: -280px; }
  .vibes-section { padding-top: 300px; }
  .tiers-grid, .discovery-grid { grid-template-columns: 1fr; }
  .discovery-grid { gap: 20px; }
  .amenities-grid { grid-template-columns: repeat(2, 1fr); }
  .stat-circle { width: 120px; height: 120px; }
}
</style>
