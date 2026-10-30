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

          <!-- Screen Wake Lock Status Badge -->
          <span 
            v-if="isWakeLockActive" 
            title="Screen Wake Lock is active. Phone display will stay awake during deliveries."
            class="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>⚡ Screen Awake</span>
          </span>

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
                  📍 {{ order.delivery_address || 'Santa Rosa, Laguna' }}
                </p>
                <p v-if="order.customer_lat && order.customer_lng" class="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  <i class="pi pi-check-circle text-[10px]"></i>
                  <span>Exact GPS Pinned: {{ Number(order.customer_lat).toFixed(5) }}, {{ Number(order.customer_lng).toFixed(5) }}</span>
                </p>
              </div>

              <!-- 1-Click Share Real-Time GPS Location Button -->
              <div class="space-y-1.5">
                <button 
                  type="button" 
                  @click="broadcastOrderGps(order)"
                  class="w-full py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer border"
                  :class="(order.isBroadcastingGps || isGpsBroadcasting) ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/50' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-transparent'">
                  <span class="w-2.5 h-2.5 rounded-full" :class="(order.isBroadcastingGps || isGpsBroadcasting) ? 'bg-emerald-400 animate-ping' : 'bg-white'"></span>
                  <i class="pi pi-send text-xs"></i>
                  <span>{{ (order.isBroadcastingGps || isGpsBroadcasting) ? '🟢 Sharing Real-Time GPS (Tap to Refresh)' : '📡 Share My Location Real-Time with Customer' }}</span>
                </button>
                <div v-if="order.isBroadcastingGps || isGpsBroadcasting" class="flex items-center justify-between px-1 text-[10px] text-emerald-400 font-mono">
                  <span>GPS: {{ order.driver_lat || 'Acquiring...' }}, {{ order.driver_lng || 'Acquiring...' }}</span>
                  <button type="button" @click="stopOrderGps(order)" class="text-rose-400 hover:text-rose-300 underline font-sans font-bold cursor-pointer">
                    Stop Sharing
                  </button>
                </div>
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
            </div>

          </div>

          <!-- Rider Turn-by-Turn Road Map with Direction Line -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <i class="pi pi-map text-emerald-400"></i>
                  <span>Live Road Directions to Customer</span>
                </span>
                <span v-if="order.driverDistance" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {{ order.driverDistance }}
                </span>
              </div>
              <button 
                type="button"
                @click="recenterDriverMap(order.id)"
                class="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-[11px] font-bold text-emerald-400 border border-surface-700 transition-colors flex items-center gap-1 cursor-pointer">
                <i class="pi pi-compass text-[10px]"></i>
                <span>Recenter</span>
              </button>
            </div>

            <!-- Rider Map Container -->
            <div class="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-surface-700 shadow-2xl bg-surface-950">
              <div :id="'driver-map-' + order.id" class="w-full h-full"></div>

              <!-- Floating Navigation Telemetry Banner on Rider Map -->
              <div class="absolute top-2.5 left-2.5 right-2.5 bg-surface-900/95 backdrop-blur-md border border-surface-700/80 rounded-xl px-3.5 py-2 shadow-lg flex items-center justify-between z-[15] pointer-events-none">
                <div class="flex items-center gap-2.5">
                  <span class="text-lg">🛵</span>
                  <div>
                    <p class="text-xs font-black text-white leading-tight">{{ order.driverDistance || 'Calculating road route...' }}</p>
                    <p class="text-[10px] text-gray-300 font-mono">{{ order.driverEta || 'Heading to customer gate' }}</p>
                  </div>
                </div>
                <span class="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Route
                </span>
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

    const broadcastOrderGps = (order) => {
      if (!navigator.geolocation) {
        store.notify('Geolocation is not supported on this device.', 'error');
        return;
      }
      order.isBroadcastingGps = true;
      store.notify('Acquiring high-accuracy GPS to broadcast to customer...', 'info');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          order.driver_lat = lat;
          order.driver_lng = lng;

          try {
            await GST_API.updateDriverLocation(order.id, {
              driver_lat: lat,
              driver_lng: lng,
              driver_notes: order.driver_notes || null
            });
            store.notify('✅ Real-time GPS shared! Customer can now track you live on Google Maps.', 'success');
          } catch (err) {
            console.warn('Driver location broadcast error:', err);
          }

          startGpsBroadcast();
        },
        (err) => {
          order.isBroadcastingGps = false;
          store.notify('Could not access GPS (' + (err.message || 'Check location permission') + ')', 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    const stopOrderGps = (order) => {
      order.isBroadcastingGps = false;
      const stillBroadcasting = activeDeliveries.value.some(o => o.isBroadcastingGps);
      if (!stillBroadcasting) {
        stopGpsBroadcast();
      }
      store.notify('Stopped real-time GPS sharing.', 'info');
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

    // --- Interactive Rider Road Map & Turn-by-Turn Direction Line ---
    const driverMaps = {};

    const getDriverRiderIcon = (bearing) => {
      if (typeof L === 'undefined') return null;
      return L.divIcon({
        className: 'custom-grab-rider-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="grab-rider-pulse"></div>
            <div class="rider-heading-cone" style="transform: rotate(${Math.round(bearing || 0)}deg)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 18,14 12,10 6,14" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" />
              </svg>
            </div>
            <div class="grab-rider-disc" style="width:34px;height:34px;">
              <div class="grab-rider-inner-dot"></div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
    };

    const getDriverDestinationIcon = () => {
      if (typeof L === 'undefined') return null;
      return L.divIcon({
        className: 'custom-grab-destination-pin',
        html: `
          <div class="relative flex items-center justify-center -translate-y-4">
            <svg viewBox="0 0 32 42" width="30" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 26 16 26s16-14.5 16-26c0-8.837-7.163-16-16-16z" fill="#EF4444"/>
              <circle cx="16" cy="15" r="5" fill="#FFFFFF"/>
            </svg>
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40]
      });
    };

    const fetchDriverRoadRoute = async (startLat, startLng, endLat, endLng) => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const r = data.routes[0];
            return {
              coordinates: r.geometry.coordinates.map(c => [c[1], c[0]]),
              distance: r.distance,
              duration: r.duration
            };
          }
        }
      } catch (e) {}
      return {
        coordinates: [[startLat, startLng], [endLat, endLng]],
        distance: 1000,
        duration: 180
      };
    };

    const initDriverMap = async (order) => {
      if (typeof L === 'undefined') return;
      const mapEl = document.getElementById('driver-map-' + order.id);
      if (!mapEl) return;

      const custLat = order.customer_lat ? Number(order.customer_lat) : 14.3218;
      const custLng = order.customer_lng ? Number(order.customer_lng) : 121.1192;
      const riderLat = order.driver_lat ? Number(order.driver_lat) : 14.3167;
      const riderLng = order.driver_lng ? Number(order.driver_lng) : 121.1111;

      if (driverMaps[order.id]) {
        driverMaps[order.id].map.invalidateSize();
        return;
      }

      const map = L.map('driver-map-' + order.id, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false
      }).setView([riderLat, riderLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Customer Destination Pin
      const destMarker = L.marker([custLat, custLng], { icon: getDriverDestinationIcon() })
        .addTo(map)
        .bindPopup(`<b>📍 Delivery Destination</b><br>${order.customer_name}<br>${order.delivery_address || ''}`);

      // Turn-by-Turn Road Route Polyline
      const roadData = await fetchDriverRoadRoute(riderLat, riderLng, custLat, custLng);
      const points = roadData.coordinates;

      const routeLineCasing = L.polyline(points, {
        color: '#ffffff',
        weight: 7,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);

      const routeLine = L.polyline(points, {
        color: '#00B14F', // Grab Signature Green
        weight: 4.5,
        opacity: 1,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);

      // Rider Live Motorcycle Pin
      const riderMarker = L.marker([riderLat, riderLng], { icon: getDriverRiderIcon(45) }).addTo(map);

      map.fitBounds([[riderLat, riderLng], [custLat, custLng]], { padding: [35, 35] });

      const distMeters = roadData.distance;
      order.driverDistance = distMeters >= 1000 ? (distMeters / 1000).toFixed(1) + ' km to customer' : Math.round(distMeters) + ' m to customer';
      order.driverEta = `~${Math.max(1, Math.round(roadData.duration / 60))} mins driving`;

      driverMaps[order.id] = {
        map,
        riderMarker,
        destMarker,
        routeLine,
        routeLineCasing,
        custLat,
        custLng
      };

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    };

    const recenterDriverMap = (orderId) => {
      const entry = driverMaps[orderId];
      if (entry) {
        const rPos = entry.riderMarker.getLatLng();
        entry.map.fitBounds([[rPos.lat, rPos.lng], [entry.custLat, entry.custLng]], { padding: [35, 35] });
      }
    };

    // Screen Wake Lock API (keeps mobile display awake on handlebar mounts during active deliveries)
    let wakeLockSentinel = null;
    const isWakeLockActive = Vue.ref(false);

    const acquireScreenWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
          isWakeLockActive.value = true;
          wakeLockSentinel.addEventListener('release', () => {
            isWakeLockActive.value = false;
          });
          console.log('🔋 [WakeLock] Screen Wake Lock acquired for delivery rider.');
        } catch (err) {
          console.warn('⚠️ [WakeLock] Could not acquire screen wake lock:', err);
        }
      }
    };

    const releaseScreenWakeLock = async () => {
      if (wakeLockSentinel !== null) {
        try {
          await wakeLockSentinel.release();
          wakeLockSentinel = null;
        } catch (e) {}
      }
      isWakeLockActive.value = false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isGpsBroadcasting.value) {
        acquireScreenWakeLock();
      }
    };

    // GPS Broadcasting Loop
    const startGpsBroadcast = () => {
      if (!navigator.geolocation) return;
      isGpsBroadcasting.value = true;
      acquireScreenWakeLock();
      gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));

          activeDeliveries.value.forEach(order => {
            if (order.status === 'Out for Delivery' || order.isBroadcastingGps) {
              order.driver_lat = lat;
              order.driver_lng = lng;

              // Dynamically update the rider's own map & route
              const dEntry = driverMaps[order.id];
              if (dEntry) {
                dEntry.riderMarker.setLatLng([lat, lng]);
                fetchDriverRoadRoute(lat, lng, dEntry.custLat, dEntry.custLng).then(newRoad => {
                  if (dEntry.routeLine && dEntry.routeLineCasing && newRoad.coordinates) {
                    dEntry.routeLine.setLatLngs(newRoad.coordinates);
                    dEntry.routeLineCasing.setLatLngs(newRoad.coordinates);
                    const dM = newRoad.distance;
                    order.driverDistance = dM >= 1000 ? (dM / 1000).toFixed(1) + ' km to customer' : Math.round(dM) + ' m to customer';
                    order.driverEta = `~${Math.max(1, Math.round(newRoad.duration / 60))} mins driving`;
                  }
                }).catch(() => {});
              }

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
      releaseScreenWakeLock();
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

    Vue.watch(activeDeliveries, (newOrders) => {
      if (newOrders && newOrders.length > 0) {
        Vue.nextTick(() => {
          newOrders.forEach(o => initDriverMap(o));
        });
      }
    }, { immediate: true, deep: true });

    Vue.onMounted(() => {
      store.fetchOrders();
      startGpsBroadcast();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    });

    Vue.onBeforeUnmount(() => {
      stopGpsBroadcast();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      Object.values(driverMaps).forEach(entry => {
        try { entry.map.remove(); } catch (e) {}
      });
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
      broadcastOrderGps,
      stopOrderGps,
      completeDelivery,
      refreshOrders,
      handleLogout,
      toggleAvailability,
      toggleGpsTracking,
      isWakeLockActive,
      recenterDriverMap,
    };
  },
};
