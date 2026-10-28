// G Shot Teas — Event Booking Modal (Catering & Mobile Bar Reservations)
const EventBookingModal = {
  template: `
    <div 
      v-if="store.bookingModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      @click.self="store.bookingModalOpen = false">
           <div class="relative w-full max-w-xl bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        <!-- Header -->
        <div class="p-4 sm:p-6 bg-gradient-to-r from-surface-800 to-surface-900 border-b border-surface-700 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold shrink-0">
              🎉
            </div>
            <div>
              <h3 class="text-base sm:text-xl font-black text-white">Book Catering or Mobile Bar</h3>
              <p class="text-[11px] sm:text-xs text-gray-400">Make your birthday, corporate gathering, or wedding unforgettable</p>
            </div>
          </div>

          <button 
            @click="store.bookingModalOpen = false"
            class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center shrink-0">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitBooking" class="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          <!-- Package Quick Select Banner -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-3 rounded-2xl bg-surface-950/70 border border-surface-800">
            <div 
              @click="selectPackage('Coffee Package')" 
              class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5"
              :class="isCoffeePackage ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white'">
              <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-surface-900 border border-surface-700">
                <img src="./assets/booking-coffee-package.jpg" alt="Coffee" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <p class="font-black text-[11px] truncate" :class="isCoffeePackage ? 'text-amber-400' : 'text-gray-300'">Coffee Package</p>
                <p class="text-[10px] text-gray-400">₱3,500 / 50 pax</p>
              </div>
            </div>

            <div 
              @click="selectPackage('Fruity Float Package')" 
              class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5"
              :class="isFruityPackage ? 'bg-rose-500/15 border-rose-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white'">
              <div class="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-surface-900 border border-surface-700">
                <img src="./assets/booking-fruity-float.jpg" alt="Fruity Float" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <p class="font-black text-[11px] truncate" :class="isFruityPackage ? 'text-rose-400' : 'text-gray-300'">Fruity Float</p>
                <p class="text-[10px] text-gray-400">₱3,500 / 50 pax</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Client / Contact Name
              </label>
              <input 
                v-model="form.client_name"
                type="text" 
                required
                placeholder="Your full name" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <input 
                v-model="form.client_phone"
                type="tel" 
                required
                placeholder="09XXXXXXXXX" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Selected Event / Package
              </label>
              <select 
                v-model="form.event_type"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white focus:outline-none focus:border-brand-500 cursor-pointer">
                <option value="Coffee Package (₱3,500 / 50 pax)">Coffee Package (₱3,500 • 50 cups 12oz • 5 choices • 3 hrs)</option>
                <option value="Fruity Float Package (₱3,500 / 50 pax)">Fruity Float Package (₱3,500 • 50 cups 16oz • 7 choices • 3 hrs)</option>
                <option value="Mobile Bar & Milktea Booth">Custom Mobile Bar & Milktea Booth</option>
                <option value="Comfort Food Catering">Comfort Food Catering (Burgers & Pizza)</option>
                <option value="Bulk Order Delivery">Bulk Party Pack Delivery</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Estimated Guest Count
              </label>
              <input 
                v-model.number="form.guest_count"
                type="number" 
                min="10" 
                max="500" 
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Target Date
              </label>
              <input 
                v-model="form.event_date"
                type="date" 
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Target Time
              </label>
              <input 
                v-model="form.event_time"
                type="text" 
                placeholder="e.g. 2:00 PM – 5:00 PM (3 Hours)" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Event Venue / Location
            </label>
            <input 
              v-model="form.location"
              type="text" 
              required
              placeholder="e.g. Clubhouse / Residence, Santa Rosa, Laguna" 
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Special Requests or Drink Preferences
            </label>
            <textarea 
              v-model="form.notes"
              rows="2" 
              placeholder="Tell us about preferred flavors, setup requirements, or venue electrical outlets..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"></textarea>
          </div>

          <!-- Estimated Cost Calculation -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-surface-800/80 border border-surface-700 space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <div>
                <p class="text-[10px] sm:text-[11px] text-gray-400 uppercase font-bold">Estimated Base Price</p>
                <p class="text-base sm:text-lg font-black text-amber-400">₱{{ estimatedCost.toLocaleString() }}.00</p>
              </div>
              <div class="sm:text-right">
                <span class="text-[10px] text-gray-400 block">Transportation fee varies by location</span>
                <span class="text-[10px] sm:text-[11px] font-bold text-white">Direct: Jefferson Alulod (0993.700.5426)</span>
              </div>
            </div>
            <p class="text-[10px] text-gray-400 border-t border-surface-700/60 pt-2 leading-relaxed">
              {{ packageDetailsText }}
            </p>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button 
              type="button"
              @click="store.bookingModalOpen = false"
              class="px-4 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white transition-colors text-center">
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-6 py-2.5 rounded-xl font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-surface-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <span v-else>Submit Booking Request</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);

    const form = Vue.reactive({
      client_name: store.user?.name || '',
      client_phone: store.user?.phone || '',
      client_email: store.user?.email || '',
      event_type: 'Coffee Package (₱3,500 / 50 pax)',
      event_date: '',
      event_time: '2:00 PM – 5:00 PM (3 Hours)',
      guest_count: 50,
      location: '',
      notes: '',
    });

    const isCoffeePackage = Vue.computed(() => form.event_type.includes('Coffee'));
    const isFruityPackage = Vue.computed(() => form.event_type.includes('Fruity Float'));

    const selectPackage = (pkg) => {
      if (pkg === 'Coffee Package') {
        form.event_type = 'Coffee Package (₱3,500 / 50 pax)';
        form.guest_count = 50;
      } else if (pkg === 'Fruity Float Package') {
        form.event_type = 'Fruity Float Package (₱3,500 / 50 pax)';
        form.guest_count = 50;
      }
    };

    Vue.watch(() => store.bookingModalOpen, (isOpen) => {
      if (isOpen && store.selectedBookingPackage) {
        if (store.selectedBookingPackage.includes('Coffee')) {
          form.event_type = 'Coffee Package (₱3,500 / 50 pax)';
          form.guest_count = 50;
        } else if (store.selectedBookingPackage.includes('Fruity')) {
          form.event_type = 'Fruity Float Package (₱3,500 / 50 pax)';
          form.guest_count = 50;
        } else {
          form.event_type = 'Mobile Bar & Milktea Booth';
        }
      }
    });

    const estimatedCost = Vue.computed(() => {
      if (isCoffeePackage.value || isFruityPackage.value) {
        const units = Math.max(1, Math.ceil((form.guest_count || 50) / 50));
        return units * 3500;
      }
      return (form.guest_count || 50) * 95;
    });

    const packageDetailsText = Vue.computed(() => {
      if (isCoffeePackage.value) {
        return 'Includes: 50 cups of 12oz, 3 hours of on-site service, 5 choices of drinks (Coldbrew & specialty blends), and trained barista staff.';
      }
      if (isFruityPackage.value) {
        return 'Includes: 50 cups of 16oz, 3 hours of on-site service, 7 choices of drinks (Sparkling sodas & ice cream fruity floats), and trained barista staff.';
      }
      return 'Includes custom milk tea & snack booth setup, drink cups, straws, pearls, and on-site staff. Transpo fee varies by location.';
    });

    const submitBooking = async () => {
      loading.value = true;
      try {
        await GST_API.createBooking({
          ...form,
          package_name: form.event_type,
          estimated_cost: estimatedCost.value,
        });

        store.notify('Booking submitted! Our team will contact you to coordinate dates.', 'success');
        store.bookingModalOpen = false;
        store.selectedBookingPackage = null;
      } catch (err) {
        store.notify('Failed to submit event booking.', 'error');
      } finally {
        loading.value = false;
      }
    };

    return {
      store,
      form,
      loading,
      isCoffeePackage,
      isFruityPackage,
      selectPackage,
      estimatedCost,
      packageDetailsText,
      submitBooking,
    };
  },
};
