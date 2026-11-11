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
            Configure your PayMongo payment gateway, order availability notices, and store operations.
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
                Enables customers to pay online directly via PayMongo QR Ph, e-wallets, and online banking.
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

// G Shot Teas — Store & Payment Settings (Admin & Super Admin)
export default {
  name: 'AdminSettingsTab',
  setup() {
    const store = useGShotStore();
    const isLoading = Vue.ref(false);
    const isSavingStore = Vue.ref(false);

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

    const isTogglingPaymongo = Vue.ref(false);
    const isPaymongoAvailable = Vue.computed(() => store.isPaymongoAvailable);

    const togglePaymongoAvailability = async () => {
      isTogglingPaymongo.value = true;
      try {
        await store.setPaymongoAvailability(!store.isPaymongoAvailable);
      } catch (err) {
        // handled in store
      } finally {
        isTogglingPaymongo.value = false;
      }
    };

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
      isSavingStore,
      isPaymongoAvailable,
      isTogglingPaymongo,
      togglePaymongoAvailability,
      storeForm,
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
