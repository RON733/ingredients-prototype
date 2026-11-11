<template>
  <div class="pt-4 sm:pt-8 pb-32 sm:pb-20 max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 animate-fade-in">
    <!-- Top Navigation Bar -->
    <div class="flex items-center justify-between gap-2 mb-4 sm:mb-6">
      <button
        type="button"
        @click="backToHome"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800/80 hover:bg-surface-700 text-xs font-semibold text-gray-300 hover:text-white border border-surface-700/60 transition-colors shadow-sm cursor-pointer">
        <i class="pi pi-arrow-left text-[11px]"></i>
        <span>Back to Store</span>
      </button>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="store.currentView = 'history'"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800/80 hover:bg-surface-700 text-xs font-semibold text-gray-300 hover:text-white border border-surface-700/60 transition-colors shadow-sm cursor-pointer">
          <i class="pi pi-history text-[11px] text-brand-400"></i>
          <span>Order History</span>
        </button>

        <button
          type="button"
          @click="openNewBooking"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black transition-all shadow-md shadow-yellow-400/20 cursor-pointer">
          <i class="pi pi-calendar-plus text-[11px]"></i>
          <span>Book Event</span>
        </button>
      </div>
    </div>

    <!-- Header -->
    <div class="text-center mb-6 sm:mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
        <i class="pi pi-calendar text-xs"></i>
        <span>Catering & Mobile Bar</span>
      </div>
      <h2 class="text-2xl sm:text-4xl font-black text-white tracking-tight">Event Booking History</h2>
      <p class="text-xs sm:text-sm text-gray-400 mt-1 max-w-md mx-auto">
        Track your submitted event requests and see when they are approved by our admin or staff
      </p>
    </div>

    <!-- Account Context Bar -->
    <div class="mb-5 p-3 sm:p-4 rounded-2xl bg-surface-900/90 border border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
      <div class="flex items-center gap-3">
        <div v-if="store.user" class="w-9 h-9 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center font-bold text-yellow-400 text-sm overflow-hidden shrink-0">
          <img v-if="store.user.avatar" :src="store.user.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ (store.user.name || 'U').charAt(0).toUpperCase() }}</span>
        </div>
        <div v-else class="w-9 h-9 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-gray-400 text-sm shrink-0">
          <i class="pi pi-user"></i>
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-white truncate">
              {{ store.user ? store.user.name : 'Guest Customer' }}
            </span>
            <span
              class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              :class="store.user ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-surface-700 text-gray-300 border border-surface-600'">
              {{ store.user ? (store.user.role || 'Member') : 'Device Session' }}
            </span>
          </div>
          <p class="text-[11px] text-gray-400 truncate">
            {{ store.user ? (store.user.email || store.user.phone || 'Signed in account') : 'Bookings submitted on this device are tracked here automatically' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button
          v-if="!store.user"
          type="button"
          @click="store.authModalOpen = true"
          class="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
          <i class="pi pi-sign-in text-[11px]"></i>
          <span>Sign In / Register</span>
        </button>
        <span v-else class="text-[11px] text-gray-400 font-medium">
          {{ store.bookingsList.length }} total booking{{ store.bookingsList.length === 1 ? '' : 's' }}
        </span>
      </div>
    </div>

    <!-- Reusable Booking History List -->
    <BookingHistoryList
      :highlightId="store.lastSubmittedBookingId"
      @book-new="openNewBooking" />
  </div>
</template>

<script>
import { useGShotStore } from '@/stores/useGShotStore';

export default {
  name: 'BookingHistoryView',
  setup() {
    const store = useGShotStore();

    const backToHome = () => {
      store.currentView = 'customer';
      store.activeSection = 'home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openNewBooking = () => {
      store.openBookingModal('form');
    };

    return {
      store,
      backToHome,
      openNewBooking,
    };
  },
};
</script>