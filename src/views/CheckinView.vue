<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { authState } from '../store/auth';
import { checkinTab } from '../store/checkin';
import { UserCheck, Search, X, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-vue-next';
import jsQR from 'jsqr';

const videoRef = ref(null);
const stream = ref(null);
const isCameraOn = ref(false);
const isStarting = ref(true);
const cameraError = ref('');

// ---------- Checkin state ----------
const isCheckingIn = ref(false);
const isScanLocked = ref(false);
const checkinResult = ref(null); // { type: 'success'|'warning'|'error', message, data }
const showResultModal = ref(false);

// ---------- Camera ----------
const startCamera = async () => {
  cameraError.value = '';
  isStarting.value = true;
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    stream.value = mediaStream;

    await nextTick();

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
      videoRef.value.onloadedmetadata = () => {
        videoRef.value.play().catch((e) => {
          console.warn('Autoplay blocked, user gesture needed', e);
        });
      };
    }

    isCameraOn.value = true;
    scanRAF = requestAnimationFrame(scanLoop);
  } catch (err) {
    console.error('Camera error:', err);
    cameraError.value =
      err.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Mohon izinkan akses kamera di browser.'
        : err.name === 'NotFoundError'
        ? 'Kamera tidak ditemukan pada perangkat ini.'
        : err.name === 'NotReadableError'
        ? 'Kamera sedang digunakan aplikasi lain.'
        : err.message || 'Tidak dapat mengakses kamera';
    isCameraOn.value = false;
  } finally {
    isStarting.value = false;
  }
};

const stopCamera = () => {
  stopScanLoop();
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }
  isCameraOn.value = false;
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
};

onMounted(() => {
  startCamera();
});

onBeforeUnmount(() => {
  stopCamera();
});

// ---------- QR Scanning ----------
let scanRAF = null;
let scanCanvas = null;
let scanCtx = null;

const stopScanLoop = () => {
  if (scanRAF) {
    cancelAnimationFrame(scanRAF);
    scanRAF = null;
  }
};

const scanLoop = () => {
  const video = videoRef.value;
  if (!video || video.readyState < 2) {
    scanRAF = requestAnimationFrame(scanLoop);
    return;
  }

  if (!scanCanvas) {
    scanCanvas = document.createElement('canvas');
    scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });
  }

  const width = Math.min(video.videoWidth, 640);
  const height = Math.floor(width * (video.videoHeight / video.videoWidth));
  scanCanvas.width = width;
  scanCanvas.height = height;

  if (scanCtx) {
    scanCtx.drawImage(video, 0, 0, width, height);
    const imageData = scanCtx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, width, height, { inversionAttempts: 'dontInvert' });

    if (code && code.data) {
      const eticketNumber = code.data.trim();
      // Only auto-submit if it looks like an eticket number
      if (eticketNumber.toUpperCase().startsWith('SHET') || eticketNumber.includes('-')) {
        performCheckin(eticketNumber);
        return; // stop loop; restarted when modal closes
      }
    }
  }

  scanRAF = requestAnimationFrame(scanLoop);
};

// ---------- Checkin API ----------
const performCheckin = async (eticketNumber) => {
  if (isScanLocked.value) return;
  isScanLocked.value = true;
  stopScanLoop();
  isCheckingIn.value = true;
  checkinResult.value = null;
  showResultModal.value = true;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shuttle/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ eticket_number: eticketNumber }),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      checkinResult.value = {
        type: 'success',
        message: result.message || 'Check-in berhasil.',
        data: result.data,
      };
    } else if (!res.ok && result.message && result.message.toLowerCase().includes('sudah')) {
      // Already checked in
      checkinResult.value = {
        type: 'warning',
        message: result.message || 'Ticket sudah pernah check-in.',
        data: result.data,
      };
    } else {
      checkinResult.value = {
        type: 'error',
        message: result.message || 'Check-in gagal. Silakan coba lagi.',
        data: result.data,
      };
    }
  } catch (err) {
    console.error('Checkin error:', err);
    checkinResult.value = {
      type: 'error',
      message: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
      data: null,
    };
  } finally {
    isCheckingIn.value = false;
  }
};

const closeResultModal = () => {
  showResultModal.value = false;
  checkinResult.value = null;
  isScanLocked.value = false;
  if (isCameraOn.value) {
    scanRAF = requestAnimationFrame(scanLoop);
  }
};

const retryScan = () => {
  showResultModal.value = false;
  checkinResult.value = null;
  isScanLocked.value = false;
  if (isCameraOn.value) {
    scanRAF = requestAnimationFrame(scanLoop);
  }
};

// Load eticket list when manual tab is shown
import { watch } from 'vue';
watch(checkinTab, (tab) => {
  if (tab === 'manual' && etickets.value.length === 0) {
    fetchEtickets();
  }
});

// ---------- Checkin Manual List ----------
const etickets = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const summary = ref({ total: 0, checked_in: 0, not_checked_in: 0 });
const currentPage = ref(1);
const lastPage = ref(1);
const manualSubmittingId = ref(null);
const filterStatus = ref('semua');
const filterSession = ref('semua');
const filterTicket = ref('semua');

const fetchEtickets = async (page = 1) => {
  isLoading.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shuttle/checkin/list?page=${page}`);
    const result = await res.json();

    if (result.success) {
      etickets.value = result.data || [];
      summary.value = result.summary || { total: 0, checked_in: 0, not_checked_in: 0 };
      if (result.pagination) {
        currentPage.value = result.pagination.current_page || 1;
        lastPage.value = result.pagination.last_page || 1;
      }
    } else {
      etickets.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch etickets:', err);
    etickets.value = [];
  } finally {
    isLoading.value = false;
  }
};

const filteredEtickets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return etickets.value.filter(b => {
    // Search filter
    if (q) {
      const match =
        (b.eticket_number || '').toLowerCase().includes(q) ||
        (b.nama || '').toLowerCase().includes(q) ||
        (b.email || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    // Status filter
    if (filterStatus.value !== 'semua') {
      if (filterStatus.value === 'checked' && !b.is_checkin) return false;
      if (filterStatus.value === 'not-checked' && b.is_checkin) return false;
    }
    // Session filter
    if (filterSession.value !== 'semua') {
      if ((b.session || '') !== filterSession.value) return false;
    }
    // Ticket type filter
    if (filterTicket.value !== 'semua') {
      if (getTicketType(b) !== filterTicket.value) return false;
    }
    return true;
  });
});

// Filter options derived from current list
const sessionOptions = computed(() => {
  const set = new Set(etickets.value.map(e => e.session).filter(Boolean));
  return Array.from(set);
});

const ticketOptions = computed(() => {
  const set = new Set(etickets.value.map(e => getTicketType(e)).filter(t => t !== '-'));
  return Array.from(set);
});

const getTicketType = (e) => {
  if (e.ticket_type?.name) return e.ticket_type.name;
  return e.ticket || '-';
};

const getResultTicketType = () => {
  const d = checkinResult.value?.data;
  if (d?.ticket) return d.ticket;
  return d?.ticket_type?.name || '-';
};

const formatCheckinDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const goToPage = (p) => {
  if (p < 1 || p > lastPage.value || p === currentPage.value) return;
  fetchEtickets(p);
};

const manualCheckin = async (eticket) => {
  if (manualSubmittingId.value) return;
  manualSubmittingId.value = eticket.id;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shuttle/checkin/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ eticket_id: eticket.id }),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      checkinResult.value = {
        type: 'success',
        message: result.message || 'Manual check-in berhasil.',
        data: result.data,
      };
      // Refresh the list to reflect the updated check-in status
      fetchEtickets(currentPage.value);
    } else {
      const isAlready = !res.ok && result.message && result.message.toLowerCase().includes('sudah');
      checkinResult.value = {
        type: isAlready ? 'warning' : 'error',
        message: result.message || 'Manual check-in gagal.',
        data: result.data,
      };
    }
    showResultModal.value = true;
  } catch (err) {
    console.error('Manual checkin error:', err);
    checkinResult.value = {
      type: 'error',
      message: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
      data: null,
    };
    showResultModal.value = true;
  } finally {
    manualSubmittingId.value = null;
  }
};
</script>

<template>
  <div class="checkin-page">
    <div class="container checkin-container">
      <!-- Tabs (Desktop only; on mobile handled by bottom nav) -->
      <div class="checkin-tabs">
        <button
          class="tab-btn"
          :class="{ active: checkinTab === 'scan' }"
          @click="checkinTab = 'scan'"
        >
          <UserCheck :size="18" />
          Checkin
        </button>
        <button
          class="tab-btn"
          :class="{ active: checkinTab === 'manual' }"
          @click="checkinTab = 'manual'"
        >
          <UserCheck :size="18" />
          Checkin Manual
        </button>
      </div>

      <!-- Scan Tab -->
      <div v-if="checkinTab === 'scan'" class="scan-tab">
        <p class="intro">Arahkan kamera ke kode QR / barcode tiket untuk scan.</p>

        <div class="scanner-box" :class="{ active: isCameraOn }">
          <video
            ref="videoRef"
            class="scanner-video"
            playsinline
            muted
            autoplay
            v-show="isCameraOn"
          ></video>

          <!-- Grid overlay -->
          <div class="grid-overlay" v-if="isCameraOn">
            <div class="grid-h" v-for="i in 3" :key="'h' + i"></div>
            <div class="grid-v" v-for="i in 3" :key="'v' + i"></div>
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>
            <div class="scan-line"></div>
          </div>

          <!-- Error / Loading placeholder -->
          <div v-if="cameraError" class="scanner-placeholder">
            <div class="error-icon">⚠️</div>
            <p class="error-text">{{ cameraError }}</p>
            <button class="retry-btn" @click="startCamera">
              Coba Lagi
            </button>
          </div>
          <div v-else-if="isStarting && !isCameraOn" class="scanner-placeholder">
            <div class="loader"></div>
            <p>Memulai kamera…</p>
          </div>
        </div>

        <div class="result-box">
          <template v-if="isCheckingIn">
            <div class="checking-in">
              <Loader2 :size="20" class="spin" />
              <p class="result-idle">Memproses check-in...</p>
            </div>
          </template>
          <template v-else>
            <p class="result-idle">Arahkan QR tiket ke dalam grid scan</p>
          </template>
        </div>

        <button class="stop-btn" @click="stopCamera" :disabled="!isCameraOn">
          Matikan Kamera
        </button>
      </div>

      <!-- Checkin Manual Tab -->
      <div v-else class="manual-tab">
        <div class="manual-summary">
          <div class="sum-item">
            <span class="sum-value">{{ summary.total || 0 }}</span>
            <span class="sum-label">Total Tiket</span>
          </div>
          <div class="sum-item">
            <span class="sum-value ok">{{ summary.checked_in || 0 }}</span>
            <span class="sum-label">Sudah Check-in</span>
          </div>
          <div class="sum-item">
            <span class="sum-value pending">{{ summary.not_checked_in || 0 }}</span>
            <span class="sum-label">Belum Check-in</span>
          </div>
        </div>

        <div class="manual-header">
          <h2>Checkin Manual</h2>
          <div class="search-box">
            <Search :size="16" class="text-light" />
            <input type="text" v-model="searchQuery" placeholder="Cari eticket, nama, email..." class="search-input" />
          </div>
        </div>

        <div class="filter-row">
          <select v-model="filterStatus" class="filter-select">
            <option value="semua">Semua Status</option>
            <option value="checked">Sudah Check-in</option>
            <option value="not-checked">Belum Check-in</option>
          </select>
          <select v-model="filterSession" class="filter-select">
            <option value="semua">Semua Sesi</option>
            <option v-for="s in sessionOptions" :key="s" :value="s">{{ s }}</option>
          </select>
          <select v-model="filterTicket" class="filter-select">
            <option value="semua">Semua Tiket</option>
            <option v-for="t in ticketOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="table-responsive">
          <table class="report-table">
            <thead>
              <tr>
                <th>No</th>
                <th>E-Ticket</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Jenis Tiket</th>
                <th>Sesi</th>
                <th>Seat</th>
                <th>Status</th>
                <th>Check-in Date</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="10" class="empty-state">Loading data...</td>
              </tr>
              <tr v-else-if="filteredEtickets.length === 0">
                <td colspan="10" class="empty-state">
                  Belum ada data.
                </td>
              </tr>
              <tr v-for="(e, index) in filteredEtickets" :key="e.id">
                <td>{{ (currentPage - 1) * 20 + index + 1 }}</td>
                <td style="white-space: nowrap; font-weight: 700;">
                  {{ e.eticket_number }}
                </td>
                <td style="white-space: nowrap;">{{ e.nama || '-' }}</td>
                <td style="white-space: nowrap;">{{ e.email || '-' }}</td>
                <td style="white-space: nowrap;">{{ getTicketType(e) }}</td>
                <td style="white-space: nowrap;">{{ e.session || '-' }}</td>
                <td style="white-space: nowrap;">{{ e.seat_no || '-' }}</td>
                <td>
                  <span class="status-badge" :class="e.is_checkin ? 'checked' : 'not-checked'">
                    {{ e.status || (e.is_checkin ? 'Sudah Check-in' : 'Belum Check-in') }}
                  </span>
                </td>
                <td style="white-space: nowrap;">{{ formatCheckinDate(e.checkin_date) }}</td>
                <td class="text-center">
                  <button
                    class="checkin-btn"
                    :class="{ disabled: e.is_checkin }"
                    :disabled="e.is_checkin"
                    @click="manualCheckin(e)"
                  >
                    <Loader2 v-if="manualSubmittingId === e.id" :size="14" class="spin" />
                    <UserCheck v-else :size="14" />
                    {{ e.is_checkin ? 'Sudah' : 'Checkin Manual' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="lastPage > 1" class="pagination-controls">
          <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">‹</button>
          <button
            v-for="p in lastPage"
            :key="p"
            class="page-btn"
            :class="{ active: p === currentPage }"
            @click="goToPage(p)"
          >{{ p }}</button>
          <button class="page-btn" :disabled="currentPage >= lastPage" @click="goToPage(currentPage + 1)">›</button>
        </div>
      </div>
    </div>

    <!-- Checkin Result Modal -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showResultModal" class="result-modal-overlay" @click.self="!isCheckingIn && closeResultModal()">
          <div class="result-modal-card">
            <div v-if="isCheckingIn" class="result-loading">
              <Loader2 :size="44" class="spin" />
              <p>Memproses check-in...</p>
            </div>

            <template v-else-if="checkinResult">
              <!-- Success -->
              <div v-if="checkinResult.type === 'success'" class="result-body">
                <div class="result-icon success">
                  <CheckCircle2 :size="52" stroke-width="2.2" />
                </div>
                <h3 class="result-title success-text">Check-in Berhasil</h3>
                <p class="result-msg">{{ checkinResult.message }}</p>

                <div class="result-data">
                  <div class="data-row">
                    <span class="data-label">Nama</span>
                    <span class="data-value">{{ checkinResult.data?.nama || '-' }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Jenis Tiket</span>
                    <span class="data-value">{{ getResultTicketType() }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Sesi</span>
                    <span class="data-value">{{ checkinResult.data?.session || '-' }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Seat</span>
                    <span class="data-value seat-value">{{ checkinResult.data?.seat_no || '-' }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Check-in</span>
                    <span class="data-value">{{ formatCheckinDate(checkinResult.data?.checkin_date) }}</span>
                  </div>
                </div>
              </div>

              <!-- Already checked in -->
              <div v-else-if="checkinResult.type === 'warning'" class="result-body">
                <div class="result-icon warning">
                  <AlertTriangle :size="52" stroke-width="2.2" />
                </div>
                <h3 class="result-title warning">Sudah Check-in</h3>
                <p class="result-msg">{{ checkinResult.message }}</p>

                <div v-if="checkinResult.data" class="result-data">
                  <div class="data-row">
                    <span class="data-label">Nama</span>
                    <span class="data-value">{{ checkinResult.data.nama || '-' }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Jenis Tiket</span>
                    <span class="data-value">{{ getResultTicketType() }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Sesi</span>
                    <span class="data-value">{{ checkinResult.data.session || '-' }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Seat</span>
                    <span class="data-value seat-value">{{ checkinResult.data.seat_no || '-' }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Check-in</span>
                    <span class="data-value">{{ formatCheckinDate(checkinResult.data.checkin_date) }}</span>
                  </div>
                </div>
              </div>

              <!-- Error -->
              <div v-else class="result-body">
                <div class="result-icon error">
                  <XCircle :size="52" stroke-width="2.2" />
                </div>
                <h3 class="result-title error">Check-in Gagal</h3>
                <p class="result-msg">{{ checkinResult.message }}</p>
              </div>

              <div class="result-actions">
                <button class="close-btn" @click="closeResultModal">Tutup</button>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.checkin-page {
  min-height: 100vh;
  background: #ffffff;
  color: #000000;
  padding: 100px 0 60px;
}

.checkin-container {
  max-width: 1100px;
}

/* Tabs */
.checkin-tabs {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1.5px solid #e0e0e0;
  background: #ffffff;
  color: #000000;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.tab-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

/* Scan Tab */
.scan-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.intro {
  color: #666;
  margin-bottom: 16px;
  text-align: center;
}

.scanner-box {
  position: relative;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 3 / 4;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
  gap: 12px;
}

.error-icon {
  font-size: 32px;
}

.error-text {
  color: #ff6b6b;
  font-size: 14px;
  max-width: 260px;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

/* Grid overlay */
.grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-overlay .grid-h {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}
.grid-overlay .grid-h:nth-child(1) { top: 33.33%; }
.grid-overlay .grid-h:nth-child(2) { top: 66.66%; }

.grid-overlay .grid-v {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.08);
}
.grid-overlay .grid-v:nth-child(3) { left: 33.33%; }
.grid-overlay .grid-v:nth-child(4) { left: 66.66%; }

.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 2px solid #6c5ce7;
}
.corner.tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
.corner.tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
.corner.bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
.corner.br { bottom: 12px; right: 12px; border-left: none; border-top: none; }

.scan-line {
  position: absolute;
  left: 10%;
  right: 10%;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #6c5ce7, transparent);
  animation: scanMove 2.5s linear infinite;
}

@keyframes scanMove {
  0%   { top: 10%; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 90%; opacity: 0; }
}

.result-box {
  width: 100%;
  max-width: 320px;
  background: #f7f7f7;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  margin-top: 12px;
}

.result-ok {
  color: #00a86b;
  font-weight: 700;
  margin: 0;
}

.result-idle {
  color: #999;
  margin: 0;
}

.stop-btn {
  margin-top: 16px;
  background: #ffffff;
  color: #000;
  border: 1.5px solid #e0e0e0;
  padding: 10px 28px;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
}
.stop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Manual Tab */
.manual-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.manual-header h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #000;
  margin: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1.5px solid #e0e0e0;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 4px 15px rgba(201, 76, 76, 0.08);
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 0.85rem;
  color: #000;
  width: 220px;
}

.text-light {
  color: var(--primary);
}

.table-responsive {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
  max-height: 600px;
  overflow-y: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1020px;
}

.report-table th, .report-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  white-space: nowrap;
}

.report-table th {
  font-size: 0.72rem;
  font-weight: 800;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 1;
}

.report-table td {
  font-size: 0.85rem;
  color: #000;
  vertical-align: middle;
}

.report-table tr:hover td {
  background: rgba(0,0,0,0.02);
}

.report-table tbody tr:last-child td {
  border-bottom: none;
}

.report-table td.empty-state {
  text-align: center;
  padding: 60px 24px !important;
  color: #999;
  font-style: italic;
}

.text-center {
  text-align: center !important;
}

.checkin-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2E7D32;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
}

.checkin-btn:hover {
  background: #1b5e20;
  transform: translateY(-1px);
}

.checkin-btn.disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}
.checkin-btn.disabled:hover {
  background: #bdbdbd;
  transform: none;
}

/* Manual summary cards */
.manual-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

/* Filter row */
.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 150px;
  padding: 10px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  background: #ffffff;
  color: #000;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all 0.25s ease;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23C94C4C' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
  padding-right: 34px;
}

.filter-select:focus {
  border-color: var(--primary);
  box-shadow: 0 4px 15px rgba(201, 76, 76, 0.08);
}

.sum-item {
  background: #f7f7f7;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.sum-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 900;
  color: #000;
}
.sum-value.ok { color: #2E7D32; }
.sum-value.pending { color: #E6A400; }

.sum-label {
  font-size: 0.72rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Status badge */
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}
.status-badge.checked {
  background: rgba(46, 125, 50, 0.12);
  color: #2E7D32;
}
.status-badge.not-checked {
  background: rgba(230, 164, 0, 0.15);
  color: #B8860B;
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #000;
  border-radius: 8px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}
.page-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Desktop layout */
@media (min-width: 768px) {
  .scanner-box {
    max-width: 420px;
  }
}

@media (max-width: 768px) {
  .checkin-page {
    padding: 80px 0 40px;
  }
  /* Top tabs handled by bottom nav on mobile */
  .checkin-tabs {
    display: none;
  }
  /* Scanner full bleed left-right on mobile */
  .scan-tab {
    padding: 0;
  }
  .manual-tab {
    padding: 0 16px 64px;
  }
  .intro {
    padding: 0 16px;
  }
  .scanner-box {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 3 / 4;
    border-radius: 0;
  }
  .result-box {
    max-width: 100%;
    margin-top: 12px;
  }
  .stop-btn {
    margin: 16px 16px 0;
  }
  .manual-tab {
    padding: 0 16px;
  }
  .manual-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .manual-summary {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .sum-item {
    padding: 12px 6px;
  }
  .sum-value {
    font-size: 1.2rem;
  }
  .sum-label {
    font-size: 0.6rem;
  }
  .filter-row {
    flex-direction: column;
  }
  .filter-select {
    width: 100%;
  }
  .search-box {
    width: 100%;
  }
  .search-input {
    width: 100%;
  }
}

/* Checkin result modal */
.result-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.result-modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.result-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 24px;
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
}

.result-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 24px 20px;
  text-align: center;
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  margin-bottom: 16px;
}
.result-icon.success { background: rgba(46, 125, 50, 0.12); color: #2E7D32; }
.result-icon.warning { background: rgba(255, 165, 0, 0.15); color: #E6A400; }
.result-icon.error { background: rgba(201, 76, 76, 0.12); color: #C94C4C; }

.result-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 0 6px;
}
.result-title.success-text { color: #2E7D32; }
.result-title.warning { color: #E6A400; }
.result-title.error { color: #C94C4C; }

.result-msg {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 20px;
}

.result-data {
  width: 100%;
  background: #f7f7f7;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 8px 16px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.data-row:last-child {
  border-bottom: none;
}

.data-label {
  font-size: 0.78rem;
  color: #999;
  font-weight: 600;
}

.data-value {
  font-size: 0.88rem;
  color: #000;
  font-weight: 700;
}

.seat-value {
  background: var(--primary);
  color: #fff;
  padding: 3px 12px;
  border-radius: 20px;
}

.result-actions {
  padding: 0 24px 24px;
}

.close-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
}
.close-btn:hover {
  opacity: 0.9;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.checking-in {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin {
  animation: spin 0.8s linear infinite;
}
</style>
