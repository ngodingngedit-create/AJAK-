<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { authState } from '../store/auth';
import { User, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeSection = ref('home');
const scrolled = ref(false);

const handleLogout = () => {
  authState.logout();
  router.push('/');
};

const navLinks = [
  { id: 'home',      label: 'Beranda',  href: '#home-top',  isRoute: true, to: '/' },
  { id: 'vibes',     label: 'Event',    href: '#vibes' },
  { id: 'services',  label: 'Layanan',  href: '#services' },
  { id: 'discovery', label: 'Pick Up',  href: '#discovery' },
  { id: 'about',     label: 'About',    href: '#about' },
];

const onScroll = () => {
  scrolled.value = window.scrollY > 40;

  // Iterate in DOM order (top → bottom). Last match = deepest section visible.
  const sections = ['vibes', 'services', 'discovery', 'about', 'reviews'];
  let current = 'home';
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && window.scrollY + 150 >= el.offsetTop) {
      current = id;
    }
  }
  activeSection.value = current;
};

const scrollTo = (link) => {
  if (link.isRoute && router.currentRoute.value.path !== '/') {
    router.push('/');
    return;
  }
  const el = document.getElementById(link.id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => window.addEventListener('scroll', onScroll));
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
          :class="{ active: activeSection === link.id }"
          @click="scrollTo(link)"
        >
          {{ link.label }}
          <span class="nav-dot" v-if="activeSection === link.id"></span>
        </button>
      </nav>

      <!-- Auth -->
      <div class="nav-auth">
        <template v-if="!authState.isLoggedIn">
          <router-link to="/login" class="btn btn-outline nav-btn">Login / Sign Up</router-link>
        </template>
        <template v-else>
          <router-link to="/profile" class="user-profile">
            <div class="avatar">
              <User size="18" color="var(--primary)" />
            </div>
            <span class="user-name">{{ authState.user?.name }}</span>
          </router-link>
          <button @click="handleLogout" class="btn-logout" title="Logout">
            <LogOut size="18" />
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(201, 76, 76, 0.06);
}

.navbar.scrolled {
  background-color: rgba(255, 255, 255, 0.96);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.06);
  border-bottom-color: rgba(201, 76, 76, 0.1);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  gap: 24px;
}

/* Logo */
.logo { display: flex; align-items: center; flex-shrink: 0; }
.logo-img {
  height: 44px;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s;
}
.logo-img:hover { transform: scale(1.05); }

/* Nav Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  position: relative;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-dark);
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.1px;
}

.nav-item:hover {
  color: var(--primary);
  background: rgba(201, 76, 76, 0.06);
}

.nav-item.active {
  color: var(--primary);
  background: rgba(201, 76, 76, 0.08);
  font-weight: 700;
}

.nav-dot {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary);
}

/* Auth area */
.nav-auth {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav-btn { padding: 8px 22px; font-size: 0.875rem; }

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-color);
  padding: 5px 14px 5px 5px;
  border-radius: 50px;
  border: 1px solid rgba(201, 76, 76, 0.15);
  text-decoration: none;
  transition: all 0.2s;
}
.user-profile:hover {
  border-color: var(--primary);
  background: rgba(201,76,76,0.04);
}

.avatar {
  width: 30px;
  height: 30px;
  background-color: rgba(201,76,76,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-name { font-weight: 700; font-size: 0.875rem; color: var(--text-dark); }

.btn-logout {
  color: var(--text-light);
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  background: none;
  border: none;
}
.btn-logout:hover { color: var(--primary); background: rgba(201,76,76,0.07); }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .user-name { display: none; }
  .navbar-content { height: 70px; }
}
</style>
