// G Shot Teas — Admin & Staff Dashboard Shell (Matches Figures 14–17 + Prototype Tabs)
const AdminDashboard = {
  template: `
    <div class="min-h-screen bg-surface-950 flex flex-col lg:flex-row">
      
      <!-- Mobile & Tablet Admin Top Bar (< 1024px) -->
      <header class="lg:hidden bg-surface-900 border-b border-surface-800 p-4 sticky top-0 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div class="flex items-center gap-2.5 cursor-pointer" @click="goToCustomerSite">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 flex items-center justify-center">
            <div class="w-full h-full bg-surface-900 rounded-[6px] flex items-center justify-center">
              <span class="text-sm font-black text-brand-500">G'</span>
            </div>
          </div>
          <div>
            <h1 class="text-sm font-black text-white leading-none">G SHOT TEAS</h1>
            <p class="text-[9px] text-brand-400 font-bold uppercase mt-0.5">Management</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Quick Customer Site Return -->
          <button 
            @click="goToCustomerSite"
            class="px-2.5 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 border border-surface-700">
            <i class="pi pi-external-link text-[10px]"></i>
            <span class="hidden sm:inline">Customer Site</span>
          </button>

          <!-- Mobile Sidebar Drawer Toggle -->
          <button 
            @click="mobileNavOpen = !mobileNavOpen"
            class="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700 text-xs flex items-center gap-1.5 cursor-pointer"
            aria-label="Toggle Admin Menu">
            <i class="pi" :class="mobileNavOpen ? 'pi-times' : 'pi-bars'"></i>
            <span class="text-xs font-bold hidden sm:inline">Tabs</span>
          </button>
        </div>
      </header>

      <!-- Quick Tab Scroll Strip on Mobile & Tablet (< 1024px) -->
      <div class="lg:hidden bg-surface-950/90 border-b border-surface-800/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar sticky top-[61px] z-30 backdrop-blur-md">
        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('analytics')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'analytics' ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-chart-line text-[11px]"></i>
          <span>Analytics</span>
        </button>

        <button 
          @click="selectTab('orders')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'orders' ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-list text-[11px]"></i>
          <span>Orders</span>
          <span v-if="activeOrdersCount > 0" class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-brand-400 text-surface-950">
            {{ activeOrdersCount }}
          </span>
        </button>

        <button 
          @click="selectTab('completed')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'completed' ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-check-circle text-[11px]"></i>
          <span>Completed</span>
        </button>

        <button 
          @click="selectTab('inventory')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'inventory' ? 'bg-amber-500 text-surface-950 font-black shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-server text-[11px]"></i>
          <span>Inventory</span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('products')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'products' ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-box text-[11px]"></i>
          <span>Products</span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('recipes')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'recipes' ? 'bg-amber-500 text-surface-950 font-black shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-book text-[11px]"></i>
          <span>Recipes</span>
        </button>

        <button 
          @click="selectTab('bookings')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'bookings' ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-calendar text-[11px]"></i>
          <span>Bookings</span>
        </button>

        <button 
          @click="selectTab('announcements')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'announcements' ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-megaphone text-[11px]"></i>
          <span>Announcements</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-brand-400 text-surface-950">
            {{ store.announcements.length }}
          </span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('users')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-users text-[11px]"></i>
          <span>Users</span>
        </button>

        <!-- Audit Trail (Exclusively Super Admin Only) -->
        <button 
          v-if="store.isSuperAdmin"
          @click="selectTab('audit')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'audit' ? 'bg-purple-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-history text-[11px]"></i>
          <span>Audit</span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('settings')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'settings' ? 'bg-sky-600 text-white shadow-md' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-qrcode text-[11px]"></i>
          <span>GCash & Settings</span>
        </button>
      </div>

      <!-- Left Sidebar (Desktop Static & Mobile Drawer Overlay) -->
      <aside 
        class="fixed inset-y-0 left-0 w-72 bg-surface-900 border-r border-surface-800 p-6 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 overflow-y-auto"
        :class="mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'">
        
        <div>
          <!-- Brand Logo & Header -->
          <div class="flex items-center justify-between mb-8 cursor-pointer" @click="goToCustomerSite">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 flex items-center justify-center">
                <div class="w-full h-full bg-surface-900 rounded-[10px] flex items-center justify-center">
                  <span class="text-xl font-black text-brand-500">G'</span>
                </div>
              </div>
              <div>
                <h1 class="text-base font-extrabold text-white tracking-tight leading-none">G SHOT TEAS</h1>
                <p class="text-[10px] text-brand-400 font-semibold tracking-wider uppercase mt-1">Management Console</p>
              </div>
            </div>

            <!-- Mobile Drawer Close Button -->
            <button @click.stop="mobileNavOpen = false" class="lg:hidden p-1.5 text-gray-400 hover:text-white">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Current User Profile Pill & PIN Switcher -->
          <div class="p-3.5 rounded-2xl bg-surface-800/80 border border-surface-700/60 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center font-black text-white text-sm shrink-0">
                {{ (store.user?.name || 'A').charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate">{{ store.user?.name || 'Authorized Staff' }}</p>
                <span class="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                  {{ store.user?.role || 'staff' }}
                </span>
              </div>
            </div>

            <!-- Fast Staff PIN Switcher Trigger -->
            <button 
              @click="store.openStaffPinModal()"
              class="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-surface-700/60 hover:bg-surface-700 text-sky-300 hover:text-white border border-sky-500/30 text-[11px] font-bold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
              title="Fast 4-digit PIN operator switch">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-id-card text-xs"></i>
                <span>Switch Operator</span>
              </div>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">PIN</span>
            </button>
          </div>

          <!-- Navigation Items (Sidebar Links from Figures 14–17) -->
          <nav class="space-y-1.5 text-xs font-semibold">
            
            <!-- Sales Analytics (Admin / Super Admin Exclusive) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('analytics')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'analytics' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-chart-line text-sm"></i>
              <span>Sales Analytics</span>
            </button>

            <!-- Active Orders (Staff & Admin) -->
            <button 
              @click="selectTab('orders')"
              class="w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all"
              :class="store.adminTab === 'orders' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <div class="flex items-center gap-3">
                <i class="pi pi-list text-sm"></i>
                <span>Active Orders</span>
              </div>
              <span v-if="activeOrdersCount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-400 text-surface-950">
                {{ activeOrdersCount }}
              </span>
            </button>

            <!-- Completed Orders -->
            <button 
              @click="selectTab('completed')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'completed' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-check-circle text-sm"></i>
              <span>Completed Orders</span>
            </button>

            <!-- Product Menu Management (Figure 17) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('products')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'products' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-box text-sm"></i>
              <span>Product Menu</span>
            </button>

            <!-- Kitchen Inventory (The Ingredient Prototype!) -->
            <button 
              @click="selectTab('inventory')"
              class="w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all"
              :class="store.adminTab === 'inventory' ? 'bg-amber-500 text-surface-950 font-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <div class="flex items-center gap-3">
                <i class="pi pi-server text-sm"></i>
                <span>Kitchen Inventory</span>
              </div>
              <span v-if="store.lowStockAlerts.length > 0" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700/60">
                {{ store.lowStockAlerts.length }}
              </span>
            </button>

            <!-- Recipe Engine (The Ingredient Prototype!) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('recipes')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'recipes' ? 'bg-amber-500 text-surface-950 font-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-book text-sm"></i>
              <span>Recipes & Portions</span>
            </button>

            <!-- Event Bookings -->
            <button 
              @click="selectTab('bookings')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'bookings' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-calendar text-sm"></i>
              <span>Event Bookings</span>
            </button>

            <!-- Announcements & Promos (Staff & Admin) -->
            <button 
              @click="selectTab('announcements')"
              class="w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all"
              :class="store.adminTab === 'announcements' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <div class="flex items-center gap-3">
                <i class="pi pi-megaphone text-sm"></i>
                <span>Announcements</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-400 text-surface-950">
                {{ store.announcements.length }}
              </span>
            </button>

            <!-- System Users (Admin & Super Admin) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('users')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'users' ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-users text-sm"></i>
              <span>User & Roles</span>
            </button>

            <!-- Audit Trail (Exclusively Super Admin Only) -->
            <button 
              v-if="store.isSuperAdmin"
              @click="selectTab('audit')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'audit' ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-history text-sm"></i>
              <span>Audit Trail</span>
            </button>

            <!-- Store & GCash Payment Settings (Admin & Super Admin) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('settings')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'settings' ? 'bg-sky-600 text-white font-bold shadow-lg shadow-sky-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-qrcode text-sm"></i>
              <span>GCash & Settings</span>
            </button>

          </nav>
        </div>

        <!-- Bottom Actions (Matches Figure 14: Logout button) -->
        <div class="pt-6 border-t border-surface-800 space-y-2 text-xs">
          <button 
            @click="goToCustomerSite"
            class="w-full py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white font-semibold flex items-center justify-center gap-2 transition-colors">
            <i class="pi pi-external-link text-xs"></i>
            <span>View Customer Site</span>
          </button>

          <button 
            @click="handleLogout"
            class="w-full py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-bold flex items-center justify-center gap-2 transition-colors">
            <i class="pi pi-sign-out text-xs"></i>
            <span>Logout</span>
          </button>
        </div>

      </aside>

      <!-- Drawer Backdrop for Mobile (< 1024px) -->
      <div 
        v-if="mobileNavOpen"
        @click="mobileNavOpen = false"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"></div>

      <!-- Main Admin Content Area -->
      <main class="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto space-y-6">
        
        <!-- Store Operations & Status Control Header (Staff, Admin, Super Admin) -->
        <div class="p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          :class="store.isStoreOpen 
            ? 'bg-gradient-to-r from-emerald-950/40 via-surface-900 to-surface-900 border-emerald-500/40' 
            : 'bg-gradient-to-r from-rose-950/40 via-surface-900 to-surface-900 border-rose-500/40'">
          
          <!-- Status Info & Description -->
          <div class="flex items-center gap-3.5 sm:gap-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-lg"
              :class="store.isStoreOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'">
              <span v-if="store.isStoreOpen">🟢</span>
              <span v-else>🔴</span>
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h2 class="text-xs sm:text-base font-black text-white uppercase tracking-wider">
                  Store Status: <span :class="store.isStoreOpen ? 'text-emerald-400' : 'text-rose-400'">{{ store.isStoreOpen ? 'OPEN FOR ORDERS' : 'CLOSED' }}</span>
                </h2>
                <span class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                  :class="store.isStoreOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'">
                  {{ store.isStoreOpen ? 'Live' : 'Paused' }}
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-400 mt-1">
                {{ store.isStoreOpen 
                  ? 'Accepting real-time customer delivery and pickup orders.' 
                  : 'Kitchen ordering paused. Customers notified of operating hours.' }}
              </p>
            </div>
          </div>

          <!-- Store Status Flag Toggle & Operator Pin Switch -->
          <div class="flex items-center gap-2.5 sm:gap-3 shrink-0 self-stretch sm:self-auto flex-wrap">
            <!-- Active Operator PIN Chip on Shared Laptop -->
            <button 
              @click="store.openStaffPinModal()"
              class="px-3 py-2 rounded-xl bg-surface-950/70 hover:bg-surface-800 text-xs text-gray-200 border border-surface-700/80 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              title="Shared laptop terminal: Click to switch active staff operator via 4-digit PIN">
              <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span class="text-gray-400 text-[11px] hidden sm:inline">On Duty:</span>
              <span class="font-bold text-white text-xs truncate max-w-[120px]">{{ store.user?.name || 'Staff' }}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">SWITCH PIN</span>
            </button>

            <!-- Live Clock in Admin Console -->
            <div class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-950/70 border border-surface-800 text-xs font-mono text-gray-300" title="Live Store Clock">
              <i class="pi pi-clock text-brand-400 text-xs"></i>
              <span>{{ currentTime }}</span>
            </div>

            <!-- The Toggle Button -->
            <button 
              @click="store.toggleStoreStatus()"
              class="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
              :class="store.isStoreOpen 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'">
              <i :class="store.isStoreOpen ? 'pi pi-power-off' : 'pi pi-check-circle'"></i>
              <span>{{ store.isStoreOpen ? 'Flag as CLOSED' : 'Flag as OPEN' }}</span>
            </button>
          </div>

        </div>

        <!-- Tab Content -->
        <component :is="activeTabComponent"></component>
      </main>

      <!-- Fast 4-Digit Staff PIN Switcher for POS Terminal -->
      <StaffPinModal />

    </div>
  `,
  setup() {
    const store = useGShotStore();

    const mobileNavOpen = Vue.ref(false);
    const selectTab = (tab) => {
      store.adminTab = tab;
      mobileNavOpen.value = false;
    };

    const currentTime = Vue.ref('');
    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    Vue.onMounted(() => {
      updateTime();
      setInterval(updateTime, 1000);
    });

    const activeOrdersCount = Vue.computed(() => {
      return store.orders.filter(o => ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)).length;
    });

    const activeTabComponent = Vue.computed(() => {
      switch (store.adminTab) {
        case 'analytics': return AdminAnalyticsTab;
        case 'orders': return AdminOrdersTab;
        case 'completed': return AdminCompletedTab;
        case 'products': return AdminProductsTab;
        case 'inventory': return AdminInventoryTab;
        case 'recipes': return AdminRecipesTab;
        case 'bookings': return AdminBookingsTab;
        case 'announcements': return AdminAnnouncementsTab;
        case 'users': return AdminUsersTab;
        case 'audit': return store.isSuperAdmin ? AdminAuditTab : AdminOrdersTab;
        case 'settings': return AdminSettingsTab;
        default: return AdminOrdersTab;
      }
    });

    const goToCustomerSite = () => {
      store.currentView = 'customer';
    };

    const handleLogout = () => {
      store.logout();
    };

    return {
      store,
      mobileNavOpen,
      selectTab,
      currentTime,
      activeOrdersCount,
      activeTabComponent,
      goToCustomerSite,
      handleLogout,
    };
  },
};

