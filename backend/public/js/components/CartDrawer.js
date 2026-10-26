// G Shot Teas — Cart Drawer Component (Matches Figure 9)
const CartDrawer = {
  template: `
    <div>
      <!-- Backdrop Overlay -->
      <div 
        v-if="store.cartOpen" 
        @click="store.cartOpen = false"
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in">
      </div>

      <!-- Drawer Panel -->
      <div 
        class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-900 border-l border-surface-700 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        :class="store.cartOpen ? 'translate-x-0' : 'translate-x-full'">
        
        <!-- Header -->
        <div class="p-6 border-b border-surface-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <i class="pi pi-shopping-bag text-base"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Your Cart</h2>
              <p class="text-xs text-gray-400">{{ store.cartCount }} item{{ store.cartCount === 1 ? '' : 's' }} selected</p>
            </div>
          </div>

          <button 
            @click="store.cartOpen = false"
            class="w-9 h-9 rounded-full bg-surface-800 hover:bg-surface-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="store.cart.length === 0" class="h-full flex flex-col items-center justify-center text-center py-12">
            <div class="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center text-3xl text-gray-600 mb-4">
              🛒
            </div>
            <p class="text-base font-bold text-gray-300">Your cart is empty</p>
            <p class="text-xs text-gray-500 mt-1 max-w-[200px]">Browse our delicious milk teas and comfort food to add items.</p>
            <button 
              @click="store.cartOpen = false; scrollToMenu()"
              class="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30">
              Browse Menu
            </button>
          </div>

          <div 
            v-for="item in store.cart" 
            :key="item.cartItemId"
            class="p-4 rounded-2xl bg-surface-800/80 border border-surface-700/60 flex items-center justify-between gap-3 group hover:border-brand-500/40 transition-all">
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ item.emoji || '🍽️' }}</span>
                <h4 class="text-sm font-bold text-white truncate">{{ item.name }}</h4>
              </div>
              
              <!-- Customizations Details Badge -->
              <p v-if="item.customization" class="text-[11px] text-gray-400 mt-1">
                <span v-if="item.customization.size" class="text-brand-400 font-semibold">{{ item.customization.size }}</span>
                <span v-if="item.customization.sugar"> • {{ item.customization.sugar }} Sugar</span>
                <span v-if="item.customization.ice"> • {{ item.customization.ice }}</span>
                <span v-if="item.customization.toppings && item.customization.toppings.length">
                  • {{ item.customization.toppings.join(', ') }}
                </span>
              </p>

              <p class="text-xs font-extrabold text-brand-400 mt-1.5">
                ₱{{ (item.unit_price * item.quantity).toFixed(2) }}
                <span class="text-[10px] text-gray-500 font-normal"> (₱{{ item.unit_price.toFixed(2) }} each)</span>
              </p>
            </div>

            <!-- Quantity Controls and Trash Button (Matches Figure 9) -->
            <div class="flex items-center gap-2 bg-surface-900 px-2 py-1.5 rounded-xl border border-surface-700">
              <button 
                @click="store.updateCartQty(item.cartItemId, -1)"
                class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors">
                -
              </button>
              <span class="text-xs font-bold text-white min-w-[16px] text-center">
                {{ item.quantity }}
              </span>
              <button 
                @click="store.updateCartQty(item.cartItemId, 1)"
                class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors">
                +
              </button>
              <button 
                @click="store.removeFromCart(item.cartItemId)"
                class="w-6 h-6 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs transition-colors ml-1"
                title="Remove item">
                <i class="pi pi-trash text-[11px]"></i>
              </button>
            </div>

          </div>
        </div>

        <!-- Footer with Total and Checkout Button -->
        <div v-if="store.cart.length > 0" class="p-6 bg-surface-900 border-t border-surface-800 space-y-3">
          <div class="space-y-1.5 text-xs text-gray-400">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="text-white font-medium">₱{{ store.cartSubtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Standard Delivery</span>
              <span class="text-white font-medium">₱{{ store.cartDeliveryFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-base font-black text-white pt-2 border-t border-surface-800">
              <span>Total</span>
              <span class="text-brand-400">₱{{ store.cartTotal.toFixed(2) }}</span>
            </div>
          </div>

          <button 
            @click="proceedToCheckout"
            class="w-full py-3.5 rounded-xl text-sm font-black bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2">
            <span>Checkout</span>
            <i class="pi pi-arrow-right text-xs"></i>
          </button>
        </div>

      </div>
    </div>
  `,
  setup() {
    const store = useGShotStore();

    const scrollToMenu = () => {
      const el = document.getElementById('menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const proceedToCheckout = () => {
      store.cartOpen = false;
      store.currentView = 'checkout';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
      store,
      scrollToMenu,
      proceedToCheckout,
    };
  },
};
