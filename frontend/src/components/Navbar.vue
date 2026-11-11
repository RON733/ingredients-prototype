<template>
<header class="fixed top-0 left-0 right-0 z-50 bg-surface-900/95 backdrop-blur-md border-b border-surface-700/60 shadow-xl transition-all">
      <div class="w-full px-3 sm:px-6 lg:px-8 xl:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
        
        <!-- 1. Left: Brand Logo & Identity -->
        <div class="flex items-center gap-2 sm:gap-3.5 cursor-pointer group flex-shrink-0" @click="goHome">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center font-black text-base sm:text-lg text-yellow-400">G'</div>
          <div>
            <div class="flex items-center gap-1 sm:gap-1.5">
              <span class="text-base sm:text-xl font-extrabold tracking-tight text-white group-hover:text-brand-400 transition-colors">G SHOT</span>
              <span class="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-surface-800 text-yellow-400 font-bold border border-surface-700 tracking-wider">TEAS</span>
            </div>
            <p class="hidden sm:block text-[10px] text-gray-400 uppercase tracking-widest font-medium">Santa Rosa • Laguna</p>
          </div>
        </div>

        <!-- 2. Center: Primary Navigation Links (Customer View) -->
        <nav v-if="!store.isMaintenanceMode || store.isStaffOrAdmin" class="hidden lg:flex items-center gap-2 xl:gap-3 font-semibold text-xs tracking-wider">
          <button 
            @click="navTo('home')" 
            class="px-3.5 py-2 rounded-xl transition-all"
            :class="[store.activeSection === 'home' && store.currentView === 'customer' 
              ? 'text-yellow-400 font-bold' 
              : 'text-gray-300 hover:text-white hover:bg-surface-800/60']">
            HOME
          </button>
          <button 
            @click="navTo('menu')" 
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            :class="[store.activeSection === 'menu' && store.currentView === 'customer' 
              ? 'text-yellow-400 font-bold' 
              : 'text-gray-300 hover:text-white hover:bg-surface-800/60']">
            MENU
          </button>
          <button 
            @click="navTo('about')" 
            class="px-3.5 py-2 rounded-xl transition-all"
            :class="[store.activeSection === 'about' && store.currentView === 'customer' 
              ? 'text-yellow-400 font-bold' 
              : 'text-gray-300 hover:text-white hover:bg-surface-800/60']">
            ABOUT
          </button>
          <button 
            @click="navTo('contact')" 
            class="px-3.5 py-2 rounded-xl transition-all"
            :class="[store.activeSection === 'contact' && store.currentView === 'customer' 
              ? 'text-yellow-400 font-bold' 
              : 'text-gray-300 hover:text-white hover:bg-surface-800/60']">
            CONTACT
          </button>

          <!-- Catering / Event Booking Button -->
          <button 
            @click="store.openBookingModal('form')"
            class="ml-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-800 hover:bg-surface-700 text-yellow-400 border border-surface-700 flex items-center gap-1.5 transition-all cursor-pointer">
            <span>🎉</span> Book Event
          </button>
        </nav>

        <!-- 3. Right: Staff Tools & Customer Actions -->
        <div class="flex items-center gap-3 xl:gap-4 flex-shrink-0">
          
          <!-- Staff Controls Capsule -->
          <div class="hidden sm:flex items-center bg-surface-950/80 border border-surface-700/60 rounded-xl p-1 gap-1.5 shadow-inner">
            <!-- Operations Console Shortcut for Staff, Admin, Rider -->
            <a 
              v-if="store.isStaffOrAdmin || store.isDriver"
              href="/admin"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 hover:bg-yellow-400 hover:text-black transition-all cursor-pointer shadow-sm"
              title="Return to Operations Management Console">
              <i class="pi pi-shield text-[10px]"></i>
              <span>Console</span>
            </a>

            <!-- Store Open / Close Status Badge & Toggle (Desktop) -->
            <button 
              @click="store.isStaffOrAdmin ? store.toggleStoreStatus() : null"
              :class="[
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all',
                store.isStoreOpen 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                store.isStaffOrAdmin ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
              ]"
              :title="store.isStaffOrAdmin ? 'Store status: Click to toggle OPEN / CLOSED' : 'Store is currently ' + (store.isStoreOpen ? 'Open' : 'Closed')">
              <span class="w-2 h-2 rounded-full" :class="store.isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
              <span>{{ store.isStoreOpen ? 'OPEN' : 'CLOSED' }}</span>
              <i v-if="store.isStaffOrAdmin" class="pi pi-sync text-[9px] opacity-70 ml-0.5"></i>
            </button>

            <!-- Live Clock (Preserved & Visible) -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-gray-300 border-l border-surface-800" title="Live Store Clock">
              <i class="pi pi-clock text-[10px] text-brand-400"></i>
              <span>{{ currentTime }}</span>
            </div>
          </div>

          <!-- Customer Action Buttons Group -->
          <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <!-- Compact Store Status Pill on Mobile (visible above 380px) -->
            <div 
              class="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all"
              :class="store.isStoreOpen 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'"
              :title="'Store is currently ' + (store.isStoreOpen ? 'Open' : 'Closed')">
              <span class="w-1.5 h-1.5 rounded-full" :class="store.isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
              <span>{{ store.isStoreOpen ? 'OPEN' : 'CLOSED' }}</span>
            </div>

            <!-- Shopping Cart Button with Badge (Hidden during public maintenance) -->
            <button 
              v-if="!store.isMaintenanceMode"
              @click="store.cartOpen = true"
              class="relative p-2 sm:p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700/60 transition-all hover:scale-105 shadow-sm shrink-0"
              aria-label="View Shopping Cart">
              <i class="pi pi-shopping-cart text-sm sm:text-lg"></i>
              <span 
                v-if="store.cartCount > 0"
                class="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 text-black font-black text-[10px] sm:text-[11px] rounded-full flex items-center justify-center animate-bounce-sm shadow-md">
                {{ store.cartCount }}
              </span>
            </button>

            <!-- User Profile / Auth Button -->
            <div class="relative shrink-0">
              <button 
                @click="toggleProfileMenu"
                class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700/60 transition-all shadow-sm">
                <img v-if="store.user?.avatar" :src="store.user.avatar" class="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-2 ring-brand-500/50 flex-shrink-0" />
                <i v-else class="pi pi-user text-sm sm:text-base"></i>
                <span class="hidden md:inline text-xs font-semibold max-w-[120px] truncate">
                  {{ store.user ? store.user.name : 'Sign In' }}
                </span>
                <i class="pi pi-chevron-down text-[8px] sm:text-[9px] text-gray-400"></i>
              </button>

              <!-- Profile Dropdown (Figure 8 in Capstone document) -->
              <div 
                v-if="store.profileDropdownOpen" 
                @click.outside="store.profileDropdownOpen = false"
                class="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-surface-800 border border-surface-700 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                <div v-if="store.user" class="px-4 py-3 border-b border-surface-700/80 flex items-center gap-3">
                  <img v-if="store.user.avatar" :src="store.user.avatar" class="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40 flex-shrink-0" />
                  <div v-else class="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {{ store.user.name.charAt(0) }}
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-[10px] text-gray-400">Signed in as</p>
                    <p class="text-xs font-bold text-white truncate">{{ store.user.name }}</p>
                    <div class="flex items-center gap-1.5 mt-1">
                      <span class="text-[9px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold uppercase">
                        {{ store.user.role }}
                      </span>
                      <span v-if="store.user.google_id" class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold flex items-center gap-1">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                        Google
                      </span>
                    </div>
                  </div>
                </div>

                <div class="py-1.5">
                  <a 
                    v-if="store.isStaffOrAdmin || store.isDriver"
                    href="/admin"
                    class="w-full text-left px-4 py-2 text-xs text-yellow-400 hover:bg-surface-700/70 hover:text-yellow-300 font-bold flex items-center gap-2.5 transition-colors border-b border-surface-700/60 mb-1">
                    <i class="pi pi-shield text-yellow-400"></i> Operations Portal (/admin)
                  </a>
                  <button 
                    v-if="store.user"
                    @click="goToView('history')" 
                    class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-surface-700/70 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer">
                    <i class="pi pi-history text-brand-400"></i> Order History
                  </button>
                  <button 
                    v-if="store.user"
                    @click="goToView('bookings')" 
                    class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-surface-700/70 hover:text-white flex items-center justify-between gap-2 transition-colors cursor-pointer">
                    <span class="flex items-center gap-2.5">
                      <i class="pi pi-calendar text-amber-400"></i> Event Booking History
                    </span>
                    <span
                      v-if="store.bookingsList.length > 0"
                      class="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                      :class="hasApprovedBooking ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'">
                      {{ store.bookingsList.length }}
                    </span>
                  </button>
                  <button 
                    v-if="store.activeOrder || store.user"
                    @click="goToView('track')" 
                    class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-surface-700/70 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer">
                    <i class="pi pi-map-marker text-emerald-400"></i> Track Active Order
                  </button>
                </div>

                <div class="border-t border-surface-700/80 pt-1.5">
                  <button 
                    v-if="store.user"
                    @click="handleLogout" 
                    class="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-surface-700/70 flex items-center gap-2.5 transition-colors">
                    <i class="pi pi-sign-out"></i> Log Out
                  </button>
                  <button 
                    v-else
                    @click="openAuthModal" 
                    class="w-full text-left px-4 py-2 text-xs text-brand-400 hover:bg-surface-700/70 flex items-center gap-2.5 font-bold transition-colors">
                    <i class="pi pi-sign-in"></i> Sign In / Register
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile Hamburger Menu Button -->
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen" 
              class="lg:hidden p-2 sm:p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700/60 transition-colors shrink-0"
              aria-label="Toggle Mobile Menu">
              <i class="pi text-sm sm:text-base" :class="mobileMenuOpen ? 'pi-times' : 'pi-bars'"></i>
            </button>
          </div>

        </div>

      </div>

      <!-- Store Closed Announcement Banner (Integrated into Fixed Header) -->
      <div 
        v-if="store.currentView === 'customer' && !store.isStoreOpen && !store.isMaintenanceMode"
        class="bg-surface-900 border-t border-b border-surface-700 text-gray-300 text-[11px] sm:text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
        <span>Notice: G Shot Teas is currently <strong>CLOSED for live ordering</strong> (Hours: 9:00 AM – 10:00 PM). You can still browse our menu, customize ingredients, and book catering packages!</span>
      </div>

      <!-- Mobile Navigation Drawer / Slide-Down Menu -->
      <div 
        v-if="mobileMenuOpen" 
        class="lg:hidden border-t border-surface-800 bg-surface-900/98 backdrop-blur-xl px-4 py-5 shadow-2xl space-y-4 animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto">
        
        <!-- Primary Navigation Links -->
        <nav class="grid grid-cols-2 gap-2 text-xs font-bold">
          <button 
            @click="navTo('home')" 
            class="flex items-center gap-2 p-3 rounded-xl transition-all"
            :class="store.activeSection === 'home' ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'bg-surface-800/80 text-gray-300 hover:text-white'">
            <i class="pi pi-home text-sm"></i>
            <span>Home</span>
          </button>

          <button 
            @click="navTo('menu')" 
            class="flex items-center gap-2 p-3 rounded-xl transition-all"
            :class="store.currentView === 'menu' ? 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/20' : 'bg-surface-800/80 text-gray-300 hover:text-white'">
            <i class="pi pi-th-large text-sm"></i>
            <span>Menu</span>
          </button>

          <button 
            @click="navTo('about')" 
            class="flex items-center gap-2 p-3 rounded-xl transition-all"
            :class="store.activeSection === 'about' ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'bg-surface-800/80 text-gray-300 hover:text-white'">
            <i class="pi pi-info-circle text-sm"></i>
            <span>About Us</span>
          </button>

          <button 
            @click="navTo('contact')" 
            class="flex items-center gap-2 p-3 rounded-xl transition-all"
            :class="store.activeSection === 'contact' ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'bg-surface-800/80 text-gray-300 hover:text-white'">
            <i class="pi pi-envelope text-sm"></i>
            <span>Contact</span>
          </button>
        </nav>

        <!-- Customer Orders & Tracking Shortcuts (Mobile Drawer) -->
        <div class="grid grid-cols-2 gap-2 text-xs font-bold">
          <button 
            @click="goToView('history')" 
            class="flex items-center gap-2.5 p-3 rounded-xl transition-all cursor-pointer text-left"
            :class="store.currentView === 'history' ? 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/20' : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
            <i class="pi pi-history text-sm" :class="store.currentView === 'history' ? 'text-black' : 'text-brand-400'"></i>
            <div class="leading-tight">
              <span>Order History</span>
              <p class="text-[9px] opacity-70 font-normal">Past orders & receipts</p>
            </div>
          </button>

          <button 
            @click="goToView('track')" 
            class="flex items-center gap-2.5 p-3 rounded-xl transition-all cursor-pointer text-left"
            :class="store.currentView === 'track' ? 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/20' : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
            <i class="pi pi-map-marker text-sm" :class="store.currentView === 'track' ? 'text-black' : 'text-emerald-400'"></i>
            <div class="leading-tight">
              <span>Track Order</span>
              <p class="text-[9px] opacity-70 font-normal">Live order status</p>
            </div>
          </button>
        </div>

        <!-- Event Booking History & Book Event Call to Action -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button 
            @click="store.openBookingModal('form'); mobileMenuOpen = false" 
            class="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center gap-2 cursor-pointer">
            <span>🎉 Book Catering & Mobile Bar</span>
          </button>
          <button 
            @click="goToView('bookings')" 
            class="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border transition-all"
            :class="store.currentView === 'bookings' ? 'bg-amber-400 text-black border-amber-300' : 'bg-surface-800/90 text-amber-300 hover:bg-surface-700 border-surface-700'">
            <i class="pi pi-calendar text-xs"></i>
            <span>Event Booking History</span>
            <span v-if="store.bookingsList.length > 0" class="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 font-black">
              {{ store.bookingsList.length }}
            </span>
          </button>
        </div>

        <!-- Operations Portal Button (Mobile) -->

        <!-- Operations Portal Button (Mobile) -->
        <a 
          v-if="store.isStaffOrAdmin || store.isDriver"
          href="/admin"
          @click="mobileMenuOpen = false"
          class="w-full py-2.5 px-4 rounded-xl bg-yellow-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md">
          <i class="pi pi-shield text-xs"></i>
          <span>Operations Console (/admin)</span>
        </a>

        <!-- Operations Card: Live Clock & Store Status -->
        <div class="p-3.5 rounded-2xl bg-surface-950/80 border border-surface-700/60 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2 font-mono text-gray-300">
            <i class="pi pi-clock text-brand-400"></i>
            <span>{{ currentTime }}</span>
          </div>

          <button 
            @click="store.isStaffOrAdmin ? store.toggleStoreStatus() : null"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
            :class="[
              store.isStoreOpen ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30',
              store.isStaffOrAdmin ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
            ]">
            <span class="w-2 h-2 rounded-full" :class="store.isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
            <span>{{ store.isStoreOpen ? 'Store is OPEN' : 'Store is CLOSED' }}</span>
            <i v-if="store.isStaffOrAdmin" class="pi pi-sync text-[10px] ml-1"></i>
          </button>
        </div>

        <!-- Account quick actions -->
        <div class="pt-2 border-t border-surface-800 flex items-center justify-between text-xs">
          <div v-if="store.user" class="flex items-center gap-2">
            <img v-if="store.user.avatar" :src="store.user.avatar" class="w-6 h-6 rounded-full object-cover" />
            <span class="text-white font-bold truncate max-w-[140px]">{{ store.user.name }}</span>
          </div>
          <div v-if="store.user" class="flex items-center gap-3">
            <button 
              @click="goToView('history')" 
              class="text-brand-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">
              <i class="pi pi-history text-[11px]"></i>
              <span>My Orders</span>
            </button>
            <button 
              @click="handleLogout(); mobileMenuOpen = false"
              class="text-rose-400 font-bold hover:underline cursor-pointer">
              Log Out
            </button>
          </div>
          <button 
            v-else
            @click="openAuthModal(); mobileMenuOpen = false"
            class="text-brand-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer">
            <i class="pi pi-sign-in"></i>
            <span>Sign In / Register</span>
          </button>
        </div>

      </div>

    </header>

    <!-- Document Flow Height Spacer for Fixed Header -->
    <div 
      :class="store.currentView === 'customer' && !store.isStoreOpen ? 'h-24 sm:h-28' : 'h-16 sm:h-20'" 
      class="shrink-0 transition-all duration-300 pointer-events-none" 
      aria-hidden="true">
    </div>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Navbar Component
export default {
  name: 'Navbar',
  setup() {
    const store = useGShotStore();
    const currentTime = Vue.ref('');
    const mobileMenuOpen = Vue.ref(false);

    const updateClock = () => {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    };

    let timer = null;
    Vue.onMounted(() => {
      updateClock();
      timer = setInterval(updateClock, 1000);
    });

    Vue.onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    const goHome = () => {
      mobileMenuOpen.value = false;
      store.currentView = 'customer';
      store.activeSection = 'home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navTo = (section) => {
      mobileMenuOpen.value = false;
      const isMobile = window.innerWidth < 1024;
      if (section === 'menu' && isMobile) {
        store.currentView = 'menu';
        store.activeSection = 'menu';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      store.currentView = 'customer';
      store.activeSection = section;
      if (section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
            const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        Vue.nextTick(() => {
          const retryEl = document.getElementById(section);
          if (retryEl) {
            retryEl.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    };

    const toggleProfileMenu = () => {
      if (!store.user) {
        store.authModalOpen = true;
      } else {
        store.profileDropdownOpen = !store.profileDropdownOpen;
      }
    };

    const openAuthModal = () => {
      mobileMenuOpen.value = false;
      store.profileDropdownOpen = false;
      store.authModalOpen = true;
    };

    const hasApprovedBooking = Vue.computed(() =>
      (store.bookingsList || []).some(b => b.status === 'Approved')
    );

    const goToView = (view) => {
      mobileMenuOpen.value = false;
      store.profileDropdownOpen = false;
      store.currentView = view;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
      mobileMenuOpen.value = false;
      store.profileDropdownOpen = false;
      store.logout();
    };

    const togglePortal = () => {
      mobileMenuOpen.value = false;
      window.location.href = '/admin';
    };

    return {
      store,
      currentTime,
      mobileMenuOpen,
      goHome,
      navTo,
      
      togglePortal,
      toggleProfileMenu,
      openAuthModal,
      hasApprovedBooking,
      goToView,
      handleLogout,
    };
  },
};
</script>
