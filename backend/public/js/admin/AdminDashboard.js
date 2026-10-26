// G Shot Teas — Admin & Staff Dashboard Shell (Matches Figures 14–17 + Prototype Tabs)
const AdminDashboard = {
  template: `
    <div class="min-h-screen bg-surface-950 flex flex-col lg:flex-row">
      
      <!-- Left Sidebar (Matches Figures 14-17 Sidebar in Capstone document) -->
      <aside class="w-full lg:w-72 bg-surface-900 border-b lg:border-b-0 lg:border-r border-surface-800 p-6 flex flex-col justify-between shrink-0">
        
        <div>
          <!-- Brand Logo & Header -->
          <div class="flex items-center gap-3 mb-8 cursor-pointer" @click="goToCustomerSite">
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

          <!-- Current User Profile Pill -->
          <div class="p-3.5 rounded-2xl bg-surface-800/80 border border-surface-700/60 mb-6 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center font-black text-white text-sm">
              {{ (store.user?.name || 'A').charAt(0) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-white truncate">{{ store.user?.name || 'Authorized Staff' }}</p>
              <span class="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                {{ store.user?.role || 'staff' }}
              </span>
            </div>
          </div>

          <!-- Navigation Items (Sidebar Links from Figures 14–17) -->
          <nav class="space-y-1.5 text-xs font-semibold">
            
            <!-- Sales Analytics (Admin / Super Admin Exclusive) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="store.adminTab = 'analytics'"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'analytics' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-chart-line text-sm"></i>
              <span>Sales Analytics</span>
            </button>

            <!-- Active Orders (Staff & Admin) -->
            <button 
              @click="store.adminTab = 'orders'"
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
              @click="store.adminTab = 'completed'"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'completed' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-check-circle text-sm"></i>
              <span>Completed Orders</span>
            </button>

            <!-- Product Menu Management (Figure 17) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="store.adminTab = 'products'"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'products' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-box text-sm"></i>
              <span>Product Menu</span>
            </button>

            <!-- Kitchen Inventory (The Ingredient Prototype!) -->
            <button 
              @click="store.adminTab = 'inventory'"
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
              @click="store.adminTab = 'recipes'"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'recipes' ? 'bg-amber-500 text-surface-950 font-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-book text-sm"></i>
              <span>Recipes & Portions</span>
            </button>

            <!-- Event Bookings -->
            <button 
              @click="store.adminTab = 'bookings'"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'bookings' ? 'bg-brand-600 text-white font-bold shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-calendar text-sm"></i>
              <span>Event Bookings</span>
            </button>

            <!-- System Users (Super Admin Only) -->
            <button 
              v-if="store.isSuperAdmin"
              @click="store.adminTab = 'users'"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'users' ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-users text-sm"></i>
              <span>User & Roles</span>
            </button>

            <!-- Audit Trail -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="store.adminTab = 'audit'"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'audit' ? 'bg-surface-700 text-white font-bold shadow-md' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-history text-sm"></i>
              <span>Audit Trail</span>
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

      <!-- Main Admin Content Area -->
      <main class="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto space-y-6">
        
        <!-- Store Operations & Status Control Header (Staff, Admin, Super Admin) -->
        <div class="p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          :class="store.isStoreOpen 
            ? 'bg-gradient-to-r from-emerald-950/40 via-surface-900 to-surface-900 border-emerald-500/40' 
            : 'bg-gradient-to-r from-rose-950/40 via-surface-900 to-surface-900 border-rose-500/40'">
          
          <!-- Status Info & Description -->
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg"
              :class="store.isStoreOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'">
              <span v-if="store.isStoreOpen">🟢</span>
              <span v-else>🔴</span>
            </div>
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  Store Status: <span :class="store.isStoreOpen ? 'text-emerald-400' : 'text-rose-400'">{{ store.isStoreOpen ? 'OPEN FOR ORDERS' : 'CLOSED (ORDERING PAUSED)' }}</span>
                </h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="store.isStoreOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'">
                  {{ store.isStoreOpen ? 'Accepting Customer Orders' : 'Kitchen Paused' }}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-1">
                {{ store.isStoreOpen 
                  ? 'Customers can browse menu items, customize toppings, and place real-time delivery or pickup orders.' 
                  : 'Customers are notified that the store is currently closed. Live checkout is paused.' }}
              </p>
            </div>
          </div>

          <!-- Store Status Flag Toggle Button -->
          <div class="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <!-- Live Clock in Admin Console -->
            <div class="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-950/70 border border-surface-800 text-xs font-mono text-gray-300" title="Live Store Clock">
              <i class="pi pi-clock text-brand-400 text-xs"></i>
              <span>{{ currentTime }}</span>
            </div>

            <!-- The Toggle Button -->
            <button 
              @click="store.toggleStoreStatus()"
              class="px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
              :class="store.isStoreOpen 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'">
              <i :class="store.isStoreOpen ? 'pi pi-power-off' : 'pi pi-check-circle'"></i>
              <span>{{ store.isStoreOpen ? 'Flag Store as CLOSED' : 'Flag Store as OPEN' }}</span>
            </button>
          </div>

        </div>

        <!-- Tab Content -->
        <component :is="activeTabComponent"></component>
      </main>

    </div>
  `,
  setup() {
    const store = useGShotStore();

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
        case 'users': return AdminUsersTab;
        case 'audit': return AdminAuditTab;
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
      currentTime,
      activeOrdersCount,
      activeTabComponent,
      goToCustomerSite,
      handleLogout,
    };
  },
};
