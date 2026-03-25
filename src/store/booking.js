import { reactive } from 'vue';

export const bookingStore = reactive({
  selectedEvent: null,
  selectedPickup: null,
  selectedSchedule: null,
  adults: 1,
  toddlers: 0,
  bookingCode: null,

  reset() {
    this.selectedEvent = null;
    this.selectedPickup = null;
    this.selectedSchedule = null;
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

  get ridePrice() {
    if (!this.selectedSchedule) return 0;
    return this.selectedSchedule.pricePerPax * this.adults;
  }
});
