import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import ComingSoonView from '../views/ComingSoonView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',                    name: 'home',                  component: HomeView },
    { path: '/login',               name: 'login',                 component: LoginView },
    { path: '/profile',             name: 'profile',               component: ProfileView },
    { path: '/profile/payments',    name: 'profile-payments',      component: ComingSoonView },
    { path: '/profile/notifications', name: 'profile-notif',       component: ComingSoonView },
    { path: '/profile/security',    name: 'profile-security',      component: ComingSoonView },
    { path: '/profile/settings',    name: 'profile-settings',      component: ComingSoonView },
    { path: '/profile/help',        name: 'profile-help',          component: ComingSoonView },
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
