<script setup>
import { ref, onMounted } from 'vue';

const isAnimating = ref(true);
const isHiding = ref(false);

const emit = defineEmits(['ready']);

onMounted(() => {
  // Wait a bit, then start fading out
  setTimeout(() => {
    isHiding.value = true;
    setTimeout(() => {
      isAnimating.value = false;
      emit('ready');
    }, 800); // Wait for fade transition
  }, 2000); // 2 second display
});
</script>

<template>
  <div v-if="isAnimating" class="splash-screen" :class="{ 'fade-out': isHiding }">
    <div class="logo-container">
      <h1 class="splash-logo">AJAK!</h1>
      <div class="pulse-ring"></div>
    </div>
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  background-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 1;
  transform: translateY(0);
}

.splash-screen.fade-out {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: zoomIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.splash-logo {
  font-size: 5rem;
  font-weight: 800;
  color: var(--white);
  letter-spacing: -2px;
  position: relative;
  z-index: 2;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.pulse-ring {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  z-index: 1;
  animation: pulse 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
}

@keyframes zoomIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.6);
    opacity: 0;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}
</style>
