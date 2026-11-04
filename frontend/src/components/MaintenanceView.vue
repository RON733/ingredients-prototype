<template>
  <div class="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
    
    <!-- Ambient Background Glows -->
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 right-1/4 w-[450px] h-[450px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/3 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-2xl relative z-10 space-y-8 animate-fade-in text-center">
      
      <!-- Brand Logo & Live Offline Badge -->
      <div class="flex flex-col items-center gap-3">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-surface-900 border border-surface-700/80 shadow-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-yellow-400 relative group">
          <span>G'</span>
          <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-surface-950 animate-ping"></span>
          <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-surface-950"></span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xl sm:text-2xl font-black tracking-tight text-white">G SHOT TEAS</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-surface-800 text-yellow-400 border border-surface-700">SANTA ROSA</span>
        </div>

        <!-- Live Maintenance Pill -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-lg">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Website Temporarily Under Maintenance</span>
        </div>
      </div>

      <!-- Main Central Card -->
      <div class="p-6 sm:p-10 rounded-3xl bg-surface-900/90 border border-surface-700 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">
        
        <!-- Animated Maintenance Graphic -->
        <div class="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
          <i class="pi pi-cog text-4xl sm:text-5xl text-amber-400 animate-spin" style="animation-duration: 12s;"></i>
          <div class="absolute inset-0 flex items-center justify-center">
            <i class="pi pi-wrench text-xl sm:text-2xl text-yellow-400"></i>
          </div>
        </div>

        <!-- Dynamic Title & Custom Notice Message -->
        <div class="space-y-3">
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ store.maintenanceTitle || 'Website Under Scheduled Maintenance' }}
          </h1>
          <p class="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl mx-auto">
            {{ store.maintenanceMessage || 'G Shot Teas is currently undergoing essential system updates, server optimization, and kitchen inventory synchronization. Online customer ordering and checkout are temporarily offline.' }}
          </p>
        </div>

        <!-- Estimated Completion Banner (If Configured by Super Admin) -->
        <div v-if="store.maintenanceUntil" class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-300 font-bold">
          <i class="pi pi-clock text-amber-400"></i>
          <span>Expected Back Online: <strong>{{ store.maintenanceUntil }}</strong></span>
        </div>

        <!-- Live Status Refresh Check Button -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            type="button"
            @click="handleCheckStatus" 
            :disabled="isChecking"
            class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs transition-all shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            <i class="pi" :class="isChecking ? 'pi-spin pi-spinner' : 'pi-refresh'"></i>
            <span>{{ isChecking ? 'Checking Server Status...' : 'Check if Website is Back Online' }}</span>
          </button>
        </div>

        <!-- Alternative Contact & Walk-In Details -->
        <div class="pt-6 border-t border-surface-800 text-left space-y-4">
          <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">
            Need urgent orders or catering inquiries while we update?
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <!-- Hotline Card -->
            <a 
              :href="'tel:' + (store.settings?.store_phone || '09937005426')"
              class="p-3.5 rounded-2xl bg-surface-950/60 border border-surface-800 hover:border-yellow-400/50 transition-all flex items-center gap-3 group">
              <div class="w-9 h-9 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <i class="pi pi-phone text-sm"></i>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-gray-400 font-medium">Direct Hotline / Call</p>
                <p class="font-bold text-white truncate font-mono">{{ store.settings?.store_phone || '0993.700.5426' }}</p>
              </div>
            </a>

            <!-- Physical Store Location Card -->
            <div class="p-3.5 rounded-2xl bg-surface-950/60 border border-surface-800 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <i class="pi pi-map-marker text-sm"></i>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-gray-400 font-medium">Walk-ins Welcome At Store</p>
                <p class="font-bold text-white truncate text-[11px]">{{ store.settings?.store_address || 'Brgy. Sinalhan, Santa Rosa, Laguna' }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Super Admin & Staff Console Bypass Link -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500">
        <span>Authorized Personnel or System Administrator?</span>
        <a 
          href="/admin" 
          class="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 underline underline-offset-4 cursor-pointer">
          <i class="pi pi-lock text-[11px]"></i>
          <span>Access Management Console</span>
        </a>
      </div>

    </div>

  </div>
</template>

<script>
import * as Vue from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';

export default {
  name: 'MaintenanceView',
  setup() {
    const store = useGShotStore();
    const isChecking = Vue.ref(false);

    const handleCheckStatus = async () => {
      isChecking.value = true;
      try {
        await store.fetchSettings();
        if (!store.isMaintenanceMode) {
          store.notify('Website is now back ONLINE! Refreshing page...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          store.notify('The website is still undergoing scheduled maintenance. Please check back shortly.', 'info');
        }
      } catch (err) {
        store.notify('Could not contact server. Please retry in a moment.', 'error');
      } finally {
        setTimeout(() => {
          isChecking.value = false;
        }, 500);
      }
    };

    return {
      store,
      isChecking,
      handleCheckStatus,
    };
  }
};
</script>
