<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Wrench } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const pageNames = {
  '/profile/payments':      { label: 'Riwayat Pembayaran', emoji: '💳', desc: 'Lihat semua riwayat transaksi dan pembayaran ride kamu.' },
  '/profile/notifications': { label: 'Notifikasi',          emoji: '🔔', desc: 'Atur preferensi notifikasi dan pengingat dari AJAK!' },
  '/profile/security':      { label: 'Keamanan Akun',       emoji: '🔐', desc: 'Kelola password, 2FA, dan pengaturan privasi akun kamu.' },
  '/profile/settings':      { label: 'Pengaturan',          emoji: '⚙️', desc: 'Sesuaikan preferensi aplikasi sesuai keinginan kamu.' },
  '/profile/help':          { label: 'Bantuan',             emoji: '💬', desc: 'FAQ, panduan penggunaan, dan hubungi tim support kami.' },
};

const page = computed(() => pageNames[route.path] || { label: 'Halaman', emoji: '🚧', desc: '' });
</script>

<template>
  <div class="coming-page">
    <div class="coming-content">
      <button class="back-btn" @click="router.push('/profile')">
        <ArrowLeft size="18" /> Kembali ke Profil
      </button>

      <div class="coming-card">
        <div class="coming-emoji">{{ page.emoji }}</div>
        <div class="coming-badge">
          <Wrench size="14" /> Sedang Dikembangkan
        </div>
        <h1 class="coming-title">{{ page.label }}</h1>
        <p class="coming-desc">{{ page.desc }}</p>
        <p class="coming-sub">Fitur ini sedang dalam proses pengembangan oleh tim AJAK! dan akan segera hadir.</p>

        <div class="coming-actions">
          <button class="btn-home" @click="router.push('/')">Kembali ke Beranda</button>
          <button class="btn-profile" @click="router.push('/profile')">Ke Profil Saya</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coming-page {
  min-height: 100vh;
  background: #f7f7f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 24px 60px;
}

.coming-content {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid rgba(201,76,76,0.15);
  color: var(--text-dark);
  padding: 10px 20px;
  border-radius: 12px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}
.back-btn:hover { border-color: var(--primary); color: var(--primary); }

.coming-card {
  background: white;
  border-radius: 32px;
  padding: 52px 44px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.06);
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.coming-emoji {
  font-size: 4rem;
  line-height: 1;
}

.coming-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(201,76,76,0.08);
  color: var(--primary);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.coming-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--text-dark);
  letter-spacing: -0.5px;
  margin: 0;
}
.coming-desc {
  font-size: 0.95rem;
  color: var(--text-light);
  line-height: 1.6;
  margin: 0;
}
.coming-sub {
  font-size: 0.82rem;
  color: #bbb;
  margin: 0;
}

.coming-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.btn-home, .btn-profile {
  flex: 1;
  padding: 13px 20px;
  border-radius: 14px;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-home {
  background: transparent;
  border: 1.5px solid rgba(201,76,76,0.2);
  color: var(--text-dark);
}
.btn-home:hover { border-color: var(--primary); color: var(--primary); }
.btn-profile {
  background: var(--primary);
  border: none;
  color: white;
}
.btn-profile:hover { background: #b34242; transform: translateY(-2px); }
</style>
