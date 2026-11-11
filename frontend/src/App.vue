<template>
<div class="min-h-screen bg-surface-950 text-gray-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      
      

      <!-- Operations Personnel Redirection Screen (Workers strictly access their own dashboards only) -->
      <div v-if="isWorker" class="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in min-h-[70vh]">
        <div class="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl mb-4 shadow-xl animate-pulse">
          <i class="pi pi-shield"></i>
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-white mb-2">Store Personnel Access Restricted</h2>
        <p class="text-xs sm:text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
          Store personnel (Staff, Delivery Riders, and Administrators) only access their operational dashboard. Redirecting you to your portal...
        </p>
        <a 
          :href="(store.user?.role === 'driver' || store.user?.role === 'rider') ? '/driver' : '/admin'" 
          class="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20">
          <i class="pi pi-arrow-right text-xs"></i>
          <span>Open Dashboard</span>
        </a>
      </div>

      <div v-else class="relative z-10 flex flex-col flex-1">
        <!-- Navigation Header (Always Visible) -->
        <Navbar />

        <!-- Main Content Area -->
        <main class="flex-1">
          <!-- 0. Website Shutdown / Maintenance Mode for Customers -->
          <div v-if="store.isMaintenanceMode" class="animate-fade-in">
            <MaintenanceView />
          </div>

          <!-- Normal System Views for Customers -->
          <template v-else>
            <!-- 1. Customer Landing (Home View) -->
            <div v-if="store.currentView === 'customer'" class="animate-fade-in">
              <LandingHero />
              <AnnouncementSection />
              <FeaturedSection />
              <MenuSection :isStandalonePage="false" />
              <AboutSection />
              <ContactSection />
              <ActiveOrderWidget />
            </div>

            <!-- 2. Dedicated Standalone Menu Page (Accessible on mobile & direct desktop menu view) -->
            <div v-else-if="store.currentView === 'menu'" class="animate-fade-in">
              <MenuSection :isStandalonePage="true" />
              <ActiveOrderWidget />
            </div>

            <!-- 3. Checkout Section -->
            <div v-else-if="store.currentView === 'checkout'">
              <CheckoutView />
            </div>

            <!-- 4. Track Order View -->
            <div v-else-if="store.currentView === 'track'">
              <OrderTracker />
            </div>

            <!-- 5. Customer Order History View -->
            <div v-else-if="store.currentView === 'history'">
              <OrderHistoryView />
            </div>

            <!-- 5b. Customer Event Booking History View -->
            <div v-else-if="store.currentView === 'bookings'">
              <BookingHistoryView />
            </div>

            <!-- 6. Resilient Fallback: Always display Customer Storefront if view is unknown -->
            <div v-else class="animate-fade-in">
              <LandingHero />
              <AnnouncementSection />
              <FeaturedSection />
              <MenuSection :isStandalonePage="false" />
              <AboutSection />
              <ContactSection />
              <ActiveOrderWidget />
            </div>
          </template>
        </main>

        <!-- Footer (Customer Views) -->
        <footer v-if="!store.isMaintenanceMode" class="py-10 pb-24 lg:pb-10 bg-surface-950 border-t border-surface-800 text-xs text-gray-500 text-center">
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

        <!-- Mobile Bottom App Bar (Customer Cellphone Navigation) -->
        <nav v-if="!store.isMaintenanceMode"
          class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-900/98 backdrop-blur-xl border-t border-surface-800/80 px-1 py-1.5 flex items-center justify-around shadow-2xl">
          
          <!-- 1. Home -->
          <button 
            @click="navToSection('home')"
            type="button"
            class="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-0"
            :class="store.currentView === 'customer' && store.activeSection === 'home' ? 'text-yellow-400 font-bold' : 'text-gray-400 hover:text-gray-200'">
            <i class="pi pi-home text-base"></i>
            <span class="text-[10px] tracking-tight">Home</span>
          </button>

          <!-- 2. Menu (Opens Dedicated Mobile Menu Page) -->
          <button 
            @click="navToSection('menu')"
            type="button"
            class="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-0"
            :class="store.currentView === 'menu' ? 'text-yellow-400 font-bold scale-105' : 'text-gray-400 hover:text-gray-200'">
            <i class="pi pi-th-large text-base"></i>
            <span class="text-[10px] tracking-tight">Menu</span>
          </button>

          <!-- 3. Cart with Badge -->
          <button 
            @click="store.cartOpen = true"
            type="button"
            class="relative flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-0 text-gray-400 hover:text-gray-200">
            <div class="relative">
              <i class="pi pi-shopping-bag text-base"></i>
              <span 
                v-if="store.cartCount > 0" 
                class="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-yellow-400 text-black text-[9px] font-black rounded-full leading-tight">
                {{ store.cartCount }}
              </span>
            </div>
            <span class="text-[10px] tracking-tight">Cart</span>
          </button>

          <!-- 4. Order History (Mobile) -->
          <button 
            @click="store.currentView = 'history'; window.scrollTo({ top: 0, behavior: 'smooth' })"
            type="button"
            class="relative flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-0"
            :class="store.currentView === 'history' ? 'text-yellow-400 font-bold scale-105' : 'text-gray-400 hover:text-gray-200'"
            title="Order History">
            <div class="relative">
              <i class="pi pi-history text-base"></i>
              <span 
                v-if="hasOngoingOrders" 
                class="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                title="Active order in progress">
              </span>
            </div>
            <span class="text-[10px] tracking-tight">Orders</span>
          </button>

          <!-- 5. Track Active Order -->
          <button 
            @click="store.currentView = 'track'; window.scrollTo({ top: 0, behavior: 'smooth' })"
            type="button"
            class="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-0"
            :class="store.currentView === 'track' ? 'text-yellow-400 font-bold' : 'text-gray-400 hover:text-gray-200'">
            <i class="pi pi-map-marker text-base"></i>
            <span class="text-[10px] tracking-tight">Track</span>
          </button>

          <!-- 6. Book Catering Package -->
          <button 
            @click="store.openBookingModal('form')"
            type="button"
            class="flex flex-col items-center gap-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-0 text-gray-400 hover:text-gray-200">
            <i class="pi pi-calendar-plus text-base"></i>
            <span class="text-[10px] tracking-tight">Book</span>
          </button>

        </nav>

        <!-- Global Drawers & Modals -->
        <CartDrawer />
        <CustomizationModal />
        <ProductImageModal />
        <EventBookingModal />
        <AnnouncementModal />
        <AuthModal />
        <ChatbotAssistant />

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
              <span class="text-[11px] sm:text-xs text-gray-300 font-medium truncate text-center sm:text-left">Direct: Jefferson Alulod • 0994 612 1933</span>
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

    const isWorker = computed(() => {
      const role = store.user?.role;
      return !!role && ['staff', 'admin', 'super_admin', 'superadmin', 'driver', 'rider'].includes(role);
    });

    const enforceWorkerDashboardOnly = () => {
      if (isWorker.value) {
        const target = (store.user?.role === 'driver' || store.user?.role === 'rider') ? '/driver' : '/admin';
        window.location.replace(target);
      }
    };

    onMounted(async () => {
      enforceWorkerDashboardOnly();
      await store.init();
      enforceWorkerDashboardOnly();

      // Handle PayMongo Hosted Checkout return redirect
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const paymongoStatus = urlParams.get('paymongo_status');
        const orderId = urlParams.get('order_id');

        if (paymongoStatus && orderId) {
          // Clean URL parameters without reloading page
          window.history.replaceState({}, document.title, window.location.pathname);

          if (paymongoStatus === 'success') {
            store.notify('Verifying PayMongo online payment...', 'info');
            try {
              const res = await GST_API.verifyPayMongoPayment(orderId);
              if (res.data?.order) {
                store.activeOrder = res.data.order;
                localStorage.setItem('gst_active_order_id', res.data.order.id);
                store.currentView = 'track';
                store.activeSection = 'track';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                store.notify(res.data.message || 'Payment verified! Order confirmed and is now being prepared.', 'success');
              }
            } catch (vErr) {
              console.error('PayMongo verification error:', vErr);
              store.notify('Payment processed! Loading order tracker...', 'success');
              await store.fetchActiveOrder();
              store.currentView = 'track';
            }
          } else if (paymongoStatus === 'cancelled') {
            store.notify('PayMongo payment was cancelled. You can retry paying or choose Cash.', 'warning');
            store.currentView = 'track';
            await store.fetchActiveOrder();
          }
        }
      } catch (e) {
        console.error('Error handling PayMongo URL params:', e);
      }
    });

    watch(() => store.user, () => {
      enforceWorkerDashboardOnly();
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

    const navToSection = (section) => {
      const isMobile = window.innerWidth < 1024;
      if (section === 'menu') {
        if (isMobile) {
          store.currentView = 'menu';
          store.activeSection = 'menu';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        store.currentView = 'customer';
        store.activeSection = 'menu';
        const el = document.getElementById('menu');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          Vue.nextTick(() => {
            const retryEl = document.getElementById('menu');
            if (retryEl) retryEl.scrollIntoView({ behavior: 'smooth' });
          });
        }
        return;
      }
      store.currentView = 'customer';
      store.activeSection = section;
      if (section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      Vue.nextTick(() => {
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    };

    const hasOngoingOrders = Vue.computed(() => {
      if (store.activeOrder) {
        const s = store.activeOrder.status;
        if (['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(s)) return true;
      }
      return false;
    });

    return {
      store,
      isWorker,
      hasOngoingOrders,
      navToSection,
      getToastClass,
      getToastIcon,
    };
  },
};

// Create and mount Vue 3 App with Pinia
</script>
