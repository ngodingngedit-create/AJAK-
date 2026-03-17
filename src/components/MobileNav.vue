<script setup>
import { Home, Calendar, MapPin, User, CarFront } from 'lucide-vue-next';
</script>

<template>
  <nav class="mobile-nav">
    <div class="nav-container">
      <router-link to="/" class="nav-item">
        <Home size="24" />
        <span>Home</span>
      </router-link>
      
      <a href="#vibes" class="nav-item">
        <Calendar size="24" />
        <span>Events</span>
      </a>

      <div class="fab-container">
        <div class="fab-btn">
          <CarFront size="28" color="white" />
        </div>
      </div>

      <a href="#discovery" class="nav-item">
        <MapPin size="24" />
        <span>Map</span>
      </a>

      <router-link to="/login" class="nav-item">
        <User size="24" />
        <span>Profile</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: white;
  box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
  z-index: 1000;
  border-top: 1px solid #eee;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  position: relative;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #888;
  gap: 4px;
}

.nav-item.router-link-active {
  color: var(--primary);
}

.nav-item span {
  font-size: 0.7rem;
  font-weight: 700;
}

.fab-container {
  position: relative;
  width: 60px;
  height: 60px;
  margin-top: -40px;
}

.fab-btn {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(201, 76, 76, 0.4);
  border: 4px solid white;
}

@media (max-width: 768px) {
  .mobile-nav {
    display: block;
  }
}
</style>
