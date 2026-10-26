// G Shot Teas — Event & Catering Bookings Management Tab
const AdminBookingsTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-calendar"></i> RESERVATIONS & CATERING
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Event Bookings</h2>
          <p class="text-xs text-gray-400">Manage incoming mobile bar packages, booth setups, and food catering requests.</p>
        </div>

        <button 
          @click="refresh"
          class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors self-start sm:self-auto"
          title="Refresh">
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
        </button>
      </div>

      <!-- Bookings Cards / Table -->
      <div v-if="bookings.length > 0" class="space-y-4">
        <div 
          v-for="b in bookings" 
          :key="b.id"
          class="p-6 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl space-y-4">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-700/60 pb-3">
            <div>
              <span class="text-base font-bold text-white">{{ b.event_type }}</span>
              <p class="text-xs text-gray-400">Client: <span class="text-brand-400 font-semibold">{{ b.client_name }}</span> ({{ b.client_phone }})</p>
            </div>

            <span 
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
              :class="getStatusBadge(b.status)">
              {{ b.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-surface-900/60 p-4 rounded-2xl border border-surface-700/50">
            <div>
              <p class="text-gray-500 font-bold uppercase text-[10px]">Date & Time</p>
              <p class="font-bold text-white mt-0.5">{{ b.event_date }}</p>
              <p class="text-gray-400 text-[11px]">{{ b.event_time || 'TBD' }}</p>
            </div>
            <div>
              <p class="text-gray-500 font-bold uppercase text-[10px]">Estimated Guests</p>
              <p class="font-bold text-white mt-0.5">{{ b.guest_count }} persons</p>
            </div>
            <div>
              <p class="text-gray-500 font-bold uppercase text-[10px]">Location</p>
              <p class="font-bold text-white mt-0.5 truncate">{{ b.location }}</p>
            </div>
            <div>
              <p class="text-gray-500 font-bold uppercase text-[10px]">Est. Package Cost</p>
              <p class="font-bold text-amber-400 mt-0.5">₱{{ Number(b.estimated_cost).toLocaleString() }}.00</p>
            </div>
          </div>

          <div v-if="b.notes" class="text-xs text-gray-400 italic">
            Special instructions: "{{ b.notes }}"
          </div>

          <!-- Actions -->
          <div class="pt-2 flex items-center justify-end gap-2 border-t border-surface-700/50">
            <button 
              v-if="b.status === 'Pending'"
              @click="updateStatus(b, 'Approved')"
              class="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
              Approve Booking
            </button>
            <button 
              v-if="b.status === 'Approved'"
              @click="updateStatus(b, 'Completed')"
              class="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors">
              Mark Completed
            </button>
            <button 
              v-if="b.status === 'Pending'"
              @click="updateStatus(b, 'Declined')"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors">
              Decline
            </button>
          </div>

        </div>
      </div>

      <div v-else class="text-center py-20 bg-surface-800/40 rounded-3xl border border-surface-700/50">
        <div class="text-4xl mb-3">📅</div>
        <p class="text-base font-bold text-white">No event booking requests</p>
        <p class="text-xs text-gray-500 mt-1">Catering and mobile bar reservations will appear here.</p>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const bookings = Vue.ref([]);

    Vue.onMounted(() => {
      refresh();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        const res = await GST_API.getBookings();
        bookings.value = res.data;
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const getStatusBadge = (s) => {
      if (s === 'Approved') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      if (s === 'Completed') return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      if (s === 'Declined') return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    };

    const updateStatus = async (b, status) => {
      try {
        await GST_API.updateBookingStatus(b.id, status);
        store.notify(`Booking #${b.id} is now ${status}`);
        refresh();
      } catch (err) {
        store.notify('Error updating booking.', 'error');
      }
    };

    return {
      store,
      loading,
      bookings,
      getStatusBadge,
      updateStatus,
      refresh,
    };
  },
};
