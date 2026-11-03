<template>
<div class="min-h-screen bg-surface-950 text-gray-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      
      

      <div class="relative z-10 flex flex-col flex-1">
        
        <!-- Navigation Header (Customer Views) -->
        <Navbar v-if="store.currentView !== 'admin' && store.currentView !== 'driver'" />

        <!-- Main Content Area -->
        <main class="flex-1">
          <!-- 1. Customer Landing & Menu -->
          <div v-if="store.currentView === 'customer'" class="animate-fade-in">
            <LandingHero />
            <AnnouncementSection />
            <FeaturedSection />
            <MenuSection />
            <AboutSection />
            <ContactSection />
            <ActiveOrderWidget />
          </div>

          <!-- 2. Checkout Section (Figure 10) -->
          <div v-else-if="store.currentView === 'checkout'">
            <CheckoutView />
          </div>

          <!-- 3. Track Order View (Figure 11) -->
          <div v-else-if="store.currentView === 'track'">
            <OrderTracker />
          </div>

          <!-- 4. Customer Order History View (Figure 13) -->
          <div v-else-if="store.currentView === 'history'">
            <OrderHistoryView />
          </div>

          <!-- 5. Staff & Admin Management Dashboard (Figures 14–17) -->
          <div v-else-if="store.currentView === 'admin'">
            <AdminDashboard />
          </div>

          <!-- 6. Delivery Driver Mobile-First Portal -->
          <div v-else-if="store.currentView === 'driver'">
            <DriverView />
          </div>
        </main>

        <!-- Footer (Customer Views) -->
        <footer v-if="store.currentView !== 'admin' && store.currentView !== 'driver'" class="py-10 bg-surface-950 border-t border-surface-800 text-xs text-gray-500 text-center">
          <div class="max-w-6xl mx-auto px-4 space-y-3">
            <div class="flex items-center justify-center gap-2">
              <span class="font-extrabold text-white text-sm">G SHOT TEAS</span>
              <span class="text-yellow-400 font-bold">•</span>
              <span class="text-gray-400">Web-Based Ordering & Sales Management System</span>
            </div>
            <p>STI College Santa Rosa — Capstone Project by Tyron Erick Rico, Mhar Anthony Lirio, Kurt Xyler Munoz, Raymond Barajas</p>
            <p class="text-[10px] text-gray-600">Client: Jefferson Anore Alulod • Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna</p>
          </div>
        </footer>

        <!-- Global Drawers & Modals -->
        <CartDrawer />
        <CustomizationModal />
        <ProductImageModal />
        <EventBookingModal />
        <AnnouncementModal />
        <AuthModal />
        <StaffPinModal v-if="store.currentView !== 'admin'" />
        <ChatbotAssistant v-if="store.currentView !== 'admin'" />

        <!-- Flyer Fullscreen Lightbox Modal -->
        <div 
          v-if="store.previewFlyerImage"
          class="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          @click.self="store.closeFlyer()">
          <div class="relative max-w-lg w-full bg-surface-900 border border-surface-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div class="p-4 bg-surface-800 flex items-center justify-between border-b border-surface-700">
              <span class="text-xs font-bold text-white flex items-center gap-2">
                <i class="pi pi-image text-amber-400"></i> Official Service Flyer Preview
              </span>
              <button @click="store.closeFlyer()" class="w-8 h-8 rounded-full bg-surface-700 text-gray-300 hover:text-white flex items-center justify-center text-xs">
                ✕
              </button>
            </div>
            <div class="p-3 bg-black flex items-center justify-center">
              <img :src="store.previewFlyerImage" alt="Flyer Preview" class="max-h-[72vh] w-auto object-contain rounded-xl shadow-lg" />
            </div>
            <div class="p-3 sm:p-4 bg-surface-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-t border-surface-700">
              <span class="text-[11px] sm:text-xs text-gray-300 font-medium truncate text-center sm:text-left">Direct: Jefferson Alulod • 0993.700.5426</span>
              <button 
                @click="store.closeFlyer(); store.openBookingWithPackage(store.previewFlyerImage.includes('coffee') ? 'Coffee Package' : 'Fruity Float Package')"
                class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all shrink-0 text-center">
                Book This Package
              </button>
            </div>
          </div>
        </div>

        <!-- Toast Notifications Overlay (Bottom Center, Non-intrusive & Instantly Dismissible) -->
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
          <div 
            v-for="toast in store.toasts" 
            :key="toast.id"
            @click="store.removeToast(toast.id)"
            class="w-full px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white flex items-center justify-between gap-3 backdrop-blur-md pointer-events-auto border animate-toast-in cursor-pointer select-none transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
            :class="getToastClass(toast.type)"
            title="Click to dismiss immediately">
            <div class="flex items-start gap-2.5 min-w-0 flex-1">
              <i class="pi flex-shrink-0 mt-0.5 text-sm" :class="getToastIcon(toast.type)"></i>
              <span class="break-words whitespace-pre-line leading-relaxed text-xs">{{ toast.msg }}</span>
            </div>
            <button 
              type="button"
              @click.stop="store.removeToast(toast.id)" 
              class="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors shrink-0 ml-1"
              title="Remove notification">
              <i class="pi pi-times text-[10px]"></i>
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

// G Shot Teas — Vue 3 Main Application Root


export default {
  name: 'App',
  setup() {
    const store = useGShotStore();

    onMounted(async () => {
      await store.init();
    });

    const getToastClass = (type) => {
      if (type === 'error') return 'bg-rose-950/95 border-rose-600 text-rose-100 shadow-rose-950/50';
      if (type === 'warning') return 'bg-amber-950/95 border-amber-500 text-amber-100 shadow-amber-950/50';
      if (type === 'info') return 'bg-sky-950/95 border-sky-600 text-sky-100 shadow-sky-950/50';
      return 'bg-emerald-950/95 border-emerald-600 text-emerald-100 shadow-emerald-950/50';
    };

    const getToastIcon = (type) => {
      if (type === 'error') return 'pi-times-circle text-rose-400';
      if (type === 'warning') return 'pi-exclamation-triangle text-amber-400';
      if (type === 'info') return 'pi-info-circle text-sky-400';
      return 'pi-check-circle text-emerald-400';
    };

    return {
      store,
      getToastClass,
      getToastIcon,
    };
  },
};

// Create and mount Vue 3 App with Pinia
</script>
