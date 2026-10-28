// G Shot Teas — Admin & Staff Active Orders Tab (Matches Figure 14)
const AdminOrdersTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header & Walk-in Cashier Mode Button -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> LIVE ORDERS FEED
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Active Orders</h2>
          <p class="text-xs text-gray-400">Monitor and manage incoming store and delivery orders in real time.</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="openWalkInModal"
            class="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
            <i class="pi pi-desktop"></i>
            <span>Encode Walk-in Order (POS)</span>
          </button>
          <button 
            @click="refresh"
            class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors"
            title="Refresh Orders">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards (Matches Figure 14: Total Orders, Pending, Completed) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-surface-800/80 border border-surface-700/60">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Active Orders</p>
          <p class="text-3xl font-black text-white mt-1.5">{{ activeOrders.length }}</p>
        </div>
        <div class="p-5 rounded-2xl bg-surface-800/80 border border-surface-700/60">
          <p class="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending Orders</p>
          <p class="text-3xl font-black text-amber-400 mt-1.5">{{ pendingOrdersCount }}</p>
        </div>
        <div class="p-5 rounded-2xl bg-surface-800/80 border border-surface-700/60">
          <p class="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Preparing in Kitchen</p>
          <p class="text-3xl font-black text-brand-400 mt-1.5">{{ preparingOrdersCount }}</p>
        </div>
        <div class="p-5 rounded-2xl bg-surface-800/80 border border-surface-700/60">
          <p class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Completed Today</p>
          <p class="text-3xl font-black text-emerald-400 mt-1.5">{{ completedOrdersCount }}</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 border-b border-surface-800 pb-3 overflow-x-auto no-scrollbar">
        <button 
          v-for="st in statusFilters" 
          :key="st.key"
          @click="selectedFilter = st.key"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
          :class="selectedFilter === st.key ? 'bg-surface-700 text-white shadow-md' : 'text-gray-400 hover:text-white'">
          {{ st.label }}
        </button>
      </div>

      <!-- Orders List / Cards (Matches Figure 14) -->
      <div v-if="filteredOrders.length > 0" class="space-y-4">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="p-6 rounded-3xl bg-surface-800/80 border border-surface-700/70 hover:border-surface-600 transition-all shadow-xl space-y-4">
          
          <!-- Order Title, Customer Name, and Current Status -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-700/60 pb-4">
            <div class="flex items-center gap-3">
              <span class="text-xl font-black text-white">{{ order.order_number }}</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase"
                :class="order.order_type === 'Delivery' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'">
                {{ order.order_type }}
              </span>
              <span class="text-xs text-gray-400">
                • {{ formatTime(order.created_at) }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Payment Status Badge -->
              <span 
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                :class="order.payment_status === 'Verified' || order.payment_status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'">
                {{ order.payment_method }}: {{ order.payment_status }}
              </span>

              <!-- Status Badge -->
              <span 
                class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                :class="getStatusBadge(order.status)">
                {{ order.status }}
              </span>
            </div>
          </div>

          <!-- Customer Details & Order Items Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <!-- Customer Info (Matches Figure 14: Customer details block) -->
            <div class="md:col-span-5 bg-surface-900/60 p-4 rounded-2xl border border-surface-700/50 text-xs space-y-1.5">
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Customer Details</p>
              <p class="text-sm font-bold text-white">{{ order.customer_name }}</p>
              <p class="text-gray-400 font-mono"><i class="pi pi-phone text-[10px] text-brand-400 mr-1"></i>{{ order.customer_phone }}</p>
              <p v-if="order.delivery_address" class="text-gray-400 leading-relaxed">
                <i class="pi pi-map-marker text-[10px] text-brand-400 mr-1"></i>{{ order.delivery_address }}
              </p>
              <p v-if="order.gcash_ref" class="text-sky-400 font-mono font-semibold pt-1">
                GCash Ref: {{ order.gcash_ref }}
              </p>
              <div v-if="order.proof_image" class="pt-1.5">
                <button 
                  type="button"
                  @click="selectedReceiptImage = order.proof_image" 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[11px] font-bold border border-sky-500/40 transition-colors cursor-pointer">
                  <i class="pi pi-image text-xs"></i>
                  <span>View Receipt Screenshot</span>
                </button>
              </div>
              <p v-if="order.notes" class="text-gray-400 italic pt-1">
                Note: "{{ order.notes }}"
              </p>
            </div>

            <!-- Items Ordered -->
            <div class="md:col-span-7 space-y-2 text-xs">
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Order Items</p>
              <div v-for="item in order.items" :key="item.id" class="flex justify-between py-1.5 border-b border-surface-700/40">
                <div>
                  <span class="font-bold text-white">{{ item.quantity }}x {{ item.product_name }}</span>
                  <span v-if="item.customization?.size" class="text-[10px] text-brand-400 ml-1.5">
                    ({{ item.customization.size }}<span v-if="item.customization.sugar">, {{ item.customization.sugar }} sugar</span>)
                  </span>
                </div>
                <span class="font-bold text-gray-300">₱{{ Number(item.subtotal).toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-sm font-black text-white pt-2">
                <span>Total Amount:</span>
                <span class="text-brand-400">₱{{ Number(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>

          </div>

          <!-- Workflow Action Buttons (Staff & Admin Controls) -->
          <div class="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-surface-700/50">
            <!-- Verify Payment button if GCash pending -->
            <button 
              v-if="order.payment_method === 'GCash' && order.payment_status !== 'Verified'"
              @click="verifyPayment(order)"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 transition-all flex items-center gap-1.5">
              <i class="pi pi-check"></i>
              <span>Verify GCash Payment</span>
            </button>

            <!-- State Transitions -->
            <button 
              v-if="order.status === 'Pending'"
              @click="updateStatus(order, 'Preparing')"
              class="px-4 py-2 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all flex items-center gap-1.5">
              <i class="pi pi-play"></i>
              <span>Start Preparing</span>
            </button>

            <button 
              v-if="order.status === 'Preparing'"
              @click="updateStatus(order, order.order_type === 'Delivery' ? 'Out for Delivery' : 'Ready for Pickup')"
              class="px-4 py-2 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition-all flex items-center gap-1.5">
              <i class="pi pi-send"></i>
              <span>{{ order.order_type === 'Delivery' ? 'Dispatch Rider' : 'Mark Ready for Pickup' }}</span>
            </button>

            <button 
              v-if="order.status === 'Preparing' || order.status === 'Ready for Pickup' || order.status === 'Out for Delivery'"
              @click="updateStatus(order, 'Completed')"
              class="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5">
              <i class="pi pi-check-circle"></i>
              <span>Complete Order</span>
            </button>

            <button 
              v-if="order.status !== 'Completed' && order.status !== 'Cancelled'"
              @click="updateStatus(order, 'Cancelled')"
              class="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors">
              Cancel Order
            </button>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-surface-800/40 rounded-3xl border border-surface-700/50">
        <div class="text-4xl mb-3">☕</div>
        <p class="text-base font-bold text-white">No active orders matching this filter</p>
        <p class="text-xs text-gray-500 mt-1">New incoming customer orders will appear here automatically.</p>
      </div>

      <!-- Walk-in Cashier (POS) Modal -->
      <div v-if="walkInModalOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-surface-900 border border-surface-700 rounded-3xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-surface-700 pb-3">
            <h3 class="text-lg font-black text-white">Encode Walk-in Counter Order (POS)</h3>
            <button @click="walkInModalOpen = false" class="text-gray-400 hover:text-white">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-gray-400 mb-1">Customer Name</label>
              <input v-model="walkInForm.customer_name" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" placeholder="Walk-in Customer" />
            </div>
            <div>
              <label class="block text-gray-400 mb-1">Phone Number</label>
              <input v-model="walkInForm.customer_phone" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" placeholder="09XXXXXXXXX" />
            </div>
          </div>

          <!-- Select Product -->
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1">Select Menu Item</label>
            <select v-model="walkInForm.product_id" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white text-xs cursor-pointer">
              <option v-for="p in store.products" :key="p.id" :value="p.id">
                {{ p.name }} (₱{{ p.price }}) - Stock: {{ p.max_portions }} portions
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-surface-700">
            <button @click="walkInModalOpen = false" class="px-4 py-2 text-xs text-gray-400">Cancel</button>
            <button @click="submitWalkIn" class="px-5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
              Place Walk-in Order
            </button>
          </div>
        </div>
      </div>

      <!-- Receipt Screenshot Lightbox Modal -->
      <div 
        v-if="selectedReceiptImage" 
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="selectedReceiptImage = null">
        <div class="relative max-w-lg w-full bg-surface-900 border border-surface-700 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="pi pi-receipt text-sky-400"></i> Customer GCash Receipt Screenshot
            </h4>
            <button 
              @click="selectedReceiptImage = null" 
              class="w-7 h-7 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors">
              ✕
            </button>
          </div>
          <div class="max-h-[65vh] overflow-auto rounded-2xl bg-black border border-surface-800 p-2 flex items-center justify-center">
            <img :src="selectedReceiptImage" alt="Payment Receipt" class="max-h-[60vh] w-auto object-contain rounded-lg" />
          </div>
          <div class="text-right">
            <button 
              @click="selectedReceiptImage = null"
              class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold transition-colors">
              Close Preview
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const selectedFilter = Vue.ref('active');
    const walkInModalOpen = Vue.ref(false);
    const selectedReceiptImage = Vue.ref(null);

    const walkInForm = Vue.reactive({
      customer_name: 'Walk-in Customer',
      customer_phone: '09000000000',
      product_id: 'classic-cheeseburger',
    });

    const statusFilters = [
      { key: 'active', label: 'All Active' },
      { key: 'Pending', label: 'Pending' },
      { key: 'Preparing', label: 'Preparing' },
      { key: 'Ready for Pickup', label: 'Ready / Dispatch' },
      { key: 'all', label: 'All Orders' },
    ];

    Vue.onMounted(() => {
      refresh();
      const interval = setInterval(refresh, 6000);
      Vue.onUnmounted(() => clearInterval(interval));
    });

    const refresh = async () => {
      loading.value = true;
      try {
        await store.fetchOrders();
      } finally {
        loading.value = false;
      }
    };

    const activeOrders = Vue.computed(() => {
      return store.orders.filter(o => ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status));
    });

    const pendingOrdersCount = Vue.computed(() => {
      return store.orders.filter(o => o.status === 'Pending').length;
    });

    const preparingOrdersCount = Vue.computed(() => {
      return store.orders.filter(o => o.status === 'Preparing').length;
    });

    const completedOrdersCount = Vue.computed(() => {
      return store.orders.filter(o => o.status === 'Completed').length;
    });

    const filteredOrders = Vue.computed(() => {
      if (selectedFilter.value === 'active') {
        return activeOrders.value;
      }
      if (selectedFilter.value === 'all') {
        return store.orders;
      }
      return store.orders.filter(o => o.status === selectedFilter.value);
    });

    const getStatusBadge = (s) => {
      if (s === 'Pending') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      if (s === 'Preparing') return 'bg-brand-500/20 text-brand-400 border border-brand-500/30';
      if (s === 'Ready for Pickup' || s === 'Out for Delivery') return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      if (s === 'Completed') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    };

    const formatTime = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const updateStatus = async (order, newStatus) => {
      try {
        await GST_API.updateOrderStatus(order.id, newStatus);
        store.notify(`Order ${order.order_number} moved to ${newStatus}`);
        refresh();
        store.fetchIngredients();
        store.fetchProducts();
      } catch (err) {
        store.notify('Error updating order status.', 'error');
      }
    };

    const verifyPayment = async (order) => {
      try {
        await GST_API.verifyPayment(order.id);
        store.notify(`GCash Payment verified for ${order.order_number}`);
        refresh();
      } catch (err) {
        store.notify('Error verifying payment.', 'error');
      }
    };

    const openWalkInModal = () => {
      walkInModalOpen.value = true;
    };

    const submitWalkIn = async () => {
      try {
        await GST_API.placeOrder({
          customer_name: walkInForm.customer_name,
          customer_phone: walkInForm.customer_phone,
          order_type: 'Walk-in',
          delivery_address: 'In-Store Counter',
          payment_method: 'Cash',
          items: [
            {
              product_id: walkInForm.product_id,
              quantity: 1,
            }
          ]
        });
        store.notify('Walk-in order created! Ingredients depleted automatically.', 'success');
        walkInModalOpen.value = false;
        refresh();
        store.fetchIngredients();
      } catch (err) {
        store.notify('Could not place walk-in order: Check ingredient stock.', 'error');
      }
    };

    return {
      store,
      loading,
      selectedFilter,
      statusFilters,
      activeOrders,
      pendingOrdersCount,
      preparingOrdersCount,
      completedOrdersCount,
      filteredOrders,
      getStatusBadge,
      formatTime,
      updateStatus,
      verifyPayment,
      refresh,
      walkInModalOpen,
      walkInForm,
      openWalkInModal,
      submitWalkIn,
      selectedReceiptImage,
    };
  },
};
