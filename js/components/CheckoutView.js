// G Shot Teas — Customer Checkout Page (Matches Figure 10)
const CheckoutView = {
  template: `
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
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Delivery Address <span class="text-rose-500">*</span>
              </label>
              <button 
                type="button"
                @click="useCurrentLocation" 
                class="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
                <i class="pi pi-map-marker text-[10px]"></i> Use Santa Rosa Store Address
              </button>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <button 
                type="button"
                @click="locateUserGPS" 
                :disabled="isLocatingGPS"
                class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                <i class="pi" :class="isLocatingGPS ? 'pi-spin pi-spinner text-emerald-300' : 'pi-compass text-emerald-400'"></i>
                <span>{{ isLocatingGPS ? 'Requesting Device GPS...' : 'Use Device GPS' }}</span>
              </button>

              <span v-if="form.customer_lat && form.customer_lng" class="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <i class="pi pi-check-circle"></i> Pinned ({{ Number(form.customer_lat).toFixed(4) }}, {{ Number(form.customer_lng).toFixed(4) }})
              </span>
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
            <p v-else class="text-gray-500 text-[11px] mt-1">
              Currently delivering across Santa Rosa, Laguna and nearby subdivisions.
            </p>
            
            <!-- Interactive Leaflet Delivery Pin Map in Checkout -->
            <div class="mt-3 rounded-2xl border border-surface-700 bg-surface-950 overflow-hidden shadow-xl">
              <div class="px-3.5 py-2.5 bg-surface-900 border-b border-surface-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span class="font-bold text-gray-200 flex items-center gap-1.5">
                  <span class="text-emerald-400">📍</span> Pin Exact Delivery Location
                </span>
                <span class="text-[11px] text-gray-400 flex items-center gap-1">
                  <i class="pi pi-info-circle text-brand-400 text-[10px]"></i> Tap map or drag pin to your house/gate
                </span>
              </div>

              <!-- Map Container -->
              <div id="checkout-pin-map" class="w-full h-56 sm:h-64 relative z-0"></div>

              <!-- Map Sub-bar with Coordinates & Actions -->
              <div class="p-3 bg-surface-900/95 border-t border-surface-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-2.5 h-2.5 rounded-full shrink-0" :class="form.customer_lat && form.customer_lng ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"></div>
                  <span v-if="form.customer_lat && form.customer_lng" class="text-gray-300 font-medium truncate text-[11px]">
                    Pinned: <span class="text-emerald-400 font-mono font-bold">{{ Number(form.customer_lat).toFixed(5) }}, {{ Number(form.customer_lng).toFixed(5) }}</span>
                    <span v-if="pinnedAddressPreview" class="text-gray-400 text-[10px] ml-1">({{ pinnedAddressPreview }})</span>
                  </span>
                  <span v-else class="text-gray-400 text-[11px]">
                    No exact coordinates pinned. Click map or tap "Use Device GPS" above.
                  </span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button 
                    type="button" 
                    @click="locateUserGPS" 
                    :disabled="isLocatingGPS"
                    class="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 active:scale-95 text-emerald-400 hover:text-emerald-300 border border-surface-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer">
                    <i class="pi" :class="isLocatingGPS ? 'pi-spin pi-spinner' : 'pi-compass'"></i>
                    <span>{{ isLocatingGPS ? 'Locating...' : 'My GPS' }}</span>
                  </button>
                  <button 
                    type="button" 
                    @click="resetPinToStore" 
                    class="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-[11px] font-semibold transition-all cursor-pointer"
                    title="Reset pin to Santa Rosa Store">
                    Reset
                  </button>
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

          <!-- Payment Method (GCash vs Cash on Delivery) -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Payment Method <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <!-- GCash Option -->
              <button 
                type="button"
                @click="form.payment_method = 'GCash'"
                class="py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                :class="form.payment_method === 'GCash' ? 'border-sky-500 bg-sky-500/15 text-sky-400 shadow-md ring-1 ring-sky-500/50' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <span class="text-sky-400 font-black tracking-wider">GCash</span>
              </button>
              
              <!-- Cash / COD Option -->
              <button 
                type="button"
                @click="form.payment_method = 'Cash'"
                class="py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                :class="form.payment_method === 'Cash' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-md ring-1 ring-emerald-500/50' : 'border-surface-700 bg-surface-900 text-gray-400 hover:border-surface-600'">
                <i class="pi pi-money-bill"></i>
                <span>{{ form.order_type === 'Delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter' }}</span>
              </button>
            </div>

            <!-- GCash Payment & Scan-to-Pay Card -->
            <div v-if="form.payment_method === 'GCash'" class="p-5 sm:p-6 rounded-3xl bg-sky-950/40 border border-sky-500/50 space-y-5 animate-fade-in shadow-2xl relative overflow-hidden">
              
              <!-- Background blue glow -->
              <div class="absolute -right-16 -top-16 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <!-- Merchant Header & Mobile Number -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-800/50">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center font-black text-sky-400 text-base shadow-inner">
                    G
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-[11px] font-bold uppercase tracking-wider text-sky-300">Official Store GCash</p>
                      <span class="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                        Verified
                      </span>
                    </div>
                    <p class="text-sm sm:text-base font-black text-white font-mono mt-0.5">
                      {{ store.gcashAccountNumber }}
                      <span class="text-xs font-semibold text-sky-400 font-sans">({{ store.gcashAccountName }})</span>
                    </p>
                  </div>
                </div>

                <!-- One-Click Copy Number Button -->
                <button 
                  type="button"
                  @click="copyGcashNumber"
                  class="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-400/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95">
                  <i class="pi" :class="isCopiedNumber ? 'pi-check' : 'pi-copy'"></i>
                  <span>{{ isCopiedNumber ? 'Copied Number!' : 'Copy Number' }}</span>
                </button>
              </div>

              <!-- GCash Scan-to-Pay QR Code Box -->
              <div class="p-4 rounded-2xl bg-surface-950/80 border border-sky-500/30 text-center space-y-3">
                <div class="flex items-center justify-between px-2">
                  <span class="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="pi pi-qrcode text-sky-400"></i>
                    <span>Scan to Pay with GCash</span>
                  </span>
                  <span class="text-xs font-mono font-black text-emerald-400">
                    Amount: ₱{{ grandTotal.toFixed(2) }}
                  </span>
                </div>

                <!-- QR Code Container -->
                <div class="relative group inline-block mx-auto">
                  <div class="w-52 h-52 sm:w-60 sm:h-60 mx-auto rounded-2xl bg-white p-3 border-2 border-sky-400/60 shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02]">
                    <img 
                      :src="store.gcashQrCode" 
                      alt="GCash Payment QR Code" 
                      class="w-full h-full object-contain cursor-pointer"
                      @click="isQrModalOpen = true"
                      title="Click to view full size"
                    />
                  </div>
                  <!-- Hover overlay pill on image -->
                  <button 
                    type="button" 
                    @click="isQrModalOpen = true"
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 hover:bg-black text-white text-[10px] font-bold backdrop-blur-sm transition-all opacity-90 hover:opacity-100 flex items-center gap-1 cursor-pointer">
                    <i class="pi pi-search-plus text-[10px]"></i>
                    <span>Tap to Enlarge QR</span>
                  </button>
                </div>

                <!-- Sub-actions for QR -->
                <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button 
                    type="button"
                    @click="isQrModalOpen = true"
                    class="text-xs text-sky-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                    <i class="pi pi-eye text-[11px]"></i>
                    <span>Enlarge QR</span>
                  </button>
                  <span class="text-sky-700">•</span>
                  <a 
                    :href="store.gcashQrCode" 
                    download="GShot-GCash-QR.png"
                    class="text-xs text-sky-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors">
                    <i class="pi pi-download text-[11px]"></i>
                    <span>Save QR to Photos</span>
                  </a>
                </div>
                <p class="text-[11px] text-gray-400">
                  Tip: In your GCash app, tap <strong>Scan QR</strong> (or tap <em>Upload QR</em> from your photo album).
                </p>
              </div>

              <!-- Mandatory Requirements Policy Box -->
              <div class="p-3.5 rounded-2xl border transition-all"
                :class="isGcashFullyVerified ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-sky-950/80 border-sky-500/40'">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <i class="pi" :class="isGcashFullyVerified ? 'pi-check-circle text-emerald-400' : 'pi-shield text-sky-400'"></i>
                    <p class="text-xs font-black uppercase tracking-wider" :class="isGcashFullyVerified ? 'text-emerald-300' : 'text-sky-300'">
                      GCash Payment Verification (Both Required)
                    </p>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="isGcashFullyVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'">
                    {{ gcashRequirementStatusText }}
                  </span>
                </div>
                <p class="text-[11px] text-gray-300 leading-relaxed">
                  To complete your online order, please enter your transaction <strong>Reference Number</strong> <span class="text-rose-400 font-bold">*</span> <strong>AND</strong> upload the <strong>Receipt Screenshot</strong> <span class="text-rose-400 font-bold">*</span> from your GCash app.
                </p>
              </div>

              <!-- REQUIRED FIELD 1: GCash Reference Number Input -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-sky-300">
                    1. GCash Reference Number <span class="text-rose-400 font-black">* REQUIRED</span>
                  </label>
                  <span class="text-[10px] font-mono" :class="form.gcash_ref.length >= 9 ? 'text-emerald-400 font-bold' : (form.gcash_ref.length > 0 ? 'text-amber-400 font-bold' : 'text-gray-400')">
                    {{ form.gcash_ref.length }} / 13 digits (standard 9–13)
                  </span>
                </div>
                <div class="relative">
                  <i class="pi pi-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 text-xs"></i>
                  <input 
                    v-model="form.gcash_ref"
                    @input="onRefInput"
                    type="text" 
                    inputmode="numeric"
                    maxlength="13"
                    placeholder="e.g. 908234819023 (Found on GCash receipt)"
                    class="w-full pl-9 pr-4 py-3 rounded-xl bg-surface-900 border text-xs sm:text-sm font-mono font-bold text-white placeholder-gray-500 focus:outline-none transition-colors"
                    :class="refError ? 'border-rose-500 focus:border-rose-400' : 'border-sky-700/80 focus:border-sky-400'"
                  />
                  <span v-if="form.gcash_ref.length >= 9" class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <i class="pi pi-check"></i>
                  </span>
                </div>
                <p v-if="refError" class="text-rose-400 text-[11px] mt-1 font-semibold flex items-center gap-1">
                  <i class="pi pi-exclamation-circle text-[10px]"></i>
                  <span>{{ refError }}</span>
                </p>
                <p v-else class="text-[11px] text-gray-400 mt-1">
                  Numbers only. Enter the 9 to 13-digit reference code shown on your GCash payment confirmation.
                </p>
              </div>

              <!-- REQUIRED FIELD 2: Upload GCash Receipt Screenshot -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-sky-300">
                    2. GCash Receipt Screenshot <span class="text-rose-400 font-black">* REQUIRED</span>
                  </label>
                  <span v-if="form.proof_image" class="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <i class="pi pi-check"></i> Screenshot Attached
                  </span>
                </div>

                <!-- Upload Drag/Drop Box if no proof attached -->
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
                    class="w-full p-5 rounded-2xl border-2 border-dashed bg-surface-900/70 hover:bg-surface-900 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group"
                    :class="proofError ? 'border-rose-500/80 hover:border-rose-400' : 'border-sky-700/80 hover:border-sky-400'">
                    <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                      <i class="pi pi-upload"></i>
                    </div>
                    <div>
                      <span class="text-xs font-bold text-white group-hover:text-sky-300 block">
                        Click or drag to upload payment receipt screenshot
                      </span>
                      <span class="text-[10px] text-gray-400 block mt-0.5">
                        PNG, JPG, or WEBP (Saved directly from your GCash app)
                      </span>
                    </div>
                  </label>
                  <p v-if="proofError" class="text-rose-400 text-[11px] mt-1 font-semibold flex items-center gap-1">
                    <i class="pi pi-exclamation-circle text-[10px]"></i>
                    <span>{{ proofError }}</span>
                  </p>
                </div>

                <!-- Preview Thumbnail with Full-Size Modal and Remove Button -->
                <div v-else class="p-3.5 rounded-2xl bg-surface-900 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-md">
                  <div class="flex items-center gap-3 min-w-0">
                    <img 
                      :src="form.proof_image" 
                      alt="Receipt Preview" 
                      @click="isReceiptLightboxOpen = true"
                      class="w-14 h-14 rounded-xl object-cover border border-surface-700 shrink-0 cursor-pointer hover:opacity-90 transition-opacity" 
                      title="Click to view full screenshot"
                    />
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-white truncate">{{ proofFileName || 'GCash Receipt Screenshot' }}</p>
                      <button 
                        type="button" 
                        @click="isReceiptLightboxOpen = true"
                        class="text-[11px] text-sky-400 hover:text-sky-300 underline font-semibold flex items-center gap-1 mt-0.5 cursor-pointer">
                        <i class="pi pi-eye text-[10px]"></i> View Full Screenshot
                      </button>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <label 
                      for="gcash_receipt_file_change"
                      class="px-2.5 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white text-[11px] font-bold border border-surface-700 transition-colors cursor-pointer flex items-center gap-1">
                      <i class="pi pi-refresh text-[10px]"></i>
                      <span class="hidden sm:inline">Change</span>
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      id="gcash_receipt_file_change"
                      @change="handleImageUpload"
                      class="hidden"
                    />

                    <button 
                      type="button" 
                      @click="removeProofImage"
                      class="p-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/60 transition-colors cursor-pointer"
                      title="Remove Screenshot">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
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
            class="w-full py-4 rounded-xl text-base font-black bg-gradient-to-r from-brand-600 via-orange-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
            <span v-else>Confirm & Place Order</span>
          </button>

          <p class="text-[11px] text-center text-gray-500">
            By placing an order, you agree to G Shot Teas terms & privacy policy.
          </p>

        </div>

      </div>

      <!-- Lightbox Modal: Enlarge GCash QR Code -->
      <div 
        v-if="isQrModalOpen" 
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="isQrModalOpen = false">
        <div class="relative max-w-md w-full bg-surface-900 border border-sky-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up text-center">
          
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <div class="flex items-center gap-2">
              <i class="pi pi-qrcode text-sky-400 text-base"></i>
              <h4 class="text-sm font-bold text-white">Scan to Pay with GCash</h4>
            </div>
            <button 
              @click="isQrModalOpen = false" 
              class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Big QR Image -->
          <div class="p-4 rounded-2xl bg-white shadow-lg mx-auto inline-block border border-sky-300">
            <img 
              :src="store.gcashQrCode" 
              alt="GCash QR Code Large" 
              class="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto"
            />
          </div>

          <div class="space-y-1">
            <p class="text-sm font-black text-white font-mono">{{ store.gcashAccountNumber }}</p>
            <p class="text-xs text-sky-400 font-semibold">{{ store.gcashAccountName }}</p>
            <p class="text-xs text-emerald-400 font-bold pt-1">Total to Pay: ₱{{ grandTotal.toFixed(2) }}</p>
          </div>

          <div class="flex items-center justify-center gap-3 pt-2">
            <a 
              :href="store.gcashQrCode" 
              download="GShot-GCash-QR.png"
              class="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-2">
              <i class="pi pi-download"></i>
              <span>Save QR to Phone</span>
            </a>
            <button 
              @click="isQrModalOpen = false"
              class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-bold transition-colors">
              Close
            </button>
          </div>

        </div>
      </div>

      <!-- Lightbox Modal: Enlarge Uploaded Receipt Screenshot -->
      <div 
        v-if="isReceiptLightboxOpen && form.proof_image" 
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="isReceiptLightboxOpen = false">
        <div class="relative max-w-lg w-full bg-surface-900 border border-surface-700 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="pi pi-receipt text-sky-400"></i> Your Uploaded GCash Receipt
            </h4>
            <button 
              @click="isReceiptLightboxOpen = false" 
              class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
              ✕
            </button>
          </div>

          <div class="max-h-[65vh] overflow-auto rounded-2xl bg-black border border-surface-800 p-2 flex items-center justify-center">
            <img :src="form.proof_image" alt="Uploaded GCash Receipt" class="max-h-[60vh] w-auto object-contain rounded-lg" />
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-gray-400 font-mono">Ref: {{ form.gcash_ref || 'Pending' }}</span>
            <button 
              @click="isReceiptLightboxOpen = false"
              class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold transition-colors cursor-pointer">
              Close Preview
            </button>
          </div>
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
              <span>Your location will appear on the map. You can <strong>drag the pin or tap anywhere on the map</strong> to point to your exact door or gate!</span>
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

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const isSubmitting = Vue.ref(false);
    const isValidationTriggered = Vue.ref(false);
    const serverErrorMessage = Vue.ref('');
    const proofFileName = Vue.ref('');
    const isQrModalOpen = Vue.ref(false);
    const isReceiptLightboxOpen = Vue.ref(false);
    const isCopiedNumber = Vue.ref(false);

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

    // Enforce numbers only and standard 11 digits for Phone Number
    const onPhoneInput = (e) => {
      const clean = e.target.value.replace(/\D/g, '').slice(0, 11);
      form.customer_phone = clean;
    };

    // Enforce numbers only and max 13 digits for GCash Reference Number
    const onRefInput = (e) => {
      const clean = e.target.value.replace(/\D/g, '').slice(0, 13);
      form.gcash_ref = clean;
    };

    // Quick-copy GCash mobile number
    const copyGcashNumber = () => {
      const cleanNum = (store.gcashAccountNumber || '09123456789').replace(/\s+/g, '');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(cleanNum);
      }
      isCopiedNumber.value = true;
      store.notify(`Copied ${cleanNum} to clipboard!`, 'info');
      setTimeout(() => {
        isCopiedNumber.value = false;
      }, 2500);
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

    // GCash Reference Number: strictly required when payment_method === 'GCash'
    const refError = Vue.computed(() => {
      if (form.payment_method !== 'GCash') return '';
      if (!isValidationTriggered.value && !form.gcash_ref) return '';
      if (!form.gcash_ref || !form.gcash_ref.trim()) {
        return 'GCash Reference Number is required.';
      }
      if (form.gcash_ref.length < 9) {
        return `Reference number is too short (${form.gcash_ref.length}/9–13 digits entered).`;
      }
      return '';
    });

    // GCash Receipt Screenshot: strictly required when payment_method === 'GCash'
    const proofError = Vue.computed(() => {
      if (form.payment_method !== 'GCash') return '';
      if (!isValidationTriggered.value && !form.proof_image) return '';
      if (!form.proof_image) {
        return 'GCash Receipt Screenshot is required.';
      }
      return '';
    });

    // GCash dual verification status check
    const isGcashFullyVerified = Vue.computed(() => {
      if (form.payment_method !== 'GCash') return true;
      const hasRef = Boolean(form.gcash_ref && form.gcash_ref.trim().length >= 9);
      const hasProof = Boolean(form.proof_image && form.proof_image.trim().length > 0);
      return hasRef && hasProof;
    });

    const gcashRequirementStatusText = Vue.computed(() => {
      const hasRef = Boolean(form.gcash_ref && form.gcash_ref.trim().length >= 9);
      const hasProof = Boolean(form.proof_image && form.proof_image.trim().length > 0);
      if (hasRef && hasProof) return '✓ 2 of 2 Requirements Completed';
      if (hasRef || hasProof) return '1 of 2 Requirements Completed';
      return '0 of 2 Requirements Completed';
    });

    // Aggregated list stating all exact reasons why order cannot be placed
    const checkoutBlockReasons = Vue.computed(() => {
      const reasons = [];
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

      // GCash Strict Requirement: BOTH Reference Number AND Receipt Screenshot are required
      if (form.payment_method === 'GCash') {
        const hasRef = Boolean(form.gcash_ref && form.gcash_ref.trim().length >= 9 && form.gcash_ref.trim().length <= 13);
        const hasProof = Boolean(form.proof_image && form.proof_image.trim().length > 0);

        if (!form.gcash_ref || !form.gcash_ref.trim()) {
          reasons.push('GCash Reference Number is required (numbers only, 9 to 13 digits).');
        } else if (form.gcash_ref.trim().length < 9) {
          reasons.push(`GCash Reference Number is incomplete (${form.gcash_ref.trim().length}/9–13 digits entered).`);
        }

        if (!hasProof) {
          reasons.push('GCash Receipt Screenshot is required. Please upload your payment confirmation receipt.');
        }
      }
      return reasons;
    });

    const getPinIcon = () => {
      if (typeof L === 'undefined') return null;
      return L.divIcon({
        className: 'custom-checkout-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white shadow-2xl flex items-center justify-center text-lg font-bold text-white transition-transform hover:scale-110">
              📍
            </div>
            <div class="absolute -bottom-1 w-2.5 h-2.5 bg-emerald-600 rotate-45 border-r border-b border-white"></div>
          </div>
        `,
        iconSize: [40, 44],
        iconAnchor: [20, 42],
        popupAnchor: [0, -42],
      });
    };

    const updatePinLocation = (lat, lng, doReverseGeocode = true) => {
      form.customer_lat = Number(lat).toFixed(7);
      form.customer_lng = Number(lng).toFixed(7);
      if (pinMarker) {
        pinMarker.setLatLng([lat, lng]);
        pinMarker.setPopupContent(`<b>📍 Pinned Delivery Location</b><br>${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}<br><span class="text-[10px] text-gray-400">Drag to adjust exact door/gate</span>`);
      }
      if (doReverseGeocode) {
        reverseGeocode(lat, lng);
      }
    };

    const reverseGeocode = async (lat, lng) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            const road = data.address?.road || data.address?.pedestrian || data.address?.suburb || '';
            const brgy = data.address?.neighbourhood || data.address?.quarter || data.address?.village || '';
            const city = data.address?.city || data.address?.town || 'Santa Rosa';
            const shortAddr = [road, brgy, city].filter(Boolean).join(', ');

            pinnedAddressPreview.value = shortAddr || data.display_name;

            // If empty or default, populate delivery_address
            if (!form.delivery_address || form.delivery_address.trim() === '' || form.delivery_address.includes('Amira Townhomes, Brgy. Sinalhan')) {
              form.delivery_address = data.display_name;
            }
          }
        }
      } catch (err) {
        console.warn('Reverse geocode error:', err);
      }
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

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
          maxZoom: 19,
          className: 'dark-osm-tiles'
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

      store.notify('Detecting GPS location... Please turn ON your device GPS and tap Allow when prompted.', 'info');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          isLocatingGPS.value = false;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          initCheckoutMap();

          if (checkoutMap) {
            checkoutMap.setView([lat, lng], 17);
            updatePinLocation(lat, lng, true);
            if (pinMarker) {
              pinMarker.bindPopup("<b>📍 GPS Location Detected!</b><br>Drag this pin or tap the map to fine-tune your exact gate/door.").openPopup();
            }
            setTimeout(() => { if (checkoutMap) checkoutMap.invalidateSize(); }, 200);
          }

          store.notify('✓ GPS Location detected! Pin your exact house/gate on the map.', 'success');
        },
        (err) => {
          isLocatingGPS.value = false;
          let friendlyMsg = '';

          if (err.code === 1) { // PERMISSION_DENIED
            friendlyMsg = 'Location permission was denied. Please turn ON your device GPS / Location services and allow browser access so we can detect your delivery address.';
          } else if (err.code === 2) { // POSITION_UNAVAILABLE
            friendlyMsg = 'GPS location is unavailable. Please make sure your device GPS / Location is turned ON and try again.';
          } else if (err.code === 3) { // TIMEOUT
            friendlyMsg = 'GPS request timed out. Please check that device Location is enabled and tap "Use Device GPS" again.';
          } else {
            friendlyMsg = 'Could not retrieve GPS location. Please ensure your device GPS is ON, or simply tap on the map to pin your location.';
          }

          gpsErrorMessage.value = friendlyMsg;
          gpsPromptModalOpen.value = true;
          store.notify(friendlyMsg, 'warning');

          initCheckoutMap();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
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

    // Client-side canvas compression for receipt image
    const compressImage = (file, maxDim = 1200, quality = 0.85) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (e) => {
          const img = new Image();
          img.onerror = reject;
          img.onload = () => {
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    };

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        store.notify('Please upload an image file (PNG, JPG, JPEG, WEBP).', 'error');
        return;
      }

      proofFileName.value = file.name;
      try {
        const compressedBase64 = await compressImage(file, 1200, 0.85);
        form.proof_image = compressedBase64;
        store.notify('Receipt screenshot attached successfully!', 'success');
      } catch (err) {
        // Fallback to raw reader if canvas fails
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
      isValidationTriggered.value = true;
      serverErrorMessage.value = '';

      if (checkoutBlockReasons.value.length > 0) {
        const firstReason = checkoutBlockReasons.value[0];
        store.notify(firstReason, 'error');
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
          gcash_ref: form.gcash_ref.trim(),
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
        localStorage.setItem('gst_active_order_id', createdOrder.id);
        store.notify(`Order ${createdOrder.order_number} confirmed! Ingredients deducted.`, 'success');

        // Immediately refresh ingredients & products inventory in background
        store.fetchIngredients();
        store.fetchProducts();

        // Direct user to Track Order (Figure 11)
        store.currentView = 'track';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        let msg = 'Failed to place order.';
        if (err.response?.data?.insufficient_ingredients?.length) {
          msg = 'Cannot place order: Insufficient kitchen stock for:\n• ' + err.response.data.insufficient_ingredients.join('\n• ');
        } else if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.response?.data?.errors) {
          msg = Object.values(err.response.data.errors).flat().join(' ');
        } else if (err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))) {
          msg = 'Cloud database connection timed out while processing order. Please try again.';
        } else if (err.message && err.message.includes('Network')) {
          msg = 'Backend server unreachable. Please verify server is running on 127.0.0.1:8000.';
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
      proofFileName,
      isQrModalOpen,
      isReceiptLightboxOpen,
      isCopiedNumber,
      copyGcashNumber,
      onPhoneInput,
      onRefInput,
      nameError,
      phoneError,
      addressError,
      refError,
      proofError,
      isGcashFullyVerified,
      gcashRequirementStatusText,
      checkoutBlockReasons,
      useCurrentLocation,
      handleImageUpload,
      removeProofImage,
      backToMenu,
      submitOrder,
      isLocatingGPS,
      gpsPromptModalOpen,
      gpsErrorMessage,
      pinnedAddressPreview,
      locateUserGPS,
      resetPinToStore,
    };
  },
};
