// G Shot Teas — Completed Orders Archive (Matches Figure 16)
const AdminCompletedTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header (Matches Figure 16) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-check-circle"></i> HISTORY & AUDITING
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Completed Orders</h2>
          <p class="text-xs text-gray-400">Total completed: {{ completedOrders.length }} orders</p>
        </div>

        <button 
          @click="refresh"
          class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors self-start sm:self-auto"
          title="Refresh">
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
        </button>
      </div>

      <!-- Completed Orders List (Matches Figure 16 Card Layout) -->
      <div v-if="completedOrders.length > 0" class="space-y-6">
        <div 
          v-for="order in completedOrders" 
          :key="order.id"
          class="p-6 sm:p-8 rounded-3xl bg-surface-800/90 border border-surface-700/80 shadow-xl space-y-6">
          
          <!-- Header: Order ID & Completed Badge -->
          <div class="flex items-center justify-between border-b border-surface-700/60 pb-4">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">ORDER {{ order.order_number }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(order.created_at) }}</p>
            </div>

            <span class="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              COMPLETED
            </span>
          </div>

          <!-- Customer & Address Block -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
            <div class="md:col-span-5 bg-surface-900/60 p-4 rounded-2xl border border-surface-700/50 space-y-1">
              <p class="text-[10px] text-gray-500 uppercase font-bold">Customer Details</p>
              <p class="text-sm font-bold text-white">{{ order.customer_name }}</p>
              <p class="text-gray-400 font-mono">{{ order.customer_phone }}</p>
              <p class="text-gray-400 leading-relaxed pt-1">{{ order.delivery_address || 'Store Pickup' }}</p>
            </div>

            <!-- Itemized List & Financial Totals -->
            <div class="md:col-span-7 space-y-2">
              <p class="text-[10px] text-gray-500 uppercase font-bold">Fulfilled Items</p>
              <div v-for="item in order.items" :key="item.id" class="flex justify-between py-1 border-b border-surface-700/40">
                <span class="text-gray-300">
                  <span class="text-brand-400 font-bold">x{{ item.quantity }}</span> {{ item.product_name }}
                </span>
                <span class="text-white font-medium">₱{{ Number(item.subtotal).toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-xs text-gray-400 pt-2">
                <span>Fulfillment & Payment:</span>
                <span class="text-white font-bold">{{ order.order_type }} • {{ order.payment_method }}</span>
              </div>

              <div class="flex justify-between text-base font-black text-white pt-2 border-t border-surface-700">
                <span>Total Amount:</span>
                <span class="text-brand-400">₱{{ Number(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-surface-800/40 rounded-3xl border border-surface-700/50">
        <div class="text-4xl mb-3">✅</div>
        <p class="text-base font-bold text-white">No completed orders yet</p>
        <p class="text-xs text-gray-500 mt-1">Orders marked as completed in the kitchen will be preserved here.</p>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);

    Vue.onMounted(() => {
      refresh();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        await store.fetchOrders();
      } finally {
        loading.value = false;
      }
    };

    const completedOrders = Vue.computed(() => {
      return store.orders.filter(o => o.status === 'Completed');
    });

    const formatDate = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return {
      store,
      loading,
      completedOrders,
      formatDate,
      refresh,
    };
  },
};
