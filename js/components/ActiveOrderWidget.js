// G Shot Teas — Active Order Floating Widget (Matches Figure 12)
const ActiveOrderWidget = {
  template: `
    <div 
      v-if="store.activeOrder && store.currentView === 'customer' && isOngoing"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce-sm">
      
      <button 
        @click="goToTracker"
        class="flex items-center gap-3 px-5 py-3 rounded-full bg-surface-900/95 border border-brand-500/60 shadow-2xl shadow-brand-500/20 text-white backdrop-blur-md hover:scale-105 transition-transform group">
        
        <!-- Live Animated Indicator -->
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
        </span>

        <div class="text-left text-xs">
          <p class="font-extrabold text-white flex items-center gap-1.5">
            <span>{{ store.activeOrder.order_number }}</span>
            <span class="text-brand-400">• {{ store.activeOrder.status }}</span>
          </p>
          <p class="text-[10px] text-gray-400 font-medium">Click to track fulfillment in real-time</p>
        </div>

        <div class="w-7 h-7 rounded-full bg-brand-600/30 text-brand-400 flex items-center justify-center text-xs group-hover:bg-brand-600 group-hover:text-white transition-colors">
          <i class="pi pi-chevron-right text-[10px]"></i>
        </div>
      </button>

    </div>
  `,
  setup() {
    const store = useGShotStore();

    const isOngoing = Vue.computed(() => {
      const s = store.activeOrder?.status;
      return ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(s);
    });

    const goToTracker = () => {
      store.currentView = 'track';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
      store,
      isOngoing,
      goToTracker,
    };
  },
};
