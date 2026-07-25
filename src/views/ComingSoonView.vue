<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Home, 
  Calendar, 
  Wrench, 
  Car, 
  Building2, 
  Plane, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Settings 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const pageDetails = {
  '/rental-mobil': { title: 'Rental Mobil', icon: Car, animClass: 'anim-car', desc: 'Layanan sewa mobil sedang dalam tahap pengembangan dan akan segera hadir.' },
  '/hotel': { title: 'Hotel & Penginapan', icon: Building2, animClass: 'anim-hotel', desc: 'Pemesanan hotel dekat lokasi event sedang dalam tahap pengembangan dan akan segera hadir.' },
  '/tiket-pesawat': { title: 'Tiket Pesawat', icon: Plane, animClass: 'anim-plane', desc: 'Layanan pemesanan tiket pesawat sedang dalam tahap pengembangan dan akan segera hadir.' },
  '/profile/payments': { title: 'Riwayat Pembayaran', icon: CreditCard, animClass: 'anim-pulse', desc: 'Halaman riwayat pembayaran sedang dalam tahap pengembangan.' },
  '/profile/notifications': { title: 'Notifikasi', icon: Bell, animClass: 'anim-pulse', desc: 'Pengaturan notifikasi sedang dalam tahap pengembangan.' },
  '/profile/security': { title: 'Keamanan Akun', icon: ShieldCheck, animClass: 'anim-pulse', desc: 'Pengaturan keamanan sedang dalam tahap pengembangan.' },
  '/profile/settings': { title: 'Pengaturan', icon: Settings, animClass: 'anim-pulse', desc: 'Halaman pengaturan sedang dalam tahap pengembangan.' },
};

const page = computed(() => {
  return pageDetails[route.path] || { title: 'Halaman', icon: Wrench, animClass: 'anim-pulse', desc: 'Fitur ini sedang dalam tahap pengembangan dan akan segera hadir.' };
});
</script>

<template>
  <div class="simple-coming-page">
    <div class="coming-content">
      <div class="icon-circle" :class="page.animClass">
        <component :is="page.icon" size="34" class="page-icon" />
      </div>

      <div class="status-badge">
        <Wrench size="14" /> Segera Hadir
      </div>

      <h1 class="page-title">{{ page.title }}</h1>
      <p class="page-desc">{{ page.desc }}</p>

      <div class="btn-group">
        <button class="btn-home" @click="router.push('/')">
          <Home size="16" /> Beranda
        </button>

        <button class="btn-events" @click="router.push('/events')">
          <Calendar size="16" /> Lihat Event
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simple-coming-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 80px;
  background: var(--body-bg, #ffffff);
  font-family: inherit;
}

.coming-content {
  max-width: 420px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.icon-circle {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(201, 76, 76, 0.08);
  color: var(--primary, #C94C4C);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(201, 76, 76, 0.12);
  transition: all 0.3s ease;
}

.page-icon {
  color: var(--primary, #C94C4C);
  display: inline-block;
}

/* ===== ANIMASI LUKISAN IKON KHUSUS ===== */

/* 1. Animasi Mobil Bergerak Maju-Mundur & Road Bounce */
.anim-car .page-icon {
  animation: driveCar 2.2s ease-in-out infinite;
}

@keyframes driveCar {
  0% { transform: translateX(-6px) translateY(0); }
  25% { transform: translateX(0) translateY(-2px); }
  50% { transform: translateX(6px) translateY(0); }
  75% { transform: translateX(0) translateY(-2px); }
  100% { transform: translateX(-6px) translateY(0); }
}

/* 2. Animasi Pesawat Terbang & Tilt Upward */
.anim-plane .page-icon {
  animation: flyPlane 2.6s ease-in-out infinite;
}

@keyframes flyPlane {
  0% { transform: translateY(4px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(-12deg); }
  100% { transform: translateY(4px) rotate(0deg); }
}

/* 3. Animasi Hotel Rise & Glow Pulse */
.anim-hotel .page-icon {
  animation: hotelPulse 2.4s ease-in-out infinite;
}

@keyframes hotelPulse {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.1); }
}

/* 4. Animasi Generic Float */
.anim-pulse .page-icon {
  animation: defaultFloat 3s ease-in-out infinite;
}

@keyframes defaultFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.05); }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(201, 76, 76, 0.08);
  color: var(--primary, #C94C4C);
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-dark, #212529);
  margin: 0;
}

.page-desc {
  font-size: 0.92rem;
  color: var(--text-light, #6c757d);
  line-height: 1.5;
  margin: 0;
}

.btn-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}

.btn-home, .btn-events {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  padding: 0 12px;
  white-space: nowrap;
}

.btn-home {
  background: var(--primary, #C94C4C);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 14px rgba(201, 76, 76, 0.25);
}

.btn-home:hover {
  background: #b03a3a;
  transform: translateY(-1px);
}

.btn-events {
  background: #ffffff;
  border: 2px solid var(--border-color, rgba(0, 0, 0, 0.22));
  color: var(--text-dark, #212529);
}

.btn-events:hover {
  border-color: var(--primary, #C94C4C);
  color: var(--primary, #C94C4C);
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .simple-coming-page {
    padding: 80px 20px 90px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .page-desc {
    font-size: 0.88rem;
  }
  
  .btn-group {
    flex-direction: row;
    gap: 8px;
  }

  .btn-home, .btn-events {
    height: 42px;
    font-size: 0.82rem;
    padding: 0 8px;
    border-radius: 12px;
  }
}
</style>
