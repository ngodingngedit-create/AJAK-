<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Home, Calendar, Layers, MapPin, Info, User } from 'lucide-vue-next';
import { authState } from '../store/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeSection = ref('home');

const navItems = [
  { id: 'home',      label: 'Beranda', icon: Home,     action: 'scroll' },
  { id: 'vibes',     label: 'Event',   icon: Calendar, action: 'scroll' },
  { id: 'services',  label: 'Layanan', icon: Layers,   action: 'scroll' },
  { id: 'discovery', label: 'Pick Up', icon: MapPin,   action: 'scroll' },
  { id: 'about',     label: 'About',   icon: Info,     action: 'scroll' },
];

const onScroll = () => {
  const sections = ['vibes', 'services', 'discovery', 'about', 'reviews'];
  let current = 'home';
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && window.scrollY + 150 >= el.offsetTop) current = id;
  }
  activeSection.value = current;
};

const handleNav = (item) => {
  if (item.id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(item.id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const goProfile = () => {
  if (authState.isLoggedIn) router.push('/profile');
  else router.push('/login');
};

onMounted(() => window.addEventListener('scroll', onScroll));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <nav class="mobile-nav">
    <div class="nav-container">
      <!-- 5 section nav items (compact, icon only on very small screens) -->
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeSection === item.id }"
        @click="handleNav(item)"
      >
        <div class="icon-wrap">
          <component :is="item.icon" size="20" />
        </div>
        <span>{{ item.label }}</span>
      </button>

      <!-- Profile / Login -->
      <button class="nav-item profile-btn" @click="goProfile">
        <div class="icon-wrap" :class="{ 'logged-in': authState.isLoggedIn }">
          <User size="20" />
        </div>
        <span>{{ authState.isLoggedIn ? 'Profil' : 'Login' }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(201,76,76,0.08);
  box-shadow: 0 -8px 30px rgba(0,0,0,0.07);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  padding: 0 4px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1;
  color: #aaa;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  transition: color 0.2s ease;
  min-width: 0;
}

.nav-item.active { color: var(--primary); }
.nav-item.active .icon-wrap {
  background: rgba(201,76,76,0.1);
  transform: translateY(-2px);
}

.icon-wrap {
  width: 36px;
  height: 28px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-wrap.logged-in {
  background: rgba(201,76,76,0.1);
  color: var(--primary);
}

.nav-item span {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 52px;
}

@media (max-width: 768px) {
  .mobile-nav { display: block; }
}

@media (max-width: 380px) {
  .nav-item span { display: none; }
  .nav-container { height: 58px; }
  .icon-wrap { width: 40px; height: 36px; border-radius: 12px; }
}
</style>
