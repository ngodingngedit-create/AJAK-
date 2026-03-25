<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { authState } from '../store/auth';
import { themeStore } from '../store/theme';
import { User, LogOut, Search, X, Moon, Sun } from 'lucide-vue-next';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const scrollSection = ref('');   // only tracks scroll sections on home page
const scrolled = ref(false);
const searchOpen = ref(false);
const searchQuery = ref('');

// Language State
const languages = [
  { code: 'id', name: 'Bahasa', flag: 'https://flagpedia.net/data/flags/h80/id.png' },
  { code: 'en', name: 'English', flag: 'https://flagpedia.net/data/flags/h80/us.png' }
];
const currentLang = ref(languages[0]);
const langDropdownOpen = ref(false);
const selectLang = (lang) => { currentLang.value = lang; langDropdownOpen.value = false; };

const handleLogout = () => { authState.logout(); router.push('/'); };

// Nav links — two types:
//   isRoute: true  → navigate to `to`, active = route.path match
//   isRoute: false → scroll to section id on home page, active = scroll position
const navLinks = [
  { id: 'home',      label: 'Beranda', isRoute: true,  to: '/' },
  { id: 'events',    label: 'Event',   isRoute: true,  to: '/events' },
  { id: 'services',  label: 'Layanan', isRoute: false },
  { id: 'discovery', label: 'Pick Up', isRoute: false },
  { id: 'about',     label: 'About',   isRoute: false },
];

const isOnHome = computed(() => route.path === '/');

// Active detection — clean logic
const isLinkActive = (link) => {
  if (link.id === 'home') {
    // Active only when on home AND no scroll section is active
    return route.path === '/' && !scrollSection.value;
  }
  if (link.id === 'events') {
    return route.path === '/events' ||
           route.path.startsWith('/booking') ||
           route.path === '/confirmation';
  }
  // Scroll sections only active on home page
  if (!isOnHome.value) return false;
  return scrollSection.value === link.id;
};

// Scroll tracking — only relevant on home page
const onScroll = () => {
  scrolled.value = window.scrollY > 40;
  if (!isOnHome.value) return;
  const sections = ['services', 'discovery', 'about', 'reviews'];
  let found = '';
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && window.scrollY + 160 >= el.offsetTop) found = id;
  }
  scrollSection.value = found;
};

// Reset scroll tracking when leaving home
watch(isOnHome, (val) => { if (!val) scrollSection.value = ''; });

// Navigation handler
const handleNav = (link) => {
  if (link.isRoute) {
    router.push(link.to);
    return;
  }
  // Scroll-based links
  if (!isOnHome.value) {
    // Go home first, then scroll after route settles
    router.push('/').then(() => {
      setTimeout(() => {
        const el = document.getElementById(link.id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    });
    return;
  }
  const el = document.getElementById(link.id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value;
  if (searchOpen.value) setTimeout(() => document.getElementById('navbar-search-input')?.focus(), 100);
  else searchQuery.value = '';
};

const handleSearchSubmit = () => {
  if (!searchQuery.value.trim()) return;
  router.push(`/events?q=${encodeURIComponent(searchQuery.value)}`);
  searchOpen.value = false;
  searchQuery.value = '';
};

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>


<template>
  <header class="navbar" :class="{ 'scrolled': scrolled }">
    <div class="container navbar-content">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <img src="/AJAKLogo/LOGO.png" alt="AJAK! Logo" class="logo-img" />
      </router-link>

      <!-- Desktop Nav Links -->
      <nav class="nav-links">
        <button
          v-for="link in navLinks"
          :key="link.id"
          class="nav-item"
          :class="{ active: isLinkActive(link) }"
          @click="handleNav(link)"
        >
          {{ link.label }}
          <span class="nav-dot" v-if="isLinkActive(link)"></span>
        </button>
      </nav>

      <!-- Right: Search + Language + Auth -->
      <div class="nav-auth">
        <!-- Search Bar (expandable) -->
        <div class="search-wrap" :class="{ open: searchOpen }">
          <transition name="search-expand">
            <div v-if="searchOpen" class="search-box">
              <Search size="16" class="search-box-icon" />
              <input
                id="navbar-search-input"
                v-model="searchQuery"
                type="text"
                placeholder="Cari event..."
                @keydown.enter="handleSearchSubmit"
                @keydown.escape="toggleSearch"
              />
            </div>
          </transition>
          <button class="icon-pill-btn search-toggle" @click="toggleSearch">
            <Search v-if="!searchOpen" size="18" />
            <X v-else size="18" />
          </button>
        </div>

        <!-- Theme Toggle -->
        <button
          class="icon-pill-btn theme-toggle-btn"
          :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          @click="themeStore.toggle()"
        >
          <transition name="theme-icon" mode="out-in">
            <Moon v-if="!themeStore.isDark" key="moon" size="17" />
            <Sun v-else key="sun" size="17" />
          </transition>
        </button>

        <!-- Language Switcher (Visible in Mobile, replacing profile) -->
        <div class="lang-switcher">
          <button class="icon-pill-btn lang-btn" @click="langDropdownOpen = !langDropdownOpen">
            <img :src="currentLang.flag" :alt="currentLang.code" class="flag-img" />
          </button>
          <transition name="fade-drop">
            <div v-if="langDropdownOpen" class="lang-dropdown">
              <button v-for="lang in languages" :key="lang.code" class="lang-opt" @click="selectLang(lang)">
                <img :src="lang.flag" class="flag-img" />
                <span>{{ lang.name }}</span>
              </button>
            </div>
          </transition>
        </div>

        <!-- Desktop Only Auth (Hidden on Mobile) -->
        <div class="desktop-auth-area">
          <template v-if="!authState.isLoggedIn">
            <router-link to="/login" class="btn btn-outline nav-btn">Login / Sign Up</router-link>
          </template>
          <template v-else>
            <router-link to="/profile" class="user-profile-nav">
              <div class="avatar-sm">
                <User size="14" color="var(--primary)" />
              </div>
              <span class="user-name-label">{{ authState.user?.name }}</span>
            </router-link>
            <button @click="handleLogout" class="icon-pill-btn logout-btn" title="Logout">
              <LogOut size="18" />
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Mobile search bar (below navbar) -->
    <transition name="slide-down">
      <div v-if="searchOpen" class="mobile-search-bar">
        <div class="mob-srch-inner">
          <Search size="16" class="mob-srch-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari event, kota, atau layanan..."
            @keydown.enter="handleSearchSubmit"
          />
          <button @click="handleSearchSubmit" class="mob-go-btn">Cari</button>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.navbar {
  background-color: var(--navbar-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  transition: background-color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  border-bottom: 1px solid var(--border-color);
}
.navbar.scrolled {
  background-color: var(--navbar-scrolled-bg);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
  border-bottom-color: var(--border-color);
}

/* Theme toggle */
.theme-toggle-btn { position: relative; overflow: hidden; }
.theme-icon-enter-active, .theme-icon-leave-active { transition: all 0.25s ease; }
.theme-icon-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
.theme-icon-leave-to   { opacity: 0; transform: rotate(90deg) scale(0.5); }
.navbar-content {
  display: flex; justify-content: space-between; align-items: center;
  height: 80px; gap: 20px;
}

/* Logo */
.logo { display: flex; align-items: center; flex-shrink: 0; }
.logo-img { height: 42px; width: auto; object-fit: contain; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

/* Nav Links */
.nav-links { display: flex; align-items: center; gap: 4px; flex: 1; justify-content: center; }
.nav-item {
  position: relative; padding: 8px 16px; border-radius: 12px;
  font-weight: 600; font-size: 0.85rem; color: var(--text-dark);
  transition: color 0.2s ease, background-color 0.2s ease; background: transparent; border: none;
  cursor: pointer; font-family: inherit;
}
.nav-item:hover { color: var(--primary); background: rgba(201, 76, 76, 0.07); }
.nav-item.active { color: var(--primary); background: rgba(201, 76, 76, 0.08); font-weight: 700; }
.nav-dot { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--primary); }

/* Right area */
.nav-auth { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.desktop-auth-area { display: flex; align-items: center; gap: 10px; }

/* REFINED ICON BUTTONS */
.icon-pill-btn {
  width: 40px; height: 40px; border-radius: 14px;
  background: rgba(201, 76, 76, 0.04); border: 1px solid rgba(201, 76, 76, 0.08);
  color: var(--primary); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 1.5, 0.6, 1);
  padding: 0;
}
.icon-pill-btn:hover { background: var(--primary); color: white; border-color: var(--primary); transform: translateY(-2px) scale(1.05); }
.icon-pill-btn:active { transform: scale(0.95); }

/* Language Switcher */
.lang-switcher { position: relative; }
.flag-img { width: 22px; height: 16px; border-radius: 4px; object-fit: cover; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.lang-dropdown {
  position: absolute; top: 110%; right: 0; margin-top: 8px;
  background: var(--card-bg); border-radius: 18px; padding: 8px;
  box-shadow: var(--shadow-lg); border: 1px solid var(--border-color);
  display: flex; flex-direction: column; gap: 6px; min-width: 130px;
}
.lang-opt {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  border-radius: 12px; border: none; background: transparent;
  cursor: pointer; font-family: inherit; font-size: 0.85rem; font-weight: 700;
  color: var(--text-dark);
  transition: all 0.2s;
}
.lang-opt:hover { background: rgba(201,76,76,0.06); color: var(--primary); }

/* Search Area */
.search-wrap { display: flex; align-items: center; }
.search-box {
  background: var(--input-bg); border-radius: 14px; padding: 0 16px;
  display: flex; align-items: center; gap: 10px; margin-right: 8px;
  height: 40px; border: 1px solid var(--border-color);
}
.search-box input { border: none; background: transparent; outline: none; font-family: inherit; font-size: 0.85rem; font-weight: 600; min-width: 180px; color: var(--text-dark); }

/* Mobile Search Bar Dropdown */
.mobile-search-bar { display: none; padding: 10px 16px 16px; background: var(--card-bg); border-bottom: 1px solid var(--border-color); }
.mob-srch-inner { display: flex; align-items: center; gap: 12px; background: var(--input-bg); border-radius: 16px; padding: 5px 6px 5px 16px; border: 1px solid var(--border-color); }
.mob-srch-inner input { flex: 1; border: none; background: transparent; outline: none; padding: 8px 0; font-family: inherit; font-size: 0.95rem; font-weight: 500; color: var(--text-dark); }
.mob-go-btn { background: var(--primary); color: white; border: none; border-radius: 12px; padding: 10px 20px; font-weight: 800; font-family: inherit; cursor: pointer; transition: all 0.2s; }

/* Transitions */
.search-expand-enter-active, .search-expand-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
.search-expand-enter-from, .search-expand-leave-to { opacity: 0; width: 0; margin-right: 0; }

.fade-drop-enter-active, .fade-drop-leave-active { transition: all 0.25s ease; }
.fade-drop-enter-from, .fade-drop-leave-to { opacity: 0; transform: translateY(-10px); }

/* User profile nav item */
.user-profile-nav { display: flex; align-items: center; gap: 10px; background: rgba(201,76,76,0.06); padding: 6px 16px 6px 8px; border-radius: 30px; border: 1px solid rgba(201,76,76,0.1); text-decoration: none; transition: all 0.2s; }
.user-profile-nav:hover { background: rgba(201,76,76,0.1); border-color: var(--primary); }
.avatar-sm { width: 28px; height: 28px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(201,76,76,0.15); }
.user-name-label { font-size: 0.82rem; font-weight: 800; color: var(--text-dark); }


@media (max-width: 768px) {
  .navbar-content { height: 60px; }
  .logo-img { height: 34px; }
  .nav-links, .desktop-auth-area { display: none; }
  .mobile-search-bar { display: block; }
  .icon-pill-btn { width: 36px; height: 36px; border-radius: 12px; }
  .search-box { display: none; }
  .nav-auth { gap: 8px; }
}
</style>
