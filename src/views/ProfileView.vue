<script setup>
import { ref, computed } from 'vue';
import { authState } from '../store/auth';
import { useRouter } from 'vue-router';
import {
  User, LogOut, MapPin, Calendar, Star, ChevronRight,
  Clock, CreditCard, Shield, Settings, Bell, HelpCircle
} from 'lucide-vue-next';

const router = useRouter();

// Redirect if not logged in
if (!authState.isLoggedIn) {
  router.push('/login');
}

const handleLogout = () => {
  authState.logout();
  router.push('/');
};

const user = computed(() => authState.user || { name: 'User', email: '' });

// Mock data
const stats = [
  { value: '12', label: 'Perjalanan', icon: MapPin },
  { value: '3',  label: 'Event',      icon: Calendar },
  { value: '4.9', label: 'Rating',    icon: Star },
];

const recentRides = [
  { id: 1, event: 'Neon Lights Festival', from: 'Margo City, Depok', date: '15 Oct 2026', status: 'Selesai', amount: 'Rp 89.000' },
  { id: 2, event: 'Symphony in the Park', from: 'Grand Indonesia', date: '22 Oct 2026', status: 'Selesai', amount: 'Rp 65.000' },
  { id: 3, event: 'Midnight Rock', from: 'Botani Square, Bogor', date: '5 Nov 2026', status: 'Aktif', amount: 'Rp 110.000' },
];

const menuItems = [
  { icon: CreditCard,  label: 'Riwayat Pembayaran',  desc: 'Lihat semua transaksi',          path: '/profile/payments' },
  { icon: Bell,        label: 'Notifikasi',           desc: 'Kelola preferensi notifikasi',   path: '/profile/notifications' },
  { icon: Shield,      label: 'Keamanan Akun',        desc: 'Password & privasi',             path: '/profile/security' },
  { icon: Settings,    label: 'Pengaturan',           desc: 'Preferensi aplikasi',            path: '/profile/settings' },
  { icon: HelpCircle,  label: 'Bantuan',              desc: 'FAQ & hubungi kami',             path: '/profile/help' },
];

const navigateMenu = (path) => {
  // For now: routes that are not built yet show a friendly coming-soon page
  router.push({ path, query: { from: 'profile' } });
};

const initials = computed(() => {
  const name = user.value?.name || 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});
</script>

<template>
  <div class="profile-page" v-if="authState.isLoggedIn">

    <!-- Hero Header -->
    <div class="profile-hero">
      <div class="hero-blur-bg"></div>
      <div class="container">
        <div class="profile-header">
          <div class="avatar-ring">
            <div class="avatar-circle">{{ initials }}</div>
          </div>
          <div class="profile-info">
            <span class="member-badge">✦ Member AJAK!</span>
            <h1 class="profile-name">{{ user.name }}</h1>
            <p class="profile-email">{{ user.email }}</p>
          </div>
          <button class="logout-btn" @click="handleLogout">
            <LogOut size="18" />
            <span>Keluar</span>
          </button>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div v-for="stat in stats" :key="stat.label" class="stat-pill">
            <div class="stat-icon">
              <component :is="stat.icon" size="16" />
            </div>
            <div>
              <div class="stat-val">{{ stat.value }}</div>
              <div class="stat-lbl">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container profile-body">
      <div class="profile-grid">

        <!-- Left: Recent Rides -->
        <div class="profile-card">
          <div class="card-heading">
            <Clock size="18" />
            <h2>Perjalanan Terakhir</h2>
          </div>

          <div class="ride-list">
            <div v-for="ride in recentRides" :key="ride.id" class="ride-item">
              <div class="ride-icon">
                <MapPin size="18" color="var(--primary)" />
              </div>
              <div class="ride-detail">
                <div class="ride-top">
                  <span class="ride-event">{{ ride.event }}</span>
                  <span class="ride-badge" :class="ride.status === 'Aktif' ? 'active' : 'done'">
                    {{ ride.status }}
                  </span>
                </div>
                <div class="ride-meta">
                  <span>{{ ride.from }}</span>
                  <span class="dot-sep">·</span>
                  <span>{{ ride.date }}</span>
                </div>
                <div class="ride-price">{{ ride.amount }}</div>
              </div>
            </div>
          </div>

          <button class="see-all-btn">
            Lihat Semua Perjalanan <ChevronRight size="16" />
          </button>
        </div>

        <!-- Right: Quick Menu-->
        <div class="profile-card">
          <div class="card-heading">
            <User size="18" />
            <h2>Pengaturan Akun</h2>
          </div>

          <div class="menu-list">
            <button
              v-for="item in menuItems"
              :key="item.label"
              class="menu-item"
              @click="navigateMenu(item.path)"
            >
              <div class="menu-icon">
                <component :is="item.icon" size="20" />
              </div>
              <div class="menu-text">
                <span class="menu-label">{{ item.label }}</span>
                <span class="menu-desc">{{ item.desc }}</span>
              </div>
              <ChevronRight size="18" class="menu-arrow" />
            </button>
          </div>
        </div>

      </div>

      <!-- Book CTA -->
      <div class="book-cta">
        <div class="cta-text">
          <h3>Siap untuk perjalanan berikutnya?</h3>
          <p>Temukan event dan pesan ride kamu sekarang.</p>
        </div>
        <router-link to="/" class="cta-btn">
          Cari Ride <ChevronRight size="18" />
        </router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f7f9;
  padding-bottom: 100px;
}

/* === HERO HEADER === */
.profile-hero {
  position: relative;
  background: var(--primary);
  padding: 120px 0 80px;
  overflow: hidden;
}

.hero-blur-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(0,0,0,0.1) 0%, transparent 50%);
}

.profile-header {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 28px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.avatar-ring {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 3px solid rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  color: var(--primary);
  font-size: 1.8rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -1px;
}

.profile-info { flex: 1; }
.member-badge {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.profile-name {
  font-size: 2rem;
  font-weight: 900;
  color: white;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}
.profile-email {
  color: rgba(255,255,255,0.65);
  font-size: 0.9rem;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
  margin-top: 8px;
}
.logout-btn:hover { background: rgba(255,255,255,0.22); }

/* Stats Bar */
.stats-bar {
  position: relative;
  display: flex;
  gap: 16px;
  flex-wrap: wrap; /* Ensure it wraps by default on smaller screens */
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 14px 20px;
  flex: 1;
  max-width: 180px;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}
.stat-val { font-size: 1.25rem; font-weight: 900; color: white; line-height: 1; }
.stat-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.7); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

/* === BODY === */
.profile-body { padding-top: 40px; }

.profile-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.profile-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  color: var(--primary);
}
.card-heading h2 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0;
}

/* Rides */
.ride-list { display: flex; flex-direction: column; gap: 4px; }
.ride-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  border-radius: 14px;
  transition: background 0.2s;
}
.ride-item:hover { background: rgba(201,76,76,0.03); }
.ride-icon {
  width: 38px;
  height: 38px;
  background: rgba(201,76,76,0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ride-detail { flex: 1; min-width: 0; }
.ride-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
}
.ride-event {
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ride-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}
.ride-badge.done { background: #f0f0f0; color: #888; }
.ride-badge.active { background: rgba(201,76,76,0.1); color: var(--primary); }
.ride-meta {
  font-size: 0.78rem;
  color: var(--text-light);
  display: flex;
  gap: 6px;
}
.dot-sep { opacity: 0.4; }
.ride-price { font-size: 0.82rem; font-weight: 800; color: var(--primary); margin-top: 4px; }

.see-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--primary);
  background: rgba(201,76,76,0.06);
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  transition: background 0.2s;
}
.see-all-btn:hover { background: rgba(201,76,76,0.12); }

/* Menu List */
.menu-list { display: flex; flex-direction: column; gap: 4px; }
.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 14px;
  border-radius: 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition: background 0.2s;
}
.menu-item:hover { background: rgba(201,76,76,0.04); }
.menu-icon {
  width: 40px;
  height: 40px;
  background: rgba(201,76,76,0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}
.menu-text { flex: 1; }
.menu-label { display: block; font-weight: 700; font-size: 0.875rem; color: var(--text-dark); margin-bottom: 2px; }
.menu-desc { display: block; font-size: 0.75rem; color: var(--text-light); }
.menu-arrow { color: #ccc; flex-shrink: 0; }

/* CTA */
.book-cta {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d1010 100%);
  border-radius: 24px;
  padding: 36px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.cta-text h3 {
  font-size: 1.35rem;
  font-weight: 900;
  color: white;
  margin: 0 0 6px;
}
.cta-text p { color: rgba(255,255,255,0.55); font-size: 0.9rem; margin: 0; }
.cta-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: white;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all 0.2s;
  text-decoration: none;
}
.cta-btn:hover { background: #b34242; transform: translateY(-2px); }

/* Responsive */
@media (max-width: 1024px) {
  .profile-grid { grid-template-columns: 1fr; }
  .stats-bar { flex-wrap: wrap; }
  .stat-pill { max-width: none; flex: 1; min-width: 140px; }
}
@media (max-width: 640px) {
  .profile-hero { padding: 80px 0 40px; }
  .profile-header { gap: 16px; flex-direction: column; align-items: center; text-align: center; }
  .avatar-ring { width: 80px; height: 80px; }
  .avatar-circle { width: 64px; height: 64px; font-size: 1.5rem; }
  .profile-info { width: 100%; }
  .profile-name { font-size: 1.6rem; margin-top: 8px; }
  .profile-email { font-size: 0.85rem; }
  .logout-btn { align-self: center; margin-top: 16px; width: 100%; justify-content: center; }
  
  .stats-bar { gap: 8px; }
  .stat-pill { padding: 12px 14px; min-width: calc(50% - 4px); flex: 1; }
  .stat-pill:last-child { min-width: 100%; } /* Third pill takes full width on mobile if needed */
  
  .profile-body { padding-top: 24px; padding-left: 12px; padding-right: 12px; }
  .profile-card { padding: 20px 16px; }
  
  .ride-item { padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.03); border-radius: 0; }
  .ride-item:last-child { border-bottom: none; }
  .ride-event { font-size: 0.85rem; }
  .ride-meta { font-size: 0.72rem; flex-wrap: wrap; }
  
  .book-cta { padding: 24px; flex-direction: column; text-align: center; gap: 20px; }
  .cta-text h3 { font-size: 1.2rem; }
  .cta-text p { font-size: 0.8rem; }
  .cta-btn { width: 100%; justify-content: center; padding: 12px; font-size: 0.85rem; }
}

@media (max-width: 400px) {
  .stat-pill { min-width: 100%; } /* Stack all pills on very small screens */
}
</style>
