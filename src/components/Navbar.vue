<script setup>
import { authState } from '../store/auth';
import { User, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  authState.logout();
  router.push('/');
};
</script>

<template>
  <header class="navbar shadow-sm">
    <div class="container navbar-content">
      <router-link to="/" class="logo">
        <img src="/AJAKLogo/LOGO.png" alt="AJAK! Logo" class="logo-img" />
      </router-link>
      <nav class="nav-links">
        <router-link to="/" class="nav-item">Events</router-link>
        <a href="#services" class="nav-item">How it Works</a>
        <a href="#about" class="nav-item">About</a>
        
        <template v-if="!authState.isLoggedIn">
          <router-link to="/login" class="btn btn-outline nav-btn">Login / Sign Up</router-link>
        </template>
        <template v-else>
          <div class="user-profile">
            <div class="avatar">
              <User size="20" color="var(--primary)" />
            </div>
            <span class="user-name">{{ authState.user.name }}</span>
            <button @click="handleLogout" class="btn-logout" title="Logout">
              <LogOut size="18" />
            </button>
          </div>
        </template>

      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: var(--transition);
  border-bottom: 1px solid rgba(201, 76, 76, 0.05);
}

.shadow-sm {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 90px;
}

.logo {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-img {
  height: 50px;
  width: auto;
  object-fit: contain;
  transition: var(--transition);
}

.logo-img:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-item {
  color: var(--text-dark);
  font-weight: 500;
}

.nav-item:hover {
  color: var(--primary);
}

.router-link-active:not(.logo):not(.btn) {
  color: var(--primary);
  font-weight: 600;
}

.nav-btn {
  padding: 8px 24px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-color);
  padding: 6px 12px 6px 6px;
  border-radius: 50px;
  border: 1px solid rgba(201, 76, 76, 0.15);
}

.avatar {
  width: 32px;
  height: 32px;
  background-color: var(--secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-logout {
  color: var(--text-light);
  display: flex;
  align-items: center;
  padding: 4px;
  margin-left: 4px;
}
.btn-logout:hover {
  color: var(--primary);
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
</style>
