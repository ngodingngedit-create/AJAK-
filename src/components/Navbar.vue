<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { authState } from '../store/auth';
import { themeStore } from '../store/theme';
import { User, LogOut, Search, X, Moon, Sun, Home, Calendar, Layers, MapPin, Info, Menu, FileText } from 'lucide-vue-next';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const scrollSection = ref('');   // only tracks scroll sections on home page
const scrolled = ref(false);
const searchOpen = ref(false);
const searchQuery = ref('');
const sidebarOpen = ref(false);
const showTermsModal = ref(false);

const termsList = [
  "Tiket yang sudah dibeli tidak bisa di refund, terkecuali ada pembatalan dari pihak penyelenggara konser atau force major",
  "Customer wajib datang tepat waktu sesuai Schedule Shuttle",
  "Keterlambatan tanpa informasi lebih dari 10 menit di anggap tidak ada / cancel otomatis",
  "Customer dilarang merokok, menggunakan rokok elektrik/sejenisnya di dalam shuttle bus",
  "Customer dilarang membawa senjata tajam dan senjata api atau sejenisnya di dalam shuttle bus",
  "Tidak menerima pembelian tiket shuttle dalam pembayaran uang tunai/cash",
  "Tidak menerima penitipan barang customer didalam shuttle bus"
];

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
  { id: 'home',      label: 'Beranda', icon: Home,     isRoute: true,  to: '/' },
  { id: 'events',    label: 'Event',   icon: Calendar, isRoute: true,  to: '/events' },
  { id: 'services',  label: 'Layanan', icon: Layers,   isRoute: false },
  { id: 'discovery', label: 'Penjemputan', icon: MapPin,   isRoute: false },
  { id: 'Tentang',     label: 'Tentang',   icon: Info,     isRoute: false },
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
  const sections = ['services', 'discovery', 'Tentang', 'reviews'];
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
  <header class="navbar" :class="{ 'scrolled': scrolled, 'no-shadow': route.name === 'help' }">
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
          <span class="nav-label-text">{{ link.label }}</span>
          <component :is="link.icon" size="18" class="nav-icon-mobile" />
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

        <!-- Hamburger Menu (Mobile Only) -->
        <button class="icon-pill-btn hamburger-btn" @click="sidebarOpen = true">
          <Menu size="18" />
        </button>

        <!-- Desktop Only Auth (Hidden on Mobile) -->
        <div class="desktop-auth-area">
          <template v-if="!authState.isLoggedIn">
            <router-link to="/login" class="btn btn-outline nav-btn" style="padding: 6px 16px; font-size: 0.8rem; border-radius: 10px; height: 34px; display: flex; align-items: center;">Login</router-link>
          </template>
          <template v-else-if="authState.isLoggedIn">
            <router-link to="/dashboard" class="user-profile-nav">
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

    <!-- Mobile Sidebar -->
    <Teleport to="body">
      <transition name="slide-side">
        <div v-if="sidebarOpen" class="mobile-sidebar-overlay" @click="sidebarOpen = false">
          <div class="mobile-sidebar" @click.stop>
            <div class="sidebar-header">
              <img src="/AJAKLogo/LOGO.png" alt="AJAK! Logo" class="logo-img-sidebar" />
              <button class="icon-pill-btn" @click="sidebarOpen = false">
                <X size="18" />
              </button>
            </div>
            <div class="sidebar-search" style="margin-bottom: 16px;">
              <div class="search-box" style="margin: 0; width: 100%; border: 1.5px solid var(--border-color); background: rgba(0,0,0,0.02);">
                <Search size="16" class="search-box-icon" style="color: var(--text-light)" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari event..."
                  style="width: 100%; padding: 8px 0; border: none; background: transparent; outline: none; font-weight: 600; font-size: 0.9rem;"
                  @keydown.enter="handleSearchSubmit(); sidebarOpen = false;"
                />
              </div>
            </div>
            <div class="sidebar-links">
              <button
                v-for="link in navLinks"
                :key="link.id"
                class="sidebar-item"
                :class="{ active: isLinkActive(link) }"
                @click="handleNav(link); sidebarOpen = false;"
              >
                <component :is="link.icon" size="18" class="sidebar-icon" />
                <span>{{ link.label }}</span>
              </button>
              
              <button class="sidebar-item" @click="showTermsModal = true; sidebarOpen = false;">
                <FileText size="18" class="sidebar-icon" />
                <span>Terms and Condition</span>
              </button>
            </div>
            
            <div class="sidebar-footer">
              <!-- Auth -->
              <div style="display:flex; flex-direction:column; gap:8px;">
                <template v-if="!authState.isLoggedIn">
                  <router-link to="/login" class="btn btn-outline" style="text-align:center; padding:10px; border-radius:12px; font-weight:700;" @click="sidebarOpen=false">Login</router-link>
                </template>
                <template v-else>
                  <div style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(201,76,76,0.06); border-radius:12px; margin-bottom:4px;">
                    <div class="avatar-sm"><User size="16" color="var(--primary)" /></div>
                    <span style="font-weight:700; font-size:0.9rem;">{{ authState.user?.name }}</span>
                  </div>
                  <button @click="handleLogout(); sidebarOpen=false;" class="btn btn-primary" style="padding:10px; border-radius:12px; font-weight:700; display:flex; justify-content:center; gap:8px;">
                    <LogOut size="16" /> Logout
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Terms Modal -->
    <Teleport to="body">
      <transition name="fade-overlay">
        <div v-if="showTermsModal" class="modal-overlay" @click.self="showTermsModal = false">
          <div class="terms-modal">
            <div class="terms-header">
              <h3>Syarat dan Ketentuan</h3>
              <button class="icon-pill-btn" @click="showTermsModal = false"><X size="18" /></button>
            </div>
            <div class="terms-body">
              <ol class="terms-list">
                <li v-for="(term, index) in termsList" :key="index">{{ term }}</li>
              </ol>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </header>
</template>

<style scoped>
.navbar {
  background-color: var(--navbar-bg);
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  transition: background-color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.12);
}
.navbar.scrolled {
  background-color: var(--navbar-scrolled-bg);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.12);
  border-bottom-color: var(--border-color);
}
.navbar.no-shadow {
  box-shadow: none !important;
}

/* Theme toggle */
.theme-toggle-btn { position: relative; overflow: hidden; }
.theme-icon-enter-active, .theme-icon-leave-active { transition: all 0.25s ease; }
.theme-icon-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
.theme-icon-leave-to   { opacity: 0; transform: rotate(90deg) scale(0.5); }
.navbar-content {
  display: flex; justify-content: space-between; align-items: center;
  height: 60px; gap: 20px;
}

/* Logo */
.logo { display: flex; align-items: center; flex: 1; justify-content: flex-start; }
.logo-img { height: 42px; width: auto; object-fit: contain; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

/* Nav Links */
.nav-links { display: flex; align-items: center; gap: 4px; justify-content: center; flex: 0 1 auto; }
.nav-item {
  position: relative; padding: 8px 16px; border-radius: 12px;
  font-weight: 600; font-size: 0.85rem; color: var(--text-dark);
  transition: color 0.2s ease, background-color 0.2s ease; background: transparent; border: none;
  cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center;
}
.nav-icon-mobile { display: none; }
.nav-item:hover { color: var(--primary); background: rgba(201, 76, 76, 0.07); }
.nav-item.active { color: var(--primary); background: rgba(201, 76, 76, 0.08); font-weight: 700; }
.nav-dot { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--primary); }

/* Right area */
.nav-auth { display: flex; align-items: center; gap: 10px; flex: 1; justify-content: flex-end; }
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


/* Sidebar Styles */
.hamburger-btn { display: none; }
.desktop-auth-area, .search-wrap { display: flex; }
.lang-switcher { display: block; }
.mobile-sidebar-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 9999;
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
.mobile-sidebar {
  position: absolute; top: 0; right: 0; bottom: 0; width: 280px;
  background: var(--card-bg, #ffffff); box-shadow: -5px 0 30px rgba(0,0,0,0.15);
  display: flex; flex-direction: column; padding: 20px; z-index: 10000;
}
.sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.logo-img-sidebar { height: 32px; object-fit: contain; }
.sidebar-links { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.sidebar-item {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  border-radius: 14px; border: none; background: transparent;
  font-size: 1rem; font-weight: 700; color: var(--text-dark);
  cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.sidebar-item:hover { background: rgba(201, 76, 76, 0.05); color: var(--primary); }
.sidebar-item.active { background: rgba(201, 76, 76, 0.1); color: var(--primary); }
.sidebar-icon { color: inherit; }

.sidebar-footer {
  display: flex; flex-direction: column; gap: 16px;
  padding-top: 20px; border-top: 1px solid var(--border-color);
}

/* Transitions */
.slide-side-enter-active, .slide-side-leave-active { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-side-enter-from, .slide-side-leave-to { transform: translateX(100%); }
.slide-side-enter-to, .slide-side-leave-from { transform: translateX(0); }

.fade-overlay-enter-active, .fade-overlay-leave-active { transition: opacity 0.3s; }
.fade-overlay-enter-from, .fade-overlay-leave-to { opacity: 0; }

/* Terms Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 20px; }
.terms-modal { background: var(--card-bg); width: 100%; max-width: 500px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column; max-height: 90vh; }
.terms-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.terms-header h3 { font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin: 0; }
.terms-body { padding: 24px; overflow-y: auto; }
.terms-list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 12px; color: var(--text-dark); font-size: 0.9rem; line-height: 1.5; font-weight: 600; }
.terms-list li { padding-left: 8px; }

@media (max-width: 768px) {
  .navbar-content { height: 60px; flex-wrap: nowrap; justify-content: space-between; }
  .logo { display: flex; }
  .logo-img { height: 30px; }
  
  .nav-links { display: none; }
  .hamburger-btn { display: flex; margin-left: auto; }
  .desktop-auth-area, .search-wrap { display: none; }
  .mobile-search-bar { display: none; } /* keep hidden to simplify */
  .lang-switcher, .theme-toggle-btn { display: none; }
}
</style>
