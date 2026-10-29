// G Shot Teas — Store & GCash Payment Settings (Admin & Super Admin)
const AdminSettingsTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-800">
        <div>
          <h2 class="text-2xl font-black text-white flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-lg">
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

      <!-- MAIN SECTION 1: GCash Online Payment & Scan-to-Pay Settings -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-sky-500/30 shadow-2xl relative overflow-hidden space-y-6">
        
        <!-- Glow accent in background -->
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Section Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-800">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-black text-sky-400 text-lg">
              G
            </div>
            <div>
              <h3 class="text-lg font-black text-white flex items-center gap-2">
                <span>GCash Payment Configuration</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Online Checkout
                </span>
              </h3>
              <p class="text-xs text-gray-400">
                Customers scan this QR code or send payment to this GCash mobile number upon checkout.
              </p>
            </div>
          </div>

          <!-- Active QR Type Badge -->
          <div class="flex items-center gap-2">
            <span v-if="hasCustomQr" class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Custom Uploaded QR Code Active</span>
            </span>
            <span v-else class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <i class="pi pi-info-circle text-xs"></i>
              <span>Default System QR Active</span>
            </span>
          </div>
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
                  class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors font-medium"
                />
              </div>
              <p class="text-[11px] text-gray-500 mt-1.5">
                The account recipient name shown on the customer checkout screen and verification receipts.
              </p>
            </div>

            <!-- GCash Mobile Number -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  GCash Mobile Number <span class="text-rose-500">*</span>
                </label>
                <span class="text-[11px] font-mono text-sky-400 font-bold">
                  {{ gcashForm.gcash_account_number || 'None' }}
                </span>
              </div>
              <div class="relative">
                <i class="pi pi-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input 
                  v-model="gcashForm.gcash_account_number" 
                  type="text" 
                  placeholder="0912 345 6789"
                  class="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors font-mono tracking-wider font-bold"
                />
              </div>
              <p class="text-[11px] text-gray-500 mt-1.5">
                Customers can click "Copy Number" to transfer directly from their GCash app.
              </p>
            </div>

            <!-- QR Code Upload & File Selector -->
            <div class="p-5 rounded-2xl bg-surface-950/70 border border-surface-800 space-y-4">
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
                  class="w-full p-6 rounded-2xl border-2 border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-950/15 hover:bg-sky-950/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 group">
                  <div class="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    <i class="pi pi-cloud-upload"></i>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-white group-hover:text-sky-300">
                      {{ qrFileName ? 'Change Selected QR: ' + qrFileName : 'Click to select or upload a new GCash QR Code' }}
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
                  class="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="pi pi-trash text-xs"></i>
                  <span>Remove Custom QR (Use Default)</span>
                </button>

                <a 
                  :href="activeQrPreview" 
                  download="gshot-gcash-qr.png"
                  class="px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700 text-xs font-bold transition-all inline-flex items-center gap-1.5">
                  <i class="pi pi-download text-xs"></i>
                  <span>Download Current QR</span>
                </a>
              </div>
            </div>

            <!-- Save GCash Settings Button -->
            <div class="pt-2">
              <button 
                type="button"
                @click="saveGcashSettings"
                :disabled="isSavingGcash"
                class="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-xl shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                <i v-if="isSavingGcash" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-check"></i>
                <span>Save GCash Payment Settings</span>
              </button>
            </div>

          </div>

          <!-- Right Column: Live Customer Checkout Preview (lg:col-span-5) -->
          <div class="lg:col-span-5 bg-surface-950 rounded-2xl border border-sky-500/40 p-5 space-y-4 shadow-xl">
            <div class="flex items-center justify-between pb-3 border-b border-surface-800">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-xs font-black uppercase tracking-wider text-sky-400">Checkout Preview</span>
              </div>
              <span class="text-[10px] text-gray-400 font-mono">Customer Perspective</span>
            </div>

            <!-- The Mini Checkout Card -->
            <div class="p-4 rounded-2xl bg-sky-950/40 border border-sky-600/50 space-y-3.5">
              
              <!-- Card Header -->
              <div class="flex items-center justify-between pb-2.5 border-b border-sky-800/40">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center font-black text-sky-400 text-xs">
                    G
                  </div>
                  <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-sky-300">Official Store GCash</p>
                    <p class="text-xs font-black text-white font-mono">
                      {{ gcashForm.gcash_account_number || '0912 345 6789' }}
                    </p>
                  </div>
                </div>
                <span class="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                  {{ gcashForm.gcash_account_name || 'Jefferson A.' }}
                </span>
              </div>

              <!-- The QR Code Image Box -->
              <div class="text-center space-y-2">
                <div class="w-44 h-44 mx-auto rounded-xl bg-white p-2 border border-sky-300 shadow-md flex items-center justify-center overflow-hidden">
                  <img 
                    :src="activeQrPreview" 
                    alt="GCash QR Code Preview" 
                    class="w-full h-full object-contain"
                  />
                </div>
                <p class="text-[10px] font-semibold text-sky-300 flex items-center justify-center gap-1">
                  <i class="pi pi-camera text-[9px]"></i>
                  <span>Customers scan this with GCash app</span>
                </p>
              </div>

              <!-- Both Required Notice -->
              <div class="p-2.5 rounded-xl bg-sky-900/40 border border-sky-500/30 space-y-1 text-[11px]">
                <p class="font-bold text-sky-200 flex items-center gap-1">
                  <i class="pi pi-shield text-xs text-sky-400"></i>
                  <span>Strict Requirements Enforced:</span>
                </p>
                <div class="text-[10px] text-gray-300 space-y-0.5 pl-4">
                  <p>✓ 1. Reference Number (9-13 digits) <span class="text-rose-400">*</span></p>
                  <p>✓ 2. GCash Receipt Screenshot <span class="text-rose-400">*</span></p>
                </div>
              </div>

            </div>

            <p class="text-[11px] text-center text-gray-500">
              Changes saved here update immediately across the customer checkout view.
            </p>
          </div>

        </div>

      </div>

      <!-- MAIN SECTION 2: General Store & Operations Settings -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-surface-800 shadow-xl space-y-6">
        
        <div class="pb-4 border-b border-surface-800">
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <i class="pi pi-sliders-h text-brand-400"></i>
            <span>General Store & Operations Preferences</span>
          </h3>
          <p class="text-xs text-gray-400 mt-1">
            Store contact info, physical address, operating schedule, and default delivery fee.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Store Name -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Store Name
            </label>
            <input 
              v-model="storeForm.store_name" 
              type="text" 
              class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <!-- Store Tagline -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Store Tagline
            </label>
            <input 
              v-model="storeForm.store_tagline" 
              type="text" 
              class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <!-- Delivery Fee -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Delivery Fee (₱)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
              <input 
                v-model="storeForm.delivery_fee" 
                type="number" 
                step="5"
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-brand-500 font-mono font-bold"
              />
            </div>
          </div>

          <!-- Store Contact Phone -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Store Contact Phone
            </label>
            <input 
              v-model="storeForm.store_phone" 
              type="text" 
              class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <!-- Store Email -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Store Email
            </label>
            <input 
              v-model="storeForm.store_email" 
              type="email" 
              class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <!-- Business Operating Hours -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Operating Hours
            </label>
            <input 
              v-model="storeForm.business_hours" 
              type="text" 
              class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <!-- Store Address (Full Row) -->
          <div class="sm:col-span-2 lg:col-span-3">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Store Physical Address
            </label>
            <input 
              v-model="storeForm.store_address" 
              type="text" 
              class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

        </div>

        <div class="pt-2">
          <button 
            type="button"
            @click="saveGeneralSettings"
            :disabled="isSavingStore"
            class="px-6 py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
            <i v-if="isSavingStore" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-save"></i>
            <span>Save Store Preferences</span>
          </button>
        </div>

      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const isLoading = Vue.ref(false);
    const isSavingGcash = Vue.ref(false);
    const isSavingStore = Vue.ref(false);
    const qrFileName = Vue.ref('');

    const defaultQrPath = './assets/gcash-qr-default.png';

    // GCash specific form state
    const gcashForm = Vue.reactive({
      gcash_account_name: store.settings?.gcash_account_name || 'Jefferson A.',
      gcash_account_number: store.settings?.gcash_account_number || '0912 345 6789',
      gcash_qr_code: store.settings?.gcash_qr_code || '',
    });

    // General store settings form state
    const storeForm = Vue.reactive({
      store_name: store.settings?.store_name || 'G Shot Teas',
      store_tagline: store.settings?.store_tagline || 'Satisfy Yourself',
      store_address: store.settings?.store_address || 'Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna',
      store_phone: store.settings?.store_phone || '+63 912 345 6789',
      store_email: store.settings?.store_email || 'info@gshotcafe.com',
      delivery_fee: store.settings?.delivery_fee || '40.00',
      business_hours: store.settings?.business_hours || 'Monday - Saturday: 9:00 AM - 10:00 PM',
    });

    // Watch for store settings updates
    Vue.watch(() => store.settings, (newSettings) => {
      if (newSettings) {
        if (newSettings.gcash_account_name !== undefined) gcashForm.gcash_account_name = newSettings.gcash_account_name;
        if (newSettings.gcash_account_number !== undefined) gcashForm.gcash_account_number = newSettings.gcash_account_number;
        if (newSettings.gcash_qr_code !== undefined) gcashForm.gcash_qr_code = newSettings.gcash_qr_code;

        if (newSettings.store_name !== undefined) storeForm.store_name = newSettings.store_name;
        if (newSettings.store_tagline !== undefined) storeForm.store_tagline = newSettings.store_tagline;
        if (newSettings.store_address !== undefined) storeForm.store_address = newSettings.store_address;
        if (newSettings.store_phone !== undefined) storeForm.store_phone = newSettings.store_phone;
        if (newSettings.store_email !== undefined) storeForm.store_email = newSettings.store_email;
        if (newSettings.delivery_fee !== undefined) storeForm.delivery_fee = newSettings.delivery_fee;
        if (newSettings.business_hours !== undefined) storeForm.business_hours = newSettings.business_hours;
      }
    }, { deep: true });

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
        });
        store.notify('GCash QR Code and Payment Number successfully updated and live!', 'success');
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
        });
      } finally {
        isSavingStore.value = false;
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
      isSavingGcash,
      isSavingStore,
      qrFileName,
      gcashForm,
      storeForm,
      hasCustomQr,
      activeQrPreview,
      handleQrUpload,
      resetToDefaultQr,
      saveGcashSettings,
      saveGeneralSettings,
      reloadSettings,
    };
  },
};
