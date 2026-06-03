<script setup>
import { ref } from 'vue';

const portfolioItems = ref([
  { id: 1, title: 'Music Concert - Jakarta', date: 'May 12, 2024', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600' },
  { id: 2, title: 'Music Festival - Bandung', date: 'May 10, 2024', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600' },
  { id: 3, title: 'Wedding Reception - Bali', date: 'May 08, 2024', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600' },
  { id: 4, title: 'Corporate Seminar - Surabaya', date: 'May 05, 2024', image: 'https://images.unsplash.com/photo-1475721027187-402ad2989a3b?auto=format&fit=crop&q=80&w=600' },
  { id: 5, title: 'Tech Conference 2024', date: 'May 02, 2024', image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?auto=format&fit=crop&q=80&w=600' },
  { id: 6, title: 'Art Exhibition - Jogja', date: 'Apr 28, 2024', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=600' },
  { id: 7, title: 'Grand Opening Store', date: 'Apr 25, 2024', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600' },
  { id: 8, title: 'Annual Gala Dinner', date: 'Apr 20, 2024', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600' },
]);

const filters = ref([
  { label: 'All', count: 56, active: true },
  { label: 'Concert', count: 24, active: false },
  { label: 'Corporate Event', count: 18, active: false },
  { label: 'Wedding', count: 8, active: false },
  { label: 'Seminar', count: 6, active: false },
]);

const activeFilter = ref('All');

const setActiveFilter = (label) => {
  activeFilter.value = label;
  filters.value.forEach(f => f.active = f.label === label);
};
</script>

<template>
  <div class="kolektix-page">
    <!-- Header -->
    <header class="kolektix-header">
      <div class="header-container">
        <div class="header-left">
          <div class="logo">kolektix</div>
          <nav class="main-nav">
            <a href="#">Event</a>
            <a href="#">Merchandise</a>
            <a href="#" class="active">Talent</a>
            <a href="#">Venue</a>
            <a href="#">Tracking</a>
          </nav>
        </div>
        <div class="header-right">
          <button class="icon-btn search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <button class="btn-create">Create Event</button>
          <div class="lang-selector">
            <img src="https://flagcdn.com/w20/id.png" alt="ID">
          </div>
          <div class="profile-avatar">
            <img src="https://i.pravatar.cc/150?u=aldi" alt="Profile">
          </div>
        </div>
      </div>
    </header>

    <main class="content-container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <span>Home</span> &gt; <span>Talent</span> &gt; <span>Aldi Ramadhan</span> &gt; <span class="current">Portfolio</span>
      </nav>

      <!-- Page Title & Subtitle -->
      <div class="page-header">
        <div class="title-section">
          <div class="title-with-btn">
            <h1>Portfolio</h1>
            <button class="btn-see-all">See All</button>
          </div>
          <p class="subtitle">A collection of event documentation by Aldi Ramadhan</p>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="filters-row">
        <div class="filter-pills">
          <button 
            v-for="filter in filters" 
            :key="filter.label"
            :class="['filter-pill', { active: filter.active }]"
            @click="setActiveFilter(filter.label)"
          >
            {{ filter.label }} ({{ filter.count }})
          </button>
        </div>
        <div class="sort-dropdown">
          <span>Recent</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Left Content: Portfolio Grid -->
        <section class="portfolio-section">
          <div class="portfolio-grid">
            <div v-for="item in portfolioItems" :key="item.id" class="portfolio-card">
              <div class="card-image">
                <img :src="item.image" :alt="item.title">
              </div>
              <div class="card-info">
                <h3>{{ item.title }}</h3>
                <p class="date">{{ item.date }}</p>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <button class="page-btn prev">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button class="page-num active">1</button>
            <button class="page-num">2</button>
            <button class="page-num">3</button>
            <button class="page-num">4</button>
            <button class="page-num">5</button>
            <span class="page-dots">...</span>
            <button class="page-num">7</button>
            <button class="page-btn next">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </section>

        <!-- Right Content: Sidebar -->
        <aside class="sidebar">
          <!-- Mini Profile Card -->
          <div class="sidebar-card profile-card">
            <div class="profile-header">
              <div class="profile-info">
                <div class="name-badge">
                  <h3>Aldi Ramadhan</h3>
                  <svg class="verified-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1A73E8" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </div>
                <p class="role">Photographer</p>
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-label">Rating</span>
                <span class="stat-value">⭐ 4.9 <span class="review-count">(128 reviews)</span></span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Location</span>
                <span class="stat-value">Jakarta, Indonesia</span>
              </div>
            </div>
            <button class="btn-sidebar-primary">View Talent Profile</button>
          </div>

          <!-- Price Card -->
          <div class="sidebar-card price-card">
            <h4>Event Photography</h4>
            <div class="price-info">
              <p class="price-start">Starting from</p>
              <p class="price-amount">Rp 1,500,000 <span>/ event</span></p>
            </div>
            <button class="btn-sidebar-outline">View Service Package</button>
          </div>

          <!-- Inquiry Card -->
          <div class="sidebar-card inquiry-card">
            <h4>Need Special Services?</h4>
            <p>Customize your event documentation needs with Aldi.</p>
            <button class="btn-sidebar-outline">Send Message</button>
          </div>

          <!-- Important Info Card -->
          <div class="sidebar-card info-card">
            <h4>Important Information</h4>
            <ul class="info-list">
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span>Transportation Fees</span>
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                <span>Payment System</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Reset & Base Styles */
.kolektix-page {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  background-color: #FFFFFF;
  min-height: 100vh;
  color: #1a1a1a;
}

/* Header Styles */
.kolektix-header {
  background-color: #0B192E; /* Dark Navy */
  color: white;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 48px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.main-nav {
  display: flex;
  gap: 32px;
}

.main-nav a {
  color: #a0aec0;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: color 0.2s;
}

.main-nav a.active, .main-nav a:hover {
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
}

.btn-create {
  background-color: white;
  color: #0B192E;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.lang-selector img {
  width: 24px;
  height: auto;
  border-radius: 2px;
}

.profile-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

/* Content Layout */
.content-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px;
}

.breadcrumb {
  font-size: 14px;
  color: #718096;
  margin-bottom: 32px;
}

.breadcrumb span {
  cursor: pointer;
}

.breadcrumb .current {
  color: #1a1a1a;
  font-weight: 600;
}

.page-header {
  margin-bottom: 32px;
}

.title-section h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 0;
}

.title-with-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.btn-see-all {
  background-color: #1A73E8;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-see-all:hover {
  background-color: #1557b0;
}

.subtitle {
  color: #718096;
  font-size: 16px;
}

/* Filters */
.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.filter-pills {
  display: flex;
  gap: 12px;
}

.filter-pill {
  padding: 8px 20px;
  border-radius: 99px;
  border: 1px solid #e2e8f0;
  background: white;
  font-weight: 600;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill.active {
  border-color: #1A73E8;
  color: #1A73E8;
  background-color: rgba(26, 115, 232, 0.05);
}

.sort-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
}

/* Main Grid Layout */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
}

/* Portfolio Grid */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.portfolio-card {
  transition: transform 0.2s;
  cursor: pointer;
}

.portfolio-card:hover {
  transform: translateY(-4px);
}

.card-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  background-color: #f7fafc;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-info .date {
  font-size: 13px;
  color: #718096;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
}

.sidebar-card h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.profile-header {
  margin-bottom: 20px;
}

.name-badge {
  display: flex;
  align-items: center;
  gap: 6px;
}

.profile-card h3 {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 0;
}

.role {
  color: #718096;
  font-size: 14px;
  margin-top: 4px;
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.stat-label {
  color: #718096;
}

.stat-value {
  font-weight: 600;
}

.review-count {
  font-weight: 400;
  color: #718096;
  font-size: 12px;
}

.price-info {
  margin-bottom: 24px;
}

.price-start {
  font-size: 13px;
  color: #718096;
  margin-bottom: 4px;
}

.price-amount {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1a;
}

.price-amount span {
  font-size: 14px;
  font-weight: 500;
  color: #718096;
}

.inquiry-card p {
  font-size: 14px;
  color: #718096;
  margin-bottom: 20px;
}

.info-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.btn-sidebar-primary {
  width: 100%;
  padding: 12px;
  background-color: #1A73E8;
  color: white;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.btn-sidebar-outline {
  width: 100%;
  padding: 12px;
  background-color: transparent;
  color: #1A73E8;
  border: 2px solid #1A73E8;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Pagination */
.pagination {
  margin-top: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.page-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-num.active {
  background-color: #1A73E8;
  color: white;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  cursor: pointer;
}

.page-dots {
  color: #cbd5e0;
  margin: 0 4px;
}

/* Responsive */
@media (max-width: 1200px) {
  .portfolio-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .header-left {
    gap: 20px;
  }
  
  .main-nav {
    display: none;
  }
  
  .portfolio-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-pills {
    overflow-x: auto;
    padding-bottom: 8px;
    width: 100%;
  }
  
  .filter-pill {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .portfolio-grid {
    grid-template-columns: 1fr;
  }
  
  .header-right .btn-create {
    display: none;
  }
}
</style>
