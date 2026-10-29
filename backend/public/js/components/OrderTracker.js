// G Shot Teas â€” Order Tracker Component with Free Leaflet GPS Tracking
const OrderTracker = {
  template: `
    <div class="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      <!-- Back to Home -->
      <button 
        @click="backToHome"
        class="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors">
        <i class="pi pi-arrow-left"></i>
        <span>Back to Store</span>
      </button>

      <div v-if="order && order.order_number" class="bg-surface-800/90 rounded-3xl border border-surface-700 p-6 sm:p-10 space-y-8 shadow-2xl">
        
        <!-- Order ID & Live Status Header -->
        <div class="border-b border-surface-700/60 pb-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
              <h2 class="text-3xl font-black text-white mt-1">{{ order.order_number }}</h2>
            </div>
            <div class="text-right">
              <span 
                class="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
                :class="statusBadgeClass">
                <span class="w-2 h-2 rounded-full" :class="statusDotClass"></span>
                {{ order.status }}
              </span>
              <p class="text-[11px] text-gray-400 mt-1 font-mono">
                Placed {{ formatTime(order.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 4-Step Progress Bar (Matches Figure 11 in Capstone) -->
        <div>
          <div class="grid grid-cols-4 gap-2 text-center text-xs font-bold mb-3">
            <span :class="currentStepIndex >= 0 ? 'text-amber-400' : 'text-gray-500'">Pending</span>
            <span :class="currentStepIndex >= 1 ? 'text-brand-400' : 'text-gray-500'">Preparing</span>
            <span :class="currentStepIndex >= 2 ? 'text-sky-400' : 'text-gray-500'">
              {{ order.order_type === 'Delivery' ? 'Out for Delivery' : 'Ready for Pickup' }}
            </span>
            <span :class="currentStepIndex >= 3 ? 'text-emerald-400' : 'text-gray-500'">Completed</span>
          </div>

          <!-- Progress Bar Track -->
          <div class="h-2.5 bg-surface-900 rounded-full overflow-hidden p-0.5 border border-surface-700 flex">
            <div 
              class="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-amber-500 via-brand-500 to-emerald-500 shadow-md shadow-brand-500/30"
              :style="{ width: progressPercentage + '%' }">
            </div>
          </div>
          <p class="text-[11px] text-gray-400 text-center mt-2.5">
            {{ statusMessage }}
          </p>
        </div>

        <!-- Live GPS Delivery Tracker Map (Foodpanda-style Leaflet map) -->
        <div v-if="order.order_type === 'Delivery'" class="rounded-3xl border border-surface-700/80 bg-surface-900/90 p-4 sm:p-6 space-y-4 shadow-xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center text-xl shadow-lg">
                ðŸ›µ
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-black text-white uppercase tracking-wider">Live Delivery GPS Tracker</h4>
                  <span v-if="order.status === 'Out for Delivery'" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    LIVE EN ROUTE
                  </span>
                </div>
                <p class="text-[11px] text-gray-400">
                  <span v-if="order.status === 'Out for Delivery'" class="text-emerald-400 font-semibold">Rider Juan is on the road heading to your address!</span>
                  <span v-else-if="order.status === 'Completed'" class="text-emerald-400 font-semibold">Delivery completed! Enjoy your G Shot Teas!</span>
                  <span v-else class="text-gray-400">GPS map activated. Delivery route mapped from Santa Rosa kitchen.</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-800 text-gray-300 border border-surface-700">
                Leaflet â€¢ OpenStreetMap
              </span>
            </div>
          </div>

          <!-- Leaflet Map Container -->
          <div class="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-surface-700 shadow-inner bg-surface-950">
            <div id="order-tracker-map" class="w-full h-full"></div>
            
            <!-- Live GPS Status Badge Floating on Map -->
            <div class="absolute bottom-3 left-3 right-3 sm:right-auto bg-surface-900/90 backdrop-blur-md border border-surface-700 rounded-xl px-3.5 py-2 shadow-2xl flex items-center justify-between sm:justify-start gap-3 z-[15]">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" :class="order.status === 'Out for Delivery' ? 'animate-ping' : ''"></span>
                <span class="text-[11px] font-bold text-white">
                  {{ order.status === 'Out for Delivery' ? 'Rider In Transit' : 'Route & Waypoints Ready' }}
                </span>
              </div>
              <button 
                type="button"
                @click="recenterMap" 
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-surface-800 hover:bg-surface-700 text-brand-400 border border-surface-700 transition-colors">
                <i class="pi pi-compass text-[9px] mr-1"></i> Recenter
              </button>
            </div>
          </div>

          <!-- Waypoint Destination Details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div class="p-3 rounded-2xl bg-surface-800/60 border border-surface-700/60 flex items-start gap-3">
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-sm shrink-0">
                ðŸª
              </div>
              <div class="min-w-0">
                <p class="font-bold text-white">Store Origin</p>
                <p class="text-[11px] text-gray-400 truncate">G Shot Teas, Santa Rosa, Laguna</p>
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-surface-800/60 border border-surface-700/60 flex items-start gap-3">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm shrink-0">
                ðŸ 
              </div>
              <div class="min-w-0">
                <p class="font-bold text-white">Delivery Destination</p>
                <p class="text-[11px] text-gray-300 truncate" :title="order.delivery_address">{{ order.delivery_address || 'Santa Rosa, Laguna' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer & Delivery Info Card -->
        <div class="p-5 rounded-2xl bg-surface-900/60 border border-surface-700/60 text-xs space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-400">Customer</span>
            <span class="font-bold text-white">{{ order.customer_name || "Customer" }} ({{ order.customer_phone || "" }})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Fulfillment</span>
            <span class="font-bold text-brand-400">{{ order.order_type }}</span>
          </div>
          <div v-if="order.delivery_address" class="flex justify-between">
            <span class="text-gray-400">Address</span>
            <span class="font-medium text-gray-300 text-right max-w-xs">{{ order.delivery_address }}</span>
          </div>
          <div v-if="order.notes" class="flex justify-between">
            <span class="text-gray-400">Notes</span>
            <span class="text-gray-300 italic text-right">{{ order.notes }}</span>
          </div>
        </div>

        <!-- Ordered Items Summary (Matches Figure 11) -->
        <div>
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</h4>
          <div class="space-y-3">
            <div 
              v-for="item in order.items" 
              :key="item.id"
              class="flex items-center justify-between py-2 border-b border-surface-700/50 text-xs sm:text-sm">
              <div>
                <p class="font-bold text-white">
                  {{ item.product_name }} 
                  <span class="text-gray-400 font-normal">x{{ item.quantity }}</span>
                </p>
                <p v-if="item.customization" class="text-[11px] text-gray-400">
                  <span v-if="item.customization.size">{{ item.customization.size }}</span>
                  <span v-if="item.customization.sugar"> â€¢ {{ item.customization.sugar }}</span>
                  <span v-if="item.customization.ice"> â€¢ {{ item.customization.ice }}</span>
                </p>
              </div>
              <span class="font-black text-white">
                â‚±{{ Number(item.subtotal).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Financial Totals -->
        <div class="pt-4 border-t border-surface-700 space-y-2 text-xs">
          <div class="flex justify-between text-gray-400">
            <span>Payment Method</span>
            <span class="font-bold text-white">
              {{ order.payment_method }} 
              <span :class="order.payment_status === 'Verified' || order.payment_status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'">
                ({{ order.payment_status }})
              </span>
            </span>
          </div>
          <div v-if="order.gcash_ref" class="flex justify-between text-xs">
            <span class="text-gray-400">GCash Ref No.</span>
            <span class="font-mono font-bold text-sky-400">{{ order.gcash_ref }}</span>
          </div>
          <div v-if="order.proof_image" class="flex justify-between text-xs items-center">
            <span class="text-gray-400">GCash Receipt</span>
            <button 
              type="button" 
              @click="previewReceipt = order.proof_image"
              class="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] underline cursor-pointer">
              <i class="pi pi-check-circle text-[10px]"></i> View Attached Receipt
            </button>
          </div>
          <div v-if="order.delivery_fee > 0" class="flex justify-between text-gray-400">
            <span>Delivery Fee</span>
            <span class="font-medium text-white">â‚±{{ Number(order.delivery_fee).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-xl font-black text-white pt-2">
            <span>Total</span>
            <span class="text-brand-400">â‚±{{ Number(order.total_amount).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Action / Cancellation (Page 44 System Constraint) -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-[11px] text-gray-500">
            Auto-refreshing every 5 seconds.
          </p>
          
          <button 
            v-if="order.status === 'Pending'"
            @click="cancelOrder"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors">
            Cancel Order
          </button>
          <span 
            v-else-if="order.status !== 'Completed' && order.status !== 'Cancelled'"
            class="text-xs text-gray-400 italic">
            Kitchen preparation underway (cancellation locked)
          </span>
        </div>

      </div>

      <!-- No Active Order State -->
      <div v-else class="text-center py-20 bg-surface-800/50 rounded-3xl border border-surface-700 p-8">
        <div class="text-4xl mb-4">ðŸ“¦</div>
        <h3 class="text-lg font-bold text-white">No Active Order Selected</h3>
        <p class="text-xs text-gray-400 mt-1">Place an order or check your order history to track progress.</p>
        <button 
          @click="backToHome"
          class="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-all">
          Explore Menu
        </button>
      </div>

      <!-- Receipt Lightbox Modal -->
      <div 
        v-if="previewReceipt" 
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="previewReceipt = null">
        <div class="relative max-w-lg w-full bg-surface-900 border border-surface-700 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="pi pi-receipt text-sky-400"></i> Your Uploaded GCash Receipt
            </h4>
            <button 
              @click="previewReceipt = null" 
              class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
              âœ•
            </button>
          </div>
          <div class="max-h-[65vh] overflow-auto rounded-2xl bg-black border border-surface-800 p-2 flex items-center justify-center">
            <img :src="previewReceipt" alt="Payment Receipt" class="max-h-[60vh] w-auto object-contain rounded-lg" />
          </div>
          <div class="text-right">
            <button 
              @click="previewReceipt = null" 
              class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold transition-colors cursor-pointer">
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const store = useGShotStore();
    const order = Vue.computed(() => store.activeOrder);

    const steps = ['Pending', 'Preparing', 'Ready', 'Completed'];

    const currentStepIndex = Vue.computed(() => {
      if (!order.value) return 0;
      const s = order.value.status;
      if (s === 'Pending') return 0;
      if (s === 'Preparing') return 1;
      if (s === 'Ready for Pickup' || s === 'Out for Delivery') return 2;
      if (s === 'Completed') return 3;
      return 0;
    });

    const progressPercentage = Vue.computed(() => {
      const idx = currentStepIndex.value;
      if (idx === 0) return 25;
      if (idx === 1) return 50;
      if (idx === 2) return 75;
      if (idx === 3) return 100;
      return 25;
    });

    const statusBadgeClass = Vue.computed(() => {
      const s = order.value?.status;
      if (s === 'Completed') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      if (s === 'Preparing') return 'bg-brand-500/20 text-brand-400 border border-brand-500/40';
      if (s === 'Cancelled') return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    });

    const statusDotClass = Vue.computed(() => {
      const s = order.value?.status;
      if (s === 'Completed') return 'bg-emerald-400';
      if (s === 'Preparing') return 'bg-brand-400 animate-pulse';
      if (s === 'Cancelled') return 'bg-rose-400';
      return 'bg-amber-400 animate-pulse';
    });

    const statusMessage = Vue.computed(() => {
      const s = order.value?.status;
      if (s === 'Pending') return 'We have received your order! Awaiting barista confirmation.';
      if (s === 'Preparing') return 'Barista is preparing your tea & kitchen comfort food fresh!';
      if (s === 'Ready for Pickup') return 'Your order is packed and ready for pickup at the store counter!';
      if (s === 'Out for Delivery') return 'Your order has been handed to our rider and is on the way!';
      if (s === 'Completed') return 'Order completed! Thank you for enjoying G Shot Teas!';
      if (s === 'Cancelled') return 'This order was cancelled. Ingredients returned to kitchen stock.';
      return '';
    });

    const formatTime = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const backToHome = () => {
      store.currentView = 'customer';
      store.activeSection = 'home';
    };

    const cancelOrder = async () => {
      if (!confirm('Are you sure you want to cancel this order?')) return;
      try {
        await GST_API.updateOrderStatus(order.value.id, 'Cancelled');
        store.notify('Order cancelled. Ingredients returned to inventory.', 'info');
        store.refreshActiveOrder(order.value.id);
        store.fetchIngredients();
      } catch (err) {
        store.notify('Could not cancel order.', 'error');
      }
    };

    const previewReceipt = Vue.ref(null);

    // --- Leaflet Live GPS Tracking Map Implementation ---
    let trackerMap = null;
    let storeMarker = null;
    let customerMarker = null;
    let riderMarker = null;
    let routeLine = null;

    // Base store location: Santa Rosa, Laguna (near Sinalhan / Amira Townhomes)
    const STORE_LAT = 14.3167;
    const STORE_LNG = 121.1111;

    const initOrUpdateMap = () => {
      if (typeof window === 'undefined' || typeof window.L === 'undefined') return;
      if (!order.value || order.value.order_type !== 'Delivery') return;

      const mapEl = document.getElementById('order-tracker-map');
      if (!mapEl) return;

      // Customer Lat/Lng
      const custLat = order.value.customer_lat ? Number(order.value.customer_lat) : 14.3218;
      const custLng = order.value.customer_lng ? Number(order.value.customer_lng) : 121.1192;

      // Rider Lat/Lng calculation
      let riderLat = order.value.driver_lat ? Number(order.value.driver_lat) : null;
      let riderLng = order.value.driver_lng ? Number(order.value.driver_lng) : null;
      
      if (!riderLat || !riderLng) {
        if (order.value.status === 'Out for Delivery') {
          // Simulated 65% progression along route toward customer
          riderLat = STORE_LAT + (custLat - STORE_LAT) * 0.65;
          riderLng = STORE_LNG + (custLng - STORE_LNG) * 0.65;
        } else if (order.value.status === 'Completed') {
          riderLat = custLat;
          riderLng = custLng;
        } else {
          riderLat = STORE_LAT;
          riderLng = STORE_LNG;
        }
      }

      if (!trackerMap) {
        trackerMap = L.map('order-tracker-map', {
          zoomControl: true,
          scrollWheelZoom: false,
          attributionControl: true
        }).setView([STORE_LAT, STORE_LNG], 14);

        // Dark Matter map tiles (matches G Shot Teas dark theme)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
          maxZoom: 19,
          className: 'dark-osm-tiles'
        }).addTo(trackerMap);

        // Store Pin Icon
        const storeIcon = L.divIcon({
          className: 'custom-store-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-9 h-9 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-sm font-bold">
                ðŸª
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        // Customer Destination Icon
        const customerIcon = L.divIcon({
          className: 'custom-customer-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-9 h-9 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-sm font-bold">
                ðŸ 
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        // Rider Icon
        const riderIcon = L.divIcon({
          className: 'custom-rider-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="rider-ping-ring"></div>
              <div class="w-10 h-10 rounded-full bg-brand-500 border-2 border-white shadow-2xl flex items-center justify-center text-base z-10 animate-bounce-sm">
                ðŸ›µ
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        storeMarker = L.marker([STORE_LAT, STORE_LNG], { icon: storeIcon })
          .addTo(trackerMap)
          .bindPopup('<b>G Shot Teas</b><br>Kitchen Store Origin');

        customerMarker = L.marker([custLat, custLng], { icon: customerIcon })
          .addTo(trackerMap)
          .bindPopup(`<b>Delivery Destination</b><br>${order.value.delivery_address || 'Santa Rosa, Laguna'}`);

        riderMarker = L.marker([riderLat, riderLng], { icon: riderIcon })
          .addTo(trackerMap)
          .bindPopup(`<b>G Shot Teas Delivery Rider</b><br>${order.value.status === 'Out for Delivery' ? 'En route to your doorstep!' : 'Awaiting dispatch'}`);

        // Polyline connecting Store -> Rider -> Destination
        routeLine = L.polyline([
          [STORE_LAT, STORE_LNG],
          [riderLat, riderLng],
          [custLat, custLng]
        ], {
          color: '#f97316',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8'
        }).addTo(trackerMap);

        // Fit bounds with comfortable padding
        const bounds = L.latLngBounds([
          [STORE_LAT, STORE_LNG],
          [custLat, custLng],
          [riderLat, riderLng]
        ]);
        trackerMap.fitBounds(bounds, { padding: [45, 45] });

        setTimeout(() => {
          if (trackerMap) trackerMap.invalidateSize();
        }, 250);

      } else {
        // Update marker and route line positions
        if (customerMarker) customerMarker.setLatLng([custLat, custLng]);
        if (riderMarker) riderMarker.setLatLng([riderLat, riderLng]);
        if (routeLine) {
          routeLine.setLatLngs([
            [STORE_LAT, STORE_LNG],
            [riderLat, riderLng],
            [custLat, custLng]
          ]);
        }
      }
    };

    const recenterMap = () => {
      if (!trackerMap) return;
      const custLat = order.value?.customer_lat ? Number(order.value.customer_lat) : 14.3218;
      const custLng = order.value?.customer_lng ? Number(order.value.customer_lng) : 121.1192;
      let riderLat = order.value?.driver_lat ? Number(order.value.driver_lat) : (STORE_LAT + (custLat - STORE_LAT) * 0.65);
      let riderLng = order.value?.driver_lng ? Number(order.value.driver_lng) : (STORE_LNG + (custLng - STORE_LNG) * 0.65);

      const bounds = L.latLngBounds([
        [STORE_LAT, STORE_LNG],
        [custLat, custLng],
        [riderLat, riderLng]
      ]);
      trackerMap.fitBounds(bounds, { padding: [45, 45] });
    };

    let pollInterval = null;
    let echoChannelSubscribed = null;

    const subscribeToOrderEcho = (orderId) => {
      if (!orderId || !window.Echo) return;
      if (echoChannelSubscribed === orderId) return;
      if (echoChannelSubscribed) {
        try { window.Echo.leave(`orders.${echoChannelSubscribed}`); } catch (e) {}
      }
      echoChannelSubscribed = orderId;
      console.log(`📡 [Reverb] Subscribing to live updates for order #${orderId}`);
      window.Echo.channel(`orders.${orderId}`)
        .listen('.DriverLocationUpdated', (e) => {
          console.log('📍 [Reverb] Live Driver Location Received:', e);
          if (order.value && Number(order.value.id) === Number(e.order_id)) {
            order.value.driver_lat = e.driver_lat;
            order.value.driver_lng = e.driver_lng;
            if (e.driver_notes) order.value.driver_notes = e.driver_notes;

            if (riderMarker) {
              riderMarker.setLatLng([e.driver_lat, e.driver_lng]);
            } else {
              initOrUpdateMap();
            }
          }
        })
        .listen('.OrderStatusUpdated', (e) => {
          console.log('⚡ [Reverb] Live Order Status Changed:', e);
          if (order.value && Number(order.value.id) === Number(e.order_id)) {
            order.value.status = e.status;
            if (e.driver) order.value.driver = e.driver;
            store.refreshActiveOrder(order.value.id);
          }
        });
    };

    Vue.onMounted(async () => {
      if (!order.value || !order.value.order_number) {
        await store.fetchUserActiveOrder();
      }
      Vue.nextTick(() => {
        initOrUpdateMap();
      });

      if (order.value && order.value.id) {
        subscribeToOrderEcho(order.value.id);
      }

      pollInterval = setInterval(async () => {
        if (order.value && order.value.id) {
          if (!echoChannelSubscribed) {
            subscribeToOrderEcho(order.value.id);
          }
          await store.refreshActiveOrder(order.value.id);
        } else if (store.user) {
          await store.fetchUserActiveOrder();
        }
      }, 5000);
    });

    Vue.watch(() => order.value?.id, (newId) => {
      if (newId) {
        subscribeToOrderEcho(newId);
      }
    });

    Vue.watch(() => order.value, () => {
      Vue.nextTick(() => {
        initOrUpdateMap();
      });
    }, { deep: true });

    Vue.onBeforeUnmount(() => {
      if (pollInterval) clearInterval(pollInterval);
      if (echoChannelSubscribed && window.Echo) {
        try { window.Echo.leave(`orders.${echoChannelSubscribed}`); } catch (e) {}
        echoChannelSubscribed = null;
      }
      if (trackerMap) {
        trackerMap.remove();
        trackerMap = null;
      }
    });

    return {
      store,
      order,
      previewReceipt,
      currentStepIndex,
      progressPercentage,
      statusBadgeClass,
      statusDotClass,
      statusMessage,
      formatTime,
      backToHome,
      cancelOrder,
      recenterMap,
    };
  },
};
