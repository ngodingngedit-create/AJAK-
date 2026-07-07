<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { X, Instagram, Compass, ShieldCheck } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();



const isOnHome = computed(() => route.path === '/');

const handleFooterNav = (targetId) => {
  if (targetId === 'home') {
    router.push('/');
    return;
  }
  if (targetId === 'events') {
    router.push('/events');
    return;
  }
  
  // Scroll sections
  if (!isOnHome.value) {
    router.push('/').then(() => {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    });
    return;
  }
  const el = document.getElementById(targetId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <footer class="footer">
    <div class="container footer-container">
      <div class="footer-grid">
        <!-- Column 1: Brand -->
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <router-link to="/">
              <img src="/AJAKLogo/LOGO.png" alt="AJAK! Logo" class="footer-logo-img" />
            </router-link>
            <span class="logo-tagline">Antar Jemput Anak Konser</span>
          </div>
          <p class="brand-desc">
           platform perjalanan untuk seluruh acara/event di indonesia, kami menyediakan solusi shuttle bus yang aman, nyaman dan terpercaya untuk mengantar anda ke event/acara impian.
          </p>
          <div class="social-links">
            <a href="#" class="social-btn" aria-label="X">
              <X class="social-icon" />
            </a>
            <a href="#" class="social-btn" aria-label="TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
            <a href="#" class="social-btn" aria-label="Instagram">
              <Instagram class="social-icon" />
            </a>
          </div>
        </div>

        <!-- Grouped Columns 2 & 3 -->
        <div class="footer-nav-columns">
          <!-- Tentang AJAK! (Bantuan & Legalitas) -->
          <div class="footer-col">
            <h4 class="footer-col-title">
              <ShieldCheck class="title-icon" />
              Tentang AJAK!
            </h4>
            <div class="legal-buttons">
              <router-link 
                to="/help?tab=syarat"
                :class="['legal-tab-btn', { active: $route.path === '/help' && $route.query.tab === 'syarat' }]"
              >
                Syarat & Ketentuan
              </router-link>
              <router-link 
                to="/help?tab=kebijakan"
                :class="['legal-tab-btn', { active: $route.path === '/help' && $route.query.tab === 'kebijakan' }]"
              >
                Kebijakan Privasi
              </router-link>
              <router-link 
                to="/help?tab=cara"
                :class="['legal-tab-btn', { active: $route.path === '/help' && $route.query.tab === 'cara' }]"
              >
                Cara Pembelian Tiket
              </router-link>
            </div>
          </div>

          <!-- Tautan Cepat -->
          <div class="footer-col">
            <h4 class="footer-col-title">
              <Compass class="title-icon" />
              Tautan Cepat
            </h4>
            <ul class="footer-links">
              <li><a href="#" @click.prevent="handleFooterNav('home')">Beranda</a></li>
              <li><a href="#" @click.prevent="handleFooterNav('events')">Event</a></li>
              <li><a href="#" @click.prevent="handleFooterNav('services')">Layanan</a></li>
              <li><a href="#" @click.prevent="handleFooterNav('discovery')">Penjemputan</a></li>
              <li><a href="#" @click.prevent="handleFooterNav('about')">About</a></li>
            </ul>
          </div>
        </div>
      </div>

      <hr class="footer-divider" />

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <p class="copyright">© 2025 AJAK! Transportation. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #ffffff;
  color: var(--text-light);
  padding: 60px 0 30px;
  border-top: 1.5px solid rgba(201, 76, 76, 0.19); /* Low opacity border */
  font-size: 0.95rem;
  margin-top: auto;
}

.footer-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 main columns on desktop */
  gap: 60px; /* Generous gap between Brand and Nav columns */
}

.footer-nav-columns {
  display: flex;
  justify-content: flex-start;
  gap: 96px; /* Even wider gap between Column 2 and 3 */
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 160px;
}

.brand-col {
  padding-right: 40px;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.footer-logo-img {
  height: 42px;
  width: auto;
  object-fit: contain;
  margin-bottom: 6px;
  align-self: flex-start;
}

.logo-tagline {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b6b76;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: -2px;
}

.brand-desc {
  line-height: 1.6;
  font-size: 0.9rem;
  color: var(--text-light);
}

.social-links {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(201, 76, 76, 0.05);
  border: 1px solid rgba(201, 76, 76, 0.12);
  color: var(--text-light);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.social-btn:hover {
  background-color: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(201, 76, 76, 0.2);
}

.social-icon {
  width: 18px;
  height: 18px;
}

.footer-col-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.title-icon {
  width: 18px;
  height: 18px;
  color: var(--primary);
}

.footer-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  color: var(--text-light);
  transition: all 0.2s ease;
  font-weight: 500;
}

.footer-links a:hover {
  color: var(--primary);
  padding-left: 4px;
}

.legal-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.legal-tab-btn {
  color: var(--text-light);
  background: none;
  border: none;
  padding: 0;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  transition: all 0.2s ease;
  cursor: pointer;
}

.legal-tab-btn:hover {
  color: var(--primary);
  padding-left: 4px;
}

.legal-tab-btn.active {
  color: var(--primary);
  font-weight: 600;
}

.legal-tab-btn.active:hover {
  color: #ff6b6b;
  padding-left: 0;
}

.footer-divider {
  border: 0;
  height: 1.5px;
  background: var(--primary); /* Visible divider using primary color */
  opacity: 0.10; /* Low opacity divider */
  margin: 10px 0 0;
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #6b6b76;
}

.copyright {
  margin: 0;
}

/* Responsive Rules */
@media (max-width: 991px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .brand-col {
    padding-right: 0;
  }
  
  .footer-nav-columns {
    justify-content: space-between;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 50px 0 20px;
  }

  .footer-nav-columns {
    flex-direction: column;
    gap: 30px;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
