// G Shot Teas — Vue 3 Main Application Root
const { createApp, onMounted } = Vue;

const App = {
  template: `
    <div class="min-h-screen bg-surface-950 text-gray-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      <!-- Ambient Lighting Orbs for modern aesthetic -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 -right-40 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 left-1/3 w-80 h-80 bg-rose-600/8 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 flex flex-col flex-1">
        
        <!-- Navigation Header (Customer Views) -->
        <Navbar v-if="store.currentView !== 'admin'" />

        <!-- Store Closed Announcement Banner (Customer Views) -->
        <div 
          v-if="store.currentView === 'customer' && !store.isStoreOpen"
          class="bg-gradient-to-r from-rose-950/95 via-surface-900 to-rose-950/95 border-b border-rose-500/30 text-rose-300 text-xs py-2.5 px-4 text-center font-semibold flex items-center justify-center gap-2 animate-fade-in sticky top-20 z-30 backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
          <span>Notice: G Shot Teas is currently <strong>CLOSED for live ordering</strong> (Hours: 9:00 AM – 10:00 PM). You can still browse our menu, customize ingredients, and book catering packages!</span>
        </div>

        <!-- Main Content Area -->
        <main class="flex-1">
          <!-- 1. Customer Landing & Menu -->
          <div v-if="store.currentView === 'customer'" class="animate-fade-in">
            <LandingHero />
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
        </main>

        <!-- Footer (Customer Views) -->
        <footer v-if="store.currentView !== 'admin'" class="py-10 bg-surface-950 border-t border-surface-800 text-xs text-gray-500 text-center">
          <div class="max-w-6xl mx-auto px-4 space-y-3">
            <div class="flex items-center justify-center gap-2">
              <span class="font-extrabold text-white text-sm">G SHOT TEAS</span>
              <span class="text-brand-500 font-bold">•</span>
              <span class="text-gray-400">Web-Based Ordering & Sales Management System</span>
            </div>
            <p>STI College Santa Rosa — Capstone Project by Tyron Erick Rico, Mhar Anthony Lirio, Kurt Xyler Munoz, Raymond Barajas</p>
            <p class="text-[10px] text-gray-600">Client: Jefferson Anore Alulod • Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna</p>
          </div>
        </footer>

        <!-- Global Drawers & Modals -->
        <CartDrawer />
        <CustomizationModal />
        <EventBookingModal />
        <AuthModal />
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
            <div class="p-4 bg-surface-800 flex items-center justify-between gap-3 border-t border-surface-700">
              <span class="text-xs text-gray-300 font-medium truncate">Direct: Jefferson Alulod • 0993.700.5426</span>
              <button 
                @click="store.closeFlyer(); store.openBookingWithPackage(store.previewFlyerImage.includes('coffee') ? 'Coffee Package' : 'Fruity Float Package')"
                class="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-surface-950 transition-all shrink-0">
                Book This Package
              </button>
            </div>
          </div>
        </div>

        <!-- Toast Notifications Overlay -->
        <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
          <div 
            v-for="toast in store.toasts" 
            :key="toast.id"
            class="px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white flex items-center gap-3 backdrop-blur-md pointer-events-auto border animate-toast-in max-w-sm"
            :class="getToastClass(toast.type)">
            <i class="pi" :class="getToastIcon(toast.type)"></i>
            <span>{{ toast.msg }}</span>
          </div>
        </div>

      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();

    onMounted(async () => {
      await store.init();
    });

    const getToastClass = (type) => {
      if (type === 'error') return 'bg-rose-950/90 border-rose-600 text-rose-200';
      if (type === 'info') return 'bg-sky-950/90 border-sky-600 text-sky-200';
      return 'bg-emerald-950/90 border-emerald-600 text-emerald-200';
    };

    const getToastIcon = (type) => {
      if (type === 'error') return 'pi-times-circle text-rose-400';
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
const app = createApp(App);
const pinia = Pinia.createPinia();
app.use(pinia);

// Register Global Components
app.component('Navbar', Navbar);
app.component('LandingHero', LandingHero);
app.component('FeaturedSection', FeaturedSection);
app.component('MenuSection', MenuSection);
app.component('CustomizationModal', CustomizationModal);
app.component('CartDrawer', CartDrawer);
app.component('CheckoutView', CheckoutView);
app.component('OrderTracker', OrderTracker);
app.component('OrderHistoryView', OrderHistoryView);
app.component('ActiveOrderWidget', ActiveOrderWidget);
app.component('ChatbotAssistant', ChatbotAssistant);
app.component('EventBookingModal', EventBookingModal);
app.component('AuthModal', AuthModal);
app.component('AboutSection', AboutSection);
app.component('ContactSection', ContactSection);

app.component('AdminDashboard', AdminDashboard);
app.component('AdminOrdersTab', AdminOrdersTab);
app.component('AdminAnalyticsTab', AdminAnalyticsTab);
app.component('AdminCompletedTab', AdminCompletedTab);
app.component('AdminProductsTab', AdminProductsTab);
app.component('AdminInventoryTab', AdminInventoryTab);
app.component('AdminRecipesTab', AdminRecipesTab);
app.component('AdminBookingsTab', AdminBookingsTab);
app.component('AdminUsersTab', AdminUsersTab);
app.component('AdminAuditTab', AdminAuditTab);

app.mount('#root');
