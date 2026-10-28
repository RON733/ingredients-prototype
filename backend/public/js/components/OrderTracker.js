// G Shot Teas — Order Tracker Component (Matches Figure 11)
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

      <div v-if="order" class="bg-surface-800/90 rounded-3xl border border-surface-700 p-6 sm:p-10 space-y-8 shadow-2xl">
        
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

        <!-- Customer & Delivery Info Card -->
        <div class="p-5 rounded-2xl bg-surface-900/60 border border-surface-700/60 text-xs space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-400">Customer</span>
            <span class="font-bold text-white">{{ order.customer_name }} ({{ order.customer_phone }})</span>
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
                  <span v-if="item.customization.sugar"> • {{ item.customization.sugar }}</span>
                  <span v-if="item.customization.ice"> • {{ item.customization.ice }}</span>
                </p>
              </div>
              <span class="font-black text-white">
                ₱{{ Number(item.subtotal).toFixed(2) }}
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
          <div v-if="order.proof_image && !order.gcash_ref" class="flex justify-between text-xs">
            <span class="text-gray-400">Payment Verification</span>
            <span class="font-bold text-emerald-400 flex items-center gap-1">
              <i class="pi pi-check-circle text-[10px]"></i> Receipt Screenshot Attached
            </span>
          </div>
          <div v-if="order.delivery_fee > 0" class="flex justify-between text-gray-400">
            <span>Delivery Fee</span>
            <span class="font-medium text-white">₱{{ Number(order.delivery_fee).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-xl font-black text-white pt-2">
            <span>Total</span>
            <span class="text-brand-400">₱{{ Number(order.total_amount).toFixed(2) }}</span>
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
        <div class="text-4xl mb-4">📦</div>
        <h3 class="text-lg font-bold text-white">No Active Order Selected</h3>
        <p class="text-xs text-gray-400 mt-1">Place an order or check your order history to track progress.</p>
        <button 
          @click="backToHome"
          class="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-all">
          Explore Menu
        </button>
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

    return {
      store,
      order,
      currentStepIndex,
      progressPercentage,
      statusBadgeClass,
      statusDotClass,
      statusMessage,
      formatTime,
      backToHome,
      cancelOrder,
    };
  },
};
