// G Shot Teas — Customer Order History Component (Matches Figure 13)
const OrderHistoryView = {
  template: `
    <div class="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      <!-- Back to Menu button -->
      <button 
        @click="backToHome"
        class="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors">
        <i class="pi pi-arrow-left"></i>
        <span>Back to Store</span>
      </button>

      <!-- Section Title & Counter (Matches Figure 13) -->
      <div class="text-center mb-10">
        <h2 class="text-3xl sm:text-4xl font-black text-white">Order History</h2>
        <p class="text-xs text-gray-400 mt-1">Total orders: {{ customerOrders.length }}</p>
      </div>

      <!-- Orders List -->
      <div v-if="customerOrders.length > 0" class="space-y-6">
        <div 
          v-for="order in customerOrders" 
          :key="order.id"
          class="rounded-3xl bg-surface-800/80 border border-surface-700/70 p-6 sm:p-8 space-y-6 shadow-xl hover:border-brand-500/40 transition-all">
          
          <!-- Card Header (Order # and Status Badge) -->
          <div class="flex items-center justify-between border-b border-surface-700/60 pb-4">
            <div>
              <span class="text-lg font-black text-white">ORDER {{ order.order_number }}</span>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(order.created_at) }}</p>
            </div>
            
            <div class="flex items-center gap-2">
              <span 
                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                :class="order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (order.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-brand-500/20 text-brand-400 border border-brand-500/30')">
                {{ order.status }}
              </span>
              <button 
                @click="trackThisOrder(order)"
                class="p-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-gray-300 hover:text-white text-xs"
                title="View tracker">
                <i class="pi pi-external-link"></i>
              </button>
            </div>
          </div>

          <!-- Items Ordered Grid (Matches Figure 13 layout) -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div class="md:col-span-8 space-y-2">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ITEMS ORDERED</p>
              <div v-for="item in order.items" :key="item.id" class="flex justify-between text-xs sm:text-sm">
                <span class="text-gray-300">
                  <span class="text-brand-400 font-bold">x{{ item.quantity }}</span> {{ item.product_name }}
                </span>
                <span class="text-white font-medium">₱{{ Number(item.subtotal).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Fulfillment & Total Info Column -->
            <div class="md:col-span-4 bg-surface-900/60 p-4 rounded-2xl border border-surface-700/50 space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-400">TYPE</span>
                <span class="font-bold text-white">{{ order.order_type }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">PAYMENT</span>
                <span class="font-bold text-white">{{ order.payment_method }}</span>
              </div>
              <div class="flex justify-between text-sm font-black pt-2 border-t border-surface-700">
                <span class="text-gray-300">Total</span>
                <span class="text-brand-400">₱{{ Number(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              @click="reorder(order)"
              class="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white border border-brand-500/40 transition-all flex items-center gap-1.5">
              <i class="pi pi-replay"></i>
              <span>Reorder Items</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-surface-800/40 rounded-3xl border border-surface-700/50 p-8">
        <div class="text-4xl mb-3">📜</div>
        <h3 class="text-base font-bold text-white">No previous orders found</h3>
        <p class="text-xs text-gray-500 mt-1">Start placing delicious orders from our menu!</p>
        <button 
          @click="backToHome"
          class="mt-4 px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
          Explore Menu
        </button>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();

    Vue.onMounted(() => {
      store.fetchOrders();
    });

    const customerOrders = Vue.computed(() => {
      if (!store.user) return store.orders;
      return store.orders.filter(o => o.user_id === store.user.id || o.customer_name === store.user.name);
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

    const backToHome = () => {
      store.currentView = 'customer';
      store.activeSection = 'home';
    };

    const trackThisOrder = (ord) => {
      store.activeOrder = ord;
      store.currentView = 'track';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const reorder = (ord) => {
      ord.items.forEach(item => {
        const product = store.products.find(p => p.id === item.product_id) || {
          id: item.product_id,
          name: item.product_name,
          price: item.unit_price,
          category: 'Drinks',
        };
        store.addToCart(product, item.customization);
      });
      store.cartOpen = true;
      store.notify(`Re-added ${ord.items.length} items to your cart!`);
    };

    return {
      store,
      customerOrders,
      formatDate,
      backToHome,
      trackThisOrder,
      reorder,
    };
  },
};
