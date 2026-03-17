<script setup>
import { ref } from 'vue';
import Splash from './components/Splash.vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

const appReady = ref(false);

const onSplashReady = () => {
  appReady.value = true;
};
</script>

<template>
  <Splash @ready="onSplashReady" />
  
  <div v-show="appReady" class="app-container">
    <Navbar />
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <Footer />
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
