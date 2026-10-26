// G Shot Teas — Navbar Component
const Navbar = {
  template: `
    <header class="sticky top-0 z-40 bg-surface-900/95 backdrop-blur-md border-b border-surface-700/60 transition-all">
      <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-20 flex items-center justify-between gap-6">
        
        <!-- 1. Left: Brand Logo & Identity -->
        <div class="flex items-center gap-3.5 cursor-pointer group flex-shrink-0" @click="goHome">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div class="w-full h-full bg-surface-900 rounded-[10px] flex items-center justify-center">
              <span class="text-2xl font-black text-brand-500">G'</span>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xl font-extrabold tracking-tight text-white group-hover:text-brand-400 transition-colors">G SHOT</span>
              <span class="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-bold tracking-wider">TEAS</span>
            </div>
            <p class="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Santa Rosa • Laguna</p>
          </div>
        </div>

        <!-- 2. Center: Primary Navigation Links (Customer View) -->
        <nav class="hidden lg:flex items-center gap-2 xl:gap-3 font-semibold text-xs tracking-wider">
          <button 
            @click="navTo('home')" 
            class="px-3.5 py-2 rounded-xl transition-all"
            :class="[store.activeSection === 'home' && store.currentView === 'customer' 
              ? 'text-brand-400 bg-brand-500/10 font-bold' 
              : 'text-gray-300 hover:text-white hover:bg-surface-800/60']">
            HOME
          </button>
          <button 
            @click="navTo('menu')" 
            class="px-3.5 py-2 rounded-xl transition-all"
            :class="[store.activeSection === 'menu' && store.currentView === 'customer' 
              ? 'text-brand-400 bg-brand-500/10 font-bold' 
              : 'text-gray-300 hover:text-white hover:bg-surface-800/60']">
            MENU
          </button>
          <button 
            @click="navTo('about')" 
            class="px-3.5 py-2 rounded-xl transition-all"
            :class="[store.activeSection === 'about' && store.currentView === 'customer' 
              ? 'text-brand-400 bg-brand-500/10 font-bold' 
              : 'text-gray-300 hover:text-white hover:bg-surface-800/60']">
            ABOUT
          </button>
          <button 
            @click="navTo('contact')" 
            class="px-3.5 py-2 rounded-xl transition-all"
            :class="[store.activeSection === 'contact' && store.currentView === 'customer' 
              ? 'text-brand-400 bg-brand-500/10 font-bold' 
              : 'text-gray-300 hover:text-white hover:bg-surface-800/60']">
            CONTACT
          </button>

          <!-- Catering / Event Booking Button -->
          <button 
            @click="store.bookingModalOpen = true"
            class="ml-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]">
            <span>🎉</span> Book Event
          </button>
        </nav>

        <!-- 3. Right: Staff Tools & Customer Actions -->
        <div class="flex items-center gap-3 xl:gap-4 flex-shrink-0">
          
          <!-- Unified Staff & Demo Controls Capsule -->
          <div class="hidden sm:flex items-center bg-surface-950/80 border border-surface-700/60 rounded-xl p-1 gap-1.5 shadow-inner">
            <!-- Store Open / Close Status Badge & Toggle -->
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

            <!-- Demo Role Switcher Dropdown -->
            <select 
              :value="store.user?.role || 'customer'"
              @change="onRoleChange($event.target.value)"
              class="text-xs font-semibold bg-surface-800 text-gray-300 border border-surface-700/80 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-brand-500 focus:outline-none transition-all"
              title="Switch user role for testing and presentation">
              <option value="customer">Role: Customer</option>
              <option value="staff">Role: Staff</option>
              <option value="admin">Role: Admin</option>
              <option value="super_admin">Role: Super Admin</option>
            </select>

            <!-- Portal Switcher Button if Staff or Admin -->
            <button 
              v-if="store.isStaffOrAdmin"
              @click="togglePortal"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
              :class="store.currentView === 'admin' 
                ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md shadow-brand-600/30' 
                : 'bg-surface-800 hover:bg-surface-700 text-gray-200'">
              <i class="pi pi-shield text-[11px]"></i>
              <span>{{ store.currentView === 'admin' ? 'Customer Site' : 'Admin Panel' }}</span>
            </button>
          </div>

          <!-- Customer Action Buttons Group -->
          <div class="flex items-center gap-2.5">
            <!-- Shopping Cart Button with Badge -->
            <button 
              @click="store.cartOpen = true"
              class="relative p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700/60 transition-all hover:scale-105 shadow-sm"
              aria-label="View Shopping Cart">
              <i class="pi pi-shopping-cart text-lg"></i>
              <span 
                v-if="store.cartCount > 0"
                class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-brand-600 to-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce-sm shadow-md">
                {{ store.cartCount }}
              </span>
            </button>

            <!-- User Profile / Auth Button -->
            <div class="relative">
              <button 
                @click="toggleProfileMenu"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700/60 transition-all shadow-sm">
                <img v-if="store.user?.avatar" :src="store.user.avatar" class="w-6 h-6 rounded-full object-cover ring-2 ring-brand-500/50 flex-shrink-0" />
                <i v-else class="pi pi-user text-base"></i>
                <span class="hidden md:inline text-xs font-semibold max-w-[120px] truncate">
                  {{ store.user ? store.user.name : 'Sign In' }}
                </span>
                <i class="pi pi-chevron-down text-[9px] text-gray-400"></i>
              </button>

              <!-- Profile Dropdown (Figure 8 in Capstone document) -->
              <div 
                v-if="store.profileDropdownOpen" 
                @click.outside="store.profileDropdownOpen = false"
                class="absolute right-0 mt-2 w-64 bg-surface-800 border border-surface-700 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
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
                  <button 
                    v-if="store.user"
                    @click="goToView('history')" 
                    class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-surface-700/70 hover:text-white flex items-center gap-2.5 transition-colors">
                    <i class="pi pi-history text-brand-400"></i> Order History
                  </button>
                  <button 
                    v-if="store.activeOrder"
                    @click="goToView('track')" 
                    class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-surface-700/70 hover:text-white flex items-center gap-2.5 transition-colors">
                    <i class="pi pi-map-marker text-emerald-400"></i> Track Active Order
                  </button>
                  <button 
                    v-if="store.isStaffOrAdmin"
                    @click="goToView('admin')" 
                    class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-surface-700/70 hover:text-white flex items-center gap-2.5 transition-colors">
                    <i class="pi pi-th-large text-purple-400"></i> Management Dashboard
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
          </div>

        </div>

      </div>
    </header>
  `,
  setup() {
    const store = useGShotStore();
    const currentTime = Vue.ref('');

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
      store.currentView = 'customer';
      store.activeSection = 'home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navTo = (section) => {
      store.currentView = 'customer';
      store.activeSection = section;
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const onRoleChange = (role) => {
      store.switchRole(role);
    };

    const togglePortal = () => {
      store.currentView = store.currentView === 'admin' ? 'customer' : 'admin';
    };

    const toggleProfileMenu = () => {
      if (!store.user) {
        store.authModalOpen = true;
      } else {
        store.profileDropdownOpen = !store.profileDropdownOpen;
      }
    };

    const openAuthModal = () => {
      store.profileDropdownOpen = false;
      store.authModalOpen = true;
    };

    const goToView = (view) => {
      store.profileDropdownOpen = false;
      store.currentView = view;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
      store.profileDropdownOpen = false;
      store.logout();
    };

    return {
      store,
      currentTime,
      goHome,
      navTo,
      onRoleChange,
      togglePortal,
      toggleProfileMenu,
      openAuthModal,
      goToView,
      handleLogout,
    };
  },
};
