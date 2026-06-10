import { reactive } from 'vue';

export const bookingStore = reactive({
  selectedEvent: null,
  selectedPickup: null,
  selectedReturn: null,
  customer: {
    name: '',
    email: '',
    phone: ''
  },
  adults: 1,
  toddlers: 0,
  bookingCode: null,

  reset() {
    this.selectedEvent = null;
    this.selectedPickup = null;
    this.selectedReturn = null;
    this.customer = { name: '', email: '', phone: '' };
    this.adults = 1;
    this.toddlers = 0;
    this.bookingCode = null;
  },

  generateBookingCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'AJK-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    this.bookingCode = code;
    return code;
  },

  get totalPassengers() {
    return this.adults + this.toddlers;
  },

  get basePrice() {
    if (!this.selectedEvent) return 0;
    let price = this.selectedEvent.priceNum;
    if (this.selectedPickup && this.selectedPickup.region) {
      const region = this.selectedPickup.region;
      if (region === 'Sudirman') price = 120000;
      else if (region === 'Bogor') price = 175000;
      else price = 150000;
    }
    return price;
  },

  get ridePrice() {
    return this.basePrice * this.adults;
  },

  get adminFee() {
    return 5000 * this.adults;
  },

  get totalPrice() {
    return this.ridePrice + this.adminFee;
  }
});
