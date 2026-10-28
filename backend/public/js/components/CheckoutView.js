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
            <div v-if="form.payment_method === 'GCash'" class="p-4 sm:p-5 rounded-2xl bg-sky-950/40 border border-sky-600/50 space-y-4 animate-fade-in shadow-xl">
              
              <!-- Merchant Header -->
              <div class="flex items-center justify-between pb-3 border-b border-sky-800/40">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center font-black text-sky-400 text-sm">
                    G
                  </div>
                  <div>
                    <p class="text-[11px] font-bold uppercase tracking-wider text-sky-300">Official Store GCash</p>
                    <p class="text-sm font-black text-white font-mono">0912 345 6789 <span class="text-xs font-semibold text-sky-400 font-sans">(Jefferson A.)</span></p>
                  </div>
                </div>
                <div class="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-verified text-[10px] text-sky-400"></i>
                  <span>Verified Merchant</span>
                </div>
              </div>

              <!-- Required Policy Notice / Dynamic Verification Status -->
              <div 
                v-if="!form.gcash_ref?.trim() && !form.proof_image" 
                class="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <i class="pi pi-exclamation-triangle text-amber-400 mt-0.5 text-sm shrink-0"></i>
                <div class="space-y-0.5">
                  <p class="font-bold text-amber-200">Payment Proof Required to Proceed</p>
                  <p class="text-[11px] text-amber-300/90 leading-relaxed">
                    Please provide either your <strong>GCash Reference Number</strong> OR <strong>upload a screenshot of the receipt</strong> below to place this order.
                  </p>
                </div>
              </div>

              <div 
                v-else 
                class="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                <i class="pi pi-check-circle text-emerald-400 text-base shrink-0"></i>
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-emerald-200">Payment Verification Attached</p>
                  <p class="text-[11px] text-emerald-300/90 truncate">
                    {{ form.gcash_ref?.trim() ? 'Reference No: ' + form.gcash_ref : 'Receipt Screenshot: ' + proofFileName }}
                  </p>
                </div>
              </div>

              <!-- Option A: GCash Reference Number Input -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[11px] font-bold text-sky-300">
                    Option A: GCash Reference Number
                  </label>
                  <span class="text-[10px] text-gray-400 font-semibold">(e.g. 13-digit transaction code)</span>
                </div>
                <div class="relative">
                  <i class="pi pi-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400/70 text-xs"></i>
                  <input 
                    v-model="form.gcash_ref"
                    type="text" 
                    placeholder="e.g. 908234819023"
                    class="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-900 border border-sky-700/60 text-xs font-mono font-bold text-white placeholder-gray-500 focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>

              <!-- Divider -->
              <div class="flex items-center gap-3">
                <div class="flex-1 h-px bg-sky-800/40"></div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-sky-400/80">OR</span>
                <div class="flex-1 h-px bg-sky-800/40"></div>
              </div>

              <!-- Option B: Upload Receipt Screenshot -->
              <div>
                <label class="block text-[11px] font-bold text-sky-300 mb-1.5">
                  Option B: Upload Receipt Screenshot
                </label>
                
                <div v-if="!form.proof_image" class="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    id="gcash_receipt_file"
                    @change="handleImageUpload"
                    class="hidden"
                  />
                  <label 
                    for="gcash_receipt_file"
                    class="w-full p-4 rounded-xl border border-dashed border-sky-700/80 hover:border-sky-400 bg-surface-900/60 hover:bg-surface-900 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 group">
                    <i class="pi pi-upload text-lg text-sky-400 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-bold text-white group-hover:text-sky-300">Click to upload payment screenshot</span>
                    <span class="text-[10px] text-gray-400">PNG, JPG, or JPEG</span>
                  </label>
                </div>

                <!-- Preview Thumbnail with Remove Button -->
                <div v-else class="p-3 rounded-xl bg-surface-900 border border-sky-500/40 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <img :src="form.proof_image" alt="Receipt Preview" class="w-12 h-12 rounded-lg object-cover border border-surface-700 shrink-0" />
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-white truncate">{{ proofFileName || 'Receipt Screenshot' }}</p>
                      <span class="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <i class="pi pi-check"></i> Screenshot Attached
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    @click="removeProofImage"
                    class="p-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Remove Screenshot">
                    <i class="pi pi-trash text-xs"></i>
                  </button>
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
        if (!file.type.startsWith('image/')) {
          store.notify('Please upload an image file (PNG, JPG, JPEG).', 'error');
          return;
        }
        proofFileName.value = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
          form.proof_image = event.target.result;
          store.notify('Receipt screenshot attached successfully!', 'success');
        };
        reader.readAsDataURL(file);
      }
    };

    const removeProofImage = () => {
      form.proof_image = '';
      proofFileName.value = '';
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

      // GCash Proof Validation: Don't proceed without ref or receipt
      if (form.payment_method === 'GCash') {
        const hasRef = form.gcash_ref && form.gcash_ref.trim().length > 0;
        const hasProof = form.proof_image && form.proof_image.trim().length > 0;
        if (!hasRef && !hasProof) {
          store.notify('For GCash payments, please provide a screenshot of the receipt or a reference number.', 'error');
          return;
        }
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
      removeProofImage,
      backToMenu,
      submitOrder,
    };
  },
};
