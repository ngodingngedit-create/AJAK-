<script setup>
import { ref, onMounted } from 'vue';
import Splash from './components/Splash.vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import MobileNav from './components/MobileNav.vue';

const appReady = ref(true); // DEBUG: bypass splash

const onSplashReady = () => {
  appReady.value = true;
};

// Fallback: force show app after 4 seconds if splash doesn't emit
onMounted(() => {
  setTimeout(() => {
    appReady.value = true;
  }, 4000);
});
</script>

<template>
  <Splash @ready="onSplashReady" />
  
  <div v-show="appReady" class="app-container">
    <Navbar v-if="$route.path !== '/portfolio'" />
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Footer v-if="$route.path !== '/portfolio' && !$route.path.startsWith('/booking') && $route.path !== '/transaksi'" />
    <MobileNav v-if="$route.path !== '/portfolio' && !$route.path.startsWith('/booking') && $route.path !== '/transaksi'" />
  </div>
</template>

<style>
/* App Layout */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Route transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
