<template>
<div class="space-y-8">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-800">
        <div>
          <h2 class="text-2xl font-black text-white flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-lg">
              <i class="pi pi-qrcode"></i>
            </span>
            <span>Store & Payment Settings</span>
          </h2>
          <p class="text-xs text-gray-400 mt-1">
            Configure your store's GCash QR code, mobile number, merchant account details, and store operations.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="reloadSettings"
            :disabled="isLoading"
            class="px-3.5 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-gray-300 text-xs font-bold border border-surface-700/80 transition-all flex items-center gap-1.5 cursor-pointer">
            <i class="pi" :class="isLoading ? 'pi-spin pi-spinner' : 'pi-refresh'"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- MAIN SECTION 0: PayMongo Online Payment Gateway -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-surface-750 shadow-2xl relative overflow-hidden space-y-6">
        <div class="absolute -top-24 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-800">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20 shrink-0">
              <i class="pi pi-credit-card"></i>
            </div>
            <div>
              <h3 class="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>PayMongo Payment Gateway</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Automated Hosted Checkout
                </span>
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Enables customers to pay online directly using GCash, Maya, Debit/Credit Card (Visa, Mastercard), GrabPay, and BillEase.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <span v-if="isPaymongoAvailable" class="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>PayMongo Active</span>
            </span>
            <span v-else class="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>PayMongo Disabled</span>
            </span>

            <button
              type="button"
              @click="togglePaymongoAvailability"
              :disabled="isTogglingPaymongo"
              class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              :class="isPaymongoAvailable ? 'bg-surface-800 hover:bg-rose-500/20 text-rose-300 border border-surface-700 hover:border-rose-500/40' : 'bg-emerald-500 hover:bg-emerald-400 text-black'">
              <i v-if="isTogglingPaymongo" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi" :class="isPaymongoAvailable ? 'pi-power-off' : 'pi-check'"></i>
              <span>{{ isPaymongoAvailable ? 'Disable PayMongo' : 'Enable PayMongo' }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-surface-950/60 border border-surface-800 space-y-2">
            <p class="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <i class="pi pi-key text-emerald-400"></i> Public API Key
            </p>
            <p class="font-mono text-xs text-white bg-surface-900 p-2.5 rounded-xl border border-surface-750 select-all">
              pk_test_BGTyBKi9iXHVsforUZ2WyCLz
            </p>
            <p class="text-[11px] text-gray-500">Public key for client-side authentication and session tokenization.</p>
          </div>

          <div class="p-4 rounded-2xl bg-surface-950/60 border border-surface-800 space-y-2">
            <p class="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <i class="pi pi-lock text-emerald-400"></i> Secret API Key
            </p>
            <p class="font-mono text-xs text-emerald-300 bg-surface-900 p-2.5 rounded-xl border border-surface-750">
              sk_test_••••••••••••••••••••4e1e <span class="text-[10px] text-gray-400 font-sans">(Active & Encrypted in .env)</span>
            </p>
            <p class="text-[11px] text-gray-500">Authenticated server-to-server HTTP Basic Auth with PayMongo API.</p>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-surface-950/40 border border-surface-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p class="font-bold text-white flex items-center gap-1.5">
              <i class="pi pi-bolt text-amber-400"></i> Webhook Notification Endpoint (For Automated Order Confirmation)
            </p>
            <p class="text-gray-400 text-[11px] mt-0.5 font-mono select-all">
              /api/paymongo/webhook
            </p>
          </div>
          <span class="text-[11px] text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            Auto Loyverse POS Sync on Payment
          </span>
        </div>
      </div>

      <!-- MAIN SECTION 1: GCash Online Payment & Scan-to-Pay Settings -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-surface-750 shadow-2xl relative overflow-hidden space-y-6">
        
        <!-- Ambient subtle accent glow -->
        <div class="absolute -top-24 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Section Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-800">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-sky-500/20 shrink-0">
              G
            </div>
            <div>
              <h3 class="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>GCash Payment Configuration</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Online Checkout
                </span>
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Customers scan this QR code or send payment to this GCash mobile number upon checkout.
              </p>
            </div>
          </div>

          <!-- Badges: GCash Availability Status & Active QR Type -->
          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <!-- GCash Availability Live Status Badge -->
            <span v-if="isGcashAvailable" class="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>GCash Available</span>
            </span>
            <span v-else class="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>GCash Flagged Unavailable</span>
            </span>

            <!-- Active QR Type Badge -->
            <span v-if="hasCustomQr" class="px-3 py-1.5 rounded-full text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Custom Uploaded QR Code Active</span>
            </span>
            <span v-else class="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
              <i class="pi pi-info-circle text-xs"></i>
              <span>Default System QR Active</span>
            </span>
          </div>
        </div>

        <!-- GCash Unavailable Warning Alert Banner -->
        <div v-if="!isGcashAvailable" class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
          <div class="flex items-start sm:items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center text-sm shrink-0">
              <i class="pi pi-ban"></i>
            </div>
            <div>
              <p class="font-extrabold text-rose-200">GCash Payment is currently flagged as UNAVAILABLE</p>
              <p class="text-rose-300/80 text-[11px] mt-0.5">
                Customers checking out cannot select GCash right now. Ordering will automatically proceed with Cash on Delivery (COD) or Cash at Counter.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            @click="toggleGcashAvailability(true)"
            :disabled="isTogglingAvailability"
            class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm active:scale-95 disabled:opacity-50">
            <i v-if="isTogglingAvailability" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-check-circle"></i>
            <span>Re-enable GCash Now</span>
          </button>
        </div>

        <!-- 2-Column Grid: Left Edit Controls, Right Live Customer Checkout Preview -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: Controls (lg:col-span-7) -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- GCash Account / Merchant Name -->
            <div>
              <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                GCash Account / Merchant Name <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <i class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input 
                  v-model="gcashForm.gcash_account_name" 
                  type="text" 
                  placeholder="e.g. Jefferson A. or G Shot Teas"
                  class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-medium"
                />
              </div>
              <p class="text-[11px] text-gray-500 mt-1.5">
                The account recipient name shown on the customer checkout screen and verification receipts.
              </p>
            </div>

            <!-- GCash Mobile Number (Clean label, no duplicate number display) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  GCash Mobile Number <span class="text-rose-500">*</span>
                </label>
                <span class="text-[10px] font-semibold text-gray-400 bg-surface-950 px-2 py-0.5 rounded border border-surface-800">
                  Official Merchant Recipient
                </span>
              </div>
              <div class="relative">
                <i class="pi pi-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input 
                  v-model="gcashForm.gcash_account_number" 
                  type="text" 
                  placeholder="0912 345 6789"
                  class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-mono tracking-wider font-bold"
                />
              </div>
              <p class="text-[11px] text-gray-500 mt-1.5">
                Customers can click "Copy Number" to transfer directly from their GCash app.
              </p>
            </div>

            <!-- QR Code Upload & File Selector -->
            <div class="p-5 rounded-2xl bg-surface-950/80 border border-surface-800 space-y-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-white uppercase tracking-wider">Upload GCash QR Code</h4>
                  <p class="text-[11px] text-gray-400 mt-0.5">Upload your store's GCash QR code image anytime (PNG, JPG, WEBP).</p>
                </div>
              </div>

              <!-- Drag / Click Area -->
              <div class="relative">
                <input 
                  type="file" 
                  id="admin_gcash_qr_input" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  @change="handleQrUpload"
                  class="hidden" 
                />
                <label 
                  for="admin_gcash_qr_input"
                  class="w-full p-6 rounded-2xl border-2 border-dashed border-surface-700 hover:border-amber-400 bg-surface-950/60 hover:bg-surface-850 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 group">
                  <div class="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-amber-500/10 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all">
                    <i class="pi pi-cloud-upload"></i>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {{ qrFileName ? 'Selected: ' + qrFileName : 'Click to select or drag a new GCash QR Code' }}
                    </p>
                    <p class="text-[11px] text-gray-400 mt-1">
                      High-resolution PNG, JPG, or WEBP (Automatically optimized & compressed)
                    </p>
                  </div>
                </label>
              </div>

              <!-- Quick QR Action Buttons -->
              <div class="flex flex-wrap items-center gap-2.5 pt-1">
                <button 
                  v-if="hasCustomQr"
                  type="button" 
                  @click="resetToDefaultQr"
                  class="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95">
                  <i class="pi pi-trash text-xs"></i>
                  <span>Remove Custom QR (Use Default)</span>
                </button>

                <a 
                  :href="activeQrPreview" 
                  download="gshot-gcash-qr.png"
                  class="px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95">
                  <i class="pi pi-download text-xs"></i>
                  <span>Download Current QR</span>
                </a>
              </div>
            </div>

            <!-- Action Buttons: Save GCash Settings & Flag Unavailable -->
            <div class="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <button 
                type="button"
                @click="saveGcashSettings"
                :disabled="isSavingGcash || isTogglingAvailability"
                class="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50">
                <i v-if="isSavingGcash" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-check"></i>
                <span>Save GCash Payment Settings</span>
              </button>

              <!-- Button where the user can flag GCash unavailable / available -->
              <button 
                type="button"
                @click="toggleGcashAvailability()"
                :disabled="isTogglingAvailability || isSavingGcash"
                class="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shadow-sm"
                :class="isGcashAvailable 
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/40 hover:border-rose-500/60 shadow-rose-500/10' 
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:border-emerald-500/60 shadow-emerald-500/10'">
                <i v-if="isTogglingAvailability" class="pi pi-spin pi-spinner"></i>
                <i v-else :class="isGcashAvailable ? 'pi pi-ban' : 'pi pi-check-circle'"></i>
                <span>{{ isGcashAvailable ? 'Flag as Unavailable' : 'Flag as Available' }}</span>
              </button>
            </div>

          </div>

          <!-- Right Column: Live Customer Checkout Preview (lg:col-span-5) -->
          <div class="lg:col-span-5 bg-surface-950 rounded-2xl border border-surface-750 p-5 space-y-4 shadow-xl">
            <div class="flex items-center justify-between pb-3 border-b border-surface-800">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="isGcashAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Checkout Preview</span>
                <span v-if="!isGcashAvailable" class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Unavailable
                </span>
              </div>
              <span class="text-[10px] text-gray-400 font-mono">Customer Perspective</span>
            </div>

            <!-- Sleek Authentic GCash Checkout Mockup Card -->
            <div class="rounded-2xl bg-surface-900 border overflow-hidden shadow-lg space-y-0 transition-all relative"
              :class="isGcashAvailable ? 'border-surface-700/80' : 'border-rose-500/40 opacity-90'">
              
              <!-- GCash Flagged Unavailable Overlay Banner in Preview -->
              <div v-if="!isGcashAvailable" class="bg-rose-600 text-white px-3 py-1.5 text-center text-xs font-extrabold flex items-center justify-center gap-1.5 shadow">
                <i class="pi pi-ban text-xs"></i>
                <span>GCash Payment Unavailable at Checkout</span>
              </div>
              
              <!-- GCash Branded Top Bar -->
              <div class="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 p-3.5 text-white flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-white text-blue-700 font-black text-xs flex items-center justify-center shadow">
                    G
                  </div>
                  <div>
                    <p class="text-[10px] font-extrabold uppercase tracking-widest text-sky-100">Official Merchant</p>
                    <p class="text-xs font-black tracking-wide">GCash QR Pay</p>
                  </div>
                </div>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm flex items-center gap-1 border border-white/20">
                  <i class="pi pi-check-circle text-[9px]"></i>
                  <span>Verified</span>
                </span>
              </div>

              <!-- Content Area -->
              <div class="p-4 space-y-4">
                
                <!-- Merchant Account & Number -->
                <div class="p-3 rounded-xl bg-surface-950 border border-surface-800/80 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Account Recipient</p>
                    <p class="text-xs font-bold text-white truncate">
                      {{ gcashForm.gcash_account_name || 'Jefferson A. (G Shot Teas)' }}
                    </p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mobile No.</p>
                    <p class="text-xs font-black text-amber-400 font-mono tracking-wider">
                      {{ gcashForm.gcash_account_number || '0912 345 6789' }}
                    </p>
                  </div>
                </div>

                <!-- The QR Code Image Container with Scanner Guides -->
                <div class="text-center space-y-2">
                  <div class="relative w-48 h-48 mx-auto rounded-2xl bg-white p-3 border border-gray-200 shadow-xl flex items-center justify-center overflow-hidden group">
                    <!-- Scanner Corner Brackets -->
                    <span class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-600 rounded-tl pointer-events-none"></span>
                    <span class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-600 rounded-tr pointer-events-none"></span>
                    <span class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-600 rounded-bl pointer-events-none"></span>
                    <span class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-600 rounded-br pointer-events-none"></span>

                    <img 
                      :src="activeQrPreview" 
                      alt="GCash QR Code" 
                      class="w-full h-full object-contain select-none transition-all"
                      :class="!isGcashAvailable ? 'grayscale opacity-30 blur-[1px]' : ''"
                      @error="(e) => { e.target.src = '/assets/gcash-qr-default.png'; }"
                    />

                    <!-- Unavailable Watermark Overlay -->
                    <div v-if="!isGcashAvailable" class="absolute inset-0 flex flex-col items-center justify-center p-3 bg-black/40 backdrop-blur-[1px]">
                      <span class="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <i class="pi pi-ban text-[10px]"></i> Unavailable
                      </span>
                    </div>
                  </div>
                  <p class="text-[11px] font-semibold text-gray-400 flex items-center justify-center gap-1.5">
                    <i class="pi" :class="isGcashAvailable ? 'pi-camera text-sky-400' : 'pi-ban text-rose-400 text-xs'"></i>
                    <span>{{ isGcashAvailable ? 'Scan with GCash app to transfer' : 'QR Scan Temporarily Paused' }}</span>
                  </p>
                </div>

                <!-- Verification Requirements -->
                <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 space-y-1.5 text-[11px]">
                  <p class="font-extrabold text-gray-200 flex items-center gap-1.5">
                    <i class="pi pi-shield text-xs text-yellow-400"></i>
                    <span>Customer Requirements upon Order:</span>
                  </p>
                  <div class="text-[10px] text-gray-300 space-y-1 pl-4">
                    <p class="flex items-center gap-1.5">
                      <span class="text-emerald-400 font-bold">✓</span>
                      <span>1. GCash Reference Number (9–13 digits)</span>
                      <span class="text-rose-400">*</span>
                    </p>
                    <p class="flex items-center gap-1.5">
                      <span class="text-emerald-400 font-bold">✓</span>
                      <span>2. Proof of Payment (Screenshot upload)</span>
                      <span class="text-rose-400">*</span>
                    </p>
                  </div>
                </div>

              </div>

            </div>

            <p class="text-[11px] text-center" :class="isGcashAvailable ? 'text-gray-500' : 'text-rose-400/90 font-medium'">
              {{ isGcashAvailable ? 'Changes saved here update immediately across the customer checkout view.' : 'GCash is flagged unavailable: customers will be guided to pay via Cash upon checkout.' }}
            </p>
          </div>

        </div>

      </div>

      <!-- MAIN SECTION: Customer Order Availability & Area Notice (Staff, Admin, Super Admin) -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-6">
        
        <!-- Ambient subtle accent glow -->
        <div class="absolute -top-24 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Section Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <i class="pi pi-map-marker"></i>
            </div>
            <div>
              <h3 class="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>Customer Order Availability & Area Notice</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Customer & Checkout Banner
                </span>
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Configure the coverage note visible to customers on the landing page, menu, and checkout page.
              </p>
            </div>
          </div>

          <!-- Badges & Role permissions -->
          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <span v-if="areaNoteForm.order_area_note_enabled" class="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Notice Active</span>
            </span>
            <span v-else class="px-3 py-1.5 rounded-full text-xs font-bold bg-surface-800 text-gray-400 border border-surface-700 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-gray-500"></span>
              <span>Notice Hidden</span>
            </span>

            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <i class="pi pi-users text-[10px] mr-1"></i>Staff, Admin & Super Admin
            </span>
          </div>
        </div>

        <!-- Toggle Row -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-950/70 border border-surface-800">
          <div class="space-y-0.5">
            <h4 class="text-sm font-extrabold text-white flex items-center gap-2">
              <i class="pi pi-eye text-amber-400"></i>
              <span>Display Notice on Storefront & Checkout</span>
            </h4>
            <p class="text-xs text-gray-400">
              When enabled, a prominent notice alert is displayed on the Customer landing page, menu view, and checkout page.
            </p>
          </div>

          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              v-model="areaNoteForm.order_area_note_enabled" 
              class="sr-only peer"
            />
            <div class="w-12 h-6 bg-surface-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            <span class="ml-3 text-xs font-bold text-gray-300">
              {{ areaNoteForm.order_area_note_enabled ? 'Active' : 'Disabled' }}
            </span>
          </label>
        </div>

        <!-- Note Text Input -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Notice Text Message <span class="text-amber-400">*</span>
            </label>
            <span class="text-[11px] text-gray-500 font-mono">
              {{ areaNoteForm.order_area_note.length }} chars
            </span>
          </div>

          <textarea 
            v-model="areaNoteForm.order_area_note" 
            rows="2" 
            placeholder="Orders are only available in Santa Rosa bayan."
            class="w-full px-4 py-3 rounded-2xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-medium resize-none shadow-inner"
          ></textarea>
        </div>

        <!-- Live Customer Preview Box -->
        <div class="p-4 sm:p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-desktop text-amber-400"></i>
              <span>Live Customer Storefront & Checkout Preview</span>
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-surface-800 text-gray-400 border border-surface-700">Real-time</span>
          </div>

          <!-- Preview on Customer Page -->
          <div class="space-y-2">
            <p class="text-[10px] uppercase font-bold text-gray-500">How it looks on Customer Landing & Menu:</p>
            <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold backdrop-blur-md">
              <span class="flex h-2 w-2 relative shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <i class="pi pi-map-marker text-amber-400 text-xs"></i>
              <span>{{ areaNoteForm.order_area_note || 'Orders are only available in Santa Rosa bayan.' }}</span>
            </div>
          </div>

          <!-- Preview on Checkout Page -->
          <div class="space-y-2 pt-2 border-t border-surface-800">
            <p class="text-[10px] uppercase font-bold text-gray-500">How it looks on Checkout Page:</p>
            <div class="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
              <div class="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center text-sm font-black shrink-0">
                <i class="pi pi-map-marker"></i>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase text-amber-300">Order Availability Notice</p>
                <p class="text-sm font-bold text-white mt-0.5">{{ areaNoteForm.order_area_note || 'Orders are only available in Santa Rosa bayan.' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="pt-2 flex items-center gap-3">
          <button 
            type="button"
            @click="saveAreaNoteSettings"
            :disabled="isSavingAreaNote"
            class="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50">
            <i v-if="isSavingAreaNote" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-save"></i>
            <span>Save Order Availability Notice</span>
          </button>
        </div>

      </div>

      <!-- MAIN SECTION 2: General Store & Operations Settings -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-surface-750 shadow-xl space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-base shrink-0">
              <i class="pi pi-sliders-h"></i>
            </div>
            <div>
              <h3 class="text-lg font-black text-white">General Store & Operations Preferences</h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Store contact info, physical address, operating schedule, and default delivery fee.
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Store Name -->
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Store Name
            </label>
            <div class="relative">
              <i class="pi pi-building absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <input 
                v-model="storeForm.store_name" 
                type="text" 
                class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-medium"
              />
            </div>
          </div>

          <!-- Store Tagline -->
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Store Tagline
            </label>
            <div class="relative">
              <i class="pi pi-comment absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <input 
                v-model="storeForm.store_tagline" 
                type="text" 
                class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-medium"
              />
            </div>
          </div>

          <!-- Delivery Fee -->
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Default Delivery Fee (₱)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 font-bold font-mono text-sm">₱</span>
              <input 
                v-model="storeForm.delivery_fee" 
                type="number" 
                step="5"
                class="w-full pl-9 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-mono font-bold"
              />
            </div>
          </div>

          <!-- Store Contact Phone -->
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Store Contact Phone
            </label>
            <div class="relative">
              <i class="pi pi-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <input 
                v-model="storeForm.store_phone" 
                type="text" 
                class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-mono"
              />
            </div>
          </div>

          <!-- Store Email -->
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Store Email
            </label>
            <div class="relative">
              <i class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <input 
                v-model="storeForm.store_email" 
                type="email" 
                class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-medium"
              />
            </div>
          </div>

          <!-- Business Operating Hours -->
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Operating Hours
            </label>
            <div class="relative">
              <i class="pi pi-clock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <input 
                v-model="storeForm.business_hours" 
                type="text" 
                class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-medium"
              />
            </div>
          </div>

          <!-- Store Address (Full Row) -->
          <div class="sm:col-span-2 lg:col-span-3">
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Store Physical Address
            </label>
            <div class="relative">
              <i class="pi pi-map-marker absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <input 
                v-model="storeForm.store_address" 
                type="text" 
                class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all font-medium"
              />
            </div>
          </div>

        </div>

        <div class="pt-2">
          <button 
            type="button"
            @click="saveGeneralSettings"
            :disabled="isSavingStore"
            class="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50">
            <i v-if="isSavingStore" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-save"></i>
            <span>Save Store Preferences</span>
          </button>
        </div>

      </div>

      <!-- MAIN SECTION 3: Super Admin Emergency Website Shutdown & Maintenance Controls -->
      <div 
        v-if="store.isSuperAdmin"
        class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-purple-500/40 shadow-2xl relative overflow-hidden space-y-6">
        
        <!-- Ambient Purple Glow -->
        <div class="absolute -top-24 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Section Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-800">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xl shrink-0">
              <i class="pi pi-power-off"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-white">Emergency Website Shutdown & Maintenance</h3>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Super Admin Exclusive
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">
                Shut down the entire customer-facing website and display the "Website Under Maintenance" page to visitors.
              </p>
            </div>
          </div>

          <!-- Active Website Status Pill -->
          <div class="flex items-center gap-2">
            <span v-if="maintForm.maintenance_mode" class="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>WEBSITE SHUTDOWN (Active)</span>
            </span>
            <span v-else class="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Website Live Online</span>
            </span>
          </div>
        </div>

        <!-- Form Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left Col: Toggle Card & Settings -->
          <div class="lg:col-span-7 space-y-5 text-xs">
            
            <!-- Master Toggle Switch Box -->
            <div class="p-5 rounded-2xl bg-surface-950/80 border border-surface-800 flex items-center justify-between gap-4 shadow-inner">
              <div>
                <h4 class="font-extrabold text-white text-sm">Website Operational Status</h4>
                <p class="text-[11px] text-gray-400 mt-1 max-w-md">
                  Toggle ON to immediately shut down public access and display the Maintenance Page to all customers. Toggle OFF to restore customer ordering.
                </p>
              </div>

              <button 
                type="button"
                @click="maintForm.maintenance_mode = !maintForm.maintenance_mode"
                class="relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                :class="maintForm.maintenance_mode ? 'bg-rose-600' : 'bg-emerald-600'">
                <span 
                  class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                  :class="maintForm.maintenance_mode ? 'translate-x-8' : 'translate-x-0'"></span>
              </button>
            </div>

            <!-- Maintenance Headline / Title -->
            <div>
              <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Maintenance Headline / Title
              </label>
              <input 
                v-model="maintForm.maintenance_title" 
                type="text" 
                placeholder="e.g. Website Under Scheduled Maintenance"
                class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-medium"
              />
              <p class="text-[11px] text-gray-500 mt-1">
                Main headline displayed on the customer maintenance screen.
              </p>
            </div>

            <!-- Detailed Customer Notice Message -->
            <div>
              <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Detailed Customer Notice Message
              </label>
              <textarea 
                v-model="maintForm.maintenance_message" 
                rows="3"
                placeholder="Explain the maintenance reason..."
                class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-medium leading-relaxed resize-none"
              ></textarea>
              <p class="text-[11px] text-gray-500 mt-1">
                Detailed explanation for why the website is currently offline.
              </p>
            </div>

            <!-- Estimated Back Online Time -->
            <div>
              <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Estimated Back Online Schedule (Optional)
              </label>
              <input 
                v-model="maintForm.maintenance_until" 
                type="text" 
                placeholder="e.g. Today at 4:00 PM or Resuming at 1:00 PM"
                class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-medium"
              />
            </div>

            <!-- Action Buttons -->
            <div class="pt-2 flex items-center gap-3">
              <button 
                type="button"
                @click="saveMaintenanceSettings"
                :disabled="isSavingMaint"
                class="px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
                :class="maintForm.maintenance_mode ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'">
                <i v-if="isSavingMaint" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-save"></i>
                <span>{{ maintForm.maintenance_mode ? 'Apply Website Shutdown' : 'Save Maintenance Settings' }}</span>
              </button>

              <button 
                v-if="maintForm.maintenance_mode"
                type="button"
                @click="restoreWebsiteNow"
                :disabled="isSavingMaint"
                class="px-5 py-2.5 rounded-xl font-black text-xs bg-emerald-500 hover:bg-emerald-400 text-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow">
                <i class="pi pi-check-circle"></i>
                <span>Restore Online Now</span>
              </button>
            </div>

          </div>

          <!-- Right Col: Live Customer Maintenance Screen Preview -->
          <div class="lg:col-span-5 p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-surface-800">
              <div class="flex items-center gap-2 text-xs font-extrabold text-white">
                <i class="pi pi-desktop text-yellow-400"></i>
                <span>Customer View Live Preview</span>
              </div>
              <span class="text-[10px] uppercase font-bold text-gray-500">Preview</span>
            </div>

            <!-- Mini Simulated Maintenance Screen -->
            <div class="p-4 rounded-xl bg-surface-900 border border-surface-700/80 text-center space-y-3">
              <div class="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 mx-auto flex items-center justify-center font-black text-yellow-400 text-base shadow">
                G'
              </div>
              <span class="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Website Under Maintenance
              </span>
              <h5 class="text-xs font-black text-white line-clamp-1">
                {{ maintForm.maintenance_title || 'Website Under Scheduled Maintenance' }}
              </h5>
              <p class="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">
                {{ maintForm.maintenance_message || 'G Shot Teas is currently undergoing essential system updates...' }}
              </p>
              <div v-if="maintForm.maintenance_until" class="text-[10px] font-bold text-amber-300 bg-amber-500/10 rounded-lg py-1 px-2 border border-amber-500/20">
                ⏰ Back Online: {{ maintForm.maintenance_until }}
              </div>
            </div>

            <p class="text-[11px] text-gray-500 text-center">
              This preview matches what all public visitors see when Website Shutdown is active.
            </p>
          </div>

        </div>

      </div>

    </div>

      <!-- MAIN SECTION 4: Loyverse Advanced Inventory & POS Integration -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-6">
        
        <!-- Ambient subtle emerald glow -->
        <div class="absolute -top-24 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Section Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-800">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20 shrink-0">
              <i class="pi pi-box"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-lg font-black text-white">Loyverse Advanced Inventory Integration</h3>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Connected: {{ loyverseInfo.store_name }}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">
                Two-way synchronization for Raw Ingredients, Composite Recipes (Productions), Stock Adjustments, Inventory Counts & POS Sales.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <div class="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>2-Way Auto-Sync Active</span>
            </div>
          </div>
        </div>

        <!-- Capability Badges & Active Status -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="p-4 rounded-2xl bg-surface-950/80 border border-surface-800">
            <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Raw Ingredients</p>
            <p class="text-xl font-black text-white mt-1">{{ store.ingredients.length }} Tracked</p>
            <p class="text-[10px] text-emerald-400 mt-0.5"><i class="pi pi-check"></i> Stock tracking enabled</p>
          </div>
          <div class="p-4 rounded-2xl bg-surface-950/80 border border-surface-800">
            <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Composite Recipes</p>
            <p class="text-xl font-black text-white mt-1">{{ store.products.length }} Linked</p>
            <p class="text-[10px] text-purple-400 mt-0.5"><i class="pi pi-cog"></i> Productions ready</p>
          </div>
          <div class="p-4 rounded-2xl bg-surface-950/80 border border-surface-800">
            <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Stock Adjustments</p>
            <p class="text-xl font-black text-white mt-1">2-Way Sync</p>
            <p class="text-[10px] text-sky-400 mt-0.5"><i class="pi pi-arrows-h"></i> Live webhook & poll</p>
          </div>
          <div class="p-4 rounded-2xl bg-surface-950/80 border border-surface-800">
            <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Purchase Orders</p>
            <p class="text-xl font-black text-white mt-1">Active</p>
            <p class="text-[10px] text-amber-400 mt-0.5"><i class="pi pi-file-edit"></i> Supplier restock ready</p>
          </div>
        </div>

        <!-- Detailed Sync Control Panel -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left Col: Actions (lg:col-span-7) -->
          <div class="lg:col-span-7 space-y-4">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">Automated Synchronization</h4>
            
            <div class="p-4 rounded-2xl bg-surface-950 border border-emerald-500/30 space-y-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-xs font-bold text-white uppercase tracking-wider">Background Real-Time Sync Active</span>
              </div>
              <p class="text-xs text-neutral-400">
                Menu items, POS sales, kitchen raw ingredients, and stock levels are continuously synchronized between Loyverse POS and your website in the background via live webhooks and scheduled worker. No manual clicks required.
              </p>
            </div>

            <!-- Webhook Registration Bar -->
            <div class="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <i class="pi pi-bolt text-amber-400"></i> Real-time Webhook Endpoint
                </span>
                <button 
                  type="button"
                  @click="handleRegisterWebhook"
                  :disabled="isRegisteringWebhook"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-surface-800 hover:bg-surface-750 text-white border border-surface-700 transition-colors flex items-center gap-1">
                  <i class="pi" :class="isRegisteringWebhook ? 'pi-spin pi-spinner' : 'pi-check'"></i>
                  <span>{{ isRegisteringWebhook ? 'Registering...' : 'Auto-Register with Loyverse' }}</span>
                </button>
              </div>

              <div class="flex items-center gap-2">
                <input 
                  readonly 
                  :value="loyverseWebhookUrl" 
                  class="w-full px-3 py-2 rounded-xl bg-surface-900 border border-surface-750 text-xs font-mono text-neutral-400 focus:outline-none select-all"
                />
                <button 
                  type="button"
                  @click="copyWebhookUrl"
                  class="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-neutral-200 border border-surface-700 text-xs font-bold flex items-center gap-1 shrink-0">
                  <i class="pi pi-copy"></i>
                  <span>Copy</span>
                </button>
              </div>
              <p class="text-[10px] text-neutral-500">
                Receives both <code class="text-neutral-400">receipts.update</code> and <code class="text-neutral-400">inventory_levels.update</code> events instantly.
              </p>
            </div>
          </div>

          <!-- Right Col: Loyverse Account Summary (lg:col-span-5) -->
          <div class="lg:col-span-5 p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-3.5 text-xs">
            <div class="flex items-center justify-between pb-2 border-b border-surface-850">
              <span class="font-bold text-white">Loyverse Connection Info</span>
              <span class="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400">ACTIVE</span>
            </div>

            <div class="space-y-2 text-neutral-400">
              <div class="flex justify-between">
                <span>Store Name:</span>
                <span class="font-bold text-white">{{ loyverseInfo.store_name }}</span>
              </div>
              <div class="flex justify-between">
                <span>Store ID:</span>
                <span class="font-mono text-[10px] text-neutral-300 truncate max-w-[200px]" :title="loyverseInfo.store_id">{{ loyverseInfo.store_id }}</span>
              </div>
              <div class="flex justify-between">
                <span>Catalog Items in Loyverse:</span>
                <span class="font-bold text-white">{{ loyverseInfo.items_count }}</span>
              </div>
              <div class="flex justify-between">
                <span>Inventory Valuation:</span>
                <span class="font-bold text-emerald-400">Enabled</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-surface-900/90 border border-surface-800 text-[11px] text-neutral-400 space-y-1">
              <p class="font-bold text-amber-300 flex items-center gap-1">
                <i class="pi pi-lightbulb"></i> How to use in Loyverse Back Office:
              </p>
              <p>• <strong>Purchase Orders:</strong> Go to Inventory &gt; Purchase orders &gt; Add Purchase Order to restock raw ingredients from suppliers.</p>
              <p>• <strong>Stock Adjustments:</strong> Go to Inventory &gt; Stock adjustments to record waste or damaged stock.</p>
              <p>• <strong>Productions:</strong> Go to Inventory &gt; Productions to prepare composite items from component ingredients.</p>
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

// G Shot Teas — Store & GCash Payment Settings (Admin & Super Admin)
export default {
  name: 'AdminSettingsTab',
  setup() {
    const store = useGShotStore();
    const isLoading = Vue.ref(false);
    const isSavingGcash = Vue.ref(false);
    const isSavingStore = Vue.ref(false);
    const qrFileName = Vue.ref('');

    const defaultQrPath = '/assets/gcash-qr-default.png';

    const isTogglingAvailability = Vue.ref(false);
    const isGcashAvailable = Vue.computed(() => store.isGcashAvailable);

    // GCash specific form state
    const gcashForm = Vue.reactive({
      gcash_account_name: store.settings?.gcash_account_name || 'Jefferson A.',
      gcash_account_number: store.settings?.gcash_account_number || '0912 345 6789',
      gcash_qr_code: store.settings?.gcash_qr_code || '',
      gcash_available: store.isGcashAvailable,
    });

    // Customer order availability & area note form state (Staff, Admin, Super Admin)
    const isSavingAreaNote = Vue.ref(false);
    const areaNoteForm = Vue.reactive({
      order_area_note: store.orderAreaNote || 'Orders are only available in Santa Rosa bayan.',
      order_area_note_enabled: store.isOrderAreaNoteEnabled,
    });

    const saveAreaNoteSettings = async () => {
      if (!areaNoteForm.order_area_note.trim()) {
        store.notify('Please enter notice text or turn off the notice toggle.', 'error');
        return;
      }
      isSavingAreaNote.value = true;
      try {
        await store.updateStoreSettings({
          order_area_note: areaNoteForm.order_area_note.trim(),
          order_area_note_enabled: areaNoteForm.order_area_note_enabled ? 'true' : 'false',
        });
        store.notify('Customer order availability notice saved and live on customer & checkout pages!', 'success');
      } catch (err) {
        // Handled by store
      } finally {
        isSavingAreaNote.value = false;
      }
    };

    // General store settings form state
    const storeForm = Vue.reactive({
      store_name: store.settings?.store_name || 'G Shot Teas',
      store_tagline: store.settings?.store_tagline || 'Satisfy Yourself',
      store_address: store.settings?.store_address || 'Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna',
      store_phone: store.settings?.store_phone || '+63 912 345 6789',
      store_email: store.settings?.store_email || 'gshotteas2@gmail.com',
      delivery_fee: store.settings?.delivery_fee || '40.00',
      business_hours: store.settings?.business_hours || 'Monday - Saturday: 9:00 AM - 10:00 PM',
    });

    // Watch for store settings updates
    Vue.watch(() => store.settings, (newSettings) => {
      if (newSettings) {
        if (newSettings.gcash_account_name !== undefined) gcashForm.gcash_account_name = newSettings.gcash_account_name;
        if (newSettings.gcash_account_number !== undefined) gcashForm.gcash_account_number = newSettings.gcash_account_number;
        if (newSettings.gcash_qr_code !== undefined) gcashForm.gcash_qr_code = newSettings.gcash_qr_code;
        if (newSettings.gcash_available !== undefined) {
          gcashForm.gcash_available = newSettings.gcash_available === 'true' || newSettings.gcash_available === true || newSettings.gcash_available === '1' || newSettings.gcash_available === 1;
        }

        if (newSettings.store_name !== undefined) storeForm.store_name = newSettings.store_name;
        if (newSettings.store_tagline !== undefined) storeForm.store_tagline = newSettings.store_tagline;
        if (newSettings.store_address !== undefined) storeForm.store_address = newSettings.store_address;
        if (newSettings.store_phone !== undefined) storeForm.store_phone = newSettings.store_phone;
        if (newSettings.store_email !== undefined) storeForm.store_email = newSettings.store_email;
        if (newSettings.delivery_fee !== undefined) storeForm.delivery_fee = newSettings.delivery_fee;
        if (newSettings.business_hours !== undefined) storeForm.business_hours = newSettings.business_hours;

        if (newSettings.order_area_note !== undefined) areaNoteForm.order_area_note = newSettings.order_area_note;
        if (newSettings.order_area_note_enabled !== undefined) {
          areaNoteForm.order_area_note_enabled = newSettings.order_area_note_enabled === 'true' || newSettings.order_area_note_enabled === true;
        }

        maintForm.maintenance_mode = store.isMaintenanceMode;
        maintForm.maintenance_title = store.maintenanceTitle;
        maintForm.maintenance_message = store.maintenanceMessage;
        maintForm.maintenance_until = store.maintenanceUntil;
      }
    }, { deep: true });

    // Super Admin: Website Maintenance & Shutdown State
    const isSavingMaint = Vue.ref(false);
    const maintForm = Vue.reactive({
      maintenance_mode: store.isMaintenanceMode,
      maintenance_title: store.maintenanceTitle,
      maintenance_message: store.maintenanceMessage,
      maintenance_until: store.maintenanceUntil,
    });

    const saveMaintenanceSettings = async () => {
      isSavingMaint.value = true;
      try {
        await store.setMaintenanceMode(maintForm.maintenance_mode, {
          title: maintForm.maintenance_title,
          message: maintForm.maintenance_message,
          until: maintForm.maintenance_until,
        });
      } finally {
        isSavingMaint.value = false;
      }
    };

    const restoreWebsiteNow = async () => {
      if (confirm('Restore Website Online? All customers will immediately regain access to order and view the menu.')) {
        isSavingMaint.value = true;
        try {
          await store.setMaintenanceMode(false);
          maintForm.maintenance_mode = false;
        } finally {
          isSavingMaint.value = false;
        }
      }
    };

    const hasCustomQr = Vue.computed(() => {
      return Boolean(gcashForm.gcash_qr_code && gcashForm.gcash_qr_code.trim().length > 0);
    });

    const activeQrPreview = Vue.computed(() => {
      if (hasCustomQr.value) {
        return gcashForm.gcash_qr_code;
      }
      return defaultQrPath;
    });

    // Client-side canvas compression for QR code uploads
    const compressImage = (file, maxDim = 800, quality = 0.90) => {
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

    const handleQrUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        store.notify('Please select a valid image file (PNG, JPG, WEBP).', 'error');
        return;
      }

      try {
        qrFileName.value = file.name;
        const compressedBase64 = await compressImage(file, 800, 0.90);
        gcashForm.gcash_qr_code = compressedBase64;
        store.notify('QR code loaded in preview! Click "Save GCash Payment Settings" to publish.', 'info');
      } catch (err) {
        console.error('Failed to process QR code file:', err);
        store.notify('Could not process selected image. Please try another file.', 'error');
      }
    };

    const resetToDefaultQr = () => {
      gcashForm.gcash_qr_code = '';
      qrFileName.value = '';
      store.notify('Reverted to default QR code. Click "Save GCash Payment Settings" to apply.', 'info');
    };

    const toggleGcashAvailability = async (targetVal = null) => {
      const nextState = targetVal !== null ? targetVal : !isGcashAvailable.value;
      isTogglingAvailability.value = true;
      try {
        await store.setGcashAvailability(nextState);
        gcashForm.gcash_available = nextState;
      } catch (err) {
        // error notification handled by store
      } finally {
        isTogglingAvailability.value = false;
      }
    };

    const saveGcashSettings = async () => {
      if (!gcashForm.gcash_account_number.trim()) {
        store.notify('Please enter a valid GCash mobile number.', 'error');
        return;
      }

      isSavingGcash.value = true;
      try {
        await store.updateStoreSettings({
          gcash_account_name: gcashForm.gcash_account_name.trim(),
          gcash_account_number: gcashForm.gcash_account_number.trim(),
          gcash_qr_code: gcashForm.gcash_qr_code || '',
          gcash_available: gcashForm.gcash_available ? 'true' : 'false',
        });
        store.notify('GCash QR Code and Payment settings successfully updated and live!', 'success');
      } catch (err) {
        // error notification handled by store.updateStoreSettings
      } finally {
        isSavingGcash.value = false;
      }
    };

    const saveGeneralSettings = async () => {
      isSavingStore.value = true;
      try {
        await store.updateStoreSettings({
          store_name: storeForm.store_name.trim(),
          store_tagline: storeForm.store_tagline.trim(),
          store_address: storeForm.store_address.trim(),
          store_phone: storeForm.store_phone.trim(),
          store_email: storeForm.store_email.trim(),
          delivery_fee: storeForm.delivery_fee,
          business_hours: storeForm.business_hours.trim(),
          order_area_note: areaNoteForm.order_area_note.trim(),
          order_area_note_enabled: areaNoteForm.order_area_note_enabled ? 'true' : 'false',
        });
      } finally {
        isSavingStore.value = false;
      }
    };

    // Loyverse Integration State
    const loyverseConnected = Vue.ref(true);
    const isSyncingLoyverse = Vue.ref(false);
    const isExportingLoyverse = Vue.ref(false);
    const isRegisteringWebhook = Vue.ref(false);
    const loyverseInfo = Vue.reactive({
      store_name: 'GSHOT',
      store_id: 'f8bbd4a6-96c5-48f1-929e-fef388325796',
      items_count: 12,
    });

    const loyverseWebhookUrl = Vue.computed(() => {
      const origin = window.location.origin;
      return origin + '/api/loyverse/webhook';
    });

    const checkLoyverse = async () => {
      try {
        const res = await GST_API.getLoyverseStatus();
        if (res.data?.success) {
          loyverseConnected.value = true;
          if (res.data.active_store) {
            loyverseInfo.store_name = res.data.active_store.name;
            loyverseInfo.store_id = res.data.active_store.id;
          }
          if (res.data.items_count !== undefined) {
            loyverseInfo.items_count = res.data.items_count;
          }
        }
      } catch (err) {
        console.warn('Loyverse status check:', err);
      }
    };

    const handleSyncLoyverse = async () => {
      isSyncingLoyverse.value = true;
      try {
        await store.syncLoyverseSales();
        await checkLoyverse();
      } catch (err) {
        // notification already handled in store
      } finally {
        isSyncingLoyverse.value = false;
      }
    };

    const handleExportMenu = async () => {
      isExportingLoyverse.value = true;
      try {
        await store.exportMenuToLoyverse();
        await checkLoyverse();
      } catch (err) {
        // notification handled in store
      } finally {
        isExportingLoyverse.value = false;
      }
    };

    const isFullSyncing = Vue.ref(false);
    const isPulling = Vue.ref(false);
    const isPushing = Vue.ref(false);

    const handleFullSync = async () => {
      isFullSyncing.value = true;
      try {
        await store.fullLoyverseSync();
        await checkLoyverse();
      } finally {
        isFullSyncing.value = false;
      }
    };

    const handlePullInventory = async () => {
      isPulling.value = true;
      try {
        await store.pullLoyverseInventory();
        await checkLoyverse();
      } finally {
        isPulling.value = false;
      }
    };

    const handlePushInventory = async () => {
      isPushing.value = true;
      try {
        await store.pushLoyverseInventory();
        await checkLoyverse();
      } finally {
        isPushing.value = false;
      }
    };

    const handleRegisterWebhook = async () => {
      isRegisteringWebhook.value = true;
      try {
        const url = loyverseWebhookUrl.value;
        const res = await GST_API.registerLoyverseWebhook(url);
        store.notify('Webhook registered successfully with Loyverse API!', 'success');
      } catch (err) {
        store.notify(err.response?.data?.message || 'Could not register webhook automatically. You can paste the URL into Loyverse Back Office > Settings > Webhooks.', 'info');
      } finally {
        isRegisteringWebhook.value = false;
      }
    };

    const copyWebhookUrl = () => {
      navigator.clipboard.writeText(loyverseWebhookUrl.value);
      store.notify('Webhook URL copied to clipboard!', 'info');
    };

    Vue.onMounted(() => {
      checkLoyverse();
    });

    const reloadSettings = async () => {
      isLoading.value = true;
      try {
        await store.refreshAllData();
        store.notify('Settings refreshed from server.', 'info');
      } finally {
        isLoading.value = false;
      }
    };

    return {
      store,
      isLoading,
      isSavingGcash,
      isSavingStore,
      isPaymongoAvailable,
      isTogglingPaymongo,
      togglePaymongoAvailability,
      isTogglingAvailability,
      isGcashAvailable,
      toggleGcashAvailability,
      qrFileName,
      gcashForm,
      storeForm,
      hasCustomQr,
      activeQrPreview,
      handleQrUpload,
      resetToDefaultQr,
      saveGcashSettings,
      saveGeneralSettings,
      areaNoteForm,
      isSavingAreaNote,
      saveAreaNoteSettings,
      reloadSettings,
      loyverseConnected,
      isSyncingLoyverse,
      isExportingLoyverse,
      isRegisteringWebhook,
      loyverseInfo,
      loyverseWebhookUrl,
      handleSyncLoyverse,
      handleExportMenu,
      isFullSyncing,
      isPulling,
      isPushing,
      handleFullSync,
      handlePullInventory,
      handlePushInventory,
      handleRegisterWebhook,
      copyWebhookUrl,
      maintForm,
      isSavingMaint,
      saveMaintenanceSettings,
      restoreWebsiteNow,
    };
  },
};
</script>
