<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  Search, 
  X, 
  BookOpen, 
  Menu, 
  ShieldCheck,
  Compass,
  FileText
} from 'lucide-vue-next';

const route = useRoute();

// Top Navigation Categories
const topCategories = [
  { id: 'syarat', label: 'Syarat & Ketentuan', icon: FileText },
  { id: 'kebijakan', label: 'Kebijakan Privasi', icon: ShieldCheck },
  { id: 'cara', label: 'Cara Pembelian', icon: Compass }
];

const activeTopCategory = ref('syarat');

// Left Sidebar State
const searchFilter = ref('');
const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);

// Tree Accordion Menu Data (Labels updated to match exact page titles)
const menuData = ref([
  {
    id: 'syarat-ketentuan',
    label: 'Syarat & Ketentuan',
    isOpen: true,
    children: [
      {
        id: 'sk-umum',
        label: 'Ketentuan Umum',
        isOpen: true,
        children: [
          { id: 'sk-umum-daftar', label: 'Pendaftaran Akun & Keanggotaan' },
          { id: 'sk-umum-tanggung', label: 'Batasan Tanggung Jawab ' }
        ]
      },
      {
        id: 'sk-pembatalan',
        label: 'Pembatalan Perjalanan',
        isOpen: true,
        children: [
          { id: 'sk-batal-waktu', label: 'Batas Waktu Pembatalan Perjalanan' },
          { id: 'sk-batal-biaya', label: 'Biaya Administrasi Pembatalan' }
        ]
      },
      {
        id: 'sk-refund',
        label: 'Pengembalian Dana (Refund)',
        isOpen: true,
        children: [
          { id: 'sk-refund-proses', label: 'Proses Pengajuan Refund Tiket' },
          { id: 'sk-refund-syarat', label: 'Syarat & Ketentuan Refund Khusus' }
        ]
      }
    ]
  },
  {
    id: 'kebijakan-privasi',
    label: 'Kebijakan Privasi',
    isOpen: true,
    children: [
      {
        id: 'privasi-kumpul',
        label: 'Pengumpulan Data',
        isOpen: true,
        children: [
          { id: 'privasi-kumpul-apa', label: 'Jenis Data yang Kami Kumpulkan' },
          { id: 'privasi-kumpul-cara', label: 'Metode Pengumpulan Data Informasi' }
        ]
      },
      {
        id: 'privasi-aman',
        label: 'Perlindungan Data',
        isOpen: true,
        children: [
          { id: 'privasi-aman-lindungi', label: 'Metode Keamanan & Perlindungan Data' },
          { id: 'privasi-aman-share', label: 'Pembagian Data dengan Pihak Ketiga' }
        ]
      }
    ]
  },
  {
    id: 'cara-beli',
    label: 'Cara Pembelian Tiket',
    isOpen: true,
    children: [
      {
        id: 'beli-langkah',
        label: 'Panduan Pemesanan',
        isOpen: true,
        children: [
          { id: 'beli-langkah-pilih', label: 'Langkah 1: Memilih Event dan seat Shuttle' },
          { id: 'beli-langkah-bayar', label: 'Langkah 2: Proses Pembayaran Tiket' },
          { id: 'beli-langkah-tiket', label: 'Langkah 3: Pengambilan E-Tiket Resmi' }
        ]
      },
      {
        id: 'beli-metode',
        label: 'Metode Pembayaran',
        isOpen: true,
        children: [
          { id: 'beli-metode-va', label: 'Panduan Pembayaran Virtual Account' },
          { id: 'beli-metode-ewallet', label: 'Panduan Pembayaran Dompet Digital (E-Wallet)' }
        ]
      }
    ]
  }
]);

// Document Content Database
const docsDatabase = {
  // Category 1: Syarat & Ketentuan
  'sk-umum-daftar': {
    title: 'Pendaftaran Akun & Keanggotaan',
    sections: [
      { id: 'persyaratan-registrasi', title: 'Persyaratan Registrasi', content: 'Setiap pelanggan wajib melakukan registrasi akun menggunakan data diri yang valid, termasuk nama lengkap sesuai kartu identitas fisik, alamat email aktif, dan nomor telepon yang terhubung dengan layanan WhatsApp.' },
      { id: 'keamanan-kredensial', title: 'Kerahasiaan Akun', content: 'Pelanggan bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi akun masing-masing. AJAK! tidak akan pernah meminta kata sandi Anda melalui media apa pun. Laporkan ke customer service jika Anda mendeteksi penyalahgunaan akun.' },
      { id: 'verifikasi-kontak', title: 'Verifikasi Kontak', content: 'Sebelum pemesanan pertama dapat diproses, sistem kami akan mengirimkan kode verifikasi (OTP) ke nomor telepon Anda. Akun yang terverifikasi berhak mendapatkan poin loyalitas yang dapat ditukarkan dengan diskon tiket shuttle bus.' }
    ]
  },
  'sk-umum-tanggung': {
    title: 'Batasan Tanggung Jawab platform perjalanan untuk seluruh acara/event di indonesia, kami menyediakan solusi shuttle bus yang aman, nyaman dan terpercaya untuk mengantar anda ke event/acara impian',
    sections: [
      { id: 'keterlambatan-jalan', title: 'Kemacetan & Kondisi Jalan', content: 'AJAK! berupaya semaksimal mungkin untuk tiba di tujuan sesuai jadwal. Namun, kami tidak bertanggung jawab atas keterlambatan yang diakibatkan oleh bencana alam, kemacetan lalu lintas luar biasa, kecelakaan jalan raya, penutupan jalan oleh aparat penegak hukum, maupun force majeure lainnya.' },
      { id: 'barang-hilang', title: 'Keamanan Barang Bawaan', content: 'Penyelenggara tidak bertanggung jawab atas hilangnya barang berharga milik penumpang selama perjalanan berlangsung. Setiap penumpang dihimbau untuk menjaga barang bawaannya masing-masing di dalam kabin bus.' }
    ]
  },
  'sk-batal-waktu': {
    title: 'Batas Waktu Pembatalan Perjalanan',
    sections: [
      { id: 'batas-h-3', title: 'Pembatalan H-3 Keberangkatan', content: 'Pembatalan perjalanan shuttle bus yang diajukan selambat-lambatnya 3 hari (72 jam) sebelum jadwal keberangkatan akan mendapatkan pengembalian dana penuh setelah dikurangi biaya administrasi platform perjalanan untuk seluruh acara/event di indonesia, kami menyediakan solusi shuttle bus yang aman, nyaman dan terpercaya untuk mengantar anda ke event/acara impian.' },
      { id: 'pembatalan-terlambat', title: 'Pembatalan Kurang dari 72 Jam', content: 'Untuk pengajuan pembatalan yang dilakukan kurang dari 72 jam sebelum jam keberangkatan, tiket dinyatakan hangus dan tidak dapat dikembalikan atau dijadwalkan ulang (reschedule) dengan alasan apa pun.' }
    ]
  },
  'sk-batal-biaya': {
    title: 'Biaya Administrasi Pembatalan',
    sections: [
      { id: 'admin-charge', title: 'Persentase Potongan Admin', content: 'Setiap pembatalan tiket shuttle bus yang disetujui akan dikenakan biaya pembatalan administrasi sebesar Rp15.000 per tiket untuk memproses pengembalian dana melalui gerbang pembayaran (payment gateway).' },
      { id: 'durasi-proses', title: 'Durasi Pengembalian Dana', content: 'Dana refund akan ditransfer ke rekening bank atau e-wallet yang digunakan saat pemesanan awal dalam kurun waktu 3 hingga 5 hari kerja setelah pengajuan disetujui oleh sistem kami.' }
    ]
  },
  'sk-refund-proses': {
    title: 'Proses Pengajuan Refund Tiket',
    sections: [
      { id: 'langkah-pengajuan', title: 'Langkah-langkah Pengajuan', content: 'Untuk mengajukan refund, silakan masuk ke halaman Riwayat Transaksi di akun Anda, pilih invoice tiket yang ingin dibatalkan, kemudian klik tombol "Ajukan Pembatalan/Refund" dan lengkapi alasan pengajuan Anda.' },
      { id: 'persetujuan-sistem', title: 'Verifikasi dan Persetujuan', content: 'Tim operasional AJAK! akan memverifikasi waktu pengajuan Anda terhadap syarat batas waktu pembatalan. Status persetujuan atau penolakan refund akan dikirimkan otomatis ke WhatsApp Anda.' }
    ]
  },
  'sk-refund-syarat': {
    title: 'Syarat & Ketentuan Refund Khusus',
    sections: [
      { id: 'konser-batal', title: 'Pembatalan Konser oleh Promotor', content: 'Apabila pihak penyelenggara konser/festival membatalkan acaranya secara resmi, AJAK! akan mengembalikan 100% biaya tiket shuttle bus Anda tanpa potongan biaya administrasi platform perjalanan untuk seluruh acara/event di indonesia, kami menyediakan solusi shuttle bus yang aman, nyaman dan terpercaya untuk mengantar anda ke event/acara impian.' },
      { id: 'keadaan-kahar', title: 'Pembatalan Akibat Keadaan Darurat', content: 'Refund darurat di luar batas waktu reguler hanya dapat dipertimbangkan apabila terjadi keadaan duka keluarga inti atau kondisi medis darurat dengan melampirkan surat bukti resmi.' }
    ]
  },

  // Category 2: Kebijakan Privasi
  'privasi-kumpul-apa': {
    title: 'Jenis Data yang Kami Kumpulkan',
    sections: [
      { id: 'data-profil', title: 'Data Profil Pengguna', content: 'Kami mengumpulkan informasi yang Anda berikan secara langsung saat pendaftaran, seperti nama lengkap, alamat email, nomor telepon genggam, tanggal lahir, dan foto profil (opsional).' },
      { id: 'data-lokasi', title: 'Data Lokasi & Perangkat', content: 'Untuk memberikan rekomendasi titik pick-up shuttle terdekat, kami dapat mengumpulkan data lokasi perangkat GPS Anda setelah mendapatkan izin akses lokasi dari peramban atau ponsel Anda.' }
    ]
  },
  'privasi-kumpul-cara': {
    title: 'Metode Pengumpulan Data Informasi',
    sections: [
      { id: 'registrasi-langsung', title: 'Pengisian Formulir Mandiri', content: 'Sebagian besar data dikumpulkan langsung saat Anda mengisi formulir registrasi, memperbarui halaman profil, atau mengisi data penumpang pada formulir pemesanan tiket shuttle.' },
      { id: 'cookie-analisis', title: 'Penggunaan Cookie Sistem', content: 'Kami menggunakan cookie sesi dan cookie pelacakan analisis untuk mengingat preferensi rute shuttle Anda, serta memahami interaksi navigasi Anda guna meningkatkan performa teknis platform perjalanan untuk seluruh acara/event di indonesia, kami menyediakan solusi shuttle bus yang aman, nyaman dan terpercaya untuk mengantar anda ke event/acara impian.' }
    ]
  },
  'privasi-aman-lindungi': {
    title: 'Metode Keamanan & Perlindungan Data',
    sections: [
      { id: 'enkripsi-ssl', title: 'Enkripsi Data SSL/TLS', content: 'Semua data transaksi keuangan dan data pribadi yang dikirimkan antara perangkat Anda dan server kami dienkripsi menggunakan protokol Secure Sockets Layer (SSL) standar industri.' },
      { id: 'keamanan-server', title: 'Audit Keamanan Server Berkala', content: 'Server database kami dilindungi oleh firewall berlapis dan dipantau 24/7 dari upaya akses tidak sah. Audit keamanan internal dilakukan secara berkala untuk menutup potensi kerentanan sistem.' }
    ]
  },
  'privasi-aman-share': {
    title: 'Pembagian Data dengan Pihak Ketiga',
    sections: [
      { id: 'mitra-operasional', title: 'Koordinasi Operasional Shuttle', content: 'AJAK! membagikan informasi nama penumpang dan nomor kontak kepada kru pengemudi bus shuttle semata-mata untuk memfasilitasi koordinasi titik penjemputan dan absen keberangkatan.' },
      { id: 'transaksi-gateway', title: 'Layanan Gateway Pembayaran', content: 'Informasi transaksi Anda diteruskan secara aman ke payment gateway terlisensi (seperti Xendit) untuk memverifikasi pembayaran Anda. Kami tidak menyimpan data kartu kredit atau kredensial e-wallet Anda.' }
    ]
  },

  // Category 3: Cara Beli
  'beli-langkah-pilih': {
    title: 'Langkah 1: Memilih Event dan seat Shuttle',
    sections: [
      { id: 'pencarian-event', title: 'Cari Konser atau Festival', content: 'Buka menu "Event" untuk menjelajahi daftar konser musik aktif. Anda juga dapat mengetik nama artis atau kota tujuan pada kolom pencarian di halaman utama.' },
      { id: 'penentuan-titik', title: 'Pilih Shuttle Bus dan Titik Jemput', content: 'Klik tombol "Pesan Shuttle" pada event pilihan. Tentukan kota asal, lokasi titik jemput (pick-up point) terdekat, serta jam keberangkatan bus yang sesuai dengan jadwal luang Anda.' },
      { id: 'pemilihan-seat', title: 'Pilih Nomor seat Bus', content: 'Gunakan layout denah bus interaktif untuk memilih seat shuttle yang tersedia. seat yang berwarna merah menunjukkan telah dipesan oleh orang lain, pilih seat berwarna hijau untuk dipesan.' }
    ]
  },
  'beli-langkah-bayar': {
    title: 'Langkah 2: Proses Pembayaran Tiket',
    sections: [
      { id: 'input-data-penumpang', title: 'Lengkapi Informasi Penumpang', content: 'Isi nama lengkap, alamat email, dan nomor WhatsApp penumpang bus. Harap pastikan data yang diinput sesuai dengan kartu identitas resmi (KTP/SIM).' },
      { id: 'proses-checkout', title: 'Checkout & Pembayaran Online', content: 'Pilih metode pembayaran yang tersedia. Kami mendukung transfer bank otomatis (Virtual Account Mandiri, BCA, BRI, BNI) serta dompet digital (GoPay, OVO, ShopeePay).' },
      { id: 'verifikasi-otomatis', title: 'Verifikasi Otomatis Keuangan', content: 'Sistem kami terintegrasi secara otomatis dengan bank terkait. Harap selesaikan pembayaran sebelum batas waktu checkout (15 menit) habis agar pesanan tidak dibatalkan otomatis.' }
    ]
  },
  'beli-langkah-tiket': {
    title: 'Langkah 3: Pengambilan E-Tiket Resmi',
    sections: [
      { id: 'cek-riwayat', title: 'Akses Menu Riwayat Transaksi', content: 'Setelah pembayaran terverifikasi, e-tiket digital Anda akan otomatis terbit. Masuk ke halaman profil, buka menu "Riwayat Transaksi", lalu pilih tiket shuttle terkait.' },
      { id: 'cetak-pdf', title: 'Unduh E-Tiket PDF', content: 'Klik tombol "Download Tiket" untuk menyimpan berkas e-tiket PDF ke perangkat Anda. E-tiket ini juga secara paralel dikirimkan ke alamat email terdaftar Anda.' }
    ]
  },
  'beli-metode-va': {
    title: 'Panduan Pembayaran Virtual Account',
    sections: [
      { id: 'cara-va-bca', title: 'Virtual Account BCA', content: 'Pilih BCA Virtual Account saat checkout. Masuk ke m-BCA, pilih transfer, lalu klik BCA Virtual Account. Masukkan nomor VA yang tertera, periksa detail nama pemesan, dan ketik PIN m-BCA Anda untuk menyelesaikan.' },
      { id: 'cara-va-bri', title: 'Virtual Account Mandiri / BNI / BRI', content: 'Gunakan nomor VA Mandiri di aplikasi Livin\' Mandiri pada menu Pembayaran > Multi Payment > Xendit, atau gunakan fitur transfer antarrekening virtual account pada layanan m-banking bank pilihan Anda lainnya.' }
    ]
  },
  'beli-metode-ewallet': {
    title: 'Panduan Pembayaran Dompet Digital (E-Wallet)',
    sections: [
      { id: 'bayar-gopay', title: 'Pembayaran Via GoPay / ShopeePay', content: 'Saat memesan di ponsel, sistem akan mengarahkan (auto-redirect) Anda langsung ke aplikasi Gojek atau Shopee. Konfirmasi nominal transaksi dan selesaikan pembayaran di dalam aplikasi dompet digital Anda.' },
      { id: 'bayar-scan-qr', title: 'Scan QRIS di Perangkat Desktop', content: 'Jika memesan melalui desktop, sistem akan menampilkan kode QRIS dinamis. Cukup buka aplikasi perbankan atau e-wallet Anda, pilih opsi "Scan QR", arahkan kamera ke layar desktop, dan lakukan pembayaran.' }
    ]
  }
};

const activeDocId = ref('sk-umum-daftar');

// Computed Active top category label and structure
const activeTopCategoryLabel = computed(() => {
  const cat = topCategories.find(c => c.id === activeTopCategory.value);
  return cat ? cat.label : '';
});

const activeCategoryData = computed(() => {
  const activeTreeId = activeTopCategory.value === 'syarat' 
    ? 'syarat-ketentuan' 
    : activeTopCategory.value === 'kebijakan' 
      ? 'kebijakan-privasi' 
      : 'cara-beli';
  return menuData.value.find(tree => tree.id === activeTreeId) || menuData.value[0];
});

// Left Sidebar Accordion - Filters based on activeTopCategory AND searchFilter
const filteredMenu = computed(() => {
  const activeTreeId = activeTopCategory.value === 'syarat' 
    ? 'syarat-ketentuan' 
    : activeTopCategory.value === 'kebijakan' 
      ? 'kebijakan-privasi' 
      : 'cara-beli';
      
  const activeTree = menuData.value.find(tree => tree.id === activeTreeId);
  if (!activeTree) return [];
  
  const activeL2Nodes = activeTree.children;
  
  if (!searchFilter.value.trim()) return activeL2Nodes;
  
  const query = searchFilter.value.toLowerCase();
  
  return activeL2Nodes.map(l2 => {
    // Filter L3 children
    const filteredL3 = l2.children.filter(l3 => 
      l3.label.toLowerCase().includes(query)
    );
    
    const l2Match = l2.label.toLowerCase().includes(query);
    
    if (filteredL3.length > 0 || l2Match) {
      return {
        ...l2,
        isOpen: true, // auto-expand on search match
        children: filteredL3.length > 0 ? filteredL3 : l2.children
      };
    }
    return null;
  }).filter(Boolean);
});

// Toggle Level 2 Category (which is now L1 in sidebar view)
const toggleL2 = (subItem) => {
  subItem.isOpen = !subItem.isOpen;
};

// Top bar navigation click handler (syncs top bar category tab with left sidebar root)
const handleTopCategorySelect = (catId) => {
  activeTopCategory.value = catId;
  
  if (catId === 'syarat') {
    expandAndActivate('syarat-ketentuan', 'sk-umum', 'sk-umum-daftar');
  } else if (catId === 'kebijakan') {
    expandAndActivate('kebijakan-privasi', 'privasi-kumpul', 'privasi-kumpul-apa');
  } else if (catId === 'cara') {
    expandAndActivate('cara-beli', 'beli-langkah', 'beli-langkah-pilih');
  }
  
  // Scroll page back to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const expandAndActivate = (l1Id, l2Id, leafId) => {
  menuData.value.forEach(l1 => {
    if (l1.id === l1Id) {
      l1.isOpen = true;
      const l2 = l1.children.find(c => c.id === l2Id);
      if (l2) l2.isOpen = true;
    } else {
      l1.isOpen = false;
    }
  });
  activeDocId.value = leafId;
};

const toggleSidebar = () => {
  if (window.innerWidth <= 991) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value;
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }
};

// Select sidebar leaf and scroll smoothly to its section in the main content card
const selectDoc = (docId) => {
  activeDocId.value = docId;
  scrollToSection(docId);
};

// Smooth Scroll to Section
const scrollToSection = (sectionId) => {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Helper to check sections for a document
const getDocSections = (docId) => {
  return docsDatabase[docId] ? docsDatabase[docId].sections : [];
};

// Scroll Spy to highlight active sidebar menu item based on page scroll position
const onScroll = () => {
  const activeTreeId = activeTopCategory.value === 'syarat' 
    ? 'syarat-ketentuan' 
    : activeTopCategory.value === 'kebijakan' 
      ? 'kebijakan-privasi' 
      : 'cara-beli';
      
  const activeTree = menuData.value.find(tree => tree.id === activeTreeId);
  if (!activeTree) return;
  
  let currentActiveId = activeDocId.value;
  
  // Check which L3 article is currently intersecting the viewport
  for (const l2 of activeTree.children) {
    for (const l3 of l2.children) {
      const el = document.getElementById(l3.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Sits near top of page (below fixed navbar + subheader)
        if (rect.top <= 220 && rect.bottom >= 220) {
          currentActiveId = l3.id;
          break;
        }
      }
    }
  }
  
  if (currentActiveId !== activeDocId.value) {
    activeDocId.value = currentActiveId;
  }
};

// Handle route queries (for links coming from footer)
const handleRouteQueries = () => {
  const tab = route.query.tab;
  if (!tab) return;
  
  if (tab === 'syarat') {
    handleTopCategorySelect('syarat');
  } else if (tab === 'kebijakan') {
    handleTopCategorySelect('kebijakan');
  } else if (tab === 'cara') {
    handleTopCategorySelect('cara');
  }
};

onMounted(() => {
  handleRouteQueries();
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

watch(() => route.query.tab, () => {
  handleRouteQueries();
});
</script>

<template>
  <div class="help-page-wrapper">
    <!-- Top Nav Category Header (Sticky Category Bar) -->
    <div class="help-top-header">
      <div class="container help-top-header-inner">
        <!-- Sidebar Menu Toggle Button (Visible on mobile only, triggers sidebar drawer) -->
        <button 
          class="mobile-menu-toggle-btn" 
          :class="{ 'sidebar-open': mobileSidebarOpen }" 
          @click="mobileSidebarOpen = !mobileSidebarOpen" 
          title="Buka Menu Dokumen"
        >
          <Menu size="18" />
        </button>

        <!-- Horizontal scrollable categories wrapper -->
        <div class="top-categories-scroll">
          <button 
            v-for="cat in topCategories" 
            :key="cat.id" 
            :class="['top-cat-btn', { active: activeTopCategory === cat.id }]"
            @click="handleTopCategorySelect(cat.id)"
          >
            <component :is="cat.icon" size="16" class="top-cat-icon" />
            <span>{{ cat.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Layout Grid -->
    <div class="container help-main-container">
      <div class="help-layout">
        <!-- Container containing Sidebar and Main Content (Card background removed) -->
        <div class="help-content-wrapper" :class="{ 'sidebar-hidden': sidebarCollapsed }">
          <!-- Left Sidebar (Sidebar contents filtered dynamically) -->
          <!-- Left Sidebar (Sidebar contents filtered dynamically) -->
          <aside 
            :class="['help-sidebar', { collapsed: sidebarCollapsed, 'mobile-open': mobileSidebarOpen }]"
          >
            <!-- Sidebar Content wrapper (only show menu items when not collapsed) -->
            <div v-show="!sidebarCollapsed" class="sidebar-menu-wrapper">
              <!-- Search input box in sidebar -->
              <div class="sidebar-search-box">
                <div class="search-input-wrapper">
                  <Search size="16" class="search-box-icon" />
                  <input 
                    v-model="searchFilter" 
                    type="text" 
                    placeholder="Filter by name" 
                  />
                  <button v-if="searchFilter" class="clear-search-btn" @click="searchFilter = ''">
                    <X size="14" />
                  </button>
                </div>
              </div>

              <!-- 2-Level Accordion Tree Navigation (L2 Header & L3 Leafs) -->
              <nav class="sidebar-tree-nav">
                <!-- Level 1 (Corresponds to L2 of main data) -->
                <div v-for="node in filteredMenu" :key="node.id" class="tree-node-l1">
                  <div 
                    class="tree-node-header-l1" 
                    :class="{ open: node.isOpen }"
                    @click="toggleL2(node)"
                  >
                    <ChevronRight size="14" class="node-arrow" />
                    <span class="node-label-l1">{{ node.label }}</span>
                  </div>

                  <!-- Level 2 (Corresponds to L3 of main data) -->
                  <div v-show="node.isOpen" class="tree-children-l1">
                    <button 
                      v-for="leaf in node.children" 
                      :key="leaf.id" 
                      :class="['tree-leaf-node-l3', { active: activeDocId === leaf.id }]"
                      @click="selectDoc(leaf.id); mobileSidebarOpen = false;"
                    >
                      <span class="leaf-dot"></span>
                      <span class="leaf-label">{{ leaf.label }}</span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>

            <!-- Vertical Rotated Text when collapsed -->
            <div v-show="sidebarCollapsed" class="sidebar-collapsed-text-wrapper">
              <div class="vertical-rotated-text">
                {{ activeTopCategoryLabel }}
              </div>
            </div>

            <!-- Single Bottom Toggle Button (Always visible at the bottom of the sidebar) -->
            <div class="sidebar-bottom-action">
              <button 
                :class="['bottom-collapse-btn', { 'collapsed-btn': sidebarCollapsed }]" 
                @click="toggleSidebar"
                :title="sidebarCollapsed ? 'Tampilkan Menu' : 'Sembunyikan Menu'"
              >
                <!-- Show left arrow if open, right arrow if collapsed -->
                <ChevronLeft v-if="!sidebarCollapsed" size="16" />
                <ChevronRight v-else size="16" />
                <span v-if="!sidebarCollapsed">Sembunyikan Menu</span>
              </button>
            </div>
          </aside>

          <!-- Sidebar overlay for Mobile Drawer backdrop -->
          <div 
            v-if="mobileSidebarOpen" 
            class="mobile-sidebar-backdrop" 
            @click="mobileSidebarOpen = false"
          ></div>

          <!-- Middle Main Content Section - Directly renders all documents for this category -->
          <main class="help-main-content">
            <!-- Breadcrumb path -->
            <div class="doc-breadcrumbs">
              <span class="bc-label">Bantuan</span>
              <span class="bc-separator">/</span>
              <span class="bc-label">{{ activeTopCategoryLabel }}</span>
            </div>

            <!-- Document Main Header -->
            <h1 class="doc-title">{{ activeTopCategoryLabel }}</h1>
            <div class="doc-meta-info">
              Terakhir diperbarui: 30 Juni 2026
            </div>

            <!-- Document Rendered Body Sections -->
            <div class="doc-body">
              <div v-for="l2 in activeCategoryData.children" :key="l2.id" class="doc-category-group">
                <!-- Level 2 Sub-category Divider Header removed to leave only doc-section-heading (l3) -->
                
                <!-- Level 3 Document Section (Has individual target ID for smooth scrolling) -->
                <div v-for="l3 in l2.children" :key="l3.id" :id="l3.id" class="doc-body-section">
                  <h3 class="doc-section-heading">
                    {{ l3.label }}
                    <a :href="'#' + l3.id" class="doc-section-link" @click.prevent="scrollToSection(l3.id)">#</a>
                  </h3>
                  
                  <!-- Detailed clauses/sections -->
                  <div class="doc-section-content">
                    <div v-for="sec in getDocSections(l3.id)" :key="sec.id" class="doc-article-sub-section">
                      <h4 class="doc-sub-heading">{{ sec.title }}</h4>
                      <p class="doc-section-paragraph">{{ sec.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-page-wrapper {
  background-color: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 80px;
  padding-top: 60px; /* Offset the 60px fixed header navbar */
}

/* Top Navigation Category Header - Sticky below Navbar */
.help-top-header {
  background-color: var(--bg-color);
  border-bottom: 1px solid rgba(201, 76, 76, 0.08);
  position: sticky;
  top: 60px; /* Sits perfectly below the 60px fixed header navbar */
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.help-top-header-inner {
  display: flex;
  align-items: center;
  padding: 0 40px;
  height: 56px;
}

/* Sidebar Menu Toggle Button (Visible on mobile/tablet) */
.mobile-menu-toggle-btn {
  display: none; /* Hidden on desktop */
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: rgba(201, 76, 76, 0.05);
  border: 1px solid rgba(201, 76, 76, 0.1);
  color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 1;
  transform: scale(1);
}

.mobile-menu-toggle-btn:hover {
  background-color: var(--primary);
  color: #ffffff;
}

.mobile-menu-toggle-btn.sidebar-open {
  opacity: 0 !important;
  transform: scale(0.5) !important;
  pointer-events: none !important;
  width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

/* Scroll wrapper for horizontal category buttons */
.top-categories-scroll {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none; /* Hide Firefox scrollbar */
  flex-grow: 1;
}

.top-categories-scroll::-webkit-scrollbar {
  display: none; /* Hide Chrome/Safari scrollbar */
}

.top-cat-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-light);
  border: none;
  background: transparent;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
}

.top-cat-btn:hover {
  color: var(--primary);
}

.top-cat-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.top-cat-icon {
  opacity: 0.8;
}

/* Main Container Layout */
.help-main-container {
  padding: 30px 40px;
  position: relative;
}

.help-layout {
  display: block;
  position: relative;
  width: 100%;
}

.help-content-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  width: 100%;
  transition: grid-template-columns 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  align-items: flex-start;
}

.help-content-wrapper.sidebar-hidden {
  grid-template-columns: 60px 1fr;
}

/* Float Mobile sidebar trigger */
.mobile-sidebar-trigger {
  display: none;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  box-shadow: var(--shadow-btn);
  cursor: pointer;
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
}

/* Left Sidebar (Sticky below Top Category Bar) */
.help-sidebar {
  width: 280px;
  background-color: transparent;
  border: none;
  border-right: 1px solid rgba(201, 76, 76, 0.08);
  border-radius: 0;
  padding: 30px 24px;
  position: sticky;
  top: 136px; /* Sits perfectly below navbar (60px) and top category bar (56px) plus spacing */
  height: calc(100vh - 160px);
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  overflow-x: hidden; /* Scroll vertically only, no horizontal scroll */
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: none;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* push bottom action to the bottom */
}

.help-sidebar.collapsed {
  width: 60px;
  padding: 30px 10px; /* narrowed padding to center the collapsed btn */
  overflow: hidden;
  border: none;
  border-right: 1px solid rgba(201, 76, 76, 0.08);
  opacity: 1;
  pointer-events: auto;
}

.sidebar-collapsed-text-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  padding-top: 40px;
}

.vertical-rotated-text {
  writing-mode: vertical-rl;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--text-light);
  transform: rotate(180deg);
  white-space: nowrap;
  opacity: 0.6;
  user-select: none;
}

.sidebar-bottom-action {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

.bottom-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 40px; /* fixed height */
  padding: 10px;
  background-color: rgba(201, 76, 76, 0.03);
  border: 1px dashed rgba(201, 76, 76, 0.2);
  border-radius: 10px;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  white-space: nowrap;
}

.bottom-collapse-btn:hover {
  background-color: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

/* Collapsed button styling (only show arrow) */
.bottom-collapse-btn.collapsed-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%; /* circular shape when collapsed */
}

.sidebar-collapse-toggle:hover {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: var(--shadow-btn);
}

.sidebar-collapse-toggle svg {
  transition: transform 0.3s ease;
}

.sidebar-collapse-toggle svg.rotated {
  transform: rotate(180deg);
}

/* Filter Input Box styling */
.sidebar-search-box {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box-icon {
  position: absolute;
  left: 12px;
  color: var(--text-light);
  pointer-events: none;
}

.sidebar-search-box input {
  width: 100%;
  padding: 10px 32px 10px 36px;
  border: 1.5px solid rgba(201, 76, 76, 0.08);
  border-radius: 12px;
  font-size: 0.9rem;
  background-color: #faf9f9;
  color: var(--text-dark);
  font-weight: 500;
  outline: none;
  transition: all 0.25s ease;
}

.sidebar-search-box input:focus {
  border-color: var(--primary);
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(201, 76, 76, 0.08);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.clear-search-btn:hover {
  color: var(--primary);
}

/* Sidebar Accordion Nodes */
.sidebar-tree-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Level 1 Node styling */
.tree-node-l1 {
  display: flex;
  flex-direction: column;
}

.tree-node-header-l1 {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.tree-node-header-l1:hover {
  background-color: rgba(201, 76, 76, 0.03);
}

.node-arrow {
  color: var(--text-light);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.tree-node-header-l1.open .node-arrow {
  transform: rotate(90deg);
}

.node-label-l1 {
  font-size: 0.925rem;
  font-weight: 700;
  color: var(--text-dark);
}

.tree-children-l1 {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 12px;
  margin-top: 4px;
  border-left: 1px solid rgba(201, 76, 76, 0.08);
}

/* Level 2 Leaf Node styling */
.tree-leaf-node-l3 {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
}

.leaf-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--text-light);
  opacity: 0.5;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.leaf-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-light);
  transition: all 0.25s ease;
  line-height: 1.4;
  white-space: normal; /* Allow text to wrap vertically */
  word-break: break-word; /* Break long words to avoid horizontal scrolling */
}

.tree-leaf-node-l3:hover .leaf-label {
  color: var(--primary);
}

.tree-leaf-node-l3:hover .leaf-dot {
  background-color: var(--primary);
  opacity: 1;
}

.tree-leaf-node-l3.active {
  background-color: rgba(201, 76, 76, 0.04);
}

.tree-leaf-node-l3.active .leaf-label {
  color: var(--primary);
  font-weight: 700;
}

.tree-leaf-node-l3.active .leaf-dot {
  background-color: var(--primary);
  opacity: 1;
  transform: scale(1.5);
}

/* Middle Content styling */
.help-main-content {
  background-color: transparent;
  border: none;
  border-radius: 0;
  padding: 40px;
  min-height: 500px;
  box-shadow: none;
  width: 100%;
}

.doc-breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 0.825rem;
  font-weight: 500;
  color: var(--text-light);
  margin-bottom: 20px;
}

.bc-separator {
  color: rgba(0,0,0,0.15);
}

.bc-label {
  transition: color 0.2s ease;
}

.doc-breadcrumbs span:last-child .bc-label {
  color: var(--text-dark);
  font-weight: 600;
}

.doc-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.doc-meta-info {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-light);
  padding-bottom: 24px;
  border-bottom: 1.5px dashed rgba(201, 76, 76, 0.08);
  margin-bottom: 30px;
}

.doc-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.doc-category-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.doc-group-heading {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--primary);
  border-bottom: 2px solid rgba(201, 76, 76, 0.08);
  padding-bottom: 6px;
  margin-top: 10px;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.doc-body-section {
  scroll-margin-top: 136px; /* offset for sticky navbar (60px) and top category bar (56px) + spacing */
  padding: 4px 0;
}

.doc-section-heading {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-section-link {
  font-size: 1rem;
  color: var(--primary);
  opacity: 0;
  transition: opacity 0.2s ease;
  font-weight: normal;
}

.doc-section-heading:hover .doc-section-link {
  opacity: 1;
}

.doc-section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 4px;
}

.doc-article-sub-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doc-sub-heading {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-dark);
}

.doc-section-paragraph {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #4a4a4a;
}

/* Responsive Rules */
@media (max-width: 991px) {
  .help-page-wrapper {
    padding-top: 60px;
  }

  .help-top-header {
    top: 60px;
  }

  @media (max-width: 768px) {
    .help-page-wrapper {
      padding-top: 60px;
    }

    .help-top-header {
      top: 60px;
    }
  }

  .help-main-container {
    padding: 24px 20px;
  }

  .help-layout {
    display: block;
  }

  .help-content-wrapper {
    grid-template-columns: 1fr;
  }

  .help-content-wrapper.sidebar-hidden {
    grid-template-columns: 1fr;
  }

  /* Show top header menu button */
  .mobile-menu-toggle-btn {
    display: inline-flex;
  }

  .help-top-header-inner {
    padding: 0 16px;
  }

  .top-categories-scroll {
    padding-left: 12px;
  }

  /* Make sidebar a mobile drawer */
  .help-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(-100%); /* hidden offscreen left */
    width: 300px;
    height: 100vh;
    max-height: 100vh;
    z-index: 1005; /* higher than top header and navbar */
    background-color: #ffffff;
    border-radius: 0;
    border: none;
    border-right: 1px solid rgba(201, 76, 76, 0.08);
    box-shadow: 10px 0 30px rgba(0,0,0,0.15);
    padding: 24px 20px;
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  .help-sidebar.mobile-open {
    transform: translateX(0) !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    display: flex !important;
  }

  .help-sidebar.collapsed {
    width: 0px !important;
    padding: 0px !important;
    border: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .help-sidebar.collapsed.mobile-open {
    width: 300px !important;
    padding: 24px 20px !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    border-right: 1px solid rgba(201, 76, 76, 0.08) !important;
  }

  .sidebar-collapsed-text-wrapper {
    display: none !important;
  }

  .mobile-sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(2px);
    z-index: 95;
  }

  .help-main-content {
    padding: 30px 24px;
  }

  .doc-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 576px) {
  .top-cat-btn {
    padding: 12px 14px;
    font-size: 0.8rem;
  }

  .help-main-content {
    padding: 24px 16px;
  }

  .doc-title {
    font-size: 1.6rem;
  }

  .doc-section-heading {
    font-size: 1.2rem;
  }
}
</style>
