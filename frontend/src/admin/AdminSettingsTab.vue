<template>
<div class="space-y-6 sm:space-y-8">
  <!-- Header -->
  <div class="flex items-center justify-between gap-3 pb-3.5 border-b border-surface-800">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
        <i class="pi pi-sliders-h text-amber-400 text-base"></i>
      </div>
      <div>
        <h2 class="text-lg sm:text-xl font-bold text-white">Store & Payment Settings</h2>
        <p class="text-xs text-gray-400">Payments, availability notice & store info</p>
      </div>
    </div>
    <button
      @click="reloadSettings"
      :disabled="isLoading"
      class="px-3 py-2 rounded-xl bg-surface-900 hover:bg-amber-500/10 text-gray-300 hover:text-white text-xs font-semibold border border-surface-700 hover:border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
      <i class="pi" :class="isLoading ? 'pi-spin pi-spinner text-amber-400' : 'pi-refresh text-amber-400/80'"></i>
      <span class="hidden sm:inline">Refresh</span>
    </button>
  </div>



  <!-- Event Booking Downpayment & Payment Accounts -->
  <div class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="flex items-center gap-3 pb-3 border-b border-surface-800">
      <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
        <i class="pi pi-wallet text-emerald-400 text-sm"></i>
      </div>
      <div>
        <h3 class="text-sm sm:text-base font-bold text-white">Event Booking Downpayment & Accounts</h3>
        <p class="text-xs text-gray-400">Default DP %, payment deadline, and receiving GCash / Maya / Bank details shown to clients</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Default Downpayment (%)</label>
        <input v-model.number="bookingPayForm.booking_downpayment_percent" type="number" min="5" max="100" step="5" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400/70" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Default Deadline (Hours)</label>
        <input v-model.number="bookingPayForm.booking_payment_deadline_hours" type="number" min="1" max="720" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-400/70" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">GCash Number</label>
        <input v-model="bookingPayForm.booking_gcash_number" type="text" placeholder="0994 612 1933" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 font-mono focus:outline-none focus:border-amber-400/70" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">GCash Account Name</label>
        <input v-model="bookingPayForm.booking_gcash_name" type="text" placeholder="Jefferson Alulod / G Shot Teas" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Maya Number (Optional)</label>
        <input v-model="bookingPayForm.booking_maya_number" type="text" placeholder="09XX XXX XXXX" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 font-mono focus:outline-none focus:border-amber-400/70" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Maya Account Name (Optional)</label>
        <input v-model="bookingPayForm.booking_maya_name" type="text" placeholder="Account Name" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Bank Name (Optional)</label>
        <input v-model="bookingPayForm.booking_bank_name" type="text" placeholder="e.g. BDO / BPI / UnionBank" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Bank Account Number</label>
        <input v-model="bookingPayForm.booking_bank_account" type="text" placeholder="Account Number" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 font-mono focus:outline-none focus:border-amber-400/70" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Bank Account Holder</label>
        <input v-model="bookingPayForm.booking_bank_account_name" type="text" placeholder="Account Holder Name" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70" />
      </div>
    </div>

    <!-- Optional Payment QR Upload -->
    <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-xl bg-surface-900 border border-surface-700 overflow-hidden flex items-center justify-center shrink-0">
          <img v-if="bookingPayForm.booking_payment_qr" :src="bookingPayForm.booking_payment_qr" alt="Booking QR" class="w-full h-full object-contain" />
          <i v-else class="pi pi-qrcode text-gray-500 text-xl"></i>
        </div>
        <div>
          <p class="text-xs font-bold text-white">Booking Payment QR Code (Optional)</p>
          <p class="text-[11px] text-gray-400">Upload your GCash / InstaPay QR image so clients can scan directly.</p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <label class="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-amber-300 border border-surface-700 text-xs font-bold cursor-pointer flex items-center gap-1.5">
          <i class="pi pi-upload text-[11px]"></i>
          <span>{{ bookingPayForm.booking_payment_qr ? 'Change QR' : 'Upload QR' }}</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleBookingQrUpload" />
        </label>
        <button
          v-if="bookingPayForm.booking_payment_qr"
          type="button"
          @click="bookingPayForm.booking_payment_qr = ''"
          class="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold cursor-pointer">
          Remove
        </button>
      </div>
    </div>

    <button
      type="button"
      @click="saveBookingPaymentSettings"
      :disabled="isSavingBookingPay"
      class="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
      <i v-if="isSavingBookingPay" class="pi pi-spin pi-spinner"></i>
      <i v-else class="pi pi-save"></i>
      <span>Save Booking Payment Settings</span>
    </button>
  </div>

  <!-- Customer Order Availability & Area Notice -->
  <div class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-800">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <i class="pi pi-megaphone text-amber-400 text-sm"></i>
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white">Order Availability Notice</h3>
          <p class="text-xs text-gray-400">Shown on storefront, menu & checkout</p>
        </div>
      </div>
      <span
        class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border self-start sm:self-auto flex items-center gap-1.5"
        :class="areaNoteForm.order_area_note_enabled ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' : 'bg-surface-950 text-gray-400 border-surface-700'">
        <span class="w-1.5 h-1.5 rounded-full" :class="areaNoteForm.order_area_note_enabled ? 'bg-emerald-400' : 'bg-gray-500'"></span>
        <span>{{ areaNoteForm.order_area_note_enabled ? 'Active' : 'Hidden' }}</span>
      </span>
    </div>

    <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-950 border border-surface-800">
      <span class="text-xs font-semibold text-gray-200">Show Banner to Customers</span>
      <label class="relative inline-flex items-center cursor-pointer shrink-0">
        <input type="checkbox" v-model="areaNoteForm.order_area_note_enabled" class="sr-only peer" />
        <div class="w-11 h-6 bg-surface-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
      </label>
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label class="text-xs font-semibold text-gray-300">Notice Message</label>
        <span class="text-[11px] text-gray-400 font-mono">{{ areaNoteForm.order_area_note.length }} chars</span>
      </div>
      <textarea
        v-model="areaNoteForm.order_area_note"
        rows="2"
        placeholder="Orders are only available in Santa Rosa bayan."
        class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors resize-none"
      ></textarea>
    </div>

    <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 space-y-2">
      <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Preview</p>
      <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-white flex items-center gap-2">
        <i class="pi pi-map-marker text-amber-400 text-xs shrink-0"></i>
        <span class="font-medium">{{ areaNoteForm.order_area_note || 'Orders are only available in Santa Rosa bayan.' }}</span>
      </div>
    </div>

    <button
      type="button"
      @click="saveAreaNoteSettings"
      :disabled="isSavingAreaNote"
      class="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
      <i v-if="isSavingAreaNote" class="pi pi-spin pi-spinner"></i>
      <i v-else class="pi pi-save"></i>
      <span>Save Notice</span>
    </button>
  </div>

  <!-- Delivery Locations / Accepted Barangays (Owner / Admin) -->
  <div v-if="store.isAdminOrSuper" class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-800">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
          <i class="pi pi-map-marker text-amber-400 text-sm"></i>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm sm:text-base font-bold text-white">Delivery Locations (Accepted Barangays)</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">Owner / Admin</span>
          </div>
          <p class="text-xs text-gray-400">Add or remove Santa Rosa barangays available for online delivery</p>
        </div>
      </div>
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <span class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-emerald-500/10 text-emerald-300 border-emerald-500/25 font-mono">
          {{ activeBarangays.length }} Active
        </span>
        <button
          type="button"
          @click="resetDefaultBarangays"
          :disabled="isSavingBarangays"
          class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-surface-700 bg-surface-950 hover:bg-surface-800 text-gray-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          title="Restore the default 9 Santa Rosa barangays">
          Reset Defaults
        </button>
      </div>
    </div>

    <!-- Add New Barangay Form -->
    <div class="p-3 sm:p-4 rounded-xl bg-surface-950 border border-surface-800 space-y-3">
      <p class="text-xs font-bold text-gray-200 flex items-center gap-1.5">
        <i class="pi pi-plus-circle text-amber-400 text-xs"></i>
        <span>Add Available Barangay</span>
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label class="block text-[11px] font-medium text-gray-400 mb-1">Barangay Name *</label>
          <input
            v-model="newBarangay.name"
            type="text"
            placeholder="e.g. Pooc"
            @keyup.enter="addBarangay"
            class="w-full px-3 py-2 rounded-xl bg-surface-900 border border-surface-800 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70"
          />
        </div>
        <div>
          <label class="block text-[11px] font-medium text-gray-400 mb-1">Est. Delivery Time</label>
          <input
            v-model="newBarangay.eta"
            type="text"
            placeholder="25–35 Mins"
            @keyup.enter="addBarangay"
            class="w-full px-3 py-2 rounded-xl bg-surface-900 border border-surface-800 text-xs sm:text-sm text-amber-300 font-mono placeholder-gray-500 focus:outline-none focus:border-amber-400/70"
          />
        </div>
        <div>
          <label class="block text-[11px] font-medium text-gray-400 mb-1">Aliases (Optional, comma-separated)</label>
          <input
            v-model="newBarangay.aliases"
            type="text"
            placeholder="e.g. pooc, pook"
            @keyup.enter="addBarangay"
            class="w-full px-3 py-2 rounded-xl bg-surface-900 border border-surface-800 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-400/70"
          />
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <button
          type="button"
          @click="addBarangay"
          :disabled="isSavingBarangays || !newBarangay.name.trim()"
          class="w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
          <i v-if="isSavingBarangays" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-plus"></i>
          <span>Add Barangay</span>
        </button>
      </div>

      <!-- Quick-Add Suggestions for Other Santa Rosa Barangays -->
      <div v-if="suggestedBarangays.length > 0" class="pt-2 border-t border-surface-800/80 space-y-1.5">
        <p class="text-[11px] text-gray-400 font-medium">Quick-add other Santa Rosa barangays:</p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="s in suggestedBarangays"
            :key="s.id"
            type="button"
            @click="quickAddBarangay(s)"
            :disabled="isSavingBarangays"
            class="px-2.5 py-1 rounded-lg bg-surface-900 hover:bg-amber-500/15 border border-surface-700 hover:border-amber-500/40 text-[11px] font-semibold text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50">
            <i class="pi pi-plus text-[9px]"></i>
            <span>{{ s.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Current Accepted Barangays List -->
    <div v-if="activeBarangays.length === 0" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
      <i class="pi pi-exclamation-triangle text-sm shrink-0"></i>
      <span>No delivery barangays are currently enabled. Delivery orders will be rejected until you add at least one barangay.</span>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      <div
        v-for="b in activeBarangays"
        :key="b.id"
        class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-between gap-2.5">
        <div class="min-w-0">
          <p class="text-xs sm:text-sm font-bold text-white truncate">{{ b.name }}</p>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <span class="text-[10px] font-mono font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
              {{ b.eta }}
            </span>
            <span v-if="b.aliases && b.aliases.length > 1" class="text-[10px] text-gray-500 truncate max-w-[140px]" :title="b.aliases.join(', ')">
              {{ b.aliases.slice(0, 3).join(', ') }}
            </span>
          </div>
        </div>
        <button
          type="button"
          @click="removeBarangay(b)"
          :disabled="isSavingBarangays"
          class="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50 transition-colors"
          :title="'Remove ' + b.name">
          <i class="pi pi-trash text-[10px]"></i>
          <span>Remove</span>
        </button>
      </div>
    </div>
  </div>

  <!-- General Store & Operations Settings -->
  <div class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="flex items-center gap-3 pb-3 border-b border-surface-800">
      <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
        <i class="pi pi-shop text-amber-400 text-sm"></i>
      </div>
      <div>
        <h3 class="text-sm sm:text-base font-bold text-white">Store Preferences</h3>
        <p class="text-xs text-gray-400">Contact info, hours & delivery fee</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Store Name</label>
        <input v-model="storeForm.store_name" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Tagline</label>
        <input v-model="storeForm.store_tagline" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Delivery Fee (₱)</label>
        <input v-model="storeForm.delivery_fee" type="number" step="5" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/70 transition-colors font-mono" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Contact Phone</label>
        <input v-model="storeForm.store_phone" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors font-mono" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Store Email</label>
        <input v-model="storeForm.store_email" type="email" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-300 mb-1">Operating Hours</label>
        <input v-model="storeForm.business_hours" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors" />
      </div>
      <div class="sm:col-span-2 lg:col-span-3">
        <label class="block text-xs font-medium text-gray-300 mb-1">Physical Address</label>
        <input v-model="storeForm.store_address" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors" />
      </div>
    </div>

    <button
      type="button"
      @click="saveGeneralSettings"
      :disabled="isSavingStore"
      class="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
      <i v-if="isSavingStore" class="pi pi-spin pi-spinner"></i>
      <i v-else class="pi pi-save"></i>
      <span>Save Preferences</span>
    </button>
  </div>

  <!-- Super Admin Maintenance Mode -->
  <div
    v-if="store.isSuperAdmin"
    class="p-3.5 sm:p-5 rounded-2xl border space-y-4 transition-colors"
    :class="maintForm.maintenance_mode ? 'bg-surface-900 border-rose-500/30' : 'border-surface-800'">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-800">
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
          :class="maintForm.maintenance_mode ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : 'bg-amber-500/10 border-amber-500/25 text-amber-400'">
          <i class="pi pi-wrench text-sm"></i>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm sm:text-base font-bold text-white">Maintenance Mode</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">Super Admin</span>
          </div>
          <p class="text-xs text-gray-400">Temporarily take the customer site offline</p>
        </div>
      </div>
      <span
        class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border self-start sm:self-auto flex items-center gap-1.5"
        :class="maintForm.maintenance_mode ? 'bg-rose-500/10 text-rose-300 border-rose-500/25' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'">
        <span class="w-1.5 h-1.5 rounded-full" :class="maintForm.maintenance_mode ? 'bg-rose-400' : 'bg-emerald-400'"></span>
        <span>{{ maintForm.maintenance_mode ? 'Offline' : 'Live' }}</span>
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <div class="lg:col-span-7 space-y-3 text-xs">
        <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-between gap-3">
          <div>
            <p class="font-semibold text-gray-200">Maintenance Shutdown</p>
            <p class="text-[11px] text-gray-400">Show maintenance page to visitors</p>
          </div>
          <button
            type="button"
            @click="maintForm.maintenance_mode = !maintForm.maintenance_mode"
            class="relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
            :class="maintForm.maintenance_mode ? 'bg-rose-600' : 'bg-surface-700'">
            <span
              class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white transition"
              :class="maintForm.maintenance_mode ? 'translate-x-6' : 'translate-x-0'"></span>
          </button>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Title</label>
          <input v-model="maintForm.maintenance_title" type="text" placeholder="Website Under Maintenance" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Message</label>
          <textarea v-model="maintForm.maintenance_message" rows="2" placeholder="Maintenance reason..." class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors resize-none"></textarea>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Back Online (Optional)</label>
          <input v-model="maintForm.maintenance_until" type="text" placeholder="e.g. Today at 4:00 PM" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-400/70 transition-colors" />
        </div>

        <div class="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            @click="saveMaintenanceSettings"
            :disabled="isSavingMaint"
            class="px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            :class="maintForm.maintenance_mode ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'">
            <i v-if="isSavingMaint" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-save"></i>
            <span>{{ maintForm.maintenance_mode ? 'Apply Shutdown' : 'Save Settings' }}</span>
          </button>
          <button
            v-if="maintForm.maintenance_mode"
            type="button"
            @click="restoreWebsiteNow"
            :disabled="isSavingMaint"
            class="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <i class="pi pi-check-circle"></i>
            <span>Restore Online</span>
          </button>
        </div>
      </div>

      <div class="lg:col-span-5 p-3.5 rounded-xl bg-surface-950 border border-surface-800 space-y-2.5 text-center">
        <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Preview</p>
        <div class="p-3.5 rounded-xl bg-surface-900 border border-amber-500/20 space-y-2">
          <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 mx-auto flex items-center justify-center font-black text-amber-400 text-sm">G'</div>
          <h5 class="text-xs font-bold text-white line-clamp-1">{{ maintForm.maintenance_title || 'Website Under Maintenance' }}</h5>
          <p class="text-[11px] text-gray-400 line-clamp-2">{{ maintForm.maintenance_message || 'Undergoing system updates.' }}</p>
          <div v-if="maintForm.maintenance_until" class="text-[10px] text-amber-300">Back: {{ maintForm.maintenance_until }}</div>
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
import { ALL_KNOWN_BARANGAYS, SANTA_ROSA_BARANGAYS, slugifyBarangayId } from '@/utils/santaRosaBarangays';

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

    // Delivery Locations (Accepted Barangays) Management
    const isSavingBarangays = Vue.ref(false);
    const newBarangay = Vue.reactive({
      name: '',
      eta: '25–35 Mins',
      aliases: '',
    });

    const activeBarangays = Vue.computed(() => store.supportedBarangays || []);

    const suggestedBarangays = Vue.computed(() => {
      const activeIds = new Set(activeBarangays.value.map((b) => b.id));
      return ALL_KNOWN_BARANGAYS.filter((b) => !activeIds.has(b.id));
    });

    const addBarangay = async () => {
      const name = newBarangay.name.trim();
      if (!name) {
        store.notify('Please enter a barangay name.', 'error');
        return;
      }
      const id = slugifyBarangayId(name);
      if (activeBarangays.value.some((b) => b.id === id || b.name.toLowerCase() === name.toLowerCase())) {
        store.notify(`"${name}" is already in the accepted barangays list.`, 'error');
        return;
      }
      const customAliases = newBarangay.aliases
        .split(',')
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean);
      const entry = {
        id,
        name,
        aliases: [name.toLowerCase(), ...customAliases],
        eta: newBarangay.eta.trim() || '25–35 Mins',
      };
      isSavingBarangays.value = true;
      try {
        await store.updateDeliveryBarangays([...activeBarangays.value, entry]);
        newBarangay.name = '';
        newBarangay.aliases = '';
      } finally {
        isSavingBarangays.value = false;
      }
    };

    const quickAddBarangay = async (barangay) => {
      if (activeBarangays.value.some((b) => b.id === barangay.id)) return;
      isSavingBarangays.value = true;
      try {
        await store.updateDeliveryBarangays([...activeBarangays.value, barangay]);
      } finally {
        isSavingBarangays.value = false;
      }
    };

    const removeBarangay = async (barangay) => {
      const ok = await store.confirmDialog({
        title: 'Remove Delivery Barangay',
        message: `Remove "${barangay.name}" from accepted delivery locations? Customers in this barangay will no longer be able to place delivery orders.`,
        confirmText: 'Remove',
        variant: 'danger',
      });
      if (!ok) return;
      isSavingBarangays.value = true;
      try {
        const next = activeBarangays.value.filter((b) => b.id !== barangay.id);
        await store.updateDeliveryBarangays(next);
      } finally {
        isSavingBarangays.value = false;
      }
    };

    const resetDefaultBarangays = async () => {
      const ok = await store.confirmDialog({
        title: 'Reset Delivery Barangays',
        message: 'Restore the default 9 Santa Rosa barangays? Any custom barangays you added will be removed.',
        confirmText: 'Restore Defaults',
        variant: 'warning',
      });
      if (!ok) return;
      isSavingBarangays.value = true;
      try {
        await store.updateDeliveryBarangays(SANTA_ROSA_BARANGAYS);
      } finally {
        isSavingBarangays.value = false;
      }
    };

    // Event Booking Downpayment & Accounts Form State
    const isSavingBookingPay = Vue.ref(false);
    const bookingPayForm = Vue.reactive({
      booking_downpayment_percent: Number(store.settings?.booking_downpayment_percent ?? 50),
      booking_payment_deadline_hours: Number(store.settings?.booking_payment_deadline_hours ?? 48),
      booking_gcash_number: store.settings?.booking_gcash_number ?? '0994 612 1933',
      booking_gcash_name: store.settings?.booking_gcash_name ?? 'Jefferson Alulod / G Shot Teas',
      booking_maya_number: store.settings?.booking_maya_number ?? '',
      booking_maya_name: store.settings?.booking_maya_name ?? '',
      booking_bank_name: store.settings?.booking_bank_name ?? '',
      booking_bank_account: store.settings?.booking_bank_account ?? '',
      booking_bank_account_name: store.settings?.booking_bank_account_name ?? '',
      booking_payment_qr: store.settings?.booking_payment_qr ?? '',
    });

    const handleBookingQrUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        store.notify('Please select a valid PNG, JPG, or WebP QR image.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const webp = canvas.toDataURL('image/webp', 0.85);
          bookingPayForm.booking_payment_qr = webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85);
        };
        img.src = ev.target?.result;
      };
      reader.readAsDataURL(file);
    };

    const saveBookingPaymentSettings = async () => {
      isSavingBookingPay.value = true;
      try {
        const pct = Math.min(100, Math.max(5, Number(bookingPayForm.booking_downpayment_percent || 50)));
        const hrs = Math.min(720, Math.max(1, Number(bookingPayForm.booking_payment_deadline_hours || 48)));
        await store.updateStoreSettings({
          booking_downpayment_percent: String(pct),
          booking_payment_deadline_hours: String(hrs),
          booking_gcash_number: (bookingPayForm.booking_gcash_number || '').trim(),
          booking_gcash_name: (bookingPayForm.booking_gcash_name || '').trim(),
          booking_maya_number: (bookingPayForm.booking_maya_number || '').trim(),
          booking_maya_name: (bookingPayForm.booking_maya_name || '').trim(),
          booking_bank_name: (bookingPayForm.booking_bank_name || '').trim(),
          booking_bank_account: (bookingPayForm.booking_bank_account || '').trim(),
          booking_bank_account_name: (bookingPayForm.booking_bank_account_name || '').trim(),
          booking_payment_qr: (bookingPayForm.booking_payment_qr || '').trim(),
        });
      } finally {
        isSavingBookingPay.value = false;
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

        if (newSettings.booking_downpayment_percent !== undefined) bookingPayForm.booking_downpayment_percent = Number(newSettings.booking_downpayment_percent || 50);
        if (newSettings.booking_payment_deadline_hours !== undefined) bookingPayForm.booking_payment_deadline_hours = Number(newSettings.booking_payment_deadline_hours || 48);
        if (newSettings.booking_gcash_number !== undefined) bookingPayForm.booking_gcash_number = newSettings.booking_gcash_number;
        if (newSettings.booking_gcash_name !== undefined) bookingPayForm.booking_gcash_name = newSettings.booking_gcash_name;
        if (newSettings.booking_maya_number !== undefined) bookingPayForm.booking_maya_number = newSettings.booking_maya_number;
        if (newSettings.booking_maya_name !== undefined) bookingPayForm.booking_maya_name = newSettings.booking_maya_name;
        if (newSettings.booking_bank_name !== undefined) bookingPayForm.booking_bank_name = newSettings.booking_bank_name;
        if (newSettings.booking_bank_account !== undefined) bookingPayForm.booking_bank_account = newSettings.booking_bank_account;
        if (newSettings.booking_bank_account_name !== undefined) bookingPayForm.booking_bank_account_name = newSettings.booking_bank_account_name;
        if (newSettings.booking_payment_qr !== undefined) bookingPayForm.booking_payment_qr = newSettings.booking_payment_qr;

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
      const ok = await store.confirmDialog({
        title: 'Restore Website Online',
        message: 'All customers will immediately regain access to order and view the menu.',
        confirmText: 'Restore Online',
        cancelText: 'Cancel',
        variant: 'success',
        icon: 'pi-globe',
      });
      if (ok) {
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
      bookingPayForm,
      isSavingBookingPay,
      handleBookingQrUpload,
      saveBookingPaymentSettings,
      storeForm,
      saveGeneralSettings,
      areaNoteForm,
      isSavingAreaNote,
      saveAreaNoteSettings,
      activeBarangays,
      suggestedBarangays,
      newBarangay,
      isSavingBarangays,
      addBarangay,
      quickAddBarangay,
      removeBarangay,
      resetDefaultBarangays,
      reloadSettings,
      maintForm,
      isSavingMaint,
      saveMaintenanceSettings,
      restoreWebsiteNow,
    };
  },
};
</script>
