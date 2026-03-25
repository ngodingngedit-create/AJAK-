<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Home, Calendar, Layers, MapPin, User } from 'lucide-vue-next';
import { authState } from '../store/auth';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const activeSection = ref('home');

const navItems = [
  { id: 'home',      label: 'Beranda', icon: Home,     route: '/' },
  { id: 'events',    label: 'Event',   icon: Calendar, route: '/events' },
  { id: 'services',  label: 'Layanan', icon: Layers,   route: null },
  { id: 'discovery', label: 'Pick Up', icon: MapPin,   route: null },
];

const isOnHome = computed(() => route.path === '/');

const onScroll = () => {
  if (!isOnHome.value) return;
  const sections = ['vibes', 'services', 'discovery', 'about', 'reviews'];
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
  if (isProfileActive.value) return 4;
  if (isEventActive.value) return 1;
  if (!isOnHome.value) return -1;
  return navItems.findIndex(i => i.id === activeSection.value);
});

onMounted(() => window.addEventListener('scroll', onScroll));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <div class="mobile-nav-wrapper">
    <nav class="crystal-nav">
      <!-- Minimalist Top Indicator -->
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
            <component :is="item.icon" :size="18" stroke-width="2.2" />
          </div>
          <span class="nav-label">{{ item.label }}</span>
        </button>

        <!-- Profile Button -->
        <button 
          class="nav-btn"
          :class="{ active: isProfileActive }"
          @click="goProfile"
        >
          <div class="icon-box">
            <User :size="18" stroke-width="2.2" />
          </div>
          <span class="nav-label">{{ authState.isLoggedIn ? 'Profil' : 'Login' }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.mobile-nav-wrapper {
  display: none;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0 20px;
  justify-content: center;
}

@media (max-width: 768px) {
  .mobile-nav-wrapper { display: flex; }
}

.crystal-nav {
  position: relative;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  max-width: 350px; /* Lebih ramping */
  height: 60px; /* Lebih pendek */
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
  display: flex;
  padding: 0 6px;
  overflow: hidden;
}

.nav-content {
  display: flex;
  width: 100%;
  position: relative;
  z-index: 2;
}

.nav-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #777;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  font-family: inherit;
  gap: 2px;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.nav-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  opacity: 0.7;
}

/* Active State */
.nav-btn.active {
  color: var(--primary); /* Merah AJAK! */
}

.nav-btn.active .icon-box {
  transform: scale(1.15);
}

.nav-btn.active .nav-label {
  opacity: 1;
  font-weight: 800;
}

/* Minimalist Top Indicator */
.active-indicator {
  position: absolute;
  top: 0;
  left: 6px;
  width: calc((100% - 12px) / 5);
  height: 3px;
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 1;
  display: flex;
  justify-content: center;
}

.indicator-line {
  width: 24px;
  height: 100%;
  background: var(--primary);
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 6px rgba(201, 76, 76, 0.3);
}

.nav-btn:active .icon-box {
  transform: scale(0.85);
}
</style>
