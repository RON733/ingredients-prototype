// G Shot Teas — Checkout View Component (Matches Figure 10)
const CheckoutView = {
  template: `
    <div class="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      <!-- Back to Menu button -->
      <button 
        @click="backToMenu"
        class="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-8 transition-colors">
        <i class="pi pi-arrow-left"></i>
        <span>Back to Menu</span>
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Column: Checkout Details Form (Matches Figure 10) -->
        <div class="lg:col-span-7 bg-surface-800/90 rounded-3xl border border-surface-700 p-6 sm:p-8 space-y-6">
          <h2 class="text-2xl font-black text-white">Checkout Details</h2>

          <!-- Full Name -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input 
              v-model="form.customer_name" 
              type="text" 
              placeholder="Enter your name" 
              class="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          <!-- Phone Number -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input 
              v-model="form.customer_phone" 
              type="tel" 
              placeholder="09XXXXXXXXX" 
              class="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          <!-- Order Type (Delivery vs Store Pickup) -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Order Type
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                @click="form.order_type = 'Delivery'"
                class="py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all"
                :class="form.order_type === 'Delivery' ? 'border-brand-500 bg-brand-500/15 text-brand-400 shadow-md' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <i class="pi pi-car"></i>
                <span>Delivery (+₱40)</span>
              </button>
              <button 
                type="button"
                @click="form.order_type = 'Store Pickup'"
                class="py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all"
                :class="form.order_type === 'Store Pickup' ? 'border-brand-500 bg-brand-500/15 text-brand-400 shadow-md' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <i class="pi pi-shop"></i>
                <span>Store Pickup (₱0)</span>
              </button>
            </div>
          </div>

          <!-- Address (Only shown for Delivery) -->
          <div v-if="form.order_type === 'Delivery'">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Delivery Address
              </label>
              <button 
                type="button"
                @click="useCurrentLocation"
                class="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors">
                <i class="pi pi-map-pin"></i> Auto-fill Santa Rosa Address
              </button>
            </div>
            <textarea 
              v-model="form.delivery_address" 
              rows="3" 
              placeholder="Enter complete address (House #, Street, Barangay, Town)"
              class="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all"></textarea>
          </div>

          <!-- Store Pickup Location info -->
          <div v-else class="p-4 rounded-2xl bg-surface-900 border border-surface-700/60 text-xs text-gray-300 space-y-1">
            <p class="font-bold text-white flex items-center gap-2">
              <i class="pi pi-map-marker text-brand-400"></i> G Shot Teas Pickup Counter
            </p>
            <p class="text-gray-400">Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna</p>
            <p class="text-[11px] text-brand-400 font-medium">Estimated ready time: 10–15 mins after order acceptance.</p>
          </div>

          <!-- Payment Method (GCash vs Cash on Delivery) -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <!-- GCash Option -->
              <button 
                type="button"
                @click="form.payment_method = 'GCash'"
                class="py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all"
                :class="form.payment_method === 'GCash' ? 'border-sky-500 bg-sky-500/15 text-sky-400 shadow-md' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <span class="text-sky-400 font-black tracking-wider">GCash</span>
              </button>
              
              <!-- Cash / COD Option -->
              <button 
                type="button"
                @click="form.payment_method = 'Cash'"
                class="py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all"
                :class="form.payment_method === 'Cash' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-md' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <i class="pi pi-money-bill"></i>
                <span>{{ form.order_type === 'Delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter' }}</span>
              </button>
            </div>

            <!-- GCash Payment Verification Card -->
            <div v-if="form.payment_method === 'GCash'" class="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-bold text-sky-300">GCash Account Details</p>
                  <p class="text-sm font-black text-white">0912 345 6789 <span class="text-xs font-normal text-sky-400">(Jefferson A.)</span></p>
                </div>
                <div class="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                  Verified Merchant
                </div>
              </div>

              <!-- GCash Reference Number Input -->
              <div>
                <label class="block text-[11px] font-bold text-sky-300 mb-1">
                  GCash Reference Number (Optional)
                </label>
                <input 
                  v-model="form.gcash_ref"
                  type="text" 
                  placeholder="e.g. 908234819023"
                  class="w-full px-3 py-2 rounded-lg bg-surface-900 border border-sky-700/60 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <!-- Proof of Payment Upload simulation -->
              <div>
                <label class="block text-[11px] font-bold text-sky-300 mb-1">
                  Upload Proof of Payment (Screenshot)
                </label>
                <div class="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="handleImageUpload"
                    class="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                  />
                  <span v-if="proofFileName" class="text-xs text-emerald-400 truncate max-w-[150px]">
                    ✓ {{ proofFileName }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Notes -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Special Instructions
            </label>
            <input 
              v-model="form.notes"
              type="text" 
              placeholder="e.g. Please leave at the guard house or call upon arrival..."
              class="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

        </div>

        <!-- Right Column: Order Summary (Matches Figure 10) -->
        <div class="lg:col-span-5 bg-surface-800/90 rounded-3xl border border-surface-700 p-6 sm:p-8 space-y-6">
          <h2 class="text-2xl font-black text-white">Order Summary</h2>

          <!-- Items list -->
          <div class="space-y-4 max-h-72 overflow-y-auto pr-2">
            <div 
              v-for="item in store.cart" 
              :key="item.cartItemId"
              class="flex items-center justify-between text-sm py-2 border-b border-surface-700/50">
              <div class="flex-1 pr-3">
                <p class="font-bold text-white">{{ item.name }}</p>
                <p class="text-[11px] text-gray-400">
                  <span v-if="item.customization?.size" class="text-brand-400">{{ item.customization.size }}</span>
                  <span v-if="item.customization?.sugar"> • {{ item.customization.sugar }}</span>
                  <span v-if="item.customization?.ice"> • {{ item.customization.ice }}</span>
                  <span> • Qty: {{ item.quantity }}</span>
                </p>
              </div>
              <span class="font-black text-white whitespace-nowrap">
                ₱{{ (item.unit_price * item.quantity).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Subtotals & Fees -->
          <div class="space-y-2 pt-4 border-t border-surface-700 text-xs text-gray-400">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="text-white font-medium">₱{{ store.cartSubtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Delivery Fee</span>
              <span class="text-white font-medium">₱{{ deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-xl font-black text-white pt-3 border-t border-surface-700">
              <span>Total</span>
              <span class="text-brand-400">₱{{ grandTotal.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            @click="submitOrder"
            :disabled="isSubmitting || store.cart.length === 0"
            class="w-full py-4 rounded-xl text-base font-black bg-gradient-to-r from-brand-600 via-orange-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
            <span v-else>Confirm & Place Order</span>
          </button>

          <p class="text-[11px] text-center text-gray-500">
            By placing an order, you agree to G Shot Teas terms & privacy policy.
          </p>

        </div>

      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const isSubmitting = Vue.ref(false);
    const proofFileName = Vue.ref('');

    const form = Vue.reactive({
      customer_name: store.user?.name || 'Jane Doe',
      customer_phone: store.user?.phone || '09989109529',
      order_type: 'Delivery',
      delivery_address: store.user?.address || 'Phase 1 Mabuhay City, Cabuyao, Laguna',
      payment_method: 'GCash',
      gcash_ref: '',
      proof_image: '',
      notes: '',
    });

    const deliveryFee = Vue.computed(() => {
      return form.order_type === 'Delivery' ? 40 : 0;
    });

    const grandTotal = Vue.computed(() => {
      return store.cartSubtotal + deliveryFee.value;
    });

    const useCurrentLocation = () => {
      form.delivery_address = 'Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna';
      store.notify('Address set to Santa Rosa, Laguna', 'info');
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        proofFileName.value = file.name;
        form.proof_image = `data:${file.type};base64,...[simulated_receipt]`;
      }
    };

    const backToMenu = () => {
      store.currentView = 'customer';
      store.activeSection = 'menu';
      const el = document.getElementById('menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const submitOrder = async () => {
      if (!form.customer_name.trim() || !form.customer_phone.trim()) {
        store.notify('Please provide your name and contact phone number.', 'error');
        return;
      }
      if (form.order_type === 'Delivery' && !form.delivery_address.trim()) {
        store.notify('Please specify your complete delivery address.', 'error');
        return;
      }

      isSubmitting.value = true;
      try {
        const payload = {
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          order_type: form.order_type,
          delivery_address: form.delivery_address,
          payment_method: form.payment_method,
          gcash_ref: form.gcash_ref,
          proof_image: form.proof_image,
          notes: form.notes,
          items: store.cart.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
            customization: i.customization,
          })),
        };

        const res = await GST_API.placeOrder(payload);
        const createdOrder = res.data.order;

        // Clear cart & set active order
        store.clearCart();
        store.activeOrder = createdOrder;
        store.notify(`Order ${createdOrder.order_number} confirmed! Ingredients deducted.`, 'success');

        // Immediately refresh ingredients & products inventory in background
        store.fetchIngredients();
        store.fetchProducts();

        // Direct user to Track Order (Figure 11)
        store.currentView = 'track';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to place order.';
        store.notify(msg, 'error');
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      store,
      form,
      deliveryFee,
      grandTotal,
      isSubmitting,
      proofFileName,
      useCurrentLocation,
      handleImageUpload,
      backToMenu,
      submitOrder,
    };
  },
};
