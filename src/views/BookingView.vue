<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MapPin, Clock, Calendar, ChevronLeft, ChevronDown, Check, Info, User, Mail, Phone, Wind, Zap, Music, ShieldCheck, Wifi, Sofa } from 'lucide-vue-next';
import { bookingStore } from '../store/booking';

const route = useRoute();
const router = useRouter();



const event = ref(null);
const activeTab = ref('tiket'); // 'deskripsi', 'tiket', 'terms'
const selectedTicket = ref(null);
const expandedTicketId = ref(null);
const currentStep = ref(1); // 1 = Select seat, 2 = Buyer details form
const isEditMode = ref(false);

// Booking states (Quantity, selected seats, and buyer information)
const quantity = ref(1);
const selectedSeats = ref([]);
const buyer = ref({
  name: '',
  email: '',
  phone: '',
  identity: ''
});

// Interactive canvas state
const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const isCanvasOpen = ref(false);
const isFullscreen = ref(false);
const isTabsSticky = ref(false);
const tabsBarRef = ref(null);
const showMobileDetailSheet = ref(false);

// Bottom sheet drag state
const isMobile = ref(window.innerWidth <= 768);
const updateMobileStatus = () => {
  isMobile.value = window.innerWidth <= 768;
};

const sheetDragStartY = ref(0);
const sheetDragDeltaY = ref(0);
const isSheetDragging = ref(false);
const isSheetClosing = ref(false);
const SHEET_DISMISS_THRESHOLD = 120; // px to drag down to dismiss
const SHEET_CLOSE_DURATION = 380;   // ms — must match CSS animation duration

const onSheetDragStart = (e) => {
  if (window.innerWidth > 768) return;
  const touch = e.touches ? e.touches[0] : e;
  sheetDragStartY.value = touch.clientY;
  sheetDragDeltaY.value = 0;
  isSheetDragging.value = true;
};

const onSheetDragMove = (e) => {
  if (!isSheetDragging.value || window.innerWidth > 768) return;
  if (e.cancelable) {
    e.preventDefault();
  }
  const touch = e.touches ? e.touches[0] : e;
  const delta = touch.clientY - sheetDragStartY.value;
  if (delta < 0) {
    // Dragging UP — allow flexible drag with soft dampening
    sheetDragDeltaY.value = Math.max(-120, delta * 0.6);
  } else {
    // Dragging DOWN — allow freely
    sheetDragDeltaY.value = delta;
  }
};

const animatedCloseSheet = () => {
  isSheetClosing.value = true;
  // Slide sheet down off-screen smoothly
  sheetDragDeltaY.value = window.innerHeight || 1000;
  setTimeout(() => {
    isSheetClosing.value = false;
    isCanvasOpen.value = false;
    sheetDragDeltaY.value = 0;
    errors.value.seats = '';
    // Sync with router hash if needed
    if (route.hash === '#seatmap') {
      router.back();
    }
  }, SHEET_CLOSE_DURATION);
};

const onSheetDragEnd = () => {
  if (!isSheetDragging.value || window.innerWidth > 768) return;
  isSheetDragging.value = false;
  if (sheetDragDeltaY.value > SHEET_DISMISS_THRESHOLD) {
    // Animate dismiss
    animatedCloseSheet();
  } else {
    // Snap back smoothly
    sheetDragDeltaY.value = 0;
  }
};

const handleScrollTabs = () => {
  if (!tabsBarRef.value) return;
  const rect = tabsBarRef.value.getBoundingClientRect();
  const threshold = window.innerWidth <= 768 ? 60 : 80;
  isTabsSticky.value = rect.top <= threshold + 2;
};

let startX = 0;
let startY = 0;
let touchStartX = 0;
let touchStartY = 0;

const startPan = (e) => {
  if (e.button !== 0) return;
  isPanning.value = true;
  startX = e.clientX - panX.value;
  startY = e.clientY - panY.value;
};

const onPan = (e) => {
  if (!isPanning.value) return;
  panX.value = e.clientX - startX;
  panY.value = e.clientY - startY;
};

const endPan = () => {
  isPanning.value = false;
};

const startPanTouch = (e) => {
  if (e.touches.length !== 1) return;
  e.stopPropagation();
  isPanning.value = true;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  startX = e.touches[0].clientX - panX.value;
  startY = e.touches[0].clientY - panY.value;
};

const onPanTouch = (e) => {
  if (!isPanning.value || e.touches.length !== 1) return;
  if (e.cancelable) {
    e.preventDefault();
  }
  e.stopPropagation();
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const dist = Math.hypot(currentX - touchStartX, currentY - touchStartY);
  if (dist > 6) {
    panX.value = currentX - startX;
    panY.value = currentY - startY;
  }
};

const onWheel = (e) => {
  const zoomFactor = 0.05;
  let newZoom = zoom.value + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
  zoom.value = Math.min(Math.max(newZoom, 0.5), 2.5);
};

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.15, 2.5);
};

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.15, 0.5);
};

const resetZoomPan = () => {
  zoom.value = 1;
  panX.value = 0;
  panY.value = 0;
};

const errors = ref({
  name: '',
  email: '',
  phone: '',
  seats: ''
});

const showPaymentModal = ref(false);
const selectedPayment = ref('');

const paymentMethods = [
  { id: 'qris', name: 'QRIS', icon: '📱' },
  { id: 'gopay', name: 'GoPay', icon: '🟢' },
  { id: 'dana', name: 'DANA', icon: '🔵' },
  { id: 'bca', name: 'BCA Virtual Account', icon: '🏦' }
];

// Bus cabin seats configuration layout (generated dynamically from layout & capacity)
const parsedSeatmap = computed(() => {
  if (!event.value) return [];
  
  // Try to parse the seatmap string from the backend
  let config = [];
  try {
    if (event.value.seatmap) {
      // It can be a string or already an object depending on fetch, handle both
      config = typeof event.value.seatmap === 'string' ? JSON.parse(event.value.seatmap) : event.value.seatmap;
    } else {
      // Fallback or empty if no seatmap is provided
      return [];
    }
  } catch (e) {
    console.error('Error parsing seatmap JSON:', e);
    return [];
  }

  const shapes = [];

  config.forEach((item, index) => {
    if (item.type === 'box') {
      shapes.push({
        id: `box-${index}`,
        type: 'box',
        x: item.position[0],
        y: item.position[1],
        width: item.size[0],
        height: item.size[1],
        text: item.text,
        background: item.background || '#fff',
        radius: item.radius || [0, 0, 0, 0]
      });
    } else {
      // It is a column/row configuration for seats
      const cols = item.col || 1;
      const rows = item.row || 1;
      const seatWidth = item.size[0] / cols;
      const seatHeight = item.size[1] / rows;
      const startX = item.position[0];
      const startY = item.position[1];
      const prefix = item.prefix || '';

      // Generate individual seats
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const seatLabel = `${prefix}${r + 1}`; // e.g. A1, A2
          
          shapes.push({
            id: seatLabel,
            type: 'seat',
            x: startX + c * seatWidth,
            y: startY + r * seatHeight,
            width: seatWidth,
            height: seatHeight,
            label: seatLabel
          });
        }
      }
    }
  });

  // Pre-calculate full Konva configs to prevent massive Vue re-renders on every zoom/drag event
  return shapes.map(shape => {
    if (shape.type === 'box') {
      return {
        ...shape,
        groupConfig: { x: shape.x, y: shape.y },
        rectConfig: {
          width: shape.width,
          height: shape.height,
          fill: shape.background,
          cornerRadius: 6,
          stroke: '#cbd5e1',
          strokeWidth: 1
        },
        textConfig: {
          text: shape.text,
          width: shape.width,
          height: shape.height,
          align: 'center',
          verticalAlign: 'middle',
          fontSize: 12,
          fontStyle: 'bold',
          fill: '#475569'
        }
      };
    } else {
      const available = isSeatAvailable(shape.id);
      const selected = selectedSeats.value.includes(shape.id);
      
      return {
        ...shape,
        available,
        groupConfig: { x: shape.x, y: shape.y },
        rectConfig: {
          width: shape.width - 4,
          height: shape.height - 4,
          x: 2,
          y: 2,
          fill: !available ? '#e2e8f0' : (selected ? '#ef4444' : '#fff'),
          cornerRadius: 8,
          stroke: !available ? '#cbd5e1' : (selected ? '#ef4444' : '#94a3b8'),
          strokeWidth: 2
        },
        textConfig: {
          text: !available ? '✕' : shape.label,
          width: shape.width,
          height: shape.height,
          align: 'center',
          verticalAlign: 'middle',
          fontSize: !available ? 14 : 12,
          fontStyle: 'bold',
          fill: !available ? '#94a3b8' : (selected ? '#fff' : '#0f172a')
        }
      };
    }
  });
});

const getFacilityIcon = (facility) => {
  const fac = facility.toLowerCase();
  if (fac.includes('ac')) return Wind;
  if (fac.includes('wifi')) return Wifi;
  if (fac.includes('usb') || fac.includes('charger')) return Zap;
  if (fac.includes('reclining') || fac.includes('seat')) return Sofa;
  if (fac.includes('toilet') || fac.includes('asuransi')) return ShieldCheck;
  return ShieldCheck;
};

watch(() => route.hash, (newHash) => {
  if (newHash === '#seatmap') {
    isCanvasOpen.value = true;
  } else {
    if (isCanvasOpen.value && !isSheetClosing.value && window.innerWidth <= 768) {
      // User pressed browser back button
      animatedCloseSheet();
    } else {
      isCanvasOpen.value = false;
    }
  }
}, { immediate: true });

watch([isCanvasOpen, isSheetClosing], ([isOpen, isClosing]) => {
  const active = isOpen || isClosing;
  // On mobile: lock scroll on both html and body to prevent ANY page scroll
  if (window.innerWidth <= 768) {
    if (active) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.classList.add('lock-scroll');
      document.documentElement.classList.add('lock-scroll');
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.classList.remove('lock-scroll');
      document.documentElement.classList.remove('lock-scroll');
    }
  } else {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.classList.remove('lock-scroll');
    document.documentElement.classList.remove('lock-scroll');
  }
});

onMounted(async () => {
  const slug = route.params.slug;
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shuttle/${slug}`);
    if (!response.ok) throw new Error('API fetch failed');
    
    const result = await response.json();
    if (result.success && result.data) {
      const item = result.data;
      
      const dateObj = new Date(item.start_date || new Date());
      const day = dateObj.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      const month = monthNames[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      
      let seats = 0;
      try {
        if (item.seatmap) {
          const seatmap = JSON.parse(item.seatmap);
          seats = seatmap.rows * seatmap.cols;
        }
      } catch (e) {
        console.warn('Invalid seatmap JSON', e);
      }

      let mappedTickets = [];
      if (item.tickets && item.tickets.length > 0) {
        mappedTickets = item.tickets.map(t => {
          return {
            id: t.id,
            name: t.name,
            ticket_category: 'Regular Shuttle',
            description: t.description || '',
            price: parseInt(t.price),
            available_seat_number: t.available_seat_number || '', 
            taken_seat_number: t.taken_seat_number || '',
            pending_seat_number: t.pending_seat_number || '',
            reserved_seat_number: t.reserved_seat_number || '',
            ticket_end: t.ticket_end_date ? t.ticket_end_date.split('T')[0] : '',
            ending_time: t.ticket_end_time || '',
            route_id: t.route_id || null,
            total_seat: t.total_seat || 0
          };
        });
      }

      const fetchedEvent = {
        id: item.id,
        name: item.name || 'Unknown',
        slug: item.slug,
        bus_code: '-',
        bus_type: '',
        plate_number: '-',
        seat_layout: '',
        total_seat: seats,
        facilities: item.facilities || [],
        trip_id: item.trip_id || (item.trips && item.trips.length > 0 ? item.trips[0].id : ''),
        date: item.start_date ? item.start_date.split('T')[0] : '',
        start_date: item.start_date,
        end_date: item.end_date,
        start_time: item.start_time ? item.start_time.slice(0, 5) : '00:00',
        end_time: item.end_time ? item.end_time.slice(0, 5) : '00:00',
        zone_time: 'WIB',
        dateLabel: `${day} ${month} ${year}`,
        time: item.start_time ? item.start_time.slice(0, 5) + ' WIB' : '',
        departureTime: '',
        returnTime: '',
        location: item.description || '',
        city: 'Jakarta',
        price: mappedTickets.length > 0 ? `Rp ${mappedTickets[0].price.toLocaleString('id-ID')}` : 'Lihat Detail',
        priceNum: mappedTickets.length > 0 ? mappedTickets[0].price : 0,
        image: item.image_url || '',
        description: item.description || '',
        term_condition: item.terms || '',
        seats: seats,
        seatmap: item.seatmap, // Map the seatmap property!
        is_name: item.is_name,
        is_email: item.is_email,
        is_phone: item.is_phone,
        is_noidentity: item.is_noidentity,
        tag: 'Shuttle Bersama',
        has_event_ticket: mappedTickets
      };

      event.value = fetchedEvent;
      bookingStore.selectedEvent = fetchedEvent;
      if (fetchedEvent.has_event_ticket && fetchedEvent.has_event_ticket.length > 0) {
        expandedTicketId.value = fetchedEvent.has_event_ticket[0].id;
      }
    } else {
      throw new Error('No data found');
    }
  } catch (err) {
    console.error('Error fetching event data:', err);
    router.push('/events');
  }

  window.addEventListener('scroll', handleScrollTabs, { passive: true });
  window.addEventListener('resize', updateMobileStatus);
  handleScrollTabs();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollTabs);
  window.removeEventListener('resize', updateMobileStatus);
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.touchAction = '';
  document.body.classList.remove('lock-scroll');
  document.documentElement.classList.remove('lock-scroll');
});

const formatRp = (num) => {
  if (!num) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
};

const formatEventDates = (evt) => {
  if (!evt) return '';
  if (evt.id === 107) {
    return '5 Mei - 6 Mei 2027';
  }
  if (evt.start_date) {
    return formatDateLabel(evt.start_date);
  }
  return evt.dateLabel || evt.date || 'TBA';
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  // Split by 'T' and '-' to prevent JS Date UTC conversion from shifting the day
  const pureDate = dateStr.split('T')[0];
  const parts = pureDate.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const days = parseInt(parts[2], 10);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthStr = months[monthNum - 1];
  
  return `${days} ${monthStr} ${year}`;
};

const formatTimeLabel = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
};

const maxTickets = computed(() => {
  return event.value?.max_buy_ticket || 5;
});

const isSeatAvailable = (seatId) => {
  if (!selectedTicket.value) return false;
  const avail = selectedTicket.value.available_seat_number || '';
  const list = avail.split(',').map(s => s.trim().toUpperCase());
  return list.includes(seatId.toUpperCase());
};

const hasAvailableSeats = (t) => {
  if (t.is_soldout || t.is_fullbook || t.is_finish) return false;
  if (t.ticket_type_id === 0) return true;
  if (!t.available_seat_number) return false;
  return t.available_seat_number.split(',').map(s => s.trim()).filter(Boolean).length > 0;
};

const getTicketStatus = (t) => {
  if (t.is_soldout) return 'TIKET HABIS';
  if (t.is_fullbook) return 'FULL BOOKED';
  if (t.is_finish) return 'PENJUALAN SELESAI';
  return hasAvailableSeats(t) ? 'Tersedia' : 'TIKET HABIS';
};

const getTicketStatusClass = (t) => {
  if (t.is_soldout || t.is_fullbook || t.is_finish || !hasAvailableSeats(t)) return 'sold-out';
  return '';
};

const selectTicketCategory = (t) => {
  if (selectedTicket.value?.id !== t.id) {
    selectedTicket.value = t;
    selectedSeats.value = [];
    errors.value.seats = '';
    isEditMode.value = false;
  }
  if (t.ticket_type_id === 0) {
    goToBuyerDetails();
  } else {
    router.push({ hash: '#seatmap' });
  }
};

const toggleTicketAccordion = (ticketId) => {
  if (expandedTicketId.value === ticketId) {
    expandedTicketId.value = null;
  } else {
    expandedTicketId.value = ticketId;
  }
};

const clearSelectedTicket = () => {
  if (route.hash === '#seatmap') {
    // On mobile: animate out first, then navigate back after animation
    if (window.innerWidth <= 768) {
      isSheetClosing.value = true;
      setTimeout(() => {
        isSheetClosing.value = false;
        router.back();
      }, SHEET_CLOSE_DURATION);
    } else {
      router.back();
    }
  } else {
    if (window.innerWidth <= 768) {
      animatedCloseSheet();
    } else {
      isCanvasOpen.value = false;
    }
  }
  errors.value.seats = '';
};

const clearSelectedSeats = () => {
  selectedSeats.value = [];
  errors.value.seats = '';
};

const handleEditSeats = () => {
  router.push({ hash: '#seatmap' });
  setTimeout(() => {
    const el = document.querySelector('.bus-cabin-canvas-viewport');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
};

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const deleteTicketSelection = () => {
  selectedTicket.value = null;
  selectedSeats.value = [];
  isEditMode.value = false;
  errors.value.seats = '';
  showMobileDetailSheet.value = false;
  if (route.hash === '#seatmap') {
    router.back();
  } else {
    isCanvasOpen.value = false;
  }
};

const scrollToTickets = () => {
  const el = document.querySelector('.tickets-container-list');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else {
    if (event.value?.has_event_ticket?.length > 0) {
      selectTicketCategory(event.value.has_event_ticket[0]);
    }
  }
};

const goToBuyerDetails = () => {
  validateSeats();
  if (!errors.value.seats) {
    // Populate bookingStore with event, ticket, seats, and quantity
    bookingStore.selectedEvent = event.value;
    bookingStore.selectedTicket = selectedTicket.value;
    bookingStore.selectedSeats = [...selectedSeats.value];
    bookingStore.adults = quantity.value;
    bookingStore.toddlers = 0;
    
    // Direct user to transaction page
    router.push('/transaksi');
  }
};

const goBackToStep1 = () => {
  currentStep.value = 1;
};

const isFormValid = computed(() => {
  const isNameValid = !event.value?.is_name || (buyer.value.name.trim().length >= 3 && !errors.value.name);
  const isEmailValid = !event.value?.is_email || (buyer.value.email.trim().length > 0 && !errors.value.email);
  const isPhoneValid = !event.value?.is_phone || (buyer.value.phone.trim().length >= 8 && !errors.value.phone);
  const isIdentityValid = !event.value?.is_noidentity || (buyer.value.identity.trim().length >= 3 && !errors.value.identity);
  return isNameValid && isEmailValid && isPhoneValid && isIdentityValid;
});

const increaseQuantity = () => {
  if (quantity.value < maxTickets.value) {
    quantity.value++;
    validateSeats();
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
    if (selectedSeats.value.length > quantity.value) {
      selectedSeats.value = selectedSeats.value.slice(0, quantity.value);
    }
    validateSeats();
  }
};

const toggleSeatSelection = (seatId) => {
  if (!isSeatAvailable(seatId)) return;
  const index = selectedSeats.value.indexOf(seatId);
  if (index !== -1) {
    selectedSeats.value.splice(index, 1);
  } else {
    if (selectedSeats.value.length >= quantity.value) {
      selectedSeats.value.shift();
    }
    selectedSeats.value.push(seatId);
  }
  validateSeats();
};

const validateName = () => {
  if (!event.value?.is_name) { errors.value.name = ''; return; }
  const val = buyer.value.name.trim();
  if (!val) {
    errors.value.name = 'Nama lengkap wajib diisi.';
  } else if (val.length < 3) {
    errors.value.name = 'Nama terlalu pendek. Minimal 3 karakter.';
  } else {
    errors.value.name = '';
  }
};

const validateEmail = () => {
  if (!event.value?.is_email) { errors.value.email = ''; return; }
  const val = buyer.value.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val) {
    errors.value.email = 'Email wajib diisi.';
  } else if (!emailRegex.test(val)) {
    errors.value.email = 'Format email tidak valid.';
  } else {
    errors.value.email = '';
  }
};

const validatePhone = () => {
  if (!event.value?.is_phone) { errors.value.phone = ''; return; }
  const val = buyer.value.phone.trim();
  if (!val) {
    errors.value.phone = 'Nomor telepon wajib diisi.';
  } else if (val.startsWith('0')) {
    errors.value.phone = 'Nomor telepon tidak boleh diawali angka 0. Mulai dengan angka 8.';
  } else if (!/^\d+$/.test(val)) {
    errors.value.phone = 'Nomor telepon hanya boleh berisi angka.';
  } else if (val.length < 8 || val.length > 13) {
    errors.value.phone = 'Nomor telepon harus antara 8-13 digit.';
  } else {
    errors.value.phone = '';
  }
};

const validateIdentity = () => {
  if (!event.value?.is_noidentity) { errors.value.identity = ''; return; }
  const val = buyer.value.identity.trim();
  if (!val) {
    errors.value.identity = 'Nomor identitas wajib diisi.';
  } else {
    errors.value.identity = '';
  }
};

const validateSeats = () => {
  if (selectedTicket.value && selectedTicket.value.ticket_type_id === 0) {
    errors.value.seats = '';
    return;
  }
  if (selectedSeats.value.length !== quantity.value) {
    errors.value.seats = `Silakan pilih tepat ${quantity.value} kursi.`;
  } else {
    errors.value.seats = '';
  }
};

const isSelectionComplete = computed(() => {
  const seatsValid = (selectedTicket.value && selectedTicket.value.ticket_type_id === 0) || 
                     (selectedSeats.value.length === quantity.value);
  const isNameValid = !event.value?.is_name || (buyer.value.name.trim().length >= 3);
  const isEmailValid = !event.value?.is_email || (buyer.value.email.trim().length > 0);
  const isPhoneValid = !event.value?.is_phone || (buyer.value.phone.trim().length >= 8);
  const isIdentityValid = !event.value?.is_noidentity || (buyer.value.identity.trim().length >= 3);
  
  return selectedTicket.value &&
         isNameValid &&
         isEmailValid &&
         isPhoneValid &&
         isIdentityValid &&
         seatsValid;
});

const goBack = () => {
  router.back();
};

const openChat = () => {
  alert('Fitur Chat dengan Penyelenggara segera hadir!');
};

const handleProceedToCheckout = () => {
  validateName();
  validateEmail();
  validatePhone();
  validateIdentity();
  validateSeats();

  if (isSelectionComplete.value && !errors.value.name && !errors.value.email && !errors.value.phone && !errors.value.identity && !errors.value.seats) {
    // Save to bookingStore and go directly to confirmation/transaction page
    bookingStore.customer = {
      name: buyer.value.name,
      email: buyer.value.email,
      phone: buyer.value.phone,
      identity: buyer.value.identity
    };
    bookingStore.adults = quantity.value;
    bookingStore.toddlers = 0;
    bookingStore.selectedSeats = [...selectedSeats.value];
    bookingStore.selectedTicket = selectedTicket.value;
    bookingStore.selectedPickup = {
      name: 'Venue Acara (' + event.value.location_name + ')',
      address: event.value.location_address || event.value.location_name
    };

    const code = bookingStore.generateBookingCode();
    const payload = {
      code,
      date: new Date().toISOString(),
      event: event.value,
      pickup: bookingStore.selectedPickup,
      customer: { ...bookingStore.customer },
      adults: bookingStore.adults,
      selectedSeats: [...bookingStore.selectedSeats],
      totalPrice: selectedTicket.value.price * quantity.value,
      paymentMethod: 'QRIS'
    };

    let existing = [];
    try {
      const cached = localStorage.getItem('ajak_bookings');
      if (cached) existing = JSON.parse(cached);
    } catch(e) {}
    existing.push(payload);
    localStorage.setItem('ajak_bookings', JSON.stringify(existing));

    router.push('/confirmation');
  }
};

const confirmBooking = () => {
  if (!selectedPayment.value) {
    alert('Pilih metode pembayaran terlebih dahulu');
    return;
  }

  // Save to bookingStore
  bookingStore.customer = {
    name: buyer.value.name,
    email: buyer.value.email,
    phone: buyer.value.phone
  };
  bookingStore.adults = quantity.value;
  bookingStore.toddlers = 0;
  bookingStore.selectedSeats = [...selectedSeats.value];
  bookingStore.selectedPickup = { 
    name: 'Venue Acara (' + event.value.location_name + ')', 
    address: event.value.location_address || event.value.location_name
  };

  const code = bookingStore.generateBookingCode();
  const payload = {
    code,
    date: new Date().toISOString(),
    event: event.value,
    pickup: bookingStore.selectedPickup,
    customer: { ...bookingStore.customer },
    adults: bookingStore.adults,
    selectedSeats: [...bookingStore.selectedSeats],
    totalPrice: selectedTicket.value.price * quantity.value,
    paymentMethod: selectedPayment.value
  };

  let existing = [];
  try {
    const cached = localStorage.getItem('ajak_bookings');
    if (cached) existing = JSON.parse(cached);
  } catch(e) {}
  existing.push(payload);
  localStorage.setItem('ajak_bookings', JSON.stringify(existing));

  showPaymentModal.value = false;
  router.push('/confirmation');
};
</script>

<template>
  <div class="event-detail-page" v-if="event">
    
    <!-- Desktop Header Banner Area -->
    <div class="event-header-banner desktop-header-view">
      <!-- Blurred background image overlay -->
      <div class="banner-blur-bg" :style="{ backgroundImage: `url(${event.image})` }"></div>
      
      <div class="container banner-content">
        <div class="header-nav">
          <button class="back-btn-top" @click="goBack">

          </button>
          <h1 class="header-event-title">{{ event.name }}</h1>
        </div>
        
        <div class="banner-grid">
          <!-- Left: Banner Image -->
          <div class="banner-image-container">
            <img :src="event.image" :alt="event.name" class="banner-img" />
            <div class="live-event-badge">
              <span class="live-dot"></span>
              <span>Live Event</span>
            </div>
          </div>
          
          <!-- Right: Floating Event Info Card -->
          <div class="details-card-floating">
            <div class="detail-row">
              <Calendar :size="18" class="detail-icon" />
              <div class="detail-text">
                <span>{{ formatEventDates(event) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <Clock :size="18" class="detail-icon" />
              <div class="detail-text">
                <span>{{ event.start_time }} - {{ event.end_time }} {{ event.zone_time }}</span>
              </div>
            </div>

            
            <div class="organizer-section-new">
              <span class="org-label">Diselenggarakan Oleh</span>
              <div class="org-profile-new">
                <img 
                  :src="event.has_creator?.image_url || 'https://api.kolektix.my.id/storage/uploads/creator/logo-k.png'" 
                  :alt="event.has_creator?.name || 'AJAK!'" 
                  class="org-logo-new" 
                />
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Mobile Header Banner Area (Visible on Mobile Only) -->
    <div class="mobile-header-view">
      <div class="mobile-banner-container">
        <img :src="event.image" :alt="event.name" class="mobile-banner-img" />
      </div>
      
      <div class="mobile-event-details-card">
        <h1 class="mobile-event-title">{{ event.name }}</h1>
        
        <div class="mobile-event-meta-list">
          <div class="mobile-meta-row">
            <Calendar :size="20" class="mobile-meta-icon" />
            <span class="mobile-meta-text">{{ formatEventDates(event) }}</span>
          </div>
          <div class="mobile-meta-row">
            <Clock :size="20" class="mobile-meta-icon" />
            <span class="mobile-meta-text">{{ event.start_time }} - {{ event.end_time }} {{ event.zone_time }}</span>
          </div>

        </div>
        
        <div class="mobile-header-divider-dashed"></div>
        
        <div class="mobile-organizer-row">
          <div class="mobile-organizer-left">
            <div class="mobile-organizer-logo-container">
              <img 
                :src="event.has_creator?.image_url || 'https://api.kolektix.my.id/storage/uploads/creator/logo-k.png'" 
                :alt="event.has_creator?.name || 'AJAK!'" 
                class="mobile-organizer-logo-img" 
              />
            </div>
            <div class="mobile-organizer-text">
              <span class="mobile-org-label">Diselenggarakan Oleh</span>
              <span class="mobile-org-name">{{ event.has_creator?.name || 'AJAK!' }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
    
    <!-- Sticky Tabs Navigation -->
    <div class="sticky-tabs-nav-bar" ref="tabsBarRef" :class="{ 'is-sticky': isTabsSticky }">
      <div class="container">
        <div class="tabs-navigation">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'deskripsi' }" 
            @click="activeTab = 'deskripsi'"
          >
            Deskripsi
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'tiket' }" 
            @click="activeTab = 'tiket'"
          >
            Tiket
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'terms' }" 
            @click="activeTab = 'terms'"
          >
            Syarat & Ketentuan
          </button>
        </div>
      </div>
    </div>
    
    <!-- Page Body Area -->
    <div class="event-details-body">
      <div class="container body-content-grid">
        
        <!-- Left: Tab Details -->
        <div class="details-left-col">
          <!-- Description Tab -->
          <div v-if="activeTab === 'deskripsi'" class="tab-card-content description-card">
            <h2 class="section-card-title">Deskripsi Acara</h2>
            <div v-html="event.description || '<p>Tidak ada deskripsi</p>'" class="rich-html-content"></div>
          </div>
          
          <!-- Tickets Tab (Accordion + Inline Seatmap + Step Flow) -->
          <div v-else-if="activeTab === 'tiket'" class="tickets-container-list">
            
            <!-- STEP 1: Select ticket category and seats -->
            <div v-if="currentStep === 1" class="step1-grid">
              <!-- Left column: Tickets and Seatmap List -->
              <div class="step1-left-col">
                <div class="ticket-list-header">
                
                </div>
                
                <div class="tickets-scroll-view">
                  <div 
                    v-for="t in event.has_event_ticket" 
                    :key="t.id" 
                    class="ticket-card-voucher"
                    :id="selectedTicket?.id === t.id ? 'seatmap' : null"
                    :class="{ selected: selectedTicket?.id === t.id && isCanvasOpen }"
                  >
                    <!-- Voucher Side notches -->
                    <div class="ticket-notch notch-left"></div>
                    <div class="ticket-notch notch-right"></div>
                    
                    <!-- Mobile backdrop overlay and seatmap canvas (teleported to body on mobile) -->
                    <Teleport :disabled="!isMobile" v-if="(selectedTicket?.id === t.id && isCanvasOpen) || isSheetClosing" to="body">
                      <!-- Backdrop (rendered only on mobile) -->
                      <div 
                        v-if="isMobile"
                        class="mobile-seatmap-backdrop"
                        :class="{ 'is-closing': isSheetClosing }"
                        @click="clearSelectedTicket"
                        @touchmove.prevent
                      ></div>

                      <!-- If selected, show ONLY the seatmap canvas inside the card -->
                      <div 
                        class="selected-seatmap-canvas-container"
                        :class="{ 'is-closing': isSheetClosing }"
                        :style="{ 
                          transform: `translateY(${sheetDragDeltaY}px)`,
                          transition: isSheetDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
                        }"
                        @click.stop
                      >
                        <!-- Drag Handle — sits OUTSIDE/ABOVE the white card -->
                        <div 
                          class="sheet-drag-handle-area"
                          @touchstart.stop="onSheetDragStart"
                          @touchmove.stop="onSheetDragMove"
                          @touchend.stop="onSheetDragEnd"
                          @mousedown.stop="onSheetDragStart"
                          @mousemove.stop="onSheetDragMove"
                          @mouseup.stop="onSheetDragEnd"
                        >
                          <div class="sheet-drag-handle-pill"></div>
                        </div>

                        <!-- White card — everything below the handle -->
                        <div class="sheet-inner-card">
                          <!-- Mobile Seatmap Header (supports dragging too) -->
                          <div 
                            class="mobile-seatmap-header"
                            @touchstart.stop="onSheetDragStart"
                            @touchmove.stop="onSheetDragMove"
                            @touchend.stop="onSheetDragEnd"
                            @mousedown.stop="onSheetDragStart"
                            @mousemove.stop="onSheetDragMove"
                            @mouseup.stop="onSheetDragEnd"
                          >
                            <button type="button" class="btn-close-seatmap-mobile" @touchstart.stop @click.stop="clearSelectedTicket">✕</button>
                            <h3 class="mobile-seatmap-header-title">Pilih Kursi</h3>
                          </div>
                        <div class="seatmap-canvas-header">
                          <div class="seatmap-canvas-title-group">
                            <span class="seatmap-canvas-badge" :style="{ backgroundColor: t.seat_color || 'var(--primary)' }">
                              {{ t.ticket_category }}
                            </span>
                            <h3 class="seatmap-canvas-ticket-name">{{ t.name }}</h3>
                          </div>
                          <button type="button" class="btn-back-to-tickets" @click="clearSelectedTicket">
                            Kembali
                          </button>
                        </div>

                        <div class="seatmap-canvas-body">
                          <!-- Bus cabin layout -->
                          <div 
                            class="bus-cabin-canvas-viewport"
                            :class="{ 'is-fullscreen-mode': isFullscreen }"
                            @wheel.prevent="onWheel"
                          >
                            <!-- Desktop Legends Overlay (Visible on Desktop Only) -->
                            <div class="inline-legends" @mousedown.stop @touchstart.stop>
                              <div class="legend-item">
                                <span class="legend-box selected"></span>
                                <span>Dipilih</span>
                              </div>
                              <div class="legend-item">
                                <span class="legend-box available"></span>
                                <span>Tersedia</span>
                              </div>
                              <div class="legend-item">
                                <span class="legend-box occupied"></span>
                                <span>Tidak Tersedia</span>
                              </div>
                            </div>

                            <!-- Desktop Zoom Controls Overlay (Visible on Desktop Only) -->
                            <div class="canvas-zoom-controls" @mousedown.stop @touchstart.stop>
                              <button type="button" class="zoom-control-btn" @click="isFullscreen = !isFullscreen" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
                                <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
                                <svg v-else viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"></path></svg>
                              </button>
                              <button type="button" class="zoom-control-btn" @click="zoomIn" title="Zoom In">➕</button>
                              <button type="button" class="zoom-control-btn" @click="zoomOut" title="Zoom Out">➖</button>
                              <button type="button" class="zoom-control-btn text-btn" @click="resetZoomPan">Reset Layout</button>
                            </div>

                            <!-- Mobile Legends (Visible on Mobile Only) -->
                            <div class="mobile-legends-overlay" @touchstart.stop>
                              <div class="legend-item">
                                <span class="legend-box selected"></span>
                                <span>Dipilih</span>
                              </div>
                              <div class="legend-item">
                                <span class="legend-box available"></span>
                                <span>Tersedia</span>
                              </div>
                              <div class="legend-item">
                                <span class="legend-box occupied"></span>
                                <span>Tidak Tersedia</span>
                              </div>
                            </div>

                            <!-- Mobile Zoom Controls (Visible on Mobile Only) -->
                            <div class="mobile-zoom-controls-overlay" @touchstart.stop>
                              <button type="button" class="m-zoom-btn" @click="isFullscreen = !isFullscreen">
                                <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
                                <svg v-else viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"></path></svg>
                              </button>
                              <button type="button" class="m-zoom-btn" @click="zoomIn">➕</button>
                              <button type="button" class="m-zoom-btn" @click="zoomOut">➖</button>
                            </div>

                            <div 
                              class="bus-cabin-container konva-container"
                              style="width: 100%; height: 100%; overflow: hidden; background: #f8fafc; border-radius: 12px; position: relative; z-index: 1;"
                            >
                              <v-stage 
                                :config="{ 
                                  width: 800, 
                                  height: 600, 
                                  draggable: true, 
                                  scaleX: zoom, 
                                  scaleY: zoom 
                                }"
                                @wheel="onWheel"
                              >
                                <v-layer>
                                  <!-- Translate layer to center the layout initially -->
                                  <v-group :config="{ x: 400, y: 100 }">
                                    <template v-for="shape in parsedSeatmap" :key="shape.id">
                                              <!-- Box type (e.g. KEMUDI) -->
                                      <v-group v-if="shape.type === 'box'" :config="shape.groupConfig">
                                        <v-rect :config="shape.rectConfig" />
                                        <v-text :config="shape.textConfig" />
                                      </v-group>

                                      <!-- Seat type -->
                                      <v-group 
                                        v-else-if="shape.type === 'seat'" 
                                        :config="shape.groupConfig"
                                        @click="shape.available ? toggleSeatSelection(shape.id) : null"
                                        @tap="shape.available ? toggleSeatSelection(shape.id) : null"
                                      >
                                        <v-rect :config="shape.rectConfig" />
                                        <v-text :config="shape.textConfig" />
                                      </v-group>

                                    </template>
                                  </v-group>
                                </v-layer>
                              </v-stage>
                            </div>
                          </div>

                          <!-- Mobile Confirm Bar inside the seatmap selection screen -->
                          <!-- <div class="mobile-canvas-confirm-bar">
                            <div class="m-confirm-bar-left">
                              <span class="m-confirm-label">Total Harga</span>
                              <span class="m-confirm-value">{{ selectedSeats.length > 0 ? formatRp(t.price * selectedSeats.length) : 'Rp 0' }}</span>
                            </div>
                            <button type="button" class="btn-confirm-seats-mobile" :disabled="selectedSeats.length === 0" @click="clearSelectedTicket">
                              Lanjut
                            </button>
                          </div> -->
                        </div>
                      </div><!-- end sheet-inner-card -->
                    </div>
                  </Teleport>


                    <!-- If not selected, show the normal ticket details and features accordion -->
                    <!-- If not selected, show the normal ticket details -->
                    <div v-else class="ticket-card-inner">
                      <!-- Top Section (Click to toggle accordion) -->
                      <div class="ticket-top-section" @click="toggleTicketAccordion(t.id)" style="cursor: pointer;">
                        <div class="ticket-top-left">
                          <h3 class="ticket-category-title">{{ t.name }}</h3>
                          <div v-if="t.route" class="ticket-route-info" style="font-size: 0.8rem; color: #64748b; margin-top: 4px; font-weight: 700; text-transform: capitalize;">
                            Rute: {{ t.route.origin_name }} ➔ {{ t.route.destination_name }}
                          </div>
                          <div v-if="t.description" class="ticket-description" style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px; margin-bottom: 8px;">
                            {{ t.description }}
                          </div>
                          <div class="ticket-status-badge" :class="getTicketStatusClass(t)">
                            <span class="status-dot"></span>
                            <span>{{ getTicketStatus(t) }}</span>
                          </div>
                        </div>
                        
                        <div class="ticket-top-right">
                          <div class="ticket-vertical-divider"></div>
                          <div class="ticket-price-box">
                            <span class="ticket-price-label">Harga</span>
                            <div class="ticket-price-value-wrapper">
                              <span class="ticket-price-value">{{ formatRp(t.price) }}</span>
                              <ChevronDown 
                                v-if="event?.facilities && event.facilities.length > 0"
                                :size="18" 
                                class="accordion-chevron-toggle"
                                :class="{ rotated: expandedTicketId === t.id }"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Divider Row with Notches and Dashed Line -->
                      <div class="ticket-divider-row">
                        <div class="ticket-notch notch-left"></div>
                        <div class="ticket-card-divider-dashed-line"></div>
                        <div class="ticket-notch notch-right"></div>
                      </div>
                      
                      <!-- Bottom Section -->
                      <div class="ticket-bottom-section">
                        <!-- Accordion Features Content (Vehicle Features) -->
                        <div v-if="expandedTicketId === t.id && event?.facilities && event.facilities.length > 0" class="ticket-features-accordion-content" @click.stop>
                          <div class="features-title">Fasilitas Shuttle:</div>
                          <div class="features-grid">
                            <div 
                              v-for="fac in event?.facilities" 
                              :key="fac" 
                              class="feature-item"
                            >
                              <component :is="getFacilityIcon(fac)" :size="14" class="feature-icon" />
                              <span>{{ fac }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Bottom Footer Info -->
                        <div class="ticket-bottom-footer-row">
                          <div class="ticket-ending-details">
                            <span class="ending-label">BERAKHIR PADA</span>
                            <span class="ending-value">
                              {{ formatDateLabel(t.ticket_end) }}, {{ formatTimeLabel(t.ending_time) }} WIB
                            </span>
                          </div>
                          
                          <div class="ticket-footer-vertical-divider"></div>
                          
                            <div class="ticket-action-subtotal-group">
                              <!-- Ticket selection quantity selector (visible if available) -->
                              <div class="ticket-quantity-row" v-if="hasAvailableSeats(t)">
                               
                                <div class="quantity-counter-wrapper">
                                  <button 
                                    type="button" 
                                    class="qty-btn" 
                                    :disabled="quantity <= 1" 
                                    @click="decreaseQuantity"
                                  >-</button>
                                  <span class="qty-val">{{ quantity }}</span>
                                  <button 
                                    type="button" 
                                    class="qty-btn" 
                                    :disabled="quantity >= maxTickets" 
                                    @click="increaseQuantity"
                                  >+</button>
                                </div>
                              </div>

                              <div style="display: flex; align-items: center; gap: 12px;">
                                <span class="total-seat-info" style="font-size: 0.82rem; font-weight: 600; color: #64748b;">
                                  Total {{ t.total_seat || event?.total_seat || 0 }} Seat
                                </span>
                                <button 
                                  class="select-ticket-btn"
                                  :class="{ selected: selectedTicket?.id === t.id && isCanvasOpen, 'sold-out': !hasAvailableSeats(t) }"
                                  :disabled="!hasAvailableSeats(t)"
                                  @click.stop="selectTicketCategory(t)"
                                >
                                  {{ !hasAvailableSeats(t) ? 'Habis' : (t.ticket_type_id === 0 ? 'Beli Tiket' : (selectedSeats.length > 0 && selectedTicket?.id === t.id ? `Pilih Seat (${selectedSeats.length})` : 'Pilih Seat')) }}
                                </button>
                              </div>
                              
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right column: Tiket Terpilih summary card -->
              <div class="step1-right-col">
                <div class="selected-summary-card sticky-summary-card">
                  <div class="summary-card-header">
                    <h3 class="summary-card-title">Tiket Dipilih</h3>
                    <button 
                      v-if="selectedTicket && selectedSeats.length > 0" 
                      type="button" 
                      class="btn-edit-seats" 
                      :class="{ 'is-editing': isEditMode }"
                      @click="toggleEditMode"
                    >
                      <span>{{ isEditMode ? 'Selesai Edit' : 'Edit' }}</span>
                      <svg v-if="!isEditMode" class="edit-icon-svg" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                  </div>
                  
                  <!-- Empty state when no seat is chosen -->
                  <div v-if="!selectedTicket || selectedSeats.length === 0" class="empty-summary-state">
                    <div class="info-circle-icon">
                      <Info :size="20" />
                    </div>
                    <p class="info-text">Belum ada kursi yang dipilih</p>
                  </div>

                  <!-- Selected seats info -->
                  <div v-else class="summary-card-body">
                    <div class="summary-ticket-item">
                      <div class="summary-ticket-title-row">
                        <!-- Blue Ticket Icon -->
                        <svg class="ticket-icon-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v14M9 9h.01M9 13h.01M9 17h.01"></path></svg>
                        
                        <span class="summary-ticket-name">Tiket {{ selectedTicket.name }}</span>
                        <span class="summary-ticket-badge-count">{{ selectedSeats.length }}X</span>
                        
                        <button 
                          v-if="isEditMode" 
                          type="button" 
                          class="btn-delete-ticket-summary" 
                          @click="deleteTicketSelection"
                          title="Hapus Tiket"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                      
                      <div class="summary-ticket-seats-row">
                        Seat No: {{ selectedSeats.join(', ') }}
                      </div>
                      
                      <div class="summary-ticket-price-row">
                        {{ formatRp(selectedTicket.price * selectedSeats.length) }}
                      </div>
                    </div>
                    
                    <div class="summary-card-divider-dashes"></div>
                    
                    <div class="summary-total-row">
                      <span class="summary-total-label">Total ({{ selectedSeats.length }} Tiket)</span>
                      <span class="summary-total-price">{{ formatRp(selectedTicket.price * selectedSeats.length) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: Buyer Details form card -->
            <div v-else-if="currentStep === 2 && selectedTicket" class="booking-onpage-form-section">
              <div class="onpage-form-header">
                <button type="button" class="btn-back-to-step1" @click="goBackToStep1">
                  ← Ganti Kursi / Tiket
                </button>
                <h3 class="onpage-form-title">Data Pemesan</h3>
              </div>
              
              <div class="onpage-form-card">
                <div class="onpage-form-grid">
                  <!-- Left column: Summary info -->
                  <div class="onpage-form-left-col">
                    <h4 class="form-subheader mt-0 pt-0" style="border-top: none;">Detail Tiket</h4>
                    
                    <div class="summary-details-box">
                      <div class="summary-detail-row">
                        <span class="sd-label">Kategori</span>
                        <span class="sd-value">{{ selectedTicket.name }}</span>
                      </div>
                      <div class="summary-detail-row">
                        <span class="sd-label">Kursi</span>
                        <span class="sd-value seats-highlight">{{ selectedSeats.join(', ') }}</span>
                      </div>
                      <div class="summary-detail-row">
                        <span class="sd-label">Jumlah</span>
                        <span class="sd-value">{{ quantity }} Tiket</span>
                      </div>
                      <div class="summary-detail-row">
                        <span class="sd-label">Harga per Kursi</span>
                        <span class="sd-value">{{ formatRp(selectedTicket.price) }}</span>
                      </div>
                      <div class="summary-detail-row sd-total-row">
                        <span class="sd-label font-bold">Total Harga</span>
                        <span class="sd-value font-black text-primary">{{ formatRp(selectedTicket.price * selectedSeats.length) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Right column: Input fields -->
                  <div class="onpage-form-right-col">
                    <div class="form-input-group mb-3" v-if="event?.is_name">
                      <label class="form-field-label"><User :size="12" /> Nama Lengkap</label>
                      <input 
                        type="text" 
                        v-model="buyer.name"
                        @input="validateName"
                        @blur="validateName"
                        placeholder="Masukkan nama lengkap"
                        class="sidebar-form-input"
                        :class="{ 'has-error': errors.name }"
                      />
                      <span v-if="errors.name" class="form-error-text">{{ errors.name }}</span>
                    </div>

                    <div class="form-input-group mb-3" v-if="event?.is_email">
                      <label class="form-field-label"><Mail :size="12" /> Email</label>
                      <input 
                        type="email" 
                        v-model="buyer.email"
                        @input="validateEmail"
                        @blur="validateEmail"
                        placeholder="contoh@email.com"
                        class="sidebar-form-input"
                        :class="{ 'has-error': errors.email }"
                      />
                      <span v-if="errors.email" class="form-error-text">{{ errors.email }}</span>
                    </div>

                    <div class="form-input-group mb-3" v-if="event?.is_phone">
                      <label class="form-field-label"><Phone :size="12" /> Nomor WhatsApp</label>
                      <input 
                        type="tel" 
                        v-model="buyer.phone"
                        @input="validatePhone"
                        @blur="validatePhone"
                        placeholder="8123456789"
                        class="sidebar-form-input"
                        :class="{ 'has-error': errors.phone }"
                      />
                      <span v-if="errors.phone" class="form-error-text">{{ errors.phone }}</span>
                    </div>

                    <div class="form-input-group mb-3" v-if="event?.is_noidentity">
                      <label class="form-field-label"><User :size="12" /> Nomor Identitas (KTP/NIK)</label>
                      <input 
                        type="text" 
                        v-model="buyer.identity"
                        @input="validateIdentity"
                        @blur="validateIdentity"
                        placeholder="Masukkan nomor identitas"
                        class="sidebar-form-input"
                        :class="{ 'has-error': errors.identity }"
                      />
                      <span v-if="errors.identity" class="form-error-text">{{ errors.identity }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Terms Tab -->
          <div v-else-if="activeTab === 'terms'" class="tab-card-content terms-card">
            <h2 class="section-card-title">Syarat & Ketentuan</h2>
            <div v-html="event.term_condition || '<p>Tidak ada syarat & ketentuan</p>'" class="rich-html-content"></div>
          </div>
        </div>
        
      </div>
    </div>


    <!-- Sticky Bottom Checkout Bar -->
    <!-- Desktop Bottom Bar View -->
    <div class="booking-bottom-bar desktop-bottom-bar-view">
      <div class="container bottom-bar-container">
        <div class="bottom-bar-left">
          <span class="bottom-bar-ticket-name font-bold" v-if="selectedSeats.length > 0">
            Total {{ selectedSeats.length }} Seat
          </span>
          <span class="bottom-bar-ticket-name" v-else>
            Harga mulai dari
          </span>
          
          <span class="bottom-bar-total-price">
            {{ selectedSeats.length > 0 && selectedTicket ? formatRp(selectedTicket.price * selectedSeats.length) : formatRp(event.priceNum || 0) }}
          </span>
        </div>
        
        <div class="bottom-bar-right">
          <!-- State 1: No seat selected yet -->
          <button 
            v-if="!selectedTicket || selectedSeats.length === 0"
            class="bottom-bar-buy-btn"
            @click="scrollToTickets"
          >
            Pilih Seat
          </button>
          
          <!-- State 2: Seats selected, select step 1 -->
          <button 
            v-else-if="currentStep === 1"
            class="bottom-bar-buy-btn animate-pulse-once"
            @click="goToBuyerDetails"
          >
            Selanjutnya
          </button>
          
          <!-- State 3: Buyer details step 2 -->
          <button 
            v-else-if="currentStep === 2"
            class="bottom-bar-buy-btn"
            :disabled="!isFormValid"
            @click="handleProceedToCheckout"
          >
            Beli Tiket
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Bottom Bar View -->
    <div class="booking-bottom-bar mobile-bottom-bar-view">
      <div class="mobile-bottom-bar-content">
        <!-- Top Row: Price + Detail -->
        <div class="m-bottom-bar-top-row">
          <div class="m-bottom-bar-price-block">
            <span class="m-price-label">TOTAL HARGA</span>
            <span class="m-price-value">
              {{ selectedSeats.length > 0 && selectedTicket ? formatRp(selectedTicket.price * selectedSeats.length) : formatRp(event.priceNum || 0) }}
si            </span>
          </div>
          <div class="m-bottom-bar-detail-link" @click="showMobileDetailSheet = !showMobileDetailSheet">
            <span>({{ selectedSeats.length || 0 }}) Detail</span>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" class="m-detail-chevron" :class="{ 'rotated': showMobileDetailSheet }">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </div>
        </div>
        
        <!-- Bottom Row: Buy Button -->
        <div class="m-bottom-bar-bottom-row">
          <button 
            v-if="!selectedTicket || selectedSeats.length === 0"
            class="m-buy-btn"
            @click="scrollToTickets"
          >
            Beli Tiket Sekarang
          </button>
          
          <button 
            v-else-if="currentStep === 1"
            class="m-buy-btn"
            @click="goToBuyerDetails"
          >
            Beli Tiket Sekarang
          </button>
          
          <button 
            v-else-if="currentStep === 2"
            class="m-buy-btn"
            :disabled="!isFormValid"
            @click="handleProceedToCheckout"
          >
            Beli Tiket Sekarang
          </button>
        </div>
      </div>
    </div>
    
    <!-- Payment Selector Modal Popup -->
    <transition name="modal-fade">
      <div v-if="showPaymentModal" class="payment-modal-overlay" @click.self="showPaymentModal = false">
        <div class="payment-modal">
          <div class="pm-header">
            <h3>Pilih Metode Pembayaran</h3>
            <button class="pm-close" @click="showPaymentModal = false">✕</button>
          </div>
          <div class="pm-body">
            <div class="pm-total">
              <span>Total Tagihan</span>
              <strong>{{ formatRp(selectedTicket.price * quantity) }}</strong>
            </div>
            
            <div class="pm-methods">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id" 
                class="pm-method-label"
                :class="{ active: selectedPayment === method.id }"
              >
                <input type="radio" :value="method.id" v-model="selectedPayment" class="pm-radio" />
                <span class="pm-icon">{{ method.icon }}</span>
                <span class="pm-name">{{ method.name }}</span>
                <Check v-if="selectedPayment === method.id" class="pm-check" :size="16" />
              </label>
            </div>
          </div>
          <div class="pm-footer">
            <button 
              class="pm-submit-btn" 
              :disabled="!selectedPayment" 
              @click="confirmBooking"
            >
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Mobile Detail Sheet (Bottom Sheet) -->
    <transition name="sheet-fade">
      <div v-if="showMobileDetailSheet" class="mobile-sheet-overlay" @click.self="showMobileDetailSheet = false">
        <div class="mobile-sheet-card" @click.stop>
          <div class="mobile-sheet-header">
            <div class="mobile-sheet-title-group">
              <div class="mobile-sheet-drag-handle"></div>
              <h3 class="mobile-sheet-title">Detail Tiket</h3>
            </div>
            <button 
              v-if="selectedTicket && selectedSeats.length > 0" 
              type="button" 
              class="btn-edit-seats-mobile" 
              :class="{ 'is-editing': isEditMode }"
              @click="toggleEditMode"
            >
              <span>{{ isEditMode ? 'Selesai Edit' : 'Edit' }}</span>
              <svg v-if="!isEditMode" class="edit-icon-svg" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="mobile-sheet-close-btn" @click="showMobileDetailSheet = false">✕</button>
          </div>
          
          <div class="mobile-sheet-body">
            <!-- Empty state when no seat is chosen -->
            <div v-if="!selectedTicket || selectedSeats.length === 0" class="empty-summary-state">
              <div class="info-circle-icon">
                <Info :size="20" />
              </div>
              <p class="info-text">Belum ada kursi yang dipilih</p>
            </div>

            <!-- Selected seats info -->
            <div v-else class="mobile-sheet-detail-content">
              <div class="summary-ticket-item">
                <div class="summary-ticket-title-row">
                  <!-- Ticket Icon -->
                  <svg class="ticket-icon-svg" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v14M9 9h.01M9 13h.01M9 17h.01"></path></svg>
                  <span class="summary-ticket-name">Tiket {{ selectedTicket.name }}</span>
                  <span class="summary-ticket-badge-count">{{ selectedSeats.length }}X</span>
                  
                  <button 
                    v-if="isEditMode" 
                    type="button" 
                    class="btn-delete-ticket-summary" 
                    @click="deleteTicketSelection"
                    title="Hapus Tiket"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
                
                <div class="summary-ticket-seats-row">
                  Seat No: {{ selectedSeats.join(', ') }}
                </div>
                
                <div class="summary-ticket-price-row">
                  {{ formatRp(selectedTicket.price * selectedSeats.length) }}
                </div>
              </div>
              
              <div class="summary-card-divider-dashes"></div>
              
              <div class="summary-total-row">
                <span class="summary-total-label">Total ({{ selectedSeats.length }} Tiket)</span>
                <span class="summary-total-price font-bold text-primary">{{ formatRp(selectedTicket.price * selectedSeats.length) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
  </div>
</template>

<style scoped>
:root {
  --primary: #c94c4c;
  --bg-color: #f8fafc;
  --border-color: #e2e8f0;
}

.event-detail-page {
  min-height: 100vh;
  background: var(--bg-color);
}

.mobile-header-view {
  display: none;
}

.desktop-header-view {
  display: block;
}

/* Banner section with solid navy dark blue background */
.event-header-banner {
  background: linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 60%, #0d0d0d 100%);
  color: #ffffff;
  padding: 20px 0 50px; /* reduced top padding from 40px to 20px */
  margin-top: 80px;
  position: relative;
  overflow: hidden; /* prevents scaled blur overlay overflows */
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .event-header-banner {
    margin-top: 60px;
    padding: 20px 0 40px; /* reduced bottom padding on mobile */
  }
}

.banner-blur-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(40px); /* slightly blur image background */
  opacity: 0.25; /* soft color projection overlay */
  transform: scale(1.15); /* hides raw blur edges */
  z-index: 1;
  pointer-events: none;
}

.banner-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 2; /* forces contents above the blur bg */
  margin-top: -10px; /* shift container upward slightly */
}

.header-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-btn-top {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  font-weight: 700;
  align-self: flex-start;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px 0;
}
.back-btn-top:hover {
  color: #ffffff;
}

.header-event-title {
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.5px;
}

.banner-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: flex-start;
}

.banner-image-container {
  position: relative;
  width: 100%;
  height: 360px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-event-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.6);
  padding: 6px 14px;
  border-radius: 20px;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #ff3b30;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px #ff3b30;
}

/* Floating metadata details card */
.details-card-floating {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  color: #334155;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.detail-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
}

.organizer-section-new {
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.org-label {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
}

.org-profile-new {
  display: flex;
  align-items: center;
  background: transparent;
  padding: 4px 0;
}

.org-logo-new {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 12px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .org-logo-new {
    width: 80px;
    height: 80px;
  }
}

[data-theme="dark"] .organizer-section-new {
  border-top-color: rgba(255, 255, 255, 0.08);
}

/* Tabs list styling in sticky nav bar */
.sticky-tabs-nav-bar {
  position: sticky;
  top: 80px;
  z-index: 100;
  background: transparent;
  margin-top: -50px; /* pull up to overlap event-header-banner bottom padding */
  border-bottom: 1px solid transparent;
  box-shadow: none;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .sticky-tabs-nav-bar {
    top: 60px;
    margin-top: 0 !important;
    background: #ffffff !important;
    border-top: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  }
  
  /* Mobile Event Header Layout Styling */
  .desktop-header-view {
    display: none !important;
  }
  
  .mobile-header-view {
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    padding: 16px 20px;
    margin-top: 60px; /* offset for top header bar */
  }
  
  .mobile-banner-container {
    width: 100%;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .mobile-banner-img {
    width: 100%;
    aspect-ratio: 16 / 6.2;
    object-fit: cover;
    display: block;
  }
  
  .mobile-event-details-card {
    display: flex;
    flex-direction: column;
    padding: 18px 0 8px;
  }
  
  .mobile-event-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 0 0 16px;
    letter-spacing: -0.5px;
  }
  
  .mobile-event-meta-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .mobile-meta-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .mobile-meta-icon {
    color: #8e9cae;
  }
  
  .mobile-meta-text {
    font-size: 1.05rem;
    font-weight: 600;
    color: #0f172a;
  }
  
  .mobile-header-divider-dashed {
    border-top: 1.5px dashed #dbe1e8;
    margin: 18px 0;
    width: 100%;
  }
  
  .mobile-organizer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .mobile-organizer-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .mobile-organizer-logo-container {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
  }
  
  .mobile-organizer-logo-img {
    width: 80%;
    height: 80%;
    object-fit: contain;
  }
  
  .mobile-organizer-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .mobile-org-label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 600;
  }
  
  .mobile-org-name {
    font-size: 1.05rem;
    color: #0f172a;
    font-weight: 800;
  }
  
  .mobile-organizer-chat-btn {
    background: none;
    border: none;
    padding: 8px;
    color: #002d62;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }
  
  .mobile-organizer-chat-btn:active {
    transform: scale(0.95);
  }
  
  .tab-btn {
    color: #8e9cae !important;
  }
  
  .tab-btn:hover {
    color: #475569 !important;
  }
  
  .tab-btn.active {
    color: #0f172a !important;
  }
  
  .tab-btn.active::after {
    background-color: var(--primary) !important;
  }
  
  /* Mobile Bottom Checkout Bar overrides */
  .desktop-bottom-bar-view {
    display: none !important;
  }
  
  .mobile-bottom-bar-view {
    display: block !important;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: var(--card-bg, #FAF9F9);
    border-top: 1px solid var(--border-color);
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.04);
    padding: 8px 16px;
  }
  
  .mobile-bottom-bar-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .m-bottom-bar-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .m-bottom-bar-price-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .m-price-label {
    font-size: 0.6rem;
    color: var(--text-light, #6b6b6b);
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  
  .m-price-value {
    font-size: 1.15rem;
    font-weight: 900;
    color: var(--text-dark, #2A2A2A);
  }
  
  .m-bottom-bar-detail-link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--primary, #C94C4C);
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
  }
  
  .m-detail-chevron {
    color: var(--primary, #C94C4C);
    margin-top: 1px;
    transition: transform 0.2s ease;
  }

  .m-detail-chevron.rotated {
    transform: rotate(180deg);
  }
  
  .m-bottom-bar-bottom-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }
  
  .m-buy-btn {
    flex-grow: 1;
    background-color: var(--primary, #C94C4C);
    color: #ffffff;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 800;
    text-align: center;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(201, 76, 76, 0.2);
    transition: transform 0.2s;
  }
  .m-buy-btn:active {
    transform: scale(0.98);
  }
}

/* Dark Theme Support for Mobile Event Header */
[data-theme="dark"] .mobile-header-view {
  background-color: var(--card-bg, #1a1a1a);
}

[data-theme="dark"] .mobile-event-title,
[data-theme="dark"] .mobile-meta-text,
[data-theme="dark"] .mobile-org-name {
  color: #f1f5f9;
}

[data-theme="dark"] .mobile-organizer-logo-container {
  border-color: rgba(255, 255, 255, 0.08);
  background-color: #1a1a1a;
}

[data-theme="dark"] .mobile-header-divider-dashed {
  border-color: rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .mobile-organizer-chat-btn {
  color: #3b82f6;
}

[data-theme="dark"] .sticky-tabs-nav-bar {
  background: var(--card-bg, #1a1a1a) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

[data-theme="dark"] .tab-btn {
  color: #71717a !important;
}

[data-theme="dark"] .tab-btn.active {
  color: #f4f4f5 !important;
}

[data-theme="dark"] .mobile-bottom-bar-view {
  background-color: var(--card-bg, #1a1a1a) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

[data-theme="dark"] .m-price-value,
[data-theme="dark"] .m-bottom-bar-detail-link,
[data-theme="dark"] .m-detail-chevron {
  color: #f1f5f9 !important;
}

[data-theme="dark"] .m-buy-btn {
  background-color: var(--primary, #C94C4C) !important;
  box-shadow: 0 4px 12px rgba(201, 76, 76, 0.3) !important;
}

/* ===== MOBILE BOTTOM SHEET ===== */
.mobile-sheet-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.mobile-sheet-card {
  background-color: var(--card-bg, #FAF9F9);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

[data-theme="dark"] .mobile-sheet-card {
  background-color: var(--card-bg, #1a1a1a);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
}

.mobile-sheet-drag-handle {
  width: 36px;
  height: 4px;
  background-color: #cbd5e1;
  border-radius: 2px;
  margin: 0 auto 12px;
}

[data-theme="dark"] .mobile-sheet-drag-handle {
  background-color: #475569;
}

.mobile-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;
}

.mobile-sheet-title-group {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.mobile-sheet-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-dark, #2A2A2A);
  margin: 0;
}

.mobile-sheet-close-btn {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-light, #6b6b6b);
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px 8px;
}

.mobile-sheet-body {
  overflow-y: auto;
  flex-grow: 1;
  padding-bottom: 20px;
}

.mobile-sheet-detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Animations/Transitions for bottom sheet */
.sheet-fade-enter-active, .sheet-fade-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-fade-enter-active .mobile-sheet-card,
.sheet-fade-leave-active .mobile-sheet-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-fade-enter-from, .sheet-fade-leave-to {
  opacity: 0;
}

.sheet-fade-enter-from .mobile-sheet-card,
.sheet-fade-leave-to .mobile-sheet-card {
  transform: translateY(100%);
}

/* When the tabs bar sticks */
.sticky-tabs-nav-bar.is-sticky {
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.tabs-navigation {
  display: flex;
  gap: 24px;
}

@media (max-width: 768px) {
  .tabs-navigation {
    gap: 16px;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    padding: 0 4px;
  }
  /* hide scrollbar for clean aesthetics */
  .tabs-navigation::-webkit-scrollbar {
    display: none;
  }
}

.tab-btn {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 800;
  padding: 14px 0;
  position: relative;
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
  transition: color 0.2s ease;
}

@media (max-width: 768px) {
  .tab-btn {
    font-size: 0.85rem;
    padding: 12px 0;
  }
}
.tab-btn:hover {
  color: #ffffff;
}
.tab-btn.active {
  color: #ffffff;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
}

/* Adjust tab button colors when sticky is active (light theme defaults) */
.sticky-tabs-nav-bar.is-sticky .tab-btn {
  color: #64748b;
}
.sticky-tabs-nav-bar.is-sticky .tab-btn:hover {
  color: #0f172a;
}
.sticky-tabs-nav-bar.is-sticky .tab-btn.active {
  color: var(--primary);
}

/* Dark theme overrides for sticky tabs button colors */
[data-theme="dark"] .sticky-tabs-nav-bar.is-sticky .tab-btn {
  color: rgba(255, 255, 255, 0.6);
}
[data-theme="dark"] .sticky-tabs-nav-bar.is-sticky .tab-btn:hover {
  color: #ffffff;
}
[data-theme="dark"] .sticky-tabs-nav-bar.is-sticky .tab-btn.active {
  color: var(--primary);
}

/* Body container area styling */
.event-details-body {
  background: var(--bg-color);
  padding: 40px 0 160px;
}

.body-content-grid {
  margin: 0 auto;
}

.details-left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-card-content {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.section-card-title {
  font-size: 1.3rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 16px;
}

.rich-html-content {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.7;
}

/* Voucher ticket component list */
.ticket-list-header {
  margin-bottom: 12px;
}

.ticket-count-label {
  font-size: 0.8rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tickets-scroll-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-card-voucher {
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid var(--border-color);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 16px -6px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.ticket-card-voucher:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: var(--primary);
}

/* Card Ticket Layout overrides matching reference */
.ticket-card-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.ticket-top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: #ffffff;
  transition: background-color 0.2s;
}
.ticket-top-section:hover {
  background: #fafafb;
}

.ticket-top-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ticket-top-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.ticket-vertical-divider {
  width: 1px;
  height: 38px;
  background-color: var(--border-color, #e2e8f0);
  margin-right: 4px;
}

.ticket-price-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ticket-price-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.ticket-price-value-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ticket-price-value-wrapper .accordion-chevron-toggle {
  margin-left: 0;
  padding: 0;
}

.ticket-price-value {
  font-size: 1.45rem;
  font-weight: 900;
  color: #3f3f46;
}

/* Red / Green dot ticket status badge */
.ticket-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff1f2; /* soft red */
  color: #ef4444; /* red text */
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  align-self: flex-start;
}
.ticket-status-badge .status-dot {
  width: 6px;
  height: 6px;
  background-color: #ef4444;
  border-radius: 50%;
  display: inline-block;
}

/* Green available overrides */
.ticket-status-badge:not(.sold-out) {
  background: #f0fdf4; /* soft green */
  color: #22c55e;
}
.ticket-status-badge:not(.sold-out) .status-dot {
  background-color: #22c55e;
}

/* Ticket divider line & side notches */
.ticket-divider-row {
  position: relative;
  width: 100%;
  height: 0;
  z-index: 5;
}

.ticket-card-divider-dashed-line {
  border-top: 1.5px dashed var(--border-color);
  width: 100%;
  margin: 0;
}

.ticket-notch {
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--bg-color); /* matches page background */
  border-radius: 50%;
  top: -10px;
  z-index: 10;
  border: 1.5px solid var(--border-color);
}

.notch-left {
  left: -11px;
}

.notch-right {
  right: -11px;
}

/* Bottom section styles */
.ticket-bottom-section {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding: 24px 28px;
}

.ticket-bottom-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.ticket-ending-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ending-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ending-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #3f3f46;
}

.ticket-footer-vertical-divider {
  width: 1px;
  height: 48px;
  background-color: var(--border-color, #e2e8f0);
  margin: 0 16px;
  align-self: center;
}

.ticket-action-subtotal-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 18px;
  flex-shrink: 0;
}

.ticket-quantity-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ticket-quantity-row .quantity-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
}

.ticket-subtotal-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.subtotal-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
}

.subtotal-value {
  font-size: 1.25rem;
  font-weight: 900;
  color: #3f3f46;
}

.select-ticket-btn {
  padding: 10px 24px;
  background: var(--primary);
  color: #ffffff;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 120px;
  text-align: center;
}
.select-ticket-btn:hover:not(:disabled) {
  background: #b34242;
  transform: translateY(-1px);
}
.select-ticket-btn:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border: 1px solid #e2e8f0;
}
.select-ticket-btn.selected {
  background: #10b981;
  color: #ffffff;
}

/* Dark theme support for ticket cards */
[data-theme="dark"] .ticket-top-section,
[data-theme="dark"] .ticket-bottom-section {
  background: var(--card-bg, #1a1a1a);
}

[data-theme="dark"] .ticket-top-section:hover {
  background: #252525;
}

[data-theme="dark"] .ticket-category-title,
[data-theme="dark"] .ticket-price-value,
[data-theme="dark"] .ending-value,
[data-theme="dark"] .subtotal-value {
  color: #e4e4e7;
}

[data-theme="dark"] .select-ticket-btn:disabled {
  background: #27272a;
  color: #71717a;
  border-color: rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .ticket-status-badge {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
[data-theme="dark"] .ticket-status-badge .status-dot {
  background-color: #f87171;
}

[data-theme="dark"] .ticket-status-badge:not(.sold-out) {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}
[data-theme="dark"] .ticket-status-badge:not(.sold-out) .status-dot {
  background-color: #4ade80;
}

/* Sidebar selected tickets container */
.sidebar-selected-ticket-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 140px;
}

.sidebar-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1.5px solid #f1f5f9;
  padding-bottom: 12px;
}

.sidebar-card-title {
  font-size: 1.05rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.edit-selection-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  background: none;
  border: none;
}
.edit-selection-btn:hover {
  text-decoration: underline;
}

.empty-selection-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 16px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px dashed var(--border-color);
  text-align: center;
  gap: 10px;
}

.info-circle-icon {
  color: #94a3b8;
  background: #f1f5f9;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-text {
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

.selected-ticket-details-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Sidebar selected details results style */
.st-selected-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.st-compact-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.st-compact-price {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 700;
}

.selected-seats-summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
}

.result-item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.82rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
}
.result-item-row.no-border {
  border-bottom: none;
  padding-bottom: 0;
}

.result-label {
  color: #64748b;
  font-weight: 600;
}

.result-val {
  color: #0f172a;
  font-weight: 700;
  text-align: right;
}

.seats-val {
  color: var(--primary);
  font-weight: 850;
  font-size: 0.85rem;
}

.no-seats-selected {
  color: #94a3b8;
  font-style: italic;
  font-weight: 500;
}

.sidebar-divider-dashed {
  border-top: 1.5px dashed var(--border-color);
  margin: 12px 0;
}

.pricing-summary-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.price-summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.grand-total-row {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 900;
  border-top: 1.5px solid #f1f5f9;
  padding-top: 8px;
  margin-top: 2px;
}

.checkout-submit-btn-sidebar {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(201, 76, 76, 0.15);
  text-align: center;
}
.checkout-submit-btn-sidebar:hover:not(:disabled) {
  background: #b34242;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(201, 76, 76, 0.25);
}
.checkout-submit-btn-sidebar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Accordion Facilities styling */
.ticket-features-accordion-content {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color, #f1f5f9);
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  padding-bottom: 14px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-toggle-accordion-details {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 800;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  margin-top: 6px;
  align-self: flex-start;
  transition: all 0.2s ease;
}

.btn-toggle-accordion-details:hover {
  color: #b34242;
  text-decoration: underline;
}

.btn-toggle-accordion-details .accordion-chevron-toggle {
  transition: transform 0.2s ease;
}

.btn-toggle-accordion-details .accordion-chevron-toggle.rotated {
  transform: rotate(180deg);
}

.accordion-quantity-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1.5px dashed var(--border-color);
}

.features-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #475569;
  font-weight: 600;
}

.feature-icon {
  color: var(--primary);
}

.accordion-chevron-toggle {
  color: #64748b;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 4px;
  margin-left: auto;
}

.accordion-chevron-toggle.rotated {
  transform: rotate(180deg);
}

/* Selected seatmap canvas container styles */
.selected-seatmap-canvas-container {
  padding: 24px;
  background: var(--card-bg, #ffffff);
  width: 100%;
}

.mobile-seatmap-header {
  display: none;
}

.seatmap-canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.5px dashed var(--border-color);
  padding-bottom: 16px;
  margin-bottom: 18px;
}

.seatmap-canvas-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.seatmap-canvas-ticket-name {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 0;
}

.seatmap-canvas-badge {
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 12px;
  letter-spacing: 0.5px;
}

.btn-back-to-tickets {
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  background: none;
  border: 1.5px solid var(--primary);
  border-radius: 8px;
  padding: 6px 12px;
  transition: all 0.2s;
}
.btn-back-to-tickets:hover {
  background: var(--primary);
  color: #ffffff;
}

.seatmap-canvas-body {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.inline-legends {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.inline-cabin-box {
  background: #f8fafc;
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  padding: 16px 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid #cbd5e1;
}

.legend-box.selected {
  background: #ef4444;
  border-color: #ef4444;
}

.legend-box.available {
  background: #ffffff;
}

.legend-box.occupied {
  background: #cbd5e1;
}

/* Bus grid alignment styling */
.bus-cabin-canvas-viewport {
  position: relative;
  width: 100%;
  height: 420px;
  overflow: hidden;
  background-color: #dbe1e8; /* Slate light blue-grey background matching the image */
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.02), 0 4px 14px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s ease;
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none; /* disables browser gestures for custom touch panning */
}

.bus-cabin-canvas-viewport:active {
  cursor: grabbing;
}

.is-fullscreen-mode {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 99999 !important;
  margin: 0 !important;
  border-radius: 0 !important;
  background: #f8fafc !important;
}

.mobile-legends-overlay,
.mobile-zoom-controls-overlay,
.sheet-drag-handle-area,
.mobile-seatmap-backdrop {
  display: none;
}

.canvas-zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 6px 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.zoom-control-btn {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  color: #334155;
}

.zoom-control-btn:hover {
  border-color: var(--primary);
  background: #fff5f5;
  color: var(--primary);
}

.zoom-control-btn.text-btn {
  width: auto;
  padding: 0 12px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #475569;
}

.zoom-control-btn.text-btn:hover {
  color: var(--primary);
}

.bus-cabin-container {
  position: relative; /* relative parent for absolute coordinates */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 40px;
  z-index: 10;
}

.canvas-grid-bg {
  position: absolute;
  top: -3000px;
  bottom: -3000px;
  left: -3000px;
  right: -3000px;
  background-image: 
    linear-gradient(rgba(181, 184, 190, 0.778) 1px, transparent 1px),
    linear-gradient(90deg, rgba(181, 184, 190, 0.778) 1px, transparent 1px);
  background-size: 30px 30px;
  background-position: center center;
  z-index: -2;
  pointer-events: none;
}

.canvas-axis-x {
  position: absolute;
  top: 50%;
  left: -3000px;
  right: -3000px;
  height: 1px;
  background-color: rgba(181, 184, 190, 0.778); /* axis horizontal coordinate line */
  z-index: -1;
  pointer-events: none;
}

.canvas-axis-y {
  position: absolute;
  left: 50%;
  top: -3000px;
  bottom: -3000px;
  width: 1px;
  background-color: rgba(181, 184, 190, 0.778); /* axis vertical coordinate line */
  z-index: -1;
  pointer-events: none;
}

.bus-cockpit-front {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1.5px dashed #cbd5e1;
  padding-bottom: 6px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 850;
  margin-bottom: 4px;
}

.bus-grid-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seat-pair-col {
  display: flex;
  gap: 6px;
}

.door-placeholder-col {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px; /* equal to two seats + gap */
  height: 26px;
  font-size: 0.62rem;
  font-weight: 800;
  color: #94a3b8;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: #f1f5f9;
}

.row-num-badge {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  width: 14px;
  text-align: center;
}

.cabin-seat-btn {
  position: relative; /* important for absolute tooltip positioning */
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.cabin-seat-btn:hover:not(:disabled) {
  border-color: #c94c4c;
  background: #fff5f5;
}

.cabin-seat-btn.selected {
  background: #c94c4c !important;
  border-color: #c94c4c !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(201, 76, 76, 0.2);
}

/* Tooltip styles */
.seat-tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #0f172a;
  color: #ffffff;
  text-align: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.62rem;
  font-weight: 800;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  pointer-events: none; /* so cursor clicks don't hit the tooltip */
}

/* Tooltip arrow */
.seat-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -4px;
  border-width: 4px;
  border-style: solid;
  border-color: #0f172a transparent transparent transparent;
}

.cabin-seat-btn:hover .seat-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(-2px);
}

.cabin-seat-btn:disabled {
  background: #cbd5e1;
  border-color: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
}

.seat-cross {
  font-size: 0.62rem;
}

.quantity-counter-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 4px;
  align-self: flex-start;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}
.qty-btn:hover:not(:disabled) {
  background: #e2e8f0;
}
.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-val {
  font-size: 1.05rem;
  font-weight: 800;
  min-width: 24px;
  text-align: center;
}

.sidebar-form-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  font-family: inherit;
  font-size: 0.88rem;
  outline: none;
  transition: all 0.2s;
}
.sidebar-form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(201, 76, 76, 0.08);
}
.sidebar-form-input.has-error {
  border-color: #ef4444;
}

.form-field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
}

.form-subheader {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.form-error-text {
  font-size: 0.7rem;
  font-weight: 700;
  color: #ef4444;
  margin-top: 2px;
  display: block;
}

/* ===== PAYMENT MODAL ===== */
.payment-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.payment-modal {
  background: #ffffff;
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.pm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1.5px solid #f1f5f9;
}

.pm-header h3 {
  font-size: 1.05rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.pm-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
}

.pm-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pm-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.pm-total span {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 700;
}

.pm-total strong {
  font-size: 1.2rem;
  font-weight: 900;
  color: #0f172a;
}

.pm-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pm-method-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.pm-method-label:hover {
  background: #f8fafc;
  border-color: var(--primary);
}

.pm-method-label.active {
  background: rgba(201, 76, 76, 0.03);
  border-color: var(--primary);
}

.pm-radio {
  display: none;
}

.pm-icon {
  font-size: 1.3rem;
}

.pm-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f172a;
}

.pm-check {
  margin-left: auto;
  color: var(--primary);
}

.pm-footer {
  padding: 14px 20px;
  border-top: 1.5px solid #f1f5f9;
  background: #f8fafc;
}

.pm-submit-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(201, 76, 76, 0.15);
}

.pm-submit-btn:hover:not(:disabled) {
  background: #b34242;
  transform: translateY(-1px);
}

.pm-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


/* Modal Fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Onpage Form Section */
.booking-onpage-form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.onpage-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.onpage-form-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 0;
}

.selected-ticket-info-pill {
  background: var(--bg-color);
  border: 1.5px solid var(--border-color);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--primary);
}

.onpage-form-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  border: 1.5px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.onpage-form-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  align-items: start;
}

/* Step 1 Two-Column Layout Grid */
.step1-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  align-items: start;
  width: 100%;
}

.step1-left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.step1-right-col {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 150px;
  align-self: start;
  z-index: 10;
  transition: top 0.3s ease;
}

@media (max-width: 992px) {
  .step1-right-col {
    position: relative;
    top: 0;
  }
}

.sticky-summary-card {
  position: relative;
  top: 0;
}

.empty-summary-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: #fafafb;
  text-align: center;
  gap: 12px;
}

/* Tiket Terpilih Card in Step 1 */
.selected-summary-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.summary-card-header {
  padding: 16px 24px;
  border-bottom: 1.5px dashed var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-card-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 0;
}

.summary-card-ticket-name {
  background: var(--bg-color);
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.btn-edit-seats {
  color: var(--primary, #C94C4C);
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  background: none;
  border: none;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.btn-edit-seats:hover {
  text-decoration: underline;
  color: #b34242;
}

.edit-icon-svg {
  margin-top: 1px;
}

.summary-ticket-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.summary-ticket-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ticket-icon-svg {
  color: var(--primary, #C94C4C);
  flex-shrink: 0;
}

.summary-ticket-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.summary-ticket-badge-count {
  background-color: #ef4444; /* Red badge */
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-ticket-seats-row {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 600;
  padding-left: 24px; /* Align nicely under name */
}

.summary-ticket-price-row {
  align-self: flex-end;
  font-size: 1.05rem;
  font-weight: 900;
  color: #0f172a;
}

.summary-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
}

.summary-total-label {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.summary-total-price {
  font-size: 1.15rem;
  font-weight: 950;
  color: #0f172a;
}

.sd-total-row {
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
  margin-top: 4px;
}

.summary-card-divider-dashes {
  border-top: 1px solid #f1f5f9;
  margin: 10px 0;
}

[data-theme="dark"] .summary-card-divider-dashes {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.summary-card-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.summary-info-label {
  color: #64748b;
  font-weight: 600;
}

.summary-info-value {
  color: #0f172a;
  font-weight: 800;
}

.highlighted-seats {
  color: var(--primary);
  background: rgba(201, 76, 76, 0.05);
  padding: 4px 10px;
  border-radius: 6px;
}

/* Step 2 Form Card Adjustments */
.btn-back-to-step1 {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  background: none;
  border: 1.5px solid var(--primary);
  border-radius: 8px;
  padding: 6px 12px;
  transition: all 0.2s;
}
.btn-back-to-step1:hover {
  background: var(--primary);
  color: #ffffff;
}

.summary-details-box {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.sd-label {
  color: #64748b;
  font-weight: 600;
}

.sd-value {
  color: #0f172a;
  font-weight: 800;
  text-align: right;
}

.seats-highlight {
  color: var(--primary);
}

/* Sticky Bottom Checkout Bar */
.desktop-bottom-bar-view {
  display: block;
}

.mobile-bottom-bar-view {
  display: none;
}

.booking-bottom-bar.desktop-bottom-bar-view {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1.5px solid var(--border-color);
  box-shadow: 0 -10px 30px rgba(201, 76, 76, 0.05);
  padding: 16px 0;
}

.bottom-bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.bottom-bar-left {
  display: flex;
  flex-direction: column;
}

.bottom-bar-ticket-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bottom-bar-total-price {
  font-size: 1.5rem;
  font-weight: 950;
  color: var(--primary);
}

.bottom-bar-buy-btn {
  background: var(--primary);
  color: #ffffff;
  padding: 14px 44px;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 800;
  box-shadow: var(--shadow-btn);
  cursor: pointer;
  transition: all 0.2s;
}
.bottom-bar-buy-btn:hover:not(:disabled) {
  background: #b34242;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201, 76, 76, 0.4);
}
.bottom-bar-buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Bottom bar transition */
.bottom-bar-fade-enter-active,
.bottom-bar-fade-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
}
.bottom-bar-fade-enter-from,
.bottom-bar-fade-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Responsive queries */
@media (max-width: 992px) {
  .step1-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .banner-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .banner-image-container {
    height: 240px;
  }
  


  .onpage-form-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 576px) {
  .banner-image-container {
    height: 180px;
  }

  .bottom-bar-container {
    padding: 0 20px;
  }

  .bottom-bar-total-price {
    font-size: 1.25rem;
  }

  .bottom-bar-buy-btn {
    padding: 10px 24px;
    font-size: 0.9rem;
  }

  /* Responsive Ticket Category Card Overrides (Mobile) */
  .ticket-top-section {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0 !important;
    padding: 16px 20px !important;
  }

  .ticket-top-left {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 100% !important;
    border-bottom: 1.5px dashed var(--border-color, #e2e8f0);
    padding-bottom: 14px;
    margin-bottom: 14px;
  }

  .ticket-top-right {
    width: 100% !important;
    justify-content: flex-start !important;
    gap: 0 !important;
  }

  .ticket-vertical-divider {
    display: none !important;
  }

  .ticket-price-box {
    display: flex;
    flex-direction: column;
    align-items: flex-start !important;
    width: 100% !important;
  }

  .ticket-price-value-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between !important;
    width: 100% !important;
  }

  .ticket-price-value {
    font-size: 1.05rem !important;
  }

  .ticket-price-label {
    font-size: 0.62rem !important;
  }

  .ticket-price-value-wrapper .accordion-chevron-toggle {
    margin-left: 0 !important;
  }

  .features-title {
    font-size: 0.72rem !important;
  }

  .feature-item {
    font-size: 0.72rem !important;
  }

  .ticket-bottom-section {
    padding: 16px 20px !important;
  }

  .ticket-bottom-footer-row {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: flex-end !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .ticket-footer-vertical-divider {
    display: none !important;
  }

  .ticket-ending-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 2px;
  }

  .ticket-ending-details .ending-label {
    font-size: 0.55rem !important;
  }

  .ticket-ending-details .ending-value {
    font-size: 0.68rem !important;
    font-weight: 800 !important;
  }

  .ticket-action-subtotal-group {
    width: auto !important;
    align-items: flex-end !important;
    gap: 8px !important;
  }

  .ticket-quantity-row {
    justify-content: flex-end !important;
    width: auto !important;
    margin: 0 !important;
  }

  .ticket-quantity-row .quantity-counter-wrapper {
    padding: 2px !important;
    gap: 6px !important;
    border-radius: 8px !important;
    width: fit-content !important;
  }

  .ticket-quantity-row .qty-btn {
    width: 24px !important;
    height: 24px !important;
    font-size: 0.8rem !important;
    border-radius: 6px !important;
  }

  .ticket-quantity-row .qty-val {
    font-size: 0.8rem !important;
    min-width: 16px !important;
  }

  .select-ticket-btn {
    width: auto !important;
    min-width: 90px !important;
    text-align: center;
    padding: 6px 14px !important;
    font-size: 0.8rem !important;
    min-height: 32px !important;
    border-radius: 8px !important;
  }

  .step1-right-col {
    display: none !important;
  }
}

@media (max-width: 480px) {
  /* Inherit mobile styling from 576px */
}

/* ===== FULLSCREEN SEATMAP MODAL ===== */
.fullscreen-seatmap-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.fullscreen-seatmap-card {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  background-color: var(--card-bg, #ffffff);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.fullscreen-card-header {
  padding: 20px 28px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--card-bg, #ffffff);
}

.fullscreen-header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.fullscreen-title {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--text-dark, #0f172a);
  margin-bottom: 0;
}

.fullscreen-selected-seats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fs-seats-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-light, #64748b);
}

.fs-seats-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.fs-seat-pill {
  background-color: #2563eb; /* Blue seat pills matching second mockup */
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.fullscreen-close-btn-top {
  background: none;
  border: none;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-light, #64748b);
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}
.fullscreen-close-btn-top:hover {
  color: var(--primary, #C94C4C);
  transform: scale(1.1);
}

.fs-viewport {
  flex-grow: 1;
  height: auto; /* override 420px limit */
  min-height: 0;
  background-color: #dbe1e8; /* Slate light blue-grey background */
  border-left: none;
  border-right: none;
  border-radius: 0;
}

.fs-floating-controls {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.fs-float-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #334155;
  transition: all 0.2s;
  font-weight: 900;
}
.fs-float-btn:hover {
  border-color: var(--primary, #C94C4C);
  background-color: #fff5f5;
  color: var(--primary, #C94C4C);
}

.fullscreen-card-footer {
  padding: 16px 28px;
  border-top: 1px solid var(--border-color, #e2e8f0);
  background-color: var(--card-bg, #ffffff);
  display: flex;
  justify-content: center;
}

.fullscreen-close-btn-bottom {
  width: 100%;
  padding: 14px;
  background-color: var(--primary, #C94C4C);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(201, 76, 76, 0.25);
}
.fullscreen-close-btn-bottom:hover {
  background-color: #b34242;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(201, 76, 76, 0.35);
}

/* Dark theme overrides for fullscreen modal */
[data-theme="dark"] .fullscreen-seatmap-card {
  background-color: var(--card-bg, #1a1a1a);
  border-color: rgba(255, 255, 255, 0.08);
}
[data-theme="dark"] .fullscreen-card-header,
[data-theme="dark"] .fullscreen-card-footer {
  background-color: var(--card-bg, #1a1a1a);
  border-color: rgba(255, 255, 255, 0.08);
}
[data-theme="dark"] .fs-floating-controls {
  background-color: rgba(26, 26, 26, 0.85);
}
[data-theme="dark"] .fs-float-btn {
  background-color: #1a1a1a;
  border-color: #334155;
  color: #f1f5f9;
}

/* Responsive fullscreen queries */
@media (max-width: 768px) {
  .fullscreen-seatmap-overlay {
    padding: 12px;
  }
  .fullscreen-seatmap-card {
    height: 95vh;
    border-radius: 16px;
  }
  .fullscreen-card-header {
    padding: 16px 20px;
  }
  .fullscreen-title {
    font-size: 1.2rem;
  }
  .fs-floating-controls {
    top: 16px;
    right: 16px;
  }
  
  /* ===========================================================
   * BOTTOM SHEET - Mobile Seatmap Drawer
   * =========================================================== */

  /* Backdrop overlay */
  .mobile-seatmap-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.52);
    z-index: 1998;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: backdropFadeIn 0.28s ease forwards;
  }

  @keyframes backdropFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes backdropFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .mobile-seatmap-backdrop.is-closing {
    animation: backdropFadeOut 0.35s ease forwards;
    pointer-events: none;
  }

  /* Outer shell — transparent, so drag handle floats above white card */
  .selected-seatmap-canvas-container {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    /* Extra height to give the handle room above the card */
    height: calc(92vh + 0px);
    max-height: 94vh;
    z-index: 1999;
    background: transparent;   /* transparent — card below handles bg */
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: visible;           /* allow handle to float above */
    animation: sheetSlideUp 0.38s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }

  .selected-seatmap-canvas-container.is-closing {
    animation: sheetSlideDown 0.38s cubic-bezier(0.32, 0.72, 0, 1) forwards !important;
    pointer-events: none;
  }

  @keyframes sheetSlideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes sheetSlideDown {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }

  /* Drag handle — floats in the dark backdrop above the white card */
  .sheet-drag-handle-area {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px 0 10px;
    cursor: grab;
    touch-action: none;
    flex-shrink: 0;
    background: transparent;   /* transparent — shows backdrop behind */
    z-index: 1;
  }

  .sheet-drag-handle-area:active {
    cursor: grabbing;
  }

  .sheet-drag-handle-pill {
    width: 42px;
    height: 5px;
    border-radius: 100px;
    background-color: rgba(255, 255, 255, 0.55);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  /* White card — the actual visible bottom sheet content */
  .sheet-inner-card {
    flex: 1;
    background-color: var(--bg-color, #FFF8F8);
    border-radius: 20px 20px 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
    box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.22), 0 -2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Mobile header inside the inner card */
  .sheet-inner-card .seatmap-canvas-header {
    display: none !important;
  }

  .mobile-seatmap-header {
    display: flex !important;
    align-items: center;
    gap: 12px;
    padding: 8px 16px 10px;
    background-color: var(--bg-color, #FFF8F8);
    border-bottom: 1px solid var(--border-color);
    width: 100%;
    z-index: 30;
    flex-shrink: 0;
  }

  .btn-close-seatmap-mobile {
    background: rgba(0, 0, 0, 0.06);
    border: none;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-dark, #2A2A2A);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 5px 8px;
    border-radius: 8px;
    transition: background 0.2s, transform 0.2s;
  }

  .btn-close-seatmap-mobile:active {
    transform: scale(0.92);
    background: rgba(0, 0, 0, 0.12);
  }

  .mobile-seatmap-header-title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-dark, #2A2A2A);
    margin-bottom: 0;
  }
  
  /* Seatmap body (canvas area) inside the inner card */
  .sheet-inner-card .seatmap-canvas-body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    margin-top: 0;
    position: relative;
    overflow: hidden;
  }
  
  .sheet-inner-card .bus-cabin-canvas-viewport {
    flex-grow: 1;
    height: 100% !important;
    min-height: 0 !important;
    width: 100% !important;
    border: none;
    border-radius: 0;
    margin: 0;
    touch-action: none;
  }
  
  .sheet-inner-card .canvas-zoom-controls {
    display: none !important;
  }

  .sheet-inner-card .inline-legends {
    display: none !important;
  }

  /* Floating legend overlay inside canvas on mobile */
  .sheet-inner-card .mobile-legends-overlay {
    display: flex !important;
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 25;
    background-color: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 10px;
    padding: 6px 10px;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    pointer-events: auto;
  }

  .sheet-inner-card .mobile-legends-overlay .legend-item {
    font-size: 0.6rem !important;
    gap: 3px !important;
  }

  .sheet-inner-card .mobile-legends-overlay .legend-box {
    width: 9px !important;
    height: 9px !important;
  }

  /* Floating zoom controls overlay */
  .sheet-inner-card .mobile-zoom-controls-overlay {
    display: flex !important;
    flex-direction: column;
    gap: 5px;
    position: absolute;
    bottom: 90px;
    right: 14px;
    z-index: 25;
    background-color: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 20px;
    padding: 6px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  .sheet-inner-card .mobile-zoom-controls-overlay .m-zoom-btn {
    width: 28px !important;
    height: 28px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #ffffff;
    border: none;
    font-size: 0.85rem !important;
    cursor: pointer;
    color: var(--text-dark);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 0 !important;
  }
  
  /* Confirm bar at the bottom of the sheet */
  .mobile-canvas-confirm-bar {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--card-bg, #FAF9F9);
    border-top: 1.5px solid var(--border-color);
    padding: 10px 14px;
    z-index: 2100;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .m-confirm-bar-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .m-confirm-label {
    font-size: 0.58rem;
    color: var(--text-light, #6b6b6b);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .m-confirm-value {
    font-size: 1rem;
    font-weight: 900;
    color: var(--text-dark, #2A2A2A);
  }
  
  .btn-confirm-seats-mobile {
    width: auto !important;
    min-width: 110px;
    padding: 9px 20px !important;
    background-color: var(--primary, #C94C4C);
    color: #ffffff;
    font-weight: 800;
    font-size: 0.9rem;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    box-shadow: var(--shadow-btn);
    transition: transform 0.2s;
  }

  .btn-confirm-seats-mobile:disabled {
    background-color: #cbd5e1 !important;
    color: #94a3b8 !important;
    cursor: not-allowed;
    box-shadow: none !important;
  }
  
  .btn-confirm-seats-mobile:active:not(:disabled) {
    transform: scale(0.98);
  }
}

/* Dark theme overrides for mobile canvas confirm bar */
[data-theme="dark"] .mobile-canvas-confirm-bar {
  background-color: var(--card-bg, #1a1a1a) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

[data-theme="dark"] .m-confirm-value {
  color: #f1f5f9 !important;
}

[data-theme="dark"] .sheet-inner-card .mobile-zoom-controls-overlay,
[data-theme="dark"] .sheet-inner-card .mobile-legends-overlay {
  background-color: rgba(26, 26, 26, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

[data-theme="dark"] .sheet-inner-card .mobile-zoom-controls-overlay .m-zoom-btn {
  background-color: #252525 !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #f1f5f9 !important;
}

[data-theme="dark"] .mobile-seatmap-header {
  background-color: var(--card-bg, #1a1a1a) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

[data-theme="dark"] .btn-close-seatmap-mobile,
[data-theme="dark"] .mobile-seatmap-header-title {
  color: #f1f5f9 !important;
}

[data-theme="dark"] .btn-close-seatmap-mobile {
  background: rgba(255, 255, 255, 0.08) !important;
}

/* Inner card gets dark background */
[data-theme="dark"] .sheet-inner-card {
  background-color: var(--bg-color, #121212) !important;
}

/* Drag handle pill stays white/light on dark */
[data-theme="dark"] .sheet-drag-handle-pill {
  background-color: rgba(255, 255, 255, 0.35) !important;
}

/* Dark theme overrides for desktop canvas overlays */
[data-theme="dark"] .inline-legends,
[data-theme="dark"] .canvas-zoom-controls {
  background-color: rgba(26, 26, 26, 0.95) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

[data-theme="dark"] .inline-legends {
  color: #94a3b8 !important;
}

[data-theme="dark"] .zoom-control-btn {
  background-color: #252525 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #f1f5f9 !important;
}

[data-theme="dark"] .zoom-control-btn:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: var(--primary) !important;
  color: var(--primary) !important;
}

[data-theme="dark"] .zoom-control-btn.text-btn {
  color: #cbd5e1 !important;
}

[data-theme="dark"] .zoom-control-btn.text-btn:hover {
  color: var(--primary) !important;
}

/* Prevent main page scrolling when sheet is open */
html.lock-scroll, body.lock-scroll {
  overflow: hidden !important;
  height: 100vh !important;
  position: relative !important;
  touch-action: none;
}

/* Button Edit / Delete style additions */
.btn-delete-ticket-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--primary, #C94C4C);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  margin-left: auto;
}

.btn-delete-ticket-summary:hover {
  background-color: #fee2e2;
  color: #b91c1c;
}

[data-theme="dark"] .btn-delete-ticket-summary:hover {
  background-color: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.btn-edit-seats-mobile {
  color: var(--primary, #C94C4C);
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  background: none;
  border: 1px solid var(--primary, #C94C4C);
  border-radius: 8px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  margin-left: auto;
  margin-right: 8px;
}

.btn-edit-seats-mobile:hover,
.btn-edit-seats-mobile.is-editing {
  background: var(--primary, #C94C4C);
  color: #ffffff;
}

[data-theme="dark"] .btn-edit-seats-mobile {
  border-color: var(--primary, #C94C4C);
  color: var(--primary, #C94C4C);
}

.btn-edit-seats.is-editing {
  border: 1px solid var(--primary, #C94C4C);
  border-radius: 8px;
  padding: 4px 10px;
}
.btn-edit-seats.is-editing:hover {
  background: var(--primary, #C94C4C);
  color: #ffffff !important;
}
</style>
