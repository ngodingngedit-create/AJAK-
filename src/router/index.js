import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import ComingSoonView from '../views/ComingSoonView.vue'
import EventsView from '../views/EventsView.vue'
import BookingView from '../views/BookingView.vue'
import ConfirmationView from '../views/ConfirmationView.vue'
import TransactionView from '../views/TransactionView.vue'
import { authState } from '../store/auth'

import HelpView from '../views/HelpView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/events', name: 'events', component: EventsView },
    { path: '/booking/:slug', name: 'booking', component: BookingView },
    { path: '/shuttlebus/:slug', name: 'shuttlebus-detail', component: () => import('../views/ShuttleBusDetailView.vue') },
    { path: '/transaksi', name: 'transaksi', component: TransactionView },
    { path: '/confirmation', name: 'confirmation', component: ConfirmationView },
    { path: '/login', name: 'login', component: LoginView },
    { 
      path: '/dashboard', 
      name: 'dashboard', 
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    { path: '/shuttle-invoice/:invoice_no', name: 'invoice', component: () => import('../views/InvoiceView.vue') },
    { path: '/rental-mobil', name: 'rental-mobil', component: ComingSoonView },
    { path: '/hotel', name: 'hotel', component: ComingSoonView },
    { path: '/tiket-pesawat', name: 'tiket-pesawat', component: ComingSoonView },
    { path: '/coming-soon', name: 'coming-soon', component: ComingSoonView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/profile/payments', name: 'profile-payments', component: ComingSoonView },
    { path: '/profile/notifications', name: 'profile-notif', component: ComingSoonView },
    { path: '/profile/security', name: 'profile-security', component: ComingSoonView },
    { path: '/profile/settings', name: 'profile-settings', component: ComingSoonView },
    { path: '/profile/help', redirect: '/help' },
    { path: '/help', name: 'help', component: HelpView },
    { path: '/portfolio', name: 'portfolio', component: () => import('../views/PortfolioView.vue') },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
})

// Navigation guard
router.beforeEach((to, from, next) => {
  console.log('Router guard - navigating to:', to.path);
  console.log('Router guard - authState.isLoggedIn:', authState.isLoggedIn);
  console.log('Router guard - requires auth:', to.meta.requiresAuth);
  
  if (to.meta.requiresAuth && !authState.isLoggedIn) {
    // Redirect to login if route requires auth and user is not logged in
    console.log('Redirecting to login - user not authenticated');
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && authState.isLoggedIn) {
    // Redirect to dashboard if already logged in and trying to access login
    console.log('Redirecting to dashboard - user already logged in');
    next({ name: 'dashboard' });
  } else {
    console.log('Allowing navigation');
    next();
  }
});

export default router
