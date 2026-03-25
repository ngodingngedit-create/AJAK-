<script setup>
import { ref, onMounted, computed } from 'vue';
import { themeStore } from '../store/theme';

const phase = ref('enter'); // enter → idle → exit
const emit = defineEmits(['ready']);

const isDark = computed(() => themeStore.isDark);

onMounted(() => {
  setTimeout(() => { phase.value = 'idle'; }, 900);
  setTimeout(() => {
    phase.value = 'exit';
    setTimeout(() => emit('ready'), 700);
  }, 2600);
});
</script>

<template>
  <div
    v-if="phase !== 'done'"
    class="splash-screen"
    :class="[`phase-${phase}`, { dark: isDark }]"
  >
    <!-- Animated background orbs -->
    <div class="bg-orb orb-a"></div>
    <div class="bg-orb orb-b"></div>

    <!-- Core content -->
    <div class="splash-center">
      <!-- Pulse rings -->
      <div class="ring ring-1"></div>
      <div class="ring ring-2"></div>
      <div class="ring ring-3"></div>

      <!-- Logo -->
      <div class="logo-wrap" :class="`phase-${phase}`">
        <img src="/AJAKLogo/LOGO.png" alt="AJAK!" class="splash-logo-img" />
        <div class="shimmer"></div>
      </div>

      <!-- Tagline -->
      <p class="tagline" :class="`phase-${phase}`">
        Ride · Arrive · Experience
      </p>

      <!-- Loading bar -->
      <div class="load-bar-wrap" :class="`phase-${phase}`">
        <div class="load-bar"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Base ────────────────────────────────────── */
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  /* LIGHT = default */
  background: #FFF8F8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

/* DARK variant */
.splash-screen.dark {
  background: #0f0f0f;
}

.splash-screen.phase-exit {
  opacity: 0;
  transform: scale(1.04);
  pointer-events: none;
}

/* ── Background orbs ─────────────────────────── */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  opacity: 0;
  animation: orb-in 1.2s ease forwards;
}
/* Light mode orbs: soft pink */
.orb-a {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(201,76,76,0.18), transparent 70%);
  top: -100px; right: -100px;
  animation-delay: 0.2s;
}
.orb-b {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(245,181,181,0.22), transparent 70%);
  bottom: -80px; left: -80px;
  animation-delay: 0.5s;
}
/* Dark mode orbs: stronger red */
.dark .orb-a {
  background: radial-gradient(circle, rgba(201,76,76,0.38), transparent 70%);
}
.dark .orb-b {
  background: radial-gradient(circle, rgba(201,76,76,0.22), transparent 70%);
}

@keyframes orb-in {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Center container ─────────────────────────── */
.splash-center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

/* ── Pulse rings ─────────────────────────────── */
.ring {
  position: absolute;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: ring-pulse 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  /* Light mode: soft pinkish */
  border: 1.5px solid rgba(201, 76, 76, 0.3);
}
.dark .ring {
  border-color: rgba(201, 76, 76, 0.6);
}
.ring-1 { width: 160px; height: 160px; animation-delay: 0.1s; }
.ring-2 { width: 230px; height: 230px; animation-delay: 0.5s; }
.ring-3 { width: 310px; height: 310px; animation-delay: 0.9s; border-width: 1px; opacity: 0.5; }

@keyframes ring-pulse {
  0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0.9; }
  80%  { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
}

/* ── Logo ────────────────────────────────────── */
.logo-wrap {
  position: relative;
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.6) translateY(16px);
}
.logo-wrap.phase-enter {
  animation: logo-enter 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s forwards;
}
.logo-wrap.phase-idle,
.logo-wrap.phase-exit {
  opacity: 1;
  transform: scale(1) translateY(0);
  animation: logo-breathe 3s ease-in-out infinite;
}
@keyframes logo-enter {
  0%   { opacity: 0; transform: scale(0.5) translateY(24px); filter: blur(6px); }
  60%  { filter: blur(0); }
  100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
}
@keyframes logo-breathe {
  0%, 100% { transform: scale(1) translateY(0); }
  50%       { transform: scale(1.04) translateY(-4px); }
}

.splash-logo-img {
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: contain;
  position: relative;
  z-index: 2;
  /* Light: subtle soft shadow */
  filter: drop-shadow(0 4px 18px rgba(201,76,76,0.2));
}
.dark .splash-logo-img {
  filter: drop-shadow(0 0 30px rgba(201,76,76,0.6))
          drop-shadow(0 0 70px rgba(201,76,76,0.2));
}

/* Shimmer sweep */
.shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(201,76,76,0.13) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: shimmer-sweep 2.5s ease 1s infinite;
  z-index: 3;
}
.dark .shimmer {
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255,255,255,0.25) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
}
@keyframes shimmer-sweep {
  0%   { background-position: 200% 0; }
  40%  { background-position: -50% 0; }
  100% { background-position: -50% 0; }
}

/* ── Tagline ─────────────────────────────────── */
.tagline {
  font-family: 'Inter', sans-serif;
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: rgba(201, 76, 76, 0.5);
  opacity: 0;
  transform: translateY(10px);
}
.dark .tagline {
  color: rgba(255, 255, 255, 0.4);
}
.tagline.phase-idle,
.tagline.phase-exit {
  animation: fade-up-in 0.6s ease 0.1s forwards;
}
@keyframes fade-up-in {
  to { opacity: 1; transform: translateY(0); }
}

/* ── Loading bar ─────────────────────────────── */
.load-bar-wrap {
  width: 120px;
  height: 2px;
  background: rgba(201, 76, 76, 0.12);
  border-radius: 2px;
  overflow: hidden;
  opacity: 0;
}
.dark .load-bar-wrap {
  background: rgba(255,255,255,0.1);
}
.load-bar-wrap.phase-idle,
.load-bar-wrap.phase-exit {
  opacity: 1;
  transition: opacity 0.4s ease 0.2s;
}
.load-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #c94c4c, #ff9a9a);
  border-radius: 2px;
  animation: load-fill 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
}
@keyframes load-fill {
  0%   { width: 0%; }
  60%  { width: 75%; }
  100% { width: 100%; }
}
</style>
