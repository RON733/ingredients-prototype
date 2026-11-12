<template>
<div class="space-y-4 sm:space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between gap-3 pb-3 border-b border-surface-800">
    <div>
      <h2 class="text-lg sm:text-xl font-bold text-white">Store & Payment Settings</h2>
      <p class="text-xs text-gray-400">Payments, availability notice & store info</p>
    </div>
    <button
      @click="reloadSettings"
      :disabled="isLoading"
      class="px-3 py-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-gray-300 text-xs font-semibold border border-surface-800 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
      <i class="pi" :class="isLoading ? 'pi-spin pi-spinner' : 'pi-refresh'"></i>
      <span class="hidden sm:inline">Refresh</span>
    </button>
  </div>

  <!-- PayMongo Payment Gateway -->
  <div class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-800">
      <div>
        <h3 class="text-sm sm:text-base font-bold text-white">PayMongo Gateway</h3>
        <p class="text-xs text-gray-400">QR Ph, e-wallets & online banking</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5"
          :class="isPaymongoAvailable ? 'bg-surface-950 text-emerald-400 border-surface-700' : 'bg-surface-950 text-rose-400 border-surface-700'">
          <span class="w-1.5 h-1.5 rounded-full" :class="isPaymongoAvailable ? 'bg-emerald-400' : 'bg-rose-400'"></span>
          <span>{{ isPaymongoAvailable ? 'Active' : 'Disabled' }}</span>
        </span>
        <button
          type="button"
          @click="togglePaymongoAvailability"
          :disabled="isTogglingPaymongo"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border"
          :class="isPaymongoAvailable ? 'bg-surface-800 hover:bg-surface-700 text-rose-300 border-surface-700' : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-transparent'">
          <i v-if="isTogglingPaymongo" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi" :class="isPaymongoAvailable ? 'pi-power-off' : 'pi-check'"></i>
          <span>{{ isPaymongoAvailable ? 'Disable' : 'Enable' }}</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 space-y-1.5 min-w-0">
        <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Public Key</p>
        <p class="font-mono text-xs text-white bg-surface-900 px-2.5 py-2 rounded-lg border border-surface-800 select-all truncate">
          pk_test_BGTyBKi9iXHVsforUZ2WyCLz
        </p>
      </div>
      <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 space-y-1.5 min-w-0">
        <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Secret Key</p>
        <p class="font-mono text-xs text-gray-300 bg-surface-900 px-2.5 py-2 rounded-lg border border-surface-800 truncate">
          sk_test_••••••••••••••••4e1e
        </p>
      </div>
    </div>

    <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
      <div class="min-w-0">
        <p class="font-semibold text-gray-300">Webhook Endpoint</p>
        <p class="text-gray-400 text-[11px] font-mono select-all truncate">/api/paymongo/webhook</p>
      </div>
      <span class="text-[11px] text-gray-400 px-2.5 py-1 rounded-lg bg-surface-900 border border-surface-800 shrink-0 self-start sm:self-auto">
        Auto POS Sync
      </span>
    </div>
  </div>

  <!-- Customer Order Availability & Area Notice -->
  <div class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-800">
      <div>
        <h3 class="text-sm sm:text-base font-bold text-white">Order Availability Notice</h3>
        <p class="text-xs text-gray-400">Shown on storefront, menu & checkout</p>
      </div>
      <span
        class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border self-start sm:self-auto flex items-center gap-1.5"
        :class="areaNoteForm.order_area_note_enabled ? 'bg-surface-950 text-emerald-400 border-surface-700' : 'bg-surface-950 text-gray-400 border-surface-800'">
        <span class="w-1.5 h-1.5 rounded-full" :class="areaNoteForm.order_area_note_enabled ? 'bg-emerald-400' : 'bg-gray-500'"></span>
        <span>{{ areaNoteForm.order_area_note_enabled ? 'Active' : 'Hidden' }}</span>
      </span>
    </div>

    <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-950 border border-surface-800">
      <span class="text-xs font-semibold text-white">Show Banner to Customers</span>
      <label class="relative inline-flex items-center cursor-pointer shrink-0">
        <input type="checkbox" v-model="areaNoteForm.order_area_note_enabled" class="sr-only peer" />
        <div class="w-11 h-6 bg-surface-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
      </label>
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label class="text-xs font-semibold text-gray-300">Notice Message</label>
        <span class="text-[11px] text-gray-500 font-mono">{{ areaNoteForm.order_area_note.length }} chars</span>
      </div>
      <textarea
        v-model="areaNoteForm.order_area_note"
        rows="2"
        placeholder="Orders are only available in Santa Rosa bayan."
        class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
      ></textarea>
    </div>

    <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 space-y-2">
      <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Preview</p>
      <div class="p-2.5 rounded-xl bg-surface-900 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
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

  <!-- General Store & Operations Settings -->
  <div class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="pb-3 border-b border-surface-800">
      <h3 class="text-sm sm:text-base font-bold text-white">Store Preferences</h3>
      <p class="text-xs text-gray-400">Contact info, hours & delivery fee</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Store Name</label>
        <input v-model="storeForm.store_name" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Tagline</label>
        <input v-model="storeForm.store_tagline" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Delivery Fee (₱)</label>
        <input v-model="storeForm.delivery_fee" type="number" step="5" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Contact Phone</label>
        <input v-model="storeForm.store_phone" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Store Email</label>
        <input v-model="storeForm.store_email" type="email" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Operating Hours</label>
        <input v-model="storeForm.business_hours" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500" />
      </div>
      <div class="sm:col-span-2 lg:col-span-3">
        <label class="block text-xs font-medium text-gray-400 mb-1">Physical Address</label>
        <input v-model="storeForm.store_address" type="text" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500" />
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
  <div v-if="store.isSuperAdmin" class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-800">
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="text-sm sm:text-base font-bold text-white">Maintenance Mode</h3>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-800 text-gray-300 border border-surface-700">Super Admin</span>
        </div>
        <p class="text-xs text-gray-400">Temporarily take the customer site offline</p>
      </div>
      <span
        class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border self-start sm:self-auto flex items-center gap-1.5"
        :class="maintForm.maintenance_mode ? 'bg-surface-950 text-rose-400 border-rose-500/30' : 'bg-surface-950 text-emerald-400 border-surface-700'">
        <span class="w-1.5 h-1.5 rounded-full" :class="maintForm.maintenance_mode ? 'bg-rose-400' : 'bg-emerald-400'"></span>
        <span>{{ maintForm.maintenance_mode ? 'Offline' : 'Live' }}</span>
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <div class="lg:col-span-7 space-y-3 text-xs">
        <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-between gap-3">
          <div>
            <p class="font-semibold text-white">Maintenance Shutdown</p>
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
          <label class="block text-xs font-medium text-gray-400 mb-1">Title</label>
          <input v-model="maintForm.maintenance_title" type="text" placeholder="Website Under Maintenance" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Message</label>
          <textarea v-model="maintForm.maintenance_message" rows="2" placeholder="Maintenance reason..." class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none"></textarea>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Back Online (Optional)</label>
          <input v-model="maintForm.maintenance_until" type="text" placeholder="e.g. Today at 4:00 PM" class="w-full px-3 py-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500" />
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
        <div class="p-3.5 rounded-xl bg-surface-900 border border-surface-800 space-y-2">
          <div class="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 mx-auto flex items-center justify-center font-black text-amber-400 text-sm">G'</div>
          <h5 class="text-xs font-bold text-white line-clamp-1">{{ maintForm.maintenance_title || 'Website Under Maintenance' }}</h5>
          <p class="text-[11px] text-gray-400 line-clamp-2">{{ maintForm.maintenance_message || 'Undergoing system updates.' }}</p>
          <div v-if="maintForm.maintenance_until" class="text-[10px] text-amber-300">Back: {{ maintForm.maintenance_until }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loyverse POS Integration -->
  <div class="p-3.5 sm:p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-800">
      <div>
        <h3 class="text-sm sm:text-base font-bold text-white">Loyverse POS Sync</h3>
        <p class="text-xs text-gray-400">Store: {{ loyverseInfo.store_name }}</p>
      </div>
      <span class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface-950 text-emerald-400 border border-surface-700 self-start sm:self-auto flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>Auto-Sync Active</span>
      </span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      <div class="p-3 rounded-xl bg-surface-950 border border-surface-800">
        <p class="text-[10px] font-semibold text-gray-400 uppercase">Ingredients</p>
        <p class="text-base sm:text-lg font-bold text-white mt-0.5">{{ store.ingredients.length }}</p>
      </div>
      <div class="p-3 rounded-xl bg-surface-950 border border-surface-800">
        <p class="text-[10px] font-semibold text-gray-400 uppercase">Recipes</p>
        <p class="text-base sm:text-lg font-bold text-white mt-0.5">{{ store.products.length }}</p>
      </div>
      <div class="p-3 rounded-xl bg-surface-950 border border-surface-800">
        <p class="text-[10px] font-semibold text-gray-400 uppercase">Catalog Items</p>
        <p class="text-base sm:text-lg font-bold text-white mt-0.5">{{ loyverseInfo.items_count }}</p>
      </div>
      <div class="p-3 rounded-xl bg-surface-950 border border-surface-800">
        <p class="text-[10px] font-semibold text-gray-400 uppercase">Stock Sync</p>
        <p class="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">2-Way</p>
      </div>
    </div>

    <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 space-y-2">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span class="text-xs font-semibold text-gray-300">Webhook URL</span>
        <button
          type="button"
          @click="handleRegisterWebhook"
          :disabled="isRegisteringWebhook"
          class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-surface-800 hover:bg-surface-700 text-white border border-surface-700 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer">
          <i class="pi" :class="isRegisteringWebhook ? 'pi-spin pi-spinner' : 'pi-check'"></i>
          <span>{{ isRegisteringWebhook ? 'Registering...' : 'Register Webhook' }}</span>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <input
          readonly
          :value="loyverseWebhookUrl"
          class="w-full min-w-0 px-3 py-2 rounded-lg bg-surface-900 border border-surface-800 text-xs font-mono text-gray-400 focus:outline-none select-all"
        />
        <button
          type="button"
          @click="copyWebhookUrl"
          class="px-3 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer">
          <i class="pi pi-copy"></i>
          <span>Copy</span>
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
