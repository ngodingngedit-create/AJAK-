<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Home, Calendar, Layers, MapPin, User, ScanLine, UserCheck } from 'lucide-vue-next';
import { authState } from '../store/auth';
import { checkinTab } from '../store/checkin';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const activeSection = ref('home');

const navItems = [
  { id: 'home',      label: 'Beranda', icon: Home,     route: '/' },
  { id: 'events',    label: 'Event',   icon: Calendar, route: '/events' },
  { id: 'services',  label: 'Layanan', icon: Layers,   route: null },
  { id: 'discovery', label: 'Penjemputan', icon: MapPin,   route: null },
];

const isOnHome = computed(() => route.path === '/');

// Special nav for /checkin (mobile only): only Checkin & Checkin Manual tabs
const isCheckinPage = computed(() => route.path === '/checkin');

const onScroll = () => {
  if (!isOnHome.value) return;
  const sections = ['vibes', 'services', 'discovery', 'Tentang', 'reviews'];
  let current = 'home';
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && window.scrollY + 100 >= el.offsetTop) current = id;
  }
  activeSection.value = current;
};

const handleNav = (item) => {
  if (item.route) {
    router.push(item.route);
    return;
  }
  // scroll-based sections only work on home page
  if (!isOnHome.value) {
    router.push('/').then(() => {
      setTimeout(() => {
        const el = document.getElementById(item.id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    });
    return;
  }
  if (item.id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeSection.value = 'home';
    return;
  }
  const el = document.getElementById(item.id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const goProfile = () => {
  if (authState.isLoggedIn) router.push('/profile');
  else router.push('/login');
};

const isProfileActive = computed(() => {
  return route.path.startsWith('/profile') || route.path === '/login';
});

const isEventActive = computed(() => {
  return route.path === '/events' || route.path.startsWith('/booking') || route.path === '/confirmation';
});

const getItemActive = (item) => {
  if (item.id === 'events') return isEventActive.value;
  if (!isOnHome.value) return false;
  return activeSection.value === item.id || (item.id === 'home' && activeSection.value === 'home');
};

const activeIndex = computed(() => {
  if (isEventActive.value) return 1;
  if (!isOnHome.value) return -1;
  return navItems.findIndex(i => i.id === activeSection.value);
});

// Checkin nav specific logic
const checkinItems = [
  { id: 'scan',   label: 'Checkin',        icon: ScanLine,  tab: 'scan' },
  { id: 'manual', label: 'Checkin Manual', icon: UserCheck, tab: 'manual' },
];

const checkinActiveIndex = computed(() => {
  return checkinItems.findIndex(i => i.tab === checkinTab.value);
});

onMounted(() => window.addEventListener('scroll', onScroll));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <div class="mobile-nav-wrapper">
    <!-- /checkin: only Checkin & Checkin Manual tabs -->
    <nav v-if="isCheckinPage" class="crystal-nav checkin-nav">
      <div
        class="active-indicator"
        :style="{ transform: `translateX(calc(${checkinActiveIndex} * 100%))`, width: '50%' }"
      >
        <div class="indicator-line"></div>
      </div>

      <div class="nav-content">
        <button
          v-for="item in checkinItems"
          :key="item.id"
          class="nav-btn"
          :class="{ active: checkinTab === item.tab }"
          @click="checkinTab = item.tab"
        >
          <div class="icon-box">
            <component :is="item.icon" :size="20" stroke-width="2" />
          </div>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </div>
    </nav>

    <!-- Default nav -->
    <nav v-else class="crystal-nav">
      <!-- Top Active Indicator Bar -->
      <div 
        class="active-indicator" 
        :style="{ transform: `translateX(calc(${activeIndex} * 100%))` }"
      >
        <div class="indicator-line"></div>
      </div>

      <div class="nav-content">
        <button 
          v-for="item in navItems" 
          :key="item.id"
          class="nav-btn"
          :class="{ active: getItemActive(item) }"
          @click="handleNav(item)"
        >
          <div class="icon-box">
            <component :is="item.icon" :size="20" stroke-width="2" />
          </div>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.mobile-nav-wrapper {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  padding: 0;
  justify-content: center;
}

@media (max-width: 768px) {
  .mobile-nav-wrapper { display: flex; }
}

.crystal-nav {
  position: relative;
  background: #ffffff;
  width: 100%;
  max-width: 100%;
  height: 64px;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 
    0 -8px 24px rgba(0, 0, 0, 0.1),
    0 -2px 6px rgba(0, 0, 0, 0.04);
  display: flex;
  padding: 0 4px;
  overflow: hidden;
}

.nav-content {
  display: flex;
  width: 100%;
  position: relative;
  z-index: 2;
  height: 100%;
}

.nav-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #70757a;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  gap: 3px;
  padding-top: 4px;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;
}

.nav-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1px;
  opacity: 0.85;
}

/* Active State */
.nav-btn.active {
  color: var(--primary); /* Merah AJAK! */
}

.nav-btn.active .icon-box {
  transform: translateY(-1px);
}

.nav-btn.active .nav-label {
  opacity: 1;
  font-weight: 700;
  color: var(--primary);
}

/* Top Active Indicator Bar */
.active-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 25%;
  height: 3px;
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 5;
  display: flex;
  justify-content: center;
}

.indicator-line {
  width: 28px;
  height: 100%;
  background: var(--primary);
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 6px rgba(201, 76, 76, 0.4);
}

.nav-btn:active .icon-box {
  transform: scale(0.9);
}

/* Checkin-specific nav: 2 tabs, slightly larger labels */
.crystal-nav.checkin-nav {
  height: 64px;
}
.checkin-nav .nav-label {
  font-size: 0.7rem;
  font-weight: 700;
}
</style>
