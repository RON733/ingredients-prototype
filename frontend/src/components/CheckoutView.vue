<template>
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in space-y-8">
      
      <!-- Page Navigation Header -->
      <div class="flex items-center justify-between">
        <button 
          @click="backToMenu"
          class="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
          <i class="pi pi-arrow-left text-xs"></i>
          <span>Back to Menu</span>
        </button>
        <span class="text-xs font-mono text-gray-500">Secure 256-bit Encrypted Checkout</span>
      </div>

      <!-- Order Availability Notice Banner (Editable by Staff, Admin, Super Admin) -->
      <div 
        v-if="store.isOrderAreaNoteEnabled && store.orderAreaNote" 
        class="p-4 sm:p-5 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 shadow-xl flex items-start sm:items-center justify-between gap-4 animate-fade-in backdrop-blur-md">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center text-lg sm:text-xl font-black shrink-0 shadow-md">
            <i class="pi pi-map-marker"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-amber-300 uppercase tracking-wider">Order Availability Notice</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">Coverage</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-white mt-1">
              {{ store.orderAreaNote }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sign-In Required Notice Banner -->
      <div 
        v-if="!store.user" 
        class="p-5 sm:p-6 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in backdrop-blur-md">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center text-lg sm:text-xl font-black shrink-0 shadow-md">
            <i class="pi pi-lock"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-amber-300 uppercase tracking-wider">Account Required</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">Sign In to Continue</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-white mt-1">
              Customers must be signed in to place and check out orders.
            </p>
            <p class="text-xs text-gray-300 mt-0.5">
              Signing in connects your order to real-time live GPS driver tracking, SMS status updates, and order history.
            </p>
          </div>
        </div>
        <button 
          type="button"
          @click="promptSignIn"
          class="px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer">
          <i class="pi pi-sign-in text-xs"></i>
          <span>Sign In / Register</span>
        </button>
      </div>

      <!-- Main Checkout Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Column: Checkout Details Form (Matches Figure 10) -->
        <div class="lg:col-span-7 bg-surface-800/90 rounded-3xl border border-surface-700 p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-black text-white">Checkout Details</h2>
            <span class="text-xs text-gray-400 font-medium"><span class="text-rose-400 font-bold">*</span> Required fields</span>
          </div>

          <!-- Full Name -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Full Name <span class="text-rose-500">*</span>
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
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Phone Number <span class="text-rose-500">*</span>
              </label>
              <span class="text-[11px] font-mono" :class="form.customer_phone.length === 11 ? 'text-emerald-400 font-bold' : 'text-gray-400'">
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
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Order Type <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                @click="form.order_type = 'Delivery'"
                class="py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all"
                :class="form.order_type === 'Delivery' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <i class="pi pi-truck"></i>
                <span>Delivery (+₱40)</span>
              </button>
              <button 
                type="button"
                @click="form.order_type = 'Store Pickup'"
                class="py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all"
                :class="form.order_type === 'Store Pickup' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <i class="pi pi-shopping-bag"></i>
                <span>Store Pickup (Free)</span>
              </button>
            </div>
          </div>

          <!-- Delivery Address (Only if Delivery selected) -->
          <div v-if="form.order_type === 'Delivery'">
            <div class="mb-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Delivery Address <span class="text-rose-500">*</span>
              </label>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <button 
                type="button"
                @click="locateUserGPS" 
                :disabled="isLocatingGPS"
                class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                <i class="pi" :class="isLocatingGPS ? 'pi-spin pi-spinner text-emerald-300' : 'pi-compass text-emerald-400'"></i>
                <span>{{ isLocatingGPS ? 'Scanning Device Location...' : 'Use Device Location' }}</span>
              </button>

              <span v-if="form.customer_lat && form.customer_lng" class="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <i class="pi pi-check-circle"></i> Pinned ({{ Number(form.customer_lat).toFixed(4) }}, {{ Number(form.customer_lng).toFixed(4) }})
              </span>
            </div>

            <!-- Delivery Area Notice Reminder -->
            <div 
              v-if="store.isOrderAreaNoteEnabled && store.orderAreaNote" 
              class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200 mb-2">
              <i class="pi pi-info-circle text-amber-400 text-sm shrink-0"></i>
              <span class="font-medium"><strong>Delivery Notice:</strong> {{ store.orderAreaNote }}</span>
            </div>

            <textarea 
              v-model="form.delivery_address" 
              rows="2" 
              placeholder="Unit/House No., Street Name, Barangay, Landmark, Santa Rosa, Laguna"
              class="w-full px-4 py-3 rounded-xl bg-surface-900 border text-sm text-white placeholder-gray-500 focus:outline-none transition-all resize-none"
              :class="addressError ? 'border-rose-500 focus:border-rose-400' : 'border-surface-700 focus:border-brand-500'"
            ></textarea>
            <p v-if="addressError" class="text-rose-400 text-[11px] mt-1 font-semibold flex items-center gap-1">
              <i class="pi pi-exclamation-circle text-[10px]"></i>
              <span>{{ addressError }}</span>
            </p>

            <!-- Estimated Delivery Time Card (Customer View) -->
            <div class="mt-3 p-4 rounded-2xl bg-surface-900 border border-surface-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center text-xl shrink-0">
                  ⏱️
                </div>
                <div>
                  <p class="text-xs font-black text-white uppercase tracking-wider">Estimated Delivery Time</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">Freshly brewed & dispatched across Santa Rosa, Laguna</p>
                </div>
              </div>
              <div class="flex items-center gap-2 self-start sm:self-auto">
                <span class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono shadow-sm">
                  30–45 Mins
                </span>
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

          <!-- Payment Method (PayMongo QR vs Cash) -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Payment Method <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <!-- Online QR Payment Option -->
              <button 
                type="button"
                @click="store.isPaymongoAvailable ? (form.payment_method = 'PayMongo') : store.notify('Online QR payment is currently unavailable. Please select Cash.', 'info')"
                :disabled="!store.isPaymongoAvailable"
                class="py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all relative text-center"
                :class="[
                  !store.isPaymongoAvailable 
                    ? 'border-surface-800 bg-surface-950/60 text-gray-500 cursor-not-allowed opacity-60' 
                    : form.payment_method === 'PayMongo' 
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-md ring-1 ring-emerald-500/50 cursor-pointer' 
                      : 'border-surface-700 bg-surface-900 text-gray-300 hover:border-surface-600 cursor-pointer'
                ]">
                <div class="flex items-center gap-1.5">
                  <i class="pi pi-qrcode text-emerald-400"></i>
                  <span class="font-extrabold tracking-wide text-xs">QR Payment</span>
                </div>
                <span class="text-[9px] text-emerald-300/80 font-semibold leading-tight">
                  PayMongo • QR Ph
                </span>
                <span v-if="!store.isPaymongoAvailable" class="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30">
                  Unavailable
                </span>
              </button>

              <!-- Cash / COD Option -->
              <button 
                type="button"
                @click="form.payment_method = 'Cash'"
                class="py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all cursor-pointer text-center"
                :class="form.payment_method === 'Cash' ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-md ring-1 ring-amber-500/50' : 'border-surface-700 bg-surface-900 text-gray-300 hover:border-surface-600'">
                <div class="flex items-center gap-1.5">
                  <i class="pi pi-money-bill text-amber-400"></i>
                  <span class="font-extrabold text-xs">Cash</span>
                </div>
                <span class="text-[9px] text-gray-400 font-medium leading-tight">
                  {{ form.order_type === 'Delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter' }}
                </span>
              </button>
            </div>

            <!-- Notice when Online QR is unavailable -->
            <div v-if="!store.isPaymongoAvailable" class="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2.5 text-xs text-rose-300 animate-fade-in">
              <i class="pi pi-info-circle text-rose-400 text-sm shrink-0"></i>
              <span>Online QR payment is currently unavailable. Please proceed with <strong>{{ form.order_type === 'Delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter' }}</strong>.</span>
            </div>

            <!-- PayMongo Online Checkout Card -->
            <div v-if="form.payment_method === 'PayMongo'" class="p-5 sm:p-6 rounded-3xl bg-surface-900 border border-emerald-500/40 space-y-4 relative overflow-hidden animate-fade-in shadow-xl mb-4">
              <div class="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div class="flex items-center justify-between pb-3 border-b border-surface-800">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-lg shadow-inner">
                    <i class="pi pi-shield"></i>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-xs font-black uppercase tracking-wider text-emerald-300">QR Ph Instant Checkout</p>
                      <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Automated & Instant
                      </span>
                    </div>
                    <p class="text-[11px] text-gray-400 mt-0.5">Pay via PayMongo QR Ph, e-wallets, or banking app</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs text-gray-400">Total:</span>
                  <span class="text-base font-black text-emerald-400 ml-1">₱{{ Number(grandTotal).toFixed(2) }}</span>
                </div>
              </div>

              <!-- Supported Channels: PayMongo QR Ph -->
              <div class="grid grid-cols-2 gap-2 pt-1">
                <div class="p-2.5 rounded-xl bg-surface-950/70 border border-surface-800 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px]"><i class="pi pi-qrcode"></i></span>
                  <div>
                    <p class="text-xs font-bold text-white leading-tight">E-Wallets</p>
                    <p class="text-[10px] text-gray-500">QR Ph Scan</p>
                  </div>
                </div>
                <div class="p-2.5 rounded-xl bg-surface-950/70 border border-surface-800 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-[10px]"><i class="pi pi-building"></i></span>
                  <div>
                    <p class="text-xs font-bold text-white leading-tight">Online Banks</p>
                    <p class="text-[10px] text-gray-500">QR Ph Scan</p>
                  </div>
                </div>
              </div>

              <div class="p-3 rounded-2xl bg-surface-950/60 border border-emerald-500/20 text-xs text-emerald-200/90 flex items-start gap-2.5">
                <i class="pi pi-check-circle text-emerald-400 text-sm shrink-0 mt-0.5"></i>
                <span>Clicking <strong>Place Order & Generate QR Ph Code</strong> below will generate your instant scan-to-pay QR code. No manual reference number or receipt upload is needed!</span>
              </div>

              <!-- Direct Action Button inside PayMongo Card -->
              <div class="pt-2 space-y-2">
                <button 
                  type="button"
                  @click="submitOrder"
                  :disabled="isSubmitting || store.cart.length === 0"
                  class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <i v-if="isSubmitting" class="pi pi-spin pi-spinner text-base"></i>
                  <span v-else class="flex items-center gap-2">
                    <i class="pi" :class="!store.user ? 'pi-lock text-base' : 'pi-qrcode text-base'"></i>
                    <span>{{ !store.user ? 'Sign In to Pay with QR' : ('Place Order & Generate QR Ph Code (₱' + Number(grandTotal).toFixed(2) + ')') }}</span>
                    <i class="pi pi-arrow-right text-xs"></i>
                  </span>
                </button>

                <p class="text-[11px] text-emerald-300/90 text-center flex items-center justify-center gap-1.5 font-medium">
                  <i class="pi pi-shield text-emerald-400 text-[10px]"></i>
                  <span>Scan na All • No forms or receipt upload needed • Instant automated confirmation</span>
                </p>
              </div>

              <!-- Inline validation warning inside PayMongo card if required fields are missing -->
              <div 
                v-if="isValidationTriggered && checkoutBlockReasons.length > 0" 
                class="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/60 space-y-1.5 animate-shake">
                <div class="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>Please Complete Required Details Above:</span>
                </div>
                <ul class="text-xs text-rose-200/90 space-y-1 pl-4 list-disc">
                  <li v-for="(reason, idx) in checkoutBlockReasons" :key="idx">
                    {{ reason }}
                  </li>
                </ul>
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
              class="flex items-start justify-between gap-4 pb-4 border-b border-surface-700/60">
              
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black text-brand-400">x{{ item.quantity }}</span>
                  <span class="text-sm font-bold text-white">{{ item.name }}</span>
                </div>
                <div v-if="item.customization" class="text-[11px] text-gray-400 pl-4 space-y-0.5">
                  <p v-if="item.customization.size">Size: <span class="text-white">{{ item.customization.size }}</span></p>
                  <p v-if="item.customization.sugar">Sugar: <span class="text-white">{{ item.customization.sugar }}</span></p>
                  <p v-if="item.customization.ice">Ice: <span class="text-white">{{ item.customization.ice }}</span></p>
                  <p v-if="item.customization.toppings && item.customization.toppings.length">
                    Toppings: <span class="text-brand-300">{{ item.customization.toppings.join(', ') }}</span>
                  </p>
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
              <button @click="serverErrorMessage = ''" class="text-rose-400 hover:text-white text-xs px-1">✕</button>
            </div>
            <p class="text-[11px] leading-relaxed whitespace-pre-line text-rose-200 pl-6">
              {{ serverErrorMessage }}
            </p>
          </div>

          <!-- Submit Button -->
          <button 
            @click="submitOrder"
            :disabled="isSubmitting || store.cart.length === 0"
            class="w-full py-3.5 rounded-xl text-sm sm:text-base font-bold bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
            <span v-else class="flex items-center gap-2">
              <i v-if="!store.user" class="pi pi-lock text-sm"></i>
              <span>{{ !store.user ? 'Sign In to Place Order' : (form.payment_method === 'PayMongo' ? 'Proceed to QR Checkout' : 'Confirm & Place Order') }}</span>
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
          
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto shadow-lg">
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
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span><strong>Turn ON GPS / Location</strong> in your phone's swipe-down quick settings or computer settings.</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span>When your browser prompts <em>"Allow this site to access your location"</em>, tap <strong>Allow</strong>.</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span>Your location will <strong>automatically appear on the address text box</strong> and on the map. You can drag the pin or tap anywhere on the map to fine-tune your exact door or gate!</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 pt-2">
            <button 
              type="button"
              @click="locateUserGPS(); gpsPromptModalOpen = false;"
              class="flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer">
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

      <!-- Interactive PayMongo QR Ph Payment Modal (Instant In-Page Checkout) -->
      <div 
        v-if="paymongoModalOpen" 
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="dismissPaymongoModal">
        <div class="relative max-w-md w-full bg-surface-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up text-center overflow-hidden">
          
          <div class="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <div class="flex items-center gap-2 text-left">
              <span class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                <i class="pi pi-qrcode"></i>
              </span>
              <div>
                <h4 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>QR Ph Payment</span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Auto-Checkout
                  </span>
                </h4>
                <p class="text-[11px] text-gray-400">Order {{ activePaymongoOrder?.order_number || '' }}</p>
              </div>
            </div>
            <button 
              @click="dismissPaymongoModal" 
              class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
              ✕
            </button>
          </div>

          <!-- SUCCESS STATE (Once Paid) -->
          <div v-if="paymongoPaymentConfirmed" class="py-8 space-y-4 animate-scale-up">
            <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-3xl shadow-xl shadow-emerald-500/20 animate-bounce">
              <i class="pi pi-check text-3xl font-black"></i>
            </div>
            <div class="space-y-1">
              <h3 class="text-xl font-black text-white">Payment Received!</h3>
              <p class="text-sm text-emerald-400 font-bold">₱{{ Number(activePaymongoOrder?.total_amount || grandTotal).toFixed(2) }} Verified</p>
              <p class="text-xs text-gray-300 mt-2">Your order has been checked out automatically and sent to the kitchen staff to prepare!</p>
            </div>
            <div class="pt-2">
              <span class="inline-flex items-center gap-2 text-xs text-gray-400 font-mono">
                <i class="pi pi-spin pi-spinner text-emerald-400 text-xs"></i>
                <span>Redirecting to order tracker...</span>
              </span>
            </div>
          </div>

          <!-- AWAITING PAYMENT STATE -->
          <div v-else class="space-y-4">
            <!-- QR Box -->
            <div class="p-4 rounded-2xl bg-surface-950/90 border border-surface-800 space-y-3">
              <div class="flex items-center justify-between px-1">
                <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total to Pay</span>
                <span class="text-sm font-black text-emerald-400">₱{{ Number(activePaymongoOrder?.total_amount || grandTotal).toFixed(2) }}</span>
              </div>

              <div class="relative group inline-block mx-auto">
                <div class="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-2xl bg-white p-3 border-2 border-emerald-400/60 shadow-xl flex items-center justify-center overflow-hidden">
                  <img 
                    v-if="activePaymongoQr" 
                    :src="activePaymongoQr" 
                    alt="QR Ph Payment Code" 
                    class="w-full h-full object-contain"
                  />
                  <div v-else class="text-center py-10 space-y-2">
                    <i class="pi pi-spin pi-spinner text-2xl text-emerald-500"></i>
                    <p class="text-xs text-gray-500 font-medium">Loading QR Code...</p>
                  </div>
                </div>
              </div>

              <!-- Badges -->
              <div class="flex items-center justify-center gap-1.5 text-[10px] text-gray-300 font-bold flex-wrap pt-1">
                <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">PayMongo QR Ph</span>
                <span class="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30">Maya</span>
                <span class="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-400/30">BDO / BPI</span>
                <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">Any QR Ph App</span>
              </div>
            </div>

            <!-- Live Status Radar -->
            <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-center gap-2.5 text-xs text-emerald-300">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span class="font-bold">Awaiting Payment Confirmation...</span>
            </div>

            <p class="text-[11px] text-gray-400 leading-relaxed">
              Open your <strong>e-wallet</strong> or <strong>banking</strong> app, tap <strong>Scan QR</strong>, and scan the code. This page automatically completes checkout upon payment!
            </p>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button 
                type="button" 
                @click="checkModalPaymongoStatus"
                :disabled="isCheckingModalPayment"
                class="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                <i class="pi" :class="isCheckingModalPayment ? 'pi-spin pi-spinner' : 'pi-refresh'"></i>
                <span>{{ isCheckingModalPayment ? 'Checking...' : 'Check Payment Status' }}</span>
              </button>

              <a 
                v-if="activePaymongoQr" 
                :href="activePaymongoQr" 
                :download="`QR-Order-${activePaymongoOrder?.order_number || 'GST'}.png`"
                class="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                <i class="pi pi-download"></i>
                <span>Save QR</span>
              </a>
            </div>

            <div class="flex items-center justify-between text-xs pt-2 border-t border-surface-800 text-gray-400">
              <a 
                v-if="activePaymongoCheckoutUrl" 
                :href="activePaymongoCheckoutUrl" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1 text-[11px]">
                <span>Open PayMongo Checkout</span>
                <i class="pi pi-external-link text-[10px]"></i>
              </a>
              <button 
                type="button" 
                @click="dismissPaymongoModal"
                class="text-gray-400 hover:text-white text-[11px] underline ml-auto">
                Track Order & Pay Later &rarr;
              </button>
            </div>
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

// G Shot Teas — Customer Checkout Page (Matches Figure 10)
export default {
  name: 'CheckoutView',
  setup() {
    const store = useGShotStore();
    const isSubmitting = Vue.ref(false);
    const isValidationTriggered = Vue.ref(false);
    const serverErrorMessage = Vue.ref('');
    const paymongoModalOpen = Vue.ref(false);
    const activePaymongoOrder = Vue.ref(null);
    const activePaymongoQr = Vue.ref('');
    const activePaymongoCheckoutUrl = Vue.ref('');
    const paymongoPaymentConfirmed = Vue.ref(false);
    const isCheckingModalPayment = Vue.ref(false);
    let modalPollTimer = null;

    // Live GPS & Map Pin State
    const isLocatingGPS = Vue.ref(false);
    const gpsPromptModalOpen = Vue.ref(false);
    const gpsErrorMessage = Vue.ref('');
    const pinnedAddressPreview = Vue.ref('');
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
      payment_method: store.isPaymongoAvailable ? 'PayMongo' : 'Cash',
      notes: '',
    });

    const deliveryFee = Vue.computed(() => {
      return form.order_type === 'Delivery' ? 40 : 0;
    });

    const grandTotal = Vue.computed(() => {
      return store.cartSubtotal + deliveryFee.value;
    });

    // Auto-fallback payment method if PayMongo is flagged unavailable
    Vue.watch(() => store.isPaymongoAvailable, (pmAvail) => {
      if (!pmAvail && form.payment_method === 'PayMongo') {
        form.payment_method = 'Cash';
      }
    }, { immediate: true });

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

    const addressError = Vue.computed(() => {
      if (form.order_type !== 'Delivery') return '';
      if (!isValidationTriggered.value && !form.delivery_address) return '';
      if (!form.delivery_address.trim()) return 'Delivery address is required for Delivery orders.';
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
      if (form.order_type === 'Delivery' && !form.delivery_address.trim()) {
        reasons.push('Delivery Address is required for Delivery orders.');
      }

      // Stock Limit Verification
      const stockViolations = store.getCartStockViolations();
      for (const v of stockViolations) {
        reasons.push(`"${v.name}" exceeds available stock (${v.cartQty} in cart, only ${v.maxStock} available). Please adjust quantity in your cart.`);
      }

      // Online QR Payment Check
      if (form.payment_method === 'PayMongo' && !store.isPaymongoAvailable) {
        reasons.push('Online QR payment is currently unavailable. Please select Cash.');
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
      { name: 'Balibago / Complex', lat: 14.2934, lng: 121.1082 },
      { name: 'Tagapo / SM City', lat: 14.3101, lng: 121.1035 },
      { name: 'Nuvali / Don Jose', lat: 14.2415, lng: 121.0583 },
      { name: 'Caingin', lat: 14.3262, lng: 121.1172 },
      { name: 'Dila', lat: 14.3005, lng: 121.1070 },
      { name: 'Macabling', lat: 14.3023, lng: 121.0965 },
      { name: 'Poblacion', lat: 14.3140, lng: 121.1130 },
    ];

    const jumpToChip = (chip) => {
      initCheckoutMap();
      if (checkoutMap) {
        checkoutMap.setView([chip.lat, chip.lng], 16);
        updatePinLocation(chip.lat, chip.lng, true);
        if (pinMarker) {
          pinMarker.bindPopup(`<b>📍 ${chip.name}</b><br>Drag red pin to your exact gate/door.`).openPopup();
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
          pinMarker.bindPopup(`<b>📍 ${item.display_name.split(',')[0]}</b><br>Drag pin to fine-tune exact gate/door.`).openPopup();
        }
      }
      geoSearchResults.value = [];
      store.notify(`Delivery pin placed at ${item.display_name.split(',')[0]}!`, 'success');
    };

    const getQuickLocationHint = (lat, lng) => {
      const barangays = [
        { name: 'Sinalhan', lat: 14.3167, lng: 121.1111 },
        { name: 'Balibago / Complex', lat: 14.2934, lng: 121.1082 },
        { name: 'Tagapo / SM City', lat: 14.3101, lng: 121.1035 },
        { name: 'Nuvali / Don Jose', lat: 14.2415, lng: 121.0583 },
        { name: 'Caingin', lat: 14.3262, lng: 121.1172 },
        { name: 'Dila', lat: 14.3005, lng: 121.1070 },
        { name: 'Macabling', lat: 14.3023, lng: 121.0965 },
        { name: 'Poblacion', lat: 14.3140, lng: 121.1130 },
        { name: 'Market Area', lat: 14.3150, lng: 121.1120 },
        { name: 'Malitlit', lat: 14.2750, lng: 121.0880 },
        { name: 'Pulong Santa Cruz', lat: 14.2880, lng: 121.0850 },
        { name: 'Aplaya', lat: 14.3292, lng: 121.1273 },
        { name: 'Labas', lat: 14.3045, lng: 121.1167 },
        { name: 'Pooc', lat: 14.3083, lng: 121.1189 },
        { name: 'Malusak', lat: 14.3160, lng: 121.1145 },
        { name: 'Kanluran', lat: 14.3175, lng: 121.1105 },
        { name: 'Ibaba', lat: 14.3190, lng: 121.1120 },
        { name: 'Santo Domingo', lat: 14.2541, lng: 121.0620 },
        { name: 'Dita', lat: 14.2885, lng: 121.1020 },
      ];

      let closest = null;
      let minDist = Infinity;
      for (const b of barangays) {
        const d = Math.hypot(lat - b.lat, lng - b.lng);
        if (d < minDist) {
          minDist = d;
          closest = b;
        }
      }

      if (closest && minDist < 0.15) {
        return `Near Brgy. ${closest.name}, Santa Rosa, Laguna`;
      }
      return `Pinned Delivery Location (${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)})`;
    };

        const updatePinLocation = (lat, lng, doReverseGeocode = true) => {
      form.customer_lat = Number(lat).toFixed(7);
      form.customer_lng = Number(lng).toFixed(7);
      if (pinMarker) {
        pinMarker.setLatLng([lat, lng]);
        pinMarker.setPopupContent(`<b>📍 Pinned Delivery Location</b><br>${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}<br><span class="text-[10px] text-gray-400">Drag to adjust exact door/gate</span>`);
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

      // 1. Primary: Backend endpoint (uses OpenStreetMap Nominatim with valid User-Agent, zero CORS issues)
      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            resolvedAddress = data.address;
            shortAddr = data.short_address || data.address.split(',')[0];
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
            const city = bdc.city || 'Santa Rosa';
            const state = bdc.principalSubdivision || 'Laguna';
            const parts = [locality, city, state].filter(Boolean);
            resolvedAddress = [...new Set(parts)].join(', ');
            shortAddr = locality || city;
          }
        } catch (bErr) {
          console.warn('BigDataCloud reverse geocode error:', bErr);
        }
      }

      // 3. Geometric Santa Rosa Barangay matcher fallback
      if (!resolvedAddress) {
        resolvedAddress = getQuickLocationHint(lat, lng);
        shortAddr = resolvedAddress.split(',')[0];
      }

      pinnedAddressPreview.value = shortAddr || resolvedAddress;
      // Automatically place the resolved address into the delivery address text box!
      form.delivery_address = resolvedAddress;
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

        pinMarker.bindPopup("<b>📍 Delivery Pin</b><br>Drag this pin or tap anywhere on the map to set your exact gate/door.").openPopup();

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

      // Provide immediate feedback in delivery address text box
      if (!form.delivery_address || form.delivery_address.trim() === '') {
        form.delivery_address = 'Detecting device location... Please tap Allow on browser prompt.';
      }

      store.notify('Detecting high-precision location... Tap Allow when prompted.', 'info');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          isLocatingGPS.value = false;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 0);
          gpsAccuracyMeters.value = accuracy;

          // 1. Immediately store coordinates
          form.customer_lat = Number(lat).toFixed(7);
          form.customer_lng = Number(lng).toFixed(7);

          // 2. Immediately put the initial detected location in the text box!
          const quickHint = getQuickLocationHint(lat, lng);
          form.delivery_address = quickHint;
          pinnedAddressPreview.value = quickHint.split(',')[0];

          // 3. Center and display Leaflet map
          initCheckoutMap();
          if (checkoutMap) {
            checkoutMap.setView([lat, lng], 17);
            if (pinMarker) {
              pinMarker.setLatLng([lat, lng]);
              pinMarker.bindPopup(`<b>📍 Detected Device Location (±${accuracy}m)</b><br>Drag pin or tap map to fine-tune exact gate/door.`).openPopup();
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

          store.notify(`✅ Location Detected! Accurate within ±${accuracy}m. Your address has been updated.`, 'success');

          // 4. Refine to full street/subdivision address in the text box
          await reverseGeocode(lat, lng);
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

    const startModalPaymongoPolling = (orderId) => {
      if (modalPollTimer) clearInterval(modalPollTimer);
      modalPollTimer = setInterval(async () => {
        if (!paymongoModalOpen.value || paymongoPaymentConfirmed.value) {
          clearInterval(modalPollTimer);
          modalPollTimer = null;
          return;
        }
        try {
          const res = await GST_API.verifyPayMongoPayment(orderId);
          if (res.data?.paid) {
            handlePaymongoSuccess(res.data.order || activePaymongoOrder.value);
          }
        } catch (e) {}
      }, 2500);
    };

    const checkModalPaymongoStatus = async () => {
      if (!activePaymongoOrder.value) return;
      isCheckingModalPayment.value = true;
      try {
        const res = await GST_API.verifyPayMongoPayment(activePaymongoOrder.value.id);
        if (res.data?.paid) {
          handlePaymongoSuccess(res.data.order || activePaymongoOrder.value);
        } else {
          store.notify('Payment is still pending on PayMongo. Please scan the QR code to finish paying.', 'info');
        }
      } catch (err) {
        store.notify(err.response?.data?.message || 'Error checking payment status.', 'error');
      } finally {
        isCheckingModalPayment.value = false;
      }
    };

    const handlePaymongoSuccess = (confirmedOrder) => {
      paymongoPaymentConfirmed.value = true;
      if (modalPollTimer) {
        clearInterval(modalPollTimer);
        modalPollTimer = null;
      }

      store.clearCart();
      store.activeOrder = confirmedOrder;
      localStorage.setItem('gst_active_order_id', confirmedOrder.id);
      try {
        const localHistory = JSON.parse(localStorage.getItem('gst_local_order_history') || '[]');
        const idStr = String(confirmedOrder.id);
        if (!localHistory.includes(idStr)) {
          localHistory.unshift(idStr);
          localStorage.setItem('gst_local_order_history', JSON.stringify(localHistory.slice(0, 50)));
        }
      } catch (e) {}

      store.notify(`Payment confirmed for Order ${confirmedOrder.order_number || ''}! Your order is sent to the kitchen.`, 'success');

      setTimeout(() => {
        paymongoModalOpen.value = false;
        store.currentView = 'track';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1800);
    };

    const dismissPaymongoModal = () => {
      if (modalPollTimer) {
        clearInterval(modalPollTimer);
        modalPollTimer = null;
      }
      paymongoModalOpen.value = false;
      if (activePaymongoOrder.value) {
        store.clearCart();
        store.activeOrder = activePaymongoOrder.value;
        localStorage.setItem('gst_active_order_id', activePaymongoOrder.value.id);
        store.currentView = 'track';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    Vue.onUnmounted(() => {
      if (modalPollTimer) {
        clearInterval(modalPollTimer);
        modalPollTimer = null;
      }
    });

    const backToMenu = () => {
      store.currentView = 'customer';
      store.activeSection = 'menu';
      const el = document.getElementById('menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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
        // Immediately refresh ingredients & products inventory in background
        store.fetchIngredients();
        store.fetchProducts();

        // If PayMongo, open the interactive QR checkout modal directly in-page!
        if (form.payment_method === 'PayMongo') {
          activePaymongoOrder.value = createdOrder;
          activePaymongoQr.value = res?.data?.qr_image || createdOrder.paymongo_qr_image;
          activePaymongoCheckoutUrl.value = res?.data?.checkout_url || createdOrder.paymongo_checkout_url;
          paymongoModalOpen.value = true;
          paymongoPaymentConfirmed.value = false;

          // Start polling PayMongo for payment confirmation
          startModalPaymongoPolling(createdOrder.id);
          return;
        }

        store.notify(`Order ${createdOrder.order_number || ''} confirmed! Ingredients deducted.`, 'success');

        // Direct user to Track Order (Figure 11)
        store.currentView = 'track';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        let msg = 'Failed to place order.';
        if (err.response?.data?.insufficient_ingredients?.length) {
          msg = 'Cannot place order: Insufficient kitchen stock for:\n\u2022 ' + err.response.data.insufficient_ingredients.join('\n\u2022 ');
        } else if (err.response?.data?.message) {
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
      checkoutBlockReasons,
      useCurrentLocation,
      backToMenu,
      submitOrder,
      paymongoModalOpen,
      activePaymongoOrder,
      activePaymongoQr,
      activePaymongoCheckoutUrl,
      paymongoPaymentConfirmed,
      isCheckingModalPayment,
      checkModalPaymongoStatus,
      dismissPaymongoModal,
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
