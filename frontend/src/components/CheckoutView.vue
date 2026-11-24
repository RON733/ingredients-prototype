<template>
<div class="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 pb-24 sm:pb-12 animate-fade-in space-y-4 sm:space-y-6">
      
      <!-- Page Navigation Header -->
      <div class="flex items-center justify-between gap-2 px-1">
        <button 
          @click="backToMenu"
          class="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-amber-200 transition-colors py-1">
          <i class="pi pi-arrow-left text-xs"></i>
          <span>Back to Menu</span>
        </button>
        <span class="text-[11px] sm:text-xs font-mono text-gray-500">
          <span class="sm:hidden">Secure Checkout</span>
          <span class="hidden sm:inline">Secure 256-bit Encrypted Checkout</span>
        </span>
      </div>

      <!-- Order Availability Notice Banner (Editable by Staff, Admin, Super Admin) -->
      <div 
        v-if="store.isOrderAreaNoteEnabled && store.orderAreaNote" 
        class="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/25 shadow-lg flex items-start sm:items-center justify-between gap-3 sm:gap-4 animate-fade-in backdrop-blur-md">
        <div class="flex items-start sm:items-center gap-3">
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center text-base sm:text-lg font-black shrink-0">
            <i class="pi pi-map-marker"></i>
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span class="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wider">Order Availability</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-200/90 border border-amber-400/25">Coverage</span>
            </div>
            <p class="text-xs sm:text-sm font-semibold text-stone-100 mt-0.5 leading-relaxed">
              {{ store.orderAreaNote }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sign-In Required Notice Banner -->
      <div 
        v-if="!store.user" 
        class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/25 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 animate-fade-in backdrop-blur-md">
        <div class="flex items-start sm:items-center gap-3">
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center text-base sm:text-lg font-black shrink-0">
            <i class="pi pi-lock"></i>
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span class="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wider">Account Required</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-200/90 border border-amber-400/25">Sign In to Continue</span>
            </div>
            <p class="text-xs sm:text-sm font-bold text-stone-100 mt-1">
              Customers must be signed in to place and check out orders.
            </p>
            <p class="text-[11px] sm:text-xs text-gray-300/90 mt-0.5 leading-relaxed">
              Signing in connects your order to real-time live GPS driver tracking, SMS status updates, and order history.
            </p>
          </div>
        </div>
        <button 
          type="button"
          @click="promptSignIn"
          class="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-surface-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/15 flex items-center justify-center gap-2 shrink-0 cursor-pointer">
          <i class="pi pi-sign-in text-xs"></i>
          <span>Sign In / Register</span>
        </button>
      </div>

      <!-- Main Checkout Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        
        <!-- Left Column: Checkout Details Form (Matches Figure 10) -->
        <div class="lg:col-span-7 bg-surface-800/90 rounded-2xl sm:rounded-3xl border border-surface-700/80 p-4 sm:p-7 space-y-5 sm:space-y-6">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-white">Checkout Details</h2>
            <span class="text-[11px] sm:text-xs text-gray-400 font-medium shrink-0"><span class="text-amber-400 font-bold">*</span> Required</span>
          </div>

          <!-- Full Name -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Full Name <span class="text-amber-400">*</span>
              </label>
              <span v-if="nameError" class="text-rose-400 text-[11px] font-semibold flex items-center gap-1">
                <i class="pi pi-exclamation-circle text-[10px]"></i> {{ nameError }}
              </span>
            </div>
            <input 
              v-model="form.customer_name" 
              type="text" 
              placeholder="Enter your full name" 
              class="w-full px-4 py-3 rounded-xl bg-surface-900 border text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
              :class="nameError ? 'border-rose-500 focus:border-rose-400' : 'border-surface-700 focus:border-brand-500'"
            />
          </div>

          <!-- Phone Number (Numbers only, 11-digit limit) -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Phone Number <span class="text-amber-400">*</span>
              </label>
              <span class="text-[11px] font-mono" :class="form.customer_phone.length === 11 ? 'text-amber-300 font-bold' : 'text-gray-400'">
                {{ form.customer_phone.length }} / 11 digits
              </span>
            </div>
            <input 
              v-model="form.customer_phone" 
              @input="onPhoneInput"
              type="tel" 
              inputmode="numeric"
              maxlength="11" 
              placeholder="09XXXXXXXXX" 
              class="w-full px-4 py-3 rounded-xl bg-surface-900 border text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono tracking-wider"
              :class="phoneError ? 'border-rose-500 focus:border-rose-400' : 'border-surface-700 focus:border-brand-500'"
            />
            <p v-if="phoneError" class="text-rose-400 text-[11px] mt-1.5 font-semibold flex items-center gap-1">
              <i class="pi pi-exclamation-circle text-[10px]"></i>
              <span>{{ phoneError }}</span>
            </p>
            <p v-else class="text-gray-500 text-[11px] mt-1.5">
              Numbers only. Standard 11-digit mobile number (e.g. 09123456789).
            </p>
          </div>

          <!-- Order Type (Delivery vs Store Pickup) -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Order Type <span class="text-amber-400">*</span>
            </label>
            <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button 
                type="button"
                @click="form.order_type = 'Delivery'"
                class="py-3 px-2.5 sm:px-4 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer"
                :class="form.order_type === 'Delivery' ? 'border-amber-400/70 bg-amber-500/12 text-amber-300' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <i class="pi pi-truck text-xs sm:text-sm"></i>
                <span>Delivery (+₱40)</span>
              </button>
              <button 
                type="button"
                @click="form.order_type = 'Store Pickup'"
                class="py-3 px-2.5 sm:px-4 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer"
                :class="form.order_type === 'Store Pickup' ? 'border-amber-400/70 bg-amber-500/12 text-amber-300' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <i class="pi pi-shopping-bag text-xs sm:text-sm"></i>
                <span>Store Pickup (Free)</span>
              </button>
            </div>
          </div>

          <!-- Delivery Address (Only if Delivery selected) -->
          <div v-if="form.order_type === 'Delivery'">
            <div class="mb-1.5">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Delivery Address <span class="text-amber-400">*</span>
              </label>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <button 
                type="button"
                @click="locateUserGPS" 
                :disabled="isLocatingGPS"
                class="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/35 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                <i class="pi" :class="isLocatingGPS ? 'pi-spin pi-spinner text-amber-200' : 'pi-compass text-amber-300'"></i>
                <span>{{ isLocatingGPS ? 'Scanning Device Location...' : 'Use Device Location' }}</span>
              </button>

              <span v-if="form.customer_lat && form.customer_lng" class="text-[11px] text-amber-300/90 font-semibold flex items-center gap-1">
                <i class="pi pi-check-circle"></i> Pinned ({{ Number(form.customer_lat).toFixed(4) }}, {{ Number(form.customer_lng).toFixed(4) }})
              </span>
            </div>

            <!-- Delivery Area Notice Reminder -->
            <div 
              v-if="store.isOrderAreaNoteEnabled && store.orderAreaNote" 
              class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start sm:items-center gap-2.5 text-xs text-amber-200/90 mb-2.5 leading-relaxed">
              <i class="pi pi-info-circle text-amber-300 text-sm shrink-0 mt-0.5 sm:mt-0"></i>
              <span class="font-medium"><strong>Delivery Notice:</strong> {{ store.orderAreaNote }}</span>
            </div>

            <textarea 
              v-model="form.delivery_address" 
              @input="onManualAddressInput"
              rows="2" 
              placeholder="Unit/House No., Street Name, Barangay, Landmark, Santa Rosa, Laguna"
              class="w-full px-4 py-3 rounded-xl bg-surface-900 border text-sm text-white placeholder-gray-500 focus:outline-none transition-all resize-none"
              :class="addressError ? 'border-rose-500 focus:border-rose-400' : detectedBarangay ? 'border-emerald-500/60 focus:border-emerald-400' : 'border-surface-700 focus:border-brand-500'"
            ></textarea>

            <!-- Detected Barangay Accepted Pill -->
            <div 
              v-if="detectedBarangay && !addressError" 
              class="mt-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-between gap-2">
              <span class="flex items-center gap-1.5 min-w-0">
                <i class="pi pi-check-circle text-emerald-400 shrink-0"></i>
                <span class="truncate">Detected Barangay: <strong class="text-emerald-200">{{ detectedBarangay.name }}</strong></span>
              </span>
              <span class="text-[10px] font-mono text-emerald-200/90 shrink-0">Serviceable</span>
            </div>

            <!-- Address / Barangay Rejection Error -->
            <p v-if="addressError" class="text-rose-400 text-[11px] mt-1.5 font-semibold flex items-start gap-1.5 leading-relaxed">
              <i class="pi pi-exclamation-circle text-[11px] shrink-0 mt-0.5"></i>
              <span>{{ addressError }}</span>
            </p>

            <!-- Estimated Delivery Time Card (Customer View, Per Barangay) -->
            <div 
              class="mt-3 p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors"
              :class="(detectedBarangay && !addressError) ? 'bg-surface-900/90 border-surface-700/80' : 'bg-rose-950/25 border-rose-500/40'">
              <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div 
                  class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center text-base sm:text-lg shrink-0"
                  :class="(detectedBarangay && !addressError) ? 'bg-amber-500/15 border-amber-500/25 text-amber-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'">
                  <i class="pi" :class="(detectedBarangay && !addressError) ? 'pi-clock' : 'pi-ban'"></i>
                </div>
                <div class="min-w-0">
                  <p class="text-[11px] sm:text-xs font-black text-stone-100 uppercase tracking-wider">Est. Delivery Time</p>
                  <p v-if="detectedBarangay && !addressError" class="text-[11px] text-gray-300 mt-0.5 leading-snug">
                    From Brgy. Sinalhan &bull; To <strong class="text-amber-300">Brgy. {{ detectedBarangay.name }}</strong>
                  </p>
                  <p v-else class="text-[11px] text-rose-300 mt-0.5 leading-snug">
                    Cannot deliver to this location (no supported barangay detected)
                  </p>
                </div>
              </div>
              <span 
                v-if="detectedBarangay && !addressError"
                class="px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono shrink-0 whitespace-nowrap">
                {{ detectedBarangay.eta }}
              </span>
              <span 
                v-else
                class="px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono shrink-0 whitespace-nowrap">
                Unavailable
              </span>
            </div>

            <!-- Collapsible 18 Supported Barangays & ETA Guide -->
            <div class="mt-2.5">
              <button
                type="button"
                @click="showSupportedBarangays = !showSupportedBarangays"
                class="text-[11px] font-bold text-amber-300/90 hover:text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer">
                <i class="pi" :class="showSupportedBarangays ? 'pi-chevron-up text-[10px]' : 'pi-map-marker text-[10px]'"></i>
                <span>{{ showSupportedBarangays ? 'Hide' : 'View' }} {{ supportedBarangays.length }} Accepted Santa Rosa Barangay{{ supportedBarangays.length === 1 ? '' : 's' }} &amp; Est. Delivery Times</span>
              </button>

              <div 
                v-if="showSupportedBarangays"
                class="mt-2 p-3 rounded-2xl bg-surface-950/80 border border-surface-800 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
                <div 
                  v-for="b in supportedBarangays"
                  :key="b.id"
                  class="px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between gap-2"
                  :class="detectedBarangay?.id === b.id ? 'bg-amber-500/15 border-amber-400/50 text-amber-200' : 'bg-surface-900/70 border-surface-800 text-gray-300'">
                  <span class="font-semibold truncate">{{ b.name }}</span>
                  <span class="font-mono text-[10px] text-amber-300 shrink-0">{{ b.eta }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Store Pickup Address Notice -->
          <div v-else class="p-4 rounded-xl bg-surface-900/60 border border-surface-700 text-xs space-y-1">
            <p class="font-bold text-white flex items-center gap-1.5">
              <i class="pi pi-building text-brand-400"></i> Store Pickup Location:
            </p>
            <p class="text-gray-400">Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna</p>
            <p class="text-[11px] text-brand-400 font-medium">Estimated ready time: 10–15 mins after order acceptance.</p>
          </div>

          <!-- Payment Method (Cash / COD Only) -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Payment Method <span class="text-amber-400">*</span>
            </label>
            <div class="p-3.5 sm:p-4 rounded-xl border border-amber-400/70 bg-amber-500/12 text-amber-300 shadow-md ring-1 ring-amber-400/40 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                  <i class="pi pi-money-bill text-base"></i>
                </div>
                <div>
                  <p class="font-extrabold text-xs sm:text-sm text-amber-200">
                    {{ form.order_type === 'Delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter' }}
                  </p>
                  <p class="text-[11px] text-gray-300 mt-0.5">
                    {{ form.order_type === 'Delivery' ? 'Pay in cash to the rider upon delivery.' : 'Pay in cash when picking up your order at the store.' }}
                  </p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-500/20 text-amber-200 border border-amber-400/30 shrink-0">
                Selected
              </span>
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
        <div class="lg:col-span-5 bg-surface-800/90 rounded-2xl sm:rounded-3xl border border-surface-700/80 p-4 sm:p-7 space-y-5 sm:space-y-6">
          <h2 class="text-xl sm:text-2xl font-black text-white">Order Summary</h2>

          <!-- Items list -->
          <div class="space-y-4 max-h-72 overflow-y-auto pr-2">
            <div 
              v-for="item in store.cart" 
              :key="item.cartItemId"
              class="flex items-start justify-between gap-4 pb-4 border-b border-surface-700/60">
              
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black text-brand-400">x{{ item.quantity }}</span>
                  <span class="text-sm font-bold text-white">{{ item.name }}</span>
                </div>
                <div v-if="item.customization" class="text-[11px] text-gray-400 pl-4 space-y-0.5">
                  <p v-if="item.customization.size">Size: <span class="text-white">{{ item.customization.size }}</span></p>
                  <p v-if="item.customization.flavour">Flavour: <span class="text-amber-300">{{ item.customization.flavour }}<span v-if="item.customization.flavour2"> &amp; {{ item.customization.flavour2 }}</span></span></p>
                  <p v-if="item.customization.sugar">Sugar: <span class="text-white">{{ item.customization.sugar }}</span></p>
                  <p v-if="item.customization.ice">Ice: <span class="text-white">{{ item.customization.ice }}</span></p>
                  <p v-if="item.customization.options && item.customization.options.length">
                    Add-ons: <span class="text-brand-300">{{ item.customization.options.map(o => o?.name || o).join(', ') }}</span>
                  </p>
                  <p v-if="item.customization.toppings && item.customization.toppings.length">
                    Toppings: <span class="text-brand-300">{{ item.customization.toppings.join(', ') }}</span>
                  </p>
                  <p v-if="item.customization.notes">Note: <span class="text-gray-200 italic">{{ item.customization.notes }}</span></p>
                </div>
              </div>

              <span class="text-sm font-black text-white whitespace-nowrap">
                ₱{{ (item.unit_price * item.quantity).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Price Calculations -->
          <div class="space-y-3 pt-2 text-sm border-t border-surface-700">
            <div class="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span class="font-bold text-white">₱{{ store.cartSubtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>Delivery Fee</span>
              <span class="font-bold text-white">
                {{ form.order_type === 'Delivery' ? '₱40.00' : 'FREE' }}
              </span>
            </div>
            <div class="flex justify-between text-lg font-black text-white pt-2 border-t border-surface-700">
              <span>Total to Pay</span>
              <span class="text-brand-400">₱{{ grandTotal.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Real-Time Error Warning Box (If any blocked condition) -->
          <div 
            v-if="isValidationTriggered && checkoutBlockReasons.length > 0" 
            class="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-2 animate-shake">
            <div class="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
              <i class="pi pi-exclamation-triangle"></i>
              <span>Please Complete Required Steps</span>
            </div>
            <ul class="text-xs text-rose-200/90 space-y-1 pl-4 list-disc">
              <li v-for="(reason, idx) in checkoutBlockReasons" :key="idx">
                {{ reason }}
              </li>
            </ul>
          </div>

          <!-- Server Error Message Banner -->
          <div 
            v-if="serverErrorMessage" 
            class="p-4 rounded-2xl bg-rose-950/70 border border-rose-500 text-rose-300 text-xs space-y-2 animate-fade-in shadow-xl">
            <div class="flex items-center justify-between font-bold">
              <div class="flex items-center gap-2 text-rose-300">
                <i class="pi pi-times-circle text-base text-rose-400"></i>
                <span>Order Placement Rejected by Server</span>
              </div>
              <button @click="serverErrorMessage = ''" class="text-rose-400 hover:text-white text-xs p-1 flex items-center justify-center" aria-label="Dismiss"><i class="pi pi-times text-[11px]"></i></button>
            </div>
            <p class="text-[11px] leading-relaxed whitespace-pre-line text-rose-200 pl-6">
              {{ serverErrorMessage }}
            </p>
          </div>

          <!-- Submit Button -->
          <button 
            @click="submitOrder"
            :disabled="isSubmitting || store.cart.length === 0 || (Boolean(store.user) && isDeliveryUnavailable)"
            class="w-full py-3.5 rounded-xl text-sm sm:text-base font-black bg-amber-400 hover:bg-amber-300 text-surface-950 shadow-lg shadow-amber-500/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
            <span v-else class="flex items-center gap-2">
              <i v-if="!store.user" class="pi pi-lock text-sm"></i>
              <span>{{ !store.user ? 'Sign In to Place Order' : 'Confirm & Place Order' }}</span>
            </span>
          </button>

          <p class="text-[11px] text-center text-gray-500">
            By placing an order, you agree to G Shot Teas terms & privacy policy.
          </p>

        </div>

      </div>

      <!-- Device GPS Permission & Instructions Modal -->
      <div 
        v-if="gpsPromptModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        @click.self="gpsPromptModalOpen = false">
        <div class="relative max-w-md w-full bg-surface-900 border border-surface-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up text-center">
          
          <div class="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto shadow-lg">
            <i class="pi pi-compass text-2xl"></i>
          </div>

          <div>
            <h3 class="text-lg font-black text-white">Enable Device GPS</h3>
            <p class="text-xs text-gray-300 mt-1.5 leading-relaxed">
              {{ gpsErrorMessage || 'Please turn on your device GPS / Location services and allow browser access to accurately detect your delivery spot.' }}
            </p>
          </div>

          <!-- Step by Step instructions -->
          <div class="p-4 rounded-2xl bg-surface-950 border border-surface-800 text-left space-y-3 text-xs text-gray-300">
            <div class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span><strong>Turn ON GPS / Location</strong> in your phone's swipe-down quick settings or computer settings.</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>When your browser prompts <em>"Allow this site to access your location"</em>, tap <strong>Allow</strong>.</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span>Your location will <strong>automatically appear on the address text box</strong> and on the map. You can drag the pin or tap anywhere on the map to fine-tune your exact door or gate!</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 pt-2">
            <button 
              type="button"
              @click="locateUserGPS(); gpsPromptModalOpen = false;"
              class="flex-1 py-2.5 rounded-xl font-black text-xs bg-amber-400 hover:bg-amber-300 text-surface-950 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="pi pi-refresh"></i>
              <span>Try GPS Again</span>
            </button>
            <button 
              type="button"
              @click="gpsPromptModalOpen = false"
              class="py-2.5 px-4 rounded-xl font-semibold text-xs bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 transition-all cursor-pointer">
              Pin Manually on Map
            </button>
          </div>

        </div>
      </div>



    </div>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';
import { SANTA_ROSA_BARANGAYS, detectSantaRosaBarangay, detectBarangayFromCoords, getBarangayRejectionMessage } from '@/utils/santaRosaBarangays';

// G Shot Teas — Customer Checkout Page (Matches Figure 10)
export default {
  name: 'CheckoutView',
  setup() {
    const store = useGShotStore();
    const isSubmitting = Vue.ref(false);
    const isValidationTriggered = Vue.ref(false);
    const serverErrorMessage = Vue.ref('');

    // Live GPS & Map Pin State
    const isLocatingGPS = Vue.ref(false);
    const gpsPromptModalOpen = Vue.ref(false);
    const gpsErrorMessage = Vue.ref('');
    const pinnedAddressPreview = Vue.ref('');
    const gpsRejectionError = Vue.ref('');
    const showSupportedBarangays = Vue.ref(false);
    const supportedBarangays = Vue.computed(() => store.supportedBarangays);
    let checkoutMap = null;
    let pinMarker = null;

    const STORE_LAT = 14.3167;
    const STORE_LNG = 121.1167;

    const form = Vue.reactive({
      customer_name: store.user?.name || '',
      customer_phone: store.user?.phone || '',
      order_type: 'Delivery',
      delivery_address: store.user?.address || '',
      customer_lat: null,
      customer_lng: null,
      payment_method: 'Cash',
      notes: '',
    });

    const deliveryFee = Vue.computed(() => {
      return form.order_type === 'Delivery' ? 40 : 0;
    });

    const grandTotal = Vue.computed(() => {
      return store.cartSubtotal + deliveryFee.value;
    });



    // Enforce numbers only and standard 11 digits for Phone Number
    const onPhoneInput = (e) => {
      const clean = e.target.value.replace(/\D/g, '').slice(0, 11);
      form.customer_phone = clean;
    };

    // Validation computeds
    const nameError = Vue.computed(() => {
      if (!isValidationTriggered.value && !form.customer_name) return '';
      if (!form.customer_name.trim()) return 'Full Name is required.';
      return '';
    });

    const phoneError = Vue.computed(() => {
      if (!isValidationTriggered.value && !form.customer_phone) return '';
      if (!form.customer_phone.trim()) return 'Phone Number is required.';
      if (form.customer_phone.length < 11) {
        return `Phone number must be exactly 11 digits (${form.customer_phone.length}/11 entered).`;
      }
      if (!form.customer_phone.startsWith('09')) {
        return 'Philippine mobile number must start with 09 (e.g. 09123456789).';
      }
      return '';
    });

    const detectedBarangayResult = Vue.computed(() => {
      return detectSantaRosaBarangay(form.delivery_address, supportedBarangays.value);
    });

    const detectedBarangay = Vue.computed(() => {
      return detectedBarangayResult.value.matched ? detectedBarangayResult.value.barangay : null;
    });

    const isDeliveryUnavailable = Vue.computed(() => {
      if (form.order_type !== 'Delivery') return false;
      return !detectedBarangay.value || Boolean(addressError.value);
    });

    const onManualAddressInput = () => {
      gpsRejectionError.value = '';
      if (form.customer_lat || form.customer_lng) {
        const res = detectSantaRosaBarangay(form.delivery_address, supportedBarangays.value);
        if (!res.matched) {
          form.customer_lat = null;
          form.customer_lng = null;
        }
      }
    };

    const addressError = Vue.computed(() => {
      if (form.order_type !== 'Delivery') return '';
      if (gpsRejectionError.value) return gpsRejectionError.value;
      const addr = form.delivery_address.trim();
      if (isLocatingGPS.value && addr.includes('Detecting device location...')) return '';
      if (!addr) {
        return isValidationTriggered.value ? 'Delivery address is required for Delivery orders.' : '';
      }
      if (!detectedBarangayResult.value.matched) {
        return getBarangayRejectionMessage(detectedBarangayResult.value, supportedBarangays.value);
      }
      return '';
    });

    // Aggregated list stating all exact reasons why order cannot be placed
    const checkoutBlockReasons = Vue.computed(() => {
      const reasons = [];
      if (!store.user) {
        reasons.push('You must be signed in to check out. Please sign in or create an account.');
      }
      if (store.cart.length === 0) {
        reasons.push('Your cart is empty. Please add items to your cart.');
      }
      if (!form.customer_name.trim()) {
        reasons.push('Full Name is required.');
      }
      if (!form.customer_phone.trim()) {
        reasons.push('Phone Number is required (numbers only, 11 digits).');
      } else if (form.customer_phone.length < 11) {
        reasons.push(`Phone Number must be exactly 11 digits (${form.customer_phone.length}/11 entered).`);
      } else if (!form.customer_phone.startsWith('09')) {
        reasons.push('Phone Number must start with "09" (e.g. 09123456789).');
      }
      if (form.order_type === 'Delivery') {
        if (!form.delivery_address.trim()) {
          reasons.push('Delivery Address is required for Delivery orders.');
        } else if (!detectedBarangayResult.value.matched) {
          reasons.push(getBarangayRejectionMessage(detectedBarangayResult.value, supportedBarangays.value));
        }
      }

      // Stock Limit Verification
      const stockViolations = store.getCartStockViolations();
      for (const v of stockViolations) {
        reasons.push(`"${v.name}" exceeds available stock (${v.cartQty} in cart, only ${v.maxStock} available). Please adjust quantity in your cart.`);
      }

      return reasons;
    });

    const getPinIcon = () => {
      if (typeof L === 'undefined') return null;
      // Red teardrop pin matching Grab and modern delivery apps
      return L.divIcon({
        className: 'custom-grab-destination-pin',
        html: `
          <div class="relative flex items-center justify-center -translate-y-4 cursor-pointer">
            <svg viewBox="0 0 32 42" width="34" height="44" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-xl">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 26 16 26s16-14.5 16-26c0-8.837-7.163-16-16-16z" fill="#facc15"/>
              <circle cx="16" cy="15" r="5.5" fill="#000000"/>
            </svg>
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        popupAnchor: [0, -44],
      });
    };

    const geoSearchQuery = Vue.ref('');
    const isGeoSearching = Vue.ref(false);
    const geoSearchResults = Vue.ref([]);
    const gpsAccuracyMeters = Vue.ref(null);
    let accuracyCircle = null;

    const santaRosaChips = [
      { name: 'Sinalhan (Store)', lat: 14.3167, lng: 121.1111 },
      { name: 'Aplaya', lat: 14.3292, lng: 121.1273 },
      { name: 'Caingin', lat: 14.3262, lng: 121.1172 },
      { name: 'Ibaba', lat: 14.3190, lng: 121.1120 },
      { name: 'Kanluran (Pob. Uno)', lat: 14.3175, lng: 121.1105 },
      { name: 'Labas', lat: 14.3045, lng: 121.1167 },
      { name: 'Malusak (Pob. Dos)', lat: 14.3160, lng: 121.1145 },
      { name: 'Market Area (Pob. Tres)', lat: 14.3150, lng: 121.1120 },
      { name: 'Tagapo / SM City', lat: 14.3101, lng: 121.1035 },
    ];

    const jumpToChip = (chip) => {
      initCheckoutMap();
      if (checkoutMap) {
        checkoutMap.setView([chip.lat, chip.lng], 16);
        updatePinLocation(chip.lat, chip.lng, true);
        if (pinMarker) {
          pinMarker.bindPopup(`<b>${chip.name}</b><br>Drag red pin to your exact gate/door.`).openPopup();
        }
      }
      store.notify(`Map centered on ${chip.name}. Drag pin to your gate.`, 'info');
    };

    const searchAddressOnMap = async () => {
      const q = (geoSearchQuery.value || form.delivery_address || '').trim();
      if (!q) {
        store.notify('Please enter a subdivision, street, or landmark to search.', 'warning');
        return;
      }
      isGeoSearching.value = true;
      geoSearchResults.value = [];
      try {
        const queryWithContext = q.toLowerCase().includes('santa rosa') ? q : `${q}, Santa Rosa, Laguna`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithContext)}&addressdetails=1&limit=5`, {
          headers: { 'Accept-Language': 'en' }
        });
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            geoSearchResults.value = list;
            selectGeoResult(list[0]);
          } else {
            const res2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`, {
              headers: { 'Accept-Language': 'en' }
            });
            const list2 = await res2.json();
            if (list2 && list2.length > 0) {
              geoSearchResults.value = list2;
              selectGeoResult(list2[0]);
            } else {
              store.notify('No exact match found. Try typing your barangay or subdivision name.', 'warning');
            }
          }
        }
      } catch (err) {
        console.warn('Geocoding search failed:', err);
        store.notify('Search request failed. Please check network.', 'error');
      } finally {
        isGeoSearching.value = false;
      }
    };

    const selectGeoResult = (item) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      initCheckoutMap();
      if (checkoutMap) {
        checkoutMap.setView([lat, lng], 17);
        updatePinLocation(lat, lng, false);
        form.delivery_address = item.display_name;
        pinnedAddressPreview.value = item.display_name.split(',')[0];
        if (pinMarker) {
          pinMarker.bindPopup(`<b>${item.display_name.split(',')[0]}</b><br>Drag pin to fine-tune exact gate/door.`).openPopup();
        }
      }
      geoSearchResults.value = [];
      store.notify(`Delivery pin placed at ${item.display_name.split(',')[0]}!`, 'success');
    };

    const getQuickLocationHint = (lat, lng) => {
      const match = detectBarangayFromCoords(lat, lng, '', '', supportedBarangays.value);
      if (match.matched && match.barangay) {
        return `Brgy. ${match.barangay.name}, Santa Rosa, Laguna`;
      }
      return '';
    };

        const updatePinLocation = (lat, lng, doReverseGeocode = true) => {
      form.customer_lat = Number(lat).toFixed(7);
      form.customer_lng = Number(lng).toFixed(7);
      if (pinMarker) {
        pinMarker.setLatLng([lat, lng]);
        pinMarker.setPopupContent(`<b>Pinned Delivery Location</b><br>${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}<br><span class="text-[10px] text-gray-400">Drag to adjust exact door/gate</span>`);
      }
      if (doReverseGeocode) {
        const initial = getQuickLocationHint(lat, lng);
        form.delivery_address = initial;
        pinnedAddressPreview.value = initial.split(',')[0];
        reverseGeocode(lat, lng);
      }
    };

    const reverseGeocode = async (lat, lng) => {
      let resolvedAddress = '';
      let shortAddr = '';
      let detectedCity = '';
      let backendServiceable = null;
      let backendRejectionReason = '';

      // 1. Primary: Backend endpoint (uses OpenStreetMap Nominatim with valid User-Agent + 18-barangay validation)
      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            resolvedAddress = data.address;
            shortAddr = data.short_address || data.address.split(',')[0];
            detectedCity = data.city || '';
            if (typeof data.is_serviceable === 'boolean') {
              backendServiceable = data.is_serviceable;
              backendRejectionReason = data.rejection_reason || '';
            }
          }
        }
      } catch (err) {
        console.warn('Backend reverse geocode error:', err);
      }

      // 2. Client-side Fallback: BigDataCloud (open CORS, client-friendly)
      if (!resolvedAddress) {
        try {
          const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
          if (bdcRes.ok) {
            const bdc = await bdcRes.json();
            const locality = bdc.locality || bdc.city || '';
            const city = bdc.city || '';
            const state = bdc.principalSubdivision || 'Laguna';
            detectedCity = city;
            const parts = [locality, city, state].filter(Boolean);
            resolvedAddress = [...new Set(parts)].join(', ');
            shortAddr = locality || city;
          }
        } catch (bErr) {
          console.warn('BigDataCloud reverse geocode error:', bErr);
        }
      }

      // 3. Validate resolved address & coordinates against the hardcoded 18 barangays
      const coordCheck = detectBarangayFromCoords(lat, lng, resolvedAddress, detectedCity, supportedBarangays.value);

      if (backendServiceable === false || !coordCheck.matched) {
        gpsRejectionError.value = backendRejectionReason || getBarangayRejectionMessage(coordCheck, supportedBarangays.value);
        form.customer_lat = null;
        form.customer_lng = null;
        form.delivery_address = resolvedAddress || `Outside Coverage (${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)})`;
        pinnedAddressPreview.value = '';
        store.notify(gpsRejectionError.value, 'error');
        return false;
      }

      if (!resolvedAddress && coordCheck.barangay) {
        resolvedAddress = `Brgy. ${coordCheck.barangay.name}, Santa Rosa, Laguna`;
        shortAddr = `Brgy. ${coordCheck.barangay.name}`;
      } else if (coordCheck.barangay && !detectSantaRosaBarangay(resolvedAddress, supportedBarangays.value).matched) {
        resolvedAddress = `${resolvedAddress.replace(/,\s*$/, '')}, Brgy. ${coordCheck.barangay.name}`;
      }

      gpsRejectionError.value = '';
      pinnedAddressPreview.value = shortAddr || resolvedAddress;
      form.delivery_address = resolvedAddress;
      return true;
    };

    const initCheckoutMap = () => {
      if (typeof L === 'undefined') return;
      const mapEl = document.getElementById('checkout-pin-map');
      if (!mapEl) return;

      const initialLat = form.customer_lat ? Number(form.customer_lat) : STORE_LAT;
      const initialLng = form.customer_lng ? Number(form.customer_lng) : STORE_LNG;
      const initialZoom = (form.customer_lat && form.customer_lng) ? 17 : 14;

      if (!checkoutMap) {
        checkoutMap = L.map('checkout-pin-map', {
          zoomControl: true,
          scrollWheelZoom: false,
          attributionControl: true
        }).setView([initialLat, initialLng], initialZoom);

        // Clean street tiles matching Grab / OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          className: 'grab-osm-tiles'
        }).addTo(checkoutMap);

        const icon = getPinIcon();
        pinMarker = L.marker([initialLat, initialLng], {
          icon: icon,
          draggable: true,
        }).addTo(checkoutMap);

        pinMarker.bindPopup("<b>Delivery Pin</b><br>Drag this pin or tap anywhere on the map to set your exact gate/door.").openPopup();

        // Drag marker event
        pinMarker.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          updatePinLocation(latlng.lat, latlng.lng, true);
        });

        // Click map event
        checkoutMap.on('click', (e) => {
          updatePinLocation(e.latlng.lat, e.latlng.lng, true);
        });
      } else {
        checkoutMap.invalidateSize();
        if (form.customer_lat && form.customer_lng) {
          checkoutMap.setView([initialLat, initialLng], initialZoom);
          if (pinMarker) pinMarker.setLatLng([initialLat, initialLng]);
        }
      }

      setTimeout(() => {
        if (checkoutMap) checkoutMap.invalidateSize();
      }, 300);
    };

    const resetPinToStore = () => {
      updatePinLocation(STORE_LAT, STORE_LNG, false);
      if (checkoutMap) {
        checkoutMap.setView([STORE_LAT, STORE_LNG], 14);
      }
      form.delivery_address = 'Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna';
      pinnedAddressPreview.value = 'Santa Rosa Store';
      store.notify('Pin set to Santa Rosa Store coordinates.', 'info');
    };

    const useCurrentLocation = () => {
      resetPinToStore();
    };

    const locateUserGPS = () => {
      if (!navigator.geolocation) {
        store.notify('Geolocation is not supported by your browser.', 'error');
        return;
      }

      isLocatingGPS.value = true;
      gpsErrorMessage.value = '';
      gpsRejectionError.value = '';

      // Provide immediate feedback in delivery address text box
      if (!form.delivery_address || form.delivery_address.trim() === '') {
        form.delivery_address = 'Detecting device location... Please tap Allow on browser prompt.';
      }

      store.notify('Detecting high-precision location... Tap Allow when prompted.', 'info');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 0);
          gpsAccuracyMeters.value = accuracy;

          // 1. Temporarily store coordinates while verifying against the 18 barangays
          form.customer_lat = Number(lat).toFixed(7);
          form.customer_lng = Number(lng).toFixed(7);

          // 2. If inside Santa Rosa bounds, show quick hint immediately while reverse-geocoding refines it
          const quickHint = getQuickLocationHint(lat, lng);
          if (quickHint) {
            form.delivery_address = quickHint;
            pinnedAddressPreview.value = quickHint.split(',')[0];
          }

          // 3. Center and display Leaflet map
          initCheckoutMap();
          if (checkoutMap) {
            checkoutMap.setView([lat, lng], 17);
            if (pinMarker) {
              pinMarker.setLatLng([lat, lng]);
              pinMarker.bindPopup(`<b>Detected Device Location (±${accuracy}m)</b><br>Drag pin or tap map to fine-tune exact gate/door.`).openPopup();
            }
            if (accuracyCircle) {
              checkoutMap.removeLayer(accuracyCircle);
            }
            accuracyCircle = L.circle([lat, lng], {
              radius: accuracy,
              color: '#10b981',
              weight: 1.5,
              fillColor: '#10b981',
              fillOpacity: 0.12
            }).addTo(checkoutMap);
            setTimeout(() => { if (checkoutMap) checkoutMap.invalidateSize(); }, 200);
          }

          // 4. Verify city & barangay via reverse geocoding + hardcoded 18-barangay whitelist
          const isAccepted = await reverseGeocode(lat, lng);
          isLocatingGPS.value = false;

          if (isAccepted && detectedBarangay.value) {
            store.notify(`Detected Brgy. ${detectedBarangay.value.name} (±${accuracy}m). Est. delivery: ${detectedBarangay.value.eta}.`, 'success');
          }
        },
        (err) => {
          isLocatingGPS.value = false;
          if (form.delivery_address && form.delivery_address.includes('Detecting device location...')) {
            form.delivery_address = '';
          }
          let friendlyMsg = '';

          if (err.code === 1) { // PERMISSION_DENIED
            friendlyMsg = 'Location permission was denied. Please turn ON your device GPS / Location services and allow browser access so we can detect your delivery address.';
          } else if (err.code === 2) { // POSITION_UNAVAILABLE
            friendlyMsg = 'GPS location is unavailable. Please make sure your device GPS / Location is turned ON and try again.';
          } else if (err.code === 3) { // TIMEOUT
            friendlyMsg = 'GPS request timed out. Please check that device Location is enabled and tap "Use Device Location" again.';
          } else {
            friendlyMsg = 'Could not access device GPS (' + (err.message || 'Unknown error') + '). You can still drag the pin or search your address.';
          }

          gpsErrorMessage.value = friendlyMsg;
          gpsPromptModalOpen.value = true;
          store.notify(friendlyMsg, 'warning');
          initCheckoutMap();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    };

    Vue.onMounted(() => {
      if (form.order_type === 'Delivery') {
        Vue.nextTick(() => {
          initCheckoutMap();
        });
      }
    });

    Vue.watch(() => form.order_type, (newType) => {
      if (newType === 'Delivery') {
        Vue.nextTick(() => {
          initCheckoutMap();
        });
      }
    });



    const backToMenu = () => {
      store.currentView = 'menu';
      store.activeSection = 'menu';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const promptSignIn = () => {
      store.pendingCheckout = true;
      store.authMode = 'login';
      store.authModalOpen = true;
    };

    Vue.watch(() => store.user, (u) => {
      if (u) {
        if (!form.customer_name && u.name) form.customer_name = u.name;
        if (!form.customer_phone && u.phone) form.customer_phone = u.phone;
        if (!form.delivery_address && u.address) form.delivery_address = u.address;
      }
    }, { immediate: true });

    const submitOrder = async () => {
      if (!store.user) {
        promptSignIn();
        store.notify('You must be signed in to check out and place an order.', 'warning');
        return;
      }

      isValidationTriggered.value = true;
      serverErrorMessage.value = '';

      if (checkoutBlockReasons.value.length > 0) {
        const firstReason = checkoutBlockReasons.value[0];
        store.notify(firstReason, 'error');
        window.scrollTo({ top: 150, behavior: 'smooth' });
        return;
      }

      isSubmitting.value = true;
      try {
        const payload = {
          user_id: store.user?.id || null,
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          order_type: form.order_type,
          delivery_address: form.delivery_address.trim(),
          customer_lat: form.customer_lat ? Number(form.customer_lat) : null,
          customer_lng: form.customer_lng ? Number(form.customer_lng) : null,
          payment_method: form.payment_method,
          notes: form.notes,
          items: store.cart.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
            customization: i.customization,
          })),
        };

        const res = await GST_API.placeOrder(payload);
        const createdOrder = res?.data?.order;

        if (!createdOrder || !createdOrder.id) {
          throw new Error(res?.data?.message || 'Server did not return a valid order confirmation. Please try again.');
        }

        // Clear cart & set active order ONLY after confirming createdOrder exists!
        store.clearCart();
        store.activeOrder = createdOrder;
        localStorage.setItem('gst_active_order_id', createdOrder.id);
        try {
          const localHistory = JSON.parse(localStorage.getItem('gst_local_order_history') || '[]');
          const idStr = String(createdOrder.id);
          if (!localHistory.includes(idStr)) {
            localHistory.unshift(idStr);
            localStorage.setItem('gst_local_order_history', JSON.stringify(localHistory.slice(0, 50)));
          }
        } catch (e) {
          // ignore
        }
        store.fetchProducts();



        store.notify(`Order ${createdOrder.order_number || ''} confirmed!`, 'success');

        // Direct user to Track Order (Figure 11)
        store.currentView = 'track';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        let msg = 'Failed to place order.';
        if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.response?.data?.errors) {
          msg = Object.values(err.response.data.errors).flat().join(' ');
        } else if (err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))) {
          msg = 'Order request timed out while connecting to the server. Please tap Confirm & Place Order to try again.';
        } else if (err.message && err.message.includes('Network')) {
          msg = 'Backend server unreachable. Please check your network connection and try again.';
        } else if (err.message) {
          msg = err.message;
        }
        serverErrorMessage.value = msg;
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
      isValidationTriggered,
      serverErrorMessage,
      onPhoneInput,
      nameError,
      phoneError,
      addressError,
      detectedBarangay,
      isDeliveryUnavailable,
      onManualAddressInput,
      showSupportedBarangays,
      supportedBarangays,
      checkoutBlockReasons,
      useCurrentLocation,
      backToMenu,
      submitOrder,
      isLocatingGPS,
      gpsPromptModalOpen,
      gpsErrorMessage,
      pinnedAddressPreview,
      locateUserGPS,
      resetPinToStore,
      geoSearchQuery,
      isGeoSearching,
      geoSearchResults,
      gpsAccuracyMeters,
      santaRosaChips,
      jumpToChip,
      searchAddressOnMap,
      selectGeoResult,
      promptSignIn,
    };
  },
};
</script>
