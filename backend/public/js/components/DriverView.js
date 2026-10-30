// G Shot Teas — Driver & Delivery Portal Component (Mobile-First GPS Hub)
const DriverView = {
  template: `
    <div class="min-h-screen bg-surface-950 text-gray-100 py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Top Driver Profile & Operational Bar -->
      <div class="bg-surface-900 border border-surface-700 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center text-2xl shadow-lg">
            🛵
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black text-white">{{ store.user?.name || 'Delivery Rider' }}</h2>
              <span 
                class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                :class="isAvailable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'">
                {{ isAvailable ? 'ON DUTY' : 'ON BREAK' }}
              </span>
            </div>
            <p class="text-xs text-gray-400">
              G Shot Teas Delivery Fleet • Santa Rosa Hub
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Rider Availability Toggle Switch (Flag Not Available) -->
          <button 
            type="button"
            @click="toggleAvailability"
            class="px-3.5 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 shadow-md cursor-pointer"
            :class="isAvailable ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'">
            <span class="w-2.5 h-2.5 rounded-full" :class="isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'"></span>
            <span>{{ isAvailable ? 'Available for Orders' : 'On Break / Offline' }}</span>
          </button>

          <!-- GPS Broadcast Toggle Button -->
          <button 
            type="button"
            @click="toggleGpsTracking"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer"
            :class="isGpsBroadcasting ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-surface-800 text-gray-400 border-surface-700'">
            <i class="pi pi-compass text-xs" :class="isGpsBroadcasting ? 'animate-spin' : ''"></i>
            <span>{{ isGpsBroadcasting ? 'GPS Active' : 'GPS Off' }}</span>
          </button>

          <!-- Back to Store / Customer View -->
          <button 
            type="button"
            @click="store.currentView = 'customer'"
            class="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-semibold border border-surface-700 transition-colors cursor-pointer">
            Storefront
          </button>

          <!-- Logout Button -->
          <button 
            type="button"
            @click="handleLogout"
            class="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-colors cursor-pointer">
            Logout
          </button>
        </div>
      </div>

      <!-- Unavailable / On Break Warning Notice -->
      <div v-if="!isAvailable" class="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div class="flex items-center gap-3">
          <span class="text-2xl">☕</span>
          <div>
            <p class="font-black text-sm text-white">You are currently flagged as On Break / Unavailable</p>
            <p class="text-[11px] text-rose-300/80">Kitchen staff cannot assign new orders to you while you take your break.</p>
          </div>
        </div>
        <button 
          @click="toggleAvailability" 
          class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition-colors shadow-md cursor-pointer shrink-0">
          I'm Back • Go Online
        </button>
      </div>

      <!-- Quick Delivery KPIs -->
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="bg-surface-900 border border-surface-700 rounded-2xl p-4">
          <p class="text-[10px] font-bold uppercase tracking-wider text-sky-400">Assigned Dispatches</p>
          <p class="text-2xl font-black text-white mt-1">{{ activeDeliveries.length }}</p>
        </div>
        <div class="bg-surface-900 border border-surface-700 rounded-2xl p-4">
          <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Delivered Today</p>
          <p class="text-2xl font-black text-white mt-1">{{ completedDeliveries.length }}</p>
        </div>
        <div class="bg-surface-900 border border-surface-700 rounded-2xl p-4">
          <p class="text-[10px] font-bold uppercase tracking-wider text-brand-400">COD Cash to Remit</p>
          <p class="text-2xl font-black text-white mt-1">₱{{ Number(totalCashToRemit).toFixed(2) }}</p>
        </div>
      </div>

      <!-- Delivery Tabs (Active Deliveries vs Completed History) -->
      <div class="flex items-center gap-2 border-b border-surface-700/60 pb-2">
        <button 
          @click="activeTab = 'active'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          :class="activeTab === 'active' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:text-white hover:bg-surface-800'">
          <i class="pi pi-box"></i>
          <span>My Dispatched Orders ({{ activeDeliveries.length }})</span>
        </button>
        <button 
          @click="activeTab = 'completed'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          :class="activeTab === 'completed' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:text-white hover:bg-surface-800'">
          <i class="pi pi-check-circle"></i>
          <span>Delivered History ({{ completedDeliveries.length }})</span>
        </button>
      </div>

      <!-- Tab 1: Active Deliveries List (Only orders dispatched to this rider) -->
      <div v-if="activeTab === 'active'" class="space-y-4">
        
        <!-- Empty State -->
        <div v-if="activeDeliveries.length === 0" class="text-center py-16 bg-surface-900/60 border border-surface-700 rounded-3xl p-6">
          <div class="text-4xl mb-3">🛵✨</div>
          <h3 class="text-base font-bold text-white">No Dispatches Right Now</h3>
          <p class="text-xs text-gray-400 mt-1">When kitchen staff dispatches a delivery to you, it will appear here immediately.</p>
          <button 
            @click="refreshOrders"
            class="mt-4 px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-xs font-bold text-white border border-surface-700 transition-colors inline-flex items-center gap-2 cursor-pointer">
            <i class="pi pi-refresh text-xs"></i> Refresh Queue
          </button>
        </div>

        <!-- Order Cards -->
        <div 
          v-for="order in activeDeliveries" 
          :key="order.id"
          class="bg-surface-900 border border-surface-700 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
          
          <!-- Header: Order ID & Status Badge -->
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base font-black text-white">{{ order.order_number }}</span>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse">
                  OUT FOR DELIVERY
                </span>
              </div>
              <p class="text-[11px] text-gray-400 font-mono mt-0.5">Dispatched at {{ formatTime(order.updated_at || order.created_at) }}</p>
            </div>

            <!-- Payment Badge -->
            <div class="text-right">
              <span 
                class="px-3 py-1 rounded-full text-[11px] font-black"
                :class="order.payment_method === 'Cash' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'">
                {{ order.payment_method }}: ₱{{ Number(order.total_amount).toFixed(2) }}
              </span>
              <p v-if="order.payment_method === 'Cash'" class="text-[10px] text-amber-400 font-bold mt-1">
                ⚠️ Collect ₱{{ Number(order.total_amount).toFixed(2) }} Cash
              </p>
              <p v-else class="text-[10px] text-emerald-400 font-bold mt-1">
                ✓ Paid via GCash
              </p>
            </div>
          </div>

          <!-- Customer Contact & Address Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            <!-- Customer Card -->
            <div class="p-3.5 rounded-2xl bg-surface-800/70 border border-surface-700 space-y-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Contact</p>
              <p class="font-bold text-white text-sm">{{ order.customer_name }}</p>
              <div class="flex items-center gap-2">
                <a 
                  :href="'tel:' + order.customer_phone"
                  class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm">
                  <i class="pi pi-phone text-xs"></i>
                  <span>Call {{ order.customer_phone }}</span>
                </a>
              </div>
            </div>

            <!-- Address & Navigation Card -->
            <div class="p-3.5 rounded-2xl bg-surface-800/70 border border-surface-700 space-y-3">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destination Address</p>
                <p class="font-medium text-gray-200 line-clamp-2 mt-0.5" :title="order.delivery_address">
                  ?? {{ order.delivery_address || 'Santa Rosa, Laguna' }}
                </p>
                <p v-if="order.customer_lat && order.customer_lng" class="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <i class="pi pi-check-circle text-[10px]"></i>
                  <span>Exact GPS Pinned: {{ Number(order.customer_lat).toFixed(5) }}, {{ Number(order.customer_lng).toFixed(5) }}</span>
                </p>
              </div>

              <!-- Quick Launch Navigation (Opens Google Maps App directly to exact pin) -->
              <div class="flex flex-wrap items-center gap-2 pt-0.5">
                <a 
                  :href="getGoogleMapsNavUrl(order)"
                  target="_blank"
                  class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer">
                  <i class="pi pi-compass text-xs"></i>
                  <span>Navigate in Google Maps (Exact Pin)</span>
                </a>
                <a 
                  :href="getWazeNavUrl(order)"
                  target="_blank"
                  class="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer">
                  <i class="pi pi-map text-xs"></i>
                  <span>Waze</span>
                </a>
              </div>

              <!-- Google Maps Live Trip Sharing Link -->
              <div class="pt-2 border-t border-surface-700/60 space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="block text-[11px] font-bold text-gray-300">
                    <i class="pi pi-share-alt text-brand-400 mr-1"></i>
                    Share Google Maps Live Trip Link with Customer
                  </label>
                  <span v-if="order.driver_notes && order.driver_notes.includes('http')" class="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <i class="pi pi-check"></i> Shared with customer
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <input 
                    v-model="order.live_share_link" 
                    type="url"
                    placeholder="Paste Google Maps 'Share Trip' link (e.g. https://maps.app.goo.gl/...)" 
                    class="flex-1 px-3 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                  />
                  <button 
                    type="button" 
                    @click="shareLiveTripLink(order)"
                    class="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md">
                    Share Link
                  </button>
                </div>
                <p class="text-[10px] text-gray-400">
                  Tip: In Google Maps navigation, tap "Share trip progress" and paste the link here. Customer will see your live dot in Google Maps.
                </p>
              </div>
            </div>

          </div>

          <!-- Items in Bag -->
          <div class="p-3 rounded-2xl bg-surface-950 border border-surface-800 text-xs">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items to Deliver</p>
            <div class="space-y-1.5">
              <div v-for="item in order.items" :key="item.id" class="flex justify-between text-gray-300">
                <span>{{ item.quantity }}x {{ item.product_name }}</span>
                <span class="font-bold text-white">₱{{ Number(item.subtotal).toFixed(2) }}</span>
              </div>
            </div>
            <div v-if="order.notes" class="mt-2 pt-2 border-t border-surface-800 text-[11px] text-amber-300 italic">
              <strong>Customer Notes:</strong> {{ order.notes }}
            </div>
          </div>

          <!-- Mark Completed Button (Rider Exclusive Authority) -->
          <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-800">
            <div class="text-[11px] text-gray-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Only you can mark this order delivered. Staff page will update immediately.</span>
            </div>

            <button 
              @click="completeDelivery(order)"
              class="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <i class="pi pi-check-circle text-sm"></i>
              <span>Confirm Delivered & Complete Order</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Tab 2: Delivered History -->
      <div v-else class="space-y-3">
        <div v-if="completedDeliveries.length === 0" class="text-center py-12 bg-surface-900/60 border border-surface-700 rounded-3xl p-6">
          <p class="text-xs text-gray-400">No deliveries marked completed yet today.</p>
        </div>

        <div 
          v-for="order in completedDeliveries" 
          :key="order.id"
          class="bg-surface-900 border border-surface-700/80 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-white">{{ order.order_number }}</span>
              <span class="text-emerald-400 font-bold">✓ Delivered by You</span>
            </div>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ order.customer_name }} • {{ order.delivery_address || 'Santa Rosa' }}</p>
          </div>
          <div class="text-right">
            <span class="font-black text-white">₱{{ Number(order.total_amount).toFixed(2) }}</span>
            <p class="text-[10px] text-gray-400">{{ order.payment_method }}</p>
          </div>
        </div>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const activeTab = Vue.ref('active');
    const isGpsBroadcasting = Vue.ref(true);
    const isAvailable = Vue.ref(store.user?.is_available !== false);
    let gpsWatchId = null;

    const currentDriverId = Vue.computed(() => store.user?.id);

    // Filter ONLY orders dispatched to this logged-in rider!
    const activeDeliveries = Vue.computed(() => {
      return store.orders.filter(o => 
        o.order_type === 'Delivery' && 
        o.status === 'Out for Delivery' &&
        (!o.driver_id || o.driver_id == currentDriverId.value)
      );
    });

    const completedDeliveries = Vue.computed(() => {
      return store.orders.filter(o => 
        o.order_type === 'Delivery' && 
        o.status === 'Completed' &&
        o.driver_id == currentDriverId.value
      );
    });

    const totalCashToRemit = Vue.computed(() => {
      return completedDeliveries.value
        .filter(o => o.payment_method === 'Cash')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    });

    const formatTime = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

        const getGoogleMapsNavUrl = (order) => {
      if (order.customer_lat && order.customer_lng) {
        return `https://www.google.com/maps/dir/?api=1&destination=${Number(order.customer_lat).toFixed(6)},${Number(order.customer_lng).toFixed(6)}&travelmode=two_wheeler`;
      }
      const dest = order.delivery_address ? `${order.delivery_address}, Santa Rosa, Laguna` : 'Santa Rosa, Laguna';
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=two_wheeler`;
    };

    const getWazeNavUrl = (order) => {
      if (order.customer_lat && order.customer_lng) {
        return `https://waze.com/ul?ll=${Number(order.customer_lat).toFixed(6)},${Number(order.customer_lng).toFixed(6)}&navigate=yes`;
      }
      return `https://waze.com/ul?q=${encodeURIComponent(order.delivery_address || 'Santa Rosa Laguna')}&navigate=yes`;
    };

    const getNavigationUrl = getGoogleMapsNavUrl;

    const shareLiveTripLink = async (order) => {
      const link = (order.live_share_link || '').trim();
      if (!link) {
        store.notify('Please paste your Google Maps share link first.', 'warning');
        return;
      }
      try {
        const rLat = order.driver_lat ? Number(order.driver_lat) : 14.3167;
        const rLng = order.driver_lng ? Number(order.driver_lng) : 121.1111;
        await GST_API.updateDriverLocation(order.id, {
          driver_lat: rLat,
          driver_lng: rLng,
          driver_notes: link
        });
        order.driver_notes = link;
        store.notify('? Live Google Maps trip link broadcasted to customer!', 'success');
      } catch (err) {
        store.notify('Failed to share Google Maps link.', 'error');
      }
    };

    // Rider Availability Toggle
    const toggleAvailability = async () => {
      const nextState = !isAvailable.value;
      try {
        await GST_API.toggleDriverAvailability(nextState);
        isAvailable.value = nextState;
        if (store.user) store.user.is_available = nextState;
        store.notify(nextState ? 'You are now Available for dispatches!' : 'You are now on Break / Unavailable.', nextState ? 'success' : 'info');
      } catch (err) {
        store.notify('Could not update availability.', 'error');
      }
    };

    // Delivery Completion
    const completeDelivery = async (order) => {
      const confirmMsg = order.payment_method === 'Cash' 
        ? `Confirm delivery for ${order.order_number}?\n\nDid you collect ₱${Number(order.total_amount).toFixed(2)} cash from ${order.customer_name}?`
        : `Confirm delivery for ${order.order_number} to ${order.customer_name}?`;

      if (!confirm(confirmMsg)) return;

      try {
        await GST_API.updateOrderStatus(order.id, 'Completed');
        order.status = 'Completed';
        if (order.payment_method === 'Cash') order.payment_status = 'Paid';
        
        // Update item in central store
        const storeItem = store.orders.find(o => o.id === order.id);
        if (storeItem) {
          storeItem.status = 'Completed';
          if (storeItem.payment_method === 'Cash') storeItem.payment_status = 'Paid';
        }

        store.notify(`Order ${order.order_number} marked Delivered & Completed!`, 'success');
        refreshOrders();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to complete order.', 'error');
      }
    };

    const refreshOrders = async () => {
      await store.fetchOrders();
      store.notify('Dispatches updated', 'info');
    };

    const handleLogout = async () => {
      await store.logout();
      store.currentView = 'customer';
    };

    // GPS Broadcasting Loop
    const startGpsBroadcast = () => {
      if (!navigator.geolocation) return;
      isGpsBroadcasting.value = true;
      gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));

          activeDeliveries.value.forEach(order => {
            if (order.status === 'Out for Delivery') {
              GST_API.updateDriverLocation(order.id, {
                driver_lat: lat,
                driver_lng: lng
              }).catch(() => {});
            }
          });
        },
        (err) => {
          console.warn('Driver GPS watch error:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    };

    const stopGpsBroadcast = () => {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        gpsWatchId = null;
      }
      isGpsBroadcasting.value = false;
    };

    const toggleGpsTracking = () => {
      if (isGpsBroadcasting.value) {
        stopGpsBroadcast();
        store.notify('GPS broadcasting paused.', 'info');
      } else {
        startGpsBroadcast();
        store.notify('GPS broadcasting active!', 'success');
      }
    };

    Vue.onMounted(() => {
      store.fetchOrders();
      startGpsBroadcast();
    });

    Vue.onBeforeUnmount(() => {
      stopGpsBroadcast();
    });

    return {
      store,
      activeTab,
      isGpsBroadcasting,
      isAvailable,
      activeDeliveries,
      completedDeliveries,
      totalCashToRemit,
      formatTime,
      getNavigationUrl,
      getGoogleMapsNavUrl,
      getWazeNavUrl,
      shareLiveTripLink,
      completeDelivery,
      refreshOrders,
      handleLogout,
      toggleAvailability,
      toggleGpsTracking,
    };
  },
};
